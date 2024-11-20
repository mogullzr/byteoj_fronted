<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import router from "../../../router";
import {
  ElNotification,
  genFileId,
  UploadInstance,
  UploadProps,
  UploadRawFile,
} from "element-plus";
import * as XLSX from "xlsx";
import { ProblemAlgorithmControllerService } from "../../../../generated";

const path = router.currentRoute.value.fullPath;
const problem_id = parseInt(path.toString().split("/")[5]);

const testCase: Ref<any> = ref([]);

// 手动添加测试数据
const testCaseAdd = () => {
  testCase.value.push({
    input: "",
    output: "",
  });
};

const deleteRow = (index: number) => {
  testCase.value.splice(index, 1);
};

const upload = ref<UploadInstance>();

const handleExceed: UploadProps["onExceed"] = (files) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

const handleFileUpload = (file: File) => {
  const reader = new FileReader();

  reader.onload = (e: ProgressEvent<FileReader>) => {
    const data = new Uint8Array(e.target!.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0]; // Assuming the first sheet
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const newTestCases = json.slice(1).map((row: any) => ({
      input: row[0].toString() || "",
      output: row[1].toString() || "",
    }));

    testCase.value = newTestCases;
  };

  reader.readAsArrayBuffer(file);
};

const submitData = async () => {
  const res =
    await ProblemAlgorithmControllerService.problemAlgorithmTestCaseAddUsingPost(
      testCase.value,
      problem_id,
    );
  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "题目创建成功",
      offset: 100,
    });
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
      offset: 100,
    });
  }
};
onMounted(async () => {
  const res =
    await ProblemAlgorithmControllerService.problemAlgorithmTestCaseGetUsingPost(
      problem_id,
    );
  if (res.code === 0) {
    testCase.value = res.data;
  }
});

const handleChange: UploadProps["onChange"] = (file) => {
  handleFileUpload(file.raw as File);
};
</script>

<template>
  <el-card style="max-width: 640px; margin: 0 auto">
    <div style="font-size: 30px">{{ problem_id }}号试题测试数据</div>
    <div>
      <div v-for="(text, index) in testCase" style="margin: 20px 20px">
        <div style="display: flex">
          <div>
            <div>输入数据:</div>
            <el-input
              v-model="text.input"
              style="width: 240px; margin: 6px auto"
              placeholder="请输入输入数据"
              clearable
            />
          </div>
          <div style="margin-left: 10px">
            <div>输出数据:</div>
            <el-input
              v-model="text.output"
              style="width: 240px; margin: 6px auto"
              placeholder="请输入输出数据"
              clearable
            />
            <el-button @click="deleteRow(index)" style="margin-left: 17px">
              <el-icon size="20">
                <DeleteFilled />
              </el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <div style="text-align: center">
      <el-button
        type="primary"
        style="align-content: center; margin: 0 auto; width: 96%"
        @click="testCaseAdd"
        >添加评测数据
      </el-button>
      <el-upload
        ref="upload"
        class="upload-demo"
        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
        :limit="1"
        :on-exceed="handleExceed"
        :auto-upload="false"
        :on-change="handleChange"
      >
        <template #trigger>
          <el-button style="margin-top: 10px; width: 580px" type="success"
            >请选择Excel文件</el-button
          >
        </template>
        <template #tip>
          <div class="el-upload__tip text-red">
            注意：第一列数据为输入数据，第二列对应为输出数据
          </div>
        </template>
      </el-upload>
      <el-button
        type="success"
        style="width: 97%; font-size: 20px"
        round
        @click="submitData"
        >上传测试数据</el-button
      >
    </div>
  </el-card>
</template>

<style scoped></style>
