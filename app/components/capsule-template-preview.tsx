'use client';

import { useMemo } from 'react';
import { applyCapsuleLayoutGuard, compileCapsuleTemplateHtml, preserveCapsuleStage } from '../../lib/capsule-template-compiler';
import { applyResponsivePreviewSafety } from '../../lib/responsive-preview-safety';
import { defaultPageIR, type TemplateSelections, type TemplateVariant } from '../../lib/shared-template-compiler';
import { FixedTemplateCanvas } from './fixed-template-canvas';

type Props = { direction: string; title: string; selections: TemplateSelections; device: 'desktop' | 'mobile'; variant?: TemplateVariant };

function contrastColor(hex: string) {
  const channels = hex.slice(1).match(/.{2}/g)?.map((value) => parseInt(value, 16) / 255) || [0, 0, 0];
  const luminance = channels.map((value) => value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return .2126 * luminance[0] + .7152 * luminance[1] + .0722 * luminance[2] > .48 ? '#17151a' : '#ffffff';
}

function applyPreviewSelectionContract(html: string, selections: TemplateSelections) {
  const accent = typeof selections.accent === 'string' && /^#[0-9a-f]{6}$/i.test(selections.accent) ? selections.accent : '#7657ff';
  const density = Math.max(20, Math.min(85, Number(selections.density) || 52));
  const motion = Math.max(10, Math.min(90, Number(selections.motion) || 58));
  const radius = selections.corners === 'sharp' ? '0px' : selections.corners === 'pill' ? '999px' : '18px';
  const cardRadius = selections.corners === 'sharp' ? '0px' : selections.corners === 'pill' ? '28px' : '18px';
  const style = `<style id="compose-preview-selection">:root{--compose-accent:${accent};--compose-accent-contrast:${contrastColor(accent)};--compose-radius:${radius};--compose-card-radius:${cardRadius};--compose-card-min:${Math.round(149-density*.72)}px;--compose-card-pad:${Math.round(20-density*.12)}px;--compose-leading:${(1.82-density*.006).toFixed(2)};--compose-duration:${Math.round(920-motion*6)}ms}:where(article,[class*="card"],[class*="panel"]){min-height:var(--compose-card-min);padding-block:var(--compose-card-pad);border-radius:var(--compose-card-radius)}:where(p,li,small,td,dd){line-height:var(--compose-leading)}</style>`;
  return html.replace(/<\/head>/i, `${style}</head>`);
}

export function CapsuleTemplatePreview({ direction, title, selections, device, variant = 'balanced' }: Props) {
  const html = useMemo(() => applyCapsuleLayoutGuard(preserveCapsuleStage(applyResponsivePreviewSafety(applyPreviewSelectionContract(
    compileCapsuleTemplateHtml(direction, { ...defaultPageIR, title }, selections, variant), selections,
  )))), [direction, title, selections, variant]);
  return <FixedTemplateCanvas html={html} title={`${direction} 模板同源实时预览`} device={device}/>;
}
