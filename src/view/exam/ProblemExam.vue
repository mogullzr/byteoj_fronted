<template>
  <div class="min-h-screen bg-[#f9fafb] pt-16 pb-24 px-4 sm:px-6 lg:px-8">
    <!-- 搜索栏 -->
    <div class="max-w-5xl mx-auto mb-12">
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div class="flex items-center">
          <input
              v-model="searchRequest.keyword"
              type="text"
              placeholder="搜索考试名称"
              class="flex-1 px-6 py-5 outline-none text-slate-800 placeholder-slate-500 text-lg bg-transparent"
              @keyup.enter="doSearch"
          />
          <button
              @click="doSearch"
              class="px-10 py-5 bg-slate-700 text-white font-medium hover:bg-slate-800 transition-colors active:scale-[0.98] disabled:opacity-60"
              :disabled="loading"
          >
            {{ loading ? '搜索中...' : '搜索' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 结果列表 -->
    <div class="max-w-5xl mx-auto space-y-8">
      <div v-if="loading" class="text-center py-20">
        <div class="animate-spin w-12 h-12 border-4 border-slate-300 border-t-slate-500 rounded-full mx-auto mb-4"></div>
        <p class="text-slate-600 text-lg">加载中...</p>
      </div>

      <div v-else-if="examList.length === 0" class="text-center py-24 text-slate-500">
        <svg class="w-20 h-20 mx-auto text-slate-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-2xl font-medium mb-3">暂无匹配考试</p>
        <p>试试其他关键词或清除过滤</p>
      </div>

      <div v-else>
        <div
            v-for="exam in examList"
            :key="exam.exam_id"
            class="group bg-white mt-8 rounded-3xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden border border-slate-200"
        >
          <div class="flex flex-col md:flex-row">
            <!-- 左侧图片 + 标签 -->
            <div class="relative md:w-80 lg:w-96 h-64 md:h-auto flex-shrink-0">
              <img
                  :src="exam.picture"
                  :alt="exam.exam_name"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  @error="handleImageError"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

              <!-- 右上标签 -->
              <div class="absolute top-4 right-4 flex flex-col items-end gap-2.5">
                <div
                    class="px-4 py-1.5 text-xs font-medium rounded-full shadow-sm border"
                    :class="{
                    'bg-emerald-50 text-emerald-700 border-emerald-200': exam.status === 0,
                    'bg-rose-50 text-rose-700 border-rose-200': exam.status === 1,
                    'bg-amber-50 text-amber-700 border-amber-200': exam.status === 2,
                  }"
                >
                  {{ statusText(exam.status) }}
                </div>

                <div class="px-4 py-1.5 bg-slate-50 text-slate-700 text-xs font-medium rounded-full shadow-sm border border-slate-200">
                  {{ exam.joins || 0 }} 人参与
                </div>
              </div>
            </div>

            <!-- 右侧信息 -->
            <div class="flex-1 p-7 lg:p-9 flex flex-col">
              <h3 class="text-2xl font-bold text-slate-800 mb-4 group-hover:text-slate-900 transition-colors line-clamp-2">
                {{ exam.exam_name }}
              </h3>

              <div class="space-y-4 text-slate-700">
                <div class="flex items-center gap-3">
                  <span class="text-slate-500 w-20">创建者</span>
                  <span class="font-medium">{{ exam.author || '匿名' }}</span>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z" />
                    </svg>
                    <span>开始：{{ formatDate(exam.start_time) }}</span>
                  </div>

                  <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM4 6a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" />
                    </svg>
                    <span>结束：{{ formatDate(exam.end_time) }}</span>
                  </div>
                </div>

                <div class="flex gap-8 pt-3 border-t border-slate-100">
                  <div>
                    <span class="text-slate-500 block">总页数</span>
                    <span class="text-slate-700 font-medium">{{ exam.pages || '?' }} 页</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block">时长</span>
                    <span class="text-slate-700 font-medium">{{ exam.time ? exam.time + ' 分钟' : '不限时' }}</span>
                  </div>
                </div>
              </div>

              <div class="mt-8 flex gap-4">
                <button class="px-7 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-sm active:scale-[0.98]" @click="routerToExam(exam.exam_id)">
                  查看详情
                </button>
                <button class="px-7 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm active:scale-[0.98]">
                  加入收藏
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="mt-12 flex justify-center items-center gap-6">
          <button
              :disabled="searchRequest.pageNum <= 1 || loading"
              @click="changePage(searchRequest.pageNum - 1)"
              class="px-8 py-3 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition shadow-sm"
          >
            上一页
          </button>

          <span class="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium shadow-sm">
            第 {{ searchRequest.pageNum }} 页
          </span>

          <button
              :disabled="loading"
              @click="changePage(searchRequest.pageNum + 1)"
              class="px-8 py-3 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// script 部分保持不变
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {SearchControllerService, SearchRequest} from "../../../generated";

const route = useRoute()
const router = useRouter()

const searchRequest = ref<SearchRequest>({
  category: 'exam',
  keyword: (route.query.keyword as string) || '',
  pageNum: Number(route.query.pageNum) || 1,
})

const examList = ref<any[]>([])
const loading = ref(false)

onMounted(() => doSearch())

const doSearch = async () => {
  loading.value = true
  try {
    router.replace({
      query: {
        keyword: searchRequest.value.keyword || undefined,
        pageNum: searchRequest.value.pageNum > 1 ? searchRequest.value.pageNum : undefined
      }
    })

    const res = await SearchControllerService.searchAllUsingPost(searchRequest.value)
    if (res.code === 0 && res.data) {
      examList.value = res.data.dataList || []
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  if (page < 1 || loading.value) return
  searchRequest.value.pageNum = page
  doSearch()
}

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return '—'
  }
}

const statusText = (status?: number) => {
  if (status === 0) return '自由考试 · 可多次提交'
  if (status === 1) return '监控考试 · 限一次提交'
  if (status === 2) return '自由练习 · 可查答案'
  return '未知状态'
}

const routerToExam = (exam_id?: number) => {
  router.push("/exam/content?exam_id=" + exam_id)
}
const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'http://mogullzr001.oss-cn-beijing.aliyuncs.com/2025/11/2c75468abcf44ef9be887216dd21b0e1.jpg'
}
</script>