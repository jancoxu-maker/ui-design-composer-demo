import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defaultPageIR, type TemplateVariant } from '../lib/shared-template-compiler';
import { renderTemplateDocument } from '../lib/render-template-document';
import { evaluateTemplateParity, templateParityIds } from '../lib/template-parity';
import { formatGeneratedHtml } from '../lib/format-generated-html';

const variants: TemplateVariant[] = ['safe', 'balanced', 'bold'];
const baseSelections = {
  goal: 'brand',
  audience: 'professional',
  accent: '#7657ff',
  density: 52,
  motion: 58,
  corners: 'round',
  typeTone: 'system',
  directionSettings: {},
};

const scenarios = [
  { id: 'plain', uxPattern: 'none', preserve: ['content'], locks: ['content'], preserveStructure: false },
  { id: 'ux', uxPattern: 'workspace', preserve: ['content'], locks: ['content'], preserveStructure: false },
  { id: 'locked', uxPattern: 'none', preserve: ['content', 'structure'], locks: ['content', 'layout'], preserveStructure: true },
] as const;
const failures: Array<{ templateId: string; variant: string; scenario: string; score: number; missing: string[] }> = [];
const outputDirectory = await mkdtemp(join(tmpdir(), 'compose-template-parity-'));

for (const templateId of templateParityIds) {
  for (const variant of variants) {
    for (const scenario of scenarios) {
      const html = formatGeneratedHtml(renderTemplateDocument(templateId, defaultPageIR, { ...baseSelections, ...scenario, visualDirection: templateId }, variant));
      const report = evaluateTemplateParity(templateId, html, { preserveStructure: scenario.preserveStructure });
      await writeFile(join(outputDirectory, `${templateId}-${variant}-${scenario.id}.html`), html);
      if (!report.passed) failures.push({ templateId, variant, scenario: scenario.id, score: report.score, missing: report.missing });
    }
  }
}

const total = templateParityIds.length * variants.length * scenarios.length;
console.log(JSON.stringify({ templates: templateParityIds.length, variants: total, passed: total - failures.length, failed: failures.length, failures, outputDirectory }, null, 2));
if (failures.length) process.exitCode = 1;
