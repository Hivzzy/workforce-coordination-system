import { NextResponse } from "next/server";
import { query } from "@/utils/db";

export async function POST() {
  try {
    // 1. Unassign all staffs
    await query("UPDATE staffs SET assigned_area_id = NULL");
    // 2. Delete all areas
    await query("DELETE FROM areas");
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
