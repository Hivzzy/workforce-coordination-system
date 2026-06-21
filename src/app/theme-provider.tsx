"use client";

import React, { useMemo, useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";

// Add custom theme properties if needed
declare module "@mui/material/styles" {
  interface Palette {
    refill: Palette["primary"];
    help: Palette["primary"];
    emergency: Palette["primary"];
  }
  interface PaletteOptions {
    refill?: PaletteOptions["primary"];
    help?: PaletteOptions["primary"];
    emergency?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    refill: true;
    help: true;
    emergency: true;
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    refill: true;
    help: true;
    emergency: true;
  }
}

export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const mode = mounted && prefersDarkMode ? "dark" : "light";

  const theme = useMemo(() => {
    const isDark = mode === "dark";
    
    return createTheme({
      palette: {
        mode,
        primary: {
          main: "#6366f1", // Indigo 500
          dark: "#4f46e5", // Indigo 600
          contrastText: "#ffffff",
        },
        secondary: {
          main: "#06b6d4", // Cyan 500
          dark: "#0891b2", // Cyan 600
          contrastText: "#ffffff",
        },
        error: {
          main: "#f43f5e", // Rose 500
          dark: "#e11d48", // Rose 600
        },
        success: {
          main: "#10b981", // Emerald 500
          dark: "#059669", // Emerald 600
        },
        warning: {
          main: "#f59e0b", // Amber 500
          dark: "#d97706", // Amber 600
        },
        // Custom color extensions
        refill: {
          main: "#0d9488", // Teal 600
          dark: "#0f766e",
          contrastText: "#ffffff",
        },
        help: {
          main: "#f97316", // Orange 500
          dark: "#ea580c",
          contrastText: "#ffffff",
        },
        emergency: {
          main: "#f43f5e", // Rose 500
          dark: "#e11d48",
          contrastText: "#ffffff",
        },
        background: {
          default: isDark ? "#09090b" : "#f8fafc", // Zinc 950 / Slate 50
          paper: isDark ? "#18181b" : "#ffffff", // Zinc 900 / White
        },
        text: {
          primary: isDark ? "#f4f4f5" : "#0f172a", // Zinc 100 / Slate 900
          secondary: isDark ? "#a1a1aa" : "#475569", // Zinc 400 / Slate 600
        },
      },
      shape: {
        borderRadius: 12,
      },
      typography: {
        fontFamily: "var(--font-poppins), -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
        h1: {
          fontWeight: 800,
          letterSpacing: "-0.025em",
        },
        h2: {
          fontWeight: 700,
          letterSpacing: "-0.015em",
        },
        h3: {
          fontWeight: 600,
          letterSpacing: "-0.01em",
        },
        body1: {
          lineHeight: 1.6,
        },
        button: {
          textTransform: "none",
          fontWeight: 600,
          letterSpacing: "0.01em",
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              transition: "background-color 0.3s ease, color 0.3s ease",
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: "10px",
              padding: "8px 18px",
              boxShadow: "none",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.12)",
                transform: "translateY(-1px)",
              },
              "&:active": {
                transform: "scale(0.98)",
              },
              "&.MuiButton-containedPrimary": {
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                },
              },
              "&.MuiButton-containedSecondary": {
                background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
                },
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: "16px",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(226, 232, 240, 0.8)",
              boxShadow: isDark
                ? "0 4px 20px rgba(0, 0, 0, 0.4)"
                : "0 4px 16px rgba(15, 23, 42, 0.03), 0 2px 6px rgba(15, 23, 42, 0.02)",
              backgroundImage: "none",
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: isDark
                  ? "0 12px 28px rgba(0, 0, 0, 0.5)"
                  : "0 12px 24px rgba(15, 23, 42, 0.06)",
              },
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
