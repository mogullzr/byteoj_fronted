<template>
  <main ref="timerPage" class="timer-page" :class="{ 'is-fullscreen-fallback': fullscreenFallback }">
    <section class="timer-shell" :class="{ ringing: alarmRinging }">
      <div class="timer-header">
        <div>
          <div class="eyebrow">精确计时</div>
          <h1>{{ mode === 'countdown' ? '倒计时' : '闹钟' }}</h1>
        </div>
        <button class="fullscreen-button" type="button" :title="isFullscreen ? '退出全屏' : '进入全屏'" @click="toggleFullscreen">
          <span class="fullscreen-icon" aria-hidden="true">{{ isFullscreen ? '×' : '⛶' }}</span>
          <span>{{ isFullscreen ? '退出全屏' : '全屏' }}</span>
        </button>
      </div>

      <div class="display" aria-live="polite">{{ formattedTime }}</div>
      <p class="status">{{ statusText }}</p>

      <div v-if="!hasStarted" class="setup-panel">
        <div class="mode-switch" role="tablist" aria-label="计时模式">
          <button :class="{ active: mode === 'countdown' }" @click="setMode('countdown')">倒计时</button>
          <button :class="{ active: mode === 'alarm' }" @click="setMode('alarm')">闹钟</button>
        </div>
        <div v-if="mode === 'countdown'" class="duration-inputs">
          <label><input v-model.number="hours" type="number" min="0" max="99" inputmode="numeric" /><span>时</span></label>
          <label><input v-model.number="minutes" type="number" min="0" max="59" inputmode="numeric" /><span>分</span></label>
          <label><input v-model.number="seconds" type="number" min="0" max="59" inputmode="numeric" /><span>秒</span></label>
        </div>
        <label v-else class="alarm-input">
          <span>目标时间</span>
          <input v-model="alarmTime" type="time" step="1" />
        </label>
      </div>

      <div class="actions">
        <button v-if="!hasStarted" class="primary" @click="start">开始计时</button>
        <template v-else>
          <button v-if="running" class="primary" @click="pause">暂停</button>
          <button v-else class="primary" @click="resume">继续</button>
          <button class="secondary" @click="reset">重置</button>
        </template>
      </div>
      <button v-if="alarmRinging" class="stop-alarm" @click="stopAlarm">停止提醒</button>
      <p class="note">计时基于系统绝对时间，关闭页面后再次打开会自动恢复。</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

type TimerState = { mode: 'countdown' | 'alarm'; running: boolean; endAt: number | null; remainingMs: number; alarmTime: string };
const STORAGE_KEY = 'byteoj-precision-timer';
const mode = ref<'countdown' | 'alarm'>('countdown');
const hours = ref(0); const minutes = ref(5); const seconds = ref(0);
const alarmTime = ref('08:00:00');
const running = ref(false); const endAt = ref<number | null>(null); const remainingMs = ref(0);
const hasStarted = ref(false); const alarmRinging = ref(false); const now = ref(Date.now());
const timerPage = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);
const fullscreenFallback = ref(false);
let tickHandle: number | undefined;
let beepHandle: number | undefined;

const formattedTime = computed(() => {
  const total = Math.max(0, Math.ceil(remainingMs.value / 1000));
  const h = Math.floor(total / 3600); const m = Math.floor((total % 3600) / 60); const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});
const statusText = computed(() => alarmRinging.value ? '时间到' : running.value ? '正在计时' : hasStarted.value ? '已暂停' : '准备就绪');

function persist() { const state: TimerState = { mode: mode.value, running: running.value, endAt: endAt.value, remainingMs: remainingMs.value, alarmTime: alarmTime.value }; localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function update() {
  now.value = Date.now();
  if (!running.value || endAt.value === null) return;
  remainingMs.value = Math.max(0, endAt.value - now.value);
  if (remainingMs.value === 0) { running.value = false; alarmRinging.value = true; persist(); notify(); startAlarmSound(); }
}
function start() {
  let duration = 0;
  if (mode.value === 'countdown') duration = (Math.max(0, Number(hours.value)) * 3600 + Math.max(0, Number(minutes.value)) * 60 + Math.max(0, Number(seconds.value))) * 1000;
  else { const [h, m, s] = alarmTime.value.split(':').map(Number); const target = new Date(); target.setHours(h || 0, m || 0, s || 0, 0); if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1); duration = target.getTime() - Date.now(); }
  if (duration <= 0) return;
  remainingMs.value = duration; endAt.value = Date.now() + duration; running.value = true; hasStarted.value = true; alarmRinging.value = false; persist();
}
function pause() { update(); if (remainingMs.value > 0) { running.value = false; endAt.value = null; persist(); } }
function resume() { if (remainingMs.value > 0) { endAt.value = Date.now() + remainingMs.value; running.value = true; alarmRinging.value = false; persist(); } }
function reset() { running.value = false; hasStarted.value = false; endAt.value = null; remainingMs.value = 0; alarmRinging.value = false; localStorage.removeItem(STORAGE_KEY); }
function setMode(next: 'countdown' | 'alarm') { mode.value = next; }
function stopAlarm() { if (beepHandle) window.clearInterval(beepHandle); beepHandle = undefined; alarmRinging.value = false; reset(); }
function notify() { if ('Notification' in window && Notification.permission === 'granted') new Notification('计时结束', { body: '你的计时已经完成。' }); else if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); }
function playBeep() { const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext; if (!AudioContextClass) return; const ctx = new AudioContextClass(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.frequency.value = 880; gain.gain.value = 0.12; osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.45); }
function startAlarmSound() { if (beepHandle) window.clearInterval(beepHandle); playBeep(); beepHandle = window.setInterval(() => { if (!alarmRinging.value) { if (beepHandle) window.clearInterval(beepHandle); beepHandle = undefined; return; } playBeep(); }, 900); }
function syncFullscreenState() {
  const documentWithWebkit = document as Document & { webkitFullscreenElement?: Element | null };
  isFullscreen.value = Boolean(document.fullscreenElement || documentWithWebkit.webkitFullscreenElement || fullscreenFallback.value);
}
async function toggleFullscreen() {
  const element = timerPage.value as (HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
  }) | null;
  const documentWithWebkit = document as Document & {
    webkitFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void> | void;
  };
  if (!element) return;
  try {
    if (fullscreenFallback.value && !document.fullscreenElement && !documentWithWebkit.webkitFullscreenElement) {
      fullscreenFallback.value = false;
      syncFullscreenState();
      return;
    }
    if (document.fullscreenElement || documentWithWebkit.webkitFullscreenElement) {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (documentWithWebkit.webkitExitFullscreen) await documentWithWebkit.webkitExitFullscreen();
    } else if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen();
    } else {
      fullscreenFallback.value = !fullscreenFallback.value;
    }
  } catch {
    fullscreenFallback.value = !fullscreenFallback.value;
  }
  syncFullscreenState();
}
function handleFullscreenKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && fullscreenFallback.value) {
    fullscreenFallback.value = false;
    syncFullscreenState();
  }
}
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) { try { const state = JSON.parse(saved) as TimerState; mode.value = state.mode; alarmTime.value = state.alarmTime || alarmTime.value; remainingMs.value = state.remainingMs || 0; hasStarted.value = remainingMs.value > 0 || state.running; running.value = state.running; endAt.value = state.endAt; update(); } catch { localStorage.removeItem(STORAGE_KEY); } }
  document.addEventListener('fullscreenchange', syncFullscreenState);
  document.addEventListener('webkitfullscreenchange', syncFullscreenState as EventListener);
  document.addEventListener('keydown', handleFullscreenKeydown);
  tickHandle = window.setInterval(update, 200);
});
onBeforeUnmount(() => {
  if (tickHandle) window.clearInterval(tickHandle);
  if (beepHandle) window.clearInterval(beepHandle);
  document.removeEventListener('fullscreenchange', syncFullscreenState);
  document.removeEventListener('webkitfullscreenchange', syncFullscreenState as EventListener);
  document.removeEventListener('keydown', handleFullscreenKeydown);
});
</script>

<style scoped>
.timer-page { box-sizing: border-box; min-height: calc(100vh - 80px); display: grid; place-items: center; padding: 1rem clamp(1rem, 3vw, 3rem) 1.5rem; color: var(--fallback-bc, #1f2937); background: radial-gradient(circle at top, rgba(248,250,252,.96), rgba(241,245,249,.82)); }
.timer-page:fullscreen, .timer-page:-webkit-full-screen { min-height: 100vh; padding: clamp(1.5rem, 5vh, 4rem) clamp(1rem, 5vw, 5rem); background: #f1f5f9; }
.timer-page.is-fullscreen-fallback { position: fixed; inset: 0; z-index: 10000; box-sizing: border-box; min-height: 100vh; overflow: auto; padding: clamp(1.5rem, 5vh, 4rem) clamp(1rem, 5vw, 5rem); background: #f1f5f9; }
.timer-shell { width: min(100%, 1400px); box-sizing: border-box; text-align: center; background: rgba(255,255,255,.93); border: 1px solid rgba(148,163,184,.25); border-radius: 24px; padding: clamp(1.25rem, 2.5vw, 1.75rem); box-shadow: 0 24px 70px rgba(15,23,42,.1); }
.timer-shell.ringing { border-color: #ef4444; box-shadow: 0 0 0 5px rgba(239,68,68,.12); }
.timer-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 2rem; text-align: left; }
.eyebrow { color: #64748b; font-size: .92rem; letter-spacing: .14em; text-transform: uppercase; }
h1 { margin: .5rem 0 1rem; font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 650; }
.fullscreen-button { display: inline-flex; align-items: center; gap: .5rem; flex: 0 0 auto; border: 1px solid #cbd5e1; border-radius: 10px; padding: .7rem 1rem; color: #334155; background: #fff; font: inherit; cursor: pointer; transition: border-color .2s, background .2s, transform .2s; }
.fullscreen-button:hover { border-color: #94a3b8; background: #f8fafc; transform: translateY(-1px); }
.fullscreen-icon { font-size: 1.35rem; line-height: .8; }
.display { font-variant-numeric: tabular-nums; font-size: clamp(5rem, 14vw, 12rem); line-height: .95; letter-spacing: .015em; font-weight: 500; white-space: nowrap; max-width: 100%; overflow: hidden; }
.status { min-height: 1.5em; color: #64748b; margin: 1rem 0 1.75rem; font-size: 1.1rem; }
.setup-panel { margin: 0 auto 1.75rem; max-width: 620px; }
.mode-switch { display: grid; grid-template-columns: 1fr 1fr; padding: 4px; margin-bottom: 1.25rem; border-radius: 10px; background: #f1f5f9; }
.mode-switch button { border: 0; border-radius: 7px; padding: .85rem; background: transparent; cursor: pointer; color: #64748b; font: inherit; }
.mode-switch button.active { background: white; color: #0f172a; box-shadow: 0 1px 4px rgba(15,23,42,.1); }
.duration-inputs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.duration-inputs label { display: flex; align-items: center; gap: .35rem; color: #64748b; }
input { width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; padding: .9rem .5rem; text-align: center; font: inherit; background: white; }
.alarm-input { display: flex; align-items: center; justify-content: space-between; gap: 1rem; color: #64748b; }
.alarm-input input { width: auto; }
.actions { display: flex; justify-content: center; gap: .7rem; }
.actions button, .stop-alarm { border: 0; border-radius: 9px; padding: .9rem 1.8rem; font: inherit; cursor: pointer; }
.primary { background: #0f172a; color: white; }.secondary { background: #e2e8f0; color: #334155; }
.stop-alarm { margin-top: 1rem; background: #dc2626; color: white; }
.note { margin: 1.75rem 0 0; font-size: .85rem; color: #94a3b8; }
@media (max-height: 800px) and (min-width: 601px) { .timer-page { padding-top: .75rem; padding-bottom: 1rem; } .timer-shell { padding-top: 1rem; padding-bottom: 1rem; } .display { font-size: clamp(5rem, 11vw, 10rem); } .status { margin-bottom: 1rem; } .setup-panel { margin-bottom: 1rem; } .note { margin-top: 1rem; } }
@media (max-width: 600px) { .timer-header { align-items: flex-start; gap: 1rem; } .fullscreen-button span:last-child { display: none; } .alarm-input { flex-direction: column; align-items: stretch; } .display { font-size: clamp(4.2rem, 20vw, 7rem); } }
</style>
