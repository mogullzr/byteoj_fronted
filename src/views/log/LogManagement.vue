<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { Document, Warning, Loading } from '@element-plus/icons-vue';
import {SearchControllerService} from "../../../generated";
import {ElMessage} from "element-plus";

// 添加加载状态变量
const isLoading = ref(false);

// 保持原有数据结构完全不变
const statisticsData = reactive({
  dailyUsers: 0,
  weeklyUsers: 0,
  monthlyUsers: 0,
  totalLogs: 0,
  operationLogs: 0,
  exceptionLogs: 0
});

const activeTab = ref('operation');
const operationLogs = ref([]);
const exceptionLogs = ref([]);

// 保持原有分页参数不变
const operationPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

const exceptionPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 保持原有日期范围字段不变
const dateRange = ref([]);

// 新增搜索参数（不覆盖原有字段）
const searchUsername = ref('');
const searchKeyword = ref('');
const searchModule = ref('');
const searchStatusCode = ref('');
const searchMethod = ref('');

// 模块选项（固定值）
const moduleOptions = [
  '用户模块', '聚合搜索模块', '题目模块', '帖子模块',
  'AI模块', '课程模块', '竞赛模块', '聊天室模块',
  'RSA模块', '日志模块'
];

// 状态码选项（固定值）
const statusCodeOptions = [
  { value: '0', label: '成功' },
  { value: '40000', label: '请求参数错误' },
  { value: '40100', label: '未登录' },
  { value: '40101', label: '无权限' },
  { value: '40400', label: '请求数据不存在' },
  { value: '40300', label: '禁止访问' },
  { value: '50000', label: '系统错误' },
  { value: '50001', label: '操作失败' }
];

// 请求方法选项
const methodOptions = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

// 保持原有日期格式化函数不变
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-');
};

// 获取日志数据（添加加载状态控制）
const fetchLogs = async () => {
  isLoading.value = true;
  try {
    const searchRequest = {
      category: "log",
      code: searchStatusCode.value ? [searchStatusCode.value] : [],
      current: activeTab.value === 'operation' ? operationPagination.currentPage - 1 : exceptionPagination.currentPage - 1,
      difficulty: searchUsername.value,
      is_date_order: 0,
      keyword: searchKeyword.value,
      module: searchModule.value,
      pageNum: activeTab.value === 'operation' ? operationPagination.currentPage : exceptionPagination.currentPage,
      pageSize: activeTab.value === 'operation' ? operationPagination.pageSize : exceptionPagination.pageSize,
      pages: 0,
      size: 0,
      sourceList: [],
      status: activeTab.value === 'operation' ? 1 : 2, // 操作日志status=1，异常日志status=2
      tagsList: [],
      type: searchMethod.value ? [searchMethod.value] : [],
      startMilliSeconds: dateRange.value && dateRange.value[0] ? Math.floor(new Date(dateRange.value[0]).getTime() / 1000) : '',
      endMilliSeconds: dateRange.value && dateRange.value[1] ? Math.floor(new Date(dateRange.value[1] + ' 23:59:59').getTime() / 1000) : ''
    };

    const res = await SearchControllerService.searchAllUsingPost(searchRequest);
    if (res.code === 0 && res.data && res.data.dataList) {
      const processLog = (log) => ({
        log_id: log.log_id,
        username: log.username,
        operation: log.description,
        ip: log.ip,
        status: log.code === 0 ? '200' : log.code,
        time: formatDate(log.create_time),
        module: log.module,
        url: log.url,
        type: log.type,
        operation_time: log.operation_time,
        params: log.params,
        error: log.error
      });

      if (activeTab.value === 'operation') {
        operationLogs.value = res.data.dataList.map(processLog);
        operationPagination.total = res.data.dataList[0]?.total || 0;
        statisticsData.operationLogs = res.data.dataList[0]?.total || 0;
      } else {
        exceptionLogs.value = res.data.dataList.map(processLog);
        exceptionPagination.total = res.data.dataList[0]?.total || 0;
        statisticsData.exceptionLogs = res.data.dataList[0]?.total || 0;
      }
      statisticsData.totalLogs = (statisticsData.operationLogs + statisticsData.exceptionLogs) || 0;
    }
  } catch (error) {
    console.error('加载日志失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  if (activeTab.value === 'operation') {
    operationPagination.currentPage = 1;
  } else {
    exceptionPagination.currentPage = 1;
  }
  fetchLogs();
};

// 重置搜索
const handleReset = () => {
  searchKeyword.value = '';
  searchModule.value = '';
  searchStatusCode.value = '';
  searchMethod.value = '';
  searchUsername.value = '';
  dateRange.value = [];
  handleSearch();
};

// 分页变化处理
const handlePageChange = () => {
  fetchLogs();
};

// 标签页切换处理
const handleTabChange = () => {
  handleSearch();
};

onMounted(() => {
  fetchLogs();
});
</script>

<template>
  <div class="log-management">
    <div class="page-header">
      <h1>日志管理系统</h1>
    </div>

    <!-- 保持原有统计卡片不变 -->
    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="8">
        <el-card>
          <div class="statistic-item">
            <div class="statistic-icon blue">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="statistic-info">
              <div class="statistic-title">今日访问用户</div>
              <div class="statistic-value">{{ statisticsData.dailyUsers }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div class="statistic-item">
            <div class="statistic-icon green">
              <el-icon><Document /></el-icon>
            </div>
            <div class="statistic-info">
              <div class="statistic-title">操作日志数</div>
              <div class="statistic-value">{{ statisticsData.operationLogs }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div class="statistic-item">
            <div class="statistic-icon red">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="statistic-info">
              <div class="statistic-title">异常日志数</div>
              <div class="statistic-value">{{ statisticsData.exceptionLogs }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 日志标签页 -->
    <el-card style="margin-top: 20px;">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="操作日志" name="operation">
          <div class="log-search-bar">
            <el-form :inline="true" class="search-form">
              <el-form-item label="日志关键词" style="width: 220px">
                <el-input
                    v-model="searchKeyword"
                    placeholder="可匹配详细信息"
                    clearable
                    @keyup.enter="handleSearch"
                />
              </el-form-item>
              <el-form-item label="用户名">
                <el-input
                    v-model="searchUsername"
                    placeholder="可搜索用户名"
                    clearable
                    @keyup.enter="handleSearch"
                />
              </el-form-item>
              <el-form-item label="模块" style="width: 200px;">
                <el-select
                    v-model="searchModule"
                    placeholder="选择模块"
                    clearable
                    style="width: 100%"
                >
                  <el-option
                      v-for="item in moduleOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="状态码" style="width: 200px;">
                <el-select
                    v-model="searchStatusCode"
                    placeholder="选择状态码"
                    clearable
                    style="width: 100%"
                >
                  <el-option
                      v-for="item in statusCodeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="请求方法" style="width: 240px;">
                <el-select
                    v-model="searchMethod"
                    placeholder="选择请求方法"
                    clearable
                    style="width: 100%"
                >
                  <el-option
                      v-for="item in methodOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="日期范围">
                <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="table-container">
            <el-table
                :data="operationLogs"
                border
                stripe
                style="width: 100%; margin-top: 15px;"
                height="calc(100vh - 400px)"
                v-loading="isLoading"
                element-loading-text="数据加载中..."
                element-loading-background="rgba(255, 255, 255, 0.7)"
                element-loading-spinner="el-icon-loading"
            >
              <!-- 保持原有表格列不变 -->
              <el-table-column prop="log_id" label="日志ID" width="100" />
              <el-table-column prop="username" label="用户名" width="120" />
              <el-table-column prop="module" label="模块" width="120" />
              <el-table-column prop="operation" label="操作描述" min-width="200" />
              <el-table-column prop="url" label="请求路径" min-width="180" show-overflow-tooltip />
              <el-table-column prop="type" label="请求类型" width="100" />
              <el-table-column prop="ip" label="IP地址" width="150" />
              <el-table-column prop="status" label="状态" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.status === '200' ? 'success' : 'danger'">
                    {{ scope.row.status === '200' || scope.row.status === '20000' ? '20000' : scope.row.status + '报错' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="time" label="操作时间" width="180" />
              <el-table-column prop="operation_time" label="耗时(ms)" width="100" />
              <el-table-column label="操作" width="300">
                <template #default="scope">
                  <el-button type="primary" size="small" text @click="$emit('view-detail', { type: 'operation', id: scope.row.log_id })">详情</el-button>
                  <el-button type="danger" size="small" text>删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-pagination
              v-model:current-page="operationPagination.currentPage"
              v-model:page-size="operationPagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="operationPagination.total"
              @current-change="handlePageChange"
              @size-change="handlePageChange"
              style="margin-top: 15px; justify-content: flex-end;"
              :disabled="isLoading"
          />
        </el-tab-pane>

        <el-tab-pane label="异常日志" name="exception">
          <div class="log-search-bar">
            <el-form :inline="true" class="search-form">
              <el-form-item label="日志关键词">
                <el-input
                    v-model="searchKeyword"
                    placeholder="可搜索请求参数和报错信息"
                    clearable
                    @keyup.enter="handleSearch"
                />
              </el-form-item>
              <el-form-item label="用户名">
                <el-input
                    v-model="searchUsername"
                    placeholder="可搜索用户名"
                    clearable
                    @keyup.enter="handleSearch"
                />
              </el-form-item>
              <el-form-item label="模块" style="width: 200px;">
                <el-select
                    v-model="searchModule"
                    placeholder="选择模块"
                    clearable
                    style="width: 100%"
                >
                  <el-option
                      v-for="item in moduleOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="状态码" style="width: 200px;">
                <el-select
                    v-model="searchStatusCode"
                    placeholder="选择状态码"
                    clearable
                    style="width: 100%"
                >
                  <el-option
                      v-for="item in statusCodeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="请求方法" style="width: 240px;">
                <el-select
                    v-model="searchMethod"
                    placeholder="选择请求方法"
                    clearable
                    style="width: 100%"
                >
                  <el-option
                      v-for="item in methodOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="日期范围">
                <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="table-container">
            <el-table
                :data="exceptionLogs"
                border
                stripe
                style="width: 100%;"
                height="calc(100vh - 400px)"
                v-loading="isLoading"
                element-loading-text="数据加载中..."
                element-loading-background="rgba(255, 255, 255, 0.7)"
                element-loading-spinner="el-icon-loading"
            >
              <!-- 保持原有表格列不变 -->
              <el-table-column prop="log_id" label="日志ID" width="100" />
              <el-table-column prop="username" label="用户名" width="120" />
              <el-table-column prop="module" label="模块" width="120" />
              <el-table-column prop="url" label="请求路径" min-width="180" show-overflow-tooltip />
              <el-table-column prop="type" label="请求类型" width="100" />
              <el-table-column prop="ip" label="IP地址" width="150" />
              <el-table-column prop="status" label="状态码" width="120">
                <template #default="scope">
                  <el-tag type="danger">
                    {{ scope.row.status + "报错" }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="time" label="发生时间" width="180" />
              <el-table-column label="操作" width="300">
                <template #default="scope">
                  <el-button type="primary" size="small" text @click="$emit('view-detail', { type: 'exception', id: scope.row.log_id })">详情</el-button>
                  <el-button type="success" size="small" text>标记为已处理</el-button>
                  <el-button type="danger" size="small" text>删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-pagination
              v-model:current-page="exceptionPagination.currentPage"
              v-model:page-size="exceptionPagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="exceptionPagination.total"
              @current-change="handlePageChange"
              @size-change="handlePageChange"
              style="margin-top: 15px; justify-content: flex-end;"
              :disabled="isLoading"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
/* 保持原有样式不变 */
.log-management {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 48px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, #409EFF 0%, #67C23A 50%, rgba(255, 255, 255, 0) 100%);
}

h1 {
  margin: 0;
  font-size: 26px;
  font-weight: bold;
  color: #303133;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.statistics-cards {
  margin-bottom: 24px;
}

.el-card {
  transition: all 0.3s ease;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.el-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.1);
}

.statistic-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.statistic-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.statistic-icon:hover {
  transform: scale(1.05);
}

.statistic-icon .el-icon {
  font-size: 28px;
  color: #fff;
}

.blue {
  background: linear-gradient(135deg, #409EFF 0%, #2980b9 100%);
}

.green {
  background: linear-gradient(135deg, #67C23A 0%, #27ae60 100%);
}

.red {
  background: linear-gradient(135deg, #F56C6C 0%, #e74c3c 100%);
}

.statistic-info {
  flex: 1;
}

.statistic-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 6px;
}

.statistic-value {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(90deg, #303133, #606266);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.log-search-bar {
  margin-bottom: 18px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-form .el-form-item {
  margin-bottom: 0;
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.el-table th {
  background-color: #f5f7fa !important;
  color: #606266;
  font-weight: bold;
}

.el-table tr {
  transition: all 0.2s ease;
}

.el-table tr:hover {
  background-color: #ecf5ff;
}

.el-pagination {
  margin-top: 20px;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.el-tag {
  border-radius: 4px;
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
  font-weight: bold;
}

.el-button {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.el-button--text {
  padding: 4px 8px;
}

.el-button--text:hover {
  background-color: rgba(64, 158, 255, 0.1);
  border-radius: 4px;
}

/* 新增样式 */
.table-container {
  position: relative;
  min-height: 200px;
}

/* 加载状态下的分页样式 */
.el-pagination.is-disabled {
  opacity: 0.7;
}
</style>