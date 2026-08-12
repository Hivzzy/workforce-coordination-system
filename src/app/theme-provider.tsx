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
        mode: "light",
        primary: {
          main: "#FBC02D", // Primary Gold/Yellow from DESIGN.md
          dark: "#F57F17",
          light: "#FFE082",
          contrastText: "#0F172A",
        },
        secondary: {
          main: "#0F172A", // Dark Navy from DESIGN.md
          dark: "#090D16",
          light: "#1E293B",
          contrastText: "#FFFFFF",
        },
        error: {
          main: "#C5221F", // Emergency Red from DESIGN.md
          dark: "#991B1B",
          contrastText: "#FFFFFF",
        },
        success: {
          main: "#1F7D53", // Status Green from DESIGN.md
          dark: "#14532D",
          contrastText: "#FFFFFF",
        },
        warning: {
          main: "#F97316", // Operational Warning Orange
          dark: "#EA580C",
          contrastText: "#FFFFFF",
        },
        refill: {
          main: "#0D9488",
          dark: "#0F766E",
          contrastText: "#FFFFFF",
        },
        help: {
          main: "#F97316",
          dark: "#EA580C",
          contrastText: "#FFFFFF",
        },
        emergency: {
          main: "#C5221F",
          dark: "#991B1B",
          contrastText: "#FFFFFF",
        },
        background: {
          default: "#F6F6F6", // Page BG from DESIGN.md
          paper: "#FFFFFF",
        },
        text: {
          primary: "#0F172A",
          secondary: "#64748B",
        },
        divider: "#E2E8F0",
      },
      shape: {
        borderRadius: 8,
      },
      typography: {
        fontFamily: "var(--font-poppins), 'Poppins', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
        h1: { fontWeight: 800, letterSpacing: "-0.03em" },
        h2: { fontWeight: 700, letterSpacing: "-0.02em" },
        h3: { fontWeight: 700, letterSpacing: "-0.01em" },
        body1: { lineHeight: 1.5, fontSize: "0.9rem" },
        button: { textTransform: "none", fontWeight: 700 },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: "#F6F6F6",
              color: "#0F172A",
              "&::-webkit-scrollbar": { width: "6px", height: "6px" },
              "&::-webkit-scrollbar-track": { background: "#F1F5F9" },
              "&::-webkit-scrollbar-thumb": {
                background: "#CBD5E1",
                borderRadius: "3px",
                "&:hover": { background: "#94A3B8" },
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "0.875rem",
              fontWeight: 700,
              boxShadow: "none",
              transition: "all 0.15s ease",
              "&:hover": {
                boxShadow: "none",
              },
              "&.MuiButton-containedPrimary": {
                backgroundColor: "#FBC02D",
                color: "#0F172A",
                "&:hover": {
                  backgroundColor: "#F57F17",
                  color: "#FFFFFF",
                },
              },
              "&.MuiButton-containedSecondary": {
                backgroundColor: "#0F172A",
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "#1E293B",
                },
              },
              "&.MuiButton-outlined": {
                borderColor: "#CBD5E1",
                color: "#0F172A",
                "&:hover": {
                  borderColor: "#0F172A",
                  backgroundColor: "#F8FAFC",
                },
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
              backgroundImage: "none",
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              color: "#0F172A",
              fontSize: "0.875rem",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#CBD5E1",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#94A3B8",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#FBC02D",
                borderWidth: "2px",
              },
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderBottom: "1px solid #F1F5F9",
              color: "#0F172A",
              fontSize: "0.9rem",
              padding: "16px 20px",
            },
            head: {
              backgroundColor: "#131927",
              color: "#FCFCFD",
              fontWeight: 700,
              fontSize: "0.825rem",
              letterSpacing: "0.02em",
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              fontWeight: 700,
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
