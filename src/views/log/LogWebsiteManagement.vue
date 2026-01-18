<!-- src/views/LogManagement.vue -->
<template>
  <div class="log-management-page">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>网站日志录入</span>
          <el-tag type="info">POST /log/web/update</el-tag>
        </div>
      </template>

      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          label-position="right"
      >
        <el-form-item label="模块名称" prop="module">
          <el-input
              v-model="form.module"
              placeholder="请输入模块名称，例如：用户中心、订单模块、日志模块"
              clearable
          />
        </el-form-item>

        <el-form-item label="时间戳" prop="timestamp">
          <el-date-picker
              v-model="form.timestamp"
              type="datetime"
              placeholder="选择日志发生时间"
              value-format="x"
              :default-time="defaultTime"
              style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="描述内容" prop="description">
          <el-input
              v-model="form.description"
              type="textarea"
              :rows="6"
              placeholder="请输入详细的日志描述信息..."
              maxlength="2000"
              show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submitLog">
            提交日志
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 最近提交结果展示区（可选） -->
    <el-card v-if="lastSubmitResult" class="result-card">
      <template #header>
        <span>最近一次提交结果</span>
      </template>
      <div class="result-content">
        <p><strong>状态：</strong>
          <el-tag :type="lastSubmitResult.success ? 'success' : 'danger'">
            {{ lastSubmitResult.success ? '成功' : '失败' }}
          </el-tag>
        </p>
        <p v-if="lastSubmitResult.message"><strong>消息：</strong>{{ lastSubmitResult.message }}</p>
        <p v-if="lastSubmitResult.timestamp"><strong>提交时间：</strong>{{ formatTime(lastSubmitResult.timestamp) }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {LogWebSiteUpdateRequest} from "../../../generated/models/LogWebSiteUpdateRequest.ts";
import {LogControllerService} from "../../../generated/services/LogControllerService.ts";

// ===================== 类型定义 =====================
interface SubmitResult {
  success: boolean
  message?: string
  timestamp?: number
}

// ===================== 响应式数据 =====================
const formRef = ref<FormInstance>()
const submitting = ref(false)
const lastSubmitResult = ref<SubmitResult | null>(null)

const form = reactive<LogWebSiteUpdateRequest>({
  module: '日志模块',
  description: '',
  timestamp: Date.now(), // 默认当前时间戳（毫秒）
})

// 方便选择时间的默认时间点（可选）
const defaultTime = computed(() => new Date())

// ===================== 表单校验 =====================
const rules = reactive<FormRules>({
  module: [
    { required: true, message: '请输入模块名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入日志描述内容', trigger: 'blur' },
    { max: 2000, message: '描述内容不能超过 2000 字', trigger: 'blur' }
  ],
  timestamp: [
    { required: true, message: '请选择时间', trigger: ['change', 'blur'] }
  ]
})

// ===================== 方法 =====================
const submitLog = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 确保时间戳是毫秒级数字
    const requestData: LogWebSiteUpdateRequest = {
      ...form,
      timestamp: Number(form.timestamp)
    }

    const response = await LogControllerService.logWebInfoUpdateUsingPost(requestData)

    // 根据实际接口返回调整这里的判断逻辑
    const success = response?.code === 0 || response?.success === true

    lastSubmitResult.value = {
      success,
      message: success ? '日志提交成功' : (response?.message || '提交失败'),
      timestamp: Date.now()
    }

    ElMessage({
      type: success ? 'success' : 'error',
      message: success ? '日志提交成功！' : '提交失败，请检查网络或接口'
    })

    if (success) {
      resetForm()
    }
  } catch (err: any) {
    console.error('提交日志失败:', err)
    ElMessage.error('提交失败：' + (err.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  // 手动重置时间戳为当前时间
  form.timestamp = Date.now()
}

const formatTime = (timestamp?: number) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN', { hour12: false })
}
</script>

<style scoped>
.log-management-page {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.main-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
}

.result-card {
  background-color: #f8f9fa;
}

.result-content p {
  margin: 8px 0;
}
</style>