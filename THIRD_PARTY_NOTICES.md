# Third-party visual implementation notices

This prototype contains locally adapted implementation ideas from permissively licensed projects listed below. No remote scripts, CLIs, telemetry, or runtime packages from these repositories are loaded by the application.

## UX pattern references

The UX library uses original local React/CSS implementations informed by the interaction patterns and accessibility guidance in the repositories below. No third-party package, script, asset, trademark, or source file is bundled or executed.

- GOV.UK Frontend — task completion, forms, error recovery, progressive enhancement. MIT. https://github.com/alphagov/govuk-frontend
- Adobe React Spectrum / React Aria — adaptive input, accessible collections, keyboard interaction, creation tools. Apache-2.0. https://github.com/adobe/react-spectrum
- PatternFly React — enterprise workspaces, bulk actions, status and monitoring patterns. MIT. https://github.com/patternfly/patternfly-react
- Shopify Polaris — resource discovery, filtering, business workflows and conversion clarity. MIT. https://github.com/Shopify/polaris
- Atlassian Pragmatic drag and drop — direct manipulation and collaborative workflow references. Apache-2.0. https://github.com/atlassian/pragmatic-drag-and-drop
- IBM Carbon — data-heavy workspaces, notification and status patterns. Apache-2.0. https://github.com/carbon-design-system/carbon
- Material Web — mobile navigation and single-task interaction references. Apache-2.0; upstream is in maintenance mode, so it is used as a static reference only. https://github.com/material-components/material-web

## LiquidGlass UI

- Source: https://github.com/hwyuanzi/LiquidGlass-UI
- Reviewed revision: `293328c3a983b55460b488bffb2caa6f25729c2f`
- Copyright (c) 2026 Hollan Yuan
- License: MIT
- Adaptation: optical surface tokens, fixed specular rim, top sheen, restrained hover response, and accessibility fallbacks.

## Motion Primitives

- Source: https://github.com/ibelick/motion-primitives
- Reviewed revision: `92586e62a951eb9b6bfd1cc7c8a4e6e2ab6ba17d`
- Copyright (c) 2024 ibelick
- License: MIT
- Adaptation: shared selection background, glow/border-trail motion concepts, implemented here with dependency-free CSS.

## RetroUI / NeoBrutalism

- Source: https://github.com/neobrutalism/neobrutalism
- Reviewed revision: `d5fbc0e823bb66575f5372c3df03ee43be45c91b`
- Copyright (c) 2024 Arif Hossain
- License: MIT
- Adaptation: consistent hard-shadow scale, high-contrast borders, small radii, and press-state geometry.

The full MIT license text for each project is available in its linked repository. The above copyright and permission notices must be preserved with substantial copied portions.

## External visual references (no code or assets copied)

The following non-GitHub sources are used as design-language references. Their proprietary templates, illustrations, brand assets, fonts, and component code are not bundled or redistributed.

- Microsoft Fluent 2: https://fluent2.microsoft.design/ — Mica-like workspace hierarchy, elevation, state and accessibility principles.
- Adobe Spectrum: https://spectrum.adobe.com/ — creative-tool density, neutral canvases, component consistency and action hierarchy.
- Webflow Editorial templates: https://webflow.com/templates/search/editorial — editorial composition, typographic scale and asymmetric page archetypes.
- Nielsen Norman Group, “Skeuomorphism”: https://www.nngroup.com/articles/skeuomorphism/ — real-world interface metaphors and affordance principles.
- IBM Carbon: https://carbondesignsystem.com/ — enterprise grid, shell and data-workspace hierarchy.
- Shopify Polaris: https://polaris.shopify.com/ — merchant workflows, task guidance and commerce information architecture.
- Atlassian Design: https://atlassian.design/ — collaborative work patterns, boards and status communication.
- Framer Marketplace: https://www.framer.com/marketplace/templates/ — portfolio, landing and z-axis template archetypes.
- Godly: https://godly.website/ — experimental landing-page composition and kinetic art direction.
- Mobbin: https://mobbin.com/ — mobile and web product-flow references. No screenshot library content is redistributed.
- Codrops Playground: https://tympanus.net/codrops/playground/ — experimental typography, interaction and layout research.
- Hoverstat.es: https://hoverstat.es/ — alternative web structures, anti-grid composition and window collage references.
- Awwwards Experimental: https://www.awwwards.com/websites/experimental/ — experimental navigation, spatial exhibition and interaction references.
- Codrops Infinite Canvas: https://tympanus.net/codrops/2026/01/07/infinite-canvas-building-a-seamless-pan-anywhere-image-space/ — pan-and-zoom spatial content model. The React Three Fiber tutorial code and imagery are not bundled.
- Codrops On-Scroll Layout Formations: https://tympanus.net/codrops/2024/09/18/exploration-of-on-scroll-layout-formations/ — staged layout-assembly concept. The GSAP demo code and assets are not bundled.
- Codrops Reactive 3D Carousel: https://tympanus.net/codrops/2025/11/11/building-a-3d-infinite-carousel-with-reactive-background-gradients/ — center-focused carousel and content-responsive ambient color concept. The tutorial code and images are not bundled.
- Codrops Tooltip to Gallery: https://tympanus.net/codrops/2022/12/07/tooltip-to-gallery-page-transition/ — editorial phrase-to-gallery interaction concept. The GSAP Flip implementation and images are not bundled.
- Codrops ASCII / Dithering research: https://tympanus.net/codrops/tag/webgl/page/2/ — character, dither and scanline rendering references. WebGL shader code is not bundled.

These five directions are original dependency-free React/CSS demonstrations. They do not load remote scripts, analytics, fonts, images, binaries, install hooks, or repository packages at runtime.

## Once UI

- Source: https://github.com/once-ui-system/core
- Reviewed revision: `828d23440ef9c056d940b09af2a96761d0c56268`
- Copyright (c) 2024-2025 Once UI
- License: MIT
- Adaptation: responsive spacing scale, semantic alpha surfaces, and token-driven component geometry.

## Tremor

- Source: https://github.com/tremorlabs/tremor
- Reviewed revision: `ca4d588f47820ff3d514d37fa4ee08a4222dec11`
- Copyright © 2025 Tremor
- License: Apache License 2.0
- Adaptation: data-card hierarchy, horizontally safe tables, semantic progress states, and accessible value labeling.

## Animata

- Source: https://github.com/codse/animata
- Reviewed revision: `de9aabb0eed14e0db944bb07720961ddc450c672`
- Copyright (c) Animata
- License: MIT
- Adaptation: bounded ripple, subtle card tilt, center-out underline, and reduced-motion behavior. The repository package, prepare hook, and analytics dependencies are not included.

## React Wrap Balancer

- Source: https://github.com/shuding/react-wrap-balancer
- Reviewed revision: `152d219fac2dd00f2698dda1e1de532a5efb2a0e`
- Copyright (c) 2022 Shu Ding
- License: MIT
- Adaptation: native `text-wrap: balance` and readable text measures. The package's inline-script fallback is not included.
