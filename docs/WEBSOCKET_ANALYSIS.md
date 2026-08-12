# 📡 Workforce Coordination System — Analisis & Rencana Implementasi WebSocket

Dokumen ini berisi analisis kebutuhan, arsitektur, dan rencana implementasi teknologi **WebSocket (STOMP over SockJS)** untuk sistem real-time **Workforce Coordination System**.

---

## 🔍 1. Latar Belakang & Analisis Kebutuhan

Saat ini, pembaharuan data antara Admin Dashboard (`/dashboard`) dan Field Staff Portal (`/portal`) menggunakan **HTTP Short Polling** (`setInterval(..., 3000)`). 

### ⚠️ Masalah Utama pada HTTP Polling:
1. **Delay Notifikasi Darurat**: Ketika Admin menekan tombol **🚨 Panggil Semua Staff**, staf di lapangan baru menerima pesan tersebut 1 - 3 detik kemudian. Pada situasi darurat venue, delay ini sangat berisiko.
2. **Beban Server & Network**: Puluhan ponsel staf yang terus-menerus melakukan HTTP GET setiap 3 detik memboroskan baterai smartphone staf dan membebani server backend dengan *request/response overhead* yang tidak perlu.

---

## 🏗️ 2. Arsitektur WebSocket yang Ditargetkan (STOMP over SockJS)

Standar industri terbaik untuk ekosistem **Spring Boot + Next.js** adalah **STOMP (Simple Text Oriented Messaging Protocol)** di atas **WebSocket / SockJS**.

### 📣 Pembagian Message Broker Topics:
- `/topic/emergency` $\rightarrow$ Siaran Panggilan Darurat Instan ke Seluruh Staff Portal
- `/topic/signals` $\rightarrow$ Sinyal Minta Bantuan Koordinasi & Refill Logistik ke Admin Dashboard
- `/topic/tasks` $\rightarrow$ Pembaruan Status Tugas Real-time (Pending $\rightarrow$ In Progress $\rightarrow$ Completed)
- `/topic/logs` $\rightarrow$ Live Operations Feed Log

---

## 📊 3. Analisis Perbandingan: HTTP Polling vs WebSocket STOMP

| Parameter | HTTP Short Polling (Kondisi Saat Ini) | WebSocket STOMP (Rencana Baru) |
| :--- | :--- | :--- |
| **Latensi Notifikasi** | 1.000 ms – 3.000 ms | **< 50 ms (Instant Real-time)** |
| **Beban Network & CPU** | Tinggi (ratusan HTTP request kosong) | **Sangat Rendah** (1 TCP connection persisten) |
| **Baterai HP Staf** | Boros | **Sangat Efisien** |
| **Skenario Darurat** | Kurang responsif | **Sangat Andal & Responsif** |
| **Koneksi Terputus** | Manual re-fetch | **Auto-Reconnect Otomatis** (via SockJS) |

---

## 📋 4. Rencana Tahapan Implementasi

### A. Sisi Backend (Spring Boot)
1. **Dependency**: Menambahkan `spring-boot-starter-websocket` di `pom.xml`.
2. **`WebSocketConfig.java`**: Mengonfigurasi WebSocket Broker pada endpoint `/ws-coordination` dengan SockJS fallback & CORS configured.
3. **`SecurityConfig.java`**: Membuka akses handshake untuk `/ws-coordination/**`.
4. **`WebSocketPublisherService`**: Publikasi pesan otomatis saat event dipicu di backend.

### B. Sisi Frontend (Next.js)
1. **Dependency**: Install `@stomp/stompjs` & `sockjs-client`.
2. **`useWebSocket` Hook**: React hook untuk mengelola koneksi socket & auto-reconnect.
3. **Refactoring Component**: Mengganti interval polling 3s pada `/dashboard` dan `/portal` dengan STOMP Subscriber.
