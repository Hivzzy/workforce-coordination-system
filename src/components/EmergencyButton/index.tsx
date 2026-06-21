"use client";

import React from "react";
import { Button } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface EmergencyButtonProps {
  active: boolean;
  onClick: () => void;
  fullWidth?: boolean;
}

export default function EmergencyButton({
  active,
  onClick,
  fullWidth = true,
}: EmergencyButtonProps) {
  return (
    <Button
      variant="contained"
      color="emergency"
      fullWidth={fullWidth}
      onClick={onClick}
      className={active ? "animate-pulse-glow" : ""}
      startIcon={<WarningAmberIcon />}
      sx={{
        py: 1.2,
        fontWeight: "bold",
        fontFamily: "var(--font-poppins)",
      }}
    >
      {active ? "Matikan Alarm Darurat" : "Panggil Semua Staff"}
    </Button>
  );
}
