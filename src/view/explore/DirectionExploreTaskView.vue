<template>
  <main class="task-page">
    <router-link class="back-link" to="/explore">← 返回方向地图</router-link>
    <section v-if="!task" class="task-shell empty-state">
      <span class="task-eyebrow">体验任务</span>
      <h1>这个体验暂时不可用</h1>
      <p>我们还在整理这个方向的任务，你可以先回到方向地图看看其他内容。</p>
      <router-link class="action-primary" to="/explore"
        >回到方向地图</router-link
      >
    </section>

    <section v-else class="task-shell">
      <header class="task-header">
        <div>
          <span class="task-eyebrow"
            >{{ direction?.name || "方向体验" }} · 约
            {{ task.estimatedMinutes }} 分钟</span
          >
          <h1>{{ task.title }}</h1>
          <p>一步一步完成就好。选错了可以重试，过程记录只保存在这台设备上。</p>
        </div>
        <router-link class="records-link" to="/explore/result"
          >我的记录</router-link
        >
      </header>

      <div v-if="!completed" class="progress-row" aria-live="polite">
        <span>第 {{ stepIndex + 1 }} 步 / {{ task.steps.length }}</span>
        <div class="progress-track">
          <div
            class="progress-value"
            :style="{
              width: `${((stepIndex + 1) / task.steps.length) * 100}%`,
            }"
          ></div>
        </div>
      </div>

      <div v-if="!completed" class="task-content">
        <div class="step-copy">
          <span class="step-number">{{
            String(stepIndex + 1).padStart(2, "0")
          }}</span>
          <div>
            <h2>{{ currentStep.title }}</h2>
            <p>{{ currentStep.content }}</p>
          </div>
        </div>

        <div class="interaction-area">
          <template v-if="isChoiceType(currentStep.interactionType)">
            <button
              v-for="option in currentStep.options"
              :key="option.id"
              type="button"
              class="choice-option"
              :class="{ selected: selectedAnswer === option.id }"
              :disabled="stepCorrect"
              @click="selectAnswer(option.id)"
            >
              <span class="choice-indicator"></span>{{ option.label }}
            </button>
          </template>
          <template v-else-if="currentStep.interactionType === 'parameter'">
            <label class="range-label"
              ><span>调整参数</span><strong>{{ selectedAnswer }}</strong></label
            >
            <input
              v-model.number="numericAnswer"
              type="range"
              :min="currentStep.min ?? 0"
              :max="currentStep.max ?? 100"
              :step="currentStep.step ?? 1"
              :disabled="stepCorrect"
              @input="selectAnswer(numericAnswer)"
            />
          </template>
          <template v-else-if="currentStep.interactionType === 'code-gap'">
            <label class="text-answer-label" for="code-gap-answer"
              >填写你认为正确的内容</label
            >
            <input
              id="code-gap-answer"
              v-model="textAnswer"
              class="text-answer"
              type="text"
              autocomplete="off"
              :disabled="stepCorrect"
              @input="selectAnswer(textAnswer)"
            />
          </template>
          <template v-else-if="currentStep.interactionType === 'sort'">
            <p class="sort-hint">使用右侧按钮调整顺序</p>
            <div
              v-for="(option, index) in sortAnswer"
              :key="option"
              class="sort-option"
            >
              <span>{{ index + 1 }}. {{ optionLabel(option) }}</span>
              <span class="sort-controls"
                ><button
                  type="button"
                  :disabled="stepCorrect || index === 0"
                  :aria-label="`将${optionLabel(option)}上移`"
                  @click="moveSortOption(index, -1)"
                >
                  ↑</button
                ><button
                  type="button"
                  :disabled="stepCorrect || index === sortAnswer.length - 1"
                  :aria-label="`将${optionLabel(option)}下移`"
                  @click="moveSortOption(index, 1)"
                >
                  ↓
                </button></span
              >
            </div>
          </template>
        </div>

        <div
          v-if="task.id === 'frontend-card-preview'"
          class="live-preview-wrap"
        >
          <span class="preview-label">实时预览</span>
          <article
            class="live-preview"
            :style="{ background: previewBackground }"
          >
            <span>BYTEOJ · 个人介绍</span>
            <h3>{{ previewTitle || "你好，我是 ByteOJ 新同学" }}</h3>
            <p>
              {{ previewClicked ? previewMessage : "欢迎来看看我的介绍卡片。" }}
            </p>
            <button type="button" @click="previewClicked = true">联系我</button>
          </article>
        </div>

        <div
          v-if="feedback"
          class="feedback"
          :class="{ success: stepCorrect }"
          role="status"
        >
          {{ feedback }}
        </div>
        <div class="task-actions">
          <button
            v-if="!stepCorrect"
            class="action-primary"
            type="button"
            :disabled="!hasAnswer"
            @click="checkAnswer"
          >
            确认
          </button>
          <button
            v-if="stepCorrect"
            class="action-primary"
            type="button"
            @click="goNext"
          >
            {{ isLastStep ? "完成体验" : "继续" }}
          </button>
        </div>
        <p class="retry-note">
          已重试 {{ active.retryCount }} 次 · 刷新页面后可以继续
        </p>
      </div>

      <div v-else class="completion-panel">
        <span class="completion-mark" aria-hidden="true">✓</span>
        <span class="task-eyebrow">体验完成</span>
        <h2>{{ task.completionFeedback }}</h2>
        <p>{{ task.nextStep }}</p>
        <fieldset class="self-assessment">
          <legend>你现在更接近哪种感受？</legend>
          <div class="assessment-options">
            <button
              v-for="option in task.selfAssessmentOptions"
              :key="option"
              type="button"
              :class="{ selected: selectedAssessment === option }"
              @click="saveAssessment(option)"
            >
              {{ option }}
            </button>
          </div>
        </fieldset>
        <div class="task-actions">
          <router-link class="action-primary link-button" to="/explore/result"
            >查看探索记录</router-link
          >
          <button class="action-secondary" type="button" @click="restartTask">
            再体验一次
          </button>
          <router-link class="action-secondary link-button" to="/explore"
            >尝试其他方向</router-link
          >
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { getDirection, getTask } from "@/data/directionExplore";
import {
  ActiveExperience,
  InteractionType,
  TaskStep,
} from "@/types/directionExplore";
import {
  loadDirectionExploreState,
  saveActiveExperience,
  saveCompletedExperience,
  saveExperienceRecord,
  updateExperienceRecord,
} from "@/utils/directionExploreStorage";

const route = useRoute();
const task = computed(() => getTask(String(route.params.taskId || "")));
const direction = computed(() => getDirection(task.value?.directionId));
const stepIndex = ref(0);
const active = ref<ActiveExperience>({
  taskId: "",
  stepIndex: 0,
  startedAt: Date.now(),
  retryCount: 0,
  answers: {},
  completedStepIds: [],
});
const selectedAnswer = ref<string | number | string[]>("");
const feedback = ref("");
const stepCorrect = ref(false);
const completed = ref(false);
const selectedAssessment = ref("");
const previewClicked = ref(false);
const currentStep = computed<TaskStep>(() => {
  if (task.value)
    return task.value.steps[
      Math.min(stepIndex.value, task.value.steps.length - 1)
    ];
  return {
    id: "",
    title: "",
    content: "",
    interactionType: "choice",
    errorHint: "",
    completionFeedback: "",
  };
});
const isLastStep = computed(
  () => !!task.value && stepIndex.value === task.value.steps.length - 1
);
const numericAnswer = computed({
  get: () =>
    typeof selectedAnswer.value === "number"
      ? selectedAnswer.value
      : currentStep.value?.initialValue ?? currentStep.value?.min ?? 0,
  set: (value: number) => {
    selectedAnswer.value = value;
  },
});
const textAnswer = computed({
  get: () =>
    typeof selectedAnswer.value === "string" ? selectedAnswer.value : "",
  set: (value: string) => {
    selectedAnswer.value = value;
  },
});
const sortAnswer = computed(() =>
  Array.isArray(selectedAnswer.value)
    ? selectedAnswer.value
    : [...(currentStep.value?.options || []).map((option) => option.id)]
);
const hasAnswer = computed(() =>
  Array.isArray(selectedAnswer.value)
    ? selectedAnswer.value.length > 0
    : typeof selectedAnswer.value === "number" ||
      (selectedAnswer.value !== "" && selectedAnswer.value !== null)
);
const previewBackground = computed(
  () =>
    ({
      blue: "linear-gradient(135deg, #e6f3ff, #dce9ff)",
      green: "linear-gradient(135deg, #e5f8ef, #d7f2e6)",
      peach: "linear-gradient(135deg, #fff0e5, #ffe4d1)",
    }[String(active.value.answers["pick-color"] || "blue")] || "#eaf3fb")
);
const previewMessage = computed(() =>
  selectedAnswer.value === "message" ? "已联系我" : "按钮已点击"
);
const previewTitle = computed(() =>
  String(active.value.answers["edit-title"] || "")
);

onMounted(() => {
  if (!task.value) return;
  const state = loadDirectionExploreState();
  const startFresh = route.query.restart === "1";
  const previous =
    !startFresh && state.activeExperience?.taskId === task.value.id
      ? state.activeExperience
      : null;
  const previousRecord =
    !startFresh && state.completedExperience?.taskId === task.value.id
      ? state.records.find(
          (record) =>
            record.taskId === task.value.id &&
            record.startedAt === state.completedExperience?.startedAt &&
            record.completed
        )
      : undefined;
  const isPreviousComplete = !!previousRecord && !previous;
  active.value = previous
    ? {
        ...previous,
        completedStepIds: Array.isArray(previous.completedStepIds)
          ? previous.completedStepIds
          : [],
      }
    : isPreviousComplete
    ? {
        taskId: task.value.id,
        stepIndex: task.value.steps.length - 1,
        startedAt: previousRecord.startedAt,
        retryCount: previousRecord.retryCount,
        answers: {},
        completedStepIds: task.value.steps.map((step) => step.id),
      }
    : {
        taskId: task.value.id,
        stepIndex: 0,
        startedAt: Date.now(),
        retryCount: 0,
        answers: {},
        completedStepIds: [],
      };
  stepIndex.value = Math.min(
    Math.max(active.value.stepIndex, 0),
    task.value.steps.length - 1
  );
  selectedAnswer.value =
    active.value.answers[currentStep.value.id] ??
    defaultAnswer(currentStep.value);
  completed.value =
    isPreviousComplete ||
    task.value.steps.every((step) =>
      active.value.completedStepIds.includes(step.id)
    );
  stepCorrect.value = active.value.completedStepIds.includes(
    currentStep.value.id
  );
  selectedAssessment.value = previousRecord?.selfAssessment || "";
  if (stepCorrect.value) feedback.value = currentStep.value.completionFeedback;
  if (completed.value) {
    saveCompletedExperience({
      taskId: task.value.id,
      startedAt: active.value.startedAt,
    });
  } else {
    saveActiveExperience(active.value);
    saveExperienceRecord({
      taskId: task.value.id,
      directionId: task.value.directionId,
      startedAt: active.value.startedAt,
      completedAt: null,
      durationSeconds: Math.max(
        0,
        Math.round((Date.now() - active.value.startedAt) / 1000)
      ),
      retryCount: active.value.retryCount,
      completed: false,
    });
  }
});

watch([stepIndex, selectedAnswer], () => {
  if (!task.value || completed.value) return;
  active.value.stepIndex = stepIndex.value;
  active.value.answers[currentStep.value.id] = selectedAnswer.value;
  saveActiveExperience(active.value);
});

function isChoiceType(type: InteractionType): boolean {
  return (
    type === "choice" || type === "result-check" || type === "chart-choice"
  );
}

function defaultAnswer(step: TaskStep): string | number | string[] {
  if (step.interactionType === "sort")
    return (step.options || []).map((option) => option.id);
  if (step.interactionType === "parameter")
    return step.initialValue ?? step.min ?? 0;
  return "";
}

function selectAnswer(answer: string | number | string[]): void {
  if (stepCorrect.value) return;
  selectedAnswer.value = answer;
  if (
    currentStep.value.id === "pick-color" ||
    currentStep.value.id === "edit-title"
  )
    active.value.answers[currentStep.value.id] = answer;
  previewClicked.value = false;
  feedback.value = "";
  stepCorrect.value = false;
}

function optionLabel(id: string): string {
  return (
    currentStep.value.options?.find((option) => option.id === id)?.label || id
  );
}

function moveSortOption(index: number, delta: number): void {
  const next = [...sortAnswer.value];
  const target = index + delta;
  if (target < 0 || target >= next.length) return;
  [next[index], next[target]] = [next[target], next[index]];
  selectAnswer(next);
}

function checkAnswer(): void {
  if (!task.value || !hasAnswer.value || stepCorrect.value) return;
  const step = currentStep.value;
  let isCorrect = false;
  if (isChoiceType(step.interactionType))
    isCorrect =
      !step.correctOptionId || selectedAnswer.value === step.correctOptionId;
  else if (step.interactionType === "sort")
    isCorrect =
      Array.isArray(selectedAnswer.value) &&
      JSON.stringify(selectedAnswer.value) ===
        JSON.stringify(step.correctOrderIds || []);
  else if (step.interactionType === "parameter")
    isCorrect =
      typeof selectedAnswer.value === "number" &&
      Math.abs(selectedAnswer.value - Number(step.targetValue)) <=
        (step.tolerance ?? 0);
  else if (step.interactionType === "code-gap") {
    const answer = String(selectedAnswer.value).trim();
    isCorrect = step.acceptAnyNonEmpty
      ? answer.length > 0
      : answer.toLowerCase() ===
        String(step.expectedAnswer || "")
          .trim()
          .toLowerCase();
  }

  if (isCorrect) {
    stepCorrect.value = true;
    feedback.value = step.completionFeedback;
    active.value.answers[step.id] = selectedAnswer.value;
    if (!active.value.completedStepIds.includes(step.id))
      active.value.completedStepIds.push(step.id);
    saveActiveExperience(active.value);
  } else {
    active.value.retryCount += 1;
    feedback.value = step.errorHint;
    saveActiveExperience(active.value);
  }
  saveExperienceRecord({
    taskId: task.value.id,
    directionId: task.value.directionId,
    startedAt: active.value.startedAt,
    completedAt: null,
    durationSeconds: Math.max(
      0,
      Math.round((Date.now() - active.value.startedAt) / 1000)
    ),
    retryCount: active.value.retryCount,
    completed: false,
  });
}

function goNext(): void {
  if (!task.value || !stepCorrect.value) return;
  if (isLastStep.value) {
    completed.value = true;
    const completedAt = Date.now();
    saveExperienceRecord({
      taskId: task.value.id,
      directionId: task.value.directionId,
      startedAt: active.value.startedAt,
      completedAt,
      durationSeconds: Math.max(
        0,
        Math.round((completedAt - active.value.startedAt) / 1000)
      ),
      retryCount: active.value.retryCount,
      completed: true,
    });
    saveCompletedExperience({
      taskId: task.value.id,
      startedAt: active.value.startedAt,
    });
    return;
  }
  stepIndex.value += 1;
  selectedAnswer.value =
    active.value.answers[task.value.steps[stepIndex.value].id] ??
    defaultAnswer(task.value.steps[stepIndex.value]);
  stepCorrect.value = active.value.completedStepIds.includes(
    task.value.steps[stepIndex.value].id
  );
  feedback.value = stepCorrect.value
    ? task.value.steps[stepIndex.value].completionFeedback
    : "";
}

function saveAssessment(value: string): void {
  if (!task.value) return;
  selectedAssessment.value = value;
  updateExperienceRecord(task.value.id, active.value.startedAt, {
    selfAssessment: value,
  });
}

function restartTask(): void {
  if (!task.value) return;
  active.value = {
    taskId: task.value.id,
    stepIndex: 0,
    startedAt: Date.now(),
    retryCount: 0,
    answers: {},
    completedStepIds: [],
  };
  stepIndex.value = 0;
  selectedAnswer.value = defaultAnswer(task.value.steps[0]);
  feedback.value = "";
  stepCorrect.value = false;
  completed.value = false;
  selectedAssessment.value = "";
  previewClicked.value = false;
  saveActiveExperience(active.value);
  saveExperienceRecord({
    taskId: task.value.id,
    directionId: task.value.directionId,
    startedAt: active.value.startedAt,
    completedAt: null,
    durationSeconds: 0,
    retryCount: 0,
    completed: false,
  });
}
</script>

<style scoped>
.task-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px 72px;
  color: #18233b;
}
.back-link {
  display: inline-block;
  margin-bottom: 15px;
  color: #577187;
  font-size: 14px;
  text-decoration: none;
}
.task-shell {
  padding: clamp(22px, 5vw, 42px);
  border: 1px solid #e4eaf0;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 18px 55px rgba(24, 48, 78, 0.08);
}
.task-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}
.task-eyebrow {
  color: #32827f;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.09em;
}
.task-header h1,
.empty-state h1 {
  margin: 9px 0 8px;
  font-size: clamp(26px, 4vw, 36px);
  line-height: 1.2;
  letter-spacing: -0.035em;
}
.task-header p,
.empty-state p {
  margin: 0;
  color: #708096;
  line-height: 1.7;
}
.records-link {
  color: #27747f;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}
.progress-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 34px 0;
  color: #67788e;
  font-size: 13px;
}
.progress-track {
  height: 8px;
  flex: 1;
  overflow: hidden;
  border-radius: 99px;
  background: #edf2f5;
}
.progress-value {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #27a39b, #53c6b3);
  transition: width 0.2s ease;
}
.step-copy {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.step-number {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border-radius: 13px;
  color: #197879;
  background: #e8f7f5;
  font-weight: 800;
}
.step-copy h2 {
  margin: 1px 0 7px;
  font-size: 21px;
}
.step-copy p {
  margin: 0;
  color: #6f7d91;
  line-height: 1.7;
}
.interaction-area {
  display: grid;
  gap: 10px;
  margin: 24px 0;
}
.live-preview-wrap {
  margin: 22px 0;
  padding: 15px;
  border: 1px dashed #cfdae2;
  border-radius: 15px;
  background: #fbfcfd;
}
.preview-label {
  display: block;
  margin-bottom: 10px;
  color: #718095;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.live-preview {
  padding: 20px;
  border-radius: 13px;
  color: #24354b;
  transition: background 0.2s ease;
}
.live-preview > span {
  color: #60748a;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.live-preview h3 {
  margin: 9px 0 5px;
  font-size: 18px;
}
.live-preview p {
  min-height: 22px;
  margin: 0 0 12px;
  color: #66778c;
  font-size: 13px;
}
.live-preview button {
  min-height: 35px;
  padding: 0 13px;
  border: 0;
  border-radius: 9px;
  color: #fff;
  background: #2a7d87;
  cursor: pointer;
}
.choice-option,
.sort-option {
  display: flex;
  min-height: 52px;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  border: 1px solid #e2e9ef;
  border-radius: 13px;
  color: #344359;
  background: #fff;
  text-align: left;
}
.choice-option {
  cursor: pointer;
  transition: border 0.16s ease, background 0.16s ease;
}
.choice-option:hover,
.choice-option.selected {
  border-color: #4aa9a1;
  background: #f2fbf9;
}
.choice-indicator {
  width: 17px;
  height: 17px;
  border: 1.5px solid #bdc9d5;
  border-radius: 50%;
}
.selected .choice-indicator {
  border: 5px solid #319891;
}
.range-label {
  display: flex;
  justify-content: space-between;
  color: #63738a;
}
.range-label strong {
  color: #1d7777;
}
input[type="range"] {
  width: 100%;
  accent-color: #299a94;
}
.text-answer-label,
.sort-hint {
  color: #63738a;
  font-size: 13px;
}
.text-answer {
  min-height: 48px;
  padding: 10px 13px;
  border: 1px solid #dbe4ea;
  border-radius: 11px;
  outline-color: #43a49d;
}
.sort-option {
  justify-content: space-between;
}
.sort-controls {
  display: flex;
  gap: 6px;
}
.sort-controls button {
  width: 30px;
  height: 30px;
  border: 1px solid #dce5eb;
  border-radius: 8px;
  color: #426278;
  background: #fff;
  cursor: pointer;
}
.sort-controls button:disabled {
  opacity: 0.35;
  cursor: default;
}
.feedback {
  padding: 13px 15px;
  border-radius: 12px;
  color: #9b5c2e;
  background: #fff6ed;
  font-size: 14px;
  line-height: 1.6;
}
.feedback.success {
  color: #24726a;
  background: #edfaf6;
}
.task-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}
.action-primary,
.action-secondary {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 11px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
}
.action-primary {
  color: #fff;
  background: #247f83;
}
.action-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.action-secondary {
  color: #3d6574;
  border-color: #dce7eb;
  background: #fff;
}
.link-button {
  box-sizing: border-box;
}
.retry-note {
  margin: 14px 0 0;
  color: #98a2b0;
  font-size: 12px;
}
.completion-panel {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}
.completion-mark {
  display: grid;
  width: 58px;
  height: 58px;
  margin: 0 auto 17px;
  place-items: center;
  border-radius: 18px;
  color: #fff;
  background: #37a58f;
  font-size: 28px;
  font-weight: 800;
}
.completion-panel h2 {
  margin: 10px 0;
  font-size: clamp(22px, 4vw, 30px);
  line-height: 1.4;
}
.completion-panel > p {
  color: #6e7d90;
  line-height: 1.75;
}
.self-assessment {
  margin: 25px 0 6px;
  padding: 0;
  border: 0;
}
.self-assessment legend {
  margin: 0 auto 12px;
  color: #596b7f;
  font-size: 14px;
  font-weight: 700;
}
.assessment-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 9px;
}
.assessment-options button {
  min-height: 38px;
  padding: 0 13px;
  border: 1px solid #dce5eb;
  border-radius: 999px;
  color: #516477;
  background: #fff;
  cursor: pointer;
}
.assessment-options button.selected {
  border-color: #43a49d;
  color: #1d7777;
  background: #effaf8;
}
.completion-panel .task-actions {
  justify-content: center;
  margin-top: 22px;
}
.empty-state {
  text-align: center;
}
.empty-state .action-primary {
  margin-top: 20px;
}
@media (max-width: 600px) {
  .task-page {
    padding: 18px 13px 48px;
  }
  .task-header {
    flex-direction: column;
  }
  .records-link {
    align-self: flex-start;
  }
  .progress-row {
    margin: 24px 0;
  }
  .step-copy {
    gap: 11px;
  }
  .step-copy h2 {
    font-size: 19px;
  }
  .task-actions > * {
    flex: 1;
  }
}
</style>
