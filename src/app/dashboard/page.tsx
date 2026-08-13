"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  Grid,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmergencyShareIcon from "@mui/icons-material/EmergencyShare";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import AppTypography from "@/components/AppTypography";
import DataTable, { Column } from "@/components/DataTable";
import AdminShell from "@/components/AdminShell";

import { useStaffStore } from "@/features/staff/store/staff.store";
import { useAreaStore } from "@/features/area/store/area.store";
import { useTaskStore } from "@/features/task/store/task.store";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { apiFetch } from "@/utils/api-client";
import { globalWebSocket } from "@/utils/websocket-client";
import { playEmergencyAlarm } from "@/utils/audio-alert";

interface AreaSignalInfo {
  areaId: string;
  areaName: string;
  helpActive?: boolean;
  refillActive?: boolean;
}

interface SystemStateResponse {
  emergencyActive: boolean;
  areaSignals?: Record<string, AreaSignalInfo>;
  helpStatus?: string;
  refillStatus?: string;
}

export default function DashboardPage() {
  const { isReady } = useAdminGuard();

  const { staffs, fetchStaffs } = useStaffStore();
  const { areas, fetchAreas } = useAreaStore();
  const { tasks, fetchTasks } = useTaskStore();

  const [emergencyActive, setEmergencyActive] = useState(false);
  const [areaSignals, setAreaSignals] = useState<Record<string, AreaSignalInfo>>({});
  const [operationsLogs, setOperationsLogs] = useState<string[]>([]);

  const prevEmergencyRef = useRef(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setOperationsLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    if (!isReady) return;

    fetchStaffs();
    fetchAreas();
    fetchTasks();

    const syncDashboardState = async () => {
      try {
        const data = await apiFetch<SystemStateResponse>("/system-state");
        if (data) {
          if (data.emergencyActive && !prevEmergencyRef.current) {
            playEmergencyAlarm();
          }
          prevEmergencyRef.current = data.emergencyActive;
          setEmergencyActive(data.emergencyActive);
          setAreaSignals(data.areaSignals || {});
        }
      } catch (err) {
        console.error("Failed to fetch system state in dashboard:", err);
      }
    };

    syncDashboardState();

    // ⚡ Real-Time WebSocket STOMP Sync (< 50ms)
    globalWebSocket.connect(() => {
      globalWebSocket.subscribe("/topic/emergency", (msg) => {
        try {
          const payload = JSON.parse(msg.body);
          if (payload.active !== undefined) {
            if (payload.active && !prevEmergencyRef.current) {
              playEmergencyAlarm();
            }
            prevEmergencyRef.current = payload.active;
            setEmergencyActive(payload.active);
          }
        } catch (e) {
          console.error("Error parsing emergency socket:", e);
        }
      });

      globalWebSocket.subscribe("/topic/system-state", (msg) => {
        try {
          const state: SystemStateResponse = JSON.parse(msg.body);
          if (state) {
            if (state.emergencyActive && !prevEmergencyRef.current) {
              playEmergencyAlarm();
            }
            prevEmergencyRef.current = state.emergencyActive;
            setEmergencyActive(state.emergencyActive);
            setAreaSignals(state.areaSignals || {});
          }
        } catch (e) {
          console.error("Error parsing system-state socket:", e);
        }
      });

      globalWebSocket.subscribe("/topic/logs", (msg) => {
        if (msg.body) {
          addLog(msg.body);
        }
      });

      globalWebSocket.subscribe("/topic/tasks", () => {
        fetchTasks();
      });
    });
  }, [isReady, fetchStaffs, fetchAreas, fetchTasks]);

  if (!isReady) return null;

  const toggleEmergency = async () => {
    const nextState = !emergencyActive;
    if (nextState) {
      playEmergencyAlarm();
    }
    prevEmergencyRef.current = nextState;
    setEmergencyActive(nextState);
    addLog(
      nextState
        ? "🚨 EMERGENCY DISPATCH: Panggilan Darurat Gathering Area Diaktifkan!"
        : "✅ EMERGENCY CLEARED: Panggilan Darurat Direset."
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

  const resolveAreaHelp = async (areaId: string, areaName: string) => {
    addLog(`✅ RESOLVED: Bantuan koordinasi di ${areaName} telah diselesaikan.`);
    try {
      await apiFetch("/system-state", {
        method: "POST",
        data: {
          areaId,
          areaName,
          helpActive: "false",
        },
      });
    } catch (err) {
      console.error("Failed to resolve help signal:", err);
    }
  };

  const resolveAreaRefill = async (areaId: string, areaName: string) => {
    addLog(`✅ RESOLVED: Permintaan refill logistik di ${areaName} telah diselesaikan.`);
    try {
      await apiFetch("/system-state", {
        method: "POST",
        data: {
          areaId,
          areaName,
          refillActive: "false",
        },
      });
    } catch (err) {
      console.error("Failed to resolve refill signal:", err);
    }
  };

  // Derive per-area signals arrays
  const activeHelpSignals = Object.values(areaSignals).filter((s) => s.helpActive);
  const activeRefillSignals = Object.values(areaSignals).filter((s) => s.refillActive);

  // DataTable columns for Staff Allocation summary
  const staffColumns: Column<any>[] = [
    {
      id: "index",
      label: "No.",
      align: "center",
      render: (_, idx) => <>{idx + 1}</>,
    },
    {
      id: "name",
      label: "Nama Staff",
      render: (row) => (
        <Box sx={{ fontWeight: 700, color: "#0F172A" }}>{row.name}</Box>
      ),
    },
    {
      id: "role",
      label: "Role Operasional",
      render: (row) => (
        <Chip
          label={row.role || "Staff"}
          size="small"
          sx={{
            backgroundColor: "#0F172A",
            color: "#FBC02D",
            fontWeight: 700,
            fontSize: "0.75rem",
          }}
        />
      ),
    },
    {
      id: "area",
      label: "Area Penugasan",
      render: (row) => {
        const area = areas.find((a) => a.id === row.assignedAreaId);
        return (
          <Box sx={{ fontWeight: 600, color: "#0F172A" }}>
            {area ? area.name : <span style={{ color: "#94A3B8" }}>Belum Ditugaskan</span>}
          </Box>
        );
      },
    },
  ];

  return (
    <AdminShell>
      {/* Top Header & System Status Card */}
      <Grid container spacing={3} sx={{ mb: 4, alignItems: "center" }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <AppTypography
            preset="pageTitle"
            sx={{
              fontWeight: 800,
              fontSize: "1.85rem",
              letterSpacing: "-0.03em",
              color: "#0F172A",
              mb: 0.75,
            }}
          >
            Pusat Koordinasi Lapangan
          </AppTypography>
          <AppTypography
            preset="helperText"
            sx={{ color: "#64748B", fontSize: "0.925rem", maxWidth: 650 }}
          >
            Simulasikan aksi cepat dari Admin (Emergensi) maupun permintaan bantuan serta isi ulang logistik per-area dari Staff di lapangan secara Real-Time WebSocket.
          </AppTypography>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
          <Card
            sx={{
              backgroundColor: emergencyActive ? "#C5221F" : "#1F7D53",
              borderRadius: "12px",
              border: `1.5px solid ${emergencyActive ? "#EF4444" : "#6EAE92"}`,
              color: "#ffffff",
              p: 2,
              px: 3,
              width: "100%",
              maxWidth: 360,
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
              <CheckCircleIcon sx={{ fontSize: 34, color: "#ffffff" }} />
              <Box>
                <AppTypography
                  preset="helperText"
                  sx={{
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Status Sistem
                </AppTypography>
                <AppTypography
                  preset="sectionTitle"
                  sx={{ color: "#ffffff", fontWeight: 800, fontSize: "1.25rem", lineHeight: 1.2 }}
                >
                  {emergencyActive ? "Darurat (Gathering)" : "Kondisi Aman"}
                </AppTypography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Operations Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Emergency Trigger Card (Red Box) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <EmergencyShareIcon sx={{ color: "#EF4444", fontSize: 22 }} />
              <AppTypography preset="cardTitle" sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A" }}>
                Tombol Darurat (Emergensi)
              </AppTypography>
            </Box>

            <AppTypography preset="helperText" sx={{ color: "#64748B", fontSize: "0.85rem", mb: 3 }}>
              Kirim sinyal darurat berkumpul secara global ke seluruh staff di lapangan.
            </AppTypography>

            <Box sx={{ mt: "auto" }}>
              <Button
                fullWidth
                onClick={toggleEmergency}
                sx={{
                  py: 1.5,
                  borderRadius: "8px",
                  backgroundColor: emergencyActive ? "#15803D" : "#C5221F",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  textTransform: "none",
                  boxShadow: emergencyActive
                    ? "0 4px 14px rgba(21, 128, 61, 0.4)"
                    : "0 4px 14px rgba(197, 34, 31, 0.4)",
                  "&:hover": {
                    backgroundColor: emergencyActive ? "#166534" : "#991B1B",
                  },
                }}
              >
                {emergencyActive ? "✅ Matikan Sinyal Darurat" : "🚨 Panggil Semua Staff"}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Live Help Request Card (Per-Area Multi Cards) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <WarningAmberIcon sx={{ color: "#F59E0B", fontSize: 22 }} />
              <AppTypography preset="cardTitle" sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A" }}>
                Minta Bantuan Per-Area ({activeHelpSignals.length})
              </AppTypography>
            </Box>

            <AppTypography preset="helperText" sx={{ color: "#64748B", fontSize: "0.85rem", mb: 2 }}>
              Sinyal bantuan aktif dari staff per-area yang memerlukan dukungan koordinator.
            </AppTypography>

            <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
              {activeHelpSignals.length > 0 ? (
                activeHelpSignals.map((signal) => (
                  <Box
                    key={signal.areaId}
                    sx={{
                      p: 2,
                      borderRadius: "8px",
                      backgroundColor: "#FEF3C7",
                      border: "1px solid #FCD34D",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <AppTypography preset="helperText" sx={{ color: "#92400E", fontWeight: 700, fontSize: "0.725rem", textTransform: "uppercase" }}>
                        Bantuan Aktif di:
                      </AppTypography>
                      <AppTypography preset="cardTitle" sx={{ color: "#78350F", fontWeight: 800, fontSize: "1rem" }}>
                        📍 {signal.areaName}
                      </AppTypography>
                    </Box>

                    <Button
                      size="small"
                      onClick={() => resolveAreaHelp(signal.areaId, signal.areaName)}
                      sx={{
                        backgroundColor: "#15803D",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        borderRadius: "6px",
                        textTransform: "none",
                        px: 1.5,
                        py: 0.5,
                        "&:hover": { backgroundColor: "#166534" },
                      }}
                    >
                      Selesaikan
                    </Button>
                  </Box>
                ))
              ) : (
                <Box sx={{ p: 2, borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", textAlign: "center" }}>
                  <AppTypography preset="helperText" sx={{ color: "#94A3B8", fontWeight: 600 }}>
                    Tidak ada panggilan bantuan aktif saat ini
                  </AppTypography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Live Refill Request Card (Per-Area Multi Cards) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <LocalDiningIcon sx={{ color: "#3B82F6", fontSize: 22 }} />
              <AppTypography preset="cardTitle" sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A" }}>
                Refill Logistik Per-Area ({activeRefillSignals.length})
              </AppTypography>
            </Box>

            <AppTypography preset="helperText" sx={{ color: "#64748B", fontSize: "0.85rem", mb: 2 }}>
              Sinyal isi ulang makanan/minuman dari runner per-area penugasan.
            </AppTypography>

            <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
              {activeRefillSignals.length > 0 ? (
                activeRefillSignals.map((signal) => (
                  <Box
                    key={signal.areaId}
                    sx={{
                      p: 2,
                      borderRadius: "8px",
                      backgroundColor: "#EFF6FF",
                      border: "1px solid #93C5FD",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <AppTypography preset="helperText" sx={{ color: "#1E40AF", fontWeight: 700, fontSize: "0.725rem", textTransform: "uppercase" }}>
                        Refill Aktif di:
                      </AppTypography>
                      <AppTypography preset="cardTitle" sx={{ color: "#1E3A8A", fontWeight: 800, fontSize: "1rem" }}>
                        🍹 {signal.areaName}
                      </AppTypography>
                    </Box>

                    <Button
                      size="small"
                      onClick={() => resolveAreaRefill(signal.areaId, signal.areaName)}
                      sx={{
                        backgroundColor: "#15803D",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        borderRadius: "6px",
                        textTransform: "none",
                        px: 1.5,
                        py: 0.5,
                        "&:hover": { backgroundColor: "#166534" },
                      }}
                    >
                      Selesaikan
                    </Button>
                  </Box>
                ))
              ) : (
                <Box sx={{ p: 2, borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", textAlign: "center" }}>
                  <AppTypography preset="helperText" sx={{ color: "#94A3B8", fontWeight: 600 }}>
                    Tidak ada permintaan isi ulang aktif saat ini
                  </AppTypography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Operations Activity Logs Feed & Staff Allocation Summary */}
      <Grid container spacing={3}>
        {/* Real-time Activity Log Terminal */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              backgroundColor: "#0F172A",
              borderRadius: "12px",
              color: "#ffffff",
              p: 3,
              height: "100%",
              border: "1px solid #334155",
            }}
          >
            <AppTypography preset="sectionTitle" sx={{ fontWeight: 800, fontSize: "1.2rem", color: "#FBC02D", mb: 2 }}>
              💻 Terminal Log Aktivitas Operations (Real-Time)
            </AppTypography>

            <Divider sx={{ borderColor: "#334155", mb: 2 }} />

            <Box
              sx={{
                fontFamily: "monospace",
                fontSize: "0.825rem",
                maxHeight: 280,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {operationsLogs.length === 0 ? (
                <Box sx={{ color: "#64748B", fontStyle: "italic" }}>
                  Mendengarkan event WebSocket real-time...
                </Box>
              ) : (
                operationsLogs.map((log, idx) => (
                  <Box key={idx} sx={{ color: log.includes("DARURAT") ? "#EF4444" : log.includes("HELP") ? "#F59E0B" : log.includes("REFILL") ? "#3B82F6" : "#10B981" }}>
                    {log}
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid>

        {/* Staff Allocation Overview Table */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              p: 3,
              height: "100%",
            }}
          >
            <AppTypography preset="sectionTitle" sx={{ fontWeight: 800, fontSize: "1.2rem", color: "#0F172A", mb: 2 }}>
              👥 Alokasi Area Staff Lapangan
            </AppTypography>

            <DataTable columns={staffColumns} rows={staffs.slice(0, 5)} emptyMessage="Belum ada staff terdaftar." />
          </Card>
        </Grid>
      </Grid>
    </AdminShell>
  );
}
