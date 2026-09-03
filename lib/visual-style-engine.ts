export type VisualStyleRecipe = {
  id: string;
  engine: string;
  source: string;
  sourceUrl: string;
  implementation: string;
};

export const visualStyleRecipes: Record<string, VisualStyleRecipe> = {
  minimal: {
    id: 'minimal',
    engine: 'Once UI · Responsive tokens',
    source: 'once-ui-system/core',
    sourceUrl: 'https://github.com/once-ui-system/core',
    implementation: 'Use a tokenized 4/8/12/16/24/32/40/64 spacing scale, responsive spacing variables that reduce one step on narrow screens, neutral alpha surfaces and one quiet hover fill. Use a strict product grid, 1px low-contrast borders, almost no decorative gradients, compact navigation and one dominant action. Prefer whitespace and typography over cards.',
  },
  editorial: {
    id: 'editorial',
    engine: 'Webflow · Editorial templates',
    source: 'Webflow Editorial',
    sourceUrl: 'https://webflow.com/templates/search/editorial',
    implementation: 'Use native CSS text-wrap: balance for display headings and text-wrap: pretty for body copy, with a 12–18 character preferred headline measure and a readable 55–72ch body measure. Build an asymmetric editorial grid, one oversized high-contrast headline, sharp crop-like blocks, generous negative space and restrained CSS paper grain. Avoid a dashboard made of equal cards.',
  },
  soft: {
    id: 'soft',
    engine: 'Animata · Gentle interaction',
    source: 'codse/animata',
    sourceUrl: 'https://github.com/codse/animata',
    implementation: 'Use warm low-chroma surfaces, large but consistent radii, quiet ambient shadows and friendly typography. Interactive cards may tilt no more than 0.6deg, links lift no more than 2px, and buttons may use one bounded ripple clipped by the control. Use a decelerating cubic-bezier(0.22,1,0.36,1) and disable transforms under prefers-reduced-motion. Keep text contrast at 4.5:1 or higher.',
  },
  precision: {
    id: 'precision',
    engine: 'Classic skeuomorphism · Physical metaphor',
    source: 'Nielsen Norman Group',
    sourceUrl: 'https://www.nngroup.com/articles/skeuomorphism/',
    implementation: 'Use an explicit real-world control-panel metaphor with stitched leather, brushed metal, machined knobs, engraved labels, inset wells and status lamps. Maintain one top-left light source and make every highlight, bevel and shadow agree with it. Controls must look operable before hover and move 1–2px when pressed. Keep text contrast at 4.5:1 or higher and disable transforms under prefers-reduced-motion.',
  },
  console: {
    id: 'console',
    engine: 'Tremor · Data hierarchy',
    source: 'tremorlabs/tremor',
    sourceUrl: 'https://github.com/tremorlabs/tremor',
    implementation: 'Use a dense but scannable console with persistent navigation, grouped status regions and tabular numerals. Cards use one border and minimal shadow; tables scroll horizontally on narrow screens, keep headers visually stronger than cells, use row separators rather than boxed cells, and reserve semantic colors for success, warning and error. Progress indicators require role, label, value and max. Never sacrifice legibility for glow.',
  },
  spatial: {
    id: 'spatial',
    engine: 'LiquidGlass optical surface',
    source: 'hwyuanzi/LiquidGlass-UI',
    sourceUrl: 'https://github.com/hwyuanzi/LiquidGlass-UI',
    implementation: 'Use glass only for navigation and interactive control layers over a backdrop with real visual information. Use backdrop-filter blur(18px) saturate(135%) brightness(104%), a 7.5% white tint, a fixed top sheen, a 1px specular rim, subtle bottom occlusion and an opaque fallback. Hover lifts at most 2px. Respect prefers-reduced-transparency, prefers-contrast and prefers-reduced-motion.',
  },
  fluent: {
    id: 'fluent',
    engine: 'Microsoft Fluent 2 · Mica workspace',
    source: 'Microsoft Fluent 2',
    sourceUrl: 'https://fluent2.microsoft.design/',
    implementation: 'Use a softly tinted Mica-like base, clear elevation hierarchy, restrained acrylic only on transient navigation, rounded containers, humanist typography and localized brand color. Use depth to communicate relationship rather than decoration, keep persistent content opaque, and provide visible hover, pressed and keyboard focus states.',
  },
  spectrum: {
    id: 'spectrum',
    engine: 'Adobe Spectrum 2 · Creative workspace',
    source: 'Adobe Spectrum',
    sourceUrl: 'https://spectrum.adobe.com/',
    implementation: 'Use a neutral creative-workspace canvas, compact professional panels, one vivid action color, explicit selection states and density suitable for repeated production tasks. Keep controls visually consistent across panels, reserve color for state and action, use clear focus indicators, and let content remain visually dominant.',
  },
  carbon: {
    id: 'carbon',
    engine: 'IBM Carbon · 2x enterprise grid',
    source: 'IBM Carbon',
    sourceUrl: 'https://carbondesignsystem.com/',
    implementation: 'Build an enterprise workspace on a strict 2x grid with a black global header, persistent left navigation, edge-to-edge content regions and data tables separated by rules rather than floating cards. Use type scale and whitespace to create hierarchy, blue only for interactive emphasis, square geometry, strong keyboard focus and horizontally safe tables.',
  },
  polaris: {
    id: 'polaris',
    engine: 'Shopify Polaris · Commerce workflow',
    source: 'Shopify Polaris',
    sourceUrl: 'https://polaris.shopify.com/',
    implementation: 'Structure the page around merchant decisions: concise business summary, setup or next-action guidance, trustworthy status indicators, searchable lists and a dominant primary task. Use warm neutral surfaces, restrained green success color, compact rounded containers and plain-language labels. Prioritize scannability and clear recovery states.',
  },
  atlassian: {
    id: 'atlassian',
    engine: 'Atlassian Design · Collaborative board',
    source: 'Atlassian Design',
    sourceUrl: 'https://atlassian.design/',
    implementation: 'Use a project header, contextual navigation, horizontally arranged workflow columns, compact issue cards, assignee signals and explicit status transitions. Preserve high information scent, make selected work obvious, keep column backgrounds quiet and reserve blue for primary actions and focus.',
  },
  portfolio: {
    id: 'portfolio',
    engine: 'Framer Marketplace · Portfolio archetype',
    source: 'Framer Marketplace',
    sourceUrl: 'https://www.framer.com/marketplace/templates/',
    implementation: 'Use a full-bleed portfolio composition with oversized display type, a restrained index, one dominant project frame and a z-axis cascade of secondary work. Avoid dashboard cards. Use transform and opacity for hover depth, remove rotations and overlaps on mobile, and keep project titles and navigation readable over artwork.',
  },
  mobile: {
    id: 'mobile',
    engine: 'Mobbin · Mobile product patterns',
    source: 'Mobbin',
    sourceUrl: 'https://mobbin.com/',
    implementation: 'Design from the mobile task flow outward: one primary action per screen, large touch targets, bottom navigation, progressive disclosure, compact status summaries and obvious current state. In a desktop presentation, show the mobile flow as a device sequence rather than stretching it into dashboard cards.',
  },
  kinetic: {
    id: 'kinetic',
    engine: 'Godly · Kinetic landing archetype',
    source: 'Godly',
    sourceUrl: 'https://godly.website/',
    implementation: 'Build a high-impact landing composition with oversized kinetic typography, one detached navigation island, overlapping spatial objects and a single strong call to action. Motion must use only transform and opacity, remain decorative, stop under prefers-reduced-motion and never compromise text contrast or input targets.',
  },
  brutal: {
    id: 'brutal',
    engine: 'RetroUI hard-shadow system',
    source: 'neobrutalism/neobrutalism',
    sourceUrl: 'https://github.com/neobrutalism/neobrutalism',
    implementation: 'Use flat high-contrast fills, 2px black borders, 0–4px radii and consistent hard shadows chosen from 3px, 4px or 6px offsets. On press, translate the control toward its shadow and reduce the offset. Keep the structure disciplined rather than randomly loud.',
  },
  typelab: {
    id: 'typelab',
    engine: 'Codrops Playground · Variable type lab',
    source: 'Codrops Playground',
    sourceUrl: 'https://tympanus.net/codrops/playground/',
    implementation: 'Build a typography laboratory rather than a conventional landing page: one oversized variable-type specimen, a compact control rail, visible axis values and instant typographic state changes. Use monochrome contrast, layout driven by letterforms, transform or font-variation transitions only, and a static reduced-motion state.',
  },
  altweb: {
    id: 'altweb',
    engine: 'Hoverstat.es · Alternative web collage',
    source: 'Hoverstat.es',
    sourceUrl: 'https://hoverstat.es/',
    implementation: 'Use an anti-grid composition of overlapping browser windows, direct text links, deliberate z-order, cursor-like labels and contrasting content fragments. Keep overlap purposeful, preserve every control target, collapse to a non-overlapping vertical sequence on mobile, and avoid decorative gradients.',
  },
  exhibit: {
    id: 'exhibit',
    engine: 'Awwwards Experimental · Digital exhibition',
    source: 'Awwwards Experimental',
    sourceUrl: 'https://www.awwwards.com/websites/experimental/',
    implementation: 'Build a spatial exhibition with a restrained perspective stage, horizontal artwork sequence, numbered wayfinding and camera-like transitions. Use CSS perspective and transform only, retain a legible navigation layer, remove depth transforms under reduced motion, and provide a flat horizontal-scroll fallback on narrow screens.',
  },
  infinitecanvas: {
    id: 'infinitecanvas',
    engine: 'Codrops · Infinite Canvas pattern',
    source: 'Codrops Infinite Canvas',
    sourceUrl: 'https://tympanus.net/codrops/2026/01/07/infinite-canvas-building-a-seamless-pan-anywhere-image-space/',
    implementation: 'Create a pan-and-zoom spatial canvas with clustered content, a stable minimap and explicit orientation cues. Keep semantic content in the DOM, use transforms for movement, provide keyboard zoom controls and a flat list fallback. The prototype recreates the interaction model locally without copying WebGL code or adding runtime packages.',
  },
  assembly: {
    id: 'assembly',
    engine: 'Codrops · Layout Formation',
    source: 'Codrops On-Scroll Layout Formations',
    sourceUrl: 'https://tympanus.net/codrops/2024/09/18/exploration-of-on-scroll-layout-formations/',
    implementation: 'Start with separated editorial fragments and assemble them into a coherent grid in staged reading acts. Use transform and opacity only, keep the final state fully readable, expose a direct next-act control in the preview and remove pinned motion under prefers-reduced-motion.',
  },
  ambientcarousel: {
    id: 'ambientcarousel',
    engine: 'Codrops · Reactive 3D Carousel',
    source: 'Codrops Reactive Background Carousel',
    sourceUrl: 'https://tympanus.net/codrops/2025/11/11/building-a-3d-infinite-carousel-with-reactive-background-gradients/',
    implementation: 'Coordinate a center-focused card carousel with a content-derived ambient color field. Use DOM cards, CSS perspective and local gradients; preserve readable labels, visible previous and next controls, and static card rows when reduced motion is requested. No tutorial source code or image assets are bundled.',
  },
  textgallery: {
    id: 'textgallery',
    engine: 'Codrops · Tooltip Gallery Transition',
    source: 'Codrops Tooltip to Gallery',
    sourceUrl: 'https://tympanus.net/codrops/2022/12/07/tooltip-to-gallery-page-transition/',
    implementation: 'Use phrases inside editorial copy as explicit image-gallery triggers. Support hover, focus and click equally, keep trigger text underlined and keyboard reachable, expand previews without losing reading context, and provide an obvious close action. Reimplement the pattern with local DOM and CSS only.',
  },
  ascii: {
    id: 'ascii',
    engine: 'Codrops · ASCII / Dither study',
    source: 'Codrops Creative Hub',
    sourceUrl: 'https://tympanus.net/codrops/tag/webgl/page/2/',
    implementation: 'Translate imagery into a character or dither surface while keeping all headings and actions as semantic HTML. Let users switch raster modes and sampling density, use a static preformatted fallback in the prototype, keep contrast high and disable animated scan effects under reduced motion.',
  },
};

export function getVisualStyleRecipe(id: unknown) {
  return visualStyleRecipes[String(id)] || visualStyleRecipes.minimal;
}
