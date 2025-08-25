<template>
  <g class="stack-animation">
    <!-- 栈底标识 -->
    <g class="stack-base">
      <rect
        :x="stackX - 60"
        :y="baseY - 10"
        width="120"
        height="20"
        fill="#34495e"
        stroke="#2c3e50"
        stroke-width="2"
        rx="4"
      />
      <text
        :x="stackX"
        :y="baseY + 30"
        text-anchor="middle"
        fill="#2c3e50"
        font-size="14"
        font-weight="bold"
      >
        栈底 (Bottom)
      </text>
    </g>
    
    <!-- 栈壁 -->
    <g class="stack-walls">
      <line
        :x1="stackX - 50"
        :y1="baseY - 10"
        :x2="stackX - 50"
        :y2="topY - 20"
        stroke="#2c3e50"
        stroke-width="3"
      />
      <line
        :x1="stackX + 50"
        :y1="baseY - 10"
        :x2="stackX + 50"
        :y2="topY - 20"
        stroke="#2c3e50"
        stroke-width="3"
      />
    </g>
    
    <!-- 栈元素 -->
    <g
      v-for="(element, index) in animatedStack"
      :key="index"
      :transform="`translate(${stackX}, ${getElementY(index)})`"
      class="stack-element"
    >
      <!-- 元素背景 -->
      <rect
        x="-40"
        y="-20"
        width="80"
        height="35"
        :fill="getElementFill(element, index)"
        :stroke="getElementStroke(element, index)"
        stroke-width="2"
        rx="4"
        class="element-rect"
      />
      
      <!-- 元素值 -->
      <text
        x="0"
        y="2"
        text-anchor="middle"
        :fill="getTextColor(element, index)"
        font-size="14"
        font-weight="bold"
        class="element-text"
      >
        {{ element }}
      </text>
      
      <!-- 索引标签 -->
      <text
        x="-60"
        y="2"
        text-anchor="middle"
        fill="#7f8c8d"
        font-size="12"
        class="index-label"
      >
        {{ index }}
      </text>
    </g>
    
    <!-- 栈顶指针 -->
    <g v-if="animatedStack.length > 0" class="top-pointer">
      <text
        :x="stackX + 80"
        :y="getElementY(animatedStack.length - 1) + 5"
        text-anchor="start"
        fill="#e74c3c"
        font-size="14"
        font-weight="bold"
      >
        ← TOP
      </text>
      <line
        :x1="stackX + 50"
        :y1="getElementY(animatedStack.length - 1)"
        :x2="stackX + 75"
        :y2="getElementY(animatedStack.length - 1)"
        stroke="#e74c3c"
        stroke-width="2"
        marker-end="url(#topArrowhead)"
      />
    </g>
    
    <!-- 空栈指示 -->
    <g v-if="animatedStack.length === 0" class="empty-stack">
      <text
        :x="stackX"
        :y="baseY - 40"
        text-anchor="middle"
        fill="#95a5a6"
        font-size="16"
        font-style="italic"
      >
        栈为空 (Empty)
      </text>
    </g>
    
    <!-- 入栈动画元素 -->
    <g v-if="pushAnimation" class="push-animation">
      <g :transform="`translate(${stackX}, ${pushAnimation.y})`">
        <rect
          x="-40"
          y="-20"
          width="80"
          height="35"
          fill="#27ae60"
          stroke="#229954"
          stroke-width="2"
          rx="4"
          class="push-rect"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            :values="`0,-100; 0,0`"
            dur="0.8s"
            fill="freeze"
          />
        </rect>
        <text
          x="0"
          y="2"
          text-anchor="middle"
          fill="white"
          font-size="14"
          font-weight="bold"
        >
          {{ pushAnimation.value }}
        </text>
        <text
          x="0"
          y="-35"
          text-anchor="middle"
          fill="#27ae60"
          font-size="12"
          font-weight="bold"
        >
          PUSH
        </text>
      </g>
    </g>
    
    <!-- 出栈动画元素 -->
    <g v-if="popAnimation" class="pop-animation">
      <g :transform="`translate(${stackX}, ${popAnimation.y})`">
        <rect
          x="-40"
          y="-20"
          width="80"
          height="35"
          fill="#e74c3c"
          stroke="#c0392b"
          stroke-width="2"
          rx="4"
          class="pop-rect"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-100"
            dur="0.8s"
            fill="freeze"
          />
          <animate
            attributeName="opacity"
            values="1;1;0"
            dur="0.8s"
            fill="freeze"
          />
        </rect>
        <text
          x="0"
          y="2"
          text-anchor="middle"
          fill="white"
          font-size="14"
          font-weight="bold"
        >
          {{ popAnimation.value }}
        </text>
        <text
          x="0"
          y="-35"
          text-anchor="middle"
          fill="#e74c3c"
          font-size="12"
          font-weight="bold"
        >
          POP
        </text>
      </g>
    </g>
    
    <!-- 操作高亮指示器 -->
    <g v-if="operationHighlight" class="operation-highlight">
      <rect
        :x="stackX - 45"
        :y="operationHighlight.y - 25"
        width="90"
        height="45"
        fill="none"
        :stroke="operationHighlight.color"
        stroke-width="3"
        stroke-dasharray="5,5"
        rx="4"
        class="highlight-rect"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;10"
          dur="1s"
          repeatCount="indefinite"
        />
      </rect>
    </g>
    
    <!-- 栈信息面板 -->
    <g class="stack-info">
      <rect
        :x="stackX + 150"
        :y="topY"
        width="120"
        height="80"
        fill="#ecf0f1"
        stroke="#bdc3c7"
        stroke-width="1"
        rx="8"
      />
      <text
        :x="stackX + 210"
        :y="topY + 20"
        text-anchor="middle"
        fill="#2c3e50"
        font-size="14"
        font-weight="bold"
      >
        栈信息
      </text>
      <text
        :x="stackX + 160"
        :y="topY + 40"
        fill="#7f8c8d"
        font-size="12"
      >
        大小: {{ animatedStack.length }}
      </text>
      <text
        :x="stackX + 160"
        :y="topY + 55"
        fill="#7f8c8d"
        font-size="12"
      >
        栈顶: {{ animatedStack.length > 0 ? animatedStack[animatedStack.length - 1] : 'NULL' }}
      </text>
      <text
        :x="stackX + 160"
        :y="topY + 70"
        fill="#7f8c8d"
        font-size="12"
      >
        状态: {{ animatedStack.length === 0 ? '空' : '非空' }}
      </text>
    </g>
    
    <!-- 定义箭头标记 -->
    <defs>
      <marker
        id="topArrowhead"
        markerWidth="8"
        markerHeight="6"
        refX="7"
        refY="3"
        orient="auto"
      >
        <polygon
          points="0 0, 8 3, 0 6"
          fill="#e74c3c"
        />
      </marker>
    </defs>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 定义接口
interface AnimationState {
  steps?: any[]
  currentOperation?: string
  highlightedIndex?: number
  pushElement?: { value: number }
  popElement?: { value: number }
}

const props = defineProps<{
  data: number[]
  animationState: AnimationState
  currentStep: number
}>()

// 布局配置
const stackX = 300
const baseY = 350
const elementHeight = 40
const topY = 100

// 计算属性
const animatedStack = computed(() => props.data)

// 获取元素Y坐标（从底部开始）
const getElementY = (index: number) => {
  return baseY - 25 - (index * elementHeight)
}

// 入栈动画
const pushAnimation = computed(() => {
  if (!props.animationState.steps || props.currentStep < 0) return null
  
  const currentStepData = props.animationState.steps[props.currentStep]
  if (!currentStepData || currentStepData.type !== 'push') return null
  
  return {
    y: getElementY(animatedStack.value.length),
    value: currentStepData.value
  }
})

// 出栈动画
const popAnimation = computed(() => {
  if (!props.animationState.steps || props.currentStep < 0) return null
  
  const currentStepData = props.animationState.steps[props.currentStep]
  if (!currentStepData || currentStepData.type !== 'pop') return null
  
  return {
    y: getElementY(animatedStack.value.length - 1),
    value: currentStepData.value
  }
})

// 操作高亮
const operationHighlight = computed(() => {
  if (!props.animationState.steps || props.currentStep < 0) return null
  
  const currentStepData = props.animationState.steps[props.currentStep]
  if (!currentStepData || currentStepData.highlightIndex === undefined) return null
  
  const index = currentStepData.highlightIndex
  return {
    y: getElementY(index),
    color: currentStepData.highlightColor || '#f39c12'
  }
})

// 获取元素填充色
const getElementFill = (element: number, index: number) => {
  if (!props.animationState.steps || props.currentStep < 0) return '#3498db'
  
  const currentStepData = props.animationState.steps[props.currentStep]
  
  // 高亮栈顶元素
  if (index === animatedStack.value.length - 1) {
    return '#e67e22'
  }
  
  // 高亮当前操作的元素
  if (currentStepData?.highlightIndex === index) {
    return currentStepData.highlightColor || '#f39c12'
  }
  
  return '#3498db'
}

// 获取元素边框色
const getElementStroke = (element: number, index: number) => {
  const fill = getElementFill(element, index)
  const colorMap: Record<string, string> = {
    '#3498db': '#2980b9',
    '#e67e22': '#d35400',
    '#f39c12': '#e67e22'
  }
  return colorMap[fill] || '#2980b9'
}

// 获取文字颜色
const getTextColor = (element: number, index: number) => {
  return 'white'
}
</script>

<style scoped>
.stack-animation {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.stack-element {
  transition: all 0.5s ease;
}

.element-rect {
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.stack-element:hover .element-rect {
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)) brightness(1.1);
  transform: scale(1.05);
}

.element-text {
  user-select: none;
  pointer-events: none;
}

.index-label {
  user-select: none;
  font-family: 'Monaco', 'Menlo', monospace;
}

.stack-walls line {
  stroke-linecap: round;
}

.top-pointer text {
  user-select: none;
  font-family: 'Arial', sans-serif;
}

.empty-stack text {
  user-select: none;
}

.push-animation {
  z-index: 10;
}

.push-rect {
  filter: drop-shadow(0 4px 8px rgba(39, 174, 96, 0.3));
}

.pop-animation {
  z-index: 10;
}

.pop-rect {
  filter: drop-shadow(0 4px 8px rgba(231, 76, 60, 0.3));
}

.operation-highlight {
  opacity: 0.8;
}

.stack-info text {
  user-select: none;
}

.highlight-rect {
  opacity: 0.7;
}

/* 动画效果 */
@keyframes stackGlow {
  0%, 100% { 
    filter: drop-shadow(0 0 5px rgba(52, 152, 219, 0.5)); 
  }
  50% { 
    filter: drop-shadow(0 0 15px rgba(52, 152, 219, 0.8)); 
  }
}

.stack-element:nth-last-child(1) .element-rect {
  animation: stackGlow 2s ease-in-out infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .element-rect {
    width: 60px;
  }
  
  .element-text {
    font-size: 12px;
  }
  
  .stack-info {
    transform: scale(0.8);
  }
}
</style>