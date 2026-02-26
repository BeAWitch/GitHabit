import { Tabs } from 'expo-router';
import { Octicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/themeStore';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const { theme } = useThemeStore();
  const systemColorScheme = useColorScheme();
  
  const isDark = theme === "dark" || (theme === "auto" && systemColorScheme === "dark");
  
  // Define GitHub palette colors for the tab bar
  const activeColor = isDark ? "#ffffff" : "#24292f"; // White in dark mode, dark grey in light mode
  const inactiveColor = isDark ? "#8b949e" : "#57606a"; // Muted colors
  const bgColor = isDark ? "#161b22" : "#f6f8fa"; // Canvas color for tab bar
  const borderColor = isDark ? "#30363d" : "#d0d7de";

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopColor: borderColor,
        },
        headerStyle: {
          backgroundColor: isDark ? "#0d1117" : "#ffffff",
          shadowColor: 'transparent', // Remove shadow on iOS
          elevation: 0, // Remove shadow on Android
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        },
        headerTintColor: activeColor,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Octicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="repos"
        options={{
          title: 'Repositories', // Following GitHub metaphor for "Habits"
          tabBarIcon: ({ color, size }) => (
            <Octicons name="repo" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Octicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}