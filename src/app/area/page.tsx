"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAreaStore } from "@/features/area/store/area.store";
import { useStaffStore } from "@/features/staff/store/staff.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  Grid,
  Card,
  CardContent,
  Box,
  TextField,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import MapIcon from "@mui/icons-material/Map";
import PeopleIcon from "@mui/icons-material/People";
import AppTypography from "@/components/AppTypography";
import AppButton from "@/components/AppButton";
import Modal from "@/components/Modal";
import AdminShell from "@/components/AdminShell";
import { Area } from "@/features/area/types/area.types";

export default function AreaPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const { areas, addArea, removeArea } = useAreaStore();
  const { staffs, assignStaffToArea } = useStaffStore();
  const router = useRouter();

  // Local state
  const [areaName, setAreaName] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  
  // Confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetArea, setTargetArea] = useState<Area | null>(null);

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
    setAreaName("");
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!areaName.trim()) return;

    verifyAdminAuth();
    addArea({
      id: Date.now().toString(),
      name: areaName.trim(),
    });

    setFormOpen(false);
    setAreaName("");
  };

  const handleOpenDeleteConfirm = (area: Area) => {
    setTargetArea(area);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!targetArea) return;

    verifyAdminAuth();
    
    // Clear area assignment from any assigned staff
    const assignedStaffs = staffs.filter((s) => s.assignedAreaId === targetArea.id);
    assignedStaffs.forEach((staff) => {
      assignStaffToArea(staff.id, "");
    });

    // Remove the area
    removeArea(targetArea.id);
    setDeleteConfirmOpen(false);
    setTargetArea(null);
  };

  const handleQuickAssign = (staffId: string, areaId: string) => {
    verifyAdminAuth();
    assignStaffToArea(staffId, areaId);
  };

  const getStaffByArea = (areaId: string) => {
    return staffs.filter((s) => s.assignedAreaId === areaId);
  };

  // Find staff that are currently unassigned to show in quick-assign dropdown
  const unassignedStaffs = staffs.filter((s) => !s.assignedAreaId);

  return (
    <AdminShell>
      {/* Page Header */}
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
          <AppTypography preset="pageTitle">Manajemen Area (Layout Event)</AppTypography>
          <AppTypography preset="helperText" color="text.secondary">
            Petakan denah event Anda, buat zona, dan monitor jumlah personil lapangan secara real-time.
          </AppTypography>
        </Box>

        <AppButton
          onClick={handleOpenAddForm}
          label="Buat Area Baru"
          variant="contained"
          color="primary"
          startIcon={<AddLocationAltIcon />}
          sx={{ py: 1.2, px: 2.5 }}
        />
      </Box>

      {/* Area Cards Grid */}
      {areas.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <MapIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2, opacity: 0.5 }} />
          <AppTypography preset="sectionTitle" color="text.secondary">
            Belum ada area terdaftar
          </AppTypography>
          <AppTypography preset="helperText" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            Silakan buat area event baru untuk memulai pembagian penugasan staff.
          </AppTypography>
          <AppButton
            onClick={handleOpenAddForm}
            label="Buat Area Sekarang"
            variant="contained"
            color="primary"
          />
        </Card>
      ) : (
        <Grid container spacing={3}>
          {areas.map((area) => {
            const assignedStaff = getStaffByArea(area.id);
            return (
              <Grid key={area.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 3 }}>
                    {/* Card Title & Delete Option */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <MapIcon color="primary" />
                        <AppTypography preset="cardTitle" sx={{ fontWeight: 800 }}>
                          {area.name}
                        </AppTypography>
                      </Box>
                      <AppButton
                        variant="outlined"
                        color="error"
                        label="Hapus"
                        onClick={() => handleOpenDeleteConfirm(area)}
                        sx={{ py: 0.5, px: 1, fontSize: "0.75rem" }}
                      />
                    </Box>

                    <Divider sx={{ mb: 2, opacity: 0.5 }} />

                    {/* Staff List Header */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                      <PeopleIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                      <AppTypography preset="helperText" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                        Staff Bertugas ({assignedStaff.length})
                      </AppTypography>
                    </Box>

                    {/* Staff Members List */}
                    <Box sx={{ flexGrow: 1, mb: 3 }}>
                      {assignedStaff.length === 0 ? (
                        <Box sx={{ p: 2, border: "1px dashed rgba(255, 255, 255, 0.1)", borderRadius: 2, textAlign: "center" }}>
                          <AppTypography preset="helperText" color="text.secondary" sx={{ fontStyle: "italic" }}>
                            Belum ada staff di area ini
                          </AppTypography>
                        </Box>
                      ) : (
                        <List disablePadding>
                          {assignedStaff.map((staff) => (
                            <ListItem
                              key={staff.id}
                              disableGutters
                              sx={{
                                py: 0.6,
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                                "&:last-child": { borderBottom: "none" },
                              }}
                            >
                              <ListItemText
                                primary={
                                  <AppTypography preset="bodyText" sx={{ fontWeight: 600 }}>
                                    {staff.name}
                                  </AppTypography>
                                }
                              />
                              <Chip
                                label={staff.role}
                                size="small"
                                color={staff.role === "security" ? "error" : "secondary"}
                                sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>

                    {/* Quick Assign Dropdown */}
                    <Box sx={{ mt: "auto" }}>
                      <FormControl fullWidth size="small">
                        <InputLabel id={`quick-assign-label-${area.id}`} sx={{ fontSize: "0.8rem" }}>
                          + Tugaskan Staff Ke Sini
                        </InputLabel>
                        <Select
                          labelId={`quick-assign-label-${area.id}`}
                          value=""
                          label="+ Tugaskan Staff Ke Sini"
                          onChange={(e) => handleQuickAssign(e.target.value as string, area.id)}
                          sx={{ borderRadius: 2, fontSize: "0.8rem" }}
                        >
                          <MenuItem value="" disabled sx={{ fontSize: "0.8rem" }}>
                            <em>Pilih Staff Mandiri</em>
                          </MenuItem>
                          {unassignedStaffs.length === 0 ? (
                            <MenuItem value="" disabled sx={{ fontSize: "0.8rem" }}>
                              Tidak ada staff luang
                            </MenuItem>
                          ) : (
                            unassignedStaffs.map((staff) => (
                              <MenuItem key={staff.id} value={staff.id} sx={{ fontSize: "0.8rem" }}>
                                {staff.name} ({staff.role})
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add Area Dialog Form */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Buat Area Baru"
        type="form"
        actions={
          <Stack direction="row" spacing={1.5} sx={{ width: "100%", justifyContent: "flex-end" }}>
            <AppButton variant="outlined" label="Batal" onClick={() => setFormOpen(false)} />
            <AppButton
              variant="contained"
              label="Tambahkan Area"
              onClick={handleSave}
              disabled={!areaName.trim()}
            />
          </Stack>
        }
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Nama Area / Lokasi"
            placeholder="Contoh: Pintu Utama, Stage Utama, Area Konsumsi..."
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
            slotProps={{
              input: { sx: { borderRadius: 2 } },
            }}
          />
        </Stack>
      </Modal>

      {/* Delete Area Confirmation Modal */}
      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Hapus Area Event"
        type="confirm"
        severity="error"
        confirmLabel="Ya, Hapus Area"
        cancelLabel="Batal"
        onConfirm={handleConfirmDelete}
      >
        Apakah Anda yakin ingin menghapus area **&quot;{targetArea?.name}&quot;**? 
        Semua staff yang saat ini bertugas di area ini akan otomatis dibebastugaskan (*unassigned*).
      </Modal>
    </AdminShell>
  );
}
