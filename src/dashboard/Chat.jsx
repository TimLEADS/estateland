import { useState } from "react";
import { useDashboard } from "../context/DashboardContext.jsx";
import { C, THEME, font } from "./theme.js";

const T = THEME.dark;

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export default function Chat() {
  const { chatSessions = [] } = useDashboard();
  const [selectedId, setSelectedId] = useState(null);

  const selected = chatSessions.find((s) => s.id === selectedId);
  const sorted = [...chatSessions].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: font.display, fontSize: "clamp(24px, 3vw, 30px)", color: T.text, marginBottom: 6 }}>Chat</h1>
        <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute }}>
          Conversations from the website chatbot. All sessions are stored here and synced with the main site.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, minHeight: 400 }}>
        {/* Session list */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: 16, borderBottom: `1px solid ${C.border}`, fontFamily: font.body, fontSize: 12, fontWeight: 600, color: T.mute }}>
            Sessions ({sorted.length})
          </div>
          <div style={{ overflow: "auto", flex: 1 }}>
            {sorted.length === 0 ? (
              <p style={{ padding: 24, fontFamily: font.body, fontSize: 13, color: T.mute }}>No chat sessions yet. They appear when visitors use the website chatbot.</p>
            ) : (
              sorted.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    textAlign: "left",
                    background: selectedId === s.id ? C.surfaceLight : "transparent",
                    border: "none",
                    borderBottom: `1px solid ${C.border}`,
                    cursor: "pointer",
                    fontFamily: font.body,
                    fontSize: 13,
                    color: T.text,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {s.page || "/"} · {s.messages?.length || 0} messages
                  </div>
                  <div style={{ fontSize: 11, color: T.mute }}>{formatDate(s.startedAt)}</div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message thread */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {!selected ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
              <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute }}>Select a session to view the conversation.</p>
            </div>
          ) : (
            <>
              <div style={{ padding: 16, borderBottom: `1px solid ${C.border}`, background: C.surfaceLight }}>
                <div style={{ fontFamily: font.body, fontSize: 12, color: T.mute }}>
                  {selected.page || "/"} · {formatDate(selected.startedAt)} · {selected.source || "website"}
                </div>
              </div>
              <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {(selected.messages || []).map((m, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "80%",
                      padding: "12px 16px",
                      borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                      background: m.role === "user" ? C.goldDim : C.surfaceLight,
                      border: `1px solid ${C.border}`,
                      fontFamily: font.body,
                      fontSize: 13,
                      color: T.text,
                      lineHeight: 1.5,
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 600, color: T.mute, marginBottom: 4, textTransform: "uppercase" }}>
                      {m.role === "user" ? "Visitor" : "Bot"}
                    </div>
                    {m.text}
                    <div style={{ fontSize: 11, color: T.mute, marginTop: 6 }}>{formatDate(m.at)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
