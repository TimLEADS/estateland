import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext.jsx";
import { C, font } from "./theme.js";

// Demo credentials (no real auth — for development only)
const ADMIN_EMAIL = "admin@estateland.us";
const ADMIN_PASSWORD = "Admin123!";
const REALTOR_EMAIL = "realtor@estateland.us";
const REALTOR_PASSWORD = "Realtor123!";

export default function DashboardLogin() {
  const navigate = useNavigate();
  const { users, createUser } = useDashboard();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem("dashboard_role", "admin");
      sessionStorage.setItem("dashboard_user_name", "Admin");
      navigate("/dashboard", { replace: true });
      return;
    }
    if (email === REALTOR_EMAIL && password === REALTOR_PASSWORD) {
      let realtor = users.find((u) => u.email === REALTOR_EMAIL);
      if (!realtor) {
        const newId = createUser({ name: "Demo Realtor", email: REALTOR_EMAIL, phone: "", brokerage: "Demo Brokerage", region: "" });
        sessionStorage.setItem("dashboard_role", "user");
        sessionStorage.setItem("dashboard_user_id", newId);
        sessionStorage.setItem("dashboard_user_name", "Demo Realtor");
      } else {
        sessionStorage.setItem("dashboard_role", "user");
        sessionStorage.setItem("dashboard_user_id", realtor.id);
        sessionStorage.setItem("dashboard_user_name", realtor.name || "Demo Realtor");
      }
      navigate("/dashboard/me", { replace: true });
      return;
    }
    setError("Invalid email or password.");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.void,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80) center/cover no-repeat",
          opacity: 0.12,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
        maxWidth: 420,
        background: "rgba(15, 15, 15, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: 40,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, border: `2px solid ${C.gold}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.display, fontSize: 24, color: C.gold, fontWeight: 600 }}>E</div>
          <div>
            <div style={{ fontFamily: font.body, fontSize: 18, fontWeight: 600, color: C.cream }}>Estate Land</div>
            <div style={{ fontFamily: font.body, fontSize: 12, color: C.mute }}>Dashboard sign in</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 20 }}>
            <span style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, color: C.mute, display: "block", marginBottom: 8 }}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              style={{
                width: "100%", padding: "14px 16px", fontFamily: font.body, fontSize: 14, color: C.cream,
                background: C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: 10,
              }}
            />
          </label>
          <label style={{ display: "block", marginBottom: 20 }}>
            <span style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, color: C.mute, display: "block", marginBottom: 8 }}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%", padding: "14px 16px", fontFamily: font.body, fontSize: 14, color: C.cream,
                background: C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: 10,
              }}
            />
          </label>
          {error && <p style={{ fontFamily: font.body, fontSize: 12, color: "#e57373", marginBottom: 16 }}>{error}</p>}
          <button
            type="submit"
            style={{
              width: "100%", padding: "16px", fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.void,
              background: C.gold, border: "none", borderRadius: 10, cursor: "pointer",
            }}
          >
            Sign in
          </button>
        </form>
        <p style={{ marginTop: 24, fontFamily: font.body, fontSize: 11, color: C.mute, textAlign: "center" }}>
          <a href="/" style={{ color: C.gold, textDecoration: "none" }}>Back to website</a>
        </p>
      </div>
    </div>
  );
}
