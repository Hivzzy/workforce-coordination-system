"use client";

import React from "react";
import { Button } from "@mui/material";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";

interface HelpButtonProps {
  status: "idle" | "requested";
  onClick: () => void;
  fullWidth?: boolean;
}

export default function HelpButton({
  status,
  onClick,
  fullWidth = true,
}: HelpButtonProps) {
  const isRequested = status === "requested";

  return (
    <Button
      variant={isRequested ? "outlined" : "contained"}
      color="help"
      fullWidth={fullWidth}
      onClick={onClick}
      startIcon={<HelpOutlinedIcon />}
      sx={{
        py: 1.2,
        fontWeight: "bold",
        fontFamily: "var(--font-poppins)",
      }}
    >
      {isRequested ? "Batalkan Panggilan" : "Minta Bantuan Koordinasi"}
    </Button>
  );
}
