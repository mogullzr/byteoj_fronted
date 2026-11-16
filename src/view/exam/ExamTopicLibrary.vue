<template>
  <section class="paper-library" :style="{ '--topic-accent': topic.accent, '--topic-wash': topic.wash }" aria-label="专题试卷">
    <div class="library-toolbar">
      <div class="library-count" aria-live="polite">
        <strong>{{ visibleExams.length }}</strong><span>套试卷</span>
        <span v-if="yearRange" class="library-years">{{ yearRange }}</span>
      </div>
      <div class="library-filters">
        <button type="button" class="joined-filter" :class="{ 'is-selected': joinedOnly }" :aria-pressed="joinedOnly" @click="joinedOnly = !joinedOnly">只看已报名</button>
        <label class="sr-only" for="topic-year">筛选年份</label>
        <select id="topic-year" v-model="selectedYear" aria-label="筛选年份">
          <option value="all">全部年份</option>
          <option v-for="year in years" :key="year" :value="String(year)">{{ year }} 年</option>
        </select>
        <label class="sr-only" for="topic-order">试卷排序</label>
        <select id="topic-order" v-model="sortOrder" aria-label="试卷排序">
          <option value="desc">年份从新到旧</option>
          <option value="asc">年份从旧到新</option>
        </select>
      </div>
    </div>

    <div v-if="visibleExams.length" class="paper-grid">
      <article v-for="exam in visibleExams" :key="exam.exam_id" class="paper-volume" :aria-label="exam.exam_name">
        <button type="button" class="volume-records-link" :aria-label="'查看' + (exam.exam_name || '试卷') + '的答题记录'" @click="$emit('records', exam)"></button>
        <div class="volume-topline">
          <span>{{ exam.exam_name?.includes('真题') ? '历年真题' : '专题试卷' }}</span>
          <span v-if="exam.join" class="volume-joined">已报名</span>
          <span v-else class="volume-code">{{ topic.code }}</span>
        </div>
        <div class="volume-year">{{ getExamYear(exam.exam_name) || '专项' }}<span v-if="getExamYear(exam.exam_name)">年</span></div>
        <div class="volume-rule" aria-hidden="true"></div>
        <h3 :title="exam.exam_name">{{ exam.exam_name || '未命名试卷' }}</h3>
        <div class="volume-meta"><span>{{ exam.time ? `${exam.time} 分钟` : '不限时' }}</span><span>{{ exam.joins || 0 }} 人参与</span></div>
        <p class="volume-mode">{{ exam.status === 2 ? '自由练习 · 可查答案' : exam.status === 1 ? '监控考试 · 限一次提交' : '自由考试 · 可多次提交' }}</p>
        <button v-if="exam.join" type="button" class="volume-primary" @click="$emit('start', exam)">进入考试 <span aria-hidden="true">↗</span></button>
        <button v-else type="button" class="volume-primary" :disabled="joiningExamId === exam.exam_id" @click="$emit('join', exam)">{{ joiningExamId === exam.exam_id ? '报名中…' : '报名考试' }} <span aria-hidden="true">＋</span></button>
        <div class="volume-actions">
          <button type="button" @click="$emit('records', exam)">作答记录</button>
          <span aria-hidden="true">·</span>
          <button type="button" :disabled="exportingExamId === exam.exam_id" @click="$emit('export', exam)">{{ exportingExamId === exam.exam_id ? '导出中…' : '导出 PDF' }}</button>
        </div>
      </article>
    </div>
    <div v-else class="library-empty">
      <span class="empty-glyph" aria-hidden="true">∅</span>
      <h3>暂时没有匹配的试卷</h3>
      <p>{{ keyword ? '试试其他年份或试卷名称。' : '试试调整年份或取消“只看已报名”。' }}</p>
      <button v-if="selectedYear !== 'all' || joinedOnly" type="button" @click="selectedYear = 'all'; joinedOnly = false">清除筛选</button>
    </div>
    <p v-if="visibleExams.length" class="library-end"><span></span>每一套，都是下一步的积累<span></span></p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProblemExamVo } from '../../../generated/models/ProblemExamVo'
import { getExamYear } from './examTopics'
import type { ExamTopic } from './examTopics'

const props = defineProps<{
  topic: ExamTopic
  exams: ProblemExamVo[]
  keyword: string
  joiningExamId: number | null
  exportingExamId: number | null
}>()

defineEmits<{
  (event: 'start' | 'join' | 'records' | 'export', exam: ProblemExamVo): void
}>()

const sortOrder = ref('desc')
const selectedYear = ref('all')
const joinedOnly = ref(false)
const years = computed(() => [...new Set(props.exams.map((exam) => getExamYear(exam.exam_name)).filter((year): year is number => year !== null))].sort((a, b) => b - a))
const yearRange = computed(() => years.value.length ? `${years.value[years.value.length - 1]} — ${years.value[0]}` : '')
const visibleExams = computed(() => {
  const keyword = props.keyword.trim().toLocaleLowerCase()
  return props.exams.filter((exam) => {
    if (joinedOnly.value && !exam.join) return false
    if (selectedYear.value !== 'all' && String(getExamYear(exam.exam_name)) !== selectedYear.value) return false
    return !keyword || exam.exam_name?.toLocaleLowerCase().includes(keyword)
  }).sort((a, b) => {
    const yearA = getExamYear(a.exam_name)
    const yearB = getExamYear(b.exam_name)
    if (yearA === null && yearB !== null) return 1
    if (yearB === null && yearA !== null) return -1
    const byYear = (yearA || 0) - (yearB || 0)
    return (sortOrder.value === 'asc' ? byYear : -byYear) || (a.exam_name || '').localeCompare(b.exam_name || '', 'zh-CN', { numeric: true })
  })
})
</script>

<style scoped>
.paper-library { padding: 25px 28px 16px; border: 1px solid #e8e5dd; border-radius: 22px; background: #f5f3ed; }
.library-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 25px; }
.library-count { display: flex; align-items: baseline; gap: 7px; color: #72776f; font-size: 12px; }
.library-count strong { color: #293c35; font-size: 28px; font-weight: 600; font-variant-numeric: tabular-nums; }
.library-years { margin-left: 8px; padding-left: 14px; border-left: 1px solid #d9dbd2; font-variant-numeric: tabular-nums; letter-spacing: 1px; }
.library-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.library-filters select, .joined-filter { min-height: 35px; padding: 6px 10px; border: 1px solid #dfe2d8; border-radius: 8px; background: #fffefa; color: #5c675d; font-size: 12px; cursor: pointer; }
.joined-filter.is-selected { border-color: var(--topic-accent); background: var(--topic-wash); color: var(--topic-accent); }
.paper-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; }
.paper-volume { position: relative; display: flex; flex-direction: column; min-width: 0; padding: 19px 16px 12px 23px; overflow: hidden; border: 1px solid #dedfd4; border-radius: 5px 14px 14px 5px; background: #fffef9; box-shadow: 2px 4px 0 #e9e7df, 0 8px 18px #263d3510; transition: transform .2s, box-shadow .2s; }
.paper-volume::before { position: absolute; inset: 0 auto 0 0; width: 6px; content: ''; background: var(--topic-accent); }
.paper-volume:hover { transform: translateY(-4px); box-shadow: 2px 5px 0 #e3e1d9, 0 13px 24px #263d3518; }
.volume-topline { display: flex; justify-content: space-between; align-items: center; gap: 3px; color: #889086; font-size: 10px; letter-spacing: 1px; }
.volume-code { font-family: Georgia, serif; font-size: 13px; letter-spacing: 2px; color: var(--topic-accent); }
.volume-joined { padding: 2px 5px; border-radius: 4px; background: var(--topic-wash); color: var(--topic-accent); letter-spacing: 0; }
.volume-year { margin-top: 13px; color: var(--topic-accent); font-family: Georgia, 'Times New Roman', serif; font-size: 44px; letter-spacing: -2px; line-height: 1.15; }
.volume-year span { padding-left: 4px; color: #969b90; font-family: sans-serif; font-size: 11px; letter-spacing: 0; }
.volume-rule { width: 28px; height: 2px; margin: 15px 0 13px; background: var(--topic-accent); opacity: .35; }
.paper-volume h3 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 40px; overflow: hidden; margin: 0 0 11px; color: #344239; font-size: 13px; font-weight: 600; line-height: 20px; }
.volume-meta { display: flex; flex-wrap: wrap; gap: 4px 10px; margin-top: auto; color: #7f877d; font-size: 10px; }
.volume-mode { margin: 5px 0 13px; color: #8c9288; font-size: 10px; }
.volume-records-link { position: absolute; inset: 0; border-radius: 5px 14px 14px 5px; cursor: pointer; }
.volume-records-link:focus-visible { outline-offset: -3px; }
.volume-primary { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: center; width: 100%; min-height: 34px; padding: 7px 10px; border-radius: 7px; background: var(--topic-accent); color: #fffdf4; font-size: 11px; font-weight: 600; transition: filter .15s; }
.volume-primary:hover { filter: brightness(1.13); }
.volume-primary span { font-size: 16px; line-height: 1; opacity: .65; }
.volume-actions { display: flex; align-items: center; justify-content: center; gap: 9px; margin-top: 8px; color: #9a9d94; font-size: 10px; }
.volume-actions button { position: relative; z-index: 1; padding: 4px 0; color: #727c70; }
.volume-actions button:hover { color: var(--topic-accent); }
button:disabled { cursor: wait; opacity: .5; }
button:focus-visible, select:focus-visible { outline: 2px solid var(--topic-accent); outline-offset: 3px; }
.library-empty { padding: 60px 16px; text-align: center; color: #7e877b; font-size: 13px; }
.empty-glyph { font-family: Georgia, serif; font-size: 48px; color: #a9b3a5; }
.library-empty h3 { margin: 12px 0 6px; font-size: 16px; color: #435240; }
.library-empty button { margin-top: 16px; color: var(--topic-accent); text-decoration: underline; }
.library-end { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 30px 0 10px; color: #92998c; font-size: 10px; letter-spacing: 2px; }
.library-end span { width: 28px; height: 1px; background: #d5d9cd; }
@media (max-width: 1023px) { .paper-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 767px) { .paper-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .paper-library { padding: 16px 12px; border-radius: 16px; } .paper-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px 11px; } .paper-volume { padding: 15px 11px 10px 17px; } .volume-year { font-size: 38px; } .library-filters { gap: 6px; } .library-filters select, .joined-filter { font-size: 11px; padding: 6px; } .library-years { font-size: 11px; } }
@media (prefers-reduced-motion: reduce) { .paper-volume { transition: none; } .paper-volume:hover { transform: none; } }
</style>
