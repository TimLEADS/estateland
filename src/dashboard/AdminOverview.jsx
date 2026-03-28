import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext.jsx";
import { C, THEME, font } from "./theme.js";

const T = THEME.dark;

// ── SVG Icons ──
const Icons = {
  users: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  leads: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  payments: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  chat: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  onboarding: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
  submitted: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  relators: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  arrowUp: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  ),
  arrowRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  activity: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  email: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  externalLink: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
};

// ── Mini bar chart (sparkline) ──
function MiniChart({ data, color = C.gold, height = 40 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const barW = Math.max(4, Math.floor(120 / data.length) - 2);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height, opacity: 0.7 }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            width: barW,
            height: `${Math.max(4, (v / max) * 100)}%`,
            background: `linear-gradient(180deg, ${color}, ${color}44)`,
            borderRadius: "2px 2px 0 0",
            transition: "height 0.4s cubic-bezier(.22,1,.36,1)",
          }}
        />
      ))}
    </div>
  );
}

// ── Stat Card ──
function StatCard({ icon, label, value, subtext, color, to, chartData }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      style={{
        background: hovered ? "rgba(22,22,22,0.95)" : C.surface,
        border: `1px solid ${hovered ? color + "55" : C.border}`,
        borderRadius: 16,
        padding: "24px 24px 20px",
        textDecoration: "none",
        transition: "all 0.35s cubic-bezier(.22,1,.36,1)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? `0 8px 32px ${color}15, 0 2px 8px rgba(0,0,0,0.3)` : "0 1px 3px rgba(0,0,0,0.2)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${color}, ${color}44, transparent)`,
          opacity: hovered ? 1 : 0.5,
          transition: "opacity 0.3s",
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `${color}15`,
              border: `1px solid ${color}25`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: color,
              transition: "all 0.3s",
            }}
          >
            {icon}
          </div>
          <div>
            <div style={{ fontFamily: font.body, fontSize: 12, color: T.mute, fontWeight: 500, letterSpacing: 0.3 }}>
              {label}
            </div>
            <div style={{ fontFamily: font.display, fontSize: 32, color: T.text, fontWeight: 600, lineHeight: 1.1, marginTop: 2 }}>
              {value}
            </div>
          </div>
        </div>
        {chartData && <MiniChart data={chartData} color={color} />}
      </div>

      {subtext && (
        <div style={{ fontFamily: font.body, fontSize: 11, color: T.mute, display: "flex", alignItems: "center", gap: 4 }}>
          {subtext}
        </div>
      )}
    </Link>
  );
}

// ── Quick Action Button ──
function QuickAction({ icon, label, description, to }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 20px",
        background: hovered ? "rgba(201,162,39,0.06)" : "transparent",
        border: `1px solid ${hovered ? C.gold + "40" : C.border}`,
        borderRadius: 12,
        textDecoration: "none",
        transition: "all 0.25s cubic-bezier(.22,1,.36,1)",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: hovered ? C.gold + "18" : C.surfaceLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: hovered ? C.gold : T.mute,
          transition: "all 0.25s",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: hovered ? C.gold : T.text, transition: "color 0.25s" }}>
          {label}
        </div>
        <div style={{ fontFamily: font.body, fontSize: 11, color: T.mute, marginTop: 2 }}>{description}</div>
      </div>
      <div style={{ color: hovered ? C.gold : T.mute, transition: "color 0.25s", opacity: hovered ? 1 : 0.5 }}>
        {Icons.arrowRight}
      </div>
    </Link>
  );
}

// ── Activity Item ──
function ActivityItem({ type, text, time, color }) {
  const typeConfig = {
    onboarding: { bg: "#22c55e15", border: "#22c55e30", dot: "#22c55e" },
    payment: { bg: "#3b82f615", border: "#3b82f630", dot: "#3b82f6" },
    lead: { bg: C.gold + "15", border: C.gold + "30", dot: C.gold },
    user: { bg: "#a855f715", border: "#a855f730", dot: "#a855f7" },
    chat: { bg: "#ec489915", border: "#ec489930", dot: "#ec4899" },
  };
  const cfg = typeConfig[type] || typeConfig.lead;

  return (
    <div style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.border}22` }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: cfg.dot,
            marginTop: 5,
            boxShadow: `0 0 8px ${cfg.dot}40`,
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: font.body, fontSize: 13, color: T.text, lineHeight: 1.5 }}>{text}</div>
        <div style={{ fontFamily: font.body, fontSize: 11, color: T.mute, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
          {Icons.clock} {time}
        </div>
      </div>
    </div>
  );
}

// ── Inject dashboard-specific animations ──
function DashboardStyles() {
  return (
    <style>{`
      @keyframes dashFadeIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes dashPulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      @keyframes dashSlideIn {
        from { opacity: 0; transform: translateX(-8px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .dash-animate { animation: dashFadeIn 0.5s cubic-bezier(.22,1,.36,1) both; }
      .dash-animate-1 { animation-delay: 0.05s; }
      .dash-animate-2 { animation-delay: 0.1s; }
      .dash-animate-3 { animation-delay: 0.15s; }
      .dash-animate-4 { animation-delay: 0.2s; }
      .dash-animate-5 { animation-delay: 0.25s; }
      .dash-animate-6 { animation-delay: 0.3s; }
      .dash-animate-7 { animation-delay: 0.35s; }
    `}</style>
  );
}

// ── Helpers ──
function formatTimeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function generateSparkline(count, variance = 5) {
  const base = Math.max(1, Math.floor(count / 7));
  return Array.from({ length: 7 }, () => Math.max(0, base + Math.floor(Math.random() * variance * 2 - variance)));
}

export default function AdminOverview() {
  const { users, leads, payments, chatSessions, inProgressSessions, submittedSessions, onboardingSessions } = useDashboard();

  // Build recent activity feed
  const recentActivity = useMemo(() => {
    const items = [];

    // Recent users
    (users || []).slice(-5).forEach((u) => {
      items.push({
        type: "user",
        text: `${u.name || u.email || "New realtor"} was added`,
        time: formatTimeAgo(u.createdAt),
        date: u.createdAt,
      });
    });

    // Recent leads
    (leads || []).slice(-5).forEach((l) => {
      items.push({
        type: "lead",
        text: `Lead created: ${l.address || "New lead"}`,
        time: formatTimeAgo(l.createdAt),
        date: l.createdAt,
      });
    });

    // Recent payments
    (payments || []).slice(-3).forEach((p) => {
      items.push({
        type: "payment",
        text: `Payment received ${p.customerEmail ? "from " + p.customerEmail : ""} - ${p.planId || "plan"}`,
        time: formatTimeAgo(p.paidAt),
        date: p.paidAt,
      });
    });

    // Submitted onboarding
    (submittedSessions || []).slice(-3).forEach((s) => {
      items.push({
        type: "onboarding",
        text: `Onboarding submitted${s.contact?.name ? " by " + s.contact.name : ""}`,
        time: formatTimeAgo(s.submittedAt || s.lastActivityAt),
        date: s.submittedAt || s.lastActivityAt,
      });
    });

    // Chat sessions
    (chatSessions || []).slice(-3).forEach((s) => {
      items.push({
        type: "chat",
        text: `Chat session on ${s.page || "/"} (${s.messages?.length || 0} messages)`,
        time: formatTimeAgo(s.startedAt),
        date: s.startedAt,
      });
    });

    return items
      .filter((i) => i.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }, [users, leads, payments, submittedSessions, chatSessions]);

  // Revenue estimate from payments
  const totalRevenue = useMemo(() => {
    return (payments || []).reduce((sum, p) => sum + (p.amountTotal || 0), 0);
  }, [payments]);

  const formatRevenue = (cents) => {
    if (!cents) return "$0";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
  };

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const liveCount = inProgressSessions?.length || 0;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <DashboardStyles />

      {/* Header */}
      <div className="dash-animate" style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: font.display, fontSize: "clamp(26px, 3vw, 34px)", color: T.text, marginBottom: 6, letterSpacing: 0.5 }}>
              {greeting}, Admin
            </h1>
            <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute, lineHeight: 1.5 }}>
              Here is what is happening across Estate Land today.
            </p>
          </div>
          {liveCount > 0 && (
            <Link
              to="/dashboard/live"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: 10,
                textDecoration: "none",
                fontFamily: font.body,
                fontSize: 13,
                fontWeight: 600,
                color: "#22c55e",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                  animation: "dashPulse 1.5s ease infinite",
                  boxShadow: "0 0 8px rgba(34,197,94,0.5)",
                }}
              />
              {liveCount} live onboarding{liveCount > 1 ? "s" : ""}
            </Link>
          )}
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div className="dash-animate dash-animate-1">
          <StatCard
            icon={Icons.users}
            label="Total Realtors"
            value={users.length}
            subtext={`${submittedSessions.length} from onboarding`}
            color={C.gold}
            to="/dashboard/users"
            chartData={generateSparkline(users.length, 3)}
          />
        </div>
        <div className="dash-animate dash-animate-2">
          <StatCard
            icon={Icons.leads}
            label="Active Leads"
            value={leads.length}
            subtext={`Assigned across ${users.length} realtors`}
            color="#3b82f6"
            to="/dashboard/leads"
            chartData={generateSparkline(leads.length, 4)}
          />
        </div>
        <div className="dash-animate dash-animate-3">
          <StatCard
            icon={Icons.payments}
            label="Revenue"
            value={formatRevenue(totalRevenue)}
            subtext={`${(payments || []).length} successful payment${(payments || []).length !== 1 ? "s" : ""}`}
            color="#22c55e"
            to="/dashboard/payments"
            chartData={generateSparkline((payments || []).length, 2)}
          />
        </div>
        <div className="dash-animate dash-animate-4">
          <StatCard
            icon={Icons.chat}
            label="Chat Sessions"
            value={(chatSessions || []).length}
            subtext="Website chatbot conversations"
            color="#ec4899"
            to="/dashboard/chat"
            chartData={generateSparkline((chatSessions || []).length, 3)}
          />
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {[
          { label: "In Progress", value: inProgressSessions.length, color: "#f59e0b", to: "/dashboard/live" },
          { label: "Submissions", value: submittedSessions.length, color: "#10b981", to: "/dashboard/relators" },
          { label: "All Relators", value: users.length, color: C.goldLight, to: "/dashboard/relators" },
        ].map((item, i) => (
          <Link
            key={item.label}
            to={item.to}
            className={`dash-animate dash-animate-${i + 5}`}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "16px 20px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = item.color + "50")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
          >
            <span style={{ fontFamily: font.body, fontSize: 13, color: T.mute, fontWeight: 500 }}>{item.label}</span>
            <span style={{ fontFamily: font.display, fontSize: 24, color: item.color, fontWeight: 600 }}>{item.value}</span>
          </Link>
        ))}
      </div>

      {/* Two Column Layout: Activity + Quick Actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: 20,
        }}
      >
        {/* Recent Activity */}
        <div
          className="dash-animate dash-animate-5"
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "24px 24px 16px",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ color: C.gold }}>{Icons.activity}</div>
              <h2 style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: T.text, margin: 0 }}>Recent Activity</h2>
            </div>
            <span style={{ fontFamily: font.body, fontSize: 11, color: T.mute }}>
              Last {recentActivity.length} events
            </span>
          </div>

          <div style={{ maxHeight: 380, overflow: "auto" }}>
            {recentActivity.length === 0 ? (
              <p style={{ fontFamily: font.body, fontSize: 13, color: T.mute, padding: "20px 0", textAlign: "center" }}>
                No recent activity yet. Events will appear here as realtors onboard, leads are created, and payments come in.
              </p>
            ) : (
              recentActivity.map((item, i) => (
                <ActivityItem key={i} type={item.type} text={item.text} time={item.time} />
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="dash-animate dash-animate-6"
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: 24,
          }}
        >
          <h2 style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.gold }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </span>
            Quick Actions
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <QuickAction
              icon={Icons.leads}
              label="Create Lead"
              description="Add a new lead and assign to a realtor"
              to="/dashboard/leads"
            />
            <QuickAction
              icon={Icons.users}
              label="Manage Users"
              description="View, add, or edit realtors"
              to="/dashboard/users"
            />
            <QuickAction
              icon={Icons.relators}
              label="Relators Sheet"
              description="Full spreadsheet view of all relators"
              to="/dashboard/relators"
            />
            <QuickAction
              icon={Icons.payments}
              label="View Payments"
              description="Track revenue and transactions"
              to="/dashboard/payments"
            />
            <QuickAction
              icon={Icons.email}
              label="Email Center"
              description="Send and manage email communications"
              to="/dashboard/email"
            />
            <QuickAction
              icon={Icons.externalLink}
              label="Visit Website"
              description="Open the Estate Land public site"
              to="/"
            />
          </div>
        </div>
      </div>

      {/* Responsive override for the two-column layout */}
      <style>{`
        @media (max-width: 860px) {
          div[style*="1.5fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
