import { build } from 'esbuild';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const directory = await mkdtemp(join(tmpdir(), 'compose-parity-runner-'));
const outfile = join(directory, 'audit.mjs');
await build({
  entryPoints: ['scripts/audit-template-parity.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  logLevel: 'silent',
});
await import(pathToFileURL(outfile).href);
