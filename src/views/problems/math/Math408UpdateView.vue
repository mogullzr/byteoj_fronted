<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { ProblemsControllerService } from "../../../../generated/services/ProblemsControllerService";
import type { FormInstance, FormRules } from "element-plus";
import { useRoute } from "vue-router";

// 假设标签数据从路由或全局获取，这里模拟或使用提供的例子
const AlgorithmTagsRelation = ref([
  { tag_id: -2, tag_name: "语言入门（请选择[入门与面试]题库）" },
  { tag_id: 1, tag_name: "模拟" },
  // 添加更多标签...
]);

// 难度选项
const difficultyOptions = [
  { value: "简单", label: "简单" },
  { value: "中等", label: "中等" },
  { value: "困难", label: "困难" },
];

// 题目类型
const optionTypeOptions = [
  { value: 0, label: "简答题" },
  { value: 1, label: "单选题" },
  { value: 2, label: "多选题" },
  { value: 3, label: "填空题" },
];

// 状态选项
const statusOptions = [
  { value: 0, label: "数学" },
  { value: 1, label: "408" },
];

// 表单数据
const form = ref({
  analysis: "",
  correct_answer: "",
  description: "",
  difficulty_name: "",
  option_type: 0,
  options: "",
  problem_id: null as number | null,
  problem_name: "",
  source_name: "",
  status: 0,
  tagsList: [] as number[],
});

// 选项列表（对于选择题）
const optionsList = ref<string[]>([]);

// 正确答案选择（对于选择题）
const selectedCorrectAnswers = ref<string[]>([]); // 如 ['A', 'B']

// 表单引用
const formRef = ref<FormInstance>();

// 是否是选择题
const isChoiceQuestion = (): boolean => {
  return form.value.option_type === 1 || form.value.option_type === 2;
};

// 添加选项
const addOption = () => {
  optionsList.value.push("");
};

// 删除选项
const removeOption = (index: number) => {
  const letter = getOptionLetter(index);
  optionsList.value.splice(index, 1);
  // 更新正确答案选择，如果删除了选项
  selectedCorrectAnswers.value = selectedCorrectAnswers.value.filter(l => l !== letter);
};

// 获取选项字母
const getOptionLetter = (index: number): string => {
  return String.fromCharCode(65 + index); // A, B, C...
};

let flag = true;
// 监听选项类型变化，重置相关字段
watch(() => form.value.option_type, () => {
  if (flag) {
    flag = false;
  } else {
    optionsList.value = [];
    selectedCorrectAnswers.value = [];
    form.value.correct_answer = "";
  }
});

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 处理options
      if (isChoiceQuestion()) {
        form.value.options = JSON.stringify(optionsList.value).replace(/"/g, "'");
        // 处理correct_answer
        form.value.correct_answer = JSON.stringify(selectedCorrectAnswers.value).replace(/"/g, "'");
      } else {
        form.value.options = "";
        // 对于非选择题，correct_answer 直接使用输入，但包裹成列表字符串
        form.value.correct_answer = JSON.stringify([form.value.correct_answer]).replace(/"/g, "'");
      }

      try {
        const res = await ProblemsControllerService.problemUpdateUsingPost(form.value);
        if (res.code === 0) {
          ElMessage.success("提交成功");
          resetForm();
        } else {
          ElMessage.error("提交失败: " + res.message);
        }
      } catch (error) {
        ElMessage.error("请求错误");
      }
    } else {
      ElMessage.warning("请检查表单");
    }
  });
};

// 重置表单
const resetForm = () => {
  form.value.analysis = "";
  form.value.correct_answer = "";
  form.value.description = "";
  form.value.difficulty_name = "";
  form.value.option_type = 0;
  form.value.options = "";
  form.value.problem_id = null;
  form.value.problem_name = "";
  form.value.source_name = "";
  form.value.status = 0;
  form.value.tagsList = [];
  optionsList.value = [];
  selectedCorrectAnswers.value = [];
};

// 自定义验证器 for correct_answer
const validateCorrectAnswers = (rule: any, value: string, callback: any) => {
  if (isChoiceQuestion()) {
    if (selectedCorrectAnswers.value.length === 0) {
      callback(new Error("请选择正确答案"));
    } else if (form.value.option_type === 1 && selectedCorrectAnswers.value.length > 1) {
      callback(new Error("单选题只能选择一个正确答案"));
    } else {
      callback();
    }
  } else {
    if (!value) {
      callback(new Error("请输入正确答案"));
    } else {
      callback();
    }
  }
};

// 表单规则
const rules = reactive<FormRules>({
  problem_name: [{ required: true, message: "请输入题目名称", trigger: "blur" }],
  description: [{ required: true, message: "请输入题目描述", trigger: "blur" }],
  difficulty_name: [{ required: true, message: "请选择难度", trigger: "change" }],
  source_name: [{ required: true, message: "请输入来源", trigger: "blur" }],
  option_type: [{ required: true, message: "请选择题目类型", trigger: "change" }],
  correct_answer: [{ validator: validateCorrectAnswers, trigger: ["blur", "change"] }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
  tagsList: [{ required: false }],
});

const route = useRoute();

// 初始化（如果需要加载现有数据）
onMounted(async () => {
  const pathParts = route.path.split('/');
  const lastPart = pathParts[pathParts.length - 1];
  if (lastPart !== 'add') {
    const problemId = Number(lastPart);
    if (!isNaN(problemId)) {
      const res = await ProblemsControllerService.problemSearchByProblemIdUsingGet(problemId);
      if (res.code === 0) {
        form.value = { ...res.data, tagsList: [] }; // 先赋值基本数据

        // 解析标签：从 tag_name 映射到 tag_id
        form.value.tagsList = res.data.tagsList.map((name: string) => {
          const tag = AlgorithmTagsRelation.value.find(t => t.tag_name === name);
          return tag ? tag.tag_id : undefined;
        }).filter((id: number | undefined) => id !== undefined) as number[];

        // 解析选项和正确答案
        if (res.data.options) {
          try {
            const optionsStr = res.data.options.replace(/'/g, '"');
            optionsList.value = JSON.parse(optionsStr);
          } catch (e) {
            console.error('Options parse error:', e);
            optionsList.value = [];
          }
        }
        if (res.data.correct_answer) {
          try {
            const correctStr = res.data.correct_answer.replace(/'/g, '"');
            const parsedCorrect = JSON.parse(correctStr);
            if (isChoiceQuestion()) {
              selectedCorrectAnswers.value = parsedCorrect;
            } else {
              form.value.correct_answer = parsedCorrect[0] || "";
            }
          } catch (e) {
            console.error('Correct answer parse error:', e);
            form.value.correct_answer = "";
            selectedCorrectAnswers.value = [];
          }
        }
      }
    }
  }
});
</script>

<template>
  <div class="manage-page">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span>创建/更新题目</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" label-width="120px" :rules="rules">
        <el-form-item label="题目ID" prop="problem_id">
          <el-input v-model.number="form.problem_id" placeholder="输入题目ID（创建时可选）" type="number"></el-input>
        </el-form-item>
        <el-form-item label="题目名称" prop="problem_name">
          <el-input v-model="form.problem_name" placeholder="输入题目名称"></el-input>
        </el-form-item>
        <el-form-item label="题目描述" prop="description">
          <el-input v-model="form.description" type="textarea" rows="4" placeholder="输入题目描述"></el-input>
        </el-form-item>
        <el-form-item label="难度" prop="difficulty_name">
          <el-select v-model="form.difficulty_name" placeholder="选择难度">
            <el-option v-for="item in difficultyOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="来源" prop="source_name">
          <el-input v-model="form.source_name" placeholder="输入来源"></el-input>
        </el-form-item>
        <el-form-item label="题目类型" prop="option_type">
          <el-select v-model="form.option_type" placeholder="选择题目类型">
            <el-option v-for="item in optionTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="isChoiceQuestion()" label="选项">
          <div v-for="(opt, index) in optionsList" :key="index" class="option-item">
            <el-input v-model="optionsList[index]" :placeholder="`选项 ${getOptionLetter(index)}`"></el-input>
            <el-button type="danger" icon="Delete" @click="removeOption(index)" circle></el-button>
          </div>
          <el-button type="primary" @click="addOption">添加选项</el-button>
        </el-form-item>
        <el-form-item v-if="isChoiceQuestion()" label="正确答案" prop="correct_answer">
          <el-radio-group v-if="form.option_type === 1" v-model="selectedCorrectAnswers[0]">
            <el-radio v-for="(opt, index) in optionsList" :key="index" :label="getOptionLetter(index)">
              {{ getOptionLetter(index) }}. {{ opt || '未输入' }}
            </el-radio>
          </el-radio-group>
          <el-checkbox-group v-else v-model="selectedCorrectAnswers">
            <el-checkbox v-for="(opt, index) in optionsList" :key="index" :label="getOptionLetter(index)">
              {{ getOptionLetter(index) }}. {{ opt || '未输入' }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item v-else label="正确答案" prop="correct_answer">
          <el-input v-model="form.correct_answer" placeholder="输入正确答案（例如 '2'）"></el-input>
        </el-form-item>
        <el-form-item label="解析" prop="analysis">
          <el-input v-model="form.analysis" type="textarea" rows="4" placeholder="输入解析"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="选择状态">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tagsList">
          <el-select v-model="form.tagsList" multiple placeholder="选择标签">
            <el-option v-for="item in AlgorithmTagsRelation" :key="item.tag_id" :label="item.tag_name" :value="item.tag_id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.manage-page {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
}

.form-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.option-item .el-input {
  flex: 1;
  margin-right: 10px;
}

.el-radio-group,
.el-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>