<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from "vue";
import dayjs from "dayjs";
import router from "@/router";
import UserStore from "@/store/user";
import {
  CompetitionControllerService, SearchControllerService, SearchRequest,
} from "../../../../generated";
import {CompetitionRecordsRequest} from "../../../../generated/models/CompetitionRecordsRequest";

const path = router.currentRoute.value.fullPath;
const useStore = UserStore();
const competition_id = ref<number>(parseInt(path.split("/")[2]));
const rated_color_list = ref<string[]>(useStore.rated_color_list);

const records = ref<any[]>([]);
const pageSum = ref<number>(0);
const currentPage = ref<number>(1);
const isLoading = ref<boolean>(false);

// 筛选条件
const filterParams = ref({
  idx: "",
  results: "",
  languages: "",
  keyword: "",
  is_code_length: 0,
  is_submit_time: 0,
});

// 表头选项
const headerOptions = [
  { label: "题号", key: "idx", options: ["A", "B", "C"] },
  { label: "运行结果", key: "results", options: ["答案正确", "答案错误", "运行超时", "内存超限", "输出超限", "未知错误"] },
  { label: "使用语言", key: "languages", options: ["C", "C++", "Python", "Java", "JavaScript", "Go"] },
  { label: "代码长度", key: "is_code_length", options: [{ value: 1, label: "从短到长" }, { value: 2, label: "从长到短" }] },
  { label: "提交时间", key: "is_submit_time", options: [{ value: 1, label: "从早到晚" }, { value: 2, label: "从晚到早" }] },
];

// 题目数量
const idx_num = ref(0);

onMounted(async () => {
  await fetchRecords(1);
  // 添加全局点击事件监听
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  // 移除全局点击事件监听
  document.removeEventListener('click', handleClickOutside);
});

// 点击外部关闭所有下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  // 检查点击是否在下拉菜单或按钮内部
  const isInsideDropdown = target.closest('.dropdown-menu') || target.closest('.filter-btn');
  if (!isInsideDropdown) {
    // 关闭所有下拉菜单
    dropdowns.value = {
      idx: false,
      results: false,
      languages: false,
      is_code_length: false,
      is_submit_time: false,
    };
  }
};
// 对于其他筛选条件（非 keyword）的变化，直接触发搜索（保持原有逻辑）
watch(
    () => ({
      idx: filterParams.value.idx,
      results: filterParams.value.results,
      languages: filterParams.value.languages,
      is_code_length: filterParams.value.is_code_length,
      is_submit_time: filterParams.value.is_submit_time
    }),
    () => {
      fetchRecords(1);
      currentPage.value = 1;
    },
    { deep: true }
);

// 获取记录数据
const fetchRecords = async (page: number) => {
  isLoading.value = true;
  try {
    const searchRequest = ref({
      category: "record",
      code: [],
      current: 0,
      difficulty: "",
      endMilliSeconds: 0,
      is_date_order: 0,
      keyword: "",
      module: "",
      pageNum: 0,
      pageSize: 0,
      pages: 0,
      size: 0,
      sourceList: [],
      startMilliSeconds: 0,
      status: 0,
      tagsList: [],
      type: [],
      competitionRecordsRequest: {
        competition_id: competition_id.value,
        pageNum: page,
        pageSize: 10,
        keyword: filterParams.value.keyword,
        idx: filterParams.value.idx,
        results: filterParams.value.results,
        languages: filterParams.value.languages,
        is_code_length: filterParams.value.is_code_length,
        is_submit_time: filterParams.value.is_submit_time
      } as CompetitionRecordsRequest
    } as SearchRequest);

    const res = await SearchControllerService.searchAllUsingPost(searchRequest.value);
    if (res.code === 0) {
      records.value = res.data.dataList;
      pageSum.value = res.data.dataList[0].page_num;
      idx_num.value = res.data.dataList[0]?.test_num;
      headerOptions[0].options = [];
      for (let item = 0; item < idx_num.value; item++) {
        headerOptions[0].options.push(String.fromCharCode('A'.charCodeAt(0) + item));
      }
    }
  } finally {
    isLoading.value = false;
  }
};

// 分页查找
const PageClick = async (Page: number) => {
  if (Page <= 0 || Page > pageSum.value || isLoading.value) {
    return;
  }
  await fetchRecords(Page);
  currentPage.value = Page;
};

// 重置筛选条件
const resetFilters = () => {
  filterParams.value = {
    idx: "",
    results: "",
    languages: "",
    keyword: "",
    is_code_length: 0,
    is_submit_time: 0,
  };
};

// 处理下拉菜单相关逻辑
const dropdowns = ref<{ [key: string]: boolean }>({
  idx: false,
  results: false,
  languages: false,
  is_code_length: false,
  is_submit_time: false,
});

const toggleDropdown = (key: string) => {
  dropdowns.value = {
    ...dropdowns.value,
    [key]:!dropdowns.value[key],
  };
};

const selectOption = (key: string, value: any) => {
  filterParams.value[key] = value;
  dropdowns.value[key] = false;
};

// 获取结果对应的CSS类
const getResultClass = (result: string) => {
  switch(result) {
    case 'Accepted': return 'accepted';
    case 'Time Limit Exceeded': return 'timeout';
    case 'Memory Limit Exceeded': return 'memory-limit';
    case 'Output Limit Exceeded': return 'output-limit';
    case 'Runtime Error': return 'runtime-error';
    default: return 'rejected';
  }
};

// 获取结果对应的中文描述
const getResultText = (result: string) => {
  switch(result) {
    case 'Accepted': return '答案正确';
    case 'Time Limit Exceeded': return '运行超时';
    case 'Memory Limit Exceeded': return '内存超限';
    case 'Output Limit Exceeded': return '输出超限';
    case 'Runtime Error': return '未知错误';
    default: return '答案错误';
  }
};
</script>

<template>
  <div class="record-container">
    <!-- 筛选面板 -->
    <div class="filter-panel">
      <div class="search-bar">
        <input
            type="text"
            v-model="filterParams.keyword"
            placeholder="输入用户名称回车搜索"
            class="search-input"
            @keyup.enter="fetchRecords(currentPage)"
        />
        <button @click="resetFilters" class="reset-btn">重置筛选</button>
      </div>

      <div class="filter-options">
        <div class="filter-group" v-for="(option, index) in headerOptions" :key="option.key">
          <button
              class="filter-btn"
              @click="toggleDropdown(option.key)"
              :class="{ active: filterParams[option.key] }"
          >
            {{ option.label }}
            <span v-if="filterParams[option.key]" class="filter-indicator"></span>
          </button>
          <div v-show="dropdowns[option.key]" class="dropdown-menu">
            <div
                v-for="opt in option.options"
                :key="opt.value || opt"
                @click="selectOption(option.key, opt.value || opt)"
                :class="{ selected: filterParams[option.key] === (opt.value || opt) }"
            >
              {{ opt.label || opt }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- 记录卡片列表 -->
    <div class="record-list">
      <div
          v-for="record in records"
          :key="record.record_id"
          class="record-card"
          :class="getResultClass(record.result)"
      >
        <div class="card-header">
          <router-link
              :to="`/user/space/${record.uuid}`"
              class="user-link"
              :style="{ color: rated_color_list[record.rated] }"
          >
            {{ record.user_name }}
          </router-link>

          <!-- 修改后的题目编号部分 -->
          <span class="problem-id">
          <router-link
              :to="`/competition/${competition_id}/problem/${record.chinese_name}`"
              class="problem-link"
          >
            <span class="problem-badge">{{ record.idx }}</span>
            <span class="problem-title">{{ record.chinese_name }}</span>
          </router-link>
        </span>

          <span class="submission-id">
          <router-link
              :to="`/competition/${competition_id}/records/${record.submission_id}`"
              class="record-link"
          >
            #{{ record.submission_id }}
          </router-link>
        </span>
        </div>

        <div class="card-content">
          <div class="result-status" :class="getResultClass(record.result)">
            <router-link
                :to="`/competition/${competition_id}/records/${record.submission_id}`"
            >
              {{ getResultText(record.result) }}
            </router-link>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">语言</span>
              <span class="stat-value">{{ record.language }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">时间</span>
              <span class="stat-value">{{ record.time_used }}ms</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">内存</span>
              <span class="stat-value">{{ record.memory_used }}KB</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">代码</span>
              <span class="stat-value">{{ record.code_length }}B</span>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <span class="submit-time">
            {{ dayjs(record.submit_time).format("YYYY-MM-DD HH:mm:ss") }}
          </span>
        </div>
      </div>

      <div v-if="records?.length === 0 &&!isLoading" class="no-records">
        暂无提交记录
      </div>
    </div>

    <!-- 分页控件 -->
    <div class="pagination" v-if="pageSum > 1 && records.length > 0">
      <button
          class="pagination-btn first"
          @click="PageClick(1)"
          :disabled="currentPage === 1"
      >
        &laquo;
      </button>

      <button
          class="pagination-btn prev"
          @click="PageClick(currentPage - 1)"
          :disabled="currentPage === 1"
      >
        &lsaquo;
      </button>

      <template v-for="page in pageSum" :key="page">
        <button
            v-if="Math.abs(page - currentPage) <= 2 || page === 1 || page === pageSum"
            class="pagination-btn"
            :class="{ active: page === currentPage }"
            @click="PageClick(page)"
        >
          {{ page }}
        </button>
        <span
            v-else-if="Math.abs(page - currentPage) === 3"
            class="pagination-ellipsis"
        >
          ...
        </span>
      </template>

      <button
          class="pagination-btn next"
          @click="PageClick(currentPage + 1)"
          :disabled="currentPage === pageSum"
      >
        &rsaquo;
      </button>

      <button
          class="pagination-btn last"
          @click="PageClick(pageSum)"
          :disabled="currentPage === pageSum"
      >
        &raquo;
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 基础样式重置 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.record-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #2c3e50;
}

/* 筛选面板 - 现代化设计 */
.filter-panel {
  background-color: #ffffff;
  padding: 1.25rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #eaeaea;
}

.search-bar {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.625rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.reset-btn {
  padding: 0.625rem 1.25rem;
  background-color: #f5f7fa;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.95rem;
}

.reset-btn:hover {
  background-color: #edf2f7;
  border-color: #cbd5e0;
}

/* 筛选选项 */
.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-group {
  position: relative;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
  position: relative;
}

.filter-btn:hover {
  background-color: #edf2f7;
  border-color: #cbd5e0;
}

.filter-btn.active {
  background-color: #e3f2fd;
  border-color: #bbdefb;
}

.filter-indicator {
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: #3498db;
  border-radius: 50%;
  margin-left: 4px;
}

.dropdown-menu {
  position: absolute;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  z-index: 10;
  max-height: 15rem;
  overflow-y: auto;
  min-width: 120px;
  left: 0;
  top: 100%;
  margin-top: 0.25rem;
}

.dropdown-menu div {
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: #4a5568;
  font-size: 0.9rem;
  transition: all 0.1s ease;
}

.dropdown-menu div:hover {
  background-color: #f8f9fa;
  color: #2c3e50;
}

.dropdown-menu div.selected {
  background-color: #e3f2fd;
  color: #1976d2;
}

/* 加载状态 - 更平滑的动画 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(52, 152, 219, 0.2);
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 记录卡片列表 */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.record-card {
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #eaeaea;
  transition: all 0.2s ease;
  overflow: hidden;
}

.record-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
  gap: 1rem;
  flex-wrap: wrap;
}

.user-link {
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}

.user-link:hover {
  text-decoration: underline;
}

.problem-id {
  margin-left: auto;
}

.problem-link {
  text-decoration: none;
  color: #3498db;
  font-weight: 500;
  transition: color 0.2s ease;
}

.problem-link:hover {
  color: #2980b9;
  text-decoration: underline;
}

.submission-id {
  color: #718096;
  font-size: 0.9rem;
}

.record-link {
  text-decoration: none;
  color: inherit;
  transition: color 0.2s ease;
}

.record-link:hover {
  color: #3498db;
}

.card-content {
  padding: 1rem;
}

.result-status {
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.result-status a {
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.result-status a:hover {
  opacity: 0.8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.8rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-weight: 500;
  font-size: 0.95rem;
}

.card-footer {
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-top: 1px solid #eaeaea;
  font-size: 0.9rem;
  color: #718096;
}

/* 结果样式 */
.accepted {
  border-left: 4px solid #27ae60;
}

.accepted .result-status a {
  color: #27ae60;
}

.rejected {
  border-left: 4px solid #e74c3c;
}

.rejected .result-status a {
  color: #e74c3c;
}

.timeout {
  border-left: 4px solid #f39c12;
}

.timeout .result-status a {
  color: #f39c12;
}

.memory-limit {
  border-left: 4px solid #9b59b6;
}

.memory-limit .result-status a {
  color: #9b59b6;
}

.output-limit {
  border-left: 4px solid #e67e22;
}

.output-limit .result-status a {
  color: #e67e22;
}

.runtime-error {
  border-left: 4px solid #7f8c8d;
}

.runtime-error .result-status a {
  color: #7f8c8d;
}

/* 无记录提示 */
.no-records {
  text-align: center;
  padding: 2rem;
  font-size: 1rem;
  color: #718096;
  font-style: italic;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
}

/* 分页控件 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.pagination-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  background-color: #fff;
  color: #4a5568;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 2.25rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #cbd5e0;
}

.pagination-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-ellipsis {
  padding: 0.5rem 0.75rem;
  color: #a0aec0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .record-container {
    padding: 1rem;
  }

  .filter-panel {
    padding: 1rem;
  }

  .search-bar {
    flex-direction: column;
    gap: 0.75rem;
  }

  .search-input,
  .reset-btn {
    width: 100%;
  }

  .filter-options {
    gap: 0.25rem;
  }

  .filter-btn {
    padding: 0.5rem;
    font-size: 0.85rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .problem-id {
    margin-left: 0;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .pagination-btn {
    min-width: 2rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
}
/* 新增的题目编号样式 */
.problem-badge {
  display: inline-block;
  background-color: #3498db;
  color: white;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-right: 0.5rem;
  font-size: 0.9rem;
  min-width: 1.5rem;
  text-align: center;
  transition: all 0.2s ease;
}

.problem-title {
  font-weight: 500;
}

.problem-link:hover .problem-badge {
  background-color: #2980b9;
  transform: scale(1.05);
}

/* 根据题目类型设置不同颜色 */
.problem-link[href*="problem/A"] .problem-badge {
  background-color: #27ae60;
}
.problem-link[href*="problem/B"] .problem-badge {
  background-color: #f39c12;
}
.problem-link[href*="problem/C"] .problem-badge {
  background-color: #e74c3c;
}
.problem-link[href*="problem/D"] .problem-badge {
  background-color: #9b59b6;
}
.problem-link[href*="problem/E"] .problem-badge {
  background-color: #34495e;
}

.problem-link[href*="problem/A"]:hover .problem-badge {
  background-color: #219653;
}
.problem-link[href*="problem/B"]:hover .problem-badge {
  background-color: #e67e22;
}
.problem-link[href*="problem/C"]:hover .problem-badge {
  background-color: #c0392b;
}
.problem-link[href*="problem/D"]:hover .problem-badge {
  background-color: #8e44ad;
}
.problem-link[href*="problem/E"]:hover .problem-badge {
  background-color: #2c3e50;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .problem-badge {
    padding: 0.2rem 0.4rem;
    font-size: 0.8rem;
  }

  .problem-title {
    display: none; /* 在小屏幕上隐藏题目名称 */
  }
}
</style>