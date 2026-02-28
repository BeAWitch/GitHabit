import { getDaysInYear } from "@/utils/dateUtil";
import { useMemo, useState } from "react";

export function useYearFilter(checkIns: { dateString: string }[]) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);

    checkIns.forEach((ci) => {
      const year = parseInt(ci.dateString.substring(0, 4), 10);
      if (!isNaN(year)) {
        years.add(year);
      }
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [checkIns, currentYear]);

  const { graphDays, graphEndDate } = useMemo(() => {
    if (selectedYear === currentYear) {
      return {
        graphDays: getDaysInYear(),
        graphEndDate: new Date(),
      };
    } else {
      return {
        graphDays: getDaysInYear(selectedYear),
        graphEndDate: new Date(selectedYear, 11, 31), // Dec 31 of that year
      };
    }
  }, [selectedYear, currentYear]);

  return {
    selectedYear,
    setSelectedYear,
    availableYears,
    graphDays,
    graphEndDate,
  };
}
