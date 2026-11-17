<template>
  <div class="question-directory" @keydown.esc="closeDirectory">
    <button
        ref="toggleButton"
        type="button"
        class="directory-toggle"
        aria-controls="sheet-question-directory"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
    >
      题目目录 <span v-if="activeNumber">· {{ activeNumber }}</span>
    </button>
    <nav id="sheet-question-directory" class="directory-panel" :class="{ 'is-expanded': expanded }" aria-label="答题卡题目目录">
      <header class="directory-header">
        <div>
          <h2>题目目录</h2>
          <p>共 {{ items.length }} 题 · 点击题号直接定位</p>
        </div>
        <button type="button" class="directory-close" aria-label="收起题目目录" @click="closeDirectory">收起</button>
      </header>
      <form class="directory-search" @submit.prevent="jumpToNumber">
        <label for="directory-question-number" class="sr-only">输入题号</label>
        <input id="directory-question-number" v-model="numberDraft" type="number" min="1" :max="items.length" step="1" required placeholder="输入题号" />
        <button type="submit">跳转</button>
      </form>
      <p v-if="items.some(item => !item.visible)" class="directory-hint">虚线题号已被筛选隐藏，点击将清除筛选并定位。</p>
      <div class="directory-grid">
        <button
            v-for="item in items"
            :key="item.number"
            type="button"
            class="directory-number"
            :class="['status-' + item.status, { 'is-current': activeNumber === item.number, 'is-filtered': !item.visible }]"
            :aria-current="activeNumber === item.number ? 'location' : undefined"
            :aria-label="`第 ${item.number} 题，${item.type}，${statusLabels[item.status]}${item.visible ? '' : '，已被筛选隐藏'}`"
            :title="`第 ${item.number} 题 · ${item.type} · ${statusLabels[item.status]}`"
            @click="navigate(item.number)"
        >{{ item.number }}</button>
      </div>
      <footer class="directory-legend">
        <span><i class="status-correct"></i>正确</span>
        <span><i class="status-wrong"></i>失分</span>
        <span><i class="status-unanswered"></i>未答</span>
        <span><i class="status-pending"></i>待确认</span>
      </footer>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type QuestionStatus = 'correct' | 'wrong' | 'unanswered' | 'pending'

const props = defineProps<{
  items: Array<{ number: number; type: string; status: QuestionStatus; visible: boolean }>
  activeNumber: number
}>()
const emit = defineEmits<{ (event: 'navigate', number: number): void }>()
const expanded = ref(false)
const numberDraft = ref('')
const toggleButton = ref<HTMLButtonElement | null>(null)
const statusLabels: Record<QuestionStatus, string> = {
  correct: '正确', wrong: '失分', unanswered: '未作答', pending: '待确认',
}

const closeDirectory = () => {
  expanded.value = false
  toggleButton.value?.focus()
}

const navigate = (number: number) => {
  expanded.value = false
  emit('navigate', number)
}

const jumpToNumber = () => {
  const number = Number(numberDraft.value)
  if (Number.isInteger(number) && props.items.some(item => item.number === number)) {
    navigate(number)
  }
}
</script>

<style scoped>
.directory-panel {
  position: fixed;
  z-index: 1000;
  right: 1rem;
  bottom: 9rem;
  display: none;
  width: min(280px, calc(100vw - 2rem));
  max-height: calc(100dvh - 16rem);
  flex-direction: column;
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 16px 48px rgb(15 23 42 / 12%);
}
.directory-panel.is-expanded { display: flex; }
.directory-header { display: flex; align-items: flex-start; justify-content: space-between; gap: .5rem; }
.directory-header h2 { font-weight: 700; color: #0f172a; }
.directory-header p, .directory-hint { margin-top: .35rem; font-size: 12px; line-height: 1.6; color: #64748b; }
.directory-close { flex-shrink: 0; padding: .25rem; font-size: 12px; color: #475569; }
.directory-search { display: flex; gap: .5rem; margin: 1rem 0; }
.directory-search input { width: 0; flex: 1; min-width: 0; padding: .5rem .75rem; border: 1px solid #cbd5e1; border-radius: .5rem; font-size: 14px; }
.directory-search button { border-radius: .5rem; padding: .5rem .75rem; background: #0e7490; color: white; font-size: 14px; font-weight: 600; }
.directory-hint { margin: 0 0 .75rem; }
.directory-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .5rem; overflow-y: auto; min-height: 0; padding: 3px; overscroll-behavior: contain; }
.directory-number { min-height: 36px; border: 1px solid; border-radius: .5rem; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; transition: box-shadow .15s; }
.status-correct { border-color: #a7f3d0; background: #ecfdf5; color: #047857; }
.status-wrong { border-color: #fecdd3; background: #fff1f2; color: #be123c; }
.status-unanswered { border-color: #fde68a; background: #fffbeb; color: #92400e; }
.status-pending { border-color: #cbd5e1; background: #f8fafc; color: #475569; }
.directory-number.is-filtered { border-style: dashed; opacity: .65; }
.directory-number.is-current { outline: 2px solid #0e7490; outline-offset: 1px; opacity: 1; }
.directory-number:hover { box-shadow: inset 0 0 0 1px currentColor; }
.directory-number:focus-visible, .directory-search input:focus-visible { outline: 2px solid #0e7490; outline-offset: 2px; }
.directory-legend { display: flex; flex-wrap: wrap; gap: .5rem .75rem; margin-top: 1rem; padding-top: .75rem; border-top: 1px solid #f1f5f9; font-size: 11px; color: #64748b; }
.directory-legend span { display: inline-flex; align-items: center; gap: .25rem; }
.directory-legend i { width: .6rem; height: .6rem; border-width: 1px; border-radius: 2px; }
.directory-toggle { position: fixed; z-index: 1000; right: 1rem; bottom: 5.5rem; padding: .75rem 1rem; border-radius: .75rem; background: #0f172a; color: white; font-size: 14px; font-weight: 600; box-shadow: 0 8px 24px rgb(15 23 42 / 20%); }
@media (min-width: 1280px) {
  .directory-panel { top: 7rem; right: 1.5rem; bottom: auto; width: 256px; max-height: calc(100dvh - 13rem); display: flex; }
  .directory-toggle, .directory-close { display: none; }
}
</style>
