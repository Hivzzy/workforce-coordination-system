"use client";

import React from "react";
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export type ButtonCondition =
  | "add"
  | "edit"
  | "delete"
  | "refresh"
  | "warning"
  | "default";

interface AppButtonProps extends Omit<MuiButtonProps, "color"> {
  condition?: ButtonCondition;
  label: string;
  loading?: boolean;
  color?: MuiButtonProps["color"] | "refill" | "help" | "emergency";
  startIcon?: React.ReactNode;
}

export default function AppButton({
  condition = "default",
  label,
  loading = false,
  variant = "contained",
  color,
  startIcon,
  disabled,
  sx,
  ...props
}: AppButtonProps) {
  const getConditionConfigs = () => {
    switch (condition) {
      case "add":
        return {
          color: "primary" as const,
          icon: <AddIcon />,
        };
      case "edit":
        return {
          color: "secondary" as const,
          icon: <EditIcon />,
        };
      case "delete":
        return {
          color: "error" as const,
          icon: <DeleteIcon />,
        };
      case "refresh":
        return {
          color: "refill" as MuiButtonProps["color"],
          icon: <RefreshIcon />,
        };
      case "warning":
        return {
          color: "emergency" as MuiButtonProps["color"],
          icon: <WarningAmberIcon />,
        };
      default:
        return {
          color: "primary" as const,
          icon: undefined,
        };
    }
  };

  const config = getConditionConfigs();
  const activeColor = color || config.color;
  const activeIcon = startIcon !== undefined ? startIcon : config.icon;

  return (
    <MuiButton
      variant={variant}
      color={activeColor as MuiButtonProps["color"]}
      disabled={disabled || loading}
      sx={{
        borderRadius: 2,
        fontWeight: 600,
        fontFamily: "var(--font-poppins), sans-serif",
        ...sx,
      }}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : activeIcon}
      {...props}
    >
      {label}
    </MuiButton>
  );
}
