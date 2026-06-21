"use client";

import { useState } from "react";

export function useDesignSystem() {
  // Simulator state tracking
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [helpStatus, setHelpStatus] = useState<"idle" | "requested">("idle");
  const [refillStatus, setRefillStatus] = useState<"idle" | "requested">("idle");
  const [logs, setLogs] = useState<string[]>([]);

  // Dialog & Pagination state tracking
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const addLog = (message: string) => {
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 4),
    ]);
  };

  const toggleEmergency = () => {
    const nextState = !emergencyActive;
    setEmergencyActive(nextState);
    addLog(
      nextState
        ? "⚠️ DARURAT: Semua staff diminta berkumpul ke GATHERING AREA segera!"
        : "✅ DARURAT SELESAI: Perintah berkumpul darurat dicabut."
    );
  };

  const toggleHelp = () => {
    const nextState = helpStatus === "idle" ? "requested" : "idle";
    setHelpStatus(nextState);
    addLog(
      nextState
        ? "🚨 BUTUH BANTUAN: Staff memanggil Admin ke Area Pintu Masuk Utama."
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

  return {
    emergencyActive,
    helpStatus,
    refillStatus,
    logs,
    formModalOpen,
    setFormModalOpen,
    confirmModalOpen,
    setConfirmModalOpen,
    successModalOpen,
    setSuccessModalOpen,
    currentPage,
    setCurrentPage,
    addLog,
    toggleEmergency,
    toggleHelp,
    toggleRefill,
  };
}
