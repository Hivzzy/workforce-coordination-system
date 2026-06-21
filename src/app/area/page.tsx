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
import ColorLensIcon from "@mui/icons-material/ColorLens";
import StoreIcon from "@mui/icons-material/Store";
import TerrainIcon from "@mui/icons-material/Terrain";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import AppTypography from "@/components/AppTypography";
import AppButton from "@/components/AppButton";
import Modal from "@/components/Modal";
import AdminShell from "@/components/AdminShell";
import { Area, AreaType, Point } from "@/features/area/types/area.types";

// ─── Constants ─────────────────────────────────────────────
const CANVAS_W = 2400;
const CANVAS_H = 1600;

const COLOR_SWATCHES = [
  "#6366f1", "#06b6d4", "#10b981", "#f59e0b",
  "#f43f5e", "#8b5cf6", "#64748b", "#475569",
];

// ─── Helpers ───────────────────────────────────────────────
const isDarkColor = (hex: string) => {
  if (!hex || typeof hex !== "string") return true;
  const c = hex.replace("#", "");
  if (c.length !== 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
};

const bgForType = (t?: string) => {
  if (t === "field") return "#86efac";
  if (t === "building") return "#475569";
  if (t === "road") return "#1e293b";
  if (t === "parking") return "#64748b";
  if (t === "stand") return "#fbbf24";
  return "#6366f1";
};

const centroid = (pts: Point[]): Point => {
  const n = pts.length;
  if (n === 0) return { x: 0, y: 0 };
  const s = pts.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });
  return { x: s.x / n, y: s.y / n };
};

const truncate = (s: string, len = 18) => (s.length > len ? s.slice(0, len) + "…" : s);

type EditorMode = "select" | "draw-polygon" | "draw-road";

// ─── Page Component ────────────────────────────────────────
export default function AreaPage() {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const {
    areas, addArea, removeArea, updateArea,
    updatePoint, translateShape,
  } = useAreaStore();
  const { staffs, assignStaffToArea } = useStaffStore();
  const router = useRouter();

  // ── Tab & Selection ──
  const [activeTab, setActiveTab] = useState(1);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.5);

  // ── Drawing modes ──
  const [editorMode, setEditorMode] = useState<EditorMode>("select");
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);

  // ── Modals ──
  const [areaNameInput, setAreaNameInput] = useState("");
  const [areaTypeInput, setAreaTypeInput] = useState<AreaType>("zone");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetArea, setTargetArea] = useState<Area | null>(null);

  // ── Rect drag ──
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({
    mouseX: 0, mouseY: 0, areaX: 0, areaY: 0, w: 160, h: 120,
  });

  // ── Rect resize ──
  const [activeResizeId, setActiveResizeId] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({
    mouseX: 0, mouseY: 0, initialW: 0, initialH: 0,
  });

  // ── Shape (polygon/road) drag ──
  const [activeShapeDragId, setActiveShapeDragId] = useState<string | null>(null);
  const [shapeDragStart, setShapeDragStart] = useState({
    mouseX: 0, mouseY: 0,
    origPoints: [] as Point[],
    field: "points" as "points" | "waypoints",
  });

  // ── Single-point drag (vertex / waypoint) ──
  const [activePointDrag, setActivePointDrag] = useState<{
    areaId: string; index: number; field: "points" | "waypoints";
    mouseX: number; mouseY: number; origX: number; origY: number;
  } | null>(null);

  // ── Route protection ──
  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) router.push("/login");
    else if (user.role !== "admin") router.push("/dashboard");
  }, [user, hasHydrated, router]);

  // ── Escape key to cancel drawing ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editorMode !== "select") {
        setEditorMode("select");
        setDrawingPoints([]);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [editorMode]);

  // ── RECT DRAG HANDLER ──
  useEffect(() => {
    if (!activeDragId) return;
    const move = (e: MouseEvent) => {
      const dx = ((e.clientX - dragStart.mouseX) / zoom / CANVAS_W) * 100;
      const dy = ((e.clientY - dragStart.mouseY) / zoom / CANVAS_H) * 100;
      const maxX = 100 - (dragStart.w / CANVAS_W) * 100;
      const maxY = 100 - (dragStart.h / CANVAS_H) * 100;
      let nx = Math.max(0, Math.min(maxX, dragStart.areaX + dx));
      let ny = Math.max(0, Math.min(maxY, dragStart.areaY + dy));
      nx = Math.round(nx / 0.5) * 0.5;
      ny = Math.round(ny / 0.5) * 0.5;
      updateArea(activeDragId, { x: nx, y: ny });
    };
    const up = () => setActiveDragId(null);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    return () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
  }, [activeDragId, dragStart, zoom, updateArea]);

  // ── RECT RESIZE HANDLER ──
  useEffect(() => {
    if (!activeResizeId) return;
    const move = (e: MouseEvent) => {
      let nw = resizeStart.initialW + (e.clientX - resizeStart.mouseX) / zoom;
      let nh = resizeStart.initialH + (e.clientY - resizeStart.mouseY) / zoom;
      nw = Math.round(Math.max(30, nw) / 10) * 10;
      nh = Math.round(Math.max(30, nh) / 10) * 10;
      updateArea(activeResizeId, { w: nw, h: nh });
    };
    const up = () => setActiveResizeId(null);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    return () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
  }, [activeResizeId, resizeStart, zoom, updateArea]);

  // ── SHAPE DRAG HANDLER (polygon / road whole-shape) ──
  useEffect(() => {
    if (!activeShapeDragId) return;
    const move = (e: MouseEvent) => {
      const dx = (e.clientX - shapeDragStart.mouseX) / zoom;
      const dy = (e.clientY - shapeDragStart.mouseY) / zoom;
      translateShape(activeShapeDragId, shapeDragStart.field, dx, dy, shapeDragStart.origPoints);
    };
    const up = () => setActiveShapeDragId(null);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    return () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
  }, [activeShapeDragId, shapeDragStart, zoom, translateShape]);

  // ── SINGLE POINT DRAG HANDLER (vertex / waypoint) ──
  useEffect(() => {
    if (!activePointDrag) return;
    const move = (e: MouseEvent) => {
      const dx = (e.clientX - activePointDrag.mouseX) / zoom;
      const dy = (e.clientY - activePointDrag.mouseY) / zoom;
      const nx = Math.round((activePointDrag.origX + dx) / 5) * 5;
      const ny = Math.round((activePointDrag.origY + dy) / 5) * 5;
      updatePoint(activePointDrag.areaId, activePointDrag.field, activePointDrag.index, {
        x: Math.max(0, Math.min(CANVAS_W, nx)),
        y: Math.max(0, Math.min(CANVAS_H, ny)),
      });
    };
    const up = () => setActivePointDrag(null);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    return () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
  }, [activePointDrag, zoom, updatePoint]);

  if (!hasHydrated || !user || user.role !== "admin") return null;

  // ── Auth guard ──
  const verifyAdminAuth = () => {
    const u = useAuthStore.getState().user;
    if (!u || u.role !== "admin") throw new Error("Unauthorized action");
  };

  // ── Determine whether area uses point-based rendering ──
  const isPolygonArea = (a: Area) => !!(a.points && a.points.length >= 3);
  const isRoadArea = (a: Area) => !!(a.waypoints && a.waypoints.length >= 2);

  // ═══════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════

  const handleOpenAddForm = () => { setAreaNameInput(""); setAreaTypeInput("zone"); setAddModalOpen(true); };

  const handleQuickAdd = (type: AreaType) => {
    verifyAdminAuth();
    // Polygon & road types enter draw mode
    if (type === "field") {
      setEditorMode("draw-polygon");
      setDrawingPoints([]);
      setActiveTab(1);
      return;
    }
    if (type === "road") {
      setEditorMode("draw-road");
      setDrawingPoints([]);
      setActiveTab(1);
      return;
    }
    // Rect-based types — instant creation
    let name = "Zona Baru";
    let defaultColor = COLOR_SWATCHES[0];
    if (type === "building") {
      name = `Gedung ${String.fromCharCode(65 + (areas.filter((a) => a.type === "building").length % 26))}`;
      defaultColor = "#475569";
    } else if (type === "parking") {
      name = `Area Parkir ${areas.filter((a) => a.type === "parking").length + 1}`;
      defaultColor = "#64748b";
    } else if (type === "stand") {
      name = `Stan ${areas.filter((a) => a.type === "stand").length + 1}`;
      defaultColor = "#fbbf24";
    }
    const count = areas.length;
    const newId = Date.now().toString();
    addArea({
      id: newId, name, type,
      x: Math.min(60, 15 + (count % 4) * 10),
      y: Math.min(60, 15 + Math.floor(count / 4) * 12),
      color: defaultColor,
    });
    setSelectedAreaId(newId);
    setActiveTab(1);
  };

  const handleFinishDrawing = () => {
    const u = useAuthStore.getState().user;
    if (!u || u.role !== "admin") throw new Error("Unauthorized action");
    const pts = drawingPoints;
    const newId = Date.now().toString();

    if (editorMode === "draw-polygon" && pts.length >= 3) {
      addArea({
        id: newId,
        name: `Lapangan ${areas.filter((a) => a.type === "field").length + 1}`,
        type: "field",
        color: "#86efac",
        points: pts,
        layer: 1,
      });
    } else if (editorMode === "draw-road" && pts.length >= 2) {
      addArea({
        id: newId,
        name: `Jalan ${areas.filter((a) => a.type === "road").length + 1}`,
        type: "road",
        color: "#1e293b",
        waypoints: pts,
        roadWidth: 24,
        layer: 2,
      });
    } else {
      setEditorMode("select");
      setDrawingPoints([]);
      return;
    }

    setSelectedAreaId(newId);
    setEditorMode("select");
    setDrawingPoints([]);
  };

  const handleSaveArea = () => {
    if (!areaNameInput.trim()) return;
    verifyAdminAuth();
    const count = areas.length;
    let defaultColor = COLOR_SWATCHES[0];
    if (areaTypeInput === "field") defaultColor = "#86efac";
    else if (areaTypeInput === "building") defaultColor = "#475569";
    else if (areaTypeInput === "road") defaultColor = "#1e293b";
    else if (areaTypeInput === "parking") defaultColor = "#64748b";
    else if (areaTypeInput === "stand") defaultColor = "#fbbf24";
    addArea({
      id: Date.now().toString(),
      name: areaNameInput.trim(),
      type: areaTypeInput,
      x: Math.min(60, 15 + (count % 4) * 10),
      y: Math.min(60, 15 + Math.floor(count / 4) * 12),
      color: defaultColor,
    });
    setAddModalOpen(false);
    setAreaNameInput("");
  };

  const handleOpenDeleteConfirm = (area: Area) => { setTargetArea(area); setDeleteConfirmOpen(true); };

  const handleConfirmDelete = () => {
    if (!targetArea) return;
    verifyAdminAuth();
    staffs.filter((s) => s.assignedAreaId === targetArea.id).forEach((s) => assignStaffToArea(s.id, ""));
    removeArea(targetArea.id);
    setDeleteConfirmOpen(false);
    setTargetArea(null);
    if (selectedAreaId === targetArea.id) setSelectedAreaId(null);
  };

  // Rect drag start
  const handleRectDragStart = (e: React.MouseEvent, area: Area) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    verifyAdminAuth();
    setActiveDragId(area.id);
    setDragStart({
      mouseX: e.clientX, mouseY: e.clientY,
      areaX: area.x ?? 10, areaY: area.y ?? 10,
      w: area.w || 160, h: area.h || 120,
    });
    setSelectedAreaId(area.id);
  };

  // Shape (polygon/road) drag start
  const handleShapeDragStart = (e: React.MouseEvent, area: Area) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    verifyAdminAuth();
    const field: "points" | "waypoints" = area.waypoints ? "waypoints" : "points";
    const pts = (area[field] || []) as Point[];
    setActiveShapeDragId(area.id);
    setShapeDragStart({ mouseX: e.clientX, mouseY: e.clientY, origPoints: pts, field });
    setSelectedAreaId(area.id);
  };

  // Single point drag start
  const handlePointDragStart = (
    e: React.MouseEvent, areaId: string, index: number,
    field: "points" | "waypoints", pt: Point,
  ) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    verifyAdminAuth();
    setActivePointDrag({
      areaId, index, field,
      mouseX: e.clientX, mouseY: e.clientY,
      origX: pt.x, origY: pt.y,
    });
  };

  // Rect resize start
  const handleResizeStart = (e: React.MouseEvent, area: Area) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    verifyAdminAuth();
    setActiveResizeId(area.id);
    setResizeStart({
      mouseX: e.clientX, mouseY: e.clientY,
      initialW: area.w || 160, initialH: area.h || 120,
    });
    setSelectedAreaId(area.id);
  };

  // Canvas click (drawing mode)
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (editorMode === "select") {
      setSelectedAreaId(null);
      return;
    }
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) / zoom;
    const rawY = (e.clientY - rect.top) / zoom;
    const x = Math.round(rawX / 10) * 10;
    const y = Math.round(rawY / 10) * 10;
    setDrawingPoints((prev) => [...prev, { x, y }]);
  };

  const handleStaffAssign = (staffId: string, areaId: string) => {
    verifyAdminAuth();
    assignStaffToArea(staffId, areaId);
  };

  const getStaffByArea = (areaId: string) => staffs.filter((s) => s.assignedAreaId === areaId);

  const selectedArea = areas.find((a) => a.id === selectedAreaId);
  const selectedAreaStaffs = selectedArea ? getStaffByArea(selectedArea.id) : [];
  const unassignedStaffs = staffs.filter((s) => !s.assignedAreaId);

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  const sortedAreas = [...areas].sort((a, b) => (a.layer || 4) - (b.layer || 4));

  return (
    <AdminShell>
      {/* ── Header ── */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 2, mb: 3 }}>
        <Box>
          <AppTypography preset="pageTitle">Manajemen Layout (Denah Event)</AppTypography>
          <AppTypography preset="helperText" color="text.secondary">
            Gambar denah lapangan, jalan, gedung, dan zona penugasan secara interaktif.
          </AppTypography>
        </Box>
        <AppButton onClick={handleOpenAddForm} label="Buat Kustom" variant="outlined" color="primary" startIcon={<AddLocationAltIcon />} sx={{ py: 1.2, px: 2.5 }} />
      </Box>

      {/* ── Tabs + Toolbar ── */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 4, borderBottom: 1, borderColor: "divider", justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" } }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ "& .MuiTab-root": { fontWeight: "bold", fontFamily: "var(--font-poppins)", textTransform: "none" } }}>
          <Tab icon={<ViewListIcon />} iconPosition="start" label="Daftar Kartu" />
          <Tab icon={<GridOnIcon />} iconPosition="start" label="Denah Spatial (Visual)" />
        </Tabs>

        {activeTab === 1 && (
          <Stack direction="row" spacing={1} useFlexGap sx={{ pb: 1, gap: 1, flexWrap: "wrap" }}>
            {/* Draw mode buttons */}
            <AppButton
              onClick={() => handleQuickAdd("field")}
              label={editorMode === "draw-polygon" ? "✏️ Menggambar…" : "✏️ Gambar Lapangan"}
              size="small" variant={editorMode === "draw-polygon" ? "contained" : "outlined"}
              color="primary"
              sx={{ borderRadius: 1.5, py: 0.6, fontSize: "0.75rem", ...(editorMode === "draw-polygon" ? { bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } } : {}) }}
            />
            <AppButton
              onClick={() => handleQuickAdd("road")}
              label={editorMode === "draw-road" ? "✏️ Menggambar…" : "✏️ Gambar Jalan"}
              size="small" variant={editorMode === "draw-road" ? "contained" : "outlined"}
              color="primary"
              sx={{ borderRadius: 1.5, py: 0.6, fontSize: "0.75rem", ...(editorMode === "draw-road" ? { bgcolor: "#06b6d4", "&:hover": { bgcolor: "#0891b2" } } : {}) }}
            />
            {/* Finish drawing button */}
            {editorMode !== "select" && drawingPoints.length >= 2 && (
              <AppButton
                onClick={handleFinishDrawing}
                label="✅ Selesai"
                size="small" variant="contained" color="primary"
                sx={{ borderRadius: 1.5, py: 0.6, fontSize: "0.75rem" }}
              />
            )}
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            {/* Instant rect buttons */}
            <AppButton onClick={() => handleQuickAdd("building")} label="+ Gedung" size="small" variant="contained" color="secondary" sx={{ borderRadius: 1.5, py: 0.6, fontSize: "0.75rem" }} />
            <AppButton onClick={() => handleQuickAdd("stand")} label="+ Stan" size="small" variant="contained" color="primary" sx={{ borderRadius: 1.5, py: 0.6, fontSize: "0.75rem", bgcolor: "#fbbf24", color: "#000", "&:hover": { bgcolor: "#d97706" } }} />
            <AppButton onClick={() => handleQuickAdd("zone")} label="+ Zona" size="small" variant="contained" color="primary" sx={{ borderRadius: 1.5, py: 0.6, fontSize: "0.75rem" }} />
            <AppButton onClick={() => handleQuickAdd("parking")} label="+ Parkir" size="small" variant="contained" color="secondary" sx={{ borderRadius: 1.5, py: 0.6, fontSize: "0.75rem", bgcolor: "#64748b", "&:hover": { bgcolor: "#475569" } }} />
          </Stack>
        )}
      </Stack>

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB 0 — CARDS LIST                                */}
      {/* ══════════════════════════════════════════════════ */}
      {activeTab === 0 && (
        <>
          {areas.length === 0 ? (
            <Card sx={{ p: 6, textAlign: "center" }}>
              <MapIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2, opacity: 0.5 }} />
              <AppTypography preset="sectionTitle" color="text.secondary">Belum Ada Area Terdaftar</AppTypography>
              <AppButton onClick={handleOpenAddForm} label="Buat Area Sekarang" variant="contained" color="primary" sx={{ mt: 3 }} />
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
                            {area.type === "field" ? <TerrainIcon sx={{ color: area.color || "success.main" }} /> :
                             area.type === "building" ? <BusinessIcon sx={{ color: area.color || "secondary.main" }} /> :
                             area.type === "road" ? <RouteIcon sx={{ color: area.color || "text.secondary" }} /> :
                             area.type === "parking" ? <LocalParkingIcon sx={{ color: area.color || "primary.main" }} /> :
                             area.type === "stand" ? <StoreIcon sx={{ color: area.color || "warning.main" }} /> :
                             <MapIcon color="primary" />}
                            <AppTypography preset="cardTitle" sx={{ fontWeight: 800 }}>{area.name}</AppTypography>
                          </Box>
                          <AppButton variant="outlined" color="error" label="Hapus" onClick={() => handleOpenDeleteConfirm(area)} sx={{ py: 0.5, px: 1.2, fontSize: "0.75rem" }} />
                        </Box>
                        <AppTypography preset="helperText" sx={{ mt: -1.2, mb: 1, textTransform: "uppercase", fontSize: "0.65rem", fontWeight: "bold", color: "text.secondary" }}>
                          Tipe: {area.type || "zone"} {isPolygonArea(area) ? "(polygon)" : isRoadArea(area) ? "(path)" : "(rect)"}
                        </AppTypography>
                        <Divider sx={{ mb: 2, opacity: 0.4 }} />
                        {(area.type || "zone") === "zone" ? (
                          <Box sx={{ mb: 2, flexGrow: 1 }}>
                            <AppTypography preset="helperText" sx={{ fontWeight: "bold", mb: 1, color: "text.secondary" }}>Staff Bertugas ({assigned.length})</AppTypography>
                            {assigned.length === 0 ? (
                              <AppTypography preset="helperText" sx={{ fontStyle: "italic", color: "text.secondary" }}>Belum ada staff di area ini.</AppTypography>
                            ) : (
                              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
                                {assigned.map((s) => <Chip key={s.id} label={`${s.name} (${s.role})`} size="small" color={s.role === "security" ? "error" : "secondary"} />)}
                              </Stack>
                            )}
                          </Box>
                        ) : (
                          <Box sx={{ mb: 2, flexGrow: 1 }}>
                            <AppTypography preset="helperText" sx={{ fontStyle: "italic", color: "text.secondary" }}>Elemen struktural denah.</AppTypography>
                          </Box>
                        )}
                        {(area.type || "zone") === "zone" && (
                          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                            <InputLabel id={`assign-staff-${area.id}`}>+ Tambah Staff</InputLabel>
                            <Select labelId={`assign-staff-${area.id}`} value="" label="+ Tambah Staff" onChange={(e) => handleStaffAssign(e.target.value, area.id)}>
                              <MenuItem value="" disabled>Pilih Staff Luang</MenuItem>
                              {unassignedStaffs.length === 0
                                ? <MenuItem value="" disabled>Tidak ada staff luang</MenuItem>
                                : unassignedStaffs.map((s) => <MenuItem key={s.id} value={s.id}>{s.name} ({s.role})</MenuItem>)}
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

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB 1 — SVG SPATIAL CANVAS                        */}
      {/* ══════════════════════════════════════════════════ */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: selectedAreaId ? 8 : 12 }}>
            {/* Drawing mode hint banner */}
            {editorMode !== "select" && (
              <Paper sx={{ mb: 2, px: 3, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: editorMode === "draw-polygon" ? "#ecfdf5" : "#ecfeff", borderRadius: 3 }}>
                <AppTypography preset="bodyText" sx={{ fontWeight: 700, fontSize: "0.85rem", color: editorMode === "draw-polygon" ? "#065f46" : "#155e75" }}>
                  <EditIcon sx={{ fontSize: 16, mr: 1, verticalAlign: "text-bottom" }} />
                  {editorMode === "draw-polygon"
                    ? `Mode Gambar Polygon — Klik di kanvas untuk menambah titik sudut (${drawingPoints.length} titik)`
                    : `Mode Gambar Jalan — Klik di kanvas untuk menambah titik jalan (${drawingPoints.length} titik)`}
                </AppTypography>
                <Stack direction="row" spacing={1}>
                  {drawingPoints.length >= 2 && (
                    <AppButton onClick={handleFinishDrawing} label="Selesai" size="small" variant="contained" color="primary" startIcon={<CheckIcon />} sx={{ borderRadius: 1.5, py: 0.4, fontSize: "0.75rem" }} />
                  )}
                  <AppButton onClick={() => { setEditorMode("select"); setDrawingPoints([]); }} label="Batal" size="small" variant="outlined" color="error" sx={{ borderRadius: 1.5, py: 0.4, fontSize: "0.75rem" }} />
                </Stack>
              </Paper>
            )}

            <Paper
              variant="outlined"
              sx={{
                height: 700, position: "relative",
                backgroundColor: (t) => t.palette.mode === "dark" ? "#121214" : "#f8fafc",
                border: "1px solid", borderColor: "divider", borderRadius: 4,
                overflow: "auto",
                cursor: editorMode !== "select" ? "crosshair" : "default",
              }}
            >
              {/* Zoom Controls */}
              <Box sx={{
                position: "sticky", top: 12, float: "right", mr: 2, mt: 1.5,
                zIndex: 10, backgroundColor: (t) => t.palette.mode === "dark" ? "rgba(18,18,20,0.85)" : "rgba(255,255,255,0.92)",
                backdropFilter: "blur(4px)", borderRadius: 2.5, border: "1px solid", borderColor: "divider",
                display: "flex", alignItems: "center", gap: 0.5, p: 0.5, boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}>
                <IconButton size="small" disabled={zoom <= 0.3} onClick={() => setZoom((z) => Math.max(0.3, +(z - 0.1).toFixed(1)))} sx={{ color: "text.primary" }}><RemoveIcon sx={{ fontSize: 16 }} /></IconButton>
                <AppTypography preset="helperText" sx={{ minWidth: 40, textAlign: "center", fontWeight: "bold", fontSize: "0.75rem" }}>{Math.round(zoom * 100)}%</AppTypography>
                <IconButton size="small" disabled={zoom >= 2.5} onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(1)))} sx={{ color: "text.primary" }}><AddIcon sx={{ fontSize: 16 }} /></IconButton>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.3 }} />
                <AppButton size="small" variant="outlined" label="100%" onClick={() => setZoom(1.0)} sx={{ py: 0.2, px: 0.8, minWidth: "auto", fontSize: "0.65rem", borderRadius: 1.5 }} />
              </Box>

              {/* ─── SVG CANVAS ─── */}
              <svg
                width={CANVAS_W}
                height={CANVAS_H}
                viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
                style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 0.1s ease-out", display: "block" }}
                onClick={handleCanvasClick}
              >
                {/* Grid pattern */}
                <defs>
                  <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="0.8" fill="rgba(15,23,42,0.08)" />
                  </pattern>
                </defs>
                <rect width={CANVAS_W} height={CANVAS_H} fill="url(#dot-grid)" />

                {/* ── Render all areas sorted by layer ── */}
                {sortedAreas.map((area) => {
                  const sel = selectedAreaId === area.id;
                  const col = area.color || bgForType(area.type);
                  const txtCol = isDarkColor(col) ? "#ffffff" : "#0f172a";

                  // ═══ POLYGON SHAPES ═══
                  if (isPolygonArea(area)) {
                    const pts = area.points!;
                    const ptsStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
                    const c = centroid(pts);
                    return (
                      <g key={area.id}>
                        <polygon
                          points={ptsStr}
                          fill={col} fillOpacity={0.8}
                          stroke={sel ? "#6366f1" : "rgba(0,0,0,0.15)"} strokeWidth={sel ? 3 : 1}
                          style={{ cursor: editorMode !== "select" ? "crosshair" : "grab" }}
                          onMouseDown={editorMode === "select" ? (e) => handleShapeDragStart(e, area) : undefined}
                          onClick={editorMode === "select" ? (e) => { e.stopPropagation(); setSelectedAreaId((prev) => prev === area.id ? null : area.id); } : undefined}
                        />
                        <text x={c.x} y={c.y} textAnchor="middle" dominantBaseline="central"
                          fill={txtCol} fontSize="14" fontWeight="700" fontFamily="var(--font-poppins)"
                          style={{ pointerEvents: "none" }}
                        >{truncate(area.name)}</text>
                        {/* Vertex handles */}
                        {sel && editorMode === "select" && pts.map((pt, i) => (
                          <circle key={i} cx={pt.x} cy={pt.y} r={6 / zoom}
                            fill="#6366f1" stroke="#fff" strokeWidth={2 / zoom}
                            style={{ cursor: "move" }}
                            onMouseDown={(e) => handlePointDragStart(e, area.id, i, "points", pt)}
                          />
                        ))}
                      </g>
                    );
                  }

                  // ═══ ROAD PATHS ═══
                  if (isRoadArea(area)) {
                    const wps = area.waypoints!;
                    const ptsStr = wps.map((p) => `${p.x},${p.y}`).join(" ");
                    const rw = area.roadWidth || 24;
                    const mid = wps[Math.floor(wps.length / 2)];
                    return (
                      <g key={area.id}>
                        {/* Invisible hit area */}
                        <polyline points={ptsStr} fill="none" stroke="transparent"
                          strokeWidth={rw + 20} strokeLinecap="round" strokeLinejoin="round"
                          style={{ cursor: editorMode !== "select" ? "crosshair" : "grab" }}
                          onMouseDown={editorMode === "select" ? (e) => handleShapeDragStart(e, area) : undefined}
                          onClick={editorMode === "select" ? (e) => { e.stopPropagation(); setSelectedAreaId((prev) => prev === area.id ? null : area.id); } : undefined}
                        />
                        {/* Road body */}
                        <polyline points={ptsStr} fill="none" stroke={col}
                          strokeWidth={rw} strokeLinecap="round" strokeLinejoin="round"
                          style={{ pointerEvents: "none" }}
                        />
                        {/* Edge highlights */}
                        <polyline points={ptsStr} fill="none" stroke="rgba(255,255,255,0.08)"
                          strokeWidth={rw - 4} strokeLinecap="round" strokeLinejoin="round"
                          style={{ pointerEvents: "none" }}
                        />
                        {/* Center dashed line */}
                        <polyline points={ptsStr} fill="none" stroke="#fbbf24"
                          strokeWidth={2} strokeDasharray="8 6" strokeLinecap="round"
                          style={{ pointerEvents: "none" }}
                        />
                        {/* Selection outline */}
                        {sel && (
                          <polyline points={ptsStr} fill="none" stroke="#6366f1"
                            strokeWidth={rw + 6} strokeLinecap="round" strokeLinejoin="round"
                            opacity={0.3} style={{ pointerEvents: "none" }}
                          />
                        )}
                        {/* Label */}
                        <text x={mid.x} y={mid.y - rw / 2 - 10} textAnchor="middle" dominantBaseline="central"
                          fill={txtCol} fontSize="11" fontWeight="700" fontFamily="var(--font-poppins)"
                          style={{ pointerEvents: "none" }}
                        >{truncate(area.name)}</text>
                        {/* Waypoint handles */}
                        {sel && editorMode === "select" && wps.map((pt, i) => (
                          <circle key={i} cx={pt.x} cy={pt.y} r={7 / zoom}
                            fill="#06b6d4" stroke="#fff" strokeWidth={2 / zoom}
                            style={{ cursor: "move" }}
                            onMouseDown={(e) => handlePointDragStart(e, area.id, i, "waypoints", pt)}
                          />
                        ))}
                      </g>
                    );
                  }

                  // ═══ RECTANGLE SHAPES ═══
                  const xAbs = ((area.x ?? 10) / 100) * CANVAS_W;
                  const yAbs = ((area.y ?? 10) / 100) * CANVAS_H;
                  const w = area.w || 160;
                  const h = area.h || 120;
                  const rx = (area.type === "zone") ? 8 : 4;

                  return (
                    <g key={area.id}
                      transform={`translate(${xAbs},${yAbs}) rotate(${area.rotation || 0},${w / 2},${h / 2})`}
                      style={{ cursor: editorMode !== "select" ? "crosshair" : activeDragId === area.id ? "grabbing" : "grab" }}
                      onMouseDown={editorMode === "select" ? (e) => handleRectDragStart(e, area) : undefined}
                      onClick={editorMode === "select" ? (e) => { e.stopPropagation(); setSelectedAreaId((prev) => prev === area.id ? null : area.id); } : undefined}
                    >
                      <rect width={w} height={h} rx={rx} fill={col}
                        stroke={sel ? "#6366f1" : "transparent"} strokeWidth={sel ? 3 : 0}
                      />
                      <text x={w / 2} y={h / 2} textAnchor="middle" dominantBaseline="central"
                        fill={txtCol} fontSize="13" fontWeight="700" fontFamily="var(--font-poppins)"
                        style={{ pointerEvents: "none" }}
                      >{truncate(area.name)}</text>
                      {/* Resize handle */}
                      {sel && editorMode === "select" && (
                        <circle cx={w - 2} cy={h - 2} r={6 / zoom}
                          fill="#6366f1" stroke="#fff" strokeWidth={2 / zoom}
                          style={{ cursor: "nwse-resize" }}
                          onMouseDown={(e) => handleResizeStart(e, area)}
                        />
                      )}
                    </g>
                  );
                })}

                {/* ── Drawing preview: Polygon ── */}
                {editorMode === "draw-polygon" && drawingPoints.length > 0 && (
                  <g>
                    <polygon
                      points={drawingPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="rgba(134,239,172,0.25)" stroke="#10b981" strokeWidth={2} strokeDasharray="8 5"
                    />
                    {drawingPoints.map((pt, i) => (
                      <circle key={i} cx={pt.x} cy={pt.y} r={5 / zoom}
                        fill={i === 0 && drawingPoints.length >= 3 ? "#f43f5e" : "#10b981"}
                        stroke="#fff" strokeWidth={2 / zoom}
                        style={{ cursor: i === 0 && drawingPoints.length >= 3 ? "pointer" : "default" }}
                        onClick={i === 0 && drawingPoints.length >= 3 ? (e) => { e.stopPropagation(); handleFinishDrawing(); } : undefined}
                      />
                    ))}
                  </g>
                )}

                {/* ── Drawing preview: Road ── */}
                {editorMode === "draw-road" && drawingPoints.length > 0 && (
                  <g>
                    <polyline
                      points={drawingPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="none" stroke="#06b6d4" strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" opacity={0.3}
                    />
                    <polyline
                      points={drawingPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="none" stroke="#06b6d4" strokeWidth={2} strokeDasharray="8 5" strokeLinecap="round"
                    />
                    {drawingPoints.map((pt, i) => (
                      <circle key={i} cx={pt.x} cy={pt.y} r={5 / zoom}
                        fill="#06b6d4" stroke="#fff" strokeWidth={2 / zoom}
                      />
                    ))}
                  </g>
                )}

                {/* ── Empty state ── */}
                {areas.length === 0 && editorMode === "select" && (
                  <text x={CANVAS_W / 2} y={CANVAS_H / 2} textAnchor="middle" dominantBaseline="central"
                    fill="rgba(100,116,139,0.4)" fontSize="18" fontWeight="600" fontFamily="var(--font-poppins)"
                  >Kanvas Denah Kosong — Tambahkan elemen dari toolbar di atas</text>
                )}
              </svg>

              {/* Map Scale Indicator */}
              <Box sx={{
                position: "absolute", bottom: 16, left: 16, zIndex: 10, pointerEvents: "none",
                backgroundColor: (t) => t.palette.mode === "dark" ? "rgba(18,18,20,0.85)" : "rgba(255,255,255,0.9)",
                backdropFilter: "blur(4px)", p: "6px 12px", borderRadius: 2.5, border: "1px solid", borderColor: "divider",
                display: "flex", flexDirection: "column", gap: 0.5, boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}>
                <AppTypography preset="helperText" sx={{ fontSize: "0.65rem", fontWeight: "bold", color: "text.secondary" }}>Skala (10m)</AppTypography>
                <Box sx={{ width: `${80 * zoom}px`, height: 5, borderLeft: "2px solid", borderRight: "2px solid", borderBottom: "2px solid", borderColor: "text.primary", transition: "width 0.1s ease-out" }} />
              </Box>
            </Paper>
          </Grid>

          {/* ═══ Inspector Sidebar ═══ */}
          {selectedAreaId && selectedArea && (
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SettingsIcon color="primary" />
                      <AppTypography preset="sectionTitle" sx={{ fontWeight: 800 }}>Inspector</AppTypography>
                    </Box>
                    <IconButton size="small" onClick={() => setSelectedAreaId(null)}><CloseIcon /></IconButton>
                  </Box>

                  <Stack spacing={3}>
                    {/* Name */}
                    <TextField fullWidth size="small" label="Nama Elemen" value={selectedArea.name}
                      onChange={(e) => { verifyAdminAuth(); updateArea(selectedArea.id, { name: e.target.value }); }}
                      slotProps={{ input: { sx: { borderRadius: 2 } } }}
                    />

                    {/* Type chip */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AppTypography preset="helperText" sx={{ fontWeight: "bold" }}>Tipe:</AppTypography>
                      <Chip label={selectedArea.type || "zone"} size="small" color={selectedArea.type === "zone" ? "primary" : "secondary"}
                        sx={{ textTransform: "uppercase", fontWeight: "bold", fontSize: "0.7rem" }}
                      />
                      <Chip label={isPolygonArea(selectedArea) ? "polygon" : isRoadArea(selectedArea) ? "path" : "rect"}
                        size="small" variant="outlined" sx={{ fontSize: "0.65rem" }}
                      />
                    </Box>

                    <Divider />

                    {/* ── Rect dimension controls (only for rect-based shapes) ── */}
                    {!isPolygonArea(selectedArea) && !isRoadArea(selectedArea) && (
                      <>
                        <Box>
                          <AppTypography preset="helperText" sx={{ fontWeight: "bold", mb: 1 }}>Lebar: {selectedArea.w || 160}px</AppTypography>
                          <Slider value={selectedArea.w || 160} min={30} max={800} step={10}
                            onChange={(_, v) => { verifyAdminAuth(); updateArea(selectedArea.id, { w: v as number }); }} valueLabelDisplay="auto" />
                        </Box>
                        <Box>
                          <AppTypography preset="helperText" sx={{ fontWeight: "bold", mb: 1 }}>Tinggi: {selectedArea.h || 120}px</AppTypography>
                          <Slider value={selectedArea.h || 120} min={30} max={600} step={10}
                            onChange={(_, v) => { verifyAdminAuth(); updateArea(selectedArea.id, { h: v as number }); }} valueLabelDisplay="auto" />
                        </Box>
                        <Box>
                          <AppTypography preset="helperText" sx={{ fontWeight: "bold", mb: 1 }}>Rotasi: {selectedArea.rotation || 0}°</AppTypography>
                          <Slider value={selectedArea.rotation || 0} min={0} max={360} step={5}
                            onChange={(_, v) => { verifyAdminAuth(); updateArea(selectedArea.id, { rotation: v as number }); }} valueLabelDisplay="auto" />
                        </Box>
                      </>
                    )}

                    {/* ── Road-specific controls ── */}
                    {isRoadArea(selectedArea) && (
                      <>
                        <Box>
                          <AppTypography preset="helperText" sx={{ fontWeight: "bold", mb: 1 }}>Lebar Jalan: {selectedArea.roadWidth || 24}px</AppTypography>
                          <Slider value={selectedArea.roadWidth || 24} min={8} max={80} step={2}
                            onChange={(_, v) => { verifyAdminAuth(); updateArea(selectedArea.id, { roadWidth: v as number }); }} valueLabelDisplay="auto" />
                        </Box>
                        <AppTypography preset="helperText" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                          Titik jalan: {selectedArea.waypoints?.length || 0} waypoints — Geser titik biru di kanvas untuk mengubah bentuk jalan.
                        </AppTypography>
                      </>
                    )}

                    {/* ── Polygon info ── */}
                    {isPolygonArea(selectedArea) && (
                      <AppTypography preset="helperText" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                        Titik sudut: {selectedArea.points?.length || 0} vertices — Geser titik ungu di kanvas untuk mengubah bentuk area.
                      </AppTypography>
                    )}

                    {/* Layer */}
                    <FormControl fullWidth size="small">
                      <InputLabel id="inspector-layer-label">Tingkat Layer (Z-Index)</InputLabel>
                      <Select labelId="inspector-layer-label" value={selectedArea.layer || 4} label="Tingkat Layer (Z-Index)"
                        onChange={(e) => { verifyAdminAuth(); updateArea(selectedArea.id, { layer: Number(e.target.value) }); }} sx={{ borderRadius: 2 }}>
                        <MenuItem value={1}>Layer 1: Lapangan (BG)</MenuItem>
                        <MenuItem value={2}>Layer 2: Jalan / Parkir</MenuItem>
                        <MenuItem value={3}>Layer 3: Gedung</MenuItem>
                        <MenuItem value={4}>Layer 4: Stan / Zona</MenuItem>
                      </Select>
                    </FormControl>

                    <Divider />

                    {/* Color swatches */}
                    <Box>
                      <AppTypography preset="helperText" sx={{ fontWeight: "bold", mb: 1.5, display: "flex", alignItems: "center", gap: 0.8 }}>
                        <ColorLensIcon sx={{ fontSize: 18 }} /> Pilih Warna
                      </AppTypography>
                      <Stack direction="row" spacing={1} useFlexGap sx={{ gap: 1, flexWrap: "wrap" }}>
                        {COLOR_SWATCHES.map((c) => (
                          <IconButton key={c} onClick={() => { verifyAdminAuth(); updateArea(selectedArea.id, { color: c }); }}
                            sx={{ width: 32, height: 32, bgcolor: c, border: "2px solid", borderColor: selectedArea.color === c ? "primary.main" : "transparent", "&:hover": { bgcolor: c, opacity: 0.8 } }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    {/* Staff assignment (zones only) */}
                    {(selectedArea.type || "zone") === "zone" && (
                      <>
                        <Divider />
                        <FormControl fullWidth size="small">
                          <InputLabel id="inspector-assign">+ Tugaskan Staff</InputLabel>
                          <Select labelId="inspector-assign" value="" label="+ Tugaskan Staff" onChange={(e) => handleStaffAssign(e.target.value, selectedArea.id)}>
                            <MenuItem value="" disabled>Pilih Staff Luang</MenuItem>
                            {unassignedStaffs.length === 0
                              ? <MenuItem value="" disabled>Tidak ada staff luang</MenuItem>
                              : unassignedStaffs.map((s) => <MenuItem key={s.id} value={s.id}>{s.name} ({s.role})</MenuItem>)}
                          </Select>
                        </FormControl>
                        <Box>
                          <AppTypography preset="helperText" sx={{ fontWeight: "bold", mb: 1, color: "text.secondary" }}>Personil ({selectedAreaStaffs.length})</AppTypography>
                          {selectedAreaStaffs.length === 0 ? (
                            <AppTypography preset="helperText" sx={{ fontStyle: "italic", color: "text.secondary" }}>Tidak ada staff bertugas.</AppTypography>
                          ) : (
                            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                              <List disablePadding>
                                {selectedAreaStaffs.map((s) => (
                                  <ListItem key={s.id} sx={{ py: 0.8, px: 1.5, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: "none" } }}>
                                    <ListItemText
                                      primary={<AppTypography preset="bodyText" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{s.name}</AppTypography>}
                                      secondary={<AppTypography preset="helperText" sx={{ fontSize: "0.75rem", textTransform: "uppercase" }}>{s.role}</AppTypography>}
                                    />
                                    <AppButton variant="outlined" color="error" label="Lepas" onClick={() => handleStaffAssign(s.id, "")} sx={{ py: 0.3, px: 1, fontSize: "0.7rem", minWidth: 50 }} />
                                  </ListItem>
                                ))}
                              </List>
                            </Paper>
                          )}
                        </Box>
                      </>
                    )}

                    <Divider />
                    <AppButton variant="contained" color="error" label="Hapus Elemen Ini" onClick={() => handleOpenDeleteConfirm(selectedArea)} sx={{ py: 1.2, width: "100%" }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* ── Modals ── */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Buat Elemen Denah Kustom" type="form"
        actions={
          <Stack direction="row" spacing={1.5} sx={{ width: "100%", justifyContent: "flex-end" }}>
            <AppButton variant="outlined" label="Batal" onClick={() => setAddModalOpen(false)} />
            <AppButton variant="contained" label="Tambahkan" onClick={handleSaveArea} disabled={!areaNameInput.trim()} />
          </Stack>
        }
      >
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField fullWidth label="Nama Elemen" placeholder="Contoh: Gedung A, Jalan Boulevard..." value={areaNameInput}
            onChange={(e) => setAreaNameInput(e.target.value)} slotProps={{ input: { sx: { borderRadius: 2 } } }}
          />
          <FormControl fullWidth>
            <InputLabel id="add-type-label">Tipe Struktur</InputLabel>
            <Select labelId="add-type-label" value={areaTypeInput} label="Tipe Struktur" onChange={(e) => setAreaTypeInput(e.target.value as AreaType)} sx={{ borderRadius: 2 }}>
              <MenuItem value="field">Area Lapangan (Ground BG)</MenuItem>
              <MenuItem value="road">Jalan / Koridor (Road/Path)</MenuItem>
              <MenuItem value="building">Gedung (Building)</MenuItem>
              <MenuItem value="stand">Stan / Panggung (Stand/Stage)</MenuItem>
              <MenuItem value="zone">Zona Tugas Staff</MenuItem>
              <MenuItem value="parking">Area Parkir</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Modal>

      <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title="Konfirmasi Hapus Elemen"
        type="confirm" severity="error" confirmLabel="Ya, Hapus" cancelLabel="Batal" onConfirm={handleConfirmDelete}
      >
        Apakah Anda yakin ingin menghapus elemen &quot;{targetArea?.name}&quot; ({targetArea?.type || "zone"})?
        Aksi ini tidak dapat dibatalkan.
      </Modal>
    </AdminShell>
  );
}
