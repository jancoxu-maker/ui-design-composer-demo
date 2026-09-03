import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defaultPageIR, type TemplateVariant } from '../lib/shared-template-compiler';
import { renderTemplateDocument } from '../lib/render-template-document';
import { evaluateTemplateParity, templateParityIds } from '../lib/template-parity';
import { formatGeneratedHtml } from '../lib/format-generated-html';
import { buildAgentTemplatePackage } from '../lib/agent-template-package';
import { getTemplateGenerationCapsule } from '../lib/template-generation-capsules';
import { getVisualStyleRecipe } from '../lib/visual-style-engine';

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

const scenarios: Array<{ id: string; uxPattern: string; preserve: string[]; locks: string[]; preserveStructure: boolean }> = [
  { id: 'plain', uxPattern: 'none', preserve: ['content'], locks: ['content'], preserveStructure: false },
  { id: 'ux', uxPattern: 'workspace', preserve: ['content'], locks: ['content'], preserveStructure: false },
  { id: 'locked', uxPattern: 'none', preserve: ['content', 'structure'], locks: ['content', 'layout'], preserveStructure: true },
];
const failures: Array<{ templateId: string; variant: string; scenario: string; score: number; missing: string[] }> = [];
const scriptFailures: Array<{ templateId: string; variant: string; scenario: string; error: string }> = [];
const outputDirectory = await mkdtemp(join(tmpdir(), 'compose-template-parity-'));

for (const templateId of templateParityIds) {
  for (const variant of variants) {
    for (const scenario of scenarios) {
      const html = formatGeneratedHtml(renderTemplateDocument(templateId, defaultPageIR, { ...baseSelections, ...scenario, visualDirection: templateId }, variant));
      if (!html.includes('id="compose-non-navigating-interactions"') || !html.includes("dataset.composeNavigation='disabled'")) {
        scriptFailures.push({ templateId, variant, scenario: scenario.id, error: 'missing non-navigating interaction contract' });
      }
      const report = evaluateTemplateParity(templateId, html, { preserveStructure: scenario.preserveStructure });
      for (const source of [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1])) {
        try { new Function(source); } catch (error) { scriptFailures.push({ templateId, variant, scenario: scenario.id, error: String(error) }); }
      }
      await writeFile(join(outputDirectory, `${templateId}-${variant}-${scenario.id}.html`), html);
      if (!report.passed) failures.push({ templateId, variant, scenario: scenario.id, score: report.score, missing: report.missing });
    }
  }
}

const longTitleHtml = renderTemplateDocument('kinetic', { ...defaultPageIR, title: '把创意任务资产审核反馈与所有交付环节集中到同一个专业工作台' }, baseSelections, 'bold');
if (!/data-compose-title-length="extra-long"/.test(longTitleHtml)) failures.push({ templateId: 'kinetic', variant: 'bold', scenario: 'long-title', score: 0, missing: ['长中文标题保护'] });
const mediumCjkTitleHtml = renderTemplateDocument('ambientcarousel', { ...defaultPageIR, title: '统一管理创意项目、素材与交付' }, baseSelections, 'balanced');
if (!/data-compose-title-length="long"/.test(mediumCjkTitleHtml)) failures.push({ templateId: 'ambientcarousel', variant: 'balanced', scenario: 'cjk-title', score: 0, missing: ['中文标题保护'] });

const agentPackage = buildAgentTemplatePackage({ directionName: '现代产品极简', directionDescription: '清晰网格、中性表面与克制层级', recipe: getVisualStyleRecipe('minimal'), capsule: getTemplateGenerationCapsule('minimal'), uxName: '无 UX 方案', uxPrinciples: [], typeName: '现代无衬线', accent: '#7657ff', corners: '圆角', density: 52, motion: 58, headingScale: 100, directionSettings: [], preserve: ['内容文字'] });
if (!agentPackage.prompt.includes('模板核心代码') || !agentPackage.prompt.includes('data-template-role="hero"') || !agentPackage.keywords.includes('现代产品极简')) scriptFailures.push({ templateId: 'minimal', variant: 'balanced', scenario: 'agent-package', error: 'incomplete agent template package' });

const total = templateParityIds.length * variants.length * scenarios.length;
console.log(JSON.stringify({ templates: templateParityIds.length, variants: total, passed: total - failures.length, failed: failures.length, failures, scriptFailures, outputDirectory }, null, 2));
if (failures.length || scriptFailures.length) process.exitCode = 1;
