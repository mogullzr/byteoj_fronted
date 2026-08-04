<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import { Delete, DocumentChecked, MagicStick, Plus, QuestionFilled, VideoPlay } from '@element-plus/icons-vue';
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

const activeTab = ref<'manual' | 'generate' | 'debug' | 'reference'>('manual');
const loading = ref(false);
const testCases = ref<ProblemAlgorithmTestCaseRequest[]>([]);
const runCode = ref('');

const models = [
  { label: 'ChatGPT 5.4', value: 'gpt-5.4', hint: '通用推理，优先推荐' },
  { label: 'DeepSeek Chat', value: 'deepseek-chat', hint: '速度快，适合常规规模' },
  { label: 'DeepSeek V4 Flash', value: 'deepseek-ai/DeepSeek-V4-Flash', hint: '大规模生成' },
  { label: 'DeepSeek R1', value: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B', hint: '复杂约束推理' },
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
        <div class="header"><div><div class="eyebrow">ALGORITHM TEST DATA</div><h1>{{ problemId }}号试题的测试样例</h1><p>原有手工编辑功能完整保留，AI 批量生成作为独立工具使用。</p></div><el-tag class="status-tag" effect="plain"><el-icon><DocumentChecked /></el-icon> 管理员工作台</el-tag></div>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane name="generate">
          <template #label><span class="tab-label"><el-icon><MagicStick /></el-icon>AI 批量生成</span></template>
          <div class="tool-heading"><div><h2>AI 测试数据生成</h2><p>每种规模生成一份 Python 程序，经过沙箱验证后分批生成样例。</p></div><el-tag type="warning" effect="plain">异步任务</el-tag></div>
          <el-alert type="info" :closable="false" show-icon title="建议先在“参考解管理”中验证可信程序；默认不生成标准输出，适用于 checker 题。" />
          <el-form label-width="150px" class="form generation-form">
            <el-form-item label="AI 模型"><el-select v-model="generation.model" style="width: 360px"><el-option v-for="item in models" :key="item.value" :label="item.label" :value="item.value"><template #default><div class="model-option"><span>{{ item.label }}</span><small>{{ item.hint }}</small></div></template></el-option></el-select></el-form-item>
            <el-form-item label="写入方式"><el-radio-group v-model="generation.writeMode"><el-radio-button label="APPEND">追加去重</el-radio-button><el-radio-button label="REPLACE">全部替换</el-radio-button></el-radio-group></el-form-item>
            <el-form-item label="生成标准输出"><el-switch v-model="generation.generateExpectedOutput" active-text="使用已验证参考解" inactive-text="不生成" /><el-checkbox v-if="!generation.generateExpectedOutput" v-model="generation.confirmEmptyOutput" style="margin-left: 20px">我确认本题有 checker 或接受空输出</el-checkbox></el-form-item>
          </el-form>
          <div class="section-title"><span>数据规模</span><el-button size="small" @click="addScale">添加规模</el-button></div>
          <el-table :data="generation.scales" border class="scale-table">
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

        <el-tab-pane name="debug"><template #label><span class="tab-label"><el-icon><VideoPlay /></el-icon>生成器调试</span></template><div class="tool-heading"><div><h2>生成器调试</h2><p>先用少量数据检查协议和输出，再运行正式批量任务。</p></div></div><el-alert type="warning" :closable="false" title="生成器必须是 Python 3，stdin 读取 {seed,startIndex,count}，stdout 每行输出 {input: string} JSONL。" /><el-form label-width="120px" class="form"><el-form-item label="规模"><el-select v-model="debugScale.scale" style="width: 180px"><el-option v-for="item in scaleOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item><el-form-item label="数量"><el-input-number v-model="debugScale.count" :min="1" :max="10" /></el-form-item><el-form-item label="生成器代码"><el-input v-model="debugScale.code" type="textarea" :rows="16" placeholder="粘贴 Python 生成器代码" /></el-form-item></el-form><el-button type="primary" @click="debugGenerator"><el-icon><VideoPlay /></el-icon>沙箱调试</el-button><el-table v-if="generatorDebug?.cases?.length" :data="generatorDebug.cases" border class="debug-table"><el-table-column prop="index" label="序号" width="80" /><el-table-column label="输入预览"><template #default="{ row }"><pre>{{ row.inputPreview }}</pre></template></el-table-column></el-table></el-tab-pane>

        <el-tab-pane name="reference"><template #label><span class="tab-label"><el-icon><DocumentChecked /></el-icon>参考解管理</span></template><div class="tool-heading"><div><h2>参考解管理</h2><p>只有通过现有样例验证的程序，才能用于生成标准输出。</p></div></div><el-alert type="info" :closable="false" title="只有通过现有测试样例验证的参考解才会显示为 VERIFIED，并可用于批量生成标准输出。" /><el-form label-width="120px" class="form"><el-form-item label="语言"><el-select v-model="referenceForm.language" style="width: 180px"><el-option label="C++" value="cpp" /><el-option label="Python" value="python" /></el-select></el-form-item><el-form-item label="参考解代码"><el-input v-model="referenceForm.sourceCode" type="textarea" :rows="14" placeholder="粘贴管理员确认过的正确程序" /></el-form-item><el-form-item label="备注"><el-input v-model="referenceForm.note" /></el-form-item></el-form><div class="actions"><el-button type="primary" @click="saveReference"><el-icon><DocumentChecked /></el-icon>保存草稿</el-button></div><el-divider /><el-table :data="references" border><el-table-column prop="id" label="ID" width="80" /><el-table-column prop="language" label="语言" width="100" /><el-table-column prop="status" label="状态" width="140" /><el-table-column prop="validatedCaseCount" label="已验证数量" width="120" /><el-table-column prop="validationSummary" label="验证摘要" /><el-table-column label="操作" width="120"><template #default="{ row }"><el-button link type="success" :disabled="row.status === 'VERIFIED'" @click="validateReference(row.id)">验证</el-button></template></el-table-column></el-table><el-divider /><el-form label-width="120px"><el-form-item label="参考解快速调试"><el-input v-model="referenceInputs" type="textarea" :rows="6" placeholder="多个输入用单独一行 --- 分隔" /></el-form-item></el-form><el-button @click="debugReference"><el-icon><VideoPlay /></el-icon>调试参考解</el-button><el-table v-if="referenceDebug.length" :data="referenceDebug" border class="debug-table"><el-table-column prop="index" label="序号" width="80" /><el-table-column label="输入"><template #default="{ row }"><pre>{{ row.inputPreview }}</pre></template></el-table-column><el-table-column label="输出"><template #default="{ row }"><pre>{{ row.outputPreview }}</pre></template></el-table-column></el-table></el-tab-pane>

        <el-tab-pane name="manual">
          <template #label><span class="tab-label"><el-icon><DocumentChecked /></el-icon>手工维护</span></template>
          <section class="legacy-panel">
            <div class="panel-intro"><div><h2>测试样例编辑</h2><p>逐条填写输入和输出，操作方式与原页面保持一致。</p></div><el-tag type="info" effect="plain">原有功能</el-tag></div>
            <div class="test-case-list">
              <div v-for="(testCase, index) in testCases" :key="index" class="test-case-row">
                <div class="case-index">{{ String(index + 1).padStart(2, '0') }}</div>
                <div class="case-field"><div class="field-label">输入样例 {{ index + 1 }}</div><el-input v-model="testCase.input" type="textarea" placeholder="请输入输入样例" :rows="3" resize="vertical" /></div>
                <div class="case-field"><div class="field-label">输出样例 {{ index + 1 }}</div><el-input v-model="testCase.output" type="textarea" placeholder="请输入输出样例" :rows="3" resize="vertical" /></div>
                <el-button class="icon-delete" text circle :disabled="testCases.length <= 1" title="删除此样例" @click="removeManualCase(index)"><el-icon><Delete /></el-icon></el-button>
              </div>
            </div>
            <el-divider />
            <div class="checker-heading"><div><h3>二次判别程序（仅支持 C++）</h3><p>用于忽略空格、顺序、大小写等格式差异。</p></div><el-tooltip content="从 stdin 依次读取原始输入和用户输出，stdout 输出 YES 或 NO。" placement="top"><el-icon class="help-icon"><QuestionFilled /></el-icon></el-tooltip></div>
            <el-input v-model="runCode" type="textarea" :rows="9" resize="vertical" class="code-input" placeholder="请编写 C++ 程序：从 stdin 依次读入题目输入和用户输出，若答案可接受则输出 YES，否则输出 NO。注意：必须完整读取两段内容。" />
            <el-alert title="使用规范" type="info" :closable="false" class="usage-alert"><template #default><div>程序通过 stdin 依次接收两段字符串：<code>input</code>（原始输入）和 <code>output</code>（用户程序标准输出）。</div><div>判定结果必须通过 stdout 打印：<code>YES</code> 表示正确，<code>NO</code> 表示错误（全大写）。</div><div>例如允许输出顺序任意时，可以解析后比较集合，再输出 YES/NO。</div></template></el-alert>
            <el-collapse class="example-collapse"><el-collapse-item title="查看 C++ 判题程序示例"><div class="code-example"><span class="comment">// 题目：输出两个数的所有排列（顺序任意）</span><pre>#include &lt;iostream&gt;
#include &lt;set&gt;
#include &lt;string&gt;
#include &lt;sstream&gt;
using namespace std;

int main() {
    string input, line;
    getline(cin, input);
    string output_all;
    while (getline(cin, line)) if (!line.empty()) output_all += line + "\\n";
    stringstream si(input);
    int a, b; si &gt;&gt; a &gt;&gt; b;
    string p1 = to_string(a) + " " + to_string(b);
    string p2 = to_string(b) + " " + to_string(a);
    set&lt;string&gt; userLines;
    stringstream so(output_all);
    while (getline(so, line)) if (!line.empty()) userLines.insert(line);
    cout &lt;&lt; (userLines.size() == 2 &amp;&amp; userLines.count(p1) &amp;&amp; userLines.count(p2) ? "YES" : "NO");
    return 0;
}</pre></div><p class="example-note">程序从 stdin 读取原始输入和用户输出，若包含两种合法排列则输出 YES。</p></el-collapse-item></el-collapse>
            <div class="legacy-actions"><el-button size="large" @click="addManualCase"><el-icon><Plus /></el-icon>添加测试样例</el-button><el-button size="large" type="success" @click="submitManualCases"><el-icon><DocumentChecked /></el-icon>提交测试样例</el-button></div>
            <div class="legacy-footer">到底了......</div>
          </section>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.page { max-width: 1240px; margin: 28px auto; padding: 0 18px 56px; color: #172033; }
.page :deep(.el-card) { border-color: #dfe4ec; border-radius: 6px; }
.page :deep(.el-card__header) { padding: 24px 28px 20px; border-bottom-color: #e6eaf0; }
.page :deep(.el-card__body) { padding: 0 28px 30px; }
.header, .job-header, .section-title, .actions, .reference-select, .panel-intro, .checker-heading, .legacy-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.header h1 { margin: 4px 0 8px; color: #172033; font-size: 25px; font-weight: 650; line-height: 1.3; letter-spacing: 0; }
.header p, .panel-intro p, .checker-heading p { margin: 0; color: #687386; font-size: 13px; line-height: 1.7; }
.eyebrow { color: #2563eb; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; }
.status-tag { display: inline-flex; align-items: center; gap: 5px; color: #445066; border-color: #ccd3dd; background: #fff; }
.page :deep(.el-tabs__header) { margin: 0 -28px 24px; padding: 0 28px; background: #fbfcfe; }
.page :deep(.el-tabs__nav-wrap::after) { height: 1px; background: #e6eaf0; }
.page :deep(.el-tabs__item) { height: 52px; color: #657084; font-size: 14px; }
.page :deep(.el-tabs__item.is-active) { color: #2563eb; font-weight: 600; }
.page :deep(.el-tabs__nav) { display: flex; }
.page :deep(.el-tabs__item[aria-controls='pane-manual']) { order: 1; }
.page :deep(.el-tabs__item[aria-controls='pane-generate']) { order: 2; }
.page :deep(.el-tabs__item[aria-controls='pane-debug']) { order: 3; }
.page :deep(.el-tabs__item[aria-controls='pane-reference']) { order: 4; }
.tab-label { display: inline-flex; align-items: center; gap: 6px; }
.form { max-width: 960px; margin: 22px 0 6px; }
.generation-form { padding: 18px 20px 6px; border: 1px solid #e1e6ed; border-radius: 6px; background: #fafbfc; }
.generation-form :deep(.el-form-item:last-child) { margin-bottom: 12px; }
.section-title { margin: 24px 0 12px; font-size: 15px; font-weight: 650; }
.section-title::before { width: 3px; height: 16px; margin-right: -7px; border-radius: 1px; background: #2563eb; content: ''; }
.section-title > span:first-child { margin-right: auto; }
.scale-table { border-radius: 5px; overflow: hidden; }
.scale-table :deep(th.el-table__cell) { background: #f6f8fb; color: #4d596e; font-weight: 600; }
.reference-select { justify-content: flex-start; margin: 20px 0; }
.actions { justify-content: flex-end; margin: 22px 0; }
.job-card { margin-top: 26px; background: #fafbfc; }
.stage { color: #566176; }
.preview-table, .debug-table { margin-top: 18px; }
.panel-intro { align-items: flex-start; margin-bottom: 18px; }
.panel-intro h2, .checker-heading h3 { margin: 0 0 4px; color: #1f2937; font-size: 17px; letter-spacing: 0; }
.tool-heading { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.tool-heading h2 { margin: 0 0 5px; color: #1f2937; font-size: 18px; letter-spacing: 0; }
.tool-heading p { margin: 0; color: #687386; font-size: 13px; }
.legacy-panel { max-width: 1000px; margin: 0 auto; }
.test-case-list { display: grid; gap: 12px; }
.test-case-row { display: grid; grid-template-columns: 42px minmax(0, 1fr) minmax(0, 1fr) 36px; gap: 14px; align-items: center; padding: 16px; border: 1px solid #e0e5ec; border-radius: 6px; background: #fff; }
.case-index { align-self: start; padding-top: 26px; color: #8b95a6; font: 600 12px/1 'JetBrains Mono', Consolas, monospace; }
.case-field { min-width: 0; }
.field-label { margin-bottom: 7px; color: #465166; font-size: 12px; font-weight: 600; }
.case-field :deep(textarea), .code-input :deep(textarea) { font-family: 'JetBrains Mono', Consolas, monospace; line-height: 1.55; }
.icon-delete { color: #dc2626; }
.checker-heading { justify-content: flex-start; margin: 2px 0 12px; }
.help-icon { color: #2563eb; cursor: help; }
.usage-alert { margin-top: 14px; line-height: 1.75; }
.usage-alert code { margin: 0 2px; padding: 1px 5px; border: 1px solid #dbe3ef; border-radius: 3px; background: #f7f9fc; color: #1d4ed8; }
.example-collapse { margin-top: 16px; }
.code-example { padding: 16px 18px; overflow-x: auto; border: 1px solid #dce2ea; border-radius: 5px; background: #f8fafc; }
.code-example .comment { color: #758195; font: 12px/1.5 'JetBrains Mono', Consolas, monospace; }
.code-example pre { max-height: none; margin-top: 10px; white-space: pre; color: #263247; }
.example-note { margin: 10px 0 0; color: #687386; font-size: 12px; }
.legacy-actions { justify-content: center; margin-top: 24px; }
.legacy-footer { margin-top: 28px; padding-top: 18px; border-top: 1px solid #e5e9ef; color: #657084; font-size: 15px; font-weight: 600; text-align: center; }
.model-option { display: flex; align-items: center; justify-content: space-between; gap: 30px; }
.model-option small { color: #8a94a5; }
pre { margin: 0; white-space: pre-wrap; word-break: break-word; max-height: 160px; overflow: auto; font: 12px/1.55 'JetBrains Mono', Consolas, monospace; }
@media (max-width: 820px) {
  .page { margin-top: 12px; padding: 0 10px 30px; }
  .page :deep(.el-card__header), .page :deep(.el-card__body) { padding-left: 16px; padding-right: 16px; }
  .page :deep(.el-tabs__header) { margin-left: -16px; margin-right: -16px; padding: 0 16px; overflow-x: auto; }
  .header { align-items: flex-start; }
  .status-tag { display: none; }
  .test-case-row { grid-template-columns: 30px minmax(0, 1fr) 34px; }
  .case-field { grid-column: 2; }
  .icon-delete { grid-column: 3; grid-row: 1; }
}
</style>
