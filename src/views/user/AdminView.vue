<template>
  <el-container class="rbac-container">
    <!-- 侧边栏 - 用户列表 -->
    <el-aside width="320px" class="user-sidebar">
      <div class="sidebar-header">
        <h3>用户管理</h3>
        <el-input
            v-model="userSearch"
            placeholder="搜索用户名或邮箱"
            clearable
            prefix-icon="Search"
            @clear="handleSearchClear"
            @keyup.enter="handleUserSearch"
        />
      </div>
      <el-scrollbar class="user-list-scroll">
        <div class="user-count">共 {{ totalUsers }} 个用户</div>
        <el-skeleton :loading="loadingUsers" animated :count="5">
          <template #template>
            <div class="skeleton-item">
              <el-skeleton-item variant="circle" style="width: 48px; height: 48px" />
              <el-skeleton-item variant="text" style="width: 60%; margin-left: 12px" />
            </div>
          </template>
          <template #default>
            <el-menu
                :default-active="activeUser"
                @select="handleUserSelect"
                class="user-menu"
            >
              <el-menu-item
                  v-for="user in userList"
                  :key="user.uuid"
                  :index="user.uuid.toString()"
                  class="user-menu-item"
              >
                <el-avatar :size="48" :src="user.avatar" class="user-avatar" />
                <div class="user-info">
                  <span class="username">{{ user.username }}</span>
                  <span class="email">{{ user.email || '未填写' }}</span>
                </div>
                <el-tag size="small" :type="user.rating >= 1500 ? 'success' : 'info'">
                  评分: {{ user.rating }}
                </el-tag>
              </el-menu-item>
            </el-menu>
          </template>
        </el-skeleton>
        <div class="pagination-container">
          <el-pagination
              small
              layout="prev, pager, next, sizes"
              :total="totalUsers"
              v-model:page-size="pageSize"
              v-model:current-page="currentPage"
              :page-sizes="[10, 20, 50, 100]"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
          />
        </div>
      </el-scrollbar>
    </el-aside>

    <!-- 主内容区 - 角色分配 -->
    <el-main class="permission-main">
      <div v-if="selectedUser" class="permission-content">
        <div class="user-info-header">
          <el-avatar :size="80" :src="selectedUser.avatar" />
          <div class="user-info">
            <h3>{{ selectedUser.username }}</h3>
            <p class="email">{{ selectedUser.email || '未填写邮箱' }}</p>
            <div class="user-meta">
              <el-tag v-for="tag in parseTags(selectedUser.tags)" :key="tag" size="small" type="info">
                {{ tag }}
              </el-tag>
              <el-tag size="small" type="success">{{ selectedUser.gender || '未知性别' }}</el-tag>
              <el-tag size="small" type="warning">{{ selectedUser.school || '未知学校' }}</el-tag>
              <el-tag size="small" type="info">注册: {{ formatTime(selectedUser.create_time) }}</el-tag>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="role-section">
          <div class="section-header">
            <h4>当前角色</h4>
            <el-button
                type="primary"
                size="small"
                icon="Plus"
                @click="showRoleDialog"
                :loading="loadingRoles"
            >
              分配角色
            </el-button>
          </div>
          <el-skeleton :loading="loadingRoles" animated :count="3">
            <template #template>
              <el-skeleton-item variant="text" style="width: 120px; margin: 8px" />
            </template>
            <template #default>
              <div class="role-tags">
                <el-tag
                    v-for="role in userRoles"
                    :key="role.role_id"
                    closable
                    @close="removeRole(role.role_id)"
                    class="role-tag"
                    :type="role.role_name === 'admin' ? 'danger' : 'primary'"
                >
                  {{ role.description || role.role_name || '未知角色' }}
                </el-tag>
                <p v-if="!loadingRoles && userRoles.length === 0" class="empty-tip">
                  该用户暂无任何角色
                </p>
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-icon :size="80" class="empty-icon"><User /></el-icon>
        <p>请从左侧选择用户以查看或分配角色</p>
      </div>
    </el-main>

    <!-- 角色分配对话框 -->
    <el-dialog
        title="分配角色"
        v-model="roleDialogVisible"
        width="50%"
        top="5vh"
        :close-on-click-modal="false"
    >
      <div class="role-dialog-content">
        <el-input
            v-model="roleSearch"
            placeholder="搜索角色名称或描述"
            clearable
            prefix-icon="Search"
            class="role-search"
            @input="filterRoles"
        />
        <el-skeleton :loading="loadingAllRoles" animated :count="5">
          <template #default>
            <el-checkbox-group
                v-model="checkedRoles"
                class="role-checkbox-group"
            >
              <el-checkbox
                  v-for="role in filteredRoles"
                  :key="role.role_id"
                  :label="role.role_id"
                  class="role-checkbox"
              >
                <span class="role-name">{{ role.description || role.role_name || '未知角色' }}</span>
                <span class="role-id">ID: {{ role.role_id }}</span>
              </el-checkbox>
            </el-checkbox-group>
          </template>
        </el-skeleton>
      </div>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            @click="saveRoles"
            :loading="updatingRoles"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { User, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { RbacControllerService } from '../../../generated/services/RbacControllerService.ts'
import dayjs from 'dayjs'

export default {
  components: {
    User,
    Plus,
    Search
  },
  setup() {
    // 用户相关状态
    const userList = ref([]) // 用户列表
    const totalUsers = ref(0) // 总用户数
    const currentPage = ref(1) // 当前页码
    const pageSize = ref(10) // 每页大小
    const userSearch = ref('') // 搜索关键词
    const activeUser = ref('') // 当前选中用户
    const selectedUser = ref(null) // 选中用户信息
    const loadingUsers = ref(false) // 加载状态
    const RbacRequestInfo = ref({
      keyword: '',
      pageNum: 1,
      pageSize: 10
    })

    // 角色相关状态
    const allRoles = ref([]) // 所有角色
    const filteredRoles = ref([]) // 过滤后的角色
    const userRoles = ref([]) // 用户当前角色
    const roleDialogVisible = ref(false) // 角色对话框
    const roleSearch = ref('') // 角色搜索
    const checkedRoles = ref([]) // 选中的角色 ID
    const loadingRoles = ref(false) // 角色加载状态
    const loadingAllRoles = ref(false) // 所有角色加载状态
    const updatingRoles = ref(false) // 更新角色状态

    // 解析 tags 字段
    const parseTags = (tags) => {
      if (!tags) return []
      try {
        return JSON.parse(tags).map(tag => tag.trim()).filter(tag => tag)
      } catch {
        return tags.replace(/[\[\]]/g, '').split(',').map(tag => tag.trim()).filter(tag => tag)
      }
    }

    // 格式化时间
    const formatTime = (time) => {
      if (!time) return '未知时间'
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    }

    // 获取用户列表
    const fetchUsers = async (page = 1, search = '') => {
      loadingUsers.value = true
      try {
        RbacRequestInfo.value.keyword = search
        RbacRequestInfo.value.pageNum = page
        RbacRequestInfo.value.pageSize = pageSize.value
        const res = await RbacControllerService.adminGetUserInfoUsingGet(RbacRequestInfo.value)
        if (res.code !== 0) {
          throw new Error(res.message || '获取用户列表失败')
        }

        // 映射用户数据，保留角色信息
        userList.value = res.data.map(item => ({
          uuid: item.userVo.uuid,
          username: item.userVo.username,
          email: item.userVo.email && item.userVo.email !== ' ' ? item.userVo.email : '',
          avatar: item.userVo.avatar,
          tags: item.userVo.tags,
          gender: item.userVo.gender,
          school: item.userVo.school,
          rating: item.userVo.rating,
          create_time: item.userVo.create_time,
          roles: item.roles.filter(role => role.role_name && role.description) // 过滤无效角色
        }))
        totalUsers.value = res.data[0].userVo.pages; // 假设后端返回总条数，需后端支持
        currentPage.value = page;

        // 清空无效选中状态
        if (selectedUser.value && !userList.value.some(u => u.uuid === selectedUser.value.uuid)) {
          selectedUser.value = null
          activeUser.value = ''
          userRoles.value = []
        }
      } catch (error) {
        console.error('获取用户列表失败:', error)
        ElMessage.error('获取用户列表失败')
      } finally {
        loadingUsers.value = false
      }
    }

    // 获取所有角色
    const fetchAllRoles = async () => {
      loadingAllRoles.value = true
      try {
        const res = await RbacControllerService.adminGetRolesUsingGet()
        if (res.code !== 0) {
          throw new Error(res.message || '获取角色列表失败')
        }
        allRoles.value = res.data.filter(role => role.role_name && role.description) // 过滤无效角色
        filteredRoles.value = allRoles.value
      } catch (error) {
        console.error('获取角色列表失败:', error)
        ElMessage.error('获取角色列表失败')
      } finally {
        loadingAllRoles.value = false
      }
    }

    // 选择用户，更新角色信息
    const handleUserSelect = (userId) => {
      activeUser.value = userId
      selectedUser.value = userList.value.find(user => user.uuid === parseInt(userId))
      loadingRoles.value = true
      setTimeout(() => {
        userRoles.value = selectedUser.value?.roles || []
        checkedRoles.value = userRoles.value.map(role => role.role_id)
        loadingRoles.value = false
      }, 100)
    }

    // 页码变化
    const handlePageChange = (page) => {
      currentPage.value = page
      fetchUsers(page, userSearch.value)
    }

    // 每页大小变化
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
      fetchUsers(1, userSearch.value)
    }

    // 用户搜索
    const handleUserSearch = () => {
      currentPage.value = 1
      fetchUsers(1, userSearch.value)
    }

    // 搜索框清空
    const handleSearchClear = () => {
      if (userSearch.value === '') return
      userSearch.value = ''
      currentPage.value = 1
      fetchUsers(1, '')
    }

    // 显示角色分配对话框
    const showRoleDialog = () => {
      roleDialogVisible.value = true
      checkedRoles.value = userRoles.value.map(role => role.role_id)
    }

    // 角色搜索过滤
    const filterRoles = (value) => {
      filteredRoles.value = value
          ? allRoles.value.filter(
              role =>
                  role.role_name?.toLowerCase().includes(value.toLowerCase()) ||
                  role.description?.toLowerCase().includes(value.toLowerCase())
          )
          : allRoles.value
    }

    // 移除角色
    const removeRole = async (roleId) => {
      try {
        updatingRoles.value = true
        const newRoleIds = userRoles.value
            .filter(role => role.role_id !== roleId)
            .map(role => role.role_id)

        const request = {
          uuid: selectedUser.value.uuid,
          role_id: newRoleIds
        }

        const res = await RbacControllerService.adminAuthUserUsingPost(request)
        if (res.code !== 0) {
          throw new Error(res.message || '移除角色失败')
        }

        userRoles.value = userRoles.value.filter(role => role.role_id !== roleId)
        checkedRoles.value = newRoleIds
        ElMessage.success('角色移除成功')

        // 更新用户列表中的角色信息
        const userIndex = userList.value.findIndex(u => u.uuid === selectedUser.value.uuid)
        if (userIndex !== -1) {
          userList.value[userIndex].roles = userRoles.value
        }
      } catch (error) {
        console.error('移除角色失败:', error)
        ElMessage.error('移除角色失败')
      } finally {
        updatingRoles.value = false
      }
    }

    // 保存角色
    const saveRoles = async () => {
      try {
        updatingRoles.value = true
        const request = {
          uuid: selectedUser.value.uuid,
          role_id: checkedRoles.value
        }

        const res = await RbacControllerService.adminAuthUserUsingPost(request)
        if (res.code !== 0) {
          throw new Error(res.message || '保存角色失败')
        }

        userRoles.value = allRoles.value.filter(role => checkedRoles.value.includes(role.role_id))

        // 更新用户列表中的角色信息
        const userIndex = userList.value.findIndex(u => u.uuid === selectedUser.value.uuid)
        if (userIndex !== -1) {
          userList.value[userIndex].roles = userRoles.value
        }

        roleDialogVisible.value = false
        ElMessage.success('角色更新成功')
      } catch (error) {
        console.error('保存角色失败:', error)
        ElMessage.error('保存角色失败')
      } finally {
        updatingRoles.value = false
      }
    }

    // 初始化
    onMounted(async () => {
      await fetchUsers()
      await fetchAllRoles()
    })

    return {
      userList,
      totalUsers,
      currentPage,
      pageSize,
      userSearch,
      activeUser,
      selectedUser,
      loadingUsers,
      allRoles,
      filteredRoles,
      userRoles,
      roleDialogVisible,
      roleSearch,
      checkedRoles,
      loadingRoles,
      loadingAllRoles,
      updatingRoles,
      parseTags,
      formatTime,
      handlePageChange,
      handleSizeChange,
      handleUserSearch,
      handleSearchClear,
      handleUserSelect,
      showRoleDialog,
      filterRoles,
      removeRole,
      saveRoles
    }
  }
}
</script>

<style lang="scss" scoped>
.rbac-container {
  height: 100vh;
  background-color: #f5f7fa;
}

.user-sidebar {
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);

  .sidebar-header {
    padding: 24px;
    background-color: #fafafa;
    border-bottom: 1px solid #e6e6e6;

    h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }
  }

  .user-list-scroll {
    height: calc(100% - 100px);

    .user-count {
      padding: 12px 24px;
      font-size: 13px;
      color: #666;
      border-bottom: 1px solid #f0f0f0;
    }

    .user-menu {
      border-right: none;

      .user-menu-item {
        height: 80px;
        padding: 0 24px;
        display: flex;
        align-items: center;
        transition: background-color 0.3s;

        &:hover {
          background-color: #f5f5f5;
        }

        .user-avatar {
          margin-right: 12px;
        }

        .user-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow: hidden;

          .username {
            font-size: 15px;
            font-weight: 500;
            color: #333;
          }

          .email {
            font-size: 12px;
            color: #999;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .el-tag {
          font-size: 12px;
        }
      }
    }

    .pagination-container {
      padding: 16px;
      background-color: #fafafa;
      border-top: 1px solid #f0f0f0;
      display: flex;
      justify-content: center;
    }

    .skeleton-item {
      padding: 16px 24px;
      display: flex;
      align-items: center;
    }
  }
}

.permission-main {
  padding: 24px;

  .permission-content {
    background-color: #fff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .user-info-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;

      .user-info {
        flex: 1;

        h3 {
          margin: 0;
          font-size: 22px;
          color: #333;
        }

        .email {
          margin: 8px 0;
          font-size: 14px;
          color: #666;
        }

        .user-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      }
    }

    .role-section {
      margin-top: 24px;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }
      }

      .role-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        .role-tag {
          padding: 4px 12px;
          font-size: 13px;
          border-radius: 12px;
          transition: all 0.3s;
        }

        .empty-tip {
          color: #999;
          font-size: 14px;
          text-align: center;
          padding: 24px;
          background-color: #fafafa;
          border-radius: 4px;
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    color: #666;

    .empty-icon {
      margin-bottom: 16px;
      color: #ccc;
    }

    p {
      font-size: 16px;
    }
  }
}

.role-dialog-content {
  .role-search {
    margin-bottom: 20px;
  }

  .role-checkbox-group {
    max-height: 50vh;
    overflow-y: auto;
    padding: 16px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .role-checkbox {
      padding: 8px 12px;
      border-radius: 4px;
      transition: background-color 0.3s;

      &:hover {
        background-color: #f5f5f5;
      }

      .role-name {
        font-size: 14px;
        color: #333;
      }

      .role-id {
        font-size: 12px;
        color: #999;
        margin-left: 8px;
      }
    }
  }
}
</style>