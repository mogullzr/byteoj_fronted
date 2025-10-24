<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import router from "@/router";
import { ProblemAlgorithmControllerService } from "../../../../generated";

const path = router.currentRoute.value.fullPath;
const competition_id: Ref<number> = ref(parseInt(path.split("/")[2]));
const problem_list: Ref<any> = ref([]);

onMounted(async () => {
  const res =
    await ProblemAlgorithmControllerService.competitionSearchProblemsUsingPost(
      competition_id.value
    );
  if (res.code === 0) {
    problem_list.value = res.data;
  } else {
    problem_list.value = undefined;
  }
});
</script>

<template>
  <div class="problem-list-container">
    <div v-if="problem_list != undefined" class="problem-table-container">
      <table class="problem-table">
        <thead>
          <tr class="table-header-row">
            <th class="table-header-cell problem-id">#</th>
            <th class="table-header-cell problem-name">题目</th>
            <th class="table-header-cell problem-stats">通过率</th>
            <th class="table-header-cell problem-status">状态</th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="problem-row group"
            v-for="(problem, index) in problem_list"
            :key="problem.problem_order"
            :class="{ 'bg-gray-50': index % 2 === 0 }"
          >
            <td class="table-cell problem-id">
              <span class="problem-index">{{ problem.index }}</span>
            </td>
            <td class="table-cell problem-name">
              <router-link
                :to="
                  '/competition/' + competition_id + '/problem/' + problem.index
                "
                class="problem-link"
              >
                <span class="problem-title">{{ problem.problem_name }}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="link-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </router-link>
            </td>
            <td class="table-cell problem-stats">
              <div class="progress-container">
                <div
                  class="progress-bar"
                  :style="{
                    width: `${(problem.ac_total / problem.test_total) * 100}%`,
                  }"
                ></div>
                <span class="progress-text">
                  {{ problem.ac_total }} / {{ problem.test_total }}
                </span>
              </div>
            </td>
            <td class="table-cell problem-status">
              <div
                v-if="problem.status == 0"
                class="status-badge status-accepted"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="status-icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>已通过</span>
              </div>
              <div v-else class="status-badge status-pending">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="status-icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>未通过</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="empty-state">
      <div class="empty-state-content">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="empty-state-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 class="empty-state-title">比赛尚未开始</h3>
        <p class="empty-state-description">
          比赛开始后题目会显示在这里 (〃'▽'〃)
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.problem-list-container {
  @apply rounded-xl bg-white shadow-md overflow-hidden;
  border: 1px solid #e2e8f0;
}

.problem-table-container {
  @apply overflow-x-auto;
}

.problem-table {
  @apply min-w-full divide-y divide-gray-200;
  font-size: 0.9375rem; /* 15px */
}

.table-header-row {
  @apply bg-gray-50;
}

.table-header-cell {
  @apply px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider;
}

.table-cell {
  @apply px-6 py-5 whitespace-nowrap;
}

.problem-row {
  @apply transition-all duration-150 ease-in-out hover:bg-blue-50;
}

.problem-id {
  @apply w-20 text-center;
}

.problem-index {
  @apply inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-800 font-medium text-sm;
}

.problem-name {
  @apply min-w-[320px];
}

.problem-link {
  @apply flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150 text-base;
}

.problem-title {
  @apply mr-3;
}

.link-icon {
  @apply h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150;
}

.progress-container {
  @apply relative w-full h-7 bg-gray-100 rounded-full overflow-hidden;
  min-width: 120px;
}

.progress-bar {
  @apply absolute inset-0 bg-green-500 bg-opacity-40;
  transition: width 0.6s ease;
}

.progress-text {
  @apply absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-800;
}

.status-badge {
  @apply inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium;
}

.status-icon {
  @apply h-3.5 w-3.5 mr-1.5;
}

.status-accepted {
  @apply bg-green-100 text-green-800;
}

.status-pending {
  @apply bg-red-100 text-red-800;
}

.empty-state {
  @apply p-16 text-center;
}

.empty-state-content {
  @apply max-w-md mx-auto;
}

.empty-state-icon {
  @apply mx-auto h-16 w-16 text-gray-400;
}

.empty-state-title {
  @apply mt-4 text-xl font-semibold text-gray-900;
}

.empty-state-description {
  @apply mt-2 text-gray-600 text-base;
}
</style>
