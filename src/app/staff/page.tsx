"use client";

import React, { useState, useEffect } from "react";
import { useStaffStore } from "@/features/staff/store/staff.store";
import { useAreaStore } from "@/features/area/store/area.store";
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
  InputAdornment,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AppTypography from "@/components/AppTypography";
import AppButton from "@/components/AppButton";
import Modal from "@/components/Modal";
import DataTable, { Column } from "@/components/DataTable";
import Pagination from "@/components/Pagination";
import AdminShell from "@/components/AdminShell";
import { Staff } from "@/features/staff/types/staff.types";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { verifyAdminAuth } from "@/utils/auth.utils";

const PAGE_SIZE = 5;

export default function StaffPage() {
  const { isReady } = useAdminGuard();
  const { staffs, fetchStaffs, addStaff, removeStaff, updateStaff, assignStaffToArea } = useStaffStore();
  const { areas, fetchAreas } = useAreaStore();

  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [newRoleInput, setNewRoleInput] = useState("");

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  useEffect(() => {
    fetchStaffs();
    fetchAreas();
    fetchRoles();
  }, [fetchStaffs, fetchAreas]);

  // Local state for forms and modals
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Confirmation modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetStaff, setTargetStaff] = useState<Staff | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  if (!isReady) return null;

  // Apply search and filter
  const filteredStaffs = staffs.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || s.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleOpenAddForm = () => {
    setEditingId(null);
    setName("");
    setRole("");
    setEmail("");
    setPassword("");
    setFormOpen(true);
  };

  const handleOpenEditForm = (staff: Staff) => {
    setEditingId(staff.id);
    setName(staff.name);
    setRole(staff.role);
    setEmail(staff.email || "");
    setPassword(staff.password || "");
    setFormOpen(true);
  };

  const handleAddNewRole = async () => {
    if (!newRoleInput.trim()) return;
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleInput.trim() }),
      });
      if (res.ok) {
        const { role: newRole } = await res.json();
        setRoles((prev) => {
          if (prev.some(r => r.id === newRole.id)) return prev;
          return [...prev, newRole].sort((a, b) => a.name.localeCompare(b.name));
        });
        setRole(newRole.id); // Auto-select new role in the dropdown
        setNewRoleInput("");
      }
    } catch (err) {
      console.error("Failed to add custom role:", err);
    }
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
        email: email.trim() || undefined,
        password: password || undefined,
      });
    } else {
      addStaff({
        id: Date.now().toString(),
        name: name.trim(),
        role,
        email: email.trim() || undefined,
        password: password || undefined,
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
    const totalRemaining = filteredStaffs.length - 1;
    const maxPage = Math.max(1, Math.ceil(totalRemaining / PAGE_SIZE));
    if (page > maxPage) {
      setPage(maxPage);
    }
  };

  const handleAssignArea = (staffId: string, areaId: string) => {
    verifyAdminAuth();
    assignStaffToArea(staffId, areaId);
  };

  // Pagination slicing (on filtered results)
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedStaffs = filteredStaffs.slice(startIndex, startIndex + PAGE_SIZE);
  const totalPages = Math.ceil(filteredStaffs.length / PAGE_SIZE);

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
      render: (row) => (
        <Box>
          <Box sx={{ fontWeight: 600 }}>{row.name}</Box>
          {row.email && (
            <Box sx={{ fontSize: "0.72rem", color: "text.secondary", mt: 0.2, fontWeight: 500 }}>
              {row.email}
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: "role",
      label: "Peran / Tugas",
      render: (row) => {
        const foundRole = roles.find((r) => r.id === row.role);
        const displayName = foundRole ? foundRole.name : row.role;
        return (
          <Box
            sx={{
              display: "inline-block",
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontSize: "0.75rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              bgcolor: row.role === "security" ? "error.main" : row.role === "cleaning" ? "secondary.main" : "primary.main",
              color: "white",
            }}
          >
            {displayName}
          </Box>
        );
      },
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

      {/* Search & Filter Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ alignItems: { xs: "stretch", sm: "center" } }}
          >
            <TextField
              size="small"
              placeholder="Cari nama staff..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              sx={{ flexGrow: 1 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 },
                },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="filter-role-label">Filter Peran</InputLabel>
              <Select
                labelId="filter-role-label"
                value={filterRole}
                label="Filter Peran"
                onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">Semua Peran</MenuItem>
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {(searchQuery || filterRole !== "all") && (
              <Chip
                label={`${filteredStaffs.length} hasil`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700, fontFamily: "var(--font-poppins)" }}
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Main Staff Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataTable
            columns={columns}
            rows={paginatedStaffs}
            emptyMessage={
              searchQuery || filterRole !== "all"
                ? `Tidak ditemukan staff dengan pencarian "${searchQuery}"${filterRole !== "all" ? ` dan peran "${filterRole}"` : ""}.`
                : "Belum ada staff yang terdaftar. Gunakan tombol 'Tambah Staff Baru' di atas."
            }
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

          <AppTypography preset="helperText" sx={{ mt: -1.5, mb: 0.5, pl: 0.5, color: "text.secondary", fontWeight: 500 }}>
            💡 Akun login dibuat otomatis: <strong>[nama_depan]@coordination.com</strong> dengan password default <strong>staff</strong>.
          </AppTypography>

          <FormControl fullWidth>
            <InputLabel id="role-select-label">Peran Tugas</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Peran Tugas"
              onChange={(e) => setRole(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Add custom role sub-form */}
          <Box sx={{ border: "1px dashed", borderColor: "divider", p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
            <AppTypography preset="helperText" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
              ➕ Peran tidak terdaftar? Tambahkan di sini:
            </AppTypography>
            <Stack direction="row" spacing={1.5}>
              <TextField
                size="small"
                fullWidth
                label="Nama Peran Baru"
                placeholder="Misal: Medic, Teknisi, Sound..."
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                slotProps={{ input: { sx: { borderRadius: 2 } } }}
              />
              <AppButton
                size="small"
                variant="contained"
                color="primary"
                label="Tambah"
                onClick={handleAddNewRole}
                disabled={!newRoleInput.trim()}
              />
            </Stack>
          </Box>
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
