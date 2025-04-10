<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import dayjs from "dayjs";
import router from "@/router";
import UserStore from "@/store/user";
import {
  CompetitionControllerService,
  ProblemAlgorithmControllerService,
} from "../../../../generated";

const path = router.currentRoute.value.fullPath;
const useStore = UserStore();
const competition_id: Ref<number> = ref(parseInt(path.split("/")[2]));
const rated_color_list: Ref<string[]> = ref(useStore.rated_color_list);

const records: Ref<any> = ref([]);
const pageSum = ref([]);
const currentPage = ref(1);
const isLoading = ref(false);
const isExpanded = ref(false); // 控制是否显示完整视图

onMounted(async () => {
  await fetchRecords(1);
});

// 获取记录数据
const fetchRecords = async (page: number) => {
  isLoading.value = true;
  try {
    const res =
      await CompetitionControllerService.competitionSearchRecordUsingPost(
        competition_id.value,
        page
      );
    if (res.code === 0) {
      records.value = res.data;
      pageSum.value = records.value[0]?.page_num || 1;
    }
  } finally {
    isLoading.value = false;
  }
};

// 分页查找
const PageClick = async (Page: number | any) => {
  if (Page <= 0 || Page > pageSum.value || isLoading.value) {
    return;
  }

  await fetchRecords(Page);
  currentPage.value = Page;
};

// 切换视图模式
const toggleViewMode = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div class="record-container">
    <!-- 视图切换按钮 -->
    <div class="view-toggle">
      <button @click="toggleViewMode" class="toggle-btn">
        {{ isExpanded ? "简洁视图" : "完整视图" }}
        <span class="icon">{{ isExpanded ? "⇧" : "⇩" }}</span>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- 记录表格 -->
    <div class="table-wrapper" :class="{ 'compact-view': !isExpanded }">
      <table class="record-table">
        <!-- 表头 -->
        <thead>
          <tr>
            <th class="id-col">运行ID号</th>
            <th class="user-col">用户名</th>
            <th class="problem-col">题号</th>
            <th class="result-col">运行结果</th>
            <th class="score-col">得分</th>
            <th v-if="isExpanded" class="time-col">运行实现(ms)</th>
            <th v-if="isExpanded" class="memory-col">内存大小(MB)</th>
            <th v-if="isExpanded" class="length-col">代码长度</th>
            <th class="lang-col">使用语言</th>
            <th class="time-col">提交信息</th>
          </tr>
        </thead>

        <!-- 表格内容 -->
        <tbody>
          <tr
            v-for="record in records"
            :key="record.record_id"
            class="record-row"
          >
            <td class="id-cell">
              <router-link
                :to="
                  '/competition/' +
                  competition_id +
                  '/records/' +
                  record.submission_id
                "
                class="record-link"
              >
                {{ record.submission_id }}
              </router-link>
            </td>

            <td class="user-cell">
              <router-link
                :to="'/user/space/' + record.uuid"
                class="user-link"
                :style="'color:' + rated_color_list[record.rated]"
              >
                {{ record.user_name }}
              </router-link>
            </td>

            <td class="problem-cell">
              <router-link
                :to="competition_id + '/problem/' + record.chinese_name"
                class="problem-link"
              >
                {{ record.chinese_name }}
              </router-link>
            </td>

            <td class="result-cell">
              <router-link
                v-if="record.result == 'Accepted'"
                :to="
                  '/competition/' +
                  competition_id +
                  '/records/' +
                  record.submission_id
                "
                class="accepted"
              >
                答案正确
              </router-link>
              <router-link
                v-else
                :to="
                  '/competition/' +
                  competition_id +
                  '/records/' +
                  record.submission_id
                "
                class="rejected"
              >
                答案错误
              </router-link>
            </td>

            <td class="score-cell">
              <router-link
                v-if="record.record_score / record.score >= 0.9"
                :to="
                  '/competition/' +
                  competition_id +
                  '/records/' +
                  record.record_id
                "
                class="high-score"
              >
                {{ record.score }}
              </router-link>
              <router-link
                v-else-if="record.record_score / record.score >= 0.2"
                :to="
                  '/competition/' +
                  competition_id +
                  '/records/' +
                  record.record_id
                "
                class="medium-score"
              >
                {{ record.record_score }}
              </router-link>
              <router-link
                v-else
                :to="
                  '/competition/' +
                  competition_id +
                  '/records/' +
                  record.record_id
                "
                class="low-score"
              >
                {{ record.record_score }}
              </router-link>
            </td>

            <td v-if="isExpanded" class="time-cell">{{ record.time_used }}</td>
            <td v-if="isExpanded" class="memory-cell">
              {{ record.memory_used }}
            </td>
            <td v-if="isExpanded" class="length-cell">
              {{ record.code_length }}
            </td>

            <td class="lang-cell">
              <span class="lang-badge">{{ record.language }}</span>
            </td>

            <td class="submit-time">
              {{ dayjs(record.submit_time).format("YYYY-MM-DD HH:mm:ss") }}
              <span v-if="!isExpanded" class="compact-stats">
                | {{ record.time_used }}ms | {{ record.memory_used }}MB
                <span v-if="record.code_length"
                  >| {{ record.code_length }}B</span
                >
              </span>
            </td>
          </tr>

          <tr v-if="records.length === 0 && !isLoading">
            <td :colspan="isExpanded ? 10 : 7" class="no-records">
              暂无提交记录
            </td>
          </tr>
        </tbody>
      </table>
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
          v-if="
            Math.abs(page - currentPage) <= 2 || page === 1 || page === pageSum
          "
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
.record-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.view-toggle {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.toggle-btn {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background-color: #2980b9;
}

.toggle-btn .icon {
  font-size: 16px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.table-wrapper {
  overflow-x: auto;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.table-wrapper.compact-view {
  overflow-x: hidden;
}

.record-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: white;
}

.record-table th {
  background-color: #2c3e50;
  color: white;
  font-weight: 500;
  padding: 12px 8px;
  text-align: center;
  position: sticky;
  top: 0;
}

.record-table td {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

.record-row:hover {
  background-color: #f5f7fa;
}

/* 列宽设置 */
.id-col {
  width: 8%;
  min-width: 80px;
}
.user-col {
  width: 12%;
  min-width: 100px;
}
.problem-col {
  width: 8%;
  min-width: 80px;
}
.result-col {
  width: 10%;
  min-width: 90px;
}
.score-col {
  width: 8%;
  min-width: 70px;
}
.time-col {
  width: 8%;
  min-width: 80px;
}
.memory-col {
  width: 8%;
  min-width: 80px;
}
.length-col {
  width: 8%;
  min-width: 80px;
}
.lang-col {
  width: 10%;
  min-width: 90px;
}
.submit-time {
  width: 20%;
  min-width: 160px;
}

/* 简洁视图下的列宽调整 */
.compact-view .id-col {
  width: 8%;
}
.compact-view .user-col {
  width: 15%;
}
.compact-view .problem-col {
  width: 12%;
}
.compact-view .result-col {
  width: 12%;
}
.compact-view .score-col {
  width: 8%;
}
.compact-view .lang-col {
  width: 12%;
}
.compact-view .submit-time {
  width: 33%;
}

/* 链接样式 */
.record-link,
.user-link,
.problem-link {
  text-decoration: none;
  transition: color 0.2s;
  color: #3498db;
}

.record-link:hover,
.user-link:hover,
.problem-link:hover {
  color: #2980b9;
  text-decoration: underline;
}

/* 结果样式 */
.accepted {
  color: #27ae60;
  font-weight: 500;
}

.rejected {
  color: #e74c3c;
  font-weight: 500;
}

/* 得分样式 */
.high-score {
  color: #27ae60;
  font-weight: 500;
}

.medium-score {
  color: #f39c12;
  font-weight: 500;
}

.low-score {
  color: #e74c3c;
  font-weight: 500;
}

/* 语言标签 */
.lang-badge {
  display: inline-block;
  padding: 3px 8px;
  background-color: #ecf0f1;
  border-radius: 12px;
  font-size: 0.9em;
  color: #2c3e50;
}

/* 简洁视图下的统计信息 */
.compact-stats {
  color: #7f8c8d;
  font-size: 0.85em;
  margin-left: 5px;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  margin-top: 20px;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: white;
  color: #2c3e50;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 36px;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f1f1f1;
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
  padding: 8px 12px;
  color: #7f8c8d;
}

/* 无记录提示 */
.no-records {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-style: italic;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .record-container {
    padding: 10px;
  }

  .record-table th,
  .record-table td {
    padding: 8px 4px;
    font-size: 0.9em;
  }

  .compact-stats {
    display: none;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>
