<template>
  <div class="guide-overlay" @click.self="closeGuide" style="border: 5px solid red !important;">
    <!-- 临时调试信息 -->
    <div style="position: absolute; top: 0; left: 0; background: yellow; color: black; padding: 5px; z-index: 10001;">
      UserGuide组件已渲染
    </div>
    <div class="guide-modal">
      <div class="guide-header">
        <h2 class="guide-title">数据结构动画使用指南</h2>
        <button @click="closeGuide" class="close-button">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="guide-content">
        <!-- Tab 导航 -->
        <div class="guide-tabs">
          <button 
            v-for="tab in guideTabs" 
            :key="tab.id"
            :class="['guide-tab', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.name }}</span>
          </button>
        </div>
        
        <!-- Tab 内容 -->
        <div>
          <!-- 快速开始 -->
          <div v-if="activeTab === 'quickstart'">
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; color: #3b82f6;">🚀 快速开始</h3>
            <div>
              <div class="step-card">
                <div class="step-header">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h4>选择数据结构</h4>
                    <p>点击顶部的数据结构标签，选择您想要学习的数据结构（单链表、二叉树、数组、栈、队列、AVL树）。</p>
                  </div>
                </div>
              </div>
              
              <div class="step-card">
                <div class="step-header">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h4>快速演示</h4>
                    <p>点击"快速演示"区域的按钮，观看预设的操作序列动画，了解数据结构的基本操作。</p>
                  </div>
                </div>
              </div>
              
              <div class="step-card">
                <div class="step-header">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h4>自定义操作</h4>
                    <p>选择具体操作，输入参数，点击"执行操作"按钮生成动画步骤。</p>
                  </div>
                </div>
              </div>
              
              <div class="step-card">
                <div class="step-header">
                  <div class="step-number">4</div>
                  <div class="step-content">
                    <h4>控制动画</h4>
                    <p>使用播放控制面板来播放、暂停、重置动画，或调整播放速度。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 功能介绍 -->
          <div v-if="activeTab === 'features'">
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; color: #3b82f6;">✨ 功能特色</h3>
            <div class="feature-grid">
              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-play-circle"></i>
                </div>
                <h4 class="feature-title">动态可视化</h4>
                <p class="feature-desc">通过精美的SVG动画展示数据结构的操作过程，让抽象概念变得直观易懂。</p>
              </div>
              
              <div class="feature-item">
                <i class="fas fa-code feature-icon"></i>
                <div>
                  <h4>代码实现</h4>
                  <p>提供每个操作的完整代码实现，帮助理解算法的具体实现细节。</p>
                </div>
              </div>
              
              <div class="feature-item">
                <i class="fas fa-chart-line feature-icon"></i>
                <div>
                  <h4>复杂度分析</h4>
                  <p>详细展示时间复杂度和空间复杂度，深入理解算法性能特征。</p>
                </div>
              </div>
              
              <div class="feature-item">
                <i class="fas fa-lightbulb feature-icon"></i>
                <div>
                  <h4>算法解释</h4>
                  <p>提供详细的算法原理解释和关键要点，帮助深入理解数据结构。</p>
                </div>
              </div>
              
              <div class="feature-item">
                <i class="fas fa-balance-scale feature-icon"></i>
                <div>
                  <h4>AVL树平衡</h4>
                  <p>特别支持AVL树的自动平衡操作，可视化展示旋转过程和平衡因子。</p>
                </div>
              </div>
              
              <div class="feature-item">
                <i class="fas fa-mobile-alt feature-icon"></i>
                <div>
                  <h4>响应式设计</h4>
                  <p>支持桌面和移动设备，在任何设备上都能获得良好的学习体验。</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 数据结构说明 -->
          <div v-if="activeTab === 'structures'" class="tab-panel">
            <h3>📚 数据结构说明</h3>
            <div class="structure-list">
              <div class="structure-item">
                <i class="fas fa-link structure-icon"></i>
                <div>
                  <h4>单链表 (Linked List)</h4>
                  <p>线性数据结构，通过指针连接节点。支持头插、尾插、查询、删除、修改操作。</p>
                  <div class="complexity-info">
                    <span>插入: O(1) / O(n)</span>
                    <span>查找: O(n)</span>
                    <span>删除: O(n)</span>
                  </div>
                </div>
              </div>
              
              <div class="structure-item">
                <i class="fas fa-sitemap structure-icon"></i>
                <div>
                  <h4>二叉树 (Binary Tree)</h4>
                  <p>层次数据结构，每个节点最多有两个子节点。支持插入、删除、前中后序遍历。</p>
                  <div class="complexity-info">
                    <span>插入: O(log n) / O(n)</span>
                    <span>查找: O(log n) / O(n)</span>
                    <span>删除: O(log n) / O(n)</span>
                  </div>
                </div>
              </div>
              
              <div class="structure-item">
                <i class="fas fa-project-diagram structure-icon"></i>
                <div>
                  <h4>AVL树 (AVL Tree)</h4>
                  <p>自平衡二叉搜索树，通过旋转操作保持树的平衡，确保操作的高效性。</p>
                  <div class="complexity-info">
                    <span>插入: O(log n)</span>
                    <span>查找: O(log n)</span>
                    <span>删除: O(log n)</span>
                  </div>
                </div>
              </div>
              
              <div class="structure-item">
                <i class="fas fa-th structure-icon"></i>
                <div>
                  <h4>数组 (Array)</h4>
                  <p>连续内存存储的线性数据结构，支持随机访问。适合频繁访问元素的场景。</p>
                  <div class="complexity-info">
                    <span>访问: O(1)</span>
                    <span>插入: O(n)</span>
                    <span>删除: O(n)</span>
                  </div>
                </div>
              </div>
              
              <div class="structure-item">
                <i class="fas fa-layer-group structure-icon"></i>
                <div>
                  <h4>栈 (Stack)</h4>
                  <p>后进先出(LIFO)的线性数据结构。只能在栈顶进行插入和删除操作。</p>
                  <div class="complexity-info">
                    <span>入栈: O(1)</span>
                    <span>出栈: O(1)</span>
                    <span>查看栈顶: O(1)</span>
                  </div>
                </div>
              </div>
              
              <div class="structure-item">
                <i class="fas fa-stream structure-icon"></i>
                <div>
                  <h4>队列 (Queue)</h4>
                  <p>先进先出(FIFO)的线性数据结构。在队尾插入元素，在队首删除元素。</p>
                  <div class="complexity-info">
                    <span>入队: O(1)</span>
                    <span>出队: O(1)</span>
                    <span>查看队首: O(1)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 使用技巧 -->
          <div v-if="activeTab === 'tips'" class="tab-panel">
            <h3>💡 使用技巧</h3>
            <div class="tips-list">
              <div class="tip-item">
                <i class="fas fa-lightbulb tip-icon"></i>
                <div>
                  <h4>观察动画细节</h4>
                  <p>注意观察节点颜色变化、指针移动方向、高亮显示等细节，这些都传达了重要的算法信息。</p>
                </div>
              </div>
              
              <div class="tip-item">
                <i class="fas fa-step-forward tip-icon"></i>
                <div>
                  <h4>单步调试</h4>
                  <p>使用单步按钮逐步执行动画，可以更仔细地观察每一步的变化过程。</p>
                </div>
              </div>
              
              <div class="tip-item">
                <i class="fas fa-tachometer-alt tip-icon"></i>
                <div>
                  <h4>调整速度</h4>
                  <p>根据理解程度调整动画播放速度，初学者建议使用较慢的速度。</p>
                </div>
              </div>
              
              <div class="tip-item">
                <i class="fas fa-redo tip-icon"></i>
                <div>
                  <h4>反复练习</h4>
                  <p>多次观看同一操作的动画，加深对算法流程的理解和记忆。</p>
                </div>
              </div>
              
              <div class="tip-item">
                <i class="fas fa-code tip-icon"></i>
                <div>
                  <h4>对照代码</h4>
                  <p>结合代码实现标签页，将动画过程与代码逻辑对应起来理解。</p>
                </div>
              </div>
              
              <div class="tip-item">
                <i class="fas fa-chart-bar tip-icon"></i>
                <div>
                  <h4>关注复杂度</h4>
                  <p>理解不同操作的时间复杂度差异，有助于选择合适的数据结构。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      </div>
      
      <!-- 底部按钮 -->
      <div class="guide-footer">
        <button @click="dontShowAgain" class="footer-btn secondary">
          不再显示
        </button>
        <button @click="closeGuide" class="footer-btn primary">
          开始使用
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  close: []
  dontShow: []
}>()

const activeTab = ref('quickstart')

const guideTabs = [
  { id: 'quickstart', name: '快速开始', icon: 'fas fa-rocket' },
  { id: 'features', name: '功能特色', icon: 'fas fa-star' },
  { id: 'structures', name: '数据结构', icon: 'fas fa-database' },
  { id: 'tips', name: '使用技巧', icon: 'fas fa-lightbulb' }
]

const closeGuide = () => {
  console.log('关闭使用指南') // 调试用
  emit('close')
}

const dontShowAgain = () => {
  console.log('不再显示使用指南') // 调试用
  emit('dontShow')
}
</script>

<style scoped>
/* ===== 使用指南样式 ===== */
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.guide-modal {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 64rem;
  max-height: 90vh;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.guide-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.guide-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 1.5rem;
}

.guide-tabs {
  display: flex;
  background: #f1f5f9;
  border-radius: 0.5rem;
  padding: 0.25rem;
  margin-bottom: 1.5rem;
  gap: 0.25rem;
}

.guide-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
}

.guide-tab:hover {
  background: white;
  color: #3b82f6;
}

.guide-tab.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Tab内容样式 */
.step-card {
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.step-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-number {
  background: #3b82f6;
  color: white;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.step-content h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.step-content p {
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.feature-item {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: #3b82f6;
  color: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.feature-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.feature-desc {
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
}

.tip-item {
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.tip-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tip-icon {
  color: #f59e0b;
}

.tip-title {
  font-weight: 600;
  color: #92400e;
}

.tip-content {
  color: #92400e;
  font-size: 0.875rem;
  line-height: 1.5;
}

.guide-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.footer-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
}

.footer-btn.secondary {
  background: white;
  border-color: #e2e8f0;
  color: #64748b;
}

.footer-btn.secondary:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.footer-btn.primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.footer-btn.primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .guide-modal {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .guide-tabs {
    flex-direction: column;
  }
  
  .guide-tab span {
    display: inline;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>