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
      elevation={0}
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        border: "1px solid #E2E8F0",
      }}
    >
      <Table sx={{ minWidth: 650 }} aria-label="custom data table">
        <TableHead sx={{ backgroundColor: "#131927" }}>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align || "left"}
                sx={{
                  fontWeight: 700,
                  py: 2,
                  px: 2.5,
                  color: "#FCFCFD",
                  fontSize: "0.825rem",
                  letterSpacing: "0.02em",
                  borderBottom: "none",
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
                <Typography color="#64748B" variant="body2" sx={{ fontFamily: "var(--font-poppins)", fontWeight: 500 }}>
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow
                key={row.id || index}
                sx={{
                  "&:hover": { backgroundColor: "#F8FAFC" },
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
                        py: 2,
                        px: 2.5,
                        color: "#0F172A",
                        fontSize: "0.9rem",
                        borderBottom: "1px solid #F1F5F9",
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
