"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { HELPLINES } from "@/lib/crisisDetector";
import PsychologLogo from "@/components/ui/PsychologLogo";

// Dynamically import LogForm so PIN gate loads fast
const LogForm = dynamic(() => import("@/components/ui/LogForm"), { ssr: false });

/* ── PIN digit input ──────────────────────────────────────── */
function PinInput({ value, onChange, disabled }) {
  const inputs = useRef([]);

  function handleKey(i, e) {
    if (e.key === "Backspace" && !value[i] && i > 0) inputs.current[i - 1]?.focus();
  }

  function handleChange(i, e) {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const next  = value.split("");
    next[i]     = digit;
    onChange(next.join(""));
    if (digit && i < 3) inputs.current[i + 1]?.focus();
  }

  return (
    <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
      {[0, 1, 2, 3].map(i => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          id={`pin-digit-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          disabled={disabled}
          style={{
            width: "56px", height: "64px",
            textAlign: "center", fontSize: "1.8rem", fontWeight: 700,
            background: "var(--pt-glass)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: value[i]
              ? "2px solid var(--pt-teal)"
              : "1.5px solid var(--pt-glass-border)",
            borderRadius: "var(--radius-lg)",
            color: "var(--pt-text)", outline: "none",
            fontFamily: "DM Sans, sans-serif",
            boxShadow: value[i] ? "var(--pt-glow)" : "none",
            transition: "border-color var(--duration-fast) var(--ease-calm), box-shadow var(--duration-fast) var(--ease-calm)",
          }}
          onFocus={e => { e.target.style.borderColor = "var(--pt-teal)"; }}
          onBlur={e => { if (!value[i]) e.target.style.borderColor = "var(--pt-glass-border)"; }}
        />
      ))}
    </div>
  );
}

/* ── Helplines sheet ──────────────────────────────────────── */
function HelpSheet({ onClose }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="animate-fade-in-up glass-strong"
        style={{ width: "100%", maxWidth: "480px", padding: "28px 24px 44px", maxHeight: "80vh", overflowY: "auto" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--pt-text)" }}>
            Crisis Resources
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--pt-text-muted)" }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {HELPLINES.map(h => (
            <div key={h.name} style={{ padding: "12px 16px", background: "var(--pt-accent-soft)", border: "1px solid var(--pt-glass-border)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "var(--pt-text)", margin: 0 }}>{h.name}</p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.72rem", color: "var(--pt-text-muted)", margin: "3px 0 0" }}>{h.country} · {h.hours}</p>
                </div>
                <a href={`tel:${h.number.replace(/\s/g, "")}`} style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--pt-teal)", textDecoration: "none", padding: "4px 12px", background: "var(--pt-seafoam-soft)", borderRadius: "999px" }}>
                  {h.number}
                </a>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.72rem", color: "var(--pt-text-subtle)", textAlign: "center", marginTop: "20px" }}>
          In an emergency call your local emergency number immediately.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   LOG PAGE — token gate → PIN → form
══════════════════════════════════════════════════════════ */
function LogPageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [phase, setPhase]           = useState("loading");
  const [patientInfo, setPatient]   = useState(null);
  const [pin, setPin]               = useState("");
  const [pinError, setPinError]     = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [showHelp, setShowHelp]     = useState(false);
  const [sessionToken, setSession]  = useState(null);
  const [consentGiven, setConsent]  = useState(false);
  const [consentChecks, setChecks]  = useState({ notTherapy: false, dataUse: false, voluntary: false });

  useEffect(() => {
    if (!token) { setPhase("invalid"); return; }

    const stored = sessionStorage.getItem(`pl_session_${token}`);

    fetch(`/api/validate-token?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (!data.valid) { setPhase(data.expired ? "expired" : "invalid"); return; }
        setPatient(data);
        if (stored) { setSession(stored); setPhase("ready"); return; }
        if (data.hasConsented) {
          setPhase(data.hasPinSet ? "pin-verify" : "pin-set");
        } else {
          setPhase("consent");
        }
      })
      .catch(() => setPhase("invalid"));
  }, [token]);

  async function handlePin() {
    if (pin.length !== 4) { setPinError("Please enter all 4 digits."); return; }
    setPinLoading(true);
    setPinError("");
    const method = phase === "pin-set" ? "POST" : "PUT";
    try {
      const res  = await fetch("/api/pin", {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, pin }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPinError(data.error || "Incorrect PIN. Try again.");
        setPin(""); setPinLoading(false); return;
      }
      sessionStorage.setItem(`pl_session_${token}`, data.sessionToken);
      setSession(data.sessionToken);
      setPhase("ready");
    } catch {
      setPinError("Network error. Please try again.");
    }
    setPinLoading(false);
  }

  const oceanBg   = <div className="ocean-bg" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
  const navHeader = (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <PsychologLogo size={18} style={{ color: "var(--pt-accent)" }} />
        <span style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--pt-text)" }}>PsychoLog</span>
      </div>
      <button id="btn-need-help" onClick={() => setShowHelp(true)} style={{ background: "var(--pt-glass)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid var(--pt-glass-border)", borderRadius: "999px", padding: "6px 14px", fontSize: "0.75rem", fontWeight: 600, color: "var(--pt-text-muted)", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
        Need help?
      </button>
    </div>
  );

  /* Loading */
  if (phase === "loading") return (
    <div className="min-h-screen patient-view" style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      {oceanBg}
      <div className="animate-breath glass" style={{ padding: "40px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
          <PsychologLogo size={32} style={{ color: "var(--pt-accent)" }} />
        </div>
        <p style={{ fontFamily: "DM Sans, sans-serif", color: "var(--pt-text-muted)", fontSize: "0.9rem" }}>Just a moment…</p>
      </div>
    </div>
  );

  /* Invalid / expired */
  if (phase === "invalid" || phase === "expired") return (
    <div className="min-h-screen patient-view" style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "40px 20px" }}>
      {oceanBg}
      <div className="animate-fade-in glass-strong" style={{ maxWidth: "380px", width: "100%", padding: "40px 32px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>{phase === "expired" ? "⏰" : "🔗"}</div>
        <h1 style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--pt-text)", marginBottom: "12px" }}>
          {phase === "expired" ? "Link has expired" : "Invalid link"}
        </h1>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.875rem", color: "var(--pt-text-muted)", lineHeight: 1.7 }}>
          {phase === "expired"
            ? "This link has passed its expiry date. Please contact your therapist for a new invite."
            : "This link doesn't appear to be valid. Please check the link in your email or contact your therapist."}
        </p>
      </div>
    </div>
  );

  /* ── Informed Consent Gate ──────────────────────────────── */
  if (phase === "consent") {
    const allChecked = consentChecks.notTherapy && consentChecks.dataUse && consentChecks.voluntary;
    return (
      <div className="min-h-screen patient-view" style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "40px 20px" }}>
        {oceanBg}
        {navHeader}
        <div className="animate-fade-in glass-strong" style={{ maxWidth: "460px", width: "100%", padding: "40px 32px", position: "relative", zIndex: 1, marginTop: "60px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📋</div>
            <h1 style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--pt-text)", marginBottom: "8px" }}>Before you begin</h1>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.82rem", color: "var(--pt-text-muted)", lineHeight: 1.7 }}>
              Please read and agree to the following before accessing your check-in.
            </p>
          </div>

          {/* Legal disclaimer box */}
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "var(--radius-md)", padding: "14px 16px", marginBottom: "20px" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.78rem", color: "var(--pt-text)", lineHeight: 1.7, margin: 0 }}>
              ⚠️ <strong>Not a substitute for professional care.</strong> PsychoLog is a documentation and check-in tool only. It does not provide therapy, medical advice, or clinical diagnosis. In a mental health emergency, contact <strong>988 (Suicide & Crisis Lifeline)</strong> or your local emergency services immediately.
            </p>
          </div>

          {/* Consent checkboxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" }}>
            {[
              { key: "notTherapy", text: "I understand that PsychoLog is not therapy and does not replace the advice of a licensed mental health professional." },
              { key: "dataUse",    text: "I consent to my anonymized check-in responses being securely stored and shared only with my therapist for session preparation." },
              { key: "voluntary",  text: "I am participating voluntarily and understand I may stop using this service at any time without penalty." },
            ].map(({ key, text }) => (
              <label key={key} style={{ display: "flex", gap: "12px", alignItems: "flex-start", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={consentChecks[key]}
                  onChange={e => setChecks(prev => ({ ...prev, [key]: e.target.checked }))}
                  style={{ width: "18px", height: "18px", marginTop: "2px", accentColor: "var(--pt-teal)", flexShrink: 0 }}
                />
                <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.82rem", color: "var(--pt-text)", lineHeight: 1.6 }}>{text}</span>
              </label>
            ))}
          </div>

          <button
            disabled={!allChecked}
            onClick={async () => {
              try {
                await fetch("/api/log/consent", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ token }),
                });
              } catch (e) {
                console.error("Consent save failed:", e);
              }
              setConsent(true);
              setPhase(patientInfo?.hasPinSet ? "pin-verify" : "pin-set");
            }}
            style={{
              width: "100%", padding: "13px", borderRadius: "var(--radius-lg)",
              border: "none", cursor: allChecked ? "pointer" : "not-allowed",
              background: allChecked ? "var(--pt-teal)" : "rgba(255,255,255,0.1)",
              color: allChecked ? "white" : "var(--pt-text-subtle)",
              fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: "0.95rem",
              transition: "background 0.2s",
            }}
          >
            I Agree — Continue to Check-in
          </button>

          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.7rem", color: "var(--pt-text-subtle)", textAlign: "center", marginTop: "14px", lineHeight: 1.6 }}>
            By continuing you confirm you have read and accepted the above. Your data is encrypted and only accessible by your therapist.
          </p>
        </div>
      </div>
    );
  }

  /* PIN gate */
  if (phase === "pin-set" || phase === "pin-verify") {
    const isSet = phase === "pin-set";
    return (
      <div className="min-h-screen patient-view" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px" }}>
        {oceanBg}{navHeader}
        <div className="animate-fade-in-up glass-strong" style={{ width: "100%", maxWidth: "360px", padding: "40px 32px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="animate-breath-soft" style={{ fontSize: "2.5rem", marginBottom: "20px" }}>
            {isSet ? "🔐" : "👋"}
          </div>
          <h1 style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--pt-text)", marginBottom: "8px" }}>
            {isSet ? "Create your PIN" : "Welcome back"}
          </h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.875rem", color: "var(--pt-text-muted)", marginBottom: "32px", lineHeight: 1.6 }}>
            {isSet
              ? "Choose a 4-digit PIN to keep your check-ins private."
              : "Enter your 4-digit PIN to continue."}
          </p>
          <PinInput value={pin} onChange={setPin} disabled={pinLoading} />
          {pinError && (
            <p className="animate-fade-in" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.8rem", color: "var(--crisis-red)", marginTop: "14px" }}>
              {pinError}
            </p>
          )}
          <button id="btn-submit-pin" onClick={handlePin} disabled={pin.length < 4 || pinLoading} className="btn-pt-primary" style={{ width: "100%", marginTop: "28px", opacity: pin.length < 4 || pinLoading ? 0.5 : 1, cursor: pin.length < 4 || pinLoading ? "not-allowed" : "pointer" }}>
            {pinLoading ? "Checking…" : isSet ? "Set PIN →" : "Continue →"}
          </button>
          {!isSet && (
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.75rem", color: "var(--pt-text-subtle)", marginTop: "16px" }}>
              Forgot your PIN? Contact your therapist.
            </p>
          )}
        </div>
        <div className="safety-banner">
          ⚠️ This is an administrative check-in tool, not a crisis service.
          In an emergency call your local emergency number.
        </div>
        {showHelp && <HelpSheet onClose={() => setShowHelp(false)} />}
      </div>
    );
  }

  /* Log form */
  if (phase === "ready") {
    return (
      <div className="min-h-screen patient-view" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px" }}>
        {oceanBg}{navHeader}
        <div style={{ width: "100%", maxWidth: "600px", position: "relative", zIndex: 1 }}>
          <LogForm
            token={token}
            patientId={patientInfo?.patientId}
            sessionToken={sessionToken}
          />
        </div>
        <div className="safety-banner">
          ⚠️ This is an administrative check-in tool, not a crisis service.
          In an emergency call your local emergency number.
        </div>
        {showHelp && <HelpSheet onClose={() => setShowHelp(false)} />}
      </div>
    );
  }

  return null;
}

export default function LogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen patient-view" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-breath glass" style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ fontFamily: "DM Sans, sans-serif", color: "var(--pt-text-muted)" }}>Loading…</p>
        </div>
      </div>
    }>
      <LogPageInner />
    </Suspense>
  );
}
