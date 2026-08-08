<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElNotification } from "element-plus";
import { SearchControllerService } from "../../../generated";
import { ProblemsControllerService } from "../../../generated/services/ProblemsControllerService.ts";
import MarkdownView from "../components/MarkdownView.vue";

const defaultPicture =
  "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20260315195824468.png";

const route = useRoute();
const router = useRouter();

const editExamId = computed(() => {
  const value = Number(route.query.exam_id);
  return Number.isInteger(value) && value > 0 ? value : undefined;
});

const request = ref<any>({
  exam_id: editExamId.value,
  exam_name: "",
  password: "",
  picture: defaultPicture,
  start_date: 0,
  end_date: 0,
  status: 0,
  time: 0,
  problemExamProblemInfos: [],
});

const tabConfig: Record<string, any> = {
  algorithm: { label: "算法题", category: "algorithm", status: 3 },
  math: { label: "数学", category: "other", status: 0 },
  "408": { label: "408", category: "other", status: 1 },
  politics: { label: "政治", category: "other", status: 2 },
};

const activeTab = ref("math");
const timeRange = ref<any[]>([]);
const problemsList = ref<any[]>([]);
const loadingProblems = ref(false);
const submitting = ref(false);
const previewDialog = ref(false);
const previewProblem = ref<any>({});

const tabSearchState = reactive<Record<string, any>>({
  algorithm: { keyword: "", pageNum: 1, pageSize: 10 },
  math: { keyword: "", pageNum: 1, pageSize: 10 },
  "408": { keyword: "", pageNum: 1, pageSize: 10 },
  politics: { keyword: "", pageNum: 1, pageSize: 10 },
});

const isEditMode = computed(() => Boolean(editExamId.value));
const currentSearch = computed(() => tabSearchState[activeTab.value]);
const currentTab = computed(() => tabConfig[activeTab.value]);
const totalScore = computed(() =>
  request.value.problemExamProblemInfos.reduce((sum: number, item: any) => sum + Number(item.score || 0), 0)
);
const problemPagerTotal = computed(() => {
  const state = currentSearch.value;
  const base = (state.pageNum - 1) * state.pageSize;
  return problemsList.value.length >= state.pageSize ? base + state.pageSize + 1 : base + problemsList.value.length;
});

const buildSearchRequest = () => {
  const state = currentSearch.value;
  const config = currentTab.value;
  return {
    category: config.category,
    keyword: state.keyword,
    pageNum: state.pageNum,
    pageSize: state.pageSize,
    status: config.status,
  };
};

const searchProblems = async () => {
  loadingProblems.value = true;
  try {
    const res = await SearchControllerService.searchAllUsingPost(buildSearchRequest());
    if (res.code === 0) {
      problemsList.value = res.data?.dataList || [];
    } else {
      ElNotification.error({ title: "查询失败", message: res.message || "题库查询失败" });
    }
  } catch (err) {
    console.error(err);
    ElNotification.error({ title: "查询失败", message: "题库查询失败，请稍后重试" });
  } finally {
    loadingProblems.value = false;
  }
};

const changeTab = async () => {
  await searchProblems();
};

const resetProblemSearch = async () => {
  currentSearch.value.keyword = "";
  currentSearch.value.pageNum = 1;
  await searchProblems();
};

const changeProblemPage = async (page: number) => {
  currentSearch.value.pageNum = page;
  await searchProblems();
};

const changeProblemPageSize = async (size: number) => {
  currentSearch.value.pageSize = size;
  currentSearch.value.pageNum = 1;
  await searchProblems();
};

const getProblemTitle = (problem: any) => {
  return problem.chinese_name || problem.problem_name || "未命名题目";
};

const getProblemScore = (problem: any) => {
  return Number(problem.score || 5);
};

const parseProblemOptions = (problem: any) => {
  if (!problem?.options) return [];
  try {
    const normalized = String(problem.options).replace(/'/g, '"');
    const parsed = JSON.parse(normalized);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch {
    return [];
  }
};

const getProblemQuestionType = (problem: any) => {
  if (activeTab.value === "algorithm") return 4;
  return Number(problem.option_type ?? problem.type ?? 0);
};

const addProblem = (problem: any) => {
  const exist = request.value.problemExamProblemInfos.find((item: any) => item.problem_id === problem.problem_id);
  if (exist) {
    ElNotification.warning({ title: "提示", message: "该题目已经添加" });
    return;
  }

  request.value.problemExamProblemInfos.push({
    problem_id: problem.problem_id,
    problem_name: getProblemTitle(problem),
    score: getProblemScore(problem),
    status: currentTab.value.status,
    type: getProblemQuestionType(problem),
  });
};

const removeProblem = (index: number) => {
  request.value.problemExamProblemInfos.splice(index, 1);
};

const previewProblemDetail = (problem: any) => {
  previewProblem.value = problem;
  previewDialog.value = true;
};

const statusText = (status?: number) => {
  if (status === 0) return "自由考试";
  if (status === 1) return "监控考试";
  if (status === 2) return "自由练习";
  return "未知";
};

const problemTypeText = (status?: number) => {
  if (status === 3) return "算法";
  if (status === 0) return "数学";
  if (status === 1) return "408";
  if (status === 2) return "政治";
  return "未知";
};

const problemTypeTag = (status?: number) => {
  if (status === 3) return "";
  if (status === 0) return "success";
  if (status === 1) return "warning";
  if (status === 2) return "danger";
  return "info";
};

const questionTypeText = (type?: number) => {
  if (type === 0) return "简答";
  if (type === 1) return "单选";
  if (type === 2) return "多选";
  if (type === 3) return "填空";
  if (type === 4) return "算法";
  return "未知";
};

const validateExam = () => {
  if (!request.value.exam_name?.trim()) {
    ElNotification.error({ title: "校验失败", message: "请输入考试名称" });
    return false;
  }
  if (!timeRange.value || timeRange.value.length !== 2) {
    ElNotification.error({ title: "校验失败", message: "请选择考试时间" });
    return false;
  }
  if (!request.value.problemExamProblemInfos.length) {
    ElNotification.error({ title: "校验失败", message: "请至少添加一道题目" });
    return false;
  }
  return true;
};

const submitExam = async () => {
  if (!validateExam()) return;

  submitting.value = true;
  request.value.start_date = new Date(timeRange.value[0]).getTime();
  request.value.end_date = new Date(timeRange.value[1]).getTime();

  try {
    const res = await ProblemsControllerService.problemExamEditUsingPost(request.value);
    if (res.code === 0) {
      ElNotification.success({
        title: "保存成功",
        message: isEditMode.value ? "考试已更新" : "考试已创建",
      });
      router.push("/exam/management");
    } else {
      ElNotification.error({ title: "保存失败", message: res.message || "保存考试失败" });
    }
  } catch (err) {
    console.error(err);
    ElNotification.error({ title: "保存失败", message: "保存考试失败，请稍后重试" });
  } finally {
    submitting.value = false;
  }
};

const loadExamForEdit = async () => {
  const examId = Number(route.query.exam_id);
  if (!examId) return;

  try {
    const [examRes, problemRes] = await Promise.all([
      ProblemsControllerService.problemSearchExamIdUsingGet(examId),
      ProblemsControllerService.problemExamSearchDetailUsingGet(examId),
    ]);

    if (examRes.code === 0 && examRes.data) {
      const exam = examRes.data;
      request.value = {
        ...request.value,
        exam_id: exam.exam_id,
        exam_name: exam.exam_name || "",
        picture: exam.picture || defaultPicture,
        status: exam.status ?? 0,
        time: exam.time ?? 0,
      };
      if (exam.start_time && exam.end_time) {
        timeRange.value = [new Date(exam.start_time), new Date(exam.end_time)];
      }
    }

    if (problemRes.code === 0 && Array.isArray(problemRes.data)) {
      request.value.problemExamProblemInfos = problemRes.data.map((problem: any) => ({
        problem_id: problem.problem_id,
        problem_name: getProblemTitle(problem),
        score: Number(problem.score || 5),
        status: problem.status ?? problem.pages ?? 0,
        type: Number(problem.type ?? problem.option_type ?? 4),
      }));
    }
  } catch (err) {
    console.error(err);
    ElNotification.error({ title: "加载失败", message: "获取考试信息失败" });
  }
};

onMounted(async () => {
  await Promise.all([loadExamForEdit(), searchProblems()]);
});
</script>

<template>
  <div class="exam-editor">
    <div class="page-header">
      <div class="page-title">
        <div class="eyebrow">{{ isEditMode ? "编辑考试" : "创建考试" }}</div>
        <h2>{{ isEditMode ? "编辑考试配置" : "创建一场新考试" }}</h2>
        <p>配置考试基础信息，按题型分页检索题库并组卷。</p>
      </div>
      <div class="header-actions">
        <el-button @click="router.push('/exam/management')">返回管理</el-button>
        <el-button type="primary" :loading="submitting" @click="submitExam">
          {{ isEditMode ? "保存修改" : "创建考试" }}
        </el-button>
      </div>
    </div>

    <el-row :gutter="18">
      <el-col :xs="24" :lg="16">
        <el-card shadow="never" class="panel">
          <template #header>
            <div class="panel-title">考试信息</div>
          </template>

          <el-form label-width="96px" autocomplete="off">
            <el-form-item label="考试名称">
              <el-input
                v-model="request.exam_name"
                name="exam-title"
                autocomplete="off"
                placeholder="请输入考试名称"
              />
            </el-form-item>
            <el-form-item label="考试密码">
              <el-input
                v-model="request.password"
                name="exam-password"
                autocomplete="new-password"
                placeholder="不修改可留空"
                show-password
              />
            </el-form-item>
            <el-form-item label="封面图片">
              <el-input v-model="request.picture" placeholder="请输入封面图片地址" />
            </el-form-item>
            <el-form-item label="考试类型">
              <el-select v-model="request.status" style="width: 220px">
                <el-option label="自由考试" :value="0" />
                <el-option label="监控考试" :value="1" />
                <el-option label="自由练习" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="考试时间">
              <el-date-picker
                v-model="timeRange"
                type="datetimerange"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="考试时长">
              <el-input-number v-model="request.time" :min="0" />
              <span class="form-help">分钟，0 表示不限时</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card shadow="never" class="panel summary-panel">
          <div class="cover-preview">
            <img :src="request.picture || defaultPicture" alt="考试封面" />
          </div>
          <div class="summary-grid">
            <div>
              <span>题目数量</span>
              <strong>{{ request.problemExamProblemInfos.length }}</strong>
            </div>
            <div>
              <span>总分</span>
              <strong>{{ totalScore }}</strong>
            </div>
            <div>
              <span>类型</span>
              <strong>{{ statusText(request.status) }}</strong>
            </div>
          </div>
          <el-button class="submit-main" type="primary" size="large" :loading="submitting" @click="submitExam">
            {{ isEditMode ? "保存修改" : "创建考试" }}
          </el-button>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="panel">
      <template #header>
        <div class="panel-header">
          <div>
            <div class="panel-title">题库选择</div>
            <div class="panel-desc">每种题型都有独立搜索条件和分页状态。</div>
          </div>
          <div class="search-actions">
            <el-input
              v-model="currentSearch.keyword"
              placeholder="搜索题目"
              clearable
              @keyup.enter="changeProblemPage(1)"
            />
            <el-button type="primary" @click="changeProblemPage(1)">搜索</el-button>
            <el-button @click="resetProblemSearch">重置</el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="changeTab">
        <el-tab-pane v-for="tab in Object.entries(tabConfig)" :key="tab[0]" :label="tab[1].label" :name="tab[0]" />
      </el-tabs>

      <el-table :data="problemsList" v-loading="loadingProblems" class="data-table" border>
        <el-table-column label="题号" prop="problem_id" width="110" />
        <el-table-column label="题目">
          <template #default="scope">
            <div class="problem-title">{{ getProblemTitle(scope.row) }}</div>
            <div class="problem-meta">默认分值：{{ getProblemScore(scope.row) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <button class="action-btn primary" type="button" @click="addProblem(scope.row)">添加</button>
              <button class="action-btn" type="button" @click="previewProblemDetail(scope.row)">预览</button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          v-model:current-page="currentSearch.pageNum"
          v-model:page-size="currentSearch.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="problemPagerTotal"
          layout="total, sizes, prev, pager, next"
          @current-change="changeProblemPage"
          @size-change="changeProblemPageSize"
        />
      </div>
    </el-card>

    <el-card shadow="never" class="panel">
      <template #header>
        <div class="panel-header">
          <div>
            <div class="panel-title">已选题目</div>
            <div class="panel-desc">可调整分值；编辑考试时也会提交这一组题目。</div>
          </div>
          <el-tag size="large">总分 {{ totalScore }}</el-tag>
        </div>
      </template>

      <el-table :data="request.problemExamProblemInfos" class="data-table" border empty-text="暂未添加题目">
        <el-table-column label="题号" prop="problem_id" width="110" />
        <el-table-column label="题目">
          <template #default="scope">
            {{ scope.row.problem_name || "题目 " + scope.row.problem_id }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="110">
          <template #default="scope">
            <el-tag :type="problemTypeTag(scope.row.status)">{{ problemTypeText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="题型" width="110">
          <template #default="scope">
            <el-tag type="info">{{ questionTypeText(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分值" width="160">
          <template #default="scope">
            <el-input-number v-model="scope.row.score" :min="1" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="danger" link @click="removeProblem(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="previewDialog" title="题目预览" width="860px">
      <h3>{{ getProblemTitle(previewProblem) }}</h3>
      <el-divider />
      <MarkdownView v-if="previewProblem.description" :generate-data="previewProblem.description" />
      <el-empty v-else description="暂无题目描述" />
      <div v-if="parseProblemOptions(previewProblem).length" class="preview-options">
        <div class="preview-options-title">选项</div>
        <div
          v-for="(option, index) in parseProblemOptions(previewProblem)"
          :key="index"
          class="preview-option"
        >
          <span>{{ String.fromCharCode(65 + index) }}</span>
          <MarkdownView :generate-data="option" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.exam-editor {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 24px;
  background: #f5f7fa;
  color: #1f2937;
}

.exam-editor :deep(.el-card) {
  border: 1px solid #e5e7eb;
}

.exam-editor :deep(.el-card__header) {
  padding: 16px 18px;
  border-bottom: 1px solid #eef2f7;
}

.exam-editor :deep(.el-card__body) {
  padding: 18px;
}

.exam-editor :deep(.el-input__wrapper),
.exam-editor :deep(.el-select__wrapper) {
  box-shadow: 0 0 0 1px #d7dde6 inset;
}

.exam-editor :deep(.el-table th.el-table__cell) {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
}

.exam-editor :deep(.el-table td.el-table__cell) {
  color: #334155;
}

.exam-editor :deep(.el-button--primary) {
  background: #1f2937;
  border-color: #1f2937;
}

.exam-editor :deep(.el-button--primary:hover) {
  background: #111827;
  border-color: #111827;
}

.exam-editor :deep(.el-tabs__active-bar) {
  background: #1f2937;
}

.exam-editor :deep(.el-tabs__item.is-active),
.exam-editor :deep(.el-tabs__item:hover) {
  color: #111827;
}

.page-title {
  min-width: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.page-header,
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-header {
  margin-bottom: 20px;
  padding: 18px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
}

.eyebrow {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 4px;
  background: #1f2937;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.page-header h2 {
  margin: 10px 0 4px;
  color: #111827;
  font-size: 24px;
  line-height: 1.2;
}

.page-header p,
.panel-desc,
.problem-meta,
.form-help {
  color: #64748b;
}

.panel {
  margin-bottom: 18px;
  border-radius: 12px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.search-actions {
  display: grid;
  grid-template-columns: 260px auto auto;
  gap: 10px;
  align-items: center;
}

.summary-panel :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cover-preview {
  overflow: hidden;
  height: 148px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f8fafc;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.summary-grid {
  display: grid;
  gap: 10px;
}

.summary-grid div {
  padding: 13px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.summary-grid span {
  display: block;
  color: #64748b;
  font-size: 12px;
}

.summary-grid strong {
  display: block;
  margin-top: 5px;
  color: #111827;
  font-size: 19px;
}

.problem-title {
  font-weight: 600;
  color: #111827;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.form-help {
  margin-left: 12px;
}

.data-table {
  border-radius: 8px;
  overflow: hidden;
}

.table-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  height: 30px;
  padding: 0 12px;
  border: 1px solid #d7dde6;
  border-radius: 6px;
  background: #fff;
  color: #475569;
  font-size: 13px;
  line-height: 28px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.action-btn:hover {
  border-color: #94a3b8;
  background: #f8fafc;
  color: #111827;
}

.action-btn.primary {
  border-color: #1f2937;
  background: #1f2937;
  color: #fff;
}

.action-btn.primary:hover {
  border-color: #111827;
  background: #111827;
}

.preview-options {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #eef2f7;
}

.preview-options-title {
  margin-bottom: 10px;
  color: #111827;
  font-size: 14px;
  font-weight: 700;
}

.preview-option {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  margin-bottom: 10px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

.preview-option span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #fff;
  color: #334155;
  font-weight: 700;
  border: 1px solid #d7dde6;
}

.submit-main {
  width: 100%;
}

@media (max-width: 980px) {
  .page-header,
  .panel-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions,
  .search-actions {
    width: 100%;
  }

  .search-actions {
    grid-template-columns: 1fr;
  }
}
</style>
