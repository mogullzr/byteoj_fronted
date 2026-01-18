<template>
  <div class="violation-monitor">
    <el-card class="main-card" shadow="hover">
      <template #header>
        <div class="header">
          <h2 class="title">监考异常记录</h2>
          <div class="filter-group">
            <el-select
                v-model="searchDifficulty"
                placeholder="违规等级"
                size="default"
                style="width: 140px"
                @change="refresh"
            >
              <el-option label="中等" value="中等" />
              <el-option label="严重" value="严重" />
            </el-select>
            <el-button type="primary" size="default" @click="refresh">
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="loading" class="loading">
        <el-skeleton :rows="4" animated />
      </div>

      <div v-else-if="!tableData.length" class="empty">
        <el-empty description="暂无匹配的异常记录" />
      </div>

      <div v-else class="record-list">
        <div v-for="item in tableData" :key="item.procter_id" class="record-item">
          <!-- 左侧信息区 -->
          <div class="info-area">
            <div class="header-row">
              <span class="record-id">No. {{ item.procter_id }}</span>
              <el-tag
                  :type="item.type === 3 ? 'danger' : 'warning'"
                  effect="dark"
                  size="default"
                  class="severity-tag"
              >
                {{ getSeverityText(item.type) }}
              </el-tag>
            </div>

            <!-- 新增：用户名 -->
            <div class="user-info">
              <span class="user-label">考生：</span>
                <span class="user-name">{{ item.account || '未知' }}</span>
            </div>

            <h3 class="exam-name">{{ item.competition_name }}</h3>

            <div class="time">
              <el-icon class="time-icon"><Clock /></el-icon>
              {{ formatDate(item.create_date) }}
            </div>

            <div class="description" v-html="highlightDescription(item.description)" />

            <div v-if="item.pages != null" class="pages-info">
              <el-tag type="info" effect="plain" size="small">
                考试总页数：{{ item.pages }} 页
              </el-tag>
            </div>
          </div>

          <!-- 右侧图片 -->
          <div class="image-area">
            <img
                :src="item.img_url"
                alt="抓拍图片"
                class="capture-img"
                @click="openPreview(item.img_url)"
                @error="handleImageError"
            />
          </div>
        </div>
      </div>

      <div class="pagination">
        <el-pagination
            background
            layout="prev, pager, next, total, jumper"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 自定义图片预览 -->
    <teleport to="body">
      <div v-if="previewVisible" class="preview-overlay" @click="closePreview">
        <div class="preview-container" @click.stop>
          <img :src="previewSrc" class="preview-image" alt="大图预览" />
          <div class="close-btn" @click="closePreview">×</div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Clock } from '@element-plus/icons-vue'
import {SearchControllerService} from "../../../generated";

interface ProcterItem {
  procter_id: number
  img_url: string
  competition_name: string
  description: string
  type: number
  create_date: string
  pages: number | null
  account: string          // 新增字段
  uuid?: number
}

const tableData = ref<ProcterItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchDifficulty = ref<string>('中等')

const previewVisible = ref(false)
const previewSrc = ref('')

const openPreview = (url: string) => {
  previewSrc.value = url
  previewVisible.value = true
  document.body.style.overflow = 'hidden'
}

const closePreview = () => {
  previewVisible.value = false
  document.body.style.overflow = ''
}

const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/220x160?text=加载失败'
}

const getSeverityText = (type: number) => (type === 2 ? '中等' : type === 3 ? '严重' : '未知')

const formatDate = (dateStr: string) =>
    dateStr ? new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) : '—'

const highlightDescription = (desc: string) => {
  let text = desc
  text = text.replace(/\[([^\]]+)\]/g, '<strong style="color:#e67e22;">[$1]</strong>')
  text = text.replace(/（([^)]+)）/g, '<span style="color:#909399;">（$1）</span>')
  return text
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      category: 'procter',
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      difficulty: searchDifficulty.value
    }
    const res = await SearchControllerService.searchAllUsingPost(params)
    if (res.code === 0) {
      tableData.value = res.data?.dataList || []
      total.value = res.data?.total ?? tableData.value.length
    } else {
      ElMessage.error(res.message || '获取失败')
    }
  } catch {
    ElMessage.error('网络异常')
  } finally {
    loading.value = false
  }
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchData()
}

const refresh = () => {
  currentPage.value = 1
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped lang="scss">
.violation-monitor {
  padding: 24px;
  background: #f8fafc;
}

.main-card {
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #409eff;
  color: white;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.record-list {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.record-item {
  display: flex;
  background: white;
  border-radius: 10px;
  border: 1px solid #e8f0fe;
  overflow: hidden;
  transition: all 0.25s ease;

  &:hover {
    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
    border-color: #c0d8ff;
  }
}

.info-area {
  flex: 1;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.record-id {
  font-size: 19px;
  font-weight: 700;
  color: #1f2937;
}

.severity-tag {
  font-size: 13px;
  padding: 0 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #374151;

  .user-label {
    color: #6b7280;
    font-weight: 500;
  }

  .user-name {
    color: #f63b3b;
    font-weight: 600;
  }
}

.exam-name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #2563eb;
}

.time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 13px;

  .time-icon {
    font-size: 14px;
  }
}

.description {
  font-size: 24px;
  line-height: 1.6;
  color: #4b5563;
}

.pages-info {
  margin-top: 4px;
}

.image-area {
  width: 220px;
  background: #f9fafb;
  position: relative;
}

.capture-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.capture-img:hover {
  transform: scale(1.06);
}

.pagination {
  padding: 16px 24px;
  text-align: center;
  border-top: 1px solid #f0f0f0;
}

/* 自定义预览 */
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.88);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-container {
  position: relative;
  max-width: 92vw;
  max-height: 92vh;
}

.preview-image {
  max-width: 100%;
  max-height: 100vh;
  border-radius: 8px;
  box-shadow: 0 15px 50px rgba(0,0,0,0.7);
}

.close-btn {
  position: absolute;
  top: -55px;
  right: -10px;
  font-size: 48px;
  color: white;
  cursor: pointer;
  font-weight: bold;
}
</style>