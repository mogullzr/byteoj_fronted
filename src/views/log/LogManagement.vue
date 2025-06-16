<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
// @ts-ignore
import * as echarts from 'echarts';
import { Calendar, Document, Warning, DataAnalysis } from '@element-plus/icons-vue';

// Mock data for statistics
const statisticsData = reactive({
  dailyUsers: 245,
  weeklyUsers: 1678,
  monthlyUsers: 4526,
  totalLogs: 18745,
  operationLogs: 15621,
  exceptionLogs: 3124
});

// Tab handling
const activeTab = ref('operation');

// Mock data for logs
const operationLogs = ref([
  { id: 1, username: '管理员', operation: '登录系统', ip: '192.168.1.1', status: '成功', time: '2023-06-15 09:30:25' },
  { id: 2, username: '张三', operation: '添加用户', ip: '192.168.1.15', status: '成功', time: '2023-06-15 10:12:36' },
  { id: 3, username: '李四', operation: '删除题目', ip: '192.168.1.23', status: '成功', time: '2023-06-15 11:05:47' },
  { id: 4, username: '王五', operation: '更新配置', ip: '192.168.1.45', status: '失败', time: '2023-06-15 13:24:11' },
  { id: 5, username: '赵六', operation: '导出数据', ip: '192.168.1.78', status: '成功', time: '2023-06-15 14:36:29' },
  { id: 6, username: '管理员', operation: '重启服务', ip: '192.168.1.1', status: '成功', time: '2023-06-15 16:42:53' },
]);

const exceptionLogs = ref([
  { id: 1, type: '系统错误', description: '数据库连接失败', stacktrace: 'Error: Connection refused at line 42', status: '未处理', time: '2023-06-15 08:13:27' },
  { id: 2, type: '应用错误', description: '空指针异常', stacktrace: 'NullPointerException at line 156', status: '已处理', time: '2023-06-15 09:45:38' },
  { id: 3, type: '网络错误', description: 'API请求超时', stacktrace: 'Timeout after 30000ms at line 89', status: '未处理', time: '2023-06-15 12:21:05' },
  { id: 4, type: '权限错误', description: '无权访问资源', stacktrace: 'Forbidden error at line 237', status: '已处理', time: '2023-06-15 15:17:42' },
]);

// Pagination
const operationPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 248
});

const exceptionPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 76
});

// Date range
const dateRange = ref([]);

// Search
const searchOperation = ref('');
const searchException = ref('');

// Initialize charts
const initCharts = () => {
  // Daily users chart
  const dailyChart = echarts.init(document.getElementById('dailyUsersChart'));
  const dailyOption = {
    title: { text: '近7天用户访问量' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['6月9日', '6月10日', '6月11日', '6月12日', '6月13日', '6月14日', '6月15日']
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: [220, 182, 191, 234, 290, 330, 245],
        type: 'line',
        smooth: true
      }
    ]
  };
  dailyChart.setOption(dailyOption);

  // Weekly users chart
  const weeklyChart = echarts.init(document.getElementById('weeklyUsersChart'));
  const weeklyOption = {
    title: { text: '近4周用户访问量' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['第1周', '第2周', '第3周', '本周']
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: [1450, 1362, 1523, 1678],
        type: 'bar'
      }
    ]
  };
  weeklyChart.setOption(weeklyOption);

  // Monthly users chart
  const monthlyChart = echarts.init(document.getElementById('monthlyUsersChart'));
  const monthlyOption = {
    title: { text: '近6个月用户访问量' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: [3240, 3542, 4125, 3968, 4357, 4526],
        type: 'line',
        areaStyle: {}
      }
    ]
  };
  monthlyChart.setOption(monthlyOption);
  
  // Log type distribution chart
  const logTypeChart = echarts.init(document.getElementById('logTypeChart'));
  const logTypeOption = {
    title: { 
      text: '日志类型分布',
      top: 10,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        center: ['60%', '50%'],
        data: [
          { value: 15621, name: '操作日志' },
          { value: 3124, name: '异常日志' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  logTypeChart.setOption(logTypeOption);

  // Handle resize
  window.addEventListener('resize', () => {
    dailyChart.resize();
    weeklyChart.resize();
    monthlyChart.resize();
    logTypeChart.resize();
  });
};

onMounted(() => {
  initCharts();
});
</script>

<template>
  <div class="log-management">
    <div class="page-header">
      <h1>日志管理系统</h1>
      <el-button type="primary" @click="$emit('view-analysis')" :icon="DataAnalysis">数据分析</el-button>
    </div>

    <!-- Statistics Cards -->
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

    <!-- Charts -->
    <div class="charts-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card">
            <div id="dailyUsersChart" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <div id="weeklyUsersChart" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card class="chart-card">
            <div id="monthlyUsersChart" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <div id="logTypeChart" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- Log Tabs -->
    <el-card style="margin-top: 20px;">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="操作日志" name="operation">
          <div class="log-search-bar">
            <el-input
              v-model="searchOperation"
              placeholder="搜索操作日志..."
              style="width: 300px;"
              clearable
            >
              <template #prefix>
                <el-icon><el-icon-search /></el-icon>
              </template>
            </el-input>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="margin-left: 10px;"
            />
            <el-button type="primary" style="margin-left: 10px;">查询</el-button>
            <el-button type="success">导出</el-button>
          </div>

          <el-table :data="operationLogs" border stripe style="width: 100%; margin-top: 15px;">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="operation" label="操作内容" min-width="200" />
            <el-table-column prop="ip" label="IP地址" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="操作时间" width="180" />
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button type="primary" size="small" text @click="$emit('view-detail', { type: 'operation', id: scope.row.id })">详情</el-button>
                <el-button type="danger" size="small" text>删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="operationPagination.currentPage"
            v-model:page-size="operationPagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="operationPagination.total"
            style="margin-top: 15px; justify-content: flex-end;"
          />
        </el-tab-pane>

        <el-tab-pane label="异常日志" name="exception">
          <div class="log-search-bar">
            <el-input
              v-model="searchException"
              placeholder="搜索异常日志..."
              style="width: 300px;"
              clearable
            >
              <template #prefix>
                <el-icon><el-icon-search /></el-icon>
              </template>
            </el-input>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="margin-left: 10px;"
            />
            <el-button type="primary" style="margin-left: 10px;">查询</el-button>
            <el-button type="success">导出</el-button>
          </div>

          <el-table :data="exceptionLogs" border stripe style="width: 100%; margin-top: 15px;">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="type" label="异常类型" width="120" />
            <el-table-column prop="description" label="异常描述" min-width="200" />
            <el-table-column prop="stacktrace" label="堆栈信息" min-width="200" show-overflow-tooltip />
            <el-table-column prop="status" label="处理状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '已处理' ? 'success' : 'warning'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="发生时间" width="180" />
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button type="primary" size="small" text @click="$emit('view-detail', { type: 'exception', id: scope.row.id })">详情</el-button>
                <el-button 
                  :type="scope.row.status === '已处理' ? 'info' : 'success'" 
                  size="small" 
                  text
                >
                  {{ scope.row.status === '已处理' ? '查看处理' : '标记为已处理' }}
                </el-button>
                <el-button type="danger" size="small" text>删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="exceptionPagination.currentPage"
            v-model:page-size="exceptionPagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="exceptionPagination.total"
            style="margin-top: 15px; justify-content: flex-end;"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
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

.chart-card {
  margin-bottom: 24px;
  position: relative;
  padding: 8px;
}

.chart-card .el-card__body {
  padding: 10px;
}

.chart {
  height: 320px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.log-search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  flex-wrap: wrap;
  gap: 10px;
}

/* 表格美化 */
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

/* 分页器美化 */
.el-pagination {
  margin-top: 20px;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

/* 标签样式 */
.el-tag {
  border-radius: 4px;
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
  font-weight: bold;
}

/* 按钮样式 */
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
</style> 