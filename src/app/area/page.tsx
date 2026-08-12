"use client";

import React, { useState, useEffect } from "react";
import { useAreaStore } from "@/features/area/store/area.store";
import { useStaffStore } from "@/features/staff/store/staff.store";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { verifyAdminAuth } from "@/utils/auth.utils";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Stack,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
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
  const { staffs, fetchStaffs } = useStaffStore();

  useEffect(() => {
    fetchAreas();
    fetchStaffs();
  }, [fetchAreas, fetchStaffs]);

  // Search & Pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [typeInput, setTypeInput] = useState("Gathering Area");

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
    setTypeInput("Gathering Area");
    setFormOpen(true);
  };

  const handleOpenEditForm = (area: Area) => {
    setEditingId(area.id);
    setNameInput(area.name);
    setTypeInput(area.type || "Gathering Area");
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!nameInput.trim()) return;
    verifyAdminAuth();

    if (editingId) {
      updateArea(editingId, { name: nameInput.trim(), type: typeInput });
    } else {
      addArea({
        id: Date.now().toString(),
        name: nameInput.trim(),
        type: typeInput,
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

  // Columns definition: No., Nama Area, Aksi (Exact Figma Area Management.svg)
  const columns: Column<Area>[] = [
    {
      id: "index",
      label: "No.",
      align: "center",
      render: (_, idx) => <>{startIndex + idx + 1}</>,
    },
    {
      id: "name",
      label: "Nama Area",
      render: (row) => (
        <Box sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>
          {row.name}
        </Box>
      ),
    },
    {
      id: "actions",
      label: "Aksi",
      align: "center",
      render: (row) => (
        <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
          <IconButton
            onClick={() => handleOpenEditForm(row)}
            sx={{
              backgroundColor: "#F97316",
              color: "#ffffff",
              borderRadius: "8px",
              width: 36,
              height: 36,
              "&:hover": {
                backgroundColor: "#EA580C",
              },
            }}
          >
            <EditOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            onClick={() => handleOpenDeleteConfirm(row)}
            sx={{
              backgroundColor: "#C5221F",
              color: "#ffffff",
              borderRadius: "8px",
              width: 36,
              height: 36,
              "&:hover": {
                backgroundColor: "#991B1B",
              },
            }}
          >
            <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <AdminShell>
      {/* Header and Add Actions (Exact Figma Area Management.svg) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <AppTypography preset="pageTitle" sx={{ fontWeight: 800, fontSize: "1.85rem", letterSpacing: "-0.03em", color: "#0F172A" }}>
            Area Management
          </AppTypography>
          <AppTypography preset="helperText" sx={{ color: "#64748B", fontSize: "0.925rem", mt: 0.5 }}>
            Tambahkan staff lapangan, kelola peran, dan lakukan delegasi wilayah koordinasi.
          </AppTypography>
        </Box>

        <AppButton
          onClick={handleOpenAddForm}
          label="Tambah Area Baru"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          sx={{
            backgroundColor: "#FBC02D",
            color: "#0F172A",
            fontWeight: 800,
            py: 1.2,
            px: 3,
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(251, 192, 45, 0.35)",
            "&:hover": {
              backgroundColor: "#F57F17",
              color: "#ffffff",
            },
          }}
        />
      </Box>

      {/* Search Bar & Table Card */}
      <Card sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)" }}>
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
                      <SearchIcon sx={{ color: "#64748B" }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: "8px", backgroundColor: "#ffffff" },
                },
              }}
              sx={{ maxWidth: 360, width: "100%" }}
            />
          </Box>

          <DataTable
            columns={columns}
            rows={paginatedAreas}
            emptyMessage="Belum ada area terdaftar dalam sistem."
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

      {/* Form Modal (Matches Add New Area.svg / Edit Area.svg) */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "Edit Area" : "Tambah Area Baru"}
        type="form"
        actions={
          <Stack direction="row" spacing={1.5} sx={{ width: "100%", justifyContent: "flex-end" }}>
            <AppButton variant="outlined" label="Batal" onClick={() => setFormOpen(false)} />
            <AppButton
              variant="contained"
              label={editingId ? "Simpan Area" : "Tambah Area Baru"}
              onClick={handleSave}
              disabled={!nameInput.trim()}
              sx={{
                backgroundColor: "#FBC02D",
                color: "#0F172A",
                fontWeight: 700,
                "&:hover": { backgroundColor: "#F57F17", color: "#ffffff" },
              }}
            />
          </Stack>
        }
      >
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label="Nama Area"
            fullWidth
            required
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Masukkan nama area..."
            slotProps={{ input: { sx: { borderRadius: "8px" } } }}
          />

          <FormControl fullWidth>
            <InputLabel id="area-type-label">Kategori Area</InputLabel>
            <Select
              labelId="area-type-label"
              label="Kategori Area"
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value)}
              sx={{ borderRadius: "8px" }}
            >
              <MenuItem value="Gathering Area">Gathering Area</MenuItem>
              <MenuItem value="VIP Area">VIP Area</MenuItem>
              <MenuItem value="Catering Service">Catering Service</MenuItem>
              <MenuItem value="Logistics & Storage">Logistics & Storage</MenuItem>
              <MenuItem value="Security Post">Security Post</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Konfirmasi Hapus Area"
        type="confirm"
        severity="warning"
        confirmLabel="Hapus Area"
        cancelLabel="Batal"
        onConfirm={handleConfirmDelete}
      >
        Apakah Anda yakin ingin menghapus area **&quot;{targetArea?.name}&quot;**? 
        Aksi ini tidak dapat dibatalkan.
      </Modal>
    </AdminShell>
  );
}
