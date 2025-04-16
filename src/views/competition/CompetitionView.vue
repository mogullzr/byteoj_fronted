<template>
  <el-table
      :data="competitions"
      style="width: 100%"
      ref="tableRef"
  >
    <el-table-column label="竞赛编号" type="index" width="120" sortable>
      <template #default="scope">
        <div>{{ scope.row.competition_id}}</div>
      </template>
    </el-table-column>
    <el-table-column label="竞赛名称" type="index" width="200">
      <template #default="scope">
        <div>{{ scope.row.competition_name}}</div>
      </template>
    </el-table-column>
    <el-table-column label="竞赛图片" type="index" width="150">
      <template #default="scope">
        <div class="block">
          <el-image :src="scope.row.avatar" style="width: 50px; height: 50px">
            <template #placeholder>
              <div class="image-slot">Loading<span class="dot">...</span></div>
            </template>
          </el-image>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="开始时间" width="200">
      <template #default="scope">
        <el-button type="primary">
          {{ dayjs(scope.row.start_time).format('YYYY-MM-DD HH:mm:ss') }}
        </el-button>
      </template>
    </el-table-column>
    <el-table-column label="结束时间" width="200">
      <template #default="scope">
        <el-button type="danger">
          {{ dayjs(scope.row.end_time).format('YYYY-MM-DD HH:mm:ss') }}
        </el-button>
      </template>
    </el-table-column>
    <el-table-column label="创建者" type="index" width="100">
      <template #default="scope">
        <el-text size="large">{{ scope.row.username }}</el-text>
      </template>
    </el-table-column>
    <el-table-column label="参加" width="100" sortable>
      <template #default="scope">
        <el-button type="text" style="font-size: 18px" size="large">{{ scope.row.joins }}</el-button>
      </template>
    </el-table-column>
    <el-table-column label="比赛赛制" type="index" width="130">
      <template #default="scope">
        <el-button type="text" style="color: #5c74a2;font-size: 18px; font-weight: bold;" size="large">{{ scope.row.pattern == 0 ? 'ACM赛制' : (scope.row.pattern == 1 ? 'IO赛制' : 'IOI赛制') }}</el-button>
      </template>
    </el-table-column>
    <el-table-column align="right">
<!--      <template #header>-->
<!--        <el-input v-model="searchRequest.keyword" size="large" placeholder="搜索关键词" @keyup.enter="searchData"/>-->
<!--      </template>-->
      <template #default="scope">
        <el-button
            size="default"
            type="primary"
            style="font-size: 16px"
            @click=""
        >
          竞赛信息编辑
        </el-button>
        <el-button
            v-if="scope.row.is_delete === 0"
            size="default"
            type="danger"
            style="font-size: 16px"
            @click="deleteCompetition(scope.row.competition_id)"
        >
          删除(可支持)
        </el-button>
        <el-button
            v-else
            size="default"
            type="success"
            style="font-size: 16px"
            @click="deleteCompetition(scope.row.competition_id)"
        >
          恢复(可支持)
        </el-button>
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
import {ElNotification} from "element-plus";
import {
  CompetitionControllerService, CompetitionInfoVo,
} from "../../../generated";
import router from "../../router";
import dayjs from "dayjs";

const competitions: Ref<CompetitionInfoVo[]> = ref([]);
const background = ref(false);
const searchRequest:Ref<any> = ref({
  pageNum: 1,
  pages: 0,
  pageSize: 15
}  as any);

const searchData = async () => {
  const res = await CompetitionControllerService.competitionSearchByPageUsingPost(searchRequest.value.pageNum);
  if (res.code === 0) {
    competitions.value = res.data;
    searchRequest.value.pages = competitions.value[0].page_Sum;
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
  console.log(searchRequest.value)
});


// 删除题目
const deleteCompetition = async (competition_id:number) => {
  const res = await CompetitionControllerService.competitionDeleteByAdminUsingPost(competition_id);
  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "删除成功",
    });
    setTimeout(()=>{
      window.location.reload();
    }, 1500);
  }
}

</script>
