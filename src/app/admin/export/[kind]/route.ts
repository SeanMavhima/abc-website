import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";

const EXPORTS = {
  contact: {
    table: "contact_submissions",
    columns: ["created_at", "status", "name", "email", "organisation", "subject", "message"],
  },
  volunteer: {
    table: "volunteer_applications",
    columns: ["created_at", "status", "name", "email", "phone", "location", "interest", "organisation", "availability", "experience", "message"],
  },
  newsletter: { table: "newsletter_subscribers", columns: ["created_at", "status", "email"] },
} as const;

/** Escapes a CSV cell, and neutralises spreadsheet formula injection. */
function cell(value: unknown) {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const cfg = EXPORTS[kind as keyof typeof EXPORTS];
  if (!cfg) return NextResponse.json({ error: "Unknown export" }, { status: 404 });

  let q = session.supabase.from(cfg.table).select(cfg.columns.join(",")).order("created_at", { ascending: false });
  const status = request.nextUrl.searchParams.get("status");
  if (status && /^[a-z]+$/.test(status)) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const csv = [cfg.columns.join(","), ...rows.map((r) => cfg.columns.map((c) => cell(r[c])).join(","))].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="abc-${kind}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
