import { NextResponse } from "next/server";
import { query } from "@/utils/db";

export async function GET() {
  try {
    const res = await query(`
      SELECT 
        s.id, 
        s.name, 
        s.role, 
        s.assigned_area_id as "assignedAreaId",
        u.email,
        u.password
      FROM staffs s
      LEFT JOIN users u ON u.staff_id = s.id
      ORDER BY s.name ASC
    `);

    // Deduplicate duplicate staff rows caused by multiple matching user logins
    const seen = new Set();
    const uniqueStaffs = [];
    for (const row of res.rows) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        uniqueStaffs.push(row);
      }
    }

    return NextResponse.json(uniqueStaffs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id, name, role, assignedAreaId, email, password } = await request.json();
    
    // 1. Insert into staffs table
    await query(
      "INSERT INTO staffs (id, name, role, assigned_area_id) VALUES ($1, $2, $3, $4)",
      [id, name, role, assignedAreaId || null]
    );

    // 2. Insert into users table if email and password are provided
    if (email && password) {
      const userId = `user-${id}`;
      await query(
        "INSERT INTO users (id, email, password, name, role, staff_id) VALUES ($1, $2, $3, $4, 'staff', $5) ON CONFLICT (email) DO NOTHING",
        [userId, email.trim(), password, name, id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
