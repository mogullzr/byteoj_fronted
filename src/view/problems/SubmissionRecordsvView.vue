<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import dayjs from "dayjs";
import { ProblemAlgorithmControllerService, type SubmissionsAlgorithmRecordsVo } from "../../../generated";
import UserStore from "@/store/user";

const userStore = UserStore();
const records = ref<SubmissionsAlgorithmRecordsVo[]>([]);
const currentPage = ref(1);
const pageSum = ref(1);
const pageSize = 20;
const selectedStatus = ref("");
const usernameKeyword = ref("");
const problemKeyword = ref("");
const selectedLanguage = ref("");
const startTime = ref("");
const endTime = ref("");
const showChineseStatus = ref(false);
const autoRefresh = ref(true);
const loading = ref(false);
const errorMessage = ref("");
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const statusOptionDefinitions = [
  { value: "", zh: "全部状态", en: "All statuses" },
  { value: "Pending", zh: "等待队列", en: "Pending" },
  { value: "Accepted", zh: "答案正确", en: "Accepted" },
  { value: "Wrong Answer", zh: "答案错误", en: "Wrong Answer" },
  { value: "Compile Error", zh: "编译错误", en: "Compile Error" },
  { value: "Time Limit Exceeded", zh: "运行超时", en: "Time Limit Exceeded" },
  { value: "Memory Limit Exceeded", zh: "内存超限", en: "Memory Limit Exceeded" },
  { value: "Output Limit Exceeded", zh: "输出超限", en: "Output Limit Exceeded" },
  { value: "Runtime Error", zh: "运行错误", en: "Runtime Error" },
  { value: "Internal Error", zh: "系统错误", en: "Internal Error" },
];
const statusOptions = computed(() => statusOptionDefinitions.map((option) => ({
  value: option.value,
  label: showChineseStatus.value ? option.zh : option.en,
})));
const languageOptions = ["C++", "C", "Python", "Java", "Go", "JavaScript"];

const pendingCount = computed(() => records.value.filter((record) => record.result === "Pending").length);

const isOwner = (record: SubmissionsAlgorithmRecordsVo) =>
    Number(record.uuid) === Number(userStore.loginUser.uuid);

const detailPath = (record: SubmissionsAlgorithmRecordsVo) =>
    `/problems/${record.problem_id}/records/${record.submission_id}`;

const statusMeta = (result: any) => {
  const map: Record<string, { zh: string; en: string; className: string }> = {
    Pending: { zh: "等待沙箱队列", en: "Pending", className: "pending" },
    Running: { zh: "正在评测", en: "Running", className: "running" },
    Accepted: { zh: "答案正确", en: "Accepted", className: "accepted" },
    "Wrong Answer": { zh: "答案错误", en: "Wrong Answer", className: "wrong" },
    "Compile Error": { zh: "编译错误", en: "Compile Error", className: "compile" },
    "Time Limit Exceeded": { zh: "运行超时", en: "Time Limit Exceeded", className: "limit" },
    "Memory Limit Exceeded": { zh: "内存超限", en: "Memory Limit Exceeded", className: "limit" },
    "Output Limit Exceeded": { zh: "输出超限", en: "Output Limit Exceeded", className: "limit" },
    "Runtime Error": { zh: "运行错误", en: "Runtime Error", className: "error" },
    "Segmentation Fault": { zh: "段错误", en: "Segmentation Fault", className: "error" },
    Signalled: { zh: "进程被终止", en: "Signalled", className: "error" },
    "Internal Error": { zh: "系统错误", en: "Internal Error", className: "error" },
    BYTEOJ_SYSTEM_ERROR: { zh: "系统错误", en: "System Error", className: "error" },
    NOT_FOUND_ERROR: { zh: "配置缺失", en: "Not Found", className: "error" },
    Failed: { zh: "评测失败", en: "Failed", className: "error" },
  };
  const fallback = String(result || "Unknown");
  const meta = map[String(result)] || { zh: fallback, en: fallback, className: "error" };
  return { text: showChineseStatus.value ? meta.zh : meta.en, className: meta.className };
};

const sandboxLabel = (record: SubmissionsAlgorithmRecordsVo) => {
  const sandboxIndex = Number(record.sandbox_index);
  if (Number.isInteger(sandboxIndex) && sandboxIndex >= 0 && sandboxIndex < 10) {
    return showChineseStatus.value
        ? `沙箱 ${sandboxIndex + 1} / 10`
        : `Sandbox ${sandboxIndex + 1} / 10`;
  }
  return showChineseStatus.value ? "正在分配沙箱" : "Assigning sandbox";
};

const fetchRecords = async (page = currentPage.value, silent = false) => {
  if (loading.value) return;
  if (!silent) loading.value = true;
  errorMessage.value = "";
  try {
    const response = await ProblemAlgorithmControllerService.problemAlgorithmRecordsGlobalByPageUsingPost(
        page,
        pageSize,
        selectedStatus.value || undefined,
        usernameKeyword.value.trim() || undefined,
        problemKeyword.value.trim() || undefined,
        selectedLanguage.value || undefined,
        startTime.value || undefined,
        endTime.value || undefined
    );
    if (response.code !== 0) throw new Error(response.message || "提交记录加载失败");
    records.value = response.data || [];
    currentPage.value = page;
    pageSum.value = Number(records.value[0]?.page_num || 1);
  } catch (error: any) {
    errorMessage.value = error?.message || "提交记录加载失败";
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  if (startTime.value && endTime.value && startTime.value > endTime.value) {
    errorMessage.value = "开始时间不能晚于结束时间";
    return;
  }
  void fetchRecords(1);
};

const resetFilters = () => {
  selectedStatus.value = "";
  usernameKeyword.value = "";
  problemKeyword.value = "";
  selectedLanguage.value = "";
  startTime.value = "";
  endTime.value = "";
  void fetchRecords(1);
};

const changePage = (page: number) => {
  if (page < 1 || page > pageSum.value || page === currentPage.value) return;
  void fetchRecords(page);
};

const visiblePages = computed(() => {
  const pages = new Set([1, pageSum.value]);
  for (let page = currentPage.value - 2; page <= currentPage.value + 2; page++) {
    if (page >= 1 && page <= pageSum.value) pages.add(page);
  }
  return [...pages].sort((a, b) => a - b);
});

onMounted(() => {
  void fetchRecords(1);
  refreshTimer = setInterval(() => {
    if (autoRefresh.value && document.visibilityState === "visible") void fetchRecords(currentPage.value, true);
  }, 5000);
});

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<template>
  <main class="submission-page">
    <header class="page-header">
      <div>
        <h1>全站提交记录</h1>
        <p>当前页等待队列：<strong>{{ pendingCount }}</strong></p>
      </div>
      <div class="page-controls">
        <button
          type="button"
          class="language-toggle"
          :aria-label="showChineseStatus ? '切换为英文状态' : '切换为中文状态'"
          @click="showChineseStatus = !showChineseStatus"
        >
          {{ showChineseStatus ? "English" : "中文" }}
        </button>
        <label class="refresh-control">
          <input v-model="autoRefresh" type="checkbox" />
          自动刷新
        </label>
        <button type="button" :disabled="loading" @click="fetchRecords(currentPage)">刷新</button>
      </div>
    </header>

    <form class="filter-bar" @submit.prevent="applyFilters">
      <div class="filter-grid">
        <label class="filter-field">
          <span>用户名</span>
          <input v-model="usernameKeyword" type="search" placeholder="输入用户名" autocomplete="off" />
        </label>
        <label class="filter-field">
          <span>题目</span>
          <input v-model="problemKeyword" type="search" placeholder="题目 ID 或名称" autocomplete="off" />
        </label>
        <label class="filter-field">
          <span>语言</span>
          <select v-model="selectedLanguage">
            <option value="">全部语言</option>
            <option v-for="language in languageOptions" :key="language" :value="language">{{ language }}</option>
          </select>
        </label>
        <label class="filter-field">
          <span>状态</span>
          <select v-model="selectedStatus">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
        <label class="filter-field time-field">
          <span>开始时间</span>
          <input v-model="startTime" type="datetime-local" />
        </label>
        <label class="filter-field time-field">
          <span>结束时间</span>
          <input v-model="endTime" type="datetime-local" />
        </label>
      </div>
      <div class="filter-actions">
        <button type="button" :disabled="loading" @click="resetFilters">重置</button>
        <button type="submit" class="primary-action" :disabled="loading">查询</button>
      </div>
    </form>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <section class="table-wrap" :aria-busy="loading">
      <table>
        <thead>
          <tr>
            <th>提交编号</th>
            <th>提交者</th>
            <th>题目</th>
            <th>状态</th>
            <th>语言</th>
            <th>时间 / 内存</th>
            <th>代码长度</th>
            <th>提交时间</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="record in records"
            :key="record.submission_id"
            :class="{ 'pending-row': record.result === 'Pending' }"
          >
            <td>
              <router-link v-if="isOwner(record)" :to="detailPath(record)" class="detail-link">
                #{{ record.submission_id }}
              </router-link>
              <span v-else class="locked" title="仅提交者本人可以查看详情">#{{ record.submission_id }}</span>
            </td>
            <td>
              <router-link :to="`/user/space/${record.uuid}`" class="user-link">{{ record.user_name }}</router-link>
            </td>
            <td>
              <router-link :to="`/problems/algorithm/${record.problem_id}`" class="problem-link">
                {{ record.chinese_name }}
              </router-link>
            </td>
            <td>
              <template v-if="record.result === 'Pending'">
                <router-link v-if="isOwner(record)" :to="detailPath(record)" class="pending-status-card">
                  <span class="pending-signal" aria-hidden="true"></span>
                  <span class="pending-copy">
                    <strong>{{ statusMeta(record.result).text }}</strong>
                    <small>{{ sandboxLabel(record) }}</small>
                  </span>
                </router-link>
                <span v-else class="pending-status-card">
                  <span class="pending-signal" aria-hidden="true"></span>
                  <span class="pending-copy">
                    <strong>{{ statusMeta(record.result).text }}</strong>
                    <small>{{ sandboxLabel(record) }}</small>
                  </span>
                </span>
              </template>
              <template v-else>
                <router-link v-if="isOwner(record)" :to="detailPath(record)"
                             class="status" :class="statusMeta(record.result).className">
                  {{ statusMeta(record.result).text }}
                </router-link>
                <span v-else class="status" :class="statusMeta(record.result).className">
                  {{ statusMeta(record.result).text }}
                </span>
              </template>
            </td>
            <td>{{ record.language || "-" }}</td>
            <td>{{ record.time_used || 0 }}ms / {{ record.memory_used || 0 }}MB</td>
            <td>{{ record.code_length || 0 }}B</td>
            <td>{{ dayjs(record.submit_time).format("YYYY-MM-DD HH:mm:ss") }}</td>
          </tr>
          <tr v-if="!loading && records.length === 0">
            <td colspan="8" class="empty">暂无符合条件的提交记录</td>
          </tr>
        </tbody>
      </table>
      <div v-if="loading" class="loading">正在加载提交记录...</div>
    </section>

    <nav v-if="pageSum > 1" class="pagination" aria-label="提交记录分页">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</button>
      <template v-for="(page, index) in visiblePages" :key="page">
        <span v-if="index > 0 && page - visiblePages[index - 1] > 1">...</span>
        <button :class="{ active: page === currentPage }" @click="changePage(page)">{{ page }}</button>
      </template>
      <button :disabled="currentPage === pageSum" @click="changePage(currentPage + 1)">下一页</button>
    </nav>
  </main>
</template>

<style scoped>
.submission-page {
  /* BasicLayout 为普通页面预留了 80px 顶部空间，工作区向上覆盖它，避免露出原背景。 */
  width: 100%;
  margin: -80px 0 0;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 110px 20px 56px;
  background: #f4f6f8;
  color: #1f2937;
}
.page-header,
.filter-bar,
.table-wrap,
.pagination,
.error-message {
  width: min(1320px, 100%);
  margin-left: auto;
  margin-right: auto;
}
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
}
h1 { margin: 0 0 8px; color: #172033; font-size: 26px; line-height: 1.25; font-weight: 700; letter-spacing: 0; }
.page-header p { margin: 0; color: #64748b; font-size: 14px; }
.page-header strong { display: inline-block; min-width: 22px; margin-left: 3px; color: #b45309; font-variant-numeric: tabular-nums; }
.page-controls { display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
select, .filter-field input, .page-controls button, .filter-actions button, .pagination button { min-height: 38px; box-sizing: border-box; border: 1px solid #d5dce5; background: #fff; color: #263244; padding: 0 12px; border-radius: 6px; font: inherit; }
select { min-width: 112px; }
.page-controls button, .filter-actions button, .pagination button { cursor: pointer; transition: border-color .15s ease, color .15s ease, background-color .15s ease; }
.page-controls button:hover, .filter-actions button:hover:not(:disabled), .pagination button:hover:not(:disabled) { border-color: #2563eb; color: #1d4ed8; }
button:disabled { cursor: not-allowed; opacity: .5; }
.refresh-control { display: inline-flex; align-items: center; gap: 7px; min-height: 38px; color: #475569; white-space: nowrap; }
.refresh-control input { width: 15px; height: 15px; margin: 0; accent-color: #2563eb; }
.filter-bar { display: flex; align-items: end; gap: 14px; box-sizing: border-box; margin-bottom: 16px; padding: 14px 0; border-top: 1px solid #dce3eb; border-bottom: 1px solid #dce3eb; }
.filter-grid { display: grid; flex: 1; grid-template-columns: minmax(130px, 1fr) minmax(170px, 1.35fr) minmax(120px, .8fr) minmax(145px, 1fr) minmax(190px, 1.2fr) minmax(190px, 1.2fr); gap: 10px; }
.filter-field { display: flex; min-width: 0; flex-direction: column; gap: 5px; }
.filter-field span { color: #526174; font-size: 12px; font-weight: 600; }
.filter-field input, .filter-field select { width: 100%; min-width: 0; }
.filter-actions { display: flex; gap: 8px; }
.filter-actions .primary-action { border-color: #2563eb; background: #2563eb; color: #fff; }
.filter-actions .primary-action:hover:not(:disabled) { border-color: #1d4ed8; background: #1d4ed8; color: #fff; }
.table-wrap { position: relative; overflow-x: auto; border: 1px solid #dce3eb; background: #fff; border-radius: 7px; box-shadow: 0 2px 8px rgba(15, 23, 42, .04); }
table { width: 100%; min-width: 960px; border-collapse: collapse; }
th { padding: 12px 14px; background: #f7f9fc; border-bottom: 1px solid #dfe5ec; color: #526174; text-align: left; font-size: 13px; font-weight: 600; }
td { padding: 13px 14px; border-bottom: 1px solid #edf0f4; color: #263244; font-size: 14px; white-space: nowrap; }
tbody tr:last-child td { border-bottom: 0; }
tbody tr:hover { background: #fafcff; }
tbody tr.pending-row, tbody tr.pending-row:hover { background: #fffdf5; box-shadow: inset 3px 0 #f59e0b; }
.detail-link, .user-link, .problem-link { color: #2563eb; text-decoration: none; }
.detail-link:hover, .user-link:hover, .problem-link:hover { text-decoration: underline; }
.locked { color: #64748b; cursor: not-allowed; }
.status { display: inline-flex; align-items: center; min-height: 26px; padding: 2px 8px; border-radius: 4px; font-weight: 600; text-decoration: none; }
.status.running { color: #1d4ed8; background: #dbeafe; }
.status.accepted { color: #166534; background: #dcfce7; }
.status.wrong, .status.error { color: #b91c1c; background: #fee2e2; }
.status.compile { color: #7c2d12; background: #ffedd5; }
.status.limit { color: #5b21b6; background: #ede9fe; }
.pending-status-card { display: inline-flex; min-width: 148px; align-items: center; gap: 9px; box-sizing: border-box; padding: 7px 10px; border: 1px solid #f59e0b; border-left-width: 4px; border-radius: 6px; background: #fffbeb; color: #78350f; text-decoration: none; box-shadow: 0 2px 5px rgba(146, 64, 14, .1); }
.pending-status-card:hover { background: #fef3c7; }
.pending-signal { width: 9px; height: 9px; flex: 0 0 9px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 0 4px rgba(245, 158, 11, .17); animation: pending-pulse 1.5s ease-in-out infinite; }
.pending-copy { display: flex; min-width: 0; flex-direction: column; line-height: 1.15; }
.pending-copy strong { font-size: 13px; font-weight: 800; }
.pending-copy small { margin-top: 4px; color: #64748b; font-size: 11px; font-weight: 600; white-space: nowrap; }
@keyframes pending-pulse { 0%, 100% { opacity: .55; transform: scale(.85); } 50% { opacity: 1; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .pending-signal { animation: none; } }
.loading { position: absolute; inset: 0; display: grid; place-items: center; min-height: 150px; background: rgba(255,255,255,.82); color: #475569; }
.empty { height: 140px; text-align: center; color: #94a3b8; }
.error-message { box-sizing: border-box; margin-bottom: 14px; padding: 10px 12px; border: 1px solid #fecaca; background: #fef2f2; color: #b91c1c; border-radius: 6px; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 18px; }
.pagination button.active { border-color: #2563eb; background: #2563eb; color: #fff; }
@media (max-width: 720px) {
  .submission-page { padding: 100px 12px 44px; }
  .page-header { align-items: stretch; flex-direction: column; }
  .page-controls { display: grid; grid-template-columns: 1fr auto; }
  .page-controls select { grid-column: 1 / -1; }
  .filter-bar { align-items: stretch; flex-direction: column; }
  .filter-grid { grid-template-columns: 1fr; }
  .filter-actions { justify-content: flex-end; }
}
@media (min-width: 721px) and (max-width: 1180px) {
  .filter-bar { align-items: stretch; flex-direction: column; }
  .filter-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .filter-actions { justify-content: flex-end; }
}
</style>
