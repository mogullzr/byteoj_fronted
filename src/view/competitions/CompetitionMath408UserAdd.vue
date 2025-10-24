<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const competitionType = ref(0);
const loading = ref(false);
const formData = ref({
  competitionName: '',
  startTime: '',
  endTime: '',
  description: '',
  rules: '',
  isPublic: true,
  maxParticipants: 100,
  problems: []
});

// Form validation
const errors = ref({});
const validateForm = () => {
  const newErrors = {};
  if (!formData.value.competitionName) {
    newErrors.competitionName = '比赛名称不能为空';
  }
  if (!formData.value.startTime) {
    newErrors.startTime = '开始时间不能为空';
  }
  if (!formData.value.endTime) {
    newErrors.endTime = '结束时间不能为空';
  }
  if (new Date(formData.value.endTime) <= new Date(formData.value.startTime)) {
    newErrors.endTime = '结束时间必须晚于开始时间';
  }
  if (!formData.value.description) {
    newErrors.description = '比赛描述不能为空';
  }
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

// Get competition type from route params
onMounted(() => {
  const typeParam = route.params.type;
  if (typeParam) {
    competitionType.value = parseInt(typeParam as string);
  }
});

// Get competition type name
const getCompetitionTypeName = () => {
  switch (competitionType.value) {
    case 1:
      return '个人编程创建赛';
    case 2:
      return '个人数学创建赛';
    case 3:
      return '个人408创建赛';
    default:
      return '未知比赛类型';
  }
};

// Submit form
const submitForm = async () => {
  if (!validateForm()) {
    return;
  }
  
  loading.value = true;
  try {
    // Here you would call your API to create the competition
    // For now we'll just simulate a successful creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to the competitions list
    router.push('/competition');
  } catch (error) {
    console.error('Failed to create competition:', error);
  } finally {
    loading.value = false;
  }
};

// Add a problem to the competition
const addProblem = () => {
  formData.value.problems.push({
    id: Date.now(),
    title: '',
    description: '',
    points: 100
  });
};

// Remove a problem from the competition
const removeProblem = (index) => {
  formData.value.problems.splice(index, 1);
};
</script>

<template>
  <div class="page-background">
    <div class="content-container">
      <header class="page-header">
        <h1 class="header-title">创建{{ getCompetitionTypeName() }}</h1>
        <button @click="router.back()" class="btn btn-ghost">
          返回
        </button>
      </header>

      <form @submit.prevent="submitForm" class="competition-form">
        <div class="form-section">
          <h2 class="section-title">基本信息</h2>
          
          <div class="form-group">
            <label for="competitionName" class="form-label">比赛名称</label>
            <input
              id="competitionName"
              v-model="formData.competitionName"
              type="text"
              class="form-input"
              :class="{ 'error': errors.competitionName }"
              placeholder="请输入比赛名称"
            />
            <p v-if="errors.competitionName" class="error-message">{{ errors.competitionName }}</p>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="startTime" class="form-label">开始时间</label>
              <input
                id="startTime"
                v-model="formData.startTime"
                type="datetime-local"
                class="form-input"
                :class="{ 'error': errors.startTime }"
              />
              <p v-if="errors.startTime" class="error-message">{{ errors.startTime }}</p>
            </div>

            <div class="form-group">
              <label for="endTime" class="form-label">结束时间</label>
              <input
                id="endTime"
                v-model="formData.endTime"
                type="datetime-local"
                class="form-input"
                :class="{ 'error': errors.endTime }"
              />
              <p v-if="errors.endTime" class="error-message">{{ errors.endTime }}</p>
            </div>
          </div>

          <div class="form-group">
            <label for="description" class="form-label">比赛描述</label>
            <textarea
              id="description"
              v-model="formData.description"
              class="form-textarea"
              :class="{ 'error': errors.description }"
              placeholder="请输入比赛描述"
              rows="4"
            ></textarea>
            <p v-if="errors.description" class="error-message">{{ errors.description }}</p>
          </div>

          <div class="form-group">
            <label for="rules" class="form-label">比赛规则</label>
            <textarea
              id="rules"
              v-model="formData.rules"
              class="form-textarea"
              placeholder="请输入比赛规则"
              rows="4"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">是否公开</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" v-model="formData.isPublic" :value="true" />
                  <span>公开</span>
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="formData.isPublic" :value="false" />
                  <span>私有</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label for="maxParticipants" class="form-label">最大参与人数</label>
              <input
                id="maxParticipants"
                v-model="formData.maxParticipants"
                type="number"
                class="form-input"
                min="1"
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <h2 class="section-title">题目列表</h2>
            <button type="button" @click="addProblem" class="btn btn-secondary">
              添加题目
            </button>
          </div>

          <div v-if="formData.problems.length === 0" class="empty-state">
            <p>暂无题目，请点击"添加题目"按钮添加</p>
          </div>

          <div v-else class="problems-list">
            <div 
              v-for="(problem, index) in formData.problems" 
              :key="problem.id"
              class="problem-card"
            >
              <div class="problem-header">
                <h3>题目 #{{ index + 1 }}</h3>
                <button 
                  type="button" 
                  @click="removeProblem(index)" 
                  class="btn-icon"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>

              <div class="form-group">
                <label :for="`problem-title-${index}`" class="form-label">题目标题</label>
                <input
                  :id="`problem-title-${index}`"
                  v-model="problem.title"
                  type="text"
                  class="form-input"
                  placeholder="请输入题目标题"
                />
              </div>

              <div class="form-group">
                <label :for="`problem-description-${index}`" class="form-label">题目描述</label>
                <textarea
                  :id="`problem-description-${index}`"
                  v-model="problem.description"
                  class="form-textarea"
                  placeholder="请输入题目描述"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group">
                <label :for="`problem-points-${index}`" class="form-label">分值</label>
                <input
                  :id="`problem-points-${index}`"
                  v-model="problem.points"
                  type="number"
                  class="form-input"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="router.back()" class="btn btn-ghost">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading">创建中...</span>
            <span v-else>创建比赛</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* General Page Styling */
.page-background {
  background-color: transparent;
  min-height: 100vh;
}

.content-container {
  max-width: 1280px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  border: 1px solid #e5e7eb;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.header-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

/* Form Styling */
.competition-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background-color: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #1f2937;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.radio-group {
  display: flex;
  gap: 1.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

/* Problems List */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 8rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  color: #6b7280;
}

.problems-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.problem-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
}

.problem-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.problem-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: none;
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: #e5e7eb;
  color: #ef4444;
}

.btn-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.btn-ghost {
  background-color: transparent;
  color: #6b7280;
}

.btn-ghost:hover {
  background-color: #f3f4f6;
}
</style>
