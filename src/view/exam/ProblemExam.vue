<template>
  <div class="min-h-screen bg-[#f9fafb] pt-16 pb-24 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto mb-6 flex justify-end">
      <button
          class="rounded-xl bg-emerald-700 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-emerald-800 active:scale-[0.98]"
          @click="router.push('/exam/wrong-book')"
      >
        进入我的错题本
      </button>
    </div>
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
            <div class="relative md:w-80 lg:w-96 h-64 md:h-auto flex-shrink-0">
              <img
                  :src="exam.picture"
                  :alt="exam.exam_name"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  @error="handleImageError"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

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

              <div class="mt-8 flex flex-wrap gap-4">
                <button class="px-7 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-sm active:scale-[0.98]" @click="routerToExam(exam)">
                  进入考试
                </button>
                <button
                    class="px-7 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="isJoined(exam) || joiningExamId === exam.exam_id"
                    @click="joinExam(exam)"
                >
                  {{ isJoined(exam) ? '已报名' : joiningExamId === exam.exam_id ? '报名中...' : '报名' }}
                </button>
                <button
                    class="px-7 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm active:scale-[0.98]"
                    @click="routerToExamRecords(exam)"
                >
                  查看记录
                </button>
                <button
                    class="px-7 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="exportingExamId === exam.exam_id"
                    @click="exportExamPdf(exam)"
                >
                  {{ exportingExamId === exam.exam_id ? '导出中...' : '导出 PDF' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-12 flex justify-center items-center gap-6">
          <button
              :disabled="searchRequest.pageNum <= 1 || loading"
              @click="changePage(searchRequest.pageNum - 1)"
              class="px-8 py-3 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition shadow-sm"
          >
            上一页
          </button>

          <span class="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium shadow-sm">
            第 {{ searchRequest.pageNum }} / {{ totalPages }} 页
          </span>

          <button
              :disabled="loading || searchRequest.pageNum >= totalPages"
              @click="changePage(searchRequest.pageNum + 1)"
              class="px-8 py-3 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition shadow-sm"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SearchControllerService, SearchRequest } from '../../../generated'
import { ProblemsControllerService } from '../../../generated/services/ProblemsControllerService'
import { useMessageBox } from '@/view/components/alert/useMessageBox'
import type { ProblemExamVo } from '../../../generated/models/ProblemExamVo'
import type { ProblemMath408BankVo } from '../../../generated/models/ProblemMath408BankVo'

type ExamItem = {
  exam_id?: number
  exam_name?: string
  author?: string
  picture?: string
  joins?: number
  start_time?: string
  end_time?: string
  status?: number
  time?: number
  pages?: number
  join?: boolean
}

const route = useRoute()
const router = useRouter()
const { success, error, warning } = useMessageBox()

const searchRequest = ref<SearchRequest>({
  category: 'exam',
  keyword: (route.query.keyword as string) || '',
  pageNum: Number(route.query.pageNum) || 1,
  pageSize: 10
})

const examList = ref<ExamItem[]>([])
const loading = ref(false)
const joiningExamId = ref<number | null>(null)
const exportingExamId = ref<number | null>(null)
const pageSize = 10
const totalPages = computed(() => {
  const totalCount = examList.value[0]?.pages
  return typeof totalCount === 'number' && totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1
})

onMounted(() => {
  doSearch()
})

const isJoined = (exam?: ExamItem) => {
  return exam?.join === true
}

const doSearch = async () => {
  loading.value = true
  try {
    router.replace({
      query: {
        keyword: searchRequest.value.keyword || undefined,
        pageNum: searchRequest.value.pageNum > 1 ? searchRequest.value.pageNum : undefined,
      },
    })

    const res = await SearchControllerService.searchAllUsingPost(searchRequest.value)
    if (res.code === 0 && res.data) {
      examList.value = res.data.dataList || []
      if (searchRequest.value.pageNum > totalPages.value) {
        searchRequest.value.pageNum = totalPages.value
      }
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value || loading.value) return
  searchRequest.value.pageNum = page
  doSearch()
}

const formatDate = (iso?: string) => {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return '-'
  }
}

const statusText = (status?: number) => {
  if (status === 0) return '自由考试 · 可多次提交'
  if (status === 1) return '监控考试 · 限一次提交'
  if (status === 2) return '自由练习 · 可查答案'
  return '未知状态'
}

const joinExam = async (exam?: ExamItem) => {
  const examId = exam?.exam_id
  if (!examId || joiningExamId.value) return

  joiningExamId.value = examId
  try {
    const res = await ProblemsControllerService.problemExamJoinUsingGet(examId)
    if (res.code === 0 && res.data) {
      if (exam) {
        exam.join = true
        exam.joins = (exam.joins || 0) + 1
      }
      success('报名成功')
      return
    }

    error(res.message || '报名失败')
  } catch (err) {
    console.error(err)
    error('报名失败，请稍后重试')
  } finally {
    joiningExamId.value = null
  }
}

const routerToExam = (exam?: ExamItem) => {
  const examId = exam?.exam_id
  if (!examId) return
  if (!isJoined(exam)) {
    warning('请先报名后再进入考试')
    return
  }
  router.push('/exam/content?exam_id=' + examId)
}

const routerToExamRecords = (exam?: ExamItem) => {
  if (!exam?.exam_id) return
  router.push('/exam/records?exam_id=' + exam.exam_id)
}

type ExamSectionKind = 'choice' | 'fill' | 'subjective' | 'algorithm' | 'other'

type ExamSection = {
  kind: ExamSectionKind
  questions: ProblemMath408BankVo[]
}

type SheetQuestion = ProblemMath408BankVo & {
  displayNo: number
}

const exportExamPdf = async (exam?: ExamItem) => {
  const examId = exam?.exam_id
  if (!examId || exportingExamId.value) return

  exportingExamId.value = examId
  try {
    const [examRes, detailRes] = await Promise.all([
      ProblemsControllerService.problemSearchExamIdUsingGet(examId),
      ProblemsControllerService.problemExamSearchDetailUsingGet(examId),
    ])

    if (detailRes.code !== 0 || !detailRes.data?.length) {
      error(detailRes.message || '试卷题目为空，无法导出')
      return
    }

    const paperInfo = (examRes.code === 0 && examRes.data ? examRes.data : exam) as ProblemExamVo | ExamItem
    if (!isMathExam(paperInfo) && !is408Exam(paperInfo) && !isPoliticsExam(paperInfo)) {
      warning('当前 PDF 模板仅支持数学、408 和政治试卷，其他类型试卷模板后续再接入')
      return
    }

    openExamPrintWindow(paperInfo, detailRes.data)
  } catch (err) {
    console.error(err)
    error('导出失败，请稍后重试')
  } finally {
    exportingExamId.value = null
  }
}

const openExamPrintWindow = (exam: ProblemExamVo | ExamItem, questions: ProblemMath408BankVo[]) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    warning('浏览器阻止了导出窗口，请允许弹窗后重试')
    return
  }

  printWindow.document.open()
  printWindow.document.write(buildExamPrintHtml(exam, questions))
  printWindow.document.close()

  const triggerPrint = () => {
    printWindow.focus()
    printWindow.print()
  }

  printWindow.onload = () => {
    const mathJax = (printWindow as typeof printWindow & {
      MathJax?: { typesetPromise?: () => Promise<void> }
    }).MathJax
    if (mathJax?.typesetPromise) {
      mathJax.typesetPromise().finally(() => window.setTimeout(triggerPrint, 300))
      return
    }
    window.setTimeout(triggerPrint, 500)
  }
}

const buildExamPrintHtml = (exam: ProblemExamVo | ExamItem, questions: ProblemMath408BankVo[]) => {
  const title = escapeHtml(normalizeExamText(exam.exam_name) || '试卷导出')

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 18mm 16mm;
    }
    @page answerSheet {
      size: A4 landscape;
      margin: 0;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      background: #f4f4f0;
      color: #111827;
      font-family: "Noto Serif SC", "SimSun", "Songti SC", serif;
      line-height: 1.72;
    }
    .paper-page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto 18px;
      padding: 18mm;
      background: #fff;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
    }
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding: 64mm 16mm 16mm;
      border: 1px solid #d6d3c8;
    }
    .secret {
      width: 100%;
      max-width: 150mm;
      margin: 0 auto 3mm;
      text-align: left;
      font-size: 12px;
      letter-spacing: 0.02em;
      font-weight: 700;
    }
    .cover-main {
      text-align: center;
      padding: 0;
    }
    .cover-year {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 3mm;
      letter-spacing: 0.02em;
    }
    .subject-code {
      display: block;
      min-width: 0;
      min-height: 0;
      border: 0;
      font-size: 15px;
      font-weight: 400;
      letter-spacing: 0.04em;
      margin: 5mm 0 10mm;
    }
    .subject-name {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.34em;
      color: #66cdb4;
      line-height: 1.2;
    }
    .notice {
      width: 100%;
      max-width: 150mm;
      margin: 14mm auto 0;
      border: 0;
      padding: 0;
      font-size: 16px;
      line-height: 1.9;
    }
    .notice-title {
      text-align: center;
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 8mm;
      color: #66cdb4;
      letter-spacing: 0.12em;
    }
    .notice ol {
      margin: 0;
      padding-left: 6mm;
    }
    .notice li {
      margin-bottom: 4mm;
      padding-left: 1mm;
    }
    .candidate {
      display: grid;
      grid-template-columns: 32mm 1fr;
      width: 104mm;
      margin: 8mm auto 0;
      border: 1px solid #82dac9;
      color: #111827;
      font-size: 13px;
      line-height: 1;
    }
    .candidate-label {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 8mm;
      border-right: 1px solid #82dac9;
      border-bottom: 1px solid #82dac9;
    }
    .candidate-name-label {
      border-bottom: 0;
    }
    .candidate-number {
      display: grid;
      grid-template-columns: repeat(15, 1fr);
      min-height: 8mm;
      border-bottom: 1px solid #82dac9;
    }
    .candidate-number span {
      border-right: 1px solid #82dac9;
    }
    .candidate-number span:last-child {
      border-right: 0;
    }
    .candidate-name {
      min-height: 8mm;
    }
    .paper-head {
      text-align: center;
      border-bottom: 2px solid #111827;
      padding-bottom: 7mm;
      margin-bottom: 7mm;
    }
    .paper-head h1 {
      margin: 0 0 3mm;
      font-size: 22px;
      letter-spacing: 0.08em;
    }
    .paper-meta {
      font-size: 14px;
      color: #374151;
    }
    .section {
      margin: 9mm 0 7mm;
      break-inside: avoid-page;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 5mm;
    }
    .question {
      margin: 0 0 7mm;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .question-title {
      display: flex;
      align-items: baseline;
      gap: 2mm;
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 2mm;
    }
    .question-score {
      font-weight: 400;
      color: #4b5563;
    }
    .question-line {
      font-size: 15px;
      font-weight: 400;
      line-height: 1.8;
    }
    .question-prefix {
      display: inline;
      font-weight: 700;
      margin-right: 2mm;
      white-space: nowrap;
    }
    .question-stem {
      display: inline;
    }
    .question-body {
      font-size: 15px;
      white-space: normal;
    }
    .question-body p {
      margin: 0 0 2.5mm;
    }
    .question-body img {
      display: block;
      max-width: 100%;
      max-height: 95mm;
      object-fit: contain;
      margin: 3mm auto;
    }
    .question-line img,
    .option img {
      display: block;
      max-width: 100%;
      max-height: 80mm;
      object-fit: contain;
      margin: 3mm auto;
    }
    .question-line img.exam-svg,
    .option img.exam-svg,
    .question-body img.exam-svg {
      width: auto;
      max-width: 82%;
      max-height: 70mm;
    }
    .options {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 2mm 8mm;
      margin-top: 3mm;
      font-size: 15px;
    }
    .option {
      display: flex;
      gap: 2mm;
      align-items: flex-start;
      break-inside: avoid;
    }
    .option strong {
      flex: 0 0 auto;
      white-space: nowrap;
    }
    .option span {
      display: inline;
      min-width: 0;
    }
    .answer-area {
      min-height: 22mm;
      border-bottom: 1px solid #d1d5db;
      margin-top: 4mm;
    }
    .subjective-area {
      min-height: 48mm;
      border: 1px dashed #d1d5db;
      margin-top: 4mm;
    }
    .answer-sheet-page {
      page: answerSheet;
      width: 297mm;
      height: 210mm;
      padding: 8mm;
      color: #222;
      font-family: "SimSun", "Songti SC", serif;
      position: relative;
      overflow: hidden;
    }
    .answer-sheet-page::before,
    .answer-sheet-page::after,
    .sheet-mark-right,
    .sheet-mark-bottom-left,
    .sheet-mark-bottom-right {
      content: "";
      position: absolute;
      width: 4mm;
      height: 2.4mm;
      background: #3f3f3f;
    }
    .answer-sheet-page::before {
      left: 6mm;
      top: 6mm;
    }
    .answer-sheet-page::after {
      left: 28mm;
      top: 6mm;
    }
    .sheet-mark-right {
      right: 7mm;
      top: 8mm;
    }
    .sheet-mark-bottom-left {
      left: 7mm;
      bottom: 7mm;
    }
    .sheet-mark-bottom-right {
      right: 7mm;
      bottom: 7mm;
    }
    .sheet-grid-first {
      display: grid;
      grid-template-columns: 96mm 1fr 1fr;
      gap: 4mm;
      height: 176mm;
      padding-top: 0;
    }
    .sheet-grid-written {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4mm;
      height: 176mm;
      padding-top: 20mm;
    }
    .sheet-left-panel {
      display: flex;
      flex-direction: column;
      gap: 2mm;
      height: 100%;
    }
    .sheet-title {
      text-align: center;
      font-size: 15px;
      font-weight: 700;
      line-height: 1.35;
      letter-spacing: 0.04em;
    }
    .sheet-top-info {
      display: grid;
      grid-template-columns: 38mm 1fr;
      gap: 2mm;
      align-items: stretch;
    }
    .sheet-basic-info {
      border: 1px solid #d9a5b2;
      color: #444;
      font-size: 12px;
      line-height: 1;
    }
    .sheet-basic-row {
      display: grid;
      grid-template-columns: 1fr;
      min-height: 11mm;
      border-bottom: 1px solid #d9a5b2;
    }
    .sheet-basic-row:last-child {
      border-bottom: 0;
    }
    .sheet-basic-label {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 4.5mm;
      border-bottom: 1px solid #d9a5b2;
      font-weight: 700;
    }
    .sheet-basic-blank {
      min-height: 6.5mm;
    }
    .sheet-ticket {
      border: 1px solid #d9a5b2;
      padding: 1.5mm;
      font-size: 8px;
      color: #c77f91;
    }
    .sheet-ticket-title {
      text-align: center;
      color: #444;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 1mm;
    }
    .sheet-ticket-grid {
      display: grid;
      grid-template-columns: repeat(15, 1fr);
      gap: 0.45mm;
    }
    .sheet-ticket-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.45mm;
    }
    .sheet-ticket-write {
      width: 3.2mm;
      height: 3.2mm;
      border: 1px solid #d9a5b2;
      margin-bottom: 0.5mm;
    }
    .sheet-ticket-bubble {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3.2mm;
      height: 2.2mm;
      border: 1px solid #d9a5b2;
      line-height: 1;
    }
    .sheet-barcode-center,
    .sheet-barcode-right {
      height: 12mm;
      border: 1px solid #d9a5b2;
      color: #555;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
    .sheet-barcode-row {
      display: grid;
      grid-template-columns: 96mm 1fr 1fr;
      gap: 4mm;
      height: 16mm;
      margin: 6mm 0 2mm;
      align-items: start;
    }
    .sheet-barcode-spacer {
      min-height: 1px;
    }
    .sheet-barcode-center {
      width: 32mm;
      justify-self: center;
    }
    .sheet-barcode-right {
      width: 26mm;
      border-radius: 2mm;
      justify-self: center;
    }
    .sheet-notice {
      border: 1px solid #d9a5b2;
      padding: 2mm;
      font-size: 7px;
      line-height: 1.25;
    }
    .sheet-notice p {
      margin: 0 0 1mm;
      font-weight: 700;
    }
    .sheet-choice-fill {
      border: 1px solid #d9a5b2;
      border-radius: 2mm;
      padding: 2.5mm;
      min-height: 58mm;
      overflow: hidden;
    }
    .sheet-choice-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1.2mm 1.4mm;
      font-size: 8px;
      margin-bottom: 4mm;
    }
    .sheet-choice-row {
      display: flex;
      align-items: center;
      gap: 0.45mm;
      white-space: nowrap;
      min-width: 0;
    }
    .sheet-choice-row strong {
      width: 3.5mm;
      font-size: 9px;
      color: #222;
    }
    .sheet-bubble {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3.7mm;
      height: 2.7mm;
      border: 1px solid #d9a5b2;
      color: #c77f91;
      font-size: 7px;
      line-height: 1;
    }
    .sheet-fill-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4.5mm 5mm;
      font-size: 11px;
      border-top: 1px solid #d9a5b2;
      padding-top: 5mm;
    }
    .sheet-fill-row {
      display: flex;
      align-items: flex-end;
      gap: 1.5mm;
    }
    .sheet-fill-row span {
      flex: 1;
      border-bottom: 1px solid #d9a5b2;
      min-height: 5mm;
    }
    .sheet-answer-box {
      border: 1px solid #d9a5b2;
      border-radius: 2mm;
      height: 100%;
      min-height: 0;
      position: relative;
      overflow: hidden;
    }
    .sheet-left-answer {
      flex: 1;
      min-height: 48mm;
    }
    .sheet-left-answer .sheet-answer-box {
      height: 100%;
      min-height: 0;
    }
    .sheet-split-column {
      display: grid;
      grid-template-rows: 1fr 2fr;
      gap: 0;
      height: 100%;
      min-height: 0;
    }
    .sheet-split-column .sheet-answer-box {
      min-height: 0;
      border-radius: 0;
      border-bottom: 0;
    }
    .sheet-split-column .sheet-answer-box:first-child {
      border-top-left-radius: 2mm;
      border-top-right-radius: 2mm;
    }
    .sheet-split-column .sheet-answer-box:last-child {
      border-bottom: 1px solid #d9a5b2;
      border-bottom-left-radius: 2mm;
      border-bottom-right-radius: 2mm;
    }
    .sheet-empty-space {
      height: 100%;
      min-height: 0;
      border: 0;
    }
    .sheet-answer-box::before,
    .sheet-answer-box::after {
      position: absolute;
      left: 0;
      width: 100%;
      text-align: center;
      color: #d793a2;
      font-size: 10px;
      line-height: 1;
    }
    .sheet-answer-box::before {
      content: "请在各题目的答题区域内作答，超出答题区域的答案无效";
      top: 1.2mm;
    }
    .sheet-answer-box::after {
      content: "请在各题目的答题区域内作答，超出答题区域的答案无效";
      bottom: 1.2mm;
    }
    .sheet-answer-inner {
      position: absolute;
      inset: 5mm 1.2mm;
      border: 1px solid #777;
      padding: 4mm;
      font-size: 12px;
    }
    .sheet-answer-no {
      font-size: 12px;
      font-weight: 700;
    }
    .sheet-student-name {
      position: absolute;
      right: 32mm;
      top: 18mm;
      font-size: 12px;
    }
    .sheet408-page {
      page: answerSheet;
      width: 297mm;
      height: 210mm;
      padding: 8mm 10mm;
      color: #222;
      font-family: "SimSun", "Songti SC", serif;
      position: relative;
      overflow: hidden;
    }
    .sheet408-page::before,
    .sheet408-page::after,
    .sheet408-mark-right,
    .sheet408-mark-bottom-left,
    .sheet408-mark-bottom-right {
      content: "";
      position: absolute;
      width: 4mm;
      height: 2.4mm;
      background: #222;
    }
    .sheet408-page::before {
      left: 5mm;
      top: 5mm;
    }
    .sheet408-page::after {
      right: 5mm;
      top: 5mm;
    }
    .sheet408-mark-right {
      right: 5mm;
      bottom: 5mm;
    }
    .sheet408-mark-bottom-left {
      left: 5mm;
      bottom: 5mm;
    }
    .sheet408-mark-bottom-right {
      right: 5mm;
      bottom: 5mm;
    }
    .sheet408-grid-first,
    .sheet408-grid-written {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8mm;
      height: 194mm;
    }
    .sheet408-info-panel {
      display: flex;
      flex-direction: column;
      gap: 2mm;
      height: 100%;
      border-right: 1px solid #e5a5bb;
      padding-right: 8mm;
    }
    .sheet408-title {
      text-align: center;
      font-size: 15px;
      font-weight: 700;
      line-height: 1.35;
    }
    .sheet408-subtitle {
      color: #d45a93;
      font-size: 11px;
      font-weight: 700;
    }
    .sheet408-top-info {
      display: grid;
      grid-template-columns: 34mm 1fr;
      gap: 2mm;
    }
    .sheet408-basic {
      border: 1px solid #e5a5bb;
      font-size: 11px;
    }
    .sheet408-basic-row {
      min-height: 12mm;
      border-bottom: 1px solid #e5a5bb;
    }
    .sheet408-basic-row:last-child {
      border-bottom: 0;
    }
    .sheet408-basic-label {
      min-height: 5mm;
      border-bottom: 1px solid #e5a5bb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }
    .sheet408-ticket {
      border: 1px solid #e5a5bb;
      padding: 1.5mm;
      color: #d45a93;
      font-size: 7px;
    }
    .sheet408-ticket-title {
      color: #333;
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      margin-bottom: 1mm;
    }
    .sheet408-notice {
      border: 1px solid #e5a5bb;
      padding: 2mm;
      font-size: 7px;
      line-height: 1.28;
    }
    .sheet408-choice-card {
      border: 1px solid #e5a5bb;
      border-radius: 1.5mm;
      padding: 2mm;
    }
    .sheet408-choice-title {
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      margin-bottom: 2mm;
    }
    .sheet408-choice-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1.4mm 2mm;
    }
    .sheet408-choice-row {
      display: flex;
      align-items: center;
      gap: 0.6mm;
      font-size: 7px;
      white-space: nowrap;
    }
    .sheet408-choice-row strong {
      width: 5mm;
      color: #333;
      font-size: 8px;
    }
    .sheet408-bubble {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3.8mm;
      height: 2.7mm;
      border: 1px solid #e5a5bb;
      color: #d45a93;
      line-height: 1;
    }
    .sheet408-forbidden {
      flex: 1;
      min-height: 34mm;
      border: 1px solid #e5a5bb;
      background: #ef7eb4;
      color: #9b215a;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 18px;
      letter-spacing: 0.08em;
      margin-top: 2mm;
    }
    .sheet408-answer-box {
      border: 1px solid #e5a5bb;
      border-radius: 2mm;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    .sheet408-answer-box::before,
    .sheet408-answer-box::after {
      position: absolute;
      left: 0;
      width: 100%;
      text-align: center;
      color: #d45a93;
      font-size: 9px;
      line-height: 1;
    }
    .sheet408-answer-box::before {
      content: "请在各题目的答题区域内作答，超出答题区域的答案无效";
      top: 1.2mm;
    }
    .sheet408-answer-box::after {
      content: "请在各题目的答题区域内作答，超出答题区域的答案无效";
      bottom: 1.2mm;
    }
    .sheet408-answer-inner {
      position: absolute;
      inset: 5mm 1.2mm;
      border: 1px solid #777;
      padding: 4mm;
      font-size: 12px;
    }
    .sheet408-empty {
      height: 100%;
      border: 0;
    }
    .sheet-politics-page {
      page: answerSheet;
      width: 297mm;
      height: 210mm;
      padding: 7mm 8mm;
      color: #222;
      font-family: "SimSun", "Songti SC", serif;
      position: relative;
      overflow: hidden;
      --sheet-pink: #ff3aa0;
    }
    .sheet-politics-page::before,
    .sheet-politics-page::after,
    .sheet-politics-mark-left-bottom,
    .sheet-politics-mark-right-bottom {
      content: "";
      position: absolute;
      width: 4mm;
      height: 2.4mm;
      background: #222;
    }
    .sheet-politics-page::before {
      left: 6mm;
      top: 6mm;
    }
    .sheet-politics-page::after {
      right: 6mm;
      top: 6mm;
    }
    .sheet-politics-mark-left-bottom {
      left: 6mm;
      bottom: 6mm;
    }
    .sheet-politics-mark-right-bottom {
      right: 6mm;
      bottom: 6mm;
    }
    .sheet-politics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12mm;
      height: 196mm;
      position: relative;
    }
    .sheet-politics-grid::before {
      content: "请  勿  折  叠";
      position: absolute;
      left: 50%;
      top: 8mm;
      bottom: 8mm;
      transform: translateX(-50%);
      width: 0;
      border-left: 1px dashed var(--sheet-pink);
      color: var(--sheet-pink);
      writing-mode: vertical-rl;
      text-orientation: upright;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      letter-spacing: 8mm;
      padding-left: 1.5mm;
    }
    .sheet-politics-side {
      height: 100%;
      position: relative;
    }
    .sheet-politics-info-side {
      padding: 0 2mm 0 4mm;
    }
    .sheet-politics-info-compact {
      display: flex;
      flex-direction: column;
      padding: 0 2mm 0 4mm;
    }
    .sheet-politics-info-compact .sheet-politics-top {
      margin-bottom: 3mm;
    }
    .sheet-politics-info-answer {
      flex: 1;
      min-height: 0;
    }
    .sheet-politics-answer-side {
      padding: 5mm 2mm 0 2mm;
    }
    .sheet-politics-header {
      text-align: center;
      margin: 0 0 3mm;
      line-height: 1.3;
    }
    .sheet-politics-title {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .sheet-politics-subtitle {
      color: var(--sheet-pink);
      font-size: 12px;
      font-weight: 700;
      margin-top: 1mm;
    }
    .sheet-politics-top {
      display: grid;
      grid-template-columns: 68mm 1fr;
      gap: 3mm;
      margin-bottom: 2mm;
    }
    .sheet-politics-basic {
      border: 1px solid var(--sheet-pink);
      font-size: 11px;
    }
    .sheet-politics-basic-row {
      display: grid;
      grid-template-columns: 20mm 1fr;
      min-height: 17mm;
      border-bottom: 1px solid var(--sheet-pink);
    }
    .sheet-politics-basic-row:last-child {
      border-bottom: 0;
    }
    .sheet-politics-basic-label {
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 1px solid var(--sheet-pink);
      font-weight: 700;
    }
    .sheet-politics-ticket {
      border: 1px solid var(--sheet-pink);
      padding: 1.5mm;
      color: var(--sheet-pink);
      font-size: 7px;
    }
    .sheet-politics-ticket .sheet-ticket-title {
      color: #333;
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      margin-bottom: 1mm;
    }
    .sheet-politics-notice {
      border: 1px solid var(--sheet-pink);
      font-size: 7.5px;
      line-height: 1.35;
      margin-bottom: 3mm;
    }
    .sheet-politics-notice-title {
      color: var(--sheet-pink);
      text-align: center;
      font-size: 11px;
      font-weight: 700;
      line-height: 6mm;
      border-bottom: 1px solid var(--sheet-pink);
    }
    .sheet-politics-notice-body {
      padding: 2mm;
    }
    .sheet-politics-example {
      display: grid;
      grid-template-columns: 26mm 1fr;
      border-top: 1px solid var(--sheet-pink);
      color: var(--sheet-pink);
      font-size: 10px;
      font-weight: 700;
    }
    .sheet-politics-example > div {
      min-height: 6mm;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2mm;
      border-right: 1px solid var(--sheet-pink);
    }
    .sheet-politics-example > div:last-child {
      border-right: 0;
    }
    .sheet-politics-choice-card {
      border: 1px solid var(--sheet-pink);
      border-radius: 1.5mm;
      overflow: hidden;
    }
    .sheet-politics-choice-section {
      display: grid;
      grid-template-columns: 9mm 7mm 1fr;
      border-bottom: 1px solid var(--sheet-pink);
    }
    .sheet-politics-choice-section:last-child {
      border-bottom: 0;
    }
    .sheet-politics-choice-label,
    .sheet-politics-choice-type {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
      font-size: 10px;
      font-weight: 700;
      writing-mode: vertical-rl;
      text-orientation: upright;
      border-right: 1px solid var(--sheet-pink);
    }
    .sheet-politics-choice-rows {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1.4mm 2mm;
      padding: 3mm;
    }
    .sheet-politics-choice-row {
      display: flex;
      align-items: center;
      gap: 0.7mm;
      font-size: 7px;
      white-space: nowrap;
    }
    .sheet-politics-choice-row strong {
      width: 5mm;
      color: #333;
      font-size: 8px;
    }
    .sheet-politics-bubble {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3.8mm;
      height: 2.6mm;
      border: 1px solid var(--sheet-pink);
      color: var(--sheet-pink);
      line-height: 1;
    }
    .sheet-politics-forbidden {
      height: 48mm;
      border: 1px solid var(--sheet-pink);
      background: #ffd8e8;
      color: var(--sheet-pink);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.1em;
      margin-top: 3mm;
    }
    .sheet-politics-answer-box {
      border: 1px solid var(--sheet-pink);
      border-radius: 2mm;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    .sheet-politics-answer-box::before,
    .sheet-politics-answer-box::after {
      position: absolute;
      left: 0;
      width: 100%;
      text-align: center;
      color: var(--sheet-pink);
      font-size: 9px;
      line-height: 1;
    }
    .sheet-politics-answer-box::before {
      content: "请在各题目的答题区域内作答，超出答题区域的答案无效";
      top: 1.2mm;
    }
    .sheet-politics-answer-box::after {
      content: "请在各题目的答题区域内作答，超出答题区域的答案无效";
      bottom: 1.2mm;
    }
    .sheet-politics-answer-inner {
      position: absolute;
      inset: 5mm 1.2mm;
      border: 1px solid #777;
      padding: 4mm;
      font-size: 12px;
    }
    .sheet-politics-answer-title {
      position: absolute;
      left: 7mm;
      top: -6mm;
      color: #222;
      font-size: 12px;
      font-weight: 700;
    }
    .sheet-politics-student-line {
      font-size: 12px;
      font-weight: 700;
      margin: -2mm 0 2mm 6mm;
    }
    .sheet-politics-sticker-row {
      display: flex;
      justify-content: flex-end;
      gap: 24mm;
      margin: 1mm 10mm 2mm 0;
    }
    .sheet-politics-sticker {
      width: 36mm;
      height: 14mm;
      border: 1px solid var(--sheet-pink);
      border-radius: 2mm;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
    }
    .sheet-politics-empty {
      height: 100%;
      border: 0;
    }
    @media print {
      body {
        background: #fff;
      }
      .paper-page {
        width: auto;
        min-height: auto;
        margin: 0;
        padding: 0;
        box-shadow: none;
        page-break-after: always;
      }
      .cover {
        padding: 64mm 0 16mm;
      }
      .answer-sheet-page {
        width: 297mm;
        height: 210mm;
        padding: 8mm;
      }
      .sheet408-page {
        width: 297mm;
        height: 210mm;
        padding: 8mm 10mm;
      }
      .sheet-politics-page {
        width: 297mm;
        height: 210mm;
        padding: 7mm 8mm;
      }
      .paper-page:last-child {
        page-break-after: auto;
      }
    }
  </style>
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
      },
      svg: { fontCache: 'global' }
    };
  <\/script>
  <script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"><\/script>
</head>
<body>
  ${buildCoverPage(exam)}
  <main class="paper-page">
    ${buildExamSections(questions).map((section, index) => renderSection(section, index)).join('')}
  </main>
  ${buildAnswerSheetPage(exam, questions)}
</body>
</html>`
}

const buildCoverPage = (exam: ProblemExamVo | ExamItem) => {
  const title = normalizeExamText(exam.exam_name) || '硕士研究生招生考试'
  const year = resolveExamYear(title)
  const subjectCode = resolveSubjectCode(title)
  const subjectName = resolveExamSubjectName(title)
  const candidateNumberCells = Array.from({ length: 15 }).map(() => '<span></span>').join('')

  return `<section class="paper-page cover">
    <div class="secret">绝密 ★ 启用前</div>
    <div class="cover-main">
      <div class="cover-year">${escapeHtml(year)}年全国硕士研究生招生考试</div>
      <div class="subject-name">${escapeHtml(subjectName)}</div>
      <div class="subject-code">（科目代码：${escapeHtml(subjectCode)}）</div>
    </div>
    <div>
      <div class="notice">
        <div class="notice-title">考生注意事项</div>
        <ol>
          <li>答题前，考生须在试题册指定位置上填写考生编号和考生姓名；在答题卡指定位置上填写报考单位、考生姓名和考生编号，并涂写考生编号信息点。</li>
          <li>选择题的答案必须涂写在答题卡相应题号的选项上，非选择题的答案必须书写在答题卡指定位置的边框区域内，超出答题区域书写的答案无效；在草稿纸、试题册上答题无效。</li>
          <li>填（书）写部分必须使用黑色字迹签字笔书写，字迹工整，笔迹清楚；涂写部分必须使用 2B 铅笔填涂。</li>
          <li>考试结束，将答题卡、试题册和草稿纸按规定交回。</li>
        </ol>
      </div>
      <div class="candidate">
        <div class="candidate-label">考生编号</div>
        <div class="candidate-number">${candidateNumberCells}</div>
        <div class="candidate-label candidate-name-label">考生姓名</div>
        <div class="candidate-name"></div>
      </div>
    </div>
  </section>`
}

const buildAnswerSheetPage = (exam: ProblemExamVo | ExamItem, questions: ProblemMath408BankVo[]) => {
  if (isPoliticsExam(exam)) {
    return buildPoliticsAnswerSheetPage(questions)
  }

  if (is408Exam(exam)) {
    return build408AnswerSheetPage(questions)
  }

  const sheetQuestions = questions.map((question, index) => ({
    ...question,
    displayNo: resolveQuestionNo(question, index),
  }))
  let choiceQuestions = sheetQuestions.filter((question) => resolveQuestionKind(question) === 'choice')
  let fillQuestions = sheetQuestions.filter((question) => resolveQuestionKind(question) === 'fill')
  let writtenQuestions = sheetQuestions.filter((question) => {
    const kind = resolveQuestionKind(question)
    return kind !== 'choice' && kind !== 'fill'
  })

  if (!choiceQuestions.length || !fillQuestions.length) {
    const fallback = splitMathSheetQuestions(sheetQuestions)
    choiceQuestions = choiceQuestions.length ? choiceQuestions : fallback.choiceQuestions
    fillQuestions = fillQuestions.length ? fillQuestions : fallback.fillQuestions
    writtenQuestions = fallback.writtenQuestions
  }

  const leftPanelWritten = writtenQuestions[0]
  const middleColumnWritten = writtenQuestions[1]
  const rightColumnWritten = writtenQuestions[2]
  const restWrittenPages = chunkQuestions(writtenQuestions.slice(3), 3)

  return [
    `<section class="paper-page answer-sheet-page">
      <span class="sheet-mark-right"></span>
      <span class="sheet-mark-bottom-left"></span>
      <span class="sheet-mark-bottom-right"></span>
      <div class="sheet-barcode-row">
        <div class="sheet-barcode-spacer"></div>
        <div class="sheet-barcode-center">考生信息条形码粘贴处</div>
        <div class="sheet-barcode-right">试题信息条形码</div>
      </div>
      <div class="sheet-grid-first">
        ${renderMathSheetLeftPanel(exam, choiceQuestions, fillQuestions, leftPanelWritten)}
        ${renderMathSheetSplitColumn(leftPanelWritten, middleColumnWritten)}
        ${renderMathSheetAnswerBox(rightColumnWritten)}
      </div>
    </section>`,
    ...restWrittenPages.map((pageQuestions) => `<section class="paper-page answer-sheet-page">
      <span class="sheet-mark-right"></span>
      <span class="sheet-mark-bottom-left"></span>
      <span class="sheet-mark-bottom-right"></span>
      <div class="sheet-student-name">考生姓名：</div>
      <div class="sheet-grid-written">
        ${pageQuestions.map(renderMathSheetAnswerBox).join('')}
      </div>
    </section>`),
  ].join('')
}

const build408AnswerSheetPage = (questions: ProblemMath408BankVo[]) => {
  const sheetQuestions = questions.map((question, index) => ({
    ...question,
    displayNo: resolveQuestionNo(question, index),
  }))
  const choiceQuestions = sheetQuestions.filter((question) => {
    const kind = resolveQuestionKind(question)
    return kind === 'choice' || question.displayNo <= 40
  }).filter((question) => question.displayNo <= 40)
  const writtenQuestions = sheetQuestions.filter((question) => question.displayNo >= 41)
  const firstWritten = writtenQuestions[0]
  const restWrittenPages = chunkQuestions(writtenQuestions.slice(1), 2)

  return [
    `<section class="paper-page sheet408-page">
      <span class="sheet408-mark-right"></span>
      <span class="sheet408-mark-bottom-left"></span>
      <span class="sheet408-mark-bottom-right"></span>
      <div class="sheet408-grid-first">
        ${render408InfoPanel(choiceQuestions)}
        ${render408AnswerBox(firstWritten)}
      </div>
    </section>`,
    ...restWrittenPages.map((pageQuestions) => `<section class="paper-page sheet408-page">
      <span class="sheet408-mark-right"></span>
      <span class="sheet408-mark-bottom-left"></span>
      <span class="sheet408-mark-bottom-right"></span>
      <div class="sheet408-grid-written">
        ${pageQuestions.map(render408AnswerBox).join('')}
        ${pageQuestions.length < 2 ? '<div class="sheet408-empty"></div>' : ''}
      </div>
    </section>`),
  ].join('')
}

const render408InfoPanel = (choiceQuestions: SheetQuestion[]) => {
  const normalizedChoices = choiceQuestions.length ? choiceQuestions : Array.from({ length: 40 }).map((_, index) => ({
    displayNo: index + 1,
    options: '["A","B","C","D"]',
  })) as SheetQuestion[]

  return `<aside class="sheet408-info-panel">
    <div class="sheet408-title">全国硕士研究生入学统一考试<br /><span class="sheet408-subtitle">计算机学科专业基础综合答题卡1</span></div>
    <div class="sheet408-top-info">
      <div class="sheet408-basic">
        <div class="sheet408-basic-row">
          <div class="sheet408-basic-label">报考单位</div>
        </div>
        <div class="sheet408-basic-row">
          <div class="sheet408-basic-label">考生姓名</div>
        </div>
      </div>
      <div class="sheet408-ticket">
        <div class="sheet408-ticket-title">准考证号</div>
        ${renderAdmissionGrid()}
      </div>
    </div>
    <div class="sheet408-notice">
      <strong>注意事项：</strong><br />
      1. 答题前，考生须填写报考单位、姓名和准考证号。<br />
      2. 选择题使用 2B 铅笔填涂，非选择题使用黑色字迹签字笔作答。<br />
      3. 请在各题目的答题区域内作答，超出区域的答案无效。
    </div>
    <div class="sheet408-choice-card">
      <div class="sheet408-choice-title">一、单项选择题：1-40小题，每小题2分，共80分。</div>
      <div class="sheet408-choice-grid">
        ${normalizedChoices.map(render408ChoiceRow).join('')}
      </div>
    </div>
    <div class="sheet408-forbidden">阴影部分请勿作答或做任何标记</div>
  </aside>`
}

const render408ChoiceRow = (question: SheetQuestion) => {
  const optionCount = Math.max(parseOptions(question.options).length, 4)
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, optionCount)

  return `<div class="sheet408-choice-row">
    <strong>${question.displayNo}</strong>
    ${labels.map((label) => `<span class="sheet408-bubble">${label}</span>`).join('')}
  </div>`
}

const render408AnswerBox = (question?: SheetQuestion) => {
  if (!question) return '<div class="sheet408-empty"></div>'

  return `<div class="sheet408-answer-box">
    <div class="sheet408-answer-inner">
      <span class="sheet-answer-no">${question.displayNo}.</span>
    </div>
  </div>`
}

const buildPoliticsAnswerSheetPage = (questions: ProblemMath408BankVo[]) => {
  const sheetQuestions = questions.map((question, index) => ({
    ...question,
    displayNo: resolveQuestionNo(question, index),
  }))
  const choiceQuestions = resolvePoliticsChoiceQuestions(sheetQuestions)
  const writtenQuestions = resolvePoliticsWrittenQuestions(sheetQuestions)
  const extraWrittenPages = chunkQuestions(writtenQuestions.filter((question) => question.displayNo > 38), 2)

  return [
    `<section class="paper-page sheet-politics-page">
      ${renderPoliticsPageMarks()}
      <div class="sheet-politics-grid">
        ${renderPoliticsInfoPanel(choiceQuestions)}
        <div class="sheet-politics-side sheet-politics-answer-side">
          ${renderPoliticsStickerRow()}
          ${renderPoliticsAnswerBox(resolveSheetQuestionByNo(writtenQuestions, 34), '第三题 分析题')}
        </div>
      </div>
    </section>`,
    `<section class="paper-page sheet-politics-page">
      ${renderPoliticsPageMarks()}
      <div class="sheet-politics-grid">
        <div class="sheet-politics-side sheet-politics-answer-side">
          <div class="sheet-politics-student-line">考生姓名：____________________</div>
          ${renderPoliticsAnswerBox(resolveSheetQuestionByNo(writtenQuestions, 35))}
        </div>
        <div class="sheet-politics-side sheet-politics-answer-side">
          ${renderPoliticsAnswerBox(resolveSheetQuestionByNo(writtenQuestions, 36))}
        </div>
      </div>
    </section>`,
    `<section class="paper-page sheet-politics-page">
      ${renderPoliticsPageMarks()}
      <div class="sheet-politics-grid">
        ${renderPoliticsCompactInfoPanel(resolveSheetQuestionByNo(writtenQuestions, 37))}
        <div class="sheet-politics-side sheet-politics-answer-side">
          ${renderPoliticsStickerRow()}
          ${renderPoliticsAnswerBox(resolveSheetQuestionByNo(writtenQuestions, 38))}
        </div>
      </div>
    </section>`,
    ...extraWrittenPages.map((pageQuestions) => `<section class="paper-page sheet-politics-page">
      ${renderPoliticsPageMarks()}
      <div class="sheet-politics-grid">
        ${pageQuestions.map((question) => `<div class="sheet-politics-side sheet-politics-answer-side">${renderPoliticsAnswerBox(question)}</div>`).join('')}
        ${pageQuestions.length < 2 ? '<div class="sheet-politics-empty"></div>' : ''}
      </div>
    </section>`),
  ].join('')
}

const renderPoliticsPageMarks = () => {
  return `<span class="sheet-politics-mark-left-bottom"></span>
    <span class="sheet-politics-mark-right-bottom"></span>`
}

const renderPoliticsInfoPanel = (choiceQuestions: SheetQuestion[]) => {
  return `<aside class="sheet-politics-side sheet-politics-info-side">
    <div class="sheet-politics-header">
      <div class="sheet-politics-title">全国硕士研究生入学统一考试</div>
      <div class="sheet-politics-subtitle">思想政治理论试题答题卡1</div>
    </div>
    <div class="sheet-politics-top">
      ${renderPoliticsBasicInfo()}
      <div class="sheet-politics-ticket">
        <div class="sheet-ticket-title">准考证号（左对齐）</div>
        ${renderAdmissionGrid()}
      </div>
    </div>
    ${renderPoliticsNotice()}
    ${renderPoliticsChoiceCard(choiceQuestions)}
    <div class="sheet-politics-forbidden">阴影部分请勿作答或做任何标记</div>
  </aside>`
}

const renderPoliticsCompactInfoPanel = (writtenQuestion?: SheetQuestion) => {
  return `<aside class="sheet-politics-side sheet-politics-info-compact">
    <div class="sheet-politics-header">
      <div class="sheet-politics-title">全国硕士研究生统一考试答题卡</div>
      <div class="sheet-politics-subtitle">思想政治理论试题答题卡2</div>
    </div>
    <div class="sheet-politics-top">
      ${renderPoliticsBasicInfo()}
      <div class="sheet-politics-ticket">
        <div class="sheet-ticket-title">准考证号（左对齐）</div>
        ${renderAdmissionGrid()}
      </div>
    </div>
    <div class="sheet-politics-info-answer">
      ${renderPoliticsAnswerBox(writtenQuestion)}
    </div>
  </aside>`
}

const renderPoliticsBasicInfo = () => {
  return `<div class="sheet-politics-basic">
    <div class="sheet-politics-basic-row">
      <div class="sheet-politics-basic-label">报考单位</div>
      <div></div>
    </div>
    <div class="sheet-politics-basic-row">
      <div class="sheet-politics-basic-label">考生姓名</div>
      <div></div>
    </div>
  </div>`
}

const renderPoliticsNotice = () => {
  return `<div class="sheet-politics-notice">
    <div class="sheet-politics-notice-title">注意事项</div>
    <div class="sheet-politics-notice-body">
      1、填（书）写部分须使用黑色字迹签字笔，笔迹工整，字迹清楚；选择题须用 2B 铅笔填涂。<br />
      2、选择题答案必须用 2B 铅笔在答题卡相应题号内填涂，非选择题答案必须书写在各题卡指定位置的边框区域内。<br />
      3、保持答题卡整洁，不要折叠、严禁在图像卡上做任何标记，否则按无效答卷处理。<br />
      4、考生须填涂缺考标记并粘贴条形码。
    </div>
    <div class="sheet-politics-example">
      <div>正确涂卡 <span class="sheet-politics-bubble">■</span></div>
      <div>错误涂卡 <span class="sheet-politics-bubble">√</span><span class="sheet-politics-bubble">×</span><span class="sheet-politics-bubble">●</span><span class="sheet-politics-bubble">－</span></div>
    </div>
    <div class="sheet-politics-example">
      <div>缺考标记 <span class="sheet-politics-bubble"></span></div>
      <div>缺考考生由监考员粘贴条码，并用 2B 铅笔填涂缺考标记。</div>
    </div>
  </div>`
}

const renderPoliticsChoiceCard = (choiceQuestions: SheetQuestion[]) => {
  const singleChoices = resolvePoliticsChoiceRange(choiceQuestions, 1, 16)
  const multipleChoices = resolvePoliticsChoiceRange(choiceQuestions, 17, 33)

  return `<div class="sheet-politics-choice-card">
    <div class="sheet-politics-choice-section">
      <div class="sheet-politics-choice-label">第一题</div>
      <div class="sheet-politics-choice-type">单项选择题</div>
      <div class="sheet-politics-choice-rows">
        ${singleChoices.map(renderPoliticsChoiceRow).join('')}
      </div>
    </div>
    <div class="sheet-politics-choice-section">
      <div class="sheet-politics-choice-label">第二题</div>
      <div class="sheet-politics-choice-type">多项选择题</div>
      <div class="sheet-politics-choice-rows">
        ${multipleChoices.map(renderPoliticsChoiceRow).join('')}
      </div>
    </div>
  </div>`
}

const renderPoliticsChoiceRow = (question: SheetQuestion) => {
  const optionCount = Math.max(parseOptions(question.options).length, 4)
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, optionCount)

  return `<div class="sheet-politics-choice-row">
    <strong>${question.displayNo}</strong>
    ${labels.map((label) => `<span class="sheet-politics-bubble">${label}</span>`).join('')}
  </div>`
}

const renderPoliticsStickerRow = () => {
  return `<div class="sheet-politics-sticker-row">
    <div class="sheet-politics-sticker">考生信息条形码粘贴位置</div>
    <div class="sheet-politics-sticker">试卷条形码粘贴位置</div>
  </div>`
}

const renderPoliticsAnswerBox = (question?: SheetQuestion, title?: string) => {
  if (!question) return '<div class="sheet-politics-empty"></div>'

  return `<div class="sheet-politics-answer-box">
    ${title ? `<div class="sheet-politics-answer-title">${title}</div>` : ''}
    <div class="sheet-politics-answer-inner">
      <span class="sheet-answer-no">${question.displayNo}.</span>
    </div>
  </div>`
}

const resolvePoliticsChoiceQuestions = (questions: SheetQuestion[]) => {
  const choiceQuestions = questions.filter((question) => {
    const kind = resolveQuestionKind(question)
    return (kind === 'choice' || question.displayNo <= 33) && question.displayNo <= 33
  })

  return choiceQuestions.length ? choiceQuestions : questions.slice(0, 33)
}

const resolvePoliticsWrittenQuestions = (questions: SheetQuestion[]) => {
  const writtenQuestions = questions.filter((question) => question.displayNo >= 34)
  if (writtenQuestions.length) return writtenQuestions

  return questions.slice(33).map((question, index) => ({
    ...question,
    displayNo: 34 + index,
  }))
}

const resolvePoliticsChoiceRange = (questions: SheetQuestion[], start: number, end: number) => {
  return Array.from({ length: end - start + 1 }).map((_, index) => {
    const displayNo = start + index
    return resolveSheetQuestionByNo(questions, displayNo) || ({
      displayNo,
      options: '["A","B","C","D"]',
    } as SheetQuestion)
  })
}

const resolveSheetQuestionByNo = (questions: SheetQuestion[], displayNo: number) => {
  return questions.find((question) => question.displayNo === displayNo)
}

const renderMathSheetLeftPanel = (
  exam: ProblemExamVo | ExamItem,
  choiceQuestions: SheetQuestion[],
  fillQuestions: SheetQuestion[],
  writtenQuestion?: SheetQuestion,
) => {
  return `<aside class="sheet-left-panel">
    <div class="sheet-title">全国硕士研究生入学统一考试<br />数学试题答题卡1</div>
    <div class="sheet-top-info">
      <div class="sheet-basic-info">
        <div class="sheet-basic-row">
          <div class="sheet-basic-label">报考单位</div>
          <div class="sheet-basic-blank"></div>
        </div>
        <div class="sheet-basic-row">
          <div class="sheet-basic-label">姓名</div>
          <div class="sheet-basic-blank"></div>
        </div>
      </div>
      <div class="sheet-ticket">
        <div class="sheet-ticket-title">准考证号</div>
        ${renderAdmissionGrid()}
      </div>
    </div>
    ${renderSheetNoticeAndExamples()}
    <div class="sheet-choice-fill">
      <div class="sheet-choice-grid">
        ${choiceQuestions.map(renderMathSheetChoiceRow).join('')}
      </div>
      <div class="sheet-fill-grid">
        ${fillQuestions.map(renderMathSheetFillRow).join('')}
      </div>
    </div>
    <div class="sheet-left-answer">${renderMathSheetAnswerBox(writtenQuestion)}</div>
  </aside>`
}

const renderAdmissionGrid = () => {
  return `<div class="sheet-ticket-grid">${Array.from({ length: 15 })
    .map(() => `<div class="sheet-ticket-col">
      <span class="sheet-ticket-write"></span>
      ${Array.from({ length: 10 }).map((_, index) => `<span class="sheet-ticket-bubble">${index}</span>`).join('')}
    </div>`)
    .join('')}</div>`
}

const renderSheetNoticeAndExamples = () => {
  return `<div class="sheet-notice">
    <p>注意事项：</p>
    1. 填（书）写部分须使用黑色字迹签字笔书写，笔迹工整、清楚。<br />
    2. 选择题必须用 2B 铅笔在答题卡相应位置填涂，非选择题须在指定区域作答。<br />
    3. 修改选择题答案时，请用橡皮擦干净后重新填涂；超出答题区域的答案无效。<br />
    <div>正确填涂　<span class="sheet-bubble">■</span>　错误填涂　<span class="sheet-bubble">✓</span> <span class="sheet-bubble">×</span> <span class="sheet-bubble">●</span> <span class="sheet-bubble">—</span></div>
    <div>缺考标志　<span class="sheet-bubble"></span>　缺考考生信息由监考员填写并加盖缺考章。</div>
  </div>`
}

const renderMathSheetChoiceRow = (question: SheetQuestion) => {
  const optionCount = Math.max(parseOptions(question.options).length, 4)
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, optionCount)

  return `<div class="sheet-choice-row">
    <strong>${question.displayNo}</strong>
    ${labels.map((label) => `<span class="sheet-bubble">${label}</span>`).join('')}
  </div>`
}

const renderMathSheetFillRow = (question: SheetQuestion) => {
  return `<div class="sheet-fill-row">
    <strong>${question.displayNo}.</strong>
    <span></span>
  </div>`
}

const renderMathSheetAnswerBox = (question?: SheetQuestion) => {
  if (!question) return '<div class="sheet-empty-space"></div>'

  return `<div class="sheet-answer-box">
    <div class="sheet-answer-inner">
      <span class="sheet-answer-no">${question.displayNo}.</span>
    </div>
  </div>`
}

const renderMathSheetContinuationBox = (question?: SheetQuestion) => {
  if (!question) return '<div class="sheet-empty-space"></div>'

  return `<div class="sheet-answer-box">
    <div class="sheet-answer-inner"></div>
  </div>`
}

const renderMathSheetSplitColumn = (continuedQuestion?: SheetQuestion, nextQuestion?: SheetQuestion) => {
  if (!nextQuestion) {
    return `<div class="sheet-split-column">
      ${renderMathSheetContinuationBox(continuedQuestion)}
      <div class="sheet-empty-space"></div>
    </div>`
  }

  return `<div class="sheet-split-column">
    ${renderMathSheetContinuationBox(continuedQuestion)}
    ${renderMathSheetAnswerBox(nextQuestion)}
  </div>`
}

const buildExamSections = (questions: ProblemMath408BankVo[]) => {
  return questions.reduce<ExamSection[]>((sections, question) => {
    const kind = resolveQuestionKind(question)
    const latest = sections[sections.length - 1]
    if (latest && latest.kind === kind) {
      latest.questions.push(question)
      return sections
    }

    sections.push({ kind, questions: [question] })
    return sections
  }, [])
}

const renderSection = (section: ExamSection, index: number) => {
  return `<section class="section">
    <h2 class="section-title">${buildSectionTitle(section, index)}</h2>
    ${section.questions.map((question, questionIndex) => renderQuestion(question, questionIndex, section.kind)).join('')}
  </section>`
}

const buildSectionTitle = (section: ExamSection, index: number) => {
  const sectionIndex = toChineseSectionIndex(index + 1)
  const questionCount = section.questions.length
  const totalScore = section.questions.reduce((sum, item) => sum + safeScore(item), 0)
  const scores = [...new Set(section.questions.map(safeScore))]
  const scoreText = scores.length === 1 ? `每小题 ${scores[0]} 分` : `共 ${totalScore} 分`

  return `${sectionIndex}、${sectionTitleName(section.kind)}：本部分共 ${questionCount} 小题，${scoreText}，共 ${totalScore} 分。${sectionHint(section.kind)}`
}

const renderQuestion = (question: ProblemMath408BankVo, index: number, kind: ExamSectionKind) => {
  const questionNo = question.pages || index + 1
  const score = safeScore(question)
  const body = renderInlineRichText(question.description || question.problem_name || '')
  const options = renderOptions(question.options)
  const area = kind === 'choice' ? options : kind === 'fill' ? '<div class="answer-area"></div>' : '<div class="subjective-area"></div>'

  return `<article class="question">
    <div class="question-line">
      <span class="question-prefix">${questionNo}. <span class="question-score">（${score} 分）</span></span>
      <span class="question-stem">${body}</span>
    </div>
    ${area}
  </article>`
}

const renderOptions = (options?: string) => {
  const optionList = parseOptions(options)
  if (!optionList.length) return ''

  const labels = ['A', 'B', 'C', 'D', 'E', 'F']
  return `<div class="options">${optionList
    .map((option, index) => `<div class="option"><strong>${labels[index] || index + 1}.</strong><span>${renderInlineRichText(option)}</span></div>`)
    .join('')}</div>`
}

const resolveQuestionKind = (question: ProblemMath408BankVo): ExamSectionKind => {
  if (question.status === 3 || question.option_type === 4) return 'algorithm'
  if (question.option_type === 1 || question.option_type === 2) return 'choice'
  if (question.option_type === 3) return 'fill'
  if (question.option_type === 0) return 'subjective'
  return 'other'
}

const sectionTitleName = (kind: ExamSectionKind) => {
  if (kind === 'choice') return '选择题'
  if (kind === 'fill') return '填空题'
  if (kind === 'subjective') return '解答题'
  if (kind === 'algorithm') return '算法题'
  return '综合题'
}

const sectionHint = (kind: ExamSectionKind) => {
  if (kind === 'choice') return '在每小题给出的选项中，只有一项符合题目要求。'
  if (kind === 'fill') return '请将答案填写在题后横线上。'
  return '解答应写出文字说明、证明过程或演算步骤。'
}

const safeScore = (question: ProblemMath408BankVo) => {
  return typeof question.score === 'number' && Number.isFinite(question.score) ? question.score : 0
}

const parseOptions = (options?: string) => {
  const raw = normalizeExamText(options)
  if (!raw) return []

  const tryParse = (value: string) => {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.map((item) => normalizeExamText(String(item))).filter(Boolean)
      if (parsed && typeof parsed === 'object') return Object.values(parsed).map((item) => normalizeExamText(String(item))).filter(Boolean)
    } catch {
      return null
    }
    return null
  }

  const parsed = tryParse(raw) || tryParse(raw.replace(/'/g, '"'))
  if (parsed?.length) return parsed

  return raw
    .split(/\r?\n|(?=[A-F][.．、])/)
    .map((item) => item.replace(/^[A-F][.．、]\s*/i, '').trim())
    .filter(Boolean)
}

const renderRichText = (text?: string) => {
  const normalized = normalizeExamText(text)
  if (!normalized) return ''

  const content = renderRichTextContent(normalized)

  return content
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('')
}

const renderInlineRichText = (text?: string) => {
  const normalized = normalizeExamText(text)
  if (!normalized) return ''

  return renderRichTextContent(normalized).replace(/\n+/g, '<br />')
}

const renderRichTextContent = (text: string) => {
  const imageMap: string[] = []
  const imageToken = (url: string) => {
    const index = imageMap.push(url) - 1
    return `__EXAM_IMAGE_${index}__`
  }

  let content = text
    .replace(/!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/g, (_, url: string) => imageToken(url))
    .replace(/(https?:\/\/[^\s"'<>]+?\.(?:png|jpe?g|gif|webp|svg)(?:\?[^\s"'<>]*)?)/gi, (_, url: string) => imageToken(url))

  content = escapeHtml(content)
  imageMap.forEach((url, index) => {
    const imageClass = /\.svg(?:\?|$)/i.test(url) ? ' class="exam-svg"' : ''
    content = content.replaceAll(`__EXAM_IMAGE_${index}__`, `<img${imageClass} src="${escapeHtml(url)}" alt="题目图片" />`)
  })

  return content
}

const normalizeExamText = (value?: string | number | null) => {
  return value === undefined || value === null ? '' : String(value).trim()
}

const resolveQuestionNo = (question: ProblemMath408BankVo, index: number) => {
  return typeof question.pages === 'number' && Number.isFinite(question.pages) && question.pages > 0 ? question.pages : index + 1
}

const splitMathSheetQuestions = (questions: SheetQuestion[]) => {
  return {
    choiceQuestions: questions.filter((question) => question.displayNo >= 1 && question.displayNo <= 8),
    fillQuestions: questions.filter((question) => question.displayNo >= 9 && question.displayNo <= 14),
    writtenQuestions: questions.filter((question) => question.displayNo >= 15),
  }
}

const isMathExam = (exam: ProblemExamVo | ExamItem) => {
  return normalizeExamText(exam.exam_name).includes('数学')
}

const is408Exam = (exam: ProblemExamVo | ExamItem) => {
  const examName = normalizeExamText(exam.exam_name)
  return examName.includes('408') || examName.includes('计算机')
}

const isPoliticsExam = (exam: ProblemExamVo | ExamItem) => {
  const examName = normalizeExamText(exam.exam_name)
  return examName.includes('政治') || examName.includes('思想政治')
}

const chunkQuestions = <T,>(items: T[], size: number) => {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

const escapeHtml = (value?: string | number | null) => {
  return normalizeExamText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const resolveExamYear = (examName: string) => {
  const year = examName.match(/(19|20)\d{2}/)?.[0]
  return year || new Date().getFullYear().toString()
}

const resolveExamSubjectName = (examName: string) => {
  if (/数学\s*一|数一|卷\s*1|卷一/.test(examName)) return '数 学（一）'
  if (/数学\s*二|数二|卷\s*2|卷二/.test(examName)) return '数 学（二）'
  if (/数学\s*三|数三|卷\s*3|卷三/.test(examName)) return '数 学（三）'
  if (examName.includes('数学')) return '数 学'
  return examName.replace(/(19|20)\d{2}年?/, '').replace(/考研|全国硕士研究生招生考试|试卷|真题/g, '').trim() || '考试科目'
}

const resolveSubjectCode = (examName: string) => {
  const explicitCode = examName.match(/(?:科目代码|代码|编号)[:：]?\s*(\d{3})/)?.[1]
  if (explicitCode) return explicitCode
  if (/数学\s*一|数一|卷\s*1|卷一/.test(examName)) return '301'
  if (/数学\s*二|数二|卷\s*2|卷二/.test(examName)) return '302'
  if (/数学\s*三|数三|卷\s*3|卷三/.test(examName)) return '303'
  return '___'
}

const toChineseSectionIndex = (value: number) => {
  const chars = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  if (value <= 10) return chars[value]
  if (value < 20) return `十${chars[value - 10]}`
  const ten = Math.floor(value / 10)
  const unit = value % 10
  return `${chars[ten]}十${chars[unit]}`
}

const handleImageError = (e: Event) => {
  ;(e.target as HTMLImageElement).src =
      'http://mogullzr001.oss-cn-beijing.aliyuncs.com/2025/11/2c75468abcf44ef9be887216dd21b0e1.jpg'
}
</script>
