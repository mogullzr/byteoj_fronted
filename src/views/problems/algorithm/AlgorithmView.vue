<template>
  <el-table :data="filterTableData" style="width: 100%">
    <el-table-column label="题目ID" prop="problem_id" sortable width="60" />
    <el-table-column label="题目名称" prop="chinese_name" width="300" />
    <el-table-column
      label="难度"
      prop="difficulty_name"
      column-key="difficulty_name"
      :filters="[
        { text: '简单', value: '简单' },
        { text: '中等', value: '中等' },
        { text: '困难', value: '困难' },
      ]"
      :filter-method="filterHandler"
      v-if="!drawer_list.includes(true)"
    >
      <template #default="scope">
        <el-button
          type="success"
          v-if="scope.row.difficulty_name === '简单'"
          plain
          >简单
        </el-button>
        <el-button
          type="warning"
          v-if="scope.row.difficulty_name === '中等'"
          plain
          >中等
        </el-button>
        <el-button
          type="danger"
          v-if="scope.row.difficulty_name === '困难'"
          plain
          >困难
        </el-button>
      </template>
    </el-table-column>
    <el-table-column
      label="題目来源"
      prop="source"
      v-if="!drawer_list.includes(true)"
    >
      <template #default="scope">
        <el-button type="success" round>{{ scope.row.source }}</el-button>
      </template>
    </el-table-column>
    <el-table-column
      label="算法标签"
      prop="algorithm_tags"
      width="400"
      v-if="!drawer_list.includes(true)"
    >
      <template #default="scope">
        <div>
          <el-button
            color="#626aef"
            size="small"
            v-for="tag in scope.row.algorithm_tags"
            style="margin: 1px"
            >{{ tag }}
          </el-button>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      label="总通过次数"
      prop="ac_total"
      sortable
      width="120"
      v-if="!drawer_list.includes(true)"
    />
    <el-table-column
      label="总尝试次数"
      prop="test_total"
      sortable
      width="120"
      v-if="!drawer_list.includes(true)"
    />
    <el-table-column align="right" width="300">
      <template #header>
        <el-input v-model="search" size="large" placeholder="关键词搜索" />
      </template>
      <template #default="scope">
        <div>
          <el-button @click="RouterToTestCase(scope.row.problem_id)">
            添加数据
          </el-button>
          <el-button
            @click="routerToModify(scope.row.problem_id)"
            style="margin-right: 4px"
          >
            修改题目
          </el-button>
          <el-drawer
            v-model="drawer_list[parseInt(scope.$index)]"
            title="算法试题题目预览"
            size="50%"
            style="text-align: left; z-index: 9999 !important"
          >
            <div>
              <div style="font-size: 36px; padding-bottom: 4px">
                {{ scope.row.problem_id }}.{{ scope.row.chinese_name }}
              </div>
              <MarkdownView :generate-data="scope.row.description" />
            </div>
          </el-drawer>

          <el-button
            type="danger"
            size="default"
            @click="handleDelete(scope.$index, scope.row)"
          >
            删除
          </el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <div class="demo-pagination-block" style="float: right">
    <el-pagination
      v-model:current-page="currentPage"
      page-size="50"
      :page-count="pageSum"
      layout="prev, pager, next, jumper"
      :total="50 * pageSum"
      @current-change="handleCurrentChange"
    />
  </div>
  <el-button class="mt-4" style="width: 100%" @click="onAddItem">
    Add Item
  </el-button>
</template>
<script setup>
import { computed, onMounted, ref } from "vue";
import { ProblemAlgorithmControllerService } from "../../../../generated";
import { ElNotification } from "element-plus";
import MarkdownView from "/src/views/markdown/MarkdownView.vue";
import router from "/src/router/";

const search = ref("");
const drawer_list = ref([false * 50]);
const currentPage = ref(1);
const pageSum = ref(1);
const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.problem_id?.toString().includes(search.value) ||
      data.chinese_name.toLowerCase().includes(search.value.toLowerCase()) ||
      data.difficulty_name?.includes(search.value) ||
      data.source?.includes(search.value) ||
      data.algorithm_tags?.toString().includes(search.value),
  ),
);
const handleDelete = async (index, row) => {
  const res =
    await ProblemAlgorithmControllerService.problemAlgorithmDeleteUsingPost(
      row.problem_id,
    );
  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "题目删除成功",
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

const filterHandler = (value, row, column) => {
  const property = column["property"];
  return row[property] === value;
};
const handleCurrentChange = async (val) => {
  const res =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchByPageUsingPost(
      val,
    );
  if (res.code === 0) {
    tableData.value = res.data;
    currentPage.value = val;
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
      offset: 100,
    });
  }
};
const RouterToTestCase = (problem_id) => {
  console.log(problem_id);
  router.push("/problem/algorithm/list/add/" + problem_id);
};
const tableData = ref([]);

onMounted(async () => {
  const res =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchByPageUsingPost(
      1,
    );
  if (res.code === 0) {
    tableData.value = res.data;
  }

  const response =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchPagSumUsingPost();
  if (response.code === 0) {
    pageSum.value = response.data;
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
      offset: 100,
    });
  }
});

// router 跳转到 修改页面
const routerToModify = (problem_id) => {
  router.push("/problem/algorithm/modify/" + problem_id);
};
</script>
