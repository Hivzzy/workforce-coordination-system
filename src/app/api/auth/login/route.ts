import { NextResponse } from "next/server";
import { query } from "@/utils/db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const res = await query(
      "SELECT id, email, name, role, staff_id as \"staffId\" FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (res.rows.length > 0) {
      return NextResponse.json(res.rows[0]);
    }
    return NextResponse.json(null);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
