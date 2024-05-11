import colors from "tailwindcss/colors";
import { CustomThemeConfig } from "tailwindcss/types/config";

export const theme = {
  fontFamily: {
    sans: ['"Josefin Sans"', "sans-serif"],
    serif: ['"PT Serif"', "serif"],
  },
  fontSize: {
    xs: ["12px", "16px"],
    sm: ["14px", "19px"],
    md: ["16px", "22px"],
    lg: ["18px", "25px"], // Assuming 'large' font size
    xl: ["20px", "27px"],
    "2xl": ["24px", "33px"],
    "3xl": ["30px", "41px"],
    "4xl": ["36px", "49px"],
  },
  colors: {
    brand: {
      50: "#F7F5FF",
      100: "#E6E4FF",
      200: "#D0CCFF",
      300: "#A3A0FB",
      400: "#9d26e3",
      500: "#6D28A1",
      600: "#5A1F8C",
      700: "#4A1A7A",
      800: "#3A145F",
      900: "#2C1047",
      950: "#1E0B2F",
    },
    white: "#ffffff",
    surface: "white",
    fg: {
      default: colors.gray["800"],
      muted: colors.gray["500"],
      subtle: colors.gray["300"],
      surface: colors.white,
      accent: colors.purple["600"],
      success: colors.green["600"],
      danger: colors.red["600"],
      attention: colors.orange["600"],
      info: colors.blue["600"],
    },
    bg: {
      "accent-emphasis": colors.purple["500"],
      accent: colors.purple["100"],
      emphasis: colors.gray["800"],
      inset: colors.gray["300"],
      subtle: colors.gray["100"],
      default: "#ffffff",
      success: colors.green["100"],
      ["success-emphasis"]: colors.green["500"],
      info: colors.blue["100"],
      ["info-emphasis"]: colors.blue["500"],
      attention: colors.orange["100"],
      ["attention-emphasis"]: colors.orange["500"],
      danger: colors.red["100"],
      ["danger-emphasis"]: colors.red["500"],
    },
    border: {
      default: colors.gray["200"],
      muted: colors.gray["100"],
      subtle: colors.gray["50"],
      accent: colors.purple["200"],
      ["accent-emphasis"]: colors.purple["500"],
      success: colors.green["200"],
      ["success-emphasis"]: colors.green["500"],
      info: colors.blue["200"],
      ["info-emphasis"]: colors.blue["500"],
      attention: colors.orange["200"],
      ["attention-emphasis"]: colors.orange["500"],
      danger: colors.red["200"],
      ["danger-emphasis"]: colors.red["500"],
    },
  },
  borderRadius: {
    sm: "2px", // Assuming small radius
    DEFAULT: "4px", // Assuming default radius
    md: "6px", // Assuming medium radius
    lg: "8px", // Assuming large radius
    xl: "12px", // Assuming extra large radius
    "2xl": "16px", // Assuming 2x large radius
    full: "9999px", // Assuming full radius
  },
  spacing: {
    xs: "0.125rem", // Assuming extra small spacing
    sm: "0.25rem", // Assuming small spacing
    md: "0.375rem", // Assuming medium spacing
    lg: "0.5rem", // Assuming large spacing
    xl: "1rem", // Assuming extra large spacing
    "2xl": "2rem", // Assuming 2x large spacing
    "3xl": "4rem", // Assuming 3x large spacing
  },
} satisfies Partial<CustomThemeConfig>;
