<template>
  <g class="binary-tree-animation">
    <!-- 树的连接线 -->
    <g class="tree-edges">
      <line
        v-for="edge in treeEdges"
        :key="edge.id"
        :x1="edge.x1"
        :y1="edge.y1"
        :x2="edge.x2"
        :y2="edge.y2"
        :stroke="getEdgeColor(edge)"
        :stroke-width="getEdgeWidth(edge)"
        class="tree-edge"
      />
    </g>
    
    <!-- 树节点 -->
    <g
      v-for="node in treeNodes"
      :key="node.id"
      :transform="`translate(${node.x}, ${node.y})`"
      class="tree-node"
    >
      <!-- 节点圆形背景 -->
      <circle
        r="25"
        :fill="getNodeFill(node)"
        :stroke="getNodeStroke(node)"
        stroke-width="3"
        class="node-circle"
      />
      
      <!-- 节点值 -->
      <text
        x="0"
        y="6"
        text-anchor="middle"
        :fill="getTextColor(node)"
        font-size="16"
        font-weight="bold"
        class="node-text"
      >
        {{ node.value }}
      </text>
      
      <!-- 节点标签（用于遍历顺序显示） -->
      <text
        v-if="node.visitOrder !== undefined"
        x="0"
        y="-40"
        text-anchor="middle"
        fill="#e74c3c"
        font-size="12"
        font-weight="bold"
        class="visit-order"
      >
        {{ node.visitOrder }}
      </text>
    </g>
    
    <!-- 根节点标识 -->
    <g v-if="rootNode" class="root-indicator">
      <text
        :x="rootNode.x"
        :y="rootNode.y - 60"
        text-anchor="middle"
        fill="#8e44ad"
        font-size="14"
        font-weight="bold"
      >
        ROOT
      </text>
      <line
        :x1="rootNode.x"
        :y1="rootNode.y - 45"
        :x2="rootNode.x"
        :y2="rootNode.y - 30"
        stroke="#8e44ad"
        stroke-width="2"
        marker-end="url(#arrowhead-purple)"
      />
    </g>
    
    <!-- 当前访问节点高亮 -->
    <g v-if="currentVisitNode" class="visit-highlight">
      <circle
        :cx="currentVisitNode.x"
        :cy="currentVisitNode.y"
        r="35"
        fill="none"
        stroke="#f39c12"
        stroke-width="4"
        stroke-dasharray="8,4"
        class="highlight-circle"
      >
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0"
          to="360"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
    
    <!-- 新节点插入动画 -->
    <g v-if="newNodeAnimation" class="new-node-animation">
      <g :transform="`translate(${newNodeAnimation.x}, ${newNodeAnimation.y})`">
        <circle
          r="25"
          fill="#27ae60"
          stroke="#229954"
          stroke-width="3"
          class="new-node-circle"
        >
          <animate
            attributeName="r"
            values="0;25;25"
            dur="0.8s"
          />
        </circle>
        <text
          x="0"
          y="6"
          text-anchor="middle"
          fill="white"
          font-size="16"
          font-weight="bold"
        >
          {{ newNodeAnimation.value }}
        </text>
        <text
          x="0"
          y="-45"
          text-anchor="middle"
          fill="#27ae60"
          font-size="12"
          font-weight="bold"
        >
          NEW
        </text>
      </g>
    </g>
    
    <!-- 遍历路径指示器 -->
    <g v-if="traversalPath.length > 0" class="traversal-path">
      <polyline
        :points="traversalPathPoints"
        fill="none"
        stroke="#e74c3c"
        stroke-width="3"
        stroke-dasharray="5,5"
        opacity="0.7"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;10"
          dur="1s"
          repeatCount="indefinite"
        />
      </polyline>
    </g>
    
    <!-- 定义箭头标记 -->
    <defs>
      <marker
        id="arrowhead-purple"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          fill="#8e44ad"
        />
      </marker>
      
      <!-- 渐变定义 -->
      <radialGradient id="nodeGradient" cx="30%" cy="30%">
        <stop offset="0%" stop-color="#5dade2" />
        <stop offset="100%" stop-color="#3498db" />
      </radialGradient>
      
      <radialGradient id="highlightGradient" cx="30%" cy="30%">
        <stop offset="0%" stop-color="#f7dc6f" />
        <stop offset="100%" stop-color="#f39c12" />
      </radialGradient>
    </defs>
  </g>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// 定义接口
interface TreeNode {
  value: number
  left?: TreeNode | null
  right?: TreeNode | null
  visitOrder?: number
}

interface AnimationState {
  steps?: any[]
  currentOperation?: string
  highlightedNode?: number
  traversalOrder?: number[]
  newNode?: { value: number, position: { x: number, y: number } }
}

const props = defineProps<{
  data: TreeNode
  animationState: AnimationState
  currentStep: number
}>()

// 树布局配置
const nodeRadius = 25
const levelHeight = 80
const baseWidth = 200

// 计算树节点位置
const treeNodes = computed(() => {
  const nodes: any[] = []
  const centerX = 400
  const startY = 80
  
  const calculatePositions = (node: TreeNode | null, x: number, y: number, level: number, id: string): void => {
    if (!node) return
    
    const spacing = baseWidth / Math.pow(2, level)
    
    nodes.push({
      id,
      value: node.value,
      x,
      y,
      level,
      visitOrder: getNodeVisitOrder(node.value)
    })
    
    if (node.left) {
      calculatePositions(node.left, x - spacing, y + levelHeight, level + 1, `${id}-L`)
    }
    
    if (node.right) {
      calculatePositions(node.right, x + spacing, y + levelHeight, level + 1, `${id}-R`)
    }
  }
  
  if (props.data) {
    calculatePositions(props.data, centerX, startY, 0, 'root')
  }
  
  return nodes
})

// 计算树的边
const treeEdges = computed(() => {
  const edges: any[] = []
  
  const addEdges = (node: TreeNode | null, parentPos: { x: number, y: number }, level: number, id: string): void => {
    if (!node) return
    
    const spacing = baseWidth / Math.pow(2, level)
    const currentY = parentPos.y + levelHeight
    
    if (node.left) {
      const leftX = parentPos.x - spacing
      edges.push({
        id: `${id}-L`,
        x1: parentPos.x,
        y1: parentPos.y,
        x2: leftX,
        y2: currentY,
        type: 'left'
      })
      addEdges(node.left, { x: leftX, y: currentY }, level + 1, `${id}-L`)
    }
    
    if (node.right) {
      const rightX = parentPos.x + spacing
      edges.push({
        id: `${id}-R`,
        x1: parentPos.x,
        y1: parentPos.y,
        x2: rightX,
        y2: currentY,
        type: 'right'
      })
      addEdges(node.right, { x: rightX, y: currentY }, level + 1, `${id}-R`)
    }
  }
  
  if (props.data) {
    addEdges(props.data, { x: 400, y: 80 }, 0, 'root')
  }
  
  return edges
})

// 根节点
const rootNode = computed(() => {
  return treeNodes.value.find(node => node.id === 'root')
})

// 当前访问的节点
const currentVisitNode = computed(() => {
  if (!props.animationState.steps || props.currentStep < 0) return null
  
  const currentStepData = props.animationState.steps[props.currentStep]
  if (!currentStepData || !currentStepData.visitNode) return null
  
  return treeNodes.value.find(node => node.value === currentStepData.visitNode)
})

// 新节点动画
const newNodeAnimation = computed(() => {
  if (!props.animationState.steps || props.currentStep < 0) return null
  
  const currentStepData = props.animationState.steps[props.currentStep]
  if (!currentStepData || currentStepData.type !== 'create_node') return null
  
  return {
    x: currentStepData.position?.x || 400,
    y: currentStepData.position?.y || 300,
    value: currentStepData.value
  }
})

// 遍历路径
const traversalPath = computed(() => {
  if (!props.animationState.traversalOrder) return []
  
  return props.animationState.traversalOrder
    .slice(0, props.currentStep + 1)
    .map(value => treeNodes.value.find(node => node.value === value))
    .filter(Boolean)
})

// 遍历路径点字符串
const traversalPathPoints = computed(() => {
  return traversalPath.value
    .map(node => `${node.x},${node.y}`)
    .join(' ')
})

// 获取节点访问顺序
const getNodeVisitOrder = (value: number) => {
  if (!props.animationState.traversalOrder) return undefined
  
  const index = props.animationState.traversalOrder.indexOf(value)
  return index >= 0 && index <= props.currentStep ? index + 1 : undefined
}

// 获取节点填充色
const getNodeFill = (node: any) => {
  if (!props.animationState.steps || props.currentStep < 0) return 'url(#nodeGradient)'
  
  const currentStepData = props.animationState.steps[props.currentStep]
  
  // 当前访问的节点
  if (currentStepData?.visitNode === node.value) {
    return 'url(#highlightGradient)'
  }
  
  // 已访问的节点
  if (node.visitOrder !== undefined) {
    return '#27ae60'
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
  
  return 'url(#nodeGradient)'
}

// 获取节点边框色
const getNodeStroke = (node: any) => {
  const fill = getNodeFill(node)
  
  if (fill.includes('highlightGradient')) return '#f39c12'
  if (fill === '#27ae60') return '#229954'
  if (fill === '#e74c3c') return '#c0392b'
  
  return '#2980b9'
}

// 获取文字颜色
const getTextColor = (node: any) => {
  return 'white'
}

// 获取边的颜色
const getEdgeColor = (edge: any) => {
  return '#7f8c8d'
}

// 获取边的宽度
const getEdgeWidth = (edge: any) => {
  return 2
}
</script>

<style scoped>
.binary-tree-animation {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.tree-node {
  transition: all 0.5s ease;
  cursor: pointer;
}

.node-circle {
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.tree-node:hover .node-circle {
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)) brightness(1.1);
  transform: scale(1.05);
}

.node-text {
  user-select: none;
  pointer-events: none;
}

.visit-order {
  user-select: none;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tree-edge {
  transition: all 0.3s ease;
}

.tree-edge:hover {
  stroke-width: 3;
  stroke: #3498db;
}

.root-indicator text {
  user-select: none;
  font-family: 'Arial', sans-serif;
}

.highlight-circle {
  opacity: 0.8;
}

.new-node-animation {
  animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.new-node-circle {
  filter: drop-shadow(0 4px 12px rgba(39, 174, 96, 0.3));
}

.traversal-path {
  pointer-events: none;
}

/* 节点级别样式 */
.tree-node[data-level="0"] .node-circle {
  filter: drop-shadow(0 3px 6px rgba(142, 68, 173, 0.3));
}

.tree-node[data-level="1"] .node-circle {
  filter: drop-shadow(0 2px 4px rgba(52, 152, 219, 0.3));
}

.tree-node[data-level="2"] .node-circle {
  filter: drop-shadow(0 1px 3px rgba(46, 204, 113, 0.3));
}
</style>