import { Pool } from "pg";

let pool: Pool | null = null;
let useFallback = false;

// ─── Server-Side In-Memory Mock Database ───
// Shared across all browsers connecting to this Next.js server instance
const mockDb = {
  users: [
    { id: "1", email: "admin@coordination.com", password: "admin", name: "Administrator", role: "admin", staffId: null },
    { id: "2", email: "admin@gmail.com", password: "admin", name: "Administrator", role: "admin", staffId: null },
    { id: "staff-001-user", email: "andi@coordination.com", password: "staff", name: "Andi Wijaya", role: "staff", staffId: "staff-001" },
    { id: "staff-002-user", email: "budi@coordination.com", password: "staff", name: "Budi Santoso", role: "staff", staffId: "staff-002" },
    { id: "staff-003-user", email: "citra@coordination.com", password: "staff", name: "Citra Lestari", role: "staff", staffId: "staff-003" },
    { id: "staff-004-user", email: "dedi@coordination.com", password: "staff", name: "Dedi Pratama", role: "staff", staffId: "staff-004" },
    { id: "staff-005-user", email: "evi@coordination.com", password: "staff", name: "Evi Rahmawati", role: "staff", staffId: "staff-005" },
    { id: "staff-006-user", email: "fajar@coordination.com", password: "staff", name: "Fajar Nugroho", role: "staff", staffId: "staff-006" },
    { id: "staff-007-user", email: "guntur@coordination.com", password: "staff", name: "Guntur Saputra", role: "staff", staffId: "staff-007" },
  ],
  roles: [
    { id: "pramusaji", name: "Pramusaji Buffet" },
    { id: "runner", name: "Runner Logistik / Refill" },
    { id: "catering-coord", name: "Koordinator Katering" },
    { id: "vip-host", name: "Pramusaji VIP Lounge" },
    { id: "cleaning", name: "Kru Kebersihan Piring" },
    { id: "security", name: "Security Gate Gedung" },
  ] as { id: string; name: string }[],
  areas: [
    { id: "area-buffet-main", name: "Meja Buffet Utama", type: "zone", color: "#10b981" },
    { id: "area-buffet-a", name: "Buffet A (Nasi & Daging)", type: "stand", color: "#3b82f6" },
    { id: "area-buffet-b", name: "Buffet B (Seafood & Sup)", type: "stand", color: "#6366f1" },
    { id: "area-dessert", name: "Stand Dessert & Kue", type: "stand", color: "#ec4899" },
    { id: "area-drinks", name: "Drink Station & Es Buah", type: "stand", color: "#f59e0b" },
    { id: "area-vip", name: "VIP Lounge Keluarga", type: "building", color: "#8b5cf6" },
    { id: "area-gate", name: "Pintu Masuk & Buku Tamu", type: "zone", color: "#6b7280" },
  ] as any[],
  staffs: [
    { id: "staff-001", name: "Andi Wijaya", role: "catering-coord", assignedAreaId: "area-buffet-main" },
    { id: "staff-002", name: "Budi Santoso", role: "runner", assignedAreaId: "area-buffet-a" },
    { id: "staff-003", name: "Citra Lestari", role: "cleaning", assignedAreaId: "area-buffet-main" },
    { id: "staff-004", name: "Dedi Pratama", role: "pramusaji", assignedAreaId: "area-buffet-b" },
    { id: "staff-005", name: "Evi Rahmawati", role: "vip-host", assignedAreaId: "area-vip" },
    { id: "staff-006", name: "Fajar Nugroho", role: "pramusaji", assignedAreaId: "area-dessert" },
    { id: "staff-007", name: "Guntur Saputra", role: "security", assignedAreaId: "area-gate" },
  ] as any[],
  tasks: [
    { id: "task-001", title: "Refill Stok Sate Ayam Buffet A", description: "Isi ulang porsi sate ayam di Buffet A karena sisa 20%.", assignedStaffId: "staff-002", assignedAreaId: "area-buffet-a", status: "in_progress", createdAt: new Date().toISOString() },
    { id: "task-002", title: "Standby Servis Minuman VIP Lounge", description: "Pastikan cangkir dan jus di VIP Lounge selalu terisi penuh.", assignedStaffId: "staff-005", assignedAreaId: "area-vip", status: "pending", createdAt: new Date().toISOString() },
    { id: "task-003", title: "Pembersihan Meja Piring Kotor", description: "Angkut piring kotor dari meja tamu di sekitar Buffet Utama.", assignedStaffId: "staff-003", assignedAreaId: "area-buffet-main", status: "completed", createdAt: new Date().toISOString() },
  ] as any[],
  system_state: {
    emergency_active: "false",
    help_status: "idle",
    refill_status: "idle",
  } as Record<string, string>
};

const connectionString = process.env.DATABASE_URL;

if (connectionString) {
  try {
    if (process.env.NODE_ENV === "production") {
      pool = new Pool({ connectionString });
    } else {
      if (!(global as any).pgPool) {
        (global as any).pgPool = new Pool({ connectionString });
      }
      pool = (global as any).pgPool;
    }
  } catch (err) {
    console.warn("Failed to instantiate pg Pool. Using in-memory fallback:", err);
    useFallback = true;
  }
} else {
  console.warn("DATABASE_URL not found in env. Using in-memory fallback database.");
  useFallback = true;
}

let isInitialized = false;

export async function query(text: string, params?: any[]) {
  if (useFallback) {
    return queryMock(text, params);
  }

  try {
    if (!isInitialized) {
      isInitialized = true;
      await initDb();
    }
    if (useFallback) {
      return queryMock(text, params);
    }
    return await pool!.query(text, params);
  } catch (error: any) {
    if (error.code === "ECONNREFUSED" || error.message?.includes("connect") || error.message?.includes("password")) {
      console.warn("PostgreSQL connection failed. Falling back to In-Memory Database for testing.");
      useFallback = true;
      return queryMock(text, params);
    }
    throw error;
  }
}

export async function initDb() {
  try {
    // Test connection
    await pool!.query("SELECT 1");

    // 1. Create areas table first (staffs references it)
    await pool!.query(`
      CREATE TABLE IF NOT EXISTS areas (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50),
        color VARCHAR(50)
      );
    `);

    // 2. Create staffs table
    await pool!.query(`
      CREATE TABLE IF NOT EXISTS staffs (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        assigned_area_id VARCHAR(255) REFERENCES areas(id) ON DELETE SET NULL
      );
    `);

    // 3. Create users table
    await pool!.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        staff_id VARCHAR(255)
      );
    `);

    // 4. Create tasks table
    await pool!.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_staff_id VARCHAR(255) REFERENCES staffs(id) ON DELETE CASCADE,
        assigned_area_id VARCHAR(255) REFERENCES areas(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Create system_state table
    await pool!.query(`
      CREATE TABLE IF NOT EXISTS system_state (
        key VARCHAR(255) PRIMARY KEY,
        value VARCHAR(255)
      );
    `);

    // 6. Create roles table
    await pool!.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
    `);

    // 7. Seed areas if empty
    const areaCountRes = await pool!.query("SELECT COUNT(*) FROM areas");
    const areaCount = parseInt(areaCountRes.rows[0].count, 10);
    if (areaCount === 0) {
      console.log("Seeding default event map areas...");
      await pool!.query(`
        INSERT INTO areas (id, name, type, color) VALUES
        ('area-buffet-main', 'Meja Buffet Utama', 'zone', '#10b981'),
        ('area-buffet-a', 'Buffet A (Nasi & Daging)', 'stand', '#3b82f6'),
        ('area-buffet-b', 'Buffet B (Seafood & Sup)', 'stand', '#6366f1'),
        ('area-dessert', 'Stand Dessert & Kue', 'stand', '#ec4899'),
        ('area-drinks', 'Drink Station & Es Buah', 'stand', '#f59e0b'),
        ('area-vip', 'VIP Lounge Keluarga', 'building', '#8b5cf6'),
        ('area-gate', 'Pintu Masuk & Buku Tamu', 'zone', '#6b7280')
        ON CONFLICT DO NOTHING;
      `);
    }

    // 8. Seed staffs if empty
    const staffCountRes = await pool!.query("SELECT COUNT(*) FROM staffs");
    const staffCount = parseInt(staffCountRes.rows[0].count, 10);
    if (staffCount === 0) {
      console.log("Seeding default event staffs...");
      await pool!.query(`
        INSERT INTO staffs (id, name, role, assigned_area_id) VALUES
        ('staff-001', 'Andi Wijaya', 'security', 'area-gate'),
        ('staff-002', 'Budi Santoso', 'cleaning', 'area-food'),
        ('staff-003', 'Citra Lestari', 'medic', 'area-gathering'),
        ('staff-004', 'Dedi Pratama', 'stage-crew', 'area-stage'),
        ('staff-005', 'Evi Rahmawati', 'vip-host', 'area-vip'),
        ('staff-006', 'Fajar Nugroho', 'cashier', 'area-food'),
        ('staff-007', 'Guntur Saputra', 'traffic-officer', 'area-parking')
        ON CONFLICT DO NOTHING;
      `);
    }

    // 9. Seed users if empty
    const userCountRes = await pool!.query("SELECT COUNT(*) FROM users");
    const userCount = parseInt(userCountRes.rows[0].count, 10);
    if (userCount === 0) {
      console.log("Seeding mock users into database...");
      await pool!.query(`
        INSERT INTO users (id, email, password, name, role, staff_id) VALUES
        ('1', 'admin@coordination.com', 'admin', 'Administrator', 'admin', NULL),
        ('2', 'admin@gmail.com', 'admin', 'Administrator', 'admin', NULL),
        ('staff-001-user', 'andi@coordination.com', 'staff', 'Andi Wijaya', 'staff', 'staff-001'),
        ('staff-002-user', 'budi@coordination.com', 'staff', 'Budi Santoso', 'staff', 'staff-002'),
        ('staff-003-user', 'citra@coordination.com', 'staff', 'Citra Lestari', 'staff', 'staff-003'),
        ('staff-004-user', 'dedi@coordination.com', 'staff', 'Dedi Pratama', 'staff', 'staff-004'),
        ('staff-005-user', 'evi@coordination.com', 'staff', 'Evi Rahmawati', 'staff', 'staff-005'),
        ('staff-006-user', 'fajar@coordination.com', 'staff', 'Fajar Nugroho', 'staff', 'staff-006'),
        ('staff-007-user', 'guntur@coordination.com', 'staff', 'Guntur Saputra', 'staff', 'staff-007')
        ON CONFLICT DO NOTHING;
      `);
    }

    // 10. Seed tasks if empty
    const taskCountRes = await pool!.query("SELECT COUNT(*) FROM tasks");
    const taskCount = parseInt(taskCountRes.rows[0].count, 10);
    if (taskCount === 0) {
      console.log("Seeding default tasks...");
      await pool!.query(`
        INSERT INTO tasks (id, title, description, assigned_staff_id, assigned_area_id, status) VALUES
        ('task-001', 'Amankan Pintu Masuk Utama', 'Jaga gerbang utama dari penyusup dan lakukan pemeriksaan tiket/gelang.', 'staff-001', 'area-gate', 'pending'),
        ('task-002', 'Bersihkan Sampah Food Court', 'Kelilingi area food court dan rapikan meja makan pengunjung.', 'staff-002', 'area-food', 'in_progress'),
        ('task-003', 'Jaga Tenda Medis', 'Standby di tenda P3K pusat untuk membantu pengunjung sakit.', 'staff-003', 'area-gathering', 'completed')
        ON CONFLICT DO NOTHING;
      `);
    }

    // 11. Seed system_state if empty
    const stateCountRes = await pool!.query("SELECT COUNT(*) FROM system_state");
    const stateCount = parseInt(stateCountRes.rows[0].count, 10);
    if (stateCount === 0) {
      console.log("Seeding mock system states...");
      await pool!.query(`
        INSERT INTO system_state (key, value) VALUES
        ('emergency_active', 'false'),
        ('help_status', 'idle'),
        ('refill_status', 'idle')
        ON CONFLICT DO NOTHING;
      `);
    }

    // 12. Seed roles if empty
    const rolesCountRes = await pool!.query("SELECT COUNT(*) FROM roles");
    const rolesCount = parseInt(rolesCountRes.rows[0].count, 10);
    if (rolesCount === 0) {
      console.log("Seeding mock roles into database...");
      await pool!.query(`
        INSERT INTO roles (id, name) VALUES
        ('security', 'Security Patrol'),
        ('cleaning', 'Cleaning Service'),
        ('medic', 'Medic / P3K'),
        ('stage-crew', 'Stage Crew / LO'),
        ('vip-host', 'VIP Lounge Host'),
        ('cashier', 'Kasir Food Court'),
        ('traffic-officer', 'Petugas Parkir')
        ON CONFLICT DO NOTHING;
      `);
    }

    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Database initialization failed. Setting fallback mode:", error);
    useFallback = true;
  }
}

// ─── SQL query mock engine ───
function queryMock(text: string, params: any[] = []): { rows: any[] } {
  const normalized = text.toLowerCase().replace(/\s+/g, " ");

  // 1. SELECT users
  if (normalized.includes("from users") && normalized.includes("email =")) {
    const email = params[0];
    const password = params[1];
    const user = mockDb.users.find(u => u.email === email && u.password === password);
    return { rows: user ? [user] : [] };
  }

  // 2. SELECT staffs (count)
  if (normalized.includes("select count") && normalized.includes("staffs")) {
    return { rows: [{ count: mockDb.staffs.length.toString() }] };
  }

  // 3. SELECT users (count)
  if (normalized.includes("select count") && normalized.includes("users")) {
    if (normalized.includes("email =")) {
      const email = params[0];
      const count = mockDb.users.filter(u => u.email === email).length;
      return { rows: [{ count: count.toString() }] };
    }
    return { rows: [{ count: mockDb.users.length.toString() }] };
  }

  // 4. SELECT system_state
  if (normalized.includes("select") && normalized.includes("from system_state")) {
    const rows = Object.entries(mockDb.system_state).map(([key, value]) => ({ key, value }));
    return { rows };
  }

  // 5. UPDATE/INSERT system_state
  if (normalized.includes("insert into system_state")) {
    if (normalized.includes("emergency_active")) {
      mockDb.system_state.emergency_active = params[0];
    } else if (normalized.includes("help_status")) {
      mockDb.system_state.help_status = params[0];
    } else if (normalized.includes("refill_status")) {
      mockDb.system_state.refill_status = params[0];
    }
    return { rows: [] };
  }

  // 6. SELECT roles
  if (normalized.includes("select") && normalized.includes("from roles")) {
    return { rows: mockDb.roles };
  }

  // 7. INSERT roles
  if (normalized.includes("insert into roles")) {
    const [id, name] = params;
    if (!mockDb.roles.some(r => r.id === id || r.name.toLowerCase() === name.toLowerCase())) {
      mockDb.roles.push({ id, name });
    }
    return { rows: [] };
  }

  // 8. INSERT users
  if (normalized.includes("insert into users")) {
    const [id, email, password, name, role, staffId] = params;
    if (!mockDb.users.some(u => u.email === email)) {
      mockDb.users.push({ id, email, password, name, role, staffId });
    }
    return { rows: [] };
  }

  // 9. SELECT user by staff_id
  if (normalized.includes("select id from users where staff_id =")) {
    const staffId = params[0];
    const user = mockDb.users.find(u => u.staffId === staffId);
    return { rows: user ? [user] : [] };
  }

  // 10. UPDATE users
  if (normalized.includes("update users set")) {
    const [email, password, name, id] = params;
    const user = mockDb.users.find(u => u.id === id);
    if (user) {
      user.email = email;
      if (password) user.password = password;
      user.name = name;
    }
    return { rows: [] };
  }

  // 11. DELETE users by staff_id
  if (normalized.includes("delete from users where staff_id =")) {
    const staffId = params[0];
    mockDb.users = mockDb.users.filter(u => u.staffId !== staffId);
    return { rows: [] };
  }

  // 12. SELECT staffs (with joined user details)
  if (normalized.includes("select") && normalized.includes("from staffs")) {
    const sorted = [...mockDb.staffs].sort((a, b) => a.name.localeCompare(b.name));
    return {
      rows: sorted.map(s => {
        const u = mockDb.users.find(usr => usr.staffId === s.id);
        return {
          id: s.id,
          name: s.name,
          role: s.role,
          assignedAreaId: s.assignedAreaId,
          email: u ? u.email : undefined,
          password: u ? u.password : undefined
        };
      })
    };
  }

  // 13. INSERT staffs
  if (normalized.includes("insert into staffs")) {
    const [id, name, role, assignedAreaId] = params;
    mockDb.staffs.push({ id, name, role, assignedAreaId });
    return { rows: [] };
  }

  // 14. UPDATE staffs (assigned_area_id = NULL)
  if (normalized.includes("update staffs set assigned_area_id = null") || normalized.includes("update staffs set assigned_area_id = $1")) {
    const targetAreaId = params[0];
    mockDb.staffs.forEach(s => {
      if (!targetAreaId || s.assignedAreaId === targetAreaId) {
        s.assignedAreaId = null;
      }
    });
    return { rows: [] };
  }

  // 15. UPDATE staffs (by ID)
  if (normalized.includes("update staffs set")) {
    const [name, role, assignedAreaId, id] = params;
    const staff = mockDb.staffs.find(s => s.id === id);
    if (staff) {
      staff.name = name;
      staff.role = role;
      staff.assignedAreaId = assignedAreaId;
    }
    return { rows: [] };
  }

  // 16. DELETE staffs
  if (normalized.includes("delete from staffs")) {
    const id = params[0];
    mockDb.staffs = mockDb.staffs.filter(s => s.id !== id);
    return { rows: [] };
  }

  // 17. SELECT areas
  if (normalized.includes("select") && normalized.includes("from areas")) {
    return { rows: mockDb.areas };
  }

  // 18. INSERT areas
  if (normalized.includes("insert into areas")) {
    const [id, name, type, color] = params;
    mockDb.areas.push({ id, name, type, color });
    return { rows: [] };
  }

  // 19. UPDATE areas
  if (normalized.includes("update areas set")) {
    const id = params[params.length - 1];
    const area = mockDb.areas.find(a => a.id === id);
    if (area) {
      const setPart = text.substring(text.indexOf("SET") + 3, text.indexOf("WHERE")).trim();
      const clauses = setPart.split(",").map(c => c.trim());
      clauses.forEach((clause, index) => {
        const fieldName = clause.split("=")[0].trim().replace(/"/g, "");
        area[fieldName] = params[index];
      });
    }
    return { rows: [] };
  }

  // 20. DELETE areas (all)
  if (normalized.includes("delete from areas") && !normalized.includes("where")) {
    mockDb.areas = [];
    return { rows: [] };
  }

  // 21. DELETE areas (by id)
  if (normalized.includes("delete from areas where id =")) {
    const id = params[0];
    mockDb.areas = mockDb.areas.filter(a => a.id !== id);
    return { rows: [] };
  }

  // 22. SELECT tasks
  if (normalized.includes("select") && normalized.includes("from tasks")) {
    if (normalized.includes("assigned_staff_id =")) {
      const staffId = params[0];
      const rows = mockDb.tasks.filter(t => t.assignedStaffId === staffId);
      return { rows };
    }
    return { rows: mockDb.tasks };
  }

  // 23. INSERT tasks
  if (normalized.includes("insert into tasks")) {
    const [id, title, description, assigned_staff_id, assigned_area_id, status] = params;
    mockDb.tasks.push({
      id,
      title,
      description,
      assignedStaffId: assigned_staff_id,
      assignedAreaId: assigned_area_id,
      status: status || "pending",
      createdAt: new Date().toISOString()
    });
    return { rows: [] };
  }

  // 24. UPDATE tasks
  if (normalized.includes("update tasks set")) {
    if (normalized.includes("status =") && !normalized.includes("title =")) {
      const [status, id] = params;
      const task = mockDb.tasks.find(t => t.id === id);
      if (task) {
        task.status = status;
      }
    } else {
      const [title, description, assigned_staff_id, assigned_area_id, status, id] = params;
      const task = mockDb.tasks.find(t => t.id === id);
      if (task) {
        task.title = title;
        task.description = description;
        task.assignedStaffId = assigned_staff_id;
        task.assignedAreaId = assigned_area_id;
        task.status = status;
      }
    }
    return { rows: [] };
  }

  // 25. DELETE tasks
  if (normalized.includes("delete from tasks where id =")) {
    const id = params[0];
    mockDb.tasks = mockDb.tasks.filter(t => t.id !== id);
    return { rows: [] };
  }

  return { rows: [] };
}
