import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "@/hooks/useThemeColors";

type SegmentedOption = {
  label: string;
  value: string;
};

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
}

const SLIDER_GAP = 4;
const SLIDER_ANIMATION_MS = 180;
const SLIDER_HEIGHT_PERCENT = "85%";

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
}) => {
  const { color } = useThemeColors();
  const [trackWidth, setTrackWidth] = useState(0);
  const sliderAnim = useRef(new Animated.Value(0)).current;

  const selectedIndex = useMemo(
    () => Math.max(0, options.findIndex((option) => option.value === value)),
    [options, value]
  );

  useEffect(() => {
    Animated.timing(sliderAnim, {
      toValue: selectedIndex,
      duration: SLIDER_ANIMATION_MS,
      useNativeDriver: true,
    }).start();
  }, [selectedIndex, sliderAnim]);

  const optionWidth = options.length > 0 ? trackWidth / options.length : 0;
  const sliderWidth = optionWidth > 0 ? optionWidth - SLIDER_GAP : 0;

  return (
    <View
      className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md overflow-hidden"
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 2,
          left: 2,
          height: SLIDER_HEIGHT_PERCENT,
          width: sliderWidth,
          borderRadius: 6,
          backgroundColor: color.border,
          transform: [
            {
              translateX: sliderAnim.interpolate({
                inputRange: [0, Math.max(1, options.length - 1)],
                outputRange: [0, Math.max(0, optionWidth * (options.length - 1))],
              }),
            },
          ],
        }}
      />
      <View className="flex-row">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            className="flex-1 py-2 items-center"
            onPress={() => onChange(option.value)}
          >
            <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText">
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
