const STYLE_ID = 'compose-heading-scale';

function scaled(value: number, scale: number, unit: 'rem' | 'cqi') {
  return `${Number((value * scale).toFixed(3))}${unit}`;
}

export function applyHeadingScale(html: string, percentage: number) {
  const normalized = Math.max(80, Math.min(125, Math.round(percentage / 5) * 5));
  const scale = normalized / 100;
  const clamp = (min: number, fluid: number, max: number) => `clamp(${scaled(min, scale, 'rem')},${scaled(fluid, scale, 'cqi')},${scaled(max, scale, 'rem')})`;
  const css = `<style id="${STYLE_ID}" data-heading-scale="${normalized}">html body h1,html body [data-template-role="hero"] h1{font-size:${clamp(2.5, 6, 6.25)}!important}html body h2{font-size:${clamp(1.65, 3.8, 3.75)}!important}html body h3{font-size:${clamp(1.15, 2.2, 2.25)}!important}@container(max-width:720px){html body h1,html body [data-template-role="hero"] h1{font-size:${clamp(2.35, 9, 4.8)}!important}html body h2{font-size:${clamp(1.55, 5.5, 3.25)}!important}html body h3{font-size:${clamp(1.1, 4, 1.9)}!important}}@container(max-width:420px){html body h1,html body [data-template-role="hero"] h1{font-size:${clamp(2.15, 11, 3.65)}!important}html body h2{font-size:${clamp(1.45, 7, 2.5)}!important}html body h3{font-size:${clamp(1.05, 5, 1.55)}!important}}</style>`;
  const existing = new RegExp(`<style[^>]*id=["']${STYLE_ID}["'][^>]*>[\\s\\S]*?<\\/style>`, 'i');
  if (existing.test(html)) return html.replace(existing, css);
  return html.replace(/<\/head>/i, `${css}</head>`);
}
