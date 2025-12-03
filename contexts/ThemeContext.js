import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

const ThemeContext = createContext();

export const lightTheme = {
  primary: "#007bff",
  secondary: "#6c757d",
  success: "#28a745",
  danger: "#dc3545",
  warning: "#ffc107",
  info: "#17a2b8",
  background: "#ffffff",
  surface: "#f8f9fa",
  card: "#ffffff",
  text: "#333333",
  textSecondary: "#666666",
  textTertiary: "#999999",
  border: "#e0e0e0",
  shadow: "rgba(0, 0, 0, 0.1)",
  overlay: "rgba(0, 0, 0, 0.5)",
  highlight: "#e3f2fd",
  isDark: false,
};

export const darkTheme = {
  primary: "#4dabf7",
  secondary: "#adb5bd",
  success: "#51cf66",
  danger: "#ff6b6b",
  warning: "#ffd43b",
  info: "#3bc9db",
  background: "#1a1a1a",
  surface: "#2d2d2d",
  card: "#383838",
  text: "#ffffff",
  textSecondary: "#b8b8b8",
  textTertiary: "#888888",
  border: "#444444",
  shadow: "rgba(0, 0, 0, 0.3)",
  overlay: "rgba(0, 0, 0, 0.7)",
  highlight: "#1e3a5f",
  isDark: true,
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState("auto"); // 'light', 'dark', 'auto'
  const [theme, setTheme] = useState(lightTheme);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("@theme_mode");
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const updateTheme = useCallback(() => {
    let newTheme;
    if (themeMode === "auto") {
      newTheme = systemColorScheme === "dark" ? darkTheme : lightTheme;
    } else {
      newTheme = themeMode === "dark" ? darkTheme : lightTheme;
    }
    setTheme(newTheme);
  }, [themeMode, systemColorScheme]);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    updateTheme();
  }, [updateTheme]);

  const toggleTheme = async (mode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem("@theme_mode", mode);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
