<template>
  <el-table
      :data="problems_list"
      style="width: 100%"
      ref="tableRef"
  >
    <el-table-column label="题目编号" type="index" width="120" sortable style="text-align: center">
      <template #default="scope">
        <div>{{ scope.row.problem_id }}</div>
      </template>
    </el-table-column>
    <el-table-column label="题目名称" type="index" width="200">
      <template #default="scope">
        <div>{{ scope.row.problem_name}}</div>
      </template>
    </el-table-column>
    <el-table-column label="算法标签" type="index" width="400">
      <template #default="scope">
        <el-button round v-for="tag in scope.row.tagsList" style="font-size: 16px">{{tag}}</el-button>
      </template>
    </el-table-column>
    <el-table-column label="来源" width="150">
      <template #default="scope">
        <el-button type="success">
          {{ scope.row.source_name }}
        </el-button>
      </template>
    </el-table-column>
    <el-table-column label="难度" width="100" sortable>
      <template #default="scope">
        <el-button :type="scope.row.difficulty_name == '简单' ? 'success':scope.row.difficulty_name == '中等' ? 'warning' : 'danger'">
          {{ scope.row.difficulty_name }}
        </el-button>
      </template>
    </el-table-column>
    <el-table-column align="right">
      <template #header>
        <el-input v-model="searchRequest.keyword" size="large" placeholder="搜索关键词" @keyup.enter="searchData"/>
      </template>
      <template #default="scope">
        <el-button
            size="default"
            type="primary"
            style="font-size: 16px"
            @click="routerToProblem(scope.row.problem_id)"
        >
          编辑题目
        </el-button>
        <el-button
            size="default"
            type="danger"
            style="font-size: 16px"
            @click="deleteProblem(scope.row.problem_id)"
        >
          删除(暂时不支持)
        </el-button>
<!--        <el-button-->
<!--            v-else-->
<!--            size="default"-->
<!--            type="success"-->
<!--            style="font-size: 16px"-->
<!--        >-->
<!--          恢复(不支持)-->
<!--        </el-button>-->
      </template>
    </el-table-column>
  </el-table>
  <div class="demo-pagination-block" style="float: right">
    <div class="demonstration"></div>
    <el-pagination
        v-model:current-page="searchRequest.pageNum"
        v-model:page-size="searchRequest.pageSize"
        :background="background"
        layout="prev, pager, next, jumper"
        :total="searchRequest.pageSize * searchRequest.pages"
        @current-change="handleCurrentChange"
    />
  </div>
</template>

<style scoped>
.demo-pagination-block + .demo-pagination-block {
  margin-top: 10px;
}
.demo-pagination-block .demonstration {
  margin-bottom: 16px;
}
</style>
<script lang="ts" setup>
import { onMounted, ref, Ref } from "vue";
import {ComponentSize, ElNotification} from "element-plus";
import UseStore from "../../../store/store.ts";
import {
  ProblemAlgorithmBankVo, ProblemAlgorithmControllerService,
  SearchControllerService,
  SearchRequest,
} from "../../../../generated";
import router from "../../../router";

const problems_list: Ref<ProblemAlgorithmBankVo[]> = ref([]);
const background = ref(false);
const searchRequest:Ref<SearchRequest> = ref({
  category: "other",
  keyword: "",
  pageNum: 1,
  pages: 1,
  pageSize: 20,
}  as SearchRequest);

const searchData = async () => {
  const res = await SearchControllerService.searchAllUsingPost(searchRequest.value);
  if (res.code === 0) {
    problems_list.value = res.data.dataList;
    searchRequest.value.pages = problems_list.value[0].pages;
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
    });
  }
}

const handleCurrentChange = async (val: number) => {
  searchRequest.value.pageNum = val;
  await searchData();
};

onMounted(async () => {
  await searchData();
});

// 跳转到编辑页面
const routerToProblem = (problem_id: number) => {
  router.push("/problem/math408/" + problem_id);
}

// 删除题目
const deleteProblem = async (problem_id:number) => {
  console.log(problem_id)
}
</script>
