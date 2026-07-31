"use client";

import React, { useMemo, useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: "dark",
        primary: {
          main: "#eab308", // Refined Gold
          dark: "#ca8a04",
          light: "#fde047",
          contrastText: "#000000",
        },
        secondary: {
          main: "#a1a1aa", // Muted Silver
          dark: "#71717a",
          light: "#e4e4e7",
          contrastText: "#000000",
        },
        error: {
          main: "#ef4444", // Clean Red
          dark: "#dc2626",
          contrastText: "#ffffff",
        },
        success: {
          main: "#22c55e", // Clean Green
          dark: "#16a34a",
          contrastText: "#ffffff",
        },
        warning: {
          main: "#f59e0b", // Clean Amber
          dark: "#d97706",
          contrastText: "#000000",
        },
        refill: {
          main: "#eab308",
          dark: "#ca8a04",
          contrastText: "#000000",
        },
        help: {
          main: "#f97316",
          dark: "#ea580c",
          contrastText: "#ffffff",
        },
        emergency: {
          main: "#ef4444",
          dark: "#dc2626",
          contrastText: "#ffffff",
        },
        background: {
          default: "#09090b", // Crisp Zinc 950
          paper: "#121215", // Crisp Zinc 900
        },
        text: {
          primary: "#ffffff", // Pure White
          secondary: "#a1a1aa", // Muted Gray
        },
        divider: "#1e1e24", // Subtle 1px Divider
      },
      shape: {
        borderRadius: 8,
      },
      typography: {
        fontFamily: "var(--font-poppins), -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
        h1: { fontWeight: 700, letterSpacing: "-0.03em" },
        h2: { fontWeight: 700, letterSpacing: "-0.02em" },
        h3: { fontWeight: 600, letterSpacing: "-0.01em" },
        body1: { lineHeight: 1.6 },
        button: { textTransform: "none", fontWeight: 600 },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: "#09090b",
              color: "#ffffff",
              "&::-webkit-scrollbar": { width: "6px", height: "6px" },
              "&::-webkit-scrollbar-track": { background: "#09090b" },
              "&::-webkit-scrollbar-thumb": {
                background: "#27272a",
                borderRadius: "3px",
                "&:hover": { background: "#3f3f46" },
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "0.875rem",
              fontWeight: 600,
              boxShadow: "none",
              transition: "all 0.15s ease",
              "&:hover": {
                boxShadow: "none",
              },
              "&.MuiButton-containedPrimary": {
                backgroundColor: "#eab308",
                color: "#000000",
                "&:hover": {
                  backgroundColor: "#ca8a04",
                },
              },
              "&.MuiButton-containedSecondary": {
                backgroundColor: "#27272a",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#3f3f46",
                },
              },
              "&.MuiButton-outlined": {
                borderColor: "#27272a",
                color: "#ffffff",
                "&:hover": {
                  borderColor: "#3f3f46",
                  backgroundColor: "#18181b",
                },
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: "10px",
              backgroundColor: "#121215",
              border: "1px solid #1e1e24",
              boxShadow: "none",
              backgroundImage: "none",
              transition: "border-color 0.15s ease",
              "&:hover": {
                borderColor: "#2e2e38",
              },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: "6px",
              backgroundColor: "#09090b",
              color: "#ffffff",
              fontSize: "0.875rem",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#27272a",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#3f3f46",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#eab308",
                borderWidth: "1px",
              },
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderBottom: "1px solid #1e1e24",
              color: "#ffffff",
              fontSize: "0.875rem",
              padding: "12px 16px",
            },
            head: {
              backgroundColor: "#18181b",
              color: "#a1a1aa",
              fontWeight: 600,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              fontWeight: 500,
              borderRadius: "6px",
              fontSize: "0.75rem",
            },
          },
        },
      },
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
