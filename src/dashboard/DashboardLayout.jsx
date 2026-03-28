import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";
import { C, THEME, font } from "./theme.js";

const T = THEME.dark;

// ── SVG Icons for sidebar ──
const SidebarIcons = {
  overview: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  live: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  payments: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  relators: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  leads: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  myDashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  back: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  close: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  notification: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

const sidebarLinks = [
  { to: "/dashboard", label: "Overview", icon: "overview", adminOnly: true },
  { to: "/dashboard/live", label: "Live Onboarding", icon: "live", adminOnly: true },
  { to: "/dashboard/payments", label: "Payments", icon: "payments", adminOnly: true },
  { to: "/dashboard/relators", label: "All Relators", icon: "relators", adminOnly: true },
  { to: "/dashboard/users", label: "Users", icon: "users", adminOnly: true },
  { to: "/dashboard/leads", label: "Leads", icon: "leads", adminOnly: true },
  { to: "/dashboard/email", label: "Email Center", icon: "email", adminOnly: true },
  { to: "/dashboard/chat", label: "Chat", icon: "chat", adminOnly: true },
  { to: "/dashboard/me", label: "My Dashboard", icon: "myDashboard", adminOnly: false },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const role = sessionStorage.getItem("dashboard_role");
  const isAdmin = role === "admin";
  const userName = sessionStorage.getItem("dashboard_user_name") || (isAdmin ? "Admin" : "Realtor");

  if (!role) return <Navigate to="/dashboard/login" replace />;

  const handleLogout = () => {
    sessionStorage.removeItem("dashboard_role");
    sessionStorage.removeItem("dashboard_user_id");
    sessionStorage.removeItem("dashboard_user_name");
    navigate("/dashboard/login");
  };

  const navLinks = sidebarLinks.filter((l) => !l.adminOnly || isAdmin);

  return (
    <div style={{ minHeight: "100vh", background: C.surface, position: "relative", display: "flex", flexDirection: "column" }}>
      {/* Premium ambient background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.4 }}>
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,162,39,0.04) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,162,39,0.03) 0%, transparent 70%)" }} />
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        .sidebar-link { transition: all 0.2s cubic-bezier(.22,1,.36,1); }
        .sidebar-link:hover { background: rgba(201,162,39,0.08) !important; }
        @media (max-width: 860px) {
          .dashboard-sidebar { position: fixed !important; top: 0 !important; left: 0 !important; bottom: 0 !important; z-index: 100 !important; transform: translateX(-100%); transition: transform 0.3s cubic-bezier(.22,1,.36,1) !important; }
          .dashboard-sidebar.open { transform: translateX(0) !important; }
          .sidebar-backdrop { display: block !important; }
        }
      `}</style>

      {/* Header */}
      <header
        style={{
          position: "relative",
          zIndex: 50,
          height: 64,
          background: "rgba(8,8,8,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: "transparent",
              color: C.cream,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold + "60"; e.currentTarget.style.color = C.gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.cream; }}
          >
            {sidebarOpen ? SidebarIcons.close : SidebarIcons.menu}
          </button>
          <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div
              style={{
                width: 34,
                height: 34,
                border: `1.5px solid ${C.gold}`,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: font.display,
                fontSize: 16,
                color: C.gold,
                fontWeight: 600,
                background: C.gold + "10",
              }}
            >
              E
            </div>
            <div>
              <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: C.cream, letterSpacing: 0.5 }}>
                Estate Land
              </span>
              <span
                style={{
                  fontFamily: font.body,
                  fontSize: 10,
                  color: C.gold,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  marginLeft: 8,
                }}
              >
                Dashboard
              </span>
            </div>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* User info */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.gold}30, ${C.goldLight}20)`,
                border: `1px solid ${C.gold}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: font.body,
                fontSize: 13,
                fontWeight: 600,
                color: C.gold,
              }}
            >
              {(userName || "U")[0].toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: font.body, fontSize: 13, color: C.cream, fontWeight: 500 }}>{userName}</span>
              <span
                style={{
                  fontFamily: font.body,
                  fontSize: 10,
                  color: isAdmin ? C.gold : C.mute,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {role}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              fontFamily: font.body,
              fontSize: 12,
              fontWeight: 500,
              color: C.mute,
              background: "transparent",
              border: `1px solid ${C.border}`,
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e5737380"; e.currentTarget.style.color = "#e57373"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mute; }}
          >
            {SidebarIcons.logout}
            <span>Log out</span>
          </button>
        </div>
      </header>

      <div style={{ position: "relative", zIndex: 1, display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            style={{
              display: "none",
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 99,
              backdropFilter: "blur(4px)",
            }}
          />
        )}

        {/* Sidebar */}
        {sidebarOpen && (
          <aside
            className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}
            style={{
              width: 260,
              background: "rgba(8,8,8,0.82)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRight: `1px solid ${C.border}`,
              padding: "20px 0",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflowY: "auto",
            }}
          >
            <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {isAdmin && (
                <div
                  style={{
                    fontFamily: font.body,
                    fontSize: 10,
                    fontWeight: 600,
                    color: C.mute,
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    padding: "8px 24px 12px",
                  }}
                >
                  Admin Panel
                </div>
              )}
              {navLinks.map((link) => {
                const active =
                  (link.to === "/dashboard" && location.pathname === "/dashboard") ||
                  (link.to !== "/dashboard" && location.pathname.startsWith(link.to));
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="sidebar-link"
                    style={{
                      fontFamily: font.body,
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      color: active ? C.gold : C.creamDim,
                      padding: "11px 24px",
                      textDecoration: "none",
                      borderLeft: active ? `3px solid ${C.gold}` : "3px solid transparent",
                      background: active ? "rgba(201,162,39,0.08)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                    onClick={() => {
                      // Close sidebar on mobile after nav
                      if (window.innerWidth <= 860) setSidebarOpen(false);
                    }}
                  >
                    <span style={{ color: active ? C.gold : C.mute, display: "flex", alignItems: "center", transition: "color 0.2s" }}>
                      {SidebarIcons[link.icon]}
                    </span>
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}`, marginTop: 16 }}>
              <Link
                to="/"
                className="sidebar-link"
                style={{
                  fontFamily: font.body,
                  fontSize: 12,
                  color: C.mute,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 0",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.mute)}
              >
                {SidebarIcons.back}
                Back to website
              </Link>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            overflow: "auto",
            background: "linear-gradient(180deg, rgba(15,15,15,0.95) 0%, rgba(22,22,22,0.9) 100%)",
            padding: "clamp(20px, 3vw, 32px)",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
