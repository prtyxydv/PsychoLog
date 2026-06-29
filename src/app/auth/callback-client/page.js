"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackClient() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    const code = new URLSearchParams(window.location.search).get("code");

    async function checkUserSession(session) {
      if (!session?.user?.email) {
        setError("Unable to retrieve email from session.");
        return;
      }
      try {
        const wlRes = await fetch("/api/waitlist/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        const wlData = await wlRes.json();

        if (!wlRes.ok || !wlData.approved) {
          // Immediately sign out to clear session cookies
          await supabase.auth.signOut();
          setError(`The email address '${session.user.email}' is not approved on the waitlist. Please register at /waitlist first.`);
          return;
        }

        // Approved — redirect to homepage
        window.location.replace("/");
      } catch (err) {
        await supabase.auth.signOut();
        setError("Error verifying waitlist status. Please try logging in again.");
      }
    }

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else if (data?.session) {
          checkUserSession(data.session);
        } else {
          setError("Session exchange failed. Please try logging in again.");
        }
      });
    } else {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          setError(error.message);
        } else if (session) {
          checkUserSession(session);
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
