import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    DIRECT_URL: Boolean(process.env.DIRECT_URL),
    AUTH_SECRET: Boolean(process.env.AUTH_SECRET),
    AUTH_TRUST_HOST: Boolean(process.env.AUTH_TRUST_HOST),
    NEXT_PUBLIC_SITE_URL: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
  };

  let db: { ok: boolean; count?: number; error?: string } = { ok: false };
  try {
    const count = await prisma.property.count();
    db = { ok: true, count };
  } catch (e) {
    db = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json(
    { env, db, region: process.env.VERCEL_REGION ?? null },
    { status: db.ok ? 200 : 503 },
  );
}
