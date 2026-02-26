import { Stack } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "nativewind";
import { useThemeStore } from "@/store/themeStore";
import { initDB } from "@/db/database";

import "../css/global.css";

export default function RootLayout() {
  const { theme } = useThemeStore();
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    // Initialize the SQLite database on startup
    initDB();
  }, []);

  useEffect(() => {
    setColorScheme(theme === "auto" ? "system" : theme);
  }, [theme]);

  // Determine actual theme
  const isDark = colorScheme === "dark";

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: isDark ? "#0d1117" : "#ffffff",
        },
        headerTintColor: isDark ? "#c9d1d9" : "#24292f",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        contentStyle: {
          backgroundColor: isDark ? "#0d1117" : "#ffffff",
        },
      }}
    />
  );
}
