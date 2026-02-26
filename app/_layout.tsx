import { Stack } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "nativewind";
import { useThemeStore } from "@/store/themeStore";
import { useThemeColors } from "@/hooks/useThemeColors";
import { initDB } from "@/db/database";

import "../css/global.css";

export default function RootLayout() {
  const { theme } = useThemeStore();
  const { setColorScheme } = useColorScheme();
  const { color } = useThemeColors();

  useEffect(() => {
    // Initialize the SQLite database on startup
    initDB();
  }, []);

  useEffect(() => {
    setColorScheme(theme === "auto" ? "system" : theme);
  }, [theme]);

  // Determine actual theme
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: color.bg,
        },
        headerTintColor: color.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        contentStyle: {
          backgroundColor: color.bg,
        },
      }}
    />
  );
}
