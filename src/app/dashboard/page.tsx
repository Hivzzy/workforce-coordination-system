"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStaffStore } from "@/features/staff/store/staff.store";
import { useAreaStore } from "@/features/area/store/area.store";
import {
  Grid,
  Card,
  Box,
  Paper,
  Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/Check";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import EmergencyShareIcon from "@mui/icons-material/Campaign";
import AppTypography from "@/components/AppTypography";
import AdminShell from "@/components/AdminShell";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { apiFetch } from "@/utils/api-client";
import { globalWebSocket } from "@/utils/websocket-client";
import { playEmergencyAlarm } from "@/utils/audio-alert";

interface SystemStateResponse {
  emergencyActive: boolean;
  helpStatus: string;
  refillStatus: string;
}

export default function DashboardPage() {
  const { isReady } = useAdminGuard();
  const { fetchStaffs } = useStaffStore();
  const { fetchAreas } = useAreaStore();

  const [emergencyActive, setEmergencyActive] = useState(false);
  const [helpStatus, setHelpStatus] = useState("idle");
  const [refillStatus, setRefillStatus] = useState("idle");
  const [logs, setLogs] = useState<string[]>([
    "⚡ Real-Time WebSocket Connected (/ws-coordination)",
    "🏁 System initialized. Monitoring live workforce status.",
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
          setEmergencyActive(data.emergencyActive);
          setHelpStatus(data.helpStatus);
          setRefillStatus(data.refillStatus);
          prevEmergencyRef.current = data.emergencyActive;
          prevHelpRef.current = data.helpStatus;
          prevRefillRef.current = data.refillStatus;
        }
      } catch (err) {
        console.error("Failed to fetch system state:", err);
      }
    };

    fetchSystemState();

    // ⚡ Connect to WebSocket for instant STOMP updates (< 50ms)
    globalWebSocket.connect(() => {
      // Subscribe to Emergency Alert topic
      globalWebSocket.subscribe("/topic/emergency", (msg) => {
        try {
          const payload = JSON.parse(msg.body);
          if (payload.active !== undefined) {
            setEmergencyActive(payload.active);
            addLog(
              payload.active
                ? "🚨 STOMP EMERGENCY: Dispatched all field crew to Gathering Area."
                : "✅ STOMP RESOLVED: Emergency dispatch cleared."
            );
          }
        } catch (e) {
          console.error("Error parsing emergency socket payload:", e);
        }
      });

      // Subscribe to Signal topic
      globalWebSocket.subscribe("/topic/signals", (msg) => {
        try {
          const payload = JSON.parse(msg.body);
          if (payload.signalType === "HELP") {
            setHelpStatus(payload.areaName);
            addLog(`⚠️ STOMP HELP REQUEST: Signal received for Area: ${payload.areaName}`);
          } else if (payload.signalType === "REFILL") {
            setRefillStatus(payload.areaName);
            addLog(`🔄 STOMP REFILL REQUEST: Catering refill requested at Area: ${payload.areaName}`);
          }
        } catch (e) {
          console.error("Error parsing signal socket payload:", e);
        }
      });

      // Subscribe to System State topic
      globalWebSocket.subscribe("/topic/system-state", (msg) => {
        try {
          const payload = JSON.parse(msg.body);
          if (payload.emergencyActive !== undefined) setEmergencyActive(payload.emergencyActive);
          if (payload.helpStatus !== undefined) setHelpStatus(payload.helpStatus);
          if (payload.refillStatus !== undefined) setRefillStatus(payload.refillStatus);
        } catch (e) {
          console.error("Error parsing system-state payload:", e);
        }
      });

      // Subscribe to Operations Log topic
      globalWebSocket.subscribe("/topic/logs", (msg) => {
        try {
          const payload = JSON.parse(msg.body);
          if (payload.message) addLog(payload.message);
        } catch (e) {
          console.error("Error parsing log payload:", e);
        }
      });
    });

    return () => {
      // Keep socket open or disconnect on unmount
    };
  }, [fetchStaffs, fetchAreas]);

  const toggleEmergency = async () => {
    const nextState = !emergencyActive;
    if (nextState) {
      playEmergencyAlarm();
    }
    prevEmergencyRef.current = nextState;
    setEmergencyActive(nextState);
    addLog(
      nextState
        ? "🚨 EMERGENCY: Dispatched all field crew to Gathering Area."
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

  const resolveHelp = async () => {
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

  const resolveRefill = async () => {
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
            Simulasikan aksi cepat dari Admin (Emergensi) maupun permintaan bantuan serta isi ulang logistik dari Staff di lapangan secara Real-Time WebSocket.
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

        {/* Live Help Request Card */}
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
                Minta Bantuan Koordinasi
              </AppTypography>
            </Box>

            <AppTypography preset="helperText" sx={{ color: "#64748B", fontSize: "0.85rem", mb: 2 }}>
              Sinyal bantuan aktif dari staff yang memerlukan dukungan koordinator di area penugasan.
            </AppTypography>

            <Box sx={{ mt: "auto" }}>
              {helpStatus !== "idle" ? (
                <Box sx={{ p: 2, borderRadius: "8px", backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", mb: 2 }}>
                  <AppTypography preset="helperText" sx={{ color: "#92400E", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>
                    Area Minta Bantuan:
                  </AppTypography>
                  <AppTypography preset="cardTitle" sx={{ color: "#78350F", fontWeight: 800, fontSize: "1.05rem" }}>
                    📍 {helpStatus}
                  </AppTypography>
                </Box>
              ) : (
                <Box sx={{ p: 2, borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", mb: 2, textAlign: "center" }}>
                  <AppTypography preset="helperText" sx={{ color: "#94A3B8", fontWeight: 600 }}>
                    Tidak ada panggilan bantuan aktif
                  </AppTypography>
                </Box>
              )}

              <Button
                fullWidth
                disabled={helpStatus === "idle"}
                onClick={resolveHelp}
                startIcon={<CheckIcon />}
                sx={{
                  py: 1.2,
                  borderRadius: "8px",
                  backgroundColor: "#10B981",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#059669" },
                  "&.Mui-disabled": { backgroundColor: "#E2E8F0", color: "#94A3B8" },
                }}
              >
                Selesaikan Bantuan
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Live Refill Request Card */}
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
              <RefreshIcon sx={{ color: "#3B82F6", fontSize: 22 }} />
              <AppTypography preset="cardTitle" sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A" }}>
                Minta Refill Logistik
              </AppTypography>
            </Box>

            <AppTypography preset="helperText" sx={{ color: "#64748B", fontSize: "0.85rem", mb: 2 }}>
              Permintaan pasokan ulang perlengkapan/konsumsi dari staff di zona penugasan.
            </AppTypography>

            <Box sx={{ mt: "auto" }}>
              {refillStatus !== "idle" ? (
                <Box sx={{ p: 2, borderRadius: "8px", backgroundColor: "#DBEAFE", border: "1px solid #BFDBFE", mb: 2 }}>
                  <AppTypography preset="helperText" sx={{ color: "#1E40AF", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>
                    Area Minta Refill:
                  </AppTypography>
                  <AppTypography preset="cardTitle" sx={{ color: "#1E3A8A", fontWeight: 800, fontSize: "1.05rem" }}>
                    📦 {refillStatus}
                  </AppTypography>
                </Box>
              ) : (
                <Box sx={{ p: 2, borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", mb: 2, textAlign: "center" }}>
                  <AppTypography preset="helperText" sx={{ color: "#94A3B8", fontWeight: 600 }}>
                    Tidak ada permintaan refill aktif
                  </AppTypography>
                </Box>
              )}

              <Button
                fullWidth
                disabled={refillStatus === "idle"}
                onClick={resolveRefill}
                startIcon={<CheckIcon />}
                sx={{
                  py: 1.2,
                  borderRadius: "8px",
                  backgroundColor: "#10B981",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#059669" },
                  "&.Mui-disabled": { backgroundColor: "#E2E8F0", color: "#94A3B8" },
                }}
              >
                Selesaikan Refill
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Real-time System Feed Logs */}
      <Card
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
          p: 3,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <TerminalOutlinedIcon sx={{ color: "#FBC02D", fontSize: 22 }} />
          <AppTypography preset="sectionTitle" sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#0F172A" }}>
            Live Operations Feed (Real-Time WebSocket)
          </AppTypography>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            minHeight: 200,
            maxHeight: 300,
            overflowY: "auto",
            p: 2,
            backgroundColor: "#0F172A",
            borderColor: "#1E293B",
            borderRadius: "8px",
          }}
        >
          {logs.length === 0 ? (
            <AppTypography preset="helperText" sx={{ color: "#64748B", textAlign: "center", py: 4 }}>
              Belum ada log operasi tercatat.
            </AppTypography>
          ) : (
            logs.map((log, index) => (
              <Box
                key={index}
                sx={{ mb: 1, borderBottom: "1px solid #1E293B", pb: 0.75 }}
              >
                <AppTypography
                  preset="helperText"
                  sx={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.825rem",
                    color: log.includes("🚨")
                      ? "#EF4444"
                      : log.includes("⚠️")
                      ? "#F59E0B"
                      : log.includes("🔄")
                      ? "#3B82F6"
                      : "#94A3B8",
                  }}
                >
                  {log}
                </AppTypography>
              </Box>
            ))
          )}
        </Paper>
      </Card>
    </AdminShell>
  );
}
