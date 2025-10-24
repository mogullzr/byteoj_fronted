<script setup lang="ts">
import { onMounted, Ref, ref, UnwrapRef, computed } from "vue";
import { useRouter } from "vue-router";
import {
  CompetitionControllerService,
  CompetitionInfoVo,
  ProblemAlgorithmControllerService,
  UserVo,
} from "../../../generated";
import UserStore from "@/store/user";
import user from "@/store/user";

const dayjs = require("dayjs");

const router = useRouter();
const useStore = UserStore();
const userInfo = useStore.loginUser;
const path = router.currentRoute.value.fullPath + "/";
const currentPage = ref(1);
const PageSum = ref<number>(1);
const competition_list = ref<CompetitionInfoVo[]>([]);
const checked = ref<number>(0);
// 排行榜前十名用户
const user_top = ref<UserVo[]>([]);
// 各个分数对应颜色
const rated_color_list: UnwrapRef<string[]> = useStore.rated_color_list;
// 最后一次题目
const last_problem = ref<any>({});

// UI state
const isModalOpen = ref(false);
const loading = ref(true);

const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value;
  console.log("Modal toggled:", isModalOpen.value);
};

// Format date helper
const formatDate = (date: string | undefined) => {
  return date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "-";
};

// Page status helpers
const getStatusBadge = (status: number | undefined) => {
  switch (status) {
    case 0:
      return { text: "已报名", class: "badge-blue" };
    case 1:
      return { text: "报名", class: "badge-green" };
    case 2:
    case 3:
      return { text: "进行中", class: "badge-yellow" };
    case 4:
      return { text: "已结束", class: "badge-gray" };
    default:
      return { text: "未知", class: "badge-gray" };
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    const [res1, res2, res3] = await Promise.all([
      CompetitionControllerService.competitionSearchByPageUsingPost(
          currentPage.value
      ),
      CompetitionControllerService.competitionSearchRankTop10UsingPost(),
      ProblemAlgorithmControllerService.problemAlgorithmUserLastUsingGet(),
    ]);

    if (res1.code === 0) {
      competition_list.value = res1.data;
      PageSum.value = res1.data?.[0]?.page_Sum || 1;
    } else if (res1.code === 40101) {
      router.replace("/404");
    }

    if (res2.code === 0) {
      user_top.value = res2.data;
    }

    if (res3.code === 0) {
      last_problem.value = res3.data;
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const PageClick = async (Page: number) => {
  if (!PageSum.value || Page <= 0 || Page > PageSum.value) {
    return;
  }
  loading.value = true;
  const res =
      await CompetitionControllerService.competitionSearchByPageUsingPost(Page);

  if (res.code === 0) {
    competition_list.value = res.data;
    currentPage.value = Page;
    window.scrollTo(0, 0);
  } else {
    console.log(res.message);
  }
  loading.value = false;
};

// 确定当前选中的比赛创建类型
const checkCompetition = (num: number) => {
  checked.value = num;
  // Directly navigate to the competition creation page when a type is selected
  if (num > 0) {
    router.push(`/competition/user/add/${num}/info`);
    toggleModal(); // Close the modal after navigation
  }
};

// Calculate page navigation
const paginationArray = computed(() => {
  if (!PageSum.value) return [];

  const total = PageSum.value;
  const current = currentPage.value;
  const delta = 2;
  const left = current - delta;
  const right = current + delta;
  const range = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number | undefined;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= left && i <= right)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
});
</script>

<template>
  <div class="page-background">
    <div class="content-container">
      <!-- Main Content Area -->
      <main class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left Section -->
        <div class="lg:col-span-8">
          <header class="page-header">
            <h1 class="header-title">竞赛中心</h1>
            <router-link
                to="/competition/user/add/1/info"
                class="btn btn-primary"
                v-if="userInfo.role === 2"
            >
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
              >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              创建比赛
            </router-link>
          </header>

          <!-- Competition List -->
          <div v-if="loading" class="space-y-4">
            <div
                v-for="i in 5"
                :key="i"
                class="competition-card skeleton-card"
            ></div>
          </div>
          <div v-else class="space-y-4">
            <article
                v-for="competition in competition_list"
                :key="competition.competition_id"
                class="competition-card"
            >
              <router-link
                  :to="path + competition.competition_id"
                  class="card-link"
              >
                <div class="card-avatar">
                  <img
                      @dragstart.prevent
                      :src="competition.avatar"
                      alt="Competition Avatar"
                  />
                </div>
                <div class="card-details">
                  <h2 class="card-title">{{ competition.competition_name }}</h2>
                  <div class="card-info">
                    <span>
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                      >
                        <path
                            fill-rule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clip-rule="evenodd"
                        />
                      </svg>
                      {{ competition.username }}
                    </span>
                    <span>
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                      >
                        <path
                            d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
                        />
                      </svg>
                      {{ competition.joins }} 人参与
                    </span>
                  </div>
                  <div class="card-time">
                    <span>{{ formatDate(competition.start_time) }}</span>
                    <span>-</span>
                    <span>{{ formatDate(competition.end_time) }}</span>
                  </div>
                </div>
                <div class="card-status">
                  <span
                      class="badge"
                      :class="getStatusBadge(competition.user_status).class"
                  >
                    {{ getStatusBadge(competition.user_status).text }}
                  </span>
                </div>
              </router-link>
            </article>
          </div>

          <!-- Pagination -->
          <nav class="pagination" v-if="PageSum && PageSum > 1">
            <button
                @click="PageClick(currentPage - 1)"
                class="page-button"
                :disabled="currentPage <= 1"
            >
              &lt;
            </button>
            <button
                v-for="(page, index) in paginationArray"
                :key="index"
                @click="page !== '...' ? PageClick(Number(page)) : null"
                class="page-button"
                :class="{ active: page === currentPage, dots: page === '...' }"
                :disabled="page === '...'"
            >
              {{ page }}
            </button>
            <button
                @click="PageClick(currentPage + 1)"
                class="page-button"
                :disabled="currentPage >= (PageSum || 1)"
            >
              &gt;
            </button>
          </nav>
        </div>

        <!-- Right Sidebar -->
        <aside class="lg:col-span-4 space-y-8">
          <div class="sidebar-card">
            <h3 class="sidebar-header">你的最近题目</h3>
            <div class="sidebar-content">
              <p class="font-semibold line-clamp-2 problem-title-display">
                {{ last_problem.problem_name || "暂无记录" }}
              </p>
              <router-link
                  class="btn btn-secondary w-full mt-4"
                  :to="last_problem.problem_url || '/problems'"
              >
                继续刷题
              </router-link>
            </div>
          </div>

          <div class="sidebar-card">
            <h3 class="sidebar-header">巅峰 Rating 排行榜</h3>
            <div class="sidebar-content">
              <ul class="space-y-3">
                <li
                    v-for="(user, index) in user_top"
                    :key="index"
                    class="leaderboard-item"
                >
                  <div class="flex items-center">
                    <span
                        class="leaderboard-rank"
                        :class="{ 'top-3': index < 3 }"
                    >{{ index + 1 }}</span
                    >
                    <span
                        class="font-bold"
                        :style="
                        user.rated !== undefined && rated_color_list
                          ? `color:${rated_color_list[user.rated]}`
                          : ''
                      "
                    >
                      {{ user.username }}
                    </span>
                  </div>
                  <span
                      class="font-bold"
                      :style="
                      user.rated !== undefined && rated_color_list
                        ? `color:${rated_color_list[user.rated]}`
                        : ''
                    "
                  >
                    {{ user.rating }}
                  </span>
                </li>
              </ul>
              <button
                  @click="router.replace('/competition/rank')"
                  class="btn btn-secondary w-full mt-6"
              >
                查看完整榜单
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>

    <!-- Create Competition Modal -->
    <div v-if="isModalOpen" class="modal-backdrop" @click.self="toggleModal">
      <div class="modal" @click.stop>
        <header class="modal-header">
          <h3>创建新比赛</h3>
          <button @click="toggleModal" class="modal-close">
            <svg
                class="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
              <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </header>
        <div class="modal-body">
          <div
              v-for="type in [1, 2, 3]"
              :key="type"
              class="modal-option"
              :class="{ active: checked === type }"
              @click="checkCompetition(type)"
          >
            <div class="flex-grow">
              <h4 class="font-bold">
                {{
                  {
                    1: "个人编程创建赛",
                    2: "个人数学创建赛",
                    3: "个人408创建赛",
                  }[type]
                }}
              </h4>
              <p class="text-sm">支持公共题库，仅支持OI赛制</p>
            </div>
            <div class="radio">
              <div class="radio-dot"></div>
            </div>
          </div>
        </div>
        <footer class="modal-footer">
          <button @click="toggleModal" class="btn btn-ghost">取消</button>
          <button disabled class="btn btn-primary">请选择比赛类型</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* General Page Styling */
.page-background {
  background-color: transparent; /* Allows website background image to show */
  min-height: 100vh;
}

.content-container {
  max-width: 1280px;
  margin: 0 auto;
  position: relative;
  z-index: 1;

  /* Solid white background */
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  border: 1px solid #e5e7eb;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.header-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #111827;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}
.btn-primary {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}
.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}
.btn-primary:disabled {
  background-color: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
}
.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
  border-color: #d1d5db;
}
.btn-secondary:hover {
  background-color: #d1d5db;
}
.btn-ghost {
  background-color: transparent;
  color: #6b7280;
}
.btn-ghost:hover {
  background-color: #f3f4f6;
}

/* Competition Card */
.competition-card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}
.competition-card:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  transform: translateY(-2px);
  border-color: #3b82f6;
}
.card-link {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  gap: 1.5rem;
  color: inherit;
  text-decoration: none;
}
.card-avatar {
  flex-shrink: 0;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  overflow: hidden;
}
.card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-details {
  flex-grow: 1;
}
.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}
.card-info {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}
.card-info span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.card-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4b5563;
}
.card-status {
  flex-shrink: 0;
}
.badge {
  padding: 0.6rem 1.2rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-transform: uppercase;
  min-width: 80px;
  text-align: center;
}
.badge-blue {
  background-color: #dbeafe;
  color: #1e40af;
}
.badge-green {
  background-color: #d1fae5;
  color: #065f46;
}
.badge-yellow {
  background-color: #fef3c7;
  color: #92400e;
}
.badge-gray {
  background-color: #e5e7eb;
  color: #4b5563;
}

.skeleton-card {
  height: 124px;
  background-color: #e5e7eb;
  border-radius: 0.75rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}
.page-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  margin: 0 0.25rem;
  border-radius: 0.5rem;
  background-color: white;
  color: #6b7280;
  font-weight: 600;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
}
.page-button:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
}
.page-button.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}
.page-button:disabled:not(.dots) {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-button.dots {
  border-color: transparent;
  background-color: transparent;
  cursor: default;
}

/* Sidebar */
.sidebar-card {
  background-color: #f9fafb; /* Slightly off-white for contrast */
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}
.sidebar-header {
  padding: 1rem 1.5rem;
  font-weight: 600;
  font-size: 1.25rem;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
}
.sidebar-content {
  padding: 1.5rem;
}
.sidebar-content .problem-title-display {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #374151;
  min-height: 64px;
}
.leaderboard-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
}
.leaderboard-rank {
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
  margin-right: 0.75rem;
  background-color: #f3f4f6;
  color: #4b5563;
}
.leaderboard-rank.top-3 {
  background-color: #f59e0b;
  color: white;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal {
  background-color: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  position: relative;
  z-index: 10000;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}
.modal-close {
  color: #9ca3af;
  transition: color 0.2s;
}
.modal-close:hover {
  color: #1f2937;
}
.modal-body {
  padding: 1.5rem;
}
.modal-option {
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}
.modal-option h4 {
  font-size: 1.05rem;
}
.modal-option p {
  font-size: 0.9rem;
  color: #6b7280;
}
.modal-option:hover {
  border-color: #3b82f6;
}
.modal-option.active {
  border-color: #3b82f6;
  background-color: #eff6ff;
}
.radio {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  margin-left: 1rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-option.active .radio {
  border-color: #3b82f6;
}
.radio-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: #3b82f6;
  transform: scale(0);
  transition: transform 0.2s ease;
}
.modal-option.active .radio-dot {
  transform: scale(1);
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}
</style>