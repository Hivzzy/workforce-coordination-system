import { query } from "@/utils/db";
import { NextResponse } from "next/server";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();
    const { title, description, assignedStaffId, assignedAreaId, status } = body;

    // Check if it's only updating status
    if (status !== undefined && title === undefined) {
      await query(
        `UPDATE tasks SET status = $1 WHERE id = $2`,
        [status, id]
      );
    } else {
      await query(
        `UPDATE tasks 
         SET title = $1, description = $2, assigned_staff_id = $3, assigned_area_id = $4, status = $5
         WHERE id = $6`,
        [title, description || null, assignedStaffId || null, assignedAreaId || null, status || "pending", id]
      );
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
    await query("DELETE FROM tasks WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
