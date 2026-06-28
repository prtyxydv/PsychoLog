"use client";

import { useState } from "react";

export default function AdminClient({ initialProfiles, initialWaitlist = [] }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [loadingId, setLoadingId] = useState(null);

  async function updateProfile(id, field, value) {
    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/update-sub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field, value }),
      });
      if (!res.ok) throw new Error("Update failed");
      
      setProfiles(prev => prev.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      ));
    } catch (err) {
      alert("Failed to update.");
    }
    setLoadingId(null);
  }

  async function deleteUser(id, name) {
    if (!confirm(`Are you absolutely sure you want to delete ${name || "this user"} and all their patients/logs forever?`)) {
      return;
    }
    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      
      setProfiles(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
    setLoadingId(null);
  }

  return (
    <>
      <div className="th-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--th-bg-secondary)", borderBottom: "1px solid var(--th-sidebar-border)" }}>
              <th style={{ padding: "16px", fontSize: "0.8rem", color: "var(--th-text-subtle)", textTransform: "uppercase" }}>Email</th>
              <th style={{ padding: "16px", fontSize: "0.8rem", color: "var(--th-text-subtle)", textTransform: "uppercase" }}>Joined</th>
              <th style={{ padding: "16px", fontSize: "0.8rem", color: "var(--th-text-subtle)", textTransform: "uppercase" }}>Patients</th>
              <th style={{ padding: "16px", fontSize: "0.8rem", color: "var(--th-text-subtle)", textTransform: "uppercase" }}>Plan Tier</th>
              <th style={{ padding: "16px", fontSize: "0.8rem", color: "var(--th-text-subtle)", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "16px", fontSize: "0.8rem", color: "var(--th-text-subtle)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--th-sidebar-border)", opacity: loadingId === p.id ? 0.5 : 1 }}>
                <td style={{ padding: "16px", fontSize: "0.9rem" }}>
                  <div style={{ fontWeight: 600 }}>{p.full_name || "Unnamed"}</div>
                  <div style={{ color: "var(--th-text-muted)", fontSize: "0.8rem" }}>{p.email}</div>
                  {p.is_admin && <span style={{ background: "var(--th-accent)", color: "#000", fontSize: "0.6rem", padding: "2px 6px", borderRadius: "4px", fontWeight: 700, marginLeft: "4px" }}>ADMIN</span>}
                </td>
                <td style={{ padding: "16px", fontSize: "0.85rem", color: "var(--th-text-muted)" }}>
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: "16px", fontSize: "0.9rem", fontWeight: 600 }}>
                  {p.patientCount}
                </td>
                <td style={{ padding: "16px" }}>
                  <select 
                    value={p.plan_type || "free"}
                    onChange={(e) => updateProfile(p.id, "plan_type", e.target.value)}
                    disabled={loadingId === p.id}
                    style={{ padding: "6px", borderRadius: "6px", border: "1px solid var(--th-sidebar-border)", background: "var(--th-bg)", color: "var(--th-text)", fontSize: "0.85rem", cursor: "pointer" }}
                  >
                    <option value="free">Free Beta</option>
                    <option value="basic">Basic ($15)</option>
                    <option value="pro">Pro ($29)</option>
                    <option value="elite">Elite ($50)</option>
                  </select>
                </td>
                <td style={{ padding: "16px" }}>
                  <select 
                    value={p.subscription_status || "free"}
                    onChange={(e) => updateProfile(p.id, "subscription_status", e.target.value)}
                    disabled={loadingId === p.id}
                    style={{ padding: "6px", borderRadius: "6px", border: "1px solid var(--th-sidebar-border)", background: "var(--th-bg)", color: "var(--th-text)", fontSize: "0.85rem", cursor: "pointer" }}
                  >
                    <option value="free">Free</option>
                    <option value="active">Active (Paid)</option>
                    <option value="past_due">Past Due</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </td>
                <td style={{ padding: "16px", textAlign: "right" }}>
                  <button 
                    onClick={() => deleteUser(p.id, p.full_name)}
                    disabled={loadingId === p.id || p.is_admin}
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: (loadingId === p.id || p.is_admin) ? "not-allowed" : "pointer",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      opacity: p.is_admin ? 0.3 : 1
                    }}
                    title={p.is_admin ? "Cannot delete an admin" : "Delete user forever"}
                  >
                    {loadingId === p.id ? "..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
            {profiles.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "var(--th-text-subtle)" }}>No therapists found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: "1.5rem", marginTop: "40px", marginBottom: "8px", fontWeight: 700 }}>Waitlist Requests</h2>
      <p style={{ color: "var(--th-text-subtle)", marginBottom: "20px" }}>
        Therapists who want to upgrade. Find them in the directory above to manually grant access.
      </p>

      <div className="th-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--th-bg-secondary)", borderBottom: "1px solid var(--th-sidebar-border)" }}>
              <th style={{ padding: "16px", fontSize: "0.8rem", color: "var(--th-text-subtle)", textTransform: "uppercase" }}>Email</th>
              <th style={{ padding: "16px", fontSize: "0.8rem", color: "var(--th-text-subtle)", textTransform: "uppercase" }}>Requested Plan</th>
              <th style={{ padding: "16px", fontSize: "0.8rem", color: "var(--th-text-subtle)", textTransform: "uppercase" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {initialWaitlist.map(w => (
              <tr key={w.id} style={{ borderBottom: "1px solid var(--th-sidebar-border)" }}>
                <td style={{ padding: "16px", fontSize: "0.9rem", fontWeight: 600 }}>{w.email}</td>
                <td style={{ padding: "16px", fontSize: "0.85rem", textTransform: "capitalize", color: "var(--th-accent)", fontWeight: 700 }}>{w.requested_plan}</td>
                <td style={{ padding: "16px", fontSize: "0.85rem", color: "var(--th-text-muted)" }}>{new Date(w.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {initialWaitlist.length === 0 && (
              <tr>
                <td colSpan="3" style={{ padding: "32px", textAlign: "center", color: "var(--th-text-subtle)" }}>No waitlist requests.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
