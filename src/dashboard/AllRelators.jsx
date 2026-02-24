import { useState, useMemo } from "react";
import { useDashboard } from "../context/DashboardContext.jsx";
import { C, THEME, font } from "./theme.js";

const T = THEME.dark;

const PLAN_LABELS = { launch: "Basic Plan", growth: "Pro Plan", premier: "Premium Plan" };

function formatShortDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function daysSince(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.floor((today - d) / (24 * 60 * 60 * 1000));
}

const COLUMNS = [
  { key: "plan", label: "Pricing Plan", width: 120, sortKey: "planId", editable: false },
  { key: "state", label: "State", width: 100, sortKey: "state", editable: true },
  { key: "name", label: "Name", width: 140, sortKey: "name", editable: false },
  { key: "email", label: "Email", width: 160, sortKey: "email", editable: false },
  { key: "phone", label: "Number", width: 130, sortKey: "phone", editable: false },
  { key: "county", label: "County", width: 120, sortKey: "county", editable: true },
  { key: "primaryArea", label: "Primary Area", width: 160, sortKey: "primaryArea", editable: true },
  { key: "primarySMR", label: "SMR", width: 80, sortKey: "primarySMR", editable: true },
  { key: "secondaryArea", label: "Secondary Area SMR", width: 160, sortKey: "secondaryArea", editable: true },
  { key: "secondarySMR", label: "Sec SMR", width: 80, sortKey: "secondarySMR", editable: true },
  { key: "signupDate", label: "Signup Date", width: 100, sortKey: "signupDate", editable: true },
  { key: "documentSignDate", label: "Document Sign", width: 110, sortKey: "documentSignDate", editable: true },
  { key: "daysSinceSign", label: "Days since Sign", width: 110, sortKey: "daysSinceSign", editable: false },
  { key: "lastLeadSent", label: "Last Lead Sent", width: 110, sortKey: "lastLeadSent", editable: false },
  { key: "leadSentCount", label: "Lead Sent", width: 90, sortKey: "leadSentCount", editable: false },
  { key: "ha", label: "Ha", width: 60, sortKey: "ha", editable: true },
  { key: "leadType", label: "Lead type", width: 100, sortKey: "leadType", editable: true },
  { key: "remarks", label: "Remarks", width: 160, sortKey: "remarks", editable: true },
  { key: "note", label: "Note", width: 160, sortKey: "note", editable: true },
  { key: "_action", label: "Actions", width: 90, sortKey: null, editable: false, isAction: true },
];

function AllRelators() {
  const { users, leads, updateUser, removeUser } = useDashboard();
  const [sortBy, setSortBy] = useState("signupDate");
  const [sortDir, setSortDir] = useState("desc");
  const [editing, setEditing] = useState(null); // { userId, key }
  const [editValue, setEditValue] = useState("");

  const handleRemove = (u) => {
    if (window.confirm(`Remove ${u.name || u.email}? This cannot be undone.`)) removeUser(u.id);
  };

  const relatorsWithDerived = useMemo(() => {
    return users.map((u) => {
      const userLeads = leads.filter((l) => l.assignedToUserId === u.id);
      const leadSentCount = userLeads.length;
      const lastLeadSentRaw = userLeads.length
        ? userLeads.reduce((max, l) => (l.createdAt > max ? l.createdAt : max), userLeads[0].createdAt)
        : null;
      const lastLeadSent = lastLeadSentRaw ? formatShortDate(lastLeadSentRaw) : "";
      const daysSinceSign = u.documentSignDate ? daysSince(u.documentSignDate) : "";
      return {
        ...u,
        planLabel: PLAN_LABELS[u.planId] || u.planId || "",
        leadSentCount,
        lastLeadSent,
        lastLeadSentRaw,
        daysSinceSign: daysSinceSign === "" ? "" : String(daysSinceSign),
      };
    });
  }, [users, leads]);

  const sorted = useMemo(() => {
    const list = [...relatorsWithDerived];
    list.sort((a, b) => {
      let va, vb;
      if (sortBy === "daysSinceSign") {
        va = a.daysSinceSign === "" ? -1 : parseInt(a.daysSinceSign, 10);
        vb = b.daysSinceSign === "" ? -1 : parseInt(b.daysSinceSign, 10);
      } else if (sortBy === "leadSentCount") {
        va = a.leadSentCount;
        vb = b.leadSentCount;
      } else if (sortBy === "lastLeadSent") {
        va = a.lastLeadSentRaw || "";
        vb = b.lastLeadSentRaw || "";
      } else if (sortBy === "planId") {
        va = a.planLabel || "";
        vb = b.planLabel || "";
      } else {
        va = a[sortBy] ?? "";
        vb = b[sortBy] ?? "";
      }
      if (typeof va === "string") va = (va || "").toLowerCase();
      if (typeof vb === "string") vb = (vb || "").toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [relatorsWithDerived, sortBy, sortDir]);

  const handleSort = (col) => {
    if (col.isAction || col.sortKey === null) return;
    const key = col.sortKey || col.key;
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const startEdit = (user, col) => {
    if (!col.editable) return;
    const raw = user[col.key];
    setEditing({ userId: user.id, key: col.key });
    setEditValue(raw != null ? String(raw) : "");
  };

  const saveEdit = (userId) => {
    if (!editing || editing.userId !== userId) return;
    updateUser(userId, { [editing.key]: editValue });
    setEditing(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditValue("");
  };

  return (
    <div style={{ padding: "0 4px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: font.display, fontSize: 28, color: T.text, marginBottom: 8 }}>All Relators</h1>
        <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute }}>
          Sheet view: onboarding data pre-filled; edit State, County, areas, dates, Ha, and Remarks as needed.
        </p>
      </div>

      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          overflow: "auto",
          maxWidth: "100%",
        }}
      >
        <table style={{ width: "max-content", minWidth: "100%", borderCollapse: "collapse", fontFamily: font.body, fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.surfaceLight, borderBottom: `2px solid ${C.border}` }}>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col)}
                  style={{
                    width: col.width,
                    minWidth: col.width,
                    padding: "12px 10px",
                    textAlign: "left",
                    color: T.mute,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                  }}
                >
                  {col.label} {sortBy === (col.sortKey || col.key) ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} style={{ padding: 32, color: T.mute, textAlign: "center" }}>
                  No relators yet. Add users from Live onboarding or Users.
                </td>
              </tr>
            ) : (
              sorted.map((u) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    background: editing?.userId === u.id ? "rgba(201,162,39,0.06)" : "transparent",
                  }}
                >
                  {COLUMNS.map((col) => {
                    if (col.isAction) {
                      return (
                        <td
                          key={col.key}
                          style={{
                            padding: "8px 10px",
                            borderRight: `1px solid ${C.border}`,
                            verticalAlign: "middle",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleRemove(u)}
                            style={{
                              fontFamily: font.body, fontSize: 11, color: "#e57373", background: "transparent",
                              border: "1px solid rgba(229,115,115,0.5)", padding: "6px 10px", borderRadius: 6, cursor: "pointer",
                            }}
                            title="Remove relator"
                          >
                            Remove
                          </button>
                        </td>
                      );
                    }
                    const isEditing = editing?.userId === u.id && editing?.key === col.key;
                    let display =
                      col.key === "plan"
                        ? u.planLabel
                        : col.key === "daysSinceSign"
                          ? u.daysSinceSign
                          : col.key === "lastLeadSent"
                            ? u.lastLeadSent
                            : col.key === "leadSentCount"
                              ? u.leadSentCount
                              : u[col.key];
                    if (display == null) display = "";

                    return (
                      <td
                        key={col.key}
                        style={{
                          padding: "8px 10px",
                          color: T.text,
                          borderRight: `1px solid ${C.border}`,
                          verticalAlign: "middle",
                        }}
                        onClick={() => startEdit(u, col)}
                      >
                        {isEditing ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <input
                              type={col.key === "signupDate" || col.key === "documentSignDate" ? "date" : "text"}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit(u.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(u.id);
                                if (e.key === "Escape") cancelEdit();
                              }}
                              autoFocus
                              style={{
                                width: "100%",
                                maxWidth: col.width - 16,
                                padding: "6px 8px",
                                fontFamily: font.body,
                                fontSize: 12,
                                color: T.text,
                                background: C.void,
                                border: `1px solid ${C.gold}`,
                                borderRadius: 6,
                              }}
                            />
                          </span>
                        ) : (
                          <span style={{ display: "block", minHeight: 20, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {String(display)}
                            {col.editable && !display && (
                              <span style={{ color: T.mute, fontStyle: "italic" }}>—</span>
                            )}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllRelators;
