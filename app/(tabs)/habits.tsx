import { useEffect } from "react";

import { useThemeColors } from "@/hooks/useThemeColors";
import { useHabitStore } from "@/store/habitStore";

import { Octicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { formatRelativeTime } from "@/utils/dateFormatter";

export default function Repositories() {
  const { color } = useThemeColors();
  const { habits, habitStats, fetchData, fetchHabitDetail } = useHabitStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <View className="flex-1 bg-github-lightBg dark:bg-github-darkBg p-4">
      {/* Header & Controls */}
      <View className="flex-row items-center justify-between mb-4">
        {/* Search Input */}
        <View className="flex-1 bg-github-lightCanvas dark:bg-github-darkCanvas flex-row items-center border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-0 mr-3">
          <TextInput
            className="flex-1 text-github-lightText dark:text-github-darkText ml-2"
            placeholder="Find a habit..."
            placeholderTextColor={color.muted}
          />
          <Octicons name="search" size={16} color={color.muted} />
        </View>

        {/* New Habit Button */}
        <TouchableOpacity
          className="px-4 py-2 rounded-md flex-row items-center"
          style={{ backgroundColor: color.primary }}
        >
          <Octicons name="repo" size={16} color="white" className="mr-2" />
          <Text className="text-white font-bold ml-1">New</Text>
        </TouchableOpacity>
      </View>

      {/* Filter / Sort Row Placeholder */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity className="flex-row items-center bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder px-3 py-1 rounded-md mr-2">
          <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mr-2">
            Type: All
          </Text>
          <Octicons name="triangle-down" size={14} color={color.text} />
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder px-3 py-1 rounded-md">
          <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mr-2">
            Sort: Last updated
          </Text>
          <Octicons name="triangle-down" size={14} color={color.text} />
        </TouchableOpacity>
      </View>

      {/* Habit List */}
      <ScrollView>
        {habits.length === 0 ? (
          <View className="border border-github-lightBorder dark:border-github-darkBorder rounded-md p-4">
            <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted">
              No habits yet.
            </Text>
          </View>
        ) : (
          habits.map((habit) => {
            const stats = habitStats[habit.id];
            const lastUpdated = stats?.lastTimestamp ?? null;
            return (
              <View
                key={habit.id}
                className="border-b border-github-lightBorder dark:border-github-darkBorder py-4"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Link
                    href={`/habit/${habit.id}`}
                    asChild
                    onPress={() => fetchHabitDetail(habit.id)}
                  >
                    <TouchableOpacity>
                      <Text
                        className="text-lg font-semibold"
                        style={{ color: color.link }}
                      >
                        {habit.name}
                      </Text>
                    </TouchableOpacity>
                  </Link>
                  <TouchableOpacity>
                    <Octicons
                      name="kebab-horizontal"
                      size={16}
                      color={color.muted}
                    />
                  </TouchableOpacity>
                </View>
                <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted mb-3">
                  {habit.description || "No description"}
                </Text>
                <View className="flex-row items-center">
                  <View
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: habit.color || color.primary }}
                  />
                  <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mr-4">
                    {habit.unitLabel || "Unit"}
                  </Text>
                  <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
                    Updated {formatRelativeTime(lastUpdated)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
