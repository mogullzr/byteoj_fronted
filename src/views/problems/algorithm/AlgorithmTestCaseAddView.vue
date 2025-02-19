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
})
// 初始化一组测试样例
const testCases = ref<ProblemAlgorithmTestCaseRequest[]>([
  { input: '', output: '' }, // 默认第一行
]);

// 添加一组新的测试样例
const addTestCase = () => {
  testCases.value.push({ input: '', output: '' });
};

// 删除指定索引的测试样例
const removeTestCase = (index: number) => {
  if (testCases.value.length > 1) {
    testCases.value.splice(index, 1);
  }
};

// 提交所有测试样例
const submitTestCases = async () => {
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