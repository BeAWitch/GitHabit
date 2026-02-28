import { formatUnit } from "./unitFormatterUtil";

export const formatRelativeTime = (timestamp: number | null): string => {
  if (!timestamp) {
    return "No commits";
  }

  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} ${formatUnit(hours, "minute")} ago`;
  if (hours < 24) return `${hours} ${formatUnit(hours, "hour")} ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

export const getDaysInCurrentYear = (): number => {
    const now = new Date();
    const year = now.getFullYear();

    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

    return isLeapYear ? 366 : 365;
}