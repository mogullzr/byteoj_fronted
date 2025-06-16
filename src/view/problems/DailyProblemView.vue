<script setup lang="ts">
import { ref, onMounted, Ref } from "vue";
import { useRouter } from "vue-router";
import { ProblemAlgorithmControllerService } from "../../../generated";
import { ProblemDailyInfo } from "../../../generated/models/ProblemDailyInfo";

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  category: string;
  color: string;
  _animProps?: {
    randomX: string;
    randomY: string;
    randomRotate: string;
    delay: string;
  };
}

const router = useRouter();
const isShuffling = ref(false);
const selectedProblem = ref<Problem | null>(null);
const showProblemDetail = ref(false);
const isCardSelected = ref(false);
const cardFlipped = ref(false);
const hasPickedDaily = ref(false);
const isResetting = ref(false);
const isExploding = ref(false);
const isGathering = ref(false);
const isExpanded = ref(false);
const showQuestionInfo = ref(true);
const hasShuffledOnce = ref(false);
const showShuffleNotice = ref(false);

const problems = ref<Problem[]>([]);

// 添加卡片位置颜色映射
const cardColors = [
  "#5E5CFC", // 蓝紫色
  "#5C8CFC", // 亮蓝色
  "#5CBCFC", // 天蓝色
  "#5CFCF4", // 青色
  "#5CFC8C", // 绿色
  "#ACFC5C", // 黄绿色
  "#FCD45C", // 金黄色
  "#FC945C", // 橙色
  "#FC5C7B", // 粉红色
];

const shuffleCards = () => {
  if (isShuffling.value) return;

  // 预先计算并分配随机值，避免在CSS中动态计算
  problems.value.forEach((problem, index) => {
    problem._animProps = {
      randomX: Math.random() * 100 - 50 + "vw",
      randomY: Math.random() * 100 - 50 + "vh",
      randomRotate: Math.random() * 720 - 360 + "deg",
      delay: index * 0.04 + "s",
    };
  });

  // 使用requestAnimationFrame确保下一帧再开始动画
  requestAnimationFrame(() => {
    // 开始洗牌动画
    isShuffling.value = true;
    showProblemDetail.value = false;
    cardFlipped.value = false;

    // 添加3D爆炸洗牌效果标志
    isExploding.value = true;

    // 延迟执行洗牌算法，等待爆炸动画
    setTimeout(() => {
      // 在洗牌时，改变显示为数字
      showQuestionInfo.value = false;

      // 重新洗牌算法 - 只打乱题目顺序，颜色保持不变
      const tempProblems = [...problems.value];
      for (let i = tempProblems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tempProblems[i], tempProblems[j]] = [tempProblems[j], tempProblems[i]];
      }

      // 更新problems，确保每个题目有固定的颜色位置
      for (let i = 0; i < problems.value.length; i++) {
        // 只交换题目内容（id, title, difficulty, category），保留原始颜色和动画属性
        problems.value[i].id = tempProblems[i].id;
        problems.value[i].title = tempProblems[i].title;
        problems.value[i].difficulty = tempProblems[i].difficulty;
        problems.value[i].category = tempProblems[i].category;
      }

      // 添加聚合效果标志
      isExploding.value = false;

      // 使用requestAnimationFrame确保下一帧再开始聚合动画
      requestAnimationFrame(() => {
        isGathering.value = true;

        // 延迟结束洗牌状态，等待卡片聚合动画完成
        setTimeout(() => {
          isGathering.value = false;
          isShuffling.value = false;
          hasShuffledOnce.value = true;

          // 洗牌完成后展开卡片
          isExpanded.value = true;
        }, 1200);
      });
    }, 1300); // 稍微缩短爆炸动画时间
  });
};

const goToProblem = (problem: Problem) => {
  if (isShuffling.value) return;

  // 如果卡片没有展开，则展开卡片而不是选择
  if (!isExpanded.value) {
    isExpanded.value = true;
    return;
  }

  // 添加判断，只有洗过牌后才能选择题目
  if (!hasShuffledOnce.value) {
    // 如果还没有洗牌，显示提示但不允许选择题目
    showShuffleNotice.value = true;
    setTimeout(() => {
      showShuffleNotice.value = false;
    }, 3000);
    return;
  }

  selectedProblem.value = problem;

  requestAnimationFrame(async () => {
    isCardSelected.value = true;

    await ProblemAlgorithmControllerService.problemDailySetUsingPost(
      problem.id
    );
    setTimeout(() => {
      cardFlipped.value = true;
      showProblemDetail.value = true;
      hasPickedDaily.value = true;
    }, 800);
  });
};

const navigateToProblem = (problemId: number) => {
  // 阻止事件冒泡
  event?.stopPropagation();
  // 导航到题目页面
  router.push(`/problems/algorithm/${problemId}`);
};

const toggleExpand = () => {
  // 只有在非特殊状态下才允许切换展开状态
  if (!isShuffling.value && !isCardSelected.value) {
    isExpanded.value = !isExpanded.value;
  }
};

const expandCards = () => {
  if (!isShuffling.value && !isCardSelected.value && !isResetting.value) {
    // 立即展开卡片
    isExpanded.value = true;
  }
};

const collapseCards = () => {
  if (!isShuffling.value && !isCardSelected.value && !isResetting.value) {
    // 添加短暂延迟，防止意外收起
    setTimeout(() => {
      isExpanded.value = false;
    }, 200);
  }
};

const getDifficultyClass = (difficulty: string) => {
  if (!difficulty) return "";

  if (difficulty === "简单") return "difficulty-easy";
  if (difficulty === "中等") return "difficulty-medium";
  if (difficulty === "困难") return "difficulty-hard";

  return "";
};

const loadProblemInfo = async () => {
  const response =
    await ProblemAlgorithmControllerService.problemDailyGetUsingPost();

  if (response.code === 0 && Array.isArray(response.data)) {
    const problemList = response.data;
    problemList.forEach((problem: any) => {
      let newProblem: Problem = {
        id: problem.problem_id,
        title: problem.problem_id + "." + problem.problem_name,
        difficulty: problem.difficulty || "中等",
        category: problem.category || "算法",
        color: "#5e5cfc",
      };
      problems.value.push(newProblem);
    });
    if (problemList.length === 1) {
      // 单题目时直接设置为选中状态并跳过检查
      const problem = problems.value[0];
      selectedProblem.value = problem;
      isExpanded.value = true;
      hasShuffledOnce.value = true;

      requestAnimationFrame(async () => {
        isCardSelected.value = true;

        await ProblemAlgorithmControllerService.problemDailySetUsingPost(
          problem.id
        );
        setTimeout(() => {
          cardFlipped.value = true;
          showProblemDetail.value = true;
          hasPickedDaily.value = true;
        }, 800);
      });
    }
  }
};

onMounted(async () => {
  // 加载当天的题目卡牌信息
  await loadProblemInfo();
  // 页面加载时，默认收起卡片
  isExpanded.value = false;
  showQuestionInfo.value = true;

  // 删除自动展开卡片的计时器，改为鼠标悬停触发
  // setTimeout(() => {
  //   isExpanded.value = true;
  // }, 500);

  // 随机排序牌组
  for (let i = problems.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [problems.value[i], problems.value[j]] = [
      problems.value[j],
      problems.value[i],
    ];
  }
});
</script>

<template>
  <div class="daily-problem-outer">
    <!-- 添加洗牌提示消息 -->
    <div class="shuffle-notice" v-if="showShuffleNotice">
      <div class="notice-content">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>请先洗牌，然后才能选择题目</span>
      </div>
    </div>

    <!-- 删除重新洗牌按钮 -->

    <!-- 美化标题 -->
    <div class="title-container">
      <h2 class="daily-title" v-if="!hasPickedDaily">每日一题</h2>
      <h2 class="daily-title today-title" v-else>
        <span class="title-text">今日题目</span>
        <div class="title-decoration">
          <div class="title-star left"></div>
          <div class="title-line"></div>
          <div class="title-star right"></div>
        </div>
      </h2>
    </div>

    <!-- 增强光效元素 -->
    <div class="light-effects" v-if="isExploding || isGathering">
      <div class="light-circle"></div>
      <div class="light-rays"></div>
      <div class="particles">
        <div
          v-for="i in 12"
          :key="i"
          class="particle"
          :style="{
            '--particle-x': Math.random() * 200 - 100 + '%',
            '--particle-y': Math.random() * 200 - 100 + '%',
            '--particle-size': Math.random() * 15 + 5 + 'px',
            '--particle-delay': Math.random() * 1 + 's',
            '--particle-duration': Math.random() * 1 + 1 + 's',
            '--particle-color':
              cardColors[Math.floor(Math.random() * cardColors.length)],
          }"
        ></div>
      </div>
    </div>

    <div class="card-area">
      <div
        class="container"
        :class="{
          shuffling: isShuffling,
          'card-selected': isCardSelected,
          resetting: isResetting,
          exploding: isExploding,
          gathering: isGathering,
          expanded: isExpanded,
          'show-info': showQuestionInfo,
        }"
        @mouseenter="expandCards"
        @mouseleave="collapseCards"
        :data-shuffled="hasShuffledOnce"
      >
        <div
          v-for="(problem, index) in problems"
          :key="problem.id"
          class="card"
          :class="{
            'selected-card':
              selectedProblem &&
              selectedProblem.id === problem.id &&
              isCardSelected,
            'other-card':
              selectedProblem &&
              selectedProblem.id !== problem.id &&
              isCardSelected,
            'card-flipped':
              selectedProblem &&
              selectedProblem.id === problem.id &&
              cardFlipped,
            'not-shuffled': !hasShuffledOnce,
          }"
          :style="{
            '--i': index - Math.floor(problems.length / 2),
            'background-color': cardColors[index],
            '--delay': problem._animProps
              ? problem._animProps.delay
              : index * 0.05 + 's',
            '--random-x': problem._animProps
              ? problem._animProps.randomX
              : '0px',
            '--random-y': problem._animProps
              ? problem._animProps.randomY
              : '0px',
            '--random-rotate': problem._animProps
              ? problem._animProps.randomRotate
              : '0deg',
            'z-index':
              selectedProblem && selectedProblem.id === problem.id
                ? 100
                : 10 - Math.abs(index - Math.floor(problems.length / 2)),
          }"
          @click="
            // 只有在非选中状态或未翻转状态下才响应点击
            (!selectedProblem ||
              selectedProblem.id !== problem.id ||
              !cardFlipped) &&
              goToProblem(problem)
          "
        >
          <div class="card-front">
            <div class="card-info" v-if="showQuestionInfo">
              <div class="card-badge">{{ index + 1 }}</div>
              <div class="card-content">
                <h3 class="card-title">{{ problem.title }}</h3>
                <div class="card-problem-info">
                  <div
                    class="card-difficulty"
                    :class="getDifficultyClass(problem.difficulty)"
                  >
                    <span class="difficulty-icon"></span>
                    {{ problem.difficulty }}
                  </div>
                  <div class="card-category">
                    <span class="category-icon"></span>
                    {{ problem.category }}
                  </div>
                </div>
              </div>
            </div>
            <!-- 洗牌后显示数字 -->
            <div class="card-number" v-else>
              {{ index + 1 }}
            </div>
          </div>
          <div
            class="card-back"
            v-if="selectedProblem && selectedProblem.id === problem.id"
          >
            <div class="card-back-content">
              <div class="card-badge large">{{ index + 1 }}</div>
              <h3>{{ problem.title }}</h3>
              <div class="card-problem-info detailed">
                <div
                  class="card-difficulty"
                  :class="getDifficultyClass(problem.difficulty)"
                >
                  <span class="difficulty-icon"></span>
                  {{ problem.difficulty }}
                </div>
                <div class="card-category">
                  <span class="category-icon"></span>
                  {{ problem.category }}
                </div>
              </div>
              <div class="card-decoration">
                <div class="decoration-line"></div>
                <div class="decoration-dot"></div>
                <div class="decoration-line"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 挑战按钮区域 - 放在卡片区域内但在卡片下方 -->
      <div
        class="challenge-button-container"
        v-if="hasPickedDaily && selectedProblem"
      >
        <button
          class="challenge-btn"
          @click="navigateToProblem(selectedProblem.id)"
        >
          <span class="challenge-text">开始挑战</span>
          <span class="challenge-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </span>
        </button>
      </div>

      <div class="action-buttons" v-if="!hasPickedDaily">
        <!-- 洗牌按钮 -->
        <button
          class="shuffle-btn"
          @click="shuffleCards"
          :disabled="isShuffling || isCardSelected"
        >
          <span class="shuffle-text">{{
            isShuffling ? "洗牌中..." : "洗牌抽题"
          }}</span>
          <span class="shuffle-icon" v-if="!isShuffling">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
          </span>
          <span class="loader" v-else></span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700;800;900&display=swap");

.daily-problem-outer {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  overflow-x: hidden;
  position: relative;
}

/* 删除 .daily-actions 和 .restart-btn 相关样式 */

/* 标题淡入淡出过渡 */
.title-container {
  position: relative;
  margin-bottom: 3rem;
  padding: 0.5rem 0;
}

.daily-title {
  font-size: 2.5rem;
  color: #333;
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  position: relative;
  z-index: 50;
  transition: all 0.5s ease;
}

/* 今日题目标题特殊样式 */
.today-title {
  color: #5e5cfc;
  display: inline-block;
  padding: 0.5rem 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 25px rgba(94, 92, 252, 0.15);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(240, 240, 255, 0.9) 100%
  );
  animation: titleAppear 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.title-text {
  font-weight: 800;
  background: linear-gradient(135deg, #5e5cfc 0%, #fc5c7b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 2px;
}

.title-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
}

.title-line {
  height: 2px;
  width: 100px;
  background: linear-gradient(
    90deg,
    rgba(94, 92, 252, 0.2) 0%,
    rgba(94, 92, 252, 0.8) 50%,
    rgba(94, 92, 252, 0.2) 100%
  );
  margin: 0 10px;
}

.title-star {
  width: 12px;
  height: 12px;
  position: relative;
  display: inline-block;
}

.title-star:before,
.title-star:after {
  content: "";
  position: absolute;
  background-color: #5e5cfc;
}

.title-star:before {
  width: 12px;
  height: 3px;
  top: 5px;
  left: 0;
}

.title-star:after {
  width: 3px;
  height: 12px;
  top: 0;
  left: 5px;
}

.title-star.left {
  transform: rotate(45deg);
}

.title-star.right {
  transform: rotate(-45deg);
}

@keyframes titleAppear {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.card-area {
  position: relative;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.container {
  position: relative;
  height: 400px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  max-width: 800px;
  perspective: 1500px;
  perspective-origin: center;
  --card-shift: 120px;
  /* 添加延迟过渡效果，让卡片收起更平滑 */
  transition: all 0.3s ease;
  /* 增加鼠标判定区域，使交互更自然 */
  padding: 20px;
  border-radius: 12px;
}

.card {
  position: absolute;
  width: 240px;
  height: 320px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1em;
  font-weight: 400;
  border: 8px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  color: #333;
  cursor: pointer;
  user-select: none;
  font-family: "Poppins", sans-serif;
  transition-property: transform, box-shadow, color, border;
  transition-duration: 0.4s;
  transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
  will-change: transform;
  backface-visibility: hidden;
  transform-origin: center center;
  overflow: hidden;
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  backface-visibility: hidden;
  border-radius: 4px;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.card-front::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  pointer-events: none;
  z-index: -1;
}

.card-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  text-align: center;
  color: #333;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(250, 250, 255, 0.95) 100%
  );
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.05), 0 5px 15px rgba(0, 0, 0, 0.1);
  border-radius: inherit;
  width: 100%;
  height: 100%;
  position: relative;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.card-front {
  transform: rotateY(0deg);
}

.card-back {
  transform: rotateY(180deg);
  padding: 25px;
  text-align: center;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.97) 0%,
    rgba(245, 245, 255, 0.97) 100%
  );
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.05), 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: inherit;
  backdrop-filter: blur(5px);
}

.card-back::before {
  content: "";
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  border: 1px dashed rgba(94, 92, 252, 0.3);
  border-radius: inherit;
  pointer-events: none;
}

.card-back-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px 15px;
  position: relative;
  animation: fadeInContent 0.8s ease forwards;
  animation-delay: 0.3s;
  opacity: 0;
}

.card-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  width: 100%;
}

.decoration-line {
  height: 2px;
  width: 60px;
  background: linear-gradient(
    90deg,
    rgba(94, 92, 252, 0.1) 0%,
    rgba(94, 92, 252, 0.6) 50%,
    rgba(94, 92, 252, 0.1) 100%
  );
}

.decoration-dot {
  width: 8px;
  height: 8px;
  background-color: #5e5cfc;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(94, 92, 252, 0.5);
  animation: pulseDot 2s infinite ease-in-out;
}

@keyframes pulseDot {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
}

.card-back h3 {
  margin: 40px 0 20px;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #2c2c54, #5e5cfc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 15px;
  text-align: center;
  max-width: 90%;
  text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.5);
}

.card-back h3::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, #5e5cfc, #4a48e0);
  transform: translateX(-50%);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(94, 92, 252, 0.3);
}

.card-prompt {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
}

.start-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #5e5cfc, #4a48e0);
  color: white;
  font-weight: 600;
  font-size: 16px;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 6px 15px rgba(94, 92, 252, 0.3);
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
}

.start-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(94, 92, 252, 0.4);
}

.start-icon {
  display: inline-flex;
  transition: transform 0.3s ease;
}

.start-button:hover .start-icon {
  transform: translateX(5px);
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.card-number {
  font-size: 6em;
  font-weight: 800;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9),
    rgba(255, 255, 255, 0.6)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.card-flipped {
  transform: rotateY(180deg) !important;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

/* 被选中的卡片 */
.card.selected-card {
  transform: translateZ(300px) scale(1.2) rotate(0deg) !important;
  left: calc(50% - 120px);
  top: calc(50% - 160px);
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  color: rgba(0, 0, 0, 0.25);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
  border-width: 8px;
  z-index: 1000 !important;
  animation: pullOut 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes pullOut {
  0% {
    transform: translateZ(0) scale(1) rotate(calc(var(--i) * 5deg));
    filter: brightness(1) contrast(1);
  }
  50% {
    transform: translateZ(500px) scale(1.5) rotate(0deg);
    filter: brightness(1.1) contrast(1.1);
  }
  100% {
    transform: translateZ(300px) scale(1.2) rotate(0deg);
    filter: brightness(1.05) contrast(1.05);
  }
}

/* 其他卡片在选中时的效果 */
.card.other-card {
  opacity: 0 !important;
  transform: translate(calc(var(--i) * 300px), calc(var(--i) * 200px))
    scale(0.3) rotate(calc(var(--i) * 10deg)) !important;
  transition: all 0.6s cubic-bezier(0.6, -0.28, 0.735, 0.045) !important;
  filter: blur(2px);
  pointer-events: none;
}

/* 合在一起状态下，禁用除最上层以外的卡片点击 */
.container:not(.expanded):not(.card-selected):not(.shuffling):not(
    .gathering
  ):not(.exploding)
  .card {
  pointer-events: none;
}

/* 只允许最上面的卡片可点击 */
.container:not(.expanded):not(.card-selected):not(.shuffling):not(
    .gathering
  ):not(.exploding)
  .card:last-child {
  pointer-events: auto;
}

/* 统一卡片样式和修复悬停效果 */
.container.expanded:not(.card-selected):not(.shuffling):not(.gathering):not(
    .exploding
  ):not(.show-info)
  .card:hover {
  transform: translate(calc(var(--i) * 120px), -70px)
    rotate(calc(var(--i) * 5deg)) !important;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease-out;
}

/* 数字卡片样式调整 */
.card-number {
  font-size: 5em;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

/* 确保卡片内容切换动画 */
.container:not(.show-info) .card .card-info {
  opacity: 0;
  transform: scale(0.8);
  position: absolute;
  transition: opacity 0.4s ease, transform 0.4s ease;
  pointer-events: none;
}

.container.show-info .card .card-number {
  opacity: 0;
  transform: scale(0.8);
  position: absolute;
  transition: opacity 0.4s ease, transform 0.4s ease;
  pointer-events: none;
}

.container:not(.show-info) .card .card-number {
  opacity: 1;
  transform: scale(1);
  position: relative;
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.container.show-info .card .card-info {
  opacity: 1;
  transform: scale(1);
  position: relative;
  transition: opacity 0.4s ease, transform 0.4s ease;
}

/* 修复问题难度标签样式 */
.card-problem-info {
  display: flex;
  gap: 8px;
  font-size: 14px;
  margin-top: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.card-difficulty {
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
  color: white;
  font-size: 13px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-category {
  padding: 3px 10px;
  border-radius: 20px;
  background-color: #1890ff;
  color: white;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 确保展开状态下数字卡片的悬停效果协调，同样不改变位置和旋转 */
.container.expanded:not(.card-selected):not(.shuffling):not(.gathering):not(
    .exploding
  ):not(.show-info)
  .card:hover
  .card-number {
  transform: scale(1.05) translateY(-5px);
  transition: transform 0.3s ease;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  color: rgba(255, 255, 255, 1);
}

/* 洗牌提示样式 */
.shuffle-notice {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  animation: noticeSlideDown 0.5s ease-out,
    noticeSlideUp 0.5s ease-in 2.5s forwards;
}

.notice-content {
  background-color: #5e5cfc;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

@keyframes noticeSlideDown {
  0% {
    transform: translate(-50%, -50px);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes noticeSlideUp {
  0% {
    transform: translate(-50%, 0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50px);
    opacity: 0;
  }
}

/* 当用户尝试在洗牌前选择卡片时，添加样式以提示不可选择状态 */
.container:not(.shuffling):not(.card-selected):not(.resetting) .card:hover {
  cursor: pointer;
}

/* 未洗牌时的卡片禁用状态 */
.card.not-shuffled:hover::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0);
  border: 2px dashed rgba(94, 92, 252, 0.5);
  border-radius: inherit;
  pointer-events: none;
  z-index: 5;
  animation: borderPulse 1.5s infinite;
}

@keyframes borderPulse {
  0%,
  100% {
    border-color: rgba(94, 92, 252, 0.3);
  }
  50% {
    border-color: rgba(94, 92, 252, 0.8);
  }
}

/* 未洗牌时点击卡片的提示文本 */
.card.not-shuffled:active::after {
  content: "请先洗牌";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(94, 92, 252, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
  pointer-events: none;
  z-index: 10;
}

/* 新增卡片编号徽章 */
.card-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #5e5cfc, #4a48e0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 4px 10px rgba(94, 92, 252, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.8);
  z-index: 10;
  transition: all 0.3s ease;
}

.card-badge.large {
  top: 20px;
  right: 20px;
  width: 46px;
  height: 46px;
  font-size: 22px;
  box-shadow: 0 6px 15px rgba(94, 92, 252, 0.5);
  border: 3px solid rgba(255, 255, 255, 0.9);
}

.card:hover .card-badge {
  transform: scale(1.1) rotate(10deg);
  box-shadow: 0 6px 15px rgba(94, 92, 252, 0.5);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px 15px;
  position: relative;
  animation: fadeInContent 0.6s ease forwards;
  opacity: 1;
}

@keyframes fadeInContent {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  margin: 15px 0 25px 0;
  line-height: 1.4;
  position: relative;
  z-index: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
  background: linear-gradient(135deg, #2c2c54, #5e5cfc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 0.5px;
  text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.5);
  transform: translateZ(10px);
  transition: all 0.3s ease;
}

.card-title::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, #5e5cfc, #4a48e0);
  transform: translateX(-50%);
  z-index: 0;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(94, 92, 252, 0.3);
}

.card-problem-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  width: 100%;
  margin-top: 10px;
}

.card-problem-info.detailed {
  margin: 25px 0;
  gap: 18px;
}

.card-difficulty,
.card-category {
  padding: 10px 18px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  width: 80%;
  justify-content: center;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.card-difficulty:hover,
.card-category:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.card-difficulty::before,
.card-category::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-25deg);
  transition: all 0.75s ease;
}

.card-difficulty:hover::before,
.card-category:hover::before {
  left: 100%;
}

/* 难度级别样式 */
.difficulty-easy {
  background: linear-gradient(135deg, #52c41a, #389e0d);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.difficulty-medium {
  background: linear-gradient(135deg, #faad14, #d48806);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.difficulty-hard {
  background: linear-gradient(135deg, #f5222d, #cf1322);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.difficulty-icon,
.category-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.card-category {
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 确保展开状态下数字卡片的悬停效果协调 */
.container.expanded:not(.card-selected):not(.shuffling):not(.gathering):not(
    .exploding
  ):not(.show-info)
  .card:hover
  .card-number {
  transform: scale(1.05) translateY(-5px);
  text-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

/* 恢复重要动画 */
.container.shuffling .card {
  animation: shuffle 1.5s ease-in-out;
}

@keyframes shuffle {
  0% {
    transform: rotate(calc(var(--i) * 5deg))
      translate(calc(var(--i) * 120px), -50px);
  }
  25% {
    transform: rotate(calc(var(--i) * -15deg))
      translate(calc(var(--i) * -80px), 50px);
  }
  50% {
    transform: rotate(calc(var(--i) * 20deg))
      translate(calc(var(--i) * 60px), -120px);
  }
  75% {
    transform: rotate(calc(var(--i) * -10deg))
      translate(calc(var(--i) * -40px), 80px);
  }
  100% {
    transform: rotate(calc(var(--i) * 5deg))
      translate(calc(var(--i) * 120px), -50px);
  }
}

.shuffle-btn {
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  background-color: #5e5cfc;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(94, 92, 252, 0.3);
  font-family: "Poppins", sans-serif;
  margin-top: 2rem;
  z-index: 200;
  position: relative;
  animation: fadeIn 0.5s ease;
}

.shuffle-btn:before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 70%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-25deg);
  animation: shimmer 3s infinite;
}

.shuffle-icon {
  display: inline-flex;
  animation: wobble 2s ease-in-out infinite;
  transform-origin: center;
}

@keyframes wobble {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(15deg);
  }
  50% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

/* 禁用洗牌按钮时的样式 */
.shuffle-btn:disabled {
  background: linear-gradient(135deg, #a5a4e0, #8f7fd6);
  cursor: not-allowed;
  transform: none !important;
  box-shadow: 0 5px 15px rgba(94, 92, 252, 0.2) !important;
  opacity: 0.7;
}

.shuffle-btn:hover {
  transform: perspective(800px) translateY(-5px) translateZ(10px);
  box-shadow: 0 15px 35px rgba(94, 92, 252, 0.4), 0 8px 20px rgba(0, 0, 0, 0.15),
    inset 0 -5px 10px rgba(0, 0, 0, 0.2);
}

.shuffle-btn:active {
  transform: perspective(800px) translateY(-2px) translateZ(5px);
  box-shadow: 0 8px 20px rgba(94, 92, 252, 0.3), 0 4px 10px rgba(0, 0, 0, 0.1),
    inset 0 -3px 5px rgba(0, 0, 0, 0.2);
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 保留原来的光效样式 */
.light-effects {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10;
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* 提高性能的关键属性 */
  will-change: opacity;
  contain: content;
}

.light-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(94, 92, 252, 0.5) 0%,
    rgba(94, 92, 252, 0) 70%
  );
  animation: pulseLight 2s ease-in-out infinite alternate;
  opacity: 0.7;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* 避免复合层 */
  will-change: transform, opacity;
  contain: layout paint;
}

.light-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  transform: translate(-50%, -50%);
  background: radial-gradient(
      circle,
      transparent 30%,
      rgba(94, 92, 252, 0.1) 31%,
      transparent 70%
    ),
    radial-gradient(
      circle,
      transparent 40%,
      rgba(252, 92, 123, 0.1) 41%,
      transparent 75%
    );
  animation: rotateRays 8s linear infinite;
}

.light-rays::before,
.light-rays::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  border-radius: 50%;
  transform: rotate(30deg);
}

.light-rays::after {
  transform: rotate(60deg);
}

/* 粒子效果 */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  contain: strict;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--particle-size);
  height: var(--particle-size);
  background-color: var(--particle-color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.8;
  animation: particleMove 1.8s ease-out var(--particle-delay) forwards;
  will-change: transform, opacity;
  contain: strict;
}

@keyframes particleMove {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(
        calc(-50% + var(--particle-x)),
        calc(-50% + var(--particle-y))
      )
      scale(1);
    opacity: 0;
  }
}

@keyframes pulseLight {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0.3;
  }
}

@keyframes rotateRays {
  0% {
    transform: translate(-50%, -50%) rotate(0);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* 问题详情弹窗样式 */
.problem-detail {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.4s ease;
  backdrop-filter: blur(5px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.problem-card {
  width: 90%;
  max-width: 500px;
  background-color: white;
  border-radius: 15px;
  padding: 2rem;
  position: relative;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: scale(0.95);
}

@keyframes slideUp {
  0% {
    transform: translateY(100px) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(0.95);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 1.8rem;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.problem-card h3 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1rem;
}

.problem-info {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.difficulty,
.category {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.difficulty {
  background-color: #f0f0f0;
  color: #666;
}

.problem-desc {
  color: #555;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.start-btn {
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  background-color: #5e5cfc;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.start-btn:hover {
  background-color: #4a48e0;
}

/* 难度样式 */
.difficulty-简单 .difficulty {
  background-color: #e6f7e6;
  color: #52c41a;
}

.difficulty-中等 .difficulty {
  background-color: #fff7e6;
  color: #fa8c16;
}

.difficulty-困难 .difficulty {
  background-color: #fff1f0;
  color: #f5222d;
}

@media screen and (max-width: 576px) {
  .card {
    transform: scale(0.3);
  }

  .daily-title {
    font-size: 1.8rem;
  }
}

/* 卡片选中状态的容器样式 */
.container.card-selected {
  perspective: 1200px;
}

/* 重置动画相关样式 */
.container.resetting .card {
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.container.resetting .card.selected-card {
  animation: resetCard 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes resetCard {
  0% {
    transform: translateZ(300px) scale(1.2) rotate(0deg);
    filter: brightness(1.05) contrast(1.05);
  }
  30% {
    transform: translateZ(100px) scale(1.1) rotate(0deg);
    opacity: 1;
    filter: brightness(1) contrast(1);
  }
  100% {
    transform: translateZ(0) scale(0.9) rotate(calc(var(--i) * 5deg));
    opacity: 0.8;
  }
}

/* 恢复其他卡片的动画 */
.container.resetting .card.other-card {
  animation: resetOtherCards 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes resetOtherCards {
  0% {
    opacity: 0;
    transform: translate(calc(var(--i) * 300px), calc(var(--i) * 200px))
      scale(0.3) rotate(calc(var(--i) * 10deg));
  }
  50% {
    opacity: 0.5;
    filter: blur(1px);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: rotate(calc(var(--i) * 5deg))
      translate(calc(var(--i) * 50px), 0px) scale(0.9);
  }
}

/* 添加淡入淡出动画 */
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}

/* 炫酷洗牌效果相关的CSS */
.container.exploding .card {
  animation: explodeScale 1.4s ease-out forwards,
    explodeRotate 1.4s ease-out forwards, explodeMove 1.4s ease-out forwards,
    explodeFade 1.4s ease-out forwards;
  animation-delay: calc(var(--delay));
  transform-style: preserve-3d;
  backface-visibility: hidden;
  will-change: transform, opacity;
}

.container.gathering .card {
  animation: gatherScale 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
    gatherRotate 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
    gatherMove 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
    gatherFade 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: calc(var(--delay));
  transform-style: preserve-3d;
  backface-visibility: hidden;
  will-change: transform, opacity;
  transform: translateZ(0);
}

@keyframes explodeScale {
  0% {
    scale: 1;
  }
  100% {
    scale: 0.1;
  }
}

@keyframes explodeRotate {
  0% {
    rotate: calc(var(--i) * 5deg);
  }
  100% {
    rotate: var(--random-rotate);
  }
}

@keyframes explodeMove {
  0% {
    translate: calc(var(--i) * 120px) -50px;
  }
  20% {
    translate: 0 0;
  }
  100% {
    translate: var(--random-x) var(--random-y);
  }
}

@keyframes explodeFade {
  0% {
    opacity: 1;
  }
  60% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
  }
}

@keyframes gatherScale {
  0% {
    scale: 0.1;
  }
  100% {
    scale: 1;
  }
}

@keyframes gatherRotate {
  0% {
    rotate: var(--random-rotate);
  }
  100% {
    rotate: calc(var(--i) * 5deg);
  }
}

@keyframes gatherMove {
  0% {
    translate: var(--random-x) var(--random-y);
  }
  60% {
    translate: calc(var(--i) * 150px) -30px;
  }
  100% {
    translate: calc(var(--i) * 120px) -50px;
  }
}

@keyframes gatherFade {
  0% {
    opacity: 0;
  }
  60% {
    opacity: 0.9;
  }
  100% {
    opacity: 1;
  }
}

/* 添加卡片光晕效果 */
.container.exploding .card::before,
.container.gathering .card::before {
  content: "";
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: radial-gradient(
    circle,
    var(--particle-color, rgba(94, 92, 252, 0.4)) 0%,
    rgba(0, 0, 0, 0) 70%
  );
  border-radius: 50%;
  opacity: 0;
  z-index: -1;
  animation: glowPulse 1.5s ease-in-out infinite alternate;
}

@keyframes glowPulse {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
}

/* 修改洗牌按钮效果为更炫酷的3D效果 */
.shuffle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 1rem 2rem;
  min-width: 150px;
  position: relative;
  background: linear-gradient(135deg, #5e5cfc, #6a48ff);
  border: none;
  box-shadow: 0 10px 30px rgba(94, 92, 252, 0.3), 0 5px 15px rgba(0, 0, 0, 0.1),
    inset 0 -5px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  transform-style: preserve-3d;
  transform: perspective(800px) translateZ(0);
}

.shuffle-btn:before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 70%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-25deg);
  animation: shimmer 3s infinite;
}

.shuffle-icon {
  display: inline-flex;
  animation: wobble 2s ease-in-out infinite;
  transform-origin: center;
}

.shuffle-btn:hover {
  transform: perspective(800px) translateY(-5px) translateZ(10px);
  box-shadow: 0 15px 35px rgba(94, 92, 252, 0.4), 0 8px 20px rgba(0, 0, 0, 0.15),
    inset 0 -5px 10px rgba(0, 0, 0, 0.2);
}

.shuffle-btn:active {
  transform: perspective(800px) translateY(-2px) translateZ(5px);
  box-shadow: 0 8px 20px rgba(94, 92, 252, 0.3), 0 4px 10px rgba(0, 0, 0, 0.1),
    inset 0 -3px 5px rgba(0, 0, 0, 0.2);
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 确保卡片翻转效果正常工作 */
.container .card.card-flipped .card-front {
  transform: rotateY(180deg);
}

.container .card.card-flipped .card-back {
  transform: rotateY(0);
}

/* 确保hover效果 */
.container .card:hover {
  box-shadow: 0 35px 60px rgba(0, 0, 0, 0.25);
}

/* 使卡片分开动画更流畅 */
.container:not(.card-selected):not(.shuffling):not(.gathering):not(.exploding)
  .card {
  transform: translate(calc(var(--i) * 120px), -50px)
    rotate(calc(var(--i) * 5deg));
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0);
  border-width: 10px;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    box-shadow 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.4s ease;
}

/* 性能优化：减少粒子数量，使核心动画更加流畅 */
.particle {
  opacity: 0.8; /* 提高初始可见度 */
  animation: particleMove 1.8s ease-out var(--particle-delay) forwards;
}

/* 始终使用硬件加速 */
.container .card,
.light-effects,
.light-circle,
.light-rays,
.particles,
.particle {
  transform: translateZ(0);
  will-change: transform;
}

/* 更直接的动画，减少中间关键帧 */
@keyframes explodeScale {
  0% {
    scale: 1;
  }
  100% {
    scale: 0.1;
  }
}

@keyframes explodeRotate {
  0% {
    rotate: calc(var(--i) * 5deg);
  }
  100% {
    rotate: var(--random-rotate);
  }
}

@keyframes gatherScale {
  0% {
    scale: 0.1;
  }
  100% {
    scale: 1;
  }
}

@keyframes gatherRotate {
  0% {
    rotate: var(--random-rotate);
  }
  100% {
    rotate: calc(var(--i) * 5deg);
  }
}

/* 添加回被移除的样式 */
.container:hover .card {
  /* 移除会导致抖动的hover样式 */
}

/* 选中状态下不应用hover效果 */
.container.card-selected:hover .card {
  /* 不应该在这里设置transform属性，会导致抖动 */
}

.container.card-selected:hover .card.selected-card {
  transform: translateZ(300px) scale(1.2) rotate(0deg) !important;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

/* 确保动画不会冲突 */
.container.card-selected .card,
.container.shuffling .card,
.container.gathering .card,
.container.exploding .card {
  /* 防止与hover状态冲突 */
  pointer-events: none;
}

/* 添加展开/收起卡片的样式 */
.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  flex-wrap: wrap;
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #4a48e0, #5e5cfc);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(94, 92, 252, 0.3);
}

.expand-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(94, 92, 252, 0.5);
}

.expand-icon {
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* 修改卡片默认状态（合在一起） */
.container:not(.expanded):not(.card-selected):not(.shuffling):not(
    .gathering
  ):not(.exploding)
  .card {
  /* 为堆叠的卡片添加微妙的位移，创建牌堆效果 */
  transform: translate(calc(var(--i) * 0.5px), calc(var(--i) * 0.5px))
    rotate(calc(var(--i) * 0.2deg)) !important;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  /* 添加堆叠阴影效果 */
  box-shadow: 0 calc(2px + abs(var(--i)) * 0.5px)
    calc(5px + abs(var(--i)) * 0.5px) rgba(0, 0, 0, 0.1);
  /* 调整z-index使卡片正确堆叠 */
  z-index: calc(var(--i) + 100);
}

/* 添加卡片点击的炫酷效果 */
.container:not(.expanded) .card:last-child:active {
  transform: translateY(5px) scale(0.98) !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.2s ease !important;
}

/* 展开状态下的卡片样式 */
.container.expanded:not(.card-selected):not(.shuffling):not(.gathering):not(
    .exploding
  )
  .card {
  transform: translate(calc(var(--i) * 120px), -50px)
    rotate(calc(var(--i) * 5deg));
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  /* 调整z-index确保卡片正确层叠 */
  z-index: calc(10 - abs(var(--i)));
}

/* 当卡片收起时，让展开按钮更显眼 */
.container:not(.expanded) ~ .action-buttons .expand-btn {
  background: linear-gradient(135deg, #4a48e0, #5e5cfc);
  box-shadow: 0 8px 20px rgba(94, 92, 252, 0.4);
}

/* 收起状态下的容器悬停效果 */
.container:not(.expanded):not(.card-selected):not(.shuffling):not(
    .gathering
  ):not(.exploding):hover {
  background-color: rgba(94, 92, 252, 0.03);
  box-shadow: 0 0 20px rgba(94, 92, 252, 0.1);
  cursor: pointer;
}

/* 优化合在一起的卡片显示提示 */
.container:not(.expanded):not(.card-selected):not(.shuffling):not(
    .gathering
  ):not(.exploding)::after {
  content: "鼠标悬停展开";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 100px);
  color: #5e5cfc;
  font-weight: bold;
  font-size: 18px;
  opacity: 0.7;
  animation: hintPulse 1.5s infinite ease-in-out;
  pointer-events: none;
  /* 提高提示可见度 */
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
  background-color: rgba(255, 255, 255, 0.6);
  padding: 8px 15px;
  border-radius: 20px;
}

@keyframes hintPulse {
  0%,
  100% {
    opacity: 0.7;
    transform: translate(-50%, 100px) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, 100px) scale(1.1);
  }
}

/* 颜色过渡效果 */
.container.show-info .card .card-info {
  transition: opacity 0.5s ease, transform 0.5s ease;
  opacity: 1;
  transform: scale(1);
}

.container:not(.show-info) .card .card-info {
  transition: opacity 0.5s ease, transform 0.5s ease;
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
  position: absolute;
}

.container.show-info .card .card-number {
  transition: opacity 0.5s ease, transform 0.5s ease;
  opacity: 0;
  transform: scale(0.8) translateY(20px);
  position: absolute;
}

/* 修复问题难度标签样式 */
.card-problem-info {
  display: flex;
  gap: 8px;
  font-size: 14px;
  margin-top: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.card-difficulty {
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
  color: white;
  font-size: 13px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-category {
  padding: 3px 10px;
  border-radius: 20px;
  background-color: #1890ff;
  color: white;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 确保展开状态下数字卡片的悬停效果协调，同样不改变位置和旋转 */
.container.expanded:not(.card-selected):not(.shuffling):not(.gathering):not(
    .exploding
  ):not(.show-info)
  .card:hover
  .card-number {
  transform: scale(1.05) translateY(-5px);
  transition: transform 0.3s ease;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  color: rgba(255, 255, 255, 1);
}

/* 洗牌提示样式 */
.shuffle-notice {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  animation: noticeSlideDown 0.5s ease-out,
    noticeSlideUp 0.5s ease-in 2.5s forwards;
}

.notice-content {
  background-color: #5e5cfc;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

@keyframes noticeSlideDown {
  0% {
    transform: translate(-50%, -50px);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes noticeSlideUp {
  0% {
    transform: translate(-50%, 0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50px);
    opacity: 0;
  }
}

/* 当用户尝试在洗牌前选择卡片时，添加样式以提示不可选择状态 */
.container:not(.shuffling):not(.card-selected):not(.resetting) .card:hover {
  cursor: pointer;
}

/* 未洗牌时的卡片禁用状态 */
.card.not-shuffled:hover::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0);
  border: 2px dashed rgba(94, 92, 252, 0.5);
  border-radius: inherit;
  pointer-events: none;
  z-index: 5;
  animation: borderPulse 1.5s infinite;
}

@keyframes borderPulse {
  0%,
  100% {
    border-color: rgba(94, 92, 252, 0.3);
  }
  50% {
    border-color: rgba(94, 92, 252, 0.8);
  }
}

/* 未洗牌时点击卡片的提示文本 */
.card.not-shuffled:active::after {
  content: "请先洗牌";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(94, 92, 252, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
  pointer-events: none;
  z-index: 10;
}

/* 添加新的挑战按钮样式 */
.challenge-button-container {
  margin: 1rem auto 2rem;
  display: flex;
  justify-content: center;
  animation: fadeIn 0.8s ease forwards;
  animation-delay: 0.5s;
  opacity: 0;
  position: relative;
  z-index: 300;
}

.challenge-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1.2rem 3rem;
  background: linear-gradient(135deg, #5e5cfc, #4a48e0);
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 25px rgba(94, 92, 252, 0.4), 0 6px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  font-family: "Poppins", sans-serif;
  letter-spacing: 0.5px;
  z-index: 200;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.challenge-btn:hover {
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 15px 30px rgba(94, 92, 252, 0.5), 0 8px 15px rgba(0, 0, 0, 0.15);
}

.challenge-btn:active {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 15px rgba(94, 92, 252, 0.4), 0 4px 8px rgba(0, 0, 0, 0.1);
}

.challenge-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-25deg);
  animation: shimmerChallenge 3s infinite;
}

.challenge-icon {
  display: inline-flex;
  transition: transform 0.3s ease;
}

.challenge-btn:hover .challenge-icon {
  transform: translateX(5px);
}

@keyframes shimmerChallenge {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
