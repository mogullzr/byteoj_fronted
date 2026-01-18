<!-- LinkedListVisualizer.vue (父组件) -->
<template>
  <div class="data-structure-animation-page">
    <!-- 临时调试信息（可选移除） -->
    <div v-if="debugMode" class="debug-info">
      当前步骤: {{ currentStep }} | 操作: {{ activeOperation }} | 步骤总数: {{ totalSteps }}
    </div>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">单链表可视化动画</h1>
      <p class="page-subtitle">互动学习单链表操作：头插、尾插、查找、删除、位置插入与查找</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧操作面板 -->
      <div class="operation-panel">
        <div class="section-card">
          <h3 class="section-title">操作选择</h3>
          <div class="operation-buttons">
            <button
                v-for="operation in operations"
                :key="operation.id"
                :class="['operation-btn', { active: activeOperation === operation.id }]"
                @click="selectOperation(operation.id)"
            >
              {{ operation.name }}
            </button>
          </div>
          <div v-if="activeOperationData" class="operation-params">
            <h4 class="params-title">参数设置</h4>
            <div
                v-for="param in activeOperationData.params"
                :key="param.name"
                class="param-input-group"
            >
              <label :for="param.name" class="param-label">{{ param.label }}</label>
              <input
                  :id="param.name"
                  v-model="operationParams[param.name]"
                  :type="param.type"
                  :placeholder="param.placeholder"
                  :min="param.min"
                  :max="param.max"
                  class="param-input"
                  @input="validateParam(param.name)"
              />
              <span v-if="paramErrors[param.name]" class="param-error">{{ paramErrors[param.name] }}</span>
            </div>
            <button @click="executeOperation" :disabled="!canExecute" class="execute-btn">
              <i class="fas fa-play"></i> 执行操作
            </button>
          </div>
          <div class="quick-demo">
            <h4 class="demo-title">快速演示</h4>
            <div class="demo-buttons">
              <button
                  v-for="demo in quickDemos"
                  :key="demo.name"
                  @click="runQuickDemo(demo)"
                  class="demo-btn"
              >
                {{ demo.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间动画区域 -->
      <div class="animation-area">
        <div class="section-card">
          <div class="animation-header">
            <h3 class="section-title">动画演示</h3>
            <button @click="showGuide = true" class="guide-btn">
              <i class="fas fa-question-circle"></i> 使用指南
            </button>
          </div>
          <div class="animation-controls">
            <button @click="resetAnimation" class="control-btn reset">
              <i class="fas fa-undo"></i> 重置
            </button>
            <button @click="stepBackward" :disabled="currentStep <= 0" class="control-btn">
              <i class="fas fa-step-backward"></i> 上一步
            </button>
            <button
                @click="isPlaying ? pauseAnimation() : playAnimation()"
                :disabled="!canPlay"
                class="control-btn play-pause"
            >
              <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
              {{ isPlaying ? '暂停' : '播放' }}
            </button>
            <button
                @click="stepForward"
                :disabled="currentStep >= totalSteps - 1"
                class="control-btn"
            >
              <i class="fas fa-step-forward"></i> 下一步
            </button>
            <div class="speed-control">
              <label class="speed-label">速度</label>
              <input
                  v-model="animationSpeed"
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  class="speed-slider"
              />
              <span class="speed-value">{{ animationSpeed }}x</span>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <span class="progress-text">{{ currentStep + 1 }} / {{ totalSteps }}</span>
          </div>
          <div
              class="animation-canvas"
              :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
          >
            <svg :width="canvasWidth" :height="canvasHeight" class="animation-svg">
              <linked-list-animation
                  :data="structureData"
                  :animation-state="animationState"
                  :current-step="currentStep"
              />
            </svg>
          </div>
          <div v-if="currentStepDescription" class="step-description">
            <h4 class="step-title">当前步骤</h4>
            <p class="step-text">{{ currentStepDescription }}</p>
          </div>
          <div v-if="errorMessage" class="error-message">
            <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
          </div>
        </div>
      </div>

      <!-- 右侧信息面板 -->
      <div class="info-panel">
        <div class="section-card">
          <h3 class="section-title">算法分析</h3>
          <div class="analysis-tabs">
            <button
                :class="['analysis-tab', { active: activeTab === 'complexity' }]"
                @click="activeTab = 'complexity'"
            >
              复杂度
            </button>
            <button
                :class="['analysis-tab', { active: activeTab === 'explanation' }]"
                @click="activeTab = 'explanation'"
            >
              原理解释
            </button>
            <button
                :class="['analysis-tab', { active: activeTab === 'keypoints' }]"
                @click="activeTab = 'keypoints'"
            >
              关键要点
            </button>
          </div>
          <div class="analysis-content">
            <div v-if="activeTab === 'complexity'" class="complexity-info">
              <div class="complexity-item">
                <span class="complexity-label">时间复杂度:</span>
                <code class="complexity-value">{{ currentOperationComplexity.time }}</code>
              </div>
              <div class="complexity-item">
                <span class="complexity-label">空间复杂度:</span>
                <code class="complexity-value">{{ currentOperationComplexity.space }}</code>
              </div>
            </div>
            <div v-else-if="activeTab === 'explanation'" class="explanation-content">
              <p>{{ currentOperationExplanation }}</p>
            </div>
            <div v-else-if="activeTab === 'keypoints'" class="keypoints-content">
              <ul class="keypoints-list">
                <li v-for="(point, idx) in currentOperationKeyPoints" :key="idx" class="keypoint-item">
                  {{ point }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="section-card">
          <h3 class="section-title">代码实现 (JavaScript)</h3>
          <pre class="code-block"><code v-html="highlightedCurrentOperationCode"></code></pre>
        </div>
      </div>
    </div>

    <!-- 使用指南弹窗 -->
    <div v-if="showGuide" class="guide-modal">
      <div class="guide-content">
        <h2>使用指南</h2>
        <p>1. 选择左侧操作。</p>
        <p>2. 输入参数并执行。</p>
        <p>3. 使用控制按钮播放动画。</p>
        <p>4. 查看右侧分析和代码。</p>
        <button @click="showGuide = false">关闭</button>
        <button @click="dontShowGuide = true; showGuide = false">不再显示</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
hljs.registerLanguage('javascript', javascript)
import LinkedListAnimation from '@/view/DataStructureAnimation/components/LinkedListAnimation.vue'

// 响应式状态
const activeOperation = ref<string>('')
const operationParams = reactive<Record<string, any>>({})
const paramErrors = reactive<Record<string, string>>({})
const animationSpeed = ref<number>(1)
const isPlaying = ref<boolean>(false)
const currentStep = ref<number>(0)
const totalSteps = ref<number>(0)
const structureData = ref<Array<{ id: number; value: number; next: number | null }>>([])
const animationState = reactive<{
  steps: Array<any>
  currentOperation: string
  highlightedNode: number
  newNode: { value: number; position: string } | null
  deletedNode: { index: number; value: number } | null
  foundNode: number
}>({
  steps: [],
  currentOperation: '',
  highlightedNode: -1,
  newNode: null,
  deletedNode: null,
  foundNode: -1
})
const canvasWidth = computed(() => {
  const count = structureData.value.length || 1
  return Math.max(800, 180 + count * 200)
})
const canvasHeight = ref<number>(200)
const activeTab = ref<string>('complexity')
const showGuide = ref<boolean>(true)
const dontShowGuide = ref<boolean>(false)
const errorMessage = ref<string>('')
const debugMode = ref<boolean>(false) // 可切换调试

// 操作配置
const operations = [
  { id: 'insert_head', name: '头插法', params: [{ name: 'value', label: '值', type: 'number', placeholder: '1-999', min: 1, max: 999 }] },
  { id: 'insert_tail', name: '尾插法', params: [{ name: 'value', label: '值', type: 'number', placeholder: '1-999', min: 1, max: 999 }] },
  { id: 'search', name: '查找元素', params: [{ name: 'value', label: '查找值', type: 'number', placeholder: '输入值' }] },
  { id: 'delete', name: '删除元素', params: [{ name: 'value', label: '删除值', type: 'number', placeholder: '输入值' }] },
  { id: 'insert_at_index', name: '位置插入', params: [
      { name: 'index', label: '位置 (从0)', type: 'number', placeholder: '0+', min: 0 },
      { name: 'value', label: '值', type: 'number', placeholder: '1-999', min: 1, max: 999 }
    ] },
  { id: 'search_at_index', name: '位置查找', params: [{ name: 'index', label: '位置 (从0)', type: 'number', placeholder: '0+', min: 0 }] }
]

// 快速演示
const quickDemos = [
  { name: '基本操作', operations: [
      { id: 'insert_head', params: { value: 5 } },
      { id: 'insert_tail', params: { value: 15 } },
      { id: 'search', params: { value: 5 } }
    ] },
  { name: '删除与插入', operations: [
      { id: 'insert_at_index', params: { index: 1, value: 10 } },
      { id: 'delete', params: { value: 10 } }
    ] }
]

// 计算属性
const activeOperationData = computed(() => operations.find(op => op.id === activeOperation.value) || null)
const canPlay = computed(() => totalSteps.value > 0)
const progressPercentage = computed(() => totalSteps.value ? (currentStep.value / (totalSteps.value - 1)) * 100 : 0)
const currentStepDescription = computed(() => animationState.steps[currentStep.value]?.stepDescription || '')
const currentOperationComplexity = computed(() => {
  const map = {
    insert_head: { time: 'O(1)', space: 'O(1)' },
    insert_tail: { time: 'O(n)', space: 'O(1)' },
    search: { time: 'O(n)', space: 'O(1)' },
    delete: { time: 'O(n)', space: 'O(1)' },
    insert_at_index: { time: 'O(n)', space: 'O(1)' },
    search_at_index: { time: 'O(n)', space: 'O(1)' }
  }
  return map[activeOperation.value] || { time: 'N/A', space: 'N/A' }
})
const currentOperationExplanation = computed(() => {
  const map = {
    insert_head: '在链表头部插入新节点：创建节点，next指向原头，更新头指针。',
    insert_tail: '在尾部插入：遍历找尾，尾next指向新节点。',
    search: '从头遍历比较值，直到找到或末尾。',
    delete: '遍历找目标前驱，修改next跳过目标。',
    insert_at_index: '遍历到index-1，插入新节点调整指针。',
    search_at_index: '遍历index步，返回值。'
  }
  return map[activeOperation.value] || '无解释'
})
const currentOperationKeyPoints = computed(() => {
  const map = {
    insert_head: ['O(1) 时间', '更新头', 'next指向原头'],
    insert_tail: ['O(n) 时间', '遍历尾', '尾next新节点'],
    search: ['O(n) 时间', '顺序比较', '返回位置或null'],
    delete: ['O(n) 时间', '找前驱', '修改next'],
    insert_at_index: ['O(n) 时间', '遍历index', '调整指针'],
    search_at_index: ['O(n) 时间', '遍历index', '返回值']
  }
  return map[activeOperation.value] || []
})
const currentOperationCode = computed(() => {
  const codeMap = {
    insert_head: `
class Node {
  constructor(val) {
    this.value = val;
    this.next = null;
  }
}
class LinkedList {
  constructor() {
    this.head = null;
  }
  insertHead(val) {
    const newNode = new Node(val);
    newNode.next = this.head;
    this.head = newNode;
  }
}`,
    // 类似为每个操作提供完整代码
    insert_tail: `
class LinkedList {
  // ...
  insertTail(val) {
    const newNode = new Node(val);
    if (!this.head) {
      this.head = newNode;
      return;
    }
    let curr = this.head;
    while (curr.next) curr = curr.next;
    curr.next = newNode;
  }
}`,
    search: `
class LinkedList {
  // ...
  search(val) {
    let curr = this.head;
    let index = 0;
    while (curr) {
      if (curr.value === val) return index;
      curr = curr.next;
      index++;
    }
    return -1;
  }
}`,
    delete: `
class LinkedList {
  // ...
  delete(val) {
    if (!this.head) return;
    if (this.head.value === val) {
      this.head = this.head.next;
      return;
    }
    let curr = this.head;
    while (curr.next) {
      if (curr.next.value === val) {
        curr.next = curr.next.next;
        return;
      }
      curr = curr.next;
    }
  }
}`,
    insert_at_index: `
class LinkedList {
  // ...
  insertAtIndex(index, val) {
    if (index < 0) return;
    const newNode = new Node(val);
    if (index === 0) {
      newNode.next = this.head;
      this.head = newNode;
      return;
    }
    let curr = this.head;
    let i = 0;
    while (curr && i < index - 1) {
      curr = curr.next;
      i++;
    }
    if (curr) {
      newNode.next = curr.next;
      curr.next = newNode;
    }
  }
}`,
    search_at_index: `
class LinkedList {
  // ...
  getAtIndex(index) {
    if (index < 0) return null;
    let curr = this.head;
    let i = 0;
    while (curr && i < index) {
      curr = curr.next;
      i++;
    }
    return curr ? curr.value : null;
  }
}`
  }
  return codeMap[activeOperation.value] || '// 无代码'
})
const highlightedCurrentOperationCode = computed(() => hljs.highlight(currentOperationCode.value, { language: 'javascript' }).value)

const canExecute = computed(() => {
  if (!activeOperationData.value) return false
  return !Object.values(paramErrors).some(err => err)
})

// 方法
const validateParam = (name: string) => {
  const param = activeOperationData.value?.params.find(p => p.name === name)
  if (!param) return
  const val = operationParams[name]
  if (val === '' || val === null || val === undefined) {
    paramErrors[name] = '不能为空'
    return
  }
  const num = Number(val)
  if (isNaN(num)) {
    paramErrors[name] = '必须数字'
    return
  }
  if (param.min !== undefined && num < param.min) paramErrors[name] = `最小 ${param.min}`
  if (param.max !== undefined && num > param.max) paramErrors[name] = `最大 ${param.max}`
  if (name === 'index' && num > structureData.value.length) paramErrors[name] = `超出长度 (${structureData.value.length})`
  if (!paramErrors[name]) delete paramErrors[name]
}
const selectOperation = (id: string) => {
  activeOperation.value = id
  Object.keys(operationParams).forEach(k => delete operationParams[k])
  Object.keys(paramErrors).forEach(k => delete paramErrors[k])
  errorMessage.value = ''
}
const executeOperation = () => {
  if (!canExecute.value) return
  errorMessage.value = ''
  try {
    const steps = generateAnimationSteps(activeOperation.value, operationParams)
    animationState.steps = steps
    animationState.currentOperation = activeOperation.value
    totalSteps.value = steps.length
    currentStep.value = 0
  } catch (e) {
    errorMessage.value = (e as Error).message
  }
}
const playAnimation = () => {
  isPlaying.value = true
  const interval = setInterval(() => {
    if (currentStep.value >= totalSteps.value - 1 || !isPlaying.value) {
      clearInterval(interval)
      isPlaying.value = false
      applyDataChanges()
      return
    }
    stepForward()
  }, 1000 / animationSpeed.value)
}
const pauseAnimation = () => isPlaying.value = false
const stepForward = () => currentStep.value < totalSteps.value - 1 && currentStep.value++
const stepBackward = () => currentStep.value > 0 && currentStep.value--
const resetAnimation = () => {
  isPlaying.value = false
  currentStep.value = 0
  animationState.steps = []
  totalSteps.value = 0
  errorMessage.value = ''
  initializeStructureData()
}
const runQuickDemo = async (demo: any) => {
  resetAnimation()
  for (const op of demo.operations) {
    selectOperation(op.id)
    Object.assign(operationParams, op.params)
    executeOperation()
    playAnimation()
    await new Promise(resolve => {
      const timer = setInterval(() => {
        if (!isPlaying.value) {
          clearInterval(timer)
          resolve(null)
        }
      }, 100)
    })
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}
const generateAnimationSteps = (op: string, params: any) => {
  const steps: any[] = []
  const value = Number(params.value)
  const index = Number(params.index)
  animationState.highlightedNode = -1
  animationState.newNode = null
  animationState.deletedNode = null
  animationState.foundNode = -1

  switch (op) {
    case 'insert_head':
      animationState.newNode = { value, position: 'left' }
      steps.push({ type: 'create_node', stepDescription: `创建新节点值 ${value}` })
      steps.push({ type: 'link_to_head', stepDescription: '新next -> 原头', showPointerChange: true, pointerTo: 'head' })
      steps.push({ type: 'update_head', stepDescription: '头 -> 新节点', showHeadPointerChange: true })
      steps.push({ type: 'complete', stepDescription: '头插完成' })
      break
    case 'insert_tail':
      animationState.newNode = { value, position: 'right' }
      steps.push({ type: 'create_node', stepDescription: `创建新节点值 ${value}` })
      if (!structureData.value.length) {
        steps.push({ type: 'set_head', stepDescription: '空链表，设头' })
      } else {
        structureData.value.forEach((_, i) => {
          steps.push({ type: 'traverse', stepDescription: `遍历节点 ${i + 1}`, highlightNode: i })
        })
        steps.push({ type: 'link_tail', stepDescription: '尾next -> 新', showPointerChange: true, pointerFrom: structureData.value.length - 1 })
      }
      steps.push({ type: 'complete', stepDescription: '尾插完成' })
      break
    case 'search':
      let found = false
      structureData.value.forEach((node, i) => {
        if (found) return
        steps.push({ type: 'check_node', stepDescription: `检查节点 ${i + 1} 值 ${node.value}`, highlightNode: i })
        if (node.value === value) {
          found = true
          animationState.foundNode = i
        }
      })
      if (!found) steps.push({ type: 'not_found', stepDescription: '未找到' })
      break
    case 'delete':
      let delIndex = -1
      structureData.value.forEach((node, i) => {
        if (delIndex !== -1) return
        steps.push({ type: 'check_node', stepDescription: `检查节点 ${i + 1}`, highlightNode: i })
        if (node.value === value) delIndex = i
      })
      if (delIndex === -1) {
        steps.push({ type: 'not_found', stepDescription: '未找到' })
      } else {
        animationState.deletedNode = { index: delIndex, value }
        steps.push({ type: 'mark_delete', stepDescription: '标记删除' })
        if (delIndex === 0) {
          steps.push({ type: 'update_head', stepDescription: '更新头' })
        } else {
          steps.push({ type: 'link_prev', stepDescription: '前next -> 次', highlightNode: delIndex - 1, showPointerChange: true })
        }
        steps.push({ type: 'complete', stepDescription: '删除完成' })
      }
      break
    case 'insert_at_index':
      if (index > structureData.value.length) throw new Error('索引超出')
      animationState.newNode = { value, position: `index:${index}` }
      steps.push({ type: 'create_node', stepDescription: `创建新节点 ${value}` })
      if (index === 0) {
        steps.push({ type: 'link_to_head', stepDescription: '新next -> 原头' })
        steps.push({ type: 'update_head', stepDescription: '头 -> 新' })
      } else {
        for (let i = 0; i < index - 1; i++) {
          steps.push({ type: 'traverse', stepDescription: `遍历到 ${i + 1}`, highlightNode: i })
        }
        steps.push({ type: 'link_new', stepDescription: '新next -> 原位' })
        steps.push({ type: 'link_prev', stepDescription: '前next -> 新', highlightNode: index - 1, showPointerChange: true })
      }
      steps.push({ type: 'complete', stepDescription: '插入完成', index })
      break
    case 'search_at_index':
      if (index >= structureData.value.length) throw new Error('索引超出')
      for (let i = 0; i <= index; i++) {
        steps.push({ type: 'traverse', stepDescription: `遍历到 ${i + 1}`, highlightNode: i })
      }
      animationState.foundNode = index
      break
    default:
      throw new Error('未知操作')
  }
  return steps
}
const applyDataChanges = () => {
  const op = animationState.currentOperation
  const params = operationParams
  const value = Number(params.value)
  const index = Number(params.index)
  const newId = Date.now()
  switch (op) {
    case 'insert_head':
      structureData.value.unshift({ id: newId, value, next: structureData.value[0]?.id || null })
      break
    case 'insert_tail':
      const newNode = { id: newId, value, next: null }
      if (structureData.value.length) structureData.value[structureData.value.length - 1].next = newId
      structureData.value.push(newNode)
      break
    case 'delete':
      const delIdx = structureData.value.findIndex(n => n.value === value)
      if (delIdx > -1) {
        if (delIdx === 0) {
          structureData.value.shift()
        } else {
          structureData.value[delIdx - 1].next = structureData.value[delIdx].next
          structureData.value.splice(delIdx, 1)
        }
      }
      break
    case 'insert_at_index':
      const newNodeI = { id: newId, value, next: structureData.value[index]?.id || null }
      if (index === 0) {
        structureData.value.unshift(newNodeI)
      } else {
        structureData.value[index - 1].next = newId
        structureData.value.splice(index, 0, newNodeI)
      }
      break
      // search 和 search_at_index 不改变数据
  }
  // 更新画布宽度
  canvasWidth.value = Math.max(800, 200 + structureData.value.length * 160)
}
const initializeStructureData = () => {
  structureData.value = [
    { id: 1, value: 10, next: 2 },
    { id: 2, value: 20, next: 3 },
    { id: 3, value: 30, next: null }
  ]
  canvasWidth.value = 800
}

// 生命周期钩子
onMounted(() => {
  initializeStructureData()
  if (!dontShowGuide.value) showGuide.value = true
})

// 监视
watch(operationParams, () => Object.keys(operationParams).forEach(validateParam), { deep: true })
watch(structureData, () => canvasWidth.value = Math.max(800, 200 + structureData.value.length * 160), { deep: true })
</script>

<style scoped>
/* 页面布局 */
.data-structure-animation-page {
  min-height: 100vh;
  background: #f4f6f9;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 调试 */
.debug-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: #ff0000;
  color: #fff;
  padding: 10px;
  z-index: 1000;
}

/* 标题 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
}
.page-title {
  font-size: 2.2rem;
  color: #2c3e50;
}
.page-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
}

/* 内容网格 */
.main-content {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 卡片 */
.section-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* 操作按钮 */
.operation-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.operation-btn {
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.operation-btn:hover {
  background: #e9ecef;
}
.operation-btn.active {
  background: #3498db;
  color: #fff;
}

/* 参数输入 */
.operation-params {
  margin-top: 20px;
}
.params-title {
  font-size: 1rem;
  margin-bottom: 10px;
}
.param-input-group {
  margin-bottom: 15px;
}
.param-label {
  display: block;
  margin-bottom: 5px;
  color: #555;
}
.param-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.param-error {
  color: #e74c3c;
  font-size: 0.8rem;
}
.execute-btn {
  width: 100%;
  padding: 10px;
  background: #27ae60;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.execute-btn:disabled {
  background: #95a5a6;
}

/* 快速演示 */
.quick-demo {
  margin-top: 20px;
}
.demo-title {
  font-size: 1rem;
  margin-bottom: 10px;
}
.demo-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.demo-btn {
  padding: 8px;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  cursor: pointer;
}

/* 动画头部 */
.animation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.guide-btn {
  padding: 8px 12px;
  background: #17a2b8;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 控制面板 */
.animation-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}
.control-btn {
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}
.play-pause {
  background: #28a745;
  color: #fff;
}
.reset {
  background: #dc3545;
  color: #fff;
}
.speed-control {
  display: flex;
  align-items: center;
  gap: 5px;
}
.speed-slider {
  width: 100px;
}

/* 进度条 */
.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.progress-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
}
.progress-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s;
}
.progress-text {
  font-size: 0.9rem;
  color: #6c757d;
}

/* 动画画布 */
.animation-canvas {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

/* 步骤描述 */
.step-description {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}
.step-title {
  font-size: 1rem;
  margin-bottom: 5px;
}
.step-text {
  font-size: 0.9rem;
  color: #495057;
}

/* 错误消息 */
.error-message {
  margin-top: 15px;
  padding: 10px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 分析选项卡 */
.analysis-tabs {
  display: flex;
  background: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
}
.analysis-tab {
  flex: 1;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s;
}
.analysis-tab.active {
  background: #fff;
  font-weight: bold;
}
.analysis-content {
  padding: 15px;
  min-height: 150px;
}
.complexity-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.complexity-item {
  display: flex;
  justify-content: space-between;
}
.complexity-value {
  background: #f8f9fa;
  padding: 5px 10px;
  border-radius: 4px;
}
.keypoints-list {
  padding-left: 20px;
}
.keypoint-item {
  margin-bottom: 5px;
}

/* 代码块 */
.code-block {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'Consolas', monospace;
  font-size: 0.9rem;
}

/* 指南模态 */
.guide-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.guide-content {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  max-width: 400px;
  text-align: center;
}
.guide-content h2 {
  margin-bottom: 20px;
}
.guide-content p {
  margin-bottom: 10px;
}
.guide-content button {
  margin: 10px 5px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.guide-content button:first-of-type {
  background: #3498db;
  color: #fff;
}
.guide-content button:last-of-type {
  background: #6c757d;
  color: #fff;
}

/* 响应式 */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}
</style>