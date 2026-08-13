"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import MapIcon from "@mui/icons-material/Map";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LogoutIcon from "@mui/icons-material/Logout";
import AppTypography from "../AppTypography";

import { logout as serviceLogout } from "@/features/auth/services/auth.services";

const DRAWER_WIDTH = 270;

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isTokenExpired = useAuthStore((state) => state.isTokenExpired);

  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Authentication & Admin Role Guard
  useEffect(() => {
    if (!hasHydrated) return;

    if (!user || isTokenExpired()) {
      serviceLogout();
      router.push("/login?expired=true");
    } else if (user.role !== "admin") {
      router.push("/portal");
    }
  }, [user, hasHydrated, isTokenExpired, router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Staff Management", icon: <PeopleIcon />, path: "/staff" },
    { text: "Area Management", icon: <MapIcon />, path: "/area" },
    { text: "Task Management", icon: <AssignmentIcon />, path: "/tasks" },
  ];

  const handleLogout = async () => {
    await serviceLogout();
    router.push("/login");
  };

  if (!hasHydrated || !user || user.role !== "admin") {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0F172A",
          gap: 2,
        }}
      >
        <CircularProgress size={48} thickness={4} sx={{ color: "#FBC02D" }} />
        <AppTypography preset="helperText" sx={{ color: "#A1A1A1", fontSize: "0.875rem" }}>
          Memuat Panel Koordinator...
        </AppTypography>
      </Box>
    );
  }

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#0F172A",
        color: "#ffffff",
      }}
    >
      {/* Drawer Branding Header (Matches Figma Dashboard.svg) */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.75,
        }}
      >
        <Box
          component="img"
          src="/logo.png"
          alt="Kembang Tasik Logo"
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(251, 192, 45, 0.35)",
            flexShrink: 0,
            objectFit: "cover",
          }}
        />

        <Box>
          <AppTypography
            preset="cardTitle"
            sx={{
              fontWeight: 800,
              color: "#FCFCFD",
              lineHeight: 1.1,
              fontSize: "1.15rem",
              letterSpacing: "-0.02em",
            }}
          >
            Kembang Tasik
          </AppTypography>
          <AppTypography
            preset="helperText"
            sx={{ color: "#FBC02D", fontSize: "0.75rem", fontWeight: 700, mt: 0.25 }}
          >
            Workforce Portal
          </AppTypography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10B981" }} />
            <AppTypography preset="helperText" sx={{ color: "#94A3B8", fontSize: "0.675rem", fontWeight: 600 }}>
              WebSocket Active
            </AppTypography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#334155" }} />

      {/* Navigation Links (Matches Figma Dashboard.svg) */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1.25 }}>
              <ListItemButton
                onClick={() => {
                  router.push(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: "8px",
                  px: 2,
                  py: 1.25,
                  backgroundColor: isActive ? "#FBC02D" : "transparent",
                  color: isActive ? "#0F172A" : "#A1A1A1",
                  border: isActive ? "1px solid #FFE093" : "1px solid transparent",
                  boxShadow: isActive ? "0 4px 12px rgba(251, 192, 45, 0.25)" : "none",
                  "&:hover": {
                    backgroundColor: isActive ? "#FBC02D" : "rgba(255, 255, 255, 0.05)",
                    color: isActive ? "#0F172A" : "#ffffff",
                    "& .MuiListItemIcon-root": {
                      color: isActive ? "#0F172A" : "#FBC02D",
                    },
                  },
                  transition: "all 0.15s ease",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? "#0F172A" : "#A1A1A1",
                    fontSize: 22,
                    transition: "color 0.15s ease",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <AppTypography
                      preset="bodyText"
                      sx={{
                        fontWeight: isActive ? 800 : 500,
                        fontSize: "0.925rem",
                        color: "inherit",
                      }}
                    >
                      {item.text}
                    </AppTypography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "#334155" }} />

      {/* Bottom Profile & Logout Bar (Matches Figma Dashboard.svg) */}
      <Box
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "rgba(15, 23, 42, 0.8)",
        }}
      >
        <Box sx={{ overflow: "hidden", pr: 1 }}>
          <AppTypography
            preset="bodyText"
            sx={{
              fontWeight: 700,
              fontSize: "0.8rem",
              color: "#FCFCFD",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {user.email}
          </AppTypography>
          <AppTypography
            preset="helperText"
            sx={{ color: "#FBC02D", fontSize: "0.7rem", fontWeight: 600 }}
          >
            System Coordinator
          </AppTypography>
        </Box>

        <IconButton
          onClick={handleLogout}
          title="Logout"
          sx={{
            backgroundColor: "#C5221F",
            color: "#ffffff",
            borderRadius: "8px",
            width: 36,
            height: 36,
            "&:hover": {
              backgroundColor: "#991B1B",
            },
          }}
        >
          <LogoutIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F6F6F6" }}>
      {/* Mobile Header Bar */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            backgroundColor: "#0F172A",
            borderBottom: "1px solid #334155",
            color: "#ffffff",
            width: "100%",
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", px: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <AppTypography preset="sectionTitle" sx={{ fontWeight: 800, color: "#FCFCFD" }}>
                Workforce Admin
              </AppTypography>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Navigation Drawers */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="admin navigation"
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                backgroundColor: "#0F172A",
                borderRight: "1px solid #334155",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                backgroundColor: "#0F172A",
                borderRight: "1px solid #334155",
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Main Page Area Container */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: isMobile ? "64px" : 0,
          backgroundColor: "#F6F6F6",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
