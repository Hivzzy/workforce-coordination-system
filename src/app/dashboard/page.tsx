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
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import MapIcon from "@mui/icons-material/Map";
import SecurityIcon from "@mui/icons-material/Security";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AppTypography from "@/components/AppTypography";
import AdminShell from "@/components/AdminShell";
import EmergencyButton from "@/components/EmergencyButton";
import AppButton from "@/components/AppButton";

// ─── Animated Counter Hook ──────────────────────────────
function useCountUp(target: number, duration = 800) {
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
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (target - startValue) * eased);
      setValue(current);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [target, duration]); // eslint-disable-line react-hooks/exhaustive-deps

  return value;
}

// ─── Dashboard Page ─────────────────────────────────────
export default function DashboardPage() {
  const { staffs, fetchStaffs } = useStaffStore();
  const { areas, fetchAreas } = useAreaStore();

  const [emergencyActive, setEmergencyActive] = useState(false);
  const [helpStatus, setHelpStatus] = useState<string>("idle");
  const [refillStatus, setRefillStatus] = useState<string>("idle");

  const prevEmergencyRef = useRef(emergencyActive);
  const prevHelpRef = useRef(helpStatus);
  const prevRefillRef = useRef(refillStatus);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev]);
  };

  useEffect(() => {
    fetchStaffs();
    fetchAreas();

    const fetchSystemState = async () => {
      try {
        const res = await fetch("/api/system-state");
        if (res.ok) {
          const data = await res.json();
          
          if (data.emergencyActive !== prevEmergencyRef.current) {
            addLog(
              data.emergencyActive
                ? "🚨 DARURAT: Semua staff diminta berkumpul ke GATHERING AREA segera!"
                : "✅ DARURAT SELESAI: Perintah berkumpul darurat dicabut."
            );
            prevEmergencyRef.current = data.emergencyActive;
          }
          if (data.helpStatus !== prevHelpRef.current) {
            addLog(
              data.helpStatus !== "idle"
                ? `⚠️ BUTUH BANTUAN: Panggilan bantuan aktif dari Area: ${data.helpStatus}.`
                : "✅ BANTUAN DIATASI: Panggilan bantuan diselesaikan."
            );
            prevHelpRef.current = data.helpStatus;
          }
          if (data.refillStatus !== prevRefillRef.current) {
            addLog(
              data.refillStatus !== "idle"
                ? `📦 MINTA REFILL: Permintaan isi ulang logistik (minuman) dari Area: ${data.refillStatus}.`
                : "✅ REFILL SELESAI: Permintaan isi ulang diselesaikan."
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

  const [logs, setLogs] = useState<string[]>([
    "🏁 Sistem Koordinasi diinisialisasi.",
    "📋 Menunggu instruksi atau trigger darurat.",
  ]);

  // Animated counters
  const animatedStaffCount = useCountUp(staffs.length);
  const animatedAreaCount = useCountUp(areas.length);

  // Derived stats
  const assignedStaffs = staffs.filter((s) => !!s.assignedAreaId);
  const assignedRatio = staffs.length > 0 ? (assignedStaffs.length / staffs.length) * 100 : 0;
  const animatedAssigned = useCountUp(assignedStaffs.length);

  // Dynamic system status
  const getSystemStatus = () => {
    if (emergencyActive) return { label: "DARURAT AKTIF", color: "error.main", icon: <WarningAmberIcon fontSize="large" /> };
    if (helpStatus !== "idle") return { label: `Bantuan: ${helpStatus}`, color: "warning.main", icon: <WarningAmberIcon fontSize="large" /> };
    if (refillStatus !== "idle") return { label: `Refill: ${refillStatus}`, color: "secondary.main", icon: <SecurityIcon fontSize="large" /> };
    return { label: "Kondisi Aman", color: "success.main", icon: <CheckCircleIcon fontSize="large" /> };
  };
  const systemStatus = getSystemStatus();

  const toggleEmergency = async () => {
    const nextState = !emergencyActive;
    prevEmergencyRef.current = nextState;
    setEmergencyActive(nextState);
    addLog(
      nextState
        ? "🚨 DARURAT: Semua staff diminta berkumpul ke GATHERING AREA segera!"
        : "✅ DARURAT SELESAI: Perintah berkumpul darurat dicabut."
    );
    try {
      await fetch("/api/system-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyActive: nextState }),
      });
    } catch (err) {
      console.error("Failed to update emergency state:", err);
    }
  };

  const toggleHelp = async () => {
    const nextState = "idle";
    prevHelpRef.current = nextState;
    setHelpStatus(nextState);
    addLog("✅ BANTUAN DIATASI: Panggilan bantuan diselesaikan.");
    try {
      await fetch("/api/system-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpStatus: nextState }),
      });
    } catch (err) {
      console.error("Failed to update help status:", err);
    }
  };

  const toggleRefill = async () => {
    const nextState = "idle";
    prevRefillRef.current = nextState;
    setRefillStatus(nextState);
    addLog("✅ REFILL SELESAI: Permintaan isi ulang diselesaikan.");
    try {
      await fetch("/api/system-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refillStatus: nextState }),
      });
    } catch (err) {
      console.error("Failed to update refill status:", err);
    }
  };

  return (
    <AdminShell>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <AppTypography preset="pageTitle">Ringkasan Sistem Koordinasi</AppTypography>
        <AppTypography preset="helperText" color="text.secondary">
          Monitor status staff, area event, dan simulasi tombol operasional lapangan.
        </AppTypography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Staff Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            className="animate-stat-shimmer"
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.02) 100%)",
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: "primary.main",
                color: "white",
                mr: 2,
                display: "flex",
              }}
            >
              <PeopleIcon fontSize="large" />
            </Box>
            <Box>
              <AppTypography preset="helperText" color="text.secondary" sx={{ fontWeight: "bold" }}>
                Total Staff
              </AppTypography>
              <AppTypography preset="pageTitle" sx={{ mt: -0.5, fontWeight: 800 }}>
                {animatedStaffCount}
              </AppTypography>
            </Box>
          </Card>
        </Grid>

        {/* Total Area Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            className="animate-stat-shimmer"
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(6, 182, 212, 0.02) 100%)",
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: "secondary.main",
                color: "white",
                mr: 2,
                display: "flex",
              }}
            >
              <MapIcon fontSize="large" />
            </Box>
            <Box>
              <AppTypography preset="helperText" color="text.secondary" sx={{ fontWeight: "bold" }}>
                Total Area
              </AppTypography>
              <AppTypography preset="pageTitle" sx={{ mt: -0.5, fontWeight: 800 }}>
                {animatedAreaCount}
              </AppTypography>
            </Box>
          </Card>
        </Grid>

        {/* Staff Assignment Ratio Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 2,
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: "warning.main",
                  color: "white",
                  mr: 2,
                  display: "flex",
                }}
              >
                <SecurityIcon fontSize="large" />
              </Box>
              <Box>
                <AppTypography preset="helperText" color="text.secondary" sx={{ fontWeight: "bold" }}>
                  Penugasan
                </AppTypography>
                <AppTypography preset="sectionTitle" sx={{ mt: -0.2, fontWeight: 800 }}>
                  {animatedAssigned}/{staffs.length}
                </AppTypography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={assignedRatio}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                  background: "linear-gradient(90deg, #f59e0b, #f97316)",
                },
              }}
            />
            <AppTypography preset="helperText" sx={{ mt: 0.8, fontWeight: 600, fontSize: "0.65rem" }}>
              {Math.round(assignedRatio)}% staff telah ditugaskan ke area
            </AppTypography>
          </Card>
        </Grid>

        {/* System Alert Status — DYNAMIC */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              background: emergencyActive
                ? "linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(244, 63, 94, 0.04) 100%)"
                : helpStatus === "requested"
                ? "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.04) 100%)"
                : "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)",
              transition: "background 0.4s ease",
            }}
          >
            <Box
              className={emergencyActive ? "animate-pulse-glow" : ""}
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: systemStatus.color,
                color: "white",
                mr: 2,
                display: "flex",
                transition: "background-color 0.3s ease",
              }}
            >
              {systemStatus.icon}
            </Box>
            <Box>
              <AppTypography preset="helperText" color="text.secondary" sx={{ fontWeight: "bold" }}>
                Status Sistem
              </AppTypography>
              <AppTypography
                preset="sectionTitle"
                sx={{
                  mt: 0.2,
                  fontWeight: 800,
                  color: systemStatus.color,
                  transition: "color 0.3s ease",
                }}
              >
                {systemStatus.label}
              </AppTypography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Grid Content */}
      <Grid container spacing={4}>
        {/* Operations & Simulators Panel */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <AppTypography preset="sectionTitle" sx={{ mb: 2, fontWeight: 800 }}>
                Pusat Koordinasi Lapangan
              </AppTypography>
              <AppTypography preset="helperText" sx={{ mb: 3 }}>
                Simulasikan aksi cepat dari Admin (Emergency) maupun permintaan bantuan serta isi ulang logistik dari Staff di lapangan.
              </AppTypography>

              <StackContainer title="Aksi Darurat Admin (Emergency)">
                <EmergencyButton active={emergencyActive} onClick={toggleEmergency} />
              </StackContainer>

              <StackContainer title="Tindakan Permintaan Staff (Bantuan & Refill)">
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {helpStatus !== "idle" ? (
                    <AppButton
                      condition="warning"
                      label={`Atasi Bantuan (${helpStatus})`}
                      onClick={toggleHelp}
                    />
                  ) : (
                    <AppButton
                      variant="outlined"
                      label="Tidak Ada Panggilan Bantuan"
                      disabled
                    />
                  )}

                  {refillStatus !== "idle" ? (
                    <AppButton
                      condition="refresh"
                      label={`Selesaikan Refill (${refillStatus})`}
                      onClick={toggleRefill}
                    />
                  ) : (
                    <AppButton
                      variant="outlined"
                      label="Tidak Ada Permintaan Refill"
                      disabled
                    />
                  )}
                </Box>
              </StackContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Real-time System Feed Logs */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
              <AppTypography
                preset="sectionTitle"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontWeight: 800 }}
              >
                <ListAltIcon color="primary" /> Feed Log Koordinasi
              </AppTypography>

              <Paper
                variant="outlined"
                sx={{
                  flexGrow: 1,
                  maxHeight: 320,
                  overflowY: "auto",
                  p: 2,
                  bgcolor: "background.default",
                  borderRadius: 2,
                }}
              >
                {logs.length === 0 ? (
                  <AppTypography preset="helperText" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                    Belum ada log aktivitas.
                  </AppTypography>
                ) : (
                  logs.map((log, index) => (
                    <Box
                      key={index}
                      className={index === 0 ? "animate-slide-in" : ""}
                      sx={{ mb: 1, borderBottom: "1px solid rgba(255, 255, 255, 0.05)", pb: 0.5 }}
                    >
                      <AppTypography
                        preset="helperText"
                        sx={{
                          fontFamily: "monospace",
                          color: log.includes("🚨")
                            ? "error.main"
                            : log.includes("⚠️")
                            ? "warning.main"
                            : log.includes("📦")
                            ? "secondary.main"
                            : "text.primary",
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

// Helpers/Sub-layout container for simulator buttons
function StackContainer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 3 }}>
      <AppTypography
        preset="helperText"
        sx={{ fontWeight: "bold", mb: 1.5, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}
      >
        {title}
      </AppTypography>
      <Divider sx={{ mb: 2, opacity: 0.4 }} />
      {children}
    </Box>
  );
}
