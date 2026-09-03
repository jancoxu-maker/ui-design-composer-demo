Design system: Compose Visual Library

- Query: AI UI redesign visual direction template library professional creative tool
- Matched profile: saas
- Style direction: minimal-modern
- Palette: slate-indigo
- Typography: Inter + Space Grotesk
- Effects: subtle shadows and crisp borders
- Landing/layout bias: hero + product proof
- Avoid: low-contrast cards; decorative gradients that hide hierarchy
- Notes: Optimize for clarity and scanability.

## Shared visual-template contract

- The visual-library preview and exported HTML must call the same template compiler. A second illustrative implementation is not an acceptable preview.
- AI produces a compact PageIR containing business content, hierarchy, actions, status and locked-content mappings; it does not recreate the template shell.
- Each template owns its DOM, CSS, tokens, variant parameters, motion and responsive behavior.
- `safe`, `balanced` and `bold` are deterministic parameter variants of one template and one PageIR, not three unrelated AI-generated pages.
- Global post-processing must not flatten template-specific overlap, perspective, transforms or type scale. Responsive safety belongs to each template.
- Current shared templates: modern product minimal, bold editorial, spatial glass, classic skeuomorphism and Godly kinetic experiment.
- A template is verified only when the shared compiler generated it; role-label presence alone is not visual verification.
- Display typography uses container-relative `cqi` sizing with per-template minimum and maximum values. Preview zoom scales the whole device canvas and must not independently distort typography.
