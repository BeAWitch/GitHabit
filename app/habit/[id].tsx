import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  GestureResponderEvent,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Octicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Markdown from "react-native-markdown-display";

import { CommitModal } from "@/components/CommitModal";
import { ContributionGraph } from "@/components/ContributionGraph";
import { HabitFormModal } from "@/components/HabitFormModal";
import { SimpleLineChart } from "@/components/SimpleLineChart";
import { GoalProgressRing } from "@/components/GoalProgressRing";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useHabitStore } from "@/store/habitStore";
import { useSettingsStore } from "@/store/settingsStore";
import { formatRelativeTime } from "@/utils/dateUtil";
import { getMarkdownStyle } from "@/utils/markdownStyle";
import { formatUnit } from "@/utils/unitFormatterUtil";
import type { CheckIn } from "@/types/models";
import { useYearFilter } from "@/hooks/useYearFilter";
import { YearPicker } from "@/components/YearPicker";
import { useTranslation } from "react-i18next";

export default function HabitDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { color } = useThemeColors();
  const { t } = useTranslation();

  const habitId = Number(id);
  const { quickCommitBinary } = useSettingsStore();

  const {
    habits,
    checkIns,
    habitStats,
    habitContributions,
    habitTargetValues,
    fetchHabitDetail,
    commitCheckIn,
    updateCheckIn,
    removeCheckIn,
    removeHabit,
  } = useHabitStore();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [readmeHeight, setReadmeHeight] = useState(240);
  const [isReadmeFullScreen, setIsReadmeFullScreen] = useState(false);
  const [isCommitModalVisible, setIsCommitModalVisible] = useState(false);
  const [editingCheckIn, setEditingCheckIn] = useState<CheckIn | null>(null);
  const [activeCheckInId, setActiveCheckInId] = useState<number | null>(null);
  const [checkInMenuAnchor, setCheckInMenuAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const readmeStartHeight = useRef(240);

  useEffect(() => {
    if (!isNaN(habitId)) {
      fetchHabitDetail(habitId);
    }
  }, [habitId, fetchHabitDetail]);

  const habit = habits.find((h) => h.id === habitId);
  const stats = habitStats[habitId] || { total: 0, lastTimestamp: null };
  const contributions = useMemo(
    () => habitContributions[habitId] || {},
    [habitContributions, habitId],
  );
  
  const targetValues = useMemo(
    () => habitTargetValues[habitId] || {},
    [habitTargetValues, habitId]
  );

  const screenHeight = Dimensions.get("window").height;
  const minReadmeHeight = 160;
  const maxReadmeHeight = Math.min(Math.round(screenHeight * 0.65), 520);

  const clampHeight = (value: number) =>
    Math.max(minReadmeHeight, Math.min(maxReadmeHeight, value));

  const readmePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        readmeStartHeight.current = readmeHeight;
      },
      onPanResponderMove: (_, gesture) => {
        const nextHeight = clampHeight(readmeStartHeight.current + gesture.dy);
        setReadmeHeight(nextHeight);
      },
    }),
  ).current;

  const markdownStyle = useMemo(() => getMarkdownStyle(color), [color]);

  // Compute last 30 days data for the line chart
  const last30DaysData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
      ].join("-");
      data.push({
        date: dateStr,
        value: contributions[dateStr] || 0,
      });
    }
    return data;
  }, [contributions]);

  const habitCheckIns = useMemo(
    () => checkIns.filter((c) => c.habitId === habitId),
    [checkIns, habitId]
  );

  const {
    selectedYear,
    setSelectedYear,
    availableYears,
    graphDays,
    graphEndDate,
  } = useYearFilter(habitCheckIns);

  const totalCommits = habitCheckIns.length;
  const recentCheckIns = [...habitCheckIns]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10); // Show top 10 recent

  const activeCheckIn = useMemo(
    () => checkIns.find((c) => c.id === activeCheckInId),
    [checkIns, activeCheckInId],
  );

  const goalsAchieved = useMemo(() => {
    let count = 0;
    if (!habit) return 0;
    Object.keys(contributions).forEach((dateStr) => {
      const dailyTarget = targetValues[dateStr] || habit.targetValue || 1;
      if (contributions[dateStr] >= dailyTarget) {
        count++;
      }
    });
    return count;
  }, [contributions, targetValues, habit]);

  if (!habit) {
    return (
      <View className="flex-1 bg-github-lightBg dark:bg-github-darkBg p-4 justify-center items-center">
        <Text className="text-github-lightText dark:text-github-darkText">
          {t("habit.loading")}
        </Text>
        <TouchableOpacity
          className="mt-4 px-4 py-2 bg-github-lightBorder dark:bg-github-darkBorder rounded-md"
          onPress={() => router.back()}
        >
          <Text className="text-github-lightText dark:text-github-darkText">
            {t("habit.goBack")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Simple streak calculation
  let currentStreak = 0;
  const today = new Date();
  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const todayValue = contributions[todayStr] || 0;
  // If the target for today is different than the habit's current target
  // (e.g. they changed it today but haven't committed yet, or they changed it after committing),
  // we should evaluate today's goal against the *current* target to be intuitive.
  const todayTarget = habit.targetValue || 1;

  if (todayValue >= todayTarget) {
    currentStreak++;
  }

  // Starting yesterday, check consecutive days
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  let checkDate = yesterday;

  while (true) {
    const checkStr = [
      checkDate.getFullYear(),
      String(checkDate.getMonth() + 1).padStart(2, "0"),
      String(checkDate.getDate()).padStart(2, "0"),
    ].join("-");

    const dailyTarget = targetValues[checkStr] || habit.targetValue || 1;

    if ((contributions[checkStr] || 0) >= dailyTarget) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const handleDelete = () => {
    Alert.alert(
      t("habit.deleteConfirmTitle"),
      t("habit.deleteConfirmDescName", { name: habit.name }).replace("{{name}}", habit.name),
      [
        { text: t("habit.cancel"), style: "cancel" },
        {
          text: t("habit.delete"),
          style: "destructive",
          onPress: () => {
            removeHabit(habitId);
            router.back();
          },
        },
      ],
    );
  };

  const handleCheckInLongPress = (checkIn: CheckIn, e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    
    // Ensure the menu doesn't go off-screen
    const menuWidth = 150;
    const menuHeight = 100; // Roughly 2 items
    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;

    let xPos = pageX - 60; // Center roughly
    if (xPos + menuWidth > screenWidth - 10) xPos = screenWidth - menuWidth - 10;
    if (xPos < 10) xPos = 10;

    let yPos = pageY;
    if (yPos + menuHeight > screenHeight - 20) yPos = screenHeight - menuHeight - 20;

    setCheckInMenuAnchor({
      x: xPos,
      y: yPos,
      width: menuWidth,
      height: 0,
    });
    setActiveCheckInId(checkIn.id);
  };

  return (
    <ScrollView className="flex-1 bg-github-lightBg dark:bg-github-darkBg p-4">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between border-b border-github-lightBorder dark:border-github-darkBorder h-20 mb-4">
        <TouchableOpacity
          className="flex-row items-center mt-4"
          onPress={() => router.back()}
        >
          <Octicons name="chevron-left" size={18} color={color.text} />
          <Text className="text-xl font-semibold text-github-lightText dark:text-github-darkText ml-1">
            {t("habit.detail")}
          </Text>
        </TouchableOpacity>
        <View className="flex-row items-center mt-4 space-x-4">
          <TouchableOpacity
            onPress={() => setIsEditModalVisible(true)}
            className="mr-3"
          >
            <Octicons name="pencil" size={18} color={color.muted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Octicons name="trash" size={18} color={color.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Header */}
      <View className="mb-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
              {t("habit.habitLabel")}
            </Text>
            <View className="flex-row items-center mt-1 mb-2">
              <Text className="text-2xl font-bold text-github-lightText dark:text-github-darkText flex-1">
                {habit.name}
              </Text>
            </View>
            <View className="flex-col items-start">
              {habit.categoryName && (
                <View className="px-2 py-0.5 rounded-full border border-github-lightBorder dark:border-github-darkBorder flex-row items-center mb-2">
                  <View
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: habit.color || color.primary }}
                  />
                  <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
                    {habit.categoryName}
                  </Text>
                </View>
              )}
              <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted mb-1">
                {habit.description || t("habit.noDescription")}
              </Text>
            </View>
          </View>

          <View className="items-center flex-col justify-between">
            <View className="items-center mb-4">
              <GoalProgressRing
                currentValue={todayValue}
                targetValue={habit.targetValue || 1}
                size={40}
              />
              <Text className="text-[10px] text-github-lightMuted dark:text-github-darkMuted mt-1">
                {t("habit.todaysGoal")}
              </Text>
            </View>

            <TouchableOpacity
              className="px-3 py-2 rounded-md flex-row items-center"
              style={{ backgroundColor: color.primary }}
              onPress={() => {
                if (habit.unitType === 'binary' && quickCommitBinary) {
                  commitCheckIn(habitId, t("habit.quickCommit"), 1);
                } else {
                  setIsCommitModalVisible(true);
                }
              }}
            >
              <Octicons name={habit.unitType === 'binary' && quickCommitBinary ? "check" : "git-commit"} size={14} color="white" />
              <Text className="text-white font-semibold ml-2">
                {habit.unitType === 'binary' && quickCommitBinary ? t("habit.done") : t("habit.commit")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* README-like plan */}
      <View
        className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md mb-6"
        style={{ height: readmeHeight }}
      >
        <View className="flex-row items-center justify-between p-4 border-b border-github-lightBorder dark:border-github-darkBorder">
          <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText">
            {t("habit.readme")}
          </Text>
          <TouchableOpacity
            onPress={() => setIsReadmeFullScreen(true)}
            accessibilityLabel="Full screen README"
          >
            <Octicons name="screen-full" size={16} color={color.muted} />
          </TouchableOpacity>
        </View>
        <ScrollView className="px-4 py-3" nestedScrollEnabled>
          {habit.plan ? (
            <Markdown style={markdownStyle}>{habit.plan}</Markdown>
          ) : (
            <Text className="text-sm text-github-lightText dark:text-github-darkText leading-5">
              {t("habit.noPlan")}
            </Text>
          )}
        </ScrollView>
        <View
          className="absolute bottom-2 right-2 w-6 h-6 border border-github-lightBorder dark:border-github-darkBorder rounded-md items-center justify-center"
          {...readmePanResponder.panHandlers}
        >
          <View className="w-3 h-3 border-r border-b border-github-lightMuted dark:border-github-darkMuted" />
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row items-center mb-6">
        <View className="mr-6">
          <Text className="text-base font-bold text-github-lightText dark:text-github-darkText">
            {totalCommits}
          </Text>
          <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
            {formatUnit(totalCommits, t("units.commit"))}
          </Text>
        </View>
        <View className="mr-6">
          <Text className="text-base font-bold text-github-lightText dark:text-github-darkText">
            {stats.total}
          </Text>
          <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
            {formatUnit(stats.total, habit.unitLabel)}
          </Text>
        </View>
        <View className="mr-6">
          <Text className="text-base font-bold text-github-lightText dark:text-github-darkText">
            {goalsAchieved}
          </Text>
          <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
            {t("habit.goalsMet")}
          </Text>
        </View>
        <View>
          <Text className="text-base font-bold text-github-lightText dark:text-github-darkText">
            {currentStreak}
          </Text>
          <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
            {t("habit.streak")}
          </Text>
        </View>
      </View>

      {/* Contribution chart */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-semibold text-github-lightText dark:text-github-darkText">
            {t("habit.contributionActivity")}
          </Text>
          <YearPicker
            selectedYear={selectedYear}
            availableYears={availableYears}
            onYearSelect={setSelectedYear}
          />
        </View>
        <ContributionGraph 
          contributions={contributions} 
          days={graphDays}
          endDate={graphEndDate}
          targetValue={habit.targetValue}
          targetValues={targetValues}
        />
      </View>

      {/* Daily changes chart */}
      <View className="mb-6">
        <Text className="text-base font-semibold text-github-lightText dark:text-github-darkText mb-3">
          {t("habit.dailyFrequency")}
        </Text>
        <SimpleLineChart
          data={last30DaysData}
          height={180}
          color={habit.color}
          targetValue={habit.targetValue}
        />
      </View>

      {/* Recent commits */}
      <View className="mb-8">
        <Text className="text-base font-semibold text-github-lightText dark:text-github-darkText mb-3">
          {t("habit.recentCommits")}
        </Text>
        <View className="border border-github-lightBorder dark:border-github-darkBorder rounded-md bg-github-lightCanvas dark:bg-github-darkCanvas">
          {recentCheckIns.length === 0 ? (
            <View className="px-4 py-4">
              <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted text-center">
                {t("habit.noCommitsYet")}
              </Text>
            </View>
          ) : (
            recentCheckIns.map((checkIn, index) => (
              <TouchableOpacity
                key={checkIn.id}
                className={`px-4 py-3 ${
                  index !== recentCheckIns.length - 1
                    ? "border-b border-github-lightBorder dark:border-github-darkBorder"
                    : ""
                }`}
                onLongPress={(e) => handleCheckInLongPress(checkIn, e)}
                delayLongPress={400}
                activeOpacity={0.6}
              >
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="text-sm text-github-lightText dark:text-github-darkText flex-1 mr-2">
                    {checkIn.message || t("habit.completedSession")}
                  </Text>
                  <Text className="text-xs font-semibold text-github-lightSuccess dark:text-github-darkSuccess">
                    +{checkIn.value} {formatUnit(checkIn.value, habit.unitLabel)}
                  </Text>
                </View>
                <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
                  {formatRelativeTime(checkIn.timestamp)} · {checkIn.dateString}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {/* Spacer to allow scrolling past the bottom */}
      <View className="h-10" />

      <HabitFormModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        habitId={habitId}
      />
      <CommitModal
        visible={isCommitModalVisible}
        title={editingCheckIn ? t("habit.editCommit") : `${t("habit.commitTo")} ${habit.name}`}
        unitLabel={habit.unitLabel}
        unitType={habit.unitType}
        initialMessage={editingCheckIn?.message || ""}
        initialValue={editingCheckIn?.value || 1}
        onClose={() => {
          setIsCommitModalVisible(false);
          setEditingCheckIn(null);
        }}
        onSubmit={(value, message) => {
          if (editingCheckIn) {
            updateCheckIn(habitId, editingCheckIn.id, message, value);
          } else {
            commitCheckIn(habitId, message || t("habit.quickCommit"), value);
          }
          setEditingCheckIn(null);
        }}
      />
      <Modal
        visible={isReadmeFullScreen}
        animationType="slide"
        onRequestClose={() => setIsReadmeFullScreen(false)}
      >
        <View className="flex-1 bg-github-lightBg dark:bg-github-darkBg">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-github-lightBorder dark:border-github-darkBorder">
            <Text className="text-base font-semibold text-github-lightText dark:text-github-darkText">
              {t("habit.readme")}
            </Text>
            <TouchableOpacity
              onPress={() => setIsReadmeFullScreen(false)}
              accessibilityLabel="Exit full screen README"
            >
              <Octicons name="screen-normal" size={18} color={color.muted} />
            </TouchableOpacity>
          </View>
          <ScrollView className="px-4 py-3">
            {habit.plan ? (
              <Markdown style={markdownStyle}>{habit.plan}</Markdown>
            ) : (
              <Text className="text-sm text-github-lightText dark:text-github-darkText leading-5">
                {t("habit.noPlan")}
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* CheckIn Actions Modal */}
      <Modal
        visible={activeCheckInId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveCheckInId(null)}
      >
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setActiveCheckInId(null)}
          />
          {checkInMenuAnchor && activeCheckIn && (
            <View
              className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md overflow-hidden shadow-lg"
              style={{
                position: "absolute",
                top: checkInMenuAnchor.y,
                left: checkInMenuAnchor.x,
                minWidth: checkInMenuAnchor.width,
                zIndex: 20,
              }}
            >
              <TouchableOpacity
                className="flex-row items-center px-4 py-3 border-b border-github-lightBorder dark:border-github-darkBorder"
                onPress={() => {
                  setEditingCheckIn(activeCheckIn);
                  setIsCommitModalVisible(true);
                  setActiveCheckInId(null);
                }}
              >
                <Octicons
                  name="pencil"
                  size={16}
                  color={color.text}
                  className="mr-3"
                />
                <Text className="text-sm text-github-lightText dark:text-github-darkText ml-2">
                  {t("habit.edit")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center px-4 py-3"
                onPress={() => {
                  setActiveCheckInId(null);
                  Alert.alert(
                    t("habit.deleteCommitTitle"),
                    t("habit.deleteCommitDesc"),
                    [
                      { text: t("habit.cancel"), style: "cancel" },
                      {
                        text: t("habit.delete"),
                        style: "destructive",
                        onPress: () => removeCheckIn(habitId, activeCheckIn.id),
                      },
                    ],
                  );
                }}
              >
                <Octicons
                  name="trash"
                  size={16}
                  color={color.danger}
                  className="mr-3"
                />
                <Text className="text-sm text-github-lightDanger dark:text-github-darkDanger ml-2">
                  {t("habit.delete")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}
