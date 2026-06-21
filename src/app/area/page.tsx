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
import BusinessIcon from "@mui/icons-material/Business";
import RouteIcon from "@mui/icons-material/Route";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridOnIcon from "@mui/icons-material/GridOn";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import AppTypography from "@/components/AppTypography";
import AppButton from "@/components/AppButton";
import Modal from "@/components/Modal";
import AdminShell from "@/components/AdminShell";
import { Area, AreaType } from "@/features/area/types/area.types";

const COLOR_SWATCHES = [
  "#6366f1", // Indigo
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#f43f5e", // Rose
  "#8b5cf6", // Violet
  "#64748b", // Slate
  "#475569", // Dark Slate
];

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
  const [areaTypeInput, setAreaTypeInput] = useState<AreaType>("zone");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetArea, setTargetArea] = useState<Area | null>(null);

  // Mouse drag & drop state variables
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, areaX: 0, areaY: 0 });

  // Mouse resize state variables
  const [activeResizeId, setActiveResizeId] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ mouseX: 0, mouseY: 0, initialW: 0, initialH: 0 });

  // Route protection
  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.push("/login");
    } else if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, hasHydrated, router]);

  // Drag mousemove listener handler
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

      let newX = dragStart.areaX + deltaPercentX;
      let newY = dragStart.areaY + deltaPercentY;

      // Restrict block boundary within the canvas frame
      newX = Math.max(0, Math.min(maxPercentX, newX));
      newY = Math.max(0, Math.min(maxPercentY, newY));

      // Snapping to nearest 2% grid
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

  // Resize mousemove listener handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeResizeId) return;

      const deltaX = e.clientX - resizeStart.mouseX;
      const deltaY = e.clientY - resizeStart.mouseY;

      let newW = resizeStart.initialW + deltaX;
      let newH = resizeStart.initialH + deltaY;

      // Dimension boundaries
      newW = Math.max(80, newW);
      newH = Math.max(40, newH);

      // Grid snap to nearest 10px
      newW = Math.round(newW / 10) * 10;
      newH = Math.round(newH / 10) * 10;

      updateArea(activeResizeId, { w: newW, h: newH });
    };

    const handleMouseUp = () => {
      setActiveResizeId(null);
    };

    if (activeResizeId) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeResizeId, resizeStart, updateArea]);

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
    setAreaTypeInput("zone");
    setAddModalOpen(true);
  };

  const handleQuickAdd = (type: AreaType) => {
    verifyAdminAuth();
    
    // Auto-generate name based on type
    let name = "Zona Baru";
    let defaultColor = COLOR_SWATCHES[0];
    
    if (type === "building") {
      name = `Gedung ${String.fromCharCode(65 + (areas.filter(a => a.type === "building").length % 26))}`;
      defaultColor = "#475569";
    } else if (type === "road") {
      name = "Jalan Baru";
      defaultColor = "#1e293b";
    } else if (type === "parking") {
      name = `Area Parkir ${areas.filter(a => a.type === "parking").length + 1}`;
      defaultColor = "#64748b";
    }

    const count = areas.length;
    const defaultX = Math.min(60, 15 + (count % 4) * 10);
    const defaultY = Math.min(60, 15 + Math.floor(count / 4) * 12);

    const newId = Date.now().toString();
    addArea({
      id: newId,
      name,
      type,
      x: defaultX,
      y: defaultY,
      color: defaultColor,
    });

    // Auto-select the newly added element so user can resize/drag immediately
    setSelectedAreaId(newId);
    setActiveTab(1); // Auto toggle to Spatial view
  };

  const handleSaveArea = () => {
    if (!areaNameInput.trim()) return;

    verifyAdminAuth();
    
    const count = areas.length;
    const defaultX = Math.min(60, 15 + (count % 4) * 10);
    const defaultY = Math.min(60, 15 + Math.floor(count / 4) * 12);

    addArea({
      id: Date.now().toString(),
      name: areaNameInput.trim(),
      type: areaTypeInput,
      x: defaultX,
      y: defaultY,
      color: areaTypeInput === "zone" ? COLOR_SWATCHES[0] : "#475569",
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

  const handleResizeStart = (e: React.MouseEvent, area: Area) => {
    if (e.button !== 0) return; // Only resize on left click
    e.preventDefault();
    e.stopPropagation(); // Avoid triggering dragging

    verifyAdminAuth();
    setActiveResizeId(area.id);
    setResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialW: area.w || 160,
      initialH: area.h || 120,
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

  // Render type-specific layout contents inside canvas blocks
  const renderBlockContent = (area: Area, assigned: typeof staffs) => {
    const type = area.type || "zone";

    switch (type) {
      case "building":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", color: "white", gap: 0.5 }}>
            <BusinessIcon sx={{ fontSize: 28, opacity: 0.8 }} />
            <AppTypography preset="bodyText" sx={{ color: "white", fontWeight: "bold", fontSize: "0.85rem", textAlign: "center" }}>
              {area.name}
            </AppTypography>
          </Box>
        );
      case "road":
        return (
          <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
            {/* Center Yellow Dashed Line representing road path */}
            <Box sx={{ position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", borderTop: "2px dashed #eab308", opacity: 0.8 }} />
            <AppTypography preset="helperText" sx={{ position: "relative", color: "rgba(255, 255, 255, 0.7)", fontWeight: "bold", letterSpacing: "0.1em", fontSize: "0.7rem", textTransform: "uppercase" }}>
              {area.name}
            </AppTypography>
          </Box>
        );
      case "parking":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", gap: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", bgcolor: "white", color: "primary.main", fontWeight: "bold", fontSize: "0.95rem" }}>
              P
            </Box>
            <AppTypography preset="helperText" sx={{ color: "white", fontWeight: "bold", fontSize: "0.75rem", textAlign: "center" }}>
              {area.name}
            </AppTypography>
          </Box>
        );
      default:
        // 'zone'
        return (
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
            <AppTypography preset="helperText" sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: "bold", mb: 0.5 }}>
              STAFF ({assigned.length})
            </AppTypography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, flexGrow: 1, overflowY: "auto" }}>
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
        );
    }
  };

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
            Petakan jalan, gedung, area parkir, serta zona tugas secara interaktif (geser dan perbesar blok langsung di kanvas).
          </AppTypography>
        </Box>

        <AppButton
          onClick={handleOpenAddForm}
          label="Buat Kustom"
          variant="outlined"
          color="primary"
          startIcon={<AddLocationAltIcon />}
          sx={{ py: 1.2, px: 2.5 }}
        />
      </Box>

      {/* Tabs View Selector & Quick Addition toolbar */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 4, borderBottom: 1, borderColor: "divider", justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" } }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
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

        {activeTab === 1 && (
          <Stack direction="row" spacing={1} useFlexGap sx={{ pb: 1, gap: 1, flexWrap: "wrap" }}>
            <AppButton onClick={() => handleQuickAdd("zone")} label="+ Zona Tugas" size="small" variant="contained" color="primary" sx={{ borderRadius: 1.5, py: 0.6, fontSize: "0.75rem" }} />
            <AppButton onClick={() => handleQuickAdd("building")} label="+ Gedung" size="small" variant="contained" color="secondary" sx={{ borderRadius: 1.5, py: 0.6, fontSize: "0.75rem" }} />
            <AppButton onClick={() => handleQuickAdd("road")} label="+ Jalan" size="small" variant="contained" color="primary" sx={{ borderRadius: 1.5, py: 0.6, fontSize: "0.75rem", bgcolor: "#1e293b", "&:hover": { bgcolor: "#0f172a" } }} />
            <AppButton onClick={() => handleQuickAdd("parking")} label="+ Parkir" size="small" variant="contained" color="secondary" sx={{ borderRadius: 1.5, py: 0.6, fontSize: "0.75rem", bgcolor: "#64748b", "&:hover": { bgcolor: "#475569" } }} />
          </Stack>
        )}
      </Stack>

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
                            {area.type === "building" ? (
                              <BusinessIcon sx={{ color: area.color || "secondary.main" }} />
                            ) : area.type === "road" ? (
                              <RouteIcon sx={{ color: area.color || "text.secondary" }} />
                            ) : area.type === "parking" ? (
                              <LocalParkingIcon sx={{ color: area.color || "primary.main" }} />
                            ) : (
                              <MapIcon color="primary" />
                            )}
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
                        <AppTypography preset="helperText" sx={{ mt: -1.2, mb: 1, textTransform: "uppercase", fontSize: "0.65rem", fontWeight: "bold", color: "text.secondary" }}>
                          Tipe: {area.type || "zone"}
                        </AppTypography>
                        <Divider sx={{ mb: 2, opacity: 0.4 }} />

                        {/* Render staff lists only for standard assignment zones */}
                        {(area.type || "zone") === "zone" ? (
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
                        ) : (
                          <Box sx={{ mb: 2, flexGrow: 1 }}>
                            <AppTypography preset="helperText" sx={{ fontStyle: "italic", color: "text.secondary" }}>
                              Elemen struktural denah (tidak menerima penugasan staff).
                            </AppTypography>
                          </Box>
                        )}

                        {(area.type || "zone") === "zone" && (
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
                        )}
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
                backgroundColor: (theme) => theme.palette.mode === "dark" ? "#121214" : "#f8fafc",
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
              onClick={() => setSelectedAreaId(null)} // Click canvas to clear selection
            >
              {areas.length === 0 ? (
                <Box sx={{ display: "flex", height: "100%", flexDirection: "column", justifyContent: "center", alignItems: "center", p: 3 }}>
                  <MapIcon sx={{ fontSize: 64, color: "text.secondary", opacity: 0.3, mb: 1 }} />
                  <AppTypography preset="sectionTitle" color="text.secondary">Kanvas Denah Kosong</AppTypography>
                  <AppTypography preset="helperText" color="text.secondary" sx={{ mt: 1 }}>
                    Tambahkan elemen denah (zona, gedung, jalan, parkir) menggunakan menu di atas.
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
                  const isZone = (area.type || "zone") === "zone";

                  // Type-specific color palette defaults
                  const getBGColor = () => {
                    if (area.color) return area.color;
                    if (area.type === "building") return "#475569";
                    if (area.type === "road") return "#1e293b";
                    if (area.type === "parking") return "#64748b";
                    return "#ffffff";
                  };

                  return (
                    <Paper
                      key={area.id}
                      elevation={isSelected ? 6 : 1}
                      sx={{
                        position: "absolute",
                        left: `${leftPos}%`,
                        top: `${topPos}%`,
                        width: areaW,
                        height: areaH,
                        border: "2px solid",
                        borderColor: isSelected ? "primary.main" : "transparent",
                        borderRadius: isZone ? 3 : 2,
                        cursor: activeDragId === area.id ? "grabbing" : "grab",
                        userSelect: "none",
                        backgroundColor: getBGColor(),
                        color: isZone ? "text.primary" : "white",
                        display: "flex",
                        flexDirection: "column",
                        p: isZone ? 1.5 : 1,
                        boxShadow: isSelected
                          ? "0 10px 25px rgba(99, 102, 241, 0.25)"
                          : "0 4px 12px rgba(0,0,0,0.05)",
                        transition: activeDragId === area.id || activeResizeId === area.id ? "none" : "border-color 0.2s ease, box-shadow 0.2s ease",
                        boxSizing: "border-box",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAreaId(area.id);
                      }}
                    >
                      {/* Drag Handle Top Banner (For zones only; other blocks drag directly from canvas body) */}
                      <Box
                        onMouseDown={(e) => handleDragStart(e, area)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "grab",
                          "&:active": { cursor: "grabbing" },
                          pb: isZone ? 1 : 0,
                          flexShrink: 0,
                        }}
                      >
                        {isZone && (
                          <>
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
                          </>
                        )}
                      </Box>
                      {isZone && <Divider sx={{ mb: 1, opacity: 0.5 }} />}

                      {/* Shape contents */}
                      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                        {renderBlockContent(area, assigned)}
                      </Box>

                      {/* On-Canvas Drag-To-Resize Handle (Only visible when block is selected) */}
                      {isSelected && (
                        <Box
                          onMouseDown={(e) => handleResizeStart(e, area)}
                          sx={{
                            position: "absolute",
                            bottom: 2,
                            right: 2,
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                            border: "2px solid white",
                            cursor: "nwse-resize",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                            zIndex: 100,
                          }}
                        >
                          <svg width="6" height="6" viewBox="0 0 100 100" fill="white">
                            <polygon points="0,100 100,100 100,0" />
                          </svg>
                        </Box>
                      )}
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
                      <AppTypography preset="sectionTitle" sx={{ fontWeight: 800 }}>Inspector Elemen</AppTypography>
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
                      label="Nama Elemen"
                      value={selectedArea.name}
                      onChange={(e) => {
                        verifyAdminAuth();
                        updateArea(selectedArea.id, { name: e.target.value });
                      }}
                      slotProps={{
                        input: { sx: { borderRadius: 2 } },
                      }}
                    />

                    {/* Element Type Tag */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AppTypography preset="helperText" sx={{ fontWeight: "bold" }}>Tipe Struktur:</AppTypography>
                      <Chip
                        label={selectedArea.type || "zone"}
                        size="small"
                        color={selectedArea.type === "zone" ? "primary" : "secondary"}
                        sx={{ textTransform: "uppercase", fontWeight: "bold", fontSize: "0.7rem" }}
                      />
                    </Box>

                    <Divider />

                    {/* Width / Height display (sliders as backup configuration tool) */}
                    <Box>
                      <AppTypography preset="helperText" sx={{ fontWeight: "bold", mb: 1 }}>Lebar (Width: {selectedArea.w || 160}px)</AppTypography>
                      <Slider
                        value={selectedArea.w || 160}
                        min={80}
                        max={400}
                        step={10}
                        onChange={(_, val) => {
                          verifyAdminAuth();
                          updateArea(selectedArea.id, { w: val as number });
                        }}
                        valueLabelDisplay="auto"
                      />
                    </Box>

                    <Box>
                      <AppTypography preset="helperText" sx={{ fontWeight: "bold", mb: 1 }}>Tinggi (Height: {selectedArea.h || 120}px)</AppTypography>
                      <Slider
                        value={selectedArea.h || 120}
                        min={40}
                        max={300}
                        step={10}
                        onChange={(_, val) => {
                          verifyAdminAuth();
                          updateArea(selectedArea.id, { h: val as number });
                        }}
                        valueLabelDisplay="auto"
                      />
                    </Box>

                    <Divider />

                    {/* Color Swatch Customizer for structural blocks */}
                    <Box>
                      <AppTypography preset="helperText" sx={{ fontWeight: "bold", mb: 1.5, display: "flex", alignItems: "center", gap: 0.8 }}>
                        <ColorLensIcon sx={{ fontSize: 18 }} /> Pilih Warna Blok
                      </AppTypography>
                      <Stack direction="row" spacing={1} useFlexGap sx={{ gap: 1, flexWrap: "wrap" }}>
                        {COLOR_SWATCHES.map((color) => (
                          <IconButton
                            key={color}
                            onClick={() => {
                              verifyAdminAuth();
                              updateArea(selectedArea.id, { color });
                            }}
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: color,
                              border: "2px solid",
                              borderColor: selectedArea.color === color ? "primary.main" : "transparent",
                              "&:hover": { bgcolor: color, opacity: 0.8 },
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    {/* Staff assignment tools (Only rendered for 'zone' elements) */}
                    {(selectedArea.type || "zone") === "zone" && (
                      <>
                        <Divider />
                        
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
                      </>
                    )}

                    <Divider />

                    {/* Delete Area from Inspector */}
                    <AppButton
                      variant="contained"
                      color="error"
                      label="Hapus Elemen Ini"
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
        title="Buat Elemen Denah Kustom"
        type="form"
        actions={
          <Stack direction="row" spacing={1.5} sx={{ width: "100%", justifyContent: "flex-end" }}>
            <AppButton variant="outlined" label="Batal" onClick={() => setAddModalOpen(false)} />
            <AppButton variant="contained" label="Tambahkan" onClick={handleSaveArea} disabled={!areaNameInput.trim()} />
          </Stack>
        }
      >
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Nama Elemen"
            placeholder="Masukkan nama elemen (contoh: Gedung A, Jalan Boulevard...)"
            value={areaNameInput}
            onChange={(e) => setAreaNameInput(e.target.value)}
            slotProps={{
              input: { sx: { borderRadius: 2 } },
            }}
          />

          <FormControl fullWidth>
            <InputLabel id="add-type-select-label">Tipe Struktur</InputLabel>
            <Select
              labelId="add-type-select-label"
              value={areaTypeInput}
              label="Tipe Struktur"
              onChange={(e) => setAreaTypeInput(e.target.value as AreaType)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="zone">Zona Tugas Staff (Staff Area)</MenuItem>
              <MenuItem value="building">Struktur Gedung (Building)</MenuItem>
              <MenuItem value="road">Area Jalan / Koridor (Road/Path)</MenuItem>
              <MenuItem value="parking">Area Parkir Kendaraan (Parking)</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Modal>

      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Konfirmasi Hapus Elemen"
        type="confirm"
        severity="error"
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={handleConfirmDelete}
      >
        Apakah Anda yakin ingin menghapus elemen **&quot;{targetArea?.name}&quot;** ({targetArea?.type || "zone"})? 
        Aksi ini tidak dapat dibatalkan dan semua staff bertugas akan dilepaskan penugasannya.
      </Modal>
    </AdminShell>
  );
}
