# Workforce Coordination System

A premium web-based application for managing staff placement and task coordination during events (e.g., weddings, exhibitions).

---

## 🚀 Overview

This system is designed to help event organizers:
- Manage staff (HRMS)
- Create area layouts (zones)
- Assign staff to specific areas
- Send tasks to staff in real-time
- Monitor operational activities during events (Emergency, Help, Refill triggers)

---

## 🏗️ Tech Stack

- **Core**: HTML, Javascript, Typescript
- **Framework**: Next.js 16 (App Router)
- **UI Design System**: Material UI (MUI v6/v9) + Poppins Font
- **Styling**: Vanilla CSS (Tailwind CSS included for utility defaults)
- **State Management**: Zustand (Persisted client-side)

---

## 📂 Project Structure

```bash
src/
 ├── app/                      # Next.js pages & layouts
 │    ├── area/                # Area builder page
 │    ├── dashboard/           # Admin monitoring dashboard
 │    ├── design-system/       # Component preview & guidelines
 │    ├── login/               # Premium authentication page
 │    └── staff/               # Staff management page (HRMS)
 ├── components/               # Packaged Global Components
 │    ├── AdminShell/          # Unified responsive sidebar & Route Guard
 │    ├── AppButton/           # Condition-based button presets
 │    ├── AppTypography/       # Poppins typography presets
 │    ├── DataTable/           # Custom responsive tables
 │    ├── Modal/               # Unified overlays (Form, Confirm, Alert)
 │    ├── Pagination/          # Styled rounded pagination
 │    ├── EmergencyButton/     # Operational simulators
 │    ├── HelpButton/          
 │    └── RefillButton/        
 ├── features/                 # Modular feature states & services (Zustand)
```

---

## ⚙️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Linting & Formatting
```bash
npm run lint      # Run ESLint validation
npm run format    # Run Prettier code formatting
```

---

## 📊 Completed Progress (Tugas Akhir Status)

### 🎨 Design System & Fonts
- [x] Integrate **Poppins** font family globally.
- [x] Configure unified MUI custom theme with dark/light auto-switching.
- [x] Establish reusable packaged components (`AppTypography`, `AppButton`, `Modal`, `DataTable`, `Pagination`).

### 🔑 Authentication & Routing
- [x] Refactor Login page with a premium centered card and glassmorphic UI.
- [x] Add auto-redirects on root route `/` based on credentials.
- [x] Implement `<AdminShell>` for responsive page navigation and automatic role guards.

### 👥 Staff & Area Management (Admin Panel)
- [x] **Dashboard**: Stat summary counters, live log feeds, and operational simulation buttons.
- [x] **Staff Management**: Render staff list inside a clean `DataTable`, edit/add staff via overlays, and assign staff to zones.
- [x] **Area Management**: Card grid displaying event locations, assigned staff details, and inline quick-assign selectors.
- [x] **Role Security**: Add validation checking administrative status before any store state mutations.

---

## 👤 Author
- Hivzzy
