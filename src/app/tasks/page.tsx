"use client";

import React, { useState, useEffect } from "react";
import { useTaskStore, Task } from "@/features/task/store/task.store";
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
  Grid,
  Chip,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PauseCircleOutlinedIcon from "@mui/icons-material/PauseCircleOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AppTypography from "@/components/AppTypography";
import AppButton from "@/components/AppButton";
import Modal from "@/components/Modal";
import DataTable, { Column } from "@/components/DataTable";
import Pagination from "@/components/Pagination";
import AdminShell from "@/components/AdminShell";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { verifyAdminAuth } from "@/utils/auth.utils";

import { globalWebSocket } from "@/utils/websocket-client";

const PAGE_SIZE = 5;

export default function TasksPage() {
  const { isReady } = useAdminGuard();
  const { tasks, fetchTasks, addTask, updateTask, deleteTask } = useTaskStore();
  const { staffs, fetchStaffs } = useStaffStore();
  const { areas, fetchAreas } = useAreaStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Form State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedStaffId, setAssignedStaffId] = useState("");
  const [assignedAreaId, setAssignedAreaId] = useState("");
  const [taskStatus, setTaskStatus] = useState<Task["status"]>("pending");

  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetTask, setTargetTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchStaffs();
    fetchAreas();

    // ⚡ Real-Time WebSocket STOMP Sync for Tasks (< 50ms)
    globalWebSocket.connect(() => {
      globalWebSocket.subscribe("/topic/tasks", () => {
        fetchTasks();
      });
    });
  }, [fetchTasks, fetchStaffs, fetchAreas]);

  if (!isReady) return null;

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + PAGE_SIZE);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setAssignedStaffId("");
    setAssignedAreaId("");
    setTaskStatus("pending");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description || "");
    setAssignedStaffId(task.assignedStaffId || "");
    setAssignedAreaId(task.assignedAreaId || "");
    setTaskStatus(task.status);
    setIsModalOpen(true);
  };

  const handleSaveTask = async () => {
    if (!title.trim()) return;

    verifyAdminAuth();

    if (editingId) {
      await updateTask(editingId, {
        title: title.trim(),
        description: description.trim() || null,
        assignedStaffId: assignedStaffId || null,
        assignedAreaId: assignedAreaId || null,
        status: taskStatus,
      });
    } else {
      await addTask({
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim() || null,
        assignedStaffId: assignedStaffId || null,
        assignedAreaId: assignedAreaId || null,
        status: taskStatus,
      });
    }

    setIsModalOpen(false);
  };

  const handleOpenDeleteConfirm = (task: Task) => {
    setTargetTask(task);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetTask) return;

    verifyAdminAuth();
    await deleteTask(targetTask.id);
    setDeleteConfirmOpen(false);
    setTargetTask(null);

    const totalRemaining = filteredTasks.length - 1;
    const maxPage = Math.max(1, Math.ceil(totalRemaining / PAGE_SIZE));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  };

  // DataTable Columns definition (Matching Figma Task Management.svg)
  const columns: Column<Task>[] = [
    {
      id: "index",
      label: "No.",
      align: "center",
      render: (_, idx) => <>{startIndex + idx + 1}</>,
    },
    {
      id: "title",
      label: "Tugas",
      render: (row: Task) => (
        <Box>
          <Box sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>{row.title}</Box>
          {row.description && (
            <Box sx={{ fontSize: "0.8rem", color: "#64748B", mt: 0.25, whiteSpace: "pre-wrap" }}>
              {row.description}
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: "area",
      label: "Target Area",
      render: (row: Task) => (
        <Box sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.9rem" }}>
          {row.areaName || <span style={{ color: "#94A3B8", fontStyle: "italic" }}>Tidak Ada Area</span>}
        </Box>
      ),
    },
    {
      id: "staff",
      label: "Penanggung Jawab",
      render: (row: Task) => (
        <Box sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.9rem" }}>
          {row.staffName || <span style={{ color: "#94A3B8", fontStyle: "italic" }}>Belum Ditunjuk</span>}
        </Box>
      ),
    },
    {
      id: "status",
      label: "Status",
      align: "center",
      render: (row: Task) => {
        let label = "Tertunda";
        let bgcolor = "#64748B";

        if (row.status === "in_progress") {
          label = "Dikerjakan";
          bgcolor = "#F97316";
        } else if (row.status === "completed") {
          label = "Selesai";
          bgcolor = "#10B981";
        }

        return (
          <Chip
            label={label}
            size="small"
            sx={{
              backgroundColor: bgcolor,
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.75rem",
              borderRadius: "12px",
              px: 0.5,
              height: 24,
            }}
          />
        );
      },
    },
    {
      id: "actions",
      label: "Aksi",
      align: "center",
      render: (row: Task) => (
        <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
          <IconButton
            onClick={() => handleOpenEditModal(row)}
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

  // Derive stats for Top KPI Cards (Exact Figma Task Management.svg)
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const progressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <AdminShell>
      {/* Header Section (Exact Figma Task Management.svg) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 4,
          gap: 2,
        }}
      >
        <Box>
          <AppTypography preset="pageTitle" sx={{ fontWeight: 800, fontSize: "1.85rem", letterSpacing: "-0.03em", color: "#0F172A" }}>
            Task Management
          </AppTypography>
          <AppTypography preset="helperText" sx={{ color: "#64748B", fontSize: "0.925rem", mt: 0.5 }}>
            Delegasikan instruksi tugas operasional ke staff dan area tertentu di lapangan.
          </AppTypography>
        </Box>

        <AppButton
          onClick={handleOpenAddModal}
          label="Tambah Tugas Baru"
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

      {/* Top 4 KPI Cards Row (Exact Figma Task Management.svg) */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Card 1: Total Tugas */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              backgroundColor: "#0F172A",
              color: "#ffffff",
              borderRadius: "12px",
              p: 2.5,
              height: "100%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <AssignmentOutlinedIcon sx={{ fontSize: 44, color: "#FBC02D" }} />
              <Box>
                <AppTypography preset="helperText" sx={{ color: "#94A3B8", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                  Total Tugas
                </AppTypography>
                <AppTypography preset="pageTitle" sx={{ fontWeight: 800, fontSize: "2rem", color: "#FBC02D", lineHeight: 1 }}>
                  {totalCount}
                </AppTypography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Card 2: Tertunda */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              backgroundColor: "#0F172A",
              color: "#ffffff",
              borderRadius: "12px",
              p: 2.5,
              height: "100%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <PauseCircleOutlinedIcon sx={{ fontSize: 44, color: "#FBC02D" }} />
              <Box>
                <AppTypography preset="helperText" sx={{ color: "#94A3B8", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                  Tertunda
                </AppTypography>
                <AppTypography preset="pageTitle" sx={{ fontWeight: 800, fontSize: "2rem", color: "#FBC02D", lineHeight: 1 }}>
                  {pendingCount}
                </AppTypography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Card 3: Dikerjakan */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              backgroundColor: "#0F172A",
              color: "#ffffff",
              borderRadius: "12px",
              p: 2.5,
              height: "100%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <RateReviewOutlinedIcon sx={{ fontSize: 44, color: "#FBC02D" }} />
              <Box>
                <AppTypography preset="helperText" sx={{ color: "#94A3B8", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                  Dikerjakan
                </AppTypography>
                <AppTypography preset="pageTitle" sx={{ fontWeight: 800, fontSize: "2rem", color: "#FBC02D", lineHeight: 1 }}>
                  {progressCount}
                </AppTypography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Card 4: Selesai (Green Card) */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              backgroundColor: "#1F7D53",
              color: "#ffffff",
              borderRadius: "12px",
              p: 2.5,
              height: "100%",
              boxShadow: "0 4px 12px rgba(31, 125, 83, 0.3)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CheckCircleOutlinedIcon sx={{ fontSize: 44, color: "#ffffff" }} />
              <Box>
                <AppTypography preset="helperText" sx={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                  Selesai
                </AppTypography>
                <AppTypography preset="pageTitle" sx={{ fontWeight: 800, fontSize: "2rem", color: "#ffffff", lineHeight: 1 }}>
                  {completedCount}
                </AppTypography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Search, Filters and Tasks Table Card */}
      <Card sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <TextField
              variant="outlined"
              placeholder="Cari tugas..."
              size="small"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              sx={{ flexGrow: 1 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "#64748B" }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: "8px", backgroundColor: "#ffffff" },
                },
              }}
            />

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="status-filter-label">Filter Status</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Filter Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{ borderRadius: "8px", backgroundColor: "#ffffff" }}
              >
                <MenuItem value="all">Semua Status</MenuItem>
                <MenuItem value="pending">Tertunda</MenuItem>
                <MenuItem value="in_progress">Dikerjakan</MenuItem>
                <MenuItem value="completed">Selesai</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Tasks DataTable */}
          <DataTable
            columns={columns}
            rows={paginatedTasks}
            emptyMessage="Tidak ada tugas yang terdaftar saat ini."
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              page={currentPage}
              count={totalPages}
              onChange={(page) => setCurrentPage(page)}
            />
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Task Modal (Matches Add New Task.svg / Edit Task.svg) */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Tugas" : "Tambah Tugas Baru"}
        type="form"
        actions={
          <Stack direction="row" spacing={1.5} sx={{ width: "100%", justifyContent: "flex-end" }}>
            <AppButton variant="outlined" label="Batal" onClick={() => setIsModalOpen(false)} />
            <AppButton
              variant="contained"
              label={editingId ? "Simpan Perubahan" : "Tambah Tugas Baru"}
              onClick={handleSaveTask}
              disabled={!title.trim()}
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            label="Tugas"
            required
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masukkan nama tugas..."
            slotProps={{ input: { sx: { borderRadius: "8px" } } }}
          />

          <TextField
            label="Deskripsi Tugas"
            multiline
            rows={3}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Keterangan singkat tugas..."
            slotProps={{ input: { sx: { borderRadius: "8px" } } }}
          />

          <FormControl fullWidth>
            <InputLabel id="area-select-label">Target Area</InputLabel>
            <Select
              labelId="area-select-label"
              label="Target Area"
              value={assignedAreaId}
              onChange={(e) => setAssignedAreaId(e.target.value)}
              sx={{ borderRadius: "8px" }}
            >
              <MenuItem value="">
                <em>Pilih Area</em>
              </MenuItem>
              {areas.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="staff-select-label">Penanggung Jawab</InputLabel>
            <Select
              labelId="staff-select-label"
              label="Penanggung Jawab"
              value={assignedStaffId}
              onChange={(e) => setAssignedStaffId(e.target.value)}
              sx={{ borderRadius: "8px" }}
            >
              <MenuItem value="">
                <em>Pilih Staff</em>
              </MenuItem>
              {staffs.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} ({s.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {editingId && (
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Status Tugas</InputLabel>
              <Select
                labelId="status-select-label"
                label="Status Tugas"
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as Task["status"])}
                sx={{ borderRadius: "8px" }}
              >
                <MenuItem value="pending">Tertunda</MenuItem>
                <MenuItem value="in_progress">Dikerjakan</MenuItem>
                <MenuItem value="completed">Selesai</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Konfirmasi Hapus Tugas"
        type="confirm"
        severity="warning"
        confirmLabel="Hapus Tugas"
        cancelLabel="Batal"
        onConfirm={handleConfirmDelete}
      >
        Apakah Anda yakin ingin menghapus tugas **&quot;{targetTask?.title}&quot;**? 
        Aksi ini tidak dapat dibatalkan.
      </Modal>
    </AdminShell>
  );
}
