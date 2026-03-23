<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { ProblemsControllerService } from "../../../../generated/services/ProblemsControllerService";
import { UsageControllerService } from "../../../../generated/services/UsageControllerService";
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import { useRoute, useRouter } from "vue-router";
import { useMessageBox } from "@/view/components/alert/useMessageBox";

const { success, error, warning } = useMessageBox();

interface ProblemData {
  problem_id: number;
  problem_name: string;
  difficulty_name: string;
  source_name: string;
  description: string;
  options: string;
  correct_answer: string;
  option_type: number;
  tagsList: string[];
  analysis: string;
}

const route = useRoute();
const router = useRouter();

const problem = ref<ProblemData | null>(null);
const userSingleAnswer = ref<string>("");
const userMultiAnswer = ref<string[]>([]);
const userTextAnswer = ref<string>("");
const showAnswer = ref<boolean>(false);
const showAnalysis = ref<boolean>(false);
const isCorrect = ref<boolean | null>(null);
const problemId = ref<number>(Number(route.path.split('/')[3]));

// 剩余使用次数
const remainingUsage = ref<number | null>(null);
const isLoadingUsage = ref(false);

// 相似推荐相关
const similarProblems = ref<any[]>([]);
const isLoadingSimilar = ref(false);
const hasLoadedSimilar = ref(false);     // 是否曾经加载过数据（用于决定是否显示展开/收起按钮）

// 控制当前是否展开推荐内容（这是用户可见的状态）
const isExpanded = ref(false);

// localStorage 配置
const CACHE_KEY_PREFIX = "similar_recommend_";
const EXPANDED_KEY_PREFIX = "similar_expanded_"; // 展开/收起状态 key 前缀
const CACHE_EXPIRE_HOURS = 24;

// 读取推荐列表缓存
const loadSimilarFromCache = () => {
  const key = `${CACHE_KEY_PREFIX}${problemId.value}`;
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  try {
    const data = JSON.parse(cached);
    const now = Date.now();
    if (now - data.timestamp > CACHE_EXPIRE_HOURS * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return data.problems;
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
};

// 保存推荐列表缓存
const saveSimilarToCache = (problems: any[]) => {
  const key = `${CACHE_KEY_PREFIX}${problemId.value}`;
  const data = {
    timestamp: Date.now(),
    problems,
  };
  localStorage.setItem(key, JSON.stringify(data));
};

// 读取展开/收起状态
const loadExpandedState = () => {
  const key = `${EXPANDED_KEY_PREFIX}${problemId.value}`;
  const stored = localStorage.getItem(key);
  return stored === "true";
};

// 保存展开/收起状态
const saveExpandedState = (expanded: boolean) => {
  const key = `${EXPANDED_KEY_PREFIX}${problemId.value}`;
  localStorage.setItem(key, expanded ? "true" : "false");
};

// 监听 isExpanded 变化，自动保存
watch(isExpanded, (newVal) => {
  saveExpandedState(newVal);
});

const loadUsageCount = async () => {
  isLoadingUsage.value = true;
  try {
    const res = await UsageControllerService.usageMaxCountGetUsingGet();
    if (res.code === 0) {
      remainingUsage.value = res.data ?? 0;
    } else {
      remainingUsage.value = null;
      console.warn("获取剩余次数失败", res.message);
    }
  } catch (err) {
    console.error("查询剩余使用次数失败", err);
    remainingUsage.value = null;
  } finally {
    isLoadingUsage.value = false;
  }
};

const loadProblem = async (id: number) => {
  problemId.value = id;
  try {
    const res = await ProblemsControllerService.problemSearchByProblemIdUsingGet(id);
    if (res.code === 0) {
      problem.value = res.data;
      reset();
    } else {
      error(res.message || "加载题目失败");
    }
  } catch (err) {
    error("加载题目时发生错误");
    console.error(err);
  }
};

const loadSimilarProblems = async () => {
  if (!problemId.value) return;

  if (remainingUsage.value === 0) {
    warning("您的推荐次数已用完，请明天再试或联系管理员");
    return;
  }

  isLoadingSimilar.value = true;
  hasLoadedSimilar.value = true;

  // 加载数据时自动展开（如果当前是收起状态，也强制展开）
  isExpanded.value = true;

  try {
    const res = await ProblemsControllerService.problemSearchSimilarityUsingPost([problemId.value]);
    if (res.code === 0 && res.data?.length > 0) {
      let list = res.data[0]?.top5_similarity || [];
      list = list.filter((p: any) => p.problem_id !== problemId.value);
      similarProblems.value = list;

      saveSimilarToCache(list);

      if (list.length === 0) {
        warning("目前没有找到其他相似题目");
      } else {
        success(`找到 ${list.length} 道相似推荐题目`);
      }
    } else {
      similarProblems.value = [];
      warning("暂无相似推荐题目数据");
    }
  } catch (err) {
    console.error("加载相似题目失败", err);
    similarProblems.value = [];
    error("加载推荐题目失败，请稍后再试");
  } finally {
    isLoadingSimilar.value = false;
    await loadUsageCount();
  }
};

// 切换展开/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

onMounted(async () => {
  await loadProblem(problemId.value);
  await loadUsageCount();

  // 恢复推荐列表缓存
  const cached = loadSimilarFromCache();
  if (cached) {
    similarProblems.value = cached;
    hasLoadedSimilar.value = true;
  }

  // 恢复展开/收起状态（用户最后一次操作决定）
  isExpanded.value = loadExpandedState();

  // 如果有缓存但状态为 false，可选择强制展开（这里保持用户选择）
  // 如果你希望有缓存就默认展开，可以加下面这行：
  // if (cached && !isExpanded.value) isExpanded.value = true;
});

const getProblemType = (type: number) => {
  const types: Record<number, string> = {
    0: '简答题',
    1: '单选题',
    2: '多选题',
    3: '填空题',
    4: '引用题'
  };
  return types[type] || '其他';
};

const getShortDescription = (desc: string) => {
  if (!desc) return '（无题目描述）';
  return desc.length > 160 ? desc.slice(0, 160) + '...' : desc;
};

const parseStringArray = (str: string): string[] => {
  if (!str) return [];
  try {
    return JSON.parse(str.replace(/'/g, '"'));
  } catch {
    return [];
  }
};

const parsedOptions = () => parseStringArray(problem.value?.options || "");
const parsedCorrectAnswer = () => parseStringArray(problem.value?.correct_answer || "");

const getOptionLetter = (index: number): string => String.fromCharCode(65 + index);

const getOptionClass = (letter: string): string => {
  if (!showAnswer.value || !problem.value || (problem.value.option_type !== 1 && problem.value.option_type !== 2)) return '';

  const correctAnswers = parsedCorrectAnswer();
  const isUserSelected = problem.value.option_type === 1
      ? userSingleAnswer.value === letter
      : userMultiAnswer.value.includes(letter);

  const isCorrectOption = correctAnswers.includes(letter);

  if (isUserSelected && isCorrectOption) return 'correct-option';
  if (isUserSelected && !isCorrectOption) return 'wrong-option';
  if (!isUserSelected && isCorrectOption) return 'correct-option';
  return '';
};

const submitAnswer = () => {
  if (!problem.value) return;
  showAnswer.value = true;
  showAnalysis.value = true;

  const correct = parsedCorrectAnswer();
  let userAns: string[] = [];

  if (problem.value.option_type === 1) {
    userAns = userSingleAnswer.value ? [userSingleAnswer.value] : [];
  } else if (problem.value.option_type === 2) {
    userAns = userMultiAnswer.value;
  } else if (problem.value.option_type === 3 || problem.value.option_type === 0) {
    userAns = [userTextAnswer.value.trim()];
  }

  if (problem.value.option_type === 1 || problem.value.option_type === 2) {
    const sortedUser = [...userAns].sort();
    const sortedCorrect = [...correct].sort();
    isCorrect.value = JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
  } else if (problem.value.option_type === 3) {
    isCorrect.value = userAns[0] === (correct[0] || "").trim();
  } else {
    isCorrect.value = null;
  }
};

const reset = () => {
  userSingleAnswer.value = "";
  userMultiAnswer.value = [];
  userTextAnswer.value = "";
  showAnswer.value = false;
  showAnalysis.value = false;
  isCorrect.value = null;
};

const prevProblem = () => {
  if (problemId.value > 1) {
    router.push(`/problems/other/${problemId.value - 1}`);
  }
};

const nextProblem = () => {
  router.push(`/problems/other/${problemId.value + 1}`);
};
</script>
<template>
  <div class="problem-page">
    <div v-if="problem" class="problem-container">
      <!-- 标题 + 剩余次数 -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-5">
        <h1 class="problem-name">{{ problem.problem_name }}</h1>

        <div class="usage-display flex items-center gap-3 px-4 py-2 rounded-xl bg-amber-50/80 border border-amber-200 text-sm shadow-sm">
          <i class="fas fa-bolt text-amber-500"></i>
          <span class="font-medium text-amber-800">剩余次数：</span>
          <span v-if="isLoadingUsage" class="loading-dots text-amber-600">查询中</span>
          <span v-else-if="remainingUsage === null" class="text-amber-600">未知</span>
          <span
              v-else
              :class="{
              'text-green-600 font-bold': remainingUsage > 0,
              'text-red-600 font-bold animate-pulse': remainingUsage === 0
            }"
          >
            {{ remainingUsage }}
          </span>

          <button
              @click="loadUsageCount"
              :disabled="isLoadingUsage"
              class="btn btn-ghost btn-xs text-amber-700 hover:text-amber-900"
              title="刷新剩余次数"
          >
            <i class="fas fa-sync-alt text-base" :class="{ 'fa-spin': isLoadingUsage }"></i>
          </button>
        </div>
      </div>

      <div class="meta-info mb-6">
        <span class="meta-item"><i class="fas fa-star"></i> {{ problem.difficulty_name }}</span>
        <span class="meta-item"><i class="fas fa-book"></i> {{ problem.source_name }}</span>
      </div>

      <!-- 相似推荐区块 -->
      <div class="similar-section rounded-xl border border-slate-200 bg-white shadow-sm p-6">
        <!-- 标题 + 按钮组 -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <h3 class="text-xl font-bold flex items-center gap-3 text-slate-800">
            <i class="fas fa-lightbulb text-indigo-500 text-2xl"></i>
            相似推荐题目
          </h3>

          <div class="flex flex-wrap gap-3">
            <!-- 查看/刷新按钮 -->
            <button
                @click="loadSimilarProblems"
                :disabled="isLoadingSimilar || remainingUsage === 0"
                class="btn btn-sm gap-2 shadow-md hover:shadow-lg transition-shadow min-w-[160px]"
            >
              <i class="fas" :class="isLoadingSimilar ? 'fa-spinner fa-spin' : 'fa-search'"></i>
              {{ isLoadingSimilar
                ? '搜索中...'
                : (hasLoadedSimilar ? '重新搜索相似题' : '查看相似推荐')
              }}
            </button>

            <!-- 展开/收起按钮：只有曾经加载过或有数据时显示 -->
            <button
                v-if="hasLoadedSimilar || similarProblems.length > 0"
                @click="toggleExpand"
                class="btn btn-outline btn-sm gap-2 min-w-[100px]"
            >
              <i class="fas" :class="isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              {{ isExpanded ? '收起' : '展开' }}
            </button>
          </div>
        </div>

        <!-- 展开时显示的内容区域 -->
        <div v-if="isExpanded">
          <!-- 未加载提示（仅当从未加载且无缓存时显示） -->
          <div v-if="!hasLoadedSimilar && similarProblems.length === 0" class="alert alert-info shadow-sm">
            <i class="fas fa-info-circle text-xl"></i>
            <div>
              <h4 class="font-bold">尚未加载推荐</h4>
              <p class="text-sm">点击上方“查看相似推荐”按钮，即可查看与本题相似的题目（最多5道）</p>
            </div>
          </div>

          <!-- 加载中 -->
          <div v-else-if="isLoadingSimilar" class="text-center py-12">
            <span class="loading loading-spinner loading-lg text-primary"></span>
            <p class="mt-4 text-base-content/70">正在搜索最相似的题目...</p>
          </div>

          <!-- 无数据 -->
          <div v-else-if="similarProblems.length === 0" class="alert alert-warning shadow-sm">
            <i class="fas fa-exclamation-triangle"></i>
            <span>目前没有找到其他相似题目</span>
          </div>

          <!-- 有数据：卡片列表 -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            <div
                v-for="sim in similarProblems"
                :key="sim.problem_id"
                @click="router.push(`/problems/other/${sim.problem_id}`)"
                class="similar-card group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-indigo-300/60 transition-all duration-300 cursor-pointer"
            >
              <!-- 右上角标签 -->
              <div class="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <div class="badge badge-primary badge-outline badge-sm px-2.5 py-1 bg-white/90 backdrop-blur-sm border-primary">
                  {{ getProblemType(sim.option_type) }}
                </div>
              </div>

              <!-- 主要内容 -->
              <div class="p-6 pt-14 pb-5">
                <h4 class="font-bold text-lg mb-2.5 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                  {{ sim.problem_name || `第 ${sim.problem_id} 题` }}
                </h4>

                <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600 mb-3">
                  <span class="font-medium opacity-90">{{ sim.source_name }}</span>
                </div>

                <MarkdownView class="text-sm leading-relaxed text-slate-700 line-clamp-3" :generate-data="getShortDescription(sim.description)" />
              </div>

              <!-- hover 提示 -->
              <div class="absolute bottom-0 left-0 right-0 px-6 py-3 bg-gradient-to-t from-indigo-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-medium text-indigo-700 flex justify-end">
                点击查看完整题目 →
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-6 text-base-content/50 italic border-t border-slate-100 pt-4">
          已收起推荐内容，点击“展开”查看相似题目
        </div>
      </div>

      <!-- 题目描述 -->
      <div class="description mt-8">
        <div v-if="problem.option_type === 4" class="p-4 bg-base-200 rounded-lg border border-base-300">
          <div class="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.898a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <div>
              <p class="text-sm text-base-content/80 mb-1">本题为引用题，点击下方链接查看原题：</p>
              <a :href="problem.description" target="_blank" rel="noopener noreferrer" class="link link-primary font-medium hover:underline break-all">
                题目链接（立即跳转至题目{{ problem.problem_id }}）
              </a>
            </div>
          </div>
        </div>
        <div v-else>
          <MarkdownView :generateData="problem.description" />
        </div>
      </div>

      <!-- 选择题 -->
      <div v-if="problem.option_type === 1 || problem.option_type === 2" class="options">
        <div v-for="(opt, index) in parsedOptions()" :key="index" class="option-item" :class="getOptionClass(getOptionLetter(index))">
          <label class="option-label">
            <input v-if="problem.option_type === 1" type="radio" :value="getOptionLetter(index)" v-model="userSingleAnswer" class="option-input" :disabled="showAnswer" />
            <input v-else type="checkbox" :value="getOptionLetter(index)" v-model="userMultiAnswer" class="option-input" :disabled="showAnswer" />
            <span class="option-text">
              <MarkdownView
                  :style="showAnswer && problem.correct_answer.includes(getOptionLetter(index)) ? 'background-color: #d4edda' : (getOptionClass(getOptionLetter(index)) == 'wrong-option' ? 'background-color: #f8d7da':'')"
                  :generate-data="'**' + getOptionLetter(index) + '**. ' + opt"
              />
            </span>
          </label>
        </div>
      </div>

      <!-- 填空题 -->
      <div v-else-if="problem.option_type === 3" class="fill-in">
        <input type="text" v-model="userTextAnswer" placeholder="请输入答案..." class="text-input" :disabled="showAnswer" />
      </div>

      <!-- 简答题 -->
      <div v-else-if="problem.option_type === 0" class="short-answer">
        <textarea v-model="userTextAnswer" placeholder="请输入你的回答..." rows="5" class="text-area" :disabled="showAnswer"></textarea>
      </div>

      <button @click="submitAnswer" class="submit-btn" :disabled="showAnswer" v-if="problem.option_type != 4">
        {{ showAnswer ? "已提交" : "提交答案" }}
      </button>

      <!-- 提交后区域 -->
      <div v-if="showAnswer" class="post-submit">
        <div class="result-banner" :class="{ 'correct': isCorrect === true, 'wrong': isCorrect === false, 'neutral': isCorrect === null }">
          <i class="fas" :class="{ 'fa-check-circle': isCorrect === true, 'fa-times-circle': isCorrect === false, 'fa-info-circle': isCorrect === null }"></i>
          <span v-if="isCorrect === true">答对了！</span>
          <span v-else-if="isCorrect === false">答错了。正确答案是 <strong>{{ parsedCorrectAnswer().join('、') }}</strong></span>
          <span v-else>答案已提交，请自行查看解析</span>
        </div>

        <div class="action-buttons">
          <button @click="showAnalysis = !showAnalysis" class="toggle-btn">
            {{ showAnalysis ? '隐藏答案与解析' : '查看答案与解析' }}
          </button>
          <button class="favorite-btn"><i class="fas fa-bookmark"></i> 收藏</button>
        </div>

        <div v-if="showAnalysis" class="analysis-box">
          <div class="analysis-header">
            正确答案：
            <strong v-if="problem.option_type == 1 || problem.option_type == 2" style="color: #85ad45">
              <MarkdownView style="background-color: #e9f5ff" :generate-data="parsedCorrectAnswer().join('、') || '无'" />
            </strong>
            <span v-else style="color: #85ad45">
              <MarkdownView style="background-color: #e9f5ff" :generate-data="problem.correct_answer || '无'" />
            </span>
          </div>
          <div class="analysis-header">解析：</div>
          <MarkdownView style="background-color: #e9f5ff" :generate-data="problem.analysis || '无解析'" />
        </div>

        <button @click="reset" class="reset-btn">重新尝试</button>
      </div>

      <!-- 导航按钮 -->
      <div class="navigation-buttons">
        <button @click="prevProblem" class="nav-btn prev">上一题</button>
        <button @click="nextProblem" class="nav-btn next">下一题</button>
      </div>
    </div>

    <div v-else class="loading">加载中...</div>
  </div>
</template>

<style scoped>
.problem-page {
  max-width: 900px;
  margin: 40px auto;
  padding: 30px;
  font-family: 'Roboto', sans-serif;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.meta-info {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
  flex-wrap: wrap;
}

.meta-item {
  background: #f0f0f0;
  padding: 5px 10px;
  border-radius: 16px;
}

/* 剩餘次數顯示樣式 */
.usage-display {
  background: #fefce8;
  border: 1px solid #fef08a;
  transition: all 0.2s;
}

.usage-display .loading-dots::after {
  content: '.';
  animation: dots 1.5s steps(5, end) infinite;
}

.problem-name {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}


.description {
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 1.6;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.option-item {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: all 0.3s;
}

.option-item.correct-option {
  background: #d4edda;
  border-color: #28a745;
}

.option-item.wrong-option {
  background: #f8d7da;
  border-color: #dc3545;
}

.option-label {
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
}

.option-input {
  margin-right: 10px;
}

.option-text {
  font-size: 16px;
}

.fill-in .text-input,
.short-answer .text-area {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 20px;
}

.submit-btn {
  background: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
  display: block;
  margin: 0 auto 30px;
}

.submit-btn:hover {
  background: #0056b3;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.post-submit {
  margin-top: 20px;
}

.result-banner {
  padding: 15px;
  border-radius: 8px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.result-banner.correct {
  background: #d4edda;
  color: #155724;
}

.result-banner.wrong {
  background: #f8d7da;
  color: #721c24;
}

.result-banner.neutral {
  background: #d1ecf1;
  color: #0c5460;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.toggle-btn,
.favorite-btn,
.reset-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  flex: 1;
  max-width: 180px;
}

.toggle-btn {
  background: #6c757d;
  color: white;
}

.favorite-btn {
  background: #ffc107;
  color: #333;
}

.reset-btn {
  background: #17a2b8;
  color: white;
  margin: 20px auto 0;
  display: block;
}

.analysis-box {
  margin-top: 20px;
  padding: 15px;
  background: #e9f5ff;
  border-radius: 8px;
}

.analysis-header {
  font-weight: bold;
  margin-bottom: 10px;
  color: #007bff;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #666;
  padding: 60px 0;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  gap: 20px;
}

.nav-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  color: white;
  transition: background 0.3s;
  flex: 1;
}

.nav-btn.prev {
  background: #6c757d;
}

.nav-btn.prev:hover {
  background: #5a6268;
}

.nav-btn.next {
  background: #28a745;
}

.nav-btn.next:hover {
  background: #218838;
}

/* 相似推荐区块整体 */
.similar-section {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60% { content: '...'; }
  80%, 100% { content: ''; }
}
.similar-card {
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}
.similar-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #c7d2fe;
}
.similar-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

/* hover 渐层 */
.similar-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(99, 102, 241, 0.03), rgba(99, 102, 241, 0.08));
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.similar-card:hover::after {
  opacity: 1;
}

.similar-card:hover::before {
  opacity: 1;
}

</style>