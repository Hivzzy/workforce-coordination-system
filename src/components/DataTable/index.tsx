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
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "#121215",
        borderColor: "#1e1e24",
        boxShadow: "none",
      }}
    >
      <Table sx={{ minWidth: 650 }} aria-label="custom data table">
        <TableHead sx={{ backgroundColor: "#18181b" }}>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align || "left"}
                sx={{
                  fontWeight: 600,
                  py: 1.5,
                  px: 2,
                  color: "#a1a1aa",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "1px solid #1e1e24",
                  fontFamily: "var(--font-poppins)",
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6, borderBottom: "none" }}>
                <Typography color="#71717a" variant="body2" sx={{ fontFamily: "var(--font-poppins)" }}>
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow
                key={row.id || index}
                sx={{
                  "&:hover": { backgroundColor: "#18181b" },
                  transition: "background-color 0.15s ease",
                  "&:last-child td, &:last-child th": { borderBottom: 0 },
                }}
              >
                {columns.map((col) => {
                  const cellContent = col.render 
                    ? col.render(row, index) 
                    : (row[col.id as keyof T] as React.ReactNode);
                  return (
                    <TableCell
                      key={col.id}
                      align={col.align || "left"}
                      sx={{
                        py: 1.75,
                        px: 2,
                        color: "#ffffff",
                        fontSize: "0.875rem",
                        borderBottom: "1px solid #1e1e24",
                        fontFamily: "var(--font-poppins)",
                      }}
                    >
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
