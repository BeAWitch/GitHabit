import React from "react";
import { Text, View } from "react-native";
import { Octicons } from "@expo/vector-icons";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Dropdown } from "react-native-element-dropdown";

interface YearPickerProps {
  selectedYear: number;
  availableYears: number[];
  onYearSelect: (year: number) => void;
}

export function YearPicker({
  selectedYear,
  availableYears,
  onYearSelect,
}: YearPickerProps) {
  const { color } = useThemeColors();

  const data = availableYears.map((year) => ({
    label: year.toString(),
    value: year.toString(),
  }));

  return (
    <View className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md overflow-hidden flex-row">
      {/* Invisible placeholder for auto-sizing */}
      <View
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, minHeight: 28, opacity: 0 }}
        pointerEvents="none"
      >
        <Text style={{ fontSize: 12, fontWeight: '600' }} numberOfLines={1}>{selectedYear.toString()}</Text>
        <Octicons name="chevron-down" size={12} style={{ marginLeft: 6 }} />
      </View>

      <Dropdown
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, paddingHorizontal: 8, justifyContent: 'center' }}
        containerStyle={{
          backgroundColor: color.canvas,
          borderColor: color.border,
          borderWidth: 1,
          borderRadius: 6,
          minWidth: 80,
        }}
        selectedTextStyle={{ color: color.text, fontSize: 12, fontWeight: "600" }}
        selectedTextProps={{ numberOfLines: 1 }}
        activeColor={color.border}
        itemTextStyle={{ color: color.text, fontSize: 12 }}
        data={data}
        maxHeight={300}
        labelField="label"
        valueField="value"
        value={selectedYear.toString()}
        onChange={(item) => {
          onYearSelect(parseInt(item.value, 10));
        }}
        renderRightIcon={() => (
          <Octicons name="chevron-down" size={12} color={color.text} style={{ marginLeft: 6 }} />
        )}
        renderItem={(item) => (
          <View className="flex-row items-center justify-between px-3 py-2">
            <Text style={{ color: color.text, fontSize: 12 }}>{item.label}</Text>
            {item.value === selectedYear.toString() && (
              <Octicons name="check" size={12} color={color.primary} style={{ marginLeft: 8 }} />
            )}
          </View>
        )}
        autoScroll={false}
      />
    </View>
  );
}
