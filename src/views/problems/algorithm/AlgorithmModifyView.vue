<template>
  <div style="display: flex">
    <el-form
      ref="ruleFormRef"
      style="max-width: 800px"
      label-width="auto"
      class="demo-ruleForm"
      :size="formSize"
      status-icon
    >
      <el-form-item label="題目ID(选填)" style="width: 400px">
        <el-input placeholder="填写题目的ID" v-model="problem.problem_id" />
      </el-form-item>

      <el-form-item label="题目名称" style="width: 400px">
        <el-input
          placeholder="填写题目名称"
          v-model="problem.chinese_name"
          aria-errormessage="题目名称不能为空"
        />
      </el-form-item>
      <el-form-item label="难度" prop="name" style="width: 400px">
        <el-select placeholder="难度选择" v-model="problem.difficulty_name">
          <el-option label="简单" value="简单" />
          <el-option label="中等" value="中等" />
          <el-option label="困难" value="困难" />
        </el-select>
      </el-form-item>
      <el-form-item label="时间限制" style="width: 400px">
        <el-select placeholder="时间限制选择" v-model="problem.cpu_limit">
          <el-option label="1s" value="1" />
          <el-option label="2s" value="2" />
          <el-option label="3s" value="3" />
          <el-option label="4s" value="4" />
          <el-option label="5s" value="5" />
          <el-option label="6s" value="6" />
          <el-option label="7s" value="7" />
          <el-option label="8s" value="8" />
          <el-option label="9s" value="9" />
          <el-option label="10s" value="10" />
          <el-option label="12s" value="12" />
          <el-option label="14s" value="14" />
          <el-option label="16s" value="16" />
          <el-option label="18s" value="18" />
          <el-option label="20s" value="20" />
        </el-select>
      </el-form-item>
      <el-form-item label="空间限制" style="width: 400px">
        <el-select placeholder="空间限制选择" v-model="problem.memory_limit">
          <el-option label="16MB" value="16" />
          <el-option label="32MB" value="32" />
          <el-option label="64MB" value="64" />
          <el-option label="128MB" value="128" />
          <el-option label="256MB" value="256" />
          <el-option label="512MB" value="512" />
          <el-option label="1024MB" value="1024" />
        </el-select>
      </el-form-item>

      <el-form-item label="来源" style="width: 400px">
        <el-input placeholder="来源选择" v-model="problem.source_name" />
      </el-form-item>
      <el-form-item label="算法标签(选填)">
        <el-button plain @click="centerDialogVisible = true">
          选择算法标签
        </el-button>

        <el-dialog
          v-model="centerDialogVisible"
          title="标签分类"
          width="500"
          center
        >
          <el-input
            v-model="tag_key"
            style="max-width: 600px"
            placeholder="关键词搜索标签"
            class="input-with-select"
          >
            <template #prepend>
              <el-button :icon="Search" />
            </template>
          </el-input>
          <div v-for="tags in search_tag_list">
            <div>
              <el-text type="info" size="large">{{ tags.category }}</el-text>
            </div>
            <el-checkbox
              v-for="tag in tags.tag_list"
              :id="tag"
              @click="addTag(tag)"
              :label="tag"
              border
            />
          </div>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="centerDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="centerDialogVisible = false">
                确定
              </el-button>
            </div>
          </template>
        </el-dialog>
      </el-form-item>
      <el-form-item label="题目描述" prop="name">
        <el-input
          v-model="problem.description"
          maxlength="10000"
          rows="20"
          style="width: 800px"
          placeholder="请输入题目描述"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
    </el-form>
    <el-card
      style="
        min-width: 700px;
        max-width: 800px;
        max-height: 700px;
        margin-left: 30px;
        overflow: auto;
      "
    >
      <MarkdownView
        :generate-data="
          '# ' +
          (problem.problem_id === undefined ? '' : problem.problem_id) +
          '.' +
          (problem.chinese_name === undefined ? '' : problem.chinese_name) +
          '' +
          '\n' +
          (problem.description === undefined ? '' : problem.description)
        "
      />
    </el-card>
  </div>
  <div style="float: right; margin: 14px 0">
    <el-button
      type="success"
      size="large"
      style="width: 100px"
      @click="recoverToProblem"
      >回复原题
    </el-button>
    <el-button
      type="info"
      size="large"
      @click="dialogVisible = true"
      style="margin: 10px 20px; width: 100px"
      >保存
    </el-button>
    <el-dialog v-model="dialogVisible" title="保存为草稿" width="500">
      <el-text>你确定要将目前编写内容保存到草稿中吗？</el-text>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="stayProblemDraft"> 确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-button
      type="primary"
      size="large"
      style="width: 100px"
      @click="modifyProblem"
      >修改
    </el-button>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { ElNotification } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import MarkdownView from "/src/views/markdown/MarkdownView.vue";
import { ProblemAlgorithmControllerService } from "../../../../generated";
import { onBeforeRouteLeave } from "vue-router";
import UseStore from "/src/store/store.ts";
import router from "/src/router/";

const useStore = UseStore();
const tag_key = ref("");
const tag_list = ref([]);
const centerDialogVisible = ref(false);
const formSize = ref("default");
const ruleFormRef = ref();
const path = router.currentRoute.value.fullPath;
const problem_id = ref(path.toString().split("/")[4]);

const problem = ref(
  localStorage.getItem("problem_draft-" + problem_id.value) == null
    ? { problem_id: null }
    : JSON.parse(localStorage.getItem("problem_draft-" + problem_id.value)),
);

const search_tag_list = computed(() =>
  tag_list.value.filter(
    (data) =>
      !tag_key.value ||
      data.tag_list?.toString()?.includes(tag_key.value) ||
      data.category?.includes(tag_key.value),
  ),
);

// 过滤寻找到已经标志的标签
const addTag = (tag) => {
  if (!problem.value.tags_list?.toString().includes(tag)) {
    problem.value.tags_list?.push(tag);
  } else {
    problem.value.tags_list = problem.value.tags_list.filter((t) => t != tag);
  }
};

// 修改题目请求
const modifyProblem = async () => {
  let tag_id_list = [];
  for (let k = 0; k < problem.value.tags_list.length; k++) {
    for (
      let item = 0;
      item < useStore.AlgorithmTagsRelation[0].length;
      item++
    ) {
      if (
        useStore.AlgorithmTagsRelation[0][item].tag_name ===
        problem.value.tags_list[k]
      ) {
        tag_id_list.push(useStore.AlgorithmTagsRelation[0][item].tag_id);
        break;
      }
    }
  }

  problem.value.tags_list = tag_id_list;
  problem.value.create_by_id = useStore.loginUser.uuid;
  problem.value.create_by_name = useStore.loginUser.username;
  const res =
    await ProblemAlgorithmControllerService.problemAlgorithmModifyUsingPost(
      problem.value,
    );

  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "题目修改成功",
      offset: 100,
    });
    problem.value.tags_list = [];
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
      offset: 100,
    });
    problem.value.tags_list = [];
  }
};
const dialogVisible = ref(false);

// 保存题目草稿
const stayProblemDraft = () => {
  problem.value.tags_list = [];
  localStorage.setItem(
    "problem_draft-" + problem_id.value,
    JSON.stringify(problem.value),
  );
  dialogVisible.value = false;
};

onMounted(async () => {
  // 获取算法标签类别
  const res1 =
    await ProblemAlgorithmControllerService.problemAlgorithmGetTagsPlusCategoryUsingGet();
  if (res1.code === 0) {
    tag_list.value = res1.data;
  }

  // 获取题目信息
  if (problem.value.problem_id == null) {
    const res2 =
      await ProblemAlgorithmControllerService.problemAlgorithmSearchByProblemIdUsingPost(
        problem_id.value,
      );
    if (res2.code === 0) {
      problem.value = res2.data;
      problem.value.tags_list = [];
    }
    localStorage.setItem(
      "problem_draft-" + problem_id.value,
      JSON.stringify(problem.value),
    );
  } else {
    const res2 =
      await ProblemAlgorithmControllerService.problemAlgorithmSearchByProblemIdUsingPost(
        problem_id.value,
      );
    if (res2.code === 0) {
      problem.value = res2.data;
      problem.value.tags_list = [];
    }
  }
});

onBeforeRouteLeave(() => {
  problem.value.tags_list = [];
  localStorage.setItem(
    "problem_draft-" + problem_id.value,
    JSON.stringify(problem.value),
  );
});
onBeforeUnmount(() => {
  problem.value.tags_list = [];
  localStorage.setItem(
    "problem_draft-" + problem_id.value,
    JSON.stringify(problem.value),
  );
});
// if (res2.code === 0) {
//   problem.value.chinese_name = res2.data.chinese_name;
//   problem.value.cpu_limit = res2.data.cpu_limit;
//   problem.value.problem_id = res2.data.problem_id;
//   problem.value.description = res2.data.description;
//   problem.value.difficulty_name = res2.data.difficulty_name;
//   problem.value.memory_limit = res2.data.memory_limit;
// }
const recoverToProblem = async () => {
  const res =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchByProblemIdUsingPost(
      problem_id.value,
    );
  if (res.code === 0) {
    problem.value = res.data;
  }
  localStorage.setItem(
    "problem_draft-" + problem_id.value,
    JSON.stringify(problem.value),
  );
};
</script>
