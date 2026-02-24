import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "estateland_dashboard";

const defaultState = {
  onboardingSessions: [],
  users: [],
  leads: [],
  payments: [],
  chatSessions: [],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        onboardingSessions: parsed.onboardingSessions || [],
        users: parsed.users || [],
        leads: parsed.leads || [],
        payments: parsed.payments || [],
        chatSessions: parsed.chatSessions || [],
      };
    }
  } catch (_) {}
  return { ...defaultState };
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Don't dispatch "storage" here — it triggers the listener in this tab and causes an infinite update loop.
    // Other tabs still get the browser's real storage event when we setItem.
  } catch (_) {}
}

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    const handler = () => setState(loadState());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => saveState(state), 400);
    return () => clearTimeout(t);
  }, [state]);

  const startOnboardingSession = useCallback(() => {
    const id = "ob_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
    setState((s) => ({
      ...s,
      onboardingSessions: [
        ...s.onboardingSessions,
        { id, step: 1, plan: null, territory: {}, contact: {}, startedAt: new Date().toISOString(), lastActivityAt: new Date().toISOString(), status: "in_progress" },
      ],
    }));
    return id;
  }, []);

  const updateOnboardingSession = useCallback((sessionId, step, data) => {
    setState((s) => ({
      ...s,
      onboardingSessions: s.onboardingSessions.map((ses) =>
        ses.id === sessionId
          ? {
              ...ses,
              step,
              ...data,
              lastActivityAt: new Date().toISOString(),
              status: "in_progress",
            }
          : ses
      ),
    }));
  }, []);

  const submitOnboarding = useCallback((sessionId, data) => {
    setState((s) => ({
      ...s,
      onboardingSessions: s.onboardingSessions.map((ses) =>
        ses.id === sessionId ? { ...ses, ...data, status: "submitted", submittedAt: new Date().toISOString(), lastActivityAt: new Date().toISOString() } : ses
      ),
    }));
  }, []);

  const createUser = useCallback((user) => {
    const id = "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    setState((s) => ({
      ...s,
      users: [...s.users, {
        ...user,
        id,
        createdAt: now,
        signupDate: user.signupDate || today,
        documentSignDate: user.documentSignDate || today,
        state: user.state || "",
        county: user.county || "",
        primaryArea: user.primaryArea || "",
        primarySMR: user.primarySMR || "",
        secondaryArea: user.secondaryArea || "",
        secondarySMR: user.secondarySMR || "",
        lastLeadSent: user.lastLeadSent || "",
        leadSentCount: user.leadSentCount != null ? user.leadSentCount : 0,
        ha: user.ha || "",
        remarks: user.remarks || "",
        leadType: user.leadType || "",
        note: user.note || "",
      }],
    }));
    return id;
  }, []);

  const updateUser = useCallback((userId, updates) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
    }));
  }, []);

  const removeUser = useCallback((userId) => {
    setState((s) => ({
      ...s,
      users: s.users.filter((u) => u.id !== userId),
    }));
  }, []);

  const addLead = useCallback((lead) => {
    const id = "l_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
    setState((s) => ({
      ...s,
      leads: [...s.leads, { ...lead, id, createdAt: new Date().toISOString() }],
    }));
    return id;
  }, []);

  const updateLead = useCallback((leadId, updates) => {
    setState((s) => ({
      ...s,
      leads: s.leads.map((l) => (l.id === leadId ? { ...l, ...updates } : l)),
    }));
  }, []);

  const removeLead = useCallback((leadId) => {
    setState((s) => ({
      ...s,
      leads: s.leads.filter((l) => l.id !== leadId),
    }));
  }, []);

  const addPayment = useCallback((payment) => {
    setState((s) => ({
      ...s,
      payments: [...(s.payments || []), { ...payment, id: "pay_" + Date.now(), paidAt: payment.paidAt || new Date().toISOString() }],
    }));
  }, []);

  const createChatSession = useCallback((opts = {}) => {
    const id = "chat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
    const session = {
      id,
      startedAt: new Date().toISOString(),
      page: opts.page || "",
      source: opts.source || "website",
      messages: [],
    };
    setState((s) => ({ ...s, chatSessions: [...(s.chatSessions || []), session] }));
    return id;
  }, []);

  const addChatMessage = useCallback((sessionId, message) => {
    const at = new Date().toISOString();
    setState((s) => ({
      ...s,
      chatSessions: (s.chatSessions || []).map((ses) =>
        ses.id === sessionId
          ? { ...ses, messages: [...ses.messages, { ...message, at }] }
          : ses
      ),
    }));
  }, []);

  const inProgressSessions = state.onboardingSessions.filter((s) => s.status === "in_progress");
  const submittedSessions = state.onboardingSessions.filter((s) => s.status === "submitted");

  const value = {
    ...state,
    inProgressSessions,
    submittedSessions,
    startOnboardingSession,
    updateOnboardingSession,
    submitOnboarding,
    createUser,
    updateUser,
    removeUser,
    addLead,
    updateLead,
    removeLead,
    addPayment,
    createChatSession,
    addChatMessage,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
