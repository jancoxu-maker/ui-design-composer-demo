const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);

function formatCss(source: string) {
  const compact = source.replace(/\s+/g, ' ').replace(/([^;{}\s])\s*}/g, '$1;}').replace(/\s*{\s*/g, ' {\n').replace(/;\s*/g, ';\n').replace(/\s*}\s*/g, '\n}\n').trim();
  let depth = 0;
  return compact.split('\n').map((line) => {
    let value = line.trim();
    if (!value) return '';
    if (!value.endsWith('{') && !value.startsWith('}')) value = value.replace(/^([\w-]+):\s*/, '$1: ');
    if (value.startsWith('}')) depth = Math.max(0, depth - 1);
    const formatted = `${'  '.repeat(depth)}${value}`;
    if (value.endsWith('{')) depth += 1;
    return formatted;
  }).filter(Boolean).join('\n');
}

export function formatGeneratedHtml(source: string) {
  const styles: string[] = [];
  const protectedSource = source.trim().replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (_match, attributes, css) => {
    const index = styles.push(formatCss(css)) - 1;
    return `<style${attributes}>__COMPOSE_STYLE_${index}__</style>`;
  });
  const tokens = protectedSource.match(/<!--[\s\S]*?-->|<!doctype[^>]*>|<[^>]+>|[^<]+/gi) || [];
  const lines: string[] = [];
  let depth = 0;

  for (const token of tokens) {
    const value = token.trim();
    if (!value) continue;
    const closing = /^<\//.test(value);
    const opening = /^<[a-z][^>]*>$/i.test(value) && !closing;
    const tag = opening ? value.match(/^<([a-z0-9-]+)/i)?.[1]?.toLowerCase() : '';
    const selfClosing = /\/>$/.test(value) || (tag ? voidTags.has(tag) : false);
    if (closing) depth = Math.max(0, depth - 1);
    lines.push(`${'  '.repeat(depth)}${value}`);
    if (opening && !selfClosing) depth += 1;
  }

  let formatted = lines.join('\n');
  styles.forEach((css, index) => {
    const marker = `__COMPOSE_STYLE_${index}__`;
    const linePattern = new RegExp(`^(\\s*)${marker}$`, 'm');
    formatted = formatted.replace(linePattern, (_match, indent) => css.split('\n').map((line) => `${indent}${line}`).join('\n'));
  });
  return `${formatted.trim()}\n`;
}
