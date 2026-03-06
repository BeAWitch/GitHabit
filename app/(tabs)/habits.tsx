import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Octicons } from "@expo/vector-icons";
import { Link, router, Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { FilterDropdown } from "@/components/FilterDropdown";

import { HabitFormModal } from "@/components/HabitFormModal";
import { GoalProgressRing } from "@/components/GoalProgressRing";
import { HeaderMenu } from "@/components/HeaderMenu";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useHabitStore } from "@/store/habitStore";
import { formatRelativeTime, getLocalDateString } from "@/utils/dateUtil";
export default function Habits() {
  const { color } = useThemeColors();
  const { t } = useTranslation();
  const { habits, habitStats, categories, checkIns, fetchData, fetchHabitDetail, updateHabit } =
    useHabitStore();

  const TYPE_FILTERS = useMemo(() => [
    { label: `${t('habits.type')} ${t('habits.all')}`, value: "all", rawLabel: t('habits.all') },
    { label: `${t('habits.type')} ${t('habits.active')}`, value: "active", rawLabel: t('habits.active') },
    { label: `${t('habits.type')} ${t('habits.archived')}`, value: "archived", rawLabel: t('habits.archived') },
  ], [t]);

  const SORT_OPTIONS = useMemo(() => [
    { label: `${t('habits.sort')} ${t('habits.lastUpdated')}`, value: "lastUpdated", rawLabel: t('habits.lastUpdated') },
    { label: `${t('habits.sort')} ${t('habits.newest')}`, value: "newest", rawLabel: t('habits.newest') },
    { label: `${t('habits.sort')} ${t('habits.oldest')}`, value: "oldest", rawLabel: t('habits.oldest') },
    { label: `${t('habits.sort')} ${t('habits.name')}`, value: "name", rawLabel: t('habits.name') },
  ], [t]);

  const COMPLETION_FILTERS = useMemo(() => [
    { label: `${t('habits.today')} ${t('habits.all')}`, value: "all", rawLabel: t('habits.all') },
    { label: `${t('habits.today')} ${t('habits.completed')}`, value: "completed", rawLabel: t('habits.completed') },
    { label: `${t('habits.today')} ${t('habits.incomplete')}`, value: "incomplete", rawLabel: t('habits.incomplete') },
  ], [t]);

  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] =
    useState<"all" | "active" | "archived">("all");
  const [sortOption, setSortOption] =
    useState<"lastUpdated" | "newest" | "oldest" | "name">("lastUpdated");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [completionFilter, setCompletionFilter] =
    useState<"all" | "completed" | "incomplete">("all");

  const [activeHabitId, setActiveHabitId] = useState<number | null>(null);
  const [habitMenuAnchor, setHabitMenuAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const habitRefs = useRef<Record<number, View | null>>({});

  const todayStr = useMemo(() => {
    return getLocalDateString();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const todayValues = useMemo(() => {
    return checkIns
      .filter((c) => c.dateString === todayStr)
      .reduce((acc, curr) => {
        acc[curr.habitId] = (acc[curr.habitId] || 0) + curr.value;
        return acc;
      }, {} as Record<number, number>);
  }, [checkIns, todayStr]);

  const filteredHabits = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const matchesSearch = (habit: (typeof habits)[number]) => {
      if (!normalizedQuery) return true;
      return [habit.name, habit.description, habit.categoryName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    };

    const matchesType = (habit: (typeof habits)[number]) => {
      if (typeFilter === "all") return true;
      return habit.status === typeFilter;
    };

    const matchesCategory = (habit: (typeof habits)[number]) => {
      if (categoryFilter === null) return true;
      return habit.categoryId === categoryFilter;
    };

    const matchesCompletion = (habit: (typeof habits)[number]) => {
      if (completionFilter === "all") return true;
      const todayValue = todayValues[habit.id] || 0;
      const targetValue = habit.targetValue || 1;
      const isCompleted = todayValue >= targetValue;
      return completionFilter === "completed" ? isCompleted : !isCompleted;
    };

    const sortedHabits = habits
      .filter(
        (habit) =>
          matchesSearch(habit) &&
          matchesType(habit) &&
          matchesCategory(habit) &&
          matchesCompletion(habit),
      )
      .sort((a, b) => {
        if ((b.pinned ?? 0) !== (a.pinned ?? 0)) {
          return (b.pinned ?? 0) - (a.pinned ?? 0);
        }

        if (sortOption === "name") {
          return a.name.localeCompare(b.name);
        }

        if (sortOption === "newest") {
          return b.createdAt - a.createdAt;
        }

        if (sortOption === "oldest") {
          return a.createdAt - b.createdAt;
        }

        const aUpdated = habitStats[a.id]?.lastTimestamp ?? 0;
        const bUpdated = habitStats[b.id]?.lastTimestamp ?? 0;
        return bUpdated - aUpdated;
      });

    return sortedHabits;
  }, [
    habits,
    habitStats,
    searchQuery,
    sortOption,
    typeFilter,
    categoryFilter,
    completionFilter,
    todayValues,
  ]);

  const categoryOptions = useMemo(
    () => [
      { label: `${t('habits.category')} ${t('habits.all')}`, value: "all", rawLabel: t('habits.all') },
      ...categories.map((category) => ({
        label: `${t('habits.category')} ${category.name}`,
        value: String(category.id),
        rawLabel: category.name,
      })),
    ],
    [categories, t],
  );

  const activeHabit = useMemo(
    () => habits.find((h) => h.id === activeHabitId),
    [habits, activeHabitId],
  );

  const activeHabitsProgress = useMemo(() => {
    const activeHabits = habits.filter((h) => h.status === "active");
    const total = activeHabits.length;
    let completed = 0;
    
    activeHabits.forEach((habit) => {
      const todayValue = todayValues[habit.id] || 0;
      const targetValue = habit.targetValue || 1;
      if (todayValue >= targetValue) {
        completed++;
      }
    });

    return { completed, total };
  }, [habits, todayValues]);

  return (
    <View className="flex-1 bg-github-lightBg dark:bg-github-darkBg p-4">
      <Tabs.Screen
        options={{
          headerRight: () => (
            <View className="flex-row items-center">
              <View className="mr-2">
                <GoalProgressRing
                  currentValue={activeHabitsProgress.completed}
                  targetValue={activeHabitsProgress.total}
                  size={32}
                  strokeWidth={4}
                />
              </View>
              <HeaderMenu />
            </View>
          ),
        }}
      />
      {/* Header & Controls */}
      <View className="flex-row items-center justify-between mb-4">
        {/* Search Input */}
        <View className="flex-1 bg-github-lightCanvas dark:bg-github-darkCanvas flex-row items-center border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-0 mr-3">
          <TextInput
            className="flex-1 text-github-lightText dark:text-github-darkText ml-2"
            placeholder={t('habits.findHabit')}
            placeholderTextColor={color.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Octicons name="search" size={16} color={color.muted} />
        </View>

        {/* New Habit Button */}
        <TouchableOpacity
          className="px-4 py-2 rounded-md flex-row items-center"
          style={{ backgroundColor: color.primary }}
          onPress={() => setModalVisible(true)}
        >
          <Octicons name="repo" size={16} color="white" className="mr-2" />
          <Text className="text-white font-bold ml-1">{t('habits.new')}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter / Sort Row */}
      <View className="mb-4">
        <View className="flex-row flex-wrap items-center gap-2">
          <FilterDropdown
            data={TYPE_FILTERS}
            value={typeFilter}
            onChange={(val) => setTypeFilter(val as any)}
            fontSize={11}
          />
          <FilterDropdown
            data={SORT_OPTIONS}
            value={sortOption}
            onChange={(val) => setSortOption(val as any)}
            fontSize={11}
          />
          <FilterDropdown
            data={categoryOptions}
            value={categoryFilter === null ? "all" : String(categoryFilter)}
            onChange={(val) => setCategoryFilter(val === "all" ? null : Number(val))}
            fontSize={11}
          />
          <FilterDropdown
            data={COMPLETION_FILTERS}
            value={completionFilter}
            onChange={(val) => setCompletionFilter(val as any)}
            fontSize={11}
          />
        </View>
      </View>

      {/* Habit List */}
      <ScrollView>
        {filteredHabits.length === 0 ? (
          <View className="border border-github-lightBorder dark:border-github-darkBorder rounded-md p-4">
            <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted">
              {t('habits.noHabitsFound')}
            </Text>
          </View>
        ) : (
          filteredHabits.map((habit) => {
            const stats = habitStats[habit.id];
            const lastUpdated = stats?.lastTimestamp ?? null;

            const todayValue = todayValues[habit.id] || 0;

            return (
              <View
                key={habit.id}
                className="border-b border-github-lightBorder dark:border-github-darkBorder py-4 flex-row items-center justify-between"
              >
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Link
                      href={`/habit/${habit.id}`}
                      asChild
                      onPress={() => fetchHabitDetail(habit.id)}
                    >
                      <TouchableOpacity className="flex-row items-center">
                        <Text
                          className="text-lg font-semibold"
                          style={{ color: color.link }}
                        >
                          {habit.name}
                        </Text>
                        {habit.pinned === 1 && (
                          <View className="ml-2">
                            <Octicons
                              name="pin"
                              size={14}
                              color={color.muted}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    </Link>
                  </View>
                  <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted mb-3">
                    {habit.description || t("habits.noDescription")}
                  </Text>
                  <View className="flex-row items-center">
                    <View
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: habit.color || color.primary }}
                    />
                    <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mr-4">
                      {habit.categoryName || t("habits.defaultCategory")}
                    </Text>
                    {lastUpdated ? (
                      <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
                        {t("habits.updated")} {formatRelativeTime(lastUpdated)}
                      </Text>
                    ) : (
                      <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
                        {formatRelativeTime(lastUpdated)}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="flex-row items-center">
                  <GoalProgressRing
                    currentValue={todayValue}
                    targetValue={habit.targetValue || 1}
                    size={40}
                    strokeWidth={5}
                  />
                  <TouchableOpacity
                    ref={(el) => { habitRefs.current[habit.id] = el; }}
                    className="ml-3 p-2"
                    onPress={() => {
                      habitRefs.current[habit.id]?.measureInWindow((x, y, width, height) => {
                        setHabitMenuAnchor({
                          x: x + width - 150, // 150 is minWidth of menu, aligning to right
                          y: y + height + 8,
                          width: 150,
                          height: 0,
                        });
                        setActiveHabitId(habit.id);
                      });
                    }}
                  >
                    <Octicons
                      name="kebab-horizontal"
                      size={16}
                      color={color.muted}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* New Habit Modal */}
      <HabitFormModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />

      {/* Habit Actions Modal */}
      <Modal
        visible={activeHabitId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveHabitId(null)}
      >
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setActiveHabitId(null)}
          />
          {habitMenuAnchor && activeHabit && (
            <View
              className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md overflow-hidden shadow-lg"
              style={{
                position: "absolute",
                top: habitMenuAnchor.y,
                left: habitMenuAnchor.x,
                minWidth: habitMenuAnchor.width,
                zIndex: 20,
              }}
            >
              <TouchableOpacity
                className="flex-row items-center px-4 py-3 border-b border-github-lightBorder dark:border-github-darkBorder"
                onPress={() => {
                  const newPinnedStatus = activeHabit.pinned ? 0 : 1;
                  updateHabit(
                    activeHabit.id,
                    activeHabit.name,
                    activeHabit.description,
                    activeHabit.plan,
                    activeHabit.unitType,
                    activeHabit.unitLabel,
                    activeHabit.targetValue,
                    activeHabit.categoryId,
                    activeHabit.status,
                    newPinnedStatus,
                  );
                  setActiveHabitId(null);
                }}
              >
                <Octicons
                  name={activeHabit.pinned ? "pin" : "pin"}
                  size={16}
                  color={color.text}
                  className="mr-3"
                  style={{ opacity: activeHabit.pinned ? 0.5 : 1 }}
                />
                <Text className="text-sm text-github-lightText dark:text-github-darkText ml-2">
                  {activeHabit.pinned ? t('habits.unpin') : t('habits.pinToTop')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center px-4 py-3"
                onPress={() => {
                  fetchHabitDetail(activeHabit.id);
                  setActiveHabitId(null);
                  router.push(`/habit/${activeHabit.id}`);
                }}
              >
                <Octicons
                  name="file"
                  size={16}
                  color={color.text}
                  className="mr-3"
                />
                <Text className="text-sm text-github-lightText dark:text-github-darkText ml-2">
                  {t('habits.viewDetails')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
