import type { TemplateSelections } from './shared-template-compiler';

const patterns: Record<string, { label: string; status: string; actions: string[] }> = {
  onboarding: { label: '上手进度 2 / 3', status: '下一步：完成基础设置', actions: ['继续设置', '稍后处理'] },
  workspace: { label: '已自动保存', status: '工作区状态正常', actions: ['⌘ K', '筛选', '分享'] },
  discovery: { label: '已保存当前视图', status: '找到 24 项内容', actions: ['搜索', '筛选', '保存视图'] },
  creation: { label: '草稿已保存', status: '可撤销最近一步', actions: ['撤销', '预览', '继续'] },
  review: { label: '等待审核', status: '2 条待处理意见', actions: ['查看差异', '评论', '提交'] },
  monitoring: { label: '系统运行正常', status: '1 项需要关注', actions: ['查看异常', '刷新'] },
  conversion: { label: '信息已确认', status: '下一步即可完成', actions: ['查看详情', '继续'] },
  mobiletask: { label: '任务已保存', status: '可从这里继续', actions: ['首页', '任务', '我的'] },
};

export function applyUxPatternContract(html: string, selections: TemplateSelections & Record<string, unknown>) {
  const id = String(selections.uxPattern || 'none');
  if (id === 'none' || !patterns[id]) {
    return html.replace(/<body([^>]*)>/i, '<body$1 data-ux-pattern="none">');
  }

  const pattern = patterns[id];
  const markup = `<aside class="compose-ux-layer compose-ux-${id}" data-template-role="ux-pattern" aria-label="${pattern.label}"><span><i aria-hidden="true"></i><b>${pattern.label}</b><small>${pattern.status}</small></span><nav>${pattern.actions.map((action, index) => `<button type="button"${index === pattern.actions.length - 1 ? ' data-primary' : ''}>${action}</button>`).join('')}</nav></aside>`;
  const style = `<style id="compose-ux-contract">body.compose-has-ux{padding-bottom:92px!important}.compose-ux-layer{position:fixed;z-index:90;left:50%;bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:20px;width:min(560px,calc(100% - 32px));min-height:58px;padding:8px 9px 8px 14px;border:1px solid color-mix(in srgb,var(--template-border,var(--line,#242027)) 52%,transparent);border-radius:16px;background:color-mix(in srgb,var(--template-surface,var(--surface,#fff)) 90%,transparent);color:var(--template-ink,var(--ink,#211d25));box-shadow:0 16px 40px rgba(24,20,28,.16);backdrop-filter:blur(18px);transform:translateX(-50%);font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}.compose-ux-layer>span{display:grid;grid-template-columns:auto 1fr;column-gap:8px;align-items:center}.compose-ux-layer>span i{grid-row:1/3;width:8px;height:8px;border-radius:50%;background:#55a56f}.compose-ux-layer b{font-size:11px}.compose-ux-layer small{margin-top:2px;opacity:.62;font-size:9px}.compose-ux-layer nav{display:flex;gap:5px}.compose-ux-layer button{min-height:34px;padding:0 11px;border:1px solid color-mix(in srgb,currentColor 12%,transparent);border-radius:10px;background:color-mix(in srgb,var(--template-surface,var(--surface,#fff)) 96%,transparent);color:inherit;font-size:10px;white-space:nowrap}.compose-ux-layer button[data-primary]{border-color:var(--compose-accent,var(--accent,#7657ff));background:var(--compose-accent,var(--accent,#7657ff));color:var(--compose-accent-contrast,var(--accent-contrast,#fff))}.compose-ux-monitoring>span i{background:#ec9b35}.compose-ux-review>span i{background:#7657ff}@media(max-width:640px){body.compose-has-ux{padding-bottom:84px!important}.compose-ux-layer{bottom:10px;width:calc(100% - 20px);min-height:58px;padding:7px 8px 7px 11px}.compose-ux-layer>span small{display:none}.compose-ux-layer nav{margin-left:auto}.compose-ux-layer button{min-height:40px;padding:0 9px}.compose-ux-layer nav button:not(:last-child):not(:first-child){display:none}.compose-ux-mobiletask{border-radius:22px}.compose-ux-mobiletask>span{display:none}.compose-ux-mobiletask nav{display:grid;width:100%;grid-template-columns:repeat(3,1fr)}.compose-ux-mobiletask nav button{display:block!important}}</style>`;

  const withBodyContract = html.replace(/<body([^>]*)>/i, (_match, attributes: string) => {
    const nextAttributes = /\bclass=["']/i.test(attributes)
      ? attributes.replace(/\bclass=(["'])([^"']*)\1/i, (_classMatch: string, quote: string, classes: string) => `class=${quote}${classes} compose-has-ux${quote}`)
      : `${attributes} class="compose-has-ux"`;
    return `<body${nextAttributes} data-ux-pattern="${id}">`;
  });

  return withBodyContract
    .replace(/<style[^>]*id=["']compose-ux-contract["'][^>]*>[\s\S]*?<\/style>/i, '')
    .replace(/<aside[^>]*class=["'][^"']*compose-ux-layer[^"']*["'][^>]*>[\s\S]*?<\/aside>/i, '')
    .replace(/<\/head>/i, `${style}</head>`)
    .replace(/<\/body>/i, `${markup}</body>`);
}
