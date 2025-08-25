<template>
  <g class="queue-animation">
    <!-- 队列容器 -->
    <g class="queue-container">
      <rect
        :x="containerX"
        :y="containerY"
        :width="containerWidth"
        height="60"
        fill="none"
        stroke="#2c3e50"
        stroke-width="3"
        rx="8"
      />
      <text
        :x="containerX + containerWidth / 2"
        :y="containerY - 15"
        text-anchor="middle"
        fill="#2c3e50"
        font-size="16"
        font-weight="bold"
      >
        Queue (队列)
      </text>
    </g>
    
    <!-- 队列元素 -->
    <g
      v-for="(element, index) in animatedQueue"
      :key="index"
      :transform="`translate(${getElementX(index)}, ${elementY})`"
      class="queue-element"
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
        y="3"
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
        x="0"
        y="-35"
        text-anchor="middle"
        fill="#7f8c8d"
        font-size="12"
        class="index-label"
      >
        {{ index }}
      </text>
    </g>
    
    <!-- 队首指针 (Front) -->
    <g v-if="animatedQueue.length > 0" class="front-pointer">
      <text
        :x="getElementX(0)"
        :y="containerY - 40"
        text-anchor="middle"
        fill="#e74c3c"
        font-size="14"
        font-weight="bold"
      >
        FRONT (队首)
      </text>
      <line
        :x1="getElementX(0)"
        :y1="containerY - 25"
        :x2="getElementX(0)"
        :y2="containerY + 5"
        stroke="#e74c3c"
        stroke-width="2"
        marker-end="url(#frontArrowhead)"
      />
    </g>
    
    <!-- 队尾指针 (Rear) -->
    <g v-if="animatedQueue.length > 0" class="rear-pointer">
      <text
        :x="getElementX(animatedQueue.length - 1)"
        :y="containerY + 95"
        text-anchor="middle"
        fill="#27ae60"
        font-size="14"
        font-weight="bold"
      >
        REAR (队尾)
      </text>
      <line
        :x1="getElementX(animatedQueue.length - 1)"
        :y1="containerY + 55"
        :x2="getElementX(animatedQueue.length - 1)"
        :y2="containerY + 80"
        stroke="#27ae60"
        stroke-width="2"
        marker-end="url(#rearArrowhead)"
      />
    </g>
    
    <!-- 空队列指示 -->
    <g v-if="animatedQueue.length === 0" class="empty-queue">
      <text
        :x="containerX + containerWidth / 2"
        :y="containerY + 35"
        text-anchor="middle"
        fill="#95a5a6"
        font-size="16"
        font-style="italic"
      >
        队列为空 (Empty)
      </text>
    </g>
    
    <!-- 入队动画元素 -->
    <g v-if="enqueueAnimation" class="enqueue-animation">
      <g :transform="`translate(${enqueueAnimation.x}, ${enqueueAnimation.y})`">
        <rect
          x="-25"
          y="-20"
          width="50"
          height="40"
          fill="#27ae60"
          stroke="#229954"
          stroke-width="2"
          rx="4"
          class="enqueue-rect"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="100,0; 0,0"
            dur="0.8s"
            fill="freeze"
          />
        </rect>
        <text
          x="0"
          y="3"
          text-anchor="middle"
          fill="white"
          font-size="14"
          font-weight="bold"
        >
          {{ enqueueAnimation.value }}
        </text>
        <text
          x="0"
          y="-35"
          text-anchor="middle"
          fill="#27ae60"
          font-size="12"
          font-weight="bold"
        >
          ENQUEUE
        </text>
      </g>
    </g>
    
    <!-- 出队动画元素 -->
    <g v-if="dequeueAnimation" class="dequeue-animation">
      <g :transform="`translate(${dequeueAnimation.x}, ${dequeueAnimation.y})`">
        <rect
          x="-25"
          y="-20"
          width="50"
          height="40"
          fill="#e74c3c"
          stroke="#c0392b"
          stroke-width="2"
          rx="4"
          class="dequeue-rect"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -100,0"
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
          y="3"
          text-anchor="middle"
          fill="white"
          font-size="14"
          font-weight="bold"
        >
          {{ dequeueAnimation.value }}
        </text>
        <text
          x="0"
          y="-35"
          text-anchor="middle"
          fill="#e74c3c"
          font-size="12"
          font-weight="bold"
        >
          DEQUEUE
        </text>
      </g>
    </g>
    
    <!-- 元素移动动画 -->
    <g v-if="moveAnimation.length > 0" class="move-animation">
      <g 
        v-for="(move, index) in moveAnimation" 
        :key="index"
        :transform="`translate(${move.fromX}, ${elementY})`"
      >
        <rect
          x="-25"
          y="-20"
          width="50"
          height="40"
          fill="#f39c12"
          stroke="#e67e22"
          stroke-width="2"
          rx="4"
          class="move-rect"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            :values="`0,0; ${move.toX - move.fromX},0`"
            dur="0.6s"
            fill="freeze"
          />
        </rect>
        <text
          x="0"
          y="3"
          text-anchor="middle"
          fill="white"
          font-size="14"
          font-weight="bold"
        >
          {{ move.value }}
        </text>
      </g>
    </g>
    
    <!-- 操作高亮指示器 -->
    <g v-if="operationHighlight" class="operation-highlight">
      <rect
        :x="operationHighlight.x - 30"
        :y="operationHighlight.y - 25"
        width="60"
        height="50"
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
    
    <!-- 队列信息面板 -->
    <g class="queue-info">
      <rect
        :x="containerX + containerWidth + 30"
        :y="containerY"
        width="140"
        height="100"
        fill="#ecf0f1"
        stroke="#bdc3c7"
        stroke-width="1"
        rx="8"
      />
      <text
        :x="containerX + containerWidth + 100"
        :y="containerY + 20"
        text-anchor="middle"
        fill="#2c3e50"
        font-size="14"
        font-weight="bold"
      >
        队列信息
      </text>
      <text
        :x="containerX + containerWidth + 40"
        :y="containerY + 40"
        fill="#7f8c8d"
        font-size="12"
      >
        大小: {{ animatedQueue.length }}
      </text>
      <text
        :x="containerX + containerWidth + 40"
        :y="containerY + 55"
        fill="#7f8c8d"
        font-size="12"
      >
        队首: {{ animatedQueue.length > 0 ? animatedQueue[0] : 'NULL' }}
      </text>
      <text
        :x="containerX + containerWidth + 40"
        :y="containerY + 70"
        fill="#7f8c8d"
        font-size="12"
      >
        队尾: {{ animatedQueue.length > 0 ? animatedQueue[animatedQueue.length - 1] : 'NULL' }}
      </text>
      <text
        :x="containerX + containerWidth + 40"
        :y="containerY + 85"
        fill="#7f8c8d"
        font-size="12"
      >
        状态: {{ animatedQueue.length === 0 ? '空' : '非空' }}
      </text>
    </g>
    
    <!-- 定义箭头标记 -->
    <defs>
      <marker
        id="frontArrowhead"
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
      
      <marker
        id="rearArrowhead"
        markerWidth="8"
        markerHeight="6"
        refX="7"
        refY="3"
        orient="auto"
      >
        <polygon
          points="0 0, 8 3, 0 6"
          fill="#27ae60"
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
  enqueueElement?: { value: number }
  dequeueElement?: { value: number }
}

const props = defineProps<{
  data: number[]
  animationState: AnimationState
  currentStep: number
}>()

// 布局配置
const containerX = 100
const containerY = 200
const elementSpacing = 55
const elementY = containerY + 30

// 计算属性
const animatedQueue = computed(() => props.data)

const containerWidth = computed(() => {
  return Math.max(300, animatedQueue.value.length * elementSpacing + 20)
})

// 获取元素X坐标
const getElementX = (index: number) => {
  return containerX + 30 + index * elementSpacing
}

// 入队动画
const enqueueAnimation = computed(() => {
  if (!props.animationState.steps || props.currentStep < 0) return null
  
  const currentStepData = props.animationState.steps[props.currentStep]
  if (!currentStepData || currentStepData.type !== 'enqueue') return null
  
  return {
    x: getElementX(animatedQueue.value.length),
    y: elementY,
    value: currentStepData.value
  }
})

// 出队动画
const dequeueAnimation = computed(() => {
  if (!props.animationState.steps || props.currentStep < 0) return null
  
  const currentStepData = props.animationState.steps[props.currentStep]
  if (!currentStepData || currentStepData.type !== 'dequeue') return null
  
  return {
    x: getElementX(0),
    y: elementY,
    value: currentStepData.value
  }
})

// 元素移动动画
const moveAnimation = computed(() => {
  if (!props.animationState.steps || props.currentStep < 0) return []
  
  const currentStepData = props.animationState.steps[props.currentStep]
  if (!currentStepData || currentStepData.type !== 'shift') return []
  
  return currentStepData.moves || []
})

// 操作高亮
const operationHighlight = computed(() => {
  if (!props.animationState.steps || props.currentStep < 0) return null
  
  const currentStepData = props.animationState.steps[props.currentStep]
  if (!currentStepData || currentStepData.highlightIndex === undefined) return null
  
  const index = currentStepData.highlightIndex
  return {
    x: getElementX(index),
    y: elementY,
    color: currentStepData.highlightColor || '#f39c12'
  }
})

// 获取元素填充色
const getElementFill = (element: number, index: number) => {
  if (!props.animationState.steps || props.currentStep < 0) return '#3498db'
  
  const currentStepData = props.animationState.steps[props.currentStep]
  
  // 高亮队首元素
  if (index === 0) {
    return '#e67e22'
  }
  
  // 高亮队尾元素
  if (index === animatedQueue.value.length - 1 && animatedQueue.value.length > 1) {
    return '#27ae60'
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
    '#27ae60': '#229954',
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
.queue-animation {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.queue-element {
  transition: all 0.5s ease;
}

.element-rect {
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.queue-element:hover .element-rect {
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

.queue-container text {
  user-select: none;
}

.front-pointer text,
.rear-pointer text {
  user-select: none;
  font-family: 'Arial', sans-serif;
}

.empty-queue text {
  user-select: none;
}

.enqueue-animation {
  z-index: 10;
}

.enqueue-rect {
  filter: drop-shadow(0 4px 8px rgba(39, 174, 96, 0.3));
}

.dequeue-animation {
  z-index: 10;
}

.dequeue-rect {
  filter: drop-shadow(0 4px 8px rgba(231, 76, 60, 0.3));
}

.move-animation {
  z-index: 5;
}

.move-rect {
  filter: drop-shadow(0 4px 8px rgba(243, 156, 18, 0.3));
}

.operation-highlight {
  opacity: 0.8;
}

.queue-info text {
  user-select: none;
}

.highlight-rect {
  opacity: 0.7;
}

/* 队首队尾元素的特殊效果 */
.queue-element:first-child .element-rect {
  animation: frontGlow 2s ease-in-out infinite;
}

.queue-element:last-child .element-rect {
  animation: rearGlow 2s ease-in-out infinite;
}

@keyframes frontGlow {
  0%, 100% { 
    filter: drop-shadow(0 0 5px rgba(231, 76, 60, 0.3)); 
  }
  50% { 
    filter: drop-shadow(0 0 10px rgba(231, 76, 60, 0.6)); 
  }
}

@keyframes rearGlow {
  0%, 100% { 
    filter: drop-shadow(0 0 5px rgba(39, 174, 96, 0.3)); 
  }
  50% { 
    filter: drop-shadow(0 0 10px rgba(39, 174, 96, 0.6)); 
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .element-rect {
    width: 40px;
    height: 35px;
  }
  
  .element-text {
    font-size: 12px;
  }
  
  .queue-info {
    transform: scale(0.8);
  }
}
</style>