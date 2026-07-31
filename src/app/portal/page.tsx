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
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AppTypography from "@/components/AppTypography";
import HelpButton from "@/components/HelpButton";
import RefillButton from "@/components/RefillButton";
import AppButton from "@/components/AppButton";
import { useStaffGuard } from "@/hooks/useStaffGuard";
import { logout as serviceLogout } from "@/features/auth/services/auth.services";
import { apiFetch } from "@/utils/api-client";

export default function StaffPortalPage() {
  const { isReady } = useStaffGuard();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const { staffs, fetchStaffs } = useStaffStore();
  const { areas, fetchAreas } = useAreaStore();
  const { tasks, fetchTasks, updateTaskStatus } = useTaskStore();

  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [helpStatus, setHelpStatus] = useState<"idle" | "requested">("idle");
  const [refillStatus, setRefillStatus] = useState<"idle" | "requested">("idle");

  useEffect(() => {
    if (!isReady || !user) return;

    fetchStaffs();
    fetchAreas();

    const fetchRoles = async () => {
      try {
        const data = await apiFetch<{ id: string; name: string }[]>("/roles");
        setRoles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch roles in portal:", err);
      }
    };

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

    fetchRoles();
    fetchSystemState();
    const interval = setInterval(fetchSystemState, 3000);
    return () => clearInterval(interval);
  }, [isReady, user, fetchStaffs, fetchAreas, fetchTasks]);

  if (!isReady || !user) return null;

  // Find the staff record linked to this user
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Box
      className="bg-grid-pattern"
      sx={{
        minHeight: "100vh",
        backgroundColor: "#09090b",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ─── Top App Bar ─── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "#121215",
          borderBottom: "1px solid #1e1e24",
          color: "#ffffff",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                backgroundColor: "#18181b",
                color: "#ffffff",
                border: "1px solid #27272a",
                fontWeight: 700,
                fontSize: "0.875rem",
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <AppTypography
                  preset="bodyText"
                  sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#ffffff", lineHeight: 1.2 }}
                >
                  Field Staff Portal
                </AppTypography>
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    backgroundColor: "#eab308",
                  }}
                />
              </Box>
              <AppTypography
                preset="helperText"
                sx={{ fontSize: "0.6875rem", color: "#a1a1aa" }}
              >
                Kembang Tasik WO & Catering
              </AppTypography>
            </Box>
          </Box>
          <IconButton onClick={handleLogout} size="small" sx={{ color: "#71717a", "&:hover": { color: "#ef4444" } }}>
            <LogoutIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* ─── Main Mobile Content Container ─── */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, maxWidth: 540, mx: "auto", width: "100%" }}>
        {/* Emergency Dispatch Banner */}
        {emergencyActive && (
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 2,
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <WarningAmberOutlinedIcon sx={{ fontSize: 24 }} />
            <Box>
              <AppTypography preset="bodyText" sx={{ fontWeight: 700, color: "inherit", fontSize: "0.875rem" }}>
                🚨 EMERGENCY DISPATCH ACTIVE
              </AppTypography>
              <AppTypography preset="helperText" sx={{ color: "#fca5a5", fontSize: "0.75rem" }}>
                All crew members must report to the Gathering Area immediately.
              </AppTypography>
            </Box>
          </Paper>
        )}

        {/* Welcome Profile Card */}
        <Card sx={{ mb: 2.5, p: 0.5 }}>
          <CardContent sx={{ p: 2.5 }}>
            <AppTypography preset="helperText" sx={{ color: "#eab308", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
              {getGreeting()},
            </AppTypography>
            <AppTypography preset="pageTitle" sx={{ color: "#ffffff", fontWeight: 700, fontSize: "1.35rem", letterSpacing: "-0.02em", mb: 0.25 }}>
              {user.name}
            </AppTypography>
            <AppTypography preset="helperText" sx={{ color: "#71717a", fontSize: "0.8125rem" }}>
              {user.email}
            </AppTypography>
          </CardContent>
        </Card>

        {/* Assigned Zone Info Card */}
        <Card sx={{ mb: 2.5, p: 0.5 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <LocationOnOutlinedIcon sx={{ color: "#eab308", fontSize: 18 }} />
              <AppTypography preset="cardTitle" sx={{ fontWeight: 600, fontSize: "0.9375rem", color: "#ffffff" }}>
                Assigned Zone
              </AppTypography>
            </Box>
            {myArea ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  borderColor: "rgba(234, 179, 8, 0.3)",
                  backgroundColor: "rgba(234, 179, 8, 0.05)",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <AppTypography preset="sectionTitle" sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#ffffff" }}>
                    {myArea.name}
                  </AppTypography>
                  <Chip
                    label={myArea.type || "Zone"}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(234, 179, 8, 0.15)",
                      color: "#eab308",
                      border: "1px solid rgba(234, 179, 8, 0.3)",
                      fontWeight: 600,
                      fontSize: "0.6875rem",
                      height: 22,
                    }}
                  />
                </Box>
                {myStaff && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <PersonOutlinedIcon sx={{ fontSize: 16, color: "#a1a1aa" }} />
                    <AppTypography preset="helperText" sx={{ color: "#a1a1aa", fontSize: "0.8125rem" }}>
                      Role: <strong style={{ color: "#ffffff" }}>{roles.find((r) => r.id === myStaff.role)?.name || myStaff.role}</strong>
                    </AppTypography>
                  </Box>
                )}
              </Paper>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  textAlign: "center",
                  borderColor: "#27272a",
                  backgroundColor: "#09090b",
                }}
              >
                <LocationOnOutlinedIcon sx={{ fontSize: 32, color: "#3f3f46", mb: 0.75 }} />
                <AppTypography preset="bodyText" sx={{ fontWeight: 600, color: "#a1a1aa", fontSize: "0.875rem" }}>
                  No Area Assigned
                </AppTypography>
                <AppTypography preset="helperText" sx={{ color: "#71717a", fontSize: "0.75rem", mt: 0.5 }}>
                  Coordinator has not assigned a designated event zone to your account yet.
                </AppTypography>
              </Paper>
            )}
          </CardContent>
        </Card>

        {/* Quick Operations Signals (Help & Refill) */}
        <Card sx={{ mb: 2.5, p: 0.5 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <AssignmentOutlinedIcon sx={{ color: "#a1a1aa", fontSize: 18 }} />
              <AppTypography preset="cardTitle" sx={{ fontWeight: 600, fontSize: "0.9375rem", color: "#ffffff" }}>
                Field Signal Triggers
              </AppTypography>
            </Box>
            <AppTypography preset="helperText" sx={{ mb: 2.5, color: "#71717a", fontSize: "0.75rem" }}>
              Send instant alert requests directly to administrative coordinators.
            </AppTypography>
            <Stack spacing={1.5}>
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

        {/* Assigned Tasks List */}
        <Card sx={{ p: 0.5, mb: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AssignmentOutlinedIcon sx={{ color: "#eab308", fontSize: 18 }} />
                <AppTypography preset="cardTitle" sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#ffffff" }}>
                  My Assigned Tasks
                </AppTypography>
              </Box>
              <Chip
                label={`${tasks.length} tasks`}
                size="small"
                sx={{
                  backgroundColor: "#18181b",
                  color: "#a1a1aa",
                  border: "1px solid #27272a",
                  fontSize: "0.6875rem",
                  height: 20,
                }}
              />
            </Box>
            <Divider sx={{ mb: 2, borderColor: "#1e1e24" }} />

            {tasks.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <AssignmentOutlinedIcon sx={{ fontSize: 36, color: "#27272a", mb: 1 }} />
                <AppTypography preset="bodyText" sx={{ fontWeight: 600, color: "#a1a1aa", fontSize: "0.875rem" }}>
                  No Active Tasks
                </AppTypography>
                <AppTypography preset="helperText" sx={{ color: "#71717a", fontSize: "0.75rem", mt: 0.5 }}>
                  Tasks delegated by event coordinators will update here automatically.
                </AppTypography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {tasks.map((task) => (
                  <Paper
                    key={task.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor:
                        task.status === "completed"
                          ? "rgba(34, 197, 94, 0.3)"
                          : task.status === "in_progress"
                          ? "rgba(234, 179, 8, 0.3)"
                          : "#1e1e24",
                      backgroundColor:
                        task.status === "completed"
                          ? "rgba(34, 197, 94, 0.05)"
                          : task.status === "in_progress"
                          ? "rgba(234, 179, 8, 0.05)"
                          : "#09090b",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <AppTypography preset="cardTitle" sx={{ fontWeight: 600, fontSize: "0.9375rem", color: "#ffffff" }}>
                        {task.title}
                      </AppTypography>
                      {task.status === "pending" && (
                        <Chip
                          label="Pending"
                          size="small"
                          sx={{ backgroundColor: "#18181b", color: "#a1a1aa", border: "1px solid #27272a", fontSize: "0.6875rem", height: 20 }}
                        />
                      )}
                      {task.status === "in_progress" && (
                        <Chip
                          label="In Progress"
                          size="small"
                          sx={{ backgroundColor: "rgba(234, 179, 8, 0.15)", color: "#eab308", border: "1px solid rgba(234, 179, 8, 0.3)", fontSize: "0.6875rem", height: 20 }}
                        />
                      )}
                      {task.status === "completed" && (
                        <Chip
                          label="Completed"
                          size="small"
                          sx={{ backgroundColor: "rgba(34, 197, 94, 0.15)", color: "#22c55e", border: "1px solid rgba(34, 197, 94, 0.3)", fontSize: "0.6875rem", height: 20 }}
                        />
                      )}
                    </Box>

                    {task.description && (
                      <AppTypography preset="bodyText" sx={{ color: "#a1a1aa", fontSize: "0.8125rem", mb: 1.5, whiteSpace: "pre-wrap" }}>
                        {task.description}
                      </AppTypography>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1, borderTop: "1px solid #1e1e24" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 14, color: "#71717a" }} />
                        <AppTypography preset="helperText" sx={{ color: "#71717a", fontSize: "0.75rem" }}>
                          {task.areaName || "Global Zone"}
                        </AppTypography>
                      </Box>

                      <Box>
                        {task.status === "pending" && (
                          <AppButton
                            variant="contained"
                            color="primary"
                            size="small"
                            label="Start Task"
                            onClick={() => updateTaskStatus(task.id, "in_progress")}
                            sx={{ py: 0.5, px: 1.5, fontSize: "0.75rem" }}
                          />
                        )}
                        {task.status === "in_progress" && (
                          <AppButton
                            variant="contained"
                            color="success"
                            size="small"
                            label="Mark Complete"
                            onClick={() => updateTaskStatus(task.id, "completed")}
                            sx={{ py: 0.5, px: 1.5, fontSize: "0.75rem" }}
                          />
                        )}
                        {task.status === "completed" && (
                          <AppTypography preset="helperText" sx={{ color: "#22c55e", fontWeight: 600, fontSize: "0.75rem" }}>
                            ✓ Done
                          </AppTypography>
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

      {/* Footer */}
      <Box
        sx={{
          textAlign: "center",
          py: 2,
          borderTop: "1px solid #1e1e24",
          backgroundColor: "#121215",
          mt: "auto",
        }}
      >
        <AppTypography
          preset="helperText"
          sx={{ fontSize: "0.65rem", color: "#71717a", fontWeight: 500, letterSpacing: "0.05em" }}
        >
          WORKFORCE SYSTEM — STAFF PORTAL
        </AppTypography>
      </Box>
    </Box>
  );
}
