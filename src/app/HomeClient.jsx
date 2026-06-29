"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

// ─── COLOR PALETTE (Strict Cyan, Orange, Black, White) ────────
const C = {
  cyan:         "#22d3ee",
  cyanDim:      "rgba(34,211,238,0.12)",
  cyanBorder:   "rgba(34,211,238,0.25)",
  orange:       "#fb923c",
  orangeDim:    "rgba(251,146,60,0.12)",
  orangeBorder: "rgba(251,146,60,0.25)",
  white:        "#f8fafc",
  darkBg:       "#060a0f",
  muted:        "#94a3b8",
  subtle:       "#475569",
  red:          "#f87171",
  redDim:       "rgba(248,113,113,0.1)",
  redBorder:    "rgba(248,113,113,0.22)",
  green:        "#4ade80",
};

const PLAN_COLORS = { free: C.muted, basic: C.cyan, pro: C.orange, elite: C.orange };
const PLAN_LABELS = { free: "Free Beta", basic: "Basic", pro: "Pro", elite: "Elite" };

// ─── LIVE CLOCK ───────────────────────────────────────────────
function Clock({ isDark }) {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const h  = (t.getHours() % 12 || 12).toString().padStart(2, "0");
  const m  = t.getMinutes().toString().padStart(2, "0");
  const s  = t.getSeconds().toString().padStart(2, "0");
  const ap = t.getHours() >= 12 ? "PM" : "AM";
  const date = t.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-end", gap: "2px", lineHeight: 1 }}>
        <span style={{
          fontSize: "clamp(3.5rem,8vw,6.5rem)", fontWeight: 900,
          letterSpacing: "-0.06em", lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          color: "var(--th-text)",
        }}>{h}:{m}</span>
        <div style={{ display: "flex", flexDirection: "column", paddingTop: "clamp(8px,1.5vw,14px)", gap: "3px" }}>
          <span style={{ fontSize: "clamp(0.9rem,1.8vw,1.3rem)", fontWeight: 800, color: C.orange }}>{ap}</span>
          <span style={{ fontSize: "clamp(0.8rem,1.5vw,1.1rem)", fontWeight: 700, color: "var(--th-text-subtle)", fontVariantNumeric: "tabular-nums" }}>{s}s</span>
        </div>
      </div>
      <div style={{ fontSize: "0.82rem", color: "var(--th-text-muted)", marginTop: "6px", fontWeight: 500 }}>{date}</div>
    </div>
  );
}

// ─── STAT PILL ───────────────────────────────────────────────
function Stat({ icon, label, value, color, colorDim, colorBorder, href }) {
  const inner = (
    <div style={{
      display: "flex", alignItems: "center", gap: "14px",
      padding: "16px 20px", borderRadius: "14px",
      background: colorDim, border: `1px solid ${colorBorder}`,
      backdropFilter: "blur(12px)", transition: "all 0.2s ease",
      cursor: href ? "pointer" : "default",
    }}
      onMouseEnter={e => { if (href) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${colorDim}`; } }}
      onMouseLeave={e => { if (href) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; } }}
    >
      <div style={{ fontSize: "1.4rem", width: 42, height: 42, borderRadius: "11px", background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: "1.6rem", fontWeight: 900, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value}</div>
        <div style={{ fontSize: "0.72rem", color: "var(--th-text-muted)", marginTop: "3px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      </div>
    </div>
  );
  return href ? <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link> : inner;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function HomeClient({ profile, unreadPatients, upcomingSessions, totalPatients }) {
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState({ text: "Good morning", emoji: "☀️" });
  const [isDark, setIsDark] = useState(false);
  const canvasRef = useRef(null);

  // Sync theme status on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("psycholog-theme");
    const dark = stored === "dark";
    setIsDark(dark);

    const h = new Date().getHours();
    if (h < 12)      setGreeting({ text: "Good morning",   emoji: "☀️" });
    else if (h < 17) setGreeting({ text: "Good afternoon", emoji: "🌤️" });
    else             setGreeting({ text: "Good evening",   emoji: "🌙" });

    // Animated orbs — cyan + orange tones
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const orbs = [
      { x: W * 0.1,  y: H * 0.25, r: 350, dx: 0.15,  dy: 0.1,   h: 188, s: 90, l: 55 }, // cyan
      { x: W * 0.9,  y: H * 0.7,  r: 300, dx: -0.12, dy: 0.08,  h: 24,  s: 90, l: 58 }, // orange
      { x: W * 0.55, y: H * 0.9,  r: 380, dx: 0.08,  dy: -0.1,  h: 195, s: 80, l: 50 }, // teal
      { x: W * 0.75, y: H * 0.1,  r: 260, dx: -0.1,  dy: 0.12,  h: 20,  s: 85, l: 55 }, // amber
    ];

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const isCurrentlyDark = document.documentElement.classList.contains("dark");
      const orbOpacity = isCurrentlyDark ? 0.07 : 0.02;

      orbs.forEach(o => {
        o.x += o.dx; o.y += o.dy;
        if (o.x < -o.r) o.x = W + o.r; if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r; if (o.y > H + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.h},${o.s}%,${o.l}%,${orbOpacity})`);
        g.addColorStop(1, `hsla(${o.h},${o.s}%,${o.l}%,0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("psycholog-theme", newDark ? "dark" : "light");
  };

  if (!mounted) return null;

  const firstName = profile?.full_name?.split(" ")[0] ?? "Doctor";
  const planKey   = (profile?.plan_type || "free").toLowerCase();
  const planColor = PLAN_COLORS[planKey] || C.muted;
  const planLabel = PLAN_LABELS[planKey] || "Free";
  const totalUnread = unreadPatients.reduce((s, p) => s + (p.unread_count || 0), 0);
  const nextSession = upcomingSessions[0];

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--th-bg)",
      color: "var(--th-text)",
      fontFamily: "'Inter','DM Sans',sans-serif",
      position: "relative",
      overflow: "hidden",
      transition: "background 0.3s ease, color 0.3s ease"
    }}>
      {/* Orb canvas */}
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />

      {/* Subtle dot grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: isDark
          ? "radial-gradient(rgba(34,211,238,0.06) 1px, transparent 1px)"
          : "radial-gradient(rgba(34,211,238,0.12) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* ── NAV ── */}
        <nav style={{
          padding: "18px 40px", display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px solid var(--th-border)",
          background: isDark ? "rgba(6,10,15,0.7)" : "rgba(247,245,240,0.7)",
          backdropFilter: "blur(20px)",
          position: "sticky", top: 0, zIndex: 10,
          transition: "background 0.3s ease, border-color 0.3s ease"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 30, height: 30, borderRadius: "8px", background: `linear-gradient(135deg,${C.cyan},${C.orange})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "13px", color: "#000" }}>P</div>
            <span style={{ fontWeight: 900, fontSize: "1rem", letterSpacing: "-0.03em", color: "var(--th-text)" }}>PsychoLog</span>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                background: "var(--th-bg-secondary)",
                border: "1px solid var(--th-border)",
                borderRadius: "8px",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "15px",
                transition: "all 0.2s ease",
              }}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
            <div style={{ width: 1, height: 20, background: "var(--th-border)" }} />
            
            <div style={{ padding: "5px 12px", borderRadius: "999px", background: `${planColor}15`, border: `1px solid ${planColor}35`, fontSize: "0.75rem", fontWeight: 700, color: planColor }}>
              ⚡ {planLabel}
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--th-text-subtle)" }}>{profile?.email}</span>
            <Link href="/dashboard" style={{
              textDecoration: "none", padding: "9px 22px", fontSize: "0.85rem", fontWeight: 800,
              background: `linear-gradient(135deg,${C.cyan},#0891b2)`,
              color: "#000", borderRadius: "10px", letterSpacing: "-0.01em",
              boxShadow: `0 4px 20px rgba(34,211,238,0.3)`, transition: "all 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 28px rgba(34,211,238,0.45)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 20px rgba(34,211,238,0.3)`; }}
            >Open Workspace →</Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <div style={{ padding: "56px 40px 36px", maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "32px", flexWrap: "wrap" }}>
          {/* Greeting */}
          <div style={{ animation: "fadeUp 0.6s ease forwards" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", borderRadius: "999px", background: C.cyanDim, border: `1px solid ${C.cyanBorder}`, fontSize: "0.78rem", fontWeight: 700, color: C.cyan, marginBottom: "18px", letterSpacing: "0.04em" }}>
              <span>{greeting.emoji}</span><span style={{ textTransform: "uppercase" }}>{greeting.text}</span>
            </div>
            <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.05, margin: "0 0 14px" }}>
              Welcome back,<br />
              <span style={{
                color: isDark ? C.cyan : "#0891b2"
              }}>
                Dr. {firstName}.
              </span>
            </h1>
            {/* Smart context line */}
            <p style={{ color: "var(--th-text-muted)", fontSize: "0.92rem", lineHeight: 1.7, maxWidth: "400px", margin: 0, borderLeft: `3px solid ${nextSession ? C.cyan : totalUnread > 0 ? C.orange : "var(--th-border)"}`, paddingLeft: "14px" }}>
              {nextSession
                ? <>Next: <strong style={{ color: C.cyan }}>{nextSession.patients?.display_alias || "Patient"}</strong> — {new Date(nextSession.next_appointment).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</>
                : totalUnread > 0
                  ? <><strong style={{ color: C.orange }}>{totalUnread} unread log{totalUnread > 1 ? "s" : ""}</strong> waiting for your review.</>
                  : "All clear — no sessions or unread logs. Take a breather."}
            </p>
          </div>

          {/* Clock */}
          <div style={{ animation: "fadeUp 0.6s 0.1s ease forwards", opacity: 0 }}>
            <Clock isDark={isDark} />
          </div>
        </div>

        {/* ── STAT ROW ── */}
        <div style={{ padding: "0 40px", maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
            <Stat icon="👥" label="Active Patients"    value={totalPatients}           color={C.cyan}   colorDim={C.cyanDim}   colorBorder={C.cyanBorder}   href="/dashboard" />
            <Stat icon="🗓️" label="Upcoming Sessions"  value={upcomingSessions.length} color="var(--th-text)"  colorDim="var(--th-bg-secondary)" colorBorder="var(--th-border)" href="/dashboard" />
            <Stat icon="📬" label="Unread Logs"        value={totalUnread}             color={totalUnread > 0 ? C.red : C.green} colorDim={totalUnread > 0 ? C.redDim : "rgba(74,222,128,0.08)"} colorBorder={totalUnread > 0 ? C.redBorder : "rgba(74,222,128,0.2)"} href="/dashboard" />
            <Stat icon="⚡" label="Your Plan"          value={planLabel}               color={planColor} colorDim={`${planColor}12`} colorBorder={`${planColor}30`} href="/dashboard/billing" />
          </div>
        </div>

        {/* ── MAIN PANELS ── */}
        <div style={{ padding: "22px 40px 60px", maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "18px" }}>

          {/* Upcoming Sessions */}
          <div style={{
            padding: "28px 30px", borderRadius: "18px",
            background: "var(--th-card)", border: "1px solid var(--th-border)",
            backdropFilter: "blur(20px)", animation: "fadeUp 0.6s 0.25s ease forwards", opacity: 0,
            transition: "background 0.3s ease, border-color 0.3s ease"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 34, height: 34, borderRadius: "999px", background: C.cyanDim, border: `1px solid ${C.cyanBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🗓️</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--th-text)" }}>Upcoming Sessions</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--th-text-subtle)" }}>Sorted by nearest first</div>
                </div>
              </div>
              <Link href="/dashboard" style={{ textDecoration: "none", fontSize: "0.75rem", fontWeight: 700, color: C.cyan, padding: "5px 12px", borderRadius: "8px", background: C.cyanDim, border: `1px solid ${C.cyanBorder}` }}>View all →</Link>
            </div>

            {upcomingSessions.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>🧘</div>
                <p style={{ color: "var(--th-text-subtle)", fontSize: "0.88rem", margin: "0 0 14px" }}>No upcoming sessions scheduled.</p>
                <Link href="/dashboard" style={{ textDecoration: "none", fontSize: "0.8rem", fontWeight: 700, color: C.cyan }}>Go to a patient to schedule one →</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {upcomingSessions.map((session, i) => {
                  const dt = new Date(session.next_appointment);
                  const isToday = dt.toDateString() === new Date().toDateString();
                  const isTomorrow = dt.toDateString() === new Date(Date.now() + 86400000).toDateString();
                  return (
                    <Link
                      href={`/dashboard/patient/${session.patient_id}`}
                      key={session.id}
                      style={{
                        textDecoration: "none", padding: "15px 18px", borderRadius: "13px",
                        background: isToday ? C.cyanDim : "var(--th-bg-secondary)",
                        border: `1px solid ${isToday ? C.cyanBorder : "var(--th-border)"}`,
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        transition: "all 0.2s ease, background 0.3s ease, border-color 0.3s ease",
                        animation: `fadeUp 0.5s ${0.3 + i * 0.07}s ease forwards`, opacity: 0,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.cyanDim; e.currentTarget.style.borderColor = C.cyanBorder; e.currentTarget.style.transform = "translateX(6px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isToday ? C.cyanDim : "var(--th-bg-secondary)"; e.currentTarget.style.borderColor = isToday ? C.cyanBorder : "var(--th-border)"; e.currentTarget.style.transform = "none"; }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${C.cyan},#0891b2)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.88rem", color: "#000", flexShrink: 0 }}>
                          {(session.patients?.display_alias || "P").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--th-text)", fontSize: "0.92rem" }}>{session.patients?.display_alias || "Patient"}</div>
                          <div style={{ fontSize: "0.76rem", color: isToday ? C.cyan : "var(--th-text-subtle)", marginTop: "2px", fontWeight: 600 }}>
                            {isToday ? "TODAY · " : isTomorrow ? "TOMORROW · " : ""}
                            {dt.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                      {isToday && (
                        <span style={{ fontSize: "0.68rem", fontWeight: 900, color: "#000", background: C.cyan, padding: "3px 9px", borderRadius: "999px", flexShrink: 0 }}>TODAY</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Unread Logs */}
            <div style={{
              padding: "24px 26px", borderRadius: "18px",
              background: totalUnread > 0 ? C.redDim : "var(--th-card)",
              border: `1px solid ${totalUnread > 0 ? C.redBorder : "var(--th-border)"}`,
              backdropFilter: "blur(20px)", animation: "fadeUp 0.6s 0.35s ease forwards", opacity: 0,
              transition: "background 0.3s ease, border-color 0.3s ease"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "9px", background: totalUnread > 0 ? C.redDim : "rgba(74,222,128,0.1)", border: `1px solid ${totalUnread > 0 ? C.redBorder : "rgba(74,222,128,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {totalUnread > 0 ? "📬" : "✅"}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--th-text)" }}>Unread Logs</div>
                </div>
                {totalUnread > 0 && <span style={{ background: C.red, color: "#fff", fontSize: "0.68rem", fontWeight: 900, padding: "3px 9px", borderRadius: "999px" }}>{totalUnread} new</span>}
              </div>
              {unreadPatients.length === 0 ? (
                <p style={{ color: "var(--th-text-subtle)", fontSize: "0.85rem", margin: 0, padding: "12px 0", textAlign: "center" }}>All caught up! 🎉</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {unreadPatients.slice(0, 5).map(p => (
                    <Link href={`/dashboard/patient/${p.id}`} key={p.id} style={{
                      textDecoration: "none", padding: "11px 14px", borderRadius: "10px",
                      background: "rgba(248,113,113,0.06)", border: `1px solid ${C.redBorder}`,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      transition: "all 0.2s ease",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.redDim; e.currentTarget.style.transform = "translateX(4px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(248,113,113,0.06)"; e.currentTarget.style.transform = "none"; }}
                    >
                      <span style={{ fontWeight: 600, color: "var(--th-text)", fontSize: "0.88rem" }}>{p.display_alias}</span>
                      <span style={{ background: C.red, color: "#fff", fontSize: "0.68rem", fontWeight: 900, padding: "2px 8px", borderRadius: "999px" }}>{p.unread_count}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Jump */}
            <div style={{
              padding: "24px 26px", borderRadius: "18px", background: "var(--th-card)", border: "1px solid var(--th-border)",
              backdropFilter: "blur(20px)", animation: "fadeUp 0.6s 0.45s ease forwards", opacity: 0,
              transition: "background 0.3s ease, border-color 0.3s ease"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div style={{ width: 34, height: 34, borderRadius: "9px", background: C.orangeDim, border: `1px solid ${C.orangeBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>⚡</div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--th-text)" }}>Quick Jump</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[
                  { label: "All Patients", href: "/dashboard",          icon: "👥",  color: C.cyan,   dim: C.cyanDim,   border: C.cyanBorder },
                  { label: "My Notes",     href: "/dashboard/notes",    icon: "📝",  color: C.cyan,   dim: C.cyanDim,   border: C.cyanBorder },
                  { label: "Billing",      href: "/dashboard/billing",  icon: "💳",  color: C.orange, dim: C.orangeDim, border: C.orangeBorder },
                  { label: "Settings",     href: "/dashboard/settings", icon: "⚙️",  color: "var(--th-text-muted)",  dim: "var(--th-bg-secondary)", border: "var(--th-border)" },
                ].map(a => (
                  <Link key={a.label} href={a.href} style={{
                    textDecoration: "none", padding: "13px 14px", borderRadius: "11px",
                    background: a.dim, border: `1px solid ${a.border}`,
                    display: "flex", alignItems: "center", gap: "9px", transition: "all 0.2s ease",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 16px ${a.dim}`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>{a.icon}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: a.color }}>{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Upgrade CTA — only for free plan */}
            {planKey === "free" && (
              <Link href="/dashboard/billing" style={{
                textDecoration: "none", padding: "20px 22px", borderRadius: "16px",
                background: `linear-gradient(135deg,${C.orangeDim},rgba(251,146,60,0.06))`,
                border: `1px solid ${C.orangeBorder}`, display: "block",
                animation: "fadeUp 0.6s 0.55s ease forwards", opacity: 0, transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${C.orangeDim}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: "1.3rem", marginBottom: "6px" }}>🚀</div>
                <div style={{ fontWeight: 800, color: C.orange, fontSize: "0.92rem", marginBottom: "4px" }}>Upgrade to Pro</div>
                <div style={{ fontSize: "0.77rem", color: "var(--th-text-subtle)", lineHeight: 1.5 }}>Unlock unlimited patients, priority AI, and advanced analytics.</div>
                <div style={{ marginTop: "10px", fontSize: "0.78rem", fontWeight: 700, color: C.orange }}>View plans →</div>
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @media (max-width:900px) {
          .home-grid { grid-template-columns:1fr !important; }
        }
      `}</style>
    </div>
  );
}
