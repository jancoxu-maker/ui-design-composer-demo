import { getVisualStyleRecipe } from '../../../lib/visual-style-engine';
import { applyTemplateCapsule, getTemplateGenerationCapsule, hasTemplateSignature } from '../../../lib/template-generation-capsules';
import { formatGeneratedHtml } from '../../../lib/format-generated-html';
import { hasResponsiveTextStructure } from '../../../lib/responsive-preview-safety';
import { findGeneratedMetadataLeaks } from '../../../lib/generated-content-guard';
import { isSharedTemplate, templateFamily, type PageIR } from '../../../lib/shared-template-compiler';
import { renderTemplateDocument } from '../../../lib/render-template-document';
import { backendLog } from '../../../lib/server-logger';
import { fetchPublicPageContext, PublicPageContextError } from '../../../lib/public-page-context';
import { evaluateTemplateParity } from '../../../lib/template-parity';

const pageIRSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    analysis: { type: 'string', maxLength: 800 },
    direction: { type: 'string', maxLength: 320 },
    page: {
      type: 'object',
      additionalProperties: false,
      properties: {
        brand: { type: 'string', maxLength: 80 },
        eyebrow: { type: 'string', maxLength: 120 },
        title: { type: 'string', maxLength: 160 },
        description: { type: 'string', maxLength: 360 },
        primaryAction: { type: 'string', maxLength: 60 },
        secondaryAction: { type: 'string', maxLength: 80 },
        nav: { type: 'array', minItems: 1, maxItems: 5, items: { type: 'string', maxLength: 30 } },
        stats: {
          type: 'array', minItems: 0, maxItems: 4,
          items: { type: 'object', additionalProperties: false, properties: { label: { type: 'string', maxLength: 50 }, value: { type: 'string', maxLength: 24 }, detail: { type: 'string', maxLength: 100 } }, required: ['label','value','detail'] },
        },
        items: {
          type: 'array', minItems: 1, maxItems: 6,
          items: { type: 'object', additionalProperties: false, properties: { title: { type: 'string', maxLength: 100 }, meta: { type: 'string', maxLength: 80 }, status: { type: 'string', maxLength: 40 }, description: { type: 'string', maxLength: 180 } }, required: ['title','meta','status','description'] },
        },
      },
      required: ['brand','eyebrow','title','description','primaryAction','secondaryAction','nav','stats','items'],
    },
  },
  required: ['analysis','direction','page'],
};

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    analysis: { type: 'string', maxLength: 800 },
    direction: { type: 'string', maxLength: 320 },
    variants: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string', enum: ['safe', 'balanced', 'bold'] },
          title: { type: 'string', maxLength: 80 },
          summary: { type: 'string', maxLength: 240 },
          html: { type: 'string', maxLength: 12000 },
          coverage: {
            type: 'object',
            additionalProperties: false,
            properties: {
              goal: { type: 'string', minLength: 3, maxLength: 220 }, audience: { type: 'string', minLength: 3, maxLength: 220 }, ux: { type: 'string', minLength: 3, maxLength: 220 },
              visual: { type: 'string', minLength: 3, maxLength: 220 }, type: { type: 'string', minLength: 3, maxLength: 220 }, directionSettings: { type: 'string', minLength: 3, maxLength: 220 },
              corners: { type: 'string', minLength: 3, maxLength: 220 }, accent: { type: 'string', minLength: 3, maxLength: 220 }, density: { type: 'string', minLength: 3, maxLength: 220 },
              motion: { type: 'string', minLength: 3, maxLength: 220 }, preserveLocks: { type: 'string', minLength: 3, maxLength: 220 },
            },
            required: ['goal','audience','ux','visual','type','directionSettings','corners','accent','density','motion','preserveLocks'],
          },
        },
        required: ['id', 'title', 'summary', 'html', 'coverage'],
      },
    },
  },
  required: ['analysis', 'direction', 'variants'],
};

type DesignRequest = {
  sourceType?: 'image' | 'html' | 'url' | 'template';
  source?: string;
  selections?: Record<string, unknown>;
};

const coverageKeys = ['goal','audience','ux','visual','type','directionSettings','corners','accent','density','motion','preserveLocks'] as const;

function deterministicCoverage(selections: Record<string, unknown>) {
  const layoutRecomposed = !(Array.isArray(selections.locks) && selections.locks.includes('layout')) && !(Array.isArray(selections.preserve) && selections.preserve.includes('structure'));
  return {
    goal: `目标 ${String(selections.goal || 'refresh')} 已映射到标题层级、主要行动和版本强度。`,
    audience: `受众 ${String(selections.audience || 'general')} 已映射到文案长度、信息数量和控件尺寸。`,
    ux: `UX ${String(selections.uxPattern || 'none')} 已在内容模型的导航、状态与行动槽位中落实。`,
    visual: `视觉方向 ${String(selections.visualDirection || 'minimal')} 使用确定性模板 DOM、CSS 与响应式规则编译。`,
    type: `字体 ${String(selections.typeTone || 'system')} 已编译为模板字体 token。`,
    directionSettings: `模板专属设置已编译为确定性的 setting class，而非仅作为提示词。`,
    corners: `边角 ${String(selections.corners || 'round')} 已映射到容器与控件 token。`,
    accent: `强调色 ${String(selections.accent || '#7657ff')} 只作用于行动、选中态和视觉焦点。`,
    density: `密度 ${String(selections.density || 52)} 已映射到模板内容节奏。`,
    motion: `动效 ${String(selections.motion || 58)} 已映射到模板持续时间并支持减少动态效果。`,
    preserveLocks: layoutRecomposed ? '页面结构已解锁，内容会按所选模板重新分组、排序并建立新的主次层级。' : '页面结构已锁定，保留原有模块顺序，只调整允许变化的视觉属性。',
  };
}

async function generateDeterministicTemplates(apiKey: string, body: DesignRequest, source: string, requestId: string, startedAt: number) {
  const selections = body.selections || {};
  const templateId = String(selections.visualDirection || 'minimal');
  const layoutRecomposed = !(Array.isArray(selections.locks) && selections.locks.includes('layout')) && !(Array.isArray(selections.preserve) && selections.preserve.includes('structure'));
  const prompt = `你是产品信息架构师。你的任务不是设计 HTML，而是把输入界面整理成可供本地视觉模板编译的 PageIR。

必须忠实保留输入材料中实际出现的品牌、主要标题、导航、关键数字、项目或内容条目与主要行动。不得使用你对该品牌的常识补写页面，不得猜测导航、客户、指标、价格、日期或功能。输入没有关键数字时 stats 必须返回空数组；某项文字没有依据时应省略、缩短或复用已有文字，绝不能虚构。preserve 和 locks 中锁定的内容不得改写。根据 goal 调整信息重点，根据 audience 调整解释程度，根据 uxPattern 只调整已有内容的组织方式，但不得把模板名、设计术语、字段名或验证说明写入页面内容。

本次页面结构模式：${layoutRecomposed ? `重新编排。不要照抄输入页面的模块顺序；请按照 ${templateId} 的信息架构重新确定主项目、次要项目、数据摘要和行动顺序，并在 PageIR 数组顺序中体现新的主次关系。` : '保留结构。保持输入页面的导航、数据和内容条目顺序，不要主动重排。'}

只返回结构化 PageIR。不要生成 HTML、CSS、Markdown、设计说明或三个版本。本地编译器会使用同一份 PageIR 生成 safe、balanced、bold，并应用视觉方向 ${templateId}。用户设置：${JSON.stringify(selections)}`;
  const content: Array<Record<string, unknown>> = [{ type: 'input_text', text: prompt }];
  if (body.sourceType === 'image' && source.startsWith('data:image/')) content.push({ type: 'input_image', image_url: source, detail: 'high' });
  else if (source) content.push({ type: 'input_text', text: `现有界面材料：\n${source.slice(0, 120_000)}` });
  else content.push({ type: 'input_text', text: '没有上传材料，请创建一个真实的创意生产工作台内容模型。' });

  const model = process.env.OPENAI_MODEL || 'gpt-5.4';
  backendLog('info', 'openai.request.started', requestId, { model, templateId, layoutMode: layoutRecomposed ? 'recomposed' : 'preserved' });
  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        store: false,
        reasoning: { effort: 'none' },
        input: [{ role: 'user', content }],
        text: { format: { type: 'json_schema', name: 'page_ir', strict: true, schema: pageIRSchema } },
        max_output_tokens: 6000,
      }),
    });
  } catch (error) {
    backendLog('error', 'openai.request.network_error', requestId, { errorType: error instanceof Error ? error.name : 'unknown', durationMs: Date.now() - startedAt });
    return Response.json({ error: '无法连接 OpenAI 生成服务，请稍后重试。', requestId }, { status: 502, headers: { 'x-request-id': requestId } });
  }
  let data: { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }>; status?: string; incomplete_details?: { reason?: string }; error?: { message?: string; type?: string; code?: string } };
  try {
    data = await response.json() as typeof data;
  } catch {
    backendLog('error', 'openai.response.invalid_json', requestId, { status: response.status, durationMs: Date.now() - startedAt });
    return Response.json({ error: '生成服务返回了无法识别的响应，请稍后重试。', requestId }, { status: 502, headers: { 'x-request-id': requestId } });
  }
  if (!response.ok) {
    backendLog('error', 'openai.response.error', requestId, { status: response.status, errorType: data.error?.type || 'api_error', errorCode: data.error?.code || '' , durationMs: Date.now() - startedAt });
    return Response.json({ error: data.error?.message || 'OpenAI API 请求失败。', requestId }, { status: response.status, headers: { 'x-request-id': requestId } });
  }
  if (data.status !== 'completed') {
    backendLog('warn', 'openai.response.incomplete', requestId, { reason: data.incomplete_details?.reason || 'unknown', durationMs: Date.now() - startedAt });
    return Response.json({ error: '页面内容模型未能完整生成，请重新生成。', requestId }, { status: 502, headers: { 'x-request-id': requestId } });
  }
  try {
    const outputText = data.output_text || data.output?.flatMap((item) => item.content || []).filter((item) => item.type === 'output_text').map((item) => item.text || '').join('') || '';
    const parsed = JSON.parse(outputText) as { analysis: string; direction: string; page: PageIR };
    if (!parsed.page?.title || !Array.isArray(parsed.page.items)) throw new Error('invalid page ir');
    if (body.sourceType === 'url') {
      const sourceText = source.toLocaleLowerCase();
      parsed.page.stats = parsed.page.stats.filter((stat) => {
        const tokens = stat.value.match(/\d+(?:[.,]\d+)?/g) || [];
        return tokens.length > 0 && tokens.every((token) => sourceText.includes(token.toLocaleLowerCase()));
      });
    }
    const coverage = deterministicCoverage(selections);
    const capsule = getTemplateGenerationCapsule(templateId);
    const variants = (['safe','balanced','bold'] as const).map((id) => {
      const html = formatGeneratedHtml(renderTemplateDocument(templateId, parsed.page, selections, id));
      const metadataLeaks = findGeneratedMetadataLeaks(html, { material: source });
      if (metadataLeaks.length) throw new Error(`leaked generation metadata: ${metadataLeaks.join(', ')}`);
      const preserveStructure = (Array.isArray(selections.locks) && selections.locks.includes('layout')) || (Array.isArray(selections.preserve) && selections.preserve.includes('structure'));
      const templateParity = evaluateTemplateParity(templateId, html, { preserveStructure });
      if (!templateParity.passed) throw new Error(`template parity failed: ${templateParity.missing.join(', ')}`);
      return {
        id,
        title: id === 'safe' ? '稳健继承' : id === 'balanced' ? '模板标准版' : '高表现力版',
        summary: id === 'safe' ? '减少内容单元、取消漂移并使用稳定网格。' : id === 'balanced' ? '完整采用所选模板的标准结构和视觉语言。' : '放大首屏比例、非对称构图与主项目表现。',
        coverage,
        templateId,
        templateFamily: isSharedTemplate(templateId) ? templateFamily(templateId) : capsule.family,
        templateVerified: templateParity.passed,
        templateParity,
        html,
      };
    });
    const outputChars = variants.reduce((total, variant) => total + variant.html.length, 0);
    const variantStats = variants.map((variant) => ({
      id: variant.id,
      chars: variant.html.length,
      articles: (variant.html.match(/<article\b/gi) || []).length,
      profile: variant.html.includes(`data-variant-profile="${variant.id}"`),
      templateParity: variant.templateParity.score,
    }));
    backendLog('info', 'generation.completed', requestId, { templateId, templateFamily: variants[0]?.templateFamily || '', variants: variants.length, variantStats, outputChars, durationMs: Date.now() - startedAt });
    return Response.json({ analysis: parsed.analysis, direction: `${parsed.direction} · 确定性模板编译`, variants, requestId }, { headers: { 'x-request-id': requestId } });
  } catch (error) {
    const failure = error instanceof Error ? error : new Error('unknown compile failure');
    backendLog('error', 'generation.compile_failed', requestId, { errorType: failure.name, failure: failure.message, templateId, durationMs: Date.now() - startedAt });
    const parityFailure = failure.message.startsWith('template parity failed:');
    return Response.json({ error: parityFailure ? `生成结果没有完整继承所选模板（${failure.message.replace('template parity failed:', '').trim()}），已停止交付。` : 'AI 返回的页面内容模型无法解析，请重新生成。', requestId }, { status: 502, headers: { 'x-request-id': requestId } });
  }
}

function securePreview(html: string) {
  const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:;">`;
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<head([^>]*)>/i, `<head$1>${csp}`);
}

export async function GET() {
  return Response.json({ connected: Boolean(process.env.OPENAI_API_KEY), model: process.env.OPENAI_MODEL || 'gpt-5.4' });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    backendLog('error', 'generation.rejected', requestId, { reason: 'missing_api_key' });
    return Response.json({ error: 'OpenAI API 尚未连接，请在本机 .env.local 中设置 OPENAI_API_KEY。', requestId }, { status: 503, headers: { 'x-request-id': requestId } });
  }

  let body: DesignRequest;
  try {
    body = await request.json() as DesignRequest;
  } catch {
    backendLog('warn', 'generation.rejected', requestId, { reason: 'invalid_json' });
    return Response.json({ error: '请求格式无效。', requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  }

  let source = body.source || '';
  const selections = body.selections || {};
  backendLog('info', 'generation.received', requestId, {
    sourceType: body.sourceType || 'template',
    sourceBytes: new TextEncoder().encode(source).length,
    templateId: String(selections.visualDirection || 'minimal'),
    goal: String(selections.goal || 'refresh'),
    audience: String(selections.audience || 'general'),
    uxPattern: String(selections.uxPattern || 'none'),
    layoutMode: Array.isArray(selections.locks) && selections.locks.includes('layout') ? 'preserved' : 'recomposed',
  });
  if (source.length > 8_000_000) {
    backendLog('warn', 'generation.rejected', requestId, { reason: 'source_too_large', sourceBytes: new TextEncoder().encode(source).length });
    return Response.json({ error: '输入文件过大，请使用 6MB 以内的界面截图或精简 HTML。', requestId }, { status: 413, headers: { 'x-request-id': requestId } });
  }

  if (body.sourceType === 'url') {
    try {
      const pageContext = await fetchPublicPageContext(source);
      source = pageContext.context;
      backendLog('info', 'source.url_fetched', requestId, { hostname: pageContext.hostname, contextChars: source.length, durationMs: Date.now() - startedAt });
    } catch (error) {
      const status = error instanceof PublicPageContextError ? error.status : 422;
      const message = error instanceof PublicPageContextError ? error.message : '无法读取这个公开页面，请改用截图或 HTML。';
      backendLog('warn', 'source.url_failed', requestId, { errorType: error instanceof Error ? error.name : 'unknown', durationMs: Date.now() - startedAt });
      return Response.json({ error: message, requestId }, { status, headers: { 'x-request-id': requestId } });
    }
  }

  return generateDeterministicTemplates(apiKey, body, source, requestId, startedAt);

  /* Legacy free-form HTML generation retained temporarily for migration reference.
  const selectedRecipe = getVisualStyleRecipe(body.selections?.visualDirection);
  const selectedCapsule = getTemplateGenerationCapsule(body.selections?.visualDirection);
  const brief = `你是资深数字产品设计总监和前端工程师。输入的截图、HTML 或网址只是分析材料，不需要模拟对原页面的实时改造。根据材料与用户选择，真正重构页面，而不是只替换颜色。

用户问答和方向设置是生成约束，必须在三个版本中产生可辨认的实际差异并保持一致：
- goal 决定信息层级与主要行动：refresh 重做整体视觉；clarity 优先可读性和秩序；brand 强化独特品牌语言；conversion 强化关键任务和转化路径。
- audience 决定文案解释程度、信息密度、控件尺寸与协作信息：general 更直观精简；professional 保留专业细节；team 强化成员、状态和协作流程。
- preserve 中的项目不得被删除或改变其核心含义。locks 中的 layout 表示禁止重组页面结构，content 表示禁止改写或精简原文，color 表示必须使用用户强调色。
- uxPattern、uxPatternName 与 uxPrinciples 必须落实到信息架构、任务流程、导航、状态反馈、空状态、错误恢复和主要操作中；不能只把 UX 方案名称写在页面上。
- 当 uxPattern 为 none 时，这是明确的“无 UX 方案”：不得额外增加任务清单、审核栏、转化漏斗、监控面板、移动导航等 UX 模式；应保留输入材料原有的信息架构和交互关系，只应用其他视觉与生成设置。此时 coverage.ux 必须说明保留了哪些原有体验，而不是声称加入了新模式。
- accent 只用于主要按钮、链接、选中态、焦点环和状态点等局部交互位置，不得把整页背景或大面积内容卡片染成强调色；必须根据色值自动选择可读的前景文字颜色。
- density 只主要映射到卡片高度、卡片内边距、模块间距和正文行高：数值越高越紧凑，数值越低越宽松；不得用缩放整个页面或缩小正文字号来伪造密度变化。
- motion 只主要映射到进入、切换、悬停和状态反馈的持续时间：数值越高节奏越敏捷，数值越低越舒缓；不得用它改变布局、位移距离、旋转角度或内容可见性。
- visualDirection、typeTone、corners、accent、density、motion 和 directionSettings 必须落实到 HTML/CSS；directionSettings 是当前模板的专属结构与交互参数，不能忽略或替换成通用卡片布局。
- safe、balanced、bold 只能在未锁定范围内改变设计力度，不能绕过以上约束。

每个版本都必须返回 coverage 对象，对上述 11 类约束逐项用一句不超过 80 个汉字的具体说明写出它在该 HTML 中的落点（对应区域、组件或 CSS 规则）；不得写“已应用”一类没有证据的空话。任何一项缺失都视为生成失败。

当前视觉模板不是文字参考，而是必须执行的代码配方：
- 模板 ID：${selectedCapsule.id}
- 模板家族：${selectedCapsule.family}
- 必需结构角色：${selectedCapsule.requiredRoles.join(', ')}
- 禁止模式：${selectedCapsule.forbidden.join(', ')}
- HTML 骨架（必须保留 data-template-family 和全部 data-template-role，使用真实内容替换占位内容）：${selectedCapsule.htmlSkeleton}
- 将由服务器注入、且你必须据此设计结构的基础 CSS：${selectedCapsule.cssFoundation}
不要复制或重写基础 CSS；只编写内容适配所必需的补充 CSS。不得用通用卡片后台替换模板骨架。safe、balanced、bold 必须属于同一个模板家族，只能改变视觉力度和内容编排强度。

响应式是硬约束：页面会在 360–1200px 的嵌入式预览容器中运行。必须包含 viewport meta；只能有一个 h1，并且它必须位于 data-template-role="hero" 内；正文和标题不得使用 absolute/fixed 定位或负边距，absolute 只能用于 aria-hidden="true" 的无文字装饰层；所有 grid/flex 子项必须 min-width:0；固定列必须使用 minmax()；标题字号必须使用同时受容器宽度和最大值限制的 clamp()；在 1100px、720px 和 420px 下均不得发生文字、卡片或导航重叠。

所有模板信息都是实现输入，不是页面内容。HTML 可见区域只能出现用户原界面的业务内容和为业务所需的简洁产品文案。严禁在 body 可见文本中出现 visual、uxPattern、typeTone、directionSettings、coverage、preserve、locks、density、motion 等字段名，严禁出现 typeAxis=weight、glyphMotion=morph 一类参数，严禁显示模板 ID、视觉引擎名称、GitHub/参考来源、“当前视觉实现引擎”“保留原有体验”“未增加任务清单”等验证说明。coverage 只能位于 JSON 的 coverage 对象中，绝不能复制进 html。不得为了展示模板而凭空加入 TYPE AXIS、MORPH STATE、模板说明或设计系统调试面板；视觉风格必须通过结构和 CSS 表达，而不是把设计术语写在页面上。

输出三个完整方案：safe 保守、balanced 平衡、bold 大胆。最终交付物只能是 HTML 源码，不得返回截图、图片方案或图片链接。每个 html 控制在 4000–9000 个字符，必须是可直接保存为 .html 并在浏览器运行的完整静态 HTML，包含语义化结构、内联补充 CSS、响应式规则和必要的 CSS 动效；禁止脚本、外链、SVG、base64 资产和占位图片。用 CSS 形状替代装饰图片。服务器会统一格式化最终源码，因此不要用额外空行、冗余注释或重复基础 CSS 增加输出长度，优先保证三个 HTML 结构完整。保留内容语义，改善布局、层级、组件、字体、表面和响应式；正文对比度至少 4.5:1，支持 prefers-reduced-motion。Liquid Glass 只用于导航和控件功能层，不要把整页内容玻璃化。当前视觉实现引擎：${selectedRecipe.engine}。必须遵守的实现规则：${selectedRecipe.implementation} 用户选择：${JSON.stringify(body.selections || {})}`;
  const content: Array<Record<string, unknown>> = [{ type: 'input_text', text: brief }];

  if (body.sourceType === 'image' && source.startsWith('data:image/')) {
    content.push({ type: 'input_image', image_url: source, detail: 'high' });
  } else if (source) {
    content.push({ type: 'input_text', text: `现有界面来源（可能是 HTML 或网址）：\n${source.slice(0, 120_000)}` });
  } else {
    content.push({ type: 'input_text', text: '当前没有上传源文件，请根据用户选择生成一个具有真实产品内容的创意生产工具界面。' });
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5.4',
      store: false,
      reasoning: { effort: 'none' },
      input: [{ role: 'user', content }],
      text: { format: { type: 'json_schema', name: 'ui_redesign', strict: true, schema } },
      max_output_tokens: 26000,
    }),
  });

  const data = await response.json() as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    status?: string;
    incomplete_details?: { reason?: string };
    error?: { message?: string };
  };
  if (!response.ok) {
    return Response.json({ error: data.error?.message || 'OpenAI API 请求失败。' }, { status: response.status });
  }
  if (data.status !== 'completed') {
    const reason = data.incomplete_details?.reason || data.status || 'unknown';
    const message = reason === 'max_output_tokens'
      ? '本次三个方案的内容仍超出完整输出长度，请重新生成；系统会保留模板代码并压缩重复说明。'
      : `AI 生成未完成：${reason}`;
    return Response.json({ error: message }, { status: 502 });
  }

  try {
    const outputText = data.output_text || data.output?.flatMap((item) => item.content || []).filter((item) => item.type === 'output_text').map((item) => item.text || '').join('') || '';
    const result = JSON.parse(outputText || '{}') as { variants?: Array<{ html: string; coverage?: Record<string,string> }> };
    if (!Array.isArray(result.variants) || result.variants.length !== 3) throw new Error('invalid variants');
    result.variants = result.variants.map((variant) => {
      if (!variant.coverage || !coverageKeys.every((key) => typeof variant.coverage?.[key] === 'string' && variant.coverage[key].trim().length >= 3)) throw new Error('incomplete coverage');
      const secured = securePreview(variant.html);
      if (!/<html\b/i.test(secured) || !/<head\b/i.test(secured) || !/<body\b/i.test(secured) || !/<style\b/i.test(secured)) throw new Error('incomplete html');
      if (!hasTemplateSignature(secured, selectedCapsule)) throw new Error('missing template signature');
      if (!hasResponsiveTextStructure(secured)) throw new Error('unsafe responsive structure');
      const metadataLeaks = findGeneratedMetadataLeaks(secured, { engine: selectedRecipe.engine, source: selectedRecipe.source, visualId: selectedCapsule.id });
      if (metadataLeaks.length) throw new Error('leaked generation metadata');
      const templated = applyTemplateCapsule(secured, selectedCapsule);
      const contracted = enforceSelectionContract(templated, body.selections || {});
      const responsive = applyResponsivePreviewSafety(contracted);
      return { ...variant, templateId: selectedCapsule.id, templateFamily: selectedCapsule.family, templateVerified: true, html: formatGeneratedHtml(responsive) };
    });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return Response.json({ error: message === 'missing template signature' ? 'AI 没有遵守所选视觉模板的代码结构，请重新生成。' : message === 'unsafe responsive structure' ? 'AI 生成的标题结构可能在预览中发生重叠，请重新生成。' : message === 'leaked generation metadata' ? 'AI 把模板参数或验证说明写进了页面正文，请重新生成。' : 'AI 返回了无法解析的设计方案，请重试。' }, { status: 502 });
  } */
}
