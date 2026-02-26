import { useThemeColors } from "@/hooks/useThemeColors";
import { Octicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const { color } = useThemeColors();

  // Define GitHub palette colors for the tab bar
  const activeColor = color.active; // White in dark mode, dark grey in light mode
  const inactiveColor = color.muted; // Muted colors
  const bgColor = color.canvas; // Canvas color for tab bar
  const borderColor = color.border;

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
          backgroundColor: color.bg,
          shadowColor: "transparent", // Remove shadow on iOS
          elevation: 0, // Remove shadow on Android
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        },
        headerTintColor: activeColor,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Octicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: "Habits",
          tabBarIcon: ({ color, size }) => (
            <Octicons name="repo" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Octicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
