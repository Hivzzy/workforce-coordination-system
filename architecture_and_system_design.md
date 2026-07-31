# DOKUMEN ARSITEKTUR & KEAMANAN HTTPONLY COOKIE ENTERPRISE (MONOREPO)

**Proyek:** Aplikasi Manajemen Operasional Berbasis Web pada Kembang Tasik Wedding Organizer & Catering  
**Keamanan Backend:** Java Spring Boot 3.x Enterprise Security (`Set-Cookie: jwt_token=... HttpOnly; SameSite=Lax`, BCrypt Hashing, JWT HMAC-SHA256, Token Revocation Blacklist, Spring Security Filters)  
**Keamanan Frontend:** Next.js 16 App Router (Centralized API Client dengan `credentials: "include"`, Automatic Bearer JWT Injection, 401 Interceptors, Token Expiration Guard, Server-Side Logout Revocation)  
**Database:** PostgreSQL (`kembang_tasik_db`) / Inspeksi Visual DBeaver  
**Penulis:** Habban Masykur Abdullah (NIM: 2550087015)  
**Instansi:** Universitas Jenderal Achmad Yani (UNJANI)  
**Arsitektur:** Monorepo Multi-Tier (`src/` untuk Frontend Next.js & `backend/` untuk Java Spring Boot Backend)  

---

## 1. KEAMANAN HTTPONLY SECURE COOKIE JWT (ENTERPRISE STANDARD)

### 1.1 Penerbitan Token via Cookie (`Set-Cookie: jwt_token=... HttpOnly`)
* Saat otentikasi `POST /api/auth/login` berhasil di backend Java Spring Boot, server menerbitkan cookie aman dengan atribut:
  * `Name`: `jwt_token`
  * `HttpOnly`: `true` (Mencegah pencurian token oleh skrip JavaScript malicious / serangan XSS).
  * `Path`: `/` (Berlaku untuk seluruh endpoint API).
  * `SameSite`: `Lax` (Mencegah serangan Cross-Site Request Forgery / CSRF).
  * `Max-Age`: `86400` (Masa berlaku 24 jam).

### 1.2 Transmisi Otomatis Browser (`credentials: "include"`)
* HTTP Client terpusat di frontend Next.js (`api-client.ts`) dikonfigurasi dengan opsi `credentials: "include"`.
* Browser menyertakan cookie `jwt_token` secara otomatis pada setiap permintaan HTTP CORS ke server Java Spring Boot (`http://localhost:8080`).

### 1.3 Dual Extraction Filter (`JwtAuthenticationFilter.java`)
* Filter keamanan Spring Boot mengekstrak token dari 2 sumber utama:
  1. HTTP Cookie bernama `jwt_token` (Prioritas Utama untuk Browser/Production).
  2. Header `Authorization: Bearer <token>` (Fallback untuk Mobile Client / API Testing).

### 1.4 Pembersihan Cookie Server-Side saat Logout
* Saat pengguna memilih **Log Out**, frontend memanggil `POST /api/auth/logout`.
* Java Spring Boot backend merespons dengan cookie pembersih:
  `Set-Cookie: jwt_token=; Path=/; HttpOnly; Max-Age=0`
* Token tersebut secara bersamaan didaftarkan ke `TokenBlacklistService` di server untuk merevokasi akses secara permanen.

```mermaid
graph TD
    subgraph Client Tier (Next.js Frontend - Port 3000)
        User[Pengguna Admin / Pramusaji] -->|1. Form Login email & pass| LoginUI[src/app/login/page.tsx]
        LoginUI -->|2. POST /api/auth/login| BackendLogin[Spring Boot AuthController]
        
        Browser[Browser Storage & Cookie Engine] -->|3. Auto Send HttpOnly Cookie jwt_token credentials include| JwtFilter[JwtAuthenticationFilter]
        LogoutBtn[Aksi Logout] -->|4. POST /api/auth/logout| BackendLogout[AuthLogoutHandler]
    end

    subgraph Java Spring Boot Enterprise Security Tier (Port 8080)
        BackendLogin -->|Verify BCrypt Hash| BCrypt[BCryptPasswordEncoder]
        BCrypt -->|Generate JWT & Set-Cookie jwt_token HttpOnly| JwtProvider[JwtTokenProvider]
        JwtProvider -->|Set-Cookie Header| Browser

        JwtFilter -->|Extract from Cookie or Bearer| TokenExtractor[Token Extractor]
        TokenExtractor -->|Check Blacklist| BlacklistService[TokenBlacklistService]
        BlacklistService -->|Valid Token| SecContext[SecurityContextHolder]

        BackendLogout -->|Set-Cookie: jwt_token=; Max-Age=0| Browser
        BackendLogout -->|Blacklist Active Token| BlacklistService
    end

    subgraph Database Tier (Port 5432)
        BCrypt -->|Verify Hashed Password| DB[(PostgreSQL kembang_tasik_db)]
        DBeaver[DBeaver SQL Client] -->|Inspect Hashes $2a$10$...| DB
    end
```

---

## 2. MATRIKS FITUR KEAMANAN HTTPONLY COOKIE

| Komponen Keamanan | Implementasi di Backend Java Spring Boot | Implementasi di Frontend Next.js |
| :--- | :--- | :--- |
| **Proteksi XSS** | Menerbitkan header `Set-Cookie` dengan `HttpOnly=true`. | Token tidak bisa dibaca oleh `document.cookie` / JavaScript script. |
| **Proteksi CSRF** | Menggunakan atribut cookie `SameSite=Lax`. | Transmisi aman via `credentials: "include"`. |
| **Masa Berlaku Token** | Ditentukan 24 jam via `jwtExpirationMs`. | `isTokenExpired()` memantau timestamp di client. |
| **Logout & Revokasi** | `TokenBlacklistService` + `Max-Age=0` Cookie Header. | Memanggil `POST /api/auth/logout` lalu mereset state UI. |
| **Handling Session Expired** | Filter merespons HTTP `401 Unauthorized` JSON format. | `api-client.ts` menangkap 401 & redirect ke `/login?expired=true`. |
