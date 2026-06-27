import { query } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");

    let sql = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.assigned_staff_id as "assignedStaffId",
        t.assigned_area_id as "assignedAreaId",
        t.status,
        t.created_at as "createdAt",
        s.name as "staffName",
        a.name as "areaName"
      FROM tasks t
      LEFT JOIN staffs s ON t.assigned_staff_id = s.id
      LEFT JOIN areas a ON t.assigned_area_id = a.id
    `;
    let params: any[] = [];

    if (staffId) {
      sql += ` WHERE t.assigned_staff_id = $1`;
      params.push(staffId);
    }

    sql += ` ORDER BY t.created_at DESC`;

    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, assignedStaffId, assignedAreaId, status } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await query(
      `INSERT INTO tasks (id, title, description, assigned_staff_id, assigned_area_id, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id || Date.now().toString(), title, description || null, assignedStaffId || null, assignedAreaId || null, status || "pending"]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
