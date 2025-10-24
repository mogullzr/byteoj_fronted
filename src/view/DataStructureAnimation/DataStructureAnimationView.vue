<template>
  <div class="data-structure-animation-page">
    <!-- 临时调试信息 -->
    <div style="position: fixed; top: 10px; right: 10px; background: red; color: white; padding: 10px; z-index: 9999;">
      调试: showGuide = {{ showGuide }}
    </div>
    
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">数据结构可视化动画</h1>
      <p class="page-subtitle">通过动态动画学习数据结构的基本操作</p>
    </div>

    <!-- 数据结构选择 -->
    <div class="structure-selector">
      <div class="structure-tabs">
        <button
          v-for="structure in dataStructures"
          :key="structure.id"
          :class="['structure-tab', { active: activeStructure === structure.id }]"
          @click="selectStructure(structure.id)"
        >
          <i :class="structure.icon"></i>
          <span>{{ structure.name }}</span>
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧操作面板 -->
      <div class="operation-panel">
        <div class="section-card">
          <h3 class="section-title">操作选择</h3>
          
          <!-- 操作按钮 -->
          <div class="operation-buttons">
            <button
              v-for="operation in currentStructureData.operations"
              :key="operation.id"
              :class="['operation-btn', { active: activeOperation === operation.id }]"
              @click="selectOperation(operation.id)"
            >
              {{ operation.name }}
            </button>
          </div>

          <!-- 参数输入 -->
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
              />
            </div>
            
            <!-- 执行按钮 -->
            <button
              @click="executeOperation"
              :disabled="!canExecute"
              class="execute-btn"
            >
              <i class="fas fa-play"></i>
              执行操作
            </button>
          </div>

          <!-- 快速演示 -->
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
            <button
              @click="handleShowGuide"
              class="guide-btn"
            >
              <i class="fas fa-question-circle"></i>
              使用指南
            </button>
          </div>

          <!-- 动画控制面板 -->
          <div class="animation-controls">
            <button
              @click="resetAnimation"
              class="control-btn reset"
            >
              <i class="fas fa-undo"></i>
              重置
            </button>
            
            <button
              @click="stepBackward"
              :disabled="currentStep <= 0"
              class="control-btn"
            >
              <i class="fas fa-step-backward"></i>
              上一步
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
              <i class="fas fa-step-forward"></i>
              下一步
            </button>

            <!-- 速度控制 -->
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

          <!-- 进度条 -->
          <div class="progress-container">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
            <span class="progress-text">
              {{ currentStep + 1 }} / {{ totalSteps }}
            </span>
          </div>

          <!-- 动画画布 -->
          <div class="animation-canvas" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }">
            <svg
              :width="canvasWidth"
              :height="canvasHeight"
              class="animation-svg"
            >
              <!-- 动态组件渲染 -->
              <component
                :is="currentAnimationComponent"
                :data="structureData"
                :animation-state="animationState"
                :current-step="currentStep"
              />
            </svg>
          </div>

          <!-- 当前步骤描述 -->
          <div v-if="currentStepDescription" class="step-description">
            <h4 class="step-title">当前步骤</h4>
            <p class="step-text">{{ currentStepDescription }}</p>
          </div>
        </div>
      </div>

      <!-- 右侧信息面板 -->
      <div class="info-panel">
        <!-- 算法分析 -->
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
                <li v-for="point in currentOperationKeyPoints" :key="point" class="keypoint-item">
                  {{ point }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 代码展示 -->
        <div v-if="showCode" class="section-card">
          <h3 class="section-title">
            代码实现
            <button
              @click="showCode = false"
              class="close-code-btn"
            >
              <i class="fas fa-times"></i>
            </button>
          </h3>
          <pre class="code-block"><code>{{ currentOperationCode }}</code></pre>
        </div>
      </div>
    </div>

    <!-- 使用指南弹窗 -->
    <UserGuide 
      v-if="showGuide" 
      @close="showGuide = false" 
      @dont-show="showGuide = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import LinkedListAnimation from './components/LinkedListAnimation.vue'
import BinaryTreeAnimation from './components/BinaryTreeAnimation.vue'
import ArrayAnimation from './components/ArrayAnimation.vue'
import StackAnimation from './components/StackAnimation.vue'
import QueueAnimation from './components/QueueAnimation.vue'
import AVLTreeAnimation from './components/AVLTreeAnimation.vue'
import UserGuide from './components/UserGuide.vue'

// 响应式数据
const activeStructure = ref('linkedlist')
const activeOperation = ref('')
const operationParams = reactive<Record<string, any>>({})
const animationSpeed = ref(1)
const isPlaying = ref(false)
const currentStep = ref(0)
const totalSteps = ref(0)
const structureData = ref<any>([])
const animationState = reactive({
  steps: [],
  currentOperation: '',
  highlightedNode: -1,
  newNode: null
})
const showCode = ref(false)
const canvasWidth = ref(800)
const canvasHeight = ref(400)
const activeTab = ref('complexity')
const showGuide = ref(false)

// 数据结构配置
const dataStructures = [
  {
    id: 'linkedlist',
    name: '单链表',
    icon: 'fas fa-link',
    operations: [
      {
        id: 'insert_head',
        name: '头插法',
        params: [
          { name: 'value', label: '值', type: 'number', placeholder: '请输入数值', min: 1, max: 999 }
        ]
      },
      {
        id: 'insert_tail',
        name: '尾插法',
        params: [
          { name: 'value', label: '值', type: 'number', placeholder: '请输入数值', min: 1, max: 999 }
        ]
      },
      {
        id: 'search',
        name: '查找元素',
        params: [
          { name: 'value', label: '查找值', type: 'number', placeholder: '请输入要查找的值' }
        ]
      },
      {
        id: 'delete',
        name: '删除元素',
        params: [
          { name: 'value', label: '删除值', type: 'number', placeholder: '请输入要删除的值' }
        ]
      },
      {
        id: 'insert_at_index',
        name: '第i个位置插入',
        params: [
          { name: 'index', label: '位置', type: 'number', placeholder: '请输入位置(从0开始)', min: 0 },
          { name: 'value', label: '值', type: 'number', placeholder: '请输入数值', min: 1, max: 999 }
        ]
      },
      {
        id: 'search_at_index',
        name: '第i个位置查找',
        params: [
          { name: 'index', label: '位置', type: 'number', placeholder: '请输入位置(从0开始)', min: 0 }
        ]
      }
    ]
  },
  {
    id: 'binarytree',
    name: '二叉树',
    icon: 'fas fa-sitemap',
    operations: [
      {
        id: 'insert',
        name: '插入节点',
        params: [
          { name: 'value', label: '值', type: 'number', placeholder: '请输入数值' }
        ]
      },
      {
        id: 'delete',
        name: '删除节点',
        params: [
          { name: 'value', label: '删除值', type: 'number', placeholder: '请输入要删除的值' }
        ]
      },
      {
        id: 'search',
        name: '查找节点',
        params: [
          { name: 'value', label: '查找值', type: 'number', placeholder: '请输入要查找的值' }
        ]
      },
      {
        id: 'preorder',
        name: '前序遍历',
        params: []
      },
      {
        id: 'inorder',
        name: '中序遍历',
        params: []
      },
      {
        id: 'postorder',
        name: '后序遍历',
        params: []
      }
    ]
  },
  {
    id: 'array',
    name: '数组',
    icon: 'fas fa-th',
    operations: [
      {
        id: 'insert',
        name: '插入元素',
        params: [
          { name: 'index', label: '位置', type: 'number', placeholder: '插入位置' },
          { name: 'value', label: '值', type: 'number', placeholder: '请输入数值' }
        ]
      },
      {
        id: 'delete',
        name: '删除元素',
        params: [
          { name: 'index', label: '位置', type: 'number', placeholder: '删除位置' }
        ]
      },
      {
        id: 'search',
        name: '查找元素',
        params: [
          { name: 'value', label: '查找值', type: 'number', placeholder: '请输入要查找的值' }
        ]
      },
      {
        id: 'update',
        name: '修改元素',
        params: [
          { name: 'index', label: '位置', type: 'number', placeholder: '修改位置' },
          { name: 'value', label: '新值', type: 'number', placeholder: '请输入新值' }
        ]
      }
    ]
  },
  {
    id: 'stack',
    name: '栈',
    icon: 'fas fa-layer-group',
    operations: [
      {
        id: 'push',
        name: '入栈',
        params: [
          { name: 'value', label: '值', type: 'number', placeholder: '请输入数值' }
        ]
      },
      {
        id: 'pop',
        name: '出栈',
        params: []
      },
      {
        id: 'peek',
        name: '查看栈顶',
        params: []
      }
    ]
  },
  {
    id: 'queue',
    name: '队列',
    icon: 'fas fa-arrow-right',
    operations: [
      {
        id: 'enqueue',
        name: '入队',
        params: [
          { name: 'value', label: '值', type: 'number', placeholder: '请输入数值' }
        ]
      },
      {
        id: 'dequeue',
        name: '出队',
        params: []
      },
      {
        id: 'front',
        name: '查看队首',
        params: []
      }
    ]
  },
  {
    id: 'avltree',
    name: 'AVL树',
    icon: 'fas fa-project-diagram',
    operations: [
      {
        id: 'insert',
        name: '插入节点',
        params: [
          { name: 'value', label: '值', type: 'number', placeholder: '请输入数值' }
        ]
      },
      {
        id: 'delete',
        name: '删除节点',
        params: [
          { name: 'value', label: '删除值', type: 'number', placeholder: '请输入要删除的值' }
        ]
      },
      {
        id: 'search',
        name: '查找节点',
        params: [
          { name: 'value', label: '查找值', type: 'number', placeholder: '请输入要查找的值' }
        ]
      },
      {
        id: 'balance',
        name: '平衡调整',
        params: []
      }
    ]
  }
]

// 计算属性
const currentStructureData = computed(() => {
  return dataStructures.find(s => s.id === activeStructure.value) || dataStructures[0]
})

const activeOperationData = computed(() => {
  if (!activeOperation.value) return null
  return currentStructureData.value.operations.find(op => op.id === activeOperation.value) || null
})

const currentAnimationComponent = computed(() => {
  const componentMap: Record<string, any> = {
    'linkedlist': LinkedListAnimation,
    'binarytree': BinaryTreeAnimation,
    'array': ArrayAnimation,
    'stack': StackAnimation,
    'queue': QueueAnimation,
    'avltree': AVLTreeAnimation
  }
  return componentMap[activeStructure.value] || LinkedListAnimation
})

const canPlay = computed(() => {
  return totalSteps.value > 0 && animationState.steps.length > 0
})

const canExecute = computed(() => {
  if (!activeOperationData.value) return false
  
  // 检查所有必需参数是否已填写
  return activeOperationData.value.params.every((param: any) => {
    return operationParams[param.name] !== undefined && 
           operationParams[param.name] !== '' && 
           operationParams[param.name] !== null
  })
})

const progressPercentage = computed(() => {
  if (totalSteps.value === 0) return 0
  return Math.round((currentStep.value / Math.max(1, totalSteps.value - 1)) * 100)
})

const currentStepDescription = computed(() => {
  if (!animationState.steps || currentStep.value < 0 || currentStep.value >= animationState.steps.length) {
    return ''
  }
  const step = animationState.steps[currentStep.value]
  return step?.stepDescription || step?.description || ''
})

const quickDemos = computed(() => {
  const demoMap: Record<string, any[]> = {
    'linkedlist': [
      {
        name: '基本操作演示',
        operations: [
          { id: 'insert_head', params: { value: 5 } },
          { id: 'insert_tail', params: { value: 10 } },
          { id: 'insert_head', params: { value: 3 } },
          { id: 'search', params: { value: 10 } }
        ]
      },
      {
        name: '插入删除演示',
        operations: [
          { id: 'insert_tail', params: { value: 1 } },
          { id: 'insert_tail', params: { value: 2 } },
          { id: 'insert_tail', params: { value: 3 } },
          { id: 'delete', params: { value: 2 } }
        ]
      }
    ],
    'stack': [
      {
        name: 'LIFO演示',
        operations: [
          { id: 'push', params: { value: 1 } },
          { id: 'push', params: { value: 2 } },
          { id: 'push', params: { value: 3 } },
          { id: 'pop', params: {} },
          { id: 'pop', params: {} }
        ]
      }
    ],
    'queue': [
      {
        name: 'FIFO演示',
        operations: [
          { id: 'enqueue', params: { value: 1 } },
          { id: 'enqueue', params: { value: 2 } },
          { id: 'enqueue', params: { value: 3 } },
          { id: 'dequeue', params: {} },
          { id: 'dequeue', params: {} }
        ]
      }
    ]
  }
  return demoMap[activeStructure.value] || []
})

const currentOperationComplexity = computed(() => {
  const complexityMap: Record<string, { time: string, space: string }> = {
    'insert_head': { time: 'O(1)', space: 'O(1)' },
    'insert_tail': { time: 'O(n)', space: 'O(1)' },
    'search': { time: 'O(n)', space: 'O(1)' },
    'delete': { time: 'O(n)', space: 'O(1)' },
    'insert_at_index': { time: 'O(n)', space: 'O(1)' },
    'search_at_index': { time: 'O(n)', space: 'O(1)' },
    'push': { time: 'O(1)', space: 'O(1)' },
    'pop': { time: 'O(1)', space: 'O(1)' },
    'enqueue': { time: 'O(1)', space: 'O(1)' },
    'dequeue': { time: 'O(1)', space: 'O(1)' }
  }
  
  return complexityMap[activeOperation.value] || { time: 'O(?)', space: 'O(?)' }
})

const currentOperationExplanation = computed(() => {
  const explanationMap: Record<string, string> = {
    'insert_head': '头插法是在链表头部插入新节点的操作。新节点的next指针指向原头节点，然后更新头指针指向新节点。时间复杂度为O(1)。',
    'insert_tail': '尾插法是在链表尾部插入新节点的操作。需要从头节点开始遍历，找到最后一个节点（next为null的节点），然后将其next指针指向新节点。',
    'search': '链表查找是一个线性搜索过程。从头节点开始，逐个比较每个节点的值，直到找到目标值或遍历完整个链表。',
    'delete': '删除操作需要找到目标节点的前一个节点，然后修改其next指针，跳过要删除的节点。如果删除的是头节点，需要特殊处理。',
    'push': '栈的入栈操作遵循LIFO（后进先出）原则。新元素总是添加到栈顶，这是栈中最后添加的位置。',
    'pop': '栈的出栈操作移除并返回栈顶元素。如果栈为空，通常会抛出异常或返回特殊值。',
    'enqueue': '队列的入队操作遵循FIFO（先进先出）原则。新元素添加到队列的尾部（rear）。',
    'dequeue': '队列的出队操作移除并返回队列头部（front）的元素。这是队列中最早添加的元素。'
  }
  
  return explanationMap[activeOperation.value] || '请选择一个操作来查看详细解释。'
})

const currentOperationKeyPoints = computed(() => {
  const keyPointsMap: Record<string, string[]> = {
    'insert_head': [
      '时间复杂度为O(1)，效率很高',
      '需要更新头指针',
      '新节点的next指向原头节点',
      '适合频繁在头部插入的场景'
    ],
    'insert_tail': [
      '时间复杂度为O(n)，需要遍历到尾部',
      '需要找到最后一个节点',
      '最后一个节点的next指向新节点',
      '如果有尾指针可以优化到O(1)'
    ],
    'search': [
      '时间复杂度为O(n)，最坏情况遍历所有节点',
      '无法利用随机访问，必须顺序查找',
      '平均查找时间为n/2',
      '适合小规模数据或不频繁查找的场景'
    ],
    'delete': [
      '需要找到前驱节点',
      '修改前驱节点的next指针',
      '删除头节点需要特殊处理',
      '时间复杂度为O(n)'
    ],
    'push': [
      '遵循LIFO原则',
      '只能在栈顶操作',
      '时间复杂度O(1)',
      '用于函数调用、表达式求值等'
    ],
    'pop': [
      '移除栈顶元素',
      '需要检查栈是否为空',
      '时间复杂度O(1)',
      '返回被移除的元素'
    ]
  }
  
  return keyPointsMap[activeOperation.value] || []
})

const currentOperationCode = computed(() => {
  // 这里可以返回对应操作的代码实现
  return `// ${activeOperation.value} 的代码实现
function ${activeOperation.value}() {
  // 具体实现代码
}`
})

// 方法
const handleShowGuide = () => {
  console.log('使用指南按钮被点击，当前showGuide值:', showGuide.value) // 调试用
  showGuide.value = true
  console.log('设置后showGuide值:', showGuide.value) // 调试用
  console.log('UserGuide组件应该显示了')
}

const selectStructure = (structureId: string) => {
  activeStructure.value = structureId
  activeOperation.value = ''
  Object.keys(operationParams).forEach(key => {
    delete operationParams[key]
  })
  resetAnimation()
  initializeStructureData()
}

const selectOperation = (operationId: string) => {
  activeOperation.value = operationId
  // 清空之前的参数
  Object.keys(operationParams).forEach(key => {
    delete operationParams[key]
  })
}

const executeOperation = () => {
  if (!canExecute.value) return
  
  const steps = generateAnimationSteps(activeOperation.value, operationParams)
  animationState.steps = steps
  animationState.currentOperation = activeOperation.value
  totalSteps.value = steps.length
  currentStep.value = 0
}

const playAnimation = () => {
  if (!canPlay.value) return
  isPlaying.value = true
  
  const interval = setInterval(() => {
    if (currentStep.value >= totalSteps.value - 1) {
      isPlaying.value = false
      clearInterval(interval)
      return
    }
    stepForward()
  }, 1000 / animationSpeed.value)
}

const pauseAnimation = () => {
  isPlaying.value = false
}

const resetAnimation = () => {
  isPlaying.value = false
  currentStep.value = 0
  animationState.steps = []
  totalSteps.value = 0
}

const stepForward = () => {
  if (currentStep.value < totalSteps.value - 1) {
    currentStep.value++
  }
}

const stepBackward = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const runQuickDemo = async (demo: any) => {
  resetAnimation()
  await playAnimationSequence(demo.operations)
}

const playAnimationSequence = async (operations: any[]) => {
  for (const operation of operations) {
    // 设置操作和参数
    activeOperation.value = operation.id
    Object.assign(operationParams, operation.params)
    
    // 执行操作
    executeOperation()
    
    // 播放动画
    await new Promise(resolve => {
      playAnimation()
      const checkComplete = () => {
        if (!isPlaying.value) {
          resolve(void 0)
        } else {
          setTimeout(checkComplete, 100)
        }
      }
      checkComplete()
    })
    
    // 等待一秒再执行下一个操作
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

const generateAnimationSteps = (operation: string, params: any) => {
  const steps: any[] = []
  
  switch (operation) {
    case 'insert_head':
      const newHeadValue = params.value
      steps.push(
        {
          type: 'step_1',
          description: '第一步：创建新节点',
          stepDescription: `创建一个新节点，存储值 ${newHeadValue}，此时新节点的next指针为空`,
          highlightNode: -1,
          showNewNode: true,
          newNodeValue: newHeadValue,
          newNodePosition: 'left'
        },
        {
          type: 'step_2',
          description: '第二步：设置新节点的next指针',
          stepDescription: `将新节点的next指针指向当前的头节点${structureData.value.length > 0 ? '(值为 ' + structureData.value[0].value + ')' : '(链表为空，指向NULL)'}`,
          highlightNode: 0,
          highlightColor: '#3498db',
          showNewNode: true,
          newNodeValue: newHeadValue,
          newNodePosition: 'left',
          showPointerChange: true,
          pointerFrom: 'newNode',
          pointerTo: 'head'
        },
        {
          type: 'step_3',
          description: '第三步：更新头指针',
          stepDescription: '将头指针(HEAD)从原来的节点指向新创建的节点',
          highlightNode: -1,
          showNewNode: true,
          newNodeValue: newHeadValue,
          newNodePosition: 'left',
          showHeadPointerChange: true,
          headPointerTo: 'newNode'
        },
        {
          type: 'step_4',
          description: '第四步：完成插入',
          stepDescription: `头插法完成！新节点(值为 ${newHeadValue})已成为链表的头节点`,
          highlightNode: 0,
          highlightColor: '#27ae60',
          showInsertComplete: true
        }
      )
      // 实际更新数据
      structureData.value.unshift({ id: Date.now(), value: newHeadValue, next: structureData.value[0]?.id || null })
      break
      
    case 'insert_tail':
      const newTailValue = params.value
      steps.push({
        type: 'step_1',
        description: '第一步：创建新节点',
        stepDescription: `创建一个新节点，存储值 ${newTailValue}，此时新节点的next指针为NULL`,
        highlightNode: -1,
        showNewNode: true,
        newNodeValue: newTailValue,
        newNodePosition: 'right'
      })

      if (structureData.value.length === 0) {
        steps.push({
          type: 'step_2',
          description: '第二步：链表为空，设置为头节点',
          stepDescription: '链表为空，将新节点设置为头节点',
          highlightNode: -1,
          showNewNode: true,
          newNodeValue: newTailValue,
          newNodePosition: 'center',
          showHeadPointerChange: true,
          headPointerTo: 'newNode'
        })
      } else {
        for (let i = 0; i < structureData.value.length; i++) {
          if (i === structureData.value.length - 1) {
            steps.push({
              type: 'step_traverse_end',
              description: `第${i + 2}步：找到尾节点`,
              stepDescription: `找到尾节点(值为 ${structureData.value[i].value})，其next指针指向NULL`,
              highlightNode: i,
              highlightColor: '#f39c12',
              showNewNode: true,
              newNodeValue: newTailValue,
              newNodePosition: 'right'
            })
          } else {
            steps.push({
              type: 'step_traverse',
              description: `第${i + 2}步：遍历节点`,
              stepDescription: `当前节点(值为 ${structureData.value[i].value})不是尾节点，继续向下遍历`,
              highlightNode: i,
              highlightColor: '#3498db',
              showNewNode: true,
              newNodeValue: newTailValue,
              newNodePosition: 'right'
            })
          }
        }

        steps.push({
          type: 'step_link',
          description: `第${structureData.value.length + 2}步：连接新节点`,
          stepDescription: `将尾节点的next指针从NULL改为指向新节点`,
          highlightNode: structureData.value.length - 1,
          highlightColor: '#27ae60',
          showNewNode: true,
          newNodeValue: newTailValue,
          newNodePosition: 'right',
          showPointerChange: true,
          pointerFrom: 'tail',
          pointerTo: 'newNode'
        })
      }

      steps.push({
        type: 'step_complete',
        description: '最后一步：完成插入',
        stepDescription: `尾插法完成！新节点(值为 ${newTailValue})已成为链表的尾节点`,
        highlightNode: structureData.value.length,
        highlightColor: '#27ae60',
        showInsertComplete: true
      })

      // 实际更新数据
      const newNodeId = Date.now()
      if (structureData.value.length === 0) {
        structureData.value.push({ id: newNodeId, value: newTailValue, next: null })
      } else {
        const lastNode = structureData.value[structureData.value.length - 1]
        const newNode = { id: newNodeId, value: newTailValue, next: null }
        lastNode.next = newNodeId
        structureData.value.push(newNode)
      }
      break
      
    default:
      steps.push({
        type: 'placeholder',
        stepDescription: `执行 ${operation} 操作`
      })
  }
  
  return steps
}

const initializeStructureData = () => {
  switch (activeStructure.value) {
    case 'linkedlist':
      structureData.value = [
        { id: 1, value: 10, next: 2 },
        { id: 2, value: 20, next: 3 },
        { id: 3, value: 30, next: null }
      ]
      break
    case 'array':
      structureData.value = [
        { value: 10, index: 0 },
        { value: 20, index: 1 },
        { value: 30, index: 2 }
      ]
      break
    case 'stack':
      structureData.value = [10, 20, 30]
      break
    case 'queue':
      structureData.value = [10, 20, 30]
      break
    default:
      structureData.value = []
  }
}

// 生命周期
onMounted(() => {
  initializeStructureData()
})
</script>

<style scoped>
/* ===== 页面布局 ===== */
.data-structure-animation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

/* ===== 数据结构选择器 ===== */
.structure-selector {
  margin-bottom: 2rem;
}

.structure-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.structure-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.structure-tab:hover {
  border-color: #3498db;
  color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.structure-tab.active {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-color: #2980b9;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(52, 152, 219, 0.3);
}

/* ===== 主要内容区域 ===== */
.main-content {
  display: grid;
  grid-template-columns: 300px 1fr 320px;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.section-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: 1px solid #e9ecef;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f8f9fa;
}

/* ===== 操作面板 ===== */
.operation-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.operation-btn {
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.operation-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.operation-btn.active {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-color: #2980b9;
  color: white;
}

.operation-params {
  margin-bottom: 1.5rem;
}

.params-title {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1rem;
}

.param-input-group {
  margin-bottom: 1rem;
}

.param-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.param-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.15s ease;
}

.param-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.execute-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #27ae60, #229954);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.execute-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
}

.execute-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* ===== 快速演示 ===== */
.demo-title {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1rem;
}

.demo-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.demo-btn {
  padding: 0.5rem 0.75rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #856404;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-btn:hover {
  background: #ffeaa7;
  transform: translateY(-1px);
}

/* ===== 动画区域 ===== */
.animation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.guide-btn {
  padding: 0.5rem 1rem;
  background: #17a2b8;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.guide-btn:hover {
  background: #138496;
  transform: translateY(-1px);
}

.animation-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  flex-wrap: wrap;
}

.control-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-btn:hover:not(:disabled) {
  background: #e9ecef;
  transform: translateY(-1px);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.play-pause {
  background: linear-gradient(135deg, #28a745, #20c997);
  border-color: #28a745;
  color: white;
}

.control-btn.play-pause:hover:not(:disabled) {
  background: linear-gradient(135deg, #20c997, #28a745);
}

.control-btn.reset {
  background: linear-gradient(135deg, #dc3545, #c82333);
  border-color: #dc3545;
  color: white;
}

.control-btn.reset:hover {
  background: linear-gradient(135deg, #c82333, #dc3545);
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.speed-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #6c757d;
}

.speed-slider {
  width: 80px;
}

.speed-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
  min-width: 30px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.85rem;
  font-weight: 500;
  color: #6c757d;
  min-width: 50px;
}

.animation-canvas {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: white;
  overflow: hidden;
  margin-bottom: 1rem;
}

.animation-svg {
  width: 100%;
  height: 100%;
}

.step-description {
  padding: 1rem;
  background: #f8f9fa;
  border-left: 4px solid #3498db;
  border-radius: 6px;
}

.step-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.step-text {
  font-size: 0.9rem;
  color: #495057;
  line-height: 1.5;
  margin: 0;
}

/* ===== 信息面板 ===== */
.analysis-tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.25rem;
}

.analysis-tab {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.analysis-tab:hover {
  color: #495057;
}

.analysis-tab.active {
  background: white;
  color: #3498db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.analysis-content {
  min-height: 120px;
}

.complexity-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.complexity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.complexity-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
}

.complexity-value {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: #e74c3c;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.explanation-content p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #495057;
  margin: 0;
}

.keypoints-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.keypoint-item {
  position: relative;
  padding: 0.5rem 0 0.5rem 1.5rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #495057;
  border-bottom: 1px solid #f8f9fa;
}

.keypoint-item:before {
  content: '✓';
  position: absolute;
  left: 0;
  top: 0.5rem;
  color: #28a745;
  font-weight: 600;
}

.keypoint-item:last-child {
  border-bottom: none;
}

.code-block {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  overflow-x: auto;
  margin: 0;
}

.close-code-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.close-code-btn:hover {
  color: #dc3545;
}

/* ===== 响应式设计 ===== */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 280px 1fr 300px;
    gap: 1.5rem;
  }
}

@media (max-width: 992px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .structure-tabs {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .animation-controls {
    justify-content: center;
  }
  
  .speed-control {
    margin-left: 0;
    margin-top: 0.5rem;
  }
}

@media (max-width: 768px) {
  .data-structure-animation-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .structure-tab {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  
  .animation-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-btn {
    justify-content: center;
  }
  
  .progress-container {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .progress-text {
    text-align: center;
  }
}
</style>