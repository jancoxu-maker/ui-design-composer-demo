'use client';

import { useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { getVisualStyleRecipe } from '../lib/visual-style-engine';
import { UXPreviewOverlay } from './components/ux-preview-overlay';
import { ResponsiveDeliveryPreview } from './components/responsive-delivery-preview';
import type { DeliveryDevice, DeliveryScaleMode } from './components/responsive-delivery-preview';
import { VisualEnginePreview } from './components/visual-engine-preview';
import { isSharedTemplate } from '../lib/shared-template-compiler';
import { applyHeadingScale } from '../lib/heading-scale';

type DesignCoverage = Record<'goal' | 'audience' | 'ux' | 'visual' | 'type' | 'directionSettings' | 'corners' | 'accent' | 'density' | 'motion' | 'preserveLocks', string>;
type DesignVariant = { id: 'safe' | 'balanced' | 'bold'; title: string; summary: string; html: string; coverage: DesignCoverage; templateId: string; templateFamily: string; templateVerified: boolean };
type DesignResult = { analysis: string; direction: string; variants: DesignVariant[] };

const steps = [
  ['导入原界面', '上传截图、HTML 或网址'],
  ['定义改造目标', '明确目标与必须保留项'],
  ['配置设计方向', '选择 UX、视觉与字体'],
  ['生成交付结果', '确认方案并生成 HTML'],
];

const goals = [
  ['refresh', '整体焕新', '保留内容，重新设计视觉'],
  ['clarity', '变得更清晰', '改善层级、密度与可读性'],
  ['brand', '更有品牌感', '建立颜色、字体与组件语言'],
  ['conversion', '提升行动效率', '突出关键任务与主要按钮'],
];

const styles = [
  ['liquid', 'Liquid Glass', '环境取色、边缘折射与交互高光', '光学玻璃'],
  ['glass', '磨砂玻璃', '稳定雾化、透明分层与柔和景深', '光学玻璃'],
  ['matte', '纯净哑光', '低反光、细边界与高可读性的现代基础表面', '实体表面'],
  ['tactile', '精密实体', '现代硬件般的实体表面与机械反馈', '物理表面'],
  ['paper', '编辑纸张', '纸纤维、裁切层次与内容气质', '物理表面'],
  ['chrome', '液态金属', '镜面高光、冷峻反射与未来精度', '未来表面'],
  ['holo', '光谱薄膜', '克制虹彩、角度变色与轻盈光泽', '未来表面'],
  ['obsidian', '黑曜石', '深黑镜面、细微反射与专业感', '未来表面'],
];

const templates = [['split', '焦点分屏'], ['bento', '不对称拼图'], ['editorial', '编辑式长页'], ['dense', '高效控制台'], ['magazine', '杂志分栏'], ['canvas', '自由画布'], ['sidebar', '工作台侧栏'], ['cascade', '层叠卡片']];

const colors = ['#7657ff', '#ff6f4d', '#176b5b', '#202028'];
function accentContrast(color: string) {
  const raw = color.replace('#','');
  const value = Number.parseInt(raw.length === 3 ? raw.split('').map((part) => part + part).join('') : raw, 16);
  const luminance = ((value >> 16) * 299 + ((value >> 8) & 255) * 587 + (value & 255) * 114) / 1000;
  return luminance > 150 ? '#17131a' : '#ffffff';
}
const preserveOptions = [['content','内容文字'],['structure','页面结构'],['brand','品牌颜色'],['components','现有组件']];
const uxPatterns = [
  { id:'none', name:'无 UX 方案', summary:'不附加新的任务模式，只调整视觉呈现', source:'保持原有体验', sourceUrl:'', principles:[] },
  { id:'onboarding', name:'新用户快速上手', summary:'任务清单、渐进披露与清晰完成状态', source:'GOV.UK Frontend', sourceUrl:'https://github.com/alphagov/govuk-frontend', principles:['任务清单','可恢复进度','错误就地解释'] },
  { id:'workspace', name:'专业高效工作台', summary:'高频操作前置、快捷指令与持续状态反馈', source:'PatternFly React', sourceUrl:'https://github.com/patternfly/patternfly-react', principles:['命令入口','批量操作','上下文状态'] },
  { id:'discovery', name:'内容浏览与发现', summary:'搜索、筛选、保存视图与结果反馈', source:'Shopify Polaris', sourceUrl:'https://github.com/Shopify/polaris', principles:['搜索筛选','资源列表','空状态建议'] },
  { id:'creation', name:'创建与编辑流程', summary:'分步创作、自动保存与可撤销反馈', source:'Adobe React Spectrum', sourceUrl:'https://github.com/adobe/react-spectrum', principles:['渐进创作','自动保存','键盘可达'] },
  { id:'review', name:'审核与协作流程', summary:'版本、评论、责任人与决策状态同屏', source:'Atlassian Design', sourceUrl:'https://github.com/atlassian/pragmatic-drag-and-drop', principles:['版本对比','反馈闭环','明确责任'] },
  { id:'monitoring', name:'数据监控与异常处理', summary:'健康状态、异常优先级与可追溯处置', source:'IBM Carbon', sourceUrl:'https://github.com/carbon-design-system/carbon', principles:['状态总览','异常优先','恢复路径'] },
  { id:'conversion', name:'转化与行动路径', summary:'价值确认、风险消除与单一主要行动', source:'Shopify Polaris', sourceUrl:'https://github.com/Shopify/polaris', principles:['单一主行动','信任信息','过程可预期'] },
  { id:'mobiletask', name:'移动端单任务', summary:'拇指可达、短路径与中断后继续', source:'Material Web', sourceUrl:'https://github.com/material-components/material-web', principles:['底部导航','单手操作','断点续作'] },
];
const typeOptions = [['serif','编辑衬线','优雅、内容与文化'],['grotesk','几何无衬线','现代、理性与品牌'],['human','人文无衬线','自然、可信与易读'],['mono','等宽科技','技术、数据与工具'],['display','艺术展示体','个性、发布与实验'],['condensed','窄体标题','力量、速度与时尚'],['rounded','圆体亲和','友好、轻松与年轻'],['system','系统中性','稳定、高效与通用'],['slab','粗衬线','坚实、复古与强调'],['contrast','高反差衬线','奢华、精品与杂志'],['hand','手写表达','温度、个性与生活'],['hybrid','中西混排','国际、编辑与品牌']];
const motionOptions = [['premium','高级舒缓'],['corporate','清晰克制'],['playful','轻盈弹性'],['energetic','快速有力'],['cinematic','电影转场'],['elastic','弹性物理'],['scroll','滚动叙事'],['none','近乎静止']];
const colorOptions = [['brand','品牌主导'],['mono','单色层级'],['duo','双色对比'],['neutral','中性克制'],['contrast','高对比'],['pastel','低饱和粉彩'],['jewel','宝石浓彩'],['earth','自然大地']];
const cornerOptions = [['sharp','直角'],['round','圆角'],['pill','药丸']];
const depthOptions = [['flat','纯平面'],['hairline','细线分层'],['shadow','环境阴影'],['layered','层叠错位'],['embossed','浮雕内凹'],['glow','光晕悬浮']];
const imageOptions = [['photo','摄影主导'],['illustration','插画系统'],['three','三维场景'],['collage','拼贴混合'],['diagram','信息图形'],['abstract','抽象生成'],['type','文字即图像'],['none','无图形化']];
const componentOptions = [['minimal','极简克制'],['friendly','圆润亲和'],['technical','精密技术'],['luxury','精品奢华'],['playful','趣味表达'],['industrial','工业工具']];
type DirectionControls = { fonts: string[]; layouts: string[]; corners: string[]; motions: string[]; note: string };
type DirectionField = { key: string; label: string; note: string; options: string[][]; defaultValue: string };
const directionControls: Record<string, DirectionControls> = {
  minimal: { fonts: ['grotesk','human','system'], layouts: ['sidebar','split','bento'], corners: ['subtle','sharp','round'], motions: ['corporate','premium','none'], note: '克制字体、严格产品网格与低干扰反馈' },
  fluent: { fonts: ['human','grotesk','system'], layouts: ['sidebar','bento','split'], corners: ['round','pill','subtle'], motions: ['corporate','premium','playful'], note: '人文可读性、柔和分区与空间层级动效' },
  spectrum: { fonts: ['grotesk','system','mono'], layouts: ['dense','sidebar','canvas'], corners: ['subtle','sharp','round'], motions: ['corporate','energetic','none'], note: '创意工具密度、专业面板与清晰状态反馈' },
  carbon: { fonts: ['grotesk','system','mono'], layouts: ['dense','sidebar','split'], corners: ['sharp','subtle'], motions: ['corporate','none'], note: '企业 2x 网格、方正结构与功能性动效' },
  polaris: { fonts: ['human','system','grotesk'], layouts: ['sidebar','bento','dense'], corners: ['round','subtle','pill'], motions: ['corporate','premium','none'], note: '经营任务、摘要模块与可信的状态变化' },
  atlassian: { fonts: ['human','system','grotesk'], layouts: ['canvas','dense','sidebar'], corners: ['subtle','round','sharp'], motions: ['corporate','energetic','none'], note: '横向工作流、任务泳道与快速状态切换' },
  editorial: { fonts: ['serif','contrast','hybrid','condensed'], layouts: ['editorial','magazine','split'], corners: ['sharp','subtle','mixed'], motions: ['premium','scroll','cinematic'], note: '内容主导、非对称分栏与阅读节奏' },
  portfolio: { fonts: ['display','contrast','serif','grotesk'], layouts: ['cascade','editorial','magazine'], corners: ['mixed','sharp','organic'], motions: ['premium','cinematic','scroll'], note: '作品叙事、层叠深度与缓慢镜头感' },
  soft: { fonts: ['rounded','human','hand'], layouts: ['bento','split','cascade'], corners: ['round','pill','organic'], motions: ['playful','premium','elastic'], note: '亲和字形、柔软模块与低压力反馈' },
  mobile: { fonts: ['system','human','rounded'], layouts: ['split','sidebar','bento'], corners: ['round','pill','subtle'], motions: ['corporate','playful','none'], note: '单任务移动流程、拇指区域与渐进展示' },
  precision: { fonts: ['slab','serif','mono'], layouts: ['split','dense','sidebar'], corners: ['round','subtle','sharp'], motions: ['elastic','corporate','none'], note: '仪表字体、实体控制台与物理按压反馈' },
  console: { fonts: ['mono','grotesk','system'], layouts: ['dense','sidebar','split'], corners: ['sharp','subtle'], motions: ['corporate','none','energetic'], note: '数据扫描、固定导航与最少装饰性运动' },
  spatial: { fonts: ['grotesk','display','rounded'], layouts: ['bento','canvas','cascade'], corners: ['mixed','pill','round'], motions: ['cinematic','premium','elastic'], note: '透明功能层、空间画布与景深转换' },
  brutal: { fonts: ['condensed','slab','mono','grotesk'], layouts: ['editorial','split','dense'], corners: ['sharp','subtle'], motions: ['energetic','none'], note: '高冲突排版、硬边结构与直接按压' },
  kinetic: { fonts: ['display','condensed','contrast'], layouts: ['canvas','editorial','cascade'], corners: ['mixed','sharp','organic'], motions: ['cinematic','energetic','scroll'], note: '巨型文字、空间叠加与高动势转场' },
  typelab: { fonts: ['display','condensed','mono','contrast'], layouts: ['split','editorial','canvas'], corners: ['sharp','subtle'], motions: ['energetic','cinematic','none'], note: '变量文字、实时控制面板与排版形变' },
  altweb: { fonts: ['mono','condensed','slab','display'], layouts: ['canvas','cascade','split'], corners: ['sharp','mixed','subtle'], motions: ['energetic','scroll','none'], note: '浏览器窗口拼贴、反网格结构与直接反馈' },
  exhibit: { fonts: ['grotesk','display','contrast'], layouts: ['canvas','cascade','magazine'], corners: ['sharp','mixed','organic'], motions: ['cinematic','scroll','premium'], note: '透视展厅、横向作品序列与镜头式移动' },
  infinitecanvas: { fonts: ['grotesk','human','mono'], layouts: ['canvas'], corners: ['round','sharp'], motions: ['premium','corporate','none'], note: '自由空间、内容簇群与可控的拖动缩放' },
  assembly: { fonts: ['contrast','serif','grotesk'], layouts: ['editorial'], corners: ['sharp','round'], motions: ['scroll','cinematic','none'], note: '滚动固定、模块汇聚与阶段性叙事' },
  ambientcarousel: { fonts: ['display','grotesk','contrast'], layouts: ['cascade'], corners: ['round','pill'], motions: ['cinematic','premium','none'], note: '中心聚焦、空间卡片与内容驱动环境色' },
  textgallery: { fonts: ['serif','contrast','hybrid'], layouts: ['magazine'], corners: ['sharp','round'], motions: ['premium','corporate','none'], note: '编辑正文、关键词触发与渐进式画廊展开' },
  ascii: { fonts: ['mono','condensed','slab'], layouts: ['split'], corners: ['sharp','round'], motions: ['energetic','corporate','none'], note: '字符栅格、图像采样与数字原生反馈' },
};
const directionFields: Record<string, DirectionField[]> = {
  minimal: [{ key:'contentWidth', label:'内容宽度', note:'决定产品页面的阅读与操作宽度', options:[['focused','聚焦窄栏'],['balanced','平衡内容'],['wide','宽幅工作区']], defaultValue:'balanced' },{ key:'navWeight', label:'导航存在感', note:'调整导航与内容之间的主次关系', options:[['quiet','弱化导航'],['fixed','固定导航'],['compact','紧凑工具栏']], defaultValue:'quiet' }],
  fluent: [{ key:'micaDepth', label:'云母层级', note:'控制背景与浮层的空间深度', options:[['flat','轻量云母'],['layered','分层云母'],['ambient','环境光层']], defaultValue:'layered' },{ key:'reveal', label:'面板出现方式', note:'匹配 Fluent 工作流的反馈方式', options:[['fade','淡入'],['slide','侧滑'],['focus','焦点展开']], defaultValue:'fade' }],
  spectrum: [{ key:'panelRatio', label:'工具面板比例', note:'决定画布和专业工具的空间分配', options:[['canvas','画布优先'],['balanced','平衡'],['tools','工具优先']], defaultValue:'canvas' },{ key:'toolFeedback', label:'工具反馈', note:'调整选中、拖动和执行反馈', options:[['precise','精确克制'],['snappy','快速响应'],['guided','分步引导']], defaultValue:'precise' }],
  carbon: [{ key:'gridDensity', label:'企业网格密度', note:'控制数据区行高与模块间距', options:[['compact','紧凑'],['standard','标准'],['spacious','宽松']], defaultValue:'compact' },{ key:'dataFocus', label:'数据焦点', note:'选择当前工作台最突出的信息', options:[['table','表格优先'],['metrics','指标优先'],['workflow','流程优先']], defaultValue:'table' }],
  polaris: [{ key:'merchantFocus', label:'经营任务焦点', note:'决定首页首先帮助用户完成什么', options:[['setup','开店引导'],['sales','销售数据'],['orders','订单处理']], defaultValue:'setup' },{ key:'statusMode', label:'状态表达', note:'控制商业状态的视觉强度', options:[['quiet','低干扰'],['clear','清晰标签'],['urgent','异常优先']], defaultValue:'clear' }],
  atlassian: [{ key:'laneMode', label:'泳道组织', note:'决定任务按状态、成员或优先级排列', options:[['status','按状态'],['owner','按成员'],['priority','按优先级']], defaultValue:'status' },{ key:'cardMove', label:'卡片移动反馈', note:'匹配协作看板的直接操作', options:[['snap','吸附'],['lift','抬升'],['trail','路径提示']], defaultValue:'snap' }],
  editorial: [{ key:'columnRhythm', label:'分栏节奏', note:'决定标题、正文和图像的叙事比例', options:[['hero','标题主导'],['essay','长文主导'],['visual','图像主导']], defaultValue:'hero' },{ key:'imageReveal', label:'图像揭示', note:'匹配编辑页面的阅读转场', options:[['crop','裁切出现'],['wipe','遮罩揭示'],['sequence','连续叙事']], defaultValue:'crop' }],
  portfolio: [{ key:'workStack', label:'作品陈列', note:'控制项目之间的空间关系', options:[['stack','层叠'],['strip','横向条带'],['spotlight','单件聚焦']], defaultValue:'stack' },{ key:'projectTransition', label:'项目切换', note:'决定作品浏览的镜头语言', options:[['depth','景深切换'],['slide','平移'],['cut','直接切换']], defaultValue:'depth' }],
  soft: [{ key:'softness', label:'柔软程度', note:'控制卡片、阴影和留白的亲和感', options:[['light','轻柔'],['plush','饱满'],['airy','通透']], defaultValue:'plush' },{ key:'feedback', label:'操作反馈', note:'匹配低压力体验的交互响应', options:[['bounce','微弹'],['glow','柔光'],['ripple','波纹']], defaultValue:'bounce' }],
  mobile: [{ key:'mobileNav', label:'移动导航', note:'针对单手任务选择主要导航结构', options:[['bottom','底部导航'],['tabs','顶部标签'],['steps','分步流程']], defaultValue:'bottom' },{ key:'journey', label:'流程过渡', note:'控制三个移动页面的衔接方式', options:[['slide','横向滑动'],['stack','卡片堆叠'],['progress','进度推进']], defaultValue:'slide' }],
  precision: [{ key:'hardware', label:'实体控制类型', note:'决定拟物界面的主要物理隐喻', options:[['dial','旋钮仪表'],['switch','开关面板'],['fader','推子控制台']], defaultValue:'dial' },{ key:'pressFeel', label:'机械反馈', note:'模拟真实控制器的按压与回弹', options:[['firm','硬朗'],['spring','弹簧'],['damped','阻尼']], defaultValue:'firm' }],
  console: [{ key:'consoleFocus', label:'控制台焦点', note:'选择实时预览中最重要的数据形态', options:[['charts','趋势图'],['status','系统状态'],['pipeline','任务管线']], defaultValue:'charts' },{ key:'refreshMode', label:'数据刷新', note:'表达实时数据进入页面的方式', options:[['pulse','脉冲'],['stream','连续流'],['step','分段更新']], defaultValue:'pulse' }],
  spatial: [{ key:'refraction', label:'玻璃光学', note:'控制折射、透光与背景影响', options:[['clear','清透'],['prism','棱镜'],['frosted','雾化']], defaultValue:'prism' },{ key:'parallax', label:'空间响应', note:'决定指针移动时的景深变化', options:[['subtle','轻微视差'],['layered','多层视差'],['orbit','环绕响应']], defaultValue:'layered' }],
  brutal: [{ key:'borderWeight', label:'边框重量', note:'决定粗野风格的结构冲击力', options:[['thin','细线'],['bold','粗线'],['block','色块边界']], defaultValue:'bold' },{ key:'impact', label:'按压冲击', note:'控制直接、硬朗的交互反馈', options:[['snap','瞬时'],['offset','错位阴影'],['flash','色块闪切']], defaultValue:'offset' }],
  kinetic: [{ key:'typeFormation', label:'巨型文字构成', note:'决定文字如何占据和切割画面', options:[['split','错位分行'],['orbit','环绕排字'],['mask','图像遮罩']], defaultValue:'split' },{ key:'kineticPath', label:'动势路径', note:'选择主要视觉对象的运动轨迹', options:[['diagonal','对角推进'],['radial','径向扩散'],['scroll','滚动牵引']], defaultValue:'diagonal' }],
  typelab: [{ key:'typeAxis', label:'变量轴重点', note:'决定字体实验的主要形变维度', options:[['weight','字重'],['width','字宽'],['slant','倾斜']], defaultValue:'weight' },{ key:'glyphMotion', label:'字形变化', note:'选择字形参数变化的响应方式', options:[['morph','连续变形'],['step','分段切换'],['cursor','跟随指针']], defaultValue:'morph' }],
  altweb: [{ key:'windowOrder', label:'窗口秩序', note:'控制反网格页面的重叠程度', options:[['tidy','有限错位'],['collage','自由拼贴'],['chaos','高密叠放']], defaultValue:'collage' },{ key:'focusRule', label:'窗口聚焦', note:'决定用户如何把窗口带到最前', options:[['hover','悬停聚焦'],['click','点击置顶'],['drag','拖动排序']], defaultValue:'click' }],
  exhibit: [{ key:'galleryDepth', label:'展厅景深', note:'控制作品序列的透视与镜头距离', options:[['flat','平面陈列'],['perspective','透视展厅'],['tunnel','纵深通道']], defaultValue:'perspective' },{ key:'browseMode', label:'策展浏览', note:'决定作品之间的移动方式', options:[['horizontal','横向策展'],['focus','单件聚焦'],['guided','自动导览']], defaultValue:'horizontal' }],
  infinitecanvas: [{ key:'canvasSpread', label:'画布分布', note:'决定素材在无限空间中的组织方式', options:[['clusters','主题簇群'],['free','自由散布'],['timeline','时间轴']], defaultValue:'clusters' },{ key:'canvasNav', label:'空间导航', note:'控制浏览无限画布的方式', options:[['panzoom','拖动缩放'],['minimap','小地图定位'],['guided','路径导览']], defaultValue:'panzoom' }],
  assembly: [{ key:'assemblyOrigin', label:'组装起点', note:'决定模块从哪里汇聚成最终版式', options:[['edges','四周进入'],['stack','纵向堆叠'],['scatter','散点汇聚']], defaultValue:'edges' },{ key:'pinRhythm', label:'固定节奏', note:'控制滚动停顿和画面组装阶段', options:[['short','快速组装'],['staged','分段完成'],['long','沉浸停留']], defaultValue:'staged' }],
  ambientcarousel: [{ key:'carouselDepth', label:'轮播景深', note:'控制侧卡旋转和中心卡聚焦程度', options:[['flat','平面'],['soft3d','柔和透视'],['deep','强景深']], defaultValue:'soft3d' },{ key:'colorResponse', label:'环境取色', note:'决定背景如何响应当前作品', options:[['subtle','轻微染色'],['sampled','提取主色'],['vivid','浓烈渐变']], defaultValue:'sampled' }],
  textgallery: [{ key:'textTrigger', label:'图像触发', note:'决定文字与图像预览的连接方式', options:[['hover','悬停词语'],['click','点击关键词'],['scroll','阅读位置']], defaultValue:'hover' },{ key:'galleryExpand', label:'画廊展开', note:'控制预览进入画廊的转场层级', options:[['inline','文中展开'],['overlay','覆盖层'],['fullscreen','全屏作品']], defaultValue:'overlay' }],
  ascii: [{ key:'rasterMode', label:'数字栅格', note:'选择图像转译成数字纹理的方式', options:[['ascii','字符矩阵'],['dither','抖动网点'],['scanline','扫描线']], defaultValue:'ascii' },{ key:'sampleRate', label:'采样精度', note:'控制数字颗粒的粗细和辨识度', options:[['coarse','粗颗粒'],['balanced','平衡'],['fine','细密']], defaultValue:'balanced' }],
};
const visualDirections = [
  ['minimal','现代产品极简','清晰网格、中性表面与克制层级','matte','sidebar','grotesk','neutral','subtle','hairline','diagram','corporate','产品工具'],
  ['fluent','Fluent 空间感','云母底色、柔和层级与高效工作流','glass','sidebar','human','brand','round','shadow','abstract','corporate','产品工具'],
  ['spectrum','Spectrum 创意工具','中性工作区、醒目操作色与专业面板','matte','dense','grotesk','brand','subtle','hairline','diagram','corporate','产品工具'],
  ['carbon','Carbon 企业网格','强网格、黑色顶栏与无卡片数据工作台','matte','dense','grotesk','mono','sharp','hairline','diagram','corporate','数据系统'],
  ['polaris','Polaris 商业后台','经营摘要、任务引导与可信的交易列表','matte','sidebar','human','neutral','round','shadow','diagram','corporate','产品工具'],
  ['atlassian','Atlassian 协作看板','泳道任务、团队状态与横向工作流','matte','canvas','human','brand','subtle','hairline','diagram','corporate','产品工具'],
  ['editorial','大胆编辑','大字号、不对称构图与强叙事留白','paper','editorial','serif','brand','sharp','layered','collage','premium','内容品牌'],
  ['portfolio','Framer 作品集','全屏封面、层叠项目与强作品叙事','matte','cascade','display','neutral','mixed','layered','photo','premium','内容品牌'],
  ['soft','柔和亲和','温和色彩、圆润组件与低压力体验','glass','bento','rounded','pastel','round','shadow','illustration','playful','消费体验'],
  ['mobile','Mobbin 移动产品','设备优先、底部导航与单任务流程','matte','split','system','brand','round','shadow','diagram','corporate','消费体验'],
  ['precision','经典拟物','皮革、金属、刻度与强烈物理反馈','tactile','split','slab','earth','round','embossed','none','elastic','消费体验'],
  ['console','高密度控制台','数据优先、多状态与紧凑工作流','obsidian','dense','mono','mono','sharp','hairline','diagram','corporate','数据系统'],
  ['spatial','空间玻璃','透明功能层、景深与空间化交互','liquid','bento','grotesk','jewel','mixed','glow','abstract','cinematic','实验未来'],
  ['brutal','新粗野实验','硬边框、直接结构与高冲突表达','matte','editorial','condensed','contrast','sharp','flat','type','energetic','实验未来'],
  ['kinetic','Godly 动态实验','巨型文字、空间叠加与动势优先的落地页','holo','canvas','display','contrast','mixed','glow','type','cinematic','实验未来'],
  ['typelab','Codrops 字体实验','变量字形、控制面板与动态排版舞台','matte','split','display','mono','sharp','flat','type','energetic','实验未来'],
  ['altweb','Hoverstates 反网格','浏览器窗口、错位拼贴与另类网页结构','paper','canvas','mono','contrast','mixed','layered','collage','energetic','实验未来'],
  ['exhibit','Awwwards 数字展厅','透视空间、横向策展与镜头式浏览','obsidian','canvas','grotesk','neutral','mixed','glow','three','cinematic','实验未来'],
  ['infinitecanvas','无限灵感画布','自由拖动、主题簇群与空间化内容探索','matte','canvas','grotesk','brand','round','layered','collage','premium','实验未来'],
  ['assembly','滚动组装叙事','模块随阅读进程汇聚成完整视觉结构','paper','editorial','contrast','neutral','sharp','layered','photo','scroll','内容品牌'],
  ['ambientcarousel','氛围色 3D 轮播','空间卡片、惯性浏览与内容驱动环境色','holo','cascade','display','jewel','round','glow','photo','cinematic','内容品牌'],
  ['textgallery','文本触发画廊','文字即导航、即时缩略图与层级展开','paper','magazine','serif','neutral','sharp','layered','photo','premium','内容品牌'],
  ['ascii','ASCII 数字颗粒','字符矩阵、抖动网点与实时数字栅格','obsidian','split','mono','mono','sharp','flat','type','energetic','实验未来'],
];

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef('');
  const [step, setStep] = useState(1);
  const [source, setSource] = useState<'upload' | 'url' | 'template'>('upload');
  const [fileName, setFileName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sourceData, setSourceData] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [recognizedUrl, setRecognizedUrl] = useState('');
  const [urlState, setUrlState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [htmlFile, setHtmlFile] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<DeliveryDevice>('desktop');
  const [previewZoom, setPreviewZoom] = useState<100 | 85>(100);
  const [deliveryScaleMode, setDeliveryScaleMode] = useState<DeliveryScaleMode>('fit');
  const [headingScale, setHeadingScale] = useState(100);
  const [outputMode, setOutputMode] = useState<'preview' | 'code'>('preview');
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [goal, setGoal] = useState('brand');
  const [style, setStyle] = useState('paper');
  const [template, setTemplate] = useState('editorial');
  const [preserve, setPreserve] = useState(['content', 'components']);
  const [audience, setAudience] = useState('professional');
  const [typeTone, setTypeTone] = useState('serif');
  const [motionProfile, setMotionProfile] = useState('premium');
  const [directionMode, setDirectionMode] = useState<'ux' | 'visual' | 'type' | 'advanced'>('visual');
  const [uxPattern, setUxPattern] = useState('workspace');
  const [visualGroup, setVisualGroup] = useState('全部');
  const [visualDirection, setVisualDirection] = useState('editorial');
  const [colorStrategy, setColorStrategy] = useState('brand');
  const [corners, setCorners] = useState('round');
  const [depth, setDepth] = useState('layered');
  const [imageStyle, setImageStyle] = useState('abstract');
  const [componentTone, setComponentTone] = useState('technical');
  const [directionSettings, setDirectionSettings] = useState<Record<string,string>>({});
  const [accent, setAccent] = useState(colors[0]);
  const [density, setDensity] = useState(52);
  const [motion, setMotion] = useState(58);
  const [locks, setLocks] = useState(['color', 'content']);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState(false);
  const [designResult, setDesignResult] = useState<DesignResult | null>(null);
  const [activeVariant, setActiveVariant] = useState<DesignVariant | null>(null);
  const [apiError, setApiError] = useState('');

  const previewTitle = 'A flexible workspace';
  const activeRecipe = getVisualStyleRecipe(visualDirection);
  const activeControls = directionControls[visualDirection] || directionControls.minimal;
  const activeFields = directionFields[visualDirection] || directionFields.minimal;
  const compatibleTypeOptions = typeOptions.filter(([id]) => activeControls.fonts.includes(id));
  const compatibleCorners = cornerOptions;
  const activeDirectionSettings = Object.fromEntries(activeFields.map((field) => [field.key, directionSettings[`${visualDirection}:${field.key}`] || field.defaultValue]));
  const directionSettingClasses = activeFields.map((field) => `setting-${field.key}-${activeDirectionSettings[field.key]}`).join(' ');
  const richPreviewClasses = [
    `style-${style}`,
    `template-${template}`,
    `type-${typeTone}`,
    `corner-${corners}`,
    `depth-${depth}`,
    `image-${imageStyle}`,
    `component-${componentTone}`,
    `color-${colorStrategy}`,
    `motion-${motionProfile}`,
    `goal-${goal}`,
    `audience-${audience}`,
    directionSettingClasses,
  ].join(' ');
  const activeDirectionName = visualDirections.find(([id]) => id === visualDirection)?.[1] || '现代产品极简';
  const activeUXPattern = uxPatterns.find((pattern) => pattern.id === uxPattern) || uxPatterns[2];
  const sourcePreviewLabel = '通用演示内容';
  const audienceLabel = audience === 'general' ? '大众用户' : audience === 'professional' ? '专业用户' : '内部团队';
  const deliveryHtml = useMemo(() => activeVariant ? applyHeadingScale(activeVariant.html, headingScale) : '', [activeVariant, headingScale]);

  function toggleLock(key: string) {
    setLocks((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
    setActiveVariant(null);
    setResults(false);
  }

  function togglePreserve(key: string) {
    const willPreserve = !preserve.includes(key);
    setPreserve((current) => willPreserve ? [...current, key] : current.filter((item) => item !== key));
    const lockKey = key === 'structure' ? 'layout' : key === 'content' ? 'content' : '';
    if (lockKey) setLocks((current) => willPreserve ? [...new Set([...current, lockKey])] : current.filter((item) => item !== lockKey));
    setActiveVariant(null);
    setResults(false);
  }

  function toggleChangePermission(key: 'layout' | 'content') {
    const willAllow = locks.includes(key);
    setLocks((current) => willAllow ? current.filter((item) => item !== key) : [...current, key]);
    const preserveKey = key === 'layout' ? 'structure' : 'content';
    setPreserve((current) => willAllow ? current.filter((item) => item !== preserveKey) : [...new Set([...current, preserveKey])]);
    setActiveVariant(null);
    setResults(false);
  }

  async function handleFile(file?: File) {
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    setFileName(file.name);
    setActiveVariant(null);
    setResults(false);
    const isHtml = file.type === 'text/html' || file.name.toLowerCase().endsWith('.html');
    setHtmlFile(isHtml);
    if (isHtml) {
      setImageUrl('');
      setSourceData(await file.text());
      return;
    }
    const nextImageUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextImageUrl;
    setImageUrl(nextImageUrl);
    const reader = new FileReader();
    reader.onload = () => setSourceData(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  }

  function recognizeUrl() {
    const rawUrl = pageUrl.trim();
    if (!rawUrl) {
      setUrlState('error');
      return;
    }
    const candidate = /^https?:\/\//i.test(rawUrl) ? rawUrl : /^(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(rawUrl) ? `http://${rawUrl}` : `https://${rawUrl}`;
    try {
      const parsed = new URL(candidate);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported URL');
      setPageUrl(parsed.toString());
      setRecognizedUrl(parsed.toString());
      setUrlState('ready');
      setActiveVariant(null);
      setResults(false);
    } catch {
      setUrlState('error');
    }
  }

  async function generate() {
    setGenerating(true);
    setResults(false);
    setApiError('');
    try {
      const sourceType = htmlFile ? 'html' : source === 'url' ? 'url' : source === 'template' ? 'template' : sourceData ? 'image' : 'template';
      const response = await fetch('/api/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType,
          source: source === 'url' ? (recognizedUrl || pageUrl) : sourceData,
          selections: { goal, audience, uxPattern, uxPatternName: activeUXPattern.name, uxSource: activeUXPattern.source, uxPrinciples: activeUXPattern.principles, visualDirection, visualDirectionName: activeDirectionName, style, template, typeTone, colorStrategy, corners, motionProfile, directionSettings: activeDirectionSettings, templateCompatibility: activeControls, density, motion, preserve, locks, accent },
        }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) throw new Error('生成服务返回了异常响应，请刷新页面后重试。');
      const data = await response.json() as DesignResult & { error?: string };
      if (!response.ok) {
        const requestId = response.headers.get('x-request-id');
        throw new Error(`${data.error || '生成失败，请稍后重试。'}${requestId ? `（请求编号：${requestId}）` : ''}`);
      }
      setDesignResult(data);
      setActiveVariant(data.variants.find((variant) => variant.id === 'balanced') || data.variants[0]);
      setOutputMode('preview');
      setPreviewDevice('desktop');
      setPreviewZoom(100);
      setDeliveryScaleMode('fit');
      setHeadingScale(100);
      setResults(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setApiError(message === 'Failed to fetch' || message.includes('fetch')
        ? '无法连接本地生成服务，请刷新页面后重试。若仍未恢复，请确认 localhost:3001 正在运行。'
        : message || '生成失败，请稍后重试。');
    } finally {
      setGenerating(false);
    }
  }

  function applyPreset(preset: string[]) {
    setVisualDirection(preset[0]);
    setActiveVariant(null); setResults(false);
    setStyle(preset[3]); setTemplate(preset[4]); setTypeTone(preset[5]); setColorStrategy(preset[6]);
    setCorners(preset[7] === 'sharp' ? 'sharp' : preset[7] === 'pill' ? 'pill' : 'round'); setDepth(preset[8]); setImageStyle(preset[9]); setMotionProfile(preset[10]);
  }

  function updateCompatibleSetting(setter: (next: string) => void, next: string) {
    setter(next);
    setActiveVariant(null);
    setResults(false);
  }

  function updateLiveAnswer(setter: (next: string) => void, next: string) {
    setter(next);
    setActiveVariant(null);
    setResults(false);
  }

  function updateLiveNumber(setter: (next: number) => void, next: number) {
    setter(next);
    setActiveVariant(null);
    setResults(false);
  }

  function updateDirectionSetting(key: string, next: string) {
    setDirectionSettings((current) => ({ ...current, [`${visualDirection}:${key}`]: next }));
    setActiveVariant(null);
    setResults(false);
  }

  async function copyHtml() {
    if (!activeVariant) return;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(deliveryHtml);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = deliveryHtml;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    setCopyState('copied');
    window.setTimeout(() => setCopyState('idle'), 1600);
  }

  function downloadHtml() {
    if (!activeVariant) return;
    const file = new Blob([deliveryHtml], { type: 'text/html;charset=utf-8' });
    const href = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = href;
    link.download = `compose-${activeVariant.id}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 0);
  }

  return (
    <main className="app" style={{ '--accent': accent, '--accent-contrast': accentContrast(accent) } as CSSProperties}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Compose 首页"><span className="brand-mark"><i/><i/><i/></span><b>Compose</b></a>
        <div className="project-state"><span/>未命名界面 <small>自动保存</small></div>
        <div className="top-actions"><button type="button">邀请成员</button><button className="avatar" type="button" aria-label="账户菜单">YL</button></div>
      </header>

      <div className="layout" id="top">
        <aside className="rail" aria-label="设计流程">
          <div className="rail-title"><span>设计流程</span><b>{step}/4</b></div>
          <nav>
            {steps.map(([title, note], index) => {
              const number = index + 1;
              return <button key={title} type="button" className={`${step === number ? 'active' : ''} ${step > number ? 'done' : ''}`} onClick={() => setStep(number)} aria-current={step === number ? 'step' : undefined}><i>{step > number ? '✓' : `0${number}`}</i><span><b>{title}</b><small>{note}</small></span></button>;
            })}
          </nav>
          <div className="tip"><i>?</i><span><b>不懂设计也没关系</b><small>每个选择都会立即显示效果，并且可以随时返回修改。</small></span></div>
        </aside>

        <section className={`controls step-${step}`} aria-live="polite">
          <div className="heading">
            <span>STEP 0{step} · GUIDED DESIGN</span>
            {step === 1 && <><h1>提供你的<br/>分析材料。</h1><p>截图、HTML 和网址只用于理解原界面；生成前展示的是视觉引擎演示，不是假装完成的实时改造。</p></>}
            {step === 2 && <><h1>这次想改什么，<br/>又要留下什么？</h1><p>目标决定优化重点；保留项会成为方案中的硬约束。</p></>}
            {step === 3 && <><h1>选择专业的<br/>视觉方向。</h1><p>先选择完整 UI 方向，再由 AI 根据原界面重构布局、组件和视觉系统。</p></>}
            {step === 4 && <><h1>确认你的<br/>设计方案。</h1><p>先确认改造策略和锁定项，再让系统按照这份方案修改原界面。</p></>}
          </div>

          <div className="control-body">
            {step === 1 && <div className="source-flow">
              <div className="source-tabs" role="tablist" aria-label="起点选择">
                <button type="button" role="tab" aria-selected={source === 'upload'} onClick={() => { setSource('upload'); setActiveVariant(null); }}><i className="upload-icon"/>上传界面<em>推荐</em></button>
                <button type="button" role="tab" aria-selected={source === 'url'} onClick={() => { setSource('url'); setActiveVariant(null); }}><i className="link-icon"/>输入网址</button>
                <button type="button" role="tab" aria-selected={source === 'template'} onClick={() => { setSource('template'); setActiveVariant(null); }}><i className="grid-icon"/>从模板开始</button>
              </div>
              {source === 'upload' && <div className={`dropzone ${fileName ? 'has-file' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFile(event.dataTransfer.files[0]); }} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') inputRef.current?.click(); }}>
                <input ref={inputRef} type="file" accept="image/*,.html,text/html" onChange={(event) => handleFile(event.target.files?.[0])}/>
                {imageUrl ? <div className="upload-preview" style={{ backgroundImage: `url(${imageUrl})` }}><span>截图已加入分析材料</span></div> : htmlFile ? <div className="html-preview"><span>&lt;/&gt;</span><b>HTML 已加入分析材料</b><small>生成时分析页面结构、样式与组件</small></div> : <><span className="drop-glyph"><i/><i/></span><b>拖入你的界面材料</b><p>支持 JPG、PNG、WebP 或单页 HTML</p><button type="button">选择材料文件</button></>}
                {fileName && <small className="file-name">{fileName} · 点击可替换</small>}
              </div>}
              {source === 'url' && <div className={`url-box state-${urlState}`}><label htmlFor="page-url">现有页面参考地址</label><div><input id="page-url" type="url" value={pageUrl} onChange={(event) => { setPageUrl(event.target.value); setUrlState('idle'); }} onKeyDown={(event) => { if (event.key === 'Enter') recognizeUrl(); }} placeholder="https://your-product.com/dashboard" aria-invalid={urlState === 'error'}/><button type="button" onClick={recognizeUrl}>{urlState === 'ready' ? '更新地址' : '加入材料'}</button></div><p>{urlState === 'error' ? '请输入有效的网址，例如 https://example.com。' : urlState === 'ready' ? '网址已加入分析上下文；精确还原建议同时上传截图或 HTML。' : '网址用于补充产品上下文，不会在右侧模拟实时加载。'}</p></div>}
              {source === 'template' && <div className="template-list">{templates.map(([id, name]) => <button key={id} type="button" className={template === id ? 'selected' : ''} onClick={() => setTemplate(id)} aria-pressed={template === id}><span className={`template-pic ${id}`}><i/><i/><i/><i/></span><b>{name}</b></button>)}</div>}
              <div className="privacy-note"><i>✓</i><span><b>材料与交付</b><small>材料只在生成时发送给 OpenAI 分析；最终只交付包含完整代码的 HTML，不生成图片结果。</small></span></div>
            </div>}

            {step === 2 && <div className="question-stack"><section><div className="section-label"><b>主要改造目标</b><span>实时影响文案、层级与行动焦点</span></div><div className="option-grid">{goals.map(([id, title, note], index) => <button key={id} type="button" className={goal === id ? 'selected' : ''} onClick={() => updateLiveAnswer(setGoal, id)} aria-pressed={goal === id}><i>{String(index + 1).padStart(2,'0')}</i><span><b>{title}</b><small>{note}</small></span><em/></button>)}</div></section><section><div className="section-label"><b>哪些必须保留？</b><span>可多选</span></div><div className="chip-row">{preserveOptions.map(([id,label]) => <button key={id} type="button" className={preserve.includes(id) ? 'selected' : ''} onClick={() => togglePreserve(id)} aria-pressed={preserve.includes(id)}><i>{preserve.includes(id) ? '✓' : '+'}</i>{label}</button>)}</div></section><section><div className="section-label"><b>主要使用者</b><span>实时影响密度与协作信息</span></div><div className="segmented">{[['general','大众用户'],['professional','专业用户'],['team','内部团队']].map(([id,label]) => <button key={id} type="button" className={audience === id ? 'selected' : ''} onClick={() => updateLiveAnswer(setAudience, id)} aria-pressed={audience === id}>{label}</button>)}</div></section></div>}

            {step === 3 && <div className="direction-flow">
              <div className="direction-tabs" role="tablist" aria-label="方向配置方式">{[['visual',`视觉库 · ${visualDirections.length}`],['ux',`UX 方案 · ${uxPatterns.length}`],['type',`字体 · ${compatibleTypeOptions.length}`],['advanced',`模板特征 · ${activeFields.length + 1}`]].map(([id,label]) => <button key={id} type="button" role="tab" aria-selected={directionMode === id} onClick={() => setDirectionMode(id as typeof directionMode)}>{label}</button>)}</div>

              {directionMode === 'ux' && <section className="ux-library"><div className="section-label material-current"><b>任务体验方案</b><span><strong>{activeUXPattern.name}</strong> · 决定流程而不是表面风格</span></div><div className={`ux-source-status ${activeUXPattern.id === 'none' ? 'is-none' : ''}`}><span><i/>{activeUXPattern.id === 'none' ? '不叠加额外体验模式' : '已安全审查并本地转译'}</span><b>{activeUXPattern.source}</b>{activeUXPattern.sourceUrl && <a href={activeUXPattern.sourceUrl} target="_blank" rel="noreferrer">GitHub 来源 ↗</a>}</div><div className="ux-pattern-grid">{uxPatterns.map((pattern) => <button key={pattern.id} type="button" className={`ux-pattern-card ux-card-${pattern.id} ${uxPattern === pattern.id ? 'selected' : ''}`} onClick={() => updateCompatibleSetting(setUxPattern, pattern.id)} aria-pressed={uxPattern === pattern.id}><span className="ux-card-visual"><i/><i/><i/><em/></span><span className="ux-card-copy"><b>{pattern.name}</b><small>{pattern.summary}</small><em>{pattern.id === 'none' ? '保留结构 · 保留交互' : pattern.principles.slice(0,2).join(' · ')}</em></span></button>)}</div></section>}

              {directionMode === 'visual' && <section className="visual-library"><div className="section-label material-current"><b>专业 UI 视觉方向</b><span><strong>{visualDirections.find(([id]) => id === visualDirection)?.[1]}</strong> · 点击后应用完整设计配方</span></div><div className="engine-status"><i/><span><b>{activeRecipe.engine}</b><small>{activeRecipe.sourceUrl.includes('github.com') ? `已审查并本地接入 · ${activeRecipe.source}` : `外部视觉规范 · ${activeRecipe.source}`}</small></span>{activeRecipe.sourceUrl && <a href={activeRecipe.sourceUrl} target="_blank" rel="noreferrer" aria-label={`查看 ${activeRecipe.source} 参考来源`}>{activeRecipe.sourceUrl.includes('github.com') ? 'GitHub ↗' : '规范 ↗'}</a>}</div><div className="filter-row">{['全部','产品工具','内容品牌','消费体验','数据系统','实验未来'].map((group) => <button key={group} type="button" className={visualGroup === group ? 'selected' : ''} onClick={() => setVisualGroup(group)} aria-pressed={visualGroup === group}>{group}</button>)}</div><div className="preset-grid visual-library-grid">{visualDirections.filter((direction) => visualGroup === '全部' || direction[11] === visualGroup).map((direction) => { const recipe = getVisualStyleRecipe(direction[0]); return <button key={direction[0]} type="button" className={`${visualDirection === direction[0] ? 'selected' : ''} preset-${direction[0]}`} onClick={() => applyPreset(direction)} aria-pressed={visualDirection === direction[0]}><span className="preset-visual"><i/><i/><i/></span><b>{direction[1]}</b><small>{direction[2]}</small><em>{recipe.sourceUrl.includes('github.com') ? `开源实现 · ${recipe.source.split('/').pop()}` : `外部规范 · ${recipe.source}`}</em></button>; })}</div></section>}

              {directionMode === 'type' && <section className="type-panel"><div className="type-intro contextual"><span>TYPOGRAPHY · {activeDirectionName.toUpperCase()}</span><b>{activeDirectionName}的兼容字体</b><p>{activeControls.note}。这里只保留不会破坏该视觉模板的 {compatibleTypeOptions.length} 个字体方向。</p></div><div className="type-library contextual-grid">{compatibleTypeOptions.map(([id,title,note], index) => <button key={id} type="button" className={`type-card ${id} ${typeTone === id ? 'selected' : ''}`} onClick={() => updateCompatibleSetting(setTypeTone, id)} aria-pressed={typeTone === id}><span className="type-sample"><b>Aa</b><i>界面设计</i></span><strong>{title}</strong><small>{note}</small><em>{typeTone === id ? '当前方向' : index === 0 ? '模板推荐' : '兼容选择'}</em></button>)}</div></section>}

              {directionMode === 'advanced' && <div className="advanced-panel"><div className="advanced-intro contextual"><span>TEMPLATE CONTROLS · {activeDirectionName.toUpperCase()}</span><b>{activeDirectionName}的专属控制</b><p>{activeControls.note}。字段来自当前模板本身，不再给所有页面套用相同的构图和动效选项。</p></div>
                {activeFields.map((field, index) => { const value = activeDirectionSettings[field.key]; return <section key={field.key}><header className="advanced-heading"><i>{String(index + 1).padStart(2,'0')}</i><span><b>{field.label}</b><small>{field.note}</small></span><em>{field.options.find(([id]) => id === value)?.[1]}</em></header><div className="choice-cloud compatible-choices">{field.options.map(([id,name]) => <button key={id} type="button" className={value === id ? 'selected' : ''} onClick={() => updateDirectionSetting(field.key, id)} aria-pressed={value === id}><i/>{name}<small>{id === field.defaultValue ? '推荐' : '可选'}</small></button>)}</div></section>; })}
                <section><header className="advanced-heading"><i>{String(activeFields.length + 1).padStart(2,'0')}</i><span><b>边角语言</b><small>所有模板统一只保留三种最容易理解的几何</small></span><em>{compatibleCorners.find(([id]) => id === corners)?.[1]}</em></header><div className="choice-cloud compatible-choices">{compatibleCorners.map(([id,name]) => <button key={id} type="button" className={corners === id ? 'selected' : ''} onClick={() => updateCompatibleSetting(setCorners, id)} aria-pressed={corners === id}><i/>{name}</button>)}</div></section>
              </div>}
            </div>}

            {step === 4 && <div className="tune-flow">
              <div className="plan-card"><header><span>DESIGN PLAN · UX + VISUAL · 7 SKILLS</span><b>你的界面改造方案</b></header><dl><div><dt>改造目标</dt><dd>{goals.find(([id]) => id === goal)?.[1]}</dd></div><div><dt>主要使用者</dt><dd>{audience === 'general' ? '大众用户' : audience === 'professional' ? '专业用户' : '内部团队'}</dd></div><div><dt>UX 方案</dt><dd>{activeUXPattern.name}</dd></div><div><dt>视觉方向</dt><dd>{visualDirections.find(([id]) => id === visualDirection)?.[1]}</dd></div><div><dt>字体性格</dt><dd>{typeOptions.find(([id]) => id === typeTone)?.[1]}</dd></div>{activeFields.map((field) => <div key={field.key}><dt>{field.label}</dt><dd>{field.options.find(([id]) => id === activeDirectionSettings[field.key])?.[1]}</dd></div>)}<div><dt>边角语言</dt><dd>{cornerOptions.find(([id]) => id === corners)?.[1]}</dd></div><div><dt>必须保留</dt><dd>{preserve.length} 项已锁定</dd></div></dl><p>UX 方案决定任务路径、状态反馈和异常处理；视觉模板决定呈现语言。两者都会进入最终 HTML 生成。</p></div>
              <div className="setting color-setting"><div><b>强调色</b><button type="button" className={locks.includes('color') ? 'locked' : ''} onClick={() => toggleLock('color')}>{locks.includes('color') ? '生成时保持' : '允许 AI 调整'}</button></div><section className="swatches" aria-label="强调色">{colors.map((color) => <button key={color} type="button" style={{background: color}} className={accent === color ? 'active' : ''} onClick={() => updateCompatibleSetting(setAccent, color)} aria-label={`选择颜色 ${color}`}/>)}<label className="custom-color"><input type="color" value={accent} onChange={(event) => updateCompatibleSetting(setAccent, event.target.value)} aria-label="自定义强调色"/><span>自定义</span><b>{accent.toUpperCase()}</b></label></section><small className="setting-note">只改变主要按钮、选中态、链接与状态点，不改页面底色。</small></div>
              <div className="setting"><div><b>信息密度</b><span>{density < 40 ? '宽松' : density > 67 ? '紧凑' : '平衡'}</span></div><input aria-label="信息密度" type="range" min="20" max="85" value={density} onChange={(event) => updateLiveNumber(setDensity, Number(event.target.value))}/><small className="setting-note">主要调整卡片高度、卡片间距、内边距与正文行距。</small></div>
              <div className="setting"><div><b>动效强度</b><span>{motion < 35 ? '舒缓' : motion > 68 ? '敏捷' : '适中'}</span></div><input aria-label="动效强度" type="range" min="10" max="90" value={motion} onChange={(event) => updateLiveNumber(setMotion, Number(event.target.value))}/><small className="setting-note">只调整进入、切换与反馈动效的持续时间；运动距离保持不变。</small></div>
              <fieldset className="permission-grid"><legend>允许 AI 修改</legend><label><input type="checkbox" checked={!locks.includes('layout')} onChange={() => toggleChangePermission('layout')}/><i aria-hidden="true">{!locks.includes('layout') ? '✓' : ''}</i><span><b>页面结构（重新编排）</b><small>{!locks.includes('layout') ? '按所选模板重新分组、排序与建立层级' : '保留原有模块顺序与层级'}</small></span></label><label><input type="checkbox" checked={!locks.includes('content')} onChange={() => toggleChangePermission('content')}/><i aria-hidden="true">{!locks.includes('content') ? '✓' : ''}</i><span><b>原有内容</b><small>{!locks.includes('content') ? '允许精简与重新表达' : '保持原文和信息不变'}</small></span></label></fieldset>
              <button className="generate" type="button" disabled={generating} onClick={generate}><span>{generating ? '正在按照方案改造界面…' : results ? '重新执行改造方案' : '按此方案改造界面'}</span><i>{generating ? '···' : '↗'}</i></button>
              {apiError && <p className="api-error" role="alert">{apiError}</p>}
            </div>}
          </div>

          <footer className="control-footer"><button type="button" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>上一步</button><span>右侧用于演示视觉引擎，生成后交付真实 HTML</span>{step < 4 && <button className="next" type="button" onClick={() => setStep(step + 1)}>继续 <i>→</i></button>}</footer>
        </section>

        <section className="preview" aria-label="视觉引擎与生成结果">
          <header><div><i/> <b>{activeVariant ? 'HTML 交付结果' : '视觉引擎演示'}</b><small>{activeVariant ? activeVariant.title : `${activeRecipe.engine} · 非原稿预览`}</small></div>{activeVariant ? <nav className="output-tabs" aria-label="HTML 结果查看方式"><button className={outputMode === 'preview' ? 'active' : ''} type="button" onClick={() => setOutputMode('preview')}>效果</button><button className={outputMode === 'code' ? 'active' : ''} type="button" onClick={() => setOutputMode('code')}>代码</button><button type="button" onClick={copyHtml}>{copyState === 'copied' ? '已复制' : '复制'}</button><button type="button" onClick={downloadHtml}>下载</button></nav> : <nav aria-label="演示尺寸"><button className={previewDevice !== 'mobile' ? 'active' : ''} type="button" onClick={() => setPreviewDevice('desktop')} aria-label="桌面端演示">▭</button><button className={previewDevice === 'mobile' ? 'active' : ''} type="button" onClick={() => setPreviewDevice('mobile')} aria-label="移动端演示">▯</button><button className={previewZoom === 85 ? 'active' : ''} type="button" onClick={() => setPreviewZoom(previewZoom === 100 ? 85 : 100)}>{previewZoom}%</button></nav>}</header>
          {activeVariant && outputMode === 'preview' && <div className="delivery-toolbar"><nav aria-label="交付预览设备">{([['desktop','Web'],['mobile','手机'],['compare','对比']] as const).map(([id,label]) => <button key={id} type="button" className={previewDevice === id ? 'active' : ''} onClick={() => setPreviewDevice(id)}>{label}</button>)}</nav><label className="delivery-type-control"><span><b>标题大小</b><output>{headingScale}%</output></span><input aria-label="调整各级标题大小" type="range" min="80" max="125" step="5" value={headingScale} onChange={(event) => setHeadingScale(Number(event.target.value))}/></label><nav aria-label="交付预览缩放">{([['fit','适应窗口'],['actual','100%']] as const).map(([id,label]) => <button key={id} type="button" className={deliveryScaleMode === id ? 'active' : ''} onClick={() => setDeliveryScaleMode(id)}>{label}</button>)}</nav></div>}
          <div className={`preview-shell ${activeVariant && outputMode === 'preview' ? 'delivery-result-shell' : ''}`}><div className={`preview-viewport ${activeVariant ? 'delivery-mode' : `device-${previewDevice} zoom-${previewZoom}`}`}>{activeVariant ? outputMode === 'preview' ? <ResponsiveDeliveryPreview html={deliveryHtml} title={activeVariant.title} device={previewDevice} scaleMode={deliveryScaleMode}/> : <div className="code-delivery"><header><span><b>完整单页 HTML</b><small>{activeVariant.templateId} {isSharedTemplate(activeVariant.templateId) ? '共享模板已编译' : '视觉模板已编译'} · 标题 {headingScale}% · 包含结构、样式、响应式与动效</small></span><em>{deliveryHtml.length.toLocaleString()} 字符</em></header><pre><code>{deliveryHtml}</code></pre></div> : <div className={`ux-live-frame ux-${uxPattern}`}><VisualEnginePreview direction={visualDirection} directionName={activeDirectionName} title={previewTitle} goal={goal} audience={audience} accent={accent} density={density} motion={motion} className={richPreviewClasses}/><UXPreviewOverlay pattern={uxPattern} patternName={activeUXPattern.name}/></div>}</div></div>
          <div className="tokens preview-contract-tokens" aria-label="实时生效的完整配置"><span className="verified">✓ 实时映射</span><span>{sourcePreviewLabel}</span><span>{goals.find(([id]) => id === goal)?.[1]}</span><span>{audienceLabel}</span><span>{activeUXPattern.name}</span><span>{activeDirectionName}</span><span>{typeOptions.find(([id]) => id === typeTone)?.[1]}</span>{activeFields.map((field) => <span key={field.key}>{field.label}：{field.options.find(([id]) => id === activeDirectionSettings[field.key])?.[1]}</span>)}<span>{cornerOptions.find(([id]) => id === corners)?.[1]}</span><span><i style={{background: accent}}/>{accent.toUpperCase()}</span><span>密度 {density}</span><span>动效 {motion}</span>{preserve.map((id) => <span key={id} className="locked-token">锁定：{preserveOptions.find(([key]) => key === id)?.[1]}</span>)}</div>
          {results && designResult && <div className="results" role="status"><header><span><small>{designResult.direction}</small><b>已生成 3 个可运行 HTML 版本</b></span><button type="button" onClick={() => setResults(false)}>×</button></header><div>{designResult.variants.map((variant) => <button key={variant.id} type="button" className={`${activeVariant?.id === variant.id ? 'recommended' : ''}`} onClick={() => { setActiveVariant(variant); setOutputMode('preview'); }}><span className={`result-pic ${variant.id === 'balanced' ? 'brand' : variant.id === 'bold' ? 'explore' : 'safe'}`}><i/><i/><i/></span><b>{variant.title}</b><small>{variant.summary}</small><mark>✓ {variant.templateVerified ? `${variant.templateId} ${isSharedTemplate(variant.templateId) ? '共享模板' : '视觉模板'}` : '模板'} · {Object.keys(variant.coverage).length}/11 约束</mark>{variant.id === 'balanced' && <em>推荐</em>}</button>)}</div></div>}
        </section>
      </div>
    </main>
  );
}
