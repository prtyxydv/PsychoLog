"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const ROLES = ["Psychologist", "Therapist", "Counselor", "Psychiatrist", "Clinical Social Worker", "Other"];
const PLANS = [
  { id: "free", label: "Free", desc: "Up to 5 patients, basic notes", price: "$0/mo" },
  { id: "pro", label: "Pro", desc: "Unlimited patients, session scheduling, email reminders", price: "$19/mo" },
  { id: "clinic", label: "Clinic", desc: "Multi-therapist, admin dashboard, priority support", price: "$49/mo" },
];

export default function WaitlistPage() {
  const [step, setStep] = useState(1); // 1 = form, 2 = success
  const [form, setForm] = useState({ name: "", email: "", role: "", plan: "pro", note: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Fetch waitlist count for social proof
    fetch("/api/waitlist/count")
      .then(r => r.json())
      .then(d => setCount(d.count))
      .catch(() => {});

    // Canvas particle background
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animFrame;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1 + Math.random() * 2,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      o: 0.1 + Math.random() * 0.3,
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.o})`;
        ctx.fill();
      });
      animFrame = requestAnimationFrame(draw);
    }
    draw();
    const hr = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", hr);
    return () => { cancelAnimationFrame(animFrame); window.removeEventListener("resize", hr); };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.role) { setError("Please fill in all required fields."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inp = (field, placeholder, type = "text", required = true) => (
    <input
      type={type}
      placeholder={placeholder + (required ? " *" : "")}
      value={form[field]}
      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      required={required}
      style={{
        width: "100%", padding: "14px 18px", borderRadius: "12px",
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
        color: "#f0f0f5", fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
        transition: "border-color 0.2s ease",
      }}
      onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
    />
  );

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#f0f0f5", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />

      {/* Glow blobs */}
      <div style={{ position: "fixed", top: "-20%", left: "-10%", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-20%", right: "-10%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Nav */}
        <nav style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: "#fff" }}>P</div>
            <span style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em", background: "linear-gradient(90deg, #fff, #a0a0c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PsychoLog</span>
          </Link>
          <Link href="/auth/login" style={{ textDecoration: "none", fontSize: "0.88rem", color: "#888", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#888"}>
            Already have an account →
          </Link>
        </nav>

        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px 80px" }}>
          {step === 1 ? (
            <>
              {/* Hero */}
              <div style={{ textAlign: "center", marginBottom: "60px", animation: "fadeUp 0.7s ease forwards" }}>
                <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: "999px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", fontSize: "0.8rem", fontWeight: 600, color: "#a5b4fc", marginBottom: "24px", letterSpacing: "0.05em" }}>
                  🧠 &nbsp;EARLY ACCESS
                </div>
                <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.05, margin: "0 0 20px" }}>
                  The mental health practice tool<br />
                  <span style={{ background: "linear-gradient(135deg, #a78bfa, #6366f1, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    clinicians actually love.
                  </span>
                </h1>
                <p style={{ fontSize: "1.1rem", color: "#888", maxWidth: "500px", margin: "0 auto 28px", lineHeight: 1.7 }}>
                  Secure patient logs, session scheduling, and AI-assisted insights — built for therapists, by therapists.
                </p>
                {count !== null && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "8px 20px", borderRadius: "999px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <div style={{ display: "flex", gap: "-4px" }}>
                      {["#6366f1","#8b5cf6","#ec4899"].map((c, i) => (
                        <div key={i} style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: "2px solid #050508", marginLeft: i ? "-6px" : 0 }} />
                      ))}
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "#86efac", fontWeight: 600 }}>
                      {count}+ clinicians already waiting
                    </span>
                  </div>
                )}
              </div>

              {/* Plan Picker */}
              <div style={{ marginBottom: "32px", animation: "fadeUp 0.7s 0.1s ease forwards", opacity: 0 }}>
                <p style={{ fontSize: "0.85rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "12px" }}>Choose your plan</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  {PLANS.map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => setForm(f => ({ ...f, plan: plan.id }))}
                      style={{
                        padding: "18px 20px", borderRadius: "14px", textAlign: "left", cursor: "pointer",
                        background: form.plan === plan.id ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                        border: `1.5px solid ${form.plan === plan.id ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.07)"}`,
                        color: "#f0f0f5", transition: "all 0.2s ease",
                        transform: form.plan === plan.id ? "translateY(-2px)" : "none",
                        boxShadow: form.plan === plan.id ? "0 8px 24px rgba(99,102,241,0.2)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontWeight: 700, fontSize: "1rem" }}>{plan.label}</span>
                        <span style={{ fontSize: "0.85rem", color: form.plan === plan.id ? "#a5b4fc" : "#555", fontWeight: 600 }}>{plan.price}</span>
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "#666", margin: 0, lineHeight: 1.4 }}>{plan.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ animation: "fadeUp 0.7s 0.2s ease forwards", opacity: 0 }}>
                <div style={{
                  padding: "36px 40px", borderRadius: "20px",
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(16px)",
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    {inp("name", "Your full name")}
                    {inp("email", "Work email", "email")}
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <select
                      value={form.role}
                      onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                      required
                      style={{
                        width: "100%", padding: "14px 18px", borderRadius: "12px",
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: form.role ? "#f0f0f5" : "#666", fontSize: "0.95rem", outline: "none",
                        appearance: "none", cursor: "pointer", boxSizing: "border-box",
                      }}
                    >
                      <option value="" disabled>Your role *</option>
                      {ROLES.map(r => <option key={r} value={r} style={{ background: "#0a0a1a" }}>{r}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: "24px" }}>
                    <textarea
                      placeholder="Anything specific you'd like to see in PsychoLog? (optional)"
                      value={form.note}
                      onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                      rows={3}
                      style={{
                        width: "100%", padding: "14px 18px", borderRadius: "12px",
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "#f0f0f5", fontSize: "0.95rem", outline: "none", resize: "vertical",
                        boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.2s ease",
                      }}
                      onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                  </div>

                  {error && (
                    <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: "0.88rem", marginBottom: "20px" }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%", padding: "16px", borderRadius: "12px",
                      background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "#fff", fontWeight: 700, fontSize: "1rem", border: "none",
                      cursor: loading ? "not-allowed" : "pointer", letterSpacing: "-0.01em",
                      boxShadow: "0 8px 24px rgba(99,102,241,0.4)", transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    {loading ? "Joining..." : "Join the waitlist →"}
                  </button>
                  <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#444", marginTop: "14px" }}>
                    No credit card needed. We'll email you when a spot opens.
                  </p>
                </div>
              </form>
            </>
          ) : (
            // Success screen
            <div style={{ textAlign: "center", padding: "80px 24px", animation: "fadeUp 0.7s ease forwards" }}>
              <div style={{ fontSize: "5rem", marginBottom: "24px" }}>🎉</div>
              <h2 style={{ fontSize: "2.4rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "16px" }}>
                You're on the list,<br />
                <span style={{ background: "linear-gradient(135deg, #a78bfa, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{form.name.split(" ")[0]}!</span>
              </h2>
              <p style={{ color: "#888", fontSize: "1rem", maxWidth: "380px", margin: "0 auto 40px", lineHeight: 1.7 }}>
                We've received your request for the <strong style={{ color: "#a5b4fc" }}>{PLANS.find(p => p.id === form.plan)?.label}</strong> plan. We'll email <strong style={{ color: "#f0f0f5" }}>{form.email}</strong> as soon as your spot is ready.
              </p>
              <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/auth/login" style={{
                  textDecoration: "none", padding: "14px 32px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
                  fontWeight: 700, fontSize: "0.95rem", boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
                  transition: "all 0.2s ease",
                }}>
                  Log into your account →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder, textarea::placeholder { color: #444; }
        option { background: #0a0a1a; }
      `}</style>
    </div>
  );
}
