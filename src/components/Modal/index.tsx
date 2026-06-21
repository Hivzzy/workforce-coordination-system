"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  ButtonProps,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AppTypography from "../AppTypography";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  type?: "form" | "confirm" | "alert";
  severity?: "success" | "warning" | "error" | "info" | "default";
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  actions?: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg";
}

export default function Modal({
  open,
  onClose,
  title,
  type = "form",
  severity = "default",
  children,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  onConfirm,
  actions,
  maxWidth = "sm",
}: ModalProps) {
  const getIcon = () => {
    switch (severity) {
      case "error":
        return <ErrorOutlinedIcon color="error" sx={{ fontSize: 48 }} />;
      case "success":
        return <CheckCircleOutlinedIcon color="success" sx={{ fontSize: 48 }} />;
      case "info":
        return <InfoOutlinedIcon color="info" sx={{ fontSize: 48 }} />;
      case "warning":
        return <WarningAmberIcon color="warning" sx={{ fontSize: 48 }} />;
      default:
        return null;
    }
  };

  const getSeverityColor = () => {
    if (severity === "default") return "primary";
    return severity;
  };

  const isAlertOrConfirm = type === "alert" || type === "confirm";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={isAlertOrConfirm ? "xs" : maxWidth}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: isAlertOrConfirm ? 2 : 1,
            textAlign: isAlertOrConfirm ? "center" : "left",
          },
        },
      }}
    >
      {/* HEADER FOR FORMS */}
      {!isAlertOrConfirm && (
        <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" component="span" sx={{ fontWeight: "bold", fontFamily: "var(--font-poppins)" }}>
            {title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: "grey.500" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}

      {/* CONTENT */}
      <DialogContent dividers={!isAlertOrConfirm} sx={{ borderBottom: !isAlertOrConfirm && actions ? undefined : "none" }}>
        {isAlertOrConfirm ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 1 }}>
            {getIcon()}
            <AppTypography variant="h6" sx={{ fontWeight: "bold", fontFamily: "var(--font-poppins)" }}>
              {title}
            </AppTypography>
            {children && (
              <DialogContentText variant="body2" color="text.secondary">
                {children}
              </DialogContentText>
            )}
          </Box>
        ) : (
          <Box sx={{ py: 1 }}>{children}</Box>
        )}
      </DialogContent>

      {/* ACTIONS */}
      {isAlertOrConfirm ? (
        <DialogActions sx={{ justifyContent: "center", gap: 1.5, pb: 1, pt: 2 }}>
          {type === "confirm" && (
            <Button onClick={onClose} variant="outlined" color="inherit" sx={{ px: 3, borderRadius: 2 }}>
              {cancelLabel}
            </Button>
          )}
          <Button
            onClick={onConfirm || onClose}
            variant="contained"
            color={getSeverityColor() as ButtonProps["color"]}
            sx={{ px: 3, borderRadius: 2 }}
          >
            {confirmLabel}
          </Button>
        </DialogActions>
      ) : (
        actions && <DialogActions sx={{ px: 3, py: 2 }}>{actions}</DialogActions>
      )}
    </Dialog>
  );
}
