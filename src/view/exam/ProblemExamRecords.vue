<template>
  <div class="min-h-screen bg-[#f9fafb] px-4 py-12 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-5xl">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">考试记录</h1>
          <p class="mt-2 text-slate-500">查看当前考试已经提交过的答题记录</p>
        </div>
        <button
            class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            @click="router.back()"
        >
          返回
        </button>
      </div>

      <div v-if="loading" class="py-20 text-center">
        <div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600"></div>
        <p class="text-lg text-slate-600">加载中...</p>
      </div>

      <div v-else-if="records.length === 0" class="rounded-lg border border-slate-200 bg-white py-20 text-center text-slate-500">
        <p class="mb-2 text-xl font-medium">暂无提交记录</p>
        <p>完成并提交考试后，记录会显示在这里。</p>
      </div>

      <div v-else class="space-y-5">
        <div
            v-for="record in records"
            :key="record.id"
            class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-xl font-semibold text-slate-800">
                {{ record.exam_name || '未知考试' }}
              </h2>
              <div class="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <span>考试编号：{{ record.exam_id || '-' }}</span>
                <span>答卷编号：{{ record.id || '-' }}</span>
                <span>开始：{{ formatDate(record.start_date) }}</span>
                <span>结束：{{ formatDate(record.end_date) }}</span>
                <span>时长：{{ record.time ? record.time + ' 分钟' : '不限时' }}</span>
                <span>总分：{{ getRecordScore(record) }} 分</span>
              </div>
            </div>

            <button
                class="rounded-lg bg-slate-700 px-6 py-3 text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="!record.id"
                @click="routerToSheet(record)"
            >
              查看答题卡
            </button>
          </div>
        </div>
      </div>

      <div class="mt-10 flex items-center justify-center gap-6">
        <button
            :disabled="pageNum <= 1 || loading"
            class="rounded-lg border border-slate-300 bg-white px-8 py-3 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            @click="changePage(pageNum - 1)"
        >
          上一页
        </button>

        <span class="rounded-lg bg-slate-100 px-8 py-3 font-medium text-slate-700 shadow-sm">
          第 {{ pageNum }} 页
        </span>

        <button
            :disabled="loading || records.length < 10"
            class="rounded-lg border border-slate-300 bg-white px-8 py-3 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            @click="changePage(pageNum + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SearchControllerService, type SearchRequest } from '../../../generated'
import type { ProblemExamSheetPaperVo } from '../../../generated/models/ProblemExamSheetPaperVo'
import { useMessageBox } from '@/view/components/alert/useMessageBox'

const route = useRoute()
const router = useRouter()
const { error } = useMessageBox()

const examId = String(route.query.exam_id || '')
const pageNum = ref(Number(route.query.pageNum) || 1)
const loading = ref(false)
const records = ref<ProblemExamSheetPaperVo[]>([])

onMounted(() => {
  if (!examId) {
    error('缺少考试ID参数')
    return
  }
  fetchRecords(pageNum.value)
})

const fetchRecords = async (page: number) => {
  loading.value = true
  try {
    router.replace({
      query: {
        exam_id: examId,
        pageNum: page > 1 ? page : undefined,
      },
    })

    const searchRequest: SearchRequest = {
      category: 'exam_sheet',
      keyword: examId,
      pageNum: page,
    }

    const res = await SearchControllerService.searchAllUsingPost(searchRequest)
    if (res.code === 0 && res.data) {
      const data = res.data as any
      records.value = data.problemExamSheetPaperVoList || data.dataList || []
      return
    }

    error(res.message || '获取考试记录失败')
  } catch (err) {
    console.error(err)
    error('获取考试记录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  if (page < 1 || loading.value) return
  pageNum.value = page
  fetchRecords(page)
}

const formatDate = (iso?: string) => {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

const getRecordScore = (record: ProblemExamSheetPaperVo) => {
  return record.score ?? record.total_score ?? 0
}

const routerToSheet = (record: ProblemExamSheetPaperVo) => {
  if (!record.id) return
  const targetExamId = record.exam_id || examId
  router.push(`/exam/sheet?exam_id=${targetExamId}&recordId=${record.id}`)
}
</script>