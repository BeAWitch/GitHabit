import { useEffect } from "react";
import { Link, useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useHabitStore } from "@/store/habitStore";
import { formatRelativeTime } from "@/utils/dateFormatter";
import { Octicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const { color } = useThemeColors();
  const router = useRouter();
  
  const { habits, checkIns, fetchData, commitCheckIn, fetchHabitDetail } = useHabitStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pinnedHabits = habits.slice(0, 4); // Just mock "pinned" by taking first 4
  const recentActivity = checkIns.slice(0, 10);

  return (
    <ScrollView className="flex-1 bg-github-lightBg dark:bg-github-darkBg p-4">
      {/* Search Header Placeholder */}
      <View className="flex-row items-center bg-github-lightCanvas dark:bg-github-darkCanvas p-2 rounded-md border border-github-lightBorder dark:border-github-darkBorder mb-6">
        <Octicons
          name="search"
          size={16}
          color={color.muted}
          className="mr-2"
        />
        <Text className="text-github-lightMuted dark:text-github-darkMuted ml-2 flex-1">
          Jump to...
        </Text>
      </View>

      {/* Pinned Habits Section */}
      <View className="mb-6">
        <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-3">
          Pinned
        </Text>

        {pinnedHabits.length === 0 ? (
          <View className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder p-4 rounded-md items-center">
            <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted mb-2">
              No Habits yet.
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
                    <Link href={`/habit/${habit.id}`} asChild onPress={() => fetchHabitDetail(habit.id)}>
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
                  <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mb-3 h-8" numberOfLines={2}>
                    {habit.description || "No description"}
                  </Text>
                </View>

                {/* Quick Commit Button */}
                <TouchableOpacity
                  className="py-1 rounded-md items-center"
                  style={{ backgroundColor: color.primary }}
                  onPress={() => commitCheckIn(habit.id, "Quick commit", 1)}
                >
                  <Text className="text-white text-xs font-bold">
                    Commit
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Recent Activity (Timeline) */}
      <View>
        <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-3">
          Recent Activity
        </Text>
        
        {recentActivity.length === 0 ? (
          <View className="p-4 border border-github-lightBorder dark:border-github-darkBorder rounded-md">
            <Text className="text-sm text-center text-github-lightMuted dark:text-github-darkMuted">
              No recent commits. Time to get to work!
            </Text>
          </View>
        ) : (
          recentActivity.map((checkIn, index) => {
            const habit = habits.find(h => h.id === checkIn.habitId);
            return (
              <View key={checkIn.id} className="flex-row items-start mb-4">
                <View className="mt-1 mr-3">
                  <Octicons name="git-commit" size={16} color={color.success} />
                </View>
                <View className={`flex-1 ${index !== recentActivity.length - 1 ? 'border-b border-github-lightBorder dark:border-github-darkBorder pb-3' : ''}`}>
                  <Text className="text-sm text-github-lightText dark:text-github-darkText">
                    <Text className="font-semibold">You</Text> committed {checkIn.value} {habit?.unitLabel || 'time'} to{" "}
                    <Link href={`/habit/${checkIn.habitId}`} asChild onPress={() => fetchHabitDetail(checkIn.habitId)}>
                      <Text className="font-semibold" style={{ color: color.link }}>
                        {habit?.name || `repo-${checkIn.habitId}`}
                      </Text>
                    </Link>
                  </Text>
                  {checkIn.message !== "Quick commit" && checkIn.message !== "" && (
                    <Text className="text-xs text-github-lightText dark:text-github-darkText mt-1">
                      &quot;{checkIn.message}&quot;
                    </Text>
                  )}
                  <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mt-1">
                    {formatRelativeTime(checkIn.timestamp)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
      <View className="h-10" />
    </ScrollView>
  );
}
