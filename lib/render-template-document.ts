import { applyCapsuleLayoutGuard, compileCapsuleTemplateHtml, preserveCapsuleStage } from './capsule-template-compiler';
import { applyResponsivePreviewSafety, applyResponsiveTitleSafety } from './responsive-preview-safety';
import { applySelectionContract } from './selection-contract';
import { compileTemplateHtml, isSharedTemplate, type PageIR, type TemplateSelections, type TemplateVariant } from './shared-template-compiler';
import { applyUxPatternContract } from './ux-pattern-contract';
import { applyTemplateInteractionContract } from './template-interaction-contract';
import { applyNonNavigatingInteractionContract } from './non-navigating-interaction-contract';

export type RenderTemplateSelections = TemplateSelections & Record<string, unknown>;

/**
 * The single rendering path used by both the live preview and final delivery.
 * Keeping the full pipeline here prevents the preview from drifting away from
 * the HTML that users eventually download.
 */
export function renderTemplateDocument(
  templateId: unknown,
  page: Partial<PageIR>,
  selections: RenderTemplateSelections = {},
  variant: TemplateVariant = 'balanced',
) {
  if (isSharedTemplate(templateId)) {
    return applyNonNavigatingInteractionContract(applyResponsiveTitleSafety(applyTemplateInteractionContract(applyUxPatternContract(compileTemplateHtml(templateId, page, selections, variant), selections), templateId, selections)));
  }

  return applyNonNavigatingInteractionContract(applyResponsiveTitleSafety(applyTemplateInteractionContract(applyUxPatternContract(applyCapsuleLayoutGuard(
    preserveCapsuleStage(
      applyResponsivePreviewSafety(
        applySelectionContract(
          compileCapsuleTemplateHtml(String(templateId || 'minimal'), page as PageIR, selections, variant),
          selections,
        ),
      ),
    ),
  ), selections), templateId, selections)));
}
