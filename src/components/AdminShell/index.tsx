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
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import LayersIcon from "@mui/icons-material/Layers";
import PaletteIcon from "@mui/icons-material/Palette";
import LogoutIcon from "@mui/icons-material/Logout";
import AppTypography from "../AppTypography";
import AppButton from "../AppButton";

const DRAWER_WIDTH = 260;

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Authentication & Admin Role Guard
  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.push("/login");
    } else if (user.role !== "admin") {
      // Redirect staff or unauthorized roles to login or a default safe space
      router.push("/login");
    }
  }, [user, hasHydrated, router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Staff Management", icon: <PeopleIcon />, path: "/staff" },
    { text: "Area Management", icon: <LayersIcon />, path: "/area" },
    { text: "Design System", icon: <PaletteIcon />, path: "/design-system" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // While hydration is in progress or authorization is being checked, show premium loader
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
          backgroundColor: theme.palette.background.default,
          gap: 2,
        }}
      >
        <CircularProgress size={50} thickness={4} color="primary" />
        <AppTypography preset="helperText" color="text.secondary">
          Loading workforce credentials...
        </AppTypography>
      </Box>
    );
  }

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Drawer Branding Header */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "primary.main",
            backgroundImage: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            width: 40,
            height: 40,
            fontWeight: "bold",
          }}
        >
          W
        </Avatar>
        <Box>
          <AppTypography
            preset="cardTitle"
            sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}
          >
            Workforce
          </AppTypography>
          <AppTypography
            preset="helperText"
            sx={{ color: "primary.main", fontWeight: "bold", letterSpacing: "0.05em" }}
          >
            ADMIN PORTAL
          </AppTypography>
        </Box>
      </Box>
      <Divider sx={{ opacity: 0.6 }} />

      {/* Navigation Links */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  router.push(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1.2,
                  color: isActive ? "primary.main" : "text.secondary",
                  backgroundColor: isActive ? "action.selected" : "transparent",
                  "&:hover": {
                    backgroundColor: "action.hover",
                    color: "text.primary",
                    "& .MuiListItemIcon-root": {
                      color: "text.primary",
                    },
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? "primary.main" : "text.secondary",
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <AppTypography
                      preset="bodyText"
                      sx={{
                        fontWeight: isActive ? 700 : 500,
                        fontSize: "0.95rem",
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

      <Divider sx={{ opacity: 0.6 }} />

      {/* Bottom Profile & Logout Area */}
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: "0.875rem",
              fontWeight: 600,
              bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.200",
              color: "text.primary",
            }}
          >
            {user.email.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: "hidden" }}>
            <AppTypography
              preset="bodyText"
              sx={{
                fontWeight: "bold",
                fontSize: "0.85rem",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </AppTypography>
            <AppTypography
              preset="helperText"
              sx={{ color: "text.secondary", fontSize: "0.75rem" }}
            >
              System Coordinator
            </AppTypography>
          </Box>
        </Box>

        <AppButton
          onClick={handleLogout}
          label="Log Out"
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
          sx={{ width: "100%", py: 1 }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile AppBar Header */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: "text.primary",
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
              <AppTypography preset="sectionTitle" sx={{ fontWeight: 800 }}>
                Workforce
              </AppTypography>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Navigation Drawers */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile Drawer */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                backgroundColor: theme.palette.background.paper,
                borderRight: `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          /* Desktop Sidebar Drawer */
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                backgroundColor: theme.palette.background.paper,
                borderRight: `1px solid ${theme.palette.divider}`,
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
          p: { xs: 3, sm: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: isMobile ? "64px" : 0, // Space for mobile header app bar
          backgroundColor: theme.palette.background.default,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
