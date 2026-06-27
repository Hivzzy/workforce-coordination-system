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
    { id: "security", name: "Security Patrol" },
    { id: "cleaning", name: "Cleaning Service" },
    { id: "medic", name: "Medic / P3K" },
    { id: "stage-crew", name: "Stage Crew / LO" },
    { id: "vip-host", name: "VIP Lounge Host" },
    { id: "cashier", name: "Kasir Food Court" },
    { id: "traffic-officer", name: "Petugas Parkir" },
  ] as { id: string; name: string }[],
  areas: [
    { id: "area-gate", name: "Pintu Masuk Utama", type: "zone", color: "#10b981", rotation: 0, layer: 4, x: 5, y: 40, w: 100, h: 80 },
    { id: "area-stage", name: "Panggung Utama", type: "building", color: "#6366f1", rotation: 0, layer: 4, x: 75, y: 30, w: 200, h: 120 },
    { id: "area-gathering", name: "Gathering Area", type: "zone", color: "#ef4444", rotation: 0, layer: 2, x: 40, y: 35, w: 240, h: 150 },
    { id: "area-food", name: "Food Court", type: "stand", color: "#f59e0b", rotation: 0, layer: 4, x: 45, y: 10, w: 180, h: 80 },
    { id: "area-vip", name: "VIP Lounge", type: "building", color: "#8b5cf6", rotation: 0, layer: 4, x: 15, y: 12, w: 140, h: 90 },
    { id: "area-parking", name: "Area Parkir", type: "parking", color: "#6b7280", rotation: 0, layer: 1, x: 5, y: 70, w: 220, h: 130 },
    {
      id: "area-road",
      name: "Jalan Utama",
      type: "road",
      color: "#4b5563",
      rotation: 0,
      layer: 1,
      waypoints: [
        { x: 100, y: 320 },
        { x: 600, y: 320 },
        { x: 1100, y: 320 }
      ],
      roadWidth: 32
    }
  ] as any[],
  staffs: [
    { id: "staff-001", name: "Andi Wijaya", role: "security", assignedAreaId: "area-gate" },
    { id: "staff-002", name: "Budi Santoso", role: "cleaning", assignedAreaId: "area-food" },
    { id: "staff-003", name: "Citra Lestari", role: "medic", assignedAreaId: "area-gathering" },
    { id: "staff-004", name: "Dedi Pratama", role: "stage-crew", assignedAreaId: "area-stage" },
    { id: "staff-005", name: "Evi Rahmawati", role: "vip-host", assignedAreaId: "area-vip" },
    { id: "staff-006", name: "Fajar Nugroho", role: "cashier", assignedAreaId: "area-food" },
    { id: "staff-007", name: "Guntur Saputra", role: "traffic-officer", assignedAreaId: "area-parking" },
  ] as any[],
  tasks: [
    { id: "task-001", title: "Amankan Pintu Masuk Utama", description: "Jaga gerbang utama dari penyusup dan lakukan pemeriksaan tiket/gelang.", assignedStaffId: "staff-001", assignedAreaId: "area-gate", status: "pending", createdAt: new Date().toISOString() },
    { id: "task-002", title: "Bersihkan Sampah Food Court", description: "Kelilingi area food court dan rapikan meja makan pengunjung.", assignedStaffId: "staff-002", assignedAreaId: "area-food", status: "in_progress", createdAt: new Date().toISOString() },
    { id: "task-003", title: "Jaga Tenda Medis", description: "Standby di tenda P3K pusat untuk membantu pengunjung sakit.", assignedStaffId: "staff-003", assignedAreaId: "area-gathering", status: "completed", createdAt: new Date().toISOString() },
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
        type VARCHAR(50) NOT NULL,
        color VARCHAR(50),
        rotation INTEGER DEFAULT 0,
        layer INTEGER DEFAULT 4,
        x DOUBLE PRECISION DEFAULT 10,
        y DOUBLE PRECISION DEFAULT 10,
        w INTEGER DEFAULT 160,
        h INTEGER DEFAULT 120,
        points JSONB,
        waypoints JSONB,
        road_width INTEGER DEFAULT 24
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
        INSERT INTO areas (id, name, type, color, rotation, layer, x, y, w, h, points, waypoints, road_width) VALUES
        ('area-gate', 'Pintu Masuk Utama', 'zone', '#10b981', 0, 4, 5, 40, 100, 80, NULL, NULL, 24),
        ('area-stage', 'Panggung Utama', 'building', '#6366f1', 0, 4, 75, 30, 200, 120, NULL, NULL, 24),
        ('area-gathering', 'Gathering Area', 'zone', '#ef4444', 0, 2, 40, 35, 240, 150, NULL, NULL, 24),
        ('area-food', 'Food Court', 'stand', '#f59e0b', 0, 4, 45, 10, 180, 80, NULL, NULL, 24),
        ('area-vip', 'VIP Lounge', 'building', '#8b5cf6', 0, 4, 15, 12, 140, 90, NULL, NULL, 24),
        ('area-parking', 'Area Parkir', 'parking', '#6b7280', 0, 1, 5, 70, 220, 130, NULL, NULL, 24),
        ('area-road', 'Jalan Utama', 'road', '#4b5563', 0, 1, 10, 40, 100, 100, NULL, '[{"x":100,"y":320},{"x":600,"y":320},{"x":1100,"y":320}]', 32)
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
    const [id, name, type, color, rotation, layer, x, y, w, h, points, waypoints, road_width] = params;
    mockDb.areas.push({
      id, name, type, color, rotation, layer, x, y, w, h,
      points: points ? JSON.parse(points) : undefined,
      waypoints: waypoints ? JSON.parse(waypoints) : undefined,
      roadWidth: road_width
    });
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
        let val = params[index];
        if (fieldName === "points" || fieldName === "waypoints") {
          val = val ? JSON.parse(val) : undefined;
        }
        if (fieldName === "road_width") {
          area.roadWidth = val;
        } else {
          area[fieldName] = val;
        }
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
