import { formatUnit } from "./unitFormatterUtil";
import i18n from "./i18n";

export const formatRelativeTime = (timestamp: number | null): string => {
  if (!timestamp) {
    return i18n.t("time.noCommits", { defaultValue: "No commits" });
  }

  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return i18n.t("time.justNow");
  if (minutes < 60) return `${minutes} ${formatUnit(hours, i18n.t("time.minute"))} ${i18n.t("time.ago")}`;
  if (hours < 24) return `${hours} ${formatUnit(hours, i18n.t("time.hour"))} ${i18n.t("time.ago")}`;
  if (days === 1) return i18n.t("time.yesterday");
  return `${days} ${formatUnit(days, i18n.t("time.day"))} ${i18n.t("time.ago")}`;
};

export const getDaysInYear = (year: number = new Date().getFullYear()): number => {
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return isLeapYear ? 366 : 365;
};