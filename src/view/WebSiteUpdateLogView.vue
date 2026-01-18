<template>
  <div class="update-log-page rounded-2xl">
    <div class="header">
      <h1>更新日志</h1>
      <p class="subtitle">网站近期的功能调整与重要变更</p>
    </div>

    <div v-if="loading" class="status-message">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="updates.length === 0" class="status-message">
      <p>暂无更新记录～</p>
    </div>

    <div v-else class="timeline-container">
      <div class="timeline">
        <div
            class="timeline-item"
            v-for="(item, index) in updates"
            :key="item.create_date + index"
            :class="{ 'is-first-page-first-item': currentPage === 1 && index === 0 }"
        >
          <div class="timeline-marker">
            <div class="timeline-dot"></div>
          </div>
          <div class="timeline-content">
            <div class="card">
              <div class="card-header">
                <time class="date">{{ formatDate(item.create_date) }}</time>
                <span class="module-badge">{{ item.module || '系统更新' }}</span>
              </div>
              <div class="card-body">
                <p class="description">{{ item.description?.trim() || '暂无详细描述' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="!loading && (currentPage > 1 || hasMore)" class="pagination">
      <button
          class="page-btn prev"
          :disabled="currentPage <= 1 || loading"
          @click="changePage(currentPage - 1)"
      >
        ← 上一页
      </button>
      <span class="page-number">第 {{ currentPage }} 页</span>
      <button
          class="page-btn next"
          :disabled="!hasMore || loading"
          @click="changePage(currentPage + 1)"
      >
        下一页 →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SearchControllerService } from "../../generated"

interface UpdateLog {
  create_date: string
  module: string
  description: string
}

const currentPage = ref(1)
const pageSize = 12
const updates = ref<UpdateLog[]>([])
const loading = ref(true)
const hasMore = ref(false)

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr)
    return d
        .toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
        .replace(/年|月/g, '-')
        .replace(/日/g, ' ')
  } catch {
    return dateStr.split('T')[0] || '未知日期'
  }
}

const fetchLogs = async (page: number) => {
  loading.value = true
  try {
    const request = {
      category: "log_website",
      pageNum: page,
      pageSize: pageSize
    }
    const res = await SearchControllerService.searchAllUsingPost(request)

    if (res?.code === 0 && Array.isArray(res.data?.dataList)) {
      updates.value = res.data.dataList
      hasMore.value = res.data.dataList.length >= pageSize
    } else {
      updates.value = []
      hasMore.value = false
    }
  } catch (err) {
    console.error('获取更新日志失败', err)
    updates.value = []
    hasMore.value = false
  } finally {
    loading.value = false
    currentPage.value = page
  }
}

const changePage = (targetPage: number) => {
  if (
      targetPage < 1 ||
      targetPage === currentPage.value ||
      loading.value
  ) return

  fetchLogs(targetPage)
}

onMounted(() => {
  fetchLogs(1)
})
</script>

<style scoped>
.update-log-page {
  max-width: 880px;
  margin: 0 auto;
  padding: 4.5rem 1.5rem 7rem;
  background: linear-gradient(to bottom, #f8f9fc 0%, #ffffff 100%);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 5rem;
}

h1 {
  font-size: 2.9rem;
  font-weight: 800;
  background: linear-gradient(90deg, #5b21b6, #7c3aed, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.6px;
}

.subtitle {
  color: #6b7280;
  font-size: 1.18rem;
  font-weight: 400;
  margin-top: 0.6rem;
}

/* 加载/空状态 */
.status-message {
  text-align: center;
  padding: 7rem 1rem 5rem;
  color: #9ca3af;
  font-size: 1.18rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.4rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #e5e7eb;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 1.1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 时间线主体 */
.timeline-container {
  position: relative;
}

.timeline {
  position: relative;
  padding-left: 44px;
  display: flex;
  flex-direction: column;
  gap: 2.8rem;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 13px;
  width: 3px;
  background: linear-gradient(to bottom, #7c3aed, #a78bfa, #c4b5fd, #e5e7eb);
  border-radius: 999px;
}

.timeline-item {
  border-bottom-right-radius: 12px;
  display: flex;
  gap: 20px;
  position: relative;
  width: 100%;
}

.timeline-marker {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.timeline-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #8b5cf6;
  border: 3px solid white;
  box-shadow: 0 0 0 5px rgba(139, 92, 246, 0.15);
  transition: all 0.35s ease;
}

.timeline-item:hover .timeline-dot {
  transform: scale(1.35);
  background: #7c3aed;
  box-shadow: 0 0 0 10px rgba(124, 58, 237, 0.25);
}

/* 卡片基础样式 */
.timeline-content {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.card {
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* ── 只有第一页的第一条才有特殊样式 ── */
.is-first-page-first-item .card {
  background: rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid rgba(124, 58, 237, 0.38);
  box-shadow: 0 16px 40px -12px rgba(124, 58, 237, 0.28), inset 0 1px 0 rgba(255,255,255,0.35);
  padding: 2.1rem 2.3rem;
  transform: translateY(-10px);
  position: relative;
}

.is-first-page-first-item .card::before {
  content: "最新";
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  color: white;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.45rem 1.3rem;
  border-bottom-right-radius: 12px;
  z-index: 2;
}

.is-first-page-first-item .description {
  font-size: 1.14rem;
  font-weight: 550;
  color: #111827;
  line-height: 1.82;
  background: linear-gradient(to right, rgba(243, 244, 246, 0.55), transparent);
  padding: 0.5rem 0 0.5rem 1.1rem;
  border-radius: 0 8px 8px 0;
  border-left-color: rgba(124, 58, 237, 0.45);
}

/* 普通卡片 */
.timeline-item:not(.is-first-page-first-item) .card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 6px 6px 12px rgba(0,0,0,0.05), -6px -6px 12px rgba(255,255,255,0.7);
  padding: 1.7rem 2rem;
}

.description {
  font-size: 1.02rem;
  line-height: 1.78;
  color: #1f2937;
  font-weight: 440;
  margin: 0.4rem 0;
  padding-left: 0.9rem;
  border-left: 3.5px solid rgba(139, 92, 246, 0.15);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.1rem;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.date {
  font-size: 0.93rem;
  color: #6b7280;
  font-weight: 500;
  font-family: 'SF Mono', Menlo, monospace;
}

.module-badge {
  font-size: 0.84rem;
  padding: 0.38em 1.15em;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.12);
  color: #7c3aed;
  font-weight: 700;
}

/* 分页 */
.pagination {
  margin-top: 4.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.8rem;
  flex-wrap: wrap;
}

.page-btn {
  padding: 0.8rem 1.7rem;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  background: white;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  min-width: 110px;
  text-align: center;
}

.page-btn:hover:not(:disabled) {
  background: #7c3aed;
  color: white;
  border-color: #7c3aed;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -6px rgba(124, 58, 237, 0.3);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.page-number {
  color: #4b5563;
  font-weight: 600;
  font-size: 1.05rem;
  min-width: 110px;
  text-align: center;
}

/* 响应式 */
@media (max-width: 640px) {
  .update-log-page {
    padding: 3rem 1.2rem 5rem;
  }
  h1 {
    font-size: 2.3rem;
  }
  .timeline {
    padding-left: 34px;
  }
  .timeline::before {
    left: 9px;
  }
  .is-first-page-first-item .card {
    padding: 1.7rem 1.8rem;
    transform: translateY(-6px);
  }
  .card {
    padding: 1.5rem 1.6rem;
  }
  .pagination {
    gap: 1.2rem;
  }
  .page-btn {
    padding: 0.7rem 1.4rem;
    min-width: 100px;
  }
}
</style>