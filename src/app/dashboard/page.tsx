"use client";

import React, { useState } from "react";
import { useStaffStore } from "@/features/staff/store/staff.store";
import { useAreaStore } from "@/features/area/store/area.store";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Divider,
  Paper,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import MapIcon from "@mui/icons-material/Map";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AppTypography from "@/components/AppTypography";
import AdminShell from "@/components/AdminShell";
import EmergencyButton from "@/components/EmergencyButton";
import HelpButton from "@/components/HelpButton";
import RefillButton from "@/components/RefillButton";

export default function DashboardPage() {
  const { staffs } = useStaffStore();
  const { areas } = useAreaStore();
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [helpStatus, setHelpStatus] = useState<"idle" | "requested">("idle");
  const [refillStatus, setRefillStatus] = useState<"idle" | "requested">("idle");
  const [logs, setLogs] = useState<string[]>([
    "🏁 Sistem Koordinasi diinisialisasi.",
    "📋 Menunggu instruksi atau trigger darurat.",
  ]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev]);
  };

  const toggleEmergency = () => {
    const nextState = !emergencyActive;
    setEmergencyActive(nextState);
    addLog(
      nextState
        ? "🚨 DARURAT: Semua staff diminta berkumpul ke GATHERING AREA segera!"
        : "✅ DARURAT SELESAI: Perintah berkumpul darurat dicabut."
    );
  };

  const toggleHelp = () => {
    const nextState = helpStatus === "idle" ? "requested" : "idle";
    setHelpStatus(nextState);
    addLog(
      nextState
        ? "⚠️ BUTUH BANTUAN: Staff memanggil Admin ke Area Pintu Masuk Utama."
        : "✅ BANTUAN DIATASI: Panggilan bantuan di Area Pintu Masuk diselesaikan."
    );
  };

  const toggleRefill = () => {
    const nextState = refillStatus === "idle" ? "requested" : "idle";
    setRefillStatus(nextState);
    addLog(
      nextState
        ? "📦 MINTA REFILL: Permintaan isi ulang logistik (minuman) di Area VIP."
        : "✅ REFILL SELESAI: Area VIP telah diisi ulang logistiknya."
    );
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
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
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
                {staffs.length}
              </AppTypography>
            </Box>
          </Card>
        </Grid>

        {/* Total Area Card */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
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
                {areas.length}
              </AppTypography>
            </Box>
          </Card>
        </Grid>

        {/* System Alert Status */}
        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)",
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: "success.main",
                color: "white",
                mr: 2,
                display: "flex",
              }}
            >
              <NotificationsActiveIcon fontSize="large" />
            </Box>
            <Box>
              <AppTypography preset="helperText" color="text.secondary" sx={{ fontWeight: "bold" }}>
                Status Sistem
              </AppTypography>
              <AppTypography
                preset="sectionTitle"
                sx={{ mt: 0.2, fontWeight: 800, color: "success.main" }}
              >
                Kondisi Aman
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

              <StackContainer title="Portal Staff (Panggilan Bantuan & Refill)">
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <HelpButton status={helpStatus} onClick={toggleHelp} />
                  <RefillButton status={refillStatus} onClick={toggleRefill} />
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
                    <Box key={index} sx={{ mb: 1, borderBottom: "1px solid rgba(255, 255, 255, 0.05)", pb: 0.5 }}>
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
