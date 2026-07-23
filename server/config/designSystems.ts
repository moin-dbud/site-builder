// server/config/designSystems.ts
//
// A curated catalog of distinct design systems. One is selected per project
// (not per generation call) so a site keeps a consistent identity across revisions.

export interface DesignSystem {
  id: string;
  name: string;
  keywords: string[]; // used for lightweight matching against the user's prompt
  palette: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    googleFontsImport: string; // full <link> href
    headingWeight: string;
  };
  spacing: string;
  radius: string;
  componentPatterns: {
    navbar: string;
    hero: string;
    card: string;
  };
  layoutGuidance: string;
}

export const designSystems: DesignSystem[] = [
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    keywords: ["portfolio", "agency", "studio", "consulting", "personal", "resume"],
    palette: {
      primary: "#111111",
      secondary: "#6B6B6B",
      background: "#FFFFFF",
      surface: "#F7F7F5",
      text: "#111111",
      muted: "#8A8A8A",
    },
    typography: {
      headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
      googleFontsImport:
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      headingWeight: "600",
    },
    spacing: "generous — section padding of at least 6rem vertical on desktop, tight line-height on headings",
    radius: "sharp to slightly rounded (4-8px), never pill-shaped except small tags",
    componentPatterns: {
      navbar: "flat, transparent over hero, logo left, links right-aligned, no background until scroll",
      hero: "left-aligned (not centered) large heading with generous whitespace, small supporting text, single understated CTA link with arrow icon",
      card: "no border, no shadow — separation via whitespace and a thin 1px divider only",
    },
    layoutGuidance:
      "Avoid centered symmetric layouts. Use asymmetric grids, left-aligned text blocks, and generous negative space. Minimal color use — the palette should feel almost monochrome with restraint.",
  },
  {
    id: "bold-editorial",
    name: "Bold Editorial",
    keywords: ["magazine", "blog", "news", "publication", "fashion", "creative"],
    palette: {
      primary: "#000000",
      secondary: "#E8402C",
      background: "#FFFFFF",
      surface: "#F2F1EC",
      text: "#111111",
      muted: "#666666",
    },
    typography: {
      headingFont: "'Playfair Display', serif",
      bodyFont: "'Inter', sans-serif",
      googleFontsImport:
        "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500&display=swap",
      headingWeight: "900",
    },
    spacing: "tight vertical rhythm, wide horizontal margins, oversized type as a layout element",
    radius: "0px everywhere — sharp corners only",
    componentPatterns: {
      navbar: "thin logo wordmark, uppercase tracked-out nav links, thin bottom border",
      hero: "massive oversized serif headline (60px+), full-bleed image or bold color block beside it, asymmetric split",
      card: "bordered rectangle, uppercase category label above title, no shadow, sharp corners",
    },
    layoutGuidance:
      "Type IS the design — headlines should dominate. Use one saturated accent color sparingly against black/white. Break the grid occasionally with an oversized pull-quote or diagonal section divider.",
  },
  {
    id: "warm-organic",
    name: "Warm Organic",
    keywords: ["bakery", "cafe", "restaurant", "wellness", "yoga", "florist", "handmade", "food"],
    palette: {
      primary: "#8B5E3C",
      secondary: "#C97B4A",
      background: "#FBF6EF",
      surface: "#F1E7D8",
      text: "#3A2E24",
      muted: "#8C7A68",
    },
    typography: {
      headingFont: "'Fraunces', serif",
      bodyFont: "'Nunito Sans', sans-serif",
      googleFontsImport:
        "https://fonts.googleapis.com/css2?family=Fraunces:wght@500;700&family=Nunito+Sans:wght@400;600&display=swap",
      headingWeight: "600",
    },
    spacing: "soft, breathable, rounded section transitions (curved SVG dividers welcome)",
    radius: "very rounded — 16-24px on cards, pill buttons",
    componentPatterns: {
      navbar: "logo left (can include a small icon/mark), soft pill-shaped CTA button on right",
      hero: "warm background color/texture, hand-drawn or organic accent shape, friendly conversational headline",
      card: "soft rounded corners, subtle warm shadow, generous internal padding",
    },
    layoutGuidance:
      "Everything should feel handcrafted and warm, not corporate. Use rounded shapes, soft shadows, and organic accent elements (blobs, curves) instead of sharp geometric ones.",
  },
  {
    id: "dark-tech",
    name: "Dark Tech / SaaS",
    keywords: ["saas", "startup", "app", "software", "developer", "api", "tech", "platform"],
    palette: {
      primary: "#7F77DD",
      secondary: "#2DD4BF",
      background: "#0A0A0A",
      surface: "#151515",
      text: "#F2F2F2",
      muted: "#8A8A8A",
    },
    typography: {
      headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
      googleFontsImport:
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      headingWeight: "600",
    },
    spacing: "structured, grid-aligned, moderate section padding (4-5rem)",
    radius: "8-12px, consistent across all components",
    componentPatterns: {
      navbar: "dark, hairline bottom border, logo + centered or right nav, solid button CTA (not pill)",
      hero: "headline + subtext + input/CTA row, optional code-snippet or dashboard mockup visual on one side",
      card: "1px hairline border, dark surface, small monospace label/eyebrow above the title",
    },
    layoutGuidance:
      "One accent color used sparingly — never gradients or glow. Use monospace font for small technical labels/badges. Favor structured grids over free-form layouts.",
  },
  {
    id: "playful-vibrant",
    name: "Playful Vibrant",
    keywords: ["kids", "toy", "game", "event", "party", "fun", "education", "app for children"],
    palette: {
      primary: "#FF5A5F",
      secondary: "#FFC64B",
      background: "#FFFFFF",
      surface: "#FFF6E9",
      text: "#1A1A1A",
      muted: "#767676",
    },
    typography: {
      headingFont: "'Baloo 2', sans-serif",
      bodyFont: "'Nunito', sans-serif",
      googleFontsImport:
        "https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Nunito:wght@400;700&display=swap",
      headingWeight: "800",
    },
    spacing: "bouncy, uneven section heights are fine, elements can overlap slightly for energy",
    radius: "very rounded (20px+), fully rounded buttons and avatars",
    componentPatterns: {
      navbar: "colorful logo mark, rounded pill nav background, bright CTA button",
      hero: "playful illustration or bold blob shapes behind headline, bright multi-color palette, large friendly CTA button",
      card: "bright surface color (rotate through 2-3 accent tints), thick rounded corners, small illustrative icon",
    },
    layoutGuidance:
      "Use at least 2-3 accent colors (not just one), rounded blob shapes as background decoration, and playful oversized buttons. Avoid anything that feels corporate or minimal.",
  },
  {
    id: "luxury-elegant",
    name: "Luxury Elegant",
    keywords: ["jewelry", "hotel", "real estate", "luxury", "fashion boutique", "wedding", "premium"],
    palette: {
      primary: "#1C1C1C",
      secondary: "#C6A15B",
      background: "#0F0F0F",
      surface: "#1A1A1A",
      text: "#EDEDED",
      muted: "#A3A3A3",
    },
    typography: {
      headingFont: "'Cormorant Garamond', serif",
      bodyFont: "'Jost', sans-serif",
      googleFontsImport:
        "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Jost:wght@300;400&display=swap",
      headingWeight: "500",
    },
    spacing: "very generous, slow visual rhythm, lots of negative space, letter-spaced small text",
    radius: "0-4px only, no rounded pills anywhere",
    componentPatterns: {
      navbar: "minimal, uppercase letter-spaced links, thin gold or muted accent underline on hover",
      hero: "full-bleed dark image with subtle overlay, centered thin serif headline, understated single CTA",
      card: "thin 1px gold-tinted border, dark surface, uppercase small label, serif title",
    },
    layoutGuidance:
      "Restraint is the point — one accent color (gold/muted metallic) used extremely sparingly, lots of breathing room, letter-spaced uppercase micro-text, serif headings only.",
  },
];

/**
 * Pick a design system for a new project.
 * Matches keywords from the user's prompt first; falls back to weighted random
 * so unrecognized prompts still get variety instead of always landing on the same default.
 */
export function pickDesignSystem(userPrompt: string): DesignSystem {
  const lower = userPrompt.toLowerCase();

  const matches = designSystems.filter((sys) =>
    sys.keywords.some((kw) => lower.includes(kw))
  );

  if (matches.length > 0) {
    return matches[Math.floor(Math.random() * matches.length)];
  }

  // no keyword match — random pick across the whole catalog for variety
  return designSystems[Math.floor(Math.random() * designSystems.length)];
}

export function getDesignSystemById(id: string): DesignSystem | undefined {
  return designSystems.find((sys) => sys.id === id);
}
