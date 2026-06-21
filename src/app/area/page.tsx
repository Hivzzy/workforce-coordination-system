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
  Tabs,
  Tab,
  Slider,
  Paper,
  IconButton,
} from "@mui/material";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import MapIcon from "@mui/icons-material/Map";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridOnIcon from "@mui/icons-material/GridOn";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import AppTypography from "@/components/AppTypography";
import AppButton from "@/components/AppButton";
import Modal from "@/components/Modal";
import AdminShell from "@/components/AdminShell";
import { Area } from "@/features/area/types/area.types";

export default function AreaPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const { areas, addArea, removeArea, updateArea } = useAreaStore();
  const { staffs, assignStaffToArea } = useStaffStore();
  const router = useRouter();

  // Navigation tab: 0 = Cards View, 1 = Spatial Denah View
  const [activeTab, setActiveTab] = useState(0);

  // Selected area for editor panel
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  // Local state for modals & forms
  const [areaNameInput, setAreaNameInput] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetArea, setTargetArea] = useState<Area | null>(null);

  // Mouse drag & drop state variables
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, areaX: 0, areaY: 0 });

  // Route protection
  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.push("/login");
    } else if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, hasHydrated, router]);

  // Drag listeners handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeDragId) return;
      const canvasElement = document.getElementById("spatial-canvas");
      if (!canvasElement) return;

      const rect = canvasElement.getBoundingClientRect();
      const draggedArea = areas.find((a) => a.id === activeDragId);
      if (!draggedArea) return;

      const areaW = draggedArea.w || 160;
      const areaH = draggedArea.h || 120;

      // Calculate translation in pixels
      const deltaX = e.clientX - dragStart.mouseX;
      const deltaY = e.clientY - dragStart.mouseY;

      // Convert pixels delta to canvas percentage offsets
      const deltaPercentX = (deltaX / rect.width) * 100;
      const deltaPercentY = (deltaY / rect.height) * 100;

      const maxPercentX = 100 - (areaW / rect.width) * 100;
      const maxPercentY = 100 - (areaH / rect.height) * 100;

      // Compute snapped positions (2% grid alignment snapping)
      let newX = dragStart.areaX + deltaPercentX;
      let newY = dragStart.areaY + deltaPercentY;

      // Restrict block boundary within the canvas frame
      newX = Math.max(0, Math.min(maxPercentX, newX));
      newY = Math.max(0, Math.min(maxPercentY, newY));

      // Snapping to nearest 2%
      newX = Math.round(newX / 2) * 2;
      newY = Math.round(newY / 2) * 2;

      updateArea(activeDragId, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setActiveDragId(null);
    };

    if (activeDragId) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeDragId, dragStart, areas, updateArea]);

  if (!hasHydrated || !user || user.role !== "admin") return null;

  // Verify admin authorization prior to updating store
  const verifyAdminAuth = () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized action");
    }
  };

  const handleOpenAddForm = () => {
    setAreaNameInput("");
    setAddModalOpen(true);
  };

  const handleSaveArea = () => {
    if (!areaNameInput.trim()) return;

    verifyAdminAuth();
    
    // Assign cascaded coordinates so newly created items stack neatly instead of overlapping
    const count = areas.length;
    const defaultX = Math.min(60, 10 + (count % 5) * 8);
    const defaultY = Math.min(60, 10 + Math.floor(count / 5) * 12);

    addArea({
      id: Date.now().toString(),
      name: areaNameInput.trim(),
      x: defaultX,
      y: defaultY,
      w: 160,
      h: 120,
    });

    setAddModalOpen(false);
    setAreaNameInput("");
  };

  const handleOpenDeleteConfirm = (area: Area) => {
    setTargetArea(area);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!targetArea) return;

    verifyAdminAuth();

    // Reset area assignments for all staff members assigned to this location
    const assignedStaffs = staffs.filter((s) => s.assignedAreaId === targetArea.id);
    assignedStaffs.forEach((staff) => {
      assignStaffToArea(staff.id, "");
    });

    removeArea(targetArea.id);
    setDeleteConfirmOpen(false);
    setTargetArea(null);
    if (selectedAreaId === targetArea.id) {
      setSelectedAreaId(null);
    }
  };

  const handleDragStart = (e: React.MouseEvent, area: Area) => {
    if (e.button !== 0) return; // Only drag on left click
    e.preventDefault();

    verifyAdminAuth();
    setActiveDragId(area.id);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      areaX: area.x ?? 10,
      areaY: area.y ?? 10,
    });
    setSelectedAreaId(area.id);
  };

  const handleStaffAssign = (staffId: string, areaId: string) => {
    verifyAdminAuth();
    assignStaffToArea(staffId, areaId);
  };

  const getStaffByArea = (areaId: string) => {
    return staffs.filter((s) => s.assignedAreaId === areaId);
  };

  const selectedArea = areas.find((a) => a.id === selectedAreaId);
  const selectedAreaStaffs = selectedArea ? getStaffByArea(selectedArea.id) : [];
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
          mb: 3,
        }}
      >
        <Box>
          <AppTypography preset="pageTitle">Manajemen Layout (Denah Event)</AppTypography>
          <AppTypography preset="helperText" color="text.secondary">
            Susun denah spatial event, geser lokasi, serta koordinasikan penugasan staff secara interaktif.
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

      {/* Tabs View Selector */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{
          mb: 4,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            fontWeight: "bold",
            fontFamily: "var(--font-poppins)",
            textTransform: "none",
          },
        }}
      >
        <Tab icon={<ViewListIcon />} iconPosition="start" label="Daftar Kartu" />
        <Tab icon={<GridOnIcon />} iconPosition="start" label="Denah Spatial (Visual)" />
      </Tabs>

      {/* TAB CONTENT: CARDS LIST */}
      {activeTab === 0 && (
        <>
          {areas.length === 0 ? (
            <Card sx={{ p: 6, textAlign: "center" }}>
              <MapIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2, opacity: 0.5 }} />
              <AppTypography preset="sectionTitle" color="text.secondary">
                Belum Ada Area Terdaftar
              </AppTypography>
              <AppButton
                onClick={handleOpenAddForm}
                label="Buat Area Sekarang"
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
              />
            </Card>
          ) : (
            <Grid container spacing={3}>
              {areas.map((area) => {
                const assigned = getStaffByArea(area.id);
                return (
                  <Grid key={area.id} size={{ xs: 12, md: 6, lg: 4 }}>
                    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                      <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
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
                            sx={{ py: 0.5, px: 1.2, fontSize: "0.75rem" }}
                          />
                        </Box>
                        <Divider sx={{ mb: 2, opacity: 0.4 }} />

                        <Box sx={{ mb: 2, flexGrow: 1 }}>
                          <AppTypography preset="helperText" sx={{ fontWeight: "bold", mb: 1, color: "text.secondary" }}>
                            Staff Bertugas ({assigned.length})
                          </AppTypography>
                          {assigned.length === 0 ? (
                            <AppTypography preset="helperText" sx={{ fontStyle: "italic", color: "text.secondary" }}>
                              Belum ada staff di area ini.
                            </AppTypography>
                          ) : (
                            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
                              {assigned.map((staff) => (
                                <Chip
                                  key={staff.id}
                                  label={`${staff.name} (${staff.role})`}
                                  size="small"
                                  color={staff.role === "security" ? "error" : "secondary"}
                                />
                              ))}
                            </Stack>
                          )}
                        </Box>

                        <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                          <InputLabel id={`assign-staff-select-${area.id}`}>+ Tambah Staff Ke Sini</InputLabel>
                          <Select
                            labelId={`assign-staff-select-${area.id}`}
                            value=""
                            label="+ Tambah Staff Ke Sini"
                            onChange={(e) => handleStaffAssign(e.target.value, area.id)}
                          >
                            <MenuItem value="" disabled>Pilih Staff Luang</MenuItem>
                            {unassignedStaffs.length === 0 ? (
                              <MenuItem value="" disabled>Tidak ada staff luang</MenuItem>
                            ) : (
                              unassignedStaffs.map((staff) => (
                                <MenuItem key={staff.id} value={staff.id}>
                                  {staff.name} ({staff.role})
                                </MenuItem>
                              ))
                            )}
                          </Select>
                        </FormControl>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}

      {/* TAB CONTENT: SPATIAL CANVAS BUILDER */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Spatial Canvas Map */}
          <Grid size={{ xs: 12, lg: selectedAreaId ? 8 : 12 }}>
            <Paper
              variant="outlined"
              id="spatial-canvas"
              sx={{
                height: 550,
                position: "relative",
                backgroundColor: (theme) => theme.palette.mode === "dark" ? "#121214" : "#f1f5f9",
                backgroundImage: (theme) =>
                  theme.palette.mode === "dark"
                    ? "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)"
                    : "radial-gradient(rgba(15, 23, 42, 0.08) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              {areas.length === 0 ? (
                <Box sx={{ display: "flex", height: "100%", flexDirection: "column", justifyContent: "center", alignItems: "center", p: 3 }}>
                  <MapIcon sx={{ fontSize: 64, color: "text.secondary", opacity: 0.3, mb: 1 }} />
                  <AppTypography preset="sectionTitle" color="text.secondary">Kanvas Denah Kosong</AppTypography>
                  <AppTypography preset="helperText" color="text.secondary" sx={{ mt: 1 }}>
                    Buat area event baru terlebih dahulu untuk menyusun denah tata letak spatial.
                  </AppTypography>
                </Box>
              ) : (
                areas.map((area) => {
                  const isSelected = selectedAreaId === area.id;
                  const assigned = getStaffByArea(area.id);
                  const areaW = area.w || 160;
                  const areaH = area.h || 120;
                  const leftPos = area.x ?? 10;
                  const topPos = area.y ?? 10;

                  return (
                    <Paper
                      key={area.id}
                      elevation={isSelected ? 6 : 2}
                      sx={{
                        position: "absolute",
                        left: `${leftPos}%`,
                        top: `${topPos}%`,
                        width: areaW,
                        height: areaH,
                        border: "2px solid",
                        borderColor: isSelected ? "primary.main" : "divider",
                        borderRadius: 3,
                        cursor: activeDragId === area.id ? "grabbing" : "grab",
                        userSelect: "none",
                        backgroundColor: (theme) =>
                          isSelected
                            ? theme.palette.mode === "dark"
                              ? "rgba(99, 102, 241, 0.15)"
                              : "rgba(99, 102, 241, 0.05)"
                            : theme.palette.background.paper,
                        transition: activeDragId === area.id ? "none" : "border-color 0.2s ease, box-shadow 0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        p: 1.5,
                        overflow: "hidden",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAreaId(area.id);
                      }}
                    >
                      {/* Drag Handle Top Banner */}
                      <Box
                        onMouseDown={(e) => handleDragStart(e, area)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "grab",
                          "&:active": { cursor: "grabbing" },
                          pb: 1,
                        }}
                      >
                        <AppTypography
                          preset="helperText"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            maxWidth: "80%",
                          }}
                        >
                          {area.name}
                        </AppTypography>
                        <OpenWithIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      </Box>
                      <Divider sx={{ mb: 1, opacity: 0.5 }} />

                      {/* Staff Count badge & names */}
                      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                        <AppTypography preset="helperText" sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: "bold", mb: 0.5 }}>
                          STAFF ({assigned.length})
                        </AppTypography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, maxHeight: "50px", overflowY: "auto" }}>
                          {assigned.length === 0 ? (
                            <AppTypography preset="helperText" sx={{ fontStyle: "italic", fontSize: "0.65rem", color: "text.secondary" }}>
                              Kosong
                            </AppTypography>
                          ) : (
                            assigned.map((staff) => (
                              <Chip
                                key={staff.id}
                                label={staff.name.split(" ")[0]}
                                size="small"
                                variant="outlined"
                                color={staff.role === "security" ? "error" : "secondary"}
                                sx={{
                                  fontSize: "0.65rem",
                                  height: 18,
                                  "& .MuiChip-label": { px: 0.8 },
                                }}
                              />
                            ))
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </Paper>
          </Grid>

          {/* Canvas Inspector Sidebar Panel */}
          {selectedAreaId && selectedArea && (
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Editor Title & Close */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SettingsIcon color="primary" />
                      <AppTypography preset="sectionTitle" sx={{ fontWeight: 800 }}>Inspector Area</AppTypography>
                    </Box>
                    <IconButton size="small" onClick={() => setSelectedAreaId(null)}>
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  <Stack spacing={3}>
                    {/* Rename area input */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Nama Area"
                      value={selectedArea.name}
                      onChange={(e) => {
                        verifyAdminAuth();
                        updateArea(selectedArea.id, { name: e.target.value });
                      }}
                      slotProps={{
                        input: { sx: { borderRadius: 2 } },
                      }}
                    />

                    <Divider />

                    {/* Sizing Sliders */}
                    <Box>
                      <AppTypography preset="helperText" sx={{ fontWeight: "bold", mb: 1 }}>Lebar Blok (Width: {selectedArea.w || 160}px)</AppTypography>
                      <Slider
                        value={selectedArea.w || 160}
                        min={120}
                        max={300}
                        step={10}
                        onChange={(_, val) => {
                          verifyAdminAuth();
                          updateArea(selectedArea.id, { w: val as number });
                        }}
                        valueLabelDisplay="auto"
                      />
                    </Box>

                    <Box>
                      <AppTypography preset="helperText" sx={{ fontWeight: "bold", mb: 1 }}>Tinggi Blok (Height: {selectedArea.h || 120}px)</AppTypography>
                      <Slider
                        value={selectedArea.h || 120}
                        min={80}
                        max={250}
                        step={10}
                        onChange={(_, val) => {
                          verifyAdminAuth();
                          updateArea(selectedArea.id, { h: val as number });
                        }}
                        valueLabelDisplay="auto"
                      />
                    </Box>

                    <Divider />

                    {/* Quick Add staff from inspector */}
                    <FormControl fullWidth size="small">
                      <InputLabel id="inspector-assign-select">+ Tugaskan Staff Ke Sini</InputLabel>
                      <Select
                        labelId="inspector-assign-select"
                        value=""
                        label="+ Tugaskan Staff Ke Sini"
                        onChange={(e) => handleStaffAssign(e.target.value, selectedArea.id)}
                      >
                        <MenuItem value="" disabled>Pilih Staff Luang</MenuItem>
                        {unassignedStaffs.length === 0 ? (
                          <MenuItem value="" disabled>Tidak ada staff luang</MenuItem>
                        ) : (
                          unassignedStaffs.map((staff) => (
                            <MenuItem key={staff.id} value={staff.id}>
                              {staff.name} ({staff.role})
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>

                    {/* Assigned staff list in inspector */}
                    <Box>
                      <AppTypography preset="helperText" sx={{ fontWeight: "bold", mb: 1, color: "text.secondary" }}>
                        Daftar Personil Terpeta ({selectedAreaStaffs.length})
                      </AppTypography>
                      {selectedAreaStaffs.length === 0 ? (
                        <AppTypography preset="helperText" sx={{ fontStyle: "italic", color: "text.secondary" }}>
                          Tidak ada staff bertugas.
                        </AppTypography>
                      ) : (
                        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                          <List disablePadding>
                            {selectedAreaStaffs.map((staff) => (
                              <ListItem
                                key={staff.id}
                                sx={{
                                  py: 0.8,
                                  px: 1.5,
                                  borderBottom: "1px solid",
                                  borderColor: "divider",
                                  "&:last-child": { borderBottom: "none" },
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <AppTypography preset="bodyText" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                      {staff.name}
                                    </AppTypography>
                                  }
                                  secondary={
                                    <AppTypography preset="helperText" sx={{ fontSize: "0.75rem", textTransform: "uppercase" }}>
                                      {staff.role}
                                    </AppTypography>
                                  }
                                />
                                <AppButton
                                  variant="outlined"
                                  color="error"
                                  label="Lepas"
                                  onClick={() => handleStaffAssign(staff.id, "")}
                                  sx={{ py: 0.3, px: 1, fontSize: "0.7rem", minWidth: 50 }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      )}
                    </Box>

                    <Divider />

                    {/* Delete Area from Inspector */}
                    <AppButton
                      variant="contained"
                      color="error"
                      label="Hapus Area Ini"
                      onClick={() => handleOpenDeleteConfirm(selectedArea)}
                      sx={{ py: 1.2, width: "100%" }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Modals & Confirmation Overlays */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Buat Area Baru"
        type="form"
        actions={
          <Stack direction="row" spacing={1.5} sx={{ width: "100%", justifyContent: "flex-end" }}>
            <AppButton variant="outlined" label="Batal" onClick={() => setAddModalOpen(false)} />
            <AppButton variant="contained" label="Tambahkan Area" onClick={handleSaveArea} disabled={!areaNameInput.trim()} />
          </Stack>
        }
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Nama Area / Lokasi"
            placeholder="Contoh: Pintu Masuk, Stage Utama, Area Prasmanan..."
            value={areaNameInput}
            onChange={(e) => setAreaNameInput(e.target.value)}
            slotProps={{
              input: { sx: { borderRadius: 2 } },
            }}
          />
        </Stack>
      </Modal>

      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Konfirmasi Hapus Area"
        type="confirm"
        severity="error"
        confirmLabel="Ya, Hapus Area"
        cancelLabel="Batal"
        onConfirm={handleConfirmDelete}
      >
        Apakah Anda yakin ingin menghapus area **&quot;{targetArea?.name}&quot;**? 
        Semua staff yang bertugas di area ini akan otomatis dibebastugaskan (*unassigned*).
      </Modal>
    </AdminShell>
  );
}
