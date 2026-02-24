// Dashboard uses same colors/fonts as main site (Estate Land) but has its own layout — no shared header/footer.
export const C = {
  void: "#080808",
  surface: "#0f0f0f",
  surfaceLight: "#161616",
  cream: "#f5f0e8",
  creamDim: "rgba(245,240,232,0.95)",
  mute: "rgba(245,240,232,0.82)",
  gold: "#c9a227",
  goldLight: "#d4a574",
  goldDim: "rgba(201,162,39,0.25)",
  white: "#ffffff",
  border: "rgba(240,235,227,0.12)",
};

export const THEME = {
  dark: {
    bg: C.void,
    text: C.cream,
    textDim: C.creamDim,
    mute: C.mute,
    border: C.border,
    accent: C.gold,
    accentDim: C.goldDim,
  },
  light: {
    bg: "#f5f0e8",
    text: "#0f0f0f",
    textDim: "rgba(15,15,15,0.85)",
    mute: "rgba(15,15,15,0.6)",
    border: "rgba(0,0,0,0.1)",
    accent: "#a67c00",
    accentDim: "rgba(166,124,0,0.2)",
  },
};

export const font = {
  display: "'Cormorant Garamond', serif",
  body: "'Plus Jakarta Sans', sans-serif",
};
