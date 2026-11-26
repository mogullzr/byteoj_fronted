import type { GradingCorrection } from './gradingDetail'

type Rubric = { id?: string; max_score?: number; awarded_score?: number; modification?: string }
type GradingFeedback = { corrections?: GradingCorrection[]; needs_manual_review?: boolean }

/** Add only the concrete modification belonging to this existing scoring item. */
export function getRubricModification(result: GradingFeedback, rubric: Rubric): string {
  if (typeof rubric.modification === 'string' && rubric.modification.trim()) return rubric.modification
  // Compatibility with Deep records generated before modification was stored on each item.
  const corrections = (result.corrections || []).filter(item =>
    item && rubric.id && item.related_rubric_item_id === rubric.id && item.replacement?.trim())
  if (corrections.length) {
    return corrections.map(item => {
      const text = [item.replacement, item.explanation, item.verification].filter(Boolean).join(' ')
      return corrections.length > 1 && item.location ? `（${item.location}）${text}` : text
    }).join('\n\n')
  }
  if (!result.needs_manual_review && typeof rubric.max_score === 'number'
    && typeof rubric.awarded_score === 'number' && rubric.max_score === rubric.awarded_score) {
    return '无需修改。'
  }
  return '本项未返回具体改法。'
}
