<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-[1600px]">
      <div class="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div class="min-w-0 flex-1 space-y-3">
          <div class="inline-flex w-fit items-center rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            答题卡详情
          </div>
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div class="text-xs font-medium text-slate-500">总览</div>
              <Markdown :generate-data="'**答题卡概览**'" class="mt-1" />
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div class="text-xs font-medium text-slate-500">题量</div>
              <Markdown :generate-data="String(questions.length) + ' 题'" class="mt-1 font-semibold text-slate-800" />
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div class="text-xs font-medium text-slate-500">已作答</div>
              <Markdown :generate-data="String(answeredCount) + ' 题'" class="mt-1 font-semibold text-slate-800" />
            </div>
            <div class="rounded-xl border border-slate-900 bg-slate-900 px-4 py-4 text-white shadow-sm">
              <div class="text-xs font-medium text-slate-300">得分 / 考试总分</div>
              <Markdown
                  :generate-data="String(totalAwardedScore) + ' / ' + String(totalExamScore) + ' 分'"
                  class="mt-1 font-semibold text-white"
              />
            </div>
          </div>
        </div>
        <button
            class="w-full rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:w-auto"
            @click="router.back()"
        >
          返回
        </button>
      </div>

      <div v-if="loading" class="py-24 text-center">
        <div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600"></div>
        <Markdown :generate-data="'加载答题卡中...'" />
      </div>

      <div v-else-if="questions.length === 0" class="rounded-2xl border border-slate-200 bg-white py-20 text-center">
        <Markdown :generate-data="'**未找到试题信息**'" />
      </div>

      <div v-else class="space-y-8">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="text-sm font-semibold text-slate-900">筛选答题卡</div>
              <div class="mt-1 text-xs text-slate-500">
                当前显示 {{ filteredQuestions.length }} / {{ questions.length }} 题
              </div>
            </div>
            <button
                class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                @click="resetFilters"
            >
              重置筛选
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <div class="mb-2 text-xs font-semibold text-slate-500">按题型筛选</div>
              <div class="flex flex-wrap gap-2">
                <button
                    v-for="item in questionTypeFilters"
                    :key="item.value"
                    class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
                    :class="typeFilter === item.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'"
                    @click="typeFilter = item.value"
                >
                  {{ item.label }}
                  <span class="ml-1 text-xs opacity-70">{{ getTypeFilterCount(item.value) }}</span>
                </button>
              </div>
            </div>

            <div>
              <div class="mb-2 text-xs font-semibold text-slate-500">按结果筛选</div>
              <div class="flex flex-wrap gap-2">
                <button
                    v-for="item in resultFilters"
                    :key="item.value"
                    class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
                    :class="resultFilter === item.value ? getActiveResultFilterClass(item.value) : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'"
                    @click="resultFilter = item.value"
                >
                  {{ item.label }}
                  <span class="ml-1 text-xs opacity-70">{{ getResultFilterCount(item.value) }}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section v-if="filteredQuestions.length === 0" class="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
          <Markdown :generate-data="'**当前筛选条件下没有题目**'" />
        </section>

        <section
            v-for="(question, index) in filteredQuestions"
            :key="question.problem_id || index"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div :class="['h-1', accentBarClass(index)]"></div>

          <div class="border-b border-slate-100 px-6 py-6 sm:px-7">
            <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div class="space-y-3 xl:max-w-[calc(100%-380px)]">
                <div class="flex flex-wrap items-center gap-3">
                  <span class="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    第 {{ index + 1 }} 题
                  </span>
                  <span class="rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {{ getQuestionTypeLabel(question) }}
                  </span>
                  <span
                      v-if="getNeedsManualReview(question)"
                      class="rounded-md bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
                  >
                    需要人工复查
                  </span>
                  <span
                      v-if="isQuestionWrong(question)"
                      class="rounded-md bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200"
                  >
                    失分
                  </span>
                  <span
                      v-if="isAlgorithmAccepted(question)"
                      class="rounded-md bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200"
                  >
                    算法通过
                  </span>
                </div>
                <Markdown
                    :generate-data="question.problem_name || '未命名题目'"
                    class="text-2xl font-bold text-slate-900"
                />
              </div>

              <div class="grid min-w-[280px] grid-cols-2 gap-3">
                <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div class="text-xs text-slate-500">题目分值</div>
                  <Markdown
                      :generate-data="String(question.score ?? 0) + ' 分'"
                      class="mt-1 font-semibold text-slate-800"
                  />
                </div>
                <div
                    class="rounded-xl border p-4"
                    :class="getScoreCardClass(question)"
                >
                  <div class="text-xs text-slate-500">实际得分</div>
                  <Markdown
                      :generate-data="String(getSheet(question)?.score ?? 0) + ' 分'"
                      :class="[
                      'mt-1 font-semibold',
                      isQuestionWrong(question) ? 'text-rose-700' : isAlgorithmAccepted(question) ? 'text-emerald-700' : 'text-slate-800'
                    ]"
                  />
                  <div
                      v-if="isAlgorithmAccepted(question)"
                      class="mt-2 inline-flex rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white"
                  >
                    Accepted
                  </div>
                  <div
                      v-if="isQuestionWrong(question)"
                      class="mt-2 inline-flex rounded-md bg-rose-600 px-2 py-0.5 text-xs font-medium text-white"
                  >
                    未满分
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid gap-6 px-6 py-6 sm:px-7 xl:grid-cols-[minmax(0,1.45fr)_360px]">
            <div class="space-y-6">
              <div v-if="question.description" class="rounded-xl border border-slate-200 bg-white p-5">
                <div class="mb-3 border-l-4 border-slate-400 pl-3 text-sm font-semibold text-slate-800">题目描述</div>
                <Markdown :generate-data="question.description" />
              </div>

              <div v-if="getOptions(question).length" class="rounded-xl border border-slate-200 bg-white p-5">
                <div class="mb-3 border-l-4 border-slate-400 pl-3 text-sm font-semibold text-slate-800">选项</div>
                <div class="grid gap-3 md:grid-cols-2">
                  <div
                      v-for="(option, optionIndex) in getOptions(question)"
                      :key="optionIndex"
                      class="rounded-xl border p-3"
                      :class="getChoiceOptionClass(question, getLetter(optionIndex))"
                  >
                    <div class="mb-2 flex items-center justify-between gap-3">
                      <div class="text-xs font-semibold text-slate-500">{{ getLetter(optionIndex) }}</div>
                      <div class="flex flex-wrap justify-end gap-2">
                        <span
                            v-if="isCorrectChoice(question, getLetter(optionIndex))"
                            class="rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white"
                        >
                          正确答案
                        </span>
                        <span
                            v-if="isSelected(question, getLetter(optionIndex))"
                            :class="[
                            'rounded-md px-2 py-0.5 text-xs font-medium text-white',
                            isCorrectChoice(question, getLetter(optionIndex)) ? 'bg-slate-900' : 'bg-rose-600'
                          ]"
                        >
                          {{ isCorrectChoice(question, getLetter(optionIndex)) ? '学生选对' : '学生误选' }}
                        </span>
                      </div>
                    </div>
                    <Markdown :generate-data="option" />
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-slate-200 bg-white p-5">
                <div class="mb-3 border-l-4 border-slate-700 pl-3 text-sm font-semibold text-slate-900">学生作答</div>
                <template v-if="isChoiceQuestion(question)">
                  <div v-if="getSelectedOptionDetails(question).length" class="space-y-3">
                    <div
                        v-for="selected in getSelectedOptionDetails(question)"
                        :key="selected.letter"
                        class="rounded-xl border p-4"
                        :class="isCorrectChoice(question, selected.letter) ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'"
                    >
                      <div
                          class="mb-2 inline-flex rounded-md px-2 py-0.5 text-xs font-medium text-white"
                          :class="isCorrectChoice(question, selected.letter) ? 'bg-emerald-600' : 'bg-rose-600'"
                      >
                        {{ selected.letter }} · {{ isCorrectChoice(question, selected.letter) ? '选对' : '选错' }}
                      </div>
                      <Markdown :generate-data="selected.content" />
                    </div>
                  </div>
                  <Markdown v-else :generate-data="'*未作答*'" />
                </template>
                <template v-else-if="getSheet(question)?.answer">
                  <img
                      v-if="isImageUrl(getSheet(question)?.answer)"
                      :src="getSheet(question)?.answer"
                      alt="学生作答图片"
                      class="max-h-[580px] w-auto max-w-full rounded-xl border border-slate-200 bg-white object-contain"
                  />
                  <div v-else-if="isAlgorithmQuestion(question)" class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div
                        v-if="isAlgorithmAccepted(question)"
                        class="mb-3 inline-flex rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white"
                    >
                      算法通过 · Accepted
                    </div>
                    <Markdown
                        :generate-data="'```\\n' + formatAnswer(getSheet(question)?.answer) + '\\n```'"
                    />
                  </div>
                  <Markdown
                      v-else
                      :generate-data="formatAnswer(getSheet(question)?.answer)"
                      class="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  />
                </template>
                <Markdown v-else :generate-data="'*未作答*'" />
              </div>

              <div
                  v-if="getStandardAnswerMarkdown(question)"
                  class="rounded-xl border bg-white p-5"
                  :class="isQuestionWrong(question) ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'"
              >
                <div
                    class="mb-3 border-l-4 pl-3 text-sm font-semibold"
                    :class="isQuestionWrong(question) ? 'border-emerald-600 text-emerald-800' : 'border-slate-700 text-slate-900'"
                >
                  标准答案
                </div>
                <Markdown
                    :generate-data="getStandardAnswerMarkdown(question)"
                    class="rounded-xl border p-4"
                    :class="isQuestionWrong(question) ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'"
                />
              </div>

              <div v-if="question.analysis" class="rounded-xl border border-slate-200 bg-white p-5">
                <div class="mb-3 border-l-4 border-slate-400 pl-3 text-sm font-semibold text-slate-800">题目解析</div>
                <Markdown :generate-data="question.analysis" />
              </div>
            </div>

            <div class="space-y-6">
              <div class="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div class="mb-3 border-l-4 border-slate-700 pl-3 text-sm font-semibold text-slate-900">判题速览</div>
                <Markdown :generate-data="buildQuickSummaryMarkdown(question)" />
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100 px-6 py-6 sm:px-7">
            <details class="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <summary class="cursor-pointer text-sm font-semibold text-slate-700">展开更多信息</summary>

              <div class="mt-5 space-y-4">
                <div v-if="getStructuredResult(question)" class="space-y-4">
                  <div class="grid gap-4 xl:grid-cols-2">
                    <div class="rounded-xl border border-slate-200 bg-white p-5">
                      <div class="mb-2 text-sm font-semibold text-slate-800">判分总结</div>
                      <Markdown :generate-data="getStructuredResult(question)?.summary || ''" />
                    </div>

                    <div class="rounded-xl border border-slate-200 bg-white p-5">
                      <div class="mb-2 text-sm font-semibold text-slate-800">修改建议</div>
                      <Markdown :generate-data="getStructuredResult(question)?.advice || ''" />
                    </div>
                  </div>

                  <div class="grid gap-4 xl:grid-cols-2">
                    <div class="rounded-xl border border-slate-200 bg-white p-5">
                      <div class="mb-2 text-sm font-semibold text-slate-800">识别作答与可接受答案</div>
                      <Markdown :generate-data="buildAnswerMarkdown(question)" />
                    </div>

                    <div class="rounded-xl border border-slate-200 bg-white p-5">
                      <div class="mb-2 text-sm font-semibold text-slate-800">错误点与评分细则</div>
                      <Markdown :generate-data="buildMistakeRubricMarkdown(question)" />
                    </div>
                  </div>

                </div>

                <details
                    v-if="getSheet(question)?.ai_advise"
                    class="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <summary class="cursor-pointer text-sm font-semibold text-slate-700">查看原始判题信息</summary>
                  <Markdown
                      :generate-data="getSheet(question)?.ai_advise || ''"
                      class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                  />
                </details>
              </div>
            </details>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Markdown from '@/view/Markdown/MarkdownView.vue'
import { useMessageBox } from '@/view/components/alert/useMessageBox'
import { ProblemsControllerService } from '../../../generated/services/ProblemsControllerService'
import type { ProblemExamSheetVo } from '../../../generated/models/ProblemExamSheetVo'
import type { ProblemMath408BankVo } from '../../../generated/models/ProblemMath408BankVo'

type GradingMistake = {
  type?: string
  description?: string
  severity?: string
  related_rubric_item_id?: string
}

type GradingRubric = {
  id?: string
  name?: string
  reason?: string
  evidence?: string
  confidence?: number
  max_score?: number
  awarded_score?: number
}

type StructuredGradingResult = {
  confidence?: number
  mistakes?: GradingMistake[]
  summary?: string
  advice?: string
  question_type?: string
  total_score?: number
  awarded_score?: number
  score_rate?: number
  is_correct?: boolean
  is_partially_correct?: boolean
  needs_manual_review?: boolean
  grading_mode?: string
  accepted_answers?: string[]
  student_normalized_answer?: string
  rubric_used?: GradingRubric[]
}

type QuestionTypeFilter = 'all' | 'single' | 'multiple' | 'fill' | 'short' | 'algorithm'
type ResultFilter = 'all' | 'correct' | 'wrong' | 'unanswered'

const route = useRoute()
const router = useRouter()
const { error } = useMessageBox()

const loading = ref(false)
const questions = ref<ProblemMath408BankVo[]>([])
const sheets = ref<ProblemExamSheetVo[]>([])
const typeFilter = ref<QuestionTypeFilter>('all')
const resultFilter = ref<ResultFilter>('all')

const questionTypeFilters: Array<{ label: string; value: QuestionTypeFilter }> = [
  { label: '全部题型', value: 'all' },
  { label: '单选题', value: 'single' },
  { label: '多选题', value: 'multiple' },
  { label: '填空题', value: 'fill' },
  { label: '简答题', value: 'short' },
  { label: '算法题', value: 'algorithm' },
]

const resultFilters: Array<{ label: string; value: ResultFilter }> = [
  { label: '全部结果', value: 'all' },
  { label: '正确', value: 'correct' },
  { label: '错误', value: 'wrong' },
  { label: '未作答', value: 'unanswered' },
]

const examId = Number(route.query.exam_id)
const recordId = Number(route.query.recordId)

const sheetMap = computed(() => {
  const map = new Map<number, ProblemExamSheetVo>()
  sheets.value.forEach((sheet) => {
    if (sheet.problem_id) {
      map.set(sheet.problem_id, sheet)
    }
  })
  return map
})

const structuredResultMap = computed(() => {
  const map = new Map<number, StructuredGradingResult>()
  sheets.value.forEach((sheet) => {
    if (!sheet.problem_id) return
    const result = parseStructuredResult(sheet.ai_advise)
    if (result) {
      map.set(sheet.problem_id, result)
    }
  })
  return map
})

const answeredCount = computed(() => {
  return questions.value.filter((question) => Boolean(getSheet(question)?.answer)).length
})

const totalAwardedScore = computed(() => {
  return sheets.value.reduce((sum, sheet) => sum + (sheet.score || 0), 0)
})

const totalExamScore = computed(() => {
  return questions.value.reduce((sum, question) => sum + (question.score || 0), 0)
})

const filteredQuestions = computed(() => {
  return questions.value.filter((question) => {
    const typeMatched = typeFilter.value === 'all' || getQuestionTypeKey(question) === typeFilter.value
    if (!typeMatched) return false

    if (resultFilter.value === 'all') return true
    if (resultFilter.value === 'correct') return isQuestionCorrect(question)
    if (resultFilter.value === 'wrong') return isQuestionWrong(question)
    if (resultFilter.value === 'unanswered') return !hasAnswered(question)
    return true
  })
})

const filteredAnsweredCount = computed(() => {
  return filteredQuestions.value.filter((question) => hasAnswered(question)).length
})

const filteredAwardedScore = computed(() => {
  return filteredQuestions.value.reduce((sum, question) => sum + (getSheet(question)?.score || 0), 0)
})

const filteredExamScore = computed(() => {
  return filteredQuestions.value.reduce((sum, question) => sum + (question.score || 0), 0)
})

onMounted(() => {
  if (!examId || !recordId) {
    error('缺少考试ID或答卷ID参数')
    return
  }
  fetchSheet()
})

const fetchSheet = async () => {
  loading.value = true
  try {
    const [questionRes, sheetRes] = await Promise.all([
      ProblemsControllerService.problemExamSearchDetailUsingGet(examId),
      ProblemsControllerService.problemExamSheetUsingGet(recordId),
    ])

    if (questionRes.code === 0 && Array.isArray(questionRes.data)) {
      questions.value = await fillQuestionDetails(questionRes.data)
    } else {
      error(questionRes.message || '获取考试题目失败')
    }

    if (sheetRes.code === 0 && Array.isArray(sheetRes.data)) {
      sheets.value = sheetRes.data
    } else {
      error(sheetRes.message || '获取答题记录失败')
    }
  } catch (err) {
    console.error(err)
    error('获取答题卡失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const getSheet = (question: ProblemMath408BankVo) => {
  if (!question.problem_id) return undefined
  return sheetMap.value.get(question.problem_id)
}

const getStructuredResult = (question: ProblemMath408BankVo) => {
  if (!question.problem_id) return undefined
  return structuredResultMap.value.get(question.problem_id)
}

const fillQuestionDetails = async (questionList: ProblemMath408BankVo[]) => {
  const detailList = await Promise.all(
      questionList.map(async (question) => {
        if (!question.problem_id) return question
        try {
          const res = await ProblemsControllerService.problemSearchByProblemIdUsingGet(question.problem_id)
          if (res.code === 0 && res.data) {
            return {
              ...question,
              ...res.data,
              score: question.score ?? res.data.score,
            }
          }
        } catch (err) {
          console.warn('获取题目标准答案失败', question.problem_id, err)
        }
        return question
      })
  )
  return detailList
}

const getNeedsManualReview = (question: ProblemMath408BankVo) => {
  const sheet = getSheet(question)
  const result = getStructuredResult(question)
  return sheet?.person === true || result?.needs_manual_review === true
}

const hasAnswered = (question: ProblemMath408BankVo) => {
  return Boolean(getSheet(question)?.answer)
}

const getMaxScore = (question: ProblemMath408BankVo) => {
  return question.score || getStructuredResult(question)?.total_score || 0
}

const getQuestionTypeKey = (question: ProblemMath408BankVo): QuestionTypeFilter => {
  if (isAlgorithmQuestion(question)) return 'algorithm'
  if (question.option_type === 1) return 'single'
  if (question.option_type === 2) return 'multiple'
  if (question.option_type === 3) return 'fill'
  return 'short'
}

const resetFilters = () => {
  typeFilter.value = 'all'
  resultFilter.value = 'all'
}

const getTypeFilterCount = (value: QuestionTypeFilter) => {
  return questions.value.filter((question) => value === 'all' || getQuestionTypeKey(question) === value).length
}

const getResultFilterCount = (value: ResultFilter) => {
  return questions.value.filter((question) => {
    if (value === 'all') return true
    if (value === 'correct') return isQuestionCorrect(question)
    if (value === 'wrong') return isQuestionWrong(question)
    if (value === 'unanswered') return !hasAnswered(question)
    return true
  }).length
}

const getActiveResultFilterClass = (value: ResultFilter) => {
  if (value === 'correct') return 'border-emerald-600 bg-emerald-600 text-white'
  if (value === 'wrong') return 'border-rose-600 bg-rose-600 text-white'
  if (value === 'unanswered') return 'border-amber-600 bg-amber-600 text-white'
  return 'border-slate-900 bg-slate-900 text-white'
}

const getQuestionTypeLabel = (question: ProblemMath408BankVo) => {
  if (isAlgorithmQuestion(question)) return '算法题'
  if (question.option_type === 1) return '单选题'
  if (question.option_type === 2) return '多选题'
  if (question.option_type === 3) return '填空题'
  if (question.status === 0) return '简答题'
  return '题目'
}

const getOptions = (question: ProblemMath408BankVo) => {
  if (!question.options) return []
  try {
    const normalized = question.options.replace(/'/g, '"')
    const parsed = JSON.parse(normalized)
    return Array.isArray(parsed) ? parsed.map((option) => String(option)) : []
  } catch {
    return []
  }
}

const getLetter = (index: number) => {
  return String.fromCharCode(65 + index)
}

const formatAnswer = (answer?: string) => {
  if (!answer) return ''
  try {
    const normalized = answer.replace(/'/g, '"')
    const parsed = JSON.parse(normalized)
    if (Array.isArray(parsed)) return parsed.join('、')
  } catch {
    // Keep original answer if it is not JSON-like.
  }
  return answer
}

const isChoiceQuestion = (question: ProblemMath408BankVo) => {
  return question.option_type === 1 || question.option_type === 2
}

const isAlgorithmQuestion = (question: ProblemMath408BankVo) => {
  return question.status === 3 || question.option_type === 4
}

const parseChoiceAnswer = (answer?: string) => {
  if (!answer) return []
  try {
    const normalized = answer.replace(/'/g, '"')
    const parsed = JSON.parse(normalized)
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim().toUpperCase()).filter(Boolean)
    }
    return String(parsed).split(/[、,\s]+/).map((item) => item.trim().toUpperCase()).filter(Boolean)
  } catch {
    return answer.split(/[、,\s\[\]']+/).map((item) => item.trim().toUpperCase()).filter(Boolean)
  }
}

const isSelected = (question: ProblemMath408BankVo, letter: string) => {
  return parseChoiceAnswer(getSheet(question)?.answer).includes(letter)
}

const isCorrectChoice = (question: ProblemMath408BankVo, letter: string) => {
  return parseChoiceAnswer(question.correct_answer).includes(letter)
}

const getChoiceOptionClass = (question: ProblemMath408BankVo, letter: string) => {
  const selected = isSelected(question, letter)
  const correct = isCorrectChoice(question, letter)
  if (selected && correct) return 'border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200'
  if (selected && !correct) return 'border-rose-300 bg-rose-50 ring-1 ring-rose-200'
  if (!selected && correct) return 'border-emerald-300 bg-white ring-1 ring-emerald-100'
  return 'border-slate-200 bg-white'
}

const isQuestionWrong = (question: ProblemMath408BankVo) => {
  const sheet = getSheet(question)
  const maxScore = getMaxScore(question)
  return hasAnswered(question) && (sheet?.score || 0) < maxScore
}

const isQuestionCorrect = (question: ProblemMath408BankVo) => {
  const sheet = getSheet(question)
  const maxScore = getMaxScore(question)
  return hasAnswered(question) && maxScore > 0 && (sheet?.score || 0) >= maxScore
}

const isAlgorithmAccepted = (question: ProblemMath408BankVo) => {
  if (!isAlgorithmQuestion(question)) return false
  const sheet = getSheet(question)
  if (!sheet?.answer) return false
  if ((sheet.score || 0) >= (question.score || 0) && (question.score || 0) > 0) return true
  return (sheet.ai_advise || '').includes('【判题状态】Accepted')
}

const getScoreCardClass = (question: ProblemMath408BankVo) => {
  if (isAlgorithmAccepted(question)) return 'border-emerald-300 bg-emerald-50 ring-1 ring-emerald-100'
  if (isQuestionWrong(question)) return 'border-rose-300 bg-rose-50 ring-1 ring-rose-100'
  return 'border-slate-200 bg-slate-50'
}

const getSelectedOptionDetails = (question: ProblemMath408BankVo) => {
  const options = getOptions(question)
  return parseChoiceAnswer(getSheet(question)?.answer).map((letter) => {
    const index = letter.toUpperCase().charCodeAt(0) - 65
    return {
      letter,
      content: options[index] || `未找到 ${letter} 选项内容`,
    }
  })
}

const getStandardAnswerMarkdown = (question: ProblemMath408BankVo) => {
  const answer = question.correct_answer
  if (!answer) return ''

  if (isChoiceQuestion(question)) {
    const options = getOptions(question)
    const answers = parseChoiceAnswer(answer)
    if (!answers.length) return answer
    return answers.map((letter) => {
      const normalizedLetter = letter.toUpperCase()
      const index = normalizedLetter.charCodeAt(0) - 65
      const content = options[index]
      return content ? `**${normalizedLetter}.** ${content}` : `**${normalizedLetter}**`
    }).join('\n\n')
  }

  return answer
}

const isImageUrl = (answer?: string) => {
  if (!answer) return false
  return /^https?:\/\/.+\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i.test(answer)
}

const parseStructuredResult = (aiAdvise?: string): StructuredGradingResult | undefined => {
  if (!aiAdvise) return undefined
  const marker = '【结构化结果】'
  const markerIndex = aiAdvise.indexOf(marker)
  if (markerIndex < 0) return undefined

  const jsonPart = aiAdvise.slice(markerIndex + marker.length).trim()
  const firstBrace = jsonPart.indexOf('{')
  const lastBrace = jsonPart.lastIndexOf('}')
  if (firstBrace < 0 || lastBrace <= firstBrace) return undefined

  try {
    return JSON.parse(jsonPart.slice(firstBrace, lastBrace + 1)) as StructuredGradingResult
  } catch (err) {
    console.warn('结构化判题结果解析失败', err)
    return undefined
  }
}

const formatPercent = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-'
  return `${Math.round(value * 100)}%`
}

const formatScore = (result?: StructuredGradingResult) => {
  if (!result) return '-'
  return `${result.awarded_score ?? '-'} / ${result.total_score ?? '-'}`
}

const accentBarClass = (index: number) => {
  const classes = ['bg-slate-700']
  return classes[index % classes.length]
}

const quickSummaryData = (question: ProblemMath408BankVo) => {
  const result = getStructuredResult(question)
  if (!result) return getSheet(question)?.ai_advise || ''
  return [
    '**判题速览**',
    `- 置信度：${formatPercent(result.confidence)}`,
    `- 得分率：${formatPercent(result.score_rate)}`,
    `- 判题模式：${result.grading_mode || '-'}`,
    `- 人工复查：${getNeedsManualReview(question) ? '需要' : '不需要'}`,
  ].join('\n')
}

const buildQuickSummaryMarkdown = (question: ProblemMath408BankVo) => {
  const result = getStructuredResult(question)
  if (!result) return getSheet(question)?.ai_advise || ''
  return quickSummaryData(question)
}

const buildAnswerMarkdown = (question: ProblemMath408BankVo) => {
  const result = getStructuredResult(question)
  if (!result) return ''

  const lines: string[] = []
  lines.push(`**识别作答**`)
  lines.push(result.student_normalized_answer || '未识别到有效作答')
  lines.push('')
  lines.push('**可接受答案**')
  if ((result.accepted_answers || []).length) {
    result.accepted_answers!.forEach((answer, idx) => {
      lines.push(`${idx + 1}. ${answer}`)
    })
  } else {
    lines.push('无')
  }
  return lines.join('\n')
}

const buildMistakeRubricMarkdown = (question: ProblemMath408BankVo) => {
  const result = getStructuredResult(question)
  if (!result) return ''

  const lines: string[] = []
  lines.push('**错误点**')
  if ((result.mistakes || []).length) {
    result.mistakes!.forEach((mistake, idx) => {
      lines.push(`${idx + 1}. ${mistake.type || '错误'} · ${mistake.severity || 'unknown'}`)
      if (mistake.description) lines.push(`   - ${mistake.description}`)
      if (mistake.related_rubric_item_id) lines.push(`   - 关联细则：${mistake.related_rubric_item_id}`)
    })
  } else {
    lines.push('无')
  }

  lines.push('')
  lines.push('**评分细则**')
  if ((result.rubric_used || []).length) {
    result.rubric_used!.forEach((rubric, idx) => {
      lines.push(`### ${rubric.name || rubric.id || `细则 ${idx + 1}`}`)
      lines.push(`- 得分：${rubric.awarded_score ?? 0} / ${rubric.max_score ?? 0} 分`)
      lines.push(`- 置信度：${formatPercent(rubric.confidence)}`)
      if (rubric.reason) lines.push(`- 原因：${rubric.reason}`)
      if (rubric.evidence) lines.push(`- 依据：${rubric.evidence}`)
      lines.push('')
    })
  } else {
    lines.push('无')
  }

  return lines.join('\n')
}
</script>
