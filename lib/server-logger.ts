type BackendLogLevel = 'info' | 'warn' | 'error';

const blockedKey = /^(?:api.?key|authorization|source|sourceData|image|imageData|html|prompt|content|token|accessToken)$/i;

function safeMetadata(metadata: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(metadata).map(([key, value]) => {
    if (blockedKey.test(key)) return [key, '[redacted]'];
    if (typeof value === 'string') return [key, value.slice(0, 160)];
    if (typeof value === 'number' || typeof value === 'boolean' || value == null) return [key, value];
    if (Array.isArray(value)) return [key, value.slice(0, 12).map((item) => String(item).slice(0, 80))];
    return [key, '[object]'];
  }));
}

export function backendLog(level: BackendLogLevel, event: string, requestId: string, metadata: Record<string, unknown> = {}) {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    requestId,
    ...safeMetadata(metadata),
  });
  const line = `[backend] ${entry}`;
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}
