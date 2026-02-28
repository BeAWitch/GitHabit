import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
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
import { useThemeColors } from "@/hooks/useThemeColors";
import { useHabitStore } from "@/store/habitStore";
import { formatRelativeTime, getDaysInCurrentYear } from "@/utils/dateUtil";
import { getMarkdownStyle } from "@/utils/markdownStyle";
import { formatUnit } from "@/utils/unitFormatterUtil";
import type { CheckIn } from "@/types/models";

export default function HabitDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { color } = useThemeColors();

  const habitId = Number(id);

  const {
    habits,
    checkIns,
    habitStats,
    habitContributions,
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

  // Filter and sort recent check-ins
  const habitCheckIns = checkIns.filter((c) => c.habitId === habitId);
  const totalCommits = habitCheckIns.length;
  const recentCheckIns = habitCheckIns
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10); // Show top 10 recent

  if (!habit) {
    return (
      <View className="flex-1 bg-github-lightBg dark:bg-github-darkBg p-4 justify-center items-center">
        <Text className="text-github-lightText dark:text-github-darkText">
          Loading habit details...
        </Text>
        <TouchableOpacity
          className="mt-4 px-4 py-2 bg-github-lightBorder dark:bg-github-darkBorder rounded-md"
          onPress={() => router.back()}
        >
          <Text className="text-github-lightText dark:text-github-darkText">
            Go Back
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

  if (contributions[todayStr]) {
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

    if (contributions[checkStr]) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete ${habit.name}? This will also delete all commit history. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeHabit(habitId);
            router.back();
          },
        },
      ],
    );
  };

  const handleCheckInLongPress = (checkIn: CheckIn) => {
    Alert.alert(
      "Manage Commit",
      `Modify or delete this commit?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Edit",
          onPress: () => {
            setEditingCheckIn(checkIn);
            setIsCommitModalVisible(true);
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Delete Commit",
              "Are you sure you want to delete this commit?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => removeCheckIn(habitId, checkIn.id),
                },
              ]
            );
          },
        },
      ]
    );
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
            Detail
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
        <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
          Habit
        </Text>
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-2xl font-bold text-github-lightText dark:text-github-darkText flex-1 mr-2">
            {habit.name}
          </Text>
          <TouchableOpacity
            className="px-3 py-2 rounded-md flex-row items-center"
            style={{ backgroundColor: color.primary }}
            onPress={() => setIsCommitModalVisible(true)}
          >
            <Octicons name="git-commit" size={14} color="white" />
            <Text className="text-white font-semibold ml-2">Commit</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center mt-2">
          {habit.categoryName && (
            <View className="px-2 py-0.5 rounded-full border border-github-lightBorder dark:border-github-darkBorder mr-2 flex-row items-center">
              <View
                className="w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: habit.color || color.primary }}
              />
              <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
                {habit.categoryName}
              </Text>
            </View>
          )}
          <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted flex-1">
            {habit.description || "No description provided."}
          </Text>
        </View>
      </View>

      {/* README-like plan */}
      <View
        className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md mb-6"
        style={{ height: readmeHeight }}
      >
        <View className="flex-row items-center justify-between p-4 border-b border-github-lightBorder dark:border-github-darkBorder">
          <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText">
            README
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
              No plan defined yet. Start by setting a goal!
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
            {formatUnit(totalCommits, "commits")}
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
        <View>
          <Text className="text-base font-bold text-github-lightText dark:text-github-darkText">
            {currentStreak}
          </Text>
          <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
            streak
          </Text>
        </View>
      </View>

      {/* Contribution chart */}
      <View className="mb-6">
        <Text className="text-base font-semibold text-github-lightText dark:text-github-darkText mb-3">
          Contribution activity
        </Text>
        <ContributionGraph contributions={contributions} days={getDaysInCurrentYear()} />
      </View>

      {/* Daily changes chart */}
      <View className="mb-6">
        <Text className="text-base font-semibold text-github-lightText dark:text-github-darkText mb-3">
          Daily frequency
        </Text>
        <SimpleLineChart
          data={last30DaysData}
          height={180}
          color={habit.color}
        />
      </View>

      {/* Recent commits */}
      <View className="mb-8">
        <Text className="text-base font-semibold text-github-lightText dark:text-github-darkText mb-3">
          Recent commits
        </Text>
        <View className="border border-github-lightBorder dark:border-github-darkBorder rounded-md bg-github-lightCanvas dark:bg-github-darkCanvas">
          {recentCheckIns.length === 0 ? (
            <View className="px-4 py-4">
              <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted text-center">
                No commits yet. Time to start your first streak!
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
                onLongPress={() => handleCheckInLongPress(checkIn)}
                delayLongPress={400}
                activeOpacity={0.6}
              >
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="text-sm text-github-lightText dark:text-github-darkText flex-1 mr-2">
                    {checkIn.message || "Completed habit session"}
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
        title={editingCheckIn ? "Edit Commit" : `Commit to ${habit.name}`}
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
            commitCheckIn(habitId, message || "Quick commit", value);
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
              README
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
                No plan defined yet. Start by setting a goal!
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}
