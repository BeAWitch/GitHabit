import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, Text, Pressable } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

export const HeaderMenu = () => {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const { color } = useThemeColors();

  const handleNavigate = (path: any) => {
    setVisible(false);
    router.push(path);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} className="px-4 py-2">
        <Octicons name="kebab-horizontal" size={20} color={color.text} />
      </TouchableOpacity>
      
      <Modal visible={visible} transparent animationType="fade">
        <Pressable 
          className="flex-1 bg-black/10 dark:bg-black/30" 
          onPress={() => setVisible(false)}
        >
          <View
            className="absolute top-14 right-4 w-48 rounded-md border shadow-sm bg-github-lightBg dark:bg-github-darkCanvas border-github-lightBorder dark:border-github-darkBorder"
          >
            <TouchableOpacity
              className="px-4 py-3 flex-row items-center"
              onPress={() => handleNavigate('/settings')}
            >
              <Octicons name="gear" size={16} color={color.text} className="mr-3" />
              <Text className="text-github-lightText dark:text-github-darkText font-medium text-base ml-2">
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};