"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useStaffStore } from "@/features/staff/store/staff.store";
import { useAreaStore } from "@/features/area/store/area.store";
import { useTaskStore } from "@/features/task/store/task.store";
import {
  Box,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  Chip,
  Divider,
  Paper,
  Stack,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AppTypography from "@/components/AppTypography";
import HelpButton from "@/components/HelpButton";
import RefillButton from "@/components/RefillButton";
import AppButton from "@/components/AppButton";

export default function StaffPortalPage() {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const { staffs, fetchStaffs } = useStaffStore();
  const { areas, fetchAreas } = useAreaStore();
  const { tasks, fetchTasks, updateTaskStatus } = useTaskStore();

  const [helpStatus, setHelpStatus] = useState<"idle" | "requested">("idle");
  const [refillStatus, setRefillStatus] = useState<"idle" | "requested">("idle");
  const [emergencyActive, setEmergencyActive] = useState(false);

  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchStaffs();
    fetchAreas();

    const fetchRoles = async () => {
      try {
        const res = await fetch("/api/roles");
        if (res.ok) {
          const data = await res.json();
          setRoles(data);
        }
      } catch (err) {
        console.error("Failed to fetch roles in portal:", err);
      }
    };

    const fetchSystemState = async () => {
      try {
        const res = await fetch("/api/system-state");
        if (res.ok) {
          const data = await res.json();
          setEmergencyActive(data.emergencyActive);
          setHelpStatus(data.helpStatus !== "idle" ? "requested" : "idle");
          setRefillStatus(data.refillStatus !== "idle" ? "requested" : "idle");
        }
      } catch (err) {
        console.error("Failed to fetch system state in portal:", err);
      }

      if (user?.staffId) {
        fetchTasks(user.staffId);
      }
    };

    fetchRoles();
    fetchSystemState();
    const interval = setInterval(fetchSystemState, 3000);
    return () => clearInterval(interval);
  }, [fetchStaffs, fetchAreas, user]);

  // Staff portal guard: must be logged in as staff
  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.push("/login");
    } else if (user.role === "admin") {
      router.push("/dashboard");
    }
  }, [user, hasHydrated, router]);

  if (!hasHydrated || !user || user.role !== "staff") return null;

  // Find the staff record linked to this user
  const myStaff = staffs.find((s) => s.id === user.staffId) || null;
  const myArea = myStaff?.assignedAreaId
    ? areas.find((a) => a.id === myStaff.assignedAreaId)
    : null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleHelpToggle = async () => {
    const nextState = helpStatus === "idle" ? (myArea ? myArea.name : "Portal Staff") : "idle";
    setHelpStatus(nextState === "idle" ? "idle" : "requested");
    try {
      await fetch("/api/system-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpStatus: nextState }),
      });
    } catch (err) {
      console.error("Failed to sync help request:", err);
    }
  };

  const handleRefillToggle = async () => {
    const nextState = refillStatus === "idle" ? (myArea ? myArea.name : "Portal Staff") : "idle";
    setRefillStatus(nextState === "idle" ? "idle" : "requested");
    try {
      await fetch("/api/system-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refillStatus: nextState }),
      });
    } catch (err) {
      console.error("Failed to sync refill request:", err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 17) return "Selamat Siang";
    return "Selamat Malam";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ─── Top App Bar ─── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          color: "text.primary",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "secondary.main",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <AppTypography
                preset="bodyText"
                sx={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2 }}
              >
                Staff Portal
              </AppTypography>
              <AppTypography
                preset="helperText"
                sx={{ fontSize: "0.65rem", color: "secondary.main", fontWeight: 600 }}
              >
                WORKFORCE SYSTEM
              </AppTypography>
            </Box>
          </Box>
          <IconButton onClick={handleLogout} sx={{ color: "error.main" }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* ─── Main Content ─── */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, maxWidth: 600, mx: "auto", width: "100%" }}>
        {/* Emergency Banner */}
        {emergencyActive && (
          <Paper
            className="animate-pulse-glow"
            elevation={3}
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "error.main",
              color: "error.contrastText",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              border: "1px solid",
              borderColor: "error.dark",
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 28 }} />
            <Box>
              <AppTypography preset="bodyText" sx={{ fontWeight: 800, color: "inherit", fontSize: "0.9rem" }}>
                🚨 PERINTAH DARURAT AKTIF
              </AppTypography>
              <AppTypography preset="helperText" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: "0.75rem" }}>
                Semua staff harap segera berkumpul di GATHERING AREA sekarang!
              </AppTypography>
            </Box>
          </Paper>
        )}

        {/* Welcome Card */}
        <Card
          sx={{
            mb: 3,
            background: "linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)",
            color: "#ffffff",
            overflow: "visible",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <WavingHandIcon sx={{ fontSize: 20 }} />
              <AppTypography preset="helperText" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: "0.75rem" }}>
                {getGreeting()}
              </AppTypography>
            </Box>
            <AppTypography preset="pageTitle" sx={{ color: "#ffffff", fontWeight: 800, mb: 0.5 }}>
              {user.name}
            </AppTypography>
            <AppTypography preset="helperText" sx={{ color: "rgba(255,255,255,0.7)" }}>
              {user.email}
            </AppTypography>
          </CardContent>
        </Card>

        {/* Area Assignment Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <LocationOnIcon color="primary" sx={{ fontSize: 20 }} />
              <AppTypography preset="cardTitle" sx={{ fontWeight: 700 }}>
                Area Penugasan
              </AppTypography>
            </Box>
            {myArea ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  borderColor: "primary.main",
                  borderWidth: 2,
                  bgcolor: (t) =>
                    t.palette.mode === "dark"
                      ? "rgba(99, 102, 241, 0.06)"
                      : "rgba(99, 102, 241, 0.04)",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <AppTypography preset="sectionTitle" sx={{ fontWeight: 800 }}>
                    {myArea.name}
                  </AppTypography>
                  <Chip
                    label={myArea.type || "zone"}
                    size="small"
                    color="primary"
                    sx={{
                      textTransform: "uppercase",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                      fontFamily: "var(--font-poppins)",
                    }}
                  />
                </Box>
                {myStaff && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <AppTypography preset="helperText" sx={{ fontWeight: 600 }}>
                      Peran: {roles.find((r) => r.id === myStaff.role)?.name || myStaff.role}
                    </AppTypography>
                  </Box>
                )}
              </Paper>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  textAlign: "center",
                  borderStyle: "dashed",
                }}
              >
                <LocationOnIcon sx={{ fontSize: 40, color: "text.secondary", opacity: 0.4, mb: 1 }} />
                <AppTypography preset="bodyText" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Belum Ada Penugasan
                </AppTypography>
                <AppTypography preset="helperText" sx={{ mt: 0.5 }}>
                  Admin belum mendelegasikan area kerja untuk Anda. Silakan hubungi koordinator.
                </AppTypography>
              </Paper>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <AssignmentIcon sx={{ color: "warning.main", fontSize: 20 }} />
              <AppTypography preset="cardTitle" sx={{ fontWeight: 700 }}>
                Aksi Cepat
              </AppTypography>
            </Box>
            <AppTypography preset="helperText" sx={{ mb: 3 }}>
              Gunakan tombol di bawah untuk mengirim sinyal bantuan atau permintaan isi ulang logistik ke koordinator.
            </AppTypography>
            <Stack spacing={2}>
              <HelpButton
                status={helpStatus}
                onClick={handleHelpToggle}
              />
              <RefillButton
                status={refillStatus}
                onClick={handleRefillToggle}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Task List */}
        <Card sx={{ borderRadius: 3, boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.02)", border: "1px solid rgba(0, 0, 0, 0.05)", mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <AssignmentIcon color="primary" sx={{ fontSize: 22 }} />
              <AppTypography preset="cardTitle" sx={{ fontWeight: 800 }}>
                Tugas Saya ({tasks.length})
              </AppTypography>
            </Box>
            <Divider sx={{ mb: 3, opacity: 0.5 }} />
            
            {tasks.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <AssignmentIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.25, mb: 1 }} />
                <AppTypography preset="bodyText" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Belum Ada Tugas
                </AppTypography>
                <AppTypography preset="helperText" sx={{ mt: 0.5 }}>
                  Tugas yang didelegasikan oleh koordinator akan muncul di sini secara real-time.
                </AppTypography>
              </Box>
            ) : (
              <Stack spacing={2.5}>
                {tasks.map((task) => (
                  <Paper
                    key={task.id}
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      borderColor: task.status === "completed" ? "#a7f3d0" : task.status === "in_progress" ? "#bfdbfe" : "divider",
                      bgcolor: task.status === "completed" ? "#f0fdf4" : task.status === "in_progress" ? "#f8fafc" : "background.paper",
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    {/* Status accent side bar */}
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        bgcolor: task.status === "completed" ? "#10b981" : task.status === "in_progress" ? "#3b82f6" : "#9ca3af"
                      }}
                    />
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1, pl: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <AppTypography preset="cardTitle" sx={{ fontWeight: 700, fontSize: "1rem" }}>
                          {task.title}
                        </AppTypography>
                      </Box>
                      <Box>
                        {task.status === "pending" && (
                          <Chip label="Tertunda" size="small" sx={{ bgcolor: "#f3f4f6", color: "#4b5563", fontWeight: "bold", fontSize: "0.68rem" }} />
                        )}
                        {task.status === "in_progress" && (
                          <Chip label="Berjalan" size="small" color="primary" variant="outlined" sx={{ fontWeight: "bold", fontSize: "0.68rem" }} />
                        )}
                        {task.status === "completed" && (
                          <Chip label="Selesai" size="small" color="success" sx={{ fontWeight: "bold", fontSize: "0.68rem" }} />
                        )}
                      </Box>
                    </Box>

                    {task.description && (
                      <AppTypography preset="bodyText" sx={{ mt: 1, color: "text.secondary", fontSize: "0.85rem", pl: 1, whiteSpace: "pre-wrap" }}>
                        {task.description}
                      </AppTypography>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, pt: 1.5, borderTop: "1px solid rgba(0, 0, 0, 0.04)", pl: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: "text.secondary", opacity: 0.6 }} />
                        <AppTypography preset="helperText" sx={{ fontWeight: 600 }}>
                          {task.areaName || "Area Global"}
                        </AppTypography>
                      </Box>
                      
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {task.status === "pending" && (
                          <AppButton
                            condition="edit"
                            label="Mulai Tugas"
                            onClick={() => updateTaskStatus(task.id, "in_progress")}
                          />
                        )}
                        {task.status === "in_progress" && (
                          <AppButton
                            condition="refresh"
                            label="Selesaikan Tugas"
                            onClick={() => updateTaskStatus(task.id, "completed")}
                          />
                        )}
                        {task.status === "completed" && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#10b981", pr: 1 }}>
                            <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>✓ Selesai</span>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* ─── Bottom Bar ─── */}
      <Box
        sx={{
          textAlign: "center",
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <AppTypography
          preset="helperText"
          sx={{ fontSize: "0.6rem", opacity: 0.5, fontWeight: 600, letterSpacing: "0.08em" }}
        >
          WORKFORCE COORDINATION SYSTEM v0.1.0
        </AppTypography>
      </Box>
    </Box>
  );
}
