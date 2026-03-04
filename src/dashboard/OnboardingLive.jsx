import { useEffect, useState } from "react";
import { useDashboard } from "../context/DashboardContext.jsx";
import { C, THEME, font } from "./theme.js";

const T = THEME.dark;

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function OnboardingLive() {
  const { inProgressSessions, submittedSessions, createUser, users } = useDashboard();
  const [now, setNow] = useState(() => new Date().toISOString());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date().toISOString()), 2000);
    return () => clearInterval(t);
  }, []);

  const createUserFromSubmission = (sub) => {
    const c = sub.contact || {};
    const email = (c.email || "").toLowerCase().trim();

    // Prevent adding a second relator if a user with this email already exists
    if (email) {
      const alreadyExists = users.some(
        (u) => (u.email || "").toLowerCase().trim() === email
      );
      if (alreadyExists) {
        alert(`A relator with email "${c.email}" already exists. No duplicate was added.`);
        return;
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    createUser({
      name: c.name,
      email: c.email,
      phone: c.phone,
      planId: sub.plan?.id,
      region: sub.territory?.region || "",
      zips: sub.territory?.zips || "",
      state: c.state || "",
      primaryArea: c.primaryAreas || "",
      primarySMR: c.radius || "",
      secondaryArea: c.secondaryAreas || "",
      secondarySMR: "",
      leadType: c.leadType || "",
      note: c.note || "",
      signupDate: today,
      documentSignDate: today,
    });
  };

  return (
    <div>
      <h1 style={{ fontFamily: font.display, fontSize: 28, color: T.text, marginBottom: 8 }}>Live onboarding</h1>
      <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute, marginBottom: 32 }}>
        See when a realtor is filling the onboarding form. Data updates as they move through steps. Last refresh:{" "}
        {formatTime(now)}
      </p>

      {inProgressSessions.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontFamily: font.body,
              fontSize: 14,
              fontWeight: 600,
              color: C.gold,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#22c55e",
                animation: "pulse 1.5s ease infinite",
              }}
            />
            In progress now
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {inProgressSessions.map((ses) => (
              <div
                key={ses.id}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.gold}`,
                  borderRadius: 12,
                  padding: 24,
                  boxShadow: "0 0 24px rgba(201,162,39,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: font.body,
                        fontSize: 11,
                        color: C.gold,
                        fontWeight: 600,
                        letterSpacing: 0.1,
                      }}
                    >
                      Session {ses.id.slice(-8)}
                    </div>
                    <div style={{ fontFamily: font.body, fontSize: 13, color: T.mute, marginTop: 4 }}>
                      Filling form · Last activity: {formatTime(ses.lastActivityAt)}
                    </div>
                  </div>
                  <span style={{ fontFamily: font.body, fontSize: 11, color: "#22c55e", fontWeight: 600 }}>
                    LIVE
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 16,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 12,
                    fontFamily: font.body,
                    fontSize: 13,
                    color: T.textDim,
                  }}
                >
                  {ses.plan && <div><strong>Plan:</strong> {ses.plan.name}</div>}
                  {ses.contact?.name && <div><strong>Name:</strong> {ses.contact.name}</div>}
                  {ses.contact?.email && <div><strong>Email:</strong> {ses.contact.email}</div>}
                  {ses.contact?.phone && <div><strong>Phone:</strong> {ses.contact.phone}</div>}
                  {ses.contact?.state && <div><strong>State:</strong> {ses.contact.state}</div>}
                  {ses.contact?.primaryAreas && (
                    <div><strong>Primary areas:</strong> {ses.contact.primaryAreas}</div>
                  )}
                  {ses.contact?.secondaryAreas && (
                    <div><strong>Secondary areas:</strong> {ses.contact.secondaryAreas}</div>
                  )}
                  {ses.contact?.radius && <div><strong>Radius:</strong> {ses.contact.radius} mi</div>}
                  {ses.contact?.leadType && <div><strong>Lead type:</strong> {ses.contact.leadType}</div>}
                  {ses.contact?.note && <div><strong>Note:</strong> {ses.contact.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {inProgressSessions.length === 0 && (
        <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute, marginBottom: 32 }}>
          No one is filling the form right now. Open{" "}
          <a href="/get-started" target="_blank" rel="noopener noreferrer" style={{ color: C.gold }}>
            /get-started
          </a>{" "}
          in another tab to see a live session here.
        </p>
      )}

      <section>
        <h2
          style={{
            fontFamily: font.body,
            fontSize: 14,
            fontWeight: 600,
            color: T.text,
            marginBottom: 16,
          }}
        >
          Submitted onboarding
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {submittedSessions.length === 0 ? (
            <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute }}>No submissions yet.</p>
          ) : (
            submittedSessions
              .slice()
              .reverse()
              .map((ses) => {
                const sesEmail = (ses.contact?.email || "").toLowerCase().trim();
                const alreadyAdded =
                  sesEmail &&
                  users.some((u) => (u.email || "").toLowerCase().trim() === sesEmail);

                return (
                  <div
                    key={ses.id}
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: font.body,
                            fontSize: 14,
                            fontWeight: 600,
                            color: T.text,
                          }}
                        >
                          {ses.contact?.name || "—"} · {ses.contact?.email || "—"}
                        </div>
                        <div
                          style={{
                            fontFamily: font.body,
                            fontSize: 12,
                            color: T.mute,
                            marginTop: 4,
                          }}
                        >
                          {ses.plan?.name} · {ses.contact?.state || "—"} · Submitted{" "}
                          {formatTime(ses.submittedAt)}
                        </div>
                        {(ses.contact?.primaryAreas ||
                          ses.contact?.leadType ||
                          ses.contact?.note) && (
                          <div
                            style={{
                              fontFamily: font.body,
                              fontSize: 12,
                              color: T.textDim,
                              marginTop: 8,
                            }}
                          >
                            {ses.contact.primaryAreas && (
                              <span>Primary: {ses.contact.primaryAreas}</span>
                            )}
                            {ses.contact.leadType && (
                              <span style={{ marginLeft: 12 }}>
                                Leads: {ses.contact.leadType}
                              </span>
                            )}
                            {ses.contact.note && (
                              <div style={{ marginTop: 4 }}>Note: {ses.contact.note}</div>
                            )}
                          </div>
                        )}
                      </div>
                      {alreadyAdded ? (
                        <span
                          style={{
                            fontFamily: font.body,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#22c55e",
                            border: "1px solid rgba(34,197,94,0.4)",
                            padding: "10px 18px",
                            borderRadius: 8,
                            whiteSpace: "nowrap",
                          }}
                        >
                          ✓ Already added
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => createUserFromSubmission(ses)}
                          style={{
                            fontFamily: font.body,
                            fontSize: 12,
                            fontWeight: 600,
                            color: C.void,
                            background: C.gold,
                            border: "none",
                            padding: "10px 18px",
                            borderRadius: 8,
                            cursor: "pointer",
                          }}
                        >
                          Create user
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </section>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
