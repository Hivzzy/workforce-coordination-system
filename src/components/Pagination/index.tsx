"use client";

import React from "react";
import { Pagination as MuiPagination, Box } from "@mui/material";

interface PaginationProps {
  page: number;
  count: number;
  onChange: (page: number) => void;
  size?: "small" | "medium" | "large";
}

export default function Pagination({
  page,
  count,
  onChange,
  size = "medium",
}: PaginationProps) {
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    onChange(value);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 2.5 }}>
      <MuiPagination
        page={page}
        count={count}
        onChange={handleChange}
        size={size}
        shape="rounded"
        sx={{
          "& .MuiPaginationItem-root": {
            fontWeight: 700,
            fontFamily: "var(--font-poppins)",
            borderRadius: "6px",
            color: "#64748B",
            "&.Mui-selected": {
              backgroundColor: "#FBC02D",
              color: "#0F172A",
              "&:hover": {
                backgroundColor: "#F57F17",
                color: "#ffffff",
              },
            },
          },
        }}
      />
    </Box>
  );
}
