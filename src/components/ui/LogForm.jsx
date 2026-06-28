"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { detectCrisisMultiple, HELPLINES } from "@/lib/crisisDetector";

/* ─────────────────────────────────────────────────────────────
   AUTO-EXPANDING TEXTAREA
───────────────────────────────────────────────────────────── */
function AutoTextarea({ id, value, onChange, onKeyDown, placeholder, disabled }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 150)}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      id={id}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
      className="pt-textarea"
      style={{ display: "block", resize: "none", overflowY: "auto" }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   CRISIS BANNER
───────────────────────────────────────────────────────────── */
function CrisisBanner({ severity, onShowHelp }) {
  const isHigh = severity === "high";
  return (
    <div className="crisis-banner animate-fade-in-up" style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{isHigh ? "🚨" : "💙"}</span>
        <div>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: isHigh ? "var(--crisis-red)" : "var(--pt-accent)", marginBottom: "4px" }}>
            {isHigh ? "You don't have to face this alone." : "We noticed something."}
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--pt-text)", lineHeight: 1.5, marginBottom: 0 }}>
            {isHigh ? "It sounds like you're going through an incredibly dark moment." : "It sounds like things are feeling really heavy right now."}
          </p>
          <button
            onClick={onShowHelp}
            style={{ marginTop: "10px", background: "none", border: "none", color: "var(--pt-teal)", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", padding: 0 }}
          >
            View support resources →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CRISIS MODAL
───────────────────────────────────────────────────────────── */
function CrisisModal({ onClose }) {
  return (
    <div className="modal-overlay animate-fade-in" style={{ padding: "20px" }}>
      <div className="modal-content animate-slide-up" style={{ maxWidth: "400px", padding: "32px 24px", background: "var(--pt-glass)", border: "1.5px solid var(--pt-glass-border)", color: "var(--pt-text)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🤝</div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "var(--pt-text)" }}>
            Support is available 24/7
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--pt-text-subtle)", marginTop: "8px" }}>
            These resources are free, confidential, and always open.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {HELPLINES.map(h => (
            <div key={h.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "var(--pt-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--pt-glass-border)" }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "var(--pt-text)" }}>{h.name}</p>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "var(--pt-text-subtle)" }}>{h.desc}</p>
              </div>
              <a href={`tel:${h.number.replace(/\D/g, "")}`} style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--pt-teal)", textDecoration: "none", padding: "4px 12px", background: "var(--pt-seafoam-soft)", borderRadius: "999px" }}>
                {h.number}
              </a>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="btn-pt-secondary" style={{ width: "100%", marginTop: "24px" }}>Close</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MOOD SELECTOR
───────────────────────────────────────────────────────────── */
const MOOD_LABELS = ["Very low","Low","A bit low","Neutral","Okay","Good","Pretty good","Great","Amazing","Incredible"];

function MoodSelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`mood-btn ${value === n ? "selected" : ""}`}
          title={MOOD_LABELS[n - 1]}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN LOG FORM (Conversational UI)
───────────────────────────────────────────────────────────── */
export default function LogForm({ token, patientId, sessionToken }) {
  const [step, setStep]         = useState(0); // 0=mood, 1=chat, 2=done
  const [mood, setMood]         = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [submitting, setSub]    = useState(false);
  const [submitError, setErr]   = useState("");
  const [showHelp, setHelp]     = useState(false);

  // Crisis detection state
  const [crisis, setCrisis]     = useState({ triggered: false, severity: null });
  const crisisReported          = useRef(false);
  const chatEndRef              = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (step === 1 && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, step]);

  const checkCrisis = useCallback((text) => {
    const result = detectCrisisMultiple([text]);
    if (result.triggered) setCrisis(result);

    // Fire therapist alert once per session if triggered
    if (result.triggered && !crisisReported.current) {
      crisisReported.current = true;
      fetch("/api/crisis-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, severity: result.severity, timestamp: new Date().toISOString() }),
      }).catch(() => {});
    }
  }, [token]);

  function startChat() {
    if (!mood) return;
    setStep(1);
    setMessages([{ 
      role: "assistant", 
      content: `I see you're feeling "${MOOD_LABELS[mood - 1].toLowerCase()}" today. What's on your mind? I'm here to listen.` 
    }]);
  }

  async function handleSendMessage() {
    if (!input.trim() || isTyping) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);
    checkCrisis(userMsg.content);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      
      if (res.ok) {
        let responseText = data.response;
        
        // Handle explicit AI crisis triggers
        if (responseText.includes("[TRIGGER_CRISIS_RESOURCES]")) {
          responseText = responseText.replace("[TRIGGER_CRISIS_RESOURCES]", "").trim();
          setCrisis({ triggered: true, severity: "high" });
          setHelp(true);
          
          if (!crisisReported.current) {
            crisisReported.current = true;
            fetch("/api/crisis-alert", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, severity: "high", timestamp: new Date().toISOString() }),
            }).catch(() => {});
          }
        }
        
        setMessages([...newMessages, { role: "assistant", content: responseText }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: "I'm having a little trouble connecting right now, but I hear you. Please continue if you'd like." }]);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "I'm having a little trouble connecting right now, but I hear you. Please continue if you'd like." }]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  async function submitLog() {
    setSub(true);
    setErr("");
    
    // Combine all user messages for the summary pipeline
    const userTranscript = messages
      .filter(m => m.role === "user")
      .map(m => m.content)
      .join(" ");

    try {
      const res = await fetch("/api/logs/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-patient-session": sessionToken,
        },
        body: JSON.stringify({
          token,
          patientId,
          moodScore: mood,
          eventRaw: userTranscript, // Handled as the primary entry
          feelingRaw: "",           // Left blank as conversation blends both
          crisisDetected: crisis.triggered,
          crisisSeverity: crisis.severity,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit log");
      }

      setStep(2); // Done
    } catch (err) {
      setErr(err.message || "An unexpected error occurred. Please try again.");
      setSub(false);
    }
  }

  if (step === 2) {
    return (
      <div className="pt-card animate-fade-in-up text-center" style={{ padding: "48px 32px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px", animation: "confetti-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
          🌱
        </div>
        <h2 style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "var(--pt-text)", marginBottom: "12px" }}>
          You're all set.
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--pt-text-subtle)", lineHeight: 1.6, margin: "0 auto", maxWidth: "260px" }}>
          Your check-in has been securely saved for your therapist. Close this tab whenever you're ready.
        </p>
      </div>
    );
  }

  return (
    <>
      {showHelp && <CrisisModal onClose={() => setHelp(false)} />}
      
      <div className="pt-card animate-fade-in-up" style={{ padding: "32px 24px", display: "flex", flexDirection: "column", height: step === 1 ? "80vh" : "auto", maxHeight: "800px" }}>
        
        {step === 0 && (
          <div className="animate-fade-in">
            <h2 style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--pt-text)", marginBottom: "8px", textAlign: "center" }}>
              How are you feeling right now?
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--pt-text-subtle)", textAlign: "center", marginBottom: "32px" }}>
              Tap a number from 1 to 10
            </p>
            <MoodSelector value={mood} onChange={setMood} />
            <button
              onClick={startChat}
              disabled={!mood}
              className="btn-pt-primary"
              style={{ width: "100%", marginTop: "40px" }}
            >
              Continue
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            
            {crisis.triggered && <CrisisBanner severity={crisis.severity} onShowHelp={() => setHelp(true)} />}

            {/* Chat History */}
            <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "var(--pt-teal)" : "var(--pt-seafoam-soft)",
                  color: m.role === "user" ? "#FFF" : "var(--pt-text)",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  borderBottomRightRadius: m.role === "user" ? "4px" : "16px",
                  borderBottomLeftRadius: m.role === "assistant" ? "4px" : "16px",
                  maxWidth: "85%",
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                }}>
                  {m.content}
                </div>
              ))}
              {isTyping && (
                <div style={{ alignSelf: "flex-start", background: "var(--pt-seafoam-soft)", padding: "12px 16px", borderRadius: "16px", borderBottomLeftRadius: "4px", color: "var(--pt-text-subtle)", fontSize: "0.9rem" }}>
                  <span className="animate-breath">typing...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ borderTop: "1px solid var(--pt-glass-border)", paddingTop: "16px", display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <AutoTextarea
                  id="chat-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  disabled={submitting || isTyping}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || submitting || isTyping}
                className="btn-pt-primary"
                style={{ padding: "12px 16px", borderRadius: "var(--radius-md)" }}
              >
                Send
              </button>
            </div>
            
            {submitError && (
              <p style={{ color: "var(--crisis-red)", fontSize: "0.8rem", marginTop: "12px", textAlign: "center" }}>
                {submitError}
              </p>
            )}

            <button
              onClick={submitLog}
              disabled={submitting}
              className="btn-pt-secondary"
              style={{ width: "100%", marginTop: "16px" }}
            >
              {submitting ? "Saving securely..." : "I'm done sharing"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
