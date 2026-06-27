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
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AppTypography from "@/components/AppTypography";
import AppButton from "@/components/AppButton";
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
  const setUser = useAuthStore((state) => state.setUser);

  // If already logged in, redirect to appropriate page
  useEffect(() => {
    if (hasHydrated && user) {
      if (user.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/portal");
      }
    }
  }, [user, hasHydrated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser) {
        setUser(loggedInUser);
        setAlertConfig({
          title: "Login Berhasil",
          severity: "success",
          message: `Selamat datang kembali, ${loggedInUser.name}! Anda akan dialihkan ke ${loggedInUser.role === "admin" ? "dashboard utama" : "portal staff"}.`,
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
    } catch {
      setAlertConfig({
        title: "Terjadi Kesalahan",
        severity: "error",
        message: "Gagal menghubungkan ke server. Hubungi administrator sistem.",
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
        background: "linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #030712 100%)",
        py: 4,
        px: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ─── Floating Animated Orbs ─── */}
      <Box
        className="login-orb-1"
        sx={{
          position: "absolute",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)",
          top: "10%",
          left: "5%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <Box
        className="login-orb-2"
        sx={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)",
          bottom: "15%",
          right: "10%",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <Box
        className="login-orb-3"
        sx={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, transparent 70%)",
          top: "55%",
          left: "60%",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Card
          className="animate-card-entrance"
          sx={{
            backdropFilter: "blur(16px)",
            backgroundColor: "rgba(24, 24, 27, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 24px 64px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.05)",
            borderRadius: 4,
            overflow: "visible",
          }}
        >
          <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
            {/* Logo/Branding header */}
            <Box sx={{ textAlign: "center", mb: 5 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  backgroundImage: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
                  mb: 2,
                  color: "#ffffff",
                  fontSize: 24,
                  fontWeight: "bold",
                }}
              >
                W
              </Box>
              <AppTypography preset="pageTitle" sx={{ color: "#ffffff", fontWeight: 800, mb: 1 }}>
                Workforce System
              </AppTypography>
              <AppTypography preset="helperText" sx={{ color: "grey.400" }}>
                Masukkan kredensial Anda untuk masuk ke Panel Koordinator
              </AppTypography>
            </Box>

            {/* Login Form */}
            <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Alamat Email"
                placeholder="admin@coordination.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "grey.500" }} />
                      </InputAdornment>
                    ),
                    sx: {
                      color: "#ffffff",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255, 255, 255, 0.12)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    },
                  },
                  inputLabel: {
                    sx: { color: "grey.500" },
                  },
                }}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "grey.500" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: "grey.500" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      color: "#ffffff",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255, 255, 255, 0.12)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    },
                  },
                  inputLabel: {
                    sx: { color: "grey.500" },
                  },
                }}
              />

              <AppButton
                type="submit"
                variant="contained"
                label={loading ? "Mengecek Kredensial..." : "Masuk Sistem"}
                loading={loading}
                sx={{
                  mt: 2,
                  py: 1.6,
                  fontSize: "1rem",
                  fontWeight: "bold",
                  backgroundImage: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                }}
              />
            </Box>

            {/* ─── Demo Credential Hints ─── */}
            <Box
              sx={{
                mt: 4,
                p: 2,
                borderRadius: 2.5,
                backgroundColor: "rgba(99, 102, 241, 0.06)",
                border: "1px solid rgba(99, 102, 241, 0.12)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1.5 }}>
                <InfoOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                <AppTypography preset="helperText" sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Demo Credentials
                </AppTypography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label="Admin"
                    size="small"
                    sx={{
                      bgcolor: "primary.main",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                      height: 22,
                      fontFamily: "var(--font-poppins)",
                    }}
                  />
                  <AppTypography preset="helperText" sx={{ color: "grey.400", fontSize: "0.75rem", fontFamily: "monospace" }}>
                    admin@coordination.com (atau @gmail.com) / admin
                  </AppTypography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label="Staff"
                    size="small"
                    sx={{
                      bgcolor: "secondary.main",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                      height: 22,
                      fontFamily: "var(--font-poppins)",
                    }}
                  />
                  <AppTypography preset="helperText" sx={{ color: "grey.400", fontSize: "0.75rem", fontFamily: "monospace" }}>
                    staff@coordination.com (atau @gmail.com) / staff
                  </AppTypography>
                </Box>
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
