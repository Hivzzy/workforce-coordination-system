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
      className="bg-grid-pattern"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#09090b",
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="xs">
        <Card
          className="animate-fade-in"
          sx={{
            backgroundColor: "#121215",
            border: "1px solid #1e1e24",
            borderRadius: 3,
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ p: { xs: 3.5, sm: 4.5 } }}>
            {/* Header / Logo */}
            <Box sx={{ mb: 4, textAlign: "left" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  mb: 2.5,
                  position: "relative",
                }}
              >
                <AppTypography
                  sx={{
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                  }}
                >
                  KT
                </AppTypography>
                <Box
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    backgroundColor: "#eab308",
                  }}
                />
              </Box>
              <AppTypography
                preset="pageTitle"
                sx={{
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  letterSpacing: "-0.02em",
                  mb: 0.5,
                }}
              >
                Kembang Tasik
              </AppTypography>
              <AppTypography
                preset="helperText"
                sx={{ color: "#a1a1aa", fontSize: "0.8125rem" }}
              >
                Workforce & Event Coordination System
              </AppTypography>
            </Box>

            {/* Login Form */}
            <Box
              component="form"
              onSubmit={handleLogin}
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <Box>
                <AppTypography
                  preset="helperText"
                  sx={{ color: "#a1a1aa", fontSize: "0.75rem", fontWeight: 600, mb: 0.75, display: "block" }}
                >
                  Email
                </AppTypography>
                <TextField
                  fullWidth
                  variant="outlined"
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
                          <EmailIcon sx={{ color: "#71717a", fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box>
                <AppTypography
                  preset="helperText"
                  sx={{ color: "#a1a1aa", fontSize: "0.75rem", fontWeight: 600, mb: 0.75, display: "block" }}
                >
                  Password
                </AppTypography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#71717a", fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                            sx={{ color: "#71717a" }}
                          >
                            {showPassword ? (
                              <VisibilityOff sx={{ fontSize: 18 }} />
                            ) : (
                              <Visibility sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <AppButton
                type="submit"
                variant="contained"
                label={loading ? "Verifying..." : "Sign in"}
                loading={loading}
                sx={{
                  mt: 1,
                  py: 1.2,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  backgroundColor: "#eab308",
                  color: "#000000",
                  "&:hover": {
                    backgroundColor: "#ca8a04",
                  },
                }}
              />
            </Box>

            {/* Demo Credentials Section */}
            <Box
              sx={{
                mt: 3.5,
                pt: 3,
                borderTop: "1px solid #1e1e24",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
                <InfoOutlinedIcon sx={{ fontSize: 14, color: "#eab308" }} />
                <AppTypography
                  preset="helperText"
                  sx={{
                    color: "#a1a1aa",
                    fontWeight: 600,
                    fontSize: "0.6875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Demo Accounts
                </AppTypography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "space-between" }}>
                  <Chip
                    label="Admin"
                    size="small"
                    sx={{
                      backgroundColor: "rgba(234, 179, 8, 0.15)",
                      color: "#eab308",
                      border: "1px solid rgba(234, 179, 8, 0.3)",
                      fontWeight: 600,
                      fontSize: "0.6875rem",
                      height: 20,
                    }}
                  />
                  <AppTypography
                    preset="helperText"
                    sx={{ color: "#71717a", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}
                  >
                    admin@coordination.com / admin
                  </AppTypography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "space-between" }}>
                  <Chip
                    label="Staff"
                    size="small"
                    sx={{
                      backgroundColor: "#18181b",
                      color: "#a1a1aa",
                      border: "1px solid #27272a",
                      fontWeight: 600,
                      fontSize: "0.6875rem",
                      height: 20,
                    }}
                  />
                  <AppTypography
                    preset="helperText"
                    sx={{ color: "#71717a", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}
                  >
                    staff@coordination.com / staff
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
        confirmLabel={alertConfig.severity === "success" ? "Continue" : "Try Again"}
      >
        {alertConfig.message}
      </Modal>
    </Box>
  );
}
