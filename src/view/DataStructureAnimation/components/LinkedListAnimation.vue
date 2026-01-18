<!-- LinkedListAnimation.vue -->
<template>
  <g>
    <!-- HEAD 指针 -->
    <g v-if="showHeadPointer">
      <text x="40" y="45" font-size="16" font-weight="bold" fill="#e74c3c">HEAD</text>
      <line
          x1="80"
          y1="40"
          :x2="headPointerEndX"
          y2="40"
          stroke="#e74c3c"
          stroke-width="2.5"
          marker-end="url(#arrow-red)"
          class="head-pointer-line"
      />
    </g>

    <!-- 正常节点 -->
    <g
        v-for="(node, index) in displayedNodes"
        :key="node.id"
        :transform="`translate(${100 + index * nodeTotalWidth}, 60)`"
        class="node-group"
    >
      <rect
          width="120"
          height="60"
          rx="8"
          fill="#ffffff"
          :stroke="getNodeStroke(index)"
          stroke-width="2.5"
      />

      <!-- 值区域 -->
      <rect x="0" y="0" width="70" height="60" fill="#f8f9fa" rx="8 0 0 8" />
      <text
          x="35"
          y="38"
          font-size="28"
          font-weight="bold"
          fill="#2c3e50"
          text-anchor="middle"
          dominant-baseline="middle"
      >
        {{ node.value }}
      </text>

      <!-- next 区域 -->
      <rect x="70" y="0" width="50" height="60" fill="#f1f3f5" rx="0 8 8 0" />
      <text x="95" y="38" font-size="14" fill="#7f8c8d" text-anchor="middle">next</text>

      <!-- next 箭头 -->
      <line
          x1="120"
          y1="30"
          x2="nodeTotalWidth"
          y2="30"
          stroke="#7f8c8d"
          stroke-width="2"
          marker-end="url(#arrow)"
      />

      <!-- 最后一个节点的 NULL -->
      <text
          v-if="index === displayedNodes.length - 1 && !isInsertingAfter(index)"
          x="nodeTotalWidth + 30"
          y="38"
          font-size="15"
          fill="#95a5a6"
          text-anchor="middle"
      >
        NULL
      </text>
    </g>

    <!-- 新插入的节点（动画用） -->
    <g v-if="newInsertNode" :transform="newNodeTransform">
      <rect width="120" height="60" rx="8" fill="#e8f5e9" stroke="#27ae60" stroke-width="2.5" />
      <rect x="0" y="0" width="70" height="60" fill="#d4edda" rx="8 0 0 8" />
      <text x="35" y="38" font-size="28" fill="#27ae60" text-anchor="middle" dominant-baseline="middle">
        {{ newInsertNode.value }}
      </text>
      <rect x="70" y="0" width="50" height="60" fill="#e8f5e9" rx="0 8 8 0" />
      <text x="95" y="38" font-size="14" fill="#27ae60" text-anchor="middle">next</text>
    </g>

    <!-- 被删除的节点（淡出） -->
    <g v-if="deletingNode" :transform="`translate(${100 + deletingNode.index * nodeTotalWidth}, 60)`">
      <rect width="120" height="60" rx="8" fill="#f9e1e1" stroke="#e74c3c" stroke-width="2.5" class="deleting" />
      <text x="60" y="38" font-size="28" fill="#e74c3c" text-anchor="middle" dominant-baseline="middle">
        {{ deletingNode.value }}
      </text>
    </g>

    <!-- 查找高亮圆圈 -->
    <circle
        v-if="foundIndex >= 0"
        :cx="100 + foundIndex * nodeTotalWidth + 60"
        cy="90"
        r="32"
        fill="none"
        stroke="#3498db"
        stroke-width="3"
        stroke-dasharray="5,5"
        class="found-circle"
    />

    <!-- 箭头定义 -->
    <defs>
      <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
        <path d="M2,2 L2,10 L10,6 Z" fill="#7f8c8d" />
      </marker>
      <marker id="arrow-red" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
        <path d="M2,2 L2,10 L10,6 Z" fill="#e74c3c" />
      </marker>
    </defs>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: any[]
  animationState: any
  currentStep: number
}>()

const nodeWidth = 120
const nodeSpacing = 80          // 节点之间的中心距离
const nodeTotalWidth = nodeWidth + nodeSpacing

// 当前步骤信息
const currentStepData = computed(() => props.animationState.steps[props.currentStep] || {})

// 显示的节点（模拟最终状态用于布局）
const displayedNodes = computed(() => {
  let nodes = [...props.data]

  // 插入完成时显示新节点
  if (currentStepData.value.type === 'complete' && props.animationState.newNode) {
    const newN = { id: Date.now(), value: props.animationState.newNode.value, next: null }
    const op = props.animationState.currentOperation

    if (op === 'insert_head') {
      newN.next = nodes[0]?.id || null
      nodes.unshift(newN)
    } else if (op === 'insert_tail') {
      if (nodes.length) nodes[nodes.length-1].next = newN.id
      nodes.push(newN)
    } else if (op === 'insert_at_index') {
      const idx = currentStepData.value.insertIndex ?? 0
      newN.next = nodes[idx]?.id || null
      nodes.splice(idx, 0, newN)
    }
  }

  return nodes
})

// HEAD 指针指向位置
const headPointerEndX = computed(() => {
  if (displayedNodes.value.length === 0) return 180
  return 100 + 60 // 指向第一个节点中心
})

// 新插入节点位置（动画起始位置）
const newInsertNode = computed(() => props.animationState.newNode)
const newNodeTransform = computed(() => {
  if (!newInsertNode.value) return ''

  const pos = newInsertNode.value.position || 'left'
  let x = 100

  if (pos === 'left') x = -80
  else if (pos === 'right') x = 100 + displayedNodes.value.length * nodeTotalWidth
  else if (pos.startsWith('index:')) {
    const idx = Number(pos.split(':')[1])
    x = 100 + idx * nodeTotalWidth - 30 // 稍微偏左上
  }

  return `translate(${x}, 60)`
})

// 查找高亮
const foundIndex = computed(() => props.animationState.foundNode ?? -1)

// 删除中节点
const deletingNode = computed(() => {
  if (currentStepData.value.type === 'mark_delete') {
    return {
      index: currentStepData.value.highlightNode,
      value: props.data[currentStepData.value.highlightNode]?.value
    }
  }
  return null
})

// 节点边框颜色
const getNodeStroke = (index: number) => {
  if (index === currentStepData.value.highlightNode) return '#3498db'
  if (index === foundIndex.value) return '#27ae60'
  return '#bdc3c7'
}

// 是否在插入后影响该节点后的 NULL 显示
const isInsertingAfter = (index: number) => {
  return currentStepData.value.type === 'link_new' &&
      currentStepData.value.insertAfterIndex === index
}

const showHeadPointer = computed(() => true)
</script>

<style scoped>
.node-group {
  transition: transform 0.6s ease;
}

.found-circle {
  animation: foundPulse 1.5s infinite;
}

@keyframes foundPulse {
  0%, 100% { opacity: 0.6; stroke-width: 3; }
  50% { opacity: 1; stroke-width: 5; }
}

.deleting {
  animation: fadeDelete 0.8s forwards;
}

@keyframes fadeDelete {
  to {
    opacity: 0;
    transform: scale(0.85);
  }
}

.head-pointer-line {
  transition: x2 0.7s ease;
}
</style>