import fs from 'node:fs';

const page = fs.readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const uxPreview = fs.readFileSync(new URL('../app/components/ux-preview-overlay.tsx', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const api = fs.readFileSync(new URL('../app/api/design/route.ts', import.meta.url), 'utf8');
const capsules = fs.readFileSync(new URL('../lib/template-generation-capsules.ts', import.meta.url), 'utf8');
const formatter = fs.readFileSync(new URL('../lib/format-generated-html.ts', import.meta.url), 'utf8');
const responsiveSafety = fs.readFileSync(new URL('../lib/responsive-preview-safety.ts', import.meta.url), 'utf8');
const contentGuard = fs.readFileSync(new URL('../lib/generated-content-guard.ts', import.meta.url), 'utf8');
const deliveryPreview = fs.readFileSync(new URL('../app/components/responsive-delivery-preview.tsx', import.meta.url), 'utf8');
const agentPackage = fs.readFileSync(new URL('../lib/agent-template-package.ts', import.meta.url), 'utf8');
const sharedCompiler = fs.readFileSync(new URL('../lib/shared-template-compiler.ts', import.meta.url), 'utf8');
const sharedPreview = fs.readFileSync(new URL('../app/components/shared-template-preview.tsx', import.meta.url), 'utf8');
const templateDocumentPreview = fs.readFileSync(new URL('../app/components/template-document-preview.tsx', import.meta.url), 'utf8');
const fixedTemplateCanvas = fs.readFileSync(new URL('../app/components/fixed-template-canvas.tsx', import.meta.url), 'utf8');
const navigationContract = fs.readFileSync(new URL('../lib/non-navigating-interaction-contract.ts', import.meta.url), 'utf8');
const headingScale = fs.readFileSync(new URL('../lib/heading-scale.ts', import.meta.url), 'utf8');
const capsuleCompiler = fs.readFileSync(new URL('../lib/capsule-template-compiler.ts', import.meta.url), 'utf8');
const templateRenderer = fs.readFileSync(new URL('../lib/render-template-document.ts', import.meta.url), 'utf8');
const selectionContract = fs.readFileSync(new URL('../lib/selection-contract.ts', import.meta.url), 'utf8');
const uxContract = fs.readFileSync(new URL('../lib/ux-pattern-contract.ts', import.meta.url), 'utf8');
const failures = [];

const directionBlock = page.match(/const directionFields:[\s\S]*?\n};\nconst visualDirections/)?.[0] || '';
let advancedCount = 0;
for (const line of directionBlock.split('\n')) {
  const key = line.match(/key:'([^']+)'/)?.[1];
  const defaultValue = line.match(/defaultValue:'([^']+)'/)?.[1];
  const options = line.match(/options:\[(.*?)\], defaultValue:/)?.[1];
  if (!key || !options) continue;
  for (const match of options.matchAll(/\['([^']+)'/g)) {
    advancedCount += 1;
    if (match[1] !== defaultValue && !css.includes(`setting-${key}-${match[1]}`)) failures.push(`高级字段缺少预览映射：${key}:${match[1]}`);
  }
}

for (const type of ['serif','grotesk','human','mono','display','condensed','rounded','system','slab','contrast','hand','hybrid']) {
  if (!css.includes(`type-${type}`)) failures.push(`字体缺少预览映射：${type}`);
}
for (const corner of ['sharp','round','pill']) if (!css.includes(`corner-${corner}`)) failures.push(`边角缺少预览映射：${corner}`);
for (const goal of ['refresh','clarity','brand','conversion']) if (!css.includes(`goal-${goal}`)) failures.push(`目标缺少预览映射：${goal}`);
for (const audience of ['general','team']) if (!css.includes(`audience-${audience}`)) failures.push(`受众缺少预览映射：${audience}`);

for (const ux of ['none','onboarding','workspace','discovery','creation','review','monitoring','conversion']) {
  if (!uxPreview.includes(`pattern === '${ux}'`)) failures.push(`UX 缺少实时组件：${ux}`);
}
if (!uxPreview.includes('ux-preview-mobile')) failures.push('UX 缺少实时组件：mobiletask');
for (const ux of ['onboarding','workspace','discovery','creation','review','monitoring','conversion','mobiletask']) if (!uxContract.includes(`${ux}:`)) failures.push(`UX 缺少同源交付组件：${ux}`);
if (!templateRenderer.includes('applyUxPatternContract')) failures.push('UX 预览与交付未使用同一编译链');

const visualBlock = page.match(/const visualDirections = \[([\s\S]*?)\n\];/)?.[1] || '';
const visualIds = [...visualBlock.matchAll(/\['([^']+)'/g)].map((match) => match[1]);
if (!page.includes('direction={visualDirection}') || !page.includes('selections={liveTemplateSelections}')) failures.push('视觉方向和完整设置没有绑定到同源实时预览');
for (const direction of visualIds) {
  if (!capsules.includes(`  ${direction}: {`)) failures.push(`视觉方向缺少生成代码配方：${direction}`);
}

const generationKeys = ['goal','audience','uxPattern','visualDirection','typeTone','directionSettings','corners','accent','density','motion','preserve','locks'];
for (const key of generationKeys) {
  if (!api.includes(key)) failures.push(`生成接口缺少约束：${key}`);
  if (!page.includes(key)) failures.push(`客户端缺少提交字段：${key}`);
}
for (const marker of ['coverageKeys','incomplete coverage']) if (!api.includes(marker)) failures.push(`生成验证器缺少：${marker}`);
for (const marker of ['applySelectionContract','compose-selection-contract']) if (!selectionContract.includes(marker)) failures.push(`生成验证器缺少：${marker}`);
for (const marker of ['maxLength: 12000','maxLength: 220','max_output_tokens: 26000','服务器会统一格式化最终源码']) {
  if (!api.includes(marker)) failures.push(`生成长度保护缺少：${marker}`);
}
for (const marker of ['getTemplateGenerationCapsule','hasTemplateSignature','applyTemplateCapsule','formatGeneratedHtml']) {
  if (!api.includes(marker)) failures.push(`生成接口缺少模板代码链路：${marker}`);
}
for (const marker of ['compose-responsive-safety','container-type:inline-size','hasResponsiveTextStructure','max-width:640px']) {
  if (!responsiveSafety.includes(marker)) failures.push(`响应式安全合同缺少：${marker}`);
}
for (const marker of ['adaptiveType','6cqi','max-width:420px']) if (!responsiveSafety.includes(marker)) failures.push(`响应式字号缺少：${marker}`);
for (const marker of ['main{height:auto!important;min-height:0!important','max-width:1440px','margin-block-start:clamp(12px,2cqi,28px)','bottom:auto!important']) {
  if (!responsiveSafety.includes(marker)) failures.push(`桌面稳定流缺少：${marker}`);
}
for (const marker of ['--display-fluid','cqi','template-editorial','template-kinetic']) if (!sharedCompiler.includes(marker)) failures.push(`共享模板流体字号缺少：${marker}`);
if (!templateRenderer.includes('applyResponsivePreviewSafety') || !api.includes('hasResponsiveTextStructure')) failures.push('生成接口缺少响应式防重叠处理');
for (const marker of ['智能体应用包','buildAgentTemplatePackage','复制应用包']) if (!page.includes(marker)) failures.push(`交付结果缺少跨智能体输出：${marker}`);
for (const marker of ['模板核心代码','requiredRoles','forbidden','prefers-reduced-motion']) if (!agentPackage.includes(marker)) failures.push(`智能体应用包缺少：${marker}`);
for (const marker of ['findGeneratedMetadataLeaks','高级字段','MORPH','当前视觉实现引擎','模板代码配方']) {
  if (!contentGuard.includes(marker)) failures.push(`生成内容防泄漏缺少：${marker}`);
}
if (!api.includes('findGeneratedMetadataLeaks') || !api.includes('leaked generation metadata')) failures.push('生成接口缺少内容防泄漏处理');
for (const marker of ["width: 1440","width: 390","'compare'","ResizeObserver","scaleMode === 'actual'"]) {
  if (!deliveryPreview.includes(marker)) failures.push(`交付预览缺少真实设备画布：${marker}`);
}
if (!fixedTemplateCanvas.includes('sandbox="allow-scripts"') || fixedTemplateCanvas.includes('allow-same-origin')) failures.push('同源模板预览沙箱配置不安全或无法运行模板动效');
for (const marker of ['preventDefault','composeNavigation','window.open=()=>null']) if (!navigationContract.includes(marker)) failures.push(`交付预览缺少空点击护栏：${marker}`);
for (const marker of ['ResponsiveDeliveryPreview','适应窗口','100%','WEB · 1440 × 900']) {
  if (!page.includes(marker)) failures.push(`客户端缺少交付预览控制：${marker}`);
}
if (page.includes("['mobile','手机']") || page.includes("['compare','对比']") || page.includes('setPreviewDevice')) failures.push('手机版或双端对比入口仍显示在交付界面');
for (const marker of ['compose-template-capsule','data-compose-template','requiredRoles','htmlSkeleton','cssFoundation']) {
  if (!capsules.includes(marker)) failures.push(`模板代码配方缺少：${marker}`);
}
if (!formatter.includes('formatCss') || !formatter.includes('formatGeneratedHtml')) failures.push('最终 HTML 缺少格式化器');
for (const template of ['minimal','editorial','spatial','precision','kinetic']) {
  if (!sharedCompiler.includes(`${template}Markup`)) failures.push(`共享模板编译器缺少：${template}`);
}
for (const marker of ['compileTemplateHtml','PageIR','variant-safe','variant-balanced','variant-bold','data-template-version="2.2"','data-variant-profile','data-layout-mode']) {
  if (!sharedCompiler.includes(marker)) failures.push(`共享模板链路缺少：${marker}`);
}
if (!sharedPreview.includes('renderTemplateDocument')) failures.push('共享模板预览缺少统一编译器');
for (const marker of ['compileCapsuleTemplateHtml','applyResponsivePreviewSafety','preserveCapsuleStage','applyCapsuleLayoutGuard']) if (!templateRenderer.includes(marker)) failures.push(`视觉库同源预览缺少：${marker}`);
if (!page.includes('TemplateDocumentPreview') || page.includes('<VisualEnginePreview') || !templateDocumentPreview.includes('renderTemplateDocument')) failures.push('视觉库预览与最终交付没有使用同一个模板编译器');
if (!api.includes('generateDeterministicTemplates') || !api.includes('pageIRSchema') || !api.includes('max_output_tokens: 6000')) failures.push('生成接口未使用 PageIR 与确定性模板编译');
for (const family of ['data','board','editorial','portfolio','mobile','skeuomorphic','spatial','typelab','collage','exhibit','canvas','carousel','ascii','experimental']) {
  if (!capsuleCompiler.includes(`family === '${family}'`)) failures.push(`确定性模板编译器缺少家族：${family}`);
}
for (const marker of ['compileCapsuleTemplateHtml','data-template-version="3.4"','data-variant-profile','pageForVariant','capsuleVariantCss','compose-template-capsule','preserveCapsuleStage','compose-template-stage-preservation','applyCapsuleLayoutGuard','compose-template-layout-guard','data-layout-mode','productMarkup','polaris-workspace','soft-workspace','max-width:900px']) if (!capsuleCompiler.includes(marker)) failures.push(`确定性模板编译器缺少：${marker}`);
for (const marker of ['productEngineMarkup','productEngineCss','productVariantCss','visual-${esc(templateId)}','data-template-version="3.3"','ed-product-side','ed-product-grid']) if (!capsuleCompiler.includes(marker)) failures.push(`Spectrum/Fluent 同源交付缺少：${marker}`);
if (!api.includes('renderTemplateDocument') || !templateRenderer.includes('compileCapsuleTemplateHtml') || !templateRenderer.includes('applyCapsuleLayoutGuard') || !api.includes('return generateDeterministicTemplates')) failures.push('全部视觉方向尚未切换到确定性模板链路');
for (const marker of ['compose-heading-scale','html body h1','html body h2','html body h3','max-width:720px','max-width:420px']) if (!headingScale.includes(marker)) failures.push(`交付标题控制缺少：${marker}`);
for (const marker of ['headingScale','deliveryHtml','标题大小','调整各级标题大小']) if (!page.includes(marker)) failures.push(`交付标题滑块缺少：${marker}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Option coverage passed: ${visualIds.length} visual directions with generation capsules, 9 UX patterns, 12 type systems, ${advancedCount} template-field choices, 11 generated-output constraints.`);
