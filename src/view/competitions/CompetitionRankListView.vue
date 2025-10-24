<template>
  <div class="page-background">
    <!-- Decorative elements for background -->
    <div class="decorative-circles">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="circle circle-4"></div>
      <div class="circle circle-5"></div>
    </div>

    <!-- Side decorations -->
    <div class="side-decoration left-decoration">
      <div class="trophy-icon">🏆</div>
      <div class="decoration-line"></div>
      <div class="medal-icon">🥇</div>
      <div class="decoration-line"></div>
      <div class="medal-icon">🥈</div>
      <div class="decoration-line"></div>
      <div class="medal-icon">🥉</div>
    </div>

    <div class="side-decoration right-decoration">
      <div class="code-icon">👨‍💻</div>
      <div class="decoration-line"></div>
      <div class="star-icon">⭐</div>
      <div class="decoration-line"></div>
      <div class="fire-icon">🔥</div>
      <div class="decoration-line"></div>
      <div class="rocket-icon">🚀</div>
    </div>

    <div class="ranking-container rounded-2xl">
      <div class="header">
        <div class="text-4xl font-bold text-center my-10">
          <span class="title-gradient">ByteOJ巅峰Rating排行榜</span>
          <div class="title-underline"></div>
        </div>
        <div class="controls">
          <div class="search-box">
            <input
              v-model="searchRequest.keyword"
              type="text"
              placeholder="搜索名称或学校..."
              class="search-input"
              @keyup.enter="handleSearchInput"
            />
            <span class="search-icon">🔍</span>
          </div>

          <!--        <div class="tabs">-->
          <!--          <button-->
          <!--            v-for="tab in tabs"-->
          <!--            :key="tab.uuid"-->
          <!--            :class="['tab-button', { active: activeTab === tab.uuid }]"-->
          <!--            @click="handleTabChange(tab.uuid)"-->
          <!--          >-->
          <!--            {{ tab.label }}-->
          <!--          </button>-->
          <!--        </div>-->
        </div>
      </div>

      <!-- Top 3 Centered Layout -->
      <div
        v-if="currentPage === 1 && rankingData.length >= 3"
        class="top-three-layout"
      >
        <div class="winner-triangle">
          <!-- Central point -->
          <div class="center-point"></div>

          <!-- Second Place (Silver) -->
          <div class="winner second-place">
            <div class="medal silver">2</div>
            <div class="winner-avatar">
              <img
                :src="rankingData[1].avatar"
                :alt="rankingData[1].username"
                class="avatar-img"
              />
            </div>
            <div class="winner-info">
              <div class="winner-name">{{ rankingData[1].username }}</div>
              <div class="winner-school">{{ rankingData[1].school }}</div>
              <div class="winner-rating">{{ rankingData[1].rating }} 分</div>
            </div>
          </div>

          <!-- First Place (Gold) -->
          <div class="winner first-place">
            <div class="crown">👑</div>
            <div class="medal gold">1</div>
            <div class="winner-avatar">
              <img
                :src="rankingData[0].avatar"
                :alt="rankingData[0].username"
                class="avatar-img"
              />
            </div>
            <div class="winner-info">
              <div class="winner-name">{{ rankingData[0].username }}</div>
              <div class="winner-school">{{ rankingData[0].school }}</div>
              <div class="winner-rating">{{ rankingData[0].rating }} 分</div>
            </div>
          </div>

          <!-- Third Place (Bronze) -->
          <div class="winner third-place">
            <div class="medal bronze">3</div>
            <div class="winner-avatar">
              <img
                :src="rankingData[2].avatar"
                :alt="rankingData[2].username"
                class="avatar-img"
              />
            </div>
            <div class="winner-info">
              <div class="winner-name">{{ rankingData[2].username }}</div>
              <div class="winner-school">{{ rankingData[2].school }}</div>
              <div class="winner-rating">{{ rankingData[2].rating }} 分</div>
            </div>
          </div>
        </div>
      </div>

      <div class="ranking-table">
        <div class="table-header">
          <div class="header-cell rank">排名</div>
          <div class="header-cell name">名称</div>
          <div class="header-cell school">学校</div>
          <div class="header-cell rating">巅峰分数</div>
          <div class="header-cell actions">操作</div>
        </div>

        <template v-if="loading">
          <div v-for="i in 5" :key="i" class="table-row skeleton-row">
            <div class="cell rank"><div class="skeleton"></div></div>
            <div class="cell name"><div class="skeleton"></div></div>
            <div class="cell school"><div class="skeleton"></div></div>
            <div class="cell rating"><div class="skeleton"></div></div>
            <div class="cell actions"><div class="skeleton"></div></div>
          </div>
        </template>
        <template v-else>
          <div
            v-for="(item, index) in tableData"
            :key="item.uuid"
            class="table-row"
          >
            <div class="cell rank">
              <span class="rank-number">
                {{ getDisplayRank(index) }}
              </span>
            </div>
            <div class="cell name">
              <div class="user-info">
                <img :src="item.avatar" :alt="item.username" class="avatar" />
                <div>
                  <div class="user-name">{{ item.username }}</div>
                </div>
              </div>
            </div>
            <div class="cell school">{{ item.school }}</div>
            <div class="cell rating">
              <span class="rating-value">{{ item.rating }}</span>
              <span class="rating-unit">分</span>
            </div>
            <div class="cell actions">
              <button
                class="detail-button"
                @click="router.push(`/user/space/${item.uuid}`)"
              >
                查看详情
              </button>
            </div>
          </div>
        </template>
      </div>

      <div class="pagination">
        <button
          class="page-button"
          :disabled="currentPage === 1"
          @click="handlePageChange(currentPage - 1)"
        >
          &lt;
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          :class="['page-button', { active: currentPage === page }]"
          @click="handlePageChange(page)"
        >
          {{ page }}
        </button>
        <button
          class="page-button"
          :disabled="currentPage === totalPages"
          @click="handlePageChange(currentPage + 1)"
        >
          &gt;
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import {
  SearchControllerService,
  type SearchRequest,
} from "../../../generated";
import { useRouter } from "vue-router";

interface RankingItem {
  uuid: number;
  username: string;
  school: string;
  rating: number;
  avatar: string;
}

// 响应式数据
const searchRequest = ref<SearchRequest>({
  category: "competition_user",
  keyword: "",
  pageNum: 1,
  pageSize: 10,
});
const rankingData = ref<RankingItem[]>([]);
const activeTab = ref("all");
const currentPage = ref(1);
const itemsPerPage = 10;
const totalPages = ref(1);
const loading = ref(false);
const router = useRouter();
let searchTimer: ReturnType<typeof setTimeout> | null = null; // 用于防抖的定时器

// 处理表格数据，当在第一页时去掉前三名
const tableData = computed(() => {
  if (currentPage.value === 1 && rankingData.value.length >= 3) {
    return rankingData.value.slice(3);
  }
  return rankingData.value;
});

// 获取显示的排名
const getDisplayRank = (index: number) => {
  if (currentPage.value === 1) {
    return index + 4; // 从第4名开始显示
  } else {
    return (currentPage.value - 1) * itemsPerPage + index + 1;
  }
};

// 在组件卸载时清除定时器
onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
});
// 标签页
const tabs = [
  { uuid: "all", label: "全部" },
  { uuid: "university", label: "大学生" },
  { uuid: "highschool", label: "中学生" },
];

// 计算可见页码
const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// 获取排行榜数据
const fetchRankingData = async () => {
  try {
    loading.value = true;
    const res = await SearchControllerService.searchAllUsingPost(
      searchRequest.value
    );
    if (res.code === 0 && res.data) {
      rankingData.value = res.data.dataList || [];
      totalPages.value = res.data.dataList[0].pages || 1;
      // 确保当前页码不超过总页数
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value;
        searchRequest.value.pageNum = currentPage.value;
      }
    }
  } catch (error) {
    console.error("获取排行榜数据失败:", error);
  } finally {
    loading.value = false;
  }
};

// 搜索输入防抖处理
const handleSearchInput = async () => {
  // 清除之前的定时器
  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  // 设置新的定时器，延迟300ms执行搜索
  searchTimer = setTimeout(async () => {
    currentPage.value = 1;
    searchRequest.value.pageNum = 1;
    await fetchRankingData();
  }, 300);
};

// 标签切换
const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
  currentPage.value = 1;
  searchRequest.value.pageNum = 1;
  // 这里可以根据实际需求添加分类筛选条件
  fetchRankingData();
};

// 页码变化
const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  searchRequest.value.pageNum = page;
  fetchRankingData();
};

// 监听页码变化
watch(
  () => currentPage.value,
  (newPage) => {
    searchRequest.value.pageNum = newPage;
  }
);

// 初始化加载数据
onMounted(async () => {
  await fetchRankingData();
});
</script>

<style scoped>
.page-background {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  position: relative;
  overflow: hidden;
  background-image: radial-gradient(
      circle at 25% 25%,
      rgba(59, 130, 246, 0.03) 1px,
      transparent 1px
    ),
    radial-gradient(
      circle at 75% 75%,
      rgba(79, 70, 229, 0.03) 1px,
      transparent 1px
    );
  background-size: 40px 40px;
}

/* Decorative circles in background */
.decorative-circles .circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(
    circle,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(59, 130, 246, 0) 70%
  );
  top: 10%;
  left: -100px;
  animation: float-slow 15s infinite alternate;
}

.circle-2 {
  width: 200px;
  height: 200px;
  background: radial-gradient(
    circle,
    rgba(249, 115, 22, 0.1) 0%,
    rgba(249, 115, 22, 0) 70%
  );
  bottom: 15%;
  right: -50px;
  animation: float-slow 12s infinite alternate-reverse;
}

.circle-3 {
  width: 150px;
  height: 150px;
  background: radial-gradient(
    circle,
    rgba(79, 70, 229, 0.1) 0%,
    rgba(79, 70, 229, 0) 70%
  );
  top: 60%;
  left: 10%;
  animation: float-slow 10s infinite alternate;
}

.circle-4 {
  width: 180px;
  height: 180px;
  background: radial-gradient(
    circle,
    rgba(236, 72, 153, 0.1) 0%,
    rgba(236, 72, 153, 0) 70%
  );
  top: 20%;
  right: 15%;
  animation: float-slow 18s infinite alternate-reverse;
}

.circle-5 {
  width: 250px;
  height: 250px;
  background: radial-gradient(
    circle,
    rgba(16, 185, 129, 0.1) 0%,
    rgba(16, 185, 129, 0) 70%
  );
  bottom: 10%;
  left: 20%;
  animation: float-slow 14s infinite alternate;
}

/* Side decorations */
.side-decoration {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.left-decoration {
  left: 30px;
  top: 50%;
  transform: translateY(-50%);
}

.right-decoration {
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
}

.side-decoration .trophy-icon,
.side-decoration .medal-icon,
.side-decoration .code-icon,
.side-decoration .star-icon,
.side-decoration .fire-icon,
.side-decoration .rocket-icon {
  font-size: 28px;
  margin: 15px 0;
  background: white;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: pulse 2s infinite alternate;
}

.decoration-line {
  width: 2px;
  height: 50px;
  background: linear-gradient(
    to bottom,
    rgba(59, 130, 246, 0.5),
    rgba(59, 130, 246, 0.1)
  );
}

.ranking-container {
  background-color: white;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  color: #1a202c;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  z-index: 2;
  background-image: linear-gradient(
      to right,
      rgba(59, 130, 246, 0.01),
      transparent
    ),
    linear-gradient(to bottom, rgba(59, 130, 246, 0.01), transparent);
}

.ranking-container::before {
  content: "";
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.15),
    rgba(37, 99, 235, 0.15)
  );
  z-index: 0;
  filter: blur(20px);
}

.ranking-container::after {
  content: "";
  position: absolute;
  bottom: -80px;
  left: -80px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.1),
    rgba(245, 158, 11, 0.1)
  );
  z-index: 0;
  filter: blur(25px);
}

.title-gradient {
  background: linear-gradient(135deg, #3b82f6, #2563eb 50%, #4f46e5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.title-underline {
  height: 4px;
  width: 180px;
  margin: 12px auto 0;
  background: linear-gradient(to right, #3b82f6, #2563eb, transparent);
  border-radius: 2px;
}

.header {
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.search-box {
  position: relative;
  width: 350px;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  background-color: #f8fafc;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  background-color: white;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 16px;
}

.tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tab-button {
  padding: 10px 20px;
  background: #f1f5f9;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  color: #64748b;
}

.tab-button:hover {
  background: #e2e8f0;
  color: #334155;
}

.tab-button.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
}

/* Top 3 Centered Layout */
.top-three-layout {
  margin-bottom: 50px;
  position: relative;
  z-index: 1;
  padding: 70px 20px 50px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.8),
    rgba(248, 250, 252, 0.5)
  );
  border-radius: 16px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(226, 232, 240, 0.7);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  -webkit-transition: all 0.8s;
  -moz-transition: all 0.8s;
  -o-transition: all 0.8s;
  transition: all 0.8s;
}

.top-three-layout {
  box-shadow: 0 20px 50px rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
}

/* Background effect for convergence feeling */
.top-three-layout::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    rgba(59, 130, 246, 0.15) 0%,
    transparent 70%
  );
  z-index: 0;
  -webkit-transition: all 0.8s;
  -moz-transition: all 0.8s;
  -o-transition: all 0.8s;
  transition: all 0.8s;
}

.top-three-layout::before {
  background: radial-gradient(
    ellipse at center,
    rgba(255, 193, 7, 0.2) 0%,
    transparent 75%
  );
}

/* Rays expanding from center */
.top-three-layout::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(
      45deg,
      transparent 45%,
      rgba(59, 130, 246, 0.05) 50%,
      transparent 55%
    ),
    linear-gradient(
      135deg,
      transparent 45%,
      rgba(59, 130, 246, 0.05) 50%,
      transparent 55%
    ),
    linear-gradient(
      225deg,
      transparent 45%,
      rgba(59, 130, 246, 0.05) 50%,
      transparent 55%
    ),
    linear-gradient(
      315deg,
      transparent 45%,
      rgba(59, 130, 246, 0.05) 50%,
      transparent 55%
    );
  z-index: 0;
  opacity: 0.7;
  -webkit-transition: all 0.8s;
  -moz-transition: all 0.8s;
  -o-transition: all 0.8s;
  transition: all 0.8s;
}

.top-three-layout::after {
  background-image: linear-gradient(
      45deg,
      transparent 42%,
      rgba(255, 193, 7, 0.08) 50%,
      transparent 58%
    ),
    linear-gradient(
      135deg,
      transparent 42%,
      rgba(255, 193, 7, 0.08) 50%,
      transparent 58%
    ),
    linear-gradient(
      225deg,
      transparent 42%,
      rgba(255, 193, 7, 0.08) 50%,
      transparent 58%
    ),
    linear-gradient(
      315deg,
      transparent 42%,
      rgba(255, 193, 7, 0.08) 50%,
      transparent 58%
    );
  opacity: 1;
  animation: rotate-bg 15s linear infinite;
}

@keyframes rotate-bg {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.winner-triangle {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 30px;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  height: auto;
  padding: 20px 0 10px;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

/* Central point & converging lines */
.winner-triangle::before,
.winner-triangle::after {
  content: "";
  position: absolute;
  bottom: 45%;
  width: 40%;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(59, 130, 246, 0.3) 80%,
    rgba(59, 130, 246, 0.5)
  );
  z-index: 0;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

.winner-triangle::before {
  left: 5%;
  transform: rotate(25deg) translateY(-10px);
  width: 45%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 193, 7, 0.4) 80%,
    rgba(255, 193, 7, 0.6)
  );
  animation: line-animation-left 3s ease-in-out infinite alternate;
}

.winner-triangle::after {
  right: 5%;
  transform: rotate(-25deg) translateY(-10px);
  width: 45%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 193, 7, 0.4) 80%,
    rgba(255, 193, 7, 0.6)
  );
  animation: line-animation-right 3s ease-in-out infinite alternate;
}

@keyframes line-animation-left {
  0% {
    transform: rotate(20deg) translateY(-8px);
  }
  100% {
    transform: rotate(30deg) translateY(-12px);
  }
}

@keyframes line-animation-right {
  0% {
    transform: rotate(-20deg) translateY(-8px);
  }
  100% {
    transform: rotate(-30deg) translateY(-12px);
  }
}

/* Center point pulse */
.winner-triangle .center-point {
  position: absolute;
  width: 15px;
  height: 15px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
  animation: pulse-center 2s infinite;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

.winner-triangle .center-point {
  width: 25px;
  height: 25px;
  background: linear-gradient(135deg, #ffc107, #ff9800);
  box-shadow: 0 0 20px 5px rgba(255, 193, 7, 0.5);
  animation: pulse-center-hover 1.5s infinite;
}

@keyframes pulse-center {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

@keyframes pulse-center-hover {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.6);
  }
  70% {
    box-shadow: 0 0 0 25px rgba(255, 193, 7, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
  }
}

.winner {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  z-index: 1;
  border: 1px solid rgba(226, 232, 240, 0.7);
  transform-origin: bottom center;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

.winner {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.first-place {
  width: 240px;
  height: 300px;
  border: 3px solid #ffc107;
  background: linear-gradient(to bottom, white, #fffbeb);
  z-index: 3;
  padding: 20px;
  box-shadow: 0 15px 35px rgba(255, 193, 7, 0.2);
  order: 2;
  position: relative;
  transform: scale(1.1);
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

.first-place {
  animation: first-place-float 3s ease-in-out infinite;
}

@keyframes first-place-float {
  0% {
    transform: translateY(0) scale(1.1);
  }
  50% {
    transform: translateY(-20px) scale(1.15);
  }
  100% {
    transform: translateY(0) scale(1.1);
  }
}

/* Glow effect for first place */
.first-place::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at center,
    rgba(255, 193, 7, 0.2),
    transparent 70%
  );
  border-radius: 12px;
  z-index: -1;
  filter: blur(15px);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.first-place::before {
  opacity: 1;
}

.second-place {
  width: 180px;
  height: 240px;
  border: 2px solid #9ca3af;
  background: linear-gradient(to bottom, white, #f8fafc);
  z-index: 2;
  order: 1;
  transform: perspective(800px) rotateY(-10deg);
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

.second-place {
  animation: second-place-anim 4s ease-in-out infinite;
}

@keyframes second-place-anim {
  0% {
    transform: perspective(800px) rotateY(-10deg);
  }
  50% {
    transform: perspective(800px) rotateY(-20deg) translateY(-10px) scale(1.05);
  }
  100% {
    transform: perspective(800px) rotateY(-10deg);
  }
}

.third-place {
  width: 180px;
  height: 240px;
  border: 2px solid #b45309;
  background: linear-gradient(to bottom, white, #fff7ed);
  z-index: 2;
  order: 3;
  transform: perspective(800px) rotateY(10deg);
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

.third-place {
  animation: third-place-anim 4s ease-in-out infinite;
}

@keyframes third-place-anim {
  0% {
    transform: perspective(800px) rotateY(10deg);
  }
  50% {
    transform: perspective(800px) rotateY(20deg) translateY(-10px) scale(1.05);
  }
  100% {
    transform: perspective(800px) rotateY(10deg);
  }
}

/* Position crown icon */
.crown {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 38px;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2));
  animation: float 3s ease-in-out infinite;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

.crown {
  filter: drop-shadow(0 6px 15px rgba(255, 193, 7, 0.4));
  animation: crown-float 2s ease-in-out infinite;
  font-size: 42px;
  top: -35px;
}

@keyframes crown-float {
  0% {
    transform: translateX(-50%) rotate(-5deg);
  }
  50% {
    transform: translateX(-50%) translateY(-8px) rotate(5deg);
  }
  100% {
    transform: translateX(-50%) rotate(-5deg);
  }
}

/* Position medal badges */
.medal {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-bottom: 15px;
  font-size: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

.medal:not(.gold):not(.silver):not(.bronze) {
  animation: medal-rotate 4s ease-in-out infinite;
}

@keyframes medal-rotate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

.first-place .medal {
  width: 48px;
  height: 48px;
  font-size: 22px;
  animation: pulse-gold 2s infinite alternate;
  margin-bottom: 20px;
  transform: none !important;
  animation-name: pulse-gold !important;
}

.medal {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
}

.gold {
  background: linear-gradient(135deg, #ffd700, #ffc107);
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4);
  transform: none !important;
  animation: pulse-gold 2s infinite alternate !important;
}

.silver {
  background: linear-gradient(135deg, #e2e8f0, #94a3b8);
  box-shadow: 0 4px 15px rgba(148, 163, 184, 0.4);
  transform: none !important;
  animation: pulse-silver 2s infinite alternate !important;
}

.bronze {
  background: linear-gradient(135deg, #d97706, #b45309);
  box-shadow: 0 4px 15px rgba(180, 83, 9, 0.4);
  transform: none !important;
  animation: pulse-bronze 2s infinite alternate !important;
}

@keyframes pulse-silver {
  0% {
    box-shadow: 0 0 0 0 rgba(148, 163, 184, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(148, 163, 184, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(148, 163, 184, 0);
  }
}

@keyframes pulse-bronze {
  0% {
    box-shadow: 0 0 0 0 rgba(180, 83, 9, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(180, 83, 9, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(180, 83, 9, 0);
  }
}

@keyframes pulse-gold {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
  }
}

.winner-avatar {
  margin-bottom: 8px;
  position: relative;
}

.winner .avatar-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.5s ease;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -o-transition: all 0.5s;
}

.first-place .avatar-img {
  width: 80px;
  height: 80px;
  border: 3px solid #ffd700;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.first-place .avatar-img {
  transform: scale(1.15);
  box-shadow: 0 8px 20px rgba(255, 193, 7, 0.4);
  border: 3px solid #ffeb3b;
  animation: avatar-first-place 3s ease-in-out infinite;
}

.second-place .avatar-img {
  transform: translateX(5px) scale(1.1);
  animation: avatar-second-place 3s ease-in-out infinite alternate;
}

.third-place .avatar-img {
  transform: translateX(-5px) scale(1.1);
  animation: avatar-third-place 3s ease-in-out infinite alternate;
}

@keyframes avatar-first-place {
  0% {
    transform: scale(1.15);
  }
  50% {
    transform: scale(1.2) rotate(5deg);
  }
  100% {
    transform: scale(1.15);
  }
}

@keyframes avatar-second-place {
  0% {
    transform: translateX(5px) scale(1.1);
  }
  100% {
    transform: translateX(8px) scale(1.12);
  }
}

@keyframes avatar-third-place {
  0% {
    transform: translateX(-5px) scale(1.1);
  }
  100% {
    transform: translateX(-8px) scale(1.12);
  }
}

.winner-info {
  width: 100%;
}

.winner-name {
  font-weight: 700;
  font-size: 16px;
  color: #1e293b;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.first-place .winner-name {
  font-size: 20px;
  letter-spacing: 0.02em;
}

.winner-school {
  color: #64748b;
  font-size: 12px;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.first-place .winner-school {
  font-size: 14px;
}

.winner-rating {
  font-weight: 700;
  font-size: 16px;
  background: linear-gradient(120deg, #3b82f6, #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.first-place .winner-rating {
  font-size: 22px;
  background: linear-gradient(120deg, #f59e0b, #ffc107);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.ranking-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  position: relative;
  z-index: 1;
  transform: translateZ(0);
  backdrop-filter: blur(4px);
}

.ranking-table::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(to right, #3b82f6, #2563eb, #4f46e5);
  z-index: 2;
}

.table-header {
  display: flex;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
  font-weight: 600;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  font-size: 13px;
}

.header-cell {
  padding: 12px;
}

.rank {
  width: 80px;
  text-align: center;
}

.name {
  flex: 2;
}

.school {
  flex: 2;
}

.rating {
  flex: 1;
  text-align: center;
}

.actions {
  width: 120px;
  text-align: center;
}

.table-row {
  display: flex;
  align-items: center;
  padding: 18px 16px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  animation: fadeIn 0.4s ease-out;
  animation-fill-mode: both;
  position: relative;
  overflow: hidden;
}

.table-row::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: transparent;
  transition: all 0.3s ease;
}

.table-row:hover::before {
  background: linear-gradient(to bottom, #3b82f6, #2563eb);
}

.table-row:hover {
  background-color: #f8fafc;
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  z-index: 5;
}

.table-row:nth-child(2) {
  animation-delay: 0.1s;
}

.table-row:nth-child(3) {
  animation-delay: 0.2s;
}

.table-row:nth-child(4) {
  animation-delay: 0.3s;
}

.table-row:nth-child(5) {
  animation-delay: 0.4s;
}

.cell {
  padding: 8px 12px;
  position: relative;
  z-index: 1;
}

.rank-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 50%;
  font-weight: 600;
  margin: 0 auto;
  font-size: 15px;
  color: #475569;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid rgba(226, 232, 240, 0.7);
}

.table-row:hover .rank-number {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  color: #2563eb;
  transform: scale(1.1);
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.15);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f8fafc;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.table-row:hover .avatar {
  transform: scale(1.05);
}

.user-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
}

.rating-value {
  font-weight: 700;
  font-size: 17px;
  color: #1e293b;
  background: linear-gradient(120deg, #3b82f6, #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.rating-unit {
  font-size: 13px;
  color: #64748b;
  margin-left: 2px;
}

.detail-button {
  padding: 8px 16px;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.detail-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 40px;
  position: relative;
  z-index: 1;
  padding: 15px 0;
  background: linear-gradient(
    to right,
    rgba(248, 250, 252, 0),
    rgba(248, 250, 252, 0.7),
    rgba(248, 250, 252, 0)
  );
  border-radius: 50px;
}

.page-button {
  min-width: 44px;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-weight: 500;
  font-size: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.page-button:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.page-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-button.active {
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  border-color: #3b82f6;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* 骨架屏样式 */
.skeleton-row {
  height: 80px;
}

.skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  height: 20px;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0% {
    transform: translateX(-50%) translateY(0px);
  }
  50% {
    transform: translateX(-50%) translateY(-8px);
  }
  100% {
    transform: translateX(-50%) translateY(0px);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .ranking-container {
    padding: 20px;
    border-radius: 12px;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
    margin-bottom: 12px;
  }

  .tabs {
    justify-content: center;
  }

  .header-cell,
  .cell {
    padding: 8px 4px;
    font-size: 14px;
  }

  .rank {
    width: 50px;
  }

  .actions {
    width: 80px;
  }

  .user-info {
    gap: 8px;
  }

  .avatar {
    width: 36px;
    height: 36px;
  }

  /* Top 3 mobile responsive */
  .winner-triangle {
    flex-direction: column;
    align-items: center;
    gap: 30px;
    padding: 10px 0;
  }

  .center-point {
    display: none;
  }

  .first-place,
  .second-place,
  .third-place {
    transform: none;
    width: 220px;
    height: auto;
    min-height: 220px;
  }

  .first-place {
    order: 1;
    transform: scale(1.05);
    margin-bottom: 10px;
  }

  .second-place {
    order: 2;
    margin-bottom: 10px;
  }

  .third-place {
    order: 3;
    margin-bottom: 0;
  }

  .winner-triangle::before,
  .winner-triangle::after {
    display: none;
  }

  .first-place:hover,
  .second-place:hover,
  .third-place:hover {
    transform: translateY(-10px);
  }

  .top-three-layout::after {
    opacity: 0.4;
  }
}

/* Add responsive adjustments for the side decorations */
@media (max-width: 1400px) {
  .side-decoration .trophy-icon,
  .side-decoration .medal-icon,
  .side-decoration .code-icon,
  .side-decoration .star-icon,
  .side-decoration .fire-icon,
  .side-decoration .rocket-icon {
    font-size: 22px;
    width: 40px;
    height: 40px;
  }

  .decoration-line {
    height: 40px;
  }

  .left-decoration {
    left: 15px;
  }

  .right-decoration {
    right: 15px;
  }
}

@media (max-width: 1100px) {
  .side-decoration {
    display: none;
  }
}

/* Animation for floating elements */
@keyframes float-slow {
  0% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-15px) translateX(15px);
  }
  100% {
    transform: translateY(15px) translateX(-15px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  100% {
    transform: scale(1.1);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
  }
}
</style>
