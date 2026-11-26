<template>
  <button ref="trigger" type="button"
    class="rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 font-medium text-amber-900 shadow-sm transition hover:bg-amber-100"
    @click="showSearch">搜索我的笔记</button>
  <Teleport to="body">
    <div v-if="opened" class="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/55 p-4"
      @click.self="closeSearch()" @keydown.esc.stop.prevent="closeSearch()" @keydown.tab="trapFocus">
      <section ref="dialog" class="flex max-h-[85dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        role="dialog" aria-modal="true" aria-labelledby="note-search-heading">
        <header class="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
          <div>
            <h2 id="note-search-heading" class="text-xl font-bold text-slate-900">搜索我的笔记</h2>
            <p class="mt-1 text-sm text-slate-500">查找笔记所在的答题卡，点击结果直接定位到对应题目的笔记。</p>
          </div>
          <button type="button" class="shrink-0 whitespace-nowrap rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100" aria-label="关闭笔记搜索" @click="closeSearch()">关闭</button>
        </header>
        <form class="border-b border-slate-100 px-5 py-4 sm:px-7" @submit.prevent="searchNotes(1, draft)">
          <div class="flex gap-2">
            <label for="my-note-keyword" class="sr-only">笔记关键词</label>
            <input id="my-note-keyword" ref="searchInput" v-model="draft" maxlength="80" type="search" autocomplete="off"
              placeholder="例如：汇编程序可见的寄存器"
              class="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
            <button type="submit" :disabled="loading" class="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
              {{ loading ? '搜索中…' : '搜索' }}
            </button>
          </div>
          <p class="mt-2 text-xs text-slate-500">仅搜索你自己的个人复习标注；多个关键词可用空格分隔，需同时包含。</p>
        </form>
        <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-7" aria-live="polite" :aria-busy="loading">
          <p v-if="loading" class="py-10 text-center text-sm text-slate-500">正在查找笔记位置…</p>
          <p v-else-if="searchError" role="alert" class="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ searchError }}</p>
          <p v-else-if="!hasSearched" class="py-10 text-center text-sm leading-7 text-slate-500">输入记得的知识点或笔记内容，查找它所在的试卷和题目。</p>
          <p v-else-if="!records.length" class="py-10 text-center text-sm text-slate-500">没有找到相关笔记，可以试试更短的关键词。</p>
          <div v-else class="space-y-3">
            <p class="text-xs text-slate-500">找到 {{ total }} 处笔记位置</p>
            <RouterLink v-for="hit in records" :key="hit.noteId" :to="noteSheetLocation(hit)" @click="closeSearch(false)"
              class="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-amber-400 hover:bg-amber-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h3 class="font-semibold text-slate-900">{{ hit.examName }} · 第 {{ hit.questionNumber }} 题</h3>
                <span class="text-xs font-semibold text-amber-800">查看笔记 →</span>
              </div>
              <p class="mt-2 text-xs text-slate-500">答题卡 #{{ hit.recordId }}<span v-if="hit.noteUpdatedAt"> · 笔记更新于 {{ formatDate(hit.noteUpdatedAt) }}</span></p>
              <p class="mt-3 line-clamp-2 break-words text-sm leading-6 text-slate-600"><template v-for="(part, index) in noteSnippetParts(hit.snippet, activeKeyword)" :key="index"><mark v-if="part.matched" class="rounded-sm bg-amber-100 text-amber-950">{{ part.text }}</mark><span v-else>{{ part.text }}</span></template></p>
            </RouterLink>
          </div>
        </div>
        <footer v-if="hasSearched && total > 10" class="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm sm:px-7">
          <button type="button" :disabled="loading || pageNum <= 1" class="rounded-lg px-3 py-2 hover:bg-slate-100 disabled:opacity-40" @click="searchNotes(pageNum - 1, activeKeyword)">上一页</button>
          <span class="text-slate-500">{{ pageNum }} / {{ Math.ceil(total / 10) }}</span>
          <button type="button" :disabled="loading || pageNum >= Math.ceil(total / 10)" class="rounded-lg px-3 py-2 hover:bg-slate-100 disabled:opacity-40" @click="searchNotes(pageNum + 1, activeKeyword)">下一页</button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { OpenAPI } from '../../../generated/core/OpenAPI'
import { request } from '../../../generated/core/request'
import UserStore from '@/store/user'
import { noteSheetLocation, noteSnippetParts, type ExamNoteSearchHit, type ExamNoteSearchPage } from './examNoteSearch'

const user = UserStore()
const opened = ref(false)
const trigger = ref<HTMLButtonElement | null>(null)
const dialog = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const draft = ref('')
const activeKeyword = ref('')
const records = ref<ExamNoteSearchHit[]>([])
const total = ref(0)
const pageNum = ref(1)
const hasSearched = ref(false)
const loading = ref(false)
const searchError = ref('')
let searchVersion = 0

async function showSearch() {
  opened.value = true
  await nextTick()
  searchInput.value?.focus()
}

function closeSearch(restoreFocus = true) {
  const wasOpened = opened.value
  if (loading.value) hasSearched.value = false
  opened.value = false
  searchVersion++
  loading.value = false
  if (restoreFocus && wasOpened) trigger.value?.focus()
}

function trapFocus(event: KeyboardEvent) {
  const controls = dialog.value?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled])')
  if (!controls?.length) return
  const first = controls[0], last = controls[controls.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

async function searchNotes(page: number, keyword: string) {
  const query = keyword.trim()
  if (!query) { searchError.value = '请输入笔记关键词。'; return }
  const version = ++searchVersion
  loading.value = true
  searchError.value = ''
  activeKeyword.value = query
  records.value = []
  total.value = 0
  hasSearched.value = true
  try {
    const response = await request<{ code: number; data?: ExamNoteSearchPage; message?: string }>(OpenAPI, {
      method: 'GET', url: '/api/problem/other/exam/annotations/search', query: { keyword: query, pageNum: page },
    })
    if (version !== searchVersion) return
    if (response.code !== 0 || !response.data || !Array.isArray(response.data.records)) {
      throw new Error(response.message || '笔记搜索失败，请重试。')
    }
    records.value = response.data.records
    total.value = response.data.total
    pageNum.value = response.data.pageNum
  } catch (error) {
    if (version === searchVersion) searchError.value = error instanceof Error ? error.message : '笔记搜索失败，请重试。'
  } finally {
    if (version === searchVersion) loading.value = false
  }
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('zh-CN')
}

watch(() => user.loginUser?.uuid, () => {
  closeSearch(false)
  draft.value = ''
  activeKeyword.value = ''
  records.value = []
  total.value = 0
  hasSearched.value = false
  searchError.value = ''
})
onBeforeUnmount(() => { searchVersion++ })
</script>
