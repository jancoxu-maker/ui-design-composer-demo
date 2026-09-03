type GuardContext = {
  engine?: string;
  source?: string;
  visualId?: string;
  material?: string;
};

function visibleBodyText(html: string) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
  return body
    .replace(/<(style|script|template)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&colon;/gi, ':')
    .replace(/&equals;/gi, '=')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function meaningfulSourceNames(value: string) {
  return value.split(/[·/|—–-]/).map((part) => part.trim()).filter((part) => part.length >= 6);
}

export function findGeneratedMetadataLeaks(html: string, context: GuardContext = {}) {
  const text = visibleBodyText(html);
  const leaks: string[] = [];
  const patterns: Array<[string, RegExp]> = [
    ['生成字段', /\b(?:visual|visualDirection|uxPattern|uxPatternName|typeTone|directionSettings|templateCompatibility|preserve|locks|density|motion)\s*[:：=]/i],
    ['高级字段', /\b[a-z]+[A-Z][A-Za-z]*\s*=\s*[\w-]+/],
    ['验证报告', /\bcoverage\b|\b11\s*\/\s*11\b/i],
    ['模板调试面板', /\bTYPE\s+AXIS\b|\bMORPH\s+STATE\b|\bTEMPLATE\s+CONTROLS\b/i],
    ['内部中文说明', /当前视觉实现引擎|模板代码配方|生成约束|保留原有体验|未增加(?:任务清单|审核栏|监控面板|转化漏斗)/],
  ];
  for (const [label, pattern] of patterns) if (pattern.test(text)) leaks.push(label);

  const sampleCopy = text.match(/\bCREATIVE\s+OPERATIONS\b|\bISSUE\s+0?4\b|\bFIELD\s+NOTE\b|\bMASTER\s+CONTROL\b|\bWORLDWIDE\b/i)?.[0];
  if (sampleCopy && !String(context.material || '').toLocaleLowerCase().includes(sampleCopy.toLocaleLowerCase())) leaks.push('模板示例文案');

  const sourceNames = [context.engine || '', context.source || ''].flatMap(meaningfulSourceNames);
  for (const name of sourceNames) {
    if (text.toLocaleLowerCase().includes(name.toLocaleLowerCase())) leaks.push(`模板来源：${name}`);
  }
  if (context.visualId && new RegExp(`\\b${context.visualId}\\b`, 'i').test(text) && /(?:visual|template|视觉|模板)/i.test(text)) leaks.push(`模板 ID：${context.visualId}`);
  return [...new Set(leaks)];
}
