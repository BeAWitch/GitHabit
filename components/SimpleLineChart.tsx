import React, { useMemo, useState } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

export interface LineChartDataPoint {
  date: string;
  value: number;
}

interface SimpleLineChartProps {
  data: LineChartDataPoint[];
  height?: number;
  color?: string;
  lineWidth?: number;
}

export function SimpleLineChart({
  data,
  height = 160,
  color,
  lineWidth = 2,
}: SimpleLineChartProps) {
  const theme = useThemeColors();
  const chartColor = color || theme.color.primary;
  
  const [containerWidth, setContainerWidth] = useState(0);

  const { points, maxValue } = useMemo(() => {
    if (!data || data.length === 0) return { points: [], maxValue: 0 };
    
    let processedData = [...data];
    if (processedData.length === 1) {
      processedData = [
        { date: 'start', value: processedData[0].value },
        processedData[0],
      ];
    }

    const max = Math.max(...processedData.map((d) => d.value));
    return { points: processedData, maxValue: max > 0 ? max : 1 };
  }, [data]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const yAxisWidth = 28;
  const xAxisHeight = 22;
  const topPadding = 24; // Space for numbers above highest point
  const bottomPadding = 4;
  const leftPadding = 8;
  const rightPadding = 12; // Avoid cutoff on right

  const lines = useMemo(() => {
    if (points.length < 2 || containerWidth === 0) return null;

    const drawWidth = containerWidth - yAxisWidth - leftPadding - rightPadding;
    const drawHeight = height - xAxisHeight - topPadding - bottomPadding;
    
    const result = [];
    const stepX = drawWidth / (points.length - 1);

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const x = leftPadding + i * stepX;
      const y = topPadding + drawHeight - (p.value / maxValue) * drawHeight;

      // Draw line to next point
      if (i < points.length - 1) {
        const nextP = points[i + 1];
        const nextX = leftPadding + (i + 1) * stepX;
        const nextY = topPadding + drawHeight - (nextP.value / maxValue) * drawHeight;

        const xCenter = (x + nextX) / 2;
        const yCenter = (y + nextY) / 2;
        const length = Math.hypot(nextX - x, nextY - y);
        const angle = Math.atan2(nextY - y, nextX - x);

        result.push(
          <View
            key={`line-${i}`}
            style={{
              position: 'absolute',
              left: xCenter - length / 2,
              top: yCenter - lineWidth / 2,
              width: length,
              height: lineWidth,
              backgroundColor: chartColor,
              transform: [{ rotate: `${angle}rad` }],
            }}
          />
        );
      }

      // Draw point
      result.push(
        <View
          key={`pt-${i}`}
          style={{
            position: 'absolute',
            left: x - 3,
            top: y - 3,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: p.value > 0 ? chartColor : theme.color.muted,
          }}
        />
      );

      // Draw value text above the point (only if value > 0 to avoid clutter)
      if (p.value > 0) {
        result.push(
          <Text
            key={`val-${i}`}
            className="text-[9px] font-bold absolute text-center w-[24px]"
            style={{
              left: x - 12,
              top: y - 14,
              color: chartColor,
            }}
          >
            {p.value}
          </Text>
        );
      }
    }
    return result;
  }, [points, containerWidth, height, maxValue, chartColor, lineWidth, theme.color.muted]);

  const xAxisLabels = useMemo(() => {
    if (points.length < 2 || containerWidth === 0) return null;
    const drawWidth = containerWidth - yAxisWidth - leftPadding - rightPadding;
    const stepX = drawWidth / (points.length - 1);
    
    const labels = [];
    // Show ~5 labels evenly spaced
    const numLabels = 5;
    for (let i = 0; i < numLabels; i++) {
      const idx = Math.floor(i * (points.length - 1) / (numLabels - 1));
      const p = points[idx];
      if (!p) continue;
      
      const x = leftPadding + idx * stepX;
      const dateParts = p.date.split('-');
      const shortDate = dateParts.length === 3 ? `${dateParts[1]}/${dateParts[2]}` : p.date;
      
      labels.push(
        <Text
          key={`x-label-${i}`}
          className="text-[9px] text-github-lightMuted dark:text-github-darkMuted absolute text-center w-[40px]"
          style={{ left: x - 20, top: 6 }}
        >
          {shortDate}
        </Text>
      );
    }
    return labels;
  }, [points, containerWidth]);

  if (points.length === 0) {
    return (
      <View
        className="items-center justify-center border border-github-lightBorder dark:border-github-darkBorder rounded-md bg-github-lightCanvas dark:bg-github-darkCanvas"
        style={{ height }}
      >
        <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted">
          No activity in this period
        </Text>
      </View>
    );
  }

  const drawHeight = height - xAxisHeight - topPadding - bottomPadding;

  return (
    <View
      onLayout={handleLayout}
      className="border border-github-lightBorder dark:border-github-darkBorder rounded-md bg-github-lightCanvas dark:bg-github-darkCanvas overflow-hidden flex-row"
      style={{ height, width: '100%' }}
    >
      {/* Y-axis */}
      <View 
        style={{ width: yAxisWidth, paddingTop: topPadding - 6, paddingBottom: xAxisHeight + bottomPadding - 6 }} 
        className="justify-between items-end pr-1.5 border-r border-github-lightBorder/20 dark:border-github-darkBorder/20 z-10 bg-github-lightCanvas dark:bg-github-darkCanvas"
      >
        <Text className="text-[9px] text-github-lightMuted dark:text-github-darkMuted">{maxValue}</Text>
        <Text className="text-[9px] text-github-lightMuted dark:text-github-darkMuted">{Math.round(maxValue / 2)}</Text>
        <Text className="text-[9px] text-github-lightMuted dark:text-github-darkMuted">0</Text>
      </View>

      {/* Chart Area */}
      <View className="flex-1 relative">
        {/* Grid lines */}
        <View className="absolute inset-0 right-0 left-0" style={{ top: topPadding, bottom: xAxisHeight + bottomPadding }}>
           <View className="w-full border-b border-github-lightBorder dark:border-github-darkBorder opacity-10 absolute" style={{ top: 0 }} />
           <View className="w-full border-b border-github-lightBorder dark:border-github-darkBorder opacity-10 absolute" style={{ top: drawHeight / 2 }} />
           <View className="w-full border-b border-github-lightBorder dark:border-github-darkBorder opacity-10 absolute" style={{ top: drawHeight }} />
        </View>
        
        {/* Lines and points */}
        <View className="absolute inset-0 z-10">
          {lines}
        </View>

        {/* X-axis labels */}
        <View className="absolute bottom-0 left-0 right-0 border-t border-github-lightBorder/20 dark:border-github-darkBorder/20" style={{ height: xAxisHeight }}>
          {xAxisLabels}
        </View>
      </View>
    </View>
  );
}