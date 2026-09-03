'use client';

import { useMemo } from 'react';
import { defaultPageIR, type TemplateSelections, type TemplateVariant } from '../../lib/shared-template-compiler';
import { renderTemplateDocument } from '../../lib/render-template-document';
import { FixedTemplateCanvas } from './fixed-template-canvas';

type Props = { direction: string; title: string; selections: TemplateSelections; device: 'desktop' | 'mobile'; variant?: TemplateVariant };

export function CapsuleTemplatePreview({ direction, title, selections, device, variant = 'balanced' }: Props) {
  const html = useMemo(() => renderTemplateDocument(direction, { ...defaultPageIR, title }, selections, variant), [direction, title, selections, variant]);
  return <FixedTemplateCanvas html={html} title={`${direction} 模板同源实时预览`} device={device}/>;
}
