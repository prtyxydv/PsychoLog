"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function HomeClient({ profile, unreadPatients, upcomingSessions }) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());
  const canvasRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTime(new Date()), 1000);

    // Subtle floating orbs animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animFrame;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const orbs = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 180 + Math.random() * 220,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      hue: [210, 250, 170, 290, 230, 190][i],
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      orbs.forEach((o) => {
        o.x += o.dx;
        o.y += o.dy;
        if (o.x < -o.r) o.x = W + o.r;
        if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r;
        if (o.y > H + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},60%,55%,0.07)`);
        g.addColorStop(1, `hsla(${o.hue},60%,55%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });
      animFrame = requestAnimationFrame(draw);
    }
    draw();

    const handleResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] ?? "Doctor";

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return { text: "Good morning", emoji: "☀️" };
    if (h < 17) return { text: "Good afternoon", emoji: "🌤️" };
    return { text: "Good evening", emoji: "🌙" };
  }

  const greeting = getGreeting();
  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const ampm = time.getHours() >= 12 ? "PM" : "AM";
  const displayHour = (time.getHours() % 12 || 12).toString().padStart(2, "0");

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#f0f0f5", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" }}>
      {/* Animated canvas background */}
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      {/* Noise texture overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Top Nav */}
        <nav style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800 }}>P</div>
            <span style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em", background: "linear-gradient(90deg, #fff, #a0a0c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PsychoLog</span>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "#666", marginRight: "4px" }}>
              {profile?.full_name}
            </span>
            <Link
              href="/dashboard"
              style={{
                textDecoration: "none", padding: "10px 22px", fontSize: "0.88rem", fontWeight: 600,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
                borderRadius: "10px", letterSpacing: "-0.01em", transition: "all 0.2s ease",
                boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              Open Workspace →
            </Link>
          </div>
        </nav>

        {/* Hero: Greeting + Clock */}
        <div style={{ padding: "60px 48px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", maxWidth: "1300px", margin: "0 auto" }}>
          {/* Left: Greeting */}
          <div style={{ animation: "fadeUp 0.6s ease forwards" }}>
            <div style={{ fontSize: "0.9rem", color: "#6366f1", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
              {greeting.emoji} &nbsp;{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, margin: 0 }}>
              {greeting.text},<br />
              <span style={{ background: "linear-gradient(135deg, #a78bfa, #6366f1, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Dr. {firstName}.
              </span>
            </h1>
            <p style={{ marginTop: "16px", color: "#888", fontSize: "1rem", maxWidth: "380px", lineHeight: 1.6 }}>
              {upcomingSessions.length === 0
                ? "You have no sessions scheduled today. Time to catch up on notes."
                : `You have ${upcomingSessions.length} upcoming session${upcomingSessions.length > 1 ? "s" : ""}. Let's have a great day.`}
            </p>
          </div>

          {/* Right: Live Clock */}
          <div style={{ textAlign: "right", animation: "fadeUp 0.6s 0.1s ease forwards", opacity: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "4px", justifyContent: "flex-end" }}>
              <span style={{ fontSize: "clamp(4rem, 8vw, 7rem)", fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 1, fontVariantNumeric: "tabular-nums", background: "linear-gradient(180deg, #fff 60%, #555)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {displayHour}:{minutes}
              </span>
              <div style={{ display: "flex", flexDirection: "column", paddingTop: "12px", gap: "4px" }}>
                <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "#6366f1" }}>{ampm}</span>
                <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "#444", fontVariantNumeric: "tabular-nums" }}>{seconds}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ padding: "40px 48px 0", maxWidth: "1300px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {[
              { label: "Upcoming Sessions", value: upcomingSessions.length, icon: "🗓️", color: "#6366f1" },
              { label: "Unread Patient Logs", value: unreadPatients.length, icon: "📬", color: unreadPatients.length > 0 ? "#ef4444" : "#22c55e" },
              { label: "Plan", value: profile?.subscription_tier || "Free", icon: "⚡", color: "#f59e0b" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  padding: "24px 28px", borderRadius: "16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(12px)",
                  animation: `fadeUp 0.6s ${0.2 + i * 0.08}s ease forwards`,
                  opacity: 0,
                  display: "flex", alignItems: "center", gap: "20px",
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: "12px", background: `${stat.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: "0.82rem", color: "#666", marginTop: "4px", fontWeight: 500 }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Panels */}
        <div style={{ padding: "28px 48px 60px", maxWidth: "1300px", margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px" }}>

          {/* Upcoming Sessions */}
          <div style={{
            padding: "28px 32px", borderRadius: "20px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
            animation: "fadeUp 0.6s 0.4s ease forwards", opacity: 0,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.2rem" }}>🗓️</span>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#d0d0e0", margin: 0 }}>Upcoming Sessions</h3>
              </div>
              <Link href="/dashboard" style={{ textDecoration: "none", fontSize: "0.8rem", color: "#6366f1", fontWeight: 600 }}>View all →</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {upcomingSessions.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#444", fontSize: "0.9rem" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🧘</div>
                  No sessions in the next 7 days
                </div>
              ) : (
                upcomingSessions.map((session, i) => (
                  <Link
                    href={`/dashboard/patient/${session.patient_id}`}
                    key={session.id}
                    style={{
                      textDecoration: "none", padding: "14px 18px", borderRadius: "12px",
                      background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.14)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.transform = "translateX(4px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.07)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.15)"; e.currentTarget.style.transform = "translateX(0)"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                        {(session.patients?.display_alias || "P").charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#e0e0f0", fontSize: "0.95rem" }}>{session.patients?.display_alias || "Patient"}</div>
                        <div style={{ fontSize: "0.78rem", color: "#6366f1", marginTop: "2px", fontWeight: 500 }}>
                          {new Date(session.next_appointment).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                    <span style={{ color: "#555", fontSize: "1.1rem" }}>→</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Unread Logs */}
            <div style={{
              padding: "28px 32px", borderRadius: "20px", flex: 1,
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${unreadPatients.length > 0 ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.08)"}`,
              backdropFilter: "blur(16px)",
              animation: "fadeUp 0.6s 0.5s ease forwards", opacity: 0,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.2rem" }}>📬</span>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#d0d0e0", margin: 0 }}>Unread Logs</h3>
                </div>
                {unreadPatients.length > 0 && (
                  <span style={{ background: "#ef4444", color: "#fff", fontSize: "0.72rem", fontWeight: 800, padding: "3px 8px", borderRadius: "999px" }}>
                    {unreadPatients.reduce((s, p) => s + (p.unread_count || 0), 0)} new
                  </span>
                )}
              </div>
              {unreadPatients.length === 0 ? (
                <div style={{ padding: "24px 0", textAlign: "center", color: "#444", fontSize: "0.9rem" }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>✅</div>
                  All caught up!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {unreadPatients.slice(0, 4).map(p => (
                    <Link
                      href={`/dashboard/patient/${p.id}`}
                      key={p.id}
                      style={{
                        textDecoration: "none", padding: "12px 16px", borderRadius: "10px",
                        background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.transform = "translateX(4px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.transform = "translateX(0)"; }}
                    >
                      <div style={{ fontWeight: 600, color: "#e0d0d0", fontSize: "0.9rem" }}>{p.display_alias}</div>
                      <span style={{ background: "#ef4444", color: "#fff", fontSize: "0.68rem", fontWeight: 800, padding: "2px 7px", borderRadius: "999px" }}>{p.unread_count}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{
              padding: "28px 32px", borderRadius: "20px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              animation: "fadeUp 0.6s 0.6s ease forwards", opacity: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                <span style={{ fontSize: "1.2rem" }}>⚡</span>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#d0d0e0", margin: 0 }}>Quick Actions</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { label: "All Patients", href: "/dashboard", icon: "👥" },
                  { label: "Billing", href: "/dashboard/billing", icon: "💳" },
                  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
                  { label: "Waitlist", href: "/waitlist", icon: "📋" },
                ].map(a => (
                  <Link
                    key={a.label}
                    href={a.href}
                    style={{
                      textDecoration: "none", padding: "14px 16px", borderRadius: "12px",
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                      display: "flex", flexDirection: "column", gap: "6px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.12)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <span style={{ fontSize: "1.3rem" }}>{a.icon}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#aaa" }}>{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
