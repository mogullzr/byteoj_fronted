<template>
  <main class="timer-page">
    <section class="timer-shell" :class="{ ringing: alarmRinging }">
      <div class="eyebrow">精确计时</div>
      <h1>{{ mode === 'countdown' ? '倒计时' : '闹钟' }}</h1>

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
onMounted(() => { const saved = localStorage.getItem(STORAGE_KEY); if (saved) { try { const state = JSON.parse(saved) as TimerState; mode.value = state.mode; alarmTime.value = state.alarmTime || alarmTime.value; remainingMs.value = state.remainingMs || 0; hasStarted.value = remainingMs.value > 0 || state.running; running.value = state.running; endAt.value = state.endAt; update(); } catch { localStorage.removeItem(STORAGE_KEY); } } tickHandle = window.setInterval(update, 200); });
onBeforeUnmount(() => { if (tickHandle) window.clearInterval(tickHandle); if (beepHandle) window.clearInterval(beepHandle); });
</script>

<style scoped>
.timer-page { min-height: calc(100vh - 150px); display: grid; place-items: center; padding: 3rem 1rem 5rem; color: var(--fallback-bc, #1f2937); }
.timer-shell { width: min(100%, 560px); text-align: center; background: rgba(255,255,255,.88); border: 1px solid rgba(148,163,184,.25); border-radius: 18px; padding: clamp(2rem, 6vw, 4rem); box-shadow: 0 18px 55px rgba(15,23,42,.08); }
.timer-shell.ringing { border-color: #ef4444; box-shadow: 0 0 0 5px rgba(239,68,68,.12); }
.eyebrow { color: #64748b; font-size: .78rem; letter-spacing: .14em; text-transform: uppercase; }
h1 { margin: .5rem 0 1.5rem; font-size: clamp(1.6rem, 5vw, 2.2rem); font-weight: 650; }
.display { font-variant-numeric: tabular-nums; font-size: clamp(3.6rem, 14vw, 6.5rem); line-height: 1; letter-spacing: .03em; font-weight: 500; }
.status { min-height: 1.5em; color: #64748b; margin: 1rem 0 2rem; }
.setup-panel { margin: 0 auto 1.75rem; max-width: 390px; }
.mode-switch { display: grid; grid-template-columns: 1fr 1fr; padding: 4px; margin-bottom: 1.25rem; border-radius: 10px; background: #f1f5f9; }
.mode-switch button { border: 0; border-radius: 7px; padding: .65rem; background: transparent; cursor: pointer; color: #64748b; }
.mode-switch button.active { background: white; color: #0f172a; box-shadow: 0 1px 4px rgba(15,23,42,.1); }
.duration-inputs { display: grid; grid-template-columns: repeat(3, 1fr); gap: .75rem; }
.duration-inputs label { display: flex; align-items: center; gap: .35rem; color: #64748b; }
input { width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; padding: .7rem .5rem; text-align: center; font: inherit; background: white; }
.alarm-input { display: flex; align-items: center; justify-content: space-between; gap: 1rem; color: #64748b; }
.alarm-input input { width: auto; }
.actions { display: flex; justify-content: center; gap: .7rem; }
.actions button, .stop-alarm { border: 0; border-radius: 9px; padding: .75rem 1.4rem; font: inherit; cursor: pointer; }
.primary { background: #0f172a; color: white; }.secondary { background: #e2e8f0; color: #334155; }
.stop-alarm { margin-top: 1rem; background: #dc2626; color: white; }
.note { margin: 2rem 0 0; font-size: .78rem; color: #94a3b8; }
@media (max-width: 420px) { .alarm-input { flex-direction: column; align-items: stretch; } }
</style>
