<template>
  <main class="english-grading-page">
    <section class="page-header">
      <div>
        <p class="eyebrow">BYTEOJ · AI PRACTICE</p>
        <h1>考研英语专项评分</h1>
        <p class="subtitle">针对英语一、英语二的翻译与作文进行分项评分和讲评。</p>
      </div>
      <div class="score-rule-chip">图片仅作为视觉输入，不进行 OCR</div>
    </section>

    <section class="workspace">
      <div class="mode-tabs" role="tablist" aria-label="评分类型">
        <button :class="{ active: mode === 'translation' }" @click="switchMode('translation')">翻译评分</button>
        <button :class="{ active: mode === 'essay' }" @click="switchMode('essay')">作文评分</button>
      </div>

      <div class="config-grid">
        <label>
          <span>考试类型</span>
          <select v-model="examType">
            <option value="ENGLISH_I">英语一</option>
            <option value="ENGLISH_II">英语二</option>
          </select>
        </label>
        <label>
          <span>题目类型</span>
          <select v-model="questionType">
            <option v-if="mode === 'translation'" value="TRANSLATION">翻译题</option>
            <option v-if="mode === 'essay'" value="SMALL_ESSAY">小作文</option>
            <option v-if="mode === 'essay'" value="LARGE_ESSAY">大作文</option>
          </select>
        </label>
        <label>
          <span>AI 判卷模型</span>
          <select v-model="aiModel">
            <option value="DEEPSEEK">DeepSeek Flash-4.1（极速路线）</option>
            <option value="GPT_5_4">GPT-6.1-sol（不稳定1路线）</option>
          </select>
        </label>
        <div class="score-preview">
          <span>本题满分</span>
          <strong>{{ totalScore }} 分</strong>
        </div>
      </div>

      <div class="rule-note">
        <strong>{{ ruleTitle }}</strong>
        <span>{{ ruleDescription }}</span>
      </div>

      <div class="input-grid">
        <label class="field full-width">
          <span>{{ mode === 'translation' ? '英语原文与划线句' : '作文题目与写作要求' }}</span>
          <textarea v-model="questionContent" :placeholder="questionPlaceholder" rows="8" />
        </label>
        <div class="field image-field full-width question-image-field">
          <div class="field-label">
            <span>题目/作文要求图片（可选）</span>
            <span class="muted">图片直接交给视觉模型，不做 OCR</span>
          </div>
          <input ref="questionFileInput" type="file" accept="image/*" multiple hidden @change="handleQuestionFiles" />
          <button class="upload-button" :disabled="uploading" @click="questionFileInput?.click()">
            {{ uploading ? '图片上传中...' : '选择题目图片' }}
          </button>
          <div v-if="questionImageItems.length" class="image-list">
            <div v-for="item in questionImageItems" :key="item.url" class="image-item">
              <img :src="item.url" alt="题目图片" />
              <button title="删除图片" @click="removeQuestionImage(item.url)">×</button>
            </div>
          </div>
          <p v-else class="empty-image">可以直接上传试卷题目、作文图表或图画要求。</p>
        </div>
        <label class="field">
          <span>学生答案（可直接粘贴）</span>
          <textarea v-model="studentAnswer" placeholder="粘贴学生译文或作文内容" rows="12" />
        </label>
        <div class="field image-field">
          <div class="field-label">
            <span>学生答案图片（可选）</span>
            <span class="muted">视觉模型直接阅读图片</span>
          </div>
          <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="handleFiles" />
          <button class="upload-button" :disabled="uploading" @click="fileInput?.click()">
            {{ uploading ? '图片上传中...' : '选择答案图片' }}
          </button>
          <div v-if="imageItems.length" class="image-list">
            <div v-for="item in imageItems" :key="item.url" class="image-item">
              <img :src="item.url" alt="学生答案图片" />
              <button title="删除图片" @click="removeImage(item.url)">×</button>
            </div>
          </div>
          <p v-else class="empty-image">不上传图片也可以，仅使用文本答案评分。</p>
        </div>
      </div>

      <label class="field reference-field">
        <span>参考答案或评分补充（可选）</span>
        <textarea v-model="referenceAnswer" placeholder="翻译参考译文、作文立意或老师补充的评分要求" rows="4" />
      </label>

      <div class="actions">
        <button class="secondary-button" :disabled="loading" @click="resetForm">清空</button>
        <button class="primary-button" :disabled="loading || uploading" @click="submitGrading">
          {{ loading ? 'AI 正在评分...' : '开始专项评分' }}
        </button>
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </section>

    <section v-if="result" class="result-panel">
      <div class="result-summary">
        <div>
          <p class="eyebrow">GRADING RESULT</p>
          <h2>评分结果</h2>
          <p>{{ result.summary || 'AI 已完成评分。' }}</p>
        </div>
        <div class="score-badge"><strong>{{ result.awarded_score ?? 0 }}</strong><span>/ {{ result.total_score ?? totalScore }}</span></div>
      </div>
      <div v-if="result.needs_manual_review" class="review-alert">当前内容无法完全可靠判分，建议人工复核。</div>

      <div class="result-grid">
        <article v-if="questionType === 'TRANSLATION'" class="result-card wide-card">
          <h3>翻译逐句分析</h3>
          <div v-if="result.translation_sentence_analysis?.length" class="detail-list">
            <div v-for="(item, index) in result.translation_sentence_analysis" :key="index" class="sentence-row">
              <strong>第 {{ item.sentence_index ?? index + 1 }} 句 <span>{{ item.awarded_score ?? '-' }} / {{ item.max_score ?? '-' }} 分</span></strong>
              <p><b>原句：</b>{{ item.source_sentence || '未返回' }}</p>
              <p><b>学生译文：</b>{{ item.student_translation || '未返回' }}</p>
              <p v-if="item.reference_translation"><b>参考译法：</b>{{ item.reference_translation }}</p>
              <p><b>准确性：</b>{{ item.accuracy_analysis || '未返回' }}</p>
              <p><b>流畅性：</b>{{ item.fluency_analysis || '未返回' }}</p>
              <p><b>语法与结构：</b>{{ item.grammar_analysis || '未返回' }}</p>
              <div v-if="item.deductions?.length" class="sentence-deductions">
                <div v-for="(deduction, deductionIndex) in item.deductions" :key="deductionIndex"><b>扣分 {{ deduction.deduction ?? deduction.score ?? '' }} 分：</b>{{ deduction.reason || deduction.description || '' }}<span v-if="deduction.student_text">（原文：{{ deduction.student_text }}）</span></div>
              </div>
              <p><b>本句修改建议：</b>{{ item.suggestion || '无' }}</p>
              <p v-if="item.improved_translation" class="correction"><b>建议译文：</b>{{ item.improved_translation }}</p>
            </div>
          </div>
          <div v-else class="empty-result">模型未返回逐句分析。</div>
        </article>
        <article class="result-card">
          <h3>评分拆解</h3>
          <div v-if="result.score_breakdown?.length" class="detail-list">
            <div v-for="(item, index) in result.score_breakdown" :key="index" class="detail-row">
              <strong>{{ item.name || item.category || `评分项 ${index + 1}` }}</strong>
              <span>{{ item.awarded_score ?? item.score ?? '-' }}{{ item.max_score ? ` / ${item.max_score}` : '' }}</span>
              <p>{{ item.reason || item.description || '' }}</p>
            </div>
          </div>
          <div v-else class="empty-result">模型未返回细分评分。</div>
        </article>

        <article class="result-card">
          <h3>扣分点</h3>
          <div v-if="result.deductions?.length" class="detail-list">
            <div v-for="(item, index) in result.deductions" :key="index" class="detail-row deduction">
              <strong>{{ item.category || item.type || '语言问题' }} <em v-if="item.deduction != null">-{{ item.deduction }} 分</em></strong>
              <p v-if="item.student_text">原文：{{ item.student_text }}</p>
              <p>{{ item.reason || item.description || '' }}</p>
              <p v-if="item.correction" class="correction">修改：{{ item.correction }}</p>
            </div>
          </div>
          <div v-else-if="result.mistakes?.length" class="detail-list">
            <div v-for="(item, index) in result.mistakes" :key="index" class="detail-row deduction">
              <strong>{{ item.type || '问题' }}</strong><p>{{ item.description }}</p>
            </div>
          </div>
          <div v-else class="empty-result">未发现明确扣分点。</div>
        </article>

        <article v-if="questionType !== 'TRANSLATION'" class="result-card wide-card">
          <h3>作文专项诊断</h3>
          <p class="preline"><b>任务完成：</b>{{ result.task_completion_analysis || '暂无' }}</p>
          <p class="preline"><b>结构与衔接：</b>{{ result.structure_analysis || '暂无' }}</p>
          <div v-if="result.language_error_analysis?.length" class="detail-list">
            <div v-for="(item, index) in result.language_error_analysis" :key="index" class="detail-row deduction">
              <strong>第 {{ item.sentence_number ?? index + 1 }} 句 · {{ item.error_type || item.category || '语言问题' }} <em v-if="item.deduction != null">-{{ item.deduction }} 分</em></strong>
              <p v-if="item.sentence_text">原句：{{ item.sentence_text }}</p>
              <p v-if="item.error_location">具体位置：{{ item.error_location }}</p>
              <p>{{ item.error_explanation_zh || item.reason || item.description || '' }}</p>
              <p v-if="item.impact_zh || item.impact">影响：{{ item.impact_zh || item.impact }}</p>
              <p v-if="item.corrected_sentence || item.correction" class="correction">修改后：{{ item.corrected_sentence || item.correction }}</p>
            </div>
          </div>
          <div v-if="result.sentence_corrections?.length" class="detail-list">
            <div v-for="(item, index) in result.sentence_corrections" :key="index" class="detail-row">
              <strong>逐句建议 {{ index + 1 }}</strong>
              <p>第 {{ item.sentence_number ?? index + 1 }} 句</p>
              <p v-if="item.original">原句：{{ item.original }}</p>
              <p v-if="item.revised" class="correction">建议改为：{{ item.revised }}</p>
              <p>{{ item.explanation_zh || item.explanation || item.reason || '' }}</p>
            </div>
          </div>
          <p class="preline"><b>中文总结建议：</b>{{ result.chinese_overall_advice || result.advice || '暂无' }}</p>
        </article>

        <article class="result-card wide-card">
          <h3>修改建议与参考答案</h3>
          <p class="preline">{{ result.advice || '暂无修改建议。' }}</p>
          <div v-if="result.corrected_answer" class="corrected-answer"><strong>修改后：</strong>{{ result.corrected_answer }}</div>
        </article>

        <article class="result-card">
          <h3>词汇记忆</h3>
          <div v-if="result.vocabulary_memory?.length" class="detail-list">
            <div v-for="(item, index) in result.vocabulary_memory" :key="index" class="detail-row">
              <strong>{{ item.word || item.term }}</strong>
              <p>{{ item.meaning || item.definition || '' }}</p>
              <p v-if="item.memory_tip" class="muted">记忆：{{ item.memory_tip }}</p>
            </div>
          </div>
          <div v-else class="empty-result">暂无重点词汇。</div>
        </article>

        <article class="result-card">
          <h3>难句语法结构</h3>
          <div v-if="result.difficult_sentence_analysis?.length" class="detail-list">
            <div v-for="(item, index) in result.difficult_sentence_analysis" :key="index" class="detail-row">
              <strong>{{ item.structure || `难句 ${index + 1}` }}</strong>
              <p>{{ item.sentence || '' }}</p>
              <p>{{ item.explanation || item.grammar_points || '' }}</p>
            </div>
          </div>
          <div v-else class="empty-result">暂无需要单独分析的复杂句。</div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import axios from 'axios'
import { OpenAPI } from '../../../generated/core/OpenAPI'
import { UserControllerService } from '../../../generated'

type Mode = 'translation' | 'essay'
type ImageItem = { url: string }
type GradingResult = {
  awarded_score?: number
  total_score?: number
  summary?: string
  advice?: string
  needs_manual_review?: boolean
  score_breakdown?: Record<string, any>[]
  deductions?: Record<string, any>[]
  vocabulary_memory?: Record<string, any>[]
  difficult_sentence_analysis?: Record<string, any>[]
  translation_sentence_analysis?: Record<string, any>[]
  task_completion_analysis?: string
  structure_analysis?: string
  language_error_analysis?: Record<string, any>[]
  sentence_corrections?: Record<string, any>[]
  chinese_overall_advice?: string
  mistakes?: Record<string, any>[]
  corrected_answer?: string
  [key: string]: any
}

const mode = ref<Mode>('translation')
const examType = ref('ENGLISH_I')
const questionType = ref('TRANSLATION')
const aiModel = ref<'GPT_5_4' | 'DEEPSEEK'>('DEEPSEEK')
const questionContent = ref('')
const studentAnswer = ref('')
const referenceAnswer = ref('')
const questionImageItems = ref<ImageItem[]>([])
const imageItems = ref<ImageItem[]>([])
const questionFileInput = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const result = ref<GradingResult | null>(null)

const totalScore = computed(() => {
  if (questionType.value === 'TRANSLATION') return examType.value === 'ENGLISH_I' ? 10 : 15
  if (questionType.value === 'SMALL_ESSAY') return 10
  return examType.value === 'ENGLISH_I' ? 20 : 15
})
const ruleTitle = computed(() => questionType.value === 'TRANSLATION'
  ? (examType.value === 'ENGLISH_I' ? '英语一：指定句子翻译' : '英语二：完整段落翻译')
  : (questionType.value === 'SMALL_ESSAY' ? '小作文：应用文任务完成度' : '大作文：内容、结构与语言质量'))
const ruleDescription = computed(() => questionType.value === 'TRANSLATION'
  ? (examType.value === 'ENGLISH_I' ? '通常为文章中 5 个指定句子，共 10 分。' : '通常翻译完整段落，共 15 分。')
  : `满分 ${totalScore.value} 分，先判断任务完成度，再评价语言与结构。`)
const questionPlaceholder = computed(() => questionType.value === 'TRANSLATION'
  ? '粘贴包含上下文的英语原文，并标记需要翻译的句子/段落。'
  : '粘贴作文题目、图表/图画说明和具体写作要求。')

function switchMode(next: Mode) {
  mode.value = next
  questionType.value = next === 'translation' ? 'TRANSLATION' : 'SMALL_ESSAY'
  result.value = null
}

async function uploadImages(event: Event, target: typeof imageItems) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (!files.length) return
  uploading.value = true
  errorMessage.value = ''
  try {
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      const form = new FormData()
      form.append('files[]', file, file.name)
      const response: any = await UserControllerService.userUploadPictureUsingPost(form, 2)
      const url = response?.data
      if (url && !target.value.some(item => item.url === url)) target.value.push({ url })
    }
  } catch (error: any) {
    errorMessage.value = error?.message || '图片上传失败，请稍后重试。'
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function handleFiles(event: Event) {
  await uploadImages(event, imageItems)
}

async function handleQuestionFiles(event: Event) {
  await uploadImages(event, questionImageItems)
}

function removeQuestionImage(url: string) {
  questionImageItems.value = questionImageItems.value.filter(item => item.url !== url)
}

function removeImage(url: string) {
  imageItems.value = imageItems.value.filter(item => item.url !== url)
}

function resetForm() {
  questionContent.value = ''
  studentAnswer.value = ''
  referenceAnswer.value = ''
  questionImageItems.value = []
  imageItems.value = []
  result.value = null
  errorMessage.value = ''
}

async function submitGrading() {
  if (!questionContent.value.trim() && !questionImageItems.value.length) {
    errorMessage.value = '请填写题目原文/作文要求，或上传题目图片。'
    return
  }
  if (!studentAnswer.value.trim() && !imageItems.value.length) {
    errorMessage.value = '请粘贴学生答案或上传答案图片。'
    return
  }
  loading.value = true
  errorMessage.value = ''
  result.value = null
  try {
    const baseUrl = OpenAPI.BASE.replace(/\/$/, '')
    const response = await axios.post(`${baseUrl}/api/ai/english/grade`, {
      exam_type: examType.value,
      question_type: questionType.value,
      ai_model: aiModel.value,
      question_content: questionContent.value,
      question_image_urls: questionImageItems.value.map(item => item.url),
      student_answer: studentAnswer.value,
      reference_answer: referenceAnswer.value,
      student_answer_image_urls: imageItems.value.map(item => item.url),
    }, { withCredentials: true })
    if (response.data?.code !== 0) throw new Error(response.data?.message || '评分失败')
    result.value = response.data.data
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || error?.message || '评分失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.english-grading-page { min-height: 100vh; padding: 36px clamp(18px, 5vw, 80px) 80px; color: #172033; background: #f5f7fb; }
.page-header, .workspace, .result-panel { max-width: 1180px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; margin-bottom: 24px; }
.eyebrow { margin: 0 0 8px; color: #64748b; font-size: 11px; letter-spacing: .14em; font-weight: 700; }
h1 { margin: 0; font-size: clamp(27px, 4vw, 42px); letter-spacing: -.02em; }
.subtitle { margin: 12px 0 0; color: #64748b; }
.score-rule-chip { padding: 10px 14px; color: #475569; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; white-space: nowrap; }
.workspace, .result-panel { padding: 24px; background: #fff; border: 1px solid #e5eaf1; border-radius: 16px; box-shadow: 0 12px 34px rgba(15, 23, 42, .06); }
.mode-tabs { display: flex; gap: 8px; border-bottom: 1px solid #edf0f5; margin: -24px -24px 24px; padding: 14px 24px 0; }
.mode-tabs button { padding: 12px 18px; border: 0; border-bottom: 3px solid transparent; background: transparent; color: #64748b; font-weight: 700; cursor: pointer; }
.mode-tabs button.active { color: #2563eb; border-bottom-color: #2563eb; }
.config-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)) 180px; gap: 16px; align-items: end; }
label span, .field-label span { display: block; margin-bottom: 7px; color: #334155; font-size: 13px; font-weight: 700; }
select, textarea { width: 100%; box-sizing: border-box; border: 1px solid #dbe2ec; border-radius: 10px; background: #fbfcfe; color: #172033; font: inherit; outline: none; }
select { height: 42px; padding: 0 12px; }
textarea { padding: 12px 14px; resize: vertical; line-height: 1.7; }
select:focus, textarea:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96, 165, 250, .14); }
.score-preview { height: 42px; display: flex; justify-content: center; flex-direction: column; padding: 0 14px; background: #eff6ff; border: 1px solid #dbeafe; border-radius: 10px; }
.score-preview span { margin: 0; color: #64748b; font-size: 12px; }
.score-preview strong { color: #1d4ed8; }
.rule-note { display: flex; gap: 12px; margin: 20px 0; padding: 13px 15px; border-left: 3px solid #60a5fa; background: #f8fbff; color: #475569; font-size: 13px; line-height: 1.7; }
.rule-note strong { color: #1e40af; white-space: nowrap; }
.input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.full-width, .reference-field { grid-column: 1 / -1; }
.field-label { display: flex; justify-content: space-between; }
.muted { color: #94a3b8; font-size: 12px; }
.image-field { min-height: 260px; padding: 14px; border: 1px dashed #cbd5e1; border-radius: 10px; background: #fbfcfe; }
.upload-button, .primary-button, .secondary-button { border: 0; border-radius: 9px; padding: 10px 16px; cursor: pointer; font-weight: 700; }
.upload-button, .secondary-button { background: #eef2f7; color: #334155; }
.primary-button { background: #2563eb; color: white; }
button:disabled { cursor: not-allowed; opacity: .58; }
.image-list { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
.image-item { position: relative; width: 88px; height: 88px; overflow: hidden; border-radius: 8px; border: 1px solid #e2e8f0; }
.image-item img { width: 100%; height: 100%; object-fit: cover; }
.image-item button { position: absolute; right: 3px; top: 3px; width: 22px; height: 22px; border: 0; border-radius: 50%; background: rgba(15, 23, 42, .72); color: white; cursor: pointer; }
.empty-image { color: #94a3b8; font-size: 13px; }
.actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; }
.error-message { margin: 14px 0 0; color: #b91c1c; font-size: 13px; }
.result-panel { margin-top: 24px; }
.result-summary { display: flex; justify-content: space-between; gap: 20px; align-items: center; padding-bottom: 20px; border-bottom: 1px solid #edf0f5; }
.result-summary h2 { margin: 0 0 8px; }
.result-summary p:last-child { margin: 0; color: #64748b; white-space: pre-wrap; line-height: 1.7; }
.score-badge { display: flex; align-items: baseline; color: #64748b; }
.score-badge strong { color: #2563eb; font-size: 44px; }
.review-alert { margin-top: 16px; padding: 12px 14px; border-radius: 9px; color: #92400e; background: #fffbeb; border: 1px solid #fde68a; }
.result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 18px; }
.result-card { padding: 18px; border: 1px solid #e8edf4; border-radius: 12px; background: #fcfdff; }
.wide-card { grid-column: 1 / -1; }
.result-card h3 { margin: 0 0 14px; font-size: 16px; }
.detail-list { display: grid; gap: 11px; }
.detail-row { padding-bottom: 11px; border-bottom: 1px solid #edf0f5; line-height: 1.65; }
.detail-row:last-child { padding-bottom: 0; border-bottom: 0; }
.detail-row strong { display: flex; justify-content: space-between; gap: 8px; color: #334155; }
.detail-row p { margin: 4px 0 0; color: #64748b; white-space: pre-wrap; }
.sentence-row { padding: 14px 0; border-bottom: 1px solid #edf0f5; line-height: 1.7; }
.sentence-row:last-child { border-bottom: 0; }
.sentence-row > strong { display: flex; justify-content: space-between; color: #1e40af; }
.sentence-row p { margin: 6px 0 0; color: #475569; white-space: pre-wrap; }
.sentence-deductions { margin-top: 8px; padding: 9px 11px; color: #991b1b; background: #fff1f2; border-radius: 7px; }
.deduction em { color: #dc2626; font-style: normal; white-space: nowrap; }
.correction { color: #047857 !important; }
.preline { white-space: pre-wrap; color: #475569; line-height: 1.8; }
.corrected-answer { margin-top: 12px; padding: 12px; background: #f0fdf4; border-radius: 8px; color: #166534; white-space: pre-wrap; line-height: 1.7; }
.empty-result { color: #94a3b8; font-size: 13px; }
@media (max-width: 760px) { .page-header { flex-direction: column; } .score-rule-chip { white-space: normal; } .config-grid, .input-grid, .result-grid { grid-template-columns: 1fr; } .full-width, .reference-field, .wide-card { grid-column: auto; } .workspace, .result-panel { padding: 16px; } .mode-tabs { margin: -16px -16px 18px; padding: 10px 16px 0; } .result-summary { align-items: flex-start; flex-direction: column; } }
</style>
