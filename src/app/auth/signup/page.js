"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  async function handleEmailSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess(true); setLoading(false); }
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  /* ── Success state ── */
  if (success) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#fdfcfb", fontFamily: "Inter, sans-serif", padding: "40px 20px",
      }}>
        <div style={{
          background: "#fff", border: "1px solid #e8e4df", borderRadius: "16px",
          padding: "48px 40px", maxWidth: "420px", width: "100%",
          textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>📬</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1714", marginBottom: "12px", letterSpacing: "-0.025em" }}>
            Check your inbox
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#6b6560", lineHeight: 1.7 }}>
            We sent a confirmation link to{" "}
            <strong style={{ color: "#1a1714" }}>{email}</strong>.
            Click it to activate your account and get started.
          </p>
          <Link href="/auth/login" style={{
            display: "inline-block", marginTop: "24px", color: "#0d9488", fontWeight: 600, fontSize: "0.875rem",
          }}>
            Back to Sign In →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      background: "#fdfcfb",
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}>
              <Image src="/logo.svg" alt="PsychoLog" width={30} height={30} style={{ filter: "brightness(0) invert(1)" }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.03em" }}>PsychoLog</span>
          </div>

          <h2 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.2, marginBottom: "16px" }}>
            Join 100+ therapists<br />on the waitlist.
          </h2>
          <p style={{ fontSize: "1rem", opacity: 0.8, lineHeight: 1.7, marginBottom: "40px" }}>
            Free during beta. No credit card required. Start documenting smarter from day one.
          </p>

          {["Up to 5 active patients — free forever in beta", "AI summaries generated from every check-in", "Instant crisis alerts before your next session"].map(t => (
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
        padding: "40px 24px", background: "#fdfcfb",
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          {/* Mobile logo */}
          <div className="auth-mobile-logo" style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "10px",
                background: "linear-gradient(135deg, #0d9488, #2dd4bf)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(13,148,136,0.3)",
              }}>
                <Image src="/logo.svg" alt="PsychoLog" width={26} height={26} style={{ filter: "brightness(0) invert(1)" }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.025em", color: "#1a1714" }}>PsychoLog</span>
            </div>
          </div>

          <h1 style={{ fontSize: "1.65rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#1a1714", marginBottom: "6px" }}>
            Create your account
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#6b6560", marginBottom: "28px" }}>
            For licensed therapists only · Free during beta
          </p>

          {/* Google OAuth */}
          <button
            id="btn-google-signup"
            onClick={handleGoogleSignup}
            disabled={loading}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: "10px", padding: "11px 20px",
              background: "#fff", border: "1.5px solid #e8e4df",
              borderRadius: "10px", fontSize: "0.875rem", fontWeight: 600,
              color: "#1a1714", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "border-color 0.15s, box-shadow 0.15s",
              marginBottom: "20px", fontFamily: "Inter, sans-serif",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#0d9488"; e.currentTarget.style.boxShadow = "0 0 0 3px #f0fdf9"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e4df"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}
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
            <div style={{ flex: 1, height: "1px", background: "#e8e4df" }} />
            <span style={{ fontSize: "0.75rem", color: "#a39d97", fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#e8e4df" }} />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: "8px", fontSize: "0.8125rem", color: "#DC2626", marginBottom: "16px",
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSignup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { id: "signup-name", label: "Full name", type: "text", value: fullName, setter: setFullName, placeholder: "Dr. Jane Smith", autoComplete: "name" },
              { id: "signup-email", label: "Email address", type: "email", value: email, setter: setEmail, placeholder: "you@clinic.com", autoComplete: "email" },
              { id: "signup-password", label: "Password", type: "password", value: password, setter: setPassword, placeholder: "At least 8 characters", autoComplete: "new-password" },
            ].map(({ id, label, type, value, setter, placeholder, autoComplete }) => (
              <div key={id}>
                <label htmlFor={id} style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#1a1714", marginBottom: "6px" }}>
                  {label}
                </label>
                <input
                  id={id} type={type} required autoComplete={autoComplete}
                  value={value} onChange={e => setter(e.target.value)}
                  placeholder={placeholder}
                  minLength={type === "password" ? 8 : undefined}
                  style={{
                    width: "100%", padding: "10px 13px",
                    background: "#f8f7f5", border: "1.5px solid #e8e4df",
                    borderRadius: "8px", fontSize: "0.875rem", color: "#1a1714",
                    outline: "none", fontFamily: "Inter, sans-serif",
                    transition: "border-color 0.15s, box-shadow 0.15s", boxSizing: "border-box",
                  }}
                  onFocus={e => { e.target.style.borderColor = "#0d9488"; e.target.style.boxShadow = "0 0 0 3px #f0fdf9"; e.target.style.background = "#fff"; }}
                  onBlur={e => { e.target.style.borderColor = "#e8e4df"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8f7f5"; }}
                />
              </div>
            ))}

            <button
              id="btn-email-signup" type="submit" disabled={loading}
              style={{
                width: "100%", padding: "12px",
                background: loading ? "#6b6560" : "#0d9488",
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
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>

          <p style={{ fontSize: "0.72rem", color: "#a39d97", textAlign: "center", marginTop: "16px", lineHeight: 1.6 }}>
            By creating an account you confirm you are a licensed mental health professional.
          </p>

          <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "#6b6560", marginTop: "20px" }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "#0d9488", fontWeight: 600, textDecoration: "none" }}>
              Sign in →
            </Link>
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
