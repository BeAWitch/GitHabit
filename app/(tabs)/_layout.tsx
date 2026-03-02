import { useThemeColors } from "@/hooks/useThemeColors";
import { Octicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { HeaderMenu } from "@/components/HeaderMenu";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { color } = useThemeColors();
  const { t } = useTranslation();

  // Define GitHub palette colors for the tab bar
  const activeColor = color.active; // White in dark mode, dark grey in light mode
  const inactiveColor = color.muted; // Muted colors
  const bgColor = color.canvas; // Canvas color for tab bar
  const borderColor = color.border;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: () => <HeaderMenu />,
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
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 20,
        },
        headerTitleAlign: "left",
        headerTintColor: activeColor,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <Octicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: t('tabs.habits'),
          tabBarIcon: ({ color, size }) => (
            <Octicons name="repo" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <Octicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
