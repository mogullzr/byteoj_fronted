<template>
  <div class="exam-container" v-if="loading">
    <div class="loading-state">🔄 正在加载试卷资源...</div>
  </div>

  <div class="exam-container" v-else-if="!examData && !questions.length">
    <div class="error-state">❌ 未找到考试信息或题目为空</div>
  </div>

  <div class="exam-container" v-else>
    <!-- 确认交卷弹窗 -->
    <transition name="modal-fade">
      <div v-if="showConfirmModal" class="modal-overlay">
        <div class="confirm-modal">
          <h3>确定要交卷吗？</h3>
          <p>交卷后无法修改答案，请仔细检查！</p>
          <div class="modal-buttons">
            <button class="btn cancel" @click="showConfirmModal = false">我再检查一下</button>
            <button class="btn confirm" @click="confirmSubmit" :disabled="submitting">
              {{ submitting ? '提交中...' : '确认交卷' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 提交中加载遮罩 -->
    <transition name="fade">
      <div v-if="submitting" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>正在提交试卷...</p>
          <small>请勿关闭或刷新页面</small>
        </div>
      </div>
    </transition>
    <!-- 交卷结果遮罩层 -->
    <div v-if="showResult" class="result-overlay">
      <div class="result-card">
        <div class="result-header">
          <h2>交卷成功！</h2>
          <div class="result-icon success">✓</div>
        </div>

        <div class="result-body">
          <div class="exam-info">
            <div class="info-row">
              <span class="label">考试名称</span>
              <span class="value">{{ resultData.exam_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">考生</span>
              <span class="value">{{ resultData.username }}</span>
            </div>
            <div class="info-row total-score">
              <span class="label">总分</span>
              <span class="value highlight font-bold">{{ resultData.score_subjective + resultData.score_option }} / {{ resultData.total_score }} 分</span>
            </div>
          </div>

          <div class="score-breakdown">
            <div class="score-item">
              <div class="score-label">客观题得分</div>
              <div class="score-value">{{ resultData.score_option }} 分</div>
            </div>
            <div class="score-item">
              <div class="score-label">主观题得分</div>
              <div class="score-value">{{ resultData.score_subjective }} 分</div>
            </div>
          </div>

          <div class="result-footer">
            <p class="tip">成绩已提交，请等待老师批改主观题</p>
            <div class="buttons">
              <button class="btn primary" @click="goToDashboard">返回首页</button>
              <button class="btn secondary" @click="showResult = false">查看答题卡</button>
            </div>
          </div>
        </div>
      </div>
    </div>
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
          <div class="fill-answer-area">
            <!-- 已上传的图片展示区 -->
            <div class="uploaded-images" v-if="getAnswerImages(currentQuestion.problem_id).length">
              <div
                  v-for="(imgUrl, idx) in getAnswerImages(currentQuestion.problem_id)"
                  :key="idx"
                  class="image-preview-item"
              >
                <img :src="imgUrl" alt="答题图片" class="preview-img" />
                <button
                    class="remove-btn"
                    @click="removeUploadedImage(currentQuestion.problem_id, idx)"
                    title="删除这张图片"
                >×</button>
              </div>
            </div>

            <!-- 上传区域 -->
            <div class="upload-zone">
              <input
                  type="file"
                  accept="image/*"
                  class="file-input"
                  id="file-upload"
                  ref="fileInput"
                  @change="handleFileChange"
                  hidden
              />

              <button
                  type="button"
                  class="btn-upload"
                  @click="triggerUpload"
                  :disabled="uploading"
              >
                <span v-if="uploading">上传中...</span>
                <span v-else>📤 上传答题图片</span>
              </button>

              <div class="upload-tip" v-if="!uploading">
                支持 jpg / png / gif，建议单张小于 5MB
              </div>
            </div>

            <!-- 可选：保留文本输入框（有些人可能想既写文字又传图） -->
            <textarea
                v-model="textAnswers[currentQuestion.problem_id]"
                class="fill-blank"
                placeholder="可在此补充文字说明（非必填）..."
                rows="6"
            ></textarea>
          </div>
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
      <!-- 答题卡部分 -->
      <div class="card">
        <div class="card-header">答题卡</div>

        <div class="question-nav-wrapper">

          <!-- 先按 option_type 分组 -->
          <template v-for="(group, groupIndex) in groupedQuestions" :key="'group-'+groupIndex">

            <!-- 分组标题 -->
            <div class="group-title">
              {{ numberToChinese(groupIndex + 1) }}、{{ getGroupTypeName(group[0]) }}
            </div>

            <!-- 该组的题目按钮 -->
            <div class="question-nav group-nav">
              <button
                  v-for="(q, idx) in group"
                  :key="q.problem_id"
                  class="q-btn"
                  :class="{
            answered: isAnswered(q.problem_id),
            current: questions.indexOf(q) === currentIndex,
            'is-algo': q.status === 3
          }"
                  @click="currentIndexChange(questions.indexOf(q), q.status, q.problem_id)"
              >
                {{ questions.indexOf(q) + 1 }}
              </button>
            </div>

          </template>

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
import {ref, computed, onMounted, onUnmounted, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
// 假设你的服务文件路径如下，请根据实际项目结构调整
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import MarkdownEditorView from "@/view/problems/algorithm/AceEditorView.vue";
import router from "@/router";
import Router from "@/router";
import {ProblemsControllerService} from "../../../generated/services/ProblemsControllerService";
import {UserControllerService} from "../../../generated";
import {useMessageBox} from "@/view/components/alert/useMessageBox";
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
// ==================== 新增的状态 ====================
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// 单独存文本部分（可选，如果你想同时支持文字+图片）
const textAnswers = ref<Record<number, string>>({})
// 新增：用于存储的 key（用 exam_id 区分不同考试）
const storageKey = computed(() => {
  const examId = examData.value?.exam_id
  return examId ? `exam-${examId}-answers` : null
})
const { success, error, warning } = useMessageBox();

// 新增状态
const showResult = ref(false)
const resultData = ref({
  exam_id: 0,
  exam_name: '',
  total_score: 0,
  uuid: 0,
  username: '',
  score_option: 0,
  score_subjective: 0
})
// 新增状态
const showConfirmModal = ref(false)
const submitting = ref(false)

// 统一从 answers 里取图片链接的辅助函数
const getAnswerImages = (problemId: number) => {
  const ans = answers.value[problemId]
  if (!ans) return []
  if (typeof ans === 'string' && ans.startsWith('http')) return [ans]
  if (Array.isArray(ans)) return ans.filter(item => typeof item === 'string' && item.startsWith('http'))
  return []
}

// 触发文件选择
const triggerUpload = () => {
  fileInput.value?.click()
}

// 处理文件上传
const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  uploading.value = true

  try {
    const formData = new FormData()
    // 支持一次传多张？这里示例只取第一张，你可以改成循环
    formData.append('file', target.files[0])

    // 调用你提供的上传接口（注意：你示例中是 userUploadPictureUsingPost(fileList, 1)）
    // 这里假设改成了支持 FormData 的写法，根据实际 SDK 调整
    const res = await UserControllerService.userUploadPictureUsingPost(
        target.files,   // FileList
        2               // 第二个参数是什么含义？请确认
    )

    if (res.code === 0) {
      // 成功后清理
      if (storageKey.value) {
        localStorage.removeItem(storageKey.value)
      }
      // 假设 res.data 是字符串链接
      const url = res.data

      // 存入 answers（这里示例只支持一张，后面可改成数组）
      answers.value[currentQuestion.value.problem_id] = url

      // 如果你想支持多张，可以改成：
      // if (!Array.isArray(answers.value[pid])) answers.value[pid] = []
      // answers.value[pid].push(url)
    } else {
      error(res.message || "上传失败")
    }
  } catch (err) {
    console.error("图片上传异常", err)
    error("上传过程中发生错误")
  } finally {
    uploading.value = false
    // 清空 input 防止重复触发相同文件
    if (fileInput.value) fileInput.value.value = ''
  }
}

// 删除已上传图片
const removeUploadedImage = (problemId: number, index: number) => {
  const current = answers.value[problemId]
  if (Array.isArray(current)) {
    current.splice(index, 1)
    if (current.length === 0) {
      delete answers.value[problemId]
    }
  } else {
    // 单张直接删除
    delete answers.value[problemId]
  }
}

// ==================== 提交时的数据处理调整 ====================
const handleSubmit = async () => {
  showConfirmModal.value = true
}

// 确认后真正提交
const confirmSubmit = async () => {
  showConfirmModal.value = false
  submitting.value = true


  const answerList = []

  for (const [pidStr, val] of Object.entries(answers.value)) {
    const pid = Number(pidStr)
    const q = questions.value.find(qq => qq.problem_id === pid)
    if (!q) continue

    let finalAnswer = ""

    // 根据题型（q.status）决定 answer 格式
    switch (q.option_type) {
      case 1: // 单选
        finalAnswer = `['${val}']`
        break

      case 2: // 多选
        if (Array.isArray(val) && val.length > 0) {
          finalAnswer = `[${val.map(v => `'${v}'`).join(',')}]`
        }
        break

      case 3: // 填空
      case 0: // 简答
        // 图片链接（你主要想实现的）
        if (typeof val === 'string' && val.startsWith('http')) {
          finalAnswer = val
        } else if (Array.isArray(val) && val.length > 0) {
          finalAnswer = val.join(',')   // 或 JSON.stringify(val)，看后端要求
        }
        // 简答题可额外拼接文字（可选）
        if (q.option_type === 0) {
          const text = textAnswers.value[pid]?.trim()
          if (text) finalAnswer = finalAnswer ? `${finalAnswer}\n${text}` : text
        }
        break

      case 4: // 算法题
        // 如果你后面实现了代码保存，这里可以放代码字符串
        finalAnswer = val || ""   // 目前大多为空
        break

      default:
        finalAnswer = String(val || "").trim()
    }

    // 无论是否作答，都包含这条记录，并带上真实的题型 status
    answerList.push({
      problem_id: pid,
      answer: finalAnswer,
      language: "",
      status: q.option_type
    })
  }

  const request = {
    exam_id: examData.value?.exam_id,
    answers: answerList
  }

  console.log('准备提交的数据：', JSON.stringify(request, null, 2))

  // 调用接口...
  try {
    const res = await ProblemsControllerService.problemExamSubmitUsingPost(request)
    if (res.code === 0) {
      resultData.value = res.data
      showResult.value = true
    } else {
      error("提交失败：" + (res.message || "未知错误"))
    }
  } catch (err) {
    error("网络错误，提交失败")
  } finally {
    submitting.value = false
  }
}
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
// 监听 answers 变化 → 保存到 localStorage（防抖版本更友好）
watch(
    answers,
    (newAnswers) => {
      if (!storageKey.value) return

      // 简单深拷贝，避免循环引用问题
      const toSave = JSON.parse(JSON.stringify(newAnswers))

      localStorage.setItem(storageKey.value, JSON.stringify(toSave))
      console.log('答案已保存到 localStorage')
    },
    { deep: true, debounce: 800 }  // 防抖 800ms，避免频繁写入
)
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
      error('考试时间到！系统将自动提交～')
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

// 分组后的数据
const groupedQuestions = computed(() => {
  if (!questions.value.length) return []

  const groups: ProblemItem[][] = []
  let currentGroup: ProblemItem[] = []
  let prevType: number | null = null

  questions.value.forEach(q => {
    const type = getEffectiveType(q)  // 统一处理 type

    if (type !== prevType || currentGroup.length === 0) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup)
      }
      currentGroup = [q]
      prevType = type
    } else {
      currentGroup.push(q)
    }
  })

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  return groups
})

// 获取显示用的类型名称
const getGroupTypeName = (q: ProblemItem) => {
  if (q.status === 3) return '算法题'
  switch (q.option_type) {
    case 0: return '简答题'
    case 1: return '单选题'
    case 2: return '多选题'
    case 3: return '填空题'
    case 4: return '算法题'   // 如果有独立用4表示算法题的情况
    default: return '其他题型'
  }
}

// 把 1,2,3,4... 转成 一、二、三...
const numberToChinese = (n: number) => {
  const chineseNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  if (n <= 10) return chineseNums[n - 1]
  if (n === 11) return '十一'
  // 更多可以继续扩展，或者用更通用的转换函数
  return n.toString()
}

// 统一获取“类型”，方便分组（因为算法题用 status=3 判断）
const getEffectiveType = (q: ProblemItem) => {
  if (q.status === 3) return -1   // 用一个特殊值代表算法题
  return q.option_type
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
    error('缺少考试ID参数')
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
      error('获取题目失败：' + res.message)
    }
  } catch (error) {
    error('网络错误，加载失败')
  } finally {
    loading.value = false
  }

  if (storageKey.value) {
    const saved = localStorage.getItem(storageKey.value)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        answers.value = parsed
        console.log('已从 localStorage 恢复答案')
      } catch (e) {
        console.warn('localStorage 答案解析失败，已忽略', e)
      }
    }
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

.fill-answer-area {
  padding: 12px 0;
}

.uploaded-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.image-preview-item {
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f8fafc;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  color: white;
  border: none;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}

.upload-zone {
  text-align: center;
  margin: 16px 0 24px;
}

.btn-upload {
  padding: 10px 24px;
  font-size: 1.05rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 999px;
  cursor: pointer;
}

.btn-upload:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-tip {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #64748b;
}

.fill-blank {
  /* 原来的样式 */
  margin-top: 16px;
}

.result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.4s ease;
}

.result-card {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.result-header {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 32px 24px;
  text-align: center;
  position: relative;
}

.result-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.result-icon.success {
  width: 80px;
  height: 80px;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: bold;
  margin: 16px auto 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.result-body {
  padding: 32px 28px;
}

.exam-info {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 28px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #64748b;
  font-weight: 500;
}

.value {
  font-weight: 600;
  color: #1e293b;
}

.total-score .value {
  font-size: 1.5rem;
  color: #6366f1;
}

.score-breakdown {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.score-item {
  background: #f1f5f9;
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
}

.score-label {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.score-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
}

.result-footer {
  text-align: center;
}

.tip {
  color: #64748b;
  margin-bottom: 24px;
  font-size: 0.95rem;
}

.buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 14px 32px;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s;
  border: none;
}

.btn.primary {
  background: #6366f1;
  color: white;
}

.btn.primary:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}

.btn.secondary {
  background: #e2e8f0;
  color: #1e293b;
}

.btn.secondary:hover {
  background: #cbd5e1;
  transform: translateY(-2px);
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.85); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
.result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.4s ease;
}

.result-card {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.result-header {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 32px 24px;
  text-align: center;
  position: relative;
}

.result-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.result-icon.success {
  width: 80px;
  height: 80px;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: bold;
  margin: 16px auto 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.result-body {
  padding: 32px 28px;
}

.exam-info {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 28px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #64748b;
  font-weight: 500;
}

.value {
  font-weight: 600;
  color: #1e293b;
}

.total-score .value {
  font-size: 1.5rem;
  color: #6366f1;
}

.score-breakdown {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.score-item {
  background: #f1f5f9;
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
}

.score-label {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.score-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
}

.result-footer {
  text-align: center;
}

.tip {
  color: #64748b;
  margin-bottom: 24px;
  font-size: 0.95rem;
}

.buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 14px 32px;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s;
  border: none;
}

.btn.primary {
  background: #6366f1;
  color: white;
}

.btn.primary:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}

.btn.secondary {
  background: #e2e8f0;
  color: #1e293b;
}

.btn.secondary:hover {
  background: #cbd5e1;
  transform: translateY(-2px);
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.85); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
}

.confirm-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
}

.confirm-modal h3 {
  margin: 0 0 16px;
  font-size: 1.5rem;
  color: #1e293b;
}

.confirm-modal p {
  color: #64748b;
  margin: 0 0 28px;
}

.modal-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 12px 32px;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn.cancel {
  background: #e2e8f0;
  color: #475569;
}

.btn.cancel:hover {
  background: #cbd5e1;
}

.btn.confirm {
  background: #ef4444;
  color: white;
}

.btn.confirm:hover:not(:disabled) {
  background: #dc2626;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 提交中加载 */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1800;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #e2e8f0;
  border-top: 6px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px;
}

.loading-spinner small {
  color: #64748b;
}

/* 动画过渡 */
.modal-fade-enter-active, .modal-fade-leave-active,
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to,
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.btn-submit {
  width: 100%;
  padding: 18px 32px;
  font-size: 1.22rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.35);
  position: relative;
  overflow: hidden;
}

.btn-submit:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.45);
}

.btn-submit:active {
  transform: translateY(1px);
  box-shadow: 0 5px 15px rgba(99, 102, 241, 0.3);
}

.question-nav-wrapper {
  padding: 20px;
}

.group-title {
  font-weight: 700;
  color: #475569;
  padding: 12px 8px 6px;
  font-size: 1.05rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 12px;
  background: #f8fafc;
  border-radius: 8px 8px 0 0;
}

.group-nav {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #cbd5e1;
}

.group-nav:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

/* 让分组之间的间距更明显一点 */
.group-nav + .group-title {
  margin-top: 20px;
}
</style>