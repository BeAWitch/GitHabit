import React from 'react';
import { View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Octicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';

export interface DropdownOption {
  label: string;
  value: string;
  rawLabel?: string;
}

interface FilterDropdownProps {
  data: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  fontSize?: number;
}

export function FilterDropdown({
  data,
  value,
  onChange,
  fontSize = 14,
}: FilterDropdownProps) {
  const { color } = useThemeColors();
  
  const selectedItem = data.find((item) => item.value === value);
  const selectedLabel = selectedItem ? selectedItem.label : '';

  return (
    <View className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md overflow-hidden">
      {/* Invisible placeholder for auto-sizing */}
      <View
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, minHeight: 28, opacity: 0 }}
        pointerEvents="none"
      >
        <Text style={{ fontSize, fontWeight: '600' }} numberOfLines={1}>{selectedLabel}</Text>
        <Octicons name="triangle-down" size={fontSize} style={{ marginLeft: 6 }} />
      </View>

      {/* Actual Dropdown */}
      <Dropdown
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, paddingHorizontal: 8, justifyContent: 'center' }}
        containerStyle={{
          backgroundColor: color.canvas,
          borderColor: color.border,
          borderWidth: 1,
          borderRadius: 6,
          minWidth: 120,
        }}
        selectedTextStyle={{ color: color.text, fontSize, fontWeight: '600' }}
        selectedTextProps={{ numberOfLines: 1 }}
        activeColor={color.border}
        itemTextStyle={{ color: color.text, fontSize }}
        data={data}
        maxHeight={300}
        labelField="label"
        valueField="value"
        value={value}
        onChange={(item) => onChange(item.value)}
        renderRightIcon={() => (
          <Octicons name="triangle-down" size={fontSize} color={color.text} style={{ marginLeft: 6 }} />
        )}
        renderItem={(item) => (
          <View className="flex-row items-center justify-between px-3 py-2">
            <Text style={{ color: color.text, fontSize }}>{item.label}</Text>
            {item.value === value && (
              <Octicons name="check" size={fontSize} color={color.primary} style={{ marginLeft: 8 }} />
            )}
          </View>
        )}
        autoScroll={false}
      />
    </View>
  );
}

