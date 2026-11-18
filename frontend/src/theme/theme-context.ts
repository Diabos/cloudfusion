import { createContext } from "react";
import type { ColorMode } from "./ThemeContext";

export const ThemeContext = createContext<{
  mode: ColorMode;
  toggleMode: () => void;
} | null>(null);
