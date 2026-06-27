import { NextResponse } from "next/server";
import { query } from "@/utils/db";

export async function GET() {
  try {
    const res = await query("SELECT id, name FROM roles ORDER BY name ASC");
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }
    // Generate id slug
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    await query(
      "INSERT INTO roles (id, name) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING",
      [id, name.trim()]
    );
    return NextResponse.json({ success: true, role: { id, name: name.trim() } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
