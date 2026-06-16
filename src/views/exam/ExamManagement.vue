<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElNotification } from "element-plus";
import { SearchControllerService } from "../../../generated";

const router = useRouter();

const loading = ref(false);
const examList = ref<any[]>([]);
const searchRequest = ref<any>({
  category: "exam",
  keyword: "",
  pageNum: 1,
  pageSize: 10,
});

const pagerTotal = computed(() => {
  const base = (searchRequest.value.pageNum - 1) * searchRequest.value.pageSize;
  return examList.value.length >= searchRequest.value.pageSize
    ? base + searchRequest.value.pageSize + 1
    : base + examList.value.length;
});

const searchExams = async () => {
  loading.value = true;
  try {
    const res = await SearchControllerService.searchAllUsingPost(searchRequest.value);
    if (res.code === 0) {
      examList.value = res.data?.dataList || res.data?.problemExamVoList || [];
    } else {
      ElNotification.error({ title: "查询失败", message: res.message || "考试查询失败" });
    }
  } catch (err) {
    console.error(err);
    ElNotification.error({ title: "查询失败", message: "考试查询失败，请稍后重试" });
  } finally {
    loading.value = false;
  }
};

const resetSearch = async () => {
  searchRequest.value.keyword = "";
  searchRequest.value.pageNum = 1;
  await searchExams();
};

const changePage = async (page: number) => {
  searchRequest.value.pageNum = page;
  await searchExams();
};

const changePageSize = async (size: number) => {
  searchRequest.value.pageSize = size;
  searchRequest.value.pageNum = 1;
  await searchExams();
};

const editExam = (exam: any) => {
  router.push({
    path: "/exam/add",
    query: { exam_id: exam.exam_id },
  });
};

const createExam = () => {
  router.push("/exam/add");
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
};

const statusText = (status?: number) => {
  if (status === 0) return "自由考试";
  if (status === 1) return "监控考试";
  if (status === 2) return "自由练习";
  return "未知";
};

const statusTag = (status?: number) => {
  if (status === 0) return "success";
  if (status === 1) return "warning";
  if (status === 2) return "info";
  return "";
};

onMounted(searchExams);
</script>

<template>
  <div class="exam-management">
    <div class="page-header">
      <div class="page-title">
        <div class="eyebrow">考试管理</div>
        <h2>考试列表</h2>
        <p>使用考试搜索接口分页查询；编辑会进入和创建共用的表单页。</p>
      </div>
      <el-button type="primary" @click="createExam">创建考试</el-button>
    </div>

    <el-card shadow="never" class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">全部考试</div>
          <div class="panel-desc">按考试名称或考试 ID 搜索。</div>
        </div>
        <div class="toolbar">
          <el-input
            v-model="searchRequest.keyword"
            placeholder="搜索考试名称或考试 ID"
            clearable
            @keyup.enter="changePage(1)"
          />
          <el-button type="primary" @click="changePage(1)">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>

      <el-table :data="examList" v-loading="loading" class="data-table" border>
        <el-table-column label="ID" prop="exam_id" width="90" />
        <el-table-column label="考试名称" min-width="220">
          <template #default="scope">
            <div class="exam-name">{{ scope.row.exam_name || "未命名考试" }}</div>
            <div class="exam-meta">创建者：{{ scope.row.author || "未知" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="封面" width="120">
          <template #default="scope">
            <el-image
              v-if="scope.row.picture"
              :src="scope.row.picture"
              fit="cover"
              class="cover"
              :preview-src-list="[scope.row.picture]"
              preview-teleported
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag :type="statusTag(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="参与人数" prop="joins" width="100" />
        <el-table-column label="页数" prop="pages" width="90" />
        <el-table-column label="时长" width="100">
          <template #default="scope">
            {{ scope.row.time ? scope.row.time + " 分钟" : "不限时" }}
          </template>
        </el-table-column>
        <el-table-column label="开始时间" min-width="170">
          <template #default="scope">{{ formatDate(scope.row.start_time) }}</template>
        </el-table-column>
        <el-table-column label="结束时间" min-width="170">
          <template #default="scope">{{ formatDate(scope.row.end_time) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="editExam(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          v-model:current-page="searchRequest.pageNum"
          v-model:page-size="searchRequest.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagerTotal"
          layout="total, sizes, prev, pager, next"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.exam-management {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 24px;
  background: #f5f7fa;
  color: #1f2937;
}

.exam-management :deep(.el-card) {
  border: 1px solid #e5e7eb;
}

.exam-management :deep(.el-card__body) {
  padding: 18px;
}

.exam-management :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #d7dde6 inset;
}

.exam-management :deep(.el-table th.el-table__cell) {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
}

.exam-management :deep(.el-table td.el-table__cell) {
  color: #334155;
}

.exam-management :deep(.el-button--primary) {
  background: #1f2937;
  border-color: #1f2937;
}

.exam-management :deep(.el-button--primary:hover) {
  background: #111827;
  border-color: #111827;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  padding: 18px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
}

.page-title {
  min-width: 0;
}

.eyebrow {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 4px;
  background: #1f2937;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.page-header h2 {
  margin: 10px 0 4px;
  color: #111827;
  font-size: 24px;
  line-height: 1.2;
}

.page-header p,
.exam-meta,
.panel-desc {
  color: #64748b;
}

.panel {
  border-radius: 12px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.toolbar {
  display: grid;
  grid-template-columns: minmax(260px, 420px) auto auto;
  gap: 10px;
  align-items: center;
}

.exam-name {
  font-weight: 700;
  color: #111827;
}

.cover {
  width: 72px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.data-table {
  border-radius: 8px;
  overflow: hidden;
}

@media (max-width: 980px) {
  .page-header,
  .panel-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .toolbar {
    width: 100%;
    grid-template-columns: 1fr;
  }
}
</style>
