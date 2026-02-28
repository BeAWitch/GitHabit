import { CommitModal } from "@/components/CommitModal";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useHabitStore } from "@/store/habitStore";
import { formatRelativeTime } from "@/utils/dateUtil";
import { GoalProgressRing } from "@/components/GoalProgressRing";
import { formatUnit } from "@/utils/unitFormatterUtil";
import { Octicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { Habit, TimelineActivity } from "@/types/models";

type ActivityGroup = {
  id: string;
  type: "check_in" | "create" | "delete";
  habitId: number;
  habitName: string;
  timestamp: number;
  activities: TimelineActivity[];
};

function CheckInGroupRenderer({
  group,
  habits,
  fetchHabitDetail,
  isLast,
}: {
  group: ActivityGroup;
  habits: Habit[];
  fetchHabitDetail: (id: number) => void;
  isLast: boolean;
}) {
  const { color } = useThemeColors();
  const [expanded, setExpanded] = useState(false);

  const habitExists = habits.some((h) => h.id === group.habitId);
  const total = group.activities.length;

  const visibleActivities = expanded
    ? group.activities
    : group.activities.slice(0, 2);
  const hiddenCount = total - visibleActivities.length;

  return (
    <View key={group.id} className="flex-row items-start mb-4">
      <View className="mt-1 mr-3">
        <Octicons name="git-commit" size={16} color={color.primary} />
      </View>
      <View
        className={`flex-1 ${!isLast ? "border-b border-github-lightBorder dark:border-github-darkBorder pb-3" : ""}`}
      >
        <Text className="text-sm text-github-lightText dark:text-github-darkText mb-2">
          <Text className="font-semibold">You</Text> committed to{" "}
          {habitExists ? (
            <Link
              href={`/habit/${group.habitId}`}
              asChild
              onPress={() => fetchHabitDetail(group.habitId)}
            >
              <Text className="font-semibold" style={{ color: color.link }}>
                {group.habitName || `repo-${group.habitId}`}
              </Text>
            </Link>
          ) : (
            <Text className="font-semibold" style={{ color: color.muted }}>
              {group.habitName || `repo-${group.habitId}`}
            </Text>
          )}
        </Text>

        <View className="pl-3 border-l-2 border-github-lightBorder dark:border-github-darkBorder">
          {visibleActivities.map((activity) => (
            <View key={activity.id} className="mb-3">
              <Text className="text-sm font-semibold text-github-lightSuccess dark:text-github-darkSuccess">
                +{activity.value}{" "}
                {formatUnit(
                  activity.value || 1,
                  activity.unitLabel || "time"
                )}
              </Text>
              {activity.message && activity.message !== "Quick commit" && (
                <Text className="text-xs text-github-lightText dark:text-github-darkText mt-1">
                  &quot;{activity.message}&quot;
                </Text>
              )}
              <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mt-1">
                {formatRelativeTime(activity.timestamp)}
              </Text>
            </View>
          ))}

          {!expanded && hiddenCount > 0 && (
            <TouchableOpacity
              onPress={() => setExpanded(true)}
              className="mt-1"
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: color.link }}
              >
                {hiddenCount} more commit{hiddenCount > 1 ? "s" : ""} »
              </Text>
            </TouchableOpacity>
          )}
          {expanded && total > 2 && (
            <TouchableOpacity
              onPress={() => setExpanded(false)}
              className="mt-1"
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: color.link }}
              >
                « Show less
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export default function Home() {
  const { color } = useThemeColors();
  const router = useRouter();

  const { habits, recentActivities, habitContributions, fetchData, commitCheckIn, fetchHabitDetail } =
    useHabitStore();

  const [commitModalHabitId, setCommitModalHabitId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pinnedHabits = useMemo(
    () => habits.filter((habit) => (habit.pinned ?? 0) > 0).slice(0, 4),
    [habits],
  );

  const groupedActivities = useMemo(() => {
    const groups: ActivityGroup[] = [];
    const recent = recentActivities.slice(0, 50);

    for (const activity of recent) {
      const lastGroup = groups[groups.length - 1];

      if (
        lastGroup &&
        lastGroup.type === "check_in" &&
        activity.type === "check_in" &&
        lastGroup.habitId === activity.habitId
      ) {
        lastGroup.activities.push(activity);
      } else {
        groups.push({
          id: `${activity.id}_group`,
          type: activity.type,
          habitId: activity.habitId,
          habitName: activity.habitName,
          timestamp: activity.timestamp,
          activities: [activity],
        });
      }
    }

    return groups.slice(0, 10);
  }, [recentActivities]);

  const activeCommitHabit = useMemo(
    () => habits.find((habit) => habit.id === commitModalHabitId) || null,
    [commitModalHabitId, habits],
  );

  return (
    <ScrollView className="flex-1 bg-github-lightBg dark:bg-github-darkBg p-4">
      {/* Pinned Habits Section */}
      <View className="mb-6">
        <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-3">
          Pinned
        </Text>

        {pinnedHabits.length === 0 ? (
          <View className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder p-4 rounded-md items-center">
            <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted mb-2">
              No pinned habits yet.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/habits")}
              className="px-3 py-1.5 rounded-md border border-github-lightBorder dark:border-github-darkBorder"
            >
              <Text className="text-xs font-semibold text-github-lightText dark:text-github-darkText">
                Create new
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {pinnedHabits.map((habit) => {
              // Calculate today's progress for pinned habits
              const todayStr = new Date().toISOString().split("T")[0];
              const habitId = habit.id;
              
              // We need habitContributions from store for calculating today's progress
              const contributions = habitContributions[habitId] || {};
              const todayCount = contributions[todayStr] || 0;
              const targetCount = habit.targetValue || 1;

              return (
                <View
                  key={habit.id}
                  className="w-[48%] bg-github-lightBg dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder p-3 rounded-md flex-col justify-between relative"
                >
                  <View className="absolute top-3 right-4 z-10">
                    <GoalProgressRing
                      currentValue={todayCount}
                      targetValue={targetCount}
                      size={30}
                      strokeWidth={3}
                    />
                  </View>
                  <View>
                    <View className="flex-row items-center mb-1 pr-6">
                      <Octicons
                        name="repo"
                        size={16}
                        color={color.text}
                        className="mr-2"
                      />
                      <Link
                        href={`/habit/${habit.id}`}
                        asChild
                        onPress={() => fetchHabitDetail(habit.id)}
                      >
                        <TouchableOpacity className="flex-1">
                          <Text
                            className="text-github-lightText dark:text-github-darkText font-semibold text-sm"
                            numberOfLines={1}
                          >
                            {habit.name}
                          </Text>
                        </TouchableOpacity>
                      </Link>
                    </View>
                    <Text
                      className="text-xs text-github-lightMuted dark:text-github-darkMuted mb-3 h-8"
                      numberOfLines={2}
                    >
                      {habit.description || "No description"}
                    </Text>
                  </View>
  
                  {/* Quick Commit Button */}
                  <TouchableOpacity
                    className="py-1 rounded-md items-center"
                    style={{ backgroundColor: color.primary }}
                    onPress={() => setCommitModalHabitId(habit.id)}
                  >
                    <Text className="text-white text-xs font-bold">Commit</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Recent Activity (Timeline) */}
      <View>
        <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-3">
          Recent Activity
        </Text>

        {groupedActivities.length === 0 ? (
          <View className="p-4 border border-github-lightBorder dark:border-github-darkBorder rounded-md">
            <Text className="text-sm text-center text-github-lightMuted dark:text-github-darkMuted">
              No recent activity. Time to get to work!
            </Text>
          </View>
        ) : (
          groupedActivities.map((group, index) => {
            const isLast = index === groupedActivities.length - 1;
            const activity = group.activities[0];
            
            if (group.type === 'create') {
              const habitExists = habits.some(h => h.id === activity.habitId);
              return (
                <View key={group.id} className="flex-row items-start mb-4">
                  <View className="mt-1 mr-3">
                    <Octicons name="repo" size={16} color={color.text} />
                  </View>
                  <View className={`flex-1 ${!isLast ? "border-b border-github-lightBorder dark:border-github-darkBorder pb-3" : ""}`}>
                    <Text className="text-sm text-github-lightText dark:text-github-darkText">
                      <Text className="font-semibold">You</Text> created a habit{" "}
                      {habitExists ? (
                        <Link
                          href={`/habit/${activity.habitId}`}
                          asChild
                          onPress={() => fetchHabitDetail(activity.habitId)}
                        >
                          <Text className="font-semibold" style={{ color: color.link }}>
                            {activity.habitName}
                          </Text>
                        </Link>
                      ) : (
                        <Text className="font-semibold" style={{ color: color.muted }}>
                          {activity.habitName}
                        </Text>
                      )}
                    </Text>
                    <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mt-1">
                      {formatRelativeTime(activity.timestamp)}
                    </Text>
                  </View>
                </View>
              );
            }

            if (group.type === 'delete') {
              return (
                <View key={group.id} className="flex-row items-start mb-4">
                  <View className="mt-1 mr-3">
                    <Octicons name="trash" size={16} color={color.danger} />
                  </View>
                  <View className={`flex-1 ${!isLast ? "border-b border-github-lightBorder dark:border-github-darkBorder pb-3" : ""}`}>
                    <Text className="text-sm text-github-lightText dark:text-github-darkText">
                      <Text className="font-semibold">You</Text> deleted the habit{" "}
                      <Text className="font-semibold line-through" style={{ color: color.muted }}>
                        {activity.habitName}
                      </Text>
                    </Text>
                    <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mt-1">
                      {formatRelativeTime(activity.timestamp)}
                    </Text>
                  </View>
                </View>
              );
            }

            // type === 'check_in'
            return (
              <CheckInGroupRenderer
                key={group.id}
                group={group}
                habits={habits}
                fetchHabitDetail={fetchHabitDetail}
                isLast={isLast}
              />
            );
          })
        )}
      </View>
      <View className="h-10" />
      <CommitModal
        visible={Boolean(activeCommitHabit)}
        title={
          activeCommitHabit ? `Commit to ${activeCommitHabit.name}` : "Commit"
        }
        unitLabel={activeCommitHabit?.unitLabel || "time"}
        unitType={activeCommitHabit?.unitType || "count"}
        onClose={() => setCommitModalHabitId(null)}
        onSubmit={(value, message) => {
          if (!activeCommitHabit) return;
          commitCheckIn(activeCommitHabit.id, message || "Quick commit", value);
        }}
      />
    </ScrollView>
  );
}
