import { formatGeneratedHtml } from './format-generated-html';
import type { TemplateGenerationCapsule } from './template-generation-capsules';
import type { VisualStyleRecipe } from './visual-style-engine';

type AgentTemplatePackageInput = {
  directionName: string;
  directionDescription: string;
  recipe: VisualStyleRecipe;
  capsule: TemplateGenerationCapsule;
  uxName: string;
  uxPrinciples: string[];
  typeName: string;
  accent: string;
  corners: string;
  density: number;
  motion: number;
  headingScale: number;
  directionSettings: Array<{ label: string; value: string }>;
  preserve: string[];
};

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function buildAgentTemplatePackage(input: AgentTemplatePackageInput) {
  const keywords = unique([
    input.directionName,
    ...input.directionDescription.split(/[、，·]/),
    input.capsule.family,
    input.recipe.engine,
    input.uxName,
    input.typeName,
    ...input.uxPrinciples,
    ...input.directionSettings.map((setting) => `${setting.label}:${setting.value}`),
  ]);
  const coreCode = formatGeneratedHtml(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${input.capsule.cssFoundation}</style></head>${input.capsule.htmlSkeleton}</html>`);
  const settings = input.directionSettings.length
    ? input.directionSettings.map((setting) => `- ${setting.label}：${setting.value}`).join('\n')
    : '- 使用模板默认设置';
  const uxRules = input.uxPrinciples.length ? input.uxPrinciples.join('、') : '不叠加额外 UX 模式';

  const prompt = `请将我随后提供的页面内容，按照以下模板重新设计并输出可运行代码。不要只替换颜色，也不要把模板降级成普通卡片网格。

## 视觉模板
- 名称：${input.directionName}
- 关键词：${keywords.join(' / ')}
- 参考体系：${input.recipe.engine}（${input.recipe.source}）
- 实现方向：${input.recipe.implementation}
- UX 方案：${input.uxName}；${uxRules}
- 字体方向：${input.typeName}
- 强调色：${input.accent}
- 边角：${input.corners}
- 信息密度：${input.density}/100
- 动效强度：${input.motion}/100
- 标题比例：${input.headingScale}%

## 模板专属设置
${settings}

## 必须遵守
- 保留项：${input.preserve.length ? input.preserve.join('、') : '无额外锁定'}。
- 必须出现的语义区域：${input.capsule.requiredRoles.join('、')}。
- 不得出现：${input.capsule.forbidden.join('、')}。
- 直接继承下面代码中的布局关系、比例、表面、边界和响应式策略，不要只模仿关键词。
- 桌面端和移动端必须分别排版；禁止固定大字号造成溢出、重叠或模块乱飞。
- 所有可点击元素仅保留视觉与局部状态反馈，不跳转、不刷新、不提交表单、不打开新窗口。
- 保证键盘焦点清晰、正文对比度不低于 4.5:1、触控目标不小于 44×44px，并支持 prefers-reduced-motion。
- 最终输出完整、格式化、可直接运行的 HTML/CSS/JavaScript；不要输出截图或设计说明。

## 模板核心代码

\`\`\`html
${coreCode.trim()}
\`\`\`
`;

  return { keywords, coreCode, prompt };
}
