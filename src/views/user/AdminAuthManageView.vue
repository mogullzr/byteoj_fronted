<template>
  <div class="permission-category-container">
    <!-- 顶部标题和搜索 -->
    <div class="header">
      <div class="title-section">
        <h2><el-icon><Menu /></el-icon> 权限类别管理</h2>
        <p class="subtitle">管理系统所有权限分类，支持多级结构</p>
      </div>
      <div class="action-section">
        <el-input
            v-model="searchQuery"
            placeholder="搜索类别..."
            clearable
            prefix-icon="el-icon-search"
            class="search-input"
            @clear="handleSearchClear"
            @keyup.enter="fetchPermissionCategories"
        />
        <el-button type="primary" @click="showAddDialog" class="add-btn">
          <el-icon><Plus /></el-icon> 新建类别
        </el-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredCategories.length === 0" class="empty-state">
        <el-icon :size="80" color="#C0C4CC"><FolderOpened /></el-icon>
        <p>暂无权限类别数据</p>
        <el-button type="primary" @click="showAddDialog">创建新类别</el-button>
      </div>

      <!-- 卡片式布局 -->
      <div v-else class="category-grid">
        <div
            v-for="category in filteredCategories"
            :key="category.id"
            class="category-card"
            :class="{ 'disabled': category.status === 0 }"
        >
          <div class="card-header">
            <div class="card-icon">
              <el-icon :size="24" :color="category.status === 0 ? '#909399' : '#409EFF'">
                <component :is="category.children ? 'Folder' : 'Document'" />
              </el-icon>
            </div>
            <div class="card-title">
              <h3>{{ category.name }}</h3>
              <el-tag
                  size="small"
                  :type="category.status === 1 ? 'success' : 'info'"
                  effect="plain"
              >
                {{ category.status === 1 ? '已启用' : '已禁用' }}
              </el-tag>
            </div>
            <div class="card-actions">
              <el-dropdown trigger="click">
                <el-button text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleEdit(category)">
                      <el-icon><Edit /></el-icon> 编辑
                    </el-dropdown-item>
                    <el-dropdown-item
                        @click="toggleStatus(category)"
                        :class="{ 'danger-text': category.status === 1 }"
                    >
                      <el-icon>
                        <component :is="category.status === 1 ? 'CircleClose' : 'CircleCheck'" />
                      </el-icon>
                      {{ category.status === 1 ? '禁用' : '启用' }}
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="showDetail(category)">
                      <el-icon><View /></el-icon> 查看详情
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <div class="card-body">
            <div class="meta-item">
              <el-icon><PriceTag /></el-icon>
              <span>标识码: {{ category.code }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Sort /></el-icon>
              <span>排序: {{ category.sort }}</span>
            </div>
            <div class="meta-item description">
              <el-icon><Document /></el-icon>
              <span>{{ category.description || '暂无描述' }}</span>
            </div>
          </div>

          <div class="card-footer">
            <span class="create-time">
              <el-icon><Clock /></el-icon>
              {{ formatTime(category.createTime) }}
            </span>
            <el-button
                v-if="category.children"
                size="small"
                text
                @click="toggleExpand(category)"
            >
              {{ category.expanded ? '收起子项' : `查看子项 (${category.children.length})` }}
            </el-button>
          </div>

          <!-- 子类别 -->
          <div v-if="category.children && category.expanded" class="sub-categories">
            <div
                v-for="child in category.children"
                :key="child.id"
                class="sub-category"
            >
              <div class="sub-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="sub-content">
                <div class="sub-header">
                  <span class="sub-name">{{ child.name }}</span>
                  <el-tag
                      size="small"
                      :type="child.status === 1 ? 'success' : 'info'"
                      effect="plain"
                  >
                    {{ child.status === 1 ? '已启用' : '已禁用' }}
                  </el-tag>
                </div>
                <div class="sub-meta">
                  <span>{{ child.code }}</span>
                  <el-button
                      size="small"
                      text
                      @click="handleEdit(child)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48, 96]"
          layout="total, sizes, prev, pager, next"
          :total="totalItems"
          @size-change="fetchPermissionCategories"
          @current-change="fetchPermissionCategories"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="600px"
        :close-on-click-modal="false"
        custom-class="category-dialog"
    >
      <el-form
          :model="categoryForm"
          :rules="formRules"
          ref="categoryFormRef"
          label-width="100px"
          label-position="top"
      >
        <el-form-item label="父级类别" prop="parentId">
          <el-cascader
              v-model="categoryForm.parentId"
              :options="categoryOptions"
              :props="{
              checkStrictly: true,
              value: 'id',
              label: 'name',
              children: 'children',
              emitPath: false,
              expandTrigger: 'hover'
            }"
              clearable
              placeholder="选择父级类别 (留空则为顶级类别)"
              style="width: 100%"
              :show-all-levels="false"
          >
            <template #default="{ node, data }">
              <span>{{ data.name }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }})</span>
            </template>
          </el-cascader>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类别名称" prop="name">
              <el-input
                  v-model="categoryForm.name"
                  placeholder="如：用户管理"
                  clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标识码" prop="code">
              <el-input
                  v-model="categoryForm.code"
                  placeholder="如：USER_MANAGE"
                  clearable
              >
                <template #prefix>
                  <el-tooltip content="大写字母和下划线组成" placement="top">
                    <el-icon><InfoFilled /></el-icon>
                  </el-tooltip>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-switch
                  v-model="categoryForm.status"
                  :active-value="1"
                  :inactive-value="0"
                  active-text="启用"
                  inactive-text="禁用"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序" prop="sort">
              <el-input-number
                  v-model="categoryForm.sort"
                  :min="0"
                  controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述" prop="description">
          <el-input
              v-model="categoryForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入类别描述信息"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ categoryForm.id ? '保存更改' : '创建类别' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情抽屉 -->
    <el-drawer
        v-model="detailVisible"
        title="类别详情"
        direction="rtl"
        size="40%"
    >
      <div v-if="currentCategory" class="detail-content">
        <div class="detail-header">
          <el-icon :size="40" color="#409EFF">
            <component :is="currentCategory.children ? 'Folder' : 'Document'" />
          </el-icon>
          <div class="detail-title">
            <h3>{{ currentCategory.name }}</h3>
            <el-tag
                :type="currentCategory.status === 1 ? 'success' : 'info'"
                effect="light"
            >
              {{ currentCategory.status === 1 ? '已启用' : '已禁用' }}
            </el-tag>
          </div>
        </div>

        <el-divider />

        <div class="detail-body">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="标识码">
              <el-tag>{{ currentCategory.code }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="父级类别">
              {{ getParentName(currentCategory.parentId) || '无 (顶级类别)' }}
            </el-descriptions-item>
            <el-descriptions-item label="排序值">
              {{ currentCategory.sort }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatTime(currentCategory.createTime, true) }}
            </el-descriptions-item>
            <el-descriptions-item label="最后更新时间">
              {{ formatTime(currentCategory.updateTime || currentCategory.createTime, true) }}
            </el-descriptions-item>
            <el-descriptions-item label="描述">
              {{ currentCategory.description || '暂无描述' }}
            </el-descriptions-item>
          </el-descriptions>

          <div v-if="currentCategory.children" class="sub-list">
            <h4>子类别 ({{ currentCategory.children.length }})</h4>
            <div class="sub-items">
              <div
                  v-for="child in currentCategory.children"
                  :key="child.id"
                  class="sub-item"
              >
                <el-icon><Document /></el-icon>
                <span class="sub-name">{{ child.name }}</span>
                <el-tag size="small">{{ child.code }}</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  Menu, Plus, FolderOpened, Folder, Document,
  MoreFilled, Edit, CircleClose, CircleCheck, View,
  PriceTag, Sort, Clock, InfoFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {computed, onMounted, reactive, ref} from "vue";

export default {
  components: {
    Menu, Plus, FolderOpened, Folder, Document,
    MoreFilled, Edit, CircleClose, CircleCheck, View,
    PriceTag, Sort, Clock, InfoFilled
  },
  setup() {
    // 数据状态
    const permissionCategories = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const currentPage = ref(1)
    const pageSize = ref(12)
    const totalItems = ref(0)
    const currentCategory = ref(null)
    // 搜索过滤
    const filteredCategories = computed(() => {
      if (!searchQuery.value) return permissionCategories.value
      return permissionCategories.value.filter(item =>
          item.name.includes(searchQuery.value) ||
          item.code.includes(searchQuery.value.toUpperCase())
      )
    })
    // UI状态
    const dialogVisible = ref(false)
    const detailVisible = ref(false)
    const dialogTitle = ref('新增权限类别')
    const categoryFormRef = ref(null)

    // 表单数据
    const categoryForm = reactive({
      id: null,
      parentId: null,
      name: '',
      code: '',
      status: 1,
      sort: 0,
      description: ''
    })

    const categoryOptions = ref([])

    // 表单验证规则
    const formRules = reactive({
      name: [
        { required: true, message: '请输入类别名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      code: [
        { required: true, message: '请输入标识码', trigger: 'blur' },
        { pattern: /^[A-Z_]+$/, message: '只能包含大写字母和下划线', trigger: 'blur' }
      ],
      status: [
        { required: true, message: '请选择状态', trigger: 'change' }
      ],
      sort: [
        { required: true, message: '请输入排序值', trigger: 'blur' }
      ]
    })

    // 方法实现
    const fetchPermissionCategories = async () => {
      loading.value = true
      try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 800))

        // 模拟数据
        const mockData = generateMockCategories()

        // 模拟搜索
        let filteredData = mockData
        if (searchQuery.value) {
          const searchLower = searchQuery.value.toLowerCase()
          filteredData = mockData.filter(item =>
              item.name.toLowerCase().includes(searchLower) ||
              item.code.toLowerCase().includes(searchLower)
          )
        }

        // 模拟分页
        const start = (currentPage.value - 1) * pageSize.value
        const end = start + pageSize.value
        permissionCategories.value = filteredData.slice(start, end).map(item => ({
          ...item,
          expanded: false
        }))
        totalItems.value = filteredData.length

        // 生成级联选择器选项
        generateCategoryOptions(mockData)
      } catch (error) {
        console.error('获取权限类别失败:', error)
        ElMessage.error('获取权限类别失败')
      } finally {
        loading.value = false
      }
    }

    const generateMockCategories = () => {
      const baseCategories = [
        {
          id: 1,
          parentId: null,
          name: '系统管理',
          code: 'SYSTEM',
          status: 1,
          sort: 0,
          description: '系统设置、用户权限等核心功能',
          createTime: '2023-01-01 10:00:00',
          updateTime: '2023-06-15 14:30:00',
          children: [
            {
              id: 101,
              parentId: 1,
              name: '用户管理',
              code: 'USER_MANAGE',
              status: 1,
              sort: 1,
              description: '管理系统用户账号',
              createTime: '2023-01-01 10:01:00'
            },
            {
              id: 102,
              parentId: 1,
              name: '角色管理',
              code: 'ROLE_MANAGE',
              status: 1,
              sort: 2,
              description: '管理系统角色和权限分配',
              createTime: '2023-01-01 10:02:00'
            },
            {
              id: 103,
              parentId: 1,
              name: '权限配置',
              code: 'PERMISSION',
              status: 1,
              sort: 3,
              description: '配置系统权限点',
              createTime: '2023-01-01 10:03:00'
            }
          ]
        },
        {
          id: 2,
          parentId: null,
          name: '内容管理',
          code: 'CONTENT',
          status: 1,
          sort: 1,
          description: '网站内容发布与管理',
          createTime: '2023-01-02 10:00:00',
          updateTime: '2023-05-20 09:15:00',
          children: [
            {
              id: 201,
              parentId: 2,
              name: '文章管理',
              code: 'ARTICLE',
              status: 1,
              sort: 1,
              description: '发布和管理文章内容',
              createTime: '2023-01-02 10:01:00'
            },
            {
              id: 202,
              parentId: 2,
              name: '分类管理',
              code: 'CATEGORY',
              status: 1,
              sort: 2,
              description: '管理内容分类',
              createTime: '2023-01-02 10:02:00'
            },
            {
              id: 203,
              parentId: 2,
              name: '标签管理',
              code: 'TAG',
              status: 1,
              sort: 3,
              description: '管理内容标签',
              createTime: '2023-01-02 10:03:00'
            }
          ]
        },
        {
          id: 3,
          parentId: null,
          name: '订单管理',
          code: 'ORDER',
          status: 1,
          sort: 2,
          description: '处理系统订单',
          createTime: '2023-01-03 10:00:00',
          children: [
            {
              id: 301,
              parentId: 3,
              name: '订单列表',
              code: 'ORDER_LIST',
              status: 1,
              sort: 1,
              description: '查看和管理订单',
              createTime: '2023-01-03 10:01:00'
            },
            {
              id: 302,
              parentId: 3,
              name: '退款处理',
              code: 'REFUND',
              status: 0,
              sort: 2,
              description: '处理订单退款',
              createTime: '2023-01-03 10:02:00'
            }
          ]
        },
        {
          id: 4,
          parentId: null,
          name: '数据统计',
          code: 'STATISTICS',
          status: 1,
          sort: 3,
          description: '系统数据分析和报表',
          createTime: '2023-01-04 10:00:00',
          children: []
        }
      ]

      // 添加更多模拟数据
      for (let i = 5; i <= 15; i++) {
        baseCategories.push({
          id: i,
          parentId: null,
          name: `业务模块${i}`,
          code: `MODULE_${i}`,
          status: i % 2,
          sort: i,
          description: `业务模块${i}的描述信息`,
          createTime: `2023-01-${i < 10 ? '0' + i : i} 10:00:00`
        })
      }

      return baseCategories
    }

    const generateCategoryOptions = (categories) => {
      const options = []

      // 添加"无"选项
      options.push({
        id: null,
        name: '无 (顶级类别)',
        children: []
      })

      // 找出所有顶级分类
      const topLevelCategories = categories.filter(item => !item.parentId)

      // 递归构建树形结构
      const buildTree = (parentId) => {
        return categories
            .filter(item => item.parentId === parentId)
            .map(item => ({
              id: item.id,
              name: item.name,
              children: buildTree(item.id)
            }))
      }

      // 添加其他分类
      topLevelCategories.forEach(item => {
        options.push({
          id: item.id,
          name: item.name,
          children: buildTree(item.id)
        })
      })

      categoryOptions.value = options
    }

    const showAddDialog = () => {
      dialogTitle.value = '新增权限类别'
      resetForm()
      dialogVisible.value = true
    }

    const handleEdit = (row) => {
      dialogTitle.value = '编辑权限类别'
      resetForm()
      Object.assign(categoryForm, {
        id: row.id,
        parentId: row.parentId,
        name: row.name,
        code: row.code,
        status: row.status,
        sort: row.sort,
        description: row.description
      })
      dialogVisible.value = true
    }

    const resetForm = () => {
      categoryForm.id = null
      categoryForm.parentId = null
      categoryForm.name = ''
      categoryForm.code = ''
      categoryForm.status = 1
      categoryForm.sort = 0
      categoryForm.description = ''
    }

    const submitForm = async () => {
      try {
        await categoryFormRef.value.validate()

        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 1000))

        ElMessage.success(categoryForm.id ? '修改成功' : '添加成功')
        dialogVisible.value = false
        await fetchPermissionCategories()
      } catch (error) {
        if (error !== 'validate') {
          ElMessage.error('保存失败')
        }
      }
    }

    const toggleStatus = async (row) => {
      try {
        await ElMessageBox.confirm(
            `确定要${row.status === 1 ? '禁用' : '启用'}【${row.name}】类别吗?`,
            '操作确认',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
        )

        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 500))

        row.status = row.status === 1 ? 0 : 1
        ElMessage.success('状态已更新')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('操作失败')
        }
      }
    }

    const showDetail = (category) => {
      currentCategory.value = category
      detailVisible.value = true
    }

    const toggleExpand = (category) => {
      category.expanded = !category.expanded
    }

    const getParentName = (parentId) => {
      if (!parentId) return null
      const allCategories = permissionCategories.value.flatMap(cat =>
          [cat, ...(cat.children || [])]
      )
      const parent = allCategories.find(cat => cat.id === parentId)
      return parent ? parent.name : null
    }

    const formatTime = (timeStr, full = false) => {
      if (!timeStr) return '未知时间'
      const date = new Date(timeStr)
      if (full) {
        return date.toLocaleString()
      }
      return date.toLocaleDateString()
    }

    const handleSearchClear = () => {
      if (searchQuery.value === '') return
      searchQuery.value = ''
      currentPage.value = 1
      fetchPermissionCategories()
    }

    // 初始化
    onMounted(() => {
      fetchPermissionCategories()
    })

    return {
      // 数据
      filteredCategories,
      permissionCategories,
      loading,
      searchQuery,
      currentPage,
      pageSize,
      totalItems,
      currentCategory,

      // UI状态
      dialogVisible,
      detailVisible,
      dialogTitle,
      categoryFormRef,

      // 表单数据
      categoryForm,
      categoryOptions,
      formRules,

      // 方法
      fetchPermissionCategories,
      showAddDialog,
      handleEdit,
      submitForm,
      toggleStatus,
      showDetail,
      toggleExpand,
      getParentName,
      formatTime,
      handleSearchClear
    }
  }
}
</script>

<style lang="scss" scoped>
.permission-category-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 40px);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 20px;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    .title-section {
      h2 {
        margin: 0;
        font-size: 22px;
        color: #303133;
        display: flex;
        align-items: center;

        .el-icon {
          margin-right: 10px;
        }
      }

      .subtitle {
        margin: 5px 0 0;
        font-size: 14px;
        color: #909399;
      }
    }

    .action-section {
      display: flex;
      align-items: center;

      .search-input {
        width: 280px;
        margin-right: 15px;
      }

      .add-btn {
        padding: 10px 15px;
      }
    }
  }

  .content-wrapper {
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    min-height: 300px;

    .loading-state {
      padding: 20px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: #909399;

      p {
        margin: 20px 0;
        font-size: 16px;
      }
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;

      .category-card {
        border: 1px solid #e6e8eb;
        border-radius: 8px;
        padding: 16px;
        background-color: #fff;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        &.disabled {
          opacity: 0.7;
          background-color: #fafafa;

          .card-header .card-icon .el-icon {
            color: #909399 !important;
          }
        }

        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          .card-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f0f7ff;
            border-radius: 8px;
            margin-right: 12px;
          }

          .card-title {
            flex: 1;

            h3 {
              margin: 0;
              font-size: 16px;
              color: #303133;
              line-height: 1.4;
            }

            .el-tag {
              margin-top: 4px;
            }
          }

          .card-actions {
            .el-button {
              padding: 4px;
            }
          }
        }

        .card-body {
          margin-bottom: 12px;

          .meta-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            font-size: 14px;
            color: #606266;

            .el-icon {
              margin-right: 8px;
              color: #909399;
            }

            &.description {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              text-overflow: ellipsis;
              line-height: 1.5;
            }
          }
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px dashed #e6e8eb;
          font-size: 12px;
          color: #909399;

          .create-time {
            display: flex;
            align-items: center;

            .el-icon {
              margin-right: 4px;
            }
          }

          .el-button {
            font-size: 12px;
          }
        }

        .sub-categories {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;

          .sub-category {
            display: flex;
            align-items: center;
            padding: 8px;
            background-color: #f9f9f9;
            border-radius: 4px;
            margin-bottom: 8px;

            .sub-icon {
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 8px;

              .el-icon {
                color: #909399;
              }
            }

            .sub-content {
              flex: 1;

              .sub-header {
                display: flex;
                align-items: center;

                .sub-name {
                  font-size: 14px;
                  color: #303133;
                  margin-right: 8px;
                }
              }

              .sub-meta {
                display: flex;
                align-items: center;
                margin-top: 4px;

                span {
                  font-size: 12px;
                  color: #909399;
                  flex: 1;
                }
              }
            }
          }
        }
      }
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }
}

// 对话框样式
.category-dialog {
  .el-form--label-top {
    .el-form-item__label {
      padding-bottom: 0;
      margin-bottom: 8px;
      font-size: 14px;
      color: #606266;
    }
  }

  .el-cascader {
    width: 100%;
  }
}

// 详情抽屉样式
.detail-content {
  padding: 20px;

  .detail-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .detail-title {
      margin-left: 16px;

      h3 {
        margin: 0;
        font-size: 20px;
      }

      .el-tag {
        margin-top: 8px;
      }
    }
  }

  .detail-body {
    .el-descriptions {
      margin-bottom: 20px;

      :deep(.el-descriptions__label) {
        width: 120px;
        font-weight: bold;
      }
    }

    .sub-list {
      margin-top: 24px;

      h4 {
        margin: 0 0 12px;
        font-size: 16px;
        color: #303133;
      }

      .sub-items {
        max-height: 300px;
        overflow-y: auto;

        .sub-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background-color: #f5f7fa;
          border-radius: 4px;
          margin-bottom: 8px;

          .el-icon {
            margin-right: 8px;
            color: #409EFF;
          }

          .sub-name {
            flex: 1;
            font-size: 14px;
          }
        }
      }
    }
  }
}

.danger-text {
  color: #f56c6c;
}
</style>