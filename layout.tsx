import "./globals.css";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export const metadata = { title: "Gemora", description: "Community marketplace - buy & sell fashion" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en">
      <body>
        <header className="border-b">
          <div className="container flex items-center gap-4 h-16">
            <Link href="/" className="font-semibold">Gemora</Link>
            <nav className="ml-auto flex items-center gap-3">
              <Link href="/sell" className="btn btn-primary">Sell</Link>
              {session?.user && <Link href="/dashboard" className="btn">Dashboard</Link>}
              {session?.user ? (
                <form action={async () => { "use server"; await signOut(); }}>
                  <button className="btn" type="submit">Logout</button>
                </form>
              ) : (
                <Link href="/login" className="btn">Login</Link>
              )}
            </nav>
          </div>
        </header>
        <main className="container py-6">{children}</main>
        <footer className="border-t py-6 mt-10">
          <div className="container text-sm">© {new Date().getFullYear()} Gemora</div>
        </footer>
      </body>
    </html>
  );
}
