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
import { formatUnit } from "@/utils/unitFormatterUtil";
import { useTranslation } from "react-i18next";

const StatCard = ({
  title,
  value,
  subtitle,
  iconName,
  iconColor,
  fullWidth,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  iconName: keyof typeof Octicons.glyphMap;
  iconColor: string;
  fullWidth?: boolean;
}) => (
  <View
    className={`${
      fullWidth ? "w-full" : "w-[48%]"
    } bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder p-4 rounded-md mb-4 flex-col`}
  >
    <View className="flex-row items-center mb-2">
      <Octicons name={iconName} size={16} color={iconColor} className="mr-2" />
      <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText">
        {title}
      </Text>
    </View>
    <Text
      className="text-2xl font-bold text-github-lightText dark:text-github-darkText mb-1"
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {value}
    </Text>
    <Text
      className="text-xs text-github-lightMuted dark:text-github-darkMuted"
      numberOfLines={1}
    >
      {subtitle}
    </Text>
  </View>
);

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const { profile, updateProfile } = useUserStore();
  const { color } = useThemeColors();
  const { habits, checkIns } = useHabitStore();
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
    const dailyHabitTargets: Record<string, Record<number, number>> = {};

    checkIns.forEach(ci => {
      if (!dailyHabitSums[ci.dateString]) dailyHabitSums[ci.dateString] = {};
      if (!dailyHabitTargets[ci.dateString]) dailyHabitTargets[ci.dateString] = {};

      dailyHabitSums[ci.dateString][ci.habitId] = (dailyHabitSums[ci.dateString][ci.habitId] || 0) + ci.value;
      if (ci.targetValue !== undefined) {
         dailyHabitTargets[ci.dateString][ci.habitId] = Math.max(
           dailyHabitTargets[ci.dateString][ci.habitId] || 0,
           ci.targetValue
         );
      }
    });

    const currentHabitTargets: Record<number, number> = {};
    habits.forEach(h => {
      currentHabitTargets[h.id] = h.targetValue || 1;
    });

    const metPerDay: Record<string, number> = {};
    for (const dateStr in dailyHabitSums) {
      const sums = dailyHabitSums[dateStr];
      let goalsMet = 0;
      for (const habitIdStr in sums) {
        const hId = parseInt(habitIdStr);
        const todayStr = new Date().toISOString().split('T')[0];
        let target = currentHabitTargets[hId] || 1;
        if (dateStr !== todayStr) {
          target = dailyHabitTargets[dateStr]?.[hId] || target;
        }
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

  const yearlyStats = useMemo(() => {
    // 1. Total Check-ins
    const yearlyCheckIns = checkIns.filter((ci) => ci.dateString.startsWith(selectedYear.toString()));
    const totalCheckIns = yearlyCheckIns.length;

    // 2. Top Habit
    const habitCounts: Record<number, number> = {};
    yearlyCheckIns.forEach((ci) => {
      habitCounts[ci.habitId] = (habitCounts[ci.habitId] || 0) + 1;
    });
    let topHabitId = -1;
    let maxCount = 0;
    for (const [id, count] of Object.entries(habitCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topHabitId = parseInt(id);
      }
    }
    const topHabit = habits.find((h) => h.id === topHabitId);

    // 3. Busiest Day
    let busiestDateStr = "";
    let maxGoals = 0;
    for (const [dateStr, goals] of Object.entries(allGoalsMetPerDay)) {
      if (dateStr.startsWith(selectedYear.toString()) && goals > maxGoals) {
        maxGoals = goals;
        busiestDateStr = dateStr;
      }
    }
    let formattedBusiestDay = t("profile.none");
    if (busiestDateStr) {
        const [y, m, d] = busiestDateStr.split("-");
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        formattedBusiestDay = dateObj.toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { month: "short", day: "numeric" });
      }

    // 4. Longest Streak
    let currentYearStreak = 0;
    let maxYearStreak = 0;
    const startDate = new Date(selectedYear, 0, 1);
    const isCurrentYear = selectedYear === new Date().getFullYear();
    const endDate = isCurrentYear ? new Date() : new Date(selectedYear, 11, 31);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dStr = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
      ].join("-");
      if ((allGoalsMetPerDay[dStr] || 0) > 0) {
        currentYearStreak++;
        maxYearStreak = Math.max(maxYearStreak, currentYearStreak);
      } else {
        currentYearStreak = 0;
      }
    }

    // 5. Active Days & Completion Rate
    const daysPassed = isCurrentYear
      ? Math.floor((new Date().getTime() - new Date(selectedYear, 0, 1).getTime()) / (1000 * 60 * 60 * 24)) + 1
      : (selectedYear % 4 === 0 && selectedYear % 100 > 0) || selectedYear % 400 === 0
      ? 366
      : 365;

    const completionRate = daysPassed > 0 ? Math.round((activeDays / daysPassed) * 100) : 0;

    return {
      totalCheckIns,
      topHabit: topHabit ? { name: topHabit.name, color: topHabit.color, count: maxCount } : null,
      busiestDay: { date: formattedBusiestDay, count: maxGoals },
      maxStreak: maxYearStreak,
      completionRate,
      daysPassed,
    };
  }, [checkIns, habits, allGoalsMetPerDay, selectedYear, activeDays, i18n.language, t]);

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
              {profile.statusEmoji ? (
                <Text className="text-sm mr-1">
                  {profile.statusEmoji}
                </Text>
              ) : null}
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
              {t("profile.habitsCount")}
            </Text>
          </Text>
        </View>
        <View>
          <Text className="font-bold text-github-lightText dark:text-github-darkText text-base">
            {currentStreak}{" "}
            <Text className="font-normal text-github-lightMuted dark:text-github-darkMuted">
              {t("profile.dayStreak")}
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
            {t("profile.editProfile")}
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
            {activeDays} {formatUnit(activeDays, t("units.day"))} {t("profile.withGoalsMet")}
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

      {/* Statistics Section */}
      <View className="mb-6">
        <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-3">
          {t("profile.statistics")} ({selectedYear})
        </Text>
        
        <View className="flex-row flex-wrap justify-between">
          {/* Full Width: Total Commits */}
          <StatCard
            fullWidth
            title={t("profile.totalCommits")}
            value={yearlyStats.totalCheckIns.toString()}
            subtitle={`${yearlyStats.totalCheckIns} ${t("profile.commitsIn")} ${selectedYear}`}
            iconName="git-commit"
            iconColor={color.text}
          />
          
          {/* Half Width: Longest Streak */}
          <StatCard
            title={t("profile.longestStreak")}
            value={`${yearlyStats.maxStreak} ${formatUnit(yearlyStats.maxStreak, t("units.day"))}`}
            subtitle={t("profile.personalBest")}
            iconName="flame"
            iconColor="#e34c26"
          />

          {/* Half Width: Busiest Day */}
          <StatCard
            title={t("profile.busiestDay")}
            value={yearlyStats.busiestDay.date}
            subtitle={yearlyStats.busiestDay.count > 0 ? `${yearlyStats.busiestDay.count} ${t("profile.goalsMet")}` : t("profile.noActivity")}
            iconName="calendar"
            iconColor={color.text}
          />

          {/* Half Width: Top Habit */}
          <StatCard
            title={t("profile.topHabit")}
            value={yearlyStats.topHabit ? yearlyStats.topHabit.name : t("profile.none")}
            subtitle={yearlyStats.topHabit ? `${yearlyStats.topHabit.count} ${formatUnit(yearlyStats.topHabit.count, t("units.commit"))}` : t("profile.noData")}
            iconName="repo"
            iconColor={yearlyStats.topHabit ? (yearlyStats.topHabit.color || color.primary) : color.muted}
          />

          {/* Half Width: Active Days / Completion Rate */}
          <StatCard
            title={t("profile.activeDays")}
            value={`${activeDays} ${formatUnit(activeDays, t("units.day"))}`}
            subtitle={t("profile.percentOfDays", { completionRate: yearlyStats.completionRate, daysPassed: yearlyStats.daysPassed })}
            iconName="check-circle"
            iconColor={color.primary}
          />
        </View>
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