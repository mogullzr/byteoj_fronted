<template>
  <div>
  <section class="mx-auto mb-8 max-w-[1150px] overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg">
    <div class="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:py-7">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <span class="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold tracking-[0.18em] text-emerald-200">学习专注模式</span>
          <span class="text-sm text-slate-300">仅在学习计划页出现 · 个人目标保存在本地</span>
        </div>
        <h2 class="mt-3 text-2xl font-black tracking-tight sm:text-3xl">把今天过完，再谈放松。</h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          你不是永远不能玩游戏，只是先把这一场仗打完。每一道题都在把你推向自己的目标院校。
        </p>
        <div class="mt-5 flex flex-wrap items-center gap-3">
          <span class="text-sm text-slate-300">目标院校</span>
          <span v-if="!editingSchool && targetSchool" class="font-bold text-emerald-200">{{ targetSchool }}</span>
          <span v-else-if="!editingSchool" class="text-slate-400">还没有填写</span>
          <div v-if="editingSchool" class="flex w-full max-w-md gap-2 sm:w-auto">
            <input
                v-model="targetSchoolDraft"
                class="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-400 focus:border-emerald-300"
                maxlength="40"
                placeholder="例如：清华大学计算机系"
                @keyup="handleSchoolKeyup"
            />
            <button type="button" class="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-400" @click="saveTargetSchool">保存</button>
          </div>
          <button v-else type="button" class="text-sm font-semibold text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200" @click="startEditingSchool">
            {{ targetSchool ? '修改目标' : '填写目标' }}
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-3 lg:min-w-[280px]">
        <button type="button" class="rounded-xl border border-emerald-300/40 px-4 py-2.5 text-sm font-bold text-emerald-100 transition hover:border-emerald-200 hover:bg-emerald-400/10" @click="showUrgePrompt = true">
          我现在有点想玩游戏
        </button>
        <button
            type="button"
            class="w-full rounded-xl border border-emerald-300/40 px-4 py-2.5 text-sm font-bold text-emerald-100 transition hover:border-emerald-200 hover:bg-emerald-400/10"
            :class="{ 'border-emerald-400 bg-emerald-400/20 text-emerald-100': checkedIn }"
            @click="toggleCheckIn"
        >
          {{ checkedIn ? '✓ 今日专注已记录，继续保持' : '记录今天的专注状态' }}
        </button>
      </div>
    </div>
  </section>

  <div v-if="showUrgePrompt" class="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/60 px-4" @click="showUrgePrompt = false">
    <section class="w-full max-w-lg rounded-3xl border border-emerald-200 bg-white p-7 text-center shadow-2xl sm:p-9" role="dialog" aria-modal="true" aria-labelledby="urge-title" @click="stopPropagation">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">🌱</div>
      <h2 id="urge-title" class="mt-5 text-2xl font-black text-slate-900">先别急着打开游戏</h2>
      <p class="mt-3 text-base leading-7 text-slate-600">
        想想你写过的几百套试卷。今天再专注一会儿，目标院校「<strong class="text-emerald-700">{{ targetSchool || '由你来定' }}</strong>」就更近一点。
      </p>
      <p class="mt-3 text-sm font-semibold text-slate-500">不是永远不玩，是先把今天最重要的事做完。</p>
      <button type="button" class="mt-7 w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800" @click="showUrgePrompt = false">
        好，我再专注一会儿
      </button>
      <button type="button" class="mt-3 text-sm text-slate-500 hover:text-slate-700" @click="showUrgePrompt = false">关闭</button>
    </section>
  </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import UserStore from '@/store/user'
import { GRADUATE_TARGET_SCHOOL_STORAGE_PREFIX } from '@/config/temporaryStudy'

const userStore = UserStore()
const targetSchool = ref('')
const targetSchoolDraft = ref('')
const editingSchool = ref(false)
const checkedIn = ref(false)
const showUrgePrompt = ref(false)

const storageUserId = computed(() => {
  const uuid = userStore.loginUser?.uuid
  return uuid !== undefined && uuid !== null && String(uuid) !== '-1' ? String(uuid) : 'guest'
})

const targetSchoolStorageKey = computed(() => `${GRADUATE_TARGET_SCHOOL_STORAGE_PREFIX}${storageUserId.value}`)
const checkInStorageKey = computed(() => `${targetSchoolStorageKey.value}:check-in:${getLocalDateKey()}`)

function getLocalDateKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const loadPersonalState = () => {
  try {
    targetSchool.value = localStorage.getItem(targetSchoolStorageKey.value) || ''
    targetSchoolDraft.value = targetSchool.value
    checkedIn.value = localStorage.getItem(checkInStorageKey.value) === 'done'
  } catch (error) {
    console.warn('读取学习专注状态失败', error)
  }
}

const startEditingSchool = () => {
  targetSchoolDraft.value = targetSchool.value
  editingSchool.value = true
}

const handleSchoolKeyup = (event: KeyboardEvent) => {
  if (event.key === 'Enter') saveTargetSchool()
}

const stopPropagation = (event: MouseEvent) => {
  event.stopPropagation()
}

const saveTargetSchool = () => {
  const school = targetSchoolDraft.value.trim()
  targetSchool.value = school
  editingSchool.value = false
  try {
    if (school) localStorage.setItem(targetSchoolStorageKey.value, school)
    else localStorage.removeItem(targetSchoolStorageKey.value)
  } catch (error) {
    console.warn('保存目标院校失败', error)
  }
}

const toggleCheckIn = () => {
  checkedIn.value = !checkedIn.value
  try {
    if (checkedIn.value) localStorage.setItem(checkInStorageKey.value, 'done')
    else localStorage.removeItem(checkInStorageKey.value)
  } catch (error) {
    console.warn('保存学习打卡状态失败', error)
  }
}

onMounted(() => {
  loadPersonalState()
})

watch([targetSchoolStorageKey, checkInStorageKey], loadPersonalState)
</script>
