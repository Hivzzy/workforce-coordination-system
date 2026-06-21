"use client";

import React from "react";
import { Pagination as MuiPagination, Box } from "@mui/material";

interface PaginationProps {
  page: number;
  count: number;
  onChange: (page: number) => void;
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "standard";
}

export default function Pagination({
  page,
  count,
  onChange,
  size = "medium",
  color = "primary",
}: PaginationProps) {
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    onChange(value);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
      <MuiPagination
        page={page}
        count={count}
        onChange={handleChange}
        size={size}
        color={color}
        shape="rounded"
        sx={{
          "& .MuiPaginationItem-root": {
            fontWeight: "bold",
            fontFamily: "var(--font-poppins)",
          },
        }}
      />
    </Box>
  );
}
