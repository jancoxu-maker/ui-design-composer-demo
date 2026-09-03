'use client';

import { useState } from 'react';

type Props = { pattern: string; patternName: string };

export function UXPreviewOverlay({ pattern, patternName }: Props) {
  const [completed, setCompleted] = useState(false);
  const [approved, setApproved] = useState(false);

  if (pattern === 'none') return null;

  if (pattern === 'onboarding') return <aside className="ux-preview-overlay ux-preview-onboarding" aria-label={`${patternName}实时示意`}>
    <header><span>首次使用进度</span><b>{completed ? '4 / 4' : '3 / 4'}</b></header>
    <button type="button" className={completed ? 'done' : ''} onClick={() => setCompleted((value) => !value)}><i>{completed ? '✓' : '4'}</i><span><b>{completed ? '准备完成' : '发布第一个项目'}</b><small>{completed ? '可以开始正式工作' : '约 2 分钟 · 可稍后继续'}</small></span></button>
  </aside>;
  if (pattern === 'workspace') return <div className="ux-preview-overlay ux-preview-workspace" aria-label={`${patternName}实时示意`}><span><i/>已自动保存</span><nav><button type="button">⌘ K</button><button type="button">筛选</button><button type="button">分享</button></nav></div>;
  if (pattern === 'discovery') return <div className="ux-preview-overlay ux-preview-discovery" aria-label={`${patternName}实时示意`}><label><span>⌕</span><input aria-label="搜索演示" placeholder="搜索项目、素材或模板" /></label><nav><button type="button" className="active">全部</button><button type="button">最近</button><button type="button">收藏</button></nav></div>;
  if (pattern === 'creation') return <div className="ux-preview-overlay ux-preview-creation" aria-label={`${patternName}实时示意`}><ol><li className="done">内容</li><li className="active">设计</li><li>检查</li></ol><button type="button" onClick={() => setCompleted((value) => !value)}>{completed ? '已保存 ✓' : '保存草稿'}</button></div>;
  if (pattern === 'review') return <div className="ux-preview-overlay ux-preview-review" aria-label={`${patternName}实时示意`}><div><i>LC</i><i>MY</i><span><b>2 条待处理反馈</b><small>版本 08 · 刚刚同步</small></span></div><nav><button type="button">提出修改</button><button type="button" className={approved ? 'approved' : ''} onClick={() => setApproved((value) => !value)}>{approved ? '已通过 ✓' : '通过'}</button></nav></div>;
  if (pattern === 'monitoring') return <div className="ux-preview-overlay ux-preview-monitoring" aria-label={`${patternName}实时示意`}><span><i/>系统正常</span><dl><div><dt>成功率</dt><dd>99.8%</dd></div><div><dt>待处理</dt><dd>12</dd></div><div><dt>异常</dt><dd>1</dd></div></dl><button type="button">查看异常 →</button></div>;
  if (pattern === 'conversion') return <div className="ux-preview-overlay ux-preview-conversion" aria-label={`${patternName}实时示意`}><span><b>方案已准备好</b><small>包含可访问性检查与完整 HTML</small></span><i>无需绑定 · 随时导出</i><button type="button">生成界面 →</button></div>;
  return <nav className="ux-preview-overlay ux-preview-mobile" aria-label={`${patternName}实时示意`}><button type="button"><i>⌂</i><span>首页</span></button><button type="button" className="active"><i>＋</i><span>创建</span></button><button type="button"><i>◇</i><span>项目</span></button><button type="button"><i>○</i><span>我的</span></button></nav>;
}
