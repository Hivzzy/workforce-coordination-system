import { NextResponse } from "next/server";
import { query } from "@/utils/db";

export async function GET() {
  try {
    const res = await query("SELECT id, name, type, color, rotation, layer, x, y, w, h, points, waypoints, road_width as \"roadWidth\" FROM areas");
    // Format JSONB points/waypoints to normal objects
    const formatted = res.rows.map((row) => ({
      ...row,
      points: row.points || undefined,
      waypoints: row.waypoints || undefined,
      roadWidth: row.roadWidth || undefined,
    }));
    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, type, color, rotation, layer, x, y, w, h, points, waypoints, roadWidth } = body;
    await query(
      `INSERT INTO areas (id, name, type, color, rotation, layer, x, y, w, h, points, waypoints, road_width)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        id, name, type, color || null, rotation || 0, layer || 4, x || 10, y || 10, w || 160, h || 120,
        points ? JSON.stringify(points) : null,
        waypoints ? JSON.stringify(waypoints) : null,
        roadWidth || 24
      ]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
