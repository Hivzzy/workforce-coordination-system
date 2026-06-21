"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

export interface Column<T> {
  id: string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}

export default function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  emptyMessage = "Tidak ada data tersedia",
}: DataTableProps<T>) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
      <Table sx={{ minWidth: 650 }} aria-label="custom data table">
        <TableHead sx={{ bgcolor: "action.hover" }}>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align || "left"}
                sx={{ fontWeight: 700, py: 2, color: "text.primary", fontFamily: "var(--font-poppins)" }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary" variant="body2" sx={{ fontFamily: "var(--font-poppins)" }}>
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow
                key={row.id || index}
                sx={{
                  "&:hover": { bgcolor: "action.hover" },
                  transition: "background-color 0.2s ease",
                }}
              >
                {columns.map((col) => {
                  const cellContent = col.render 
                    ? col.render(row, index) 
                    : (row[col.id as keyof T] as React.ReactNode);
                  return (
                    <TableCell key={col.id} align={col.align || "left"} sx={{ fontFamily: "var(--font-poppins)" }}>
                      {cellContent}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
