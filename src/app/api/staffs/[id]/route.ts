import { NextResponse } from "next/server";
import { query } from "@/utils/db";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const { name, role, assignedAreaId, email, password } = await request.json();
    
    // 1. Update staffs table
    await query(
      "UPDATE staffs SET name = $1, role = $2, assigned_area_id = $3 WHERE id = $4",
      [name, role, assignedAreaId === undefined ? null : (assignedAreaId || null), id]
    );

    // 2. Update/Insert users table
    if (email) {
      const userRes = await query("SELECT id FROM users WHERE staff_id = $1", [id]);
      if (userRes.rows.length > 0) {
        const userId = userRes.rows[0].id;
        await query(
          "UPDATE users SET email = $1, password = COALESCE($2, password), name = $3 WHERE id = $4",
          [email.trim(), password || null, name, userId]
        );
      } else if (password) {
        const userId = `user-${id}`;
        await query(
          "INSERT INTO users (id, email, password, name, role, staff_id) VALUES ($1, $2, $3, $4, 'staff', $5)",
          [userId, email.trim(), password, name, id]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    
    // 1. Delete user record first to satisfy foreign key constraint
    await query("DELETE FROM users WHERE staff_id = $1", [id]);
    
    // 2. Delete staff record
    await query("DELETE FROM staffs WHERE id = $1", [id]);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
