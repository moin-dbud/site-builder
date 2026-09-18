import prisma from "../lib/prisma.js";

type ComponentSeed = {
  name: string;
  slug: string;
  category: string;
  description: string;
  tags: string[];
  compatibleStyles: string[];
  compatibleSkills: string[];
  propsSchema: object;
  responsiveRules: object;
  accessibilityRules: object;
  variants: {
    name: string;
    slug: string;
    description: string;
    layoutRules: object;
    responsiveRules: object;
  }[];
  implementationCode: string;
};

const components: ComponentSeed[] = [
  {
    name: "Navbar",
    slug: "navbar",
    category: "navigation",
    description: "Responsive website navigation with desktop and mobile layouts.",
    tags: ["navigation", "header", "menu", "responsive"],
    compatibleStyles: ["modern-minimal", "dark-tech", "editorial", "luxury", "corporate"],
    compatibleSkills: ["navigation-ux", "responsive-web-design", "accessibility"],
    propsSchema: {
      logo: "string",
      links: "array",
      cta: "object?",
      sticky: "boolean?",
    },
    responsiveRules: {
      mobile: "collapse navigation into menu button",
      tablet: "compact navigation",
      desktop: "horizontal navigation",
    },
    accessibilityRules: {
      keyboardNavigation: true,
      ariaLabels: true,
      semanticHeader: true,
      mobileMenuButtonLabel: true,
    },
    variants: [
      {
        name: "Minimal",
        slug: "minimal",
        description: "Clean minimal navigation.",
        layoutRules: { alignment: "between", style: "minimal" },
        responsiveRules: { mobile: "hamburger" },
      },
      {
        name: "Centered",
        slug: "centered",
        description: "Centered navigation with prominent branding.",
        layoutRules: { alignment: "center", style: "balanced" },
        responsiveRules: { mobile: "hamburger" },
      },
      {
        name: "With CTA",
        slug: "with-cta",
        description: "Navigation with a prominent call-to-action.",
        layoutRules: { alignment: "between", cta: true },
        responsiveRules: { mobile: "hamburger" },
      },
    ],
    implementationCode: `
<header class="w-full">
  <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
    <a href="#" class="font-semibold">{{logo}}</a>

    <div class="hidden items-center gap-8 md:flex">
      {{links}}
      {{cta}}
    </div>

    <button
      type="button"
      class="md:hidden"
      aria-label="Open navigation menu"
    >
      ☰
    </button>
  </nav>
</header>
`,
  },

  {
    name: "Hero",
    slug: "hero",
    category: "hero",
    description: "Primary above-the-fold section for communicating value and driving action.",
    tags: ["hero", "headline", "cta", "above-fold"],
    compatibleStyles: ["modern-minimal", "editorial", "luxury", "dark-tech", "bold"],
    compatibleSkills: ["visual-hierarchy", "layout-composition", "landing-page-ux", "conversion-focused-design"],
    propsSchema: {
      eyebrow: "string?",
      heading: "string",
      description: "string?",
      primaryCta: "object?",
      secondaryCta: "object?",
      image: "media?",
    },
    responsiveRules: {
      mobile: "single-column",
      tablet: "adaptive-grid",
      desktop: "multi-column",
    },
    accessibilityRules: {
      semanticHeading: "single-h1",
      contrast: true,
      decorativeImagesAltEmpty: true,
    },
    variants: [
      {
        name: "Centered",
        slug: "centered",
        description: "Centered text-focused hero.",
        layoutRules: { alignment: "center", columns: 1 },
        responsiveRules: { mobile: "stack" },
      },
      {
        name: "Split",
        slug: "split",
        description: "Text and visual arranged side by side.",
        layoutRules: { columns: 2, alignment: "center" },
        responsiveRules: { mobile: "stack" },
      },
      {
        name: "Image",
        slug: "image",
        description: "Hero with prominent supporting image.",
        layoutRules: { columns: 2, visualPriority: "high" },
        responsiveRules: { mobile: "stack" },
      },
      {
        name: "Bento",
        slug: "bento",
        description: "Modern asymmetric bento-style hero.",
        layoutRules: { grid: "bento" },
        responsiveRules: { mobile: "single-column" },
      },
    ],
    implementationCode: `
<section class="mx-auto max-w-7xl px-6 py-20 lg:py-32">
  <div class="grid items-center gap-12 lg:grid-cols-2">

    <div>
      {{eyebrow}}

      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        {{heading}}
      </h1>

      <p class="mt-6 max-w-xl text-lg">
        {{description}}
      </p>

      <div class="mt-8 flex flex-wrap gap-4">
        {{primaryCta}}
        {{secondaryCta}}
      </div>
    </div>

    <div>
      {{image}}
    </div>

  </div>
</section>
`,
  },

  {
    name: "Button",
    slug: "button",
    category: "actions",
    description: "Reusable action button with multiple visual variants.",
    tags: ["button", "cta", "action"],
    compatibleStyles: ["all"],
    compatibleSkills: ["conversion-focused-design", "accessibility", "visual-hierarchy"],
    propsSchema: {
      label: "string",
      href: "string?",
      variant: "string",
      size: "string?",
    },
    responsiveRules: {
      mobile: "maintain readable touch target",
    },
    accessibilityRules: {
      minimumTouchTarget: "44px",
      focusVisible: true,
      semanticElement: true,
    },
    variants: [
      {
        name: "Primary",
        slug: "primary",
        description: "Primary call-to-action.",
        layoutRules: { emphasis: "high" },
        responsiveRules: {},
      },
      {
        name: "Secondary",
        slug: "secondary",
        description: "Secondary action.",
        layoutRules: { emphasis: "medium" },
        responsiveRules: {},
      },
      {
        name: "Ghost",
        slug: "ghost",
        description: "Low-emphasis action.",
        layoutRules: { emphasis: "low" },
        responsiveRules: {},
      },
    ],
    implementationCode: `
<a
  href="{{href}}"
  class="inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 font-medium transition"
>
  {{label}}
</a>
`,
  },

  {
    name: "Feature Card",
    slug: "feature-card",
    category: "content",
    description: "Card for communicating a product, service, or feature benefit.",
    tags: ["card", "feature", "benefit"],
    compatibleStyles: ["modern-minimal", "dark-tech", "corporate", "playful"],
    compatibleSkills: ["content-hierarchy", "layout-composition"],
    propsSchema: {
      icon: "string?",
      title: "string",
      description: "string",
      link: "object?",
    },
    responsiveRules: {
      mobile: "single-column",
      desktop: "grid-compatible",
    },
    accessibilityRules: {
      headingHierarchy: true,
      interactiveArea: true,
    },
    variants: [
      {
        name: "Default",
        slug: "default",
        description: "Standard feature card.",
        layoutRules: { orientation: "vertical" },
        responsiveRules: {},
      },
      {
        name: "Icon",
        slug: "icon",
        description: "Feature card with prominent icon.",
        layoutRules: { orientation: "vertical", icon: true },
        responsiveRules: {},
      },
    ],
    implementationCode: `
<article class="rounded-2xl border p-6">
  {{icon}}

  <h3 class="mt-4 text-xl font-semibold">
    {{title}}
  </h3>

  <p class="mt-2 leading-7">
    {{description}}
  </p>

  {{link}}
</article>
`,
  },

  {
    name: "Feature Grid",
    slug: "feature-grid",
    category: "content",
    description: "Responsive grid of feature or service cards.",
    tags: ["features", "grid", "services"],
    compatibleStyles: ["all"],
    compatibleSkills: ["layout-composition", "spacing-rhythm", "responsive-web-design"],
    propsSchema: {
      heading: "string?",
      description: "string?",
      items: "array",
      columns: "number?",
    },
    responsiveRules: {
      mobile: "1-column",
      tablet: "2-columns",
      desktop: "3-4-columns",
    },
    accessibilityRules: {
      semanticSection: true,
      headingHierarchy: true,
    },
    variants: [
      {
        name: "Three Column",
        slug: "three-column",
        description: "Classic three-column feature layout.",
        layoutRules: { columns: 3 },
        responsiveRules: { mobile: 1, tablet: 2, desktop: 3 },
      },
      {
        name: "Four Column",
        slug: "four-column",
        description: "Dense four-column feature layout.",
        layoutRules: { columns: 4 },
        responsiveRules: { mobile: 1, tablet: 2, desktop: 4 },
      },
    ],
    implementationCode: `
<section class="mx-auto max-w-7xl px-6 py-20">
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {{items}}
  </div>
</section>
`,
  },

  {
    name: "Testimonial",
    slug: "testimonial",
    category: "social-proof",
    description: "Customer testimonial and social proof component.",
    tags: ["testimonial", "review", "social-proof"],
    compatibleStyles: ["all"],
    compatibleSkills: ["content-hierarchy", "conversion-focused-design"],
    propsSchema: {
      quote: "string",
      name: "string",
      role: "string?",
      avatar: "media?",
    },
    responsiveRules: {
      mobile: "single-column",
    },
    accessibilityRules: {
      semanticQuote: true,
      avatarAlt: true,
    },
    variants: [
      {
        name: "Card",
        slug: "card",
        description: "Testimonial inside a card.",
        layoutRules: { style: "card" },
        responsiveRules: {},
      },
      {
        name: "Large Quote",
        slug: "large-quote",
        description: "Editorial-style large testimonial.",
        layoutRules: { style: "editorial" },
        responsiveRules: {},
      },
    ],
    implementationCode: `
<figure class="rounded-2xl border p-8">
  <blockquote class="text-xl leading-8">
    "{{quote}}"
  </blockquote>

  <figcaption class="mt-6">
    <div class="font-semibold">{{name}}</div>
    <div class="text-sm opacity-70">{{role}}</div>
  </figcaption>
</figure>
`,
  },

  {
    name: "Pricing",
    slug: "pricing",
    category: "business",
    description: "Pricing plans with features and calls to action.",
    tags: ["pricing", "plans", "conversion"],
    compatibleStyles: ["modern-minimal", "dark-tech", "corporate", "startup"],
    compatibleSkills: ["conversion-focused-design", "responsive-web-design", "accessibility"],
    propsSchema: {
      plans: "array",
      highlightedPlan: "string?",
    },
    responsiveRules: {
      mobile: "stack",
      desktop: "columns",
    },
    accessibilityRules: {
      semanticHeadings: true,
      readableContrast: true,
    },
    variants: [
      {
        name: "Three Plans",
        slug: "three-plans",
        description: "Three-tier pricing comparison.",
        layoutRules: { columns: 3 },
        responsiveRules: { mobile: 1, desktop: 3 },
      },
      {
        name: "Single Featured",
        slug: "single-featured",
        description: "One prominently highlighted plan.",
        layoutRules: { emphasis: "single" },
        responsiveRules: {},
      },
    ],
    implementationCode: `
<section class="mx-auto max-w-7xl px-6 py-20">
  <div class="grid gap-6 md:grid-cols-3">
    {{plans}}
  </div>
</section>
`,
  },

  {
    name: "FAQ",
    slug: "faq",
    category: "content",
    description: "Frequently asked questions using accessible disclosure patterns.",
    tags: ["faq", "questions", "accordion"],
    compatibleStyles: ["all"],
    compatibleSkills: ["content-hierarchy", "accessibility", "mobile-ux"],
    propsSchema: {
      items: "array",
    },
    responsiveRules: {
      mobile: "single-column",
    },
    accessibilityRules: {
      nativeDetailsPreferred: true,
      keyboardAccessible: true,
    },
    variants: [
      {
        name: "Accordion",
        slug: "accordion",
        description: "Expandable FAQ items.",
        layoutRules: { style: "accordion" },
        responsiveRules: {},
      },
      {
        name: "Two Column",
        slug: "two-column",
        description: "FAQ split into two columns on desktop.",
        layoutRules: { columns: 2 },
        responsiveRules: { mobile: 1 },
      },
    ],
    implementationCode: `
<section class="mx-auto max-w-4xl px-6 py-20">
  <div class="space-y-4">
    {{items}}
  </div>
</section>
`,
  },

  {
    name: "CTA",
    slug: "cta",
    category: "conversion",
    description: "Call-to-action section designed to drive a clear next step.",
    tags: ["cta", "conversion", "action"],
    compatibleStyles: ["all"],
    compatibleSkills: ["conversion-focused-design", "visual-hierarchy"],
    propsSchema: {
      heading: "string",
      description: "string?",
      primaryCta: "object",
      secondaryCta: "object?",
    },
    responsiveRules: {
      mobile: "stack",
      desktop: "horizontal",
    },
    accessibilityRules: {
      contrast: true,
      clearActionLabels: true,
    },
    variants: [
      {
        name: "Centered",
        slug: "centered",
        description: "Centered conversion-focused CTA.",
        layoutRules: { alignment: "center" },
        responsiveRules: { mobile: "stack" },
      },
      {
        name: "Split",
        slug: "split",
        description: "CTA with text and supporting visual.",
        layoutRules: { columns: 2 },
        responsiveRules: { mobile: "stack" },
      },
    ],
    implementationCode: `
<section class="mx-auto max-w-7xl px-6 py-20">
  <div class="rounded-3xl border p-10 text-center lg:p-16">
    <h2 class="text-3xl font-bold sm:text-4xl">
      {{heading}}
    </h2>

    <p class="mx-auto mt-4 max-w-2xl">
      {{description}}
    </p>

    <div class="mt-8 flex justify-center gap-4">
      {{primaryCta}}
      {{secondaryCta}}
    </div>
  </div>
</section>
`,
  },

  {
    name: "Footer",
    slug: "footer",
    category: "footer",
    description: "Responsive website footer with navigation and business information.",
    tags: ["footer", "navigation", "links"],
    compatibleStyles: ["all"],
    compatibleSkills: ["navigation-ux", "responsive-web-design", "accessibility"],
    propsSchema: {
      logo: "string?",
      columns: "array",
      copyright: "string?",
      socialLinks: "array?",
    },
    responsiveRules: {
      mobile: "stack-columns",
      desktop: "multi-column",
    },
    accessibilityRules: {
      semanticFooter: true,
      navigationLabels: true,
    },
    variants: [
      {
        name: "Simple",
        slug: "simple",
        description: "Simple footer with essential links.",
        layoutRules: { columns: 2 },
        responsiveRules: { mobile: 1 },
      },
      {
        name: "Multi Column",
        slug: "multi-column",
        description: "Full navigation footer.",
        layoutRules: { columns: 4 },
        responsiveRules: { mobile: 1, tablet: 2, desktop: 4 },
      },
    ],
    implementationCode: `
<footer class="border-t">
  <div class="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
    {{columns}}
  </div>

  <div class="mx-auto max-w-7xl border-t px-6 py-6 text-sm">
    {{copyright}}
  </div>
</footer>
`,
  },
];

async function main() {
  console.log("🌱 Seeding component registry...");

  for (const component of components) {
    const existing = await prisma.component.findUnique({
      where: { slug: component.slug },
    });

    if (existing) {
      console.log(`  ↻ ${component.name} already exists — skipping`);
      continue;
    }

    const created = await prisma.component.create({
      data: {
        name: component.name,
        slug: component.slug,
        category: component.category,
        description: component.description,
        tags: component.tags,
        compatibleStyles: component.compatibleStyles,
        compatibleSkills: component.compatibleSkills,
        propsSchema: component.propsSchema,
        responsiveRules: component.responsiveRules,
        accessibilityRules: component.accessibilityRules,
        status: "PUBLISHED",
        isEnabled: true,

        versions: {
          create: {
            version: 1,
            implementationCode: component.implementationCode,
            implementationType: "html",
            status: "PUBLISHED",
            changelog: "Initial component implementation",
          },
        },

        variants: {
          create: component.variants.map((variant) => ({
            name: variant.name,
            slug: variant.slug,
            description: variant.description,
            layoutRules: variant.layoutRules,
            responsiveRules: variant.responsiveRules,
            isEnabled: true,
          })),
        },
      },
      include: {
        versions: true,
        variants: true,
      },
    });

    console.log(
      `  ✓ ${created.name} (${created.variants.length} variants, v1)`
    );
  }

  console.log("");
  console.log("✅ Component registry seeded successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });