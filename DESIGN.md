# KYYBOT Design Guidelines

## Visual Theme
- **Vibe**: Cyber / tech — dark, sharp, futuristic but not overwhelming
- **Primary palette**: Deep navy/dark blue backgrounds (#0a0f1e, #0d1526) with cyan/electric blue accents (#00d4ff, #00aaff)
- **Text**: Crisp white (#f0f4ff) on dark backgrounds; muted gray (#8892a4) for secondary text
- **Accent highlight**: Cyan glow effects on active elements

## Typography
- **Font family**: `Inter` or `JetBrains Mono` (code), loaded via Google Fonts or system fallback
- **Body**: 14–15px, regular weight
- **Code blocks**: Monospace font, slightly smaller (13px), with distinct background (#1a1f35)
- **Headings**: Semi-bold, clean

## Layout
- Single-page app
- Left sidebar (optional): chat history or branding panel
- Main area: message thread (scrollable) + input bar pinned to bottom
- Header: "KYYBOT" logo/wordmark + subtle status indicator

## Components

### Chat Messages
- User messages: right-aligned, cyan-tinted bubble
- Bot messages: left-aligned, dark card with subtle border
- Code blocks inside messages: dark background, syntax highlighted, monospace font, copy button

### Input Bar
- Full-width text area (multi-line support)
- Send button with cyan accent
- Keyboard shortcut: Enter to send, Shift+Enter for newline

### Status / Loading
- Typing indicator (animated dots or pulse) while bot is responding
- Smooth message append animation

## Elevation & Depth
- Cards/panels use subtle border (`1px solid #1e2a45`) not heavy shadows
- Active/hover states use cyan glow (`box-shadow: 0 0 8px #00d4ff40`)
- Background layering: page bg → panel bg → card bg (each slightly lighter)

## Overall Feel
- Clean, focused, distraction-free
- The interface should feel like a dev tool — functional beauty
- No rounded pill shapes; prefer slightly rounded corners (6–8px radius)
- Minimal animations, only where they add clarity
