# Workforce Coordination System

A web-based application for managing staff placement and task coordination during events (e.g., weddings, exhibitions, etc).

---

## 🚀 Overview

This system helps organizers:

* Assign staff to specific areas (based on layout/denah)
* Manage workforce (HRMS)
* Send tasks to staff in real-time
* Monitor activity during events

---

## 🧠 Core Features

* **Authentication System**
* **HRMS (Staff Management)**
* **Area / Layout Builder (Denah)**
* **Staff Assignment to Areas**
* **Task Management**
* **Real-time Notifications**

---

## 🏗️ Tech Stack

* Frontend: Next.js + Tailwind CSS
* Backend: Next.js API Routes / Node.js
* Database: PostgreSQL + Prisma
* State Management: Zustand
* Realtime: Socket.IO
* Layout Builder: Konva.js

---

## 📂 Project Structure

```
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

## 📊 Current Progress

* [x] Project initialization (Next.js)
* [ ] Authentication system
* [ ] HRMS (staff management)
* [ ] Area layout builder
* [ ] Assignment system
* [ ] Task management
* [ ] Realtime features

---

## 🎯 MVP Scope

* Basic login system
* Create and manage staff
* Create simple area layout (rectangle-based)
* Assign staff to area
* Basic task assignment

---

## 🔮 Future Improvements

* Mobile optimization (PWA)
* Advanced layout editor
* Analytics & reporting
* Multi-event management

---

## 📌 Notes

This project is being developed incrementally with a focus on real-world usability during live events.

---

## 👤 Author

* Hivzzy

## 🧾 Commit Guidelines

To maintain a clean and readable commit history, use the following commit message convention:

### Format

```
<type>: <short description>
```

### Types

* `feat` → new feature
* `fix` → bug fix
* `chore` → setup / config / dependency
* `refactor` → code improvement without changing functionality
* `docs` → documentation changes
* `style` → formatting (no logic changes)

---

### Examples

```
feat: add login page UI
fix: resolve form validation issue
chore: setup project structure
refactor: simplify user service logic
docs: update README with setup instructions
```

---

### Rules

* Use lowercase for type
* Keep description short and clear
* Do not use vague messages like:

  * "update"
  * "fix bug"
  * "progress"
* One commit = one purpose

---

### Bad Example ❌

```
update code
fix something
final
```

---

### Good Example ✅

```
feat: create basic login form
chore: initialize next.js project
```

