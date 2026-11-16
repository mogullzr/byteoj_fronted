export type ExamTopic = {
  id: string
  title: string
  code: string
  keyword: string
  description: string
  accent: string
  wash: string
  mathNumber?: number
}

export const examTopics: ExamTopic[] = [
  { id: 'math-1', title: '数学一', code: '301', keyword: '数学卷1', mathNumber: 1, description: '高等数学 · 线性代数 · 概率论与数理统计', accent: '#28584e', wash: '#edf4ef' },
  { id: 'math-2', title: '数学二', code: '302', keyword: '数学卷2', mathNumber: 2, description: '高等数学 · 线性代数', accent: '#42627b', wash: '#eef3f7' },
  { id: 'math-3', title: '数学三', code: '303', keyword: '数学卷3', mathNumber: 3, description: '高等数学 · 线性代数 · 概率论与数理统计', accent: '#78603b', wash: '#f7f2e9' },
  { id: 'cs-408', title: '408 考研', code: '408', keyword: '408', description: '数据结构 · 组成原理 · 操作系统 · 计算机网络', accent: '#574d79', wash: '#f2eff7' },
  { id: 'politics', title: '政治考研', code: '101', keyword: '政治', description: '梳理知识脉络，在一套套试卷中巩固考点', accent: '#8a5146', wash: '#f8efeb' },
]

export const matchesExamTopic = (name: string, topic: ExamTopic) => {
  const normalized = name.normalize('NFKC').replace(/\s/g, '')
  if (!topic.mathNumber) return normalized.includes(topic.keyword)
  const subject = normalized.match(/数学[（(【\[]?(?:卷[（(【\[]?)?(III|II|I|[一二三123])(?![I\d])/i)?.[1]?.toUpperCase()
  const numbers: Record<string, number> = { '一': 1, '1': 1, I: 1, '二': 2, '2': 2, II: 2, '三': 3, '3': 3, III: 3 }
  return Boolean(subject && numbers[subject] === topic.mathNumber)
}

export const getExamYear = (name?: string): number | null => {
  const year = name?.match(/(?:19|20)\d{2}/)?.[0]
  return year ? Number(year) : null
}
