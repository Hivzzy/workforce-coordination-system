"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/features/auth/services/auth.services";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  Box,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Container,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AppTypography from "@/components/AppTypography";
import Modal from "@/components/Modal";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    severity: "success" | "error";
    message: string;
  }>({ title: "", severity: "success", message: "" });

  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isTokenExpired = useAuthStore((state) => state.isTokenExpired);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("expired") === "true") {
        setAlertConfig({
          title: "Sesi Berakhir",
          severity: "error",
          message: "Sesi otentikasi Anda telah berakhir. Silakan masuk kembali.",
        });
        setAlertOpen(true);
      }
    }

    if (hasHydrated && user && !isTokenExpired()) {
      if (user.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/portal");
      }
    }
  }, [user, hasHydrated, isTokenExpired, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser) {
        setAlertConfig({
          title: "Login Berhasil",
          severity: "success",
          message: `Selamat datang kembali, ${loggedInUser.name}!`,
        });
        setAlertOpen(true);
      } else {
        setAlertConfig({
          title: "Login Gagal",
          severity: "error",
          message: "Email atau password yang Anda masukkan salah. Silakan coba kembali.",
        });
        setAlertOpen(true);
      }
    } catch (err: any) {
      setAlertConfig({
        title: "Gagal Masuk",
        severity: "error",
        message: err.message || "Gagal menghubungkan ke server otentikasi backend. Pastikan server aktif.",
      });
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
    if (alertConfig.severity === "success") {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/portal");
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: 'linear-gradient(rgba(18, 18, 18, 0.4), rgba(18, 18, 18, 0.4)), url("/login-bg.png")',
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm" sx={{ display: "flex", justifyContent: "center" }}>
        <Card
          sx={{
            width: "100%",
            maxWidth: 540,
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #FBC02D",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: { xs: 3.5, sm: 5 } }}>
            {/* Logo Badge & Header (Matches Figma Auth.png / Auth.svg) */}
            <Box sx={{ textAlign: "center", mb: 2.5 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  backgroundColor: "#FBC02D",
                  boxShadow: "0 4px 14px rgba(251, 192, 45, 0.4)",
                  mb: 2,
                }}
              >
                <AppTypography
                  sx={{
                    color: "#ffffff",
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-poppins)",
                    lineHeight: 1,
                  }}
                >
                  W
                </AppTypography>
              </Box>

              <AppTypography
                preset="pageTitle"
                sx={{
                  color: "#0F172A",
                  fontWeight: 800,
                  fontSize: "1.75rem",
                  letterSpacing: "-0.03em",
                  mb: 0.75,
                }}
              >
                Workforce System
              </AppTypography>

              <AppTypography
                preset="helperText"
                sx={{
                  color: "#64748B",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                Masukkan kredensial Anda untuk masuk ke Panel Koordinator
              </AppTypography>
            </Box>

            <Divider sx={{ mb: 3, borderColor: "#E2E8F0" }} />

            {/* Login Form */}
            <Box
              component="form"
              onSubmit={handleLogin}
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: "#64748B", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      color: "#0F172A",
                      fontSize: "0.925rem",
                      height: 48,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#CBD5E1",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#94A3B8",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#FBC02D",
                        borderWidth: "1.5px",
                      },
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                variant="outlined"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: "#64748B", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: "#FBC02D" }}
                        >
                          {showPassword ? (
                            <VisibilityOff sx={{ fontSize: 20 }} />
                          ) : (
                            <Visibility sx={{ fontSize: 20 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      color: "#0F172A",
                      fontSize: "0.925rem",
                      height: 48,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#CBD5E1",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#94A3B8",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#FBC02D",
                        borderWidth: "1.5px",
                      },
                    },
                  },
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  startIcon={<LoginIcon sx={{ fontSize: 18, color: "#0F172A" }} />}
                  sx={{
                    py: 1.2,
                    px: 3.5,
                    borderRadius: "8px",
                    fontSize: "0.925rem",
                    fontWeight: 700,
                    backgroundColor: "#FBC02D",
                    color: "#0F172A",
                    boxShadow: "0 4px 12px rgba(251, 192, 45, 0.35)",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#F57F17",
                      color: "#ffffff",
                      boxShadow: "0 6px 16px rgba(245, 127, 23, 0.4)",
                      "& .MuiSvgIcon-root": { color: "#ffffff" },
                    },
                  }}
                >
                  {loading ? "Verifying..." : "Masuk Sistem"}
                </Button>
              </Box>
            </Box>

            {/* Demo Accounts Quick Tester */}
            <Box
              sx={{
                mt: 3.5,
                pt: 2.5,
                borderTop: "1px dashed #E2E8F0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
                <InfoOutlinedIcon sx={{ fontSize: 14, color: "#D97706" }} />
                <AppTypography
                  preset="helperText"
                  sx={{
                    color: "#64748B",
                    fontWeight: 700,
                    fontSize: "0.6875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Akun Demo (Klik untuk Isi Otomatis)
                </AppTypography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label="Admin: admin@coordination.com"
                  size="small"
                  onClick={() => {
                    setEmail("admin@coordination.com");
                    setPassword("admin");
                  }}
                  sx={{
                    backgroundColor: "rgba(251, 192, 45, 0.15)",
                    color: "#B45309",
                    border: "1px solid rgba(251, 192, 45, 0.4)",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "rgba(251, 192, 45, 0.3)" },
                  }}
                />
                <Chip
                  label="Staff: staff@coordination.com"
                  size="small"
                  onClick={() => {
                    setEmail("staff@coordination.com");
                    setPassword("staff");
                  }}
                  sx={{
                    backgroundColor: "#F1F5F9",
                    color: "#334155",
                    border: "1px solid #CBD5E1",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#E2E8F0" },
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Global Alert Modal Component */}
      <Modal
        open={alertOpen}
        onClose={handleAlertClose}
        title={alertConfig.title}
        type="alert"
        severity={alertConfig.severity}
        confirmLabel={alertConfig.severity === "success" ? "Lanjutkan" : "Coba Lagi"}
      >
        {alertConfig.message}
      </Modal>
    </Box>
  );
}
