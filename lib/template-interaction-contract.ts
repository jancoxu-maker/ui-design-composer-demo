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

export function applyTemplateInteractionContract(html: string, templateIdInput: unknown, selections: RenderTemplateSelections = {}) {
  const templateId = String(templateIdInput || 'minimal');
  if (templateId !== 'infinitecanvas') return html;
  const interaction = canvasInteraction(selections);
  return html
    .replace(/<body([^>]*)>/i, `<body$1 data-canvas-nav="${interaction.navigation}" data-canvas-spread="${interaction.spread}" data-compose-canvas-motion="${interaction.motionMode}">`)
    .replace(/(<main[^>]*data-template-role="canvas"[^>]*>)/i, `$1${interaction.controls}`)
    .replace(/<\/head>/i, `${interaction.style}</head>`)
    .replace(/<\/body>/i, `${interaction.script}</body>`);
}
