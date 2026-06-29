"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackClient() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const supabase = createClient();

    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      // Exchange the PKCE code for a real session
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else if (data?.session) {
          // Session confirmed — hard reload to screensaver so server reads fresh cookie
          window.location.replace("/");
        } else {
          setError("Session exchange failed. Please try logging in again.");
        }
      });
    } else {
      // No code param — maybe a hash-based flow, try getSession
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          setError(error.message);
        } else if (session) {
          window.location.replace("/");
        } else {
          setError("No authentication code found. Please try logging in again.");
        }
      });
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", color: "#fff" }}>
      {error ? (
        <div style={{ textAlign: "center", maxWidth: 400, padding: "32px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ color: "#ef4444", marginBottom: "12px" }}>Login Failed</h2>
          <p style={{ color: "#888", marginBottom: "24px" }}>{error}</p>
          <button
            onClick={() => window.location.href = "/auth/login"}
            style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 24px", cursor: "pointer", fontSize: "1rem" }}
          >
            Return to Login
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "20px" }}>🔐</div>
          <h2 style={{ fontWeight: 700, marginBottom: "8px" }}>Securing your session...</h2>
          <p style={{ color: "#888" }}>Just a moment, you will be redirected shortly.</p>
        </div>
      )}
    </div>
  );
}
