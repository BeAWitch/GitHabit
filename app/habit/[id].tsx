import { useThemeColors } from "@/hooks/useThemeColors";
import { Octicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function HabitDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { color } = useThemeColors();

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
        <View className="w-6" />
      </View>

      {/* Header */}
      <View className="mb-4">
        <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
          Habit
        </Text>
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-2xl font-bold text-github-lightText dark:text-github-darkText">
            habit-{id}
          </Text>
          <TouchableOpacity
            className="px-3 py-2 rounded-md flex-row items-center"
            style={{ backgroundColor: color.primary }}
          >
            <Octicons name="git-commit" size={14} color="white" />
            <Text className="text-white font-semibold ml-2">Commit</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted mt-2">
          This is a placeholder habit description.
        </Text>
      </View>

      {/* README-like plan */}
      <View className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md p-4 mb-6">
        <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-3">
          README
        </Text>
        <Text className="text-sm text-github-lightText dark:text-github-darkText leading-5">
          # Plan
          {"\n"}- Goal: 30 minutes daily
          {"\n"}- Schedule: Mon-Fri
          {"\n"}- Notes: Keep it consistent
        </Text>
      </View>

      {/* Stats */}
      <View className="flex-row items-center mb-6">
        <View className="mr-6">
          <Text className="text-base font-bold text-github-lightText dark:text-github-darkText">
            18
          </Text>
          <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
            commits
          </Text>
        </View>
        <View>
          <Text className="text-base font-bold text-github-lightText dark:text-github-darkText">
            7
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
            {Array.from({ length: 84 }).map((_, i) => {
              const levels = color.heatmap;
              const randomLevel =
                levels[Math.floor(Math.random() * levels.length)];
              return (
                <View
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: randomLevel }}
                />
              );
            })}
          </View>
          <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mt-3 text-right">
            Less to More (mock data)
          </Text>
        </View>
      </View>

      {/* Recent commits */}
      <View>
        <Text className="text-base font-semibold text-github-lightText dark:text-github-darkText mb-3">
          Recent commits
        </Text>
        <View className="border border-github-lightBorder dark:border-github-darkBorder rounded-md">
          <View className="px-4 py-3 border-b border-github-lightBorder dark:border-github-darkBorder">
            <Text className="text-sm text-github-lightText dark:text-github-darkText">
              Did 3 sessions
            </Text>
            <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mt-1">
              Today · +3 times
            </Text>
          </View>
          <View className="px-4 py-3">
            <Text className="text-sm text-github-lightText dark:text-github-darkText">
              Completed daily goal
            </Text>
            <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mt-1">
              Yesterday · +1 done
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
