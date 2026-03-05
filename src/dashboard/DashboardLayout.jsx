import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";
import { C, THEME, font } from "./theme.js";

const T = THEME.dark;

const sidebarLinks = [
  { to: "/dashboard", label: "Overview", adminOnly: true },
  { to: "/dashboard/payments", label: "Payments", adminOnly: true },
  { to: "/dashboard/relators", label: "All Relators", adminOnly: true },
  { to: "/dashboard/users", label: "Users", adminOnly: true },
  { to: "/dashboard/leads", label: "Leads", adminOnly: true },
  { to: "/dashboard/chat", label: "Chat", adminOnly: true },
  { to: "/dashboard/me", label: "My dashboard", adminOnly: false },
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
                <div
                          style={{
                                      position: "absolute", inset: 0,
                                      background: "url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80) center/cover no-repeat",
                                      opacity: 0.08, pointerEvents: "none", zIndex: 0,
                          }}
                          aria-hidden="true"
                        />
                <style>{`
                        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
                              `}</style>
        
          {/* Top bar */}
              <header style={{
                  position: "relative", zIndex: 1, height: 64,
                  background: "rgba(8, 8, 8, 0.85)", backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)", borderBottom: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0 24px", flexShrink: 0,
        }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                                <button type="button" onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle sidebar"
                                              style={{ width: 40, height: 40, borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.cream, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                                            &#9776;
                                </button>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{ width: 32, height: 32, border: `1px solid ${C.gold}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.body, fontSize: 12, color: C.gold, fontWeight: 600 }}>E</div>
                                            <span style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: C.cream, letterSpacing: 0.5 }}>Dashboard</span>
                                </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <span style={{ fontFamily: font.body, fontSize: 13, color: C.mute }}>{userName}</span>
                                <span style={{ fontFamily: font.body, fontSize: 11, color: C.gold, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.1 }}>{role}</span>
                                <button type="button" onClick={handleLogout}
                                              style={{ fontFamily: font.body, fontSize: 12, fontWeight: 500, color: C.mute, background: "transparent", border: `1px solid ${C.border}`, padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}>
                                            Log out
                                </button>
                      </div>
              </header>
        
              <div style={{ position: "relative", zIndex: 1, display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Sidebar */}
                {sidebarOpen && (
                    <aside style={{ width: 260, background: "rgba(8, 8, 8, 0.75)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderRight: `1px solid ${C.border}`, padding: "24px 0", flexShrink: 0 }}>
                                <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                  {navLinks.map((link) => {
                                      const active = location.pathname === link.to || (link.to !== "/dashboard" && location.pathname.startsWith(link.to));
                                      return (
                                                          <Link key={link.to} to={link.to} style={{
                                                                                fontFamily: font.body, fontSize: 13, fontWeight: 500,
                                                                                color: active ? C.gold : C.creamDim, padding: "12px 24px",
                                                                                textDecoration: "none", borderLeft: active ? `3px solid ${C.gold}` : "3px solid transparent",
                                                                                background: active ? "rgba(201,162,39,0.08)" : "transparent",
                                                          }}>
                                                            {link.label}
                                                          </Link>
                                                        );
                    })}
                                </nav>
                                <div style={{ marginTop: 32, padding: "0 24px" }}>
                                              <Link to="/" style={{ fontFamily: font.body, fontSize: 12, color: C.mute, textDecoration: "none" }}>&#8592; Back to website</Link>
                                </div>
                    </aside>
                      )}
              
                {/* Main content */}
                      <main style={{ flex: 1, overflow: "auto", background: "rgba(22, 22, 22, 0.82)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", padding: 32 }}>
                                <Outlet />
                      </main>
              </div>
        </div>
      );
}
