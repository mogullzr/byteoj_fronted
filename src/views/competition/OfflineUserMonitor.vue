<template>
  <el-card class="offline-monitor">
    <template #header>
      <div class="card-header">
        <span>掉线与异常用户监控</span>
      </div>
    </template>

    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" @submit.prevent="handleSearch">
      <el-form-item label="用户名">
        <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="客户端ID">
        <el-input v-model="searchForm.clientId" placeholder="请输入客户端ID" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 140px">
          <el-option :value="0" label="已注册" />
          <el-option :value="1" label="在线" />
          <el-option :value="2" label="掉线" />
          <el-option :value="3" label="未登记上线" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%; margin-top: 16px"
        row-key="client_id"
    >
      <el-table-column prop="username" label="用户名" width="200" />
      <el-table-column prop="client_id" label="客户端ID" width="180" />
      <el-table-column prop="update_time" label="最后更新时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.update_time) }}
        </template>
      </el-table-column>
      <el-table-column label="当前状态" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.status === 2" type="danger">掉线</el-tag>
          <el-tag v-else-if="row.status === 3" type="warning">未登记上线</el-tag>
          <el-tag v-else-if="row.status === 1" type="success">在线</el-tag>
          <el-tag v-else-if="row.status === 0">已注册</el-tag>
          <el-tag v-else>未知({{ row.status }})</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
        v-if="total > 0"
        layout="prev, pager, next, total"
        :current-page="searchForm.pageNum"
        :page-size="10"
        :total="total"
        @current-change="handlePageChange"
        style="margin-top: 16px; justify-content: flex-end; display: flex"
    />
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import dayjs from 'dayjs';
import { HeartbeatControllerService } from "../../../generated/services/HeartbeatControllerService.ts";

// 定义状态类型（可选但推荐）
type UserStatus = 0 | 1 | 2 | 3;

// 搜索表单（新增 status 字段）
const searchForm = reactive({
  username: '',
  clientId: '',
  status: undefined as number | undefined, // 可为 0,1,2,3 或 undefined（未选择）
  pageNum: 1,
});

const tableData = ref<Array<any>>([]);
const total = ref(0);
const loading = ref(false);

// 格式化时间
const formatTime = (timeStr: string): string => {
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm:ss');
};

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await HeartbeatControllerService.monitorUserListVoUsingGet(
        searchForm.pageNum,
        searchForm.clientId || undefined,
        searchForm.username || undefined,
        searchForm.status // 👈 新增：传入 status 参数
    );

    if (res.code === 0 && Array.isArray(res.data)) {
      tableData.value = res.data;
      total.value = res.data[0]?.pages * 10
    } else {
      tableData.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取用户状态失败:', error);
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  searchForm.pageNum = 1;
  fetchData();
};

const handleReset = () => {
  searchForm.username = '';
  searchForm.clientId = '';
  searchForm.status = undefined; // 重置状态
  searchForm.pageNum = 1;
  fetchData();
};

const handlePageChange = (page: number) => {
  searchForm.pageNum = page;
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.offline-monitor {
  margin: 20px;
}
.card-header {
  font-size: 18px;
  font-weight: bold;
}
</style>