<template>
  <main class="explore-page">
    <section class="explore-hero">
      <span class="eyebrow">BYTEOJ · 方向探索</span>
      <h1>先体验，再决定想不想继续</h1>
      <p>
        用几分钟试一试不同的计算机方向。不需要安装工具，也没有标准的职业答案。
      </p>
      <div class="hero-actions">
        <router-link
          v-if="resumeTask"
          class="button button-primary"
          :to="`/explore/task/${resumeTask}`"
          >{{ resumeLabel }}</router-link
        >
        <router-link class="button button-secondary" to="/explore/result"
          >查看我的体验记录</router-link
        >
      </div>
    </section>

    <section class="direction-section">
      <div class="section-heading">
        <div>
          <span class="eyebrow">从感兴趣的方向开始</span>
          <h2>计算机方向地图</h2>
        </div>
        <span class="section-note">每次体验约 3–10 分钟</span>
      </div>

      <div class="direction-grid">
        <article
          v-for="direction in directions"
          :key="direction.id"
          class="direction-card"
          :class="`status-${direction.status}`"
        >
          <div class="card-topline">
            <span class="direction-symbol" aria-hidden="true">{{
              symbols[direction.id] || "✦"
            }}</span>
            <span class="status-badge">{{
              statusLabel(direction.status)
            }}</span>
          </div>
          <h3>{{ direction.name }}</h3>
          <p>{{ direction.summary }}</p>
          <div class="card-footer">
            <span>约 {{ direction.estimatedMinutes }} 分钟</span>
            <router-link
              v-if="direction.taskId"
              class="card-link"
              :to="`/explore/task/${direction.taskId}?restart=1`"
              >开始样例体验 <span aria-hidden="true">→</span></router-link
            >
            <span
              v-else-if="direction.status === 'available'"
              class="coming-note"
              >体验任务准备中</span
            >
            <span v-else class="coming-note">内容规划中</span>
          </div>
        </article>
      </div>
    </section>

    <aside class="explore-note">
      <span class="note-icon" aria-hidden="true">i</span>
      <p>
        这些小任务只帮助你了解方向的工作方式，不会判断你“适不适合”某个职业。觉得困难但仍想再试，也是一种有价值的反馈。
      </p>
    </aside>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { directions, experienceTasks } from "@/data/directionExplore";
import { loadDirectionExploreState } from "@/utils/directionExploreStorage";
import { DirectionStatus } from "@/types/directionExplore";

const symbols: Record<string, string> = {
  frontend: "◩",
  algorithm: "⌘",
  "data-analysis": "▥",
  "software-testing": "✓",
  backend: "↔",
  database: "▤",
  security: "◇",
  embedded: "⌁",
  mobile: "▣",
  game: "△",
  "cloud-devops": "☁",
};

const resumeTask = computed(() => {
  const state = loadDirectionExploreState();
  const active = state.activeExperience || state.completedExperience;
  return active && experienceTasks.some((task) => task.id === active.taskId)
    ? active.taskId
    : "";
});
const resumeLabel = computed(() =>
  loadDirectionExploreState().activeExperience ? "继续上次体验" : "回看上次体验"
);

function statusLabel(status: DirectionStatus): string {
  if (status === "available") return "首批方向";
  if (status === "disabled") return "暂不可用";
  return "规划中";
}
</script>

<style scoped>
.explore-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 34px 22px 72px;
  color: #18233b;
}
.explore-hero {
  padding: clamp(28px, 6vw, 64px);
  border-radius: 28px;
  color: #fff;
  background: radial-gradient(
      circle at 86% 20%,
      rgba(116, 166, 255, 0.38),
      transparent 30%
    ),
    linear-gradient(125deg, #182b55 0%, #244b83 58%, #267d91 100%);
  box-shadow: 0 22px 60px rgba(30, 67, 112, 0.18);
}
.eyebrow {
  display: inline-block;
  color: #71d8d3;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.explore-hero h1 {
  max-width: 720px;
  margin: 14px 0 12px;
  font-size: clamp(30px, 5vw, 52px);
  line-height: 1.12;
  letter-spacing: -0.04em;
}
.explore-hero p {
  max-width: 620px;
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 16px;
  line-height: 1.8;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}
.button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.18s ease, background 0.18s ease;
}
.button:hover {
  transform: translateY(-2px);
}
.button-primary {
  color: #17365f;
  background: #fff;
}
.button-secondary {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.38);
  background: rgba(255, 255, 255, 0.08);
}
.direction-section {
  margin-top: 48px;
}
.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.section-heading .eyebrow {
  color: #337b8b;
}
.section-heading h2 {
  margin: 7px 0 0;
  font-size: clamp(24px, 3vw, 32px);
  letter-spacing: -0.03em;
}
.section-note {
  color: #738096;
  font-size: 13px;
}
.direction-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.direction-card {
  display: flex;
  min-height: 210px;
  flex-direction: column;
  padding: 21px;
  border: 1px solid #e3eaf1;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(20, 45, 75, 0.045);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.direction-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 34px rgba(20, 45, 75, 0.09);
}
.card-topline,
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.direction-symbol {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 13px;
  color: #176877;
  background: #e8f7f5;
  font-size: 23px;
  font-weight: 800;
}
.status-badge {
  padding: 5px 9px;
  border-radius: 999px;
  color: #20766d;
  background: #eaf7f3;
  font-size: 11px;
  font-weight: 700;
}
.direction-card h3 {
  margin: 18px 0 7px;
  font-size: 19px;
}
.direction-card p {
  flex: 1;
  margin: 0 0 19px;
  color: #68768b;
  font-size: 14px;
  line-height: 1.65;
}
.card-footer {
  padding-top: 13px;
  border-top: 1px solid #edf1f5;
  color: #8290a2;
  font-size: 12px;
}
.card-link {
  color: #176c7b;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
}
.card-link span {
  padding-left: 3px;
}
.coming-note {
  color: #a0a9b7;
  font-size: 12px;
}
.status-planned {
  background: #fbfcfd;
}
.status-planned .direction-symbol {
  color: #78879b;
  background: #eff2f6;
}
.status-planned .status-badge {
  color: #78879b;
  background: #eff2f6;
}
.explore-note {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding: 16px 18px;
  border: 1px solid #dcebea;
  border-radius: 15px;
  background: #f3faf9;
}
.note-icon {
  display: grid;
  width: 23px;
  height: 23px;
  flex: 0 0 23px;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: #398b88;
  font-size: 13px;
  font-weight: 800;
}
.explore-note p {
  margin: 0;
  color: #526b72;
  font-size: 13px;
  line-height: 1.7;
}
@media (max-width: 820px) {
  .direction-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 560px) {
  .explore-page {
    padding: 20px 14px 48px;
  }
  .explore-hero {
    border-radius: 21px;
  }
  .explore-hero p {
    font-size: 14px;
  }
  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .direction-grid {
    grid-template-columns: 1fr;
  }
  .direction-card {
    min-height: 188px;
  }
}
</style>
