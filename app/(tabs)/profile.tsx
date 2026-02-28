import { useYearFilter } from "@/hooks/useYearFilter";
import { YearPicker } from "@/components/YearPicker";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useThemeStore } from "@/store/themeStore";
import { useHabitStore } from "@/store/habitStore";
import { useUserStore } from "@/store/userStore";
import { Octicons } from "@expo/vector-icons";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ContributionGraph } from "@/components/ContributionGraph";
import { useMemo, useState } from "react";
import { EditProfileModal } from "@/components/EditProfileModal";
import { Link } from "expo-router";
import { formatUnit } from "@/utils/unitFormatterUtil";

export default function Profile() {
  const { theme, setTheme } = useThemeStore();
  const { profile, updateProfile } = useUserStore();
  const { color } = useThemeColors();
  const { habits, checkIns, fetchHabitDetail } = useHabitStore();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  
  const {
    selectedYear,
    setSelectedYear,
    availableYears,
    graphDays,
    graphEndDate,
  } = useYearFilter(checkIns);

  const allGoalsMetPerDay = useMemo(() => {
    const dailyHabitSums: Record<string, Record<number, number>> = {};
    checkIns.forEach(ci => {
      if (!dailyHabitSums[ci.dateString]) dailyHabitSums[ci.dateString] = {};
      dailyHabitSums[ci.dateString][ci.habitId] = (dailyHabitSums[ci.dateString][ci.habitId] || 0) + ci.value;
    });

    const habitTargets: Record<number, number> = {};
    habits.forEach(h => {
      habitTargets[h.id] = h.targetValue || 1;
    });

    const metPerDay: Record<string, number> = {};
    for (const dateStr in dailyHabitSums) {
      const sums = dailyHabitSums[dateStr];
      let goalsMet = 0;
      for (const habitIdStr in sums) {
        const hId = parseInt(habitIdStr);
        const target = habitTargets[hId] || 1;
        if (sums[hId] >= target) {
          goalsMet++;
        }
      }
      if (goalsMet > 0) {
        metPerDay[dateStr] = goalsMet;
      }
    }
    return metPerDay;
  }, [checkIns, habits]);

  const activeDays = useMemo(() => {
    return Object.entries(allGoalsMetPerDay).filter(([dateStr]) => dateStr.startsWith(selectedYear.toString())).length;
  }, [allGoalsMetPerDay, selectedYear]);

  const pinnedHabits = useMemo(
    () => habits.filter((habit) => (habit.pinned ?? 0) > 0),
    [habits]
  );

  // Compute a streak logic across all check-ins (at least one habit met its target)
  const currentStreak = useMemo(() => {
    const didMeetAnyGoal = (dateStr: string) => {
      return (allGoalsMetPerDay[dateStr] || 0) > 0;
    };

    let streak = 0;
    const today = new Date();
    const todayStr = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");
    
    if (didMeetAnyGoal(todayStr)) {
      streak++;
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
      
      if (didMeetAnyGoal(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [allGoalsMetPerDay]);

  return (
    <ScrollView className="flex-1 bg-github-lightBg dark:bg-github-darkBg p-4">
      {/* Profile Header */}
      <View className="flex-row items-center mb-6 mt-4">
        <Image
          source={profile.avatarUri ? { uri: profile.avatarUri } : require('@/assets/images/default-user-icon.png')}
          className="w-16 h-16 rounded-full border border-github-lightBorder dark:border-github-darkBorder mr-4"
        />
        <View className="flex-1">
          <Text className="text-xl font-bold text-github-lightText dark:text-github-darkText mb-1">
            {profile.username}
          </Text>
          {profile.bio ? (
             <Text className="text-sm text-github-lightText dark:text-github-darkText mb-1">
               {profile.bio}
             </Text>
          ) : null}
          {/* Status Placeholder */}
          {profile.status ? (
            <View className="flex-row items-center">
              <Octicons
                name="smiley"
                size={14}
                color={color.muted}
                className="mr-1"
              />
              <Text className="text-xs text-github-lightText dark:text-github-darkText">
                {profile.status}
              </Text>
            </View>
          ) : null}
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
        <TouchableOpacity 
          className="flex-1 bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder py-2 rounded-md items-center mr-2"
          onPress={() => setIsEditModalVisible(true)}
        >
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
            name={theme === "dark" ? "moon" : "sun"}
            size={16}
            color={color.text}
          />
        </TouchableOpacity>
      </View>

      {/* Contribution Graph Section */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-semibold text-github-lightText dark:text-github-darkText">
            {activeDays} {formatUnit(activeDays, "day")} with goals met
          </Text>
          
          {/* Year Dropdown Button */}
          <YearPicker
            selectedYear={selectedYear}
            availableYears={availableYears}
            onYearSelect={setSelectedYear}
          />
        </View>

        <ContributionGraph 
          contributions={allGoalsMetPerDay} 
          days={graphDays} 
          endDate={graphEndDate} 
        />
      </View>

      {/* Pinned Habits Section (formerly Organizations) */}
      <View>
        <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-3">
          Pinned
        </Text>
        {pinnedHabits.length === 0 ? (
          <View className="border border-github-lightBorder dark:border-github-darkBorder rounded-md p-4 mb-4 items-center">
            <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted">
              You don&apos;t have any pinned habits yet.
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {pinnedHabits.map((habit) => (
              <View
                key={habit.id}
                className="w-[48%] bg-github-lightBg dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder p-3 rounded-md flex-col justify-between"
              >
                <View>
                  <View className="flex-row items-center mb-1">
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
                          style={{ color: color.link }}
                        >
                          {habit.name}
                        </Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                  <Text
                    className="text-xs text-github-lightMuted dark:text-github-darkMuted mb-2 h-8"
                    numberOfLines={2}
                  >
                    {habit.description || "No description"}
                  </Text>
                </View>
                <View className="flex-row items-center mt-1">
                  <View 
                    className="w-3 h-3 rounded-full mr-1.5" 
                    style={{ backgroundColor: habit.color || color.primary }} 
                  />
                  <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
                    {habit.categoryName || 'General'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className="h-10" />

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={isEditModalVisible}
        initialProfile={profile}
        onClose={() => setIsEditModalVisible(false)}
        onSubmit={updateProfile}
      />
    </ScrollView>
  );
}
