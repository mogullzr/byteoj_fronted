<template>
  <main class="exam-records-page min-h-screen px-4 py-10 text-slate-900 sm:px-6 sm:py-14 lg:px-8">
    <div class="records-shell mx-auto max-w-5xl">
      <header class="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div class="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-700">
            <span class="h-px w-7 bg-cyan-600/70"></span>
            Exam records
          </div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">考试记录</h1>
          <p class="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            本场成绩与个人答卷一览。公开榜单仅展示每位考生的最高分。
          </p>
        </div>
        <button class="back-button inline-flex items-center justify-center gap-2 self-start rounded-xl px-4 py-2.5 text-sm font-semibold sm:self-auto" @click="router.back()">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" class="h-4 w-4">
            <path d="M12.5 4.5 7 10l5.5 5.5M7.5 10h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          返回
        </button>
      </header>

      <section class="leaderboard-panel mb-10 overflow-hidden rounded-3xl p-5 sm:p-7">
        <div class="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-400/[0.07] blur-3xl"></div>
        <div class="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-amber-800">
              <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              本场公开榜单
            </div>
            <h2 class="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">高分答卷</h2>
            <p class="mt-2 text-sm leading-6 text-slate-600">每位考生仅计最高成绩，前三名答卷可公开查看。</p>
          </div>
          <div class="flex items-center gap-3 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:self-auto">
            <span class="text-2xl font-bold tabular-nums text-slate-900">{{ String(topScores.length).padStart(2, '0') }}</span>
            <span class="text-xs leading-4 text-slate-500">/ 03<br />上榜考生</span>
          </div>
        </div>

        <div v-if="topScoresLoading" class="relative flex min-h-44 items-center justify-center gap-3 text-sm text-slate-500">
          <span class="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500"></span>
          正在整理本场成绩…
        </div>
        <div v-else-if="topScores.length === 0" class="relative mt-6 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-amber-200 bg-white/80 px-5 text-center">
          <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-700">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="h-5 w-5">
              <path d="M8 4h8l1.2 3.2L20 9v10H4V9l2.8-1.8L8 4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              <path d="M9 13h6M9 16h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
          <p class="font-semibold text-slate-800">榜单暂时空缺</p>
          <p class="mt-1 text-sm text-slate-500">暂无已完成判分的答卷</p>
        </div>
        <div v-else class="relative mt-7 grid gap-3 lg:grid-cols-3 lg:gap-4">
          <article
              v-for="leader in topScores"
              :key="leader.record_id"
              class="leader-card rounded-2xl p-4 sm:p-5"
              :class="{ 'leader-card-first': leader.rank === 1 }"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <span class="rank-mark flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-black tabular-nums" :class="`rank-mark-${leader.rank}`">
                  {{ String(leader.rank).padStart(2, '0') }}
                </span>
                <div class="min-w-0">
                  <div class="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Rank {{ leader.rank }}</div>
                  <div class="truncate text-sm font-semibold text-slate-800">{{ leader.username || '匿名考生' }}</div>
                </div>
              </div>
              <svg v-if="leader.rank === 1" viewBox="0 0 24 24" fill="none" aria-label="第一名" class="mt-1 h-5 w-5 shrink-0 text-amber-600">
                <path d="M5 8.5 9.1 12l2.9-6 2.9 6L19 8.5l-1.5 9h-11L5 8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                <path d="M7 20h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </div>

            <div class="mt-6 flex items-end justify-between gap-3">
              <div>
                <div class="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Final score</div>
                <div class="flex items-baseline gap-1.5">
                  <span class="text-4xl font-bold tracking-tight tabular-nums text-slate-900">{{ leader.score ?? 0 }}</span>
                  <span class="text-sm font-medium tabular-nums text-slate-500">/ {{ leader.total_score ?? '-' }}</span>
                </div>
              </div>
              <span class="pb-1 text-right text-[11px] leading-4 text-slate-500">{{ formatDate(leader.submitted_at) }}</span>
            </div>
            <button class="leader-button mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold" :disabled="!leader.record_id" @click="routerToTopSheet(leader)">
              查看公开答卷
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" class="h-4 w-4">
                <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </article>
        </div>
      </section>

      <section class="personal-section">
        <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div class="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Personal archive</div>
            <h2 class="text-xl font-bold tracking-tight text-slate-900">我的答题记录</h2>
          </div>
          <span class="inline-flex items-center gap-2 self-start rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-800 sm:self-auto">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" class="h-3.5 w-3.5">
              <path d="M6.5 8V6a3.5 3.5 0 0 1 7 0v2m-8 0h9a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            仅本人可见
          </span>
        </div>

        <div v-if="loading" class="state-panel flex min-h-48 items-center justify-center gap-3 rounded-2xl text-sm text-slate-500">
          <span class="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-600"></span>
          正在加载个人记录…
        </div>
        <div v-else-if="records.length === 0" class="state-panel flex min-h-56 flex-col items-center justify-center rounded-2xl px-5 text-center">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="h-5 w-5">
              <path d="M7 4h10a2 2 0 0 1 2 2v13H5V6a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              <path d="M9 9h6M9 13h6M9 17h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
          <p class="font-semibold text-slate-800">还没有答卷记录</p>
          <p class="mt-1 text-sm text-slate-500">完成并提交考试后，记录会显示在这里。</p>
        </div>
        <div v-else class="space-y-3">
          <article v-for="record in records" :key="record.id" class="record-card rounded-2xl p-5 sm:p-6">
            <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-3">
                  <h3 class="truncate text-lg font-semibold text-slate-900">{{ record.exam_name || '未知考试' }}</h3>
                  <span class="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">答卷 #{{ record.id || '-' }}</span>
                </div>
                <div class="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
                  <div class="record-meta"><span>考试编号</span><strong>{{ record.exam_id || '-' }}</strong></div>
                  <div class="record-meta"><span>开始时间</span><strong>{{ formatDate(record.start_date) }}</strong></div>
                  <div class="record-meta"><span>结束时间</span><strong>{{ formatDate(record.end_date) }}</strong></div>
                  <div class="record-meta"><span>考试时长</span><strong>{{ record.time ? record.time + ' 分钟' : '不限时' }}</strong></div>
                  <div class="record-meta"><span>本次得分</span><strong class="text-cyan-800">{{ getRecordScore(record) }} 分</strong></div>
                </div>
              </div>
              <button class="record-button inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold" :disabled="!record.id" @click="routerToSheet(record)">
                查看答题卡
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" class="h-4 w-4">
                  <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </article>
        </div>

        <div class="mt-6 flex items-center justify-center gap-3 sm:gap-4">
          <button :disabled="pageNum <= 1 || loading" class="page-button rounded-xl px-4 py-2.5 text-sm font-semibold sm:px-5" @click="changePage(pageNum - 1)">
            <span class="hidden sm:inline">上一页</span><span class="sm:hidden">上一页</span>
          </button>
          <span class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium tabular-nums text-slate-700">{{ String(pageNum).padStart(2, '0') }}</span>
          <button :disabled="loading || records.length < 10" class="page-button rounded-xl px-4 py-2.5 text-sm font-semibold sm:px-5" @click="changePage(pageNum + 1)">
            <span class="hidden sm:inline">下一页</span><span class="sm:hidden">下一页</span>
          </button>
        </div>
      </section>
    </div>
  </main>
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

<style scoped>
.exam-records-page {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 78% 0%, rgba(186, 230, 253, 0.42), transparent 34rem),
    radial-gradient(ellipse at 6% 32%, rgba(254, 243, 199, 0.42), transparent 30rem),
    #f8fafc;
}

.exam-records-page::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  background-image: linear-gradient(rgba(100, 116, 139, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 116, 139, 0.055) 1px, transparent 1px);
  background-size: 56px 56px;
  content: '';
  mask-image: linear-gradient(to bottom, black, transparent 72%);
  pointer-events: none;
}

.records-shell {
  position: relative;
}

.back-button,
.page-button {
  border: 1px solid #cbd5e1;
  background: rgba(255, 255, 255, 0.82);
  color: #475569;
  transition: border-color 180ms ease, background 180ms ease, color 180ms ease, transform 180ms ease;
}

.back-button:hover,
.page-button:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: #67e8f9;
  background: #ecfeff;
  color: #155e75;
}

.leaderboard-panel {
  position: relative;
  border: 1px solid #fde68a;
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.98) 54%, rgba(255, 247, 237, 0.98));
  box-shadow: 0 20px 55px rgba(148, 104, 25, 0.1), inset 0 1px rgba(255, 255, 255, 0.8);
}

.leader-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: linear-gradient(150deg, #ffffff, #f8fafc);
  box-shadow: 0 8px 24px rgba(71, 85, 105, 0.08), inset 0 1px #ffffff;
  transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
}

.leader-card:hover {
  transform: translateY(-3px);
  border-color: #cbd5e1;
  box-shadow: 0 14px 30px rgba(71, 85, 105, 0.13), inset 0 1px #ffffff;
}

.leader-card-first {
  border-color: #f4c95d;
  background: linear-gradient(145deg, #fffaf0, #ffffff 62%);
  box-shadow: inset 0 1px #ffffff, 0 12px 30px rgba(180, 125, 25, 0.12);
}

.rank-mark {
  border: 1px solid #cbd5e1;
  background: #f1f5f9;
  color: #475569;
}

.rank-mark-1 {
  border-color: #f4c95d;
  background: #fef3c7;
  color: #a16207;
}

.rank-mark-2 {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #475569;
}

.rank-mark-3 {
  border-color: #fdba74;
  background: #fff7ed;
  color: #c2410c;
}

.leader-button,
.record-button {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
  transition: border-color 180ms ease, background 180ms ease, color 180ms ease, transform 180ms ease;
}

.leader-button:hover:not(:disabled),
.record-button:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: #67e8f9;
  background: #ecfeff;
  color: #155e75;
}

.leader-card-first .leader-button {
  border-color: #f4c95d;
  background: #fffbeb;
  color: #92400e;
}

.leader-card-first .leader-button:hover:not(:disabled) {
  border-color: #f59e0b;
  background: #fef3c7;
}

.leader-button:disabled,
.record-button:disabled,
.page-button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.state-panel,
.record-card {
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 24px rgba(71, 85, 105, 0.07), inset 0 1px #ffffff;
}

.record-card {
  transition: border-color 180ms ease, transform 180ms ease, background 180ms ease;
}

.record-card:hover {
  transform: translateY(-2px);
  border-color: #a5f3fc;
  background: linear-gradient(145deg, #ffffff, #f0fdfa);
}

.record-meta {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.3rem;
}

.record-meta span {
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.record-meta strong {
  overflow: hidden;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
