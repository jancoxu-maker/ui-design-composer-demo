'use client';

import { compileTemplateHtml, defaultPageIR, type TemplateSelections, type TemplateVariant } from '../../lib/shared-template-compiler';
import { FixedTemplateCanvas } from './fixed-template-canvas';

type Props = {
  direction: string;
  title: string;
  selections: TemplateSelections;
  device: 'desktop' | 'mobile';
  variant?: TemplateVariant;
};

export function SharedTemplatePreview({ direction, title, selections, device, variant = 'balanced' }: Props) {
  const html = compileTemplateHtml(direction, { ...defaultPageIR, title }, selections, variant);
  return <FixedTemplateCanvas html={html} title={`${direction} 共享模板实时预览`} device={device}/>;
}
