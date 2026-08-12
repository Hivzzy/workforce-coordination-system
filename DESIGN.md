# 🎨 Workforce Coordination System — Spesifikasi Desain (HTML/CSS Markdown Specs)

Dokumen ini berisi spesifikasi teknis desain yang dikonversi dari berkas visual SVG/Figma di folder [`docs/design/`](file:///Users/habbanma/College/workforce-coordination-system/docs/design). Dokumentasi ini menyajikan ketentuan struktur **HTML5**, aturan styling **CSS3**, token warna, tipografi, serta spesifikasi tata letak (flexbox/grid) untuk seluruh modul aplikasi.

---

## 🛠️ 1. Tokens & Design System (Aturan CSS/HTML Global)

### 🎨 Palet Warna (Color Tokens)
```css
:root {
  /* Primary & Branding */
  --color-primary-yellow: #FBC02D;        /* Kuning Emas utama untuk logo, tombol submit, tab aktif */
  --color-primary-hover: #F57F17;         /* State hover tombol utama */

  /* Surface & Navigation */
  --color-navy-dark: #0F172A;             /* Dark Navy untuk Sidebar, Card Area, & KPI Card */
  --color-navy-table-header: #131927;     /* Header Tabel Data */
  --color-bg-page: #F6F6F6;               /* Latar belakang halaman admin & portal */
  --color-surface-white: #FFFFFF;         /* Kartu konten & input field */

  /* Operational & Emergency Colors */
  --color-emergency-red: #C5221F;         /* Tombol Darurat, Logout, & Banner Alert */
  --color-status-green: #1F7D53;          /* Card Status Sistem Safe / Optimal */
  --color-badge-green: #10B981;           /* Badge Status "Selesai" */
  --color-badge-orange: #F97316;          /* Badge Status "Dikerjakan" & Tombol Edit */
  --color-badge-gray: #64748B;            /* Badge Status "Tertunda" & Text Muted */
  --color-badge-blue: #6366F1;            /* Badge Status "Belum Dimulai" */

  /* Borders & Shadows */
  --border-light: 1px solid #E2E8F0;
  --border-dashed: 1px dashed #CBD5E1;
  --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.04);
  --shadow-yellow: 0 4px 12px rgba(251, 192, 45, 0.35);
}
```

### 📐 Tipografi & Radius Tokens
```css
:root {
  --font-family: 'Poppins', 'Inter', -apple-system, sans-serif;

  /* Font Sizes & Weights */
  --font-page-title: 800 1.85rem / 1.2 var(--font-family);   /* Judul Utama Halaman */
  --font-section-title: 700 1.25rem / 1.3 var(--font-family);/* Judul Sub-Seksi / Modal */
  --font-card-title: 700 1.05rem / 1.4 var(--font-family);   /* Judul Kartu */
  --font-body-text: 500 0.9rem / 1.5 var(--font-family);     /* Teks Isi Utama */
  --font-helper-text: 500 0.8rem / 1.4 var(--font-family);   /* Teks Pendukung / Subtitle */

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

---

## 🔐 2. Spesifikasi Layar Login (`/login`)
> **Referensi SVG**: [`Auth.svg`](file:///Users/habbanma/College/workforce-coordination-system/docs/design/Auth.svg) | [`Auth-1.svg`](file:///Users/habbanma/College/workforce-coordination-system/docs/design/Auth-1.svg)

### 🧱 Struktur HTML / Component Tree
```html
<main class="login-wrapper">
  <div class="login-bg-overlay"></div>
  <div class="login-card">
    <div class="brand-badge">W</div>
    <h1 class="brand-title">Workforce System</h1>
    <p class="brand-subtitle">Pusat Koordinasi Operasional Venue & Kru</p>

    <form class="login-form">
      <div class="form-group">
        <label>Email Staf / Admin</label>
        <div class="input-icon-wrapper">
          <icon class="email-icon" />
          <input type="email" placeholder="admin@coordination.com" />
        </div>
      </div>

      <div class="form-group">
        <label>Kata Sandi</label>
        <div class="input-icon-wrapper">
          <icon class="lock-icon" />
          <input type="password" />
          <button type="button" class="eye-toggle"></button>
        </div>
      </div>

      <button type="submit" class="btn-submit-yellow">Masuk Sistem</button>
    </form>

    <div class="quick-demo-chips">
      <span>Quick Fill: Admin</span>
      <span>Quick Fill: Staff</span>
    </div>
  </div>
</main>
```

### 🎨 Ketentuan Styling CSS
- **Layout Container**: `display: flex; align-items: center; justify-content: center; min-height: 100vh;`
- **Latar Belakang**: Gambar [`public/login-bg.png`](file:///Users/habbanma/College/workforce-coordination-system/public/login-bg.png) dengan `background-size: cover; background-position: center;` dan overlay warna gelap `rgba(15, 23, 42, 0.75)`.
- **Card Form**: `background: #FFFFFF; width: 100%; max-width: 440px; border-radius: 12px; border: 2px solid #FBC02D; padding: 36px; box-shadow: 0 12px 32px rgba(0,0,0,0.25);`
- **Brand Badge Logo**: Circle diameter `48px`, `background: #0F172A; color: #FBC02D; font-weight: 800; border: 2px solid #FBC02D;`
- **Tombol Submit**: `background: #FBC02D; color: #0F172A; font-weight: 800; border-radius: 8px; height: 48px; width: 100%;`

---

## 📊 3. Spesifikasi Navigation & Admin Dashboard (`/dashboard`)
> **Referensi SVG**: [`Dashboard.svg`](file:///Users/habbanma/College/workforce-coordination-system/docs/design/Dashboard.svg)

### 🧱 Struktur HTML / Component Tree
```html
<div class="admin-layout">
  <!-- Sidebar Panel -->
  <aside class="admin-sidebar">
    <div class="sidebar-header">
      <div class="logo-circle">W</div>
      <div class="brand-text">Workforce Admin Portal</div>
    </div>
    <nav class="sidebar-menu">
      <a class="nav-item active">Dashboard</a>
      <a class="nav-item">Staff Management</a>
      <a class="nav-item">Area Management</a>
      <a class="nav-item">Task Management</a>
    </nav>
    <button class="btn-logout-red">Keluar Sistem</button>
  </aside>

  <!-- Main Content Area -->
  <main class="dashboard-content">
    <header class="page-header">
      <h1>Pusat Koordinasi Lapangan</h1>
      <p>Venue Kembang Tasik — Operational Overview</p>
    </header>

    <!-- Top Action & Status Row -->
    <div class="status-cards-grid">
      <div class="card-status-green">
        <span class="badge">Kondisi Aman</span>
        <h3>System Status Optimal</h3>
      </div>
      <button class="card-emergency-red">
        <icon class="alert-icon" />
        <span>🚨 Panggil Semua Staff</span>
      </button>
    </div>

    <!-- Live Signals Row -->
    <div class="signals-grid">
      <div class="card-signal-orange">Minta Bantuan Koordinasi</div>
      <div class="card-signal-teal">Minta Refill Logistik</div>
    </div>

    <!-- Operations Log Terminal -->
    <section class="operations-log-terminal">
      <header>Log Aktivitas Live</header>
      <ul class="log-entries"></ul>
    </section>
  </main>
</div>
```

### 🎨 Ketentuan Styling CSS
- **Sidebar**: `width: 300px; background: #0F172A; color: #FFFFFF; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between;`
- **Active Nav Tab**: `background: #FBC02D; color: #0F172A; font-weight: 800; border-radius: 8px; padding: 12px 16px;`
- **Inactive Nav Tab**: `color: #A1A1A1; background: transparent; font-weight: 600;`
- **Status Card (Hijau)**: `background: #1F7D53; color: #FFFFFF; border-radius: 12px; padding: 24px;`
- **Emergency Button (Merah)**: `background: #C5221F; color: #FFFFFF; font-weight: 800; border-radius: 12px; cursor: pointer;`

---

## 👥 4. Spesifikasi Staff Management / HRMS (`/staff`)
> **Referensi SVG**: [`Staff Management.svg`](file:///Users/habbanma/College/workforce-coordination-system/docs/design/Staff%20Management.svg) | [`Add New Staff.svg`](file:///Users/habbanma/College/workforce-coordination-system/docs/design/Add%20New%20Staff.svg)

### 🧱 Struktur HTML / Component Tree
```html
<section class="staff-module">
  <div class="module-header">
    <div>
      <h1>Staff Management (HRMS)</h1>
      <p>Tambahkan staff lapangan, kelola peran, dan lakukan delegasi wilayah koordinasi.</p>
    </div>
    <button class="btn-add-yellow">+ Daftarkan Staff Baru</button>
  </div>

  <div class="filter-card">
    <input type="text" placeholder="Cari nama staff..." />
    <select class="role-select-filter"></select>
  </div>

  <div class="data-table-wrapper">
    <table class="data-table">
      <thead class="bg-navy-header">
        <tr>
          <th>No.</th>
          <th>Nama Staff</th>
          <th>Peran / Tugas</th>
          <th>Delegasikan Area</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <!-- Dynamic Data Rows -->
      </tbody>
    </table>
  </div>
</section>
```

### 🎨 Ketentuan Styling CSS
- **Tombol Tambah**: `background: #FBC02D; color: #0F172A; font-weight: 800; border-radius: 8px; padding: 10px 24px; box-shadow: 0 4px 12px rgba(251,192,45,0.35);`
- **Table Header**: `background: #131927; color: #FCFCFD; font-weight: 700; text-transform: uppercase; font-size: 0.825rem;`
- **Role Badge**: `background: #0F172A; color: #FFFFFF; border-radius: 6px; font-weight: 700; padding: 4px 10px;`
- **Tombol Aksi Hapus**: `background: #C5221F; color: #FFFFFF; width: 36px; height: 36px; border-radius: 8px;`

---

## 🗺️ 5. Spesifikasi Area Management (`/area`)
> **Referensi SVG**: [`Area Management.svg`](file:///Users/habbanma/College/workforce-coordination-system/docs/design/Area%20Management.svg) | [`Add New Area.svg`](file:///Users/habbanma/College/workforce-coordination-system/docs/design/Add%20New%20Area.svg)

### 🧱 Struktur HTML / Component Tree
```html
<section class="area-module">
  <div class="module-header">
    <div>
      <h1>Area Management</h1>
      <p>Tambahkan staff lapangan, kelola peran, dan lakukan delegasi wilayah koordinasi.</p>
    </div>
    <button class="btn-add-yellow">+ Tambah Area Baru</button>
  </div>

  <div class="table-container">
    <table class="area-table">
      <thead class="bg-navy-header">
        <tr>
          <th>No.</th>
          <th>Nama Area</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>
</section>
```

### 🎨 Ketentuan Styling CSS
- **Tombol Edit (Aksi)**: `background: #F97316; color: #FFFFFF; border-radius: 8px; width: 36px; height: 36px;`
- **Tombol Hapus (Aksi)**: `background: #C5221F; color: #FFFFFF; border-radius: 8px; width: 36px; height: 36px;`

---

## 📋 6. Spesifikasi Task Management (`/tasks`)
> **Referensi SVG**: [`Task Management.svg`](file:///Users/habbanma/College/workforce-coordination-system/docs/design/Task%20Management.svg) | [`Add New Task.svg`](file:///Users/habbanma/College/workforce-coordination-system/docs/design/Add%20New%20Task.svg)

### 🧱 Struktur HTML / Component Tree
```html
<section class="task-module">
  <!-- Top Summary KPI Grid -->
  <div class="kpi-grid">
    <div class="kpi-card navy">
      <span class="label">Total Tugas</span>
      <span class="count yellow">4</span>
    </div>
    <div class="kpi-card navy">
      <span class="label">Tertunda</span>
      <span class="count yellow">1</span>
    </div>
    <div class="kpi-card navy">
      <span class="label">Dikerjakan</span>
      <span class="count yellow">1</span>
    </div>
    <div class="kpi-card green">
      <span class="label">Selesai</span>
      <span class="count white">3</span>
    </div>
  </div>

  <!-- Task Data Table -->
  <table class="task-table">
    <thead class="bg-navy-header">
      <tr>
        <th>No.</th>
        <th>Tugas</th>
        <th>Target Area</th>
        <th>Penanggung Jawab</th>
        <th>Status</th>
        <th>Aksi</th>
      </tr>
    </thead>
  </table>
</section>
```

### 🎨 Ketentuan Status Badge CSS
```css
.badge-status-completed {
  background-color: #10B981;
  color: #FFFFFF;
  font-weight: 700;
  border-radius: 12px;
  padding: 4px 12px;
}

.badge-status-progress {
  background-color: #F97316;
  color: #FFFFFF;
  font-weight: 700;
  border-radius: 12px;
  padding: 4px 12px;
}

.badge-status-pending {
  background-color: #64748B;
  color: #FFFFFF;
  font-weight: 700;
  border-radius: 12px;
  padding: 4px 12px;
}
```

---

## 📱 7. Spesifikasi Staff Portal Mobile (`/portal`)
> **Referensi SVG**: [`Staff Portal.svg`](file:///Users/habbanma/College/workforce-coordination-system/docs/design/Staff%20Portal.svg) | [`Staff Portal - Alert.svg`](file:///Users/habbanma/College/workforce-coordination-system/docs/design/Staff%20Portal%20-%20Alert.svg)

### 🧱 Struktur HTML / Component Tree
```html
<main class="mobile-portal-wrapper">
  <div class="portal-container-412">
    <!-- User Profile Header -->
    <header class="user-profile-bar">
      <div class="avatar-circle">B</div>
      <div class="user-info">
        <h2>Budi Santoso</h2>
        <p>budi@coordination.com</p>
      </div>
      <button class="btn-logout-square-red"></button>
    </header>

    <!-- Emergency Dispatch Banner (Conditional) -->
    <div class="emergency-alert-banner-red">
      <icon class="warning-icon" />
      <div>
        <strong>🚨 DARURAT GATHERING AREA ACTIVE!</strong>
        <p>Semuanya Harap Berkumpul Di Gathering Area Segera!</p>
      </div>
    </div>

    <!-- Assigned Zone Card -->
    <div class="assigned-zone-card-navy">
      <span class="label">Area Penugasan</span>
      <h1 class="zone-title">Food Court</h1>
      <p class="zone-subtitle">Pusat Koordinasi Lapangan</p>
    </div>

    <!-- Trigger Action Buttons -->
    <div class="triggers-grid">
      <button class="btn-help-trigger">Minta Bantuan</button>
      <button class="btn-refill-trigger">Minta Refill</button>
    </div>

    <!-- Self Assigned Tasks -->
    <section class="tasks-section">
      <h3>Tugas Mandiri Saya</h3>
      <div class="task-card-white"></div>
    </section>
  </div>
</main>
```

### 🎨 Ketentuan Styling Mobile CSS
- **Mobile Container Constraint**: `max-width: 412px; width: 100%; margin: 0 auto; padding: 16px;`
- **Assigned Zone Card**: `background: #0F172A; border: 1px solid #FBC02D; border-radius: 12px; padding: 20px; color: #FFFFFF;`
- **Emergency Alert Banner**: `background: #C5221F; color: #FFFFFF; border-radius: 12px; padding: 18px; box-shadow: 0 4px 16px rgba(197, 34, 31, 0.4);`
- **Task Cards**: `background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);`
