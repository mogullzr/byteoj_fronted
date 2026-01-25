<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ProblemsControllerService } from "../../../../generated/services/ProblemsControllerService";
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import {useRoute, useRouter} from "vue-router";
import {useMessageBox} from "@/view/components/alert/useMessageBox";
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
const problemId = ref<number>(Number(route.path.split('/')[3])); // Initial problem ID

const loadProblem = async (id: number) => {
  problemId.value = id;
  const res = await ProblemsControllerService.problemSearchByProblemIdUsingGet(id);
  if (res.code === 0) {
    problem.value = res.data;
    reset(); // Reset answers when loading new problem
  } else {
    error(res.message);
  }
};

onMounted(() => {
  loadProblem(problemId.value);
});

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
  if (!isUserSelected && isCorrectOption) return 'correct-option'; // Also highlight correct ones not selected
  return '';
};

const submitAnswer = () => {
  if (!problem.value) return;
  showAnswer.value = true;
  showAnalysis.value = true; // 默认展开解析
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
    isCorrect.value = null; // 简答题不自动判对错
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
      <h1 class="problem-name">{{ problem.problem_name }}</h1>

      <div class="meta-info">
        <span class="meta-item"><i class="fas fa-star"></i> {{ problem.difficulty_name }}</span>
        <span class="meta-item"><i class="fas fa-book"></i> {{ problem.source_name }}</span>
        <span v-if="problem.tagsList.length" class="meta-item"><i class="fas fa-tags"></i> {{ problem.tagsList.join(" · ") }}</span>
      </div>

      <div class="description">
        <MarkdownView :generate-data="problem.description" />
      </div>

      <!-- 选择题 -->
      <div v-if="problem.option_type === 1 || problem.option_type === 2" class="options">
        <div v-for="(opt, index) in parsedOptions()" :key="index"
             class="option-item"
             :class="getOptionClass(getOptionLetter(index))">
          <label class="option-label">
            <input
                v-if="problem.option_type === 1"
                type="radio"
                :value="getOptionLetter(index)"
                v-model="userSingleAnswer"
                class="option-input"
                :disabled="showAnswer"
            />
            <input
                v-else
                type="checkbox"
                :value="getOptionLetter(index)"
                v-model="userMultiAnswer"
                class="option-input"
                :disabled="showAnswer"
            />
            <span class="option-text">{{ getOptionLetter(index) }}. {{ opt }}</span>
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

      <button @click="submitAnswer" class="submit-btn" :disabled="showAnswer">
        {{ showAnswer ? "已提交" : "提交答案" }}
      </button>

      <!-- 提交后区域 -->
      <div v-if="showAnswer" class="post-submit">
        <div class="result-banner"
             :class="{
               'correct': isCorrect === true,
               'wrong': isCorrect === false,
               'neutral': isCorrect === null
             }">
          <i class="fas" :class="{
            'fa-check-circle': isCorrect === true,
            'fa-times-circle': isCorrect === false,
            'fa-info-circle': isCorrect === null
          }"></i>
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
            正确答案： <strong>{{ parsedCorrectAnswer().join('、') }}</strong>
          </div>
          <div class="analysis-header">
            解析：
          </div>
          <MarkdownView style="background-color: #e9f5ff" :generate-data="problem.analysis || '无解析'" />
        </div>

        <button @click="reset" class="reset-btn">重新尝试</button>
      </div>

      <!-- Navigation Buttons -->
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

.problem-name {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.meta-info {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.meta-item {
  background: #f0f0f0;
  padding: 5px 10px;
  border-radius: 16px;
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
}

.toggle-btn,
.favorite-btn,
.reset-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
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
  display: block;
  margin: 20px auto 0;
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
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
}

.nav-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  color: white;
  transition: background 0.3s;
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
</style>