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

    <section v-if="loading" class="state-card">
      <div class="spinner"></div>
      <p>正在加载错题...</p>
    </section>

    <section v-else-if="wrongBooks.length === 0" class="state-card">
      <h2>暂时没有符合条件的题目</h2>
      <p>提交考试后，未满分题目会自动进入错题本；你也可以在题目页手动收藏。</p>
    </section>

    <section v-else class="wrong-list">
      <article v-for="item in wrongBooks" :key="item.id" class="wrong-card">
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

          <div v-if="item.description" class="description-preview">
            <MarkdownView :generate-data="shortText(item.description)" />
          </div>
        </div>

        <div class="card-actions">
          <button class="ghost-btn small" @click="openProblem(item)">查看原题</button>
          <button class="ghost-btn small" @click="showAsPractice(item)">练这一题</button>
          <button
            class="ghost-btn small"
            :disabled="actionLoadingId === item.id"
            @click="markMastery(item, item.mastery_status === 1 ? 0 : 1)"
          >
            {{ item.mastery_status === 1 ? "标为待复习" : "标为已掌握" }}
          </button>
          <button
            class="danger-btn small"
            :disabled="actionLoadingId === item.id"
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
import { onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import { useMessageBox } from "@/view/components/alert/useMessageBox";

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
  exam_id?: number;
  exam_user_id?: number;
  latest_answer?: string;
  latest_score?: number;
  total_score?: number;
  wrong_count?: number;
  mastery_status?: number;
  latest_ai_advise?: string;
  update_date?: string;
};

const route = useRoute();
const router = useRouter();
const { success, error, warning } = useMessageBox();

const http = axios.create({
  baseURL: "http://localhost:7091",
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
const actionLoadingId = ref<number | null>(null);
const wrongBooks = ref<WrongBookItem[]>([]);
const practiceItem = ref<WrongBookItem | null>(null);

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
    pageInfo.total = Number(data?.total || 0);
    pageInfo.pages = Number(data?.pages || 1);
  } catch (err: any) {
    console.error(err);
    error(err?.message || "加载错题本失败");
  } finally {
    loading.value = false;
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
.state-card {
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
.practice-card {
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

.wrong-card {
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
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
  .title-line {
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
}
</style>
