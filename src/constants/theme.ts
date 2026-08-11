// src/constants/theme.ts
//
// Read from the live tiedown.pro stylesheet rather than from the spine
// document. Where the two disagree the shipped site wins: a user opening
// the app straight off the website should not feel a colour change.

export const colors = {
  background: '#12100e',
  surface: '#1b1815',
  card: '#221e1a',
  border: '#3a332c',
  text: '#e2d6c1',
  muted: '#ab9a84',
  accent: '#e2701f',
  accentAlt: '#f4ead9',
  cream: '#f4ead9',
  success: '#4ba36b',
  warning: '#d99a2b',
  danger: '#c8503f',
} as const;

export const app = {
  name: "Tie-Down Roping",
  short: "TieDown",
  domain: "tiedown.pro",
  eventType: "tiedown",
  eventLabel: "Tie-down roping",
  tagline: "Every run, broken into the four things it is made of.",
  associations: ["PRCA","NIRA","NHSRA"] as readonly string[],
} as const;

// Spacing follows the house rule from the BarrelConnect cursor rules:
// screens px-5 py-6 gap-y-6, cards p-4 rounded-2xl gap-y-2.
export const spacing = { screenX: 20, screenY: 24, gap: 24, cardPad: 16 } as const;
export const radius = { card: 16, pill: 999, control: 12 } as const;
