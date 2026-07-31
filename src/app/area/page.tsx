"use client";

import React, { useState, useEffect } from "react";
import { useAreaStore } from "@/features/area/store/area.store";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { verifyAdminAuth } from "@/utils/auth.utils";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Stack,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AppTypography from "@/components/AppTypography";
import AppButton from "@/components/AppButton";
import Modal from "@/components/Modal";
import DataTable, { Column } from "@/components/DataTable";
import Pagination from "@/components/Pagination";
import AdminShell from "@/components/AdminShell";
import { Area } from "@/features/area/types/area.types";

const PAGE_SIZE = 5;

export default function AreaPage() {
  const { isReady } = useAdminGuard();
  const { areas, fetchAreas, addArea, removeArea, updateArea } = useAreaStore();

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // Search & Pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");

  // Delete modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetArea, setTargetArea] = useState<Area | null>(null);

  if (!isReady) return null;

  // Filtered areas
  const filteredAreas = areas.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredAreas.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedAreas = filteredAreas.slice(startIndex, startIndex + PAGE_SIZE);

  const handleOpenAddForm = () => {
    setEditingId(null);
    setNameInput("");
    setFormOpen(true);
  };

  const handleOpenEditForm = (area: Area) => {
    setEditingId(area.id);
    setNameInput(area.name);
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!nameInput.trim()) return;
    verifyAdminAuth();

    if (editingId) {
      updateArea(editingId, { name: nameInput.trim() });
    } else {
      addArea({
        id: Date.now().toString(),
        name: nameInput.trim(),
      });
    }

    setFormOpen(false);
    setNameInput("");
  };

  const handleOpenDeleteConfirm = (area: Area) => {
    setTargetArea(area);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!targetArea) return;
    verifyAdminAuth();
    removeArea(targetArea.id);
    setDeleteConfirmOpen(false);
    setTargetArea(null);

    const totalRemaining = filteredAreas.length - 1;
    const maxPage = Math.max(1, Math.ceil(totalRemaining / PAGE_SIZE));
    if (page > maxPage) {
      setPage(maxPage);
    }
  };

  // Columns definition: No, Nama, Aksi
  const columns: Column<Area>[] = [
    {
      id: "index",
      label: "No",
      align: "center",
      render: (_, idx) => <>{startIndex + idx + 1}</>,
    },
    {
      id: "name",
      label: "Nama",
      render: (row) => <Box sx={{ fontWeight: 600 }}>{row.name}</Box>,
    },
    {
      id: "actions",
      label: "Aksi",
      align: "right",
      render: (row) => (
        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
          <AppButton
            condition="edit"
            label="Edit"
            size="small"
            onClick={() => handleOpenEditForm(row)}
          />
          <AppButton
            condition="delete"
            label="Hapus"
            size="small"
            onClick={() => handleOpenDeleteConfirm(row)}
          />
        </Stack>
      ),
    },
  ];

  return (
    <AdminShell>
      {/* ── Header ── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <AppTypography preset="pageTitle">Area Management</AppTypography>
          <AppTypography preset="helperText" color="text.secondary">
            Kelola daftar area penugasan staff dan lokasi event.
          </AppTypography>
        </Box>
        <AppButton
          condition="add"
          label="Tambah Area"
          onClick={handleOpenAddForm}
        />
      </Box>

      {/* ── Search Bar & Table Card ── */}
      <Card variant="outlined" sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <TextField
              placeholder="Cari nama area..."
              size="small"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ maxWidth: 360, width: "100%" }}
            />
          </Box>

          <DataTable
            columns={columns}
            rows={paginatedAreas}
            emptyMessage="Belum ada area terdaftar"
          />

          {totalPages > 1 && (
            <Pagination
              page={page}
              count={totalPages}
              onChange={(newPage) => setPage(newPage)}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Form Modal (Add / Edit) ── */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "Edit Area" : "Tambah Area Baru"}
        type="form"
        actions={
          <>
            <AppButton
              variant="outlined"
              color="inherit"
              label="Batal"
              onClick={() => setFormOpen(false)}
            />
            <AppButton
              label={editingId ? "Simpan Perubahan" : "Tambah Area"}
              onClick={handleSave}
            />
          </>
        }
      >
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label="Nama Area"
            fullWidth
            required
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Masukkan nama area (misal: Area Parkir A, Gedung Utama)"
          />
        </Stack>
      </Modal>

      {/* ── Confirm Delete Modal ── */}
      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Hapus Area"
        type="confirm"
        severity="error"
        confirmLabel="Hapus Area"
        cancelLabel="Batal"
        onConfirm={handleConfirmDelete}
      >
        Apakah Anda yakin ingin menghapus area <strong>{targetArea?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
      </Modal>
    </AdminShell>
  );
}
