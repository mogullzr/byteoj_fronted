<template>
  <div class="min-h-screen bg-[#f9fafb] px-4 py-12 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-5xl">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">考试记录</h1>
          <p class="mt-2 text-slate-500">公开展示本场前三名答卷；下方仅展示你的个人记录。</p>
        </div>
        <button
            class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            @click="router.back()"
        >
          返回
        </button>
      </div>

      <section class="mb-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-sm">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div class="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold tracking-wide text-amber-800">公开榜单</div>
            <h2 class="mt-3 text-xl font-bold text-slate-900">本场最高分答卷</h2>
            <p class="mt-1 text-sm text-slate-600">每位考生只取最高分；仅前三名答卷可公开查看。</p>
          </div>
          <span class="text-sm text-slate-500">{{ topScores.length }} / 3 位考生</span>
        </div>

        <div v-if="topScoresLoading" class="py-8 text-center text-sm text-slate-500">正在加载前三名…</div>
        <div v-else-if="topScores.length === 0" class="mt-5 rounded-xl border border-dashed border-amber-200 bg-white/70 px-4 py-8 text-center text-sm text-slate-500">
          暂无已完成判分的考试记录。
        </div>
        <div v-else class="mt-5 grid gap-3 lg:grid-cols-3">
          <article
              v-for="leader in topScores"
              :key="leader.record_id"
              class="rounded-xl border bg-white p-4 shadow-sm"
              :class="leader.rank === 1 ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <span
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold"
                    :class="leader.rank === 1 ? 'bg-amber-100 text-amber-800' : leader.rank === 2 ? 'bg-slate-100 text-slate-700' : 'bg-orange-100 text-orange-800'"
                >
                  {{ leader.rank }}
                </span>
                <div class="min-w-0">
                  <div class="truncate font-semibold text-slate-800">{{ leader.username || '匿名考生' }}</div>
                  <div class="mt-1 text-xs text-slate-500">{{ formatDate(leader.submitted_at) }}</div>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <div class="text-xl font-extrabold tabular-nums text-slate-900">{{ leader.score ?? 0 }}</div>
                <div class="text-xs text-slate-500">/ {{ leader.total_score ?? '-' }} 分</div>
              </div>
            </div>
            <button
                class="mt-4 w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!leader.record_id"
                @click="routerToTopSheet(leader)"
            >
              查看这份答卷
            </button>
          </article>
        </div>
      </section>

      <div v-if="loading" class="py-20 text-center">
        <div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600"></div>
        <p class="text-lg text-slate-600">加载中...</p>
      </div>

      <div v-else-if="records.length === 0" class="rounded-lg border border-slate-200 bg-white py-20 text-center text-slate-500">
        <p class="mb-2 text-xl font-medium">你还没有提交记录</p>
        <p>完成并提交考试后，记录会显示在这里。</p>
      </div>

      <div v-else class="space-y-5">
        <div class="flex items-center justify-between gap-3 px-1">
          <h2 class="text-lg font-bold text-slate-800">我的答题记录</h2>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">仅本人可见</span>
        </div>
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
import type { ProblemExamSheetPaperVo } from '../../../generated/models/ProblemExamSheetPaperVo'
import type { ProblemExamTopScoreVo } from '../../../generated/models/ProblemExamTopScoreVo'
import { ProblemsControllerService } from '../../../generated/services/ProblemsControllerService'
import { useMessageBox } from '@/view/components/alert/useMessageBox'

const route = useRoute()
const router = useRouter()
const { error } = useMessageBox()

const examId = String(route.query.exam_id || '')
const pageNum = ref(Number(route.query.pageNum) || 1)
const loading = ref(false)
const records = ref<ProblemExamSheetPaperVo[]>([])
const topScoresLoading = ref(false)
const topScores = ref<ProblemExamTopScoreVo[]>([])

onMounted(() => {
  if (!examId) {
    error('缺少考试ID参数')
    return
  }
  fetchRecords(pageNum.value)
  fetchTopScores()
})

const fetchTopScores = async () => {
  const parsedExamId = Number(examId)
  if (!parsedExamId) return
  topScoresLoading.value = true
  try {
    const res = await ProblemsControllerService.problemExamTopScoresUsingGet(parsedExamId)
    if (res.code === 0 && Array.isArray(res.data)) {
      topScores.value = res.data.slice(0, 3)
    } else if (res.message) {
      error(res.message)
    }
  } catch (err) {
    console.error(err)
    error('获取本场前三名失败，请稍后重试')
  } finally {
    topScoresLoading.value = false
  }
}

const fetchRecords = async (page: number) => {
  loading.value = true
  try {
    router.replace({
      query: {
        exam_id: examId,
        pageNum: page > 1 ? page : undefined,
      },
    })

    const parsedExamId = Number(examId)
    if (!Number.isSafeInteger(parsedExamId) || parsedExamId <= 0) {
      error('考试ID无效')
      records.value = []
      return
    }

    const res = await ProblemsControllerService.problemExamRecordsUsingGet(parsedExamId, page)
    if (res.code === 0 && Array.isArray(res.data)) {
      records.value = res.data
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

const routerToTopSheet = (record: ProblemExamTopScoreVo) => {
  if (!record.record_id) return
  router.push({
    path: '/exam/sheet',
    query: {
      exam_id: examId,
      recordId: String(record.record_id),
      publicTop: '1',
    },
  })
}
</script>
