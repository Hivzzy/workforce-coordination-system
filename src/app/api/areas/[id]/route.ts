import { NextResponse } from "next/server";
import { query } from "@/utils/db";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();
    
    // Dynamically build the update query to only update specified fields
    const fields = Object.keys(body);
    if (fields.length === 0) {
      return NextResponse.json({ success: true });
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of fields) {
      let dbField = field;
      if (field === "roadWidth") dbField = "road_width";

      let val = body[field];
      if (field === "points" || field === "waypoints") {
        val = val ? JSON.stringify(val) : null;
      }

      setClauses.push(`${dbField} = $${paramIndex}`);
      values.push(val);
      paramIndex++;
    }

    values.push(id);
    const queryText = `UPDATE areas SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`;
    await query(queryText, values);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    await query("DELETE FROM areas WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
