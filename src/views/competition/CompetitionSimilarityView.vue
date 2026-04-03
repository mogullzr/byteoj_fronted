<template>
  <div class="similarity-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button 
        type="primary" 
        size="large" 
        @click="router.push('/competition/list')"
        class="back-btn"
      >
        <el-icon style="margin-right: 6px"><Back /></el-icon>返回竞赛列表
      </el-button>
      <div class="page-title">
        <el-icon class="title-icon"><Document /></el-icon>
        <span>竞赛代码查重分析</span>
      </div>
      <el-tag type="info" size="large" class="competition-tag">
        {{ competitionName }}
      </el-tag>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#409EFF"><Files /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ filteredList.length }}</div>
              <div class="stat-label">当前记录数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#F56C6C"><Warning /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ highRiskCount }}</div>
              <div class="stat-label">高风险 (≥90%)</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#E6A23C"><WarningFilled /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ mediumRiskCount }}</div>
              <div class="stat-label">中风险 (80-89%)</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67C23A"><CircleCheck /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ lowRiskCount }}</div>
              <div class="stat-label">低风险 (<80%)</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="searchForm" class="filter-form">
        <el-form-item label="题目编号">
          <el-select
            v-model="searchForm.problemIndex"
            placeholder="全部题目"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option label="A题" value="A" />
            <el-option label="B题" value="B" />
            <el-option label="C题" value="C" />
            <el-option label="D题" value="D" />
            <el-option label="E题" value="E" />
            <el-option label="F题" value="F" />
            <el-option label="G题" value="G" />
            <el-option label="H题" value="H" />
            <el-option label="I题" value="I" />
            <el-option label="J题" value="J" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadSimilarityData" :icon="Search">查询</el-button>
          <el-button @click="resetSearch" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="hover" class="table-card">
      <el-table
        :data="filteredList"
        style="width: 100%"
        v-loading="loading"
        :stripe="true"
        border
        class="similarity-table"
      >
        <el-table-column label="序号" type="index" width="80" align="center" />
        <el-table-column label="题目" prop="problemIndex" width="120" align="center">
          <template #default="scope">
            <el-tag type="primary" size="large" effect="dark">{{ scope.row.problemIndex }}题</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="用户1" prop="userName1" min-width="150" align="center">
          <template #default="scope">
            <div class="user-cell">
              <el-avatar :size="32" style="background-color: #409EFF; margin-right: 8px">
                {{ scope.row.userName1?.charAt(0) || 'U' }}
              </el-avatar>
              <span>{{ scope.row.userName1 }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户2" prop="userName2" min-width="150" align="center">
          <template #default="scope">
            <div class="user-cell">
              <el-avatar :size="32" style="background-color: #67C23A; margin-right: 8px">
                {{ scope.row.userName2?.charAt(0) || 'U' }}
              </el-avatar>
              <span>{{ scope.row.userName2 }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="相似度" prop="similarityScore" width="180" sortable align="center">
          <template #default="scope">
            <div class="similarity-cell">
              <el-progress
                :percentage="Math.round((scope.row.similarityScore || 0) * 100)"
                :color="getProgressColor(scope.row.similarityScore)"
                :stroke-width="20"
                :text-inside="true"
                :format="() => ((scope.row.similarityScore || 0) * 100).toFixed(2) + '%'"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="检测时间" prop="createdAt" width="200" align="center" />
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              size="default"
              @click="viewDetail(scope.row)"
              :icon="View"
            >
              查看代码
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>

    <!-- 代码详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="代码对比详情"
      width="85%"
      :close-on-click-modal="false"
      class="code-dialog"
    >
      <div v-if="currentRecord" class="dialog-content">
        <div class="dialog-header">
          <el-tag
            :type="getSimilarityTagType(currentRecord.similarityScore)"
            size="large"
            class="similarity-badge"
          >
            相似度: {{ (currentRecord.similarityScore * 100).toFixed(2) }}%
          </el-tag>
          <el-tag type="info" size="large">
            {{ currentRecord.problemIndex }}题
          </el-tag>
        </div>

        <div class="code-comparison">
          <div class="code-panel">
            <div class="code-header">
              <el-avatar :size="40" style="background-color: #409EFF; margin-right: 10px">
                {{ currentRecord.userName1?.charAt(0) || 'U' }}
              </el-avatar>
              <div>
                <div class="code-user-name">{{ currentRecord.userName1 }}</div>
                <div class="code-user-label">用户1</div>
              </div>
            </div>
            <div class="code-body">
              <v-ace-editor
                  :value="currentRecord.sourceCode1 ?? ''"
                  theme="textmate"
                  :lang="currentLanguage"
                  :options="options"
                  class="vue-ace-editor"
              />
            </div>
          </div>

          <div class="vs-divider">
            <el-icon :size="40" color="#909399"><Switch /></el-icon>
          </div>

          <div class="code-panel">
            <div class="code-header">
              <el-avatar :size="40" style="background-color: #67C23A; margin-right: 10px">
                {{ currentRecord.userName2?.charAt(0) || 'U' }}
              </el-avatar>
              <div>
                <div class="code-user-name">{{ currentRecord.userName2 }}</div>
                <div class="code-user-label">用户2</div>
              </div>
            </div>
            <div class="code-body">
              <v-ace-editor
                  :value="currentRecord.sourceCode2 ?? ''"
                  theme="textmate"
                  :lang="currentLanguage"
                  :options="options"
                  class="vue-ace-editor"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button type="primary" @click="dialogVisible = false" :icon="Close">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Back, Document, Search, Refresh, View, Close, Files, Warning, WarningFilled, CircleCheck, Switch } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import { ProblemAlgorithmControllerService } from '../../../generated';
import router from '../../router';
import { VAceEditor } from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/snippets/c_cpp';
import 'ace-builds/src-noconflict/snippets/java';
import 'ace-builds/src-noconflict/snippets/python';
import 'ace-builds/src-noconflict/snippets/javascript';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-textmate';
import 'ace-builds/src-noconflict/theme-github';
import {CodeSimilarityVo} from "../../../generated/models/CodeSimilarityVo.ts";

const route = useRoute();
const competitionId = ref<number>(Number(route.query.competition_id) || 0);
const competitionName = ref<string>('未知竞赛');

const loading = ref(false);
const similarityList = ref<CodeSimilarityVo[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const searchForm = ref({
  problemIndex: '',
  threshold: 0.8,
});

const dialogVisible = ref(false);
const currentRecord = ref<CodeSimilarityVo | null>(null);

const options = ref({
  useWorker: false, // 启用语法检查,必须为true
  enableSnippets: true, // 启用代码段
  showPrintMargin: false, // 去掉灰色的线，printMarginColumn
  highlightActiveLine: true, // 高亮行
  highlightSelectedWord: true, // 高亮选中的字符
  tabSize: 4, // tab锁进字符
  wrap: false, // 是否换行
  minLines: 20, // 最小行数，minLines和maxLines同时设置之后，可以不用给editor再设置高度
  maxLines: 1000, // 最大行数
  readOnly: true,
  fontSize: 18,
});

// 根据代码内容检测语言
const detectLanguage = (code?: string): string => {
  if (!code) return 'text';
  
  const codeLower = code.toLowerCase();
  
  // C/C++ 检测
  if (code.includes('#include') || code.includes('std::') || code.includes('cout') || 
      code.includes('cin') || code.includes('printf') || code.includes('scanf')) {
    return 'c_cpp';
  }
  
  // Java 检测
  if (code.includes('public class') || code.includes('System.out') || 
      code.includes('import java.') || code.includes('private ') || code.includes('protected ')) {
    return 'java';
  }
  
  // Python 检测
  if (code.includes('def ') || code.includes('import ') || code.includes('print(') || 
      code.includes('self.') || code.includes('elif ') || code.includes('__init__')) {
    return 'python';
  }
  
  // JavaScript 检测
  if (code.includes('function') || code.includes('const ') || code.includes('let ') || 
      code.includes('console.log') || code.includes('=>') || code.includes('document.')) {
    return 'javascript';
  }
  
  return 'text';
};

// 检测当前代码的语言
const currentLanguage = computed(() => {
  return detectLanguage(currentRecord.value?.sourceCode1);
});

// 过滤后的列表
const filteredList = computed(() => {
  let list = similarityList.value;

  // 按题目编号过滤
  if (searchForm.value.problemIndex) {
    list = list.filter(item => item.problemIndex === searchForm.value.problemIndex);
  }

  // 按相似度阈值过滤
  if (searchForm.value.threshold > 0) {
    list = list.filter(item => (item.similarityScore || 0) >= searchForm.value.threshold);
  }

  return list;
});

// 加载查重数据
const loadSimilarityData = async () => {
  if (!competitionId.value) {
    ElNotification.error({
      title: '错误',
      message: '竞赛ID无效',
    });
    return;
  }

  loading.value = true;
  try {
    const response = await ProblemAlgorithmControllerService.getSimilarityListUsingGet(
      competitionId.value,
      currentPage.value,
      pageSize.value,
      searchForm.value.problemIndex || undefined,
    );

    if (response.code === 0 && response.data) {
      similarityList.value = response.data.records || [];
      total.value = response.data.total || 0;

      // 如果有数据，获取竞赛名称
      if (similarityList.value.length > 0 && similarityList.value[0].competitionId) {
        competitionName.value = `竞赛ID: ${similarityList.value[0].competitionId}`;
      }
    } else {
      ElNotification.error({
        title: '错误',
        message: response.message || '获取查重数据失败',
      });
    }
  } catch (error) {
    console.error('加载查重数据失败:', error);
    ElNotification.error({
      title: '错误',
      message: '加载查重数据失败',
    });
  } finally {
    loading.value = false;
  }
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    problemIndex: '',
    threshold: 0.8,
  };
  currentPage.value = 1;
  loadSimilarityData();
};

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  loadSimilarityData();
};

// 当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  loadSimilarityData();
};

// 查看代码详情
const viewDetail = (record: CodeSimilarityVo) => {
  currentRecord.value = record;
  dialogVisible.value = true;
};

// 高风险记录数
const highRiskCount = computed(() => {
  return filteredList.value.filter(item => (item.similarityScore || 0) >= 0.9).length;
});

// 中风险记录数
const mediumRiskCount = computed(() => {
  return filteredList.value.filter(item => {
    const score = item.similarityScore || 0;
    return score >= 0.8 && score < 0.9;
  }).length;
});

// 低风险记录数
const lowRiskCount = computed(() => {
  return filteredList.value.filter(item => (item.similarityScore || 0) < 0.8).length;
});

// 根据相似度获取进度条颜色
const getProgressColor = (score?: number): string => {
  if (!score) return '#909399';
  if (score >= 0.9) return '#F56C6C';
  if (score >= 0.8) return '#E6A23C';
  if (score >= 0.7) return '#E6A23C';
  return '#67C23A';
};

// 根据相似度获取标签类型
const getSimilarityTagType = (score?: number): 'danger' | 'warning' | 'success' | 'info' => {
  if (!score) return 'info';
  if (score >= 0.9) return 'danger';
  if (score >= 0.8) return 'warning';
  if (score >= 0.7) return 'warning';
  return 'success';
};

onMounted(() => {
  loadSimilarityData();
});
</script>

<style scoped>
.similarity-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.back-btn {
  flex-shrink: 0;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.title-icon {
  font-size: 28px;
  color: #409EFF;
}

.competition-tag {
  margin-left: auto;
  font-size: 14px;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 48px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 24px;
  border-radius: 12px;
}

.filter-form {
  margin: 0;
}

/* 表格卡片 */
.table-card {
  border-radius: 12px;
}

.similarity-table {
  border-radius: 8px;
}

.user-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.similarity-cell {
  padding: 0 10px;
}

/* 分页 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 代码对比对话框 */
.dialog-content {
  padding: 10px 0;
}

.dialog-header {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #EBEEF5;
}

.similarity-badge {
  font-size: 18px;
  font-weight: bold;
  padding: 10px 20px;
}

.code-comparison {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.code-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.code-header {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 2px solid #EBEEF5;
}

.code-user-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.code-user-label {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.code-body {
  flex: 1;
  overflow: hidden;
}

.vue-ace-editor {
  overflow: auto;
  height: 2150px;
  width: 100%;
  font-size: 40px;
  border: lightgray 1px solid;
  white-space: pre;
  transition: height 0.3s ease;
}

/* 滚动条样式 */
.vue-ace-editor ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.vue-ace-editor ::-webkit-scrollbar-track {
  background: #272822;
}

.vue-ace-editor ::-webkit-scrollbar-thumb {
  background: #49483e;
  border-radius: 4px;
}

.vue-ace-editor ::-webkit-scrollbar-thumb:hover {
  background: #75715e;
}

.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 响应式 */
@media (max-width: 1200px) {
  .code-comparison {
    flex-direction: column;
  }
  
  .vs-divider {
    transform: rotate(90deg);
  }
}
</style>
