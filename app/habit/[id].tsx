import React, { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Octicons } from "@expo/vector-icons";

import { useThemeColors } from "@/hooks/useThemeColors";
import { useHabitStore } from "@/store/habitStore";
import { formatRelativeTime } from "@/utils/dateFormatter";

export default function HabitDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { color } = useThemeColors();

  const habitId = Number(id);

  const { habits, checkIns, habitStats, habitContributions, fetchHabitDetail, commitCheckIn } =
    useHabitStore();

  useEffect(() => {
    if (!isNaN(habitId)) {
      fetchHabitDetail(habitId);
    }
  }, [habitId, fetchHabitDetail]);

  const habit = habits.find((h) => h.id === habitId);
  const stats = habitStats[habitId] || { total: 0, lastTimestamp: null };
  const contributions = habitContributions[habitId] || {};

  // Filter and sort recent check-ins
  const recentCheckIns = checkIns
    .filter((c) => c.habitId === habitId)
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

  // Generate last 84 days for heatmap
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const heatmapData = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Format YYYY-MM-DD
    const dateString = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
    const count = contributions[dateString] || 0;
    heatmapData.push({ dateString, count });
  }

  // Simple streak calculation (mock or basic)
  let currentStreak = 0;
  for (let i = heatmapData.length - 1; i >= 0; i--) {
    if (heatmapData[i].count > 0) {
      currentStreak++;
    } else if (i < heatmapData.length - 1) {
      // Allow today to be 0 without breaking the streak if yesterday had > 0
      // but break if consecutive days are 0
      break;
    }
  }

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
            {habit.name}
          </Text>
        </TouchableOpacity>
        <View className="w-6" />
      </View>

      {/* Header */}
      <View className="mb-4">
        <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
          Repository
        </Text>
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-2xl font-bold text-github-lightText dark:text-github-darkText flex-1 mr-2">
            {habit.name}
          </Text>
          <TouchableOpacity
            className="px-3 py-2 rounded-md flex-row items-center"
            style={{ backgroundColor: color.primary }}
            onPress={() => commitCheckIn(habitId, "Quick commit", 1)}
          >
            <Octicons name="git-commit" size={14} color="white" />
            <Text className="text-white font-semibold ml-2">Commit</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted mt-2">
          {habit.description || "No description provided."}
        </Text>
      </View>

      {/* README-like plan */}
      <View className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md p-4 mb-6">
        <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-3">
          README
        </Text>
        <Text className="text-sm text-github-lightText dark:text-github-darkText leading-5">
          {habit.plan || "No plan defined yet. Start by setting a goal!"}
        </Text>
      </View>

      {/* Stats */}
      <View className="flex-row items-center mb-6">
        <View className="mr-6">
          <Text className="text-base font-bold text-github-lightText dark:text-github-darkText">
            {stats.total}
          </Text>
          <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
            commits ({habit.unitLabel})
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
        <View className="bg-github-lightBg dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md p-3">
          <View className="flex-row flex-wrap gap-1">
            {heatmapData.map((data, i) => {
              const levels = color.heatmap;
              // Simple logic: 0 = level 0, 1 = level 1, 2-3 = level 2, 4-5 = level 3, 6+ = level 4
              let levelIndex = 0;
              if (data.count === 1) levelIndex = 1;
              else if (data.count >= 2 && data.count <= 3) levelIndex = 2;
              else if (data.count >= 4 && data.count <= 5) levelIndex = 3;
              else if (data.count >= 6) levelIndex = 4;

              return (
                <View
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: levels[levelIndex] }}
                />
              );
            })}
          </View>
          <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mt-3 text-right">
            Less to More (84 days)
          </Text>
        </View>
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
              <View
                key={checkIn.id}
                className={`px-4 py-3 ${
                  index !== recentCheckIns.length - 1
                    ? "border-b border-github-lightBorder dark:border-github-darkBorder"
                    : ""
                }`}
              >
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="text-sm text-github-lightText dark:text-github-darkText flex-1 mr-2">
                    {checkIn.message || "Completed habit session"}
                  </Text>
                  <Text className="text-xs font-semibold text-github-lightSuccess dark:text-github-darkSuccess">
                    +{checkIn.value} {habit.unitLabel}
                  </Text>
                </View>
                <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
                  {formatRelativeTime(checkIn.timestamp)} · {checkIn.dateString}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
      
      {/* Spacer to allow scrolling past the bottom */}
      <View className="h-10" />
    </ScrollView>
  );
}
