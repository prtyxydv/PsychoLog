import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata = {
  title: "Admin Panel - PsychoLog",
};

export default async function AdminLayout({ children }) {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // 1. Verify user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--th-bg)", color: "var(--th-text)" }}>
      <header style={{ padding: "20px 40px", borderBottom: "1px solid var(--th-sidebar-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
          <span>🧠</span> PsychoLog <span style={{ padding: "4px 8px", background: "var(--th-accent)", color: "#000", fontSize: "0.7rem", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 800 }}>Master Admin</span>
        </div>
        <Link href="/dashboard" style={{ color: "var(--th-text-subtle)", fontSize: "0.9rem", textDecoration: "none" }}>
          ← Back to Dashboard
        </Link>
      </header>
      <main style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
}
