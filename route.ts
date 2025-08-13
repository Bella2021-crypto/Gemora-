import { NextResponse } from "next/server";
import { createUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Missing" }, { status: 400 });
  const exists = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (exists) return NextResponse.json({ error: "Email in use" }, { status: 400 });
  await createUser({ name, email, password });
  return NextResponse.json({ ok: true });
}
