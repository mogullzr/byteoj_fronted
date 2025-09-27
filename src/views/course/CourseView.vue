<template>
  <div class="course-list-container bg-gradient-to-br from-gray-50 to-gray-100 h-screen p-4">
    <div class="max-w-full mx-auto bg-white rounded-xl shadow-md p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 flex items-center">
          <i class="el-icon-collection mr-2"></i> 课程管理
        </h1>
        <el-button
            type="primary"
            @click="handleCreate"
            class="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 py-2 shadow-md transition-colors duration-200"
        >
          <i class="el-icon-plus mr-1"></i>
          创建课程
        </el-button>
      </div>
      <el-table
          :data="courses"
          style="width: 100%"
          border
          stripe
          class="admin-table"
          :row-class-name="'cursor-pointer'"
      >
        <el-table-column prop="course_id" label="ID" width="80" align="center" header-align="center">
          <template #header>
            <span class="font-semibold text-gray-700">ID</span>
          </template>
        </el-table-column>
        <el-table-column prop="course_title" label="课程标题" min-width="200" header-align="center">
          <template #header>
            <span class="font-semibold text-gray-700">课程标题</span>
          </template>
          <template #default="{ row }">
            <span class="text-gray-800 font-medium">{{ row.course_title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="头像" width="80" align="center" header-align="center">
          <template #header>
            <span class="font-semibold text-gray-700">头像</span>
          </template>
          <template #default="{ row }">
            <el-avatar
                :size="40"
                :src="row.avatar"
                class="border border-gray-200 shadow-sm"
            />
          </template>
        </el-table-column>
        <el-table-column prop="create_name" label="创建者" width="120" align="center" header-align="center">
          <template #header>
            <span class="font-semibold text-gray-700">创建者</span>
          </template>
        </el-table-column>
        <el-table-column prop="num" label="人数" width="100" align="center" header-align="center">
          <template #header>
            <span class="font-semibold text-gray-700">人数</span>
          </template>
          <template #default="{ row }">
            <el-tag type="primary" effect="dark" size="small">{{ row.num }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pay" label="价格" width="140" align="center" header-align="center">
          <template #header>
            <span class="font-semibold text-gray-700">价格</span>
          </template>
          <template #default="{ row }">
            <div class="price-display">
              <el-tag 
                v-if="row.pay === 0 || row.pay === null" 
                type="success" 
                effect="dark" 
                size="large"
                class="price-tag free-tag">
                <i class="el-icon-check mr-1"></i>
                免费
              </el-tag>
              <div v-else class="paid-price">
                <div class="price-badge">
                  <span class="currency">¥</span>
                  <span class="amount">{{ parseFloat(row.pay).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="160" align="center" header-align="center">
          <template #header>
            <span class="font-semibold text-gray-700">创建时间</span>
          </template>
          <template #default="{ row }">
            {{ formatDate(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="course_title_description" label="描述" min-width="300" header-align="center">
          <template #header>
            <span class="font-semibold text-gray-700">描述</span>
          </template>
          <template #default="{ row }">
            <span class="line-clamp-2 text-gray-600" v-html="row.course_title_description"></span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right" header-align="center">
          <template #header>
            <span class="font-semibold text-gray-700">操作</span>
          </template>
          <template #default="{ row }">
            <el-button
                type="primary"
                size="small"
                @click="handleEdit(row.course_id)"
                class="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1 transition-colors duration-200"
            >
              编辑
            </el-button>
            <el-button
                type="danger"
                size="small"
                @click="handleDelete(row.course_id)"
                class="bg-red-600 hover:bg-red-700 text-white rounded-md px-3 py-1 transition-colors duration-200"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElTable, ElTableColumn, ElAvatar, ElButton, ElTag } from 'element-plus'
import {CourseControllerService} from "../../../generated/index.ts";


const courses = ref([])
const router = useRouter()

// Fetch course data
const fetchCourses = async (pageNum = 1) => {
  try {
    const res = await CourseControllerService.courseSearchByPageNumUsingPost(pageNum)
    if (res.code === 0) {
      courses.value = res.data
    } else {
      ElMessage.error(res.message || '获取课程信息失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
  }
}

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Handle edit
const handleEdit = (courseId) => {
  router.push(`/course/edit?course_id=${courseId}`)
}

// Handle create
const handleCreate = () => {
  router.push('/course/create')
}

// Handle delete with triple confirmation
const handleDelete = async (courseId) => {
  try {
    await ElMessageBox.confirm(
        '您确定要删除此课程吗？此操作将删除所有相关信息！',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
          cancelButtonClass: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        }
    )

    await ElMessageBox.confirm(
        '请再次确认是否删除此课程，此操作不可恢复！',
        '第二次确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
          cancelButtonClass: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        }
    )

    await ElMessageBox.confirm(
        '这是最后一次确认，删除后数据将无法恢复！',
        '最终确认',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'error',
          confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
          cancelButtonClass: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        }
    )

    // Perform delete operation
    const res = await CourseControllerService.courseAdminDeleteUsingPost(courseId)
    if (res.code === 0) {
      ElMessage.success('课程删除成功')
      await fetchCourses() // Refresh course list
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('删除操作已取消')
    } else {
      ElMessage.error('删除过程中发生错误')
    }
  }
}

// Initialize data
onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.course-list-container {
  @apply bg-gradient-to-br from-gray-50 to-gray-100 h-screen p-4 overflow-auto;
}

.admin-table {
  @apply rounded-lg bg-white;
}

.admin-table :deep(.el-table__header) {
  @apply bg-gray-50;
}

.admin-table :deep(.el-table__row) {
  @apply hover:bg-gray-50 transition-colors duration-150;
}

.admin-table :deep(.el-table__cell) {
  @apply py-2;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.el-avatar {
  @apply transition-transform duration-200 hover:scale-110;
}

.el-button {
  @apply rounded-md px-3 py-1 text-sm font-medium;
}

.el-icon-collection {
  @apply text-blue-600 text-2xl;
}

/* 价格显示样式 */
.price-display {
  @apply flex justify-center items-center;
}

.free-tag {
  @apply bg-green-500 text-white rounded-full px-3 py-1 font-medium shadow-sm;
  background: linear-gradient(135deg, #10b981, #059669) !important;
  border: none !important;
  font-size: 12px;
}

.free-tag:hover {
  @apply transform scale-105 shadow-md transition-all duration-200;
}

.paid-price {
  @apply flex justify-center;
}

.price-badge {
  @apply bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg px-3 py-2 shadow-md;
  display: flex;
  align-items: baseline;
  font-weight: 600;
  min-width: 70px;
  justify-content: center;
  transition: all 0.3s ease;
}

.price-badge:hover {
  @apply transform scale-105 shadow-lg;
  background: linear-gradient(135deg, #f97316, #ec4899);
}

.currency {
  @apply text-sm opacity-90 mr-0.5;
  font-size: 11px;
}

.amount {
  @apply text-base font-bold;
  font-size: 14px;
  letter-spacing: 0.5px;
}
</style>