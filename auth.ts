import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { compare, hash } from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; image?: string | null; };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      authorize: async (creds) => {
        if (!creds?.email || !creds.password) return null;
        const user = await prisma.user.findUnique({ where: { email: String(creds.email).toLowerCase() } });
        if (!user?.password) return null;
        const ok = await compare(creds.password as string, user.password);
        if (!ok) return null;
        return { id: user.id, name: user.name ?? "", email: user.email ?? "" };
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => { if (user) token.id = (user as any).id; return token; },
    session: async ({ session, token }) => { if (session.user && token?.id) (session.user as any).id = token.id as string; return session; }
  }
});

export async function createUser({ name, email, password }:{ name: string; email: string; password: string; }) {
  const hashed = await hash(password, 10);
  return prisma.user.create({ data: { name, email: email.toLowerCase(), password: hashed } });
}
