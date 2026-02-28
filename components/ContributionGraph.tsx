import { useThemeColors } from "@/hooks/useThemeColors";
import { getDaysInYear } from "@/utils/dateUtil";
import React, { useMemo, useRef } from "react";
import { ScrollView, Text, View } from "react-native";

interface ContributionGraphProps {
  contributions: Record<string, number>;
  endDate?: Date;
  days?: number;
  targetValue?: number;
  targetValues?: Record<string, number>;
}

export const ContributionGraph: React.FC<ContributionGraphProps> = ({
  contributions,
  endDate = new Date(),
  days = getDaysInYear(),
  targetValue,
  targetValues,
}) => {
  const { color } = useThemeColors();
  const scrollViewRef = useRef<ScrollView>(null);

  // Generate heatmap data grouped by columns (weeks)
  const { columns, months, maxCount } = useMemo(() => {
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const allDays = [];
    let currentMax = 0;

    // Calculate the start date
    const startDate = new Date(end);
    startDate.setDate(end.getDate() - (days - 1));

    // Find how many empty days to pad at the start so the first column starts on Sunday (0)
    const paddingDays = startDate.getDay();

    for (let i = 0; i < paddingDays; i++) {
      allDays.push({ dateString: "", count: -1, targetValue: undefined, dayOfWeek: i });
    }

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      const dateString = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
      ].join("-");
      const count = contributions[dateString] || 0;
      const dailyTarget = targetValues?.[dateString];
      if (count > currentMax) {
        currentMax = count;
      }
      allDays.push({
        dateString,
        count,
        targetValue: dailyTarget,
        dayOfWeek: d.getDay(),
      });
    }

    // Group by 7
    const cols = [];
    const months = [];

    for (let i = 0; i < allDays.length; i += 7) {
      const colDays = allDays.slice(i, i + 7);
      cols.push(colDays);

      // Check for month transitions
      // Find the first valid day in this column to see if a new month started
      // Or more specifically, look at the last day (Saturday) of the column to decide its month.
      // GitHub usually places the month label over the column that contains the first day of that month.
      const firstValidDay = colDays.find((d) => d.count !== -1);
      if (firstValidDay) {
        const d = new Date(firstValidDay.dateString);
        // Force English month abbreviations
        const monthName = d.toLocaleString("en-US", { month: "short" });

        // If it's the first column
        if (cols.length === 1) {
          months.push({ name: monthName, colIndex: cols.length - 1 });
        } else {
          // Check if this column contains the 1st of the month
          const containsFirstDay = colDays.some(
            (d) => d.count !== -1 && new Date(d.dateString).getDate() === 1,
          );

          if (containsFirstDay) {
            months.push({ name: monthName, colIndex: cols.length - 1 });
          }
        }
      }
    }

    return { columns: cols, months, maxCount: currentMax };
  }, [contributions, days, endDate, targetValues]);

  return (
    <View className="bg-github-lightBg dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md p-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 4 }}
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: false })
        }
      >
        <View className="flex-col">
          {/* Month labels row */}
          <View className="flex-row h-4 mb-1 relative">
            {months.map((month, i) => {
              // Calculate left position based on column index (16px per column: 12px width + 4px margin)
              // We'll use absolute positioning so they don't affect column layout and don't get squished
              return (
                <Text
                  key={`${month.name}-${i}`}
                  className="absolute text-[10px] text-github-lightMuted dark:text-github-darkMuted"
                  style={{ left: month.colIndex * 16 }}
                >
                  {month.name}
                </Text>
              );
            })}
          </View>

          {/* Heatmap grid */}
          <View className="flex-row">
            {columns.map((col, colIdx) => (
              <View key={colIdx} className="flex-col mr-1">
                {col.map((day, rowIdx) => {
                  if (day.count === -1) {
                    return (
                      <View
                        key={`empty-${rowIdx}`}
                        className="w-3 h-3 mb-1 bg-transparent"
                      />
                    ); // Empty slot
                  }

                  const levels = color.heatmap;
                  let levelIndex = 0;
                  let isTargetMet = false;

                  if (day.count > 0) {
                    const todayStr = new Date().toISOString().split('T')[0];
                    // Always use current targetValue for today, otherwise use historical if available
                    const activeTarget = (day.dateString === todayStr) ? (targetValue ?? day.targetValue) : (day.targetValue ?? targetValue);
                    if (activeTarget && activeTarget > 0) {
                      if (day.count >= activeTarget) {
                        levelIndex = 4;
                        isTargetMet = true;
                      } else {
                        const percentile = day.count / activeTarget;
                        if (percentile <= 0.33) levelIndex = 1;
                        else if (percentile <= 0.66) levelIndex = 2;
                        else levelIndex = 3;
                      }
                    } else {
                      if (maxCount <= 4) {
                        // If max count is very low, just map directly to levels (1->1, 2->2, etc.)
                        levelIndex = Math.min(4, day.count);
                      } else {
                        // Dynamic scaling for higher counts. Level 1 is always > 0.
                        // The remaining range (maxCount - 1) is divided into 3 buckets (levels 2, 3, 4)
                        const percentile = (day.count - 1) / (maxCount - 1);
                        if (percentile === 0) {
                          levelIndex = 1;
                        } else if (percentile <= 0.33) {
                          levelIndex = 2;
                        } else if (percentile <= 0.66) {
                          levelIndex = 3;
                        } else {
                          levelIndex = 4;
                        }
                      }
                    }
                  }

                  return (
                    <View
                      key={day.dateString}
                      className="w-3 h-3 rounded-[2px] mb-1 items-center justify-center overflow-hidden"
                      style={{ backgroundColor: levels[levelIndex] }}
                    >
                      {isTargetMet && (
                        <Text
                          style={{
                            fontSize: 8,
                            color: "#ffffff",
                            fontWeight: "bold",
                            lineHeight: 10,
                            textAlign: "center",
                          }}
                        >
                          ✓
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
          {days} days
        </Text>
        <View className="flex-row items-center">
          <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mr-1">
            Less
          </Text>
          <View className="flex-row">
            {color.heatmap.map((c, i) => (
              <View
                key={`legend-${i}`}
                className="w-3 h-3 rounded-[2px] mx-[1px]"
                style={{ backgroundColor: c }}
              />
            ))}
          </View>
          <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted ml-1">
            More
          </Text>
        </View>
      </View>
    </View>
  );
};
