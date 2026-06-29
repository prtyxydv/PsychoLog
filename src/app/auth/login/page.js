"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PsychologLogo from "@/components/ui/PsychologLogo";

export default function LoginPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("psycholog-theme");
    const dark = stored === "dark";
    setIsDark(dark);
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("psycholog-theme", isDark ? "dark" : "light");
  }, [isDark]);

  async function handleEmailLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      background: "var(--th-bg)",
    }}>
      {/* ── Left panel: branding ── */}
      <div style={{
        display: "none",
        flex: 1,
        background: "linear-gradient(160deg, #0d9488 0%, #0a7a70 50%, #064e3b 100%)",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px",
        position: "relative",
        overflow: "hidden",
      }}
        className="auth-left-panel"
      >
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "300px", height: "300px", borderRadius: "50%",
          background: "rgba(255,255,255,0.06)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", left: "-60px",
          width: "240px", height: "240px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", color: "white", maxWidth: "400px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
              color: "white"
            }}>
              <PsychologLogo size={30} />
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.03em" }}>PsychoLog</span>
          </div>

          <h2 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.2, marginBottom: "16px" }}>
            Secure. Intelligent.<br />Built for therapists.
          </h2>
          <p style={{ fontSize: "1rem", opacity: 0.8, lineHeight: 1.7, marginBottom: "40px" }}>
            AI-powered session summaries, real-time crisis alerts, and encrypted clinical notes — all in one place.
          </p>

          {["AI session summaries ready before every appointment", "Real-time crisis alerts sent directly to your inbox", "Clinical-grade privacy with Row Level Security"].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "14px" }}>
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%",
                background: "rgba(255,255,255,0.2)", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 700, marginTop: "1px",
              }}>✓</div>
              <span style={{ fontSize: "0.9rem", opacity: 0.85, lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
        background: "var(--th-bg)",
        position: "relative"
      }}>
        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          style={{
            position: "absolute", top: "24px", right: "24px",
            background: "var(--th-bg-secondary)", border: "1px solid var(--th-border)",
            borderRadius: "50%", width: "40px", height: "40px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: "1.2rem",
            boxShadow: "var(--th-shadow-sm)", transition: "all 0.15s"
          }}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        <div style={{ width: "100%", maxWidth: "400px" }}>
          {/* Mobile logo (shown only when left panel is hidden) */}
          <div className="auth-mobile-logo" style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              marginBottom: "4px",
            }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "10px",
                background: "linear-gradient(135deg, #0d9488, #2dd4bf)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(13,148,136,0.3)",
                color: "white"
              }}>
                <PsychologLogo size={26} />
              </div>
              <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.025em", color: "var(--th-text)" }}>PsychoLog</span>
            </div>
          </div>

          <h1 style={{ fontSize: "1.65rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--th-text)", marginBottom: "6px" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--th-text-subtle)", marginBottom: "28px" }}>
            Sign in to your therapist account
          </p>

          {/* Google OAuth */}
          <button
            id="btn-google-login"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: "10px", padding: "11px 20px",
              background: "var(--th-bg)", border: "1.5px solid var(--th-border)",
              borderRadius: "10px", fontSize: "0.875rem", fontWeight: 600,
              color: "var(--th-text)", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
              marginBottom: "20px", fontFamily: "Inter, sans-serif",
              boxShadow: "var(--th-shadow-sm)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--th-accent)"; e.currentTarget.style.background = "var(--th-bg-secondary)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--th-border)"; e.currentTarget.style.background = "var(--th-bg)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--th-border)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--th-text-subtle)", fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "var(--th-border)" }} />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "10px 14px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
              borderRadius: "8px", fontSize: "0.8125rem", color: "#ef4444", marginBottom: "16px",
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label htmlFor="login-email" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--th-text)", marginBottom: "6px" }}>
                Email address
              </label>
              <input
                id="login-email" type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@clinic.com"
                style={{
                  width: "100%", padding: "10px 13px",
                  background: "var(--th-bg-secondary)", border: "1.5px solid var(--th-border)",
                  borderRadius: "8px", fontSize: "0.875rem", color: "var(--th-text)",
                  outline: "none", fontFamily: "Inter, sans-serif",
                  transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s", boxSizing: "border-box",
                }}
                onFocus={e => { e.target.style.borderColor = "var(--th-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--th-accent-soft)"; e.target.style.background = "var(--th-bg)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--th-border)"; e.target.style.boxShadow = "none"; e.target.style.background = "var(--th-bg-secondary)"; }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label htmlFor="login-password" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--th-text)" }}>
                  Password
                </label>
                <button type="button" style={{ fontSize: "0.75rem", color: "var(--th-accent)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                  Forgot password?
                </button>
              </div>
              <input
                id="login-password" type="password" required autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "10px 13px",
                  background: "var(--th-bg-secondary)", border: "1.5px solid var(--th-border)",
                  borderRadius: "8px", fontSize: "0.875rem", color: "var(--th-text)",
                  outline: "none", fontFamily: "Inter, sans-serif",
                  transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s", boxSizing: "border-box",
                }}
                onFocus={e => { e.target.style.borderColor = "var(--th-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--th-accent-soft)"; e.target.style.background = "var(--th-bg)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--th-border)"; e.target.style.boxShadow = "none"; e.target.style.background = "var(--th-bg-secondary)"; }}
              />
            </div>

            <button
              id="btn-email-login" type="submit" disabled={loading}
              style={{
                width: "100%", padding: "12px",
                background: loading ? "var(--th-border)" : "#0d9488",
                color: "white", border: "none", borderRadius: "10px",
                fontSize: "0.9rem", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "background 0.15s, transform 0.1s, box-shadow 0.15s",
                boxShadow: loading ? "none" : "0 2px 8px rgba(13,148,136,0.3)",
                marginTop: "4px",
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#0a7a70"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(13,148,136,0.35)"; }}}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = "#0d9488"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(13,148,136,0.3)"; }}}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--th-text-subtle)", marginTop: "24px" }}>
            No account?{" "}
            <Link href="/auth/signup" style={{ color: "var(--th-accent)", fontWeight: 600, textDecoration: "none" }}>
              Create one →
            </Link>
          </p>

          <p style={{ textAlign: "center", fontSize: "0.72rem", color: "var(--th-text-muted)", marginTop: "32px" }}>
            For licensed mental health professionals only.
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .auth-left-panel { display: flex !important; }
          .auth-mobile-logo { display: none !important; }
        }
        @media (max-width: 767px) {
          .auth-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
}
