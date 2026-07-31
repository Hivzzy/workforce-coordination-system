const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
let databaseUrl = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/DATABASE_URL\s*=\s*([^\n\r]*)/);
  if (match && match[1]) {
    databaseUrl = match[1].trim().replace(/['"]/g, '');
  }
}

if (!databaseUrl) {
  console.log("❌ Error: DATABASE_URL not found in .env.local!");
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });

async function reset() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL database. Dropping tables...");
    await client.query("DROP TABLE IF EXISTS tasks CASCADE;");
    await client.query("DROP TABLE IF EXISTS system_state CASCADE;");
    await client.query("DROP TABLE IF EXISTS staffs CASCADE;");
    await client.query("DROP TABLE IF EXISTS users CASCADE;");
    await client.query("DROP TABLE IF EXISTS areas CASCADE;");
    await client.query("DROP TABLE IF EXISTS roles CASCADE;");
    console.log("Tables dropped. Initializing tables and seeding defaults...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS areas (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50),
        color VARCHAR(50)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS staffs (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        assigned_area_id VARCHAR(255) REFERENCES areas(id) ON DELETE SET NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        staff_id VARCHAR(255)
      );
    `);

    await client.query(`
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS system_state (
        state_key VARCHAR(255) PRIMARY KEY,
        state_value VARCHAR(255)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
    `);

    await client.query(`
      INSERT INTO roles (id, name) VALUES
      ('pramusaji', 'Pramusaji Buffet'),
      ('runner', 'Runner Logistik / Refill'),
      ('catering-coord', 'Koordinator Katering'),
      ('vip-host', 'Pramusaji VIP Lounge'),
      ('cleaning', 'Kru Kebersihan Piring'),
      ('security', 'Security Gate Gedung')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO areas (id, name, type, color) VALUES
      ('area-buffet-main', 'Meja Buffet Utama', 'zone', '#10b981'),
      ('area-buffet-a', 'Buffet A (Nasi & Daging)', 'stand', '#3b82f6'),
      ('area-buffet-b', 'Buffet B (Seafood & Sup)', 'stand', '#6366f1'),
      ('area-dessert', 'Stand Dessert & Kue', 'stand', '#ec4899'),
      ('area-drinks', 'Drink Station & Es Buah', 'stand', '#f59e0b'),
      ('area-vip', 'VIP Lounge Keluarga', 'building', '#8b5cf6'),
      ('area-gate', 'Pintu Masuk & Buku Tamu', 'zone', '#6b7280')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO staffs (id, name, role, assigned_area_id) VALUES
      ('staff-001', 'Andi Wijaya', 'catering-coord', 'area-buffet-main'),
      ('staff-002', 'Budi Santoso', 'runner', 'area-buffet-a'),
      ('staff-003', 'Citra Lestari', 'cleaning', 'area-buffet-main'),
      ('staff-004', 'Dedi Pratama', 'pramusaji', 'area-buffet-b'),
      ('staff-005', 'Evi Rahmawati', 'vip-host', 'area-vip'),
      ('staff-006', 'Fajar Nugroho', 'pramusaji', 'area-dessert'),
      ('staff-007', 'Guntur Saputra', 'security', 'area-gate')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO users (id, email, password, name, role, staff_id) VALUES
      ('1', 'admin@coordination.com', 'admin', 'Administrator Kembang Tasik', 'admin', NULL),
      ('2', 'admin@gmail.com', 'admin', 'Administrator Kembang Tasik', 'admin', NULL),
      ('staff-default-user', 'staff@coordination.com', 'staff', 'Staff Kembang Tasik', 'staff', 'staff-001'),
      ('staff-001-user', 'andi@coordination.com', 'staff', 'Andi Wijaya', 'staff', 'staff-001'),
      ('staff-002-user', 'budi@coordination.com', 'staff', 'Budi Santoso', 'staff', 'staff-002'),
      ('staff-003-user', 'citra@coordination.com', 'staff', 'Citra Lestari', 'staff', 'staff-003'),
      ('staff-004-user', 'dedi@coordination.com', 'staff', 'Dedi Pratama', 'staff', 'staff-004'),
      ('staff-005-user', 'evi@coordination.com', 'staff', 'Evi Rahmawati', 'staff', 'staff-005'),
      ('staff-006-user', 'fajar@coordination.com', 'staff', 'Fajar Nugroho', 'staff', 'staff-006'),
      ('staff-007-user', 'guntur@coordination.com', 'staff', 'Guntur Saputra', 'staff', 'staff-007')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO tasks (id, title, description, assigned_staff_id, assigned_area_id, status) VALUES
      ('task-001', 'Refill Stok Sate Ayam Buffet A', 'Isi ulang porsi sate ayam di Buffet A karena sisa 20%.', 'staff-002', 'area-buffet-a', 'in_progress'),
      ('task-002', 'Standby Servis Minuman VIP Lounge', 'Pastikan cangkir dan jus di VIP Lounge selalu terisi penuh.', 'staff-005', 'area-vip', 'pending'),
      ('task-003', 'Pembersihan Meja Piring Kotor', 'Angkut piring kotor dari meja tamu di sekitar Buffet Utama.', 'staff-003', 'area-buffet-main', 'completed')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO system_state (state_key, state_value) VALUES
      ('emergency_active', 'false'),
      ('help_status', 'idle'),
      ('refill_status', 'idle')
      ON CONFLICT (state_key) DO NOTHING;
    `);

    console.log("✅ Database reset and seeded successfully with default event layout & tasks!");
  } catch (error) {
    console.error("❌ Database reset failed:", error);
  } finally {
    await client.end();
  }
}

reset();
