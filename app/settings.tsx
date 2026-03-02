import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Octicons } from '@expo/vector-icons';
import { useThemeStore, ThemeMode } from '@/store/themeStore';
import { useLanguageStore, LanguageMode } from '@/store/languageStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const { theme, setTheme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const { color } = useThemeColors();
  const router = useRouter();
  const { t } = useTranslation();

  const ThemeOption = ({ mode, label, icon }: { mode: ThemeMode, label: string, icon: keyof typeof Octicons.glyphMap }) => (
    <TouchableOpacity
      className={`flex-row items-center justify-between p-4 border-b border-github-lightBorder dark:border-github-darkBorder ${
        theme === mode ? 'bg-github-lightCanvas dark:bg-github-darkCanvas' : 'bg-github-lightBg dark:bg-github-darkBg'
      }`}
      onPress={() => setTheme(mode)}
    >
      <View className="flex-row items-center">
        <Octicons name={icon as any} size={20} color={color.text} />
        <Text className="text-github-lightText dark:text-github-darkText text-base ml-4 font-medium">
          {label}
        </Text>
      </View>
      {theme === mode && <Octicons name="check" size={20} color={color.primary} />}
    </TouchableOpacity>
  );

  const LanguageOption = ({ mode, label, icon }: { mode: LanguageMode, label: string, icon: keyof typeof Octicons.glyphMap }) => (
    <TouchableOpacity
      className={`flex-row items-center justify-between p-4 border-b border-github-lightBorder dark:border-github-darkBorder ${
        language === mode ? 'bg-github-lightCanvas dark:bg-github-darkCanvas' : 'bg-github-lightBg dark:bg-github-darkBg'
      }`}
      onPress={() => setLanguage(mode)}
    >
      <View className="flex-row items-center">
        <Octicons name={icon as any} size={20} color={color.text} />
        <Text className="text-github-lightText dark:text-github-darkText text-base ml-4 font-medium">
          {label}
        </Text>
      </View>
      {language === mode && <Octicons name="check" size={20} color={color.primary} />}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-github-lightBg dark:bg-github-darkCanvas p-4">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between border-b border-github-lightBorder dark:border-github-darkBorder h-20 mb-4">
        <TouchableOpacity
          className="flex-row items-center mt-4"
          onPress={() => router.back()}
        >
          <Octicons name="chevron-left" size={18} color={color.text} />
          <Text className="text-xl font-semibold text-github-lightText dark:text-github-darkText ml-1">
            {t('tabs.settings')}
          </Text>
        </TouchableOpacity>
      </View>
      <Stack.Screen 
        options={{ 
          title: t('tabs.settings'),
          headerBackTitle: t('habit.cancel')
        }} 
      />
      
      <ScrollView className="flex-1">
        <View className="mt-2 mb-2 px-4">
          <Text className="text-sm font-semibold text-github-lightMuted dark:text-github-darkMuted uppercase tracking-wider">
            {t('settings.theme')}
          </Text>
        </View>
        
        <View className="border-t border-github-lightBorder dark:border-github-darkBorder">
          <ThemeOption mode="auto" label={t('settings.auto')} icon="device-desktop" />
          <ThemeOption mode="light" label={t('settings.light')} icon="sun" />
          <ThemeOption mode="dark" label={t('settings.dark')} icon="moon" />
        </View>

        <View className="mt-8 mb-2 px-4">
          <Text className="text-sm font-semibold text-github-lightMuted dark:text-github-darkMuted uppercase tracking-wider">
            {t('settings.language')}
          </Text>
        </View>
        
        <View className="border-t border-github-lightBorder dark:border-github-darkBorder">
          <LanguageOption mode="auto" label={t('settings.auto')} icon="globe" />
          <LanguageOption mode="en" label={t('settings.english')} icon="typography" />
          <LanguageOption mode="zh" label={t('settings.chinese')} icon="typography" />
        </View>

        <View className="mt-8 mb-2 px-4">
          <Text className="text-sm font-semibold text-github-lightMuted dark:text-github-darkMuted uppercase tracking-wider">
            {t('settings.about')}
          </Text>
        </View>

        <View className="border-t border-github-lightBorder dark:border-github-darkBorder border-b bg-github-lightBg dark:bg-github-darkBg">
          <View className="flex-row items-center justify-between p-4">
            <Text className="text-github-lightText dark:text-github-darkText text-base font-medium">
              {t('settings.version')}
            </Text>
            <Text className="text-github-lightMuted dark:text-github-darkMuted text-base">
              1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}