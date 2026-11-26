export type GradingDetail = 'SUPREME' | 'STANDARD' | 'BASIC' | 'DEEP'

export type GradingCorrection = {
  location?: string
  original?: string
  missing_step?: boolean
  issue?: string
  replacement?: string
  explanation?: string
  verification?: string
  related_rubric_item_id?: string
}

export const gradingDetails: { value: GradingDetail; label: string; description: string }[] = [
  { value: 'DEEP', label: '深度批改版', description: '保留原版完整讲评，只在每条评分细则下补充具体修改方法。' },
  { value: 'SUPREME', label: '至尊版', description: '保留当前完整讲评、评分依据和详细分析。' },
  { value: 'STANDARD', label: '标准版', description: '仅保留关键评分项、主要失分原因和简短建议，省略完整解析与逐句讲评。' },
  { value: 'BASIC', label: '极简版', description: '主要返回分数和一句简短结论，不生成详细解析、逐句修改或复习建议。' },
]

export function gradingDetailLabel(value?: string): string {
  return gradingDetails.find(item => item.value === value)?.label || '至尊版'
}

export function isDetailedGrading(value?: string): boolean {
  return !value || value === 'SUPREME' || value === 'DEEP'
}
