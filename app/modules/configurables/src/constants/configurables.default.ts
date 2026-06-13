/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TBgColors = {
  page: string;
  panel: string;
  card: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  tagline?: string;
  welcomeMessage?: string;
  systemPrompt?: string;
  inputPlaceholder?: string;
  brandColor: TBrandColor;
  bgColors?: TBgColors;
  showSidebar?: boolean;
  suggestionPrompts?: string[];
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "KYYBOT",
  logoUrl: "FILL_LOGO_URL_HERE",
  tagline: "Your personal AI dev companion",
  welcomeMessage: "Hey, I'm KYYBOT. Ask me anything — code, questions, ideas.",
  systemPrompt: "You are KYYBOT, a smart and direct personal AI assistant. You help with general questions, coding (debugging, writing, explaining code), and any topic the user brings up. Be concise, sharp, and useful. Use markdown formatting for code. Avoid filler and corporate speak.",
  inputPlaceholder: "Ask anything — code, questions, ideas...",
  brandColor: {
    primary: "#00d4ff",
    secondary: "#0d1526",
    accent: "#00aaff",
  },
  bgColors: {
    page: "#0a0f1e",
    panel: "#0d1526",
    card: "#111827",
  },
  showSidebar: true,
  suggestionPrompts: [
    "Explain how async/await works in JavaScript",
    "Debug this Python error: TypeError: 'NoneType' object is not iterable",
    "Write a SQL query to find duplicate rows",
    "What's the difference between TCP and UDP?",
  ],
};
