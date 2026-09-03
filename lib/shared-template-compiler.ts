export type TemplateVariant = 'safe' | 'balanced' | 'bold';

export type PageIR = {
  brand: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  nav: string[];
  stats: Array<{ label: string; value: string; detail: string }>;
  items: Array<{ title: string; meta: string; status: string; description: string }>;
};

export type TemplateSelections = {
  accent?: string;
  typeTone?: string;
  corners?: string;
  density?: number;
  motion?: number;
  goal?: string;
  audience?: string;
  uxPattern?: string;
  directionSettings?: Record<string, unknown>;
  preserve?: string[];
  locks?: string[];
};

export const sharedTemplateIds = ['minimal', 'editorial', 'spatial', 'precision', 'kinetic'] as const;

export function isSharedTemplate(id: unknown): id is typeof sharedTemplateIds[number] {
  return sharedTemplateIds.includes(String(id) as typeof sharedTemplateIds[number]);
}

export const defaultPageIR: PageIR = {
  brand: 'Canvas',
  eyebrow: 'INTERFACE TEMPLATE PREVIEW',
  title: 'A flexible workspace',
  description: '通用演示信息仅用于比较版式、层级、字体与交互，不代表任何真实项目内容。',
  primaryAction: '主要操作',
  secondaryAction: '浏览全部内容',
  nav: ['概览', '内容', '资源', '设置'],
  stats: [
    { label: '进行中', value: '12', detail: '当前项目' },
    { label: '待处理', value: '6', detail: '今日更新' },
    { label: '已完成', value: '28', detail: '本周记录' },
  ],
  items: [
    { title: 'Featured module', meta: 'SECTION 01', status: '精选', description: '用于展示模板中的主要内容、图像比例与行动层级。' },
    { title: 'Content collection', meta: 'SECTION 02', status: '进行中', description: '中性的占位信息便于直接比较不同视觉方向。' },
    { title: 'System overview', meta: 'SECTION 03', status: '已更新', description: '所有模板使用相同内容，不读取上传图片或参考网址。' },
  ],
};

const templateMeta = {
  minimal: { family: 'product', name: '现代产品极简' },
  editorial: { family: 'editorial', name: '大胆编辑' },
  spatial: { family: 'spatial', name: '空间玻璃' },
  precision: { family: 'skeuomorphic', name: '经典拟物' },
  kinetic: { family: 'experimental', name: 'Godly 动态实验' },
} as const;

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character);
}

function cleanPage(page?: Partial<PageIR>): PageIR {
  const source = page || {};
  const stats = Array.isArray(source.stats) ? source.stats.slice(0, 4) : defaultPageIR.stats;
  const items = Array.isArray(source.items) && source.items.length ? source.items.slice(0, 6) : defaultPageIR.items;
  const nav = Array.isArray(source.nav) && source.nav.length ? source.nav.slice(0, 5) : defaultPageIR.nav;
  return {
    brand: String(source.brand || defaultPageIR.brand),
    eyebrow: String(source.eyebrow || defaultPageIR.eyebrow),
    title: String(source.title || defaultPageIR.title),
    description: String(source.description || defaultPageIR.description),
    primaryAction: String(source.primaryAction || defaultPageIR.primaryAction),
    secondaryAction: String(source.secondaryAction || defaultPageIR.secondaryAction),
    nav: nav.map(String),
    stats: stats.map((item) => ({ label: String(item.label || ''), value: String(item.value || ''), detail: String(item.detail || '') })),
    items: items.map((item) => ({ title: String(item.title || ''), meta: String(item.meta || ''), status: String(item.status || ''), description: String(item.description || '') })),
  };
}

function fontStack(typeTone: unknown) {
  const fonts: Record<string, string> = {
    serif: 'Georgia,"Songti SC",serif', contrast: 'Didot,Bodoni,"Songti SC",serif', hybrid: 'Georgia,"Songti SC",serif',
    slab: 'Rockwell,Georgia,serif', mono: 'ui-monospace,SFMono-Regular,Menlo,monospace', condensed: '"Arial Narrow","PingFang SC",sans-serif',
    display: 'Arial Black,"PingFang SC",sans-serif', rounded: '"Arial Rounded MT Bold","PingFang SC",sans-serif',
    human: 'Avenir,"PingFang SC",sans-serif', grotesk: 'Inter,Helvetica,Arial,"PingFang SC",sans-serif', system: '-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif',
  };
  return fonts[String(typeTone)] || fonts.system;
}

function contrastColor(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  const luminance = ((value >> 16) * 299 + ((value >> 8) & 255) * 587 + (value & 255) * 114) / 1000;
  return luminance > 150 ? '#17131a' : '#ffffff';
}

function chrome(page: PageIR) {
  return `<header class="site-nav" data-template-role="navigation"><a class="wordmark" href="#top">${escapeHtml(page.brand)}</a><nav aria-label="主导航">${page.nav.map((item, index) => `<a href="#work"${index === 0 ? ' aria-current="page"' : ''}>${escapeHtml(item)}</a>`).join('')}</nav><a class="primary-action" data-template-role="primary-action" href="#work">${escapeHtml(page.primaryAction)}</a></header>`;
}

function stats(page: PageIR) {
  return page.stats.map((item, index) => `<article class="stat stat-${index + 1}"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><small>${escapeHtml(item.detail)}</small></article>`).join('');
}

function workItems(page: PageIR) {
  return page.items.map((item, index) => `<article class="work-card work-${index + 1}"><header><span>${escapeHtml(item.status)}</span><small>${escapeHtml(item.meta)}</small></header><div class="visual-object" aria-hidden="true"><i></i><i></i><i></i></div><footer><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p></footer></article>`).join('');
}

function minimalMarkup(page: PageIR) {
  return `<div class="product-shell"><aside class="product-rail" aria-label="工作区导航"><b>${escapeHtml(page.brand.slice(0, 1))}</b>${page.nav.map((item, index) => `<a href="#work"${index === 0 ? ' aria-current="page"' : ''}><i aria-hidden="true"></i><span>${escapeHtml(item)}</span></a>`).join('')}</aside><div class="product-main">${chrome(page)}<main><section class="hero" data-template-role="hero"><small>${escapeHtml(page.eyebrow)}</small><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></section><section class="metrics" data-template-role="metrics">${stats(page)}</section><section class="work-grid" id="work" data-template-role="content">${workItems(page)}</section></main></div></div>`;
}

function editorialMarkup(page: PageIR) {
  const lead = page.items[0];
  return `<div class="editorial-shell"><header class="masthead" data-template-role="masthead"><b>${escapeHtml(page.brand)}</b><span>${escapeHtml(page.eyebrow)}</span><a data-template-role="primary-action" href="#story">${escapeHtml(page.primaryAction)} ↗</a></header><main><section class="hero" data-template-role="hero"><small>${escapeHtml(page.eyebrow)}</small><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></section><section class="editorial-stage" id="story"><article class="cover"><span aria-hidden="true">01</span><div class="cover-art" aria-hidden="true"><i></i><i></i></div><footer><b>${escapeHtml(lead?.title || page.title)}</b><small>${escapeHtml(lead?.meta || '')}</small></footer></article><article class="story" data-template-role="story"><small>${escapeHtml(lead?.status || page.eyebrow)}</small><h2>${escapeHtml(page.secondaryAction)}</h2><p>${escapeHtml(lead?.description || page.description)}</p><ul>${page.items.slice(1, 5).map((item) => `<li><span>${escapeHtml(item.status)}</span><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.meta)}</small></li>`).join('')}</ul></article></section></main></div>`;
}

function spatialMarkup(page: PageIR) {
  return `<div class="ambient-field" data-template-role="ambient-field" aria-hidden="true"><i></i><i></i><i></i></div><div class="spatial-shell">${chrome(page)}<main><section class="hero" data-template-role="hero"><small>${escapeHtml(page.eyebrow)}</small><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></section><section class="glass-stage" id="work" data-template-role="content"><article class="glass-feature"><header><span>${escapeHtml(page.items[0]?.status || 'ACTIVE')}</span><small>${escapeHtml(page.items[0]?.meta || '')}</small></header><div class="orbit" aria-hidden="true"><i></i><i></i><i></i></div><footer><h2>${escapeHtml(page.items[0]?.title || page.title)}</h2><p>${escapeHtml(page.items[0]?.description || page.description)}</p></footer></article><aside>${page.stats.slice(0, 2).map((item) => `<article><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><small>${escapeHtml(item.detail)}</small></article>`).join('')}</aside></section></main></div>`;
}

function precisionMarkup(page: PageIR) {
  return `<main class="hardware-shell" data-template-role="console"><header class="hardware-nav" data-template-role="navigation"><b>${escapeHtml(page.brand)}</b><span>${escapeHtml(page.eyebrow)}</span><a data-template-role="primary-action" href="#controls">${escapeHtml(page.primaryAction)}</a></header><section class="hero" data-template-role="hero"><small>${escapeHtml(page.eyebrow)}</small><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></section><section class="hardware-panel" id="controls" data-template-role="controls"><article class="meter"><header><b>${escapeHtml(page.items[0]?.title || page.title)}</b><span>${escapeHtml(page.items[0]?.status || '')}</span></header><div class="vu"><i></i><i></i><strong>${escapeHtml(page.stats[0]?.value || '')}</strong></div><footer>${escapeHtml(page.items[0]?.description || page.description)}</footer></article><article class="control-bank">${page.stats.slice(0, 3).map((item, index) => `<div class="control"><i class="dial dial-${index + 1}" aria-hidden="true"></i><b>${escapeHtml(item.label)}</b><small>${escapeHtml(item.detail)}</small></div>`).join('')}</article></section></main>`;
}

function kineticMarkup(page: PageIR) {
  const titleWords = page.title.split(/\s+/).filter(Boolean);
  const lines = titleWords.length > 1 ? titleWords.slice(0, 3) : [page.title.slice(0, Math.ceil(page.title.length / 2)), page.title.slice(Math.ceil(page.title.length / 2))];
  return `<div class="kinetic-shell">${chrome(page)}<main><section class="hero" data-template-role="hero"><small>${escapeHtml(page.eyebrow)}</small><h1>${lines.map((line) => `<span>${escapeHtml(line)}</span>`).join('')}</h1><p>${escapeHtml(page.description)}</p><a class="hero-action" href="#work">${escapeHtml(page.primaryAction)} <i aria-hidden="true"></i></a></section><div class="kinetic-orbit" aria-hidden="true"><i></i><i></i><b>01</b></div><section class="kinetic-stage" id="work" data-template-role="stage">${page.items.slice(0, 3).map((item, index) => `<article><span>0${index + 1}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p></article>`).join('')}</section></main><footer><span>${escapeHtml(page.brand)}</span><span>${escapeHtml(page.secondaryAction)}</span><span>${escapeHtml(page.items[0]?.meta || '')}</span></footer></div>`;
}

const commonCss = `
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;min-height:100vh;font-family:var(--font);background:var(--bg);color:var(--ink);overflow-x:clip;container-type:inline-size}body>*{min-width:0}a{color:inherit;text-decoration:none}p{line-height:var(--leading)}button,a{transition:transform var(--duration) var(--ease),background var(--duration) var(--ease),color var(--duration) var(--ease),box-shadow var(--duration) var(--ease)}a:focus-visible{outline:3px solid var(--accent);outline-offset:4px}.site-nav{position:relative;z-index:8;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:18px}.site-nav nav{display:flex;align-items:center;gap:6px}.site-nav nav a{padding:9px 12px;border-radius:var(--radius);font-size:12px}.site-nav nav a[aria-current="page"]{background:var(--surface)}.wordmark{font-weight:900;letter-spacing:-.04em}.primary-action,.hero-action{justify-self:end;display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border-radius:var(--control-radius);background:var(--accent);color:var(--accent-contrast);font-size:13px;font-weight:800}.primary-action:hover,.hero-action:hover{transform:translateY(-2px)}.hero small{font-size:11px;font-weight:850;letter-spacing:.16em}.hero h1{max-width:12ch;margin:10px 0 16px;font-size:clamp(var(--display-min),var(--display-fluid),var(--display-max));line-height:.84;letter-spacing:-.07em;text-wrap:balance}.hero p{max-width:58ch;margin:0;color:var(--muted);font-size:clamp(13px,1.05cqi,16px);line-height:1.65}.work-card,.stat{min-width:0}:where(.metrics,.work-grid,.editorial-stage,.glass-stage,.hardware-panel,.kinetic-stage){gap:var(--space)!important}:where(.stat,.work-card,.glass-feature,.glass-stage aside article,.meter,.control-bank,.kinetic-stage article){padding:var(--card-pad)}body.variant-safe{--intensity:.72}body.variant-balanced{--intensity:1}body.variant-bold{--intensity:1.28}body.goal-clarity :where(.ambient-field,.kinetic-orbit,.visual-object i:nth-child(2),.cover-art i){opacity:.42}body.goal-brand :where(.visual-object,.cover-art,.orbit,.kinetic-orbit){filter:saturate(1.2) contrast(1.03)}body.goal-conversion .primary-action,body.goal-conversion .hero-action{outline:3px solid color-mix(in srgb,var(--accent) 38%,white);outline-offset:4px}body.audience-general :where(.stat:last-child,.work-card:last-child){display:none}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{animation:none!important;transition:none!important;transform:none!important}}`;

const minimalCss = `
.product-shell{display:grid;grid-template-columns:78px 1fr;min-height:100vh}.product-rail{position:sticky;top:0;height:100vh;padding:24px 12px;border-right:1px solid var(--line);background:color-mix(in srgb,var(--surface) 82%,transparent)}.product-rail>b{display:grid;place-items:center;width:38px;height:38px;margin:0 auto 42px;border-radius:12px;background:var(--ink);color:var(--bg)}.product-rail>a{display:grid;place-items:center;gap:5px;margin:7px 0;padding:9px 3px;border-radius:12px;color:var(--muted);font-size:10px}.product-rail>a[aria-current="page"]{background:var(--surface);color:var(--ink);box-shadow:0 8px 24px rgba(24,32,28,.08)}.product-rail i{width:14px;height:14px;border:1px solid currentColor;border-radius:4px}.product-main{padding:22px clamp(18px,4vw,64px)}.product-main>.site-nav{padding-bottom:18px;border-bottom:1px solid var(--line)}.product-main main{max-width:1440px;margin:auto}.product-main .hero{display:grid;grid-template-columns:1.25fr .75fr;padding:clamp(62px,8vw,120px) 0 42px}.product-main .hero small,.product-main .hero h1{grid-column:1}.product-main .hero p{grid-column:2;grid-row:1/3;align-self:end}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.stat{display:grid;grid-template-columns:1fr auto;padding:18px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface)}.stat strong{grid-row:1/3;grid-column:2;font-size:36px}.stat small{margin-top:12px;color:var(--muted)}.work-grid{display:grid;grid-template-columns:1.4fr .7fr;gap:14px;margin-top:14px}.work-card{padding:18px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface)}.work-card:first-child{grid-row:span 2}.work-card header,.work-card footer{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.work-card header span{padding:5px 8px;border-radius:999px;background:color-mix(in srgb,var(--accent) 13%,white);color:color-mix(in srgb,var(--accent) 70%,black);font-size:11px}.work-card small,.work-card p{color:var(--muted);font-size:12px}.work-card h2{margin:0;font-size:18px}.work-card p{margin:5px 0 0}.visual-object{position:relative;height:180px;margin:16px 0;overflow:hidden;border-radius:calc(var(--radius) * .8);background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 80%,#cabfff),#dfff7c)}.work-card:not(:first-child) .visual-object{height:90px}.visual-object i:first-child{position:absolute;left:18%;top:18%;width:34%;height:65%;border-radius:16px;background:#1e2020;box-shadow:22px 18px 0 rgba(255,255,255,.25)}.visual-object i:nth-child(2){position:absolute;right:-12%;bottom:-65%;width:240px;height:240px;border:1px solid rgba(255,255,255,.7);border-radius:50%;box-shadow:0 0 0 28px rgba(255,255,255,.14),0 0 0 56px rgba(255,255,255,.08)}body.variant-bold .work-grid{grid-template-columns:1.7fr .55fr}body.variant-safe .visual-object{filter:saturate(.72)}
@media(max-width:760px){.product-shell{grid-template-columns:1fr}.product-rail{display:none}.product-main{padding:14px}.site-nav{grid-template-columns:1fr auto}.site-nav nav{display:none}.product-main .hero{display:block;padding:52px 0 28px}.hero h1{font-size:clamp(46px,14vw,72px)}.metrics{grid-template-columns:1fr 1fr}.stat:last-child{display:none}.work-grid{grid-template-columns:1fr!important}.work-card:first-child{grid-row:auto}}`;

const editorialCss = `
.editorial-shell{min-height:100vh;padding:22px clamp(18px,4vw,68px);background:repeating-linear-gradient(0deg,rgba(76,61,37,.025) 0 1px,transparent 1px 5px),var(--bg)}.masthead{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding-bottom:14px;border-bottom:1px solid var(--ink);font-size:12px}.masthead span{text-align:center}.masthead a{justify-self:end;text-decoration:underline;text-underline-offset:5px}.editorial-shell main{max-width:1500px;margin:auto}.editorial-shell .hero{display:grid;grid-template-columns:1.55fr .45fr;padding:clamp(72px,9vw,148px) 0 44px;border-bottom:1px solid var(--ink)}.editorial-shell .hero small,.editorial-shell .hero h1{grid-column:1}.editorial-shell .hero h1{font-family:Georgia,"Songti SC",serif}.editorial-shell .hero p{align-self:end;padding-top:20px;border-top:1px solid var(--ink)}.editorial-stage{display:grid;grid-template-columns:1.38fr .62fr;gap:24px;padding:22px 0}.cover{transform:rotate(calc(-.7deg * var(--intensity)))}.cover>span{font-size:12px}.cover-art{position:relative;height:clamp(320px,48vw,650px);margin:10px 0;background:var(--accent);overflow:hidden}.cover-art:before{content:"";position:absolute;inset:12% 34% 8% 12%;background:var(--ink);transform:rotate(-5deg)}.cover-art i:first-child{position:absolute;right:-8%;top:-12%;width:48%;aspect-ratio:1;border:1px solid rgba(255,255,255,.65);border-radius:50%;box-shadow:0 0 0 34px rgba(255,255,255,.12),0 0 0 68px rgba(255,255,255,.07)}.cover-art i:last-child{position:absolute;left:42%;top:22%;width:9%;height:48%;border-radius:999px;background:linear-gradient(90deg,#111,#777,#111);transform:rotate(12deg)}.cover footer{display:flex;justify-content:space-between}.story{padding:24px 0 0 24px;border-left:1px solid var(--ink)}.story>h2{margin:42px 0 18px;font-family:Georgia,"Songti SC",serif;font-size:clamp(32px,4vw,64px);line-height:.9}.story>p{color:var(--muted);line-height:1.75}.story ul{margin:60px 0 0;padding:0;list-style:none}.story li{display:grid;grid-template-columns:auto 1fr auto;gap:14px;padding:14px 0;border-top:1px solid var(--ink);font-size:12px}.story li small{color:var(--muted)}body.variant-bold .editorial-shell .hero h1{font-size:clamp(72px,11vw,164px)}body.variant-safe .cover{transform:none}
@media(max-width:760px){.editorial-shell{padding:14px}.masthead{grid-template-columns:1fr auto}.masthead span{display:none}.editorial-shell .hero{display:block;padding:58px 0 28px}.editorial-stage{grid-template-columns:1fr}.story{padding-left:0;border-left:0}.story ul{margin-top:32px}.cover-art{height:380px}.hero h1{font-size:clamp(52px,15vw,86px)}}`;

const spatialCss = `
body{background:radial-gradient(circle at 12% 82%,#4ff0bd 0 8%,transparent 30%),radial-gradient(circle at 88% 12%,#59ddff 0 9%,transparent 30%),linear-gradient(145deg,#516aff,#a770f1 56%,#ff9bba);background-attachment:fixed}.ambient-field{position:fixed;inset:0;pointer-events:none;overflow:hidden}.ambient-field i{position:absolute;border-radius:50%;filter:blur(3px);animation:float calc(var(--duration) * 12) ease-in-out infinite alternate}.ambient-field i:first-child{left:-4%;top:48%;width:28vw;height:28vw;background:#49efb8}.ambient-field i:nth-child(2){right:-4%;top:-8%;width:24vw;height:24vw;background:#62ddff}.ambient-field i:nth-child(3){left:42%;bottom:-18%;width:32vw;height:32vw;background:#ff83bd}.spatial-shell{position:relative;z-index:2;padding:18px clamp(16px,4vw,58px)}.spatial-shell .site-nav,.glass-feature,.glass-stage aside article{border:1px solid rgba(255,255,255,.65);background:linear-gradient(145deg,rgba(255,255,255,.42),rgba(255,255,255,.10));box-shadow:inset 1px 1px 1px rgba(255,255,255,.92),inset -8px -9px 18px rgba(54,34,130,.12),0 24px 60px rgba(42,27,100,.2);backdrop-filter:blur(20px) saturate(140%) brightness(104%)}.spatial-shell .site-nav{padding:8px 9px 8px 18px;border-radius:999px}.spatial-shell .hero{padding:clamp(74px,10vw,150px) 1vw 42px}.glass-stage{display:grid;grid-template-columns:1.45fr .55fr;gap:14px}.glass-feature,.glass-stage aside article{border-radius:var(--radius)}.glass-feature{padding:18px}.glass-feature header,.glass-feature footer{display:flex;justify-content:space-between;gap:20px}.glass-feature footer h2{margin:0}.glass-feature footer p{max-width:38ch;margin:4px 0 0;color:var(--muted)}.orbit{position:relative;height:280px}.orbit i{position:absolute;border-radius:50%}.orbit i:first-child{left:31%;top:19%;width:150px;height:150px;background:radial-gradient(circle at 30% 25%,white,#7558ff 25%,#2f1b65 70%);box-shadow:0 26px 45px rgba(44,25,103,.3)}.orbit i:nth-child(2){left:52%;top:44%;width:88px;height:88px;background:radial-gradient(circle at 30% 25%,#fff,#ff9ed1 32%,#ed684b)}.orbit i:nth-child(3){left:22%;top:56%;width:48px;height:48px;background:#d9ff62;box-shadow:0 0 32px #d9ff62}.glass-stage aside{display:grid;gap:14px}.glass-stage aside article{display:flex;flex-direction:column;min-height:160px;padding:18px}.glass-stage aside strong{margin-top:auto;font-size:42px}.glass-stage aside small{margin-top:6px;color:var(--muted)}body.variant-bold .orbit{transform:scale(1.08)}body.variant-safe .ambient-field{opacity:.58}@keyframes float{to{transform:translate(28px,-20px) scale(1.08)}}
@media(max-width:760px){.spatial-shell{padding:12px}.site-nav{grid-template-columns:1fr auto}.site-nav nav{display:none}.spatial-shell .hero{padding:72px 4px 34px}.glass-stage{grid-template-columns:1fr}.glass-stage aside{grid-template-columns:1fr 1fr}.orbit{height:230px}.hero h1{font-size:clamp(50px,15vw,80px)}}`;

const precisionCss = `
body{padding:clamp(12px,3vw,42px);background:radial-gradient(circle at 50% 0,#79553a,#2b2019 68%);color:#281d15}.hardware-shell{max-width:1320px;margin:auto;padding:clamp(20px,4vw,52px);border:1px solid #96795b;border-radius:calc(var(--radius) * 1.4);background:linear-gradient(120deg,#b79e7f,#ead8bd 46%,#a88b69);box-shadow:inset 0 0 0 5px rgba(68,44,28,.35),inset 2px 2px 3px rgba(255,255,255,.72),0 36px 90px rgba(0,0,0,.4)}.hardware-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:12px 15px;border:1px solid #7d644e;border-radius:var(--radius);background:linear-gradient(#d5c1a4,#ac9272);box-shadow:inset 1px 1px white,inset -3px -4px 8px rgba(69,45,28,.25)}.hardware-nav span{text-align:center;font:11px ui-monospace,monospace}.hardware-nav .primary-action{background:linear-gradient(#40352c,#17130f);box-shadow:inset 0 1px rgba(255,255,255,.3),0 4px 0 #0e0b09}.hardware-shell .hero{padding:clamp(58px,8vw,110px) 0 36px}.hardware-shell .hero h1{max-width:10ch;font-family:Rockwell,Georgia,serif}.hardware-panel{display:grid;grid-template-columns:1.35fr .65fr;gap:18px;padding:18px;border:1px solid #7c624a;border-radius:var(--radius);background:linear-gradient(135deg,#d7c4a8,#a98e6d);box-shadow:inset 3px 3px 8px rgba(62,40,25,.28),inset -2px -2px 3px rgba(255,255,255,.6)}.meter,.control-bank{padding:18px;border-radius:calc(var(--radius) * .8);background:linear-gradient(145deg,#cdb89b,#ad9271);box-shadow:inset 1px 1px rgba(255,255,255,.75),inset -5px -6px 10px rgba(63,41,25,.23),0 10px 20px rgba(49,31,20,.18)}.meter header{display:flex;justify-content:space-between}.vu{position:relative;display:grid;place-items:center;height:260px;margin:16px 0;border:9px solid #4b3b2e;border-radius:calc(var(--radius) * .7);background:repeating-linear-gradient(90deg,transparent 0 24px,rgba(65,50,37,.11) 25px),linear-gradient(#eee0c8,#bca486);box-shadow:inset 0 9px 18px rgba(45,31,21,.28)}.vu:before{content:"";position:absolute;bottom:20%;left:50%;width:4px;height:42%;background:#3b2d23;transform-origin:bottom;transform:rotate(calc(-34deg + 28deg * var(--intensity)));box-shadow:0 0 0 1px #1e1712}.vu strong{font-size:64px;opacity:.18}.control-bank{display:grid;gap:12px}.control{display:grid;grid-template-columns:76px 1fr;align-items:center;column-gap:14px}.control small{color:#6c5848}.dial{grid-row:1/3;display:block;width:72px;height:72px;border:1px solid #5d4a39;border-radius:50%;background:radial-gradient(circle at 34% 27%,#fff9e9 0 5%,#b9a183 31%,#4a392c 64%,#d9c4a6 67%,#8a7156);box-shadow:inset 2px 2px 3px rgba(255,255,255,.75),0 10px 16px rgba(46,30,20,.28);transform:rotate(calc(-18deg + var(--intensity) * 22deg))}.dial:after{content:"";display:block;width:3px;height:23px;margin:7px auto;background:#30251d}.control b{align-self:end}.control small{align-self:start}body.variant-bold .hardware-panel{transform:perspective(1200px) rotateX(1deg)}body.variant-safe .dial{transform:rotate(-8deg)}
@media(max-width:760px){body{padding:9px}.hardware-shell{padding:18px}.hardware-nav{grid-template-columns:1fr auto}.hardware-nav span{display:none}.hardware-shell .hero{padding:55px 0 28px}.hardware-panel{grid-template-columns:1fr}.vu{height:210px}.control-bank{grid-template-columns:1fr 1fr}.control{grid-template-columns:58px 1fr}.dial{width:54px;height:54px}.hero h1{font-size:clamp(48px,14vw,76px)}}`;

const kineticCss = `
body{background:radial-gradient(circle at 20% 85%,#59f0c4 0 5%,transparent 24%),linear-gradient(135deg,#704fff,#bc70ff 57%,#ff8d62);color:#17131a}.kinetic-shell{position:relative;min-height:100vh;padding:18px clamp(14px,3vw,42px);overflow:hidden}.kinetic-shell .site-nav{padding:7px 8px 7px 16px;border-radius:999px;background:rgba(255,255,255,.88);box-shadow:0 18px 40px rgba(45,24,92,.2)}.kinetic-shell main{position:relative;min-height:760px}.kinetic-shell .hero{position:relative;z-index:3;padding:clamp(70px,9vw,126px) 0 0}.kinetic-shell .hero>small{display:block;text-align:center}.kinetic-shell .hero h1{max-width:none;text-align:center;font-family:Arial Black,Arial,sans-serif;font-size:clamp(76px,13vw,190px);line-height:.64}.kinetic-shell .hero h1 span{display:block}.kinetic-shell .hero h1 span:nth-child(2){margin-left:-28%}.kinetic-shell .hero h1 span:nth-child(3){margin-left:14%;font-family:Georgia,serif;font-style:italic;font-weight:500}.kinetic-shell .hero p{margin:34px 0 0 8%}.hero-action{margin:-42px 9% 0 auto;width:max-content}.hero-action i{width:9px;height:9px;margin-left:12px;border-radius:50%;background:currentColor;animation:pulse calc(var(--duration) * 3) ease-in-out infinite}.kinetic-orbit{position:absolute;z-index:1;right:7%;top:26%;width:clamp(180px,22vw,330px);aspect-ratio:1;border-radius:50%;background:conic-gradient(#f4ff74,#ff6d9a,#7958ff,#5ef0c7,#f4ff74);box-shadow:0 30px 80px rgba(48,25,104,.38);animation:orbit calc(var(--duration) * 8) ease-in-out infinite alternate}.kinetic-orbit:before{content:"";position:absolute;inset:13%;border-radius:50%;background:#17131a}.kinetic-orbit i:first-child{position:absolute;z-index:2;left:-15%;top:31%;width:42%;aspect-ratio:1;border-radius:50%;background:#ffef64}.kinetic-orbit i:nth-child(2){position:absolute;z-index:2;right:-7%;bottom:12%;width:28%;aspect-ratio:1;border-radius:14%;background:#fff;transform:rotate(22deg)}.kinetic-orbit b{position:absolute;z-index:3;inset:47% auto auto 47%;color:white}.kinetic-stage{position:relative;z-index:4;display:grid;grid-template-columns:1.4fr .8fr .6fr;gap:14px;margin-top:90px;transform:rotate(calc(-1.4deg * var(--intensity)))}.kinetic-stage article{min-height:220px;padding:22px;border:2px solid #17131a;background:#f8f2e7;box-shadow:12px 12px 0 #17131a}.kinetic-stage article:nth-child(2){background:#d9ff60}.kinetic-stage article:nth-child(3){background:#ff7b67}.kinetic-stage h2{font-size:clamp(22px,3vw,46px);line-height:.9}.kinetic-stage p{line-height:1.6}.kinetic-shell>footer{display:flex;justify-content:space-between;padding-top:12px;border-top:1px solid rgba(23,19,26,.5);font-size:11px}@keyframes orbit{to{transform:translate(-24px,18px) rotate(14deg)}}@keyframes pulse{50%{transform:scale(1.7);opacity:.45}}body.variant-safe .kinetic-orbit{opacity:.65}body.variant-bold .kinetic-stage{margin-top:35px}
@media(max-width:760px){.kinetic-shell{padding:12px}.site-nav{grid-template-columns:1fr auto}.site-nav nav{display:none}.kinetic-shell main{min-height:900px}.kinetic-shell .hero{padding-top:90px}.kinetic-shell .hero h1{font-size:clamp(62px,18vw,92px)}.kinetic-shell .hero h1 span:nth-child(2){margin-left:-10%}.kinetic-shell .hero h1 span:nth-child(3){margin-left:4%}.hero-action{margin:24px 0 0 8%}.kinetic-orbit{right:-20%;top:31%;width:190px}.kinetic-stage{grid-template-columns:1fr;margin-top:120px;transform:none}.kinetic-stage article:nth-child(3){display:none}.kinetic-shell>footer span:nth-child(2){display:none}}`;

const directionSettingsCss = `
body.template-minimal{--display-fluid:6.3cqi;--display-max:6.5rem}body.template-editorial{--display-fluid:8.4cqi;--display-max:9rem}body.template-spatial{--display-fluid:7.2cqi;--display-max:7.5rem}body.template-precision{--display-fluid:7cqi;--display-max:7rem}body.template-kinetic .hero h1{font-size:clamp(4.75rem,11cqi,10.75rem);line-height:.66}
body.setting-contentWidth-focused .product-main main{max-width:1080px}body.setting-contentWidth-wide .product-main main{max-width:1680px}body.setting-navWeight-quiet .product-rail>a span{opacity:.42}body.setting-navWeight-compact .product-shell{grid-template-columns:58px 1fr}body.setting-navWeight-compact .product-rail>a span{display:none}
body.setting-columnRhythm-essay .editorial-shell .hero{grid-template-columns:.95fr .55fr}body.setting-columnRhythm-essay .editorial-shell .hero h1{font-size:clamp(54px,7vw,104px)}body.setting-columnRhythm-visual .editorial-stage{grid-template-columns:1.7fr .3fr}body.setting-imageReveal-wipe .cover-art{clip-path:inset(0 9% 0 0)}body.setting-imageReveal-sequence .story{transform:translateY(34px)}
body.setting-refraction-clear .spatial-shell :where(.site-nav,.glass-feature,.glass-stage aside article){backdrop-filter:blur(8px) saturate(115%)}body.setting-refraction-frosted .spatial-shell :where(.site-nav,.glass-feature,.glass-stage aside article){background:rgba(255,255,255,.48);backdrop-filter:blur(32px) saturate(115%)}body.setting-parallax-subtle .orbit{transform:scale(.9)}body.setting-parallax-orbit .orbit{transform:rotate(8deg) scale(1.06)}
body.setting-hardware-switch .dial{border-radius:12px;background:linear-gradient(145deg,#ddd0b9,#76614d)}body.setting-hardware-fader .control{grid-template-columns:34px 1fr}body.setting-hardware-fader .dial{width:24px;height:78px;border-radius:8px;background:linear-gradient(90deg,#4b3a2d,#ddd0b9,#4b3a2d)}body.setting-pressFeel-spring .primary-action:active{transform:translateY(4px);box-shadow:0 1px 0 #0e0b09}body.setting-pressFeel-damped .primary-action:active{transform:translateY(2px);transition-duration:650ms}
body.setting-typeFormation-orbit .kinetic-shell .hero h1 span:nth-child(2){transform:rotate(-7deg)}body.setting-typeFormation-mask .kinetic-shell .hero h1{color:transparent;-webkit-text-stroke:2px #17131a;background:linear-gradient(90deg,#17131a 48%,transparent 48%);background-clip:text}body.setting-kineticPath-radial .kinetic-orbit{right:38%;top:37%}body.setting-kineticPath-scroll .kinetic-shell .hero h1 span:first-child{transform:translateX(-5vw)}body.setting-kineticPath-scroll .kinetic-shell .hero h1 span:last-child{transform:translateX(6vw)}
`;

const sharedVariantCss = `
body.variant-safe .hero{padding-block:clamp(42px,6cqi,88px)!important}body.variant-safe .hero h1{max-width:14ch!important;font-size:clamp(2.8rem,5.4cqi,5.6rem)!important;line-height:.9!important}body.variant-safe :where(.work-grid,.editorial-stage,.glass-stage,.hardware-panel){grid-template-columns:1fr!important}body.variant-safe .metrics{grid-template-columns:repeat(2,minmax(0,1fr))!important}body.variant-safe .kinetic-stage{grid-template-columns:repeat(2,minmax(0,1fr))!important;margin-top:100px!important;transform:none!important}body.variant-safe .kinetic-stage article:nth-child(3){display:none}body.variant-safe :where(.cover,.orbit,.hardware-panel,.kinetic-stage){transform:none!important}body.variant-safe :where(.visual-object,.cover-art,.orbit,.ed-product-art){filter:saturate(.72)}
body.variant-bold .hero{padding-block:clamp(78px,11cqi,166px)!important}body.variant-bold .hero h1{max-width:9ch!important;font-size:clamp(4.5rem,9.4cqi,10rem)!important;line-height:.78!important}body.variant-bold .work-grid{grid-template-columns:minmax(0,1.75fr) minmax(180px,.5fr)!important;gap:24px!important}body.variant-bold .work-card:first-child{grid-row:span 2}body.variant-bold .editorial-stage{grid-template-columns:1.62fr .38fr!important}body.variant-bold .glass-stage{grid-template-columns:1.7fr .3fr!important}body.variant-bold .hardware-panel{grid-template-columns:1.55fr .45fr!important;gap:26px!important}body.variant-bold .kinetic-stage{grid-template-columns:1.55fr .75fr .45fr!important;margin-top:30px!important}body.variant-bold :where(.visual-object,.cover-art,.orbit){filter:saturate(1.24) contrast(1.04)}
@media(max-width:760px){body .hero h1{max-width:100%!important;font-size:clamp(2.6rem,11vw,3.4rem)!important;line-height:.88!important;letter-spacing:-.055em!important;overflow-wrap:break-word!important}body .work-card footer{display:block!important}body .work-card footer>span{display:block!important;margin-top:8px}body.variant-bold .hero h1,body.variant-safe .hero h1{font-size:clamp(2.6rem,11vw,3.4rem)!important}body.variant-bold :where(.work-grid,.editorial-stage,.glass-stage,.hardware-panel,.kinetic-stage),body.variant-safe :where(.work-grid,.editorial-stage,.glass-stage,.hardware-panel,.kinetic-stage){grid-template-columns:1fr!important}}
`;

function fallbackMarkup(page: PageIR) {
  return minimalMarkup(page);
}

export function compileTemplateHtml(templateId: unknown, pageInput?: Partial<PageIR>, selections: TemplateSelections = {}, variant: TemplateVariant = 'balanced') {
  const id = isSharedTemplate(templateId) ? templateId : 'minimal';
  const page = cleanPage(pageInput);
  const meta = templateMeta[id];
  const accent = typeof selections.accent === 'string' && /^#[0-9a-f]{6}$/i.test(selections.accent) ? selections.accent : '#7657ff';
  const density = Math.max(20, Math.min(85, Number(selections.density) || 52));
  const motion = Math.max(10, Math.min(90, Number(selections.motion) || 58));
  const radius = selections.corners === 'sharp' ? '2px' : selections.corners === 'pill' ? '32px' : '18px';
  const controlRadius = selections.corners === 'sharp' ? '2px' : selections.corners === 'pill' ? '999px' : '14px';
  const bg = id === 'editorial' ? '#f3ecdf' : id === 'minimal' ? '#eef0ed' : '#f2eee7';
  const ink = '#17151a';
  const muted = id === 'precision' ? '#6b5848' : 'rgba(23,21,26,.64)';
  const surface = id === 'minimal' ? '#ffffff' : 'rgba(255,255,255,.58)';
  const css = id === 'editorial' ? editorialCss : id === 'spatial' ? spatialCss : id === 'precision' ? precisionCss : id === 'kinetic' ? kineticCss : minimalCss;
  const markup = id === 'editorial' ? editorialMarkup(page) : id === 'spatial' ? spatialMarkup(page) : id === 'precision' ? precisionMarkup(page) : id === 'kinetic' ? kineticMarkup(page) : id === 'minimal' ? minimalMarkup(page) : fallbackMarkup(page);
  const settings = Object.entries(selections.directionSettings || {}).map(([key, value]) => ` setting-${escapeHtml(key)}-${escapeHtml(value)}`).join('');
  const variables = `--accent:${accent};--accent-contrast:${contrastColor(accent)};--font:${fontStack(selections.typeTone)};--display-min:3.25rem;--display-fluid:7cqi;--display-max:7rem;--radius:${radius};--control-radius:${controlRadius};--density:${density};--space:${Math.round(24 - density * .18)}px;--card-pad:${Math.round(25 - density * .13)}px;--leading:${(1.82 - density * .006).toFixed(2)};--duration:${Math.round(900 - motion * 7)}ms;--ease:cubic-bezier(.22,1,.36,1);--bg:${bg};--ink:${ink};--muted:${muted};--surface:${surface};--line:rgba(23,21,26,.13)`;
  const contextClasses = ` goal-${escapeHtml(selections.goal || 'refresh')} audience-${escapeHtml(selections.audience || 'general')} ux-${escapeHtml(selections.uxPattern || 'none')}`;
  const layoutMode = selections.locks?.includes('layout') || selections.preserve?.includes('structure') ? 'preserved' : 'recomposed';
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(page.title)} · ${meta.name}</title><style>:root{${variables}}${commonCss}${css}${directionSettingsCss}${sharedVariantCss}</style></head><body id="top" class="template-${id} variant-${variant}${contextClasses}${settings}" data-template-family="${meta.family}" data-compose-template="${id}" data-layout-mode="${layoutMode}" data-variant-profile="${variant}" data-template-version="2.2">${markup}</body></html>`;
}

export function templateFamily(templateId: unknown) {
  return templateMeta[isSharedTemplate(templateId) ? templateId : 'minimal'].family;
}
