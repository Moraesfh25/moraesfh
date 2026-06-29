import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type AccentColor = "green" | "blue" | "purple" | "red" | "gold";
export type InterfaceScale = "90%" | "100%" | "110%";
export type InterfaceDensity = "compact" | "standard";
export type Language = "pt" | "en" | "es";
export type Currency = "BRL" | "USD" | "EUR";
export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY";

export interface UserPreferences {
  theme: ThemeMode;
  accentColor: AccentColor;
  glassIntensity: number; // 0 to 100
  interfaceScale: InterfaceScale;
  interfaceDensity: InterfaceDensity;
  animationsEnabled: boolean;
  language: Language;
  currency: Currency;
  dateFormat: DateFormat;
  notificationsEnabled: boolean;
}

interface ThemeContextType {
  preferences: UserPreferences;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  setGlassIntensity: (intensity: number) => void;
  setInterfaceScale: (scale: InterfaceScale) => void;
  setInterfaceDensity: (density: InterfaceDensity) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  setDateFormat: (format: DateFormat) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "dark",
  accentColor: "green",
  glassIntensity: 20,
  interfaceScale: "100%",
  interfaceDensity: "standard",
  animationsEnabled: true,
  language: "pt",
  currency: "BRL",
  dateFormat: "DD/MM/YYYY",
  notificationsEnabled: true,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem("betvision_preferences");
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error("Error parsing stored preferences", e);
    }
    return DEFAULT_PREFERENCES;
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  // Helper to update specific preference and save to localStorage
  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem("betvision_preferences", JSON.stringify(updated));
      
      // Also try to sync to the logged-in user profile if it exists
      try {
        const storedUser = localStorage.getItem("betvision_user");
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          userObj.preferences = updated;
          localStorage.setItem("betvision_user", JSON.stringify(userObj));
        }
      } catch (e) {
        console.error("Failed to sync preferences to user profile", e);
      }
      
      return updated;
    });
  };

  const setTheme = (theme: ThemeMode) => updatePreference("theme", theme);
  const setAccentColor = (color: AccentColor) => updatePreference("accentColor", color);
  const setGlassIntensity = (intensity: number) => updatePreference("glassIntensity", intensity);
  const setInterfaceScale = (scale: InterfaceScale) => updatePreference("interfaceScale", scale);
  const setInterfaceDensity = (density: InterfaceDensity) => updatePreference("interfaceDensity", density);
  const setAnimationsEnabled = (enabled: boolean) => updatePreference("animationsEnabled", enabled);
  const setLanguage = (lang: Language) => updatePreference("language", lang);
  const setCurrency = (curr: Currency) => updatePreference("currency", curr);
  const setDateFormat = (format: DateFormat) => updatePreference("dateFormat", format);
  const setNotificationsEnabled = (enabled: boolean) => updatePreference("notificationsEnabled", enabled);

  const resetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.setItem("betvision_preferences", JSON.stringify(DEFAULT_PREFERENCES));
  };

  // Sync profile preferences on startup or when betvision_user changes
  useEffect(() => {
    const handleUserChanged = () => {
      try {
        const storedUser = localStorage.getItem("betvision_user");
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          if (userObj.preferences) {
            setPreferences(userObj.preferences);
          }
        }
      } catch (e) {
        console.error("Failed to load synced user preferences", e);
      }
    };

    handleUserChanged();
    window.addEventListener("storage", handleUserChanged);
    return () => window.removeEventListener("storage", handleUserChanged);
  }, []);

  // Update theme classes, colors, glassmorphism, fonts, and animation rules on root elements
  useEffect(() => {
    const root = document.documentElement;
    const {
      theme,
      accentColor,
      glassIntensity,
      interfaceScale,
      interfaceDensity,
      animationsEnabled,
    } = preferences;

    // 1. Resolve light/dark theme
    let currentTheme: "light" | "dark" = "dark";
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      currentTheme = systemTheme;
    } else {
      currentTheme = theme;
    }
    setResolvedTheme(currentTheme);

    // Set light/dark class
    if (currentTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    // 2. Set Accent Color hex variables (for mapping green-500 references)
    // Accent Hex Map
    const accentColors = {
      green: {
        500: "#16A34A",
        400: "#22C55E",
        600: "#15803D",
        hover: "#15803D",
        bgLight: "rgba(22, 163, 74, 0.1)",
        bgDark: "rgba(22, 163, 74, 0.15)",
        border: "rgba(22, 163, 74, 0.3)",
      },
      blue: {
        500: "#2563EB",
        400: "#60A5FA",
        600: "#1D4ED8",
        hover: "#1D4ED8",
        bgLight: "rgba(37, 99, 235, 0.1)",
        bgDark: "rgba(37, 99, 235, 0.15)",
        border: "rgba(37, 99, 235, 0.3)",
      },
      purple: {
        500: "#7C3AED",
        400: "#A78BFA",
        600: "#6D28D9",
        hover: "#6D28D9",
        bgLight: "rgba(124, 58, 237, 0.1)",
        bgDark: "rgba(124, 58, 237, 0.15)",
        border: "rgba(124, 58, 237, 0.3)",
      },
      red: {
        500: "#DC2626",
        400: "#F87171",
        600: "#B91C1C",
        hover: "#B91C1C",
        bgLight: "rgba(220, 38, 38, 0.1)",
        bgDark: "rgba(220, 38, 38, 0.15)",
        border: "rgba(220, 38, 38, 0.3)",
      },
      gold: {
        500: "#D97706",
        400: "#FBBF24",
        600: "#B45309",
        hover: "#B45309",
        bgLight: "rgba(217, 119, 6, 0.1)",
        bgDark: "rgba(217, 119, 6, 0.15)",
        border: "rgba(217, 119, 6, 0.3)",
      },
    };

    const activeAccent = accentColors[accentColor] || accentColors.green;
    root.style.setProperty("--accent-primary", activeAccent[500]);
    root.style.setProperty("--accent-primary-hover", activeAccent[600]);
    root.style.setProperty("--accent-400", activeAccent[400]);
    root.style.setProperty("--accent-500", activeAccent[500]);
    root.style.setProperty("--accent-600", activeAccent[600]);
    root.style.setProperty("--accent-bg", currentTheme === "dark" ? activeAccent.bgDark : activeAccent.bgLight);
    root.style.setProperty("--accent-border", activeAccent.border);

    // 3. Set Glassmorphism transparency parameters
    const opacityValue = (glassIntensity / 100).toFixed(2);
    const blurValue = (glassIntensity * 0.15).toFixed(1) + "px";
    root.style.setProperty("--glass-bg-opacity", opacityValue);
    root.style.setProperty("--glass-blur-radius", blurValue);

    // 4. Set Interface Scale (rem base sizing)
    if (interfaceScale === "90%") {
      root.style.fontSize = "14px";
    } else if (interfaceScale === "110%") {
      root.style.fontSize = "18px";
    } else {
      root.style.fontSize = "16px";
    }

    // 5. Set Density Classes
    if (interfaceDensity === "compact") {
      root.classList.add("density-compact");
      root.classList.remove("density-standard");
      root.style.setProperty("--density-padding", "0.5rem");
      root.style.setProperty("--density-gap", "0.5rem");
    } else {
      root.classList.add("density-standard");
      root.classList.remove("density-compact");
      root.style.setProperty("--density-padding", "1rem");
      root.style.setProperty("--density-gap", "1rem");
    }

    // 6. Handle Global Animations Toggle (Transition Override style block)
    let transitionStyleEl = document.getElementById("betvision-transitions-override");
    if (!transitionStyleEl) {
      transitionStyleEl = document.createElement("style");
      transitionStyleEl.id = "betvision-transitions-override";
      document.head.appendChild(transitionStyleEl);
    }

    if (!animationsEnabled) {
      transitionStyleEl.innerHTML = `
        *, *::before, *::after {
          transition-property: none !important;
          transition-duration: 0s !important;
          animation-duration: 0s !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
        }
      `;
    } else {
      transitionStyleEl.innerHTML = `
        *, *::before, *::after {
          transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 250ms;
        }
      `;
    }

    // 7. System theme change listener (for auto mode)
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e: MediaQueryListEvent) => {
        const newResolved = e.matches ? "dark" : "light";
        setResolvedTheme(newResolved);
        if (newResolved === "dark") {
          root.classList.add("dark");
          root.classList.remove("light");
        } else {
          root.classList.add("light");
          root.classList.remove("dark");
        }
      };
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, [preferences]);

  return (
    <ThemeContext.Provider
      value={{
        preferences,
        resolvedTheme,
        setTheme,
        setAccentColor,
        setGlassIntensity,
        setInterfaceScale,
        setInterfaceDensity,
        setAnimationsEnabled,
        setLanguage,
        setCurrency,
        setDateFormat,
        setNotificationsEnabled,
        resetToDefaults,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
