<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox, ElNotification } from "element-plus";
import { ProblemsControllerService } from "../../../generated/services/ProblemsControllerService.ts";
import MarkdownView from "../components/MarkdownView.vue";

const defaultPicture =
  "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20260315195824468.png";
const defaultExamStartTime = new Date(2026, 0, 1, 0, 0, 0);
const defaultExamEndTime = new Date(2099, 11, 31, 23, 59, 59);
const createExamDraftStorageKey = "admin:exam:create:draft:v1";

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
const timeRange = ref<any[]>([defaultExamStartTime, defaultExamEndTime]);
const problemsList = ref<any[]>([]);
const problemTotal = ref(0);
const loadingProblems = ref(false);
const loadingAllProblems = ref(false);
const submitting = ref(false);
const previewDialog = ref(false);
const previewProblem = ref<any>({});
const problemTableRef = ref<any>();
const selectedCandidates = ref<Record<string, any>>({});
const restoringSelection = ref(false);
const batchScore = ref(5);
const selectedProblems = ref<any[]>([]);
const selectedProblemTableRef = ref<any>();
const selectedBatchScore = ref(5);
const rangeStart = ref(1);
const rangeEnd = ref(1);
const draggedProblemIndex = ref<number | null>(null);

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
const selectedCandidateCount = computed(() => Object.keys(selectedCandidates.value).length);

const buildSearchRequest = (all = false) => {
  const state = currentSearch.value;
  const config = currentTab.value;
  return {
    category: config.category,
    keyword: state.keyword,
    pageNum: state.pageNum,
    pageSize: state.pageSize,
    status: config.status,
    all,
  };
};

const candidateKey = (problem: any) => `${Number(problem.status)}:${Number(problem.problem_id)}`;

const isProblemSelected = (problem: any) =>
  request.value.problemExamProblemInfos.some((item: any) => candidateKey(item) === candidateKey(problem));

const isProblemSelectable = (problem: any) => !isProblemSelected(problem);

const restorePageSelection = async () => {
  await nextTick();
  if (!problemTableRef.value) return;
  restoringSelection.value = true;
  problemTableRef.value.clearSelection();
  problemsList.value.forEach((problem: any) => {
    if (selectedCandidates.value[candidateKey(problem)] && isProblemSelectable(problem)) {
      problemTableRef.value.toggleRowSelection(problem, true);
    }
  });
  await nextTick();
  restoringSelection.value = false;
};

const searchProblems = async () => {
  loadingProblems.value = true;
  try {
    const res = await ProblemsControllerService.searchExamCandidatesUsingPost(buildSearchRequest());
    if (res.code === 0) {
      problemsList.value = res.data?.records || [];
      problemTotal.value = Number(res.data?.total || 0);
      await restorePageSelection();
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
  if (Number(problem.status) === 3) return 4;
  return Number(problem.option_type ?? problem.type ?? 0);
};

const toExamProblem = (problem: any, score: number) => ({
  problem_id: problem.problem_id,
  problem_name: getProblemTitle(problem),
  score,
  status: Number(problem.status),
  type: getProblemQuestionType(problem),
});

const pruneSelectedCandidates = () => {
  selectedCandidates.value = Object.fromEntries(
    Object.entries(selectedCandidates.value).filter(([, problem]) => !isProblemSelected(problem))
  );
};

const mergeProblems = (problems: any[], score: number) => {
  const existingKeys = new Set(request.value.problemExamProblemInfos.map(candidateKey));
  let added = 0;
  problems.forEach((problem: any) => {
    const key = candidateKey(problem);
    if (!existingKeys.has(key)) {
      request.value.problemExamProblemInfos.push(toExamProblem(problem, score));
      existingKeys.add(key);
      added += 1;
    }
  });
  return added;
};

const addProblem = async (problem: any) => {
  if (!mergeProblems([problem], getProblemScore(problem))) {
    ElNotification.warning({ title: "提示", message: "该题目已经添加" });
  }
  pruneSelectedCandidates();
  await restorePageSelection();
};

const handleCandidateSelectionChange = (rows: any[]) => {
  if (restoringSelection.value) return;
  const next = { ...selectedCandidates.value };
  problemsList.value.forEach((problem: any) => delete next[candidateKey(problem)]);
  rows.forEach((problem: any) => {
    if (isProblemSelectable(problem)) next[candidateKey(problem)] = problem;
  });
  selectedCandidates.value = next;
};

const addSelectedProblems = async () => {
  const selected = Object.values(selectedCandidates.value);
  if (!selected.length) {
    ElNotification.warning({ title: "提示", message: "请先勾选题目" });
    return;
  }
  const added = mergeProblems(selected, batchScore.value);
  selectedCandidates.value = {};
  await restorePageSelection();
  ElNotification.success({ title: "批量添加完成", message: `已添加 ${added} 道题，统一分值 ${batchScore.value}` });
};

const addAllSearchResults = async () => {
  if (!problemTotal.value) {
    ElNotification.warning({ title: "提示", message: "当前搜索条件没有可添加的题目" });
    return;
  }
  try {
    await ElMessageBox.confirm(
      `将当前搜索条件匹配的 ${problemTotal.value} 道题全部加入试卷，并统一设置为 ${batchScore.value} 分。`,
      "添加全部搜索结果",
      { confirmButtonText: "确认添加", cancelButtonText: "取消", type: "warning" }
    );
  } catch {
    return;
  }

  loadingAllProblems.value = true;
  try {
    const res = await ProblemsControllerService.searchExamCandidatesUsingPost(buildSearchRequest(true));
    if (res.code !== 0) {
      ElNotification.error({ title: "添加失败", message: res.message || "获取全部题目失败" });
      return;
    }
    const matches = res.data?.records || [];
    const added = mergeProblems(matches, batchScore.value);
    pruneSelectedCandidates();
    await restorePageSelection();
    ElNotification.success({
      title: "批量添加完成",
      message: `匹配 ${matches.length} 道，本次新增 ${added} 道，已跳过 ${matches.length - added} 道重复题目`,
    });
  } catch (err) {
    console.error(err);
    ElNotification.error({ title: "添加失败", message: "获取全部题目失败，请稍后重试" });
  } finally {
    loadingAllProblems.value = false;
  }
};

const removeProblem = async (index: number) => {
  const removedProblem = request.value.problemExamProblemInfos[index];
  request.value.problemExamProblemInfos.splice(index, 1);
  selectedProblems.value = selectedProblems.value.filter((problem) => problem !== removedProblem);
  await restorePageSelection();
};

const handleSelectedProblemSelectionChange = (rows: any[]) => {
  selectedProblems.value = rows;
};

const selectProblemRange = () => {
  const total = request.value.problemExamProblemInfos.length;
  const start = Math.floor(Number(rangeStart.value));
  const end = Math.floor(Number(rangeEnd.value));
  if (!total || !Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > total) {
    ElNotification.warning({ title: "范围无效", message: `请输入 1-${total || 1} 之间的有效题号范围` });
    return;
  }

  selectedProblemTableRef.value?.clearSelection();
  request.value.problemExamProblemInfos.slice(start - 1, end).forEach((problem: any) => {
    selectedProblemTableRef.value?.toggleRowSelection(problem, true);
  });
};

const applyBatchScore = () => {
  if (!selectedProblems.value.length) {
    ElNotification.warning({ title: "提示", message: "请先勾选要设置分数的题目" });
    return;
  }
  const score = Number(selectedBatchScore.value);
  if (!Number.isFinite(score) || score < 1) {
    ElNotification.warning({ title: "分值无效", message: "分值必须是大于等于 1 的数字" });
    return;
  }
  selectedProblems.value.forEach((problem) => {
    problem.score = score;
  });
  ElNotification.success({ title: "批量设置完成", message: `已将 ${selectedProblems.value.length} 道题设置为 ${score} 分` });
};

const removeSelectedProblems = async () => {
  if (!selectedProblems.value.length) {
    ElNotification.warning({ title: "提示", message: "请先勾选要删除的题目" });
    return;
  }
  try {
    await ElMessageBox.confirm(
      `确定删除已勾选的 ${selectedProblems.value.length} 道题目吗？`,
      "批量删除题目",
      { confirmButtonText: "确认删除", cancelButtonText: "取消", type: "warning" }
    );
  } catch {
    return;
  }

  const selectedKeys = new Set(selectedProblems.value.map(candidateKey));
  request.value.problemExamProblemInfos = request.value.problemExamProblemInfos.filter(
    (problem: any) => !selectedKeys.has(candidateKey(problem))
  );
  selectedProblems.value = [];
  selectedProblemTableRef.value?.clearSelection();
  ElNotification.success({ title: "删除完成", message: "已删除勾选题目" });
};

const startProblemDrag = (index: number, event: DragEvent) => {
  draggedProblemIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  }
};

const dropProblem = (targetIndex: number, event: DragEvent) => {
  event.preventDefault();
  const dataIndex = event.dataTransfer ? Number(event.dataTransfer.getData("text/plain")) : NaN;
  const sourceIndex = draggedProblemIndex.value ?? (Number.isInteger(dataIndex) ? dataIndex : null);
  if (
    sourceIndex === null ||
    sourceIndex < 0 ||
    sourceIndex >= request.value.problemExamProblemInfos.length ||
    sourceIndex === targetIndex
  ) {
    draggedProblemIndex.value = null;
    return;
  }

  const targetElement = event.currentTarget;
  const dropAfterTarget =
    targetElement instanceof HTMLElement && event.clientY > targetElement.getBoundingClientRect().top + targetElement.clientHeight / 2;
  let insertIndex = targetIndex + (dropAfterTarget ? 1 : 0);
  if (sourceIndex < insertIndex) insertIndex -= 1;
  const [movedProblem] = request.value.problemExamProblemInfos.splice(sourceIndex, 1);
  request.value.problemExamProblemInfos.splice(insertIndex, 0, movedProblem);
  draggedProblemIndex.value = null;
};

const finishProblemDrag = () => {
  draggedProblemIndex.value = null;
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

const questionTypeClass = (type?: number) => {
  if (type === 0) return "question-type-short-answer";
  if (type === 1) return "question-type-single-choice";
  if (type === 2) return "question-type-multiple-choice";
  if (type === 3) return "question-type-fill";
  if (type === 4) return "question-type-algorithm";
  return "question-type-unknown";
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

const restoreCreateExamDraft = () => {
  if (isEditMode.value) return;
  try {
    const draftText = localStorage.getItem(createExamDraftStorageKey);
    if (!draftText) return;
    const draft = JSON.parse(draftText);
    if (draft?.request && typeof draft.request === "object") {
      request.value = {
        ...request.value,
        ...draft.request,
        exam_id: undefined,
        password: "",
        problemExamProblemInfos: Array.isArray(draft.request.problemExamProblemInfos)
          ? draft.request.problemExamProblemInfos
          : [],
      };
    }
    if (Array.isArray(draft?.timeRange) && draft.timeRange.length === 2) {
      const start = new Date(draft.timeRange[0]);
      const end = new Date(draft.timeRange[1]);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        timeRange.value = [start, end];
      }
    }
  } catch (err) {
    console.error("恢复考试草稿失败", err);
    localStorage.removeItem(createExamDraftStorageKey);
  }
};

const saveCreateExamDraft = () => {
  if (isEditMode.value) return;
  const draftRequest = { ...request.value };
  delete draftRequest.password;
  try {
    localStorage.setItem(
      createExamDraftStorageKey,
      JSON.stringify({
        request: draftRequest,
        timeRange: timeRange.value.map((item: any) => new Date(item).getTime()),
        savedAt: Date.now(),
      })
    );
  } catch (err) {
    console.error("保存考试草稿失败", err);
  }
};

const submitExam = async () => {
  if (!validateExam()) return;

  submitting.value = true;
  request.value.start_date = new Date(timeRange.value[0]).getTime();
  request.value.end_date = new Date(timeRange.value[1]).getTime();

  try {
    const res = await ProblemsControllerService.problemExamEditUsingPost(request.value);
    if (res.code === 0) {
      if (!isEditMode.value) {
        saveCreateExamDraft();
      }
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

restoreCreateExamDraft();

watch([request, timeRange], saveCreateExamDraft, { deep: true });

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

      <div class="batch-toolbar">
        <div class="batch-score-control">
          <span>统一分值</span>
          <el-input-number v-model="batchScore" :min="1" :max="1000" controls-position="right" />
        </div>
        <div class="batch-actions">
          <el-button type="primary" :disabled="!selectedCandidateCount" @click="addSelectedProblems">
            添加已勾选（{{ selectedCandidateCount }}）
          </el-button>
          <el-button
            :loading="loadingAllProblems"
            :disabled="!problemTotal"
            @click="addAllSearchResults"
          >
            添加全部搜索结果（{{ problemTotal }}）
          </el-button>
        </div>
      </div>

      <el-table
        ref="problemTableRef"
        :data="problemsList"
        :row-key="candidateKey"
        v-loading="loadingProblems"
        class="data-table"
        border
        @selection-change="handleCandidateSelectionChange"
      >
        <el-table-column type="selection" width="48" :selectable="isProblemSelectable" />
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
              <button
                class="action-btn"
                :class="{ primary: !isProblemSelected(scope.row), selected: isProblemSelected(scope.row) }"
                type="button"
                :disabled="isProblemSelected(scope.row)"
                @click="addProblem(scope.row)"
              >
                {{ isProblemSelected(scope.row) ? "已添加" : "添加" }}
              </button>
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
          :total="problemTotal"
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
            <div class="panel-desc">拖动题目前的手柄调整顺序；勾选题目后可批量改分或删除。</div>
          </div>
          <el-tag size="large">总分 {{ totalScore }}</el-tag>
        </div>
      </template>

      <div class="selected-toolbar">
        <div class="range-select-control">
          <span class="toolbar-label">按序号勾选</span>
          <el-input-number v-model="rangeStart" :min="1" :max="request.problemExamProblemInfos.length || 1" />
          <span class="range-separator">至</span>
          <el-input-number v-model="rangeEnd" :min="1" :max="request.problemExamProblemInfos.length || 1" />
          <el-button @click="selectProblemRange">选择范围</el-button>
        </div>
        <div class="selected-batch-actions">
          <span class="selected-count">已选 {{ selectedProblems.length }} 题</span>
          <span class="range-separator">设为</span>
          <el-input-number v-model="selectedBatchScore" :min="1" :max="1000" controls-position="right" />
          <el-button type="primary" :disabled="!selectedProblems.length" @click="applyBatchScore">
            统一设置分数
          </el-button>
          <el-button type="danger" plain :disabled="!selectedProblems.length" @click="removeSelectedProblems">
            批量删除
          </el-button>
        </div>
      </div>

      <el-table
        ref="selectedProblemTableRef"
        :data="request.problemExamProblemInfos"
        :row-key="candidateKey"
        class="data-table selected-problem-table"
        border
        empty-text="暂未添加题目"
        @selection-change="handleSelectedProblemSelectionChange"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column label="序号" type="index" width="70" />
        <el-table-column label="排序" width="76" align="center">
          <template #default="scope">
            <span
              class="drag-handle"
              :class="{ dragging: draggedProblemIndex === scope.$index }"
              draggable="true"
              title="拖动调整顺序"
              @dragstart="startProblemDrag(scope.$index, $event)"
              @dragover.prevent
              @drop="dropProblem(scope.$index, $event)"
              @dragend="finishProblemDrag"
            >
              ⋮⋮
            </span>
          </template>
        </el-table-column>
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
        <el-table-column label="题型" width="130">
          <template #default="scope">
            <el-tag
              class="question-type-tag"
              :class="questionTypeClass(scope.row.type)"
              effect="light"
            >
              {{ questionTypeText(scope.row.type) }}
            </el-tag>
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

.batch-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.batch-score-control,
.batch-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.batch-score-control span {
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.selected-toolbar,
.range-select-control,
.selected-batch-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selected-toolbar {
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.toolbar-label,
.selected-count {
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.range-separator {
  color: #64748b;
  font-size: 13px;
}

.drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 30px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
  color: #64748b;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -3px;
  cursor: grab;
  user-select: none;
}

.drag-handle:active,
.drag-handle.dragging {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
  cursor: grabbing;
}

.question-type-tag {
  min-width: 58px;
  justify-content: center;
  border-width: 1px;
  font-weight: 700;
}

.question-type-short-answer {
  color: #9a3412;
  border-color: #fdba74;
  background: #fff7ed;
}

.question-type-single-choice {
  color: #1d4ed8;
  border-color: #93c5fd;
  background: #eff6ff;
}

.question-type-multiple-choice {
  color: #6d28d9;
  border-color: #c4b5fd;
  background: #f5f3ff;
}

.question-type-fill {
  color: #047857;
  border-color: #6ee7b7;
  background: #ecfdf5;
}

.question-type-algorithm {
  color: #be123c;
  border-color: #fda4af;
  background: #fff1f2;
}

.question-type-unknown {
  color: #475569;
  border-color: #cbd5e1;
  background: #f1f5f9;
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

.action-btn.selected,
.action-btn.selected:hover {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
  cursor: default;
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
  .search-actions,
  .batch-toolbar,
  .batch-actions,
  .selected-toolbar,
  .range-select-control,
  .selected-batch-actions {
    width: 100%;
  }

  .search-actions,
  .batch-toolbar {
    grid-template-columns: 1fr;
  }

  .batch-toolbar,
  .batch-actions,
  .selected-toolbar,
  .range-select-control,
  .selected-batch-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .range-select-control :deep(.el-input-number),
  .selected-batch-actions :deep(.el-input-number) {
    width: 100%;
  }
}
</style>
