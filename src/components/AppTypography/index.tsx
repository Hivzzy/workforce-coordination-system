"use client";

import React from "react";
import { Typography as MuiTypography, TypographyProps as MuiTypographyProps } from "@mui/material";

export type TypographyPreset =
  | "pageTitle"
  | "sectionTitle"
  | "cardTitle"
  | "bodyText"
  | "helperText";

interface AppTypographyProps extends Omit<MuiTypographyProps, "variant"> {
  variant?: MuiTypographyProps["variant"];
  preset?: TypographyPreset;
  children: React.ReactNode;
  paragraph?: boolean;
}

export default function AppTypography({
  children,
  variant,
  preset,
  sx,
  ...props
}: AppTypographyProps) {
  const getPresetStyles = () => {
    switch (preset) {
      case "pageTitle":
        return {
          variant: "h3" as const,
          sx: { fontWeight: 800, letterSpacing: "-0.02em" },
        };
      case "sectionTitle":
        return {
          variant: "h5" as const,
          sx: { fontWeight: 700, letterSpacing: "-0.01em" },
        };
      case "cardTitle":
        return {
          variant: "h6" as const,
          sx: { fontWeight: 600 },
        };
      case "bodyText":
        return {
          variant: "body1" as const,
          sx: { lineHeight: 1.6 },
        };
      case "helperText":
        return {
          variant: "caption" as const,
          sx: { color: "text.secondary" },
        };
      default:
        return {
          variant: variant || "body1",
          sx: {},
        };
    }
  };

  const presetStyle = getPresetStyles();

  return (
    <MuiTypography
      variant={presetStyle.variant}
      sx={{
        fontFamily: "var(--font-poppins), sans-serif",
        ...presetStyle.sx,
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiTypography>
  );
}
