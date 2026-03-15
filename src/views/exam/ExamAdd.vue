<script setup lang="ts">
import {ref, computed, onMounted, Ref} from "vue"
import {ElNotification} from "element-plus"
import {
  SearchControllerService
} from "../../../generated"
import {ProblemsControllerService} from "../../../generated/services/ProblemsControllerService.ts";
import MarkdownView from "../components/MarkdownView.vue";

const defaultPicture =
    "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20260315195824468.png"

/**
 * 创建考试请求
 */
const request = ref({
  exam_id: null,
  exam_name: "",
  password: "",
  picture: defaultPicture,
  start_date: 0,
  end_date: 0,
  status: 0,
  time: 0,
  problemExamProblemInfos: []
})

/**
 * 时间范围
 */
const timeRange = ref([])

/**
 * 当前题库类型
 */
const activeTab = ref("math")

/**
 * 题库列表
 */
const problems_list = ref([])

/**
 * 搜索参数
 */
const searchRequest: Ref<any> = ref({
  category: "other",
  keyword: "",
  pageNum: 66,
  status: 0,
  pages: 1,
  pageSize: 50,
})

/**
 * 预览弹窗
 */
const previewDialog = ref(false)

/**
 * 当前预览题目
 */
const previewProblem = ref<any>({})

/**
 * 查询题库
 */
const searchProblems = async () => {

  const res = await SearchControllerService.searchAllUsingPost(searchRequest.value)

  if (res.code === 0) {
    problems_list.value = res.data.dataList
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message
    })
  }
}

/**
 * tab切换
 */
const changeTab = async (name: string) => {

  if (name === "algorithm") {
    searchRequest.value.category = "algorithm"
    searchRequest.value.status = 3
  } else {
    searchRequest.value.category = "other"

    if (name == "math") {
      searchRequest.value.status = 0
    } else if (name == "408") {
      searchRequest.value.status = 1
    } else if (name == "politics") {
      searchRequest.value.status = 2
    }
  }

  await searchProblems()
}

/**
 * 添加题目
 */
const addProblem = (problem: any) => {

  let status = 3

  if (activeTab.value === "math") status = 0
  if (activeTab.value === "408") status = 1
  if (activeTab.value === "politics") status = 2

  const exist = request.value.problemExamProblemInfos.find(
      (item: any) => item.problem_id === problem.problem_id
  )

  if (exist) {
    ElNotification.warning({
      title: "提示",
      message: "该题目已经添加"
    })
    return
  }

  request.value.problemExamProblemInfos.push({
    problem_id: problem.problem_id,
    score: 5,
    status: status
  })
}

/**
 * 删除题目
 */
const removeProblem = (index: number) => {
  request.value.problemExamProblemInfos.splice(index, 1)
}

/**
 * 总分统计
 */
const totalScore = computed(() =>
    request.value.problemExamProblemInfos.reduce((sum, i) => sum + i.score, 0)
)

/**
 * 创建考试
 */
const submitExam = async () => {

  if (!timeRange.value) {
    ElNotification.error({
      title: "Error",
      message: "请选择考试时间"
    })
    return
  }

  request.value.start_date = new Date(timeRange.value[0]).getTime()
  request.value.end_date = new Date(timeRange.value[1]).getTime()

  const res = await ProblemsControllerService.problemExamEditUsingPost(request.value)

  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "考试创建成功"
    })
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message
    })
  }
}

/**
 * 预览题目
 */
const previewProblemDetail = (problem: any) => {
  previewProblem.value = problem
  previewDialog.value = true
}

onMounted(async () => {
  await searchProblems()
})

</script>

<template>

  <el-card shadow="hover">

    <h2>创建考试</h2>

    <el-form label-width="120px">

      <el-form-item label="考试名称">
        <el-input v-model="request.exam_name"/>
      </el-form-item>

      <el-form-item label="考试密码">
        <el-input v-model="request.password"/>
      </el-form-item>

      <el-form-item label="考试时间">

        <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
        />

      </el-form-item>

    </el-form>

  </el-card>

  <el-divider/>

  <!-- 题库 -->
  <el-card shadow="hover">

    <h3>题库</h3>

    <el-tabs
        v-model="activeTab"
        @tab-change="changeTab">

      <el-tab-pane label="算法题" name="algorithm"/>
      <el-tab-pane label="数学" name="math"/>
      <el-tab-pane label="408" name="408"/>
      <el-tab-pane label="政治" name="politics"/>

    </el-tabs>

    <el-input
        v-model="searchRequest.keyword"
        placeholder="搜索题目"
        style="width:300px;margin-bottom:15px"
        @keyup.enter="searchProblems"
    />

    <!-- 算法题 -->
    <el-table :data="problems_list" v-if="searchRequest.category == 'algorithm'">

      <el-table-column label="题号" width="120">
        <template #default="scope">
          {{ scope.row.problem_id }}
        </template>
      </el-table-column>

      <el-table-column label="题目">
        <template #default="scope">
          {{ scope.row.chinese_name }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200">

        <template #default="scope">

          <el-button
              type="primary"
              @click="addProblem(scope.row)">
            添加
          </el-button>

          <el-button
              type="success"
              @click="previewProblemDetail(scope.row)">
            预览
          </el-button>

        </template>

      </el-table-column>

    </el-table>

    <!-- 数学/408/政治 -->
    <el-table :data="problems_list" v-else>

      <el-table-column label="题号" width="120">
        <template #default="scope">
          {{ scope.row.problem_id }}
        </template>
      </el-table-column>

      <el-table-column label="题目">
        <template #default="scope">
          {{ scope.row.problem_name }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200">

        <template #default="scope">

          <el-button
              type="primary"
              @click="addProblem(scope.row)">
            添加
          </el-button>

          <el-button
              type="success"
              @click="previewProblemDetail(scope.row)">
            预览
          </el-button>

        </template>

      </el-table-column>

    </el-table>

  </el-card>

  <el-divider/>

  <!-- 已选题目 -->
  <el-card shadow="hover">

    <h3>已选题目</h3>

    <div style="margin-bottom:10px">
      题目数量：{{request.problemExamProblemInfos.length}}
      &nbsp;&nbsp;
      总分：{{totalScore}}
    </div>

    <el-table :data="request.problemExamProblemInfos">

      <el-table-column label="题目ID" width="120">
        <template #default="scope">
          {{ scope.row.problem_id }}
        </template>
      </el-table-column>

      <el-table-column label="类型" width="120">

        <template #default="scope">

          <el-tag v-if="scope.row.status===3">算法</el-tag>
          <el-tag type="success" v-if="scope.row.status===0">数学</el-tag>
          <el-tag type="warning" v-if="scope.row.status===1">408</el-tag>
          <el-tag type="danger" v-if="scope.row.status===2">政治</el-tag>

        </template>

      </el-table-column>

      <el-table-column label="分值">

        <template #default="scope">

          <el-input-number
              v-model="scope.row.score"
              :min="1"
          />

        </template>

      </el-table-column>

      <el-table-column label="操作" width="120">

        <template #default="scope">

          <el-button
              type="danger"
              @click="removeProblem(scope.$index)">
            删除
          </el-button>

        </template>

      </el-table-column>

    </el-table>

  </el-card>

  <div style="text-align:center;margin-top:30px">

    <el-button
        type="primary"
        size="large"
        @click="submitExam">
      创建考试
    </el-button>

  </div>

  <!-- 题目预览弹窗 -->
  <el-dialog
      v-model="previewDialog"
      title="题目预览"
      width="800px">

    <div style="font-size:16px">

      <h3>
        {{ previewProblem.chinese_name || previewProblem.problem_name }}
      </h3>

      <el-divider/>

      <MarkdownView v-if="previewProblem.description" :generate-data="previewProblem.description"/>

      <div v-else style="color:gray">
        暂无题目描述
      </div>

    </div>

  </el-dialog>

</template>

<style scoped>

h2{
  margin-bottom:20px;
}

h3{
  margin-bottom:15px;
}

</style>