import { onMounted, ref } from 'vue'
import { OpenAPI } from '../../../generated/core/OpenAPI'
import { request } from '../../../generated/core/request'

type AiFeature = 'EXAM_GRADING' | 'ENGLISH_GRADING' | 'EXAM_REVIEW' | 'CHAT' | 'PROBLEM_CHAT' | 'STUDY_PLAN'
type AiSource = { id: string; label: string; vision: boolean }

export const gradingFallback = [
  { id: 'DEEPSEEK', label: 'DeepSeek 判卷线路', vision: true },
  { id: 'GPT_5_4', label: 'GPT 线路', vision: true },
]

export function useAiSources(feature: AiFeature, fallback: AiSource[] = []) {
  const sources = ref(fallback)
  onMounted(async () => {
    try {
      const response = await request<{ code: number; data?: AiSource[] }>(OpenAPI, {
        method: 'GET', url: '/api/ai/sources/options', query: { feature },
      })
      if (response.code === 0 && response.data) sources.value = response.data
    } catch {
      // The default and any existing choices remain available.
    }
  })
  return sources
}
