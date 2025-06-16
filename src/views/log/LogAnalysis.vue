<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
// @ts-ignore
import * as echarts from 'echarts';
import { useRouter } from 'vue-router';
import { Download, RefreshRight } from '@element-plus/icons-vue';

const router = useRouter();

// Date range for filtering
const dateRange = ref([]);

// Loading states
const loading = ref(false);

// Tab handling
const activeTab = ref('users');

// Mock data for statistics
const stats = reactive({
  totalUsers: 7823,
  activeUsers: 2451,
  newUsers: 386,
  avgSessionTime: '12分43秒',
  avgPageViews: 8.4,
  peakHour: '14:00-15:00',
  mostVisitedPage: '题目列表',
  mostUsedBrowser: 'Chrome (64.3%)'
});

// Mock data for browser share
const browserData = [
  { name: 'Chrome', value: 64.3 },
  { name: 'Firefox', value: 12.8 },
  { name: 'Edge', value: 10.5 },
  { name: 'Safari', value: 8.2 },
  { name: 'Opera', value: 2.3 },
  { name: '其他', value: 1.9 }
];

// Mock data for platform share
const platformData = [
  { name: 'Windows', value: 68.2 },
  { name: 'macOS', value: 15.6 },
  { name: 'Android', value: 8.3 },
  { name: 'iOS', value: 6.5 },
  { name: 'Linux', value: 1.4 }
];

// Mock data for daily activity
const generateDailyData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const userValues = [10, 5, 3, 2, 1, 5, 8, 23, 45, 65, 80, 92, 95, 102, 110, 103, 95, 82, 70, 55, 42, 30, 20, 12];
  const operationValues = [8, 3, 1, 1, 0, 3, 5, 15, 30, 45, 60, 72, 80, 85, 90, 88, 75, 65, 52, 42, 35, 25, 15, 10];
  const exceptionValues = [1, 1, 0, 0, 0, 0, 1, 2, 4, 6, 8, 10, 12, 15, 14, 12, 10, 8, 6, 4, 3, 2, 1, 1];
  
  return {
    hours,
    userValues,
    operationValues,
    exceptionValues
  };
};

// Mock data for monthly activity
const generateMonthlyData = () => {
  const days = Array.from({ length: 30 }, (_, i) => `6/${i + 1}`);
  const userValues = Array.from({ length: 30 }, () => Math.floor(Math.random() * 100 + 150));
  const operationValues = Array.from({ length: 30 }, () => Math.floor(Math.random() * 80 + 100));
  const exceptionValues = Array.from({ length: 30 }, () => Math.floor(Math.random() * 10 + 5));
  
  return {
    days,
    userValues,
    operationValues,
    exceptionValues
  };
};

// Most active users
const activeUsers = ref([
  { rank: 1, username: '张三', userId: 'zhangsan001', visits: 127, lastActive: '2023-06-15 16:32:45' },
  { rank: 2, username: '李四', userId: 'lisi002', visits: 118, lastActive: '2023-06-15 15:47:21' },
  { rank: 3, username: '王五', userId: 'wangwu003', visits: 104, lastActive: '2023-06-15 14:23:09' },
  { rank: 4, username: '赵六', userId: 'zhaoliu004', visits: 92, lastActive: '2023-06-15 13:56:38' },
  { rank: 5, username: '孙七', userId: 'sunqi005', visits: 87, lastActive: '2023-06-15 12:41:17' }
]);

// Most visited pages
const visitedPages = ref([
  { rank: 1, page: '题目列表页', visits: 4532, avgTime: '3分42秒' },
  { rank: 2, page: '用户个人中心', visits: 3876, avgTime: '5分13秒' },
  { rank: 3, page: '比赛排行榜', visits: 2941, avgTime: '4分37秒' },
  { rank: 4, page: '题目详情页', visits: 2658, avgTime: '7分24秒' },
  { rank: 5, page: '系统首页', visits: 2453, avgTime: '2分18秒' }
]);

// Initialize charts
const initUserActivityChart = () => {
  const dailyData = generateDailyData();
  const chart = echarts.init(document.getElementById('userActivityChart'));
  
  const option = {
    title: {
      text: '用户活跃度（24小时）'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['用户访问', '操作日志', '异常日志']
    },
    xAxis: {
      type: 'category',
      data: dailyData.hours
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '用户访问',
        data: dailyData.userValues,
        type: 'line',
        smooth: true
      },
      {
        name: '操作日志',
        data: dailyData.operationValues,
        type: 'line',
        smooth: true
      },
      {
        name: '异常日志',
        data: dailyData.exceptionValues,
        type: 'line',
        smooth: true
      }
    ]
  };
  
  chart.setOption(option);
  
  // Handle resize
  window.addEventListener('resize', () => {
    chart.resize();
  });
};

const initMonthlyActivityChart = () => {
  const monthlyData = generateMonthlyData();
  const chart = echarts.init(document.getElementById('monthlyActivityChart'));
  
  const option = {
    title: {
      text: '本月活跃度（30天）'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['用户访问', '操作日志', '异常日志']
    },
    xAxis: {
      type: 'category',
      data: monthlyData.days
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: '用户访问',
        data: monthlyData.userValues,
        type: 'line',
        smooth: true
      },
      {
        name: '操作日志',
        data: monthlyData.operationValues,
        type: 'line',
        smooth: true
      },
      {
        name: '异常日志',
        data: monthlyData.exceptionValues,
        type: 'bar'
      }
    ]
  };
  
  chart.setOption(option);
  
  // Handle resize
  window.addEventListener('resize', () => {
    chart.resize();
  });
};

const initBrowserChart = () => {
  const chart = echarts.init(document.getElementById('browserChart'));
  
  const option = {
    title: {
      text: '浏览器占比',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: browserData.map(item => item.name)
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        center: ['50%', '50%'],
        data: browserData.map(item => ({ value: item.value, name: item.name })),
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
  
  chart.setOption(option);
  
  // Handle resize
  window.addEventListener('resize', () => {
    chart.resize();
  });
};

const initPlatformChart = () => {
  const chart = echarts.init(document.getElementById('platformChart'));
  
  const option = {
    title: {
      text: '平台占比',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: platformData.map(item => item.name)
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],  // 环形图
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: platformData.map(item => ({ value: item.value, name: item.name }))
      }
    ]
  };
  
  chart.setOption(option);
  
  // Handle resize
  window.addEventListener('resize', () => {
    chart.resize();
  });
};

// Refresh data
const refreshData = () => {
  loading.value = true;
  
  // Simulate API call
  setTimeout(() => {
    initUserActivityChart();
    initMonthlyActivityChart();
    initBrowserChart();
    initPlatformChart();
    loading.value = false;
  }, 1000);
};

// Export data
const exportData = () => {
  // Simulate export functionality
  window.alert('数据导出功能将在实际接口中实现');
};

// Go to log management page
const goToLogManagement = () => {
  router.push('/log');
  // Also emit the back event for the parent component
  emit('back');
};

const emit = defineEmits(['back']);

onMounted(() => {
  initUserActivityChart();
  initMonthlyActivityChart();
  initBrowserChart();
  initPlatformChart();
});
</script>

<template>
  <div class="log-analysis" v-loading="loading">
    <div class="page-header">
      <h1>日志分析</h1>
      <div class="page-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
        <el-button type="primary" @click="refreshData" :icon="RefreshRight">刷新数据</el-button>
        <el-button type="success" @click="exportData" :icon="Download">导出报表</el-button>
        <el-button @click="goToLogManagement">返回日志管理</el-button>
      </div>
    </div>
    
    <!-- Stats Cards -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-value">{{ stats.totalUsers }}</div>
          <div class="stats-label">总用户数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-value">{{ stats.activeUsers }}</div>
          <div class="stats-label">活跃用户数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-value">{{ stats.newUsers }}</div>
          <div class="stats-label">新增用户数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-value">{{ stats.avgSessionTime }}</div>
          <div class="stats-label">平均会话时长</div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-value">{{ stats.avgPageViews }}</div>
          <div class="stats-label">平均页面浏览量</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-value">{{ stats.peakHour }}</div>
          <div class="stats-label">访问高峰时段</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-value">{{ stats.mostVisitedPage }}</div>
          <div class="stats-label">最常访问页面</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-value">{{ stats.mostUsedBrowser }}</div>
          <div class="stats-label">主要浏览器</div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- Activity Charts -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card>
          <div id="userActivityChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card>
          <div id="monthlyActivityChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <div id="browserChart" class="chart-container-small"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div id="platformChart" class="chart-container-small"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- Detailed Stats Tabs -->
    <el-card class="detail-stats-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="活跃用户" name="users">
          <el-table :data="activeUsers" border stripe>
            <el-table-column prop="rank" label="排名" width="80" />
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="userId" label="用户ID" width="150" />
            <el-table-column prop="visits" label="访问次数" width="120" />
            <el-table-column prop="lastActive" label="最后活跃时间" />
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="热门页面" name="pages">
          <el-table :data="visitedPages" border stripe>
            <el-table-column prop="rank" label="排名" width="80" />
            <el-table-column prop="page" label="页面名称" />
            <el-table-column prop="visits" label="访问次数" width="120" />
            <el-table-column prop="avgTime" label="平均停留时间" width="150" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.log-analysis {
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
}

.page-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.stats-cards {
  margin-bottom: 24px;
}

.el-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;
}

.el-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.1);
}

.stats-card {
  text-align: center;
  padding: 24px 0;
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
}

.stats-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.stats-label {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.chart-row {
  margin-bottom: 24px;
}

.chart-container {
  height: 350px;
  width: 100%;
  transition: all 0.3s ease;
}

.chart-container-small {
  height: 320px;
  width: 100%;
  transition: all 0.3s ease;
}

.detail-stats-card {
  margin-bottom: 24px;
}

/* 表格美化 */
.el-table {
  margin-top: 12px;
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

/* 标签样式 */
:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background: linear-gradient(90deg, #409EFF 0%, #67C23A 50%, rgba(255, 255, 255, 0) 100%);
}

:deep(.el-tabs__item) {
  font-size: 16px;
  color: #606266;
  height: 40px;
  line-height: 40px;
  transition: all 0.3s ease;
}

:deep(.el-tabs__item.is-active) {
  color: #409EFF;
  font-weight: bold;
}

:deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
}
</style> 