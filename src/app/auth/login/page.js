"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleEmailLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center therapist-view"
      style={{ background: "var(--th-bg)", padding: "40px 20px" }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div className="animate-fade-in" style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, var(--th-accent), #FCD34D)",
              fontSize: "22px",
              marginBottom: "16px",
            }}
          >
            🧠
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "var(--th-text)",
              marginBottom: "6px",
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--th-text-muted)" }}>
            Sign in to your PsychoLog account
          </p>
        </div>

        {/* Card */}
        <div
          className="animate-fade-in-up th-card"
          style={{ padding: "32px", animationDelay: "100ms" }}
        >
          {/* Google OAuth */}
          <button
            id="btn-google-login"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "11px 20px",
              background: "var(--th-surface)",
              border: "1px solid var(--th-border)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--th-text)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "background var(--duration-fast) var(--ease-calm), border-color var(--duration-fast) var(--ease-calm)",
              marginBottom: "20px",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--th-bg-secondary)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--th-surface)"; }}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "var(--th-border)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--th-text-subtle)", fontWeight: 500 }}>
              or
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--th-border)" }} />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8125rem",
                color: "#DC2626",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label
                htmlFor="login-email"
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--th-text)",
                  marginBottom: "6px",
                }}
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@clinic.com"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "var(--th-bg-secondary)",
                  border: "1px solid var(--th-border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.875rem",
                  color: "var(--th-text)",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                  transition: "border-color var(--duration-fast) var(--ease-calm), box-shadow var(--duration-fast) var(--ease-calm)",
                  boxSizing: "border-box",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "var(--th-accent)";
                  e.target.style.boxShadow = "0 0 0 3px var(--th-accent-soft)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "var(--th-border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label
                  htmlFor="login-password"
                  style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--th-text)" }}
                >
                  Password
                </label>
                <button
                  type="button"
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--th-accent)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "var(--th-bg-secondary)",
                  border: "1px solid var(--th-border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.875rem",
                  color: "var(--th-text)",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                  transition: "border-color var(--duration-fast) var(--ease-calm), box-shadow var(--duration-fast) var(--ease-calm)",
                  boxSizing: "border-box",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "var(--th-accent)";
                  e.target.style.boxShadow = "0 0 0 3px var(--th-accent-soft)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "var(--th-border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              id="btn-email-login"
              type="submit"
              disabled={loading}
              className="btn-th-primary"
              style={{
                width: "100%",
                padding: "11px",
                fontSize: "0.875rem",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "4px",
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p
          className="animate-fade-in"
          style={{
            textAlign: "center",
            fontSize: "0.8125rem",
            color: "var(--th-text-muted)",
            marginTop: "20px",
            animationDelay: "200ms",
          }}
        >
          No account?{" "}
          <Link
            href="/auth/signup"
            style={{ color: "var(--th-accent)", fontWeight: 500, textDecoration: "none" }}
          >
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}
