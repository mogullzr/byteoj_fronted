<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { OpenAPI } from '../../../generated/core/OpenAPI'
import { request } from '../../../generated/core/request'

const features = {
  CHAT: 'AI 聊天',
  PROBLEM_CHAT: '试题讲解',
  STUDY_PLAN: '学习路线',
  EXAM_GRADING: '考试判卷',
  ENGLISH_GRADING: '英语专项评分',
  GRADING: '通用评分接口',
  EXAM_REVIEW: '整卷复习建议',
  TEST_GENERATION: '算法测试数据生成',
}

type Feature = keyof typeof features
type Option = { id: string; label: string; configured: boolean; vision: boolean }
type KeyStatus = { id: string; label: string; configured: boolean; managed: boolean }
type ModelConfig = { model: string; vision: boolean; jsonMode: boolean; pricing?: { input: number; cacheHit: number; output: number } | null }
type Settings = {
  enabled: boolean
  keys: KeyStatus[]
  options: Record<Feature, Option[]>
  defaults: Record<Feature, string>
  siliconFlowModels: Record<string, ModelConfig>
}
type ApiResponse<T> = { code: number; message?: string; data: T }

const base = '/api/ai/sources/admin'
const settings = ref<Settings>()
const defaults = ref<Partial<Record<Feature, string>>>({})
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const keyTarget = ref<KeyStatus>()
const pendingKey = ref('')
const modelForm = ref({ alias: '', model: '', vision: false, jsonMode: false })
const editingAlias = ref('')
const pricingEnabled = ref(false)
const pricing = ref({ input: 0, cacheHit: 0, output: 0 })

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const response = await request<ApiResponse<Settings>>(OpenAPI, { method: 'GET', url: base })
    if (response.code !== 0) throw new Error(response.message || '读取 AI 设置失败')
    settings.value = response.data
    defaults.value = { ...response.data.defaults }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '读取 AI 设置失败'
  } finally {
    loading.value = false
  }
}

async function save(path: string, body: string | object, mediaType = 'application/json') {
  saving.value = true
  try {
    const response = await request<ApiResponse<boolean>>(OpenAPI, {
      method: 'PUT', url: base + path, body, mediaType, headers: { 'X-ByteOJ-AI-Admin': '1' },
    })
    if (response.code !== 0) {
      ElMessage.error(response.message || '保存失败')
      return false
    }
    ElMessage.success('已保存')
    return true
  } catch {
    ElMessage.error('保存失败，请检查网络或重新登录')
    return false
  } finally {
    saving.value = false
  }
}

async function rotateKey() {
  const target = keyTarget.value
  const key = pendingKey.value.trim()
  pendingKey.value = ''
  if (!target || !key) return
  if (await save('/keys/' + encodeURIComponent(target.id), key, 'application/octet-stream')) {
    keyTarget.value = undefined
    await load()
  }
}

function editModel(id: string, config: ModelConfig) {
  editingAlias.value = id.substring(3)
  modelForm.value = { alias: editingAlias.value, ...config }
  pricingEnabled.value = !!config.pricing
  pricing.value = config.pricing ? { ...config.pricing } : { input: 0, cacheHit: 0, output: 0 }
}

function resetModel() {
  editingAlias.value = ''
  pricingEnabled.value = false
  modelForm.value = { alias: '', model: '', vision: false, jsonMode: false }
}

async function saveModel() {
  const { alias, model, vision, jsonMode } = modelForm.value
  if (await save('/siliconflow/' + encodeURIComponent(alias.trim()), { model: model.trim(), vision, jsonMode, pricing: pricingEnabled.value ? { ...pricing.value } : null })) {
    resetModel()
    await load()
  }
}

async function saveDefault(feature: Feature) {
  if (await save('/defaults/' + feature, { id: defaults.value[feature] || '' })) {
    settings.value!.defaults[feature] = defaults.value[feature] || ''
  }
}

onMounted(load)
</script>

<template>
  <main class="ai-settings" v-loading="loading">
    <header class="page-title">
      <h1>AI 线路设置</h1>
      <el-button :disabled="saving || loading" @click="load">刷新</el-button>
    </header>
    <el-alert v-if="loadError" type="error" :title="loadError" :closable="false" />
    <template v-if="settings">
      <el-alert v-if="!settings.enabled" type="info" :closable="false"
        title="完成数据库迁移并设置后端 BYTEOJ_AI_MASTER_KEY 后，即可在这里保存配置。" />
      <el-card shadow="never">
        <template #header><strong>服务商密钥</strong></template>
        <el-table :data="settings.keys">
          <el-table-column prop="label" label="线路" min-width="180" />
          <el-table-column label="状态" min-width="130">
            <template #default="{ row }">
              <el-tag :type="row.configured ? 'success' : 'info'" effect="plain">
                {{ row.managed ? '已加密保存' : row.configured ? '使用部署配置' : '待配置' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130">
            <template #default="{ row }">
              <el-button text type="primary" :disabled="!settings?.enabled || saving"
                @click="keyTarget = row; pendingKey = ''">{{ row.configured ? '更换密钥' : '录入密钥' }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <el-card shadow="never">
        <template #header><strong>硅基流动模型</strong></template>
        <el-table v-if="Object.keys(settings.siliconFlowModels).length" :data="Object.entries(settings.siliconFlowModels)">
          <el-table-column label="线路标识" min-width="110">
            <template #default="{ row }">{{ row[0].substring(3) }}</template>
          </el-table-column>
          <el-table-column label="平台模型 ID" min-width="200">
            <template #default="{ row }">{{ row[1].model }}</template>
          </el-table-column>
          <el-table-column label="能力" min-width="130">
            <template #default="{ row }">{{ row[1].vision ? '图文' : '文本' }}{{ row[1].jsonMode ? ' · JSON 模式' : '' }}</template>
          </el-table-column>
          <el-table-column width="90">
            <template #default="{ row }"><el-button text type="primary" @click="editModel(row[0], row[1])">编辑</el-button></template>
          </el-table-column>
        </el-table>
        <el-form class="model-form" label-position="top" @submit.prevent="saveModel">
          <div class="model-form-fields">
            <el-form-item label="线路标识">
              <el-input v-model="modelForm.alias" :disabled="!!editingAlias" maxlength="40" placeholder="例如 sf-vision" />
            </el-form-item>
            <el-form-item label="平台模型 ID">
              <el-input v-model="modelForm.model" maxlength="160" placeholder="填写硅基流动模型广场中的完整 ID" />
            </el-form-item>
          </div>
          <el-checkbox v-model="modelForm.vision">支持图片输入</el-checkbox>
          <el-checkbox v-model="modelForm.jsonMode">支持 JSON 模式</el-checkbox>
          <el-checkbox v-model="pricingEnabled">配置费用估算（人民币元/百万 Token）</el-checkbox>
          <div v-if="pricingEnabled" class="pricing-fields">
            <el-form-item label="输入（未命中）"><el-input-number v-model="pricing.input" :min="0" :precision="6" /></el-form-item>
            <el-form-item label="输入（命中）"><el-input-number v-model="pricing.cacheHit" :min="0" :precision="6" /></el-form-item>
            <el-form-item label="输出"><el-input-number v-model="pricing.output" :min="0" :precision="6" /></el-form-item>
          </div>
          <div class="form-actions">
            <el-button v-if="editingAlias" @click="resetModel">取消编辑</el-button>
            <el-button type="primary" native-type="submit" :loading="saving"
              :disabled="!settings.enabled || !modelForm.alias.trim() || !modelForm.model.trim()">{{ editingAlias ? '保存模型' : '添加模型' }}</el-button>
          </div>
        </el-form>
      </el-card>
      <el-card shadow="never">
        <template #header><strong>各功能默认线路</strong></template>
        <div v-for="(label, feature) in features" :key="feature" class="default-row">
          <span>{{ label }}</span>
          <el-select v-model="defaults[feature]" :aria-label="label">
            <el-option label="沿用原默认线路" value="" />
            <el-option v-for="item in settings.options[feature]" :key="item.id" :label="item.label"
              :value="item.id" :disabled="!item.configured" />
          </el-select>
          <el-button :disabled="!settings.enabled || saving || defaults[feature] === settings.defaults[feature]" @click="saveDefault(feature)">保存</el-button>
        </div>
      </el-card>
    </template>
    <el-dialog :model-value="!!keyTarget" :title="keyTarget ? '录入 ' + keyTarget.label + ' 密钥' : '录入密钥'"
      width="min(460px, 90vw)" @close="keyTarget = undefined; pendingKey = ''">
      <el-input v-model="pendingKey" type="password" autocomplete="new-password" maxlength="512"
        aria-label="新 API 密钥" placeholder="粘贴新密钥" @keyup.enter="rotateKey" />
      <template #footer>
        <el-button @click="keyTarget = undefined; pendingKey = ''">取消</el-button>
        <el-button type="primary" :loading="saving" :disabled="!pendingKey.trim()" @click="rotateKey">保存密钥</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<style scoped>
.ai-settings { display: grid; gap: 16px; max-width: 1000px; margin: 0 auto; padding: 20px 24px 32px; }
.page-title { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.page-title h1 { margin: 0; font-size: 25px; }
.model-form { margin-top: 16px; }
.model-form-fields { display: grid; grid-template-columns: minmax(120px, 1fr) minmax(180px, 2fr); gap: 16px; }
.pricing-fields { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; }
.form-actions { display: flex; justify-content: flex-end; margin-top: 14px; }
.default-row { display: grid; grid-template-columns: minmax(110px, .8fr) minmax(160px, 2.4fr) auto; align-items: center; gap: 12px; padding: 8px 0; }
@media (max-width: 620px) {
  .model-form-fields { grid-template-columns: 1fr; gap: 0; }
  .default-row { grid-template-columns: 1fr auto; }
  .default-row > span { grid-column: 1 / -1; }
}
</style>
