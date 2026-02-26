import { useThemeColors } from "@/hooks/useThemeColors";
import { Octicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Repositories() {
  const { color } = useThemeColors();

  return (
    <View className="flex-1 bg-github-lightBg dark:bg-github-darkBg p-4">
      {/* Header & Controls */}
      <View className="flex-row items-center justify-between mb-4">
        {/* Search Input */}
        <View className="flex-1 bg-github-lightCanvas dark:bg-github-darkCanvas flex-row items-center border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 mr-3">
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
          <Text className="text-white font-bold ml-2">New</Text>
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
        {/* List Item 1 */}
        <View className="border-b border-github-lightBorder dark:border-github-darkBorder py-4">
          <View className="flex-row items-center justify-between mb-2">
            <Link href="/habit/1" asChild>
              <TouchableOpacity>
                <Text
                  className="text-lg font-semibold"
                  style={{ color: color.link }}
                >
                  daily-reading
                </Text>
              </TouchableOpacity>
            </Link>
            {/* Action Menu (Three dots) Placeholder */}
            <TouchableOpacity>
              <Octicons name="kebab-horizontal" size={16} color={color.muted} />
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted mb-3">
            Read 30 pages a day to improve focus.
          </Text>
          <View className="flex-row items-center">
            {/* Language Dot metaphor */}
            <View className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
            <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mr-4">
              Learning
            </Text>
            <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
              Updated 2 hours ago
            </Text>
          </View>
        </View>

        {/* List Item 2 */}
        <View className="border-b border-github-lightBorder dark:border-github-darkBorder py-4">
          <View className="flex-row items-center justify-between mb-2">
            <Link href="/habit/2" asChild>
              <TouchableOpacity>
                <Text
                  className="text-lg font-semibold"
                  style={{ color: color.link }}
                >
                  workout-2024
                </Text>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity>
              <Octicons name="kebab-horizontal" size={16} color={color.muted} />
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted mb-3">
            Gym or running 5 times a week.
          </Text>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
            <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mr-4">
              Health
            </Text>
            <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
              Updated 1 day ago
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
