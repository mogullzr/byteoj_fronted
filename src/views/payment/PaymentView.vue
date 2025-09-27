<template>
  <!-- 批量操作按钮 -->
  <div v-if="selectedRows.length > 0" class="batch-operation-bar">
    <el-alert
      :title="`已选择 ${selectedRows.length} 个订单`"
      type="info"
      show-icon
      :closable="false"
      style="margin-bottom: 12px;"
    />
    <el-button 
      size="default" 
      type="danger" 
      @click="handleBatchRefund"
      :disabled="!canBatchRefund"
      :icon="RefreshLeft"
    >
      批量退款 ({{ selectedRows.length }})
    </el-button>
  </div>

  <!-- 主数据表格 -->
  <el-table
    :data="paymentData"
    style="width: 100%"
    v-loading="loading"
    @selection-change="handleSelectionChange"
    stripe
    border
    :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
    :row-style="{ cursor: 'pointer' }"
    element-loading-text="正在加载支付数据..."
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <el-table-column type="selection" width="55" />
<!--    <el-table-column label="序号" type="index" width="80">-->
<!--      <template #default="scope">-->
<!--        <div>{{ (currentPage - 1) * pageSize + scope.$index + 1 }}</div>-->
<!--      </template>-->
<!--    </el-table-column>-->
    <el-table-column label="商户单号" prop="out_trade_no" width="220">
      <template #default="scope">
        <el-tag type="info" effect="light" size="large">
          {{ scope.row.out_trade_no }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="微信单号" prop="wx_trade_no" width="220">
      <template #default="scope">
        <el-tag 
          v-if="scope.row.status === 1 && scope.row.wx_trade_no" 
          type="success" 
          effect="light" 
          size="large"
        >
          <el-icon><Check /></el-icon>
          {{ scope.row.wx_trade_no }}
        </el-tag>
        <el-tag v-else type="info" effect="plain" size="small">
          <el-icon><Lock /></el-icon>
          待支付生成
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="创建时间" prop="create_date" width="180">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <el-icon><Timer /></el-icon>
          <span style="margin-left: 8px">
            {{ formatDate(scope.row.create_date) }}
          </span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="QQ号" prop="qq" width="180">
      <template #default="scope">
        <el-tag effect="light" size="large">{{ scope.row.qq }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="交易金额" prop="fund" width="120">
      <template #default="scope">
        <el-tag type="success" effect="light" size="large">
          <strong>¥{{ scope.row.fund }}</strong>
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="课程" prop="course_title" min-width="200">
      <template #default="scope">
        <el-link
          v-if="scope.row.course_id"
          type="primary"
          @click="goToCourse(scope.row.course_id)"
        >
          {{ scope.row.course_title }}
        </el-link>
        <span v-else>-</span>
      </template>
    </el-table-column>
    <el-table-column label="支付状态" prop="status" width="110">
      <template #default="scope">
        <el-tag 
          v-if="scope.row.status === 0" 
          type="warning" 
          effect="light" 
          size="large"
        >
          <el-icon><Clock /></el-icon> 未支付
        </el-tag>
        <el-tag 
          v-else-if="scope.row.status === 1" 
          type="success" 
          effect="light" 
          size="large"
        >
          <el-icon><Check /></el-icon> 支付成功
        </el-tag>
        <el-tag 
          v-else-if="scope.row.status === 2" 
          type="info" 
          effect="light" 
          size="large"
        >
          <el-icon><RefreshLeft /></el-icon> 已退款
        </el-tag>
        <el-tag v-else type="danger" effect="light" size="large">
          <el-icon><Warning /></el-icon> 未知状态
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column align="right" width="160">
      <template #header>
        <el-input 
          v-model="searchKeyword" 
          size="large" 
          placeholder="搜索商户单号或微信单号"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch" :loading="loading">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </template>
      <template #default="scope">
        <el-button
          v-if="scope.row.status === 1"
          size="default"
          type="danger"
          @click="handleRefund(scope.row)"
          :icon="RefreshLeft"
          round
        >
          退款
        </el-button>
        <el-tag v-else type="info" effect="light">无操作</el-tag>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页器 -->
  <div class="demo-pagination-block" style="margin: 10px auto; float: right">
    <div class="demonstration"></div>
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="totalCount"
      layout="prev, pager, next, jumper"
      @current-change="handleCurrentChange"
    />
  </div>

  <!-- 退款对话框 -->
  <el-dialog
    v-model="refundDialogVisible"
    title="退款确认"
    width="500px"
    :before-close="handleCloseRefundDialog"
  >
    <el-form :model="refundForm" label-width="100px">
      <el-form-item label="商户单号:">
        <span>{{ refundForm.out_trade_no }}</span>
      </el-form-item>
      <el-form-item label="微信单号:">
        <span v-if="refundForm.wx_trade_no">{{ refundForm.wx_trade_no }}</span>
        <el-tag v-else type="info" size="small">无微信单号</el-tag>
      </el-form-item>
      <el-form-item label="退款原因:" required>
        <el-input
          v-model="refundForm.refund_desc"
          type="textarea"
          :rows="3"
          placeholder="请输入退款原因"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="管理员密码:" required>
        <el-input
          v-model="refundForm.admin_password"
          type="password"
          placeholder="请输入管理员密码确认退款"
          show-password
          clearable
        />
        <div style="font-size: 12px; color: #909399; margin-top: 4px;">
          <el-icon><Warning /></el-icon>
          为了安全，退款操作需要管理员密码确认
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button
          type="danger"
          @click="confirmRefund"
          :loading="refundLoading"
        >
          确认退款
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 批量退款对话框 -->
  <el-dialog
    v-model="batchRefundDialogVisible"
    title="批量退款确认"
    width="600px"
    :before-close="handleCloseBatchRefundDialog"
  >
      <div class="batch-refund-content">
        <p>您选择了 {{ selectedRows.length }} 个订单进行批量退款：</p>
        <el-table :data="selectedRows" max-height="300px">
          <el-table-column label="商户单号" prop="out_trade_no" width="180" />
          <el-table-column label="微信单号" prop="wx_trade_no" width="180">
            <template #default="scope">
              <span v-if="scope.row.wx_trade_no">{{ scope.row.wx_trade_no }}</span>
              <el-tag v-else type="info" size="small">无</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="金额" prop="fund">
            <template #default="scope">
              ¥{{ scope.row.fund }}
            </template>
          </el-table-column>
        </el-table>
      <el-form :model="batchRefundForm" label-width="100px" style="margin-top: 20px;">
        <el-form-item label="退款原因:" required>
          <el-input
            v-model="batchRefundForm.refund_desc"
            type="textarea"
            :rows="3"
            placeholder="请输入批量退款原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="管理员密码:" required>
          <el-input
            v-model="batchRefundForm.admin_password"
            type="password"
            placeholder="请输入管理员密码确认批量退款"
            show-password
            clearable
          />
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">
            <el-icon><Warning /></el-icon>
            为了安全，批量退款操作需要管理员密码确认
          </div>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="batchRefundDialogVisible = false">取消</el-button>
        <el-button
          type="danger"
          @click="confirmBatchRefund"
          :loading="refundLoading"
        >
          确认批量退款
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Timer, Clock, Check, RefreshLeft, Warning, Lock } from '@element-plus/icons-vue'
import {SearchControllerService, SearchRequest} from '../../../generated'
import {LantuPayOtherRequest} from "../../../generated/models/LantuPayOtherRequest.ts";
import {LantuPayControllerService} from "../../../generated/services/LantuPayControllerService.ts";

// 响应式数据
const loading = ref(false)
const refundLoading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const totalPages = ref(0)
const paymentData = ref<any[]>([])
const selectedRows = ref<any[]>([])

// 退款相关
const refundDialogVisible = ref(false)
const batchRefundDialogVisible = ref(false)
const refundForm = reactive({
  out_trade_no: '',
  wx_trade_no: '',
  refund_desc: '',
  admin_password: ''
})
const batchRefundForm = reactive({
  refund_desc: '',
  admin_password: ''
})

// 管理员密码常量
const ADMIN_PASSWORD = 'Mogullzr'

// 密码验证函数
const validatePassword = (password: string) => {
  return password === ADMIN_PASSWORD
}

// 计算属性
const canBatchRefund = computed(() => {
  return selectedRows.value.every(row => row.status === 1)
})

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 跳转到课程页面
const goToCourse = (courseId: number) => {
  window.open(`https://www.byteoj.com/study/${courseId}`, '_blank')
}

// 搜索处理
const handleSearch = async () => {
  currentPage.value = 1
  await fetchPaymentData()
}

// 获取支付数据
const fetchPaymentData = async () => {
  try {
    loading.value = true
    const searchRequest: SearchRequest = {
      category: 'lantu',
      keyword: searchKeyword.value || undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }

    const res = await SearchControllerService.searchAllUsingPost(searchRequest)
    
    if (res.code === 0 && res.data) {
      paymentData.value = res.data.dataList || []
      
      // 从第一条数据的size字段获取总页数
      if (paymentData.value.length > 0 && paymentData.value[0].size) {
        totalPages.value = paymentData.value[0].size
        totalCount.value = totalPages.value * pageSize.value
      }
    } else {
      ElMessage.error(res.message || '获取数据失败')
      paymentData.value = []
    }
  } catch (error) {
    console.error('获取支付数据失败:', error)
    ElMessage.error('获取数据失败')
    paymentData.value = []
  } finally {
    loading.value = false
  }
}

// 分页处理
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchPaymentData()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchPaymentData()
}

// 选择处理
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 单个退款
const handleRefund = (row: any) => {
  refundForm.out_trade_no = row.out_trade_no
  refundForm.wx_trade_no = row.wx_trade_no || ''
  refundForm.refund_desc = ''
  refundDialogVisible.value = true
}

// 批量退款
const handleBatchRefund = () => {
  if (!canBatchRefund.value) {
    ElMessage.warning('只能对支付成功的订单进行退款')
    return
  }
  batchRefundForm.refund_desc = ''
  batchRefundDialogVisible.value = true
}

// 确认单个退款
const confirmRefund = async () => {
  if (!refundForm.refund_desc.trim()) {
    ElMessage.warning('请填写退款原因')
    return
  }
  
  if (!refundForm.admin_password.trim()) {
    ElMessage.warning('请输入管理员密码')
    return
  }
  
  if (!validatePassword(refundForm.admin_password)) {
    ElMessage.error('管理员密码错误，请重新输入')
    return
  }

  try {
    refundLoading.value = true
    const refundRequest: LantuPayOtherRequest[] = [{
      out_trade_no: refundForm.out_trade_no,
      refund_desc: refundForm.refund_desc
    }]

    const res = await LantuPayControllerService.lantuPayBackUsingPost(refundRequest)
    
    if (res.code === 0 && res.data.length > 0) {
      const success = res.data[0] === 'true'
      if (success) {
        ElMessage.success('退款成功')
        refundDialogVisible.value = false
        await fetchPaymentData() // 刷新数据
      } else {
        ElMessage.error('退款失败')
      }
    } else {
      ElMessage.error('退款失败')
    }
  } catch (error) {
    console.error('退款失败:', error)
    ElMessage.error('退款失败')
  } finally {
    refundLoading.value = false
  }
}

// 确认批量退款
const confirmBatchRefund = async () => {
  if (!batchRefundForm.refund_desc.trim()) {
    ElMessage.warning('请填写退款原因')
    return
  }
  
  if (!batchRefundForm.admin_password.trim()) {
    ElMessage.warning('请输入管理员密码')
    return
  }
  
  if (!validatePassword(batchRefundForm.admin_password)) {
    ElMessage.error('管理员密码错误，请重新输入')
    return
  }

  try {
    refundLoading.value = true
    const refundRequests: LantuPayOtherRequest[] = selectedRows.value.map(row => ({
      out_trade_no: row.out_trade_no,
      refund_desc: batchRefundForm.refund_desc
    }))

    const res = await LantuPayControllerService.lantuPayBackUsingPost(refundRequests)
    
    if (res.code && res.data.length > 0) {
      const successCount = res.data.filter(result => result === 'true').length
      const failCount = res.data.length - successCount
      
      if (successCount > 0) {
        ElMessage.success(`批量退款完成：成功 ${successCount} 个，失败 ${failCount} 个`)
      } else {
        ElMessage.error('批量退款全部失败')
      }
      
      batchRefundDialogVisible.value = false
      selectedRows.value = []
      await fetchPaymentData() // 刷新数据
    } else {
      ElMessage.error('批量退款失败')
    }
  } catch (error) {
    console.error('批量退款失败:', error)
    ElMessage.error('批量退款失败')
  } finally {
    refundLoading.value = false
  }
}

// 关闭对话框
const handleCloseRefundDialog = () => {
  refundDialogVisible.value = false
  refundForm.out_trade_no = ''
  refundForm.wx_trade_no = ''
  refundForm.refund_desc = ''
  refundForm.admin_password = ''
}

const handleCloseBatchRefundDialog = () => {
  batchRefundDialogVisible.value = false
  batchRefundForm.refund_desc = ''
  batchRefundForm.admin_password = ''
}

// 组件挂载时获取数据
onMounted(() => {
  fetchPaymentData()
})
</script>

<style scoped>
.demo-pagination-block + .demo-pagination-block {
  margin-top: 10px;
}
.demo-pagination-block .demonstration {
  margin-bottom: 16px;
}

.batch-operation-bar {
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.batch-refund-content {
  padding: 10px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 表格行悬停效果 */
:deep(.el-table__row:hover) {
  background-color: #f5f7fa !important;
  transform: scale(1.001);
  transition: all 0.2s ease;
}

/* 美化标签样式 */
:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 美化按钮样式 */
:deep(.el-button) {
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 美化输入框 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

/* 美化分页器 */
:deep(.el-pagination) {
  margin-top: 20px;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 4px;
  margin: 0 2px;
}

/* 美化对话框 */
:deep(.el-dialog) {
  border-radius: 12px;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

:deep(.el-dialog__title) {
  color: white;
  font-weight: bold;
}

/* 图标动画 */
.el-icon {
  transition: transform 0.2s ease;
}

.el-icon:hover {
  transform: scale(1.1);
}
</style>