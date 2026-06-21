"use client";

import React from "react";
import Link from "next/link";
import {
  Container,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Stack,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PaletteIcon from "@mui/icons-material/Palette";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import LayersIcon from "@mui/icons-material/Layers";
import WidgetsIcon from "@mui/icons-material/Widgets";

// Global packaged components
import AppTypography from "@/components/AppTypography";
import AppButton from "@/components/AppButton";
import Modal from "@/components/Modal";
import DataTable, { Column } from "@/components/DataTable";
import Pagination from "@/components/Pagination";
import EmergencyButton from "@/components/EmergencyButton";
import HelpButton from "@/components/HelpButton";
import RefillButton from "@/components/RefillButton";

// Custom State Hook
import { useDesignSystem } from "./hooks/useDesignSystem";

interface SampleStaffRow {
  id: string;
  name: string;
  role: string;
  status: string;
}

export default function DesignSystemPage() {
  const d = useDesignSystem();

  // Columns definition for DataTable showcase
  const columns: Column<SampleStaffRow>[] = [
    { id: "id", label: "ID Staff", align: "left" },
    { id: "name", label: "Nama Lengkap", align: "left" },
    { id: "role", label: "Peran", align: "left" },
    {
      id: "status",
      label: "Status Kehadiran",
      align: "center",
      render: (row) => (
        <Chip
          label={row.status}
          color={row.status === "Aktif" ? "success" : "default"}
          size="small"
          sx={{ fontWeight: "bold", fontFamily: "var(--font-poppins)" }}
        />
      ),
    },
  ];

  const rows: SampleStaffRow[] = [
    { id: "ST-01", name: "Andi Wijaya", role: "Keamanan Utama", status: "Aktif" },
    { id: "ST-02", name: "Budi Pratama", role: "Kebersihan Panggung", status: "Aktif" },
    { id: "ST-03", name: "Citra Dewi", role: "Konsumsi VIP", status: "Istirahat" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="lg">
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            borderBottom: 1,
            borderColor: "divider",
            pb: 4,
            mb: 6,
          }}
        >
          <Box>
            <Chip
              label="Tugas Akhir Project"
              color="primary"
              size="small"
              sx={{ fontWeight: "bold", mb: 1, fontFamily: "var(--font-poppins)" }}
            />
            <AppTypography preset="pageTitle" gutterBottom>
              Design System & Pedoman UI
            </AppTypography>
            <AppTypography preset="bodyText" color="text.secondary">
              Aturan, palet warna, tipografi Poppins, dan komponen global dengan pemisahan visual dan logic hooks.
            </AppTypography>
          </Box>
          <Button
            component={Link}
            href="/login"
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 2, fontFamily: "var(--font-poppins)", fontWeight: "bold" }}
          >
            Kembali ke Login
          </Button>
        </Box>

        {/* MAIN BODY GRID */}
        <Grid container spacing={4}>
          
          {/* COLUMN LEFT: CORE TOKENS & COMPONENTS */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={4}>
              
              {/* PALETTE */}
              <Card>
                <CardContent>
                  <AppTypography preset="cardTitle" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PaletteIcon color="primary" /> Palet Warna Semantik
                  </AppTypography>
                  <AppTypography preset="helperText" sx={{ display: "block", mb: 3 }}>
                    Skema warna khusus yang dirancang untuk menyampaikan fungsi administratif, notifikasi lapangan, dan tindakan penting.
                  </AppTypography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper sx={{ p: 2, bgcolor: "primary.main", color: "primary.contrastText", minHeight: 90, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <AppTypography variant="subtitle2" sx={{ fontWeight: "bold" }}>Primary (Admin)</AppTypography>
                        <AppTypography variant="caption" sx={{ opacity: 0.85 }}>#6366f1</AppTypography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper sx={{ p: 2, bgcolor: "secondary.main", color: "secondary.contrastText", minHeight: 90, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <AppTypography variant="subtitle2" sx={{ fontWeight: "bold" }}>Secondary (Staff)</AppTypography>
                        <AppTypography variant="caption" sx={{ opacity: 0.85 }}>#06b6d4</AppTypography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper sx={{ p: 2, bgcolor: "success.main", color: "success.contrastText", minHeight: 90, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <AppTypography variant="subtitle2" sx={{ fontWeight: "bold" }}>Success (Restock)</AppTypography>
                        <AppTypography variant="caption" sx={{ opacity: 0.85 }}>#10b981</AppTypography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper sx={{ p: 2, bgcolor: "error.main", color: "error.contrastText", minHeight: 90, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <AppTypography variant="subtitle2" sx={{ fontWeight: "bold" }}>Emergency (Rose)</AppTypography>
                        <AppTypography variant="caption" sx={{ opacity: 0.85 }}>#f43f5e</AppTypography>
                      </Paper>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper sx={{ p: 2, bgcolor: "help.main", color: "help.contrastText", minHeight: 90, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <AppTypography variant="subtitle2" sx={{ fontWeight: "bold" }}>Help (Orange)</AppTypography>
                        <AppTypography variant="caption" sx={{ opacity: 0.85 }}>#f97316</AppTypography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper sx={{ p: 2, bgcolor: "refill.main", color: "refill.contrastText", minHeight: 90, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <AppTypography variant="subtitle2" sx={{ fontWeight: "bold" }}>Refill (Teal)</AppTypography>
                        <AppTypography variant="caption" sx={{ opacity: 0.85 }}>#0d9488</AppTypography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper sx={{ p: 2, bgcolor: "warning.main", color: "warning.contrastText", minHeight: 90, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <AppTypography variant="subtitle2" sx={{ fontWeight: "bold" }}>Warning (Amber)</AppTypography>
                        <AppTypography variant="caption" sx={{ opacity: 0.85 }}>#f59e0b</AppTypography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper variant="outlined" sx={{ p: 2, minHeight: 90, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <AppTypography variant="subtitle2" sx={{ fontWeight: "bold" }} color="text.primary">Background Paper</AppTypography>
                        <AppTypography variant="caption" color="text.secondary">Default Surface</AppTypography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* TYPOGRAPHY */}
              <Card>
                <CardContent>
                  <AppTypography preset="cardTitle" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextFieldsIcon color="primary" /> Skala Tipografi (Poppins Presets)
                  </AppTypography>
                  <AppTypography preset="helperText" sx={{ display: "block", mb: 3 }}>
                    Sistem teks modular menggunakan font **Poppins** demi kenyamanan pembacaan yang optimal bagi user.
                  </AppTypography>
                  <Stack spacing={3} divider={<Divider />}>
                    <Box>
                      <AppTypography preset="helperText" sx={{ display: "block", mb: 1, fontWeight: "bold" }}>AppTypography preset=&quot;pageTitle&quot;</AppTypography>
                      <AppTypography preset="pageTitle">
                        Header Halaman Utama (32px)
                      </AppTypography>
                    </Box>
                    <Box>
                      <AppTypography preset="helperText" sx={{ display: "block", mb: 1, fontWeight: "bold" }}>AppTypography preset=&quot;sectionTitle&quot;</AppTypography>
                      <AppTypography preset="sectionTitle">
                        Judul Seksi / Judul Modul (24px)
                      </AppTypography>
                    </Box>
                    <Box>
                      <AppTypography preset="helperText" sx={{ display: "block", mb: 1, fontWeight: "bold" }}>AppTypography preset=&quot;bodyText&quot;</AppTypography>
                      <AppTypography preset="bodyText" color="text.primary">
                        Teks isi utama aplikasi. Memastikan informasi tugas terbaca dengan nyaman baik di laptop koordinator maupun handphone staff di lapangan.
                      </AppTypography>
                    </Box>
                    <Box>
                      <AppTypography preset="helperText" sx={{ display: "block", mb: 1, fontWeight: "bold" }}>AppTypography preset=&quot;helperText&quot;</AppTypography>
                      <AppTypography preset="helperText">
                        Digunakan untuk detail log, stempel waktu (timestamp), atau teks pendukung penugasan.
                      </AppTypography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* NEW GLOBAL COMPONENTS SHOWCASE */}
              <Card>
                <CardContent>
                  <AppTypography preset="cardTitle" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <WidgetsIcon color="primary" /> Komponen Global Reusable (Dengan Package Folder)
                  </AppTypography>
                  <AppTypography preset="helperText" sx={{ display: "block", mb: 4 }}>
                    Daftar komponen global yang telah dipisahkan ke dalam package folder mandiri untuk fleksibilitas maksimal.
                  </AppTypography>

                  <Stack spacing={4}>
                    
                    {/* APPBUTTON FOR ALL CONDITIONS */}
                    <Box>
                      <AppTypography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2 }}>
                        1. AppButton (Mendukung Semua Kondisi & Icon Otomatis)
                      </AppTypography>
                      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap", gap: 1.5 }}>
                        <AppButton
                          condition="add"
                          label="Tambah Staff"
                          onClick={() => d.addLog("➕ APPBUTTON: Tambah Staff Baru diklik.")}
                        />
                        <AppButton
                          condition="edit"
                          label="Edit Area"
                          onClick={() => d.addLog("✏️ APPBUTTON: Edit Area diklik.")}
                        />
                        <AppButton
                          condition="delete"
                          label="Hapus Tugas"
                          onClick={() => d.addLog("🗑️ APPBUTTON: Hapus Tugas diklik.")}
                        />
                        <AppButton
                          condition="refresh"
                          label="Refill Stok"
                          onClick={() => d.addLog("🔄 APPBUTTON: Refill Stok diklik.")}
                        />
                        <AppButton
                          condition="warning"
                          label="Aksi Darurat"
                          onClick={() => d.addLog("⚠️ APPBUTTON: Peringatan Darurat diklik.")}
                        />
                        <AppButton
                          condition="default"
                          label="Tombol Loading"
                          loading={true}
                          onClick={() => {}}
                        />
                      </Stack>
                    </Box>

                    <Divider />

                    {/* DYNAMIC MODALS (UNIFIED MODAL) */}
                    <Box>
                      <AppTypography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2 }}>
                        2. Unified Modal (Form, Konfirmasi, Sukses)
                      </AppTypography>
                      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap", gap: 1.5 }}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            d.setFormModalOpen(true);
                            d.addLog("📂 DIALOG: Membuka Modal Form.");
                          }}
                        >
                          Buka Modal Form (Custom)
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            d.setConfirmModalOpen(true);
                            d.addLog("🚨 DIALOG: Membuka Modal Konfirmasi Hapus.");
                          }}
                        >
                          Buka Modal Konfirmasi
                        </Button>
                        <Button
                          variant="outlined"
                          color="success"
                          onClick={() => {
                            d.setSuccessModalOpen(true);
                            d.addLog("✅ DIALOG: Membuka Modal Sukses.");
                          }}
                        >
                          Buka Modal Sukses
                        </Button>
                      </Stack>
                    </Box>

                    <Divider />

                    {/* DATATABLE */}
                    <Box>
                      <AppTypography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2 }}>
                        3. Custom DataTable
                      </AppTypography>
                      <DataTable columns={columns} rows={rows} />
                    </Box>

                    <Divider />

                    {/* PAGINATION */}
                    <Box>
                      <AppTypography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                        4. Custom Pagination (Halaman Aktif: {d.currentPage})
                      </AppTypography>
                      <Pagination
                        page={d.currentPage}
                        count={5}
                        onChange={(page) => {
                          d.setCurrentPage(page);
                          d.addLog(`📑 PAGINATION: Berpindah ke Halaman ${page}`);
                        }}
                      />
                    </Box>

                  </Stack>
                </CardContent>
              </Card>

              {/* CONTAINERS */}
              <Card>
                <CardContent>
                  <AppTypography preset="cardTitle" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LayersIcon color="primary" /> Kontainer & Elevasi Kartu (Tactile Cards)
                  </AppTypography>
                  <AppTypography preset="helperText" sx={{ display: "block", mb: 3 }}>
                    Kartu interaktif yang menggunakan efek bayangan melayang (elevation shadow) halus dan pembatas tipis.
                  </AppTypography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Card sx={{ p: 2 }}>
                        <AppTypography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>Elevated Card Component</AppTypography>
                        <AppTypography preset="bodyText" color="text.secondary" paragraph>
                          Kartu standar dengan efek naik saat diarahkan (*hover lift*). Cocok untuk panel list data staff atau area.
                        </AppTypography>
                        <Button variant="contained" size="small" color="primary">Hover Efek Demo</Button>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: "background.default" }}>
                        <AppTypography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>Flat Outlined Panel</AppTypography>
                        <AppTypography preset="bodyText" color="text.secondary" paragraph>
                          Menggunakan border abu-abu tipis tanpa elevasi shadow berat. Cocok untuk form input atau list filter.
                        </AppTypography>
                        <Button variant="outlined" size="small" color="secondary">Outlined Demo</Button>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* COLUMN RIGHT: SIMULATORS & NOTIFICATION FEED */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={4}>
              
              {/* STATE SIMULATOR */}
              <Card sx={{ borderLeft: 4, borderColor: "primary.main" }}>
                <CardContent>
                  <AppTypography preset="cardTitle" gutterBottom>
                    Simulator Aktivitas Lapangan
                  </AppTypography>
                  <AppTypography preset="helperText" sx={{ display: "block", mb: 3 }}>
                    Uji coba respon visual tombol tugas berdasarkan peran user di lapangan secara langsung.
                  </AppTypography>
                  
                  <Stack spacing={4}>
                    {/* ADMIN: EMERGENCY GATHERING BUTTON */}
                    <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: d.emergencyActive ? "error.light" : "transparent", transition: "background-color 0.3s" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <AppTypography variant="subtitle2" sx={{ fontWeight: "bold", color: d.emergencyActive ? "error.contrastText" : "text.primary" }}>
                          Admin: Gathering Darurat
                        </AppTypography>
                        <Chip
                          label={d.emergencyActive ? "AKTIF" : "OFF"}
                          size="small"
                          color={d.emergencyActive ? "error" : "default"}
                          sx={{ height: 18, fontSize: 9, fontWeight: "bold", fontFamily: "var(--font-poppins)" }}
                        />
                      </Box>
                      <AppTypography variant="caption" sx={{ display: "block", mb: 2, color: d.emergencyActive ? "error.contrastText" : "text.secondary" }}>
                        Memanggil semua staff ke titik kumpul darurat secara langsung.
                      </AppTypography>
                      <EmergencyButton active={d.emergencyActive} onClick={d.toggleEmergency} />
                    </Box>

                    {/* STAFF: HELP REQUEST BUTTON */}
                    <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <AppTypography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                          Staff: Tombol Bantuan (Help)
                        </AppTypography>
                        <Chip
                          label={d.helpStatus === "requested" ? "DIPANGGIL" : "STANDBY"}
                          size="small"
                          color={d.helpStatus === "requested" ? "help" : "default"}
                          sx={{ height: 18, fontSize: 9, fontWeight: "bold", fontFamily: "var(--font-poppins)" }}
                        />
                      </Box>
                      <AppTypography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                        Memanggil bantuan koordinator ke area tugas saat mengalami kendala.
                      </AppTypography>
                      <HelpButton status={d.helpStatus} onClick={d.toggleHelp} />
                    </Box>

                    {/* STAFF: REFILL REQUEST BUTTON */}
                    <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <AppTypography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                          Staff: Tombol Refill Logistik
                        </AppTypography>
                        <Chip
                          label={d.refillStatus === "requested" ? "PENDING" : "AMAN"}
                          size="small"
                          color={d.refillStatus === "requested" ? "refill" : "default"}
                          sx={{ height: 18, fontSize: 9, fontWeight: "bold", fontFamily: "var(--font-poppins)" }}
                        />
                      </Box>
                      <AppTypography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                        Mengajukan isi ulang logistik konsumsi atau sarana di area kerja.
                      </AppTypography>
                      <RefillButton status={d.refillStatus} onClick={d.toggleRefill} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* LIVE NOTIFICATIONS LOG */}
              <Card sx={{ bgcolor: "grey.900", color: "grey.100" }}>
                <CardContent>
                  <AppTypography variant="subtitle1" gutterBottom sx={{ color: "#ffffff", display: "flex", alignItems: "center", gap: 1, fontWeight: "bold" }}>
                    <NotificationsActiveIcon color="success" /> Live Log Notifikasi
                  </AppTypography>
                  <Divider sx={{ bgcolor: "grey.800", mb: 2 }} />
                  
                  {d.logs.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: "center", color: "grey.500" }}>
                      <AppTypography variant="caption" sx={{ display: "block" }}>
                        Belum ada aktivitas. Klik simulator di atas untuk mengirim sinyal koordinasi.
                      </AppTypography>
                    </Box>
                  ) : (
                    <List disablePadding>
                      {d.logs.map((log, index) => (
                        <ListItem
                          key={index}
                          className="animate-slide-in"
                          disableGutters
                          sx={{
                            p: 1.5,
                            mb: 1,
                            bgcolor: "grey.850",
                            borderRadius: 1.5,
                            borderLeft: 3,
                            borderColor: log.includes("⚠️") ? "error.main" : log.includes("🚨") ? "help.main" : log.includes("📦") ? "refill.main" : "success.main",
                          }}
                        >
                          <ListItemText
                            primary={
                              <AppTypography variant="caption" sx={{ fontSize: "11px", display: "block", lineHeight: 1.4, color: "grey.300" }}>
                                {log}
                              </AppTypography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>

            </Stack>
          </Grid>

        </Grid>
      </Container>

      {/* 1. FORM MODAL (CUSTOM CONTENTS) */}
      <Modal
        open={d.formModalOpen}
        onClose={() => d.setFormModalOpen(false)}
        title="Form Edit Data Proyek"
        type="form"
        actions={
          <Stack direction="row" spacing={1}>
            <Button onClick={() => d.setFormModalOpen(false)} color="inherit" sx={{ fontFamily: "var(--font-poppins)" }}>
              Batal
            </Button>
            <AppButton
              onClick={() => {
                d.setFormModalOpen(false);
                d.addLog("💾 DIALOG: Data disimpan dari Popup Form Modal.");
              }}
              label="Simpan Perubahan"
            />
          </Stack>
        }
      >
        <AppTypography preset="bodyText" color="text.secondary" paragraph>
          Ini adalah konten Modal global bertipe **&quot;form&quot;**. Kontainer ini dapat menampung input form pendaftaran staff, detail lokasi area, atau penjadwalan shift event.
        </AppTypography>
        <AppTypography preset="bodyText" sx={{ fontWeight: "bold" }}>
          Fitur Unggulan Modal:
        </AppTypography>
        <ul>
          <li>Responsive penuh untuk layar handphone (Mobile-First)</li>
          <li>Kustomisasi tombol footer via parameter *actions*</li>
          <li>Gaya bersih dengan penataan dividers otomatis</li>
        </ul>
      </Modal>

      {/* 2. CONFIRM MODAL (YES/NO CONFIRMATIONS) */}
      <Modal
        open={d.confirmModalOpen}
        onClose={() => d.setConfirmModalOpen(false)}
        title="Hapus Staff Permanen?"
        type="confirm"
        severity="error"
        confirmLabel="Ya, Hapus Staff"
        cancelLabel="Batal"
        onConfirm={() => {
          d.setConfirmModalOpen(false);
          d.addLog("🗑️ ALERT: Konfirmasi hapus staff dieksekusi.");
        }}
      >
        Apakah Anda yakin ingin menghapus data staff Andi Wijaya dari database? Tindakan ini bersifat permanen dan tidak dapat dipulihkan.
      </Modal>

      {/* 3. ALERT MODAL (SUCCESS DIALOG PRESET) */}
      <Modal
        open={d.successModalOpen}
        onClose={() => d.setSuccessModalOpen(false)}
        title="Restock Logistik Berhasil!"
        type="alert"
        severity="success"
        confirmLabel="Selesai & Tutup"
      >
        Permintaan refill makanan dan minuman untuk VIP Area telah sukses diproses dan diantarkan ke lokasi tugas.
      </Modal>
    </Box>
  );
}
