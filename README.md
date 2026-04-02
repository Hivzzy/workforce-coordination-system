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
- [x] Feature-based architecture setup
- [x] Authentication system (login, logout, persist, route protection)
- [x] Role-based access (admin vs staff)

### HRMS (Staff Management)

- [x] Add staff
- [x] Delete staff
- [x] Update/Edit staff
- [x] Persist data (localStorage)
- [x] Admin-only access

### Area Management

- [x] Add area
- [x] Delete area
- [x] Persist data

### Assignment System

- [x] Assign staff to area
- [x] Staff stores `assignedAreaId` (single source of truth)
- [x] Assignment persists after refresh
- [x] Assignment preserved on staff update

---

## 🧠 Current System Capabilities

- Admin can manage staff and areas
- Staff can be assigned to specific areas
- Data persistence using Zustand
- Role-based route protection
- Relational structure: **Staff → Area**

---

## 🧱 Data Design (Important)

### Staff

- id
- name
- role
- assignedAreaId (optional)

### Area

- id
- name

> Relationship: One staff belongs to one area (optional)

---

## 🚧 Next Phase

- View: Area → list assigned staff
- Basic visual layout (grid-based denah)
- Mapping area into visual representation
- Preparation for canvas (Konva.js)

---

## 🧠 Architecture Notes

- Feature-based modular structure
- Zustand for global state (per feature)
- Separation of concerns (UI / state / logic)
- Avoid data duplication (single source of truth)

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
