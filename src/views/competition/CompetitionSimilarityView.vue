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

    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" class="main-tabs" @tab-click="handleTabClick">
      <!-- 两两对比 Tab -->
      <el-tab-pane label="两两对比" name="pairwise">
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
            <el-form-item label="用户查询">
              <el-select
                v-model="searchForm.uuid"
                placeholder="搜索用户名"
                filterable
                remote
                reserve-keyword
                :remote-method="searchUsers"
                :loading="userSearchLoading"
                clearable
                style="width: 220px"
                @change="handleUserSelectPairwise"
              >
                <el-option
                  v-for="user in userList"
                  :key="user.uuid"
                  :label="user.username"
                  :value="user.uuid"
                >
                  <span style="float: left">{{ user.username }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">ID: {{ user.uuid }}</span>
                </el-option>
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
            <el-table-column label="用户1" prop="userName1" min-width="200" align="left">
              <template #default="scope">
                <div class="user-cell">
                  <el-avatar :size="32" style="background-color: #409EFF; margin-right: 8px">
                    {{ scope.row.userName1?.charAt(0) || 'U' }}
                  </el-avatar>
                  <span>{{ scope.row.userName1 }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="用户2" prop="userName2" min-width="200" align="left">
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
      </el-tab-pane>

      <!-- 聚类分析 Tab -->
      <el-tab-pane label="聚类分析" name="cluster">
        <!-- 聚类筛选 -->
        <el-card shadow="hover" class="filter-card">
          <el-form :inline="true" :model="clusterSearchForm" class="filter-form">
            <el-form-item label="题目编号">
              <el-select
                v-model="clusterSearchForm.problemIndex"
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
            <el-form-item label="用户查询">
              <el-select
                v-model="clusterSearchForm.userUuid"
                placeholder="搜索用户名"
                filterable
                remote
                reserve-keyword
                :remote-method="searchUsers"
                :loading="userSearchLoading"
                clearable
                style="width: 220px"
                @change="handleUserSelect"
              >
                <el-option
                  v-for="user in userList"
                  :key="user.uuid"
                  :label="user.username"
                  :value="user.uuid"
                >
                  <span style="float: left">{{ user.username }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">ID: {{ user.uuid }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="最小聚类大小">
              <el-input-number
                v-model="clusterSearchForm.minClusterSize"
                :min="2"
                :max="100"
                placeholder="最小人数"
                style="width: 150px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadClusterData" :icon="Search">查询</el-button>
              <el-button @click="resetClusterSearch" :icon="Refresh">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 聚类数据表格 -->
        <el-card shadow="hover" class="table-card">
          <el-table 
            :data="filteredClusterList" 
            style="width: 100%" 
            v-loading="clusterLoading"
            :stripe="true"
            border
            class="cluster-table"
          >
            <el-table-column label="序号" type="index" width="80" align="center" />
            <el-table-column label="题目" prop="problemIndex" width="100" align="center">
              <template #default="scope">
                <el-tag type="primary" size="large" effect="dark">{{ scope.row.problemIndex }}题</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="聚类ID" prop="clusterId" width="100" align="center" />
            <el-table-column label="聚类人数" prop="clusterSize" width="120" align="center" sortable>
              <template #default="scope">
                <el-tag :type="getClusterSizeTagType(scope.row.clusterSize)" size="large">
                  {{ scope.row.clusterSize }} 人
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="平均相似度" prop="avgSimilarity" width="180" sortable align="center">
              <template #default="scope">
                <div class="similarity-cell">
                  <el-progress
                    :percentage="Math.round((scope.row.avgSimilarity || 0) * 100)"
                    :color="getProgressColor(scope.row.avgSimilarity)"
                    :stroke-width="20"
                    :text-inside="true"
                    :format="() => ((scope.row.avgSimilarity || 0) * 100).toFixed(2) + '%'"
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
                  @click="viewClusterDetail(scope.row)"
                  :icon="View"
                >
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="clusterCurrentPage"
              v-model:page-size="clusterPageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="clusterTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleClusterSizeChange"
              @current-change="handleClusterCurrentChange"
              background
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

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

    <!-- 聚类详情对话框 -->
    <el-dialog
      v-model="clusterDialogVisible"
      title="聚类详情"
      width="95%"
      :close-on-click-modal="false"
      class="cluster-dialog"
    >
      <div v-if="currentCluster" class="cluster-dialog-content">
        <div class="cluster-header">
          <el-tag type="primary" size="large" effect="dark">
            {{ currentCluster.problemIndex }}题
          </el-tag>
          <el-tag type="danger" size="large">
            聚类人数: {{ currentCluster.clusterSize }} 人
          </el-tag>
          <el-tag type="warning" size="large">
            平均相似度: {{ ((currentCluster.avgSimilarity || 0) * 100).toFixed(2) }}%
          </el-tag>
        </div>

        <!-- ECharts 关系图 - JPlag风格 -->
        <el-card shadow="hover" class="graph-card">
          <div class="graph-toolbar">
            <el-button size="small" @click="refreshGraph">
              <el-icon><Refresh /></el-icon>
              刷新布局
            </el-button>
            <el-text type="info" size="small">
              💡 提示：滚轮缩放 | 拖拽画布 | 悬停查看详情 | 点击节点定位代码
            </el-text>
          </div>
          <div ref="graphChartRef" class="graph-chart"></div>
        </el-card>

        <el-divider />

        <div class="members-title" id="members-title">
          <el-icon><User /></el-icon>
          <span>聚类成员代码详情 ({{ currentCluster.members?.length || 0 }}人)</span>
        </div>

        <el-row :gutter="16">
          <el-col 
            v-for="(member, index) in currentCluster.members" 
            :key="member.userUuid"
            :span="8"
            style="margin-bottom: 16px"
          >
            <el-card 
              shadow="hover" 
              class="member-card"
              :id="`member-card-${member.userUuid}`"
            >
              <div class="member-header">
                <el-avatar :size="40" :style="{ backgroundColor: getAvatarColor(index) }">
                  {{ member.userName?.charAt(0) || 'U' }}
                </el-avatar>
                <div class="member-info">
                  <div class="member-name">{{ member.userName }}</div>
                  <div class="member-uuid">ID: {{ member.userUuid }}</div>
                </div>
              </div>
              <div class="member-code">
                <v-ace-editor
                    :value="member.sourceCode ?? ''"
                    theme="textmate"
                    :lang="detectLanguage(member.sourceCode)"
                    :options="memberEditorOptions"
                    class="member-ace-editor"
                />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <template #footer>
        <el-button type="primary" @click="clusterDialogVisible = false" :icon="Close">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { Back, Document, Search, Refresh, View, Close, Files, Warning, WarningFilled, CircleCheck, Switch, User } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import { ProblemAlgorithmControllerService, SearchControllerService } from '../../../generated';
import router from '../../router';
import { VAceEditor } from 'vue3-ace-editor';
import * as echarts from 'echarts';
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
import type { ClusterVo } from '../../../generated/models/ClusterVo';
import type { SearchRequest } from '../../../generated/models/SearchRequest';

// 用户数据类型
interface UserInfo {
  uuid: number;
  username: string;
}

const route = useRoute();
const competitionId = ref<number>(Number(route.query.competition_id) || 0);
const competitionName = ref<string>('未知竞赛');

const activeTab = ref('pairwise');

// 两两对比相关
const loading = ref(false);
const similarityList = ref<CodeSimilarityVo[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const searchForm = ref({
  problemIndex: '',
  uuid: -1
});

const dialogVisible = ref(false);
const currentRecord = ref<CodeSimilarityVo | null>(null);

// 聚类分析相关
const clusterLoading = ref(false);
const clusterList = ref<ClusterVo[]>([]);
const clusterCurrentPage = ref(1);
const clusterPageSize = ref(10);
const clusterTotal = ref(0);

const clusterSearchForm = ref({
  problemIndex: '',
  minClusterSize: 2,
  userUuid: null as number | null,
});

// 用户搜索相关
const userSearchLoading = ref(false);
const userList = ref<UserInfo[]>([]);

const clusterDialogVisible = ref(false);
const currentCluster = ref<ClusterVo | null>(null);
const graphChartRef = ref<HTMLElement | null>(null);
let graphChart: echarts.ECharts | null = null;

const options = ref({
  useWorker: false,
  enableSnippets: true,
  showPrintMargin: false,
  highlightActiveLine: true,
  highlightSelectedWord: true,
  tabSize: 4,
  wrap: false,
  readOnly: true,
  fontSize: 18,
});

const memberEditorOptions = ref({
  useWorker: false,
  enableSnippets: true,
  showPrintMargin: false,
  highlightActiveLine: true,
  highlightSelectedWord: true,
  tabSize: 4,
  wrap: false,
  readOnly: true,
  fontSize: 14,
  minLines: 5,
  maxLines: 20,
});

// 过滤后的列表
const filteredList = computed(() => {
  let list = similarityList.value;
  if (searchForm.value.problemIndex) {
    list = list.filter(item => item.problemIndex === searchForm.value.problemIndex);
  }
  return list;
});

// 过滤后的聚类列表
const filteredClusterList = computed(() => {
  let list = clusterList.value;
  if (clusterSearchForm.value.problemIndex) {
    list = list.filter(item => item.problemIndex === clusterSearchForm.value.problemIndex);
  }
  if (clusterSearchForm.value.minClusterSize) {
    list = list.filter(item => (item.clusterSize || 0) >= clusterSearchForm.value.minClusterSize);
  }
  return list;
});

// 用户搜索方法
const searchUsers = async (query: string) => {
  if (!query) {
    userList.value = [];
    return;
  }
  
  userSearchLoading.value = true;
  try {
    const searchRequest: SearchRequest = {
      category: "user",
      keyword: query,
      pageNum: 1,
      pageSize: 10000
    };
    
    const response = await SearchControllerService.searchAllUsingPost(searchRequest);
    if (response.code === 0 && response.data?.dataList) {
      userList.value = response.data.dataList.map((item: any) => ({
        uuid: item.uuid,
        username: item.username,
      }));
    }
  } catch (error) {
    console.error('搜索用户失败:', error);
    userList.value = [];
  } finally {
    userSearchLoading.value = false;
  }
};

// 用户选择处理
const handleUserSelect = (userUuid: number | null) => {
  if (userUuid) {
    ElNotification({
      title: '已选择用户',
      message: `将查询该用户参与的聚类记录`,
      type: 'success',
      duration: 2000,
    });
  }
};

// 两两对比用户选择处理
const handleUserSelectPairwise = (userUuid: number | null) => {
  if (userUuid) {
    ElNotification({
      title: '已选择用户',
      message: `将查询该用户的相似度记录`,
      type: 'success',
      duration: 2000,
    });
  }
};

const highRiskCount = computed(() => {
  return filteredList.value.filter(item => (item.similarityScore || 0) >= 0.9).length;
});

const mediumRiskCount = computed(() => {
  return filteredList.value.filter(item => {
    const score = item.similarityScore || 0;
    return score >= 0.8 && score < 0.9;
  }).length;
});

const lowRiskCount = computed(() => {
  return filteredList.value.filter(item => (item.similarityScore || 0) < 0.8).length;
});

const detectLanguage = (code?: string): string => {
  if (!code) return 'text';
  if (code.includes('#include') || code.includes('std::') || code.includes('cout')) return 'c_cpp';
  if (code.includes('public class') || code.includes('System.out')) return 'java';
  if (code.includes('def ') || code.includes('import ') || code.includes('print(')) return 'python';
  if (code.includes('function') || code.includes('const ') || code.includes('let ')) return 'javascript';
  return 'text';
};

const currentLanguage = computed(() => {
  return detectLanguage(currentRecord.value?.sourceCode1);
});

const handleTabClick = (tab: any) => {
  if (tab.paneName === 'cluster' && clusterList.value.length === 0) {
    loadClusterData();
  }
};

const loadSimilarityData = async () => {
  if (!competitionId.value) {
    ElNotification.error({ title: '错误', message: '竞赛ID无效' });
    return;
  }
  loading.value = true;
  try {
    const response = await ProblemAlgorithmControllerService.getSimilarityListUsingGet(
      competitionId.value, 
      searchForm.value.uuid || -1,
      currentPage.value, 
      pageSize.value, 
      searchForm.value.problemIndex || undefined
    );
    if (response.code === 0 && response.data) {
      similarityList.value = response.data.records || [];
      total.value = response.data.total || 0;
      if (similarityList.value.length > 0 && similarityList.value[0].competitionId) {
        competitionName.value = `竞赛ID: ${similarityList.value[0].competitionId}`;
      }
    }
  } catch (error) {
    ElNotification.error({ title: '错误', message: '加载查重数据失败' });
  } finally {
    loading.value = false;
  }
};

const loadClusterData = async () => {
  if (!competitionId.value) {
    ElNotification.error({ title: '错误', message: '竞赛ID无效' });
    return;
  }
  clusterLoading.value = true;
  try {
    let response;
    // 如果选择了用户，使用按用户查询接口
    if (clusterSearchForm.value.userUuid) {
      response = await ProblemAlgorithmControllerService.getClustersByUserUsingGet(
        competitionId.value,
        clusterSearchForm.value.userUuid,
        clusterCurrentPage.value,
        clusterPageSize.value
      );
    } else {
      // 否则使用按题目查询接口
      response = await ProblemAlgorithmControllerService.getClustersByProblemUsingGet(
        competitionId.value,
        clusterCurrentPage.value,
        clusterPageSize.value,
        clusterSearchForm.value.problemIndex || undefined
      );
    }
    
    if (response.code === 0 && response.data) {
      clusterList.value = response.data.records || [];
      clusterTotal.value = response.data.total || 0;
    }
  } catch (error) {
    ElNotification.error({ title: '错误', message: '加载聚类数据失败' });
  } finally {
    clusterLoading.value = false;
  }
};

const resetSearch = () => {
  searchForm.value = { problemIndex: '', uuid: -1 };
  userList.value = [];
  currentPage.value = 1;
  loadSimilarityData();
};

const resetClusterSearch = () => {
  clusterSearchForm.value = { problemIndex: '', minClusterSize: 2, userUuid: null };
  userList.value = [];
  clusterCurrentPage.value = 1;
  loadClusterData();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  loadSimilarityData();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  loadSimilarityData();
};

const handleClusterSizeChange = (val: number) => {
  clusterPageSize.value = val;
  clusterCurrentPage.value = 1;
  loadClusterData();
};

const handleClusterCurrentChange = (val: number) => {
  clusterCurrentPage.value = val;
  loadClusterData();
};

const viewDetail = (record: CodeSimilarityVo) => {
  currentRecord.value = record;
  dialogVisible.value = true;
};

const viewClusterDetail = (cluster: ClusterVo) => {
  currentCluster.value = cluster;
  clusterDialogVisible.value = true;
  nextTick(() => {
    setTimeout(() => initGraphChart(), 300);
  });
};

const refreshGraph = () => {
  if (graphChart) {
    graphChart.dispose();
    graphChart = null;
  }
  nextTick(() => {
    setTimeout(() => initGraphChart(), 100);
  });
};

const scrollToMemberCard = (userUuid: string, userName: string) => {
  const cardId = `member-card-${userUuid}`;
  const cardElement = document.getElementById(cardId);
  if (cardElement) {
    cardElement.style.transition = 'all 0.3s ease';
    cardElement.style.boxShadow = '0 0 20px rgba(64, 158, 255, 0.8)';
    cardElement.style.transform = 'scale(1.02)';
    cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      cardElement.style.boxShadow = '';
      cardElement.style.transform = '';
    }, 3000);
    ElNotification({
      title: '已定位',
      message: `已定位到用户 ${userName || userUuid} 的代码`,
      type: 'success',
      duration: 2000,
    });
  }
};

// 初始化关系图 - JPlag风格（全连接红色网络）
const initGraphChart = () => {
  if (!currentCluster.value || !currentCluster.value.members || !graphChartRef.value) return;
  
  const members = currentCluster.value.members;
  const memberCount = members.length;
  
  // 构建节点数据 - 环形布局
  const nodes = members.map((member, index) => {
    const angle = (2 * Math.PI * index) / memberCount - Math.PI / 2;
    const radius = 300;
    const x = 400 + radius * Math.cos(angle);
    const y = 350 + radius * Math.sin(angle);
    
    return {
      id: String(member.userUuid),
      name: member.userName || `用户${index + 1}`,
      x: x,
      y: y,
      symbolSize: 40,
      itemStyle: {
        color: '#d32f2f',
        borderColor: '#b71c1c',
        borderWidth: 2,
        shadowBlur: 8,
        shadowColor: 'rgba(211, 47, 47, 0.4)',
      },
      label: {
        show: true,
        formatter: member.userName || `用户${index + 1}`,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#303133',
        position: 'outside',
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowColor: 'rgba(211, 47, 47, 0.6)',
        },
      },
      tooltip: {
        formatter: `<div style="padding: 8px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">${member.userName}</div>
          <div style="color: #909399; font-size: 12px;">ID: ${member.userUuid}</div>
          <div style="color: #F56C6C; font-size: 12px; margin-top: 3px;">⚠️ 涉嫌抄袭</div>
          <div style="color: #409EFF; font-size: 11px; margin-top: 5px;">💡 点击节点可定位到对应代码</div>
        </div>`,
      },
    };
  });
  
  // 构建边数据 - 全连接（JPlag风格）
  const links: any[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      links.push({
        source: String(members[i].userUuid),
        target: String(members[j].userUuid),
      });
    }
  }
  
  const option = {
    title: {
      text: '抄袭关系图',
      subtext: `聚类 ${currentCluster.value.clusterId} - ${currentCluster.value.problemIndex}题`,
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: { color: '#303133' },
      enterable: true,
    },
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: 'none',
        symbolSize: 40,
        roam: true,
        label: {
          show: true,
          position: 'outside',
          fontSize: 12,
          fontWeight: 'bold',
          color: '#303133',
        },
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        edgeLabel: { fontSize: 10 },
        data: nodes,
        links: links,
        lineStyle: {
          opacity: 0.6,
          width: 2,
          curveness: 0,
          color: '#d32f2f',
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 4,
            opacity: 1,
          },
          itemStyle: {
            shadowBlur: 15,
            shadowColor: 'rgba(211, 47, 47, 0.6)',
          },
        },
      },
    ],
  };
  
  if (graphChart) {
    graphChart.dispose();
  }
  graphChart = echarts.init(graphChartRef.value);
  graphChart.setOption(option);
  
  // 点击节点事件
  graphChart.on('click', function(params: any) {
    if (params.dataType === 'node') {
      scrollToMemberCard(params.data.id, params.data.name);
    }
  });
  
  const resizeHandler = () => graphChart?.resize();
  window.addEventListener('resize', resizeHandler);
  
  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler);
    if (graphChart) {
      graphChart.dispose();
      graphChart = null;
    }
  });
};

const getProgressColor = (score?: number): string => {
  if (!score) return '#909399';
  if (score >= 0.9) return '#F56C6C';
  if (score >= 0.8) return '#E6A23C';
  if (score >= 0.7) return '#E6A23C';
  return '#67C23A';
};

const getSimilarityTagType = (score?: number): 'danger' | 'warning' | 'success' | 'info' => {
  if (!score) return 'info';
  if (score >= 0.9) return 'danger';
  if (score >= 0.8) return 'warning';
  if (score >= 0.7) return 'warning';
  return 'success';
};

const getClusterSizeTagType = (size?: number): 'danger' | 'warning' | 'success' | 'info' => {
  if (!size) return 'info';
  if (size >= 10) return 'danger';
  if (size >= 5) return 'warning';
  return 'success';
};

const getAvatarColor = (index: number): string => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
  return colors[index % colors.length];
};

onMounted(() => {
  loadSimilarityData();
});
</script>

<style scoped>
.similarity-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.main-tabs { 
  margin-top: 20px;
}

.main-tabs :deep(.el-tabs__header) {
  background: white;
  border-radius: 8px 8px 0 0;
  padding: 0 20px;
  margin-bottom: 0;
  border-bottom: 1px solid #e4e7ed;
}

.main-tabs :deep(.el-tabs__content) {
  background: white;
  border-radius: 0 0 8px 8px;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.back-btn { 
  flex-shrink: 0;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.title-icon {
  font-size: 24px;
  color: #409EFF;
}

.competition-tag { 
  margin-left: auto;
  font-size: 14px;
}

.stats-row { 
  margin-bottom: 24px; 
}

.stat-card {
  border-radius: 8px;
  transition: all 0.2s;
  border: 1px solid #e4e7ed;
}

.stat-card:hover { 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon { 
  font-size: 40px; 
}

.stat-info { 
  flex: 1; 
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.filter-card {
  margin-bottom: 24px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.filter-form { 
  margin: 0; 
}

.table-card { 
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.similarity-table, .cluster-table { border-radius: 8px; }

.user-cell {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.similarity-cell { padding: 0 10px; }

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-content { padding: 10px 0; }

.dialog-header {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.similarity-badge {
  font-size: 16px;
  font-weight: 600;
  padding: 8px 16px;
}

.code-comparison {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

.code-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
}

.code-user-name {
  font-size: 15px;
  font-weight: 600;
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
  height: 500px;
  width: 100%;
}

.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cluster-dialog-content { padding: 10px 0; }

.cluster-header {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.graph-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.graph-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 6px;
}

.graph-chart {
  width: 100%;
  height: 650px;
  background: #fafbfc;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.members-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 20px 0 16px 0;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 6px;
  border-left: 3px solid #409EFF;
}

.member-card {
  border-radius: 8px;
  transition: all 0.2s;
  border: 1px solid #e4e7ed;
}

.member-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.member-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.member-info { flex: 1; }

.member-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.member-uuid {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.member-code {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.member-ace-editor {
  height: 200px;
  width: 100%;
}

@media (max-width: 1200px) {
  .code-comparison { flex-direction: column; }
  .vs-divider { transform: rotate(90deg); }
}
</style>
