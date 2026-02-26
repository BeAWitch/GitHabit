import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { Octicons } from '@expo/vector-icons';

export default function Home() {
  const { theme } = useThemeStore();

  return (
    <ScrollView className="flex-1 bg-github-lightBg dark:bg-github-darkBg p-4">
      {/* Search Header Placeholder */}
      <View className="flex-row items-center bg-github-lightCanvas dark:bg-github-darkCanvas p-2 rounded-md border border-github-lightBorder dark:border-github-darkBorder mb-6">
        <Octicons name="search" size={16} color={theme === 'dark' ? '#8b949e' : '#57606a'} className="mr-2" />
        <Text className="text-github-lightMuted dark:text-github-darkMuted ml-2 flex-1">Jump to...</Text>
      </View>

      {/* Pinned Repos (Pinned Habits) Section */}
      <View className="mb-6">
        <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-3">Pinned</Text>
        
        {/* Placeholder Pinned Habit Cards */}
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {/* Card 1 */}
          <View className="w-[48%] bg-github-lightBg dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder p-3 rounded-md">
            <View className="flex-row items-center mb-1">
              <Octicons name="repo" size={16} color={theme === 'dark' ? '#c9d1d9' : '#24292f'} className="mr-2" />
              <Text className="text-github-lightText dark:text-github-darkText font-semibold ml-2 text-sm" numberOfLines={1}>daily-reading</Text>
            </View>
            <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mb-3">Read 30 pages a day.</Text>
            
            {/* Quick Commit Button */}
            <TouchableOpacity className="bg-github-primaryLight dark:bg-github-primaryDark py-1 rounded-md mt-auto items-center">
              <Text className="text-white text-xs font-bold">Commit (Check-in)</Text>
            </TouchableOpacity>
          </View>

          {/* Card 2 */}
          <View className="w-[48%] bg-github-lightBg dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder p-3 rounded-md">
            <View className="flex-row items-center mb-1">
              <Octicons name="repo" size={16} color={theme === 'dark' ? '#c9d1d9' : '#24292f'} className="mr-2" />
              <Text className="text-github-lightText dark:text-github-darkText font-semibold ml-2 text-sm" numberOfLines={1}>workout-2024</Text>
            </View>
            <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mb-3">Gym or running.</Text>
            
            <TouchableOpacity className="bg-github-primaryLight dark:bg-github-primaryDark py-1 rounded-md mt-auto items-center">
              <Text className="text-white text-xs font-bold">Commit (Check-in)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Recent Activity (Timeline) */}
      <View>
        <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-3">Recent Activity</Text>
        {/* Placeholder Timeline Item */}
        <View className="flex-row items-start mb-4">
          <View className="mt-1 mr-3">
            <Octicons name="git-commit" size={16} color="#238636" />
          </View>
          <View className="flex-1 border-b border-github-lightBorder dark:border-github-darkBorder pb-3">
            <Text className="text-sm text-github-lightText dark:text-github-darkText">
              <Text className="font-semibold">You</Text> pushed 1 commit to <Text className="font-semibold">daily-reading</Text>
            </Text>
            <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mt-1">2 hours ago</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}