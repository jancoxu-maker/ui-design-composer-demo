import type { TemplateSelections } from './shared-template-compiler';

function safeAttr(value: unknown) {
  return String(value ?? '').replace(/[&"<>]/g, (character) => ({ '&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;' })[character] || character);
}

function contrastColor(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  const luminance = ((value >> 16) * 299 + ((value >> 8) & 255) * 587 + (value & 255) * 114) / 1000;
  return luminance > 150 ? '#17131a' : '#ffffff';
}

const fonts: Record<string,string> = {
  serif:'Georgia,"Songti SC",serif', grotesk:'Inter,"PingFang SC",sans-serif', human:'Avenir,"PingFang SC",sans-serif', mono:'ui-monospace,monospace',
  display:'Didot,"Songti SC",serif', condensed:'"Arial Narrow","PingFang SC",sans-serif', rounded:'"Arial Rounded MT Bold","PingFang SC",sans-serif',
  system:'-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif', slab:'Rockwell,Georgia,serif', contrast:'Didot,Bodoni,"Songti SC",serif', hand:'"Kaiti SC",cursive', hybrid:'Georgia,"Songti SC",serif',
};

const contractKeys = ['goal','audience','ux','visual','type','directionSettings','corners','accent','density','motion','preserveLocks'] as const;

export function applySelectionContract(html: string, selections: TemplateSelections & Record<string, unknown>) {
  const accent = typeof selections.accent === 'string' && /^#[0-9a-f]{6}$/i.test(selections.accent) ? selections.accent : '#7657ff';
  const density = Math.max(20, Math.min(85, Number(selections.density) || 52));
  const motion = Math.max(10, Math.min(90, Number(selections.motion) || 58));
  const cardMin = Math.round(149 - density * .72);
  const cardPad = Math.round(20 - density * .12);
  const lineHeight = (1.82 - density * .006).toFixed(2);
  const duration = Math.round(920 - motion * 6);
  const radius = selections.corners === 'sharp' ? '0px' : selections.corners === 'pill' ? '999px' : '18px';
  const cardRadius = selections.corners === 'sharp' ? '0px' : selections.corners === 'pill' ? '28px' : '18px';
  const font = fonts[String(selections.typeTone)] || fonts.system;
  const style = `<style id="compose-selection-contract">:root{--compose-accent:${accent};--compose-accent-contrast:${contrastColor(accent)};--compose-radius:${radius};--compose-card-radius:${cardRadius};--compose-card-min:${cardMin}px;--compose-card-pad:${cardPad}px;--compose-leading:${lineHeight};--compose-duration:${duration}ms}body{font-family:${font}}:where(article,[class*="card"],[class*="panel"]):not([data-density-exempt]){min-height:var(--compose-card-min);padding-block:var(--compose-card-pad);border-radius:var(--compose-card-radius)}:where(p,li,small,td,dd){line-height:var(--compose-leading)}:where(button,a,[role="button"],[aria-selected="true"],[aria-pressed="true"]){transition-duration:var(--compose-duration)}:where(button.primary,[data-primary],[aria-current],[aria-selected="true"],[aria-pressed="true"],[data-template-role="primary-action"]){border-radius:var(--compose-radius);border-color:var(--compose-accent);background:var(--compose-accent);color:var(--compose-accent-contrast);accent-color:var(--compose-accent)}:where(a,:focus-visible){text-decoration-color:var(--compose-accent);outline-color:var(--compose-accent)}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}</style>`;
  const selectionValue: Record<string, unknown> = { ...selections, ux: selections.uxPattern, visual: selections.visualDirection, type: selections.typeTone };
  const attributes = contractKeys.map((key) => `data-compose-${key.toLowerCase()}="${safeAttr(key === 'directionSettings' ? JSON.stringify(selections.directionSettings || {}) : key === 'preserveLocks' ? `${JSON.stringify(selections.preserve || [])}|${JSON.stringify(selections.locks || [])}` : selectionValue[key])}"`).join(' ');
  return html.replace(/<body([^>]*)>/i, `<body$1 ${attributes}>`).replace(/<style[^>]*id=["']compose-selection-contract["'][^>]*>[\s\S]*?<\/style>/i, '').replace(/<\/head>/i, `${style}</head>`);
}
