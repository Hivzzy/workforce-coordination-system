"use client";

import React from "react";
import { Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

interface RefillButtonProps {
  status: "idle" | "requested";
  onClick: () => void;
  fullWidth?: boolean;
}

export default function RefillButton({
  status,
  onClick,
  fullWidth = true,
}: RefillButtonProps) {
  const isRequested = status === "requested";

  return (
    <Button
      variant={isRequested ? "outlined" : "contained"}
      color="refill"
      fullWidth={fullWidth}
      onClick={onClick}
      startIcon={<RefreshIcon />}
      sx={{
        py: 1.2,
        fontWeight: "bold",
        fontFamily: "var(--font-poppins)",
      }}
    >
      {isRequested ? "Refill Selesai" : "Minta Refill Logistik"}
    </Button>
  );
}
