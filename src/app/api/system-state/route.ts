import { NextResponse } from "next/server";
import { query } from "@/utils/db";

export async function GET() {
  try {
    const res = await query("SELECT key, value FROM system_state");
    const state: Record<string, string> = {};
    res.rows.forEach((row) => {
      state[row.key] = row.value;
    });

    return NextResponse.json({
      emergencyActive: state.emergency_active === "true",
      helpStatus: state.help_status || "idle",
      refillStatus: state.refill_status || "idle",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { emergencyActive, helpStatus, refillStatus } = await request.json();

    if (emergencyActive !== undefined) {
      await query("INSERT INTO system_state (key, value) VALUES ('emergency_active', $1) ON CONFLICT (key) DO UPDATE SET value = $1", [
        emergencyActive ? "true" : "false",
      ]);
    }
    if (helpStatus !== undefined) {
      await query("INSERT INTO system_state (key, value) VALUES ('help_status', $1) ON CONFLICT (key) DO UPDATE SET value = $1", [
        helpStatus,
      ]);
    }
    if (refillStatus !== undefined) {
      await query("INSERT INTO system_state (key, value) VALUES ('refill_status', $1) ON CONFLICT (key) DO UPDATE SET value = $1", [
        refillStatus,
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
