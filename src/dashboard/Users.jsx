import { useState } from "react";
import { useDashboard } from "../context/DashboardContext.jsx";
import { C, THEME, font } from "./theme.js";

const T = THEME.dark;

// Passwords are stored in localStorage keyed by user id
// Key: "user_pw_<userId>", Value: plaintext password
function savePassword(userId, pw) {
  try { localStorage.setItem("user_pw_" + userId, pw); } catch (_) {}
}
function getStoredPassword(userId) {
  try { return localStorage.getItem("user_pw_" + userId) || ""; } catch { return ""; }
}

export default function Users() {
  const { users, createUser, updateUser, removeUser } = useDashboard();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", brokerage: "", planId: "", region: "", password: "" });
  const [editingPassword, setEditingPassword] = useState(null); // userId
  const [newPassword, setNewPassword] = useState("");

  const handleRemove = (u) => {
    if (window.confirm(`Remove ${u.name || u.email}? This cannot be undone.`)) removeUser(u.id);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const pw = form.password || "";
    createUser(form).then((newId) => {
      if (pw && newId) {
        savePassword(newId, pw);
        // also persist to DB (best effort)
        updateUser(newId, { password: pw });
      }
    }).catch(() => {
      // createUser may not return a promise in all cases; handle sync path too
    });
    // Also handle synchronous case (createUser returns id directly)
    setForm({ name: "", email: "", phone: "", brokerage: "", planId: "", region: "", password: "" });
    setShowForm(false);
  };

  const savePasswordChange = (userId) => {
    const pw = newPassword.trim();
    if (pw) {
      savePassword(userId, pw);          // save to localStorage immediately
      updateUser(userId, { password: pw }); // also try to save to DB (works once backend has column)
    }
    setEditingPassword(null);
    setNewPassword("");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontFamily: font.display, fontSize: "clamp(24px, 3vw, 30px)", color: T.text, marginBottom: 6 }}>Users</h1>
          <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute }}>
            Realtors created from onboarding or manually.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          style={{
            fontFamily: font.body,
            fontSize: 13,
            fontWeight: 600,
            color: C.void,
            background: C.gold,
            border: "none",
            padding: "12px 24px",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          + Create user
        </button>
      </div>

      {showForm && (
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 24,
            marginBottom: 32,
          }}
        >
          <h2 style={{ fontFamily: font.body, fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 20 }}>
            New realtor
          </h2>
          <form
            onSubmit={handleCreate}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}
          >
            {["name", "email", "phone", "brokerage", "region"].map((key) => (
              <input
                key={key}
                type={key === "email" ? "email" : "text"}
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                value={form[key] || ""}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                style={{
                  padding: "12px 16px",
                  fontFamily: font.body,
                  fontSize: 14,
                  color: T.text,
                  background: C.surfaceLight,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                }}
              />
            ))}
            <input
              type="text"
              placeholder="Password (for login)"
              value={form.password || ""}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              style={{
                padding: "12px 16px",
                fontFamily: font.body,
                fontSize: 14,
                color: T.text,
                background: C.surfaceLight,
                border: `1px solid ${C.gold}`,
                borderRadius: 8,
              }}
            />
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <button
                type="submit"
                style={{
                  fontFamily: font.body,
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.void,
                  background: C.gold,
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  fontFamily: font.body,
                  fontSize: 13,
                  color: T.mute,
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  padding: "12px 24px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {users.length === 0 ? (
          <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute }}>
            No users yet. Create one from Live onboarding or use the button above.
          </p>
        ) : (
          users.map((u) => {
            const storedPw = getStoredPassword(u.id);
            const hasPassword = !!(storedPw || u.password);

            return (
              <div
                key={u.id}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: T.text }}>
                    {u.name || "—"}
                  </div>
                  <div style={{ fontFamily: font.body, fontSize: 13, color: T.mute }}>
                    {u.email} {u.brokerage ? `· ${u.brokerage}` : ""}
                  </div>
                  {u.region && (
                    <div style={{ fontFamily: font.body, fontSize: 12, color: T.mute, marginTop: 4 }}>
                      Region: {u.region}
                    </div>
                  )}

                  {/* Password management */}
                  <div style={{ marginTop: 10 }}>
                    {editingPassword === u.id ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <input
                          type="text"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New password"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === "Enter") savePasswordChange(u.id); if (e.key === "Escape") { setEditingPassword(null); setNewPassword(""); } }}
                          style={{
                            padding: "8px 12px",
                            fontFamily: font.body,
                            fontSize: 13,
                            color: T.text,
                            background: C.surfaceLight,
                            border: `1px solid ${C.gold}`,
                            borderRadius: 6,
                            width: 200,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => savePasswordChange(u.id)}
                          style={{
                            fontFamily: font.body,
                            fontSize: 12,
                            fontWeight: 600,
                            color: C.void,
                            background: C.gold,
                            border: "none",
                            padding: "8px 14px",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingPassword(null); setNewPassword(""); }}
                          style={{
                            fontFamily: font.body,
                            fontSize: 12,
                            color: T.mute,
                            background: "transparent",
                            border: `1px solid ${C.border}`,
                            padding: "8px 14px",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setEditingPassword(u.id); setNewPassword(storedPw || u.password || ""); }}
                        style={{
                          fontFamily: font.body,
                          fontSize: 11,
                          color: hasPassword ? "#22c55e" : C.gold,
                          background: "transparent",
                          border: `1px solid ${hasPassword ? "rgba(34,197,94,0.4)" : C.gold}`,
                          padding: "5px 10px",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        {hasPassword ? "✓ Password set — change" : "⚠ Set login password"}
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: font.body, fontSize: 11, color: C.mute }}>{u.id}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(u)}
                    style={{
                      fontFamily: font.body,
                      fontSize: 12,
                      color: "#e57373",
                      background: "transparent",
                      border: "1px solid rgba(229,115,115,0.5)",
                      padding: "8px 14px",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                    title="Remove user"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
