import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useThemeStore } from '@/store/themeStore';

export default function Profile() {
  const { theme, setTheme } = useThemeStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView className="flex-1 bg-github-lightBg dark:bg-github-darkBg p-4">
      {/* Profile Header */}
      <View className="flex-row items-center mb-6">
        <Image 
          source={{ uri: 'https://avatars.githubusercontent.com/u/1?v=4' }} // Placeholder octocat
          className="w-16 h-16 rounded-full border border-github-lightBorder dark:border-github-darkBorder mr-4"
        />
        <View className="flex-1">
          <Text className="text-xl font-bold text-github-lightText dark:text-github-darkText">Developer</Text>
          <Text className="text-base text-github-lightMuted dark:text-github-darkMuted mb-1">super-coder</Text>
          {/* Status Placeholder */}
          <View className="flex-row items-center">
             <Octicons name="smiley" size={14} color={isDark ? '#8b949e' : '#57606a'} className="mr-1" />
             <Text className="text-xs text-github-lightText dark:text-github-darkText">Building habits...</Text>
          </View>
        </View>
      </View>

      {/* Stats Overview */}
      <View className="flex-row items-center mb-6">
        <View className="mr-6">
          <Text className="font-bold text-github-lightText dark:text-github-darkText text-base">42 <Text className="font-normal text-github-lightMuted dark:text-github-darkMuted">followers</Text></Text>
        </View>
        <View>
          <Text className="font-bold text-github-lightText dark:text-github-darkText text-base">12 <Text className="font-normal text-github-lightMuted dark:text-github-darkMuted">following</Text></Text>
        </View>
      </View>

      {/* Edit Profile / Settings Buttons */}
      <View className="flex-row space-x-3 mb-6">
        <TouchableOpacity className="flex-1 bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder py-2 rounded-md items-center mr-2">
           <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText">Edit profile</Text>
        </TouchableOpacity>
        {/* Quick Theme Toggle for demonstration */}
        <TouchableOpacity 
          className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder py-2 px-3 rounded-md items-center"
          onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
           <Octicons name={theme === 'dark' ? 'sun' : 'moon'} size={16} color={isDark ? '#c9d1d9' : '#24292f'} />
        </TouchableOpacity>
      </View>

      {/* Contribution Graph Section */}
      <View className="mb-6">
        <Text className="text-base font-semibold text-github-lightText dark:text-github-darkText mb-3">
          1,245 contributions in the last year
        </Text>
        
        {/* Heatmap Placeholder Box */}
        <View className="bg-github-lightBg dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md p-3">
           {/* Mock Heatmap Matrix */}
           <View className="flex-row flex-wrap gap-1">
             {/* Render some fake squares */}
             {Array.from({ length: 42 }).map((_, i) => {
               // Random color level for placeholder
               const levels = [
                 isDark ? 'bg-[#161b22]' : 'bg-[#ebedf0]', // L0
                 isDark ? 'bg-[#0e4429]' : 'bg-[#9be9a8]', // L1
                 isDark ? 'bg-[#006d32]' : 'bg-[#40c463]', // L2
                 isDark ? 'bg-[#26a641]' : 'bg-[#30a14e]', // L3
                 isDark ? 'bg-[#39d353]' : 'bg-[#216e39]', // L4
               ];
               const randomLevel = levels[Math.floor(Math.random() * levels.length)];
               return (
                 <View key={i} className={`w-3 h-3 rounded-sm ${randomLevel}`} />
               );
             })}
           </View>
           <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mt-3 text-right">
             Less to More (mock data)
           </Text>
        </View>
      </View>

      {/* Organizations / Pinned Placeholder */}
      <View>
        <Text className="text-base font-semibold text-github-lightText dark:text-github-darkText mb-3">Organizations</Text>
        <View className="flex-row">
          <View className="w-8 h-8 rounded-md bg-purple-500 mr-2" />
          <View className="w-8 h-8 rounded-md bg-blue-500 mr-2" />
          <View className="w-8 h-8 rounded-md bg-green-500" />
        </View>
      </View>
    </ScrollView>
  );
}
