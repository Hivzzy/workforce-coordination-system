"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStaffStore } from "@/features/staff/store/staff.store";
import { useAreaStore } from "@/features/area/store/area.store";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Divider,
  Paper,
  LinearProgress,
  Chip,
} from "@mui/material";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AppTypography from "@/components/AppTypography";
import AdminShell from "@/components/AdminShell";
import EmergencyButton from "@/components/EmergencyButton";
import AppButton from "@/components/AppButton";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { apiFetch } from "@/utils/api-client";

interface SystemStateResponse {
  emergencyActive: boolean;
  helpStatus: string;
  refillStatus: string;
}

// ─── Animated Counter Hook ──────────────────────────────
function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (target === prevTarget.current && value === target) return;
    prevTarget.current = target;

    const startTime = performance.now();
    const startValue = value;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (target - startValue) * eased);
      setValue(current);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}

// ─── Dashboard Page ─────────────────────────────────────
export default function DashboardPage() {
  const { isReady } = useAdminGuard();
  const { staffs, fetchStaffs } = useStaffStore();
  const { areas, fetchAreas } = useAreaStore();

  const [emergencyActive, setEmergencyActive] = useState(false);
  const [helpStatus, setHelpStatus] = useState("idle");
  const [refillStatus, setRefillStatus] = useState("idle");
  const [logs, setLogs] = useState<string[]>([
    "🏁 System initialized. Monitoring live workforce status.",
    "📋 Ready for coordination events and live alerts.",
  ]);

  const prevEmergencyRef = useRef(false);
  const prevHelpRef = useRef("idle");
  const prevRefillRef = useRef("idle");

  const addLog = (message: string) => {
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString("id-ID")}] ${message}`,
      ...prev.slice(0, 19),
    ]);
  };

  useEffect(() => {
    fetchStaffs();
    fetchAreas();

    const fetchSystemState = async () => {
      try {
        const data = await apiFetch<SystemStateResponse>("/system-state");
        if (data) {
          if (data.emergencyActive !== prevEmergencyRef.current) {
            addLog(
              data.emergencyActive
                ? "🚨 EMERGENCY: All field crew dispatched to Gathering Area."
                : "✅ RESOLVED: Emergency dispatch cleared."
            );
            prevEmergencyRef.current = data.emergencyActive;
          }
          if (data.helpStatus !== prevHelpRef.current) {
            addLog(
              data.helpStatus !== "idle"
                ? `⚠️ HELP NEEDED: Assistance requested at Area: ${data.helpStatus}.`
                : "✅ RESOLVED: Assistance call cleared."
            );
            prevHelpRef.current = data.helpStatus;
          }
          if (data.refillStatus !== prevRefillRef.current) {
            addLog(
              data.refillStatus !== "idle"
                ? `📦 REFILL REQUEST: Catering refill requested at Area: ${data.refillStatus}.`
                : "✅ RESOLVED: Refill request completed."
            );
            prevRefillRef.current = data.refillStatus;
          }

          setEmergencyActive(data.emergencyActive);
          setHelpStatus(data.helpStatus);
          setRefillStatus(data.refillStatus);
        }
      } catch (err) {
        console.error("Failed to fetch system state:", err);
      }
    };

    fetchSystemState();
    const interval = setInterval(fetchSystemState, 3000);
    return () => clearInterval(interval);
  }, [fetchStaffs, fetchAreas]);

  // Animated counters
  const animatedStaffCount = useCountUp(staffs.length);
  const animatedAreaCount = useCountUp(areas.length);

  // Derived stats
  const assignedStaffs = staffs.filter((s) => !!s.assignedAreaId);
  const assignedRatio = staffs.length > 0 ? (assignedStaffs.length / staffs.length) * 100 : 0;
  const animatedAssigned = useCountUp(assignedStaffs.length);

  // Dynamic system status
  const getSystemStatus = () => {
    if (emergencyActive)
      return {
        label: "EMERGENCY ACTIVE",
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.1)",
        border: "rgba(239, 68, 68, 0.3)",
        icon: <WarningAmberOutlinedIcon sx={{ fontSize: 20 }} />,
      };
    if (helpStatus !== "idle")
      return {
        label: `HELP: ${helpStatus}`,
        color: "#f97316",
        bg: "rgba(249, 115, 22, 0.1)",
        border: "rgba(249, 115, 22, 0.3)",
        icon: <WarningAmberOutlinedIcon sx={{ fontSize: 20 }} />,
      };
    if (refillStatus !== "idle")
      return {
        label: `REFILL: ${refillStatus}`,
        color: "#eab308",
        bg: "rgba(234, 179, 8, 0.1)",
        border: "rgba(234, 179, 8, 0.3)",
        icon: <ShieldOutlinedIcon sx={{ fontSize: 20 }} />,
      };
    return {
      label: "SYSTEM OPTIMAL",
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.1)",
      border: "rgba(34, 197, 94, 0.3)",
      icon: <CheckCircleOutlinedIcon sx={{ fontSize: 20 }} />,
    };
  };
  const systemStatus = getSystemStatus();

  const toggleEmergency = async () => {
    const nextState = !emergencyActive;
    prevEmergencyRef.current = nextState;
    setEmergencyActive(nextState);
    addLog(
      nextState
        ? "🚨 EMERGENCY: All field crew dispatched to Gathering Area."
        : "✅ RESOLVED: Emergency dispatch cleared."
    );
    try {
      await apiFetch("/system-state", {
        method: "POST",
        data: { emergencyActive: String(nextState) },
      });
    } catch (err) {
      console.error("Failed to update emergency state:", err);
    }
  };

  const toggleHelp = async () => {
    const nextState = "idle";
    prevHelpRef.current = nextState;
    setHelpStatus(nextState);
    addLog("✅ RESOLVED: Assistance call cleared.");
    try {
      await apiFetch("/system-state", {
        method: "POST",
        data: { helpStatus: nextState },
      });
    } catch (err) {
      console.error("Failed to update help status:", err);
    }
  };

  const toggleRefill = async () => {
    const nextState = "idle";
    prevRefillRef.current = nextState;
    setRefillStatus(nextState);
    addLog("✅ RESOLVED: Refill request completed.");
    try {
      await apiFetch("/system-state", {
        method: "POST",
        data: { refillStatus: nextState },
      });
    } catch (err) {
      console.error("Failed to update refill status:", err);
    }
  };

  return (
    <AdminShell>
      {/* Page Title Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Box>
          <AppTypography
            preset="pageTitle"
            sx={{ fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-0.02em", color: "#ffffff" }}
          >
            Dashboard & Live Coordination Monitor
          </AppTypography>
          <AppTypography preset="helperText" sx={{ color: "#a1a1aa", mt: 0.5 }}>
            Real-time workforce deployment, area coverage, and event alert monitoring.
          </AppTypography>
        </Box>
        <Chip
          icon={systemStatus.icon}
          label={systemStatus.label}
          sx={{
            backgroundColor: systemStatus.bg,
            color: systemStatus.color,
            border: `1px solid ${systemStatus.border}`,
            fontWeight: 600,
            fontSize: "0.75rem",
            px: 1,
            py: 0.5,
            height: 32,
            "& .MuiChip-icon": { color: systemStatus.color },
          }}
        />
      </Box>

      {/* KPI Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Total Staff Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2.5, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <AppTypography preset="helperText" sx={{ color: "#a1a1aa", fontWeight: 600, fontSize: "0.75rem" }}>
                TOTAL WORKFORCE
              </AppTypography>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  color: "#a1a1aa",
                  display: "flex",
                }}
              >
                <PeopleOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
            <AppTypography preset="pageTitle" sx={{ fontWeight: 700, fontSize: "2rem", color: "#ffffff" }}>
              {animatedStaffCount}
            </AppTypography>
            <AppTypography preset="helperText" sx={{ color: "#71717a", fontSize: "0.75rem", mt: 0.5 }}>
              Registered active staff members
            </AppTypography>
          </Card>
        </Grid>

        {/* Total Area Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2.5, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <AppTypography preset="helperText" sx={{ color: "#a1a1aa", fontWeight: 600, fontSize: "0.75rem" }}>
                EVENT ZONES
              </AppTypography>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  color: "#a1a1aa",
                  display: "flex",
                }}
              >
                <MapOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
            <AppTypography preset="pageTitle" sx={{ fontWeight: 700, fontSize: "2rem", color: "#ffffff" }}>
              {animatedAreaCount}
            </AppTypography>
            <AppTypography preset="helperText" sx={{ color: "#71717a", fontSize: "0.75rem", mt: 0.5 }}>
              Configured venue layout areas
            </AppTypography>
          </Card>
        </Grid>

        {/* Staff Assignment Ratio Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2.5, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <AppTypography preset="helperText" sx={{ color: "#a1a1aa", fontWeight: 600, fontSize: "0.75rem" }}>
                DEPLOYMENT RATIO
              </AppTypography>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  color: "#eab308",
                  display: "flex",
                }}
              >
                <ShieldOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
            <AppTypography preset="pageTitle" sx={{ fontWeight: 700, fontSize: "2rem", color: "#ffffff" }}>
              {animatedAssigned}/{staffs.length}
            </AppTypography>
            <Box sx={{ mt: 1.5 }}>
              <LinearProgress
                variant="determinate"
                value={assignedRatio}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#18181b",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 2,
                    backgroundColor: "#eab308",
                  },
                }}
              />
            </Box>
            <AppTypography preset="helperText" sx={{ color: "#71717a", fontSize: "0.75rem", mt: 0.75 }}>
              {Math.round(assignedRatio)}% assigned to specific zones
            </AppTypography>
          </Card>
        </Grid>

        {/* System Alert Monitor */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2.5, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <AppTypography preset="helperText" sx={{ color: "#a1a1aa", fontWeight: 600, fontSize: "0.75rem" }}>
                ACTIVE ALERTS
              </AppTypography>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  backgroundColor: systemStatus.bg,
                  border: `1px solid ${systemStatus.border}`,
                  color: systemStatus.color,
                  display: "flex",
                }}
              >
                {systemStatus.icon}
              </Box>
            </Box>
            <AppTypography preset="pageTitle" sx={{ fontWeight: 700, fontSize: "1.25rem", color: systemStatus.color }}>
              {systemStatus.label}
            </AppTypography>
            <AppTypography preset="helperText" sx={{ color: "#71717a", fontSize: "0.75rem", mt: 0.5 }}>
              Live signals from field devices
            </AppTypography>
          </Card>
        </Grid>
      </Grid>

      {/* Main Operations & Live Logs Feed */}
      <Grid container spacing={3}>
        {/* Coordination Control Panel */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: "100%", p: 1 }}>
            <CardContent>
              <AppTypography preset="sectionTitle" sx={{ mb: 1, fontWeight: 700, fontSize: "1.1rem", color: "#ffffff" }}>
                Coordination Controls
              </AppTypography>
              <AppTypography preset="helperText" sx={{ mb: 3, color: "#a1a1aa" }}>
                Trigger site-wide emergency gathering dispatch or manage live field requests.
              </AppTypography>

              <Box sx={{ mb: 3 }}>
                <AppTypography
                  preset="helperText"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#71717a", fontSize: "0.75rem", textTransform: "uppercase" }}
                >
                  Site Dispatch
                </AppTypography>
                <EmergencyButton active={emergencyActive} onClick={toggleEmergency} />
              </Box>

              <Divider sx={{ my: 2.5, borderColor: "#1e1e24" }} />

              <Box>
                <AppTypography
                  preset="helperText"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#71717a", fontSize: "0.75rem", textTransform: "uppercase" }}
                >
                  Live Signal Resolution
                </AppTypography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                  {helpStatus !== "idle" ? (
                    <AppButton
                      variant="contained"
                      color="warning"
                      label={`Resolve Help (${helpStatus})`}
                      onClick={toggleHelp}
                    />
                  ) : (
                    <AppButton
                      variant="outlined"
                      label="No Active Help Call"
                      disabled
                    />
                  )}

                  {refillStatus !== "idle" ? (
                    <AppButton
                      variant="contained"
                      color="primary"
                      label={`Resolve Refill (${refillStatus})`}
                      onClick={toggleRefill}
                    />
                  ) : (
                    <AppButton
                      variant="outlined"
                      label="No Active Refill Call"
                      disabled
                    />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Real-time System Feed Logs */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column", p: 1 }}>
            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <TerminalOutlinedIcon sx={{ color: "#eab308", fontSize: 20 }} />
                <AppTypography preset="sectionTitle" sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#ffffff" }}>
                  Live Operations Feed
                </AppTypography>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  flexGrow: 1,
                  minHeight: 240,
                  maxHeight: 320,
                  overflowY: "auto",
                  p: 2,
                  backgroundColor: "#09090b",
                  borderColor: "#1e1e24",
                  borderRadius: 2,
                }}
              >
                {logs.length === 0 ? (
                  <AppTypography preset="helperText" sx={{ color: "#71717a", textAlign: "center", py: 4 }}>
                    No system log events recorded.
                  </AppTypography>
                ) : (
                  logs.map((log, index) => (
                    <Box
                      key={index}
                      className={index === 0 ? "animate-fade-in" : ""}
                      sx={{ mb: 1, borderBottom: "1px solid #141418", pb: 0.75 }}
                    >
                      <AppTypography
                        preset="helperText"
                        sx={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.8125rem",
                          color: log.includes("🚨")
                            ? "#ef4444"
                            : log.includes("⚠️")
                            ? "#f97316"
                            : log.includes("📦")
                            ? "#eab308"
                            : "#a1a1aa",
                        }}
                      >
                        {log}
                      </AppTypography>
                    </Box>
                  ))
                )}
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AdminShell>
  );
}
