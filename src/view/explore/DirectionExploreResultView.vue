<template>
  <main class="result-page">
    <router-link class="back-link" to="/explore">← 返回方向地图</router-link>
    <section class="result-shell">
      <header class="result-header">
        <div>
          <span class="eyebrow">BYTEOJ · 本地记录</span>
          <h1>你的体验记录</h1>
          <p>记录保存在当前浏览器，不包含账号信息，也不会用于职业判断。</p>
        </div>
        <button
          v-if="records.length"
          class="clear-button"
          type="button"
          @click="clearRecords"
        >
          清除本地记录
        </button>
      </header>

      <div v-if="records.length" class="record-list">
        <article
          v-for="record in sortedRecords"
          :key="`${record.taskId}-${record.startedAt}`"
          class="record-card"
        >
          <div class="record-icon">
            {{ directionNames[record.directionId] ? "✦" : "•" }}
          </div>
          <div class="record-main">
            <div class="record-title-row">
              <h2>{{ taskNames[record.taskId] || "方向体验" }}</h2>
              <span class="record-status">{{
                record.completed ? "已完成" : "进行中"
              }}</span>
            </div>
            <p>
              {{ directionNames[record.directionId] || "方向" }} ·
              {{ formatDate(record.completedAt || record.startedAt) }}
            </p>
            <div class="record-meta">
              <span>用时 {{ formatDuration(recordDuration(record)) }}</span
              ><span>重试 {{ record.retryCount }} 次</span
              ><span v-if="record.selfAssessment"
                >自评：{{ record.selfAssessment }}</span
              >
            </div>
            <div
              v-if="
                record.completed &&
                record.retryCount > 0 &&
                record.selfAssessment === '愿意继续尝试'
              "
              class="interest-note"
            >
              有兴趣但需要基础：这次遇到了一些难点，不过你仍愿意继续试试。
            </div>
          </div>
          <router-link
            v-if="record.completed"
            class="resume-link"
            :to="`/explore/task/${record.taskId}?restart=1`"
            >再次体验 →</router-link
          >
          <router-link
            v-if="!record.completed"
            class="resume-link"
            :to="`/explore/task/${record.taskId}`"
            >继续体验 →</router-link
          >
        </article>
      </div>
      <div v-else class="empty-records">
        <span class="empty-mark">◌</span>
        <h2>还没有体验记录</h2>
        <p>选一个感兴趣的方向，先完成一个几分钟的小任务。</p>
        <router-link class="start-link" to="/explore">浏览方向地图</router-link>
      </div>

      <aside v-if="records.length" class="result-advice">
        <strong>接下来可以怎么做</strong>
        <p>
          完成情况和重试次数只描述这次体验，不代表能力高低。你可以再体验其他方向，或去题库做一道基础练习。
        </p>
        <div>
          <router-link to="/explore">尝试其他方向</router-link
          ><router-link to="/problems">进入基础练习</router-link>
        </div>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { directions, experienceTasks } from "@/data/directionExplore";
import { ExperienceRecord } from "@/types/directionExplore";
import {
  clearDirectionExploreState,
  loadDirectionExploreState,
} from "@/utils/directionExploreStorage";

const records = ref<ExperienceRecord[]>(loadDirectionExploreState().records);
const sortedRecords = computed(() =>
  [...records.value].sort((a, b) => b.startedAt - a.startedAt)
);
const directionNames = Object.fromEntries(
  directions.map((direction) => [direction.id, direction.name])
);
const taskNames = Object.fromEntries(
  experienceTasks.map((task) => [task.id, task.title])
);

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} 秒`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `${minutes} 分 ${remainder} 秒` : `${minutes} 分钟`;
}

function recordDuration(record: ExperienceRecord): number {
  return record.completedAt
    ? record.durationSeconds
    : Math.max(
        record.durationSeconds,
        Math.round((Date.now() - record.startedAt) / 1000)
      );
}

function clearRecords(): void {
  if (!window.confirm("确定清除这台设备上的方向探索进度和记录吗？")) return;
  clearDirectionExploreState();
  records.value = [];
}
</script>

<style scoped>
.result-page {
  max-width: 980px;
  margin: 0 auto;
  padding: 30px 20px 72px;
  color: #18233b;
}
.back-link {
  display: inline-block;
  margin-bottom: 15px;
  color: #577187;
  font-size: 14px;
  text-decoration: none;
}
.result-shell {
  padding: clamp(22px, 5vw, 42px);
  border: 1px solid #e4eaf0;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 18px 55px rgba(24, 48, 78, 0.08);
}
.result-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}
.eyebrow {
  color: #32827f;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.result-header h1 {
  margin: 9px 0 8px;
  font-size: clamp(28px, 4vw, 38px);
  letter-spacing: -0.04em;
}
.result-header p,
.record-main > p {
  margin: 0;
  color: #758398;
  font-size: 14px;
  line-height: 1.7;
}
.clear-button {
  border: 0;
  color: #8b5f58;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
}
.record-list {
  display: grid;
  gap: 12px;
  margin-top: 30px;
}
.record-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 17px;
  border: 1px solid #e7edf1;
  border-radius: 15px;
}
.record-icon {
  display: grid;
  width: 43px;
  height: 43px;
  flex: 0 0 43px;
  place-items: center;
  border-radius: 13px;
  color: #267d7b;
  background: #eaf7f5;
  font-size: 20px;
}
.record-main {
  min-width: 0;
  flex: 1;
}
.record-title-row {
  display: flex;
  align-items: center;
  gap: 9px;
}
.record-title-row h2 {
  overflow: hidden;
  margin: 0;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.record-status {
  flex: 0 0 auto;
  padding: 4px 8px;
  border-radius: 999px;
  color: #287568;
  background: #eaf7f2;
  font-size: 11px;
  font-weight: 700;
}
.record-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
  margin-top: 9px;
  color: #65758a;
  font-size: 12px;
}
.interest-note {
  margin-top: 10px;
  color: #31766f;
  font-size: 12px;
  line-height: 1.5;
}
.resume-link {
  flex: 0 0 auto;
  color: #267d7b;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
}
.empty-records {
  padding: 70px 15px 55px;
  text-align: center;
}
.empty-mark {
  color: #8fc4bf;
  font-size: 44px;
}
.empty-records h2 {
  margin: 12px 0 7px;
  font-size: 22px;
}
.empty-records p {
  margin: 0 0 17px;
  color: #7b899a;
}
.start-link {
  color: #267d7b;
  font-weight: 800;
  text-decoration: none;
}
.result-advice {
  margin-top: 22px;
  padding: 18px;
  border: 1px solid #dcebea;
  border-radius: 15px;
  background: #f4faf9;
}
.result-advice strong {
  color: #2a696e;
}
.result-advice p {
  margin: 8px 0 13px;
  color: #627880;
  font-size: 13px;
  line-height: 1.7;
}
.result-advice div {
  display: flex;
  gap: 15px;
  font-size: 13px;
}
.result-advice a {
  color: #267d7b;
  font-weight: 800;
  text-decoration: none;
}
@media (max-width: 620px) {
  .result-page {
    padding: 18px 13px 48px;
  }
  .result-header {
    flex-direction: column;
  }
  .clear-button {
    align-self: flex-end;
  }
  .record-card {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .resume-link {
    margin-left: 57px;
  }
}
</style>
