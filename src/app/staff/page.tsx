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
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AppTypography from "@/components/AppTypography";
import AppButton from "@/components/AppButton";
import Modal from "@/components/Modal";
import DataTable, { Column } from "@/components/DataTable";
import Pagination from "@/components/Pagination";
import AdminShell from "@/components/AdminShell";
import { Staff } from "@/features/staff/types/staff.types";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { verifyAdminAuth } from "@/utils/auth.utils";
import { apiFetch } from "@/utils/api-client";

const PAGE_SIZE = 5;

export default function StaffPage() {
  const { isReady } = useAdminGuard();
  const { staffs, fetchStaffs, addStaff, removeStaff, updateStaff, assignStaffToArea } = useStaffStore();
  const { areas, fetchAreas } = useAreaStore();

  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [newRoleInput, setNewRoleInput] = useState("");

  const fetchRoles = async () => {
    try {
      const data = await apiFetch<{ id: string; name: string }[]>("/roles");
      setRoles(Array.isArray(data) ? data : []);
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

  const handleAddNewRole = async () => {
    if (!newRoleInput.trim()) return;
    try {
      const newRole = await apiFetch<{ id: string; name: string }>("/roles", {
        method: "POST",
        data: { name: newRoleInput.trim() },
      });
      if (newRole && newRole.id) {
        setRoles((prev) => {
          if (prev.some((r) => r.id === newRole.id)) return prev;
          return [...prev, newRole].sort((a, b) => a.name.localeCompare(b.name));
        });
        setRole(newRole.id);
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

  // Pagination slicing
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedStaffs = filteredStaffs.slice(startIndex, startIndex + PAGE_SIZE);
  const totalPages = Math.ceil(filteredStaffs.length / PAGE_SIZE);

  // DataTable columns definition (Matching Figma Staff Management.svg)
  const columns: Column<Staff>[] = [
    {
      id: "index",
      label: "No.",
      align: "center",
      render: (_, idx) => <>{startIndex + idx + 1}</>,
    },
    {
      id: "name",
      label: "Nama Staff",
      render: (row) => (
        <Box>
          <Box sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>{row.name}</Box>
          {row.email && (
            <Box sx={{ fontSize: "0.75rem", color: "#64748B", mt: 0.2, fontWeight: 500 }}>
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
          <Chip
            label={displayName}
            size="small"
            sx={{
              backgroundColor: "#0F172A",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.75rem",
              borderRadius: "6px",
              height: 24,
            }}
          />
        );
      },
    },
    {
      id: "assignment",
      label: "Delegasikan Area",
      render: (row) => (
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <Select
            value={row.assignedAreaId || ""}
            displayEmpty
            onChange={(e) => handleAssignArea(row.id, e.target.value)}
            sx={{
              fontSize: "0.85rem",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              height: 38,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#CBD5E1",
              },
            }}
          >
            <MenuItem value="">
              <em>Area</em>
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
      ),
    },
  ];

  return (
    <AdminShell>
      {/* Header and Add Actions (Exact Figma Staff Management.svg) */}
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
            Staff Management (HRMS)
          </AppTypography>
          <AppTypography preset="helperText" sx={{ color: "#64748B", fontSize: "0.925rem", mt: 0.5 }}>
            Tambahkan staff lapangan, kelola peran, dan lakukan delegasi wilayah koordinasi.
          </AppTypography>
        </Box>

        <AppButton
          onClick={handleOpenAddForm}
          label="Daftarkan Staff Baru"
          startIcon={<PersonAddIcon sx={{ fontSize: 18 }} />}
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

      {/* Search & Filter Bar */}
      <Card sx={{ mb: 3, borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
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
                      <SearchIcon sx={{ color: "#64748B", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: "8px", backgroundColor: "#ffffff" },
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
                sx={{ borderRadius: "8px", backgroundColor: "#ffffff" }}
              >
                <MenuItem value="all">Semua Peran</MenuItem>
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Main Staff Table (Exact Figma Staff Management.svg) */}
      <Card sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)" }}>
        <CardContent sx={{ p: 0 }}>
          <DataTable
            columns={columns}
            rows={paginatedStaffs}
            emptyMessage="Belum ada staff terdaftar. Klik tombol 'Daftarkan Staff Baru' di atas."
          />
          {totalPages > 1 && (
            <Pagination page={page} count={totalPages} onChange={(newPage) => setPage(newPage)} />
          )}
        </CardContent>
      </Card>

      {/* Add Staff Modal Form (Matches Figma Add New Staff.svg) */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Daftarkan Staff Baru"
        type="form"
        actions={
          <Stack direction="row" spacing={1.5} sx={{ width: "100%", justifyContent: "flex-end" }}>
            <AppButton variant="outlined" label="Batal" onClick={() => setFormOpen(false)} />
            <AppButton
              variant="contained"
              label="Daftarkan Staff"
              onClick={handleSave}
              disabled={!name.trim() || !role}
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
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Nama Staff"
            placeholder="Masukkan nama lengkap..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            slotProps={{
              input: { sx: { borderRadius: "8px" } },
            }}
          />

          <FormControl fullWidth>
            <InputLabel id="role-select-label">Peran / Tugas</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Peran / Tugas"
              onChange={(e) => setRole(e.target.value)}
              sx={{ borderRadius: "8px" }}
            >
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Add custom role sub-form */}
          <Box sx={{ border: "1px dashed #CBD5E1", p: 2, borderRadius: "8px", backgroundColor: "#F8FAFC" }}>
            <AppTypography preset="helperText" sx={{ fontWeight: 700, mb: 1, color: "#334155" }}>
              ➕ Peran belum ada di pilihan? Tambahkan di sini:
            </AppTypography>
            <Stack direction="row" spacing={1.5}>
              <TextField
                size="small"
                fullWidth
                label="Peran Baru"
                placeholder="Misal: Sound Engineer, P3K..."
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                slotProps={{ input: { sx: { borderRadius: "8px" } } }}
              />
              <AppButton
                size="small"
                variant="contained"
                label="Tambah"
                onClick={handleAddNewRole}
                disabled={!newRoleInput.trim()}
                sx={{ backgroundColor: "#0F172A", color: "#ffffff" }}
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
        Apakah Anda yakin ingin menghapus data staff **&quot;{targetStaff?.name}&quot;**? 
        Aksi ini tidak dapat dibatalkan.
      </Modal>
    </AdminShell>
  );
}
