import { getTemplateGenerationCapsule } from './template-generation-capsules';
import { isSharedTemplate } from './shared-template-compiler';

export type TemplateParityCheck = {
  id: 'identity' | 'structure' | 'layout' | 'surface' | 'typography' | 'motion' | 'interaction' | 'readability' | 'responsive';
  label: string;
  passed: boolean;
  applicable: boolean;
};

export type TemplateParityReport = {
  templateId: string;
  score: number;
  passed: boolean;
  mode: 'full-template' | 'visual-only';
  checks: TemplateParityCheck[];
  missing: string[];
};

type Fingerprint = {
  roles: string[];
  layout: string[];
  surface: string[];
  typography: string[];
};

const sharedRoles: Record<string, string[]> = {
  minimal: ['navigation', 'hero', 'metrics', 'content', 'primary-action'],
  editorial: ['masthead', 'hero', 'story', 'primary-action'],
  spatial: ['ambient-field', 'navigation', 'hero', 'content', 'primary-action'],
  precision: ['console', 'navigation', 'hero', 'controls', 'primary-action'],
  kinetic: ['navigation', 'hero', 'stage', 'primary-action'],
};

// These are visual-system fingerprints, not marker comments. Every token maps to
// an actual layout, surface or type rule that must survive in the delivered HTML.
const fingerprints: Record<string, Omit<Fingerprint, 'roles'>> = {
  minimal: { layout: ['product-shell', 'product-rail', 'work-grid'], surface: ['color-mix(in srgb', 'border-right:1px'], typography: ['letter-spacing:-.07em', 'font-weight:900'] },
  fluent: { layout: ['engine-product', 'ed-product-grid'], surface: ['backdrop-filter:blur(18px)', 'linear-gradient(145deg,#e8e8f0,#f8f7fa'], typography: ['font-family:Inter,-apple-system', 'letter-spacing:-.075em'] },
  spectrum: { layout: ['engine-product', 'ed-product-grid'], surface: ['background:#262626', 'repeating-linear-gradient(90deg'], typography: ['font-family:Inter,-apple-system', 'letter-spacing:-.075em'] },
  carbon: { layout: ['data-template-role="metrics"', 'border-collapse:collapse'], surface: ['#161616', '--template-radius:0px'], typography: ['font-size:clamp(2rem,4cqi,4.5rem)', 'font-weight:700'] },
  polaris: { layout: ['polaris-summary', 'polaris-queue'], surface: ['border-left:4px solid #4a8b61', '#f3f3f3'], typography: ['Inter,Arial', 'font-weight:700'] },
  atlassian: { layout: ['data-template-role="board"', 'grid-template-columns:repeat(3,minmax(210px,1fr))'], surface: ['background:#dfe1e6', '#172b4d'], typography: ['font-family:Arial', 'font-weight:700'] },
  editorial: { layout: ['editorial-shell', 'editorial-stage', 'cover-art'], surface: ['repeating-linear-gradient', 'border-bottom:1px solid var(--ink)'], typography: ['Georgia,"Songti SC",serif', 'letter-spacing:-.07em'], },
  portfolio: { layout: ['data-template-role="gallery"', 'grid-template-columns:1.6fr .8fr .6fr'], surface: ['--template-bg:#121113', '0 30px 80px rgba(0,0,0,.35)'], typography: ['Helvetica,Arial', 'font-size:clamp(64px'] },
  soft: { layout: ['soft-bento', 'grid-template-columns:1.2fr .8fr'], surface: ['background:#e6f2df', 'border-radius:999px!important'], typography: ['Avenir,Arial', 'font-weight:700'] },
  mobile: { layout: ['data-template-role="device"', 'width:min(390px,100%)'], surface: ['border:8px solid #17191c', 'border-radius:42px'], typography: ['-apple-system,Arial', 'font-weight:700'] },
  precision: { layout: ['hardware-shell', 'hardware-panel', 'control-bank'], surface: ['inset 0 0 0 5px', 'radial-gradient(circle at 34% 27%'], typography: ['Rockwell,Georgia,serif', 'font-size:64px'] },
  console: { layout: ['data-template-role="metrics"', 'data-template-role="table"'], surface: ['--template-bg:#080a0e', '0 0 30px rgba(88,105,255,.10)'], typography: ['ui-monospace,monospace', 'font-variant-numeric:tabular-nums'] },
  spatial: { layout: ['spatial-shell', 'glass-stage', 'orbit'], surface: ['backdrop-filter:blur(20px)', 'linear-gradient(145deg,#516aff'], typography: ['font-size:clamp(var(--display-min)', 'letter-spacing:-.07em'] },
  brutal: { layout: ['data-template-role="stage"', 'grid-template-columns:repeat(3,1fr)'], surface: ['--template-bg:#fff568', '6px 6px 0 #111'], typography: ['Arial Black,Arial', 'font-weight:700'] },
  kinetic: { layout: ['kinetic-shell', 'kinetic-stage', 'kinetic-orbit'], surface: ['conic-gradient', 'box-shadow:12px 12px 0 #17131a'], typography: ['Arial Black,Arial,sans-serif', 'letter-spacing:-.07em'] },
  typelab: { layout: ['type-lab-shell', 'axis-panel', 'type-stage'], surface: ['border-left:1px solid var(--template-border)', 'background:var(--compose-accent)'], typography: ['Arial Narrow', 'font-stretch:condensed'] },
  altweb: { layout: ['data-template-role="windows"', 'position:absolute;width:48%'], surface: ['--template-bg:#dfff73', '8px 8px 0 #111'], typography: ['ui-monospace,monospace', 'font-weight:700'] },
  exhibit: { layout: ['data-template-role="stage"', 'perspective:900px', 'rotateY(-7deg)'], surface: ['--template-bg:#151418', '0 30px 70px rgba(0,0,0,.42)'], typography: ['Helvetica,Arial', 'font-weight:700'] },
  infinitecanvas: { layout: ['data-template-role="canvas"', 'position:absolute;width:28%', 'compose-canvas-controls'], surface: ['background-size:24px 24px', 'radial-gradient(circle,rgba(73,64,79,.42)', 'backdrop-filter:blur(14px)'], typography: ['Inter,Arial', 'font-weight:700'] },
  assembly: { layout: ['data-template-role="story"', 'transform:rotate(-.6deg)', 'margin-left:20%'], surface: ['--template-bg:#eee6d6', '8px 10px 0'], typography: ['Georgia,"Songti SC",serif', 'line-height:.9'] },
  ambientcarousel: { layout: ['data-template-role="carousel"', 'perspective:1000px', 'rotateY(12deg)'], surface: ['backdrop-filter:blur(16px)', 'radial-gradient(circle at 20% 20%,#8f70ff'], typography: ['Helvetica,Arial', 'font-weight:700'] },
  textgallery: { layout: ['data-template-role="story"', 'columns:2', 'column-gap:48px'], surface: ['text-decoration-color:var(--compose-accent)', '--template-bg:#f5efe3'], typography: ['Georgia,"Songti SC",serif', 'font-size:clamp(52px'] },
  ascii: { layout: ['data-template-role="raster"', 'grid-template-columns:.75fr 1.25fr'], surface: ['repeating-linear-gradient(0deg', '--template-bg:#0d1010'], typography: ['ui-monospace,monospace', 'white-space:pre-wrap'] },
};

function containsAll(html: string, tokens: string[]) {
  return tokens.every((token) => html.includes(token));
}

function rolesFor(templateId: string) {
  return isSharedTemplate(templateId) ? sharedRoles[templateId] : getTemplateGenerationCapsule(templateId).requiredRoles;
}

const interactionSignatures: Record<string, RegExp> = {
  infinitecanvas: /data-compose-canvas-motion=["'](?:interactive|reduced)["']/,
  ambientcarousel: /id=["']compose-carousel-motion["']/,
  textgallery: /id=["']compose-text-gallery-motion["']/,
};

export function evaluateTemplateParity(templateIdInput: unknown, html: string, options: { preserveStructure?: boolean } = {}): TemplateParityReport {
  const templateId = String(templateIdInput || 'minimal');
  const fingerprint = fingerprints[templateId] || fingerprints.minimal;
  const roles = rolesFor(templateId);
  const normalized = html.replace(/\s+/g, ' ').replace(/\s*([:;,{}()])\s*/g, '$1');
  const fullTemplate = !options.preserveStructure;
  const checks: TemplateParityCheck[] = [
    { id: 'identity', label: '模板身份', passed: new RegExp(`data-compose-template=["']${templateId}["']`, 'i').test(html), applicable: true },
    { id: 'structure', label: '专属结构', passed: !fullTemplate || roles.every((role) => new RegExp(`data-template-role=["']${role}["']`, 'i').test(html)), applicable: fullTemplate },
    { id: 'layout', label: '版式指纹', passed: !fullTemplate || containsAll(normalized, fingerprint.layout), applicable: fullTemplate },
    { id: 'surface', label: '材质与色彩', passed: containsAll(normalized, fingerprint.surface), applicable: true },
    { id: 'typography', label: '字体层级', passed: containsAll(normalized, fingerprint.typography), applicable: true },
    { id: 'motion', label: '动效规则', passed: /--(?:compose-)?duration:/.test(normalized) && /prefers-reduced-motion/.test(normalized) && /transition/.test(normalized) && (templateId !== 'infinitecanvas' || /data-compose-canvas-motion=["'](?:interactive|reduced)["']/.test(html)), applicable: true },
    { id: 'interaction', label: '核心交互', passed: !interactionSignatures[templateId] || interactionSignatures[templateId].test(html), applicable: Boolean(interactionSignatures[templateId]) },
    { id: 'readability', label: '文字防碰撞', passed: /id=["']compose-title-safety["']/.test(html) && /data-compose-title-length=["'](?:short|long|extra-long)["']/.test(html) && /overflow-wrap:(?:anywhere|break-word)/.test(normalized), applicable: true },
    { id: 'responsive', label: '双端响应式', passed: /<meta[^>]+name=["']viewport["']/i.test(html) && /@(media|container)\(max-width:(?:640|720|760|900)px\)/.test(normalized), applicable: true },
  ];
  const applicableChecks = checks.filter((check) => check.applicable);
  const passedCount = applicableChecks.filter((check) => check.passed).length;
  const score = Math.round((passedCount / applicableChecks.length) * 100);
  return {
    templateId,
    score,
    passed: passedCount === applicableChecks.length,
    mode: fullTemplate ? 'full-template' : 'visual-only',
    checks,
    missing: applicableChecks.filter((check) => !check.passed).map((check) => check.label),
  };
}

export const templateParityIds = Object.freeze(Object.keys(fingerprints));
