import { formatUnit } from "./unitFormatterUtil";
import { useTranslation } from "react-i18next";

export const formatRelativeTime = (timestamp: number | null): string => {
  if (!timestamp) {
    return "No commits";
  }

  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  const { t } = useTranslation();

  if (minutes < 1) return t("time.justNow");
  if (minutes < 60) return `${minutes} ${formatUnit(hours, t("time.minute"))} ${t("time.ago")}`;
  if (hours < 24) return `${hours} ${formatUnit(hours, t("time.hour"))} ${t("time.ago")}`;
  if (days === 1) return t("time.yesterday");
  return `${days} ${formatUnit(days, t("time.day"))} ${t("time.ago")}`;
};

export const getDaysInYear = (year: number = new Date().getFullYear()): number => {
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return isLeapYear ? 366 : 365;
};