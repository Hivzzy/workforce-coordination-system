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
- [x] Setup base folder structure
- [x] Setup README & commit convention
- [x] Authentication (basic login flow)
- [x] Global state management (Zustand)
- [x] Persist login (localStorage)
- [x] Route protection (dashboard)

### ✅ Auth Features Implemented

- Login page (`/login`)
- Dummy authentication service
- Global auth state using Zustand
- Persistent login (localStorage)
- Protected dashboard route (`/dashboard`)
- Redirect after login

### 🚧 Next Phase

- Logout functionality
- Role-based access (admin vs staff)
- Start HRMS module (staff management)

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
