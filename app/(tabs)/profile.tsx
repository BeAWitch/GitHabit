import { useThemeColors } from "@/hooks/useThemeColors";
import { useThemeStore } from "@/store/themeStore";
import { useHabitStore } from "@/store/habitStore";
import { Octicons } from "@expo/vector-icons";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ContributionGraph } from "@/components/ContributionGraph";
import { getDaysInCurrentYear } from "@/utils/dateUtil";

export default function Profile() {
  const { theme, setTheme } = useThemeStore();
  const { color } = useThemeColors();
  const { globalContributions, habits } = useHabitStore();

  const totalContributions = Object.values(globalContributions).reduce((a, b) => a + b, 0);

  // Compute a simple streak logic across all check-ins
  let currentStreak = 0;
  const today = new Date();
  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  
  if (globalContributions[todayStr]) {
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
    
    if (globalContributions[checkStr]) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return (
    <ScrollView className="flex-1 bg-github-lightBg dark:bg-github-darkBg p-4">
      {/* Profile Header */}
      <View className="flex-row items-center mb-6 mt-4">
        <Image
          source={{ uri: "https://avatars.githubusercontent.com/u/1?v=4" }} // Placeholder octocat
          className="w-16 h-16 rounded-full border border-github-lightBorder dark:border-github-darkBorder mr-4"
        />
        <View className="flex-1">
          <Text className="text-xl font-bold text-github-lightText dark:text-github-darkText">
            Developer
          </Text>
          <Text className="text-base text-github-lightMuted dark:text-github-darkMuted mb-1">
            super-coder
          </Text>
          {/* Status Placeholder */}
          <View className="flex-row items-center">
            <Octicons
              name="smiley"
              size={14}
              color={color.muted}
              className="mr-1"
            />
            <Text className="text-xs text-github-lightText dark:text-github-darkText">
              Building habits...
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Overview */}
      <View className="flex-row items-center mb-6">
        <View className="mr-6">
          <Text className="font-bold text-github-lightText dark:text-github-darkText text-base">
            {habits.length}{" "}
            <Text className="font-normal text-github-lightMuted dark:text-github-darkMuted">
              habits
            </Text>
          </Text>
        </View>
        <View>
          <Text className="font-bold text-github-lightText dark:text-github-darkText text-base">
            {currentStreak}{" "}
            <Text className="font-normal text-github-lightMuted dark:text-github-darkMuted">
              day streak
            </Text>
          </Text>
        </View>
      </View>

      {/* Edit Profile / Settings Buttons */}
      <View className="flex-row space-x-3 mb-6">
        <TouchableOpacity className="flex-1 bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder py-2 rounded-md items-center mr-2">
          <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText">
            Edit profile
          </Text>
        </TouchableOpacity>
        {/* Quick Theme Toggle for demonstration */}
        <TouchableOpacity
          className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder py-2 px-3 rounded-md items-center"
          onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Octicons
            name={theme === "dark" ? "sun" : "moon"}
            size={16}
            color={color.text}
          />
        </TouchableOpacity>
      </View>

      {/* Contribution Graph Section */}
      <View className="mb-6">
        <Text className="text-base font-semibold text-github-lightText dark:text-github-darkText mb-3">
          {totalContributions} contributions in the last year
        </Text>
        <ContributionGraph contributions={globalContributions} days={getDaysInCurrentYear()} />
      </View>

      {/* Organizations / Pinned Placeholder */}
      <View>
        <Text className="text-base font-semibold text-github-lightText dark:text-github-darkText mb-3">
          Organizations
        </Text>
        <View className="flex-row">
          <View className="w-8 h-8 rounded-md bg-purple-500 mr-2" />
          <View className="w-8 h-8 rounded-md bg-blue-500 mr-2" />
          <View className="w-8 h-8 rounded-md bg-green-500" />
        </View>
      </View>
      <View className="h-10" />
    </ScrollView>
  );
}
