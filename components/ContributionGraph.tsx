import React, { useMemo, useRef } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface ContributionGraphProps {
  contributions: Record<string, number>;
  days?: number;
}

export const ContributionGraph: React.FC<ContributionGraphProps> = ({ 
  contributions, 
  days = 365 
}) => {
  const { color } = useThemeColors();
  const scrollViewRef = useRef<ScrollView>(null);

  // Generate heatmap data grouped by columns (weeks)
  const columns = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allDays = [];
    
    // Calculate the start date
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (days - 1));
    
    // Find how many empty days to pad at the start so the first column starts on Sunday (0)
    const paddingDays = startDate.getDay();
    
    for (let i = 0; i < paddingDays; i++) {
      allDays.push({ dateString: '', count: -1, dayOfWeek: i });
    }

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateString = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
      ].join("-");
      allDays.push({ 
        dateString, 
        count: contributions[dateString] || 0,
        dayOfWeek: d.getDay()
      });
    }

    // Group by 7
    const cols = [];
    for (let i = 0; i < allDays.length; i += 7) {
      cols.push(allDays.slice(i, i + 7));
    }
    
    return cols;
  }, [contributions, days]);

  return (
    <View className="bg-github-lightBg dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md p-3">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingRight: 4 }}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        <View className="flex-row">
          {columns.map((col, colIdx) => (
            <View key={colIdx} className="flex-col mr-1">
              {col.map((day, rowIdx) => {
                if (day.count === -1) {
                  return <View key={`empty-${rowIdx}`} className="w-3 h-3 mb-1 bg-transparent" />; // Empty slot
                }
                
                const levels = color.heatmap;
                let levelIndex = 0;
                if (day.count === 1) levelIndex = 1;
                else if (day.count >= 2 && day.count <= 3) levelIndex = 2;
                else if (day.count >= 4 && day.count <= 5) levelIndex = 3;
                else if (day.count >= 6) levelIndex = 4;

                return (
                  <View
                    key={day.dateString}
                    className="w-3 h-3 rounded-[2px] mb-1"
                    style={{ backgroundColor: levels[levelIndex] }}
                  />
                );
              })}
            </View>
          ))}
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
              <View key={`legend-${i}`} className="w-3 h-3 rounded-[2px] mx-[1px]" style={{ backgroundColor: c }} />
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
