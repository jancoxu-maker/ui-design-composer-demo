import type { RenderTemplateSelections } from './render-template-document';

function canvasInteraction(selections: RenderTemplateSelections) {
  const settings = selections.directionSettings || {};
  const navigation = String(settings.canvasNav || 'panzoom');
  const spread = String(settings.canvasSpread || 'clusters');
  const motionDisabled = selections.motionProfile === 'none' || Number(selections.motion) <= 12;
  const style = `<style id="compose-canvas-interaction">
body[data-compose-template="infinitecanvas"]{--canvas-pan-x:0px;--canvas-pan-y:0px;--canvas-zoom:1;--canvas-lift:0px}
body[data-compose-template="infinitecanvas"]:before{content:"";position:fixed;z-index:-1;inset:-36px;pointer-events:none;background-image:radial-gradient(circle,rgba(73,64,79,.34) 0 1.35px,transparent 1.55px);background-size:24px 24px;opacity:.72;transform:translate3d(calc(var(--canvas-pan-x)*-.08),calc(var(--canvas-pan-y)*-.08),0);transition:transform 180ms cubic-bezier(.16,1,.3,1)}
body[data-compose-template="infinitecanvas"] [data-template-role="canvas"]{cursor:grab;touch-action:pan-y;perspective:1200px}
body[data-compose-template="infinitecanvas"] [data-template-role="canvas"].is-dragging{cursor:grabbing}
body[data-compose-template="infinitecanvas"] [data-template-role="canvas"]>article{will-change:transform;transition:transform 180ms cubic-bezier(.16,1,.3,1),box-shadow 180ms cubic-bezier(.16,1,.3,1)}
body[data-compose-template="infinitecanvas"] [data-template-role="canvas"]>article:nth-of-type(1){transform:translate3d(calc(var(--canvas-pan-x)*.42),calc(var(--canvas-pan-y)*.42 + var(--canvas-lift)),38px) rotate(-2.5deg) scale(var(--canvas-zoom))}
body[data-compose-template="infinitecanvas"] [data-template-role="canvas"]>article:nth-of-type(2){transform:translate3d(calc(var(--canvas-pan-x)*-.3),calc(var(--canvas-pan-y)*-.3 + var(--canvas-lift)),70px) rotate(3.5deg) scale(var(--canvas-zoom))}
body[data-compose-template="infinitecanvas"] [data-template-role="canvas"]>article:nth-of-type(3){transform:translate3d(calc(var(--canvas-pan-x)*.72),calc(var(--canvas-pan-y)*.72 + var(--canvas-lift)),105px) rotate(-1deg) scale(var(--canvas-zoom))}
body[data-compose-template="infinitecanvas"] [data-template-role="canvas"]>article:hover{--canvas-lift:-7px;z-index:4;box-shadow:0 26px 64px rgba(35,29,40,.22)}
.compose-canvas-controls{position:sticky;z-index:20;top:16px;display:flex;align-items:center;width:max-content;margin:0 0 0 auto;padding:5px;border:1px solid var(--template-border);border-radius:999px;background:color-mix(in srgb,var(--template-surface) 88%,transparent);box-shadow:0 12px 30px rgba(35,29,40,.12);backdrop-filter:blur(14px)}
.compose-canvas-controls button{display:grid;place-items:center;width:38px;min-height:38px;padding:0;border:0;border-radius:50%;background:transparent;color:var(--template-ink);font:700 15px/1 ui-monospace,monospace}
.compose-canvas-controls button:hover,.compose-canvas-controls button:focus-visible{background:var(--compose-accent);color:var(--compose-accent-contrast);outline:0}
.compose-canvas-controls output{min-width:52px;text-align:center;font:700 11px/1 ui-monospace,monospace}
body[data-canvas-spread="free"] [data-template-role="canvas"]>article:nth-of-type(1){left:8%!important;top:27%!important}
body[data-canvas-spread="free"] [data-template-role="canvas"]>article:nth-of-type(2){right:1%!important;top:11%!important}
body[data-canvas-spread="free"] [data-template-role="canvas"]>article:nth-of-type(3){left:46%!important;bottom:5%!important}
body[data-canvas-spread="timeline"] [data-template-role="canvas"]>article{top:40%!important;bottom:auto!important;width:27%!important}
body[data-canvas-spread="timeline"] [data-template-role="canvas"]>article:nth-of-type(1){left:3%!important}
body[data-canvas-spread="timeline"] [data-template-role="canvas"]>article:nth-of-type(2){left:36%!important;right:auto!important}
body[data-canvas-spread="timeline"] [data-template-role="canvas"]>article:nth-of-type(3){left:69%!important}
body[data-canvas-nav="guided"] [data-template-role="canvas"]:after{content:"01  →  02  →  03";position:absolute;z-index:0;left:14%;right:14%;top:53%;padding:8px;border-top:2px dashed var(--compose-accent);color:var(--compose-accent);text-align:center;font:700 11px/1 ui-monospace,monospace;letter-spacing:.08em}
@container(max-width:900px){body[data-compose-template="infinitecanvas"] [data-template-role="canvas"]{cursor:auto;perspective:none}body[data-compose-template="infinitecanvas"] [data-template-role="canvas"]>article{position:relative!important;inset:auto!important;width:100%!important;transform:none!important;will-change:auto}.compose-canvas-controls{position:relative;top:auto;margin-bottom:14px}body[data-canvas-nav="guided"] [data-template-role="canvas"]:after{display:none}}
@media(prefers-reduced-motion:reduce){body[data-compose-template="infinitecanvas"]:before,body[data-compose-template="infinitecanvas"] [data-template-role="canvas"]>article{transform:none!important;transition:none!important;will-change:auto}}
</style>`;
  const controls = `<div class="compose-canvas-controls" data-canvas-controls aria-label="画布缩放"><button type="button" data-canvas-zoom="out" aria-label="缩小画布">−</button><output aria-live="polite">100%</output><button type="button" data-canvas-zoom="in" aria-label="放大画布">＋</button><button type="button" data-canvas-zoom="reset" aria-label="重置画布">↺</button></div>`;
  const script = motionDisabled ? '' : `<script id="compose-canvas-motion">
(()=>{const root=document.body,canvas=document.querySelector('[data-template-role="canvas"]'),controls=document.querySelector('[data-canvas-controls]');if(!canvas||matchMedia('(prefers-reduced-motion: reduce)').matches)return;let x=0,y=0,tx=0,ty=0,zoom=1,drag=false,px=0,py=0,raf=0;const output=controls?.querySelector('output');const render=()=>{x+=(tx-x)*.12;y+=(ty-y)*.12;root.style.setProperty('--canvas-pan-x',x.toFixed(2)+'px');root.style.setProperty('--canvas-pan-y',y.toFixed(2)+'px');root.style.setProperty('--canvas-zoom',zoom.toFixed(2));if(Math.abs(tx-x)>.08||Math.abs(ty-y)>.08)raf=requestAnimationFrame(render);else raf=0};const move=()=>{if(!raf)raf=requestAnimationFrame(render)};canvas.addEventListener('pointermove',event=>{const box=canvas.getBoundingClientRect();if(drag){tx+=(event.clientX-px)*.65;ty+=(event.clientY-py)*.65;px=event.clientX;py=event.clientY}else if(root.dataset.canvasNav!=='guided'){tx=((event.clientX-box.left)/box.width-.5)*34;ty=((event.clientY-box.top)/box.height-.5)*24}move()});canvas.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'||root.dataset.canvasNav==='guided')return;drag=true;px=event.clientX;py=event.clientY;canvas.classList.add('is-dragging');canvas.setPointerCapture(event.pointerId)});canvas.addEventListener('pointerup',event=>{drag=false;canvas.classList.remove('is-dragging');canvas.releasePointerCapture?.(event.pointerId)});canvas.addEventListener('pointerleave',()=>{if(!drag&&root.dataset.canvasNav!=='minimap'){tx=0;ty=0;move()}});controls?.addEventListener('click',event=>{const action=event.target.closest('button')?.dataset.canvasZoom;if(!action)return;if(action==='in')zoom=Math.min(1.18,zoom+.06);if(action==='out')zoom=Math.max(.88,zoom-.06);if(action==='reset'){zoom=1;tx=0;ty=0}if(output)output.textContent=Math.round(zoom*100)+'%';move()});window.__composeCanvasReady=true})();
</script>`;
  return { navigation, spread, motionMode: motionDisabled ? 'reduced' : 'interactive', style, controls, script };
}

function carouselInteraction(selections: RenderTemplateSelections) {
  const motionDisabled = selections.motionProfile === 'none' || Number(selections.motion) <= 12;
  const style = `<style id="compose-carousel-interaction">
body[data-compose-template="ambientcarousel"]{--carousel-active:1;--carousel-glow-a:#8f70ff;--carousel-glow-b:#ff987a}
body[data-compose-template="ambientcarousel"] [data-template-role="ambient-field"]{background:radial-gradient(circle at 24% 28%,var(--carousel-glow-a),transparent 44%),radial-gradient(circle at 78% 68%,var(--carousel-glow-b),transparent 46%);transition:background 680ms cubic-bezier(.16,1,.3,1)}
body[data-compose-template="ambientcarousel"] [data-template-role="carousel"]{position:relative;overflow:hidden!important;perspective:1100px;isolation:isolate}
body[data-compose-template="ambientcarousel"] [data-template-role="carousel"]>article{cursor:pointer;opacity:.58;filter:saturate(.72);transform:translateX(-8%) rotateY(13deg) scale(.88)!important;transform-origin:center;transition:transform 620ms cubic-bezier(.16,1,.3,1),opacity 420ms ease,filter 420ms ease,box-shadow 420ms ease!important}
body[data-compose-template="ambientcarousel"] [data-template-role="carousel"]>article[data-carousel-state="active"]{z-index:3;opacity:1;filter:none;transform:translateY(-10px) rotateY(0) scale(1.06)!important;box-shadow:0 34px 72px rgba(35,25,45,.28)}
body[data-compose-template="ambientcarousel"] [data-template-role="carousel"]>article[data-carousel-state="after"]{transform:translateX(8%) rotateY(-13deg) scale(.88)!important}
.compose-carousel-controls{display:flex;align-items:center;justify-content:center;gap:10px;margin:-18px auto 8px;position:relative;z-index:8}
.compose-carousel-controls button{display:grid;place-items:center;width:44px;min-height:44px;padding:0;border:1px solid var(--template-border);border-radius:50%;background:var(--template-surface);color:var(--template-ink);box-shadow:var(--template-shadow);font:700 18px/1 system-ui;backdrop-filter:blur(16px)}
.compose-carousel-controls button:hover,.compose-carousel-controls button:focus-visible{background:var(--compose-accent);color:var(--compose-accent-contrast);outline:3px solid color-mix(in srgb,var(--compose-accent) 32%,white);outline-offset:2px}
.compose-carousel-controls output{min-width:58px;text-align:center;font:700 11px/1.2 ui-monospace,monospace}
@container(max-width:640px){body[data-compose-template="ambientcarousel"] [data-template-role="carousel"]>article{opacity:1!important;filter:none!important;transform:none!important}.compose-carousel-controls{display:none}}
@media(prefers-reduced-motion:reduce){body[data-compose-template="ambientcarousel"] [data-template-role="ambient-field"],body[data-compose-template="ambientcarousel"] [data-template-role="carousel"]>article{transition:none!important}}
</style>`;
  const controls = `<nav class="compose-carousel-controls" data-carousel-controls aria-label="轮播控制"><button type="button" data-carousel-step="-1" aria-label="上一个项目">←</button><output aria-live="polite">02 / 03</output><button type="button" data-carousel-step="1" aria-label="下一个项目">→</button></nav>`;
  const script = `<script id="compose-carousel-motion">
(()=>{const root=document.body,track=document.querySelector('[data-template-role="carousel"]'),items=[...(track?.querySelectorAll(':scope > article')||[])],controls=document.querySelector('[data-carousel-controls]'),output=controls?.querySelector('output');if(!track||items.length<2)return;let active=Math.min(1,items.length-1);const colors=[['#8f70ff','#62dfff'],['#7657ff','#ff987a'],['#ff7f92','#d8ff73']];const render=()=>{items.forEach((item,index)=>{item.dataset.carouselState=index===active?'active':index<active?'before':'after';item.setAttribute('aria-label',(index===active?'当前项目，':'')+(item.querySelector('h2')?.textContent||'项目 '+(index+1)));item.tabIndex=0});const pair=colors[active%colors.length];root.style.setProperty('--carousel-glow-a',pair[0]);root.style.setProperty('--carousel-glow-b',pair[1]);if(output)output.textContent=String(active+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0')};const select=index=>{active=(index+items.length)%items.length;render()};controls?.addEventListener('click',event=>{const step=Number(event.target.closest('button')?.dataset.carouselStep||0);if(step)select(active+step)});items.forEach((item,index)=>{item.addEventListener('click',()=>select(index));item.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select(index)}if(event.key==='ArrowLeft')select(active-1);if(event.key==='ArrowRight')select(active+1)})});root.dataset.composeCarouselMotion='${motionDisabled ? 'reduced' : 'interactive'}';render();window.__composeCarouselReady=true})();
</script>`;
  return { style, controls, script };
}

function textGalleryInteraction(selections: RenderTemplateSelections) {
  const motionDisabled = selections.motionProfile === 'none' || Number(selections.motion) <= 12;
  const style = `<style id="compose-text-gallery-interaction">
body[data-compose-template="textgallery"] [data-template-role="story"]{position:relative;padding-right:min(34vw,420px)}
body[data-compose-template="textgallery"] [data-template-role="story"]>section{break-inside:avoid;padding:16px 8px;border-top:1px solid var(--template-border);cursor:pointer;transition:color 220ms ease,transform 220ms ease}
body[data-compose-template="textgallery"] [data-template-role="story"]>section:hover,body[data-compose-template="textgallery"] [data-template-role="story"]>section:focus-visible,body[data-compose-template="textgallery"] [data-template-role="story"]>section[data-text-active="true"]{color:var(--compose-accent);transform:translateX(8px);outline:0}
.compose-text-gallery-preview{position:absolute;z-index:5;right:18px;top:76px;width:min(29vw,360px);aspect-ratio:4/5;overflow:hidden;border:1px solid var(--template-border);background:#17151a;box-shadow:var(--template-shadow);pointer-events:none}
.compose-text-gallery-preview i{position:absolute;inset:0;opacity:0;transform:scale(1.08);transition:opacity 360ms ease,transform 620ms cubic-bezier(.16,1,.3,1)}
.compose-text-gallery-preview i:nth-child(1){background:radial-gradient(circle at 72% 24%,#dfff73 0 14%,transparent 15%),linear-gradient(145deg,#7657ff,#ff987a)}
.compose-text-gallery-preview i:nth-child(2){background:linear-gradient(25deg,transparent 0 32%,#17151a 33% 53%,transparent 54%),linear-gradient(135deg,#f5efe3,#ff7d64)}
.compose-text-gallery-preview i:nth-child(3){background:repeating-linear-gradient(90deg,#17151a 0 2px,transparent 2px 18px),linear-gradient(145deg,#65e1c0,#7657ff)}
.compose-text-gallery-preview i[data-active="true"]{opacity:1;transform:scale(1)}
.compose-text-gallery-preview span{position:absolute;z-index:2;left:16px;bottom:14px;padding:6px 8px;background:#fffaf0;color:#17151a;font:700 10px/1 ui-monospace,monospace}
@container(max-width:760px){body[data-compose-template="textgallery"] [data-template-role="story"]{padding-right:20px}.compose-text-gallery-preview{position:relative;right:auto;top:auto;width:100%;max-width:none;aspect-ratio:16/10;margin:18px 0 0}}
@media(prefers-reduced-motion:reduce){body[data-compose-template="textgallery"] [data-template-role="story"]>section,.compose-text-gallery-preview i{transition:none!important;transform:none!important}}
</style>`;
  const preview = `<aside class="compose-text-gallery-preview" data-text-gallery-preview aria-label="文字触发视觉预览" aria-live="polite"><i data-active="true"></i><i></i><i></i><span>01 / 03</span></aside>`;
  const script = `<script id="compose-text-gallery-motion">
(()=>{const root=document.body,story=document.querySelector('[data-template-role="story"]'),sections=[...(story?.querySelectorAll(':scope > section')||[])],preview=document.querySelector('[data-text-gallery-preview]'),panels=[...(preview?.querySelectorAll('i')||[])],label=preview?.querySelector('span');if(!story||!preview||!sections.length)return;const render=index=>{const active=index%panels.length;sections.forEach((section,itemIndex)=>{section.tabIndex=0;section.dataset.textActive=itemIndex===index?'true':'false';section.setAttribute('aria-label',(itemIndex===index?'当前预览，':'')+(section.querySelector('h3')?.textContent||'内容 '+(itemIndex+1)))});panels.forEach((panel,itemIndex)=>panel.dataset.active=itemIndex===active?'true':'false');if(label)label.textContent=String(active+1).padStart(2,'0')+' / '+String(panels.length).padStart(2,'0')};sections.forEach((section,index)=>{section.addEventListener('pointerenter',()=>render(index));section.addEventListener('focus',()=>render(index));section.addEventListener('click',()=>render(index));section.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='ArrowRight'){event.preventDefault();sections[(index+1)%sections.length].focus()}if(event.key==='ArrowUp'||event.key==='ArrowLeft'){event.preventDefault();sections[(index-1+sections.length)%sections.length].focus()}})});root.dataset.composeTextGalleryMotion='${motionDisabled ? 'reduced' : 'interactive'}';render(0);window.__composeTextGalleryReady=true})();
</script>`;
  return { style, preview, script };
}

export function applyTemplateInteractionContract(html: string, templateIdInput: unknown, selections: RenderTemplateSelections = {}) {
  const templateId = String(templateIdInput || 'minimal');
  if (templateId === 'infinitecanvas') {
    const interaction = canvasInteraction(selections);
    return html
      .replace(/<body([^>]*)>/i, `<body$1 data-canvas-nav="${interaction.navigation}" data-canvas-spread="${interaction.spread}" data-compose-canvas-motion="${interaction.motionMode}">`)
      .replace(/(<main[^>]*data-template-role="canvas"[^>]*>)/i, `$1${interaction.controls}`)
      .replace(/<\/head>/i, `${interaction.style}</head>`)
      .replace(/<\/body>/i, `${interaction.script}</body>`);
  }
  if (templateId === 'ambientcarousel') {
    const interaction = carouselInteraction(selections);
    return html
      .replace(/(<\/section>)(<a[^>]*data-template-role="primary-action")/i, `$1${interaction.controls}$2`)
      .replace(/<\/head>/i, `${interaction.style}</head>`)
      .replace(/<\/body>/i, `${interaction.script}</body>`);
  }
  if (templateId === 'textgallery') {
    const interaction = textGalleryInteraction(selections);
    return html
      .replace(/(<article[^>]*data-template-role="story"[^>]*>[\s\S]*?)(<\/article>)/i, `$1${interaction.preview}$2`)
      .replace(/<\/head>/i, `${interaction.style}</head>`)
      .replace(/<\/body>/i, `${interaction.script}</body>`);
  }
  return html;
}
