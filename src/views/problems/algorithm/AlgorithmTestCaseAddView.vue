<script setup lang="ts">
import {onMounted, ref, Ref} from "vue";
import {useRoute} from "vue-router";
import {ProblemAlgorithmControllerService, ProblemAlgorithmTestCaseRequest} from "../../../../generated";
import {ElNotification} from "element-plus";

const route = useRoute();
const problem_id:Ref<number> = ref(parseInt(route.path.split("/")[4]));
onMounted(async ()=>{
  const res = await ProblemAlgorithmControllerService.problemAlgorithmTestCaseGetUsingPost(problem_id.value);
  testCases.value = res.data;
  if (testCases.value == null) {
    testCases.value = [
      { input: '', output: '' , runCode: ""}, // 默认第一行
    ]
  }
})
// 初始化一组测试样例
const testCases = ref<ProblemAlgorithmTestCaseRequest[]>([
  { input: '', output: '' , runCode: ''}, // 默认第一行
]);

// 添加一组新的测试样例
const addTestCase = () => {
  console.log(testCases.value)
  testCases.value.push({ input: '', output: '' , runCode: ''});
};

// 删除指定索引的测试样例
const removeTestCase = (index: number) => {
  if (testCases.value.length > 1) {
    testCases.value.splice(index, 1);
  }
};

// 提交所有测试样例
const submitTestCases = async () => {
  // testCases.value[0].runCode = "1";
  const res = await ProblemAlgorithmControllerService.problemAlgorithmTestCaseAddUsingPost(testCases.value, problem_id.value);
  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "添加测试样例成功",
    });
  }else {
    ElNotification.error({
      title: "Error",
      message: res.message,
    });
  }
  // 这里可以添加提交逻辑，例如发送到后端
};
</script>

<template>
  <el-card style="max-width: 648px; margin: auto">
    <template #header>
      <div class="card-header">
        <span style="font-weight: bold; font-size: 20px">{{problem_id}}号试题的测试样例</span>
      </div>
    </template>
    <template #default>
      <div class="test-case-container">
        <!-- 遍历每组测试样例 -->
        <div v-for="(testCase, index) in testCases" :key="index" class="test-case-row">
          <el-form-item :label="'输入样例' + (index + 1)">
            <el-input v-model="testCase.input" type="textarea" placeholder="请输入输入样例" :rows="2" resize="none"/>
          </el-form-item>
          <el-form-item :label="'输出样例' + (index + 1)">
            <el-input v-model="testCase.output" type="textarea" placeholder="请输入输出样例" :rows="2" resize="none"/>
          </el-form-item>
          <!-- 删除按钮 -->
          <el-button
              @click="removeTestCase(index)"
              style="margin: 1px 0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="#dc2626" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"/></svg>
          </el-button>
        </div>
        <el-divider />

        <el-form-item label="二次判别程序（仅支持 C++）">
          <el-tooltip
              content="该程序用于对用户输出进行自定义判定（例如忽略空格、顺序、大小写等）。必须使用 C++ 编写，且需从标准输入读取原始输入和用户输出，最终输出 YES 或 NO。"
              placement="top"
          >
            <el-icon style="margin-left: 4px; color: #409EFF"><QuestionFilled /></el-icon>
          </el-tooltip>

          <el-input
              v-model="testCases[0].runCode"
              type="textarea"
              placeholder="请编写 C++ 程序：从 stdin 依次读入「题目输入」和「用户输出」，若答案可接受则输出 YES，否则输出 NO。注意：必须完整读取两段内容，否则可能运行时错误！"
              :rows="6"
              resize="vertical"
              style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 14px; margin-top: 6px;"
          />
        </el-form-item>

        <el-alert
            title="使用规范"
            type="info"
            :closable="false"
            style="margin-top: 12px; font-size: 13px; line-height: 1.6;"
        >
          <template #default>
            <div>• 程序将通过标准输入（stdin）依次接收两段字符串：<code>input</code>（原始输入）和 <code>output</code>（用户程序的标准输出）。</div>
            <div>• 判定结果必须通过标准输出（stdout）打印：<code>YES</code> 表示正确，<code>NO</code> 表示错误（全大写）。</div>
            <div>• 示例：若允许输出顺序任意，可在 C++ 中解析后比对集合是否相等，再输出 YES/NO。</div>
          </template>
        </el-alert>

        <el-collapse style="margin-top: 16px;">
          <el-collapse-item title="💡 查看 C++ 判题程序示例">
            <!-- 浅色代码块 -->
            <div
                style="
        background: #f8fafc;
        color: #334155;
        padding: 16px;
        border-radius: 8px;
        font-family: 'JetBrains Mono', Consolas, monospace;
        font-size: 14px;
        line-height: 1.7;
        overflow-x: auto;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 2px rgba(0,0,0,0.03);
      "
            >
              <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                <span style="color: #64748b; font-size: 12px;">// 题目：输出两个数的所有排列（顺序任意）</span>
              </div>
              <pre style="margin: 0; white-space: pre; word-break: break-all; color: #1e293b;">
#include &lt;iostream&gt;
#include &lt;set&gt;
#include &lt;string&gt;
#include &lt;sstream&gt;
using namespace std;

int main() {
    string input, line;
    getline(cin, input); // 原始输入 "a b"
    string output_all;
    while (getline(cin, line)) { // 用户输出（多行）
        if (!line.empty()) output_all += line + "\\n";
    }

    stringstream si(input);
    int a, b;
    si >> a >> b;
    string p1 = to_string(a) + " " + to_string(b);
    string p2 = to_string(b) + " " + to_string(a);

    set&lt;string&gt; userLines;
    stringstream so(output_all);
    while (getline(so, line)) {
        if (!line.empty()) userLines.insert(line);
    }

    if (userLines.size() == 2 &&
        userLines.count(p1) &&
        userLines.count(p2)) {
        cout << "YES" << endl;
    } else {
        cout << "NO" << endl;
    }
    return 0;
}
      </pre>
            </div>

            <div style="margin-top: 12px; font-size: 12px; color: #64748b; line-height: 1.6;">
              程序从 stdin 读取原始输入和用户输出，若用户输出包含两种合法排列（顺序任意），则输出 YES。
            </div>
          </el-collapse-item>
        </el-collapse>
        <el-divider />
        <div style="align-content: center; text-align: center">
          <!-- 添加按钮 -->
          <el-button type="primary" @click="addTestCase" size="large" style="font-size: 18px;">添加测试样例</el-button>

          <!-- 提交按钮 -->
          <el-button type="success" @click="submitTestCases" size="large" style="font-size: 18px">提交测试样例</el-button>
        </div>

      </div>
    </template>
    <template #footer>
      <span style="font-weight: bold; font-size: 20px">到底了......</span>
    </template>
  </el-card>
</template>

<style scoped>
.test-case-container {
  max-width: 800px;
  margin: 0 auto;
}

.test-case-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.test-case-row .el-textarea {
  flex: 1;
}

.test-case-row .el-button {
  flex-shrink: 0;
}
</style>