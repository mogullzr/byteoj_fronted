<template>
  <div class="competition-edit-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-button 
        type="primary" 
        @click="goBack" 
        style="margin-bottom: 20px"
      >
        <el-icon><ArrowLeft /></el-icon>
        返回竞赛列表
      </el-button>
      <h2>编辑竞赛题目</h2>
      <p v-if="competitionId">竞赛ID: {{ competitionId }}</p>
    </div>

    <!-- 竞赛信息卡片 -->
    <div v-if="competitionInfo" class="competition-info-card">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>竞赛信息</span>
            <div class="header-actions">
              <el-button 
                type="text" 
                @click="showCompetitionDetails = !showCompetitionDetails"
              >
                {{ showCompetitionDetails ? '收起' : '展开' }}
              </el-button>
              <el-button 
                type="warning" 
                size="small"
                @click="showResetPasswordDialog"
                v-if="!isEditingCompetition"
              >
                <el-icon><Key /></el-icon>
                重置密码
              </el-button>
              <el-button 
                type="primary" 
                size="small"
                @click="startEditCompetition"
                v-if="!isEditingCompetition"
              >
                <el-icon><Edit /></el-icon>
                编辑竞赛信息
              </el-button>
              <div v-else class="edit-actions">
                <el-button 
                  type="success" 
                  size="small"
                  @click="saveCompetitionInfo"
                  :loading="saving"
                >
                  保存
                </el-button>
                <el-button 
                  size="small"
                  @click="cancelEditCompetition"
                >
                  取消
                </el-button>
              </div>
            </div>
          </div>
        </template>
        
        <div class="competition-basic-info">
          <!-- 编辑模式 -->
          <div v-if="isEditingCompetition" class="edit-form">
            <el-form :model="editingCompetitionData" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="竞赛名称">
                    <el-input v-model="editingCompetitionData.competition_name" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="比赛赛制">
                    <el-select v-model="editingCompetitionData.pattern" style="width: 100%">
                      <el-option label="ACM赛制" :value="0" />
                      <el-option label="IO赛制" :value="1" />
                      <el-option label="IOI赛制" :value="2" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="开始时间">
                    <el-date-picker
                      v-model="editingCompetitionData.start_time"
                      type="datetime"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="结束时间">
                    <el-date-picker
                      v-model="editingCompetitionData.end_time"
                      type="datetime"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="竞赛描述">
                <MdEditor
                  v-model="editingCompetitionData.description"
                  :toolbars="markdownToolbars"
                  :preview="true"
                  :preview-theme="'default'"
                  :code-theme="'atom'"
                  style="height: 400px"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 查看模式 -->
          <div v-else>
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="info-item">
                  <label>竞赛名称：</label>
                  <span class="competition-name">{{ competitionInfo.competition_name }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="info-item">
                  <label>开始时间：</label>
                  <el-tag type="success">{{ dayjs(competitionInfo.start_time).format("YYYY-MM-DD HH:mm:ss") }}</el-tag>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="info-item">
                  <label>结束时间：</label>
                  <el-tag type="danger">{{ dayjs(competitionInfo.end_time).format("YYYY-MM-DD HH:mm:ss") }}</el-tag>
                </div>
              </el-col>
            </el-row>
            
            <el-row :gutter="20" style="margin-top: 15px;">
              <el-col :span="8">
                <div class="info-item">
                  <label>创建者：</label>
                  <span>{{ competitionInfo.username }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="info-item">
                  <label>参赛人数：</label>
                  <el-tag type="info">{{ competitionInfo.joins }} 人</el-tag>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="info-item">
                  <label>比赛赛制：</label>
                  <el-tag :type="getPatternTagType(competitionInfo.pattern)">
                    {{ getPatternText(competitionInfo.pattern) }}
                  </el-tag>
                </div>
              </el-col>
            </el-row>

            <!-- 竞赛描述（可展开/收起） -->
            <div v-if="showCompetitionDetails" class="competition-description">
              <el-divider content-position="left">竞赛描述</el-divider>
              <div class="description-content">
                <MdEditor
                  :model-value="competitionInfo.description"
                  :preview="true"
                  :preview-theme="'default'"
                  :toolbars="[]"
                  style="height: auto; min-height: 200px"
                />
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 题目列表 -->
    <div v-else-if="problems.length > 0" class="problems-container">
      <el-table 
        :data="problems" 
        style="width: 100%" 
        border
        stripe
      >
        <el-table-column 
          label="题目序号" 
          prop="index" 
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-tag 
              :type="getIndexTagType(scope.row.index)" 
              size="large"
              style="font-weight: bold; font-size: 16px;"
            >
              {{ scope.row.index }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column 
          label="题目名称" 
          prop="problem_name" 
          min-width="300"
        >
          <template #default="scope">
            <div class="problem-name">
              <el-text size="large" style="font-weight: 500;">
                {{ scope.row.problem_name }}
              </el-text>
            </div>
          </template>
        </el-table-column>

        <el-table-column 
          label="AC数量" 
          prop="ac_total" 
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-statistic 
              :value="scope.row.ac_total" 
              :value-style="{ color: '#67C23A', fontSize: '16px', fontWeight: 'bold' }"
            />
          </template>
        </el-table-column>

        <el-table-column 
          label="提交总数" 
          prop="test_total" 
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-statistic 
              :value="scope.row.test_total" 
              :value-style="{ color: '#409EFF', fontSize: '16px', fontWeight: 'bold' }"
            />
          </template>
        </el-table-column>

        <el-table-column 
          label="通过率" 
          width="150"
          align="center"
        >
          <template #default="scope">
            <div class="pass-rate">
              <div class="progress-container">
                <el-progress 
                  :percentage="calculatePassRate(scope.row.ac_total, scope.row.test_total)"
                  :color="getProgressColor(calculatePassRate(scope.row.ac_total, scope.row.test_total))"
                  :stroke-width="6"
                  :show-text="false"
                />
                <span class="percentage-text">
                  {{ calculatePassRate(scope.row.ac_total, scope.row.test_total) }}%
                </span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column 
          label="操作" 
          width="400"
          align="center"
        >
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="small"
                @click="editProblem(scope.row)"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button 
                type="warning" 
                size="small"
                @click="replaceProblem(scope.row)"
              >
                <el-icon><Refresh /></el-icon>
                替换
              </el-button>
              <el-button 
                type="danger" 
                size="small"
                @click="removeProblem(scope.row)"
              >
                <el-icon><Delete /></el-icon>
                移除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加题目按钮 -->
      <div class="add-problem-section" style="margin-top: 20px; text-align: center;">
        <el-button 
          type="success" 
          size="large"
          @click="addProblem"
        >
          <el-icon><Plus /></el-icon>
          添加新题目
        </el-button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty description="暂无题目数据">
        <el-button 
          type="primary" 
          @click="addProblem"
        >
          添加第一个题目
        </el-button>
      </el-empty>
    </div>

    <!-- 底部操作按钮 -->
    <div class="footer-actions" style="margin-top: 30px; text-align: center;">
      <el-button 
        size="large" 
        @click="goBack"
      >
        取消
      </el-button>
      <el-button 
        type="primary" 
        size="large"
        @click="saveChanges"
        :loading="saving"
      >
        保存更改
      </el-button>
    </div>

    <!-- 题目选择对话框 -->
    <el-dialog
      v-model="problemSelectDialogVisible"
      title="选择题目"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="problem-select-container">
        <!-- 搜索条件 -->
        <div class="search-filters" style="margin-bottom: 20px;">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-input
                v-model="searchRequest.keyword"
                placeholder="搜索关键词"
                clearable
                @keyup.enter="searchProblems"
              />
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="searchProblems">搜索</el-button>
            </el-col>
          </el-row>
        </div>

        <!-- 题目列表 -->
        <el-table
          :data="availableProblems"
          style="width: 100%"
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="题目ID" prop="problem_id" width="80" />
          <el-table-column label="题目名称" prop="chinese_name" min-width="200" />
          <el-table-column label="难度" prop="difficulty_name" width="100">
            <template #default="scope">
              <el-tag type="info">
                {{ scope.row.difficulty_name }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="来源" prop="source" width="100" />
          <el-table-column label="AC数" prop="ac_total" width="80" />
          <el-table-column label="提交数" prop="test_total" width="80" />
          <el-table-column label="标签" prop="algorithm_tags" width="150">
            <template #default="scope">
              <el-tag
                v-for="tag in scope.row.algorithm_tags"
                :key="tag"
                size="small"
                style="margin-right: 4px;"
              >
                {{ tag }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container" style="margin-top: 20px; text-align: center;">
          <el-pagination
            v-model:current-page="searchRequest.pageNum"
            v-model:page-size="searchRequest.pageSize"
            :total="totalProblems"
            layout="prev, pager, next, jumper"
            @current-change="searchProblems"
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="problemSelectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmProblemSelection">确定选择</el-button>
      </template>
    </el-dialog>

    <!-- 题目名称编辑对话框 -->
    <el-dialog
      v-model="nameEditDialogVisible"
      title="编辑题目名称"
      width="500px"
    >
      <el-form :model="editingProblem" label-width="100px">
        <el-form-item label="题目序号">
          <el-input v-model="editingProblem.index" disabled />
        </el-form-item>
        <el-form-item label="题目名称">
          <el-input v-model="editingProblem.problem_name" placeholder="请输入题目名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="nameEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmNameEdit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordDialogVisible"
      title="重置竞赛密码"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="resetPasswordForm" 
        :rules="resetPasswordRules" 
        ref="resetPasswordFormRef"
        label-width="100px"
      >
        <el-form-item label="竞赛名称">
          <el-input 
            :value="competitionInfo?.competition_name" 
            disabled 
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetPasswordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
            clearable
            @input="onPasswordInput"
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="resetPasswordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item label="密码强度">
          <div class="password-strength">
            <el-progress 
              :percentage="passwordStrength.percentage"
              :color="passwordStrength.color"
              :stroke-width="6"
              :show-text="false"
            />
            <span class="strength-text">{{ passwordStrength.text }}</span>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="resetPassword"
          :loading="resettingPassword"
        >
          重置密码
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElNotification, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, 
  Edit, 
  Refresh, 
  Delete, 
  Plus,
  Key
} from '@element-plus/icons-vue'
import { CompetitionControllerService, SearchControllerService } from '../../../generated'
import type { CompetitionAddRequest, CompetitionProblems } from '../../../generated'
import dayjs from 'dayjs'
import { MdEditor, ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

// 路由相关
const route = useRoute()
const router = useRouter()

// 响应式数据
const competitionId = ref<number>(0)
const problems: Ref<any[]> = ref([])
const loading = ref(false)
const saving = ref(false)

// 题目选择相关
const problemSelectDialogVisible = ref(false)
const availableProblems: Ref<any[]> = ref([])
const selectedProblems: Ref<any[]> = ref([])
const totalProblems = ref(0)
const searchRequest = ref({
  category: "algorithm",
  keyword: "",
  pageNum: 1,
  pageSize: 20,
  sourceList: [],
  tagsList: []
})

// 题目名称编辑相关
const nameEditDialogVisible = ref(false)
const editingProblem = ref({
  index: '',
  problem_name: ''
})

// 当前操作类型
const currentAction = ref('') // 'add', 'replace'
const currentReplaceIndex = ref(-1)

// 竞赛信息相关
const competitionInfo = ref<any>(null)
const showCompetitionDetails = ref(false)
const isEditingCompetition = ref(false)
const editingCompetitionData = ref<any>({})

// 重置密码相关
const resetPasswordDialogVisible = ref(false)
const resettingPassword = ref(false)
const resetPasswordFormRef = ref()
const resetPasswordForm = ref({
  newPassword: '',
  confirmPassword: ''
})

// 密码强度检测
const passwordStrength = ref({
  percentage: 0,
  color: '#909399',
  text: '请输入密码'
})

// 表单验证规则
const resetPasswordRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
    { max: 20, message: '密码长度不能超过20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== resetPasswordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// Markdown编辑器工具栏配置
const markdownToolbars: ToolbarNames[] = [
  'bold',
  'underline',
  'italic',
  'strikeThrough',
  'title',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'mermaid',
  'katex',
  'toc',
  'revoke',
  'next',
  'save',
  'preview',
  'fullscreen'
]

// 获取竞赛ID
onMounted(async () => {
  const id = route.params.id || route.query.competition_id
  if (id) {
    competitionId.value = Number(id)
    await loadCompetitionInfo()
    await loadProblems()
  } else {
    ElNotification.error({
      title: '错误',
      message: '缺少竞赛ID参数'
    })
    goBack()
  }
})

// 加载竞赛信息
const loadCompetitionInfo = async () => {
  try {
    const res = await CompetitionControllerService.competitionSearchByCompetitionIdUsingPost(
      competitionId.value
    )
    
    if (res.code === 0) {
      competitionInfo.value = res.data
    } else {
      ElNotification.error({
        title: '错误',
        message: res.message || '加载竞赛信息失败'
      })
    }
  } catch (error) {
    console.error('加载竞赛信息失败:', error)
    ElNotification.error({
      title: '错误',
      message: '网络请求失败，请稍后重试'
    })
  }
}

// 获取比赛赛制文本
const getPatternText = (pattern: number): string => {
  switch (pattern) {
    case 0: return 'ACM赛制'
    case 1: return 'IO赛制'
    case 2: return 'IOI赛制'
    default: return '未知赛制'
  }
}

// 获取比赛赛制标签类型
const getPatternTagType = (pattern: number): string => {
  switch (pattern) {
    case 0: return 'primary'
    case 1: return 'success'
    case 2: return 'warning'
    default: return 'info'
  }
}

// 加载题目数据
const loadProblems = async () => {
  loading.value = true
  try {
    const res = await CompetitionControllerService.competitionProblemsAdminGetUsingGet(
      competitionId.value
    )
    
    if (res.code === 0) {
      problems.value = res.data || []
      ElNotification.success({
        title: '成功',
        message: `成功加载 ${problems.value.length} 个题目`
      })
    } else {
      ElNotification.error({
        title: '错误',
        message: res.message || '加载题目失败'
      })
    }
  } catch (error) {
    console.error('加载题目失败:', error)
    ElNotification.error({
      title: '错误',
      message: '网络请求失败，请稍后重试'
    })
  } finally {
    loading.value = false
  }
}

// 返回竞赛列表
const goBack = () => {
  router.push('/competition/list')
}

// 计算通过率
const calculatePassRate = (acTotal: number, testTotal: number): number => {
  if (testTotal === 0) return 0
  return Math.round((acTotal / testTotal) * 100)
}

// 获取进度条颜色
const getProgressColor = (percentage: number): string => {
  if (percentage >= 80) return '#67C23A'
  if (percentage >= 60) return '#E6A23C'
  if (percentage >= 40) return '#F56C6C'
  return '#909399'
}

// 获取题目序号标签类型
const getIndexTagType = (index: string): string => {
  const colors = ['', 'success', 'info', 'warning', 'danger']
  const charCode = index.charCodeAt(0) - 65 // A=0, B=1, C=2...
  return colors[charCode % colors.length] || ''
}

// 编辑题目名称
const editProblem = (problem: any) => {
  editingProblem.value = {
    index: problem.index,
    problem_name: problem.problem_name
  }
  nameEditDialogVisible.value = true
}

// 替换题目
const replaceProblem = (problem: any) => {
  currentAction.value = 'replace'
  currentReplaceIndex.value = problems.value.findIndex(p => p.index === problem.index)
  problemSelectDialogVisible.value = true
  searchProblems()
}

// 移除题目
const removeProblem = async (problem: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除题目 ${problem.index}: ${problem.problem_name} 吗？`,
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 从本地数组中移除，不发送请求
    const index = problems.value.findIndex(p => p.index === problem.index)
    if (index > -1) {
      problems.value.splice(index, 1)
      ElNotification.success({
        title: '成功',
        message: `已移除题目 ${problem.index}: ${problem.problem_name}`
      })
    }
  } catch {
    // 用户取消操作
  }
}

// 添加题目
const addProblem = () => {
  currentAction.value = 'add'
  currentReplaceIndex.value = -1
  problemSelectDialogVisible.value = true
  searchProblems()
}

// 搜索题目
const searchProblems = async () => {
  try {
    const res = await SearchControllerService.searchAllUsingPost(searchRequest.value)
    
    if (res.code === 0) {
      availableProblems.value = res.data?.dataList || []
      totalProblems.value = (res.data?.dataList?.[0]?.pages || 0) * searchRequest.value.pageSize
    } else {
      ElNotification.error({
        title: '错误',
        message: res.message || '搜索题目失败'
      })
    }
  } catch (error) {
    console.error('搜索题目失败:', error)
    ElNotification.error({
      title: '错误',
      message: '网络请求失败，请稍后重试'
    })
  }
}

// 处理题目选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedProblems.value = selection
}

// 确认题目选择
const confirmProblemSelection = () => {
  if (selectedProblems.value.length === 0) {
    ElNotification.warning({
      title: '提示',
      message: '请至少选择一个题目'
    })
    return
  }

  if (currentAction.value === 'add') {
    // 添加题目
    const nextIndex = String.fromCharCode(65 + problems.value.length) // A, B, C...
    selectedProblems.value.forEach((problem, index) => {
      const newProblem = {
        index: String.fromCharCode(65 + problems.value.length + index),
        problem_name: problem.chinese_name,
        ac_total: 0,  // 新添加的题目AC数量设置为0
        test_total: 0, // 新添加的题目提交总数设置为0
        problem_id: problem.problem_id,
        original_problem: problem
      }
      problems.value.push(newProblem)
    })
    
    ElNotification.success({
      title: '成功',
      message: `已添加 ${selectedProblems.value.length} 个题目`
    })
  } else if (currentAction.value === 'replace') {
    // 替换题目
    if (selectedProblems.value.length > 1) {
      ElNotification.warning({
        title: '提示',
        message: '替换时只能选择一个题目'
      })
      return
    }
    
    const problem = selectedProblems.value[0]
    const replaceProblem = {
      index: problems.value[currentReplaceIndex.value].index,
      problem_name: problem.chinese_name,
      ac_total: problem.ac_total,
      test_total: problem.test_total,
      problem_id: problem.problem_id,
      original_problem: problem
    }
    
    problems.value[currentReplaceIndex.value] = replaceProblem
    
    ElNotification.success({
      title: '成功',
      message: `已替换题目 ${replaceProblem.index}`
    })
  }

  problemSelectDialogVisible.value = false
  selectedProblems.value = []
}

// 确认名称编辑
const confirmNameEdit = () => {
  const problem = problems.value.find(p => p.index === editingProblem.value.index)
  if (problem) {
    problem.problem_name = editingProblem.value.problem_name
    ElNotification.success({
      title: '成功',
      message: `已更新题目 ${problem.index} 的名称`
    })
  }
  nameEditDialogVisible.value = false
}


// 开始编辑竞赛信息
const startEditCompetition = () => {
  isEditingCompetition.value = true
  // 深拷贝竞赛信息到编辑数据
  editingCompetitionData.value = {
    competition_name: competitionInfo.value.competition_name,
    pattern: competitionInfo.value.pattern,
    start_time: competitionInfo.value.start_time,
    end_time: competitionInfo.value.end_time,
    description: competitionInfo.value.description
  }
}

// 取消编辑竞赛信息
const cancelEditCompetition = () => {
  isEditingCompetition.value = false
  editingCompetitionData.value = {}
}

// 转换题目数据为请求格式
const convertProblemsToRequest = (problems: any[]): CompetitionProblems[] => {
  return problems.map(problem => ({
    problem_id: problem.problem_id,
    index: problem.index,
    problem_name: problem.problem_name
  }))
}

// 保存竞赛信息
const saveCompetitionInfo = async () => {
  saving.value = true
  try {
    // 构建请求数据
    const requestData: CompetitionAddRequest = {
      competition_id: competitionId.value,
      competition_name: editingCompetitionData.value.competition_name,
      start_time: dayjs(editingCompetitionData.value.start_time).format('YYYY-MM-DD HH:mm:ss'),
      end_time: dayjs(editingCompetitionData.value.end_time).format('YYYY-MM-DD HH:mm:ss'),
      description: editingCompetitionData.value.description,
      pattern: editingCompetitionData.value.pattern,
      avatar: competitionInfo.value.avatar, // 保持原有头像
      password: competitionInfo.value.password, // 保持原有密码
      created_by: competitionInfo.value.created_by, // 保持原有创建者
      algorithm_problem_list: convertProblemsToRequest(problems.value),
      status: competitionInfo.value.status, // 保持原有状态
      type: competitionInfo.value.type // 保持原有类型
    }

    // 调用API保存竞赛信息
    const res = await CompetitionControllerService.competitionModifyByUserUsingGet(requestData)
    
    if (res.code === 0) {
      // 更新本地数据
      competitionInfo.value = {
        ...competitionInfo.value,
        ...editingCompetitionData.value
      }
      
      isEditingCompetition.value = false
      editingCompetitionData.value = {}
      
      ElNotification.success({
        title: '成功',
        message: '竞赛信息已保存'
      })
    } else {
      ElNotification.error({
        title: '错误',
        message: res.message || '保存失败'
      })
    }
  } catch (error) {
    console.error('保存竞赛信息失败:', error)
    ElNotification.error({
      title: '错误',
      message: '保存失败，请稍后重试'
    })
  } finally {
    saving.value = false
  }
}

// 显示重置密码对话框
const showResetPasswordDialog = () => {
  resetPasswordDialogVisible.value = true
  resetPasswordForm.value = {
    newPassword: '',
    confirmPassword: ''
  }
  passwordStrength.value = {
    percentage: 0,
    color: '#909399',
    text: '请输入密码'
  }
}

// 检测密码强度
const checkPasswordStrength = (password: string) => {
  if (!password) {
    passwordStrength.value = {
      percentage: 0,
      color: '#909399',
      text: '请输入密码'
    }
    return
  }

  let score = 0
  let text = ''
  let color = ''

  // 长度检查
  if (password.length >= 6) score += 20
  if (password.length >= 8) score += 10
  if (password.length >= 12) score += 10

  // 字符类型检查
  if (/[a-z]/.test(password)) score += 10
  if (/[A-Z]/.test(password)) score += 10
  if (/[0-9]/.test(password)) score += 10
  if (/[^a-zA-Z0-9]/.test(password)) score += 10

  // 复杂度检查
  if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
    score += 20
  }

  if (score < 30) {
    text = '弱'
    color = '#F56C6C'
  } else if (score < 60) {
    text = '中等'
    color = '#E6A23C'
  } else if (score < 80) {
    text = '强'
    color = '#67C23A'
  } else {
    text = '很强'
    color = '#409EFF'
  }

  passwordStrength.value = {
    percentage: Math.min(score, 100),
    color,
    text
  }
}

// 重置密码
const resetPassword = async () => {
  if (!resetPasswordFormRef.value) return

  try {
    await resetPasswordFormRef.value.validate()
    
    resettingPassword.value = true
    
    // 构建请求数据
    const requestData: CompetitionAddRequest = {
      competition_id: competitionId.value,
      competition_name: competitionInfo.value.competition_name,
      start_time: dayjs(competitionInfo.value.start_time).format('YYYY-MM-DD HH:mm:ss'),
      end_time: dayjs(competitionInfo.value.end_time).format('YYYY-MM-DD HH:mm:ss'),
      description: competitionInfo.value.description,
      pattern: competitionInfo.value.pattern,
      avatar: competitionInfo.value.avatar,
      password: resetPasswordForm.value.newPassword, // 更新密码
      created_by: competitionInfo.value.created_by,
      algorithm_problem_list: convertProblemsToRequest(problems.value),
      status: resetPasswordForm.value.newPassword ? 1 : 0, // 根据是否有密码设置状态
      type: competitionInfo.value.type
    }

    // 调用API重置密码
    const res = await CompetitionControllerService.competitionModifyByUserUsingGet(requestData)
    
    if (res.code === 0) {
      // 更新本地数据
      competitionInfo.value.password = resetPasswordForm.value.newPassword
      competitionInfo.value.status = resetPasswordForm.value.newPassword ? 1 : 0
      
      ElNotification.success({
        title: '成功',
        message: '密码重置成功'
      })
      
      resetPasswordDialogVisible.value = false
      resetPasswordForm.value = {
        newPassword: '',
        confirmPassword: ''
      }
    } else {
      ElNotification.error({
        title: '错误',
        message: res.message || '密码重置失败'
      })
    }
  } catch (error) {
    console.error('密码重置失败:', error)
    ElNotification.error({
      title: '错误',
      message: '密码重置失败，请检查输入'
    })
  } finally {
    resettingPassword.value = false
  }
}

// 监听密码输入
const onPasswordInput = () => {
  checkPasswordStrength(resetPasswordForm.value.newPassword)
}

// 保存更改
const saveChanges = async () => {
  saving.value = true
  try {
    // 构建请求数据
    const requestData: CompetitionAddRequest = {
      competition_id: competitionId.value,
      competition_name: competitionInfo.value.competition_name,
      start_time: dayjs(competitionInfo.value.start_time).format('YYYY-MM-DD HH:mm:ss'),
      end_time: dayjs(competitionInfo.value.end_time).format('YYYY-MM-DD HH:mm:ss'),
      description: competitionInfo.value.description,
      pattern: competitionInfo.value.pattern,
      avatar: competitionInfo.value.avatar,
      password: competitionInfo.value.password,
      created_by: competitionInfo.value.created_by,
      algorithm_problem_list: convertProblemsToRequest(problems.value),
      status: competitionInfo.value.status,
      type: competitionInfo.value.type
    }

    // 调用API保存题目列表
    const res = await CompetitionControllerService.competitionModifyByUserUsingGet(requestData)
    
    if (res.code === 0) {
      ElNotification.success({
        title: '成功',
        message: '题目更改已保存'
      })
    } else {
      ElNotification.error({
        title: '错误',
        message: res.message || '保存失败'
      })
    }
  } catch (error) {
    console.error('保存题目更改失败:', error)
    ElNotification.error({
      title: '错误',
      message: '保存失败，请稍后重试'
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.competition-edit-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 10px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.loading-container,
.problems-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.problem-name {
  padding: 8px 0;
}

.pass-rate {
  padding: 0 5px;
  min-width: 120px;
}

.progress-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-container .el-progress {
  flex: 1;
  height: 16px;
}

.percentage-text {
  font-size: 12px;
  font-weight: bold;
  color: #303133;
  min-width: 35px;
  text-align: center;
  white-space: nowrap;
}

.progress-container .el-progress-bar__outer {
  height: 16px;
  border-radius: 8px;
}

.progress-container .el-progress-bar__inner {
  height: 16px;
  border-radius: 8px;
}

.empty-state {
  background: white;
  padding: 60px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
}

.add-problem-section {
  padding: 20px;
  border-top: 1px solid #ebeef5;
}

.footer-actions {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.footer-actions .el-button {
  margin: 0 10px;
  min-width: 120px;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: nowrap;
}

.action-buttons .el-button {
  flex-shrink: 0;
  min-width: 70px;
}

/* 竞赛信息卡片样式 */
.competition-info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.competition-basic-info {
  padding: 10px 0;
}

.edit-form {
  padding: 20px 0;
}

.edit-form .el-form-item {
  margin-bottom: 20px;
}

.edit-form .el-form-item:last-child {
  margin-bottom: 0;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-item label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
  min-width: 80px;
}

.competition-name {
  font-weight: bold;
  color: #303133;
  font-size: 16px;
}

.competition-description {
  margin-top: 20px;
}

.description-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.description-content h1,
.description-content h2,
.description-content h3 {
  color: #303133;
  margin: 15px 0 10px 0;
}

.description-content p {
  margin: 8px 0;
  line-height: 1.6;
}

.description-content ul,
.description-content ol {
  margin: 10px 0;
  padding-left: 20px;
}

.description-content li {
  margin: 5px 0;
  line-height: 1.5;
}

.description-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 10px 0;
}

/* Markdown编辑器样式优化 */
.edit-form .md-editor {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

.edit-form .md-editor:hover {
  border-color: #c0c4cc;
}

.edit-form .md-editor.md-editor--active {
  border-color: #409eff;
}

.description-content .md-editor {
  border: none;
  box-shadow: none;
}

.description-content .md-editor .md-editor-preview {
  padding: 0;
}

/* 密码强度样式 */
.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
}

.password-strength .el-progress {
  flex: 1;
  height: 16px;
}

.strength-text {
  font-size: 12px;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
}

/* 题目选择对话框样式 */
.problem-select-container {
  max-height: 600px;
  overflow-y: auto;
}

.search-filters {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 6px;
}

.pagination-container {
  background: white;
  padding: 10px;
  border-radius: 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .competition-edit-container {
    padding: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .action-buttons .el-button {
    width: 100%;
    min-width: auto;
  }
  
  .search-filters .el-col {
    margin-bottom: 10px;
  }
}
</style>