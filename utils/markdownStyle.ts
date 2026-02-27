import type { ThemeColors } from "@/hooks/useThemeColors";

export const getMarkdownStyle = (color: ThemeColors) => ({
  body: { color: color.text, fontSize: 14, lineHeight: 20 },
  heading1: { color: color.text, fontSize: 20, marginTop: 6, marginBottom: 6 },
  heading2: { color: color.text, fontSize: 18, marginTop: 6, marginBottom: 6 },
  heading3: { color: color.text, fontSize: 16, marginTop: 6, marginBottom: 6 },
  heading4: { color: color.text, fontSize: 15, marginTop: 6, marginBottom: 6 },
  heading5: { color: color.text, fontSize: 14, marginTop: 6, marginBottom: 6 },
  heading6: { color: color.text, fontSize: 13, marginTop: 6, marginBottom: 6 },
  paragraph: { color: color.text, marginTop: 4, marginBottom: 4 },
  strong: { color: color.text, fontWeight: "700" as const},
  em: { color: color.text },
  list_item: { color: color.text, marginTop: 2 },
  bullet_list: { marginTop: 4, marginBottom: 4 },
  ordered_list: { marginTop: 4, marginBottom: 4 },
  code_inline: { backgroundColor: color.canvas, color: color.text },
  code_block: { backgroundColor: color.canvas, color: color.text, padding: 8 },
  fence: { backgroundColor: color.canvas, color: color.text, padding: 8 },
  link: { color: color.link },
});
