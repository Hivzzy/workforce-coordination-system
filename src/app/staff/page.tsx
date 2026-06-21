"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStaffStore } from "@/features/staff/store/staff.store";
import { useAreaStore } from "@/features/area/store/area.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  Box,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AppTypography from "@/components/AppTypography";
import AppButton from "@/components/AppButton";
import Modal from "@/components/Modal";
import DataTable, { Column } from "@/components/DataTable";
import Pagination from "@/components/Pagination";
import AdminShell from "@/components/AdminShell";
import { Staff } from "@/features/staff/types/staff.types";

const PAGE_SIZE = 5;

export default function StaffPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const { staffs, addStaff, removeStaff, updateStaff, assignStaffToArea } = useStaffStore();
  const { areas } = useAreaStore();
  const router = useRouter();

  // Local state for forms and modals
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Confirmation modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetStaff, setTargetStaff] = useState<Staff | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);

  // Route security
  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.push("/login");
    } else if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, hasHydrated, router]);

  if (!hasHydrated || !user || user.role !== "admin") return null;

  // Helper check for admin role before performing state mutation actions
  const verifyAdminAuth = () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized action");
    }
  };

  const handleOpenAddForm = () => {
    setEditingId(null);
    setName("");
    setRole("");
    setFormOpen(true);
  };

  const handleOpenEditForm = (staff: Staff) => {
    setEditingId(staff.id);
    setName(staff.name);
    setRole(staff.role);
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !role) return;

    verifyAdminAuth();

    if (editingId) {
      const existingStaff = staffs.find((s) => s.id === editingId);
      updateStaff({
        id: editingId,
        name: name.trim(),
        role,
        assignedAreaId: existingStaff?.assignedAreaId,
      });
    } else {
      addStaff({
        id: Date.now().toString(),
        name: name.trim(),
        role,
      });
    }

    setFormOpen(false);
    setName("");
    setRole("");
  };

  const handleOpenDeleteConfirm = (staff: Staff) => {
    setTargetStaff(staff);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!targetStaff) return;

    verifyAdminAuth();
    removeStaff(targetStaff.id);
    setDeleteConfirmOpen(false);
    setTargetStaff(null);

    // Adjust page if deletion empties current page
    const totalRemaining = staffs.length - 1;
    const maxPage = Math.max(1, Math.ceil(totalRemaining / PAGE_SIZE));
    if (page > maxPage) {
      setPage(maxPage);
    }
  };

  const handleAssignArea = (staffId: string, areaId: string) => {
    verifyAdminAuth();
    assignStaffToArea(staffId, areaId);
  };

  // Pagination slicing
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedStaffs = staffs.slice(startIndex, startIndex + PAGE_SIZE);
  const totalPages = Math.ceil(staffs.length / PAGE_SIZE);

  // DataTable columns definition
  const columns: Column<Staff>[] = [
    {
      id: "index",
      label: "No",
      align: "center",
      render: (_, idx) => <>{startIndex + idx + 1}</>,
    },
    {
      id: "name",
      label: "Nama Staff",
      render: (row) => <Box sx={{ fontWeight: 600 }}>{row.name}</Box>,
    },
    {
      id: "role",
      label: "Peran / Tugas",
      render: (row) => (
        <Box
          sx={{
            display: "inline-block",
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: "0.8rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            bgcolor: row.role === "security" ? "error.main" : "secondary.main",
            color: "white",
          }}
        >
          {row.role}
        </Box>
      ),
    },
    {
      id: "area",
      label: "Area Saat Ini",
      render: (row) => {
        const area = areas.find((a) => a.id === row.assignedAreaId);
        return area ? (
          <Box sx={{ color: "primary.main", fontWeight: 600 }}>{area.name}</Box>
        ) : (
          <Box sx={{ color: "text.secondary", fontStyle: "italic" }}>Belum Ditugaskan</Box>
        );
      },
    },
    {
      id: "assignment",
      label: "Delegasikan Area",
      render: (row) => (
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id={`assign-label-${row.id}`} sx={{ fontSize: "0.85rem" }}>
            Pilih Area
          </InputLabel>
          <Select
            labelId={`assign-label-${row.id}`}
            value={row.assignedAreaId || ""}
            label="Pilih Area"
            onChange={(e) => handleAssignArea(row.id, e.target.value)}
            sx={{
              fontSize: "0.85rem",
              borderRadius: 2,
            }}
          >
            <MenuItem value="">
              <em>Unassigned (Lepas Tugas)</em>
            </MenuItem>
            {areas.map((area) => (
              <MenuItem key={area.id} value={area.id} sx={{ fontSize: "0.85rem" }}>
                {area.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ),
    },
    {
      id: "actions",
      label: "Aksi",
      align: "center",
      render: (row) => (
        <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
          <AppButton
            variant="outlined"
            label="Edit"
            onClick={() => handleOpenEditForm(row)}
            sx={{ py: 0.6, px: 1.5, fontSize: "0.8rem" }}
          />
          <AppButton
            variant="outlined"
            color="error"
            label="Hapus"
            onClick={() => handleOpenDeleteConfirm(row)}
            sx={{ py: 0.6, px: 1.5, fontSize: "0.8rem" }}
          />
        </Stack>
      ),
    },
  ];

  return (
    <AdminShell>
      {/* Header and Add Actions */}
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
          <AppTypography preset="pageTitle">Manajemen Staff (HRMS)</AppTypography>
          <AppTypography preset="helperText" color="text.secondary">
            Tambahkan staff lapangan, kelola peran, dan lakukan delegasi wilayah koordinasi.
          </AppTypography>
        </Box>

        <AppButton
          onClick={handleOpenAddForm}
          label="Tambah Staff Baru"
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          sx={{ py: 1.2, px: 2.5 }}
        />
      </Box>

      {/* Main Staff Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataTable
            columns={columns}
            rows={paginatedStaffs}
            emptyMessage="Belum ada staff yang terdaftar. Gunakan tombol 'Tambah Staff Baru' di atas."
          />
          {totalPages > 1 && (
            <Pagination page={page} count={totalPages} onChange={(newPage) => setPage(newPage)} />
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Staff Modal Form */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "Edit Profil Staff" : "Daftarkan Staff Baru"}
        type="form"
        actions={
          <Stack direction="row" spacing={1.5} sx={{ width: "100%", justifyContent: "flex-end" }}>
            <AppButton variant="outlined" label="Batal" onClick={() => setFormOpen(false)} />
            <AppButton
              variant="contained"
              label={editingId ? "Simpan Perubahan" : "Daftarkan Staff"}
              onClick={handleSave}
              disabled={!name.trim() || !role}
            />
          </Stack>
        }
      >
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap staff..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            slotProps={{
              input: { sx: { borderRadius: 2 } },
            }}
          />

          <FormControl fullWidth>
            <InputLabel id="role-select-label">Peran Tugas</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Peran Tugas"
              onChange={(e) => setRole(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="cleaning">Cleaning Service (Kebersihan)</MenuItem>
              <MenuItem value="security">Security Patrol (Keamanan)</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Konfirmasi Penghapusan"
        type="confirm"
        severity="warning"
        confirmLabel="Ya, Hapus Staff"
        cancelLabel="Batal"
        onConfirm={handleConfirmDelete}
      >
        Apakah Anda yakin ingin menghapus data staff **&quot;{targetStaff?.name}&quot;** ({targetStaff?.role})? 
        Aksi ini tidak dapat dibatalkan dan akan melepaskan staff dari semua area penugasan.
      </Modal>
    </AdminShell>
  );
}
