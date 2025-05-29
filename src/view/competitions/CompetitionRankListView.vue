<template>
  <div class="ranking-container rounded-2xl">
    <div class="header">
      <div class="text-4xl font-bold text-center my-10">
        ByteOJ巅峰Rating排行榜
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
          v-for="(item, index) in rankingData"
          :key="item.uuid"
          :class="['table-row', { 'top-three': currentPage == 1 && index < 3 }]"
        >
          <div class="cell rank">
            <span
              :class="[
                'rank-number',
                currentPage == 1 ? `rank-${index + 1}` : '',
              ]"
            >
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
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

// 搜索输入防抖处理

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
.ranking-container {
  background-color: white;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  font-family: "Helvetica Neue", Arial, sans-serif;
  color: #333;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header {
  margin-bottom: 24px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.search-box {
  position: relative;
  width: 300px;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 10px 15px 10px 35px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-button {
  padding: 8px 16px;
  background: #edf2f7;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  color: #4a5568;
}

.tab-button:hover {
  background: #e2e8f0;
}

.tab-button.active {
  background: #4299e1;
  color: white;
  font-weight: 500;
}

.ranking-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.table-header {
  display: flex;
  background: #f7fafc;
  font-weight: 600;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
}

.header-cell {
  padding: 8px;
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
  padding: 16px;
  border-bottom: 1px solid #edf2f7;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f8fafc;
}

.table-row.top-three {
  background-color: #fff3e0;
}

.cell {
  padding: 8px;
}

.rank-number {
  display: inline-block;
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-radius: 50%;
  font-weight: 600;
}

.rank-1 {
  background-color: #f6ad55;
  color: white;
}

.rank-2 {
  background-color: #a0aec0;
  color: white;
}

.rank-3 {
  background-color: #f687b3;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #edf2f7;
}

.user-name {
  font-weight: 500;
  color: #2d3748;
}

.rating-value {
  font-weight: 600;
  font-size: 16px;
  color: #2d3748;
}

.rating-unit {
  font-size: 12px;
  color: #718096;
  margin-left: 4px;
}

.detail-button {
  padding: 6px 12px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.detail-button:hover {
  background: #3182ce;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
}

.page-button {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a5568;
}

.page-button:hover:not(:disabled) {
  background: #edf2f7;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-button.active {
  background: #4299e1;
  color: white;
  border-color: #4299e1;
}

/* 骨架屏样式 */
.skeleton-row {
  height: 64px;
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
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

/* 响应式调整 */
@media (max-width: 768px) {
  .ranking-container {
    padding: 16px;
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
    width: 32px;
    height: 32px;
  }
}
</style>
