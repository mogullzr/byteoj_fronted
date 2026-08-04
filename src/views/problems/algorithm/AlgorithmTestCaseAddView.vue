<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import {
  AlgorithmTestGenerationControllerService,
  ProblemAlgorithmControllerService,
  type CreateTestGenerationJobRequest,
  type GeneratedCasePreviewVO,
  type GeneratorDebugResultVO,
  type ProblemAlgorithmTestCaseRequest,
  type ReferenceSolutionDebugRequest,
  type ReferenceSolutionUpsertRequest,
  type ReferenceSolutionVO,
  type TestGenerationJobVO,
  type TestGenerationScaleRequest,
  type TestGenerationScaleVO,
} from '../../../../generated';

const route = useRoute();
const problemId = computed(() => Number(route.params.problem_id ?? route.path.split('/').pop()));

const activeTab = ref<'manual' | 'generate' | 'debug' | 'reference'>('generate');
const loading = ref(false);
const testCases = ref<ProblemAlgorithmTestCaseRequest[]>([]);
const runCode = ref('');

const models = [
  { label: 'DeepSeek Chat', value: 'deepseek-chat' },
  { label: 'DeepSeek V4 Flash', value: 'deepseek-ai/DeepSeek-V4-Flash' },
  { label: 'DeepSeek R1', value: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B' },
];
const scaleOptions = ['SMALL', 'MEDIUM', 'LARGE', 'EXTREME', 'CUSTOM'] as const;
const generation = ref({
  model: models[0].value,
  writeMode: 'APPEND' as 'APPEND' | 'REPLACE',
  generateExpectedOutput: false,
  confirmEmptyOutput: false,
  referenceSolutionId: undefined as number | undefined,
  previewChars: 200,
  scales: [
    { scale: 'SMALL' as TestGenerationScaleRequest['scale'], count: 10, constraints: '覆盖最小边界、特殊值和基础随机数据', seed: undefined as number | undefined },
  ] as TestGenerationScaleRequest[],
});
const references = ref<ReferenceSolutionVO[]>([]);
const referenceForm = ref<ReferenceSolutionUpsertRequest>({ problemId: problemId.value, language: 'cpp', sourceCode: '', sourceType: 'ADMIN_PROVIDED', note: '' });
const referenceInputs = ref('');
const referenceDebug = ref<GeneratedCasePreviewVO[]>([]);
const job = ref<TestGenerationJobVO | null>(null);
const previews = ref<GeneratedCasePreviewVO[]>([]);
const generatorDebug = ref<GeneratorDebugResultVO | null>(null);
const debugScale = ref({ scale: 'SMALL', code: '', seed: 1, startIndex: 0, count: 3, previewChars: 200 });
let pollTimer: ReturnType<typeof window.setInterval> | undefined;

const isRunning = computed(() => !!job.value && !['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(job.value.status ?? ''));
const loadManualCases = async () => {
  const res = await ProblemAlgorithmControllerService.problemAlgorithmTestCaseGetUsingPost(problemId.value);
  testCases.value = res.data?.length ? res.data : [{ input: '', output: '', runCode: '' }];
  runCode.value = testCases.value[0]?.runCode ?? '';
};
const loadReferences = async () => {
  const res = await AlgorithmTestGenerationControllerService.listReferenceSolutions(problemId.value);
  references.value = res.data ?? [];
};
const loadJob = async (jobId: number) => {
  const res = await AlgorithmTestGenerationControllerService.getJob(jobId);
  job.value = res.data ?? null;
  if (job.value) {
    const previewRes = await AlgorithmTestGenerationControllerService.getPreviews(jobId, 20);
    previews.value = previewRes.data ?? [];
  }
  if (!isRunning.value) stopPolling();
};
const startPolling = (jobId: number) => {
  stopPolling();
  pollTimer = window.setInterval(() => void loadJob(jobId), 2000);
};
const stopPolling = () => {
  if (pollTimer) window.clearInterval(pollTimer);
  pollTimer = undefined;
};
const addScale = () => {
  if (generation.value.scales.length >= 5) return ElMessage.warning('最多配置 5 种规模');
  const available = scaleOptions.find((item) => !generation.value.scales.some((scale) => scale.scale === item));
  generation.value.scales.push({ scale: (available ?? 'CUSTOM') as TestGenerationScaleRequest['scale'], count: 10, constraints: '', seed: undefined });
};
const removeScale = (index: number) => { if (generation.value.scales.length > 1) generation.value.scales.splice(index, 1); };
const createJob = async () => {
  if (!generation.value.scales.every((item) => item.constraints.trim() && item.count > 0)) return ElMessage.warning('请完整填写每种规模的数量和约束');
  if (generation.value.generateExpectedOutput && !generation.value.referenceSolutionId) return ElMessage.warning('生成标准输出前请选择已验证参考解');
  if (!generation.value.generateExpectedOutput && !generation.value.confirmEmptyOutput) {
    await ElMessageBox.confirm('当前未生成标准输出。只有配置 checker 的题目适合此模式，确定继续吗？', '二次确认', { type: 'warning' });
  }
  const body: CreateTestGenerationJobRequest = { problemId: problemId.value, ...generation.value };
  loading.value = true;
  try {
    const res = await AlgorithmTestGenerationControllerService.createJob(body);
    if (res.code !== 0 || !res.data?.jobId) throw new Error(res.message || '创建任务失败');
    job.value = res.data; startPolling(res.data.jobId);
    ElNotification.success({ title: '任务已创建', message: '后台开始生成测试样例' });
  } catch (error: any) { ElNotification.error({ title: '创建失败', message: error?.message ?? '请求失败' }); }
  finally { loading.value = false; }
};
const cancelJob = async () => { if (job.value?.jobId) { await AlgorithmTestGenerationControllerService.cancelJob(job.value.jobId); await loadJob(job.value.jobId); } };
const retryJob = async () => { if (job.value?.jobId) { await AlgorithmTestGenerationControllerService.retryJob(job.value.jobId); await loadJob(job.value.jobId); startPolling(job.value.jobId); } };
const debugGenerator = async () => {
  if (!debugScale.value.code.trim()) return ElMessage.warning('请粘贴生成器代码');
  const res = await AlgorithmTestGenerationControllerService.debugGenerator({ problemId: problemId.value, ...debugScale.value });
  generatorDebug.value = res.data ?? null;
  if (res.code === 0) ElMessage.success('生成器调试通过');
};
const saveReference = async () => {
  referenceForm.value.problemId = problemId.value;
  const res = await AlgorithmTestGenerationControllerService.saveReferenceSolution(referenceForm.value);
  if (res.code !== 0) return ElMessage.error(res.message || '保存失败');
  ElMessage.success('参考解已保存为草稿'); await loadReferences();
};
const validateReference = async (id?: number) => { if (!id) return; const res = await AlgorithmTestGenerationControllerService.validateReferenceSolution(id); if (res.code === 0) { ElMessage.success('参考解验证通过'); await loadReferences(); } else ElMessage.error(res.message || '验证失败'); };
const debugReference = async () => {
  const inputs = referenceInputs.value.split(/\n---\n/).map((item) => item.trim()).filter(Boolean);
  if (!inputs.length) return ElMessage.warning('请按“---”分隔输入样例');
  const body: ReferenceSolutionDebugRequest = { language: referenceForm.value.language, sourceCode: referenceForm.value.sourceCode, inputs, previewChars: 200 };
  const res = await AlgorithmTestGenerationControllerService.debugReferenceSolution(body); referenceDebug.value = res.data ?? [];
};
const submitManualCases = async () => {
  testCases.value[0].runCode = runCode.value;
  const res = await ProblemAlgorithmControllerService.problemAlgorithmTestCaseAddUsingPost(testCases.value, problemId.value);
  if (res.code === 0) ElMessage.success('手工测试样例保存成功'); else ElMessage.error(res.message || '保存失败');
};
const addManualCase = () => testCases.value.push({ input: '', output: '', runCode: '' });
const removeManualCase = (index: number) => { if (testCases.value.length > 1) testCases.value.splice(index, 1); };
onMounted(async () => {
  await Promise.all([loadManualCases(), loadReferences()]);
  const history = await AlgorithmTestGenerationControllerService.listJobs(problemId.value, 1, 1);
  job.value = history.data?.[0] ?? null;
  if (job.value?.jobId) { await loadJob(job.value.jobId); if (isRunning.value) startPolling(job.value.jobId); }
});
onBeforeUnmount(stopPolling);
</script>

<template>
  <div class="page">
    <el-card shadow="never">
      <template #header>
        <div class="header"><div><h2>{{ problemId }} 号算法题测试样例</h2><p>手工维护、AI 批量生成和参考解验证互相独立，生成任务不会调用旧测试样例保存接口。</p></div><el-tag type="info">新接口版本</el-tag></div>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="AI 批量生成" name="generate">
          <el-alert type="info" :closable="false" show-icon title="建议先在“参考解管理”中验证可信程序；默认不生成标准输出，适用于 checker 题。" />
          <el-form label-width="150px" class="form">
            <el-form-item label="AI 模型"><el-select v-model="generation.model" style="width: 320px"><el-option v-for="item in models" :key="item.value" v-bind="item" /></el-select></el-form-item>
            <el-form-item label="写入方式"><el-radio-group v-model="generation.writeMode"><el-radio-button label="APPEND">追加去重</el-radio-button><el-radio-button label="REPLACE">全部替换</el-radio-button></el-radio-group></el-form-item>
            <el-form-item label="生成标准输出"><el-switch v-model="generation.generateExpectedOutput" active-text="使用已验证参考解" inactive-text="不生成" /><el-checkbox v-if="!generation.generateExpectedOutput" v-model="generation.confirmEmptyOutput" style="margin-left: 20px">我确认本题有 checker 或接受空输出</el-checkbox></el-form-item>
          </el-form>
          <div class="section-title"><span>数据规模</span><el-button size="small" @click="addScale">添加规模</el-button></div>
          <el-table :data="generation.scales" border>
            <el-table-column label="规模" width="150"><template #default="{ row }"><el-select v-model="row.scale"><el-option v-for="item in scaleOptions" :key="item" :label="item" :value="item" /></el-select></template></el-table-column>
            <el-table-column label="数量" width="120"><template #default="{ row }"><el-input-number v-model="row.count" :min="1" :max="1000" /></template></el-table-column>
            <el-table-column label="随机种子" width="150"><template #default="{ row }"><el-input-number v-model="row.seed" :controls="false" placeholder="自动生成" /></template></el-table-column>
            <el-table-column label="约束与覆盖范围"><template #default="{ row }"><el-input v-model="row.constraints" placeholder="例如 n 接近上限，包含边界和重复值" /></template></el-table-column>
            <el-table-column label="操作" width="80"><template #default="{ $index }"><el-button link type="danger" @click="removeScale($index)">删除</el-button></template></el-table-column>
          </el-table>
          <div class="reference-select" v-if="generation.generateExpectedOutput"><span>参考解：</span><el-select v-model="generation.referenceSolutionId" placeholder="请选择 VERIFIED 参考解" style="width: 360px"><el-option v-for="item in references.filter((item) => item.status === 'VERIFIED')" :key="item.id" :label="`${item.language} #${item.id}（${item.validatedCaseCount ?? 0} 条已验证）`" :value="item.id" /></el-select></div>
          <div class="actions"><el-button type="primary" :loading="loading" :disabled="isRunning" @click="createJob">创建生成任务</el-button></div>

          <el-card v-if="job" class="job-card" shadow="never"><template #header><div class="job-header"><span>任务 #{{ job.jobId }} · {{ job.status }}</span><span><el-button v-if="isRunning" size="small" type="warning" @click="cancelJob">取消</el-button><el-button v-if="['FAILED','CANCELLED'].includes(job.status ?? '')" size="small" @click="retryJob">重试</el-button></span></div></template><el-progress :percentage="job.progressPercent ?? 0" /><p class="stage">{{ job.currentStage }}</p><el-alert v-if="job.errorMessage" type="error" :closable="false" :title="job.errorMessage" /><el-table v-if="previews.length" :data="previews" border size="small" class="preview-table"><el-table-column prop="index" label="序号" width="70" /><el-table-column prop="scale" label="规模" width="100" /><el-table-column label="输入预览"><template #default="{ row }"><pre>{{ row.inputPreview }}</pre></template></el-table-column><el-table-column label="输出预览"><template #default="{ row }"><pre>{{ row.outputPreview || '未生成' }}</pre></template></el-table-column></el-table></el-card>
        </el-tab-pane>

        <el-tab-pane label="生成器调试" name="debug"><el-alert type="warning" :closable="false" title="生成器必须是 Python 3，stdin 读取 {seed,startIndex,count}，stdout 每行输出 {input: string} JSONL。" /><el-form label-width="120px" class="form"><el-form-item label="规模"><el-select v-model="debugScale.scale" style="width: 180px"><el-option v-for="item in scaleOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item><el-form-item label="数量"><el-input-number v-model="debugScale.count" :min="1" :max="10" /></el-form-item><el-form-item label="生成器代码"><el-input v-model="debugScale.code" type="textarea" :rows="16" placeholder="粘贴 Python 生成器代码" /></el-form-item></el-form><el-button type="primary" @click="debugGenerator">沙箱调试</el-button><el-table v-if="generatorDebug?.cases?.length" :data="generatorDebug.cases" border class="debug-table"><el-table-column prop="index" label="序号" width="80" /><el-table-column label="输入预览"><template #default="{ row }"><pre>{{ row.inputPreview }}</pre></template></el-table-column></el-table></el-tab-pane>

        <el-tab-pane label="参考解管理" name="reference"><el-alert type="info" :closable="false" title="只有通过现有测试样例验证的参考解才会显示为 VERIFIED，并可用于批量生成标准输出。" /><el-form label-width="120px" class="form"><el-form-item label="语言"><el-select v-model="referenceForm.language" style="width: 180px"><el-option label="C++" value="cpp" /><el-option label="Python" value="python" /></el-select></el-form-item><el-form-item label="参考解代码"><el-input v-model="referenceForm.sourceCode" type="textarea" :rows="14" placeholder="粘贴管理员确认过的正确程序" /></el-form-item><el-form-item label="备注"><el-input v-model="referenceForm.note" /></el-form-item></el-form><div class="actions"><el-button type="primary" @click="saveReference">保存草稿</el-button></div><el-divider /><el-table :data="references" border><el-table-column prop="id" label="ID" width="80" /><el-table-column prop="language" label="语言" width="100" /><el-table-column prop="status" label="状态" width="140" /><el-table-column prop="validatedCaseCount" label="已验证数量" width="120" /><el-table-column prop="validationSummary" label="验证摘要" /><el-table-column label="操作" width="120"><template #default="{ row }"><el-button link type="success" :disabled="row.status === 'VERIFIED'" @click="validateReference(row.id)">验证</el-button></template></el-table-column></el-table><el-divider /><el-form label-width="120px"><el-form-item label="参考解快速调试"><el-input v-model="referenceInputs" type="textarea" :rows="6" placeholder="多个输入用单独一行 --- 分隔" /></el-form-item></el-form><el-button @click="debugReference">调试参考解</el-button><el-table v-if="referenceDebug.length" :data="referenceDebug" border class="debug-table"><el-table-column prop="index" label="序号" width="80" /><el-table-column label="输入"><template #default="{ row }"><pre>{{ row.inputPreview }}</pre></template></el-table-column><el-table-column label="输出"><template #default="{ row }"><pre>{{ row.outputPreview }}</pre></template></el-table-column></el-table></el-tab-pane>

        <el-tab-pane label="手工维护" name="manual"><div class="manual-list"><div v-for="(testCase, index) in testCases" :key="index" class="manual-row"><el-input v-model="testCase.input" type="textarea" :rows="3" placeholder="输入样例" /><el-input v-model="testCase.output" type="textarea" :rows="3" placeholder="输出样例；checker 题可为空" /><el-button type="danger" link @click="removeManualCase(index)">删除</el-button></div></div><el-form-item label="C++ 自定义校验器"><el-input v-model="runCode" type="textarea" :rows="10" placeholder="从 stdin 读取题目输入和选手输出，正确时输出 YES" /></el-form-item><div class="actions"><el-button @click="addManualCase">添加样例</el-button><el-button type="success" @click="submitManualCases">保存手工样例</el-button></div></el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.page { max-width: 1320px; margin: 24px auto; padding: 0 16px 48px; }
.header, .job-header, .section-title, .actions, .reference-select { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
h2 { margin: 0 0 8px; color: #1f2937; }
.header p { margin: 0; color: #6b7280; font-size: 13px; }
.form { max-width: 900px; margin-top: 20px; }
.section-title { margin: 20px 0 12px; font-weight: 600; }
.reference-select { justify-content: flex-start; margin: 20px 0; }
.actions { justify-content: flex-end; margin: 20px 0; }
.job-card { margin-top: 24px; background: #f8fafc; }
.stage { color: #4b5563; }
.preview-table, .debug-table { margin-top: 18px; }
pre { margin: 0; white-space: pre-wrap; word-break: break-word; max-height: 140px; overflow: auto; font: 12px/1.5 'JetBrains Mono', monospace; }
.manual-list { display: grid; gap: 12px; }
.manual-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: start; }
@media (max-width: 800px) { .manual-row { grid-template-columns: 1fr; } .header { align-items: flex-start; } }
</style>
