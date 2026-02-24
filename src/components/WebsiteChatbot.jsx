import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext.jsx";

// Match Estate Land site colors
const C = {
  void: "#080808",
  surface: "#0f0f0f",
  cream: "#f5f0e8",
  mute: "rgba(245,240,232,0.82)",
  gold: "#c9a227",
  border: "rgba(240,235,227,0.12)",
};
const font = { body: "'Plus Jakarta Sans', sans-serif", display: "'Cormorant Garamond', serif" };

function getBotReply(userText) {
  const t = (userText || "").toLowerCase().trim();
  if (/hello|hi|hey|start|get started/.test(t))
    return "Hi! Welcome to Estate Land. Ready to grow your leads? Visit our Get Started page to choose your plan and territory.";
  if (/price|pricing|cost|plan/.test(t))
    return "We offer Launch ($329/6mo), Growth ($549/yr), and Premier (lifetime). See the Pricing section on the homepage or go to Get Started.";
  if (/contact|support|help|talk/.test(t))
    return "You can reach us via the Contact section on the homepage, or complete the Get Started form and we’ll follow up.";
  if (/lead|leads/.test(t))
    return "We deliver double-verified, exclusive leads in your chosen ZIP codes. Pick your plan and territory on Get Started to begin.";
  return "Thanks for your message. A team member will follow up soon. In the meantime, you can get started here: /get-started";
}

export default function WebsiteChatbot() {
  const { pathname } = useLocation();
  const { chatSessions = [], createChatSession, addChatMessage } = useDashboard();
  const [open, setOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  if (pathname.startsWith("/dashboard")) return null;

  const currentSession = (chatSessions || []).find((s) => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createChatSession({ page: pathname, source: "website" });
      setCurrentSessionId(sessionId);
    }

    addChatMessage(sessionId, { role: "user", text });
    setInput("");
    setSending(false);

    const botText = getBotReply(text);
    setTimeout(() => {
      addChatMessage(sessionId, { role: "bot", text: botText });
    }, 400);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
      `}</style>
      {/* Floating button */}
      <button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9998,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: C.gold,
          color: C.void,
          border: "none",
          boxShadow: "0 4px 20px rgba(201,162,39,0.4)",
          cursor: "pointer",
          fontFamily: font.body,
          fontSize: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 6px 24px rgba(201,162,39,0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(201,162,39,0.4)";
        }}
      >
        {open ? "×" : "💬"}
      </button>

      {/* Chat window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 24,
            zIndex: 9999,
            width: "min(380px, calc(100vw - 48px))",
            maxHeight: "min(420px, 60vh)",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            fontFamily: font.body,
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: C.void,
              borderRadius: "16px 16px 0 0",
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: C.cream }}>Estate Land</span>
            <span style={{ fontSize: 12, color: C.mute }}>Chat</span>
            <button
              type="button"
              aria-label="Close"
              onClick={handleClose}
              style={{
                background: "transparent",
                border: "none",
                color: C.mute,
                fontSize: 20,
                cursor: "pointer",
                padding: "0 4px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              minHeight: 200,
            }}
          >
            {messages.length === 0 && (
              <p style={{ fontSize: 13, color: C.mute, marginBottom: 8 }}>
                Ask about plans, pricing, or how to get started. We’ll reply here and a team member may follow up.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: m.role === "user" ? C.gold : C.void,
                  color: m.role === "user" ? C.void : C.cream,
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            style={{
              padding: 12,
              borderTop: `1px solid ${C.border}`,
              borderRadius: "0 0 16px 16px",
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  fontFamily: font.body,
                  fontSize: 13,
                  color: C.cream,
                  background: C.void,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                style={{
                  padding: "12px 18px",
                  fontFamily: font.body,
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.void,
                  background: C.gold,
                  border: "none",
                  borderRadius: 10,
                  cursor: input.trim() && !sending ? "pointer" : "not-allowed",
                  opacity: input.trim() && !sending ? 1 : 0.6,
                }}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
