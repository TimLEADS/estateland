import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext.jsx";
import { C, font } from "./theme.js";

// Admin credentials (hardcoded -- no real auth)
const ADMIN_EMAIL = "admin@estateland.us";
const ADMIN_PASSWORD = "Admin123!";

// Passwords are stored in localStorage keyed by user id
function getStoredPassword(userId) {
  try { return localStorage.getItem("user_pw_" + userId) || ""; } catch { return ""; }
}

export default function DashboardLogin() {
  const navigate = useNavigate();
  const { users } = useDashboard();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate brief auth delay for UX
    setTimeout(() => {
      // Admin login
      if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        sessionStorage.setItem("dashboard_role", "admin");
        sessionStorage.setItem("dashboard_user_name", "Admin");
        navigate("/dashboard", { replace: true });
        return;
      }

      // Real user login
      const matchedUser = users.find(
        (u) => u.email && u.email.trim().toLowerCase() === email.trim().toLowerCase()
      );

      if (matchedUser) {
        const storedPw = getStoredPassword(matchedUser.id);
        const dbPw = matchedUser.password || "";
        const validPassword = storedPw || dbPw;

        if (validPassword && validPassword === password) {
          sessionStorage.setItem("dashboard_role", "user");
          sessionStorage.setItem("dashboard_user_id", matchedUser.id);
          sessionStorage.setItem("dashboard_user_name", matchedUser.name || matchedUser.email);
          navigate("/dashboard/me", { replace: true });
          return;
        } else if (!validPassword) {
          setError("No password set for this account. Ask your admin to set a password.");
          setLoading(false);
          return;
        }
      }

      setError("Invalid email or password.");
      setLoading(false);
    }, 400);
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loginGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes loginSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .login-input:focus {
          border-color: ${C.gold} !important;
          outline: none;
          box-shadow: 0 0 0 3px rgba(201,162,39,0.1);
        }
        .login-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(201,162,39,0.3);
        }
        .login-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: none;
        }
      `}</style>

      {/* Background effects */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(15,15,15,0.98) 0%, rgba(22,22,22,0.95) 50%, rgba(201,162,39,0.04) 100%)",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "15%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(201,162,39,0.06) 0%, transparent 70%)`,
          animation: "loginGlow 4s ease-in-out infinite",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "10%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(201,162,39,0.04) 0%, transparent 70%)`,
          animation: "loginGlow 5s ease-in-out infinite 1s",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      {/* Login Card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 440,
          background: "rgba(15, 15, 15, 0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: "48px 40px",
          animation: "loginFadeIn 0.5s cubic-bezier(.22,1,.36,1) both",
        }}
      >
        {/* Top accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: 2,
            background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
            borderRadius: "0 0 4px 4px",
          }}
        />

        {/* Logo / Brand */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 56,
              height: 56,
              border: `2px solid ${C.gold}`,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: font.display,
              fontSize: 28,
              color: C.gold,
              fontWeight: 600,
              marginBottom: 16,
              background: `rgba(201,162,39,0.06)`,
              boxShadow: `0 0 32px rgba(201,162,39,0.1)`,
            }}
          >
            E
          </div>
          <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 500, color: C.cream, letterSpacing: 2, textAlign: "center" }}>
            ESTATE LAND
          </div>
          <div style={{ fontFamily: font.body, fontSize: 13, color: C.mute, marginTop: 6, textAlign: "center" }}>
            Sign in to your dashboard
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 20 }}>
            <span
              style={{
                fontFamily: font.body,
                fontSize: 12,
                fontWeight: 600,
                color: C.mute,
                display: "block",
                marginBottom: 8,
                letterSpacing: 0.3,
              }}
            >
              Email address
            </span>
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                fontFamily: font.body,
                fontSize: 14,
                color: C.cream,
                background: C.surfaceLight,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                transition: "all 0.25s",
              }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 24 }}>
            <span
              style={{
                fontFamily: font.body,
                fontSize: 12,
                fontWeight: 600,
                color: C.mute,
                display: "block",
                marginBottom: 8,
                letterSpacing: 0.3,
              }}
            >
              Password
            </span>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                fontFamily: font.body,
                fontSize: 14,
                color: C.cream,
                background: C.surfaceLight,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                transition: "all 0.25s",
              }}
            />
          </label>

          {error && (
            <div
              style={{
                fontFamily: font.body,
                fontSize: 12,
                color: "#e57373",
                marginBottom: 16,
                padding: "10px 14px",
                background: "rgba(229,115,115,0.08)",
                border: "1px solid rgba(229,115,115,0.2)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          <button
            className="login-submit"
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              fontFamily: font.body,
              fontSize: 14,
              fontWeight: 600,
              color: C.void,
              background: loading ? C.gold + "80" : C.gold,
              border: "none",
              borderRadius: 12,
              cursor: loading ? "wait" : "pointer",
              transition: "all 0.25s cubic-bezier(.22,1,.36,1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              letterSpacing: 0.5,
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(8,8,8,0.3)",
                    borderTop: "2px solid " + C.void,
                    borderRadius: "50%",
                    animation: "loginSpin 0.6s linear infinite",
                  }}
                />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div style={{ marginTop: 28, textAlign: "center" }}>
          <Link
            to="/"
            style={{
              fontFamily: font.body,
              fontSize: 12,
              color: C.mute,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.mute)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
