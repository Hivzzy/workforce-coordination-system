# Workforce Coordination System

A web-based application for managing staff placement and task coordination during events (e.g., weddings, exhibitions).

---

## 🚀 Overview

This system is designed to help event organizers:

- Manage staff (HRMS)
- Create area layouts (denah)
- Assign staff to specific areas
- Send tasks to staff in real-time
- Monitor operational activities during events

---

## 🧠 Core Modules

- **Authentication** (Admin & Staff)
- **HRMS (Staff Management)**
- **Area / Layout Builder**
- **Assignment System (Staff → Area)**
- **Task Management**
- **Realtime Notification**

---

## 🏗️ Tech Stack

- **Frontend**: Next.js (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma
- **State Management**: Zustand
- **Realtime**: Socket.IO
- **Canvas / Layout**: Konva.js

---

## 📂 Project Structure

```bash
src/
 ├── app/
 ├── components/
 ├── features/
 ├── hooks/
 ├── lib/
 ├── services/
 ├── types/
```

---

## ⚙️ Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/your-username/workforce-coordination-system.git
cd workforce-coordination-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

App will run on:

```
http://localhost:3000
```

---

## 🧾 Commit Guidelines

### Format

```
<type>: <short description>
```

### Types

- `feat` → new feature
- `fix` → bug fix
- `chore` → setup / config
- `refactor` → code improvement
- `docs` → documentation
- `style` → formatting only

### Example

```
feat: add login page UI
chore: setup folder structure
docs: update README
```

---

## 📊 Current Progress

- [x] Initialize Next.js project
- [x] Setup project structure (feature-based)
- [x] Authentication system (login, logout, persist, route protection)
- [x] Role-based access (admin vs staff)
- [x] HRMS - Staff Management (basic CRUD with Zustand)
- [x] Persist staff data (localStorage)
- [x] Protect staff route (admin only)
- [x] Update/Edit staff functionality

---

## ✅ HRMS Features Implemented

- Add staff
- Delete staff
- Update/Edit staff
- Persistent data (localStorage)
- Role-based route protection
- Basic validation (name & role required)

---

## 🧠 Current System Capabilities

- Admin can manage staff
- Staff data persists after refresh
- Unauthorized users cannot access HRMS
- Basic state-driven architecture using Zustand

---

## 🚧 Next Phase

- Area / Layout (Denah) system
- Assign staff to specific areas
- Visual layout builder (canvas-based)
- Task assignment per area

---

## 🧱 Architecture Notes

- Feature-based structure (`features/auth`, `features/staff`)
- Global state via Zustand (modular per feature)
- Separation between UI, state, and logic

---

## 🎯 MVP Scope

- Basic login system
- Staff management (CRUD)
- Simple area layout (rectangle-based)
- Assign staff to area
- Basic task assignment

---

## 🔮 Future Improvements

- Mobile optimization (PWA)
- Advanced layout editor (drag, resize, snap)
- Analytics & reporting
- Multi-event support

---

## 📌 Notes

This project is built incrementally with a focus on real-world event operations and usability under time-sensitive conditions.

---

## 👤 Author

- Hivzzy
