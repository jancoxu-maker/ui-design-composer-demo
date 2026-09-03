import { isIP } from 'node:net';
import { lookup } from 'node:dns/promises';

const MAX_REDIRECTS = 3;
const MAX_HTML_BYTES = 1_500_000;
const MAX_CONTEXT_CHARS = 24_000;

export class PublicPageContextError extends Error {
  status: number;

  constructor(message: string, status = 422) {
    super(message);
    this.name = 'PublicPageContextError';
    this.status = status;
  }
}

function isPrivateIpv4(address: string) {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 0) ||
    (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19));
}

function isPrivateIp(address: string) {
  if (isIP(address) === 4) return isPrivateIpv4(address);
  const normalized = address.toLowerCase().split('%')[0];
  if (normalized.startsWith('::ffff:')) return isPrivateIpv4(normalized.slice(7));
  return normalized === '::' || normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') ||
    normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb');
}

async function validatePublicUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new PublicPageContextError('网址格式无效，请检查后重试。', 400);
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new PublicPageContextError('只支持无需登录的公开 HTTP 或 HTTPS 页面。', 400);
  }
  if (url.port && !['80', '443'].includes(url.port)) {
    throw new PublicPageContextError('为保护本机与内网，只支持标准网页端口。', 400);
  }
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new PublicPageContextError('不能读取本机、局域网或内部系统地址。', 400);
  }
  if (isIP(hostname) && isPrivateIp(hostname)) throw new PublicPageContextError('不能读取本机、局域网或内部系统地址。', 400);
  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true });
    if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address))) {
      throw new PublicPageContextError('该地址指向本机、局域网或内部网络，无法读取。', 400);
    }
  } catch (error) {
    if (error instanceof PublicPageContextError) throw error;
    throw new PublicPageContextError('无法解析这个网址，请确认页面可以公开访问。');
  }
  url.hash = '';
  return url;
}

async function readLimitedBody(response: Response) {
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > MAX_HTML_BYTES) throw new PublicPageContextError('页面内容过大，请改用截图或单页 HTML。', 413);
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_HTML_BYTES) {
      await reader.cancel();
      throw new PublicPageContextError('页面内容过大，请改用截图或单页 HTML。', 413);
    }
    chunks.push(value);
  }
  const merged = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(merged);
}

function decodeEntities(value: string) {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => {
    if (entity[0] === '#') {
      const hex = entity[1]?.toLowerCase() === 'x';
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' ';
    }
    return named[entity.toLowerCase()] || ' ';
  });
}

function textOnly(value: string) {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function unique(values: string[], limit: number) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.toLocaleLowerCase();
    if (!value || value.length > 500 || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

function extractMatches(html: string, pattern: RegExp, limit: number) {
  return unique(Array.from(html.matchAll(pattern), (match) => textOnly(match[1] || '')), limit);
}

function metaContent(html: string, names: string[]) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
      new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["'][^>]*>`, 'i'),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return textOnly(match[1]);
    }
  }
  return '';
}

function extractContext(html: string, finalUrl: URL) {
  const cleaned = html
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/<(script|style|noscript|svg|template|canvas)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  const title = textOnly(cleaned.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
  const description = metaContent(cleaned, ['description', 'og:description', 'twitter:description']);
  const headings = extractMatches(cleaned, /<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/gi, 30);
  const navigation = extractMatches(cleaned, /<(?:a|button)\b[^>]*>([\s\S]*?)<\/(?:a|button)>/gi, 40)
    .filter((value) => value.length <= 80);
  const blocks = extractMatches(cleaned, /<(?:p|li|dt|dd|label|article|section)\b[^>]*>([\s\S]*?)<\/(?:p|li|dt|dd|label|article|section)>/gi, 80)
    .filter((value) => value.length >= 3);
  const fallback = textOnly(cleaned.replace(/<\/[^>]+>/g, '\n')).slice(0, 10_000);
  const visible = unique([...headings, ...navigation, ...blocks, fallback], 130).join('\n').slice(0, MAX_CONTEXT_CHARS);
  if ((title + description + visible).length < 160) {
    throw new PublicPageContextError('这个页面没有提供足够的公开内容，可能依赖登录或脚本渲染。请改用截图或 HTML。');
  }
  return [
    '[已安全读取的公开网页材料]',
    `最终地址：${finalUrl.origin}${finalUrl.pathname}`,
    title ? `页面标题：${title}` : '',
    description ? `页面描述：${description}` : '',
    headings.length ? `标题层级：\n${headings.join('\n')}` : '',
    navigation.length ? `导航与操作：\n${navigation.join('\n')}` : '',
    `公开可见文本：\n${visible}`,
  ].filter(Boolean).join('\n\n').slice(0, MAX_CONTEXT_CHARS);
}

export async function fetchPublicPageContext(raw: string) {
  let current = await validatePublicUrl(raw);
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    let response: Response;
    try {
      response = await fetch(current, {
        redirect: 'manual',
        signal: AbortSignal.timeout(12_000),
        headers: {
          Accept: 'text/html,application/xhtml+xml;q=0.9',
          'User-Agent': 'Compose-UI-Analyzer/1.0 (+single-page design analysis)',
        },
      });
    } catch {
      throw new PublicPageContextError('无法读取这个公开页面，请检查地址，或改用截图/HTML。');
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location || redirect === MAX_REDIRECTS) throw new PublicPageContextError('页面重定向次数过多，请改用最终网址。');
      current = await validatePublicUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok) throw new PublicPageContextError(`页面无法公开读取（HTTP ${response.status}），请改用截图或 HTML。`);
    const contentType = response.headers.get('content-type')?.toLowerCase() || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new PublicPageContextError('这个地址不是可分析的网页，请改用网页地址、截图或 HTML。');
    }
    return { context: extractContext(await readLimitedBody(response), current), hostname: current.hostname };
  }
  throw new PublicPageContextError('无法读取这个公开页面。');
}
