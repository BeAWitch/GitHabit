import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Octicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useHabitStore } from '@/store/habitStore';

interface CategoryManagerModalProps {
  visible: boolean;
  onClose: () => void;
}

const COLORS = [
  '#238636', // Green
  '#8250df', // Purple
  '#0969da', // Blue
  '#bf8700', // Yellow
  '#da3633', // Red
  '#ec6cb9', // Pink
  '#ff9e43', // Orange
  '#5a5a5a', // Gray
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const { color: themeColor } = useThemeColors();
  const { categories, addCategory, updateCategory, removeCategory, habits } = useHabitStore();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(COLORS[0]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');

  // Helper to validate HEX color to prevent broken React Native styles
  const isValidHex = (color: string) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
  };
  
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim(), newCategoryColor);
    setNewCategoryName('');
    setNewCategoryColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  };

  const startEditing = (id: number, name: string, color: string) => {
    setEditingId(id);
    setEditingName(name);
    setEditingColor(color);
  };

  const handleUpdateCategory = () => {
    if (editingId && editingName.trim()) {
      updateCategory(editingId, editingName.trim(), editingColor);
      setEditingId(null);
    }
  };

  const handleDeleteCategory = (id: number, name: string) => {
    // Check if category is in use
    const habitsUsingCategory = habits.filter(h => h.categoryId === id);
    if (habitsUsingCategory.length > 0) {
      Alert.alert(
        t('habitForm.cannotDeleteCategory'),
        t('habitForm.categoryInUse', { count: habitsUsingCategory.length }),
        [{ text: t('habitForm.ok') }]
      );
      return;
    }

    Alert.alert(
      t('habitForm.deleteCategoryTitle'),
      t('habitForm.deleteCategoryDesc', { name }),
      [
        { text: t('habitForm.cancel'), style: 'cancel' },
        { 
          text: t('habitForm.delete'), 
          style: 'destructive',
          onPress: () => removeCategory(id)
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center bg-black/50 p-4"
      >
        <View className="bg-github-lightBg dark:bg-github-darkBg rounded-lg border border-github-lightBorder dark:border-github-darkBorder max-h-[80%]">
          <View className="flex-row items-center justify-between p-4 border-b border-github-lightBorder dark:border-github-darkBorder">
            <Text className="text-lg font-semibold text-github-lightText dark:text-github-darkText">
              {t('habitForm.manageCategories')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Octicons name="x" size={20} color={themeColor.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4" keyboardShouldPersistTaps="handled">
            {categories.map((c) => (
              <View key={c.id} className="mb-4">
                {editingId === c.id ? (
                  <View className="flex-row items-center">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mr-2 max-w-[80px]">
                      <View className="flex-row gap-2 items-center px-1 py-1">
                        {COLORS.map((col) => (
                          <TouchableOpacity
                            key={col}
                            onPress={() => setEditingColor(col)}
                            className={`w-6 h-6 rounded-full border-2 ${editingColor === col ? 'border-github-lightText dark:border-github-darkText' : 'border-transparent'}`}
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </View>
                    </ScrollView>
                    <TextInput
                      className="w-20 bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-1 py-1 text-xs text-github-lightText dark:text-github-darkText text-center mr-2"
                      value={editingColor}
                      onChangeText={setEditingColor}
                      placeholder="#HEX"
                    />
                    <View
                      className="mr-2 border border-github-lightBorder dark:border-github-darkBorder"
                      style={{ 
                        backgroundColor: isValidHex(editingColor) ? editingColor : 'transparent',
                        width: 16,
                        height: 16,
                        borderRadius: 8
                      }}
                    />
                    <TextInput
                      className="flex-1 bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 text-github-lightText dark:text-github-darkText mr-2"
                      value={editingName}
                      onChangeText={setEditingName}
                      autoFocus
                      onSubmitEditing={handleUpdateCategory}
                    />
                    <TouchableOpacity onPress={handleUpdateCategory} className="p-2">
                      <Octicons name="check" size={20} color="#238636" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditingId(null)} className="p-2">
                      <Octicons name="x" size={20} color={themeColor.muted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: c.color }}
                      />
                      <Text className="text-base text-github-lightText dark:text-github-darkText flex-1">
                        {c.name}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <TouchableOpacity onPress={() => startEditing(c.id, c.name, c.color)} className="p-2">
                        <Octicons name="pencil" size={18} color={themeColor.muted} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteCategory(c.id, c.name)} className="p-2 ml-1">
                        <Octicons name="trash" size={18} color={themeColor.muted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}

            <View className="h-px bg-github-lightBorder dark:bg-github-darkBorder my-4" />

            <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-2">
              {t('habitForm.addCategory')}
            </Text>
            
            <View className="mb-4">
               <View className="flex-row items-center mb-3">
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 mr-2">
                   <View className="flex-row gap-3 items-center py-1">
                     {COLORS.map((col) => (
                       <TouchableOpacity
                         key={col}
                         onPress={() => setNewCategoryColor(col)}
                         className={`w-8 h-8 rounded-full border-2 ${newCategoryColor === col ? 'border-github-lightText dark:border-github-darkText' : 'border-transparent'}`}
                         style={{ backgroundColor: col }}
                       />
                     ))}
                   </View>
                 </ScrollView>
                 <TextInput
                   className="w-20 bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-2 py-1 text-xs text-github-lightText dark:text-github-darkText text-center"
                   value={newCategoryColor}
                   onChangeText={setNewCategoryColor}
                   placeholder="#HEX"
                 />
               </View>
              <View className="flex-row items-center">
                <View
                  className="mr-2 ml-1 border border-github-lightBorder dark:border-github-darkBorder"
                  style={{ 
                    backgroundColor: isValidHex(newCategoryColor) ? newCategoryColor : 'transparent',
                    width: 16,
                    height: 16,
                    borderRadius: 8
                  }}
                />
                <TextInput
                  className="flex-1 bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 text-github-lightText dark:text-github-darkText mr-2"
                  placeholder={t('habitForm.categoryName')}
                  placeholderTextColor={themeColor.muted}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  onSubmitEditing={handleAddCategory}
                />
                <TouchableOpacity
                  className={`px-4 py-2 rounded-md ${!newCategoryName.trim() ? 'opacity-50' : ''}`}
                  style={{ backgroundColor: themeColor.primary }}
                  disabled={!newCategoryName.trim()}
                  onPress={handleAddCategory}
                >
                  <Text className="font-bold text-white">{t('habitForm.add')}</Text>
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
