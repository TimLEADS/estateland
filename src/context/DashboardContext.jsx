import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "";
const CACHE_KEY = "estateland_dashboard_cache";
const USERS_KEY = "estateland_users_persistent";

const defaultState = { onboardingSessions: [], users: [], leads: [], payments: [], chatSessions: [] };

function loadCache() {
      try { const raw = localStorage.getItem(CACHE_KEY); if (raw) return JSON.parse(raw); } catch (_) {}
      return null;
}

function saveCache(data) {
      try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(data));
              if (data.users && data.users.length > 0) {
                        localStorage.setItem(USERS_KEY, JSON.stringify(data.users));
              }
      } catch (_) {}
}

function loadPersistedUsers() {
      try {
              const fromCache = loadCache();
              if (fromCache?.users?.length > 0) return fromCache.users;
              const raw = localStorage.getItem(USERS_KEY);
              if (raw) return JSON.parse(raw);
      } catch (_) {}
      return [];
}

async function api(path, opts = {}) {
      const res = await fetch(`${API}${path}`, {
              headers: { "Content-Type": "application/json" },
              ...opts,
              body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
      return res.json();
}

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
      const cached = loadCache();
      const seedUsers = loadPersistedUsers();
      const initialState = cached
        ? { ...cached, users: cached.users?.length > 0 ? cached.users : seedUsers }
              : { ...defaultState, users: seedUsers };

  const [state, setState] = useState(initialState);
      const [loaded, setLoaded] = useState(!!cached);

  const fetchAll = useCallback(async () => {
          try {
                    const data = await api("/api/dashboard");
                    const next = {
                                onboardingSessions: data.onboardingSessions || [],
                                users: data.users || [],
                                leads: data.leads || [],
                                payments: data.payments || [],
                                chatSessions: data.chatSessions || [],
                    };
                    setState(next);
                    saveCache(next);
                    setLoaded(true);
          } catch (err) {
                    console.error("Failed to fetch dashboard data:", err);
                    setLoaded(true);
          }
  }, []);

  useEffect(() => {
          fetchAll();
          const t = setInterval(fetchAll, 8000);
          return () => clearInterval(t);
  }, [fetchAll]);

  const startOnboardingSession = useCallback(async () => {
          const id = "ob_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
          const now = new Date().toISOString();
          const session = { id, step: 1, plan: null, territory: {}, contact: {}, startedAt: now, lastActivityAt: now, status: "in_progress" };
          setState(s => ({ ...s, onboardingSessions: [...s.onboardingSessions, session] }));
          await api("/api/onboarding", { method: "POST", body: session });
          return id;
  }, []);

  const updateOnboardingSession = useCallback(async (sessionId, step, data) => {
          const now = new Date().toISOString();
          setState(s => ({
                    ...s,
                    onboardingSessions: s.onboardingSessions.map(ses =>
                                ses.id === sessionId ? { ...ses, step, ...data, lastActivityAt: now, status: "in_progress" } : ses
                                                                       ),
          }));
          await api(`/api/onboarding/${sessionId}`, { method: "PUT", body: { step, ...data, lastActivityAt: now, status: "in_progress" } });
  }, []);

  const submitOnboarding = useCallback(async (sessionId, data) => {
          const now = new Date().toISOString();
          setState(s => ({
                    ...s,
                    onboardingSessions: s.onboardingSessions.map(ses =>
                                ses.id === sessionId ? { ...ses, ...data, status: "submitted", submittedAt: now, lastActivityAt: now } : ses
                                                                       ),
          }));
          await api(`/api/onboarding/${sessionId}`, { method: "PUT", body: { ...data, status: "submitted", submittedAt: now, lastActivityAt: now } });
  }, []);

  const createUser = useCallback(async (user) => {
          const id = "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
          const now = new Date().toISOString();
          const today = now.slice(0, 10);
          const full = {
                    ...user, id, createdAt: now,
                    signupDate: user.signupDate || today, documentSignDate: user.documentSignDate || today,
                    state: user.state || "", county: user.county || "",
                    primaryArea: user.primaryArea || "", primarySMR: user.primarySMR || "",
                    secondaryArea: user.secondaryArea || "", secondarySMR: user.secondarySMR || "",
                    lastLeadSent: user.lastLeadSent || "", leadSentCount: user.leadSentCount != null ? user.leadSentCount : 0,
                    ha: user.ha || "", remarks: user.remarks || "", leadType: user.leadType || "",
                    note: user.note || "", password: user.password || "",
          };
          setState(s => {
                    const next = { ...s, users: [...s.users, full] };
                    try { localStorage.setItem(USERS_KEY, JSON.stringify(next.users)); } catch (_) {}
                    return next;
          });
          try { await api("/api/users", { method: "POST", body: full }); } catch (err) { console.error("createUser error:", err); }
          return id;
  }, []);

  const updateUser = useCallback(async (userId, updates) => {
          setState(s => {
                    const next = { ...s, users: s.users.map(u => u.id === userId ? { ...u, ...updates } : u) };
                    try { localStorage.setItem(USERS_KEY, JSON.stringify(next.users)); } catch (_) {}
                    return next;
          });
          await api(`/api/users/${userId}`, { method: "PUT", body: updates });
  }, []);

  const removeUser = useCallback(async (userId) => {
          setState(s => {
                    const next = { ...s, users: s.users.filter(u => u.id !== userId) };
                    try { localStorage.setItem(USERS_KEY, JSON.stringify(next.users)); } catch (_) {}
                    return next;
          });
          await api(`/api/users/${userId}`, { method: "DELETE" });
  }, []);

  const addLead = useCallback(async (lead) => {
          const id = "l_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
          const now = new Date().toISOString();
          const full = { ...lead, id, createdAt: now };
          setState(s => ({ ...s, leads: [...s.leads, full] }));
          await api("/api/leads", { method: "POST", body: full });
          return id;
  }, []);

  const updateLead = useCallback(async (leadId, updates) => {
          setState(s => ({ ...s, leads: s.leads.map(l => l.id === leadId ? { ...l, ...updates } : l) }));
          await api(`/api/leads/${leadId}`, { method: "PUT", body: updates });
  }, []);

  const removeLead = useCallback(async (leadId) => {
          setState(s => ({ ...s, leads: s.leads.filter(l => l.id !== leadId) }));
          await api(`/api/leads/${leadId}`, { method: "DELETE" });
  }, []);

  const addPayment = useCallback(async (payment) => {
          const id = payment.id || "pay_" + Date.now();
          const now = new Date().toISOString();
          const full = { ...payment, id, paidAt: payment.paidAt || now };
          setState(s => ({ ...s, payments: [...(s.payments || []), full] }));
          await api("/api/payments", { method: "POST", body: full });
  }, []);

  const createChatSession = useCallback(async (opts = {}) => {
          const id = "chat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
          const session = { id, startedAt: new Date().toISOString(), page: opts.page || "", source: opts.source || "website", messages: [] };
          setState(s => ({ ...s, chatSessions: [...(s.chatSessions || []), session] }));
          await api("/api/chat-sessions", { method: "POST", body: session });
          return id;
  }, []);

  const addChatMessage = useCallback(async (sessionId, message) => {
          const at = new Date().toISOString();
          let updatedMessages = [];
          setState(s => ({
                    ...s,
                    chatSessions: (s.chatSessions || []).map(ses => {
                                if (ses.id === sessionId) { updatedMessages = [...ses.messages, { ...message, at }]; return { ...ses, messages: updatedMessages }; }
                                return ses;
                    }),
          }));
          if (updatedMessages.length) await api(`/api/chat-sessions/${sessionId}`, { method: "PUT", body: { messages: updatedMessages } });
  }, []);

  const inProgressSessions = state.onboardingSessions.filter(s => s.status === "in_progress");
      const submittedSessions = state.onboardingSessions.filter(s => s.status === "submitted");

  const value = {
          ...state, loaded, inProgressSessions, submittedSessions,
          startOnboardingSession, updateOnboardingSession, submitOnboarding,
          createUser, updateUser, removeUser,
          addLead, updateLead, removeLead,
          addPayment, createChatSession, addChatMessage,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>DashboardContext.Provider>;
}

export function useDashboard() {
      const ctx = useContext(DashboardContext);
      if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
      return ctx;
}
