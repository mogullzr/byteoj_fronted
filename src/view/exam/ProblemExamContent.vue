<template>
  <div class="exam-container" v-if="loading">
    <div class="loading-state">🔄 正在加载试卷资源...</div>
  </div>

  <div class="exam-container" v-else-if="!examData && !questions.length">
    <div class="error-state">❌ 未找到考试信息或题目为空</div>
  </div>

  <div class="exam-container" v-else>
    <!-- 顶部 Header -->
    <header>
      <div class="header-inner">
        <div class="exam-title">
          {{ examData?.exam_name || '未知考试' }}
        </div>
        <div class="timer" :class="{ 'timer-warning': remaining <= 300 }">
          {{ displayTimer }}
        </div>
      </div>
    </header>

    <!-- 左侧题目区 -->
    <main class="question-panel">
      <div class="question-header">
        <div class="q-type">
          <span class="badge">{{ getQuestionTypeLabel(currentQuestion.option_type, currentQuestion.status) }}</span>
          <span class="q-index">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</span>
          <span class="q-score"> ({{ currentQuestion.score }}分)</span>
        </div>
        <div class="q-title">试卷第 {{ currentIndex + 1 }} 题</div>

        <!-- 标签展示 -->
        <div class="q-tags" v-if="currentQuestion.tagsList && currentQuestion.tagsList.length">
          <span v-for="(tag, idx) in currentQuestion.tagsList" :key="idx" class="tag-item">{{ tag }}</span>
        </div>
      </div>
      <!-- 题目描述 (Description) - 支持数学公式渲染 -->
      <div class="problem-description" v-if="currentQuestion.description">
        <h4>题目描述：</h4>

        <MarkdownView
            :generate-data="currentQuestion.description"
            class="p-0"
        />
      </div>
      <div class="q-content">
        <!-- 情况1: 算法题 (status === 3) -->
        <div v-if="currentQuestion.status === 3">
          <MarkdownEditorView status="1"/>
        </div>

        <!-- 情况2: 有选项的题目 -->
        <template v-else-if="currentQuestion.option_type === 1 || currentQuestion.option_type === 2">
          <label
              v-for="(optText, index) in parsedOptions"
              :key="index"
              class="option-item"
              :class="{ selected: isSelected(currentQuestion.problem_id, getLetter(index)) }"
            :style="isSelected(currentQuestion.problem_id, getLetter(index)) ? 'background-color: #eef2ff; border-color: #3034ec;' : ''"
          >
          <input
              :type="currentQuestion.option_type === 1 ? 'radio' : 'checkbox'"
              :value="getLetter(index)"
              v-model="answers[currentQuestion.problem_id]"
              class="hidden-input"
          />

          <span class="option-letter">{{ getLetter(index) }}.</span>

          <!-- Markdown 组件 -->
          <MarkdownView
              :style="isSelected(currentQuestion.problem_id, getLetter(index)) ? 'background-color: #eef2ff; border-color: #3034ec;' : ''"
              :generate-data="'$' + getLetter(index) + '$' + '.' + renderMath(optText)"
              class="markdown-content"
          />
          </label>
        </template>

        <!-- 情况3: 填空题 (option_type=3) 或 简答题 (option_type=0) -->
        <template v-else>
          <textarea
              v-model="answers[currentQuestion.problem_id]"
              class="fill-blank"
              :placeholder="currentQuestion.option_type === 0 ? '请在此作答简答题...' : '请填写答案...'"
              rows="8"
          ></textarea>
        </template>
      </div>

      <!-- 底部导航 -->
      <div class="question-footer">
        <button class="nav-btn prev" :disabled="currentIndex === 0" @click="goPrev">
          ← 上一题
        </button>
        <button class="nav-btn next" :disabled="currentIndex === questions.length - 1" @click="goNext">
          下一题 →
        </button>
      </div>
    </main>

    <!-- 右侧工具栏 -->
    <aside class="sidebar">
      <!-- 答题卡 -->
      <div class="card">
        <div class="card-header">答题卡</div>
        <div class="question-nav">
          <button
              v-for="(q, index) in questions"
              :key="q.problem_id"
              class="q-btn"
              :class="{
                answered: isAnswered(q.problem_id),
                current: index === currentIndex,
                'is-algo': q.status === 3
              }"
              @click="currentIndexChange(index, q.status, q.problem_id)"
          >
            {{ index + 1 }}
          </button>
        </div>
      </div>

      <!-- 考试信息 -->
      <div class="card">
        <div class="card-header">考试信息</div>
        <div class="info-item">
          <span class="info-label">考生</span>
          <span class="info-value">莫顾 &emsp; 2021xxxxxx</span>
        </div>
        <div class="info-item">
          <span class="info-label">剩余时间</span>
          <span class="info-value">{{ displayTimer }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">已答题数</span>
          <span class="info-value">{{ answeredCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">完成度</span>
          <span class="info-value">{{ progress }}%</span>
        </div>
        <div class="info-item">
          <span class="info-label">总分</span>
          <span class="info-value">{{ totalScore }} 分</span>
        </div>
      </div>

      <!-- 交卷按钮 -->
      <div class="submit-wrapper">
        <button class="btn-submit" @click="handleSubmit">
          我要交卷
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {useRoute, useRouter} from 'vue-router'
// 假设你的服务文件路径如下，请根据实际项目结构调整
import { ProblemsControllerService } from '../../../generated/services/ProblemsControllerService'
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import MarkdownEditorView from "@/view/problems/algorithm/AceEditorView.vue";
import router from "@/router";
import Router from "@/router";

// --- 类型定义 ---
interface ProblemItem {
  problem_id: number
  problem_name: string
  description: string
  options: string | null // 后端返回的是字符串化的 JSON 数组
  option_type: number | null // 0:简答, 1:单选, 2:多选, 3:填空, null:其他
  status: number // 3: 算法题
  tagsList: string[]
  score: number
}

interface ExamInfo {
  exam_name: string
  exam_id: number
  time: number // 考试时长(分钟)
}

// --- 状态变量 ---
const route = useRoute()
const loading = ref(true)
const examData = ref<ExamInfo | null>(null)
const questions = ref<ProblemItem[]>([])
const currentIndex = ref(0)
const answers = ref<Record<number, any>>({}) // key: problem_id
const remaining = ref(3600) // 默认1小时，后续可从 examData.time 获取
let timerInterval: number | null = null

// --- 计算属性 ---
const currentQuestion = computed(() => questions.value[currentIndex.value] || {})

const displayTimer = computed(() => {
  const h = Math.floor(remaining.value / 3600).toString().padStart(2, '0')
  const m = Math.floor((remaining.value % 3600) / 60).toString().padStart(2, '0')
  const s = (remaining.value % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})

const answeredCount = computed(() => {
  const count = questions.value.filter(q => isAnswered(q.problem_id)).length
  return `${count} / ${questions.value.length}`
})

const progress = computed(() => {
  if (questions.value.length === 0) return 0
  const count = questions.value.filter(q => isAnswered(q.problem_id)).length
  return Math.round((count / questions.value.length) * 100)
})

const totalScore = computed(() => {
  return questions.value.reduce((sum, q) => sum + (q.score || 0), 0)
})

// 解析选项：后端返回的是字符串 "['A', 'B']", 需要转为数组
const parsedOptions = computed(() => {
  const optStr = currentQuestion.value.options
  if (!optStr) return []
  try {
    // 处理可能存在的单引号问题，JSON.parse 只支持双引号
    // 如果后端严格返回标准 JSON 字符串则直接 parse，否则需要替换单引号
    const normalized = optStr.replace(/'/g, '"')
    return JSON.parse(normalized)
  } catch (e) {
    console.error('解析选项失败', e)
    return []
  }
})

// --- 方法 ---

// 获取题型标签
const getQuestionTypeLabel = (type: number | null, status: number) => {
  if (status === 3) return '算法题'
  switch (type) {
    case 1: return '单选题'
    case 2: return '多选题'
    case 3: return '填空题'
    case 0: return '简答题'
    default: return '未知题型'
  }
}

const getLetter = (i: number) => String.fromCharCode(65 + i)

// 判断是否选中 (兼容单选字符串和多选数组)
const isSelected = (id: number, letter: string) => {
  const ans = answers.value[id]
  if (ans === undefined) return false
  if (typeof ans === 'string') return ans === letter
  if (Array.isArray(ans)) return ans.includes(letter)
  return false
}

// 判断是否已作答
const isAnswered = (id: number) => {
  const ans = answers.value[id]
  if (ans === undefined || ans === null) return false
  if (Array.isArray(ans)) return ans.length > 0
  return String(ans).trim().length > 0
}

const currentIndexChange = (index: number, status: number, problem_id: number) => {
  currentIndex.value = index;
  localStorage.setItem(examData.value?.exam_id + "-currentIndex", index);
  if (status === 3) {
    router.replace({
      name: route.name,
      query: {
        exam_id: examData.value?.exam_id,
        problem_id: problem_id ?? null
      }
    });
  }
};
// 简单的数学公式渲染占位 (实际项目中建议引入 katex 或 mathjax)
const renderMath = (text: string) => {
  if (!text) return ''
  // 这里仅做简单的换行处理，实际需对接公式库
  return text.replace(/\n/g, '<br/>')
}

const goPrev = () => { if (currentIndex.value > 0) currentIndex.value-- }
const goNext = () => { if (currentIndex.value < questions.value.length - 1) currentIndex.value++ }

const startTimer = () => {
  // 如果有后端返回的考试时间，可以在这里初始化 remaining
  // if (examData.value?.time) remaining.value = examData.value.time * 60

  timerInterval = window.setInterval(() => {
    remaining.value--
    if (remaining.value <= 0) {
      stopTimer()
      alert('考试时间到！系统将自动提交～')
      handleSubmit()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const handleSubmit = () => {
  if (!confirm('确定要交卷吗？交卷后无法修改！')) return
  stopTimer()

  // 构造提交数据
  const submitData = {
    exam_id: examData.value?.exam_id,
    answers: Object.entries(answers.value).map(([pid, val]) => ({
      problem_id: Number(pid),
      answer: val
    }))
  }

  console.log('提交数据:', submitData)
  alert('试卷已提交！\n\n请在控制台查看提交数据结构。')
  // TODO: 调用提交接口
}

// --- 生命周期 ---
onMounted(async () => {
  const examId = route.query.exam_id
  let current = localStorage.getItem(examId + "-currentIndex");
  if (current) {
    currentIndex.value = parseInt(current);
  } else {
    currentIndex.value = 0
  }
  if (!examId) {
    alert('缺少考试ID参数')
    loading.value = false
    return
  }

  try {
    // 1. 获取考试基本信息 (可选，如果需要展示考试名称等)
    const infoRes = await ProblemsControllerService.problemSearchExamIdUsingGet(Number(examId))
    if (infoRes.code === 0) examData.value = infoRes.data

    // 2. 获取题目列表 (核心接口)
    const res = await ProblemsControllerService.problemExamSearchDetailUsingGet(Number(examId))

    if (res.code === 0 && Array.isArray(res.data)) {
      questions.value = res.data
      if (questions.value.length > 0) {
        if (questions.value[currentIndex.value]?.status == 3) {
          router.replace({
            name: route.name,
            query: {
              exam_id: examData.value?.exam_id,
              problem_id: questions.value[currentIndex.value].problem_id ?? null
            }
          });
        }
      }
      // 初始化计时器 (假设默认2小时，或者从 infoRes 中获取)
      remaining.value = 2 * 3600
      startTimer()
    } else {
      alert('获取题目失败：' + res.message)
    }
  } catch (error) {
    console.error('加载考试数据异常', error)
    alert('网络错误，加载失败')
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  stopTimer()
})
</script>
<style scoped>
/* --- 1. 局部变量定义 --- */
.exam-container {
  --bg-main: #f8f9fc;
  --bg-card: #ffffff;
  --border: #e2e8f0;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --primary: #6366f1;
  --primary-soft: #818cf8;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --algo-bg: #1e1e1e;
  --algo-text: #d4d4d4;

  background-color: var(--bg-main);
}

/* --- 2. 基础重置 --- */
.exam-container,
.exam-container * {
  box-sizing: border-box;
}

/* --- 3. 布局与主要结构 --- */
.exam-container {
  max-width: 1280px;
  margin: 40px auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 28px;
  /* 默认字体，但会被内部的代码/公式规则覆盖 */
  font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
  border-radius: 2%;
  color: var(--text-primary);
  line-height: 1.6;
}

header {
  grid-column: 1 / -1;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 20px 28px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.exam-title {
  font-size: 1.42rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}

.timer {
  font-size: 1.38rem;
  font-weight: 700;
  color: var(--primary);
  font-family: "Courier New", monospace;
  background: #f0f4ff;
  padding: 8px 20px;
  border-radius: 9999px;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
}

.timer-warning {
  color: #ef4444;
  background: #fef2f2;
  animation: pulse 1s infinite;
}

.question-panel {
  background: var(--bg-card);
  border-radius: 24px;
  border: 1px solid var(--border);
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.question-header {
  padding: 28px 32px;
  border-bottom: 1px solid var(--gray-200);
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
}

.q-type {
  font-size: 0.95rem;
  color: var(--primary);
  font-weight: 700;
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.badge {
  background: #e0e7ff;
  color: #4338ca;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.q-title {
  font-size: 1.25rem;
  line-height: 1.55;
  font-weight: 600;
  margin-bottom: 12px;
}

.q-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.tag-item {
  font-size: 0.8rem;
  background: #f1f5f9;
  color: var(--text-secondary);
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid var(--gray-200);
}

.q-content {
  padding: 28px;
}

/* --- 4. 算法题占位符 --- */
.algo-editor-placeholder {
  background: #2d2d2d;
  color: #fff;
  padding: 30px;
  border-radius: 16px;
  text-align: center;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.mock-editor {
  background: #1e1e1e;
  color: #d4d4d4;
  text-align: left;
  padding: 20px;
  border-radius: 8px;
  font-family: 'Consolas', monospace;
  margin-top: 20px;
  border: 1px solid #444;
}

/* --- 5. 选项样式 (核心修复部分) --- */
.option-item {
  display: flex;
  align-items: flex-start;
  padding: 18px 20px;
  margin: 12px 0;
  border: 1.5px solid var(--gray-200);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.25s;
  position: relative;
  background: #fff;
}

.option-item:hover {
  background: #f8fbff;
  border-color: var(--primary-soft);
  transform: translateY(-2px);
}

/* ✅ 选中状态 */
.option-item.selected {
  background-color: #f0f4ff !important;
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

/* 🔴 修复：对勾颜色改为深色，确保在浅蓝背景上可见 */
.option-item.selected::after {
  content: "✓";
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.35rem;
  color: #4338ca; /* 深靛蓝色 */
  font-weight: bold;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
}

.option-letter {
  font-weight: 700;
  color: var(--text-secondary);
  margin-right: 12px;
  min-width: 24px;
}

.option-text {
  flex: 1;
  line-height: 1.6;
  font-size: 1.05rem;
}

input[type="radio"],
input[type="checkbox"] {
  margin-top: 5px;
  accent-color: var(--primary);
  transform: scale(1.15);
}

/* 🔴 修复：精准重置普通文本样式，但不破坏数学公式 */
.option-item :deep(.markdown-content),
.option-item :deep(p),
.option-item :deep(ul),
.option-item :deep(ol),
.option-item :deep(li),
.option-item :deep(blockquote) {
  background-color: transparent !important;
  color: inherit;
  border: none !important;
}

/* 🛡️ 关键修复：保护数学公式 (KaTeX/MathJax) 不被上面的 border:none 破坏 */
/* 这解决了分数线消失的问题 */
.option-item :deep(.katex),
.option-item :deep(.mjx-container),
.option-item :deep(.mjx-container *) {
  background-color: initial !important;
  border: initial !important;      /* 恢复分数线 border */
  color: initial !important;       /* 恢复公式默认颜色 */
  line-height: normal !important;  /* 防止行高压缩导致公式变形 */
  font-family: 'KaTeX_Main', 'Times New Roman', serif !important;
}

/* 🛡️ 保护代码块字体 */
.option-item :deep(pre),
.option-item :deep(code) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
  background-color: rgba(0, 0, 0, 0.03) !important; /* 轻微背景以区分代码 */
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

/* --- 6. 填空题与其他 --- */
.fill-blank {
  width: 100%;
  padding: 18px 20px;
  border: 1.5px solid var(--gray-200);
  border-radius: 18px;
  font-size: 1.08rem;
  resize: vertical;
  min-height: 140px;
  font-family: inherit;
}

.fill-blank:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
  outline: none;
}

.problem-description {
  margin: 5px 40px;
  padding-top: 20px;
  border-top: 1px dashed var(--gray-200);
}

.problem-description h4 {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.desc-content {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #334155;
}

/* --- 7. 侧边栏与按钮 --- */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.card {
  background: var(--bg-card);
  border-radius: 22px;
  border: 1px solid var(--border);
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
}

.card-header {
  padding: 18px 24px;
  background: #f8fafc;
  font-weight: 700;
  color: var(--text-secondary);
}

.question-nav {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.q-btn {
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1.5px solid var(--gray-200);
  background: white;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.q-btn:hover {
  background: #f1f5f9;
  transform: scale(1.08);
}

.q-btn.answered {
  background: #e0f2fe;
  border-color: #38bdf8;
  color: #0ea5e9;
}

.q-btn.current {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.25);
}

.q-btn.is-algo {
  background: #2d2d2d;
  color: #fff;
  border-color: #444;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid var(--gray-100);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--text-secondary);
}

.info-value {
  font-weight: 600;
}

.submit-wrapper {
  padding-top: 4px;
}

.btn-submit {
  width: 100%;
  padding: 18px 32px;
  font-size: 1.22rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.35);
}

.btn-submit:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.45);
}

.question-footer {
  padding: 20px 28px 28px;
  display: flex;
  gap: 16px;
  background: #fafcff;
  border-top: 1px solid var(--gray-200);
}

.nav-btn {
  flex: 1;
  padding: 16px 24px;
  font-size: 1.05rem;
  font-weight: 600;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.25s;
}

.nav-btn.prev {
  background: #f1f5f9;
  color: #64748b;
}

.nav-btn.next {
  background: var(--primary);
  color: white;
}

.nav-btn:hover {
  transform: translateY(-3px);
}

.nav-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 100px 20px;
  font-size: 1.2rem;
  color: var(--text-secondary);
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

@media (max-width: 960px) {
  .exam-container {
    grid-template-columns: 1fr;
  }
  .sidebar {
    order: -1;
  }
}
</style>