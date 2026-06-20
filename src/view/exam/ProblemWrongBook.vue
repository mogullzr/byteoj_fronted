<template>
  <div class="wrong-book-page">
    <section class="hero-card">
      <div>
        <p class="eyebrow">个人复习中心</p>
        <h1>我的错题本</h1>
        <p class="hero-desc">
          考试失分题会自动进入这里，也可以手动收藏任意题目。先把薄弱点捞出来，再随机练习。
        </p>
      </div>
      <div class="hero-actions">
        <button class="primary-btn" :disabled="randomLoading" @click="randomPractice">
          {{ randomLoading ? "抽题中..." : "随机抽一题" }}
        </button>
        <button class="ghost-btn" @click="resetFilters">重置筛选</button>
      </div>
    </section>

    <section v-if="practiceItem" class="practice-card">
      <div class="practice-top">
        <div>
          <p class="eyebrow">随机练习</p>
          <h2>{{ practiceItem.problem_name || "未命名题目" }}</h2>
        </div>
        <button class="text-btn" @click="practiceItem = null">收起</button>
      </div>

      <div class="meta-row">
        <span>{{ typeLabel(practiceItem.option_type, practiceItem.problem_status) }}</span>
        <span>最近得分 {{ practiceItem.latest_score ?? 0 }} / {{ practiceItem.total_score ?? 0 }}</span>
        <span>累计失分 {{ practiceItem.wrong_count ?? 0 }} 次</span>
      </div>
      <div v-if="practiceItem.tagsList?.length" class="tag-row">
        <span v-for="tag in practiceItem.tagsList" :key="tag" class="tag-chip">{{ tag }}</span>
      </div>

      <details v-if="practiceItem.answerRecords?.length" class="answer-history">
        <summary>历史作答（{{ practiceItem.answerRecords.length }} 次）</summary>
        <div class="answer-record-list">
          <article v-for="record in practiceItem.answerRecords" :key="record.id" class="answer-record-card">
            <div class="record-meta">
              <span>{{ formatDate(record.create_date) }}</span>
              <strong>{{ answerRecordScoreLabel(record) }}</strong>
            </div>
            <div v-if="record.answer" class="record-section">
              <h4>{{ isChoiceQuestion(practiceItem) ? "作答选项" : "我的作答" }}</h4>
              <div v-if="isChoiceQuestion(practiceItem)" class="choice-answer-block">
                <div class="choice-summary">
                  <span>我的选择：{{ answerLettersLabel(record.answer) }}</span>
                  <strong>标准答案：{{ answerLettersLabel(practiceItem.correct_answer) }}</strong>
                </div>
                <div v-if="parseOptions(practiceItem.options).length" class="choice-option-list">
                  <div
                    v-for="(option, optionIndex) in parseOptions(practiceItem.options)"
                    :key="`practice-record-${record.id}-${optionIndex}`"
                    class="choice-option-card"
                    :class="choiceOptionClass(practiceItem, record, optionIndex)"
                  >
                    <strong>{{ optionLetter(optionIndex) }}.</strong>
                    <MarkdownView :generate-data="normalizeText(option)" />
                    <span class="choice-mark-list">
                      <em v-if="isUserChoice(record.answer, optionIndex)" class="choice-mark user">我的选择</em>
                      <em v-if="isCorrectChoice(practiceItem.correct_answer, optionIndex)" class="choice-mark correct">标准答案</em>
                    </span>
                  </div>
                </div>
              </div>
              <div v-else-if="answerImageUrls(record.answer).length" class="answer-image-list">
                <img
                  v-for="url in answerImageUrls(record.answer)"
                  :key="url"
                  :src="url"
                  alt="作答图片"
                />
              </div>
              <MarkdownView v-else :generate-data="normalizeText(record.answer)" />
            </div>
            <div v-if="record.ai_advise" class="record-section advise">
              <h4>判题建议</h4>
              <MarkdownView :generate-data="formatAiAdvise(record.ai_advise)" />
            </div>
          </article>
        </div>
      </details>

      <div v-if="practiceItem.description" class="content-block">
        <h3>题目描述</h3>
        <MarkdownView :generate-data="normalizeText(practiceItem.description)" />
      </div>

      <div v-if="parseOptions(practiceItem.options).length" class="content-block">
        <h3>选项</h3>
        <div class="option-grid">
          <div
            v-for="(option, index) in parseOptions(practiceItem.options)"
            :key="index"
            class="option-item"
          >
            <strong>{{ optionLetter(index) }}.</strong>
            <MarkdownView :generate-data="normalizeText(option)" />
          </div>
        </div>
      </div>

      <details class="answer-details">
        <summary>查看答案与解析</summary>
        <div class="content-block answer-block">
          <h3>参考答案</h3>
          <MarkdownView :generate-data="normalizeText(practiceItem.correct_answer || '暂无参考答案')" />
        </div>
        <div class="content-block" v-if="practiceItem.analysis">
          <h3>题目解析</h3>
          <MarkdownView :generate-data="normalizeText(practiceItem.analysis)" />
        </div>
        <div class="content-block" v-if="practiceItem.latest_ai_advise">
          <h3>上次判题建议</h3>
          <MarkdownView :generate-data="normalizeText(practiceItem.latest_ai_advise)" />
        </div>
      </details>
    </section>

    <section class="filter-card">
      <div class="search-box">
        <input
          v-model="query.keyword"
          placeholder="搜索题目名称"
          @keyup.enter="fetchWrongBooks(1)"
        />
        <button class="primary-btn small" :disabled="loading" @click="fetchWrongBooks(1)">
          搜索
        </button>
      </div>

      <div class="filter-row">
        <button
          v-for="item in masteryTabs"
          :key="item.value"
          class="chip"
          :class="{ active: query.mastery_status === item.value }"
          @click="setMastery(item.value)"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="filter-row">
        <button
          v-for="item in typeTabs"
          :key="item.value"
          class="chip"
          :class="{ active: query.option_type === item.value }"
          @click="setOptionType(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </section>

    <section class="insight-card">
      <div class="insight-header">
        <div>
          <p class="eyebrow">错题薄弱点</p>
          <h2>错题标签统计</h2>
          <p class="insight-desc">{{ weaknessSummary }}</p>
        </div>
        <div class="chart-switch">
          <button class="chip" :class="{ active: chartMode === 'bar' }" @click="setChartMode('bar')">
            柱状图
          </button>
          <button class="chip" :class="{ active: chartMode === 'pie' }" @click="setChartMode('pie')">
            饼图
          </button>
        </div>
      </div>
      <div v-if="tagStatsLoading" class="chart-state">正在分析错题数据...</div>
      <div v-else-if="tagStats.length === 0" class="chart-state">
        暂无可统计的错题数据，先加入或提交一些错题后再查看薄弱点。
      </div>
      <div v-else class="chart-layout">
        <div class="chart-panel">
          <div ref="weaknessChartRef" class="weakness-chart"></div>
          <div v-if="chartRenderFailed" class="fallback-bars">
            <div v-for="item in chartTagStats" :key="`fallback-${item.name}`" class="fallback-row">
              <span>{{ item.name }}</span>
              <div class="fallback-track">
                <i :style="{ width: `${fallbackPercent(item.value)}%` }"></i>
              </div>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>
        <div class="weakness-rank">
          <div v-for="(item, index) in rankTagStats" :key="item.name" class="rank-item">
            <span class="rank-index">{{ index + 1 }}</span>
            <span class="rank-name">{{ item.name }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </div>
    </section>

    <section v-if="loading" class="state-card">
      <div class="spinner"></div>
      <p>正在加载错题...</p>
    </section>

    <section v-else-if="wrongBooks.length === 0" class="state-card">
      <h2>暂时没有符合条件的题目</h2>
      <p>提交考试后，未满分题目会自动进入错题本；你也可以在题目页手动收藏。</p>
    </section>

    <section v-else class="wrong-list">
      <div class="batch-toolbar">
        <label class="select-control">
          <input
            type="checkbox"
            :checked="allCurrentPageSelected"
            @change="toggleCurrentPageSelection(($event.target as HTMLInputElement).checked)"
          />
          <span>{{ allCurrentPageSelected ? "取消本页全选" : "本页全选" }}</span>
        </label>
        <span class="batch-count">已选择 {{ selectedCount }} 题</span>
        <button
          class="ghost-btn small"
          :disabled="selectedCount === 0 || batchLoading"
          @click="batchMarkMastery"
        >
          批量标记掌握
        </button>
        <button
          class="danger-btn small"
          :disabled="selectedCount === 0 || batchLoading"
          @click="batchRemoveWrongBooks"
        >
          批量移除
        </button>
      </div>

      <article v-for="item in wrongBooks" :key="item.id" class="wrong-card">
        <label class="select-check">
          <input
            type="checkbox"
            :checked="isSelected(item)"
            @change="toggleSelected(item, ($event.target as HTMLInputElement).checked)"
          />
        </label>
        <div class="card-main">
          <div class="title-line">
            <span class="question-badge">{{ typeLabel(item.option_type, item.problem_status) }}</span>
            <h2>{{ item.problem_name || "未命名题目" }}</h2>
          </div>

          <div class="meta-row">
            <span>最近得分 {{ item.latest_score ?? 0 }} / {{ item.total_score ?? 0 }}</span>
            <span>累计失分 {{ item.wrong_count ?? 0 }} 次</span>
            <span>{{ item.mastery_status === 1 ? "已掌握" : "待复习" }}</span>
            <span>{{ formatDate(item.update_date) }}</span>
          </div>
          <div v-if="item.tagsList?.length" class="tag-row">
            <span v-for="tag in item.tagsList" :key="`${item.id}-${tag}`" class="tag-chip">{{ tag }}</span>
          </div>

          <details v-if="item.answerRecords?.length" class="answer-history compact">
            <summary>历史作答（{{ item.answerRecords.length }} 次）</summary>
            <div class="answer-record-list">
              <article v-for="record in item.answerRecords" :key="record.id" class="answer-record-card">
                <div class="record-meta">
                  <span>{{ formatDate(record.create_date) }}</span>
                  <strong>{{ answerRecordScoreLabel(record) }}</strong>
                </div>
                <div v-if="record.answer" class="record-section">
                  <h4>{{ isChoiceQuestion(item) ? "作答选项" : "我的作答" }}</h4>
                  <div v-if="isChoiceQuestion(item)" class="choice-answer-block">
                    <div class="choice-summary">
                      <span>我的选择：{{ answerLettersLabel(record.answer) }}</span>
                      <strong>标准答案：{{ answerLettersLabel(item.correct_answer) }}</strong>
                    </div>
                    <div v-if="parseOptions(item.options).length" class="choice-option-list">
                      <div
                        v-for="(option, optionIndex) in parseOptions(item.options)"
                        :key="`${item.id}-record-${record.id}-${optionIndex}`"
                        class="choice-option-card"
                        :class="choiceOptionClass(item, record, optionIndex)"
                      >
                        <strong>{{ optionLetter(optionIndex) }}.</strong>
                        <MarkdownView :generate-data="normalizeText(option)" />
                        <span class="choice-mark-list">
                          <em v-if="isUserChoice(record.answer, optionIndex)" class="choice-mark user">我的选择</em>
                          <em v-if="isCorrectChoice(item.correct_answer, optionIndex)" class="choice-mark correct">标准答案</em>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-else-if="answerImageUrls(record.answer).length" class="answer-image-list">
                    <img
                      v-for="url in answerImageUrls(record.answer)"
                      :key="url"
                      :src="url"
                      alt="作答图片"
                    />
                  </div>
                  <MarkdownView v-else :generate-data="normalizeText(record.answer)" />
                </div>
                <div v-if="record.ai_advise" class="record-section advise">
                  <h4>判题建议</h4>
                  <MarkdownView :generate-data="formatAiAdvise(record.ai_advise)" />
                </div>
              </article>
            </div>
          </details>

          <div v-if="item.description" class="description-preview">
            <MarkdownView :generate-data="shortText(item.description)" />
          </div>
        </div>

        <div class="card-actions">
          <button class="ghost-btn small" @click="openProblem(item)">查看原题</button>
          <button class="ghost-btn small" @click="showAsPractice(item)">练这一题</button>
          <button
            class="ghost-btn small"
            :disabled="batchLoading || actionLoadingId === item.id"
            @click="markMastery(item, item.mastery_status === 1 ? 0 : 1)"
          >
            {{ item.mastery_status === 1 ? "标为待复习" : "标为已掌握" }}
          </button>
          <button
            class="danger-btn small"
            :disabled="batchLoading || actionLoadingId === item.id"
            @click="removeWrongBook(item)"
          >
            移除
          </button>
        </div>
      </article>
    </section>

    <section class="pager" v-if="pageInfo.pages > 1">
      <button :disabled="query.pageNum <= 1 || loading" @click="fetchWrongBooks(query.pageNum - 1)">
        上一页
      </button>
      <span>第 {{ query.pageNum }} / {{ pageInfo.pages }} 页，共 {{ pageInfo.total }} 题</span>
      <button :disabled="query.pageNum >= pageInfo.pages || loading" @click="fetchWrongBooks(query.pageNum + 1)">
        下一页
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import * as echarts from "echarts";
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import { useMessageBox } from "@/view/components/alert/useMessageBox";

type WrongBookAnswerRecord = {
  id?: number;
  exam_user_id?: number;
  problem_id?: number;
  answer?: string;
  score?: number;
  total_score?: number;
  ai_advise?: string;
  confidence?: string;
  person?: boolean;
  create_date?: string;
  update_date?: string;
};

type GradingMistake = {
  type?: string;
  description?: string;
  severity?: string;
  related_rubric_item_id?: string;
};

type GradingRubric = {
  id?: string;
  name?: string;
  reason?: string;
  evidence?: string;
  confidence?: number;
  max_score?: number;
  awarded_score?: number;
};

type StructuredGradingResult = {
  confidence?: number;
  mistakes?: GradingMistake[];
  summary?: string;
  advice?: string;
  question_type?: string;
  total_score?: number;
  awarded_score?: number;
  score_rate?: number;
  is_correct?: boolean;
  is_partially_correct?: boolean;
  needs_manual_review?: boolean;
  grading_mode?: string;
  accepted_answers?: string[];
  student_normalized_answer?: string;
  rubric_used?: GradingRubric[];
};

type WrongBookItem = {
  id?: number;
  problem_id?: number;
  problem_name?: string;
  problem_status?: number;
  option_type?: number;
  difficulty_name?: string;
  source_name?: string;
  description?: string;
  options?: string;
  correct_answer?: string;
  analysis?: string;
  tagsList?: string[];
  answerRecords?: WrongBookAnswerRecord[];
  exam_id?: number;
  exam_user_id?: number;
  answer?: string;
  latest_answer?: string;
  latest_score?: number;
  total_score?: number;
  wrong_count?: number;
  mastery_status?: number;
  latest_ai_advise?: string;
  update_date?: string;
};

type TagStatItem = {
  name: string;
  value: number;
};

const route = useRoute();
const router = useRouter();
const { success, error, warning } = useMessageBox();
const apiBaseURL = process.env.NODE_ENV === "production"
    ? "https://www.byteoj.com"
    : "http://localhost:7091";

const http = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem("sessionId");
  if (sessionId) {
    config.headers["X-Session-Id"] = sessionId;
  }
  return config;
});

const loading = ref(false);
const randomLoading = ref(false);
const batchLoading = ref(false);
const tagStatsLoading = ref(false);
const actionLoadingId = ref<number | null>(null);
const wrongBooks = ref<WrongBookItem[]>([]);
const practiceItem = ref<WrongBookItem | null>(null);
const selectedWrongBookIds = ref<number[]>([]);
const tagStats = ref<TagStatItem[]>([]);
const chartMode = ref<"bar" | "pie">("bar");
const chartRenderFailed = ref(false);
const weaknessChartRef = ref<HTMLDivElement | null>(null);
let weaknessChart: echarts.ECharts | null = null;

const CHART_TAG_LIMIT = 10;
const RANK_TAG_LIMIT = 30;

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: "",
  mastery_status: 0 as number | undefined,
  option_type: undefined as number | undefined,
});

const pageInfo = reactive({
  total: 0,
  pages: 1,
});

const selectableWrongBookIds = computed(() =>
    wrongBooks.value
        .map((item) => item.id)
        .filter((id): id is number => typeof id === "number")
);

const selectedCount = computed(() => selectedWrongBookIds.value.length);

const allCurrentPageSelected = computed(() => {
  const ids = selectableWrongBookIds.value;
  return ids.length > 0 && ids.every((id) => selectedWrongBookIds.value.includes(id));
});

const chartTagStats = computed(() => {
  if (tagStats.value.length <= CHART_TAG_LIMIT) {
    return tagStats.value;
  }
  const topList = tagStats.value.slice(0, CHART_TAG_LIMIT);
  const otherValue = tagStats.value
      .slice(CHART_TAG_LIMIT)
      .reduce((sum, item) => sum + item.value, 0);
  return otherValue > 0 ? [...topList, { name: "其他", value: otherValue }] : topList;
});

const rankTagStats = computed(() => tagStats.value.slice(0, RANK_TAG_LIMIT));

const maxTagStatValue = computed(() => Math.max(...chartTagStats.value.map((item) => item.value), 1));

const weaknessSummary = computed(() => {
  if (tagStatsLoading.value) return "正在根据你的错题记录计算薄弱点。";
  if (tagStats.value.length === 0) return "当前筛选条件下还没有可统计的错题数据。";
  const top = tagStats.value[0];
  const tailText = tagStats.value.length > CHART_TAG_LIMIT ? `，图表已聚合其余 ${tagStats.value.length - CHART_TAG_LIMIT} 个标签为「其他」` : "";
  return `当前最需要关注的是「${top.name}」，累计失分 ${top.value} 次${tailText}。`;
});

const masteryTabs = [
  { label: "待复习", value: 0 },
  { label: "已掌握", value: 1 },
];

const typeTabs = [
  { label: "全部题型", value: undefined },
  { label: "简答题", value: 0 },
  { label: "单选题", value: 1 },
  { label: "多选题", value: 2 },
  { label: "填空题", value: 3 },
  { label: "算法题", value: 4 },
];

let syncingRoute = false;

onMounted(() => {
  restoreQueryFromRoute();
  fetchWrongBooks(query.pageNum, false);
  window.addEventListener("resize", resizeWeaknessChart);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeWeaknessChart);
  weaknessChart?.dispose();
  weaknessChart = null;
});

watch(
    () => route.query,
    () => {
      if (syncingRoute) return;
      restoreQueryFromRoute();
      fetchWrongBooks(query.pageNum, false);
    }
);

const unwrap = (res: any) => {
  if (res?.data?.code !== 0) {
    throw new Error(res?.data?.message || "请求失败");
  }
  return res.data.data;
};

const requestBody = () => ({
  pageNum: query.pageNum,
  pageSize: query.pageSize,
  keyword: query.keyword || undefined,
  mastery_status: query.mastery_status,
  option_type: query.option_type,
});

const statsRequestBody = () => ({
  stat_type: "tag",
  keyword: query.keyword || undefined,
  mastery_status: query.mastery_status,
  option_type: query.option_type,
});

const firstQueryValue = (value: unknown) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const parsePositiveNumber = (value: unknown, fallback: number) => {
  const parsed = Number(firstQueryValue(value));
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
};

const parseOptionalNumber = (value: unknown) => {
  const raw = firstQueryValue(value);
  if (raw === undefined || raw === null || raw === "") return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const restoreQueryFromRoute = () => {
  query.pageNum = parsePositiveNumber(route.query.pageNum, 1);
  query.pageSize = parsePositiveNumber(route.query.pageSize, 10);
  query.keyword = String(firstQueryValue(route.query.keyword) || "");
  query.mastery_status = parseOptionalNumber(route.query.mastery_status) ?? 0;
  query.option_type = parseOptionalNumber(route.query.option_type);
};

const routeQueryForCurrentState = () => {
  const next: Record<string, string> = {
    pageNum: String(query.pageNum),
    pageSize: String(query.pageSize),
    mastery_status: String(query.mastery_status ?? 0),
  };
  const keyword = query.keyword.trim();
  if (keyword) {
    next.keyword = keyword;
  }
  if (query.option_type !== undefined) {
    next.option_type = String(query.option_type);
  }
  return next;
};

const isSameRouteQuery = (next: Record<string, string>) => {
  const keys = ["pageNum", "pageSize", "keyword", "mastery_status", "option_type"];
  return keys.every((key) => String(firstQueryValue(route.query[key]) || "") === (next[key] || ""));
};

const syncRouteQuery = async () => {
  const next = routeQueryForCurrentState();
  if (isSameRouteQuery(next)) return;
  syncingRoute = true;
  try {
    await router.replace({ path: route.path, query: next });
  } finally {
    window.setTimeout(() => {
      syncingRoute = false;
    }, 0);
  }
};

const fetchWrongBooks = async (page = query.pageNum, syncRoute = true) => {
  loading.value = true;
  query.pageNum = Math.max(1, Math.floor(Number(page) || 1));
  if (syncRoute) {
    await syncRouteQuery();
  }
  try {
    const data = unwrap(await http.post("/api/problem/wrong-book/list", requestBody()));
    wrongBooks.value = data?.records || [];
    const visibleIds = new Set(selectableWrongBookIds.value);
    selectedWrongBookIds.value = selectedWrongBookIds.value.filter((id) => visibleIds.has(id));
    pageInfo.total = Number(data?.total || 0);
    pageInfo.pages = Number(data?.pages || 1);
    fetchWrongBookTagStats();
  } catch (err: any) {
    console.error(err);
    error(err?.message || "加载错题本失败");
  } finally {
    loading.value = false;
  }
};

const fetchWrongBookTagStats = async () => {
  tagStatsLoading.value = true;
  try {
    const data = unwrap(await http.post("/api/problem/wrong-book/stats", statsRequestBody()));
    tagStats.value = Array.isArray(data)
        ? data
            .map((item) => ({
              name: String(item?.name || "未命名标签"),
              value: Number(item?.value || 0),
            }))
            .filter((item) => item.value > 0)
        : [];
  } catch (err: any) {
    console.error(err);
    tagStats.value = [];
  } finally {
    tagStatsLoading.value = false;
    await nextTick();
    renderWeaknessChart();
  }
};

const setChartMode = (mode: "bar" | "pie") => {
  chartMode.value = mode;
  nextTick(renderWeaknessChart);
};

const fallbackPercent = (value: number) => Math.max(8, Math.round((value / maxTagStatValue.value) * 100));

const resizeWeaknessChart = () => {
  weaknessChart?.resize();
};

const renderWeaknessChart = (retryCount = 0) => {
  if (!weaknessChartRef.value || tagStats.value.length === 0) {
    weaknessChart?.dispose();
    weaknessChart = null;
    chartRenderFailed.value = tagStats.value.length > 0;
    return;
  }

  const chartEl = weaknessChartRef.value;
  if ((chartEl.clientWidth === 0 || chartEl.clientHeight === 0) && retryCount < 5) {
    window.setTimeout(() => renderWeaknessChart(retryCount + 1), 80);
    return;
  }

  if (chartEl.clientWidth === 0 || chartEl.clientHeight === 0) {
    chartRenderFailed.value = true;
    return;
  }

  chartRenderFailed.value = false;
  const chartData = chartTagStats.value;
  const commonOption = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}",
    },
    color: ["#0f172a", "#166534", "#0369a1", "#b45309", "#be123c", "#6d28d9", "#0f766e", "#475569"],
  };

  try {
    if (!weaknessChart) {
      weaknessChart = echarts.init(chartEl);
    }

    if (chartMode.value === "pie") {
      weaknessChart.setOption({
        ...commonOption,
        legend: {
          bottom: 0,
          type: "scroll",
        },
        series: [
          {
            name: "错题标签",
            type: "pie",
            radius: ["42%", "68%"],
            center: ["50%", "43%"],
            avoidLabelOverlap: true,
            label: {
              formatter: "{b}\n{c}",
            },
            data: chartData,
          },
        ],
      }, true);
      weaknessChart.resize();
      return;
    }

    weaknessChart.setOption({
      ...commonOption,
      grid: {
        top: 14,
        right: 18,
        bottom: 18,
        left: 96,
        containLabel: true,
      },
      xAxis: {
        type: "value",
        minInterval: 1,
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: chartData.map((item) => item.name),
        axisLabel: {
          width: 86,
          overflow: "truncate",
        },
      },
      series: [
        {
          name: "累计失分",
          type: "bar",
          data: chartData.map((item) => item.value),
          barMaxWidth: 22,
          itemStyle: {
            borderRadius: [0, 8, 8, 0],
          },
        },
      ],
    }, true);
    weaknessChart.resize();
  } catch (err) {
    console.error("ECharts render failed", err);
    chartRenderFailed.value = true;
  }
};

const randomPractice = async () => {
  randomLoading.value = true;
  try {
    const data = unwrap(await http.post("/api/problem/wrong-book/random", requestBody()));
    if (!data) {
      warning("当前筛选条件下没有可抽取的题目");
      return;
    }
    practiceItem.value = data;
    success("已抽取一道练习题");
  } catch (err: any) {
    console.error(err);
    error(err?.message || "随机抽题失败");
  } finally {
    randomLoading.value = false;
  }
};

const markMastery = async (item: WrongBookItem, masteryStatus: number) => {
  if (!item.id) return;
  actionLoadingId.value = item.id;
  try {
    unwrap(await http.post("/api/problem/wrong-book/mastery", {
      id: item.id,
      mastery_status: masteryStatus,
    }));
    success(masteryStatus === 1 ? "已标记为掌握" : "已重新放入待复习");
    await fetchWrongBooks(query.pageNum);
  } catch (err: any) {
    console.error(err);
    error(err?.message || "更新状态失败");
  } finally {
    actionLoadingId.value = null;
  }
};

const removeWrongBook = async (item: WrongBookItem) => {
  if (!item.id) return;
  if (!window.confirm("确定要从错题本中移除这道题吗？")) return;
  actionLoadingId.value = item.id;
  try {
    unwrap(await http.delete("/api/problem/wrong-book/delete", { params: { id: item.id } }));
    success("已从错题本移除");
    await fetchWrongBooks(query.pageNum);
  } catch (err: any) {
    console.error(err);
    error(err?.message || "移除失败");
  } finally {
    actionLoadingId.value = null;
  }
};

const isSelected = (item: WrongBookItem) => {
  return typeof item.id === "number" && selectedWrongBookIds.value.includes(item.id);
};

const toggleSelected = (item: WrongBookItem, checked: boolean) => {
  if (typeof item.id !== "number") return;
  if (checked) {
    if (!selectedWrongBookIds.value.includes(item.id)) {
      selectedWrongBookIds.value = [...selectedWrongBookIds.value, item.id];
    }
    return;
  }
  selectedWrongBookIds.value = selectedWrongBookIds.value.filter((id) => id !== item.id);
};

const toggleCurrentPageSelection = (checked: boolean) => {
  selectedWrongBookIds.value = checked ? [...selectableWrongBookIds.value] : [];
};

const batchMarkMastery = async () => {
  const ids = [...selectedWrongBookIds.value];
  if (ids.length === 0) return;
  batchLoading.value = true;
  try {
    await Promise.all(ids.map((id) =>
        http.post("/api/problem/wrong-book/mastery", {
          id,
          mastery_status: 1,
        }).then(unwrap)
    ));
    success(`已批量标记 ${ids.length} 题为掌握`);
    selectedWrongBookIds.value = [];
    await fetchWrongBooks(query.pageNum);
  } catch (err: any) {
    console.error(err);
    error(err?.message || "批量标记失败");
  } finally {
    batchLoading.value = false;
  }
};

const batchRemoveWrongBooks = async () => {
  const ids = [...selectedWrongBookIds.value];
  if (ids.length === 0) return;
  if (!window.confirm(`确定从错题本移除选中的 ${ids.length} 道题吗？`)) return;
  batchLoading.value = true;
  try {
    await Promise.all(ids.map((id) =>
        http.delete("/api/problem/wrong-book/delete", { params: { id } }).then(unwrap)
    ));
    success(`已批量移除 ${ids.length} 道题`);
    selectedWrongBookIds.value = [];
    await fetchWrongBooks(query.pageNum);
  } catch (err: any) {
    console.error(err);
    error(err?.message || "批量移除失败");
  } finally {
    batchLoading.value = false;
  }
};

const setMastery = (value: number) => {
  query.mastery_status = value;
  fetchWrongBooks(1);
};

const setOptionType = (value?: number) => {
  query.option_type = value;
  fetchWrongBooks(1);
};

const resetFilters = () => {
  query.keyword = "";
  query.mastery_status = 0;
  query.option_type = undefined;
  fetchWrongBooks(1);
};

const showAsPractice = (item: WrongBookItem) => {
  practiceItem.value = item;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const openProblem = (item: WrongBookItem) => {
  if (!item.problem_id) return;
  if (item.problem_status === 3 || item.option_type === 4) {
    router.push(`/problems/algorithm/${item.problem_id}`);
    return;
  }
  router.push(`/problems/other/${item.problem_id}`);
};

const typeLabel = (optionType?: number, problemStatus?: number) => {
  if (problemStatus === 3 || optionType === 4) return "算法题";
  if (optionType === 1) return "单选题";
  if (optionType === 2) return "多选题";
  if (optionType === 3) return "填空题";
  return "简答题";
};

const formatDate = (date?: string) => {
  if (!date) return "暂无时间";
  try {
    return new Date(date).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "暂无时间";
  }
};

const optionLetter = (index: number) => String.fromCharCode(65 + index);

const isChoiceQuestion = (item?: WrongBookItem | null) => item?.option_type === 1 || item?.option_type === 2;

const parseAnswerLetters = (answer?: string) => {
  if (!answer) return [];
  const text = normalizeText(answer).trim();
  if (!text) return [];

  const values: string[] = [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      parsed.forEach((item) => values.push(String(item)));
    } else if (parsed && typeof parsed === "object") {
      Object.values(parsed).forEach((item) => values.push(String(item)));
    }
  } catch {
    values.push(text);
  }

  const letters = values
      .flatMap((item) => String(item).toUpperCase().match(/[A-H]/g) || [])
      .filter(Boolean);
  return [...new Set(letters)];
};

const answerLettersLabel = (answer?: string) => {
  const letters = parseAnswerLetters(answer);
  return letters.length > 0 ? letters.join("、") : "未作答";
};

const isUserChoice = (answer: string | undefined, optionIndex: number) =>
    parseAnswerLetters(answer).includes(optionLetter(optionIndex));

const isCorrectChoice = (answer: string | undefined, optionIndex: number) =>
    parseAnswerLetters(answer).includes(optionLetter(optionIndex));

const choiceOptionClass = (item: WrongBookItem | null | undefined, record: WrongBookAnswerRecord, optionIndex: number) => {
  const selected = isUserChoice(record.answer, optionIndex);
  const correct = isCorrectChoice(item?.correct_answer, optionIndex);
  return {
    selected,
    correct,
    wrong: selected && !correct,
  };
};

const parseOptions = (options?: string) => {
  if (!options) return [];
  const text = options.trim();
  if (!text || text === "[]") return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return normalizeOptionArray(parsed);
    }
  } catch {
    const list = parseSingleQuotedArray(text);
    if (list.length > 0) {
      return list;
    }
    return text
        .split(/\n(?=[A-D][.、])/)
        .map((item) => item.trim())
        .filter(Boolean);
  }
  return [];
};

const normalizeOptionArray = (parsed: any[]) => {
  return parsed
      .map((item: any) => {
        if (typeof item === "string") return item;
        return item?.value || item?.content || item?.label || JSON.stringify(item);
      })
      .map((item: string) => item.trim())
      .filter(Boolean);
};

const parseSingleQuotedArray = (text: string) => {
  if (!text.startsWith("[") || !text.endsWith("]")) return [];

  const result: string[] = [];
  let current = "";
  let inString = false;
  let quote = "";
  let escaping = false;

  for (let i = 1; i < text.length - 1; i++) {
    const ch = text[i];

    if (!inString) {
      if (ch === "'" || ch === '"') {
        inString = true;
        quote = ch;
      }
      continue;
    }

    if (escaping) {
      current += "\\" + ch;
      escaping = false;
      continue;
    }

    if (ch === "\\") {
      escaping = true;
      continue;
    }

    if (ch === quote) {
      result.push(current.trim());
      current = "";
      inString = false;
      quote = "";
      continue;
    }

    current += ch;
  }

  if (current.trim()) {
    result.push(current.trim());
  }
  return result;
};

const answerRecordScoreLabel = (record: WrongBookAnswerRecord) => {
  const score = typeof record.score === "number" ? record.score : 0;
  if (typeof record.total_score === "number" && record.total_score > 0) {
    return `得分 ${score} / ${record.total_score}`;
  }
  return `得分 ${score}`;
};

const parseStructuredGradingResult = (aiAdvise?: string): StructuredGradingResult | undefined => {
  if (!aiAdvise) return undefined;
  const text = normalizeText(aiAdvise);
  const marker = "【结构化结果】";
  const markerIndex = text.indexOf(marker);
  const jsonPart = markerIndex >= 0 ? text.slice(markerIndex + marker.length) : text;
  const firstBrace = jsonPart.indexOf("{");
  const lastBrace = jsonPart.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) return undefined;

  try {
    return JSON.parse(jsonPart.slice(firstBrace, lastBrace + 1)) as StructuredGradingResult;
  } catch (err) {
    console.warn("结构化判题结果解析失败", err);
    return undefined;
  }
};

const formatPercent = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${Math.round(value * 100)}%`;
};

const formatManualReview = (value?: boolean) => value ? "需要" : "不需要";

const formatAiAdvise = (aiAdvise?: string) => {
  if (!aiAdvise) return "";
  const result = parseStructuredGradingResult(aiAdvise);
  if (!result) return normalizeText(aiAdvise);

  const lines: string[] = [];
  lines.push("**判题速览**");
  lines.push(`- 得分：${result.awarded_score ?? "-"} / ${result.total_score ?? "-"}`);
  lines.push(`- 得分率：${formatPercent(result.score_rate)}`);
  lines.push(`- 置信度：${formatPercent(result.confidence)}`);
  lines.push(`- 判题模式：${result.grading_mode || "-"}`);
  lines.push(`- 人工复查：${formatManualReview(result.needs_manual_review)}`);

  if (result.summary) {
    lines.push("");
    lines.push("**总结**");
    lines.push(result.summary);
  }

  if (result.advice) {
    lines.push("");
    lines.push("**改进建议**");
    lines.push(result.advice);
  }

  lines.push("");
  lines.push("**识别作答**");
  lines.push(result.student_normalized_answer || "未识别到有效作答");

  lines.push("");
  lines.push("**可接受答案**");
  if ((result.accepted_answers || []).length) {
    result.accepted_answers!.forEach((answer, index) => {
      lines.push(`${index + 1}. ${answer}`);
    });
  } else {
    lines.push("无");
  }

  lines.push("");
  lines.push("**错误点**");
  if ((result.mistakes || []).length) {
    result.mistakes!.forEach((mistake, index) => {
      lines.push(`${index + 1}. ${mistake.type || "错误"} · ${mistake.severity || "unknown"}`);
      if (mistake.description) lines.push(`   - ${mistake.description}`);
      if (mistake.related_rubric_item_id) lines.push(`   - 关联细则：${mistake.related_rubric_item_id}`);
    });
  } else {
    lines.push("无");
  }

  lines.push("");
  lines.push("**评分细则**");
  if ((result.rubric_used || []).length) {
    result.rubric_used!.forEach((rubric, index) => {
      lines.push(`### ${rubric.name || rubric.id || `细则 ${index + 1}`}`);
      lines.push(`- 得分：${rubric.awarded_score ?? 0} / ${rubric.max_score ?? 0} 分`);
      lines.push(`- 置信度：${formatPercent(rubric.confidence)}`);
      if (rubric.reason) lines.push(`- 原因：${rubric.reason}`);
      if (rubric.evidence) lines.push(`- 依据：${rubric.evidence}`);
      lines.push("");
    });
  } else {
    lines.push("无");
  }

  return lines.join("\n");
};

const isLikelyImageUrl = (url: string) => {
  const cleanUrl = url.split("?")[0].toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(cleanUrl)
      || cleanUrl.includes("oss-cn-")
      || cleanUrl.includes("/image/");
};

const answerImageUrls = (answer?: string) => {
  if (!answer) return [];
  const text = normalizeText(answer).trim();
  if (!text) return [];

  const candidates: string[] = [];
  const addCandidate = (value: unknown) => {
    if (typeof value === "string") {
      candidates.push(value);
      return;
    }
    if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>;
      ["url", "src", "path", "image", "imageUrl"].forEach((key) => addCandidate(obj[key]));
    }
  };

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      parsed.forEach(addCandidate);
    } else {
      addCandidate(parsed);
    }
  } catch {
    candidates.push(text);
  }

  const urls = candidates.flatMap((item) => item.match(/https?:\/\/[^\s"'<>)]*/g) || []);
  return [...new Set(urls.map((url) => url.replace(/[，。,.;；]+$/, "")).filter(isLikelyImageUrl))];
};

const normalizeText = (text?: string) => {
  if (!text) return "";
  let normalized = text;
  while (normalized.includes("////")) {
    normalized = normalized.replace(/\/\/\/\//g, "//");
  }
  normalized = normalized.replace(/\\\\([a-zA-Z]+)/g, "\\$1");
  normalized = normalized.replace(/\\\\([{}[\]()])/g, "\\$1");
  normalized = normalized.replace(/\\\\([,;:!])/g, "\\$1");
  return normalized;
};

const shortText = (text?: string) => {
  if (!text) return "";
  const normalized = normalizeText(text);
  return normalized.length > 220 ? `${normalized.slice(0, 220)}...` : normalized;
};
</script>

<style scoped>
.wrong-book-page {
  min-height: 100vh;
  padding: 44px 24px 72px;
  background:
    radial-gradient(circle at 12% 8%, rgba(34, 197, 94, 0.12), transparent 28%),
    linear-gradient(135deg, #f8fafc 0%, #eef2f7 45%, #f7f3ea 100%);
  color: #1f2937;
}

.hero-card,
.filter-card,
.practice-card,
.wrong-card,
.state-card,
.insight-card {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(14px);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  gap: 28px;
  align-items: center;
  padding: 34px;
  border-radius: 28px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #64748b;
  font-size: 13px;
  letter-spacing: 0.16em;
  font-weight: 700;
}

h1,
h2,
h3 {
  margin: 0;
}

h1 {
  font-size: clamp(32px, 5vw, 54px);
  color: #0f172a;
  letter-spacing: -0.04em;
}

.hero-desc {
  max-width: 660px;
  margin: 14px 0 0;
  color: #64748b;
  line-height: 1.8;
}

.hero-actions,
.card-actions,
.filter-row,
.pager {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

button {
  border: 0;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

button:not(:disabled):active {
  transform: translateY(1px) scale(0.99);
}

.primary-btn,
.ghost-btn,
.danger-btn,
.text-btn,
.pager button {
  border-radius: 14px;
  padding: 12px 18px;
  font-weight: 700;
}

.primary-btn {
  background: #1f2937;
  color: #fff;
  box-shadow: 0 14px 28px rgba(31, 41, 55, 0.2);
}

.primary-btn:hover {
  background: #111827;
}

.ghost-btn,
.pager button {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
}

.danger-btn {
  background: #fff1f2;
  color: #be123c;
  border: 1px solid #fecdd3;
}

.text-btn {
  background: transparent;
  color: #475569;
}

.small {
  padding: 9px 14px;
  border-radius: 12px;
  font-size: 14px;
}

.filter-card,
.practice-card,
.insight-card {
  margin-top: 22px;
  padding: 22px;
  border-radius: 24px;
}

.search-box {
  display: flex;
  gap: 12px;
}

.search-box input {
  flex: 1;
  min-width: 180px;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 13px 16px;
  outline: none;
  background: #fff;
}

.search-box input:focus {
  border-color: #334155;
}

.filter-row {
  margin-top: 16px;
}

.chip {
  border-radius: 999px;
  padding: 9px 15px;
  border: 1px solid #cbd5e1;
  color: #475569;
  background: #fff;
}

.chip.active {
  background: #0f172a;
  color: #fff;
  border-color: #0f172a;
}

.practice-top,
.title-line {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
}

.practice-card h2,
.wrong-card h2 {
  min-width: 0;
  color: #0f172a;
  font-size: 24px;
  line-height: 1.35;
  word-break: break-word;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.meta-row span,
.question-badge {
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  padding: 6px 10px;
  font-size: 13px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag-chip {
  border-radius: 999px;
  padding: 5px 10px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.insight-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.insight-header h2 {
  color: #0f172a;
  font-size: 26px;
}

.insight-desc {
  margin: 10px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.chart-switch {
  display: flex;
  gap: 10px;
  flex: none;
}

.chart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 20px;
  align-items: stretch;
  margin-top: 18px;
}

.chart-panel {
  position: relative;
  min-width: 0;
}

.weakness-chart {
  min-width: 0;
  height: 340px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
}

.fallback-bars {
  position: absolute;
  inset: 0;
  display: grid;
  gap: 12px;
  align-content: start;
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
  overflow-y: auto;
}

.fallback-row {
  display: grid;
  grid-template-columns: minmax(120px, 180px) minmax(0, 1fr) 38px;
  gap: 10px;
  align-items: center;
  color: #334155;
  font-weight: 700;
}

.fallback-row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fallback-track {
  height: 12px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.fallback-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0f172a, #166534);
}

.weakness-rank {
  display: grid;
  gap: 10px;
  align-content: start;
  max-height: 340px;
  min-width: 0;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin;
}

.rank-item {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 10px 12px;
  background: #f8fafc;
}

.rank-index {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #0f172a;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
}

.rank-name {
  min-width: 0;
  color: #334155;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chart-state {
  margin-top: 18px;
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  padding: 30px 18px;
  color: #64748b;
  text-align: center;
  background: #f8fafc;
}

.question-badge {
  background: #dcfce7;
  color: #166534;
  font-weight: 800;
  flex: none;
}

.content-block {
  min-width: 0;
  margin-top: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 18px;
  background: #fff;
}

.content-block h3 {
  margin-bottom: 12px;
  font-size: 15px;
  color: #334155;
}

.answer-block {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.answer-history {
  margin-top: 16px;
  border: 1px solid #dbeafe;
  border-radius: 18px;
  background: #f8fbff;
  padding: 14px 16px;
}

.answer-history.compact {
  margin-top: 14px;
}

.answer-history summary {
  cursor: pointer;
  color: #1d4ed8;
  font-weight: 800;
}

.answer-record-list {
  display: grid;
  gap: 12px;
  margin-top: 14px;
  max-height: 520px;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin;
}

.answer-record-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  padding: 14px;
}

.record-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #64748b;
  font-size: 13px;
}

.record-meta strong {
  color: #0f172a;
}

.record-section {
  margin-top: 12px;
  border-radius: 14px;
  background: #f8fafc;
  padding: 12px;
}

.record-section.advise {
  background: #f0fdf4;
}

.record-section h4 {
  margin-bottom: 8px;
  color: #334155;
  font-size: 13px;
}

.choice-answer-block {
  display: grid;
  gap: 12px;
}

.choice-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #475569;
  font-weight: 700;
}

.choice-summary strong {
  color: #166534;
}

.choice-option-list {
  display: grid;
  gap: 10px;
}

.choice-option-card {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: start;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px;
  background: #fff;
}

.choice-option-card.selected {
  border-color: #93c5fd;
  background: #eff6ff;
}

.choice-option-card.correct {
  border-color: #86efac;
  background: #f0fdf4;
}

.choice-option-card.wrong {
  border-color: #fca5a5;
}

.choice-mark-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.choice-mark {
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 12px;
  font-style: normal;
  font-weight: 800;
  white-space: nowrap;
}

.choice-mark.user {
  background: #dbeafe;
  color: #1d4ed8;
}

.choice-mark.correct {
  background: #dcfce7;
  color: #166534;
}

.answer-image-list {
  display: grid;
  gap: 12px;
}

.answer-image-list img {
  max-width: 100%;
  max-height: 520px;
  object-fit: contain;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
}

.option-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}

.option-item {
  min-width: 0;
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 8px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 12px;
}

.answer-details {
  margin-top: 20px;
}

.answer-details summary {
  cursor: pointer;
  font-weight: 800;
  color: #166534;
}

.state-card {
  margin-top: 24px;
  padding: 54px 24px;
  border-radius: 24px;
  text-align: center;
  color: #64748b;
}

.spinner {
  width: 42px;
  height: 42px;
  margin: 0 auto 14px;
  border-radius: 999px;
  border: 4px solid #cbd5e1;
  border-top-color: #1f2937;
  animation: spin 0.8s linear infinite;
}

.wrong-list {
  width: 100%;
  max-width: 1180px;
  margin: 24px auto 0;
  display: grid;
  gap: 18px;
}

.batch-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 18px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
}

.select-control,
.select-check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-weight: 700;
}

.select-control input,
.select-check input {
  width: 18px;
  height: 18px;
  accent-color: #0f172a;
}

.batch-count {
  color: #64748b;
  font-size: 14px;
}

.select-check {
  align-self: start;
  padding-top: 4px;
}

.wrong-card {
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 20px;
  padding: 22px;
  border-radius: 24px;
}

.description-preview {
  max-width: 100%;
  overflow: hidden;
  margin-top: 16px;
  color: #475569;
  line-height: 1.7;
}

.card-actions {
  justify-content: flex-end;
  align-content: start;
  min-width: 320px;
}

.card-main {
  min-width: 0;
  overflow: hidden;
}

.practice-card,
.content-block,
.option-item,
.description-preview {
  overflow-x: auto;
}

:deep(.markdown-body),
:deep(.markdown-content),
:deep(p),
:deep(span),
:deep(.MathJax),
:deep(mjx-container) {
  max-width: 100%;
}

:deep(mjx-container) {
  overflow-x: auto;
  overflow-y: hidden;
}

.pager {
  justify-content: center;
  align-items: center;
  margin: 28px auto 0;
  color: #475569;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 860px) {
  .hero-card,
  .wrong-card,
  .practice-top,
  .title-line,
  .insight-header,
  .chart-layout {
    display: block;
  }

  .hero-actions,
  .card-actions {
    margin-top: 18px;
  }

  .card-actions {
    min-width: 0;
    justify-content: flex-start;
  }

  .search-box {
    flex-direction: column;
  }

  .chart-switch,
  .weakness-rank {
    margin-top: 16px;
  }

  .fallback-row {
    grid-template-columns: minmax(0, 1fr) 54px;
  }

  .fallback-row span {
    grid-column: 1 / -1;
  }

  .weakness-chart {
    height: 300px;
  }

  .weakness-rank {
    max-height: 360px;
  }
}
</style>
