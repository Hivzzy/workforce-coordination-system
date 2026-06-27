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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddIcon from "@mui/icons-material/Add";
import AppTypography from "@/components/AppTypography";
import AppButton from "@/components/AppButton";
import Modal from "@/components/Modal";
import DataTable, { Column } from "@/components/DataTable";
import Pagination from "@/components/Pagination";
import AdminShell from "@/components/AdminShell";
import { useAdminGuard } from "@/hooks/useAdminGuard";

const PAGE_SIZE = 5;

export default function TasksPage() {
  const { isReady } = useAdminGuard();
  const { tasks, fetchTasks, addTask, deleteTask } = useTaskStore();
  const { staffs, fetchStaffs } = useStaffStore();
  const { areas, fetchAreas } = useAreaStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedStaffId, setAssignedStaffId] = useState("");
  const [assignedAreaId, setAssignedAreaId] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchStaffs();
    fetchAreas();
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
    setTitle("");
    setDescription("");
    setAssignedStaffId("");
    setAssignedAreaId("");
    setIsModalOpen(true);
  };

  const handleSaveTask = async () => {
    if (!title.trim()) return;

    await addTask({
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim() || null,
      assignedStaffId: assignedStaffId || null,
      assignedAreaId: assignedAreaId || null,
      status: "pending",
    });

    setIsModalOpen(false);
  };

  const columns: Column<Task>[] = [
    {
      id: "index",
      label: "No",
      align: "center",
      render: (_, idx) => <>{startIndex + idx + 1}</>,
    },
    {
      id: "title",
      label: "Tugas",
      render: (row: Task) => (
        <Box>
          <Box sx={{ fontWeight: 600, color: "text.primary" }}>{row.title}</Box>
          {row.description && (
            <Box sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.5, whiteSpace: "pre-wrap" }}>
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
        <Box sx={{ fontWeight: 500 }}>
          {row.areaName || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Tidak Ada Area</span>}
        </Box>
      ),
    },
    {
      id: "staff",
      label: "Penanggung Jawab",
      render: (row: Task) => (
        <Box sx={{ fontWeight: 500 }}>
          {row.staffName || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Belum Ditunjuk</span>}
        </Box>
      ),
    },
    {
      id: "status",
      label: "Status",
      align: "center",
      render: (row: Task) => {
        let color = "#6b7280";
        let bgcolor = "#f3f4f6";
        let text = "Tertunda";

        if (row.status === "in_progress") {
          color = "#3b82f6";
          bgcolor = "#eff6ff";
          text = "Sedang Berjalan";
        } else if (row.status === "completed") {
          color = "#10b981";
          bgcolor = "#ecfdf5";
          text = "Selesai";
        }

        return (
          <Box
            sx={{
              display: "inline-block",
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontSize: "0.72rem",
              fontWeight: 700,
              color,
              bgcolor,
              border: `1px solid ${color}22`,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            {text}
          </Box>
        );
      },
    },
    {
      id: "actions",
      label: "Aksi",
      align: "center",
      render: (row: Task) => (
        <AppButton
          condition="delete"
          label="Hapus"
          onClick={() => {
            if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
              deleteTask(row.id);
            }
          }}
        />
      ),
    },
  ];

  // Derive stats
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const progressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <AdminShell>
      <Box sx={{ p: 4, maxWidth: 1280, margin: "0 auto" }}>
        {/* Header Section */}
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
            <AppTypography preset="pageTitle" sx={{ mb: 1, fontWeight: 900 }}>
              Daftar Tugas (Task Management)
            </AppTypography>
            <AppTypography preset="helperText" sx={{ color: "text.secondary" }}>
              Delegasikan instruksi tugas operasional ke staff dan area tertentu di lapangan.
            </AppTypography>
          </Box>
          <AppButton
            condition="add"
            label="Tambah Tugas Baru"
            onClick={handleOpenAddModal}
          />
        </Box>

        {/* Stats Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: "Total Tugas", count: totalCount, color: "#4f46e5" },
            { label: "Tertunda", count: pendingCount, color: "#f59e0b" },
            { label: "Sedang Berjalan", count: progressCount, color: "#3b82f6" },
            { label: "Selesai", count: completedCount, color: "#10b981" },
          ].map((stat, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Card
                sx={{
                  boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.04)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  borderRadius: 3,
                  position: "relative",
                  overflow: "hidden",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    bgcolor: stat.color,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <AppTypography preset="helperText" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    {stat.label}
                  </AppTypography>
                  <AppTypography preset="pageTitle" sx={{ fontWeight: 800, mt: 1, color: stat.color }}>
                    {stat.count}
                  </AppTypography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters and Datatable */}
        <Card sx={{ boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.03)", borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.05)" }}>
          <CardContent sx={{ p: 4 }}>
            {/* Filter Bar */}
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
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 },
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
                >
                  <MenuItem value="all">Semua Status</MenuItem>
                  <MenuItem value="pending">Tertunda</MenuItem>
                  <MenuItem value="in_progress">Sedang Berjalan</MenuItem>
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
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  page={currentPage}
                  count={totalPages}
                  onChange={(page) => setCurrentPage(page)}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Add Task Modal */}
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Tambah Tugas Baru"
          type="form"
          actions={
            <Stack direction="row" spacing={1.5} sx={{ width: "100%", justifyContent: "flex-end" }}>
              <AppButton variant="outlined" label="Batal" onClick={() => setIsModalOpen(false)} />
              <AppButton
                variant="contained"
                label="Tambah Tugas"
                onClick={handleSaveTask}
                disabled={!title.trim()}
              />
            </Stack>
          }
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            <TextField
              label="Judul Tugas"
              required
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <TextField
              label="Deskripsi Detail Tugas"
              multiline
              rows={3}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan apa yang harus dikerjakan oleh staff..."
            />

            <FormControl fullWidth>
              <InputLabel id="area-select-label">Target Area Penugasan</InputLabel>
              <Select
                labelId="area-select-label"
                label="Target Area Penugasan"
                value={assignedAreaId}
                onChange={(e) => setAssignedAreaId(e.target.value)}
              >
                <MenuItem value="">
                  <em>Tidak Ada Area (Global)</em>
                </MenuItem>
                {areas.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name} ({a.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="staff-select-label">Penanggung Jawab (Staff)</InputLabel>
              <Select
                labelId="staff-select-label"
                label="Penanggung Jawab (Staff)"
                value={assignedStaffId}
                onChange={(e) => setAssignedStaffId(e.target.value)}
              >
                <MenuItem value="">
                  <em>Belum Ditunjuk</em>
                </MenuItem>
                {staffs.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Modal>
      </Box>
    </AdminShell>
  );
}
