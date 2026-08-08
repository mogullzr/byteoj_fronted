<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElNotification } from "element-plus";
import {
  Calendar,
  Clock,
  EditPen,
  Plus,
  Refresh,
  Search,
  Tickets,
  User,
} from "@element-plus/icons-vue";
import { SearchControllerService } from "../../../generated";

const router = useRouter();

const loading = ref(false);
const examList = ref<any[]>([]);
const totalRecords = ref(0);
const searchRequest = ref<any>({
  category: "exam",
  keyword: "",
  pageNum: 1,
  pageSize: 10,
});

const pagerTotal = computed(() => totalRecords.value);
const monitoredCount = computed(() => examList.value.filter((exam) => exam.status === 1).length);

const searchExams = async () => {
  loading.value = true;
  try {
    const res = await SearchControllerService.searchAllUsingPost(searchRequest.value);
    if (res.code === 0) {
      examList.value = res.data?.dataList || res.data?.problemExamVoList || [];
      // The search API puts the total record count in `pages` on the first
      // record of each page. Element Plus expects that value as `total`.
      const firstRecord = examList.value[0];
      totalRecords.value = Number.isFinite(Number(firstRecord?.pages))
        ? Number(firstRecord.pages)
        : examList.value.length === 0
          ? 0
          : (searchRequest.value.pageNum - 1) * searchRequest.value.pageSize + examList.value.length;
    } else {
      ElNotification.error({ title: "查询失败", message: res.message || "考试查询失败" });
    }
  } catch (err) {
    console.error(err);
    ElNotification.error({ title: "查询失败", message: "考试查询失败，请稍后重试" });
  } finally {
    loading.value = false;
  }
};

const resetSearch = async () => {
  searchRequest.value.keyword = "";
  searchRequest.value.pageNum = 1;
  await searchExams();
};

const changePage = async (page: number) => {
  searchRequest.value.pageNum = page;
  await searchExams();
};

const changePageSize = async (size: number) => {
  searchRequest.value.pageSize = size;
  searchRequest.value.pageNum = 1;
  await searchExams();
};

const editExam = (exam: any) => {
  router.push({
    path: "/exam/edit",
    query: { exam_id: exam.exam_id },
  });
};

const createExam = () => {
  router.push("/exam/add");
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const statusText = (status?: number) => {
  if (status === 0) return "自由考试";
  if (status === 1) return "监控考试";
  if (status === 2) return "自由练习";
  return "未知";
};

const statusTag = (status?: number) => {
  if (status === 0) return "success";
  if (status === 1) return "warning";
  if (status === 2) return "info";
  return "";
};

onMounted(searchExams);
</script>

<template>
  <div class="exam-management">
    <div class="page-shell">
      <header class="page-header">
        <div class="page-heading">
          <div class="heading-icon" aria-hidden="true">
            <el-icon><Tickets /></el-icon>
          </div>
          <div class="page-title">
            <div class="eyebrow">EXAM CENTER</div>
            <h1>考试管理</h1>
            <p>集中查看考试安排、开放状态和参与情况。</p>
          </div>
        </div>
        <el-button type="primary" size="large" @click="createExam">
          <el-icon><Plus /></el-icon>
          创建考试
        </el-button>
      </header>

      <section class="overview-strip" aria-label="考试概览">
        <div class="overview-item">
          <span class="overview-label">考试总数</span>
          <strong>{{ totalRecords }}</strong>
          <span class="overview-note">当前检索范围</span>
        </div>
        <div class="overview-item">
          <span class="overview-label">本页记录</span>
          <strong>{{ examList.length }}</strong>
          <span class="overview-note">第 {{ searchRequest.pageNum }} 页</span>
        </div>
        <div class="overview-item">
          <span class="overview-label">监控考试</span>
          <strong>{{ monitoredCount }}</strong>
          <span class="overview-note">当前页面</span>
        </div>
      </section>

      <el-card shadow="never" class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">考试列表</div>
            <div class="panel-desc">输入考试名称或 ID 快速定位记录。</div>
          </div>
          <div class="toolbar">
            <el-input
              v-model="searchRequest.keyword"
              placeholder="搜索考试名称或考试 ID"
              clearable
              @keyup.enter="changePage(1)"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="changePage(1)">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </div>

        <el-table
          :data="examList"
          v-loading="loading"
          class="data-table"
          empty-text="暂无考试记录"
        >
          <el-table-column label="考试" min-width="280">
            <template #default="scope">
              <div class="exam-cell">
                <el-image
                  v-if="scope.row.picture"
                  :src="scope.row.picture"
                  fit="cover"
                  class="cover"
                  :preview-src-list="[scope.row.picture]"
                  preview-teleported
                >
                  <template #error>
                    <div class="image-fallback"><el-icon><Tickets /></el-icon></div>
                  </template>
                </el-image>
                <div v-else class="cover image-fallback"><el-icon><Tickets /></el-icon></div>
                <div class="exam-info">
                  <div class="exam-name">{{ scope.row.exam_name || "未命名考试" }}</div>
                  <div class="exam-meta">
                    <span>#{{ scope.row.exam_id || "-" }}</span>
                    <span><el-icon><User /></el-icon>{{ scope.row.author || "未知创建者" }}</span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="scope">
              <el-tag :type="statusTag(scope.row.status)" effect="light" round>
                {{ statusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="参与情况" width="130">
            <template #default="scope">
              <div class="metric-cell">
                <strong>{{ scope.row.joins ?? 0 }}</strong>
                <span>人参与</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="时长" width="130">
            <template #default="scope">
              <div class="icon-text">
                <el-icon><Clock /></el-icon>
                {{ scope.row.time ? scope.row.time + " 分钟" : "不限时" }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="时间安排" min-width="230">
            <template #default="scope">
              <div class="schedule-cell">
                <span><el-icon><Calendar /></el-icon>{{ formatDate(scope.row.start_time) }}</span>
                <span><el-icon><Clock /></el-icon>{{ formatDate(scope.row.end_time) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right" align="center">
            <template #default="scope">
              <el-tooltip content="编辑考试" placement="top">
                <el-button class="icon-action" type="primary" plain circle @click="editExam(scope.row)">
                  <el-icon><EditPen /></el-icon>
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="pagerTotal > 0" class="pager">
          <el-pagination
            v-model:current-page="searchRequest.pageNum"
            v-model:page-size="searchRequest.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="pagerTotal"
            layout="total, sizes, prev, pager, next"
            @current-change="changePage"
            @size-change="changePageSize"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.exam-management {
  --exam-primary: #2563eb;
  --exam-primary-dark: #1d4ed8;
  --exam-text: #172033;
  --exam-muted: #667085;
  --exam-border: #e5eaf1;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 28px;
  background: #f4f7fb;
  color: var(--exam-text);
}

.page-shell {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}

.exam-management :deep(.el-button) {
  font-weight: 600;
}

.exam-management :deep(.el-button--primary:not(.is-plain)) {
  background: var(--exam-primary);
  border-color: var(--exam-primary);
}

.exam-management :deep(.el-button--primary:not(.is-plain):hover) {
  background: var(--exam-primary-dark);
  border-color: var(--exam-primary-dark);
}

.exam-management :deep(.el-input__wrapper) {
  min-height: 38px;
  box-shadow: 0 0 0 1px #d7deea inset;
}

.exam-management :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--exam-primary) inset;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.page-heading {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 16px;
}

.heading-icon {
  display: grid;
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid #cfe0ff;
  border-radius: 8px;
  background: #eaf2ff;
  color: var(--exam-primary);
  font-size: 24px;
}

.page-title {
  min-width: 0;
}

.eyebrow {
  margin-bottom: 4px;
  color: var(--exam-primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
}

.page-header h1 {
  margin: 0;
  color: #101828;
  font-size: 26px;
  line-height: 1.25;
}

.page-header p {
  margin: 5px 0 0;
  color: var(--exam-muted);
  font-size: 14px;
}

.overview-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 18px;
  border: 1px solid var(--exam-border);
  border-radius: 8px;
  background: #fff;
}

.overview-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 16px;
  padding: 17px 20px;
}

.overview-item + .overview-item {
  border-left: 1px solid var(--exam-border);
}

.overview-label,
.overview-note {
  color: var(--exam-muted);
  font-size: 13px;
}

.overview-item strong {
  grid-row: 1 / span 2;
  grid-column: 2;
  align-self: center;
  color: #101828;
  font-size: 24px;
  line-height: 1;
}

.overview-note {
  font-size: 12px;
}

.panel {
  border: 1px solid var(--exam-border);
  border-radius: 8px;
  background: #fff;
}

.exam-management :deep(.panel > .el-card__body) {
  padding: 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.panel-title {
  color: #101828;
  font-size: 17px;
  font-weight: 700;
}

.panel-desc {
  margin-top: 4px;
  color: var(--exam-muted);
  font-size: 13px;
}

.toolbar {
  display: grid;
  grid-template-columns: minmax(260px, 360px) auto auto;
  gap: 10px;
  align-items: center;
}

.data-table {
  width: 100%;
}

.exam-management :deep(.el-table) {
  --el-table-border-color: #edf0f4;
  --el-table-header-bg-color: #f8fafc;
  --el-table-row-hover-bg-color: #f7faff;
}

.exam-management :deep(.el-table::before) {
  display: none;
}

.exam-management :deep(.el-table th.el-table__cell) {
  height: 46px;
  color: #475467;
  font-size: 13px;
  font-weight: 700;
}

.exam-management :deep(.el-table td.el-table__cell) {
  padding: 13px 0;
  color: #344054;
}

.exam-cell {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 12px;
}

.cover {
  flex: 0 0 72px;
  width: 72px;
  height: 48px;
  overflow: hidden;
  border: 1px solid var(--exam-border);
  border-radius: 6px;
  background: #f2f4f7;
}

.image-fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #98a2b3;
  font-size: 20px;
}

.exam-info {
  min-width: 0;
}

.exam-name {
  overflow: hidden;
  color: #101828;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exam-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
  color: var(--exam-muted);
  font-size: 12px;
}

.exam-meta span,
.icon-text,
.schedule-cell span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.metric-cell {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.metric-cell strong {
  color: #101828;
  font-size: 17px;
}

.metric-cell span {
  color: var(--exam-muted);
  font-size: 12px;
}

.icon-text {
  color: #475467;
}

.icon-text .el-icon,
.schedule-cell .el-icon {
  color: #98a2b3;
}

.schedule-cell {
  display: grid;
  gap: 7px;
  color: #475467;
  font-size: 13px;
}

.icon-action {
  width: 32px;
  height: 32px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  padding-top: 18px;
}

@media (max-width: 900px) {
  .exam-management {
    padding: 20px;
  }

  .panel-header {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar {
    grid-template-columns: minmax(0, 1fr) auto auto;
  }
}

@media (max-width: 640px) {
  .exam-management {
    padding: 16px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .page-heading {
    align-items: flex-start;
  }

  .page-header h1 {
    font-size: 23px;
  }

  .overview-strip {
    grid-template-columns: 1fr;
  }

  .overview-item + .overview-item {
    border-top: 1px solid var(--exam-border);
    border-left: 0;
  }

  .toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .toolbar .el-input {
    grid-column: 1 / -1;
  }

  .pager {
    justify-content: flex-start;
    overflow-x: auto;
  }
}
</style>
