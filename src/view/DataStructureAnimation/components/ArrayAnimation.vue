<template>
  <g class="array-animation">
    <!-- 数组标题 -->
    <g class="array-title">
      <text
        :x="arrayStartX + (props.data.length * elementWidth) / 2"
        y="120"
        text-anchor="middle"
        fill="#2c3e50"
        font-size="18"
        font-weight="bold"
      >
        数组可视化
      </text>
    </g>
    
    <!-- 数组元素 -->
    <g
      v-for="(element, index) in animatedElements"
      :key="index"
      class="array-element"
      :transform="`translate(${element.x}, ${element.y})`"
    >
      <!-- 元素背景 -->
      <rect
        x="-25"
        y="-20"
        width="50"
        height="40"
        :fill="getElementFill(element, index)"
        :stroke="getElementStroke(element, index)"
        stroke-width="2"
        rx="4"
        class="element-rect"
      />
      
      <!-- 元素值 -->
      <text
        x="0"
        y="5"
        text-anchor="middle"
        fill="white"
        font-size="14"
        font-weight="bold"
        class="element-text"
      >
        {{ element.value }}
      </text>
      
      <!-- 索引标签 -->
      <text
        x="0"
        y="-35"
        text-anchor="middle"
        fill="#7f8c8d"
        font-size="12"
        class="element-index"
      >
        [{{ index }}]
      </text>
    </g>
    
    <!-- 数组边界线 -->
    <g class="array-boundary">
      <line
        :x1="arrayStartX - 35"
        :y1="elementY - 35"
        :x2="arrayStartX - 35"
        :y2="elementY + 35"
        stroke="#2c3e50"
        stroke-width="3"
      />
      <line
        :x1="arrayEndX + 35"
        :y1="elementY - 35"
        :x2="arrayEndX + 35"
        :y2="elementY + 35"
        stroke="#2c3e50"
        stroke-width="3"
      />
    </g>
    
    <!-- 操作指示器 -->
    <g v-if="currentHighlight" class="operation-highlight">
      <circle
        :cx="currentHighlight.x"
        :cy="currentHighlight.y"
        r="35"
        fill="none"
        :stroke="currentHighlight.color"
        stroke-width="3"
        stroke-dasharray="5,5"
        class="highlight-circle"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-10"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
    
    <!-- 新元素动画 -->
    <g v-if="newElementAnimation" class="new-element-animation">
      <g :transform="`translate(${newElementAnimation.x}, ${newElementAnimation.y})`">
        <rect
          x="-25"
          y="-20"
          width="50"
          height="40"
          fill="#f39c12"
          stroke="#e67e22"
          stroke-width="2"
          rx="4"
          class="new-element-rect"
        >
          <animate
            attributeName="opacity"
            values="0;1;1;0.7"
            dur="1s"
            repeatCount="indefinite"
          />
        </rect>
        <text
          x="0"
          y="5"
          text-anchor="middle"
          fill="white"
          font-size="14"
          font-weight="bold"
        >
          {{ newElementAnimation.value }}
        </text>
        <text
          x="0"
          y="-45"
          text-anchor="middle"
          fill="#f39c12"
          font-size="12"
          font-weight="bold"
        >
          NEW
        </text>
      </g>
    </g>
    
    <!-- 步骤描述显示 -->
    <g v-if="stepDescription" class="step-description">
      <rect
        x="10"
        y="10"
        width="350"
        height="60"
        fill="rgba(255, 255, 255, 0.95)"
        stroke="#3498db"
        stroke-width="2"
        rx="8"
        class="description-box"
      />
      <text
        x="20"
        y="30"
        fill="#2c3e50"
        font-size="14"
        font-weight="bold"
      >
        {{ stepDescription.title }}
      </text>
      <text
        x="20"
        y="50"
        fill="#34495e"
        font-size="12"
      >
        {{ stepDescription.content }}
      </text>
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ArrayElement {
  value: number
  index: number
}

interface AnimationState {
  steps?: any[]
  currentOperation?: string
  highlightedElement?: number
  newElement?: { value: number, position: string }
}

const props = defineProps<{
  data: ArrayElement[]
  animationState: AnimationState
  currentStep: number
}>()

// 响应式数据
const elementWidth = 60
const elementHeight = 40
const arrayStartX = 150
const elementY = 200

// 计算元素位置
const animatedElements = computed(() => {
  return props.data.map((element, index) => ({
    ...element,
    x: arrayStartX + index * elementWidth,
    y: elementY
  }))
})

// 计算数组结束位置
const arrayEndX = computed(() => {
  return arrayStartX + (props.data.length - 1) * elementWidth
})

// 当前高亮
const currentHighlight = computed(() => {
  if (!props.animationState.steps || props.currentStep < 0) return null
  
  const currentStepData = props.animationState.steps[props.currentStep]
  if (!currentStepData || currentStepData.highlightElement === undefined) return null
  
  const element = animatedElements.value[currentStepData.highlightElement]
  if (!element) return null
  
  return {
    x: element.x,
    y: element.y,
    color: currentStepData.highlightColor || '#f39c12'
  }
})

// 新元素动画
const newElementAnimation = computed(() => {
  if (!props.animationState.steps || props.currentStep < 0) return null
  
  const currentStepData = props.animationState.steps[props.currentStep]
  if (!currentStepData || !currentStepData.showNewElement) return null
  
  // 根据位置确定新元素坐标
  let x = arrayStartX - 100 // 默认在左侧
  let y = elementY
  
  if (currentStepData.newElementPosition === 'right') {
    x = arrayEndX.value + 100
  } else if (currentStepData.newElementPosition === 'center') {
    x = arrayStartX + (props.data.length / 2) * elementWidth
    y = elementY - 80 // 在上方显示
  }
  
  return {
    x,
    y,
    value: currentStepData.newElementValue
  }
})

// 步骤描述
const stepDescription = computed(() => {
  if (!props.animationState.steps || props.currentStep < 0) return null
  
  const currentStepData = props.animationState.steps[props.currentStep]
  if (!currentStepData) return null
  
  return {
    title: currentStepData.description || '',
    content: currentStepData.stepDescription || ''
  }
})

// 获取元素填充色
const getElementFill = (element: any, index: number) => {
  if (!props.animationState.steps || props.currentStep < 0) return '#3498db'
  
  const currentStepData = props.animationState.steps[props.currentStep]
  
  // 高亮当前操作的元素
  if (currentStepData?.highlightElement === index) {
    return currentStepData.highlightColor || '#f39c12'
  }
  
  // 查找操作中匹配的元素
  if (props.animationState.currentOperation === 'search' && 
      currentStepData?.searchValue === element.value) {
    return '#27ae60'
  }
  
  // 删除操作中标记要删除的元素
  if (props.animationState.currentOperation === 'delete' && 
      currentStepData?.deleteValue === element.value) {
    return '#e74c3c'
  }
  
  return '#3498db'
}

// 获取元素边框色
const getElementStroke = (element: any, index: number) => {
  const fill = getElementFill(element, index)
  const colorMap: Record<string, string> = {
    '#3498db': '#2980b9',
    '#f39c12': '#e67e22',
    '#27ae60': '#229954',
    '#e74c3c': '#c0392b'
  }
  return colorMap[fill] || '#2980b9'
}
</script>

<style scoped>
.array-animation {
  user-select: none;
}

.element-rect {
  transition: all 0.3s ease;
}

.element-text {
  pointer-events: none;
}

.element-index {
  pointer-events: none;
}

.highlight-circle {
  pointer-events: none;
}

.new-element-rect {
  filter: drop-shadow(0 0 8px rgba(243, 156, 18, 0.6));
}

.description-box {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.array-boundary line {
  stroke-linecap: round;
}
</style>