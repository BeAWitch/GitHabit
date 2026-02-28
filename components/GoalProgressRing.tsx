import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  Easing,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useThemeColors } from "@/hooks/useThemeColors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface GoalProgressRingProps {
  currentValue: number;
  targetValue: number;
  size?: number;
  strokeWidth?: number;
}

export const GoalProgressRing: React.FC<GoalProgressRingProps> = ({
  currentValue,
  targetValue,
  size = 32,
  strokeWidth = 6,
}) => {
  const { color } = useThemeColors();

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress =
    targetValue > 0 ? Math.min(Math.max(currentValue / targetValue, 0), 1) : 1;
  const isCompleted = currentValue >= targetValue;

  const progressValue = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });

    if (isCompleted) {
      checkScale.value = withSpring(1, {
        damping: 12,
        stiffness: 90,
        mass: 1,
      });
    } else {
      checkScale.value = withTiming(0, { duration: 200 });
    }
  }, [progress, isCompleted, progressValue, checkScale]);

  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset =
      circumference - progressValue.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  const checkAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkScale.value }],
      opacity: checkScale.value,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - checkScale.value,
      transform: [{ scale: 1 - checkScale.value * 0.5 }],
    };
  });

  const center = size / 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color.primary} // GitHub green
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedCircleProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>

      {/* Inner Content */}
      <View
        style={{
          position: "absolute",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Checkmark */}
        <Animated.View style={[{ position: "absolute" }, checkAnimatedStyle]}>
          <Svg
            width={size * 0.5}
            height={size * 0.5}
            viewBox="0 0 24 24"
            fill="none"
          >
            <Path
              d="M5 13l4 4L19 7"
              stroke={color.primary}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>

        {/* Text */}
        <Animated.View
          style={[
            { position: "absolute", alignItems: "center" },
            textAnimatedStyle,
          ]}
        >
          <Text
            className="text-github-lightText dark:text-github-darkText font-bold leading-tight"
            style={{ fontSize: size * 0.28 }}
          >
            {currentValue}
          </Text>
          <View className="h-[1px] w-6 bg-github-lightBorder dark:bg-github-darkBorder my-0.5" />
          <Text
            className="text-github-lightMuted dark:text-github-darkMuted font-semibold leading-tight"
            style={{ fontSize: size * 0.2 }}
          >
            {targetValue}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};
