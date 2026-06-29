"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthCallbackClient() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Check if we have a session. Supabase JS will automatically parse the hash 
    // fragment and set the session in localStorage and document.cookie.
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error.message);
      } else if (session) {
        // Session is set! Force a full hard reload to the home page
        // so the server picks up the fresh cookies.
        window.location.href = "/";
      } else {
        setError("No session found. Please try logging in again.");
      }
    });
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--th-bg)", color: "var(--th-text)" }}>
      {error ? (
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "var(--th-unread)", marginBottom: "16px" }}>Authentication Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.href = "/auth/login"} className="btn-th-primary" style={{ marginTop: "24px" }}>
            Return to Login
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "16px", animation: "spin 1s linear infinite" }}>⏳</div>
          <h2>Securing your session...</h2>
        </div>
      )}
    </div>
  );
}
