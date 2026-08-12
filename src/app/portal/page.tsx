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
  Avatar,
  IconButton,
  Chip,
  Paper,
  Stack,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AppTypography from "@/components/AppTypography";
import HelpButton from "@/components/HelpButton";
import RefillButton from "@/components/RefillButton";
import { useStaffGuard } from "@/hooks/useStaffGuard";
import { logout as serviceLogout } from "@/features/auth/services/auth.services";
import { apiFetch } from "@/utils/api-client";
import { globalWebSocket } from "@/utils/websocket-client";

export default function StaffPortalPage() {
  const { isReady } = useStaffGuard();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const { staffs, fetchStaffs } = useStaffStore();
  const { areas, fetchAreas } = useAreaStore();
  const { tasks, fetchTasks, updateTaskStatus } = useTaskStore();

  const [emergencyActive, setEmergencyActive] = useState(false);
  const [helpStatus, setHelpStatus] = useState<"idle" | "requested">("idle");
  const [refillStatus, setRefillStatus] = useState<"idle" | "requested">("idle");

  useEffect(() => {
    if (!isReady || !user) return;

    fetchStaffs();
    fetchAreas();

    const fetchSystemState = async () => {
      try {
        const data = await apiFetch<{ emergencyActive: boolean; helpStatus: string; refillStatus: string }>("/system-state");
        if (data) {
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

    fetchSystemState();

    // ⚡ Connect to WebSocket for instant real-time Emergency dispatch notifications (< 50ms)
    globalWebSocket.connect(() => {
      globalWebSocket.subscribe("/topic/emergency", (msg) => {
        try {
          const payload = JSON.parse(msg.body);
          if (payload.active !== undefined) {
            setEmergencyActive(payload.active);
          }
        } catch (e) {
          console.error("Error parsing emergency socket in portal:", e);
        }
      });

      globalWebSocket.subscribe("/topic/tasks", () => {
        if (user?.staffId) {
          fetchTasks(user.staffId);
        }
      });
    });

  }, [isReady, user, fetchStaffs, fetchAreas, fetchTasks]);

  if (!isReady || !user) return null;

  // Find staff record
  const myStaff = staffs.find((s) => s.id === user.staffId) || null;
  const myArea = myStaff?.assignedAreaId
    ? areas.find((a) => a.id === myStaff.assignedAreaId)
    : null;

  const handleLogout = async () => {
    await serviceLogout();
    router.push("/login");
  };

  const handleHelpToggle = async () => {
    const nextState = helpStatus === "idle" ? (myArea ? myArea.name : "Portal Staff") : "idle";
    setHelpStatus(nextState === "idle" ? "idle" : "requested");
    try {
      await apiFetch("/system-state", {
        method: "POST",
        data: { helpStatus: nextState },
      });
    } catch (err) {
      console.error("Failed to sync help request:", err);
    }
  };

  const handleRefillToggle = async () => {
    const nextState = refillStatus === "idle" ? (myArea ? myArea.name : "Portal Staff") : "idle";
    setRefillStatus(nextState === "idle" ? "idle" : "requested");
    try {
      await apiFetch("/system-state", {
        method: "POST",
        data: { refillStatus: nextState },
      });
    } catch (err) {
      console.error("Failed to sync refill request:", err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F6F6F6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: { xs: 1, sm: 3 },
        px: 2,
      }}
    >
      {/* Mobile Container (412px max matching Figma Staff Portal.svg) */}
      <Box
        sx={{
          maxWidth: 412,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {/* Header Profile Bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                backgroundColor: "#0F172A",
                color: "#FBC02D",
                fontWeight: 800,
                fontSize: "1.2rem",
                border: "2px solid #FBC02D",
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <AppTypography preset="sectionTitle" sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#0F172A", lineHeight: 1.2 }}>
                {user.name}
              </AppTypography>
              <AppTypography preset="helperText" sx={{ color: "#64748B", fontSize: "0.8rem", fontWeight: 500 }}>
                {user.email}
              </AppTypography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#10B981" }} />
                <AppTypography preset="helperText" sx={{ color: "#10B981", fontSize: "0.675rem", fontWeight: 700 }}>
                  WebSocket Real-Time Active
                </AppTypography>
              </Box>
            </Box>
          </Box>

          <IconButton
            onClick={handleLogout}
            sx={{
              backgroundColor: "#C3110C",
              color: "#ffffff",
              borderRadius: "8px",
              width: 42,
              height: 42,
              border: "1px solid #E44743",
              "&:hover": {
                backgroundColor: "#991B1B",
              },
            }}
          >
            <LogoutIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Emergency Dispatch Banner (Exact Figma Staff Portal - Alert.svg) */}
        {emergencyActive && (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              backgroundColor: "#C5221F",
              color: "#ffffff",
              borderRadius: "12px",
              display: "flex",
              alignItems: "flex-start",
              gap: 1.5,
              boxShadow: "0 4px 16px rgba(197, 34, 31, 0.4)",
              animation: "pulseEmergency 2s infinite ease-in-out",
            }}
          >
            <WarningAmberOutlinedIcon sx={{ fontSize: 28, color: "#ffffff", mt: 0.2 }} />
            <Box>
              <AppTypography preset="bodyText" sx={{ fontWeight: 800, color: "#ffffff", fontSize: "0.95rem", letterSpacing: "0.02em" }}>
                🚨 DARURAT GATHERING AREA ACTIVE!
              </AppTypography>
              <AppTypography preset="helperText" sx={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "0.825rem", mt: 0.5, lineHeight: 1.4 }}>
                Semuanya Harap Berkumpul Di Gathering Area Segera!
              </AppTypography>
            </Box>
          </Paper>
        )}

        {/* Assigned Zone Card */}
        <Card
          sx={{
            backgroundColor: "#0F172A",
            color: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #FBC02D",
            boxShadow: "0 4px 16px rgba(15, 23, 42, 0.15)",
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}>
              <LocationOnOutlinedIcon sx={{ color: "#FBC02D", fontSize: 24 }} />
              <AppTypography preset="helperText" sx={{ color: "#94A3B8", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Area Penugasan
              </AppTypography>
            </Box>

            <AppTypography preset="pageTitle" sx={{ color: "#FBC02D", fontWeight: 800, fontSize: "1.6rem", mb: 0.5 }}>
              {myArea ? myArea.name : "Belum Ditugaskan"}
            </AppTypography>

            <AppTypography preset="helperText" sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>
              Pusat Koordinasi Lapangan
            </AppTypography>
          </CardContent>
        </Card>

        {/* Operations Triggers Row (Help & Refill Buttons) */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <HelpButton
            status={helpStatus}
            onClick={handleHelpToggle}
          />
          <RefillButton
            status={refillStatus}
            onClick={handleRefillToggle}
          />
        </Box>

        {/* Tasks List Section */}
        <Box>
          <AppTypography preset="sectionTitle" sx={{ fontWeight: 800, fontSize: "1.25rem", color: "#0F172A", mb: 1.5 }}>
            Tugas Mandiri Saya
          </AppTypography>

          {tasks.length === 0 ? (
            <Card sx={{ borderRadius: "12px", p: 3, textAlign: "center", border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}>
              <AppTypography preset="bodyText" sx={{ color: "#64748B", fontWeight: 600, fontSize: "0.9rem" }}>
                Belum ada tugas mandiri yang diberikan.
              </AppTypography>
            </Card>
          ) : (
            <Stack spacing={2}>
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  sx={{
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <AppTypography preset="sectionTitle" sx={{ fontWeight: 700, fontSize: "1.05rem", color: "#0F172A" }}>
                        {task.title}
                      </AppTypography>
                      
                      <FormControl size="small">
                        <Select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            height: 28,
                            borderRadius: "6px",
                            backgroundColor:
                              task.status === "completed"
                                ? "#10B981"
                                : task.status === "in_progress"
                                ? "#F97316"
                                : "#64748B",
                            color: "#ffffff",
                            "& .MuiSvgIcon-root": { color: "#ffffff" },
                          }}
                        >
                          <MenuItem value="pending">Tertunda</MenuItem>
                          <MenuItem value="in_progress">Dikerjakan</MenuItem>
                          <MenuItem value="completed">Selesai</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {task.description && (
                      <AppTypography preset="bodyText" sx={{ color: "#475569", fontSize: "0.875rem", mb: 1.5, whiteSpace: "pre-wrap" }}>
                        {task.description}
                      </AppTypography>
                    )}

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: 1, borderTop: "1px dashed #E2E8F0" }}>
                      <Chip
                        label={task.areaName || "Area Venue"}
                        size="small"
                        sx={{
                          backgroundColor: "#F1F5F9",
                          color: "#334155",
                          fontWeight: 600,
                          fontSize: "0.725rem",
                          borderRadius: "4px",
                          height: 22,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
