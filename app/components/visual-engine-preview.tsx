'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';

type Props = {
  direction: string;
  directionName: string;
  title: string;
  goal: string;
  audience: string;
  accent: string;
  density: number;
  motion: number;
  className: string;
};

export function VisualEnginePreview({ direction, directionName, title, goal, audience, accent, density, motion, className }: Props) {
  const [view, setView] = useState<'board' | 'review'>('board');
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState(68);
  const accentRgb = accent.replace('#','');
  const accentValue = Number.parseInt(accentRgb.length === 3 ? accentRgb.split('').map((value) => value + value).join('') : accentRgb, 16);
  const accentLuminance = ((accentValue >> 16) * 299 + ((accentValue >> 8) & 255) * 587 + (accentValue & 255) * 114) / 1000;
  const densityCardHeight = Math.round(149 - density * .72);
  const densityCardPadding = Math.round(20 - density * .12);
  const densityLineHeight = (1.82 - density * .006).toFixed(2);
  const motionDuration = Math.round(920 - motion * 6);
  const rootStyle = {
    '--accent': accent,
    '--user-accent': accent,
    '--accent-contrast': accentLuminance > 150 ? '#17131a' : '#ffffff',
    '--density': density / 100,
    '--density-card-min': `${densityCardHeight}px`,
    '--density-card-pad': `${densityCardPadding}px`,
    '--density-line-height': densityLineHeight,
    '--density-gap': `${Math.round(19 - density * .13)}px`,
    '--motion': .58,
    '--motion-duration': `${motionDuration}ms`,
    '--motion-duration-slow': `${Math.round(motionDuration * 1.55)}ms`,
    '--motion-duration-loop': `${Math.round(motionDuration * 4.2)}ms`,
  } as CSSProperties;
  const goalLabel = { refresh: '整体焕新', clarity: '清晰优先', brand: '品牌强化', conversion: '行动优先' }[goal] || '设计目标';
  const audienceLabel = { general: '大众模式', professional: '专业模式', team: '团队模式' }[audience] || '专业模式';
  const liveAttributes = { 'data-live-context': `${goalLabel} · ${audienceLabel}`, 'data-direction': directionName };

  if (direction === 'infinitecanvas') {
    return <div className={`${className} engine-demo engine-infinite-canvas`} {...liveAttributes} style={{...rootStyle,'--canvas-x':`${(progress - 68) * 2}px`,'--canvas-y':`${(68 - progress) * .7}px`} as CSSProperties} onPointerMove={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty('--cursor-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 18}px`);
      event.currentTarget.style.setProperty('--cursor-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 18}px`);
    }}>
      <header className="ed-canvas-head"><b>FIELD / 01</b><span>Infinite creative space</span><nav><button type="button" onClick={() => setProgress(Math.max(28,progress-14))}>−</button><em>{progress}%</em><button type="button" onClick={() => setProgress(Math.min(96,progress+14))}>＋</button></nav></header>
      <section className="ed-canvas-world" aria-label="可探索的无限灵感画布"><div className="ed-canvas-grid"/><article className="canvas-note note-a"><small>01 / RESEARCH</small><b>Signals worth keeping</b><span>12 references</span></article><article className="canvas-note note-b"><i/><b>Material study</b><span>Glass · paper · light</span></article><article className="canvas-note note-c"><small>02 / DIRECTION</small><h2>{title}</h2><button type="button" onClick={() => setSaved(!saved)}>{saved ? 'Pinned ✓' : 'Pin direction'}</button></article><article className="canvas-note note-d"><i/><i/><i/><b>Palette field</b></article><div className="ed-canvas-map"><i/><span>YOU ARE HERE</span></div></section>
      <footer className="ed-canvas-foot"><span>DRAG SPACE · SCROLL TO ZOOM</span><b>04 OBJECTS / CLUSTER A</b></footer>
    </div>;
  }

  if (direction === 'assembly') {
    const stage = progress > 72 ? 2 : progress > 42 ? 1 : 0;
    return <div className={`${className} engine-demo engine-assembly stage-${stage}`} {...liveAttributes} style={rootStyle}>
      <header className="ed-assembly-head"><b>NORTH / ASSEMBLY</b><span>SCROLL STUDY · 03 ACTS</span><button type="button" onClick={() => setProgress(stage === 2 ? 24 : stage === 1 ? 82 : 52)}>{stage === 2 ? 'RESTART' : 'NEXT ACT'} ↘</button></header>
      <section className="ed-assembly-stage"><div className="assembly-copy"><small>ACT 0{stage + 1} · FORMING</small><h2>{title}</h2><p>Ideas begin apart. Structure gives them rhythm, sequence and a reason to meet.</p></div><article className="assembly-tile tile-a"><span>01</span><i/></article><article className="assembly-tile tile-b"><span>02</span><i/></article><article className="assembly-tile tile-c"><span>03</span><b>MAKE<br/>ROOM<br/>FOR IDEAS</b></article><article className="assembly-tile tile-d"><span>04</span><i/></article></section>
      <footer className="ed-assembly-foot"><span><i style={{width:`${Math.max(18,stage*41+18)}%`}}/></span><b>{stage + 1} / 3 · CLICK NEXT ACT</b></footer>
    </div>;
  }

  if (direction === 'ambientcarousel') {
    const active = Math.max(0,Math.min(2,Math.round((progress - 20) / 30)));
    const works = [['FORM / 01','Soft signal'],['FIELD / 02','Chromatic air'],['OBJECT / 03','After image']];
    return <div className={`${className} engine-demo engine-ambient-carousel ambient-${active}`} {...liveAttributes} style={rootStyle}>
      <div className="ed-ambient-bg" aria-hidden="true"><i/><i/></div><header className="ed-ambient-head"><b>NORTH / EDITIONS</b><span>SELECTED OBJECTS · 2026</span><button type="button">INDEX ↗</button></header>
      <section className="ed-carousel-copy"><small>IMMERSIVE COLLECTION</small><h2>{title}</h2><p>Every object changes the atmosphere around it.</p></section>
      <section className="ed-carousel-stage">{works.map(([eyebrow,name],index) => <button key={name} className={active === index ? 'active' : ''} type="button" onClick={() => setProgress(20 + index*30)}><small>{eyebrow}</small><i/><b>{name}</b><span>{String(index+1).padStart(2,'0')} / 03</span></button>)}</section>
      <footer className="ed-ambient-foot"><button type="button" onClick={() => setProgress(20 + ((active+2)%3)*30)}>←</button><span><i style={{width:`${(active+1)*33.33}%`}}/></span><button type="button" onClick={() => setProgress(20 + ((active+1)%3)*30)}>→</button></footer>
    </div>;
  }

  if (direction === 'textgallery') {
    const active = Math.max(0,Math.min(2,Math.round((progress - 20) / 30)));
    const words = ['living systems','quiet objects','moving identities'];
    return <div className={`${className} engine-demo engine-text-gallery gallery-${active} ${saved ? 'gallery-open' : ''}`} {...liveAttributes} style={rootStyle}>
      <header className="ed-text-head"><b>THE NORTH REVIEW</b><span>ISSUE 04 · VISUAL CULTURE</span><button type="button">ARCHIVE</button></header>
      <section className="ed-text-story"><small>FIELD NOTES / 2026</small><h2>We make {words.map((word,index) => <button key={word} type="button" onPointerEnter={() => setProgress(20 + index*30)} onFocus={() => setProgress(20 + index*30)} onClick={() => {setProgress(20 + index*30);setSaved(true);}}>{word}</button>)} for a changing world.</h2><p>Move through the sentence. Each idea carries its own visual evidence.</p></section>
      <aside className="ed-text-preview"><span>0{active + 1}</span><i/><b>{words[active]}</b><button type="button" onClick={() => setSaved(!saved)}>{saved ? 'Close collection' : 'Open collection ↗'}</button></aside>
      <footer className="ed-text-foot"><span>HOVER A PHRASE</span><b>TEXT IS THE INTERFACE</b></footer>
    </div>;
  }

  if (direction === 'ascii') {
    return <div className={`${className} engine-demo engine-ascii ascii-${view}`} {...liveAttributes} style={{...rootStyle,'--ascii-level':progress} as CSSProperties}>
      <header className="ed-ascii-head"><b>RASTER / LAB</b><nav><button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')} type="button">ASCII</button><button className={view === 'review' ? 'active' : ''} onClick={() => setView('review')} type="button">DITHER</button></nav><span>LIVE INPUT · 01</span></header>
      <section className="ed-ascii-stage"><div className="ed-ascii-copy"><small>DIGITAL MATERIAL STUDY</small><h2>{title}</h2><p>Images become characters, dots and scan lines without losing the underlying hierarchy.</p><label><span>Sampling</span><input aria-label="数字栅格采样精度" type="range" min="24" max="92" value={progress} onChange={(event) => setProgress(Number(event.target.value))}/></label></div><div className="ed-ascii-image" aria-label="数字颗粒图像演示"><pre>{view === 'board' ? `      @@@@       \n   @@######@@    \n  @##++==++##@   \n @##+=....=+##@  \n @##+. V  .+##@  \n  @##+....+##@   \n   @@######@@    \n      @@@@       ` : `·· ░░▒▒▓▓██ ▓▒░ ··\n· ░▒▓████████▓▒░ ·\n░▒██▓▓▒▒▒▒▓▓██▒░\n▒██▓▒░ VISTA ▒▓██▒\n░▒██▓▓▒▒▒▒▓▓██▒░\n· ░▒▓████████▓▒░ ·\n·· ░░▒▒▓▓██ ▓▒░ ··`}</pre><span>0{Math.round(progress/10)} / SAMPLE</span></div></section>
      <footer className="ed-ascii-foot"><span>CHARACTER MATRIX / WEBGL-INSPIRED</span><b>{view === 'board' ? 'ASCII MODE' : 'DITHER MODE'}</b></footer>
    </div>;
  }

  if (direction === 'console') {
    return <div className={`${className} engine-demo engine-console`} {...liveAttributes} style={rootStyle}>
      <header className="ed-console-head"><b>north / control</b><nav><button className="active" type="button">Overview</button><button type="button">Activity</button><button type="button">Exports</button></nav><span>LIVE <i/></span></header>
      <section className="ed-console-title"><div><small>WORKSPACE PERFORMANCE</small><h2>{title}</h2></div><button type="button">Export report ↗</button></section>
      <section className="ed-metrics"><article><small>ACTIVE PROJECTS</small><b>24</b><em>+12.4%</em></article><article><small>AVG. REVIEW</small><b>1.8h</b><em>−18 min</em></article><article><small>APPROVAL RATE</small><b>92%</b><em>Healthy</em></article></section>
      <section className="ed-console-main"><article><header><b>Output velocity</b><span>Last 7 days</span></header><div className="ed-chart" aria-label="过去七天产出趋势"><i/><i/><i/><i/><i/><i/><i/></div><footer><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></footer></article><aside><header><b>Pipeline</b><span>38 total</span></header>{[['Brief','12'],['Design','08'],['Review','14'],['Ship','04']].map(([label,value], index) => <div key={label}><span><i style={{width: `${[63,42,74,22][index]}%`}}/></span><b>{label}</b><em>{value}</em></div>)}</aside></section>
    </div>;
  }

  if (direction === 'carbon') {
    return <div className={`${className} engine-demo engine-carbon`} {...liveAttributes} style={rootStyle}>
      <header className="ed-carbon-global"><button type="button" aria-label="打开菜单">☰</button><b>IBM</b><span>Creative Operations</span><nav><button type="button">Search</button><button type="button">Help</button><button type="button">YL</button></nav></header>
      <div className="ed-carbon-shell"><aside><small>WORKSPACE</small>{['Overview','Projects','Approvals','Assets','Reports'].map((item,index) => <button className={index === 0 ? 'active' : ''} type="button" key={item}><i/>{item}</button>)}</aside><main><header><div><small>OVERVIEW</small><h2>Production workspace</h2></div><button type="button">Create project</button></header><section className="ed-carbon-stats"><article><small>ACTIVE PROJECTS</small><b>24</b><span>8 require attention</span></article><article><small>ON-TIME DELIVERY</small><b>91.4%</b><span>↑ 3.2 this month</span></article><article><small>ASSET OUTPUT</small><b>1,248</b><span>Last 30 days</span></article></section><section className="ed-carbon-table"><header><b>Priority work</b><button type="button">View all ↗</button></header><table><thead><tr><th>Project</th><th>Status</th><th>Owner</th><th>Due</th></tr></thead><tbody>{[['Spring campaign','In review','Lin Chen','Today'],['Home refresh','In progress','Mira K.','Sep 02'],['Retail launch','Briefing','Alex W.','Sep 05'],['Brand system','Approved','Nina P.','Sep 08']].map((row,index) => <tr key={row[0]} className={index === 0 ? 'selected' : ''}>{row.map((cell,cellIndex) => <td key={cell}>{cellIndex === 1 && <i/>}{cell}</td>)}</tr>)}</tbody></table></section></main></div>
    </div>;
  }

  if (direction === 'polaris') {
    return <div className={`${className} engine-demo engine-polaris`} {...liveAttributes} style={rootStyle}>
      <header className="ed-polaris-global"><b>north store</b><label><span>⌕</span><input aria-label="搜索后台" placeholder="Search"/></label><button type="button">YL</button></header>
      <div className="ed-polaris-shell"><aside>{['Home','Orders','Products','Customers','Content','Analytics'].map((item,index) => <button className={index === 0 ? 'active' : ''} type="button" key={item}><i/>{item}</button>)}</aside><main><header><div><small>MONDAY, AUGUST 31</small><h2>Good afternoon, Lin</h2></div><button type="button">Add product</button></header><section className="ed-polaris-guide"><div><small>STORE SETUP</small><b>Make your first sale</b><p>Complete the essentials, then share your store.</p></div><div className="ed-polaris-ring" style={{'--value':'72%'} as CSSProperties}><b>72%</b></div></section><section className="ed-polaris-metrics"><article><small>Total sales</small><b>$12,480</b><span>↑ 14%</span></article><article><small>Orders</small><b>84</b><span>↑ 8%</span></article><article><small>Conversion</small><b>3.6%</b><span>Stable</span></article></section><section className="ed-polaris-orders"><header><b>Recent orders</b><button type="button">View report</button></header>{[['#1048','Paid','$248.00'],['#1047','Fulfilled','$96.00'],['#1046','Pending','$420.00']].map(([id,status,value]) => <button type="button" key={id}><i/><b>{id}</b><span>{status}</span><em>{value}</em></button>)}</section></main></div>
    </div>;
  }

  if (direction === 'atlassian') {
    const lanes = [
      ['TO DO', ['Define launch story','Audit mobile flow','Prepare assets']],
      ['IN PROGRESS', ['Build visual system','Review interactions']],
      ['IN REVIEW', ['Campaign landing','Accessibility pass']],
    ];
    return <div className={`${className} engine-demo engine-atlassian`} {...liveAttributes} style={rootStyle}>
      <header className="ed-atlassian-global"><b>north / Projects</b><nav><button type="button">Your work</button><button type="button">Projects</button><button type="button">Teams</button></nav><button type="button">Create</button><i>YL</i></header>
      <section className="ed-atlassian-title"><div><small>PROJECT / VISTA 2.0</small><h2>{title}</h2></div><nav><button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')} type="button">Board</button><button className={view === 'review' ? 'active' : ''} onClick={() => setView('review')} type="button">Timeline</button></nav><button type="button">Share</button></section>
      <section className="ed-kanban">{lanes.map(([lane,items],laneIndex) => <article key={lane as string}><header><b>{lane as string}</b><span>{(items as string[]).length}</span></header>{(items as string[]).map((item,index) => <button className={saved && laneIndex === 1 && index === 0 ? 'selected' : ''} onClick={() => setSaved(!saved)} type="button" key={item}><small>VISTA-{21 + laneIndex * 7 + index}</small><b>{item}</b><footer><em className={`priority p-${laneIndex}`}/><span>{index % 2 ? 'MK' : 'LC'}</span></footer></button>)}<button className="ed-add-card" type="button">+ Add item</button></article>)}</section>
    </div>;
  }

  if (direction === 'spatial') {
    return <div className={`${className} engine-demo engine-spatial`} {...liveAttributes} style={rootStyle} onPointerMove={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty('--px', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
      event.currentTarget.style.setProperty('--py', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
    }}>
      <div className="ed-aurora" aria-hidden="true"><i/><i/><i/></div>
      <header className="ed-glass-nav"><b>north</b><nav><button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')} type="button">Canvas</button><button className={view === 'review' ? 'active' : ''} onClick={() => setView('review')} type="button">Review</button></nav><button type="button">⌘ K</button></header>
      <section className="ed-spatial-copy"><small>SPATIAL WORKSPACE · 04</small><h2>{view === 'board' ? title : 'Clarity, suspended in space.'}</h2><p>Move the pointer across the canvas. The light field and optical surfaces respond to the environment.</p></section>
      <section className="ed-glass-stage"><article><header><span>01 / CAMPAIGN</span><button type="button" onClick={() => setSaved(!saved)} aria-pressed={saved}>{saved ? 'Saved ✓' : 'Save'}</button></header><div className="ed-orbit"><i/><i/><i/></div><footer><b>Chromatic objects</b><span>Updated now</span></footer></article><aside><div><small>TEAM FOCUS</small><b>84%</b><span><i style={{width:'84%'}}/></span></div><div><small>NEXT REVIEW</small><b>Visual language</b><span>Today · 16:20</span></div></aside></section>
    </div>;
  }

  if (direction === 'portfolio') {
    return <div className={`${className} engine-demo engine-portfolio`} {...liveAttributes} style={rootStyle}>
      <header className="ed-portfolio-nav"><b>NORTH / STUDIO</b><span>Independent creative practice<br/>Shanghai · Remote</span><nav><button type="button">Work</button><button type="button">About</button><button type="button">Contact</button></nav></header>
      <section className="ed-portfolio-hero"><div><small>SELECTED WORK · 2024—26</small><h2>We shape<br/>the vivid.</h2><button type="button">Explore projects <i>↗</i></button></div><div className="ed-project-stack"><button className={view === 'board' ? 'front' : ''} onClick={() => setView('board')} type="button"><span>01</span><i/><b>Objects in motion</b><em>Art direction</em></button><button className={view === 'review' ? 'front' : ''} onClick={() => setView('review')} type="button"><span>02</span><i/><b>Quiet systems</b><em>Digital product</em></button><button type="button"><span>03</span><i/><b>New rituals</b><em>Brand identity</em></button></div></section>
      <footer className="ed-portfolio-foot"><span>SCROLL TO DISCOVER</span><b>03 / 12 PROJECTS</b><span>© 2026 NORTH</span></footer>
    </div>;
  }

  if (direction === 'mobile') {
    return <div className={`${className} engine-demo engine-mobile`} {...liveAttributes} style={rootStyle}>
      <section className="ed-mobile-copy"><small>MOBILE FLOW · 03 SCREENS</small><h2>One task.<br/>One clear path.</h2><p>Mobile patterns are demonstrated as a connected journey, not stretched into a desktop dashboard.</p><nav>{['Discover','Create','Review'].map((item,index) => <button className={(view === 'board' ? 0 : 2) === index ? 'active' : ''} onClick={() => setView(index === 2 ? 'review' : 'board')} type="button" key={item}><i>{index + 1}</i>{item}</button>)}</nav></section>
      <section className="ed-phones"><article className="phone-a"><header><i/>9:41<span>•••</span></header><div><small>GOOD MORNING</small><h3>Your creative day</h3><button type="button">Start a project</button><section><b>In focus</b><div><i/><span><strong>Spring campaign</strong><small>8 of 12 ready</small></span></div></section></div><footer><i/><i/><i/></footer></article><article className="phone-b"><header><i/>9:41<span>•••</span></header><div><small>NEW PROJECT</small><h3>Choose a direction</h3>{['Bold editorial','Soft product','Spatial glass'].map((item,index) => <button className={index === 0 ? 'active' : ''} type="button" key={item}><i/>{item}<span>›</span></button>)}</div><footer><button type="button">Continue</button></footer></article><article className="phone-c"><header><i/>9:41<span>•••</span></header><div><small>READY TO REVIEW</small><h3>Visual direction 02</h3><section><i/><i/><b>Make it vivid.</b></section><button onClick={() => setSaved(!saved)} type="button">{saved ? 'Approved ✓' : 'Approve direction'}</button></div></article></section>
    </div>;
  }

  if (direction === 'typelab') {
    return <div className={`${className} engine-demo engine-typelab`} {...liveAttributes} style={{...rootStyle, '--type-axis': progress} as CSSProperties}>
      <header className="ed-type-head"><b>TYPE / LAB 04</b><nav><button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')} type="button">SPECIMEN</button><button className={view === 'review' ? 'active' : ''} onClick={() => setView('review')} type="button">GLYPHS</button></nav><span>VARIABLE STUDY · 2026</span></header>
      <section className="ed-type-stage"><aside><small>AXIS CONTROL</small>{[['Weight',progress],['Width',100-progress/2],['Slant',progress/3]].map(([label,value]) => <label key={label as string}><span>{label as string}<b>{Math.round(value as number)}</b></span><input aria-label={label as string} type="range" min="20" max="100" value={value as number} onChange={(event) => setProgress(Number(event.target.value))}/></label>)}<button type="button" onClick={() => setProgress(68)}>RESET AXES</button></aside><main><small>{view === 'board' ? 'DISPLAY SPECIMEN' : 'CHARACTER SET · A—Z'}</small><h2>{view === 'board' ? <>FORM<br/>FOLLOWS<br/><i>FEELING</i></> : <>ABCDEFGHI<br/>JKLMNOPQR<br/><i>STUVWXYZ</i></>}</h2><footer><span>WGT {progress}</span><span>WDTH {Math.round(100-progress/2)}</span><span>SLNT −{Math.round(progress/3)}</span></footer></main></section>
    </div>;
  }

  if (direction === 'altweb') {
    return <div className={`${className} engine-demo engine-altweb`} {...liveAttributes} style={rootStyle}>
      <header className="ed-alt-head"><b>WWW.NORTH.STUDIO</b><span>AN ALTERNATIVE INDEX OF WORK</span><button type="button">ENTER ↵</button></header>
      <section className="ed-window-field"><article className={`window window-main ${view === 'board' ? 'front' : ''}`} onClick={() => setView('board')}><header><i/><i/><i/><b>PROJECT_01.HTML</b></header><div><small>FEATURED PROJECT</small><h2>Wrong<br/>on purpose.</h2><p>Interfaces for people who are tired of interfaces.</p></div></article><article className={`window window-image ${view === 'review' ? 'front' : ''}`} onClick={() => setView('review')}><header><i/><i/><i/><b>IMAGE_VIEWER.GIF</b></header><div><i/><i/><strong>02</strong></div></article><article className="window window-list"><header><i/><i/><i/><b>INDEX.TXT</b></header><div>{['01 / BRAND SYSTEM','02 / DIGITAL OBJECT','03 / MOVING TYPE','04 / OTHER THINGS'].map(item => <button type="button" key={item}>{item}<span>↗</span></button>)}</div></article><aside><span>DRAG WINDOWS</span><b>↘</b></aside></section>
      <footer className="ed-alt-foot"><span>BEST VIEWED WITH CURIOSITY</span><span>SHANGHAI · 31.08.26</span></footer>
    </div>;
  }

  if (direction === 'exhibit') {
    return <div className={`${className} engine-demo engine-exhibit`} {...liveAttributes} style={rootStyle} onPointerMove={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty('--gallery-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 26}px`);
    }}>
      <header className="ed-exhibit-head"><b>NORTH / DIGITAL EXHIBITION</b><nav><button type="button">INDEX</button><button type="button">ABOUT</button></nav><span>ROOM 01—04</span></header>
      <section className="ed-exhibit-title"><small>ONLINE EXHIBITION · 2026</small><h2>{title}</h2><p>Move across a collection of objects, systems and impossible surfaces.</p></section>
      <section className="ed-gallery-stage"><div className="ed-gallery-track">{[['01','Soft machine'],['02','Electric garden'],['03','Synthetic sun'],['04','Memory object']].map(([number,name],index) => <button className={saved && index === 2 ? 'selected' : ''} onClick={() => { setSaved(index === 2 ? !saved : saved); setProgress(25 + index*20); }} type="button" key={number}><span>{number}</span><i/><b>{name}</b><small>OPEN STUDY ↗</small></button>)}</div></section>
      <footer className="ed-exhibit-foot"><span><i style={{width:`${progress}%`}}/></span><b>{String(Math.max(1,Math.round(progress/25))).padStart(2,'0')} / 04</b><em>MOVE TO EXPLORE</em></footer>
    </div>;
  }

  if (direction === 'kinetic') {
    return <div className={`${className} engine-demo engine-kinetic`} {...liveAttributes} style={rootStyle} onPointerMove={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty('--kx', `${((event.clientX - bounds.left) / bounds.width - .5) * 18}px`);
      event.currentTarget.style.setProperty('--ky', `${((event.clientY - bounds.top) / bounds.height - .5) * 18}px`);
    }}>
      <header className="ed-kinetic-nav"><b>NO/RT/H</b><nav><button type="button">Index</button><button type="button">Studio</button></nav><button type="button">Let’s talk <i>↗</i></button></header>
      <section className="ed-kinetic-hero"><small>INDEPENDENT CREATIVE ENGINE · 2026</small><h2><span>MAKE</span><span>THE</span><span>UNEXPECTED</span></h2><p>Strategy, systems and moving images for ideas that refuse to sit still.</p><button onClick={() => setSaved(!saved)} type="button">{saved ? 'PLAYING · 01:24' : 'PLAY SHOWREEL'} <i/></button></section>
      <div className="ed-kinetic-orbit" aria-hidden="true"><i/><i/><i/><b>01</b></div><footer><span>SHANGHAI / WORLDWIDE</span><span>SCROLL TO SHIFT THE VIEW</span><span>©26</span></footer>
    </div>;
  }

  if (direction === 'editorial' || direction === 'brutal') {
    return <div className={`${className} engine-demo engine-editorial`} {...liveAttributes} style={rootStyle}>
      <header className="ed-editorial-nav"><b>NORTH®</b><span>VOL. 04 / CREATIVE OPERATIONS</span><button onClick={() => setSaved(!saved)} type="button">{saved ? 'SAVED' : 'ARCHIVE +'}</button></header>
      <section className="ed-editorial-hero"><div><small>THE WORK ISSUE</small><h2>{title}</h2></div><aside><span>Creative work deserves<br/>a stronger point of view.</span><b>2026—08</b></aside></section>
      <section className="ed-editorial-grid"><article><div className="ed-poster"><i/><i/><strong>01</strong></div><footer><b>Spring objects</b><span>ART DIRECTION / PRODUCT</span></footer></article><aside><small>FIELD NOTE · 014</small><h3>Build the system.<br/>Break the pattern.</h3><p>A working surface for teams who shape, review and ship ideas together.</p><button type="button">Read the story ↗</button></aside></section>
    </div>;
  }

  if (direction === 'soft' || direction === 'precision') {
    return <div className={`${className} engine-demo engine-tactile`} {...liveAttributes} style={rootStyle}>
      <header className="ed-soft-nav"><b>{direction === 'precision' ? 'STUDIO 84' : 'north'}</b><nav><button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')} type="button">{direction === 'precision' ? 'MIX' : 'My space'}</button><button className={view === 'review' ? 'active' : ''} onClick={() => setView('review')} type="button">{direction === 'precision' ? 'TAPE' : 'Together'}</button></nav><button className="ed-soft-avatar" type="button">{direction === 'precision' ? '48' : 'YL'}</button></header>
      <section className="ed-soft-intro"><div><small>{direction === 'precision' ? 'STUDIO CONTROL · READY' : 'GOOD AFTERNOON'}</small><h2>{direction === 'precision' ? (view === 'board' ? 'Shape the signal by touch.' : 'Every control, precisely set.') : (view === 'board' ? 'Let’s make something lovely.' : 'Everything is ready to review.')}</h2></div><button className="ed-physical-button" type="button" onClick={() => setSaved(!saved)}><i/>{saved ? 'Added to today' : direction === 'precision' ? 'Power on' : 'Create a project'}</button></section>
      <section className="ed-soft-board"><article><header><small>{direction === 'precision' ? 'MASTER OUTPUT' : 'FOCUS PROJECT'}</small><span>{progress}%</span></header><div className="ed-soft-art"><i/><i/><i/></div><footer><b>{direction === 'precision' ? 'Studio Console 01' : 'Kitchen stories'}</b><span>{direction === 'precision' ? 'Calibrated · 48 kHz' : '12 pieces · due Friday'}</span></footer></article><aside><div><small>{direction === 'precision' ? 'CHANNELS' : 'TODAY'}</small><b>{direction === 'precision' ? 'Physical controls' : '3 gentle steps'}</b>{(direction === 'precision' ? ['Input gain','Warmth','Presence'] : ['Refine palette','Review type','Share direction']).map((item,index) => <button key={item} type="button" onClick={() => setProgress(Math.min(100, progress + 8))}><i className={progress > 68 + index * 8 ? 'done' : ''}/>{item}</button>)}</div><div><small>{direction === 'precision' ? 'OUTPUT LEVEL' : 'TEAM RHYTHM'}</small><b>{progress}%</b><span><i style={{width:`${progress}%`}}/></span></div></aside></section>
    </div>;
  }

  return <div className={`${className} engine-demo engine-product`} {...liveAttributes} style={rootStyle}>
    <aside className="ed-product-side"><b>n</b><nav>{['⌂','□','◇','↗'].map((item,index) => <button className={index === 0 ? 'active' : ''} type="button" key={item}>{item}</button>)}</nav><button type="button">YL</button></aside>
    <div className="ed-product-body"><header><div><small>CREATIVE OPERATIONS</small><b>{directionName}</b></div><nav><button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')} type="button">Board</button><button className={view === 'review' ? 'active' : ''} onClick={() => setView('review')} type="button">Review</button></nav><button type="button">New project +</button></header>
      <section className="ed-product-title"><div><small>MONDAY · 31 AUG</small><h2>{view === 'board' ? 'Make the next move clear.' : 'Review what matters most.'}</h2></div><p>A precise workspace for shaping the work without losing the thread.</p></section>
      <section className="ed-product-grid"><article><header><span>PRIMARY PROJECT</span><em>IN PROGRESS</em></header><div className="ed-product-art"><i/><i/></div><footer><div><b>Spring campaign</b><small>Updated 4 minutes ago</small></div><button type="button" onClick={() => setSaved(!saved)}>{saved ? 'Following ✓' : 'Open project ↗'}</button></footer></article><aside><div><small>THIS WEEK</small><b>12</b><span>deliverables</span></div><div><small>NEXT REVIEW</small><b>Visual direction</b><span>Today · 14:30</span></div></aside></section>
    </div>
  </div>;
}
