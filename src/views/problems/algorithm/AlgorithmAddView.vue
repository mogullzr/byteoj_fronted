<script setup lang="ts">
import {onMounted, ref, Ref} from "vue";
import {
  ProblemAlgorithmBankVo,
  ProblemAlgorithmControllerService,
  ProblemAlgorithmRequest,
  ProblemTagsVo,
} from "../../../../generated";
import {useRoute} from "vue-router";
import store from "../../../store/store.ts";
import MarkdownView from "../../components/MarkdownView.vue";
import {ElNotification} from "element-plus";

const route = useRoute();
const userRoute = store();
const problemInfo: Ref<ProblemAlgorithmRequest> = ref({
  problem_id: 1,
  chinese_name: "",
  difficulty_name: "",
  cpu_limit: "",
  memory_limit: "",
  source_name: "ByteOJ原创",
  tags_list: [],
  description: "### 123123\n### 123123\n",
  create_by_id: userRoute.loginUser.uuid,
  create_by_name: userRoute.loginUser.username
});


const problem_id: Ref<number | string> = ref(route.path.split('/')[3]);
// 标签列表
const tagsList: Ref<ProblemTagsVo[]> = ref([] as ProblemTagsVo);
// 选中标签列表
const checkTagsList: Ref<string[]> = ref([]);
// 选中标签字典关系
const checkTagsRelation: Ref<any> = ref({});
// 算法标签关系
const AlgorithmTagsRelation: Ref<any> = ref(userRoute.AlgorithmTagsRelation[0]);
// 标签框
const centerDialogVisible = ref(false)

onMounted(async () => {
  checkTagsList.value.forEach((aimTag: string) => {
    checkTagsRelation.value[aimTag] = true;
  });
  const res0 = await ProblemAlgorithmControllerService.problemAlgorithmGetTagsPlusCategoryUsingGet();
  if (res0.code === 0) {
    tagsList.value = res0.data;
  }
  // 当题目为编辑页面时
  if (problem_id.value !== "add") {
    const res = await ProblemAlgorithmControllerService.problemAlgorithmSearchByProblemIdUsingPost(problem_id.value as number);
    checkTagsList.value = JSON.parse(localStorage.getItem("checkTagsList") ?? "[]") as string[]
    if (res.code === 0) {
      let problemAlgorithmBankVo:ProblemAlgorithmBankVo = res.data;
      problemInfo.value.tags_list = problemAlgorithmBankVo.algorithm_tags;
      problemInfo.value.problem_id = problemAlgorithmBankVo.problem_id;
      problemInfo.value.cpu_limit = problemAlgorithmBankVo.cpu_limit;
      problemInfo.value.memory_limit = problemAlgorithmBankVo.memory_limit;
      problemInfo.value.difficulty_name = problemAlgorithmBankVo.difficulty_name;
      problemInfo.value.source_name = problemAlgorithmBankVo.source;
      problemInfo.value.description = problemAlgorithmBankVo.description;
      problemInfo.value.chinese_name = problemAlgorithmBankVo.chinese_name;
      checkTagsList.value = problemAlgorithmBankVo.algorithm_tags;
    } else {
      ElNotification.error({
        title: "Error",
        message: res.message,
      });
    }
  } else {
    // 初始化一下问题信息
    let item = localStorage.getItem("ProblemInfo");
    if (item != null) {
      problemInfo.value = JSON.parse(item);
    }
  }
  checkTagsList.value.forEach((aimTag: string) => {
    checkTagsRelation.value[aimTag] = true;
  });
})

// 选中某标签
const checkTag = (aimTag: string) => {
  let checked = checkTagsRelation.value[aimTag] ?? false;
  if (!checked) {
    checkTagsList.value.push(aimTag);
    checkTagsRelation.value[aimTag] = true;
  } else {
    checkTagsList.value = checkTagsList.value.filter((tag: string) => tag !== aimTag);
    checkTagsRelation.value[aimTag] = false;
  }
  console.log(checkTagsList.value)

  // 设置本地缓存
  localStorage.setItem("checkTagsList", JSON.stringify(checkTagsList.value));
}

// 创建操作
const createProblem = async () => {
  // 保存本地缓存
  localStorage.setItem("ProblemInfo", JSON.stringify(problemInfo.value));
  // 寻找当前所有标签对应的id
  let current_tagsList: number[] = [];
  checkTagsList.value.forEach((tag: string) => {
    AlgorithmTagsRelation.value.map((tag_info: any) => {
      if (tag == tag_info.tag_name) {
        current_tagsList.push(tag_info.tag_id);
      }
    });
  });
  let request: ProblemAlgorithmRequest = problemInfo.value;
  request.cpu_limit = Number(request.cpu_limit);
  request.memory_limit = Number(request.memory_limit);
  request.tags_list = current_tagsList;
  const res = await ProblemAlgorithmControllerService.problemAlgorithmAddUsingPost(request);
  if (res.code === 0){
    ElNotification({
      title: 'Success',
      message: '题目创建成功！！！',
      type: 'success',
    })
  } else {
    ElNotification({
      title: 'Error',
      message: res.message,
      type: 'error',
    })
  }
}

// 保存问题信息
const saveProblem = () => {
  localStorage.setItem("ProblemInfo", JSON.stringify(problemInfo.value))
  ElNotification({
    title: 'Success',
    message: "保存成功！！！",
    type: 'success',
  })
}

// 删除题目
const deleteProblem = () => {
  problemInfo.value = {
    problem_id: 1,
    chinese_name: "A + B",
    difficulty_name: "简单",
    cpu_limit: 1,
    memory_limit: 64,
    source_name: "ByteOJ原创",
    tags_list: ['模拟'],
    description: "#### 题目描述\n" +
        "\n" +
        "现在给定两个整数，需要你求出这两个数的和。\n" +
        "\n" +
        "#### 输入格式\n" +
        "\n" +
        "输入两个整数$A,B$，使用空格隔开来\n" +
        "\n" +
        "#### 输出格式\n" +
        "\n" +
        "输出一个整数$C$，表示两个整数的和。\n" +
        "\n" +
        "#### 数据范围\n" +
        "\n" +
        "$0 \\le A,B \\le 10^9$\n" +
        "\n" +
        "##### 输入格式\n" +
        "\n" +
        "```\n" +
        "2 3\n" +
        "```\n" +
        "\n" +
        "##### 输出格式\n" +
        "\n" +
        "```\n" +
        "5\n" +
        "```\n" +
        "\n",
    create_by_id: userRoute.loginUser.uuid,
    create_by_name: userRoute.loginUser.username
  };
  ElNotification({
    title: 'Success',
    message: "删除成功",
    type: 'success',
  })
}
// 修改题目
const modifyProblem = async () => {
  // 寻找当前所有标签对应的id
  let current_tagsList: number[] = [];
  checkTagsList.value.forEach((tag: string) => {
    AlgorithmTagsRelation.value.map((tag_info: any) => {
      if (tag == tag_info.tag_name) {
        current_tagsList.push(tag_info.tag_id);
      }
    });
  });
  let request: ProblemAlgorithmRequest = problemInfo.value;
  request.cpu_limit = Number(request.cpu_limit);
  request.memory_limit = Number(request.memory_limit);
  request.tags_list = current_tagsList;
  const res = await ProblemAlgorithmControllerService.problemAlgorithmModifyUsingPost(request);
  if (res.code === 0) {
    ElNotification({
      title: 'Success',
      message: "修改成功",
      type: 'success',
    })
  } else {
    ElNotification({
      title: 'Error',
      message: res.message,
      type: 'error',
    })
  }
}
</script>
<template>
  <div style="display: flex;">
    <el-card style="width: 100%; margin: 20px 20px">
      <template #header>
        <div class="card-header">
          <span style="font-size: 20px; font-weight: bold">题目编辑区</span>
        </div>
      </template>
      <template #default>
        <el-form :model="problemInfo" label-width="auto" style="max-width: 400px">
          <el-form-item label="题目ID(选填)">
            <el-input v-model="problemInfo.problem_id" placeholder="填写题目ID"/>
          </el-form-item>
          <el-form-item label="题目名称">
            <el-input v-model="problemInfo.chinese_name" placeholder="填写题目名称"/>
          </el-form-item>
          <el-form-item label="题目难度">
            <el-select v-model="problemInfo.difficulty_name" placeholder="选择题目难度">
              <el-option label="简单" value="简单"/>
              <el-option label="中等" value="中等"/>
              <el-option label="困难" value="困难"/>
            </el-select>
          </el-form-item>
          <el-form-item label="时间限制">
            <el-select v-model="problemInfo.cpu_limit" placeholder="选择时间限制">
              <el-option label="1.0s" value="1"/>
              <el-option label="2.0s" value="2"/>
              <el-option label="3.0s" value="3"/>
              <el-option label="4.0s" value="4"/>
              <el-option label="5.0s" value="5"/>
              <el-option label="6.0s" value="6"/>
              <el-option label="7.0s" value="7"/>
              <el-option label="8.0s" value="8"/>
              <el-option label="9.0s" value="9"/>
              <el-option label="10.0s" value="10"/>
            </el-select>
          </el-form-item>
          <el-form-item label="空间限制">
            <el-select v-model="problemInfo.memory_limit" placeholder="选择空间限制">
              <el-option label="32MB" value="32"/>
              <el-option label="64MB" value="64"/>
              <el-option label="128MB" value="128"/>
              <el-option label="256MB" value="256"/>
              <el-option label="512MB" value="512"/>
              <el-option label="1024MB" value="1024"/>
            </el-select>
          </el-form-item>
          <el-form-item label="来源">
            <el-input v-model="problemInfo.source_name" placeholder="填写题目来源"/>
          </el-form-item>
          <el-form-item @click="centerDialogVisible = true" label="算法标签">
            <el-button v-model="problemInfo.tags_list">选择算法标签</el-button>
          </el-form-item>
          <el-dialog
              v-model="centerDialogVisible"
              title="算法标签"
              width="500"
              destroy-on-close
              center
          >
            <template #default>
              <div style="overflow-wrap: break-word">
                <el-card style="max-width: 480px; margin: 10px 20px" v-for="categories in tagsList">
                  <template #header>
                    <div class="card-header">
                      <div style="font-size: 16px; font-weight: bold">{{ categories.category }}</div>
                    </div>
                  </template>
                  <template #default>
                    <el-check-tag :checked="checkTagsRelation[tag] ?? false" @change="checkTag(tag)"
                                  v-for="tag in categories.tag_list" style="margin: 2px">{{ tag }}
                    </el-check-tag>
                  </template>
                </el-card>
              </div>
            </template>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="centerDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="centerDialogVisible = false">
                  确定
                </el-button>
              </div>
            </template>
          </el-dialog>
        </el-form>
        <el-form-item label="题目描述">
          <el-input
              v-model="problemInfo.description"
              maxlength="10000"
              size="large"
              rows="10"
              placeholder="请输入题目描述"
              show-word-limit
              type="textarea"
          />
        </el-form-item>
      </template>
    </el-card>
    <el-card style="width: 100%; margin: 20px 20px">
      <template #header>
        <div class="card-header">
          <span style="font-size: 20px; font-weight: bold">题目信息展示区</span>
        </div>
      </template>
      <template #default>
        <div style="font-weight: bold; font-size: 30px;min-height: 40px">
          <span>{{ problemInfo.problem_id }}</span>.<span>{{ problemInfo.chinese_name }}</span>
        </div>
        <el-divider>
          <el-icon>
            <star-filled/>
          </el-icon>
        </el-divider>
        <div style="height: 400px; overflow: auto">
          <MarkdownView :generate-data="problemInfo.description"/>
        </div>
      </template>
      <template #footer>
        <div style="float: right; margin: 10px; height: 50px;">
          <el-button @click="deleteProblem" type="danger" size="large" style="font-size: 20px">恢复默认</el-button>
          <el-button v-if="problem_id === 'add'" @click="saveProblem" type="success" size="large" style="font-size: 20px">保存题目</el-button>
          <el-button v-if="problem_id === 'add'" @click="createProblem" type="primary" size="large" style="font-size: 20px">创建题目</el-button>
          <el-button v-else @click="modifyProblem" type="primary" size="large" style="font-size: 20px">修改题目</el-button>
        </div>
      </template>
    </el-card>
  </div>

</template>

<style scoped></style>
