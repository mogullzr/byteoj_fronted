<template>
  <g class="linkedlist-animation">
    <!-- 链表节点 -->
    <g 
      v-for="(node, index) in animatedNodes" 
      :key="node.id"
      :transform="`translate(${node.x}, ${node.y})`"
      class="list-node"
    >
      <!-- 节点背景 -->
      <rect
        x="-30"
        y="-20"
        width="60"
        height="40"
        :fill="getNodeFill(node, index)"
        :stroke="getNodeStroke(node, index)"
        stroke-width="2"
        rx="8"
        class="node-rect"
      />
      
      <!-- 节点值 -->
      <text
        x="0"
        y="5"
        text-anchor="middle"
        :fill="getTextColor(node, index)"
        font-size="14"
        font-weight="bold"
        class="node-text"
      >
        {{ node.value }}
      </text>
      
      <!-- 指针箭头 -->
      <g v-if="shouldShowArrow(node, index)" class="pointer-arrow">
        <line
          x1="30"
          y1="0"
          x2="70"
          y2="0"
          :stroke="getArrowColor(node, index)"
          stroke-width="2"
          marker-end="url(#arrowhead)"
        />
      </g>
      
      <!-- 节点索引标签 -->
      <text
        x="0"
        y="-35"
        text-anchor="middle"
        fill="#7f8c8d"
        font-size="12"
        class="node-index"
      >
        {{ index }}
      </text>
    </g>
    
    <!-- 头指针标识 -->
    <g v-if="animatedNodes.length > 0" class="head-pointer">
      <text
        :x="animatedNodes[0].x"
        :y="animatedNodes[0].y - 55"
        text-anchor="middle"
        fill="#e74c3c"
        font-size="14"
        font-weight="bold"
      >
        HEAD
      </text>
      <line
        :x1="animatedNodes[0].x"
        :y1="animatedNodes[0].y - 45"
        :x2="animatedNodes[0].x"
        :y2="animatedNodes[0].y - 25"
        stroke="#e74c3c"
        stroke-width="2"
        marker-end="url(#arrowhead-red)"
      />
    </g>
    
    <!-- 尾指针标识 -->
    <g v-if="animatedNodes.length > 0" class="tail-pointer">
      <text
        :x="animatedNodes[animatedNodes.length - 1].x"
        :y="animatedNodes[animatedNodes.length - 1].y + 65"
        text-anchor="middle"
        fill="#27ae60"
        font-size="14"
        font-weight="bold"
      >
        TAIL
      </text>
      <line
        :x1="animatedNodes[animatedNodes.length - 1].x"
        :y1="animatedNodes[animatedNodes.length - 1].y + 25"
        :x2="animatedNodes[animatedNodes.length - 1].x"
        :y2="animatedNodes[animatedNodes.length - 1].y + 50"
        stroke="#27ae60"
        stroke-width="2"
        marker-end="url(#arrowhead-green)"
      />
    </g>
    
    <!-- NULL 标识 -->
    <g v-if="animatedNodes.length > 0" class="null-indicator">
      <text
        :x="animatedNodes[animatedNodes.length - 1].x + 100"
        :y="animatedNodes[animatedNodes.length - 1].y + 5"
        text-anchor="middle"
        fill="#95a5a6"
        font-size="14"
        font-style="italic"
      >
        NULL
      </text>
    </g>
    
    <!-- 当前操作高亮指示器 -->
    <g v-if="currentHighlight" class="operation-highlight">
      <circle
        :cx="currentHighlight.x"
        :cy="currentHighlight.y"
        r="50"
        fill="none"
        :stroke="currentHighlight.color"
        stroke-width="3"
        stroke-dasharray="5,5"
        class="highlight-circle"
      >
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0"
          to="360"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
    
    <!-- 新节点创建动画 -->
    <g v-if="newNodeAnimation" class="new-node-animation">
      <g :transform="`translate(${newNodeAnimation.x}, ${newNodeAnimation.y})`">
        <rect
          x="-30"
          y="-20"
          width="60"
          height="40"
          fill="#f39c12"
          stroke="#e67e22"
          stroke-width="2"
          rx="8"
          class="new-node-rect"
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
          {{ newNodeAnimation.value }}
        </text>
        <text
          x="0"
          y="-35"
          text-anchor="middle"
          fill="#f39c12"
          font-size="12"
          font-weight="bold"
        >
          NEW
        </text>
      </g>
    </g>
    
    <!-- 指针变化动画 -->
    <g v-if="pointerChangeAnimation" class="pointer-change-animation">
      <line
        :x1="pointerChangeAnimation.fromX"
        :y1="pointerChangeAnimation.fromY"
        :x2="pointerChangeAnimation.toX"
        :y2="pointerChangeAnimation.toY"
        stroke="#e67e22"
        stroke-width="3"
        stroke-dasharray="5,5"
        marker-end="url(#arrowhead-orange)"
        class="pointer-change-line"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-10"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </line>
      <text
        :x="(pointerChangeAnimation.fromX + pointerChangeAnimation.toX) / 2"
        :y="(pointerChangeAnimation.fromY + pointerChangeAnimation.toY) / 2 - 10"
        text-anchor="middle"
        fill="#e67e22"
        font-size="12"
        font-weight="bold"
        class="pointer-label"
      >
        指针变化
      </text>
    </g>
    
    <!-- 步骤描述显示 -->
    <g v-if="stepDescription" class="step-description">
      <rect
        x="10"
        y="10"
        width="300"
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
    
    <!-- 定义箭头标记 -->
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          fill="#3498db"
        />
      </marker>
      
      <marker
        id="arrowhead-red"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          fill="#e74c3c"
        />
      </marker>
      
      <marker
        id="arrowhead-green"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          fill="#27ae60"
        />
      </marker>
      
      <marker
        id="arrowhead-orange"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          fill="#e67e22"
        />
      </marker>
    </defs>
  </g>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

// 定义 props
interface Node {
  id: number
  value: number
  next: number | null
}

interface AnimationState {
  steps?: any[]
  currentOperation?: string
  highlightedNode?: number
  newNode?: { value: number, position: string }
}

const props = defineProps<{
  data: Node[]
  animationState: AnimationState
  currentStep: number
}>()

// 响应式数据
const nodeSpacing = 100
const startX = 100
const startY = 200

// 计算节点位置
const animatedNodes = computed(() => {
  return props.data.map((node, index) => ({
    ...node,
    x: startX + index * nodeSpacing,
    y: startY
  }))
})

// 当前高亮节点
const currentHighlight = computed(() => {
  if (!props.animationState.steps || props.currentStep < 0) return null
  
  const currentStepData = props.animationState.steps[props.currentStep]
  if (!currentStepData || !currentStepData.highlightNode) return null
  
  const nodeIndex = currentStepData.highlightNode
  if (nodeIndex >= 0 && nodeIndex < animatedNodes.value.length) {
    return {
      x: animatedNodes.value[nodeIndex].x,
      y: animatedNodes.value[nodeIndex].y,
      color: currentStepData.highlightColor || '#f39c12'
    }
  }
  
  return null
})

// 新节点动画
const newNodeAnimation = computed(() => {
  if (!props.animationState.steps || props.currentStep < 0) return null
  
  const currentStepData = props.animationState.steps[props.currentStep]
  if (!currentStepData || !currentStepData.showNewNode) return null
  
  // 根据位置确定新节点坐标
  let x = startX - 150 // 默认在左侧
  let y = startY
  
  if (currentStepData.newNodePosition === 'right') {
    x = startX + animatedNodes.value.length * nodeSpacing + 150
  } else if (currentStepData.newNodePosition === 'center') {
    x = startX + (animatedNodes.value.length / 2) * nodeSpacing
    y = startY - 100 // 在上方显示
  }
  
  return {
    x,
    y,
    value: currentStepData.newNodeValue
  }
})

// 指针变化动画
const pointerChangeAnimation = computed(() => {
  if (!props.animationState.steps || props.currentStep < 0) return null
  
  const currentStepData = props.animationState.steps[props.currentStep]
  if (!currentStepData || !currentStepData.showPointerChange) return null
  
  // 计算指针变化的起点和终点
  let fromX = 0, fromY = 0, toX = 0, toY = 0
  
  if (currentStepData.pointerFrom === 'newNode' && newNodeAnimation.value) {
    fromX = newNodeAnimation.value.x + 30
    fromY = newNodeAnimation.value.y
  } else if (currentStepData.pointerFrom === 'prev' && currentStepData.highlightNode >= 0) {
    const prevNode = animatedNodes.value[currentStepData.highlightNode]
    fromX = prevNode.x + 30
    fromY = prevNode.y
  }
  
  if (currentStepData.pointerTo === 'head' && animatedNodes.value.length > 0) {
    toX = animatedNodes.value[0].x - 30
    toY = animatedNodes.value[0].y
  } else if (currentStepData.pointerTo === 'newNode' && newNodeAnimation.value) {
    toX = newNodeAnimation.value.x - 30
    toY = newNodeAnimation.value.y
  }
  
  return { fromX, fromY, toX, toY }
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

// 判断是否应该显示箭头
const shouldShowArrow = (node: any, index: number) => {
  // 如果节点的next为null，说明是尾节点，不显示箭头
  if (node.next === null) return false
  
  // 检查是否有下一个节点存在（通过ID查找）
  const nextNodeExists = props.data.some(n => n.id === node.next)
  
  // 只有当next指针不为null且确实存在对应的下一个节点时才显示箭头
  return nextNodeExists && index < props.data.length - 1
}

// 获取节点填充色
const getNodeFill = (node: any, index: number) => {
  if (!props.animationState.steps || props.currentStep < 0) return '#3498db'
  
  const currentStepData = props.animationState.steps[props.currentStep]
  
  // 高亮当前操作的节点
  if (currentStepData?.highlightNode === index) {
    return currentStepData.highlightColor || '#f39c12'
  }
  
  // 查找操作中匹配的节点
  if (props.animationState.currentOperation === 'search' && 
      currentStepData?.searchValue === node.value) {
    return '#27ae60'
  }
  
  // 删除操作中标记要删除的节点
  if (props.animationState.currentOperation === 'delete' && 
      currentStepData?.deleteValue === node.value) {
    return '#e74c3c'
  }
  
  return '#3498db'
}

// 获取节点边框色
const getNodeStroke = (node: any, index: number) => {
  const fill = getNodeFill(node, index)
  const colorMap: Record<string, string> = {
    '#3498db': '#2980b9',
    '#f39c12': '#e67e22',
    '#27ae60': '#229954',
    '#e74c3c': '#c0392b'
  }
  return colorMap[fill] || '#2980b9'
}

// 获取文字颜色
const getTextColor = (node: any, index: number) => {
  const fill = getNodeFill(node, index)
  return fill === '#3498db' ? 'white' : 'white'
}

// 获取箭头颜色
const getArrowColor = (node: any, index: number) => {
  return '#3498db'
}

// 监听动画状态变化
watch(() => props.currentStep, (newStep) => {
  // 可以在这里添加步骤变化时的额外动画逻辑
  console.log('Animation step changed to:', newStep)
})
</script>

<style scoped>
.linkedlist-animation {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.list-node {
  transition: all 0.5s ease;
}

.node-rect {
  transition: all 0.3s ease;
}

.node-text {
  user-select: none;
}

.node-index {
  user-select: none;
}

.pointer-arrow {
  transition: all 0.3s ease;
}

.head-pointer text,
.tail-pointer text {
  user-select: none;
  font-family: 'Arial', sans-serif;
}

.null-indicator text {
  user-select: none;
}

.highlight-circle {
  opacity: 0.7;
}

.new-node-animation {
  animation: slideIn 1s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.new-node-rect {
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

/* 悬停效果 */
.list-node:hover .node-rect {
  filter: brightness(1.1);
}

/* 动画过渡 */
.list-node {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.pointer-arrow line {
  transition: stroke 0.3s ease, stroke-width 0.3s ease;
}

.pointer-arrow:hover line {
  stroke-width: 3;
}
</style>