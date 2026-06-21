<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Aturan Pemisahan Fitur (Role: Admin vs Staff)

Berikut adalah panduan dan aturan ketat dalam pengembangan fitur berdasarkan peran user (**Admin** dan **Staff**). Semua agen/model yang bekerja pada codebase ini harus mematuhi struktur dan batasan ini.

---

## 👥 Ringkasan Peran & Aksesibilitas

| Fitur / Modul | Admin | Staff | Deskripsi / Batasan |
| :--- | :---: | :---: | :--- |
| **Dashboard Utama (`/dashboard`)** | ✅ Ya | ❌ Tidak | Halaman ringkasan performa event, statistik, dan status koordinasi. |
| **HRMS (`/staff`)** | ✅ Ya | ❌ Tidak | CRUD Staff, edit profil, dan melihat data seluruh staff. |
| **Area Builder (`/area`)** | ✅ Ya | ❌ Tidak | Membuat layout area, edit denah event, dan menghapus area. |
| **Staff Assignment** | ✅ Ya | ❌ Tidak | Memetakan staff ke area tertentu (hanya Admin yang bisa mengubah/assign). |
| **Task Management (Create/Assign)**| ✅ Ya | ❌ Tidak | Membuat tugas baru, assign tugas ke area/staff, dan memantau status secara global. |
| **Staff Portal (`/portal` / `/my-tasks`)** | ⚠️ View | ✅ Ya | Halaman khusus staff untuk melihat tugas mandiri, detail area yang didelegasikan, dan mengubah status tugas. |
| **Real-time Notifications** | ✅ Ya | ✅ Ya | Admin menerima update status tugas; Staff menerima notifikasi tugas baru/perubahan layout. |
| **Emergency Gathering Trigger** | ✅ Ya | ❌ Tidak | Tombol darurat di admin panel untuk memanggil semua staff (atau staff di area tertentu) ke Gathering Area. |
| **Help Request (Tombol Help)** | ❌ Tidak | ✅ Ya | Tombol bantuan cepat di portal staff untuk memanggil admin/koordinator ke area tugas jika ada masalah. |
| **Refill Request (Tombol Refill)** | ❌ Tidak | ✅ Ya | Tombol cepat bagi staff untuk meminta isi ulang logistik (makanan/minuman/perlengkapan) pada area penugasan mereka. |

---

## 🔒 Aturan Keamanan & Implementasi (Rules for Code Generation)

### 1. Proteksi Rute (Route Protection)
* **Admin Routes**: Halaman seperti `/dashboard`, `/staff`, dan `/area` **wajib** dilindungi menggunakan Route Guard. Jika user yang login memiliki role `staff` atau belum terautentikasi, alihkan (`redirect`) langsung ke `/login` atau halaman portal staff.
* Gunakan component [AdminShell](file:///src/components/AdminShell/index.tsx) untuk membungkus halaman admin guna melakukan pengecekan hak akses otomatis.

### 2. Visibilitas UI (UI Conditional Rendering)
* Elemen kontrol seperti tombol **Add**, **Edit**, **Delete**, dan form manipulasi data **hanya boleh dirender** jika `user.role === 'admin'`.
* Gunakan conditional rendering yang konsisten untuk menyembunyikan aksi administratif dari tampilan staff.

### 3. Validasi State (Zustand & Actions Protection)
* Sebelum memanggil action yang mengubah state penting (seperti `addStaff`, `removeStaff`, `addArea`, `assignStaffToArea`), pastikan state auth dicek terlebih dahulu di level handler halaman:
  ```typescript
  const user = useAuthStore.getState().user;
  if (!user || user.role !== 'admin') {
    throw new Error("Unauthorized action");
  }
  ```

### 4. Responsivitas Tampilan (Mobile-First untuk Staff)
* **Staff Portal**: Harus dikembangkan dengan pendekatan **Mobile-First** (sangat responsif), karena staff di lapangan akan mengakses aplikasi menggunakan smartphone.
* **Admin Panel**: Gunakan layout desktop/tablet terstruktur dengan navigasi side-drawer dari `AdminShell`.

### 5. Aturan Penggunaan Komponen Global (Design System Reuse)
Semua halaman baru wajib menggunakan komponen siap pakai yang dideklarasikan di folder `src/components/` demi konsistensi gaya:
* **AppTypography**: Gunakan untuk menampilkan semua bentuk teks/tulisan. Hindari tag `<h1>`-`<h6>` mentah atau tag `<p>` tanpa formatting. Gunakan preset:
  - `preset="pageTitle"` untuk judul utama halaman.
  - `preset="sectionTitle"` untuk judul seksi / sub-modul.
  - `preset="cardTitle"` untuk judul di dalam kartu (card).
  - `preset="bodyText"` untuk teks isi utama.
  - `preset="helperText"` untuk deskripsi kecil/pendukung.
* **AppButton**: Gunakan untuk semua jenis tombol aksi. Manfaatkan prop `condition` untuk mewarnai tombol secara otomatis:
  - `condition="add"` (Warna primary, icon tambah).
  - `condition="edit"` (Warna secondary, icon edit).
  - `condition="delete"` (Warna error, icon tempat sampah).
  - `condition="refresh"` (Warna teal, icon refresh).
  - `condition="warning"` (Warna rose/orange, icon amber warning).
* **Modal**: Gunakan satu komponen modal terpadu ini untuk menampilkan semua popup dialog:
  - `type="form"` untuk menampung input field.
  - `type="confirm"` untuk memicu persetujuan penghapusan/aksi krusial.
  - `type="alert"` dengan custom `severity` ("success", "error", "warning", "info") untuk menampilkan pesan status.
* **DataTable**: Gunakan untuk menampilkan data tabular secara dinamis dan responsif.
* **Pagination**: Gunakan untuk tombol navigasi perpindahan halaman pada tabel data.
