<template>
  <g class="avl-tree-animation">
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
    
    <!-- 旋转指示器 -->
    <g v-if="rotationIndicator" class="rotation-indicator">
      <path
        :d="getRotationPath(rotationIndicator)"
        fill="none"
        stroke="#e74c3c"
        stroke-width="3"
        stroke-dasharray="5,5"
        marker-end="url(#rotationArrow)"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;10"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
      <text
        :x="rotationIndicator.centerX"
        :y="rotationIndicator.centerY - 15"
        text-anchor="middle"
        fill="#e74c3c"
        font-size="12"
        font-weight="bold"
      >
        {{ rotationIndicator.type }}旋转
      </text>
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
        r="30"
        :fill="getNodeFill(node)"
        :stroke="getNodeStroke(node)"
        stroke-width="3"
        class="node-circle"
      />
      
      <!-- 节点值 -->
      <text
        x="0"
        y="2"
        text-anchor="middle"
        :fill="getTextColor(node)"
        font-size="16"
        font-weight="bold"
        class="node-text"
      >
        {{ node.value }}
      </text>
      
      <!-- 平衡因子显示 -->
      <text
        x="35"
        y="-25"
        text-anchor="middle"
        :fill="getBalanceFactorColor(node)"
        font-size="12"
        font-weight="bold"
        class="balance-factor"
      >
        {{ node.balanceFactor !== undefined ? node.balanceFactor : '' }}
      </text>
      
      <!-- 高度显示 */
      <text
        x="-35"
        y="-25"
        text-anchor="middle"
        fill="#7f8c8d"
        font-size="12"
        class="node-height"
      >
        h:{{ node.height || 0 }}
      </text>
      
      <!-- 不平衡节点标记 */
      <g v-if="isUnbalanced(node)" class="unbalanced-marker">
        <circle
          r="40"
          fill="none"
          stroke="#e74c3c"
          stroke-width="2"
          stroke-dasharray="4,4"
        >
          <animate
            attributeName="r"
            values="35;45;35"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
        <text
          x="0"
          y="-50"
          text-anchor="middle"
          fill="#e74c3c"
          font-size="10"
          font-weight="bold"
        >
          不平衡
        </text>
      </g>
    </g>
    
    <!-- 根节点标识 -->
    <g v-if="rootNode" class="root-indicator">
      <text
        :x="rootNode.x"
        :y="rootNode.y - 70"
        text-anchor="middle"
        fill="#8e44ad"
        font-size="14"
        font-weight="bold"
      >
        ROOT
      </text>
      <line
        :x1="rootNode.x"
        :y1="rootNode.y - 55"
        :x2="rootNode.x"
        :y2="rootNode.y - 35"
        stroke="#8e44ad"
        stroke-width="2"
        marker-end="url(#arrowhead-purple)"
      />
    </g>
    
    <!-- 插入路径指示 -->
    <g v-if="insertionPath.length > 0" class="insertion-path">
      <polyline
        :points="insertionPathPoints"
        fill="none"
        stroke="#27ae60"
        stroke-width="4"
        stroke-dasharray="8,4"
        opacity="0.8"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;12"
          dur="1s"
          repeatCount="indefinite"
        />
      </polyline>
    </g>
    
    <!-- 平衡信息面板 -->
    <g class="balance-info-panel">
      <rect
        x="20"
        y="20"
        width="200"
        height="120"
        fill="rgba(255, 255, 255, 0.95)"
        stroke="#bdc3c7"
        stroke-width="1"
        rx="8"
      />
      <text
        x="120"
        y="40"
        text-anchor="middle"
        fill="#2c3e50"
        font-size="14"
        font-weight="bold"
      >
        AVL树状态
      </text>
      <text
        x="30"
        y="60"
        fill="#7f8c8d"
        font-size="12"
      >
        节点数: {{ treeNodes.length }}
      </text>
      <text
        x="30"
        y="75"
        fill="#7f8c8d"
        font-size="12"
      >
        树高度: {{ treeHeight }}
      </text>
      <text
        x="30"
        y="90"
        fill="#7f8c8d"
        font-size="12"
      >
        是否平衡: {{ isTreeBalanced ? '是' : '否' }}
      </text>
      <text
        x="30"
        y="105"
        fill="#7f8c8d"
        font-size="12"
      >
        旋转次数: {{ rotationCount }}
      </text>
      <text
        x="30"
        y="120"
        :fill="lastOperationColor"
        font-size="12"
        font-weight="bold"
      >
        {{ lastOperationText }}
      </text>
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
      
      <marker
        id="rotationArrow"
        markerWidth="12"
        markerHeight="8"
        refX="11"
        refY="4"
        orient="auto"
      >
        <polygon
          points="0 0, 12 4, 0 8"
          fill="#e74c3c"
        />
      </marker>
      
      <!-- 渐变定义 -->
      <radialGradient id="balancedNodeGradient" cx="30%" cy="30%">
        <stop offset="0%" stop-color="#a8e6cf" />
        <stop offset="100%" stop-color="#27ae60" />
      </radialGradient>
      
      <radialGradient id="unbalancedNodeGradient" cx="30%" cy="30%">
        <stop offset="0%" stop-color="#ffb3ba" />
        <stop offset="100%" stop-color="#e74c3c" />
      </radialGradient>
      
      <radialGradient id="newNodeGradient" cx="30%" cy="30%">
        <stop offset="0%" stop-color="#ffd93d" />
        <stop offset="100%" stop-color="#f39c12" />
      </radialGradient>
    </defs>
  </g>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// 定义接口
interface AVLNode {
  value: number
  left?: AVLNode | null
  right?: AVLNode | null
  height?: number
  balanceFactor?: number
}

interface AnimationState {
  steps?: any[]
  currentOperation?: string
  highlightedNode?: number
  insertionPath?: number[]
  rotationInfo?: {
    type: 'LL' | 'RR' | 'LR' | 'RL'
    center: { x: number, y: number }
  }
  newNode?: { value: number }
}

const props = defineProps<{
  data: AVLNode
  animationState: AnimationState
  currentStep: number
}>()

// 树布局配置
const nodeRadius = 30
const levelHeight = 100
const baseWidth = 300

// 状态数据
const rotationCount = ref(0)
const lastOperationText = ref('等待操作')
const lastOperationColor = ref('#7f8c8d')

// 计算树节点位置和属性
const treeNodes = computed(() => {
  const nodes: any[] = []
  const centerX = 400
  const startY = 100
  
  const calculatePositions = (node: AVLNode | null, x: number, y: number, level: number, id: string): void => {
    if (!node) return
    
    const spacing = baseWidth / Math.pow(2, level)
    
    // 计算节点高度
    const leftHeight = node.left ? calculateHeight(node.left) : 0
    const rightHeight = node.right ? calculateHeight(node.right) : 0
    const height = Math.max(leftHeight, rightHeight) + 1
    
    // 计算平衡因子
    const balanceFactor = rightHeight - leftHeight
    
    nodes.push({
      id,
      value: node.value,
      x,
      y,
      level,
      height,
      balanceFactor,
      isNew: isNewNode(node.value),
      isHighlighted: isHighlightedNode(node.value)
    })
    
    if (node.left) {
      calculatePositions(node.left, x - spacing, y + levelHeight, level + 1, `${id}-L`)
    }
    
    if (node.right) {
      calculatePositions(node.right, x + spacing, y + levelHeight, level + 1, `${id}-R`)
    }
  }
  
  const calculateHeight = (node: AVLNode | null): number => {
    if (!node) return 0
    const leftHeight = node.left ? calculateHeight(node.left) : 0
    const rightHeight = node.right ? calculateHeight(node.right) : 0
    return Math.max(leftHeight, rightHeight) + 1
  }
  
  if (props.data) {
    calculatePositions(props.data, centerX, startY, 0, 'root')
  }
  
  return nodes
})

// 计算树的边
const treeEdges = computed(() => {
  const edges: any[] = []
  
  const addEdges = (node: AVLNode | null, parentPos: { x: number, y: number }, level: number, id: string): void => {
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
    addEdges(props.data, { x: 400, y: 100 }, 0, 'root')
  }
  
  return edges
})

// 根节点
const rootNode = computed(() => {
  return treeNodes.value.find(node => node.id === 'root')
})

// 插入路径
const insertionPath = computed(() => {
  if (!props.animationState.insertionPath) return []
  
  return props.animationState.insertionPath
    .map(value => treeNodes.value.find(node => node.value === value))
    .filter(Boolean)
})

// 插入路径点字符串
const insertionPathPoints = computed(() => {
  return insertionPath.value
    .map(node => `${node.x},${node.y}`)
    .join(' ')
})

// 旋转指示器
const rotationIndicator = computed(() => {
  if (!props.animationState.rotationInfo) return null
  
  return {
    ...props.animationState.rotationInfo,
    centerX: props.animationState.rotationInfo.center.x,
    centerY: props.animationState.rotationInfo.center.y
  }
})

// 树的高度
const treeHeight = computed(() => {
  if (treeNodes.value.length === 0) return 0
  return Math.max(...treeNodes.value.map(node => node.height || 0))
})

// 树是否平衡
const isTreeBalanced = computed(() => {
  return treeNodes.value.every(node => Math.abs(node.balanceFactor || 0) <= 1)
})

// 判断节点是否为新插入
const isNewNode = (value: number) => {
  return props.animationState.newNode?.value === value
}

// 判断节点是否高亮
const isHighlightedNode = (value: number) => {
  return props.animationState.highlightedNode === value
}

// 判断节点是否不平衡
const isUnbalanced = (node: any) => {
  return Math.abs(node.balanceFactor || 0) > 1
}

// 获取旋转路径
const getRotationPath = (indicator: any) => {
  const { centerX, centerY, type } = indicator
  const radius = 50
  
  if (type === 'LL' || type === 'RR') {
    // 单旋转
    const startAngle = type === 'LL' ? 0 : Math.PI
    const endAngle = startAngle + Math.PI
    
    const startX = centerX + radius * Math.cos(startAngle)
    const startY = centerY + radius * Math.sin(startAngle)
    const endX = centerX + radius * Math.cos(endAngle)
    const endY = centerY + radius * Math.sin(endAngle)
    
    return `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`
  } else {
    // 双旋转
    const midRadius = 30
    return `M ${centerX - radius} ${centerY} Q ${centerX} ${centerY - midRadius} ${centerX + radius} ${centerY}`
  }
}

// 获取节点填充色
const getNodeFill = (node: any) => {
  if (isUnbalanced(node)) {
    return 'url(#unbalancedNodeGradient)'
  }
  
  if (node.isNew) {
    return 'url(#newNodeGradient)'
  }
  
  if (node.isHighlighted) {
    return 'url(#newNodeGradient)'
  }
  
  return 'url(#balancedNodeGradient)'
}

// 获取节点边框色
const getNodeStroke = (node: any) => {
  if (isUnbalanced(node)) return '#e74c3c'
  if (node.isNew || node.isHighlighted) return '#f39c12'
  return '#27ae60'
}

// 获取文字颜色
const getTextColor = (node: any) => {
  return 'white'
}

// 获取平衡因子颜色
const getBalanceFactorColor = (node: any) => {
  const bf = node.balanceFactor || 0
  if (Math.abs(bf) > 1) return '#e74c3c'
  if (bf === 0) return '#27ae60'
  return '#f39c12'
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
.avl-tree-animation {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.tree-node {
  transition: all 0.5s ease;
  cursor: pointer;
}

.node-circle {
  transition: all 0.3s ease;
  filter: drop-shadow(0 3px 6px rgba(0,0,0,0.1));
}

.tree-node:hover .node-circle {
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.2)) brightness(1.1);
  transform: scale(1.05);
}

.node-text, .balance-factor, .node-height {
  user-select: none;
  pointer-events: none;
}

.balance-factor {
  font-family: 'Monaco', 'Menlo', monospace;
}

.tree-edge {
  transition: all 0.3s ease;
}

.tree-edge:hover {
  stroke-width: 3;
  stroke: #3498db;
}

.unbalanced-marker {
  pointer-events: none;
}

.rotation-indicator {
  pointer-events: none;
}

.insertion-path {
  pointer-events: none;
}

.balance-info-panel {
  pointer-events: none;
}

.balance-info-panel rect {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

/* 动画效果 */
@keyframes nodeInsert {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes balanceRestore {
  0% {
    stroke: #e74c3c;
  }
  100% {
    stroke: #27ae60;
  }
}

.tree-node[data-new="true"] {
  animation: nodeInsert 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.tree-node[data-balanced="true"] {
  animation: balanceRestore 1s ease-in-out;
}

/* 平衡因子样式 */
.balance-factor[data-critical="true"] {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .balance-info-panel rect {
    width: 160px;
    height: 100px;
  }
  
  .balance-info-panel text {
    font-size: 10px;
  }
}
</style>