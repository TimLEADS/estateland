import { useState, useEffect, useCallback, useRef } from "react";
import { C, font } from "./theme.js";

const API = import.meta.env.VITE_API_URL || "";

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: opts.body ? { "Content-Type": "application/json" } : {},
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res.json();
}

// ── Animations ──
const fadeIn = { animation: "emailFadeIn 0.25s ease" };
const slideIn = { animation: "emailSlideIn 0.3s ease" };

function InjectStyles() {
  return (
    <style>{`
      @keyframes emailFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes emailSlideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      @keyframes emailPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
      .email-row:hover { background: rgba(201,162,39,0.06) !important; border-color: rgba(201,162,39,0.2) !important; }
      .email-btn:hover { background: rgba(201,162,39,0.15) !important; border-color: ${C.gold} !important; }
      .email-sidebar-item:hover { background: rgba(201,162,39,0.08) !important; }
      .email-compose-input:focus { border-color: ${C.gold} !important; outline: none; }
      .email-attach-btn:hover { background: rgba(201,162,39,0.12) !important; }
    `}</style>
  );
}

// ── Sidebar ──
function EmailSidebar({ view, setView, unreadCount, onCompose }) {
  const items = [
    { key: "inbox", label: "Inbox", icon: "\u{1F4E5}", badge: unreadCount },
    { key: "sent", label: "Sent", icon: "\u{1F4E4}" },
    { key: "starred", label: "Starred", icon: "\u2B50" },
    { key: "templates", label: "Templates", icon: "\u{1F4CB}" },
    { key: "contacts", label: "Contacts", icon: "\u{1F465}" },
  ];

  return (
    <div style={{ width: 220, borderRight: `1px solid ${C.border}`, padding: "20px 0", flexShrink: 0, display: "flex", flexDirection: "column" }}>
      <button
        onClick={onCompose}
        style={{
          margin: "0 16px 20px", padding: "12px 20px", background: C.gold, color: C.void, border: "none", borderRadius: 10,
          fontFamily: font.body, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(201,162,39,0.3)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
      >
        + Compose
      </button>
      {items.map(item => {
        const active = view === item.key;
        return (
          <button
            key={item.key}
            className="email-sidebar-item"
            onClick={() => setView(item.key)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 20px", border: "none", cursor: "pointer",
              background: active ? "rgba(201,162,39,0.1)" : "transparent",
              borderLeft: active ? `3px solid ${C.gold}` : "3px solid transparent",
              fontFamily: font.body, fontSize: 13, fontWeight: active ? 600 : 400,
              color: active ? C.gold : C.creamDim, transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
            {item.badge > 0 && (
              <span style={{
                background: "#e53935", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px",
                borderRadius: 10, minWidth: 18, textAlign: "center", animation: "emailPulse 2s infinite",
              }}>{item.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Email List ──
function EmailList({ emails, loading, folder, onSelect, onStar, onLoadMore, hasMore }) {
  if (loading && emails.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: C.mute, fontFamily: font.body, fontSize: 14 }}>
        Loading emails...
      </div>
    );
  }
  if (!loading && emails.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: C.mute, fontFamily: font.body, fontSize: 14 }}>
        No emails in {folder}.
      </div>
    );
  }
  return (
    <div style={fadeIn}>
      {emails.map(email => (
        <div
          key={email.id}
          className="email-row"
          onClick={() => onSelect(email)}
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", cursor: "pointer",
            borderBottom: `1px solid ${C.border}`, background: email.isUnread ? "rgba(201,162,39,0.04)" : "transparent",
            transition: "all 0.15s",
          }}
        >
          <button
            onClick={e => { e.stopPropagation(); onStar(email.id); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: email.isStarred ? "#ffc107" : C.mute, padding: 0, transition: "color 0.15s" }}
          >{email.isStarred ? "\u2605" : "\u2606"}</button>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(201,162,39,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.body, fontSize: 14, fontWeight: 600, color: C.gold, flexShrink: 0 }}>
            {(email.from?.name || email.from?.email || "?")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: email.isUnread ? 700 : 500, color: email.isUnread ? C.cream : C.creamDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {email.from?.name || email.from?.email || "Unknown"}
              </span>
              {email.isUnread && <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, flexShrink: 0 }} />}
            </div>
            <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: email.isUnread ? 600 : 400, color: C.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>
              {email.subject || "(no subject)"}
            </div>
            <div style={{ fontFamily: font.body, fontSize: 11, color: C.mute, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {email.snippet}
            </div>
          </div>
          <div style={{ fontFamily: font.body, fontSize: 11, color: C.mute, whiteSpace: "nowrap", flexShrink: 0 }}>
            {formatDate(email.date)}
          </div>
        </div>
      ))}
      {hasMore && (
        <button
          onClick={onLoadMore}
          className="email-btn"
          style={{ display: "block", margin: "16px auto", padding: "10px 24px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: font.body, fontSize: 12, color: C.creamDim, cursor: "pointer", transition: "all 0.15s" }}
        >
          Load more
        </button>
      )}
    </div>
  );
}

// ── Email Detail (Thread View) ──
function EmailDetail({ email, thread, loading, onBack, onReply, onStar }) {
  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: C.mute, fontFamily: font.body }}>Loading email...</div>;
  }
  if (!email) return null;

  const messages = thread && thread.length > 0 ? thread : [email];

  return (
    <div style={{ ...slideIn, padding: "0 24px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0", borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
        <button onClick={onBack} className="email-btn" style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.creamDim, padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontFamily: font.body, fontSize: 12, transition: "all 0.15s" }}>
          &larr; Back
        </button>
        <h2 style={{ flex: 1, fontFamily: font.body, fontSize: 18, fontWeight: 600, color: C.cream, margin: 0 }}>
          {email.subject || "(no subject)"}
        </h2>
        <button onClick={() => onStar(email.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: email.isStarred ? "#ffc107" : C.mute }}>
          {email.isStarred ? "\u2605" : "\u2606"}
        </button>
      </div>

      {messages.map((msg, i) => (
        <div key={msg.id || i} style={{ marginBottom: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(201,162,39,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.body, fontSize: 16, fontWeight: 600, color: C.gold }}>
              {(msg.from?.name || msg.from?.email || "?")[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.cream }}>{msg.from?.name || msg.from?.email}</div>
              <div style={{ fontFamily: font.body, fontSize: 11, color: C.mute }}>
                to {msg.to} {msg.cc ? `cc ${msg.cc}` : ""}
              </div>
            </div>
            <div style={{ fontFamily: font.body, fontSize: 11, color: C.mute }}>{formatDate(msg.date)}</div>
          </div>
          <div style={{ padding: 20 }}>
            {msg.bodyHtml ? (
              <div
                style={{ fontFamily: font.body, fontSize: 13, color: C.creamDim, lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.bodyHtml) }}
              />
            ) : (
              <pre style={{ fontFamily: font.body, fontSize: 13, color: C.creamDim, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
                {msg.bodyText || msg.snippet || ""}
              </pre>
            )}
          </div>
          {msg.attachments && msg.attachments.length > 0 && (
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {msg.attachments.map((att, j) => (
                <a
                  key={j}
                  href={`${API}/api/emails/${msg.id}/attachments/${att.attachmentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: C.surfaceLight,
                    border: `1px solid ${C.border}`, borderRadius: 8, textDecoration: "none", transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                >
                  <span style={{ fontSize: 14 }}>{"\u{1F4CE}"}</span>
                  <span style={{ fontFamily: font.body, fontSize: 11, color: C.creamDim }}>{att.filename}</span>
                  <span style={{ fontFamily: font.body, fontSize: 10, color: C.mute }}>({formatSize(att.size)})</span>
                </a>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => onReply(messages[messages.length - 1] || email)}
        className="email-btn"
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "12px 24px",
          background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10,
          fontFamily: font.body, fontSize: 13, fontWeight: 500, color: C.creamDim, cursor: "pointer", transition: "all 0.15s",
        }}
      >
        Reply
      </button>
    </div>
  );
}

// ── Compose Email ──
function ComposeEmail({ onClose, onSend, templates, replyTo, connectedEmail }) {
  const [to, setTo] = useState(replyTo ? (replyTo.from?.email || "") : "");
  const [subject, setSubject] = useState(replyTo ? `Re: ${(replyTo.subject || "").replace(/^Re:\s*/i, "")}` : "");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const fileRef = useRef(null);

  const handleTemplateChange = (e) => {
    const tplId = e.target.value;
    setSelectedTemplate(tplId);
    if (!tplId) return;
    const tpl = templates.find(t => t.id === tplId);
    if (tpl) {
      setSubject(tpl.subject);
      setBody(tpl.body);
    }
  };

  const handleFileAdd = (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        setAttachments(prev => [...prev, { filename: file.name, mimeType: file.type || "application/octet-stream", data: base64 }]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleSend = async () => {
    if (!to.trim()) return;
    setSending(true);
    try {
      const htmlBody = body.replace(/\n/g, "<br>");
      await onSend({
        to: to.trim(), subject, body: htmlBody, attachments,
        inReplyTo: replyTo?.messageId || "",
        references: replyTo?.references || replyTo?.messageId || "",
      });
      onClose();
    } catch (err) {
      alert("Failed to send: " + (err.message || "Unknown error"));
    } finally {
      setSending(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px", background: C.surfaceLight, border: `1px solid ${C.border}`,
    borderRadius: 8, fontFamily: font.body, fontSize: 13, color: C.cream, transition: "border-color 0.2s",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
    }}>
      <div style={{
        ...slideIn, width: "100%", maxWidth: 640, maxHeight: "90vh", background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: font.body, fontSize: 16, fontWeight: 600, color: C.cream, margin: 0 }}>
            {replyTo ? "Reply" : "New Email"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.mute, fontSize: 20, cursor: "pointer", padding: 4 }}>&times;</button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {connectedEmail && (
            <div style={{ fontFamily: font.body, fontSize: 11, color: C.mute }}>
              From: {connectedEmail}
            </div>
          )}

          <input className="email-compose-input" type="email" placeholder="To" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
          <input className="email-compose-input" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle} />

          {!replyTo && templates.length > 0 && (
            <select
              value={selectedTemplate}
              onChange={handleTemplateChange}
              style={{ ...inputStyle, cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%23999' fill='none'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
            >
              <option value="">Select a template...</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}

          <textarea
            className="email-compose-input"
            placeholder="Write your message..."
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={12}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
          />

          {attachments.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {attachments.map((att, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: font.body, fontSize: 11, color: C.creamDim }}>
                  {"\u{1F4CE}"} {att.filename}
                  <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: C.mute, cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderTop: `1px solid ${C.border}` }}>
          <button
            onClick={handleSend}
            disabled={sending || !to.trim()}
            style={{
              padding: "12px 28px", background: sending ? C.mute : C.gold, color: C.void, border: "none", borderRadius: 10,
              fontFamily: font.body, fontSize: 13, fontWeight: 600, cursor: sending ? "not-allowed" : "pointer",
              opacity: (!to.trim() || sending) ? 0.5 : 1, transition: "all 0.15s",
            }}
          >
            {sending ? "Sending..." : "Send"}
          </button>
          <input ref={fileRef} type="file" multiple onChange={handleFileAdd} style={{ display: "none" }} />
          <button
            onClick={() => fileRef.current?.click()}
            className="email-attach-btn"
            style={{ padding: "10px 16px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: font.body, fontSize: 12, color: C.creamDim, cursor: "pointer", transition: "all 0.15s" }}
          >
            {"\u{1F4CE}"} Attach
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Template Manager ──
function TemplateManager({ templates, onRefresh }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", subject: "", body: "" });
  const [saving, setSaving] = useState(false);

  const startEdit = (tpl) => {
    setEditing(tpl ? tpl.id : "new");
    setForm(tpl ? { name: tpl.name, subject: tpl.subject, body: tpl.body } : { name: "", subject: "", body: "" });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing === "new") {
        await api("/api/templates", { method: "POST", body: form });
      } else {
        await api(`/api/templates/${editing}`, { method: "PUT", body: form });
      }
      setEditing(null);
      onRefresh();
    } catch (err) {
      alert("Error saving template: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this template?")) return;
    await api(`/api/templates/${id}`, { method: "DELETE" });
    onRefresh();
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px", background: C.surfaceLight, border: `1px solid ${C.border}`,
    borderRadius: 8, fontFamily: font.body, fontSize: 13, color: C.cream,
  };

  if (editing !== null) {
    return (
      <div style={{ ...fadeIn, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontFamily: font.body, fontSize: 16, fontWeight: 600, color: C.cream, margin: 0 }}>
            {editing === "new" ? "New Template" : "Edit Template"}
          </h3>
          <button onClick={() => setEditing(null)} className="email-btn" style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontFamily: font.body, fontSize: 12, color: C.creamDim, cursor: "pointer", transition: "all 0.15s" }}>
            Cancel
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input className="email-compose-input" placeholder="Template Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
          <input className="email-compose-input" placeholder="Subject Line" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={inputStyle} />
          <textarea className="email-compose-input" placeholder="Email Body" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={14} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }} />
          <button onClick={handleSave} disabled={saving || !form.name.trim()} style={{ alignSelf: "flex-start", padding: "12px 28px", background: C.gold, color: C.void, border: "none", borderRadius: 10, fontFamily: font.body, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...fadeIn, padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontFamily: font.body, fontSize: 16, fontWeight: 600, color: C.cream, margin: 0 }}>Email Templates</h3>
        <button onClick={() => startEdit(null)} style={{ padding: "10px 20px", background: C.gold, color: C.void, border: "none", borderRadius: 8, fontFamily: font.body, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          + New Template
        </button>
      </div>
      {templates.length === 0 && (
        <p style={{ fontFamily: font.body, fontSize: 13, color: C.mute }}>No templates yet.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {templates.map(tpl => (
          <div
            key={tpl.id}
            style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(201,162,39,0.3)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h4 style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: C.cream, margin: 0 }}>{tpl.name}</h4>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEdit(tpl)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 12px", fontFamily: font.body, fontSize: 11, color: C.creamDim, cursor: "pointer" }}>Edit</button>
                <button onClick={() => handleDelete(tpl.id)} style={{ background: "transparent", border: "1px solid rgba(229,57,53,0.3)", borderRadius: 6, padding: "6px 12px", fontFamily: font.body, fontSize: 11, color: "#e53935", cursor: "pointer" }}>Delete</button>
              </div>
            </div>
            <div style={{ fontFamily: font.body, fontSize: 12, color: C.gold, marginBottom: 6 }}>{tpl.subject}</div>
            <div style={{ fontFamily: font.body, fontSize: 12, color: C.mute, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 80, overflow: "hidden" }}>{tpl.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Contacts View ──
function ContactsView({ contacts }) {
  return (
    <div style={{ ...fadeIn, padding: 24 }}>
      <h3 style={{ fontFamily: font.body, fontSize: 16, fontWeight: 600, color: C.cream, marginBottom: 20 }}>Contacts</h3>
      {contacts.length === 0 && (
        <p style={{ fontFamily: font.body, fontSize: 13, color: C.mute }}>
          No contacts yet. Contacts are auto-created when you receive emails.
        </p>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {contacts.map(c => (
          <div key={c.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(201,162,39,0.3)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,162,39,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.gold }}>
                {(c.name || c.email || "?")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.cream }}>{c.name}</div>
                <div style={{ fontFamily: font.body, fontSize: 11, color: C.mute }}>{c.email}</div>
              </div>
            </div>
            <div style={{ fontFamily: font.body, fontSize: 11, color: C.mute }}>
              {c.messageCount} message{c.messageCount !== 1 ? "s" : ""} &middot; Last: {formatDate(c.lastMessageDate)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Gmail Connect Screen ──
function GmailConnect({ onConnect, loading }) {
  return (
    <div style={{ ...fadeIn, display: "flex", alignItems: "center", justifyContent: "center", flex: 1, padding: 40 }}>
      <div style={{ textAlign: "center", maxWidth: 460 }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>{"\u{1F4E7}"}</div>
        <h2 style={{ fontFamily: font.display, fontSize: 28, color: C.cream, marginBottom: 12 }}>Connect Your Gmail</h2>
        <p style={{ fontFamily: font.body, fontSize: 14, color: C.mute, lineHeight: 1.7, marginBottom: 28 }}>
          Connect your Gmail account to send and receive emails directly from the EstateLand dashboard.
          We use secure OAuth 2.0 authentication &mdash; your password is never stored.
        </p>
        <button
          onClick={onConnect}
          disabled={loading}
          style={{
            padding: "14px 36px", background: C.gold, color: C.void, border: "none", borderRadius: 12,
            fontFamily: font.body, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            transition: "transform 0.15s, box-shadow 0.15s", opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(201,162,39,0.3)"; }}}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
        >
          {loading ? "Connecting..." : "Connect Gmail Account"}
        </button>
        <p style={{ fontFamily: font.body, fontSize: 11, color: C.mute, marginTop: 16 }}>
          Requires Google Cloud project with Gmail API enabled.
        </p>
      </div>
    </div>
  );
}

// ── Utilities ──
function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const isThisYear = d.getFullYear() === now.getFullYear();
    if (isThisYear) return d.toLocaleDateString([], { month: "short", day: "numeric" });
    return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatSize(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function sanitizeHtml(html) {
  // Basic sanitization: remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}

// ════════════════════════════════════════
// ██  MAIN EMAIL CENTER COMPONENT
// ════════════════════════════════════════

export default function EmailCenter() {
  const [gmailStatus, setGmailStatus] = useState({ connected: false, email: null });
  const [view, setView] = useState("inbox");
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [thread, setThread] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Check connection status
  const checkStatus = useCallback(async () => {
    try {
      const s = await api("/api/gmail/status");
      setGmailStatus(s);
      return s.connected;
    } catch {
      return false;
    }
  }, []);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      const data = await api("/api/templates");
      setTemplates(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      const data = await api("/api/contacts");
      setContacts(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  // Fetch emails for current folder
  const fetchEmails = useCallback(async (folder, pageToken = null) => {
    setLoading(true);
    try {
      const endpoint = folder === "inbox" ? "/api/emails/inbox" : folder === "sent" ? "/api/emails/sent" : "/api/emails/starred";
      const params = new URLSearchParams();
      if (pageToken) params.set("pageToken", pageToken);
      const data = await api(`${endpoint}?${params}`);
      if (pageToken) {
        setEmails(prev => [...prev, ...(data.messages || [])]);
      } else {
        setEmails(data.messages || []);
      }
      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
      console.error("Fetch emails error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnread = useCallback(async () => {
    try {
      const data = await api("/api/emails/unread-count");
      setUnreadCount(data.count || 0);
    } catch {}
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      const connected = await checkStatus();
      await fetchTemplates();
      if (connected) {
        fetchEmails("inbox");
        fetchUnread();
        fetchContacts();
      }
    })();
  }, []);

  // Poll for new emails every 30s
  useEffect(() => {
    if (!gmailStatus.connected) return;
    const interval = setInterval(() => {
      fetchUnread();
      if (view === "inbox" && !selectedEmail) fetchEmails("inbox");
    }, 30000);
    return () => clearInterval(interval);
  }, [gmailStatus.connected, view, selectedEmail, fetchEmails, fetchUnread]);

  // Handle URL params (from OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail") === "connected") {
      checkStatus().then(connected => {
        if (connected) {
          setNotification("Gmail connected successfully!");
          fetchEmails("inbox");
          fetchUnread();
          fetchContacts();
          setTimeout(() => setNotification(null), 4000);
        }
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("gmail") === "error") {
      setNotification("Gmail connection failed: " + (params.get("msg") || "Unknown error"));
      setTimeout(() => setNotification(null), 6000);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // View change handler
  const handleViewChange = (newView) => {
    setView(newView);
    setSelectedEmail(null);
    setThread([]);
    setSearchResults(null);
    setSearchQuery("");
    if (newView === "inbox" || newView === "sent" || newView === "starred") {
      fetchEmails(newView);
    }
    if (newView === "contacts") fetchContacts();
    if (newView === "templates") fetchTemplates();
  };

  // Select email
  const handleSelectEmail = async (email) => {
    setDetailLoading(true);
    setSelectedEmail(email);
    try {
      const [detail, threadData] = await Promise.all([
        api(`/api/emails/${email.id}`),
        api(`/api/emails/${email.id}/thread`),
      ]);
      setSelectedEmail(detail);
      setThread(Array.isArray(threadData) ? threadData : []);
      // Update unread count
      if (email.isUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        setEmails(prev => prev.map(e => e.id === email.id ? { ...e, isUnread: false } : e));
      }
    } catch (err) {
      console.error("Fetch email detail error:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Star toggle
  const handleStar = async (messageId) => {
    try {
      const result = await api(`/api/emails/${messageId}/star`, { method: "POST" });
      setEmails(prev => prev.map(e => e.id === messageId ? { ...e, isStarred: result.starred } : e));
      if (selectedEmail?.id === messageId) setSelectedEmail(prev => prev ? { ...prev, isStarred: result.starred } : prev);
    } catch {}
  };

  // Send email
  const handleSend = async (emailData) => {
    const result = await api("/api/emails/send", { method: "POST", body: emailData });
    if (result.error) throw new Error(result.error);
    setNotification("Email sent successfully!");
    setTimeout(() => setNotification(null), 3000);
    if (view === "sent") fetchEmails("sent");
  };

  // Search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setLoading(true);
    try {
      const data = await api(`/api/emails/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(data.messages || []);
    } catch {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Connect Gmail
  const handleConnect = async () => {
    setConnectLoading(true);
    try {
      const data = await api("/api/gmail/auth-url");
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to get auth URL. Check server configuration.");
        setConnectLoading(false);
      }
    } catch (err) {
      alert("Error: " + err.message);
      setConnectLoading(false);
    }
  };

  // Disconnect Gmail
  const handleDisconnect = async () => {
    if (!confirm("Disconnect Gmail account? You will need to reconnect to use email features.")) return;
    await api("/api/gmail/disconnect", { method: "POST" });
    setGmailStatus({ connected: false, email: null });
    setEmails([]);
    setSelectedEmail(null);
    setUnreadCount(0);
  };

  // Reply
  const handleReply = (msg) => {
    setReplyTo(msg);
    setShowCompose(true);
  };

  // ── Render ──

  if (!gmailStatus.connected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 128px)" }}>
        <InjectStyles />
        {notification && <Notification message={notification} />}
        <GmailConnect onConnect={handleConnect} loading={connectLoading} />
      </div>
    );
  }

  const displayEmails = searchResults !== null ? searchResults : emails;
  const showingList = !selectedEmail && (view === "inbox" || view === "sent" || view === "starred");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 128px)", position: "relative" }}>
      <InjectStyles />
      {notification && <Notification message={notification} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 0 16px", borderBottom: `1px solid ${C.border}`, marginBottom: 0, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: font.display, fontSize: 26, color: C.cream, margin: 0 }}>Email Center</h1>
          <p style={{ fontFamily: font.body, fontSize: 12, color: C.mute, margin: "4px 0 0" }}>
            Connected: {gmailStatus.email}
            <button onClick={handleDisconnect} style={{ background: "none", border: "none", color: "#e53935", fontFamily: font.body, fontSize: 11, cursor: "pointer", marginLeft: 12, textDecoration: "underline" }}>Disconnect</button>
          </p>
        </div>
        {showingList && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              className="email-compose-input"
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{
                width: 260, padding: "10px 16px", background: C.surfaceLight, border: `1px solid ${C.border}`,
                borderRadius: 8, fontFamily: font.body, fontSize: 12, color: C.cream, transition: "border-color 0.2s",
              }}
            />
            <button onClick={handleSearch} className="email-btn" style={{ padding: "10px 16px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: font.body, fontSize: 12, color: C.creamDim, cursor: "pointer", transition: "all 0.15s" }}>
              Search
            </button>
            {searchResults !== null && (
              <button onClick={() => { setSearchResults(null); setSearchQuery(""); }} style={{ background: "none", border: "none", color: C.mute, fontFamily: font.body, fontSize: 11, cursor: "pointer" }}>Clear</button>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", marginTop: 0 }}>
        <EmailSidebar view={view} setView={handleViewChange} unreadCount={unreadCount} onCompose={() => { setReplyTo(null); setShowCompose(true); }} />

        <div style={{ flex: 1, overflow: "auto", background: "rgba(15,15,15,0.4)", borderRadius: "0 0 12px 0" }}>
          {showingList && !selectedEmail && (
            <EmailList
              emails={displayEmails}
              loading={loading}
              folder={view}
              onSelect={handleSelectEmail}
              onStar={handleStar}
              onLoadMore={() => nextPageToken && fetchEmails(view, nextPageToken)}
              hasMore={!!nextPageToken && !searchResults}
            />
          )}

          {selectedEmail && (
            <EmailDetail
              email={selectedEmail}
              thread={thread}
              loading={detailLoading}
              onBack={() => { setSelectedEmail(null); setThread([]); }}
              onReply={handleReply}
              onStar={handleStar}
            />
          )}

          {view === "templates" && (
            <TemplateManager templates={templates} onRefresh={fetchTemplates} />
          )}

          {view === "contacts" && (
            <ContactsView contacts={contacts} />
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeEmail
          onClose={() => { setShowCompose(false); setReplyTo(null); }}
          onSend={handleSend}
          templates={templates}
          replyTo={replyTo}
          connectedEmail={gmailStatus.email}
        />
      )}
    </div>
  );
}

// ── Notification Toast ──
function Notification({ message }) {
  const isError = message.toLowerCase().includes("fail") || message.toLowerCase().includes("error");
  return (
    <div style={{
      position: "fixed", top: 80, right: 24, zIndex: 2000, padding: "14px 24px",
      background: isError ? "rgba(229,57,53,0.95)" : "rgba(46,125,50,0.95)",
      color: "#fff", borderRadius: 10, fontFamily: font.body, fontSize: 13, fontWeight: 500,
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)", backdropFilter: "blur(8px)",
      animation: "emailSlideIn 0.3s ease",
    }}>
      {message}
    </div>
  );
}
