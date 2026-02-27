import { useColorScheme } from "nativewind";

const tailwindConfig = require("../tailwind.config.js");
const githubColors = tailwindConfig?.theme?.extend?.colors?.github ?? {};

type HeatmapLevels = [string, string, string, string, string];

export type ThemeColors = {
  bg: string;
  canvas: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  link: string;
  success: string;
  danger: string;
  active: string;
  heatmap: HeatmapLevels;
};

const PALETTE: Record<"light" | "dark", ThemeColors> = {
  light: {
    bg: githubColors.lightBg,
    canvas: githubColors.lightCanvas,
    border: githubColors.lightBorder,
    text: githubColors.lightText,
    muted: githubColors.lightMuted,
    primary: githubColors.lightPrimary,
    link: githubColors.lightLink,
    success: githubColors.lightSuccess,
    danger: githubColors.lightDanger,
    active: githubColors.lightActive,
    heatmap: [
      githubColors.lightLevel0,
      githubColors.lightLevel1,
      githubColors.lightLevel2,
      githubColors.lightLevel3,
      githubColors.lightLevel4,
    ],
  },
  dark: {
    bg: githubColors.darkBg,
    canvas: githubColors.darkCanvas,
    border: githubColors.darkBorder,
    text: githubColors.darkText,
    muted: githubColors.darkMuted,
    primary: githubColors.darkPrimary,
    link: githubColors.darkLink,
    success: githubColors.darkSuccess,
    danger: githubColors.darkDanger,
    active: githubColors.darkActive,
    heatmap: [
      githubColors.darkLevel0,
      githubColors.darkLevel1,
      githubColors.darkLevel2,
      githubColors.darkLevel3,
      githubColors.darkLevel4,
    ],
  },
};

export const useThemeColors = () => {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";

  return {
    color: PALETTE[scheme],
  };
};
