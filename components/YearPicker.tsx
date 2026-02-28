import React, { useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Octicons } from "@expo/vector-icons";
import { useThemeColors } from "@/hooks/useThemeColors";

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
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0, width: 0 });
  const buttonRef = useRef<View>(null);

  const openPicker = () => {
    requestAnimationFrame(() => {
      buttonRef.current?.measureInWindow((x, y, width, height) => {
        setDropdownPos({
          x: x,
          y: y + height + 8, // 8px gap below the button
          width: Math.max(80, width), // min width for dropdown
        });
        setIsPickerVisible(true);
      });
    });
  };

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        className="flex-row items-center bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder px-2 py-1 rounded-md"
        onPress={openPicker}
      >
        <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mr-1">
          {selectedYear}
        </Text>
        <Octicons name="chevron-down" size={14} color={color.muted} />
      </TouchableOpacity>

      <Modal
        visible={isPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsPickerVisible(false)}
          />
          <View
            className="absolute bg-github-lightCanvas dark:bg-github-darkCanvas rounded-md border border-github-lightBorder dark:border-github-darkBorder overflow-hidden"
            style={{
              top: dropdownPos.y,
              left: dropdownPos.x - (dropdownPos.width - 60), // Adjusting left so it aligns better rightwards if needed
              minWidth: dropdownPos.width,
              zIndex: 10,
            }}
          >
            <ScrollView className="max-h-48" bounces={false}>
              {availableYears.map((year) => (
                <TouchableOpacity
                  key={year}
                  className="flex-row items-center justify-between px-3 py-2"
                  onPress={() => {
                    onYearSelect(year);
                    setIsPickerVisible(false);
                  }}
                >
                  <Text className="text-sm text-github-lightText dark:text-github-darkText">
                    {year}
                  </Text>
                  {selectedYear === year && (
                    <Octicons name="check" size={14} color={color.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
