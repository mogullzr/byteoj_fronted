<!--<script setup lang="ts">-->
<!--import { computed, onMounted, ref, Ref } from "vue";-->
<!--import {-->
<!--  AdminRegisterRequest,-->
<!--  User,-->
<!--  UserControllerService,-->
<!--} from "../../../generated";-->
<!--import dayjs from "dayjs";-->
<!--import { ElNotification, TableColumnCtx } from "element-plus";-->

<!--const admin_list: Ref<User[]> = ref([]);-->
<!--const filterTableData = computed(() =>-->
<!--  admin_list.value.filter(-->
<!--    (data) =>-->
<!--      !search.value ||-->
<!--      data.account?.toLowerCase().includes(search.value.toLowerCase()) ||-->
<!--      data.email?.includes(search.value) ||-->
<!--      data.phone?.includes(search.value) ||-->
<!--      data.uuid == parseInt(search.value) ||-->
<!--      data.school?.includes(search.value),-->
<!--  ),-->
<!--);-->
<!--const centerDialogVisible = ref(false);-->

<!--const adminRegister: Ref<AdminRegisterRequest> = ref(-->
<!--  {} as AdminRegisterRequest,-->
<!--);-->
<!--const search = ref("");-->

<!--onMounted(async () => {-->
<!--  const res = await UserControllerService.bossAdminGetAdminListUsingPost();-->
<!--  if (res.code === 0) {-->
<!--    admin_list.value = res.data;-->
<!--  }-->
<!--});-->

<!--const deleteRow = async (index: number) => {-->
<!--  const res = await UserControllerService.adminCancelBanUserUsingPost(-->
<!--    admin_list.value[index].uuid,-->
<!--  );-->
<!--  if (res.code === 0) {-->
<!--    ElNotification.success({-->
<!--      title: "Success",-->
<!--      message: "取消成功",-->
<!--    });-->
<!--    admin_list.value.splice(index, 1);-->
<!--  }-->
<!--};-->

<!--const filterHandler = (-->
<!--  value: string,-->
<!--  row: User,-->
<!--  column: TableColumnCtx<User>,-->
<!--) => {-->
<!--  const property = column["property"];-->
<!--  return row[property] === value;-->
<!--};-->

<!--// 提交管理员信息-->
<!--const submitAdminInfo = async () => {-->
<!--  adminRegister.value.email += "@qq.com";-->
<!--  const res = await UserControllerService.bossAdminAddAdminUsingPost(-->
<!--    adminRegister.value,-->
<!--  );-->

<!--  if (res.code === 0) {-->
<!--    ElNotification.success({-->
<!--      title: "Success",-->
<!--      message: "管理员创建成功",-->
<!--    });-->
<!--    adminRegister.value = {};-->
<!--    centerDialogVisible.value = false;-->
<!--  } else {-->
<!--    ElNotification.error({-->
<!--      title: "Error",-->
<!--      message: res.message,-->
<!--    });-->
<!--    adminRegister.value.email = adminRegister.value.email?.split("@")[0];-->
<!--  }-->
<!--};-->
<!--</script>-->

<!--<template>-->
<!--  <el-table :data="filterTableData">-->
<!--    <el-table-column prop="uuid" label="用户ID" width="100" sortable />-->
<!--    <el-table-column prop="account" label="账户名" width="250" sortable>-->
<!--      <template #default="scope">-->
<!--        <el-tag type="primary">{{ scope.row.account }}</el-tag>-->
<!--      </template>-->
<!--    </el-table-column>-->
<!--    <el-table-column prop="email" label="QQ邮箱" width="200" />-->
<!--    <el-table-column prop="phone" label="电话号码" width="120" />-->
<!--    <el-table-column-->
<!--      prop="create_time"-->
<!--      label="管理员修改时间"-->
<!--      width="200"-->
<!--      sortable-->
<!--    >-->
<!--      <template #default="scope">-->
<!--        {{ dayjs(scope.row.create_time).format("YYYY-MM-DD HH:mm:ss") }}-->
<!--      </template>-->
<!--    </el-table-column>-->
<!--    <el-table-column prop="rating" label="竞赛分数" width="120" sortable>-->
<!--      <template #default="scope">-->
<!--        <el-tag type="primary" effect="dark" round>-->
<!--          {{ scope.row.rating }}-->
<!--        </el-tag>-->
<!--      </template>-->
<!--    </el-table-column>-->
<!--    <el-table-column-->
<!--      prop="school"-->
<!--      label="所属学校"-->
<!--      min-width="120"-->
<!--      column-key="school"-->
<!--      :filters="[{ text: '豫章师范学院', value: '豫章师范学院' }]"-->
<!--      :filter-method="filterHandler"-->
<!--      sortable-->
<!--    />-->
<!--    <el-table-column prop="school" label="操作" min-width="120">-->
<!--      <template #header>-->
<!--        <el-input v-model="search" size="large" placeholder="搜索关键词" />-->
<!--      </template>-->
<!--      <template #default="scope">-->
<!--        <el-button type="danger" round @click="deleteRow(scope.$index)"-->
<!--          >取消管理员权限-->
<!--        </el-button>-->
<!--      </template>-->
<!--    </el-table-column>-->
<!--  </el-table>-->
<!--  <el-button plain @click="centerDialogVisible = true"> 添加管理员</el-button>-->

<!--  <el-dialog-->
<!--    v-model="centerDialogVisible"-->
<!--    title="填写管理员信息"-->
<!--    width="500"-->
<!--    center-->
<!--  >-->
<!--    <div class="flex gap-4 mb-4 items-center">-->
<!--      <span>账户：</span>-->
<!--      <el-input-->
<!--        v-model="adminRegister.account"-->
<!--        style="width: 370px; margin: 10px 20px"-->
<!--        size="large"-->
<!--        placeholder="填写账户名"-->
<!--        clearable-->
<!--      />-->
<!--      <div>-->
<!--        <span>密码：</span>-->
<!--        <el-input-->
<!--          v-model="adminRegister.password"-->
<!--          style="width: 370px; margin: 10px 20px"-->
<!--          size="large"-->
<!--          placeholder="填写密码"-->
<!--          clearable-->
<!--        />-->
<!--      </div>-->
<!--      <div>-->
<!--        <span>确认密码：</span>-->
<!--        <el-input-->
<!--          v-model="adminRegister.checkPassword"-->
<!--          style="width: 370px; margin: 10px -5px"-->
<!--          size="large"-->
<!--          placeholder="填写密码"-->
<!--          clearable-->
<!--        />-->
<!--      </div>-->
<!--      <div>-->
<!--        <span>QQ邮箱：</span>-->
<!--        <el-input-->
<!--          v-model="adminRegister.email"-->
<!--          style="max-width: 370px"-->
<!--          size="large"-->
<!--          placeholder="填写QQ邮箱"-->
<!--          clearable-->
<!--        >-->
<!--          <template #append>@qq.com</template>-->
<!--        </el-input>-->
<!--      </div>-->
<!--      <div>-->
<!--        <span>电话号码：</span>-->
<!--        <el-input-->
<!--          v-model="adminRegister.phone"-->
<!--          style="max-width: 365px; margin: 10px 0"-->
<!--          size="large"-->
<!--          placeholder="请填写手机号"-->
<!--          clearable-->
<!--        />-->
<!--      </div>-->
<!--      <div>-->
<!--        <span>所属学校：</span>-->
<!--        <el-input-->
<!--          v-model="adminRegister.school"-->
<!--          style="max-width: 365px; margin: 10px 0"-->
<!--          size="large"-->
<!--          placeholder="请填写学校名称"-->
<!--          clearable-->
<!--        />-->
<!--      </div>-->
<!--    </div>-->
<!--    <template #footer>-->
<!--      <div class="dialog-footer">-->
<!--        <el-button @click="centerDialogVisible = false">取消</el-button>-->
<!--        <el-button type="primary" @click="submitAdminInfo"> 提交</el-button>-->
<!--      </div>-->
<!--    </template>-->
<!--  </el-dialog>-->
<!--</template>-->

<!--<style scoped></style>-->

<template>
  <el-container class="rbac-container">
    <!-- 侧边栏 - 用户列表 (带分页) -->
    <el-aside width="280px" class="user-sidebar">
      <div class="sidebar-header">
        <h3>用户管理</h3>
        <el-input
            v-model="userSearch"
            placeholder="搜索用户"
            clearable
            prefix-icon="el-icon-search"
            @clear="handleSearchClear"
            @keyup.enter="handleUserSearch"
        />
      </div>
      <el-scrollbar class="user-list-scroll">
        <div class="user-count">共 {{ totalUsers }} 个用户</div>
        <el-skeleton :loading="loadingUsers" animated :count="5">
          <template #template>
            <div class="skeleton-item">
              <el-skeleton-item variant="circle" style="width: 30px; height: 30px" />
              <el-skeleton-item variant="text" style="width: 60%; margin-left: 10px" />
            </div>
          </template>
          <template #default>
            <el-menu
                :default-active="activeUser"
                @select="handleUserSelect"
            >
              <el-menu-item
                  v-for="user in userList"
                  :key="user.id"
                  :index="user.id.toString()"
              >
                <el-avatar :size="30" :src="user.avatar" class="user-avatar" />
                <span>{{ user.name }}</span>
                <el-tag size="mini" :type="user.status === 'active' ? 'success' : 'danger'">
                  {{ user.status === 'active' ? '活跃' : '禁用' }}
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
              :page-size="pageSize"
              :current-page="currentPage"
              :page-sizes="[10, 20, 50, 100]"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
          />
        </div>
      </el-scrollbar>
    </el-aside>

    <!-- 主内容区 - 权限分配 -->
    <el-main class="permission-main">
      <div v-if="selectedUser" class="permission-content">
        <div class="user-info-header">
          <el-avatar :size="60" :src="selectedUser.avatar" />
          <div class="user-info">
            <h3>{{ selectedUser.name }}</h3>
            <p>{{ selectedUser.email }}</p>
            <div class="user-meta">
              <el-tag size="small">{{ selectedUser.department }}</el-tag>
              <el-tag size="small" :type="selectedUser.status === 'active' ? 'success' : 'danger'">
                {{ selectedUser.status === 'active' ? '活跃' : '禁用' }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="permission-section">
          <div class="section-header">
            <h4>当前权限</h4>
            <el-button
                type="primary"
                size="small"
                @click="showPermissionDialog"
                :loading="loadingPermissions"
            >
              分配权限
            </el-button>
          </div>

          <el-skeleton :loading="loadingPermissions" animated :count="3">
            <template #template>
              <el-skeleton-item variant="text" style="width: 100px; margin-right: 10px" />
            </template>
            <template #default>
              <el-tag
                  v-for="permission in userPermissions"
                  :key="permission.id"
                  closable
                  @close="removePermission(permission.id)"
                  class="permission-tag"
              >
                {{ permission.name }}
              </el-tag>

              <p v-if="!loadingPermissions && userPermissions.length === 0" class="empty-tip">
                该用户暂无任何权限
              </p>
            </template>
          </el-skeleton>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-icon :size="60" class="empty-icon">
          <User />
        </el-icon>
        <p>请从左侧选择用户以查看或分配权限</p>
      </div>
    </el-main>

    <!-- 权限分配对话框 -->
    <el-dialog
        title="分配权限"
        v-model="permissionDialogVisible"
        width="60%"
        top="5vh"
    >
      <div class="permission-dialog-content">
        <el-input
            v-model="permissionSearch"
            placeholder="搜索权限"
            clearable
            prefix-icon="el-icon-search"
            class="permission-search"
        />

        <el-skeleton :loading="loadingAllPermissions" animated :count="5">
          <template #default>
            <el-tree
                ref="permissionTree"
                :data="allPermissions"
                :props="permissionProps"
                node-key="id"
                show-checkbox
                default-expand-all
                :default-checked-keys="checkedPermissions"
                :filter-node-method="filterPermissionNode"
                class="permission-tree"
                v-loading="updatingPermissions"
            />
          </template>
        </el-skeleton>
      </div>

      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            @click="savePermissions"
            :loading="updatingPermissions"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  components: {
    User
  },
  setup() {
    // 用户相关状态
    const userList = ref([])
    const totalUsers = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(20)
    const userSearch = ref('')
    const activeUser = ref('')
    const selectedUser = ref(null)
    const loadingUsers = ref(false)

    // 权限相关状态
    const allPermissions = ref([])
    const userPermissions = ref([])
    const permissionDialogVisible = ref(false)
    const permissionSearch = ref('')
    const checkedPermissions = ref([])
    const loadingPermissions = ref(false)
    const loadingAllPermissions = ref(false)
    const updatingPermissions = ref(false)

    // 权限树配置
    const permissionProps = {
      children: 'children',
      label: 'name'
    }

    // 获取用户列表 (带分页)
    const fetchUsers = async (page = 1, search = '') => {
      loadingUsers.value = true
      try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 500))

        // 实际项目中替换为:
        // const response = await api.getUsers({
        //   page,
        //   pageSize: pageSize.value,
        //   search
        // })
        // userList.value = response.data.list
        // totalUsers.value = response.data.total

        // 模拟数据
        const allUsers = generateMockUsers(1000)

        // 模拟搜索过滤
        let filteredUsers = allUsers
        if (search) {
          filteredUsers = allUsers.filter(user =>
              user.name.toLowerCase().includes(search.toLowerCase()) ||
              user.email.toLowerCase().includes(search.toLowerCase())
          )
        }

        // 模拟分页
        const start = (page - 1) * pageSize.value
        const end = start + pageSize.value
        const paginatedUsers = filteredUsers.slice(start, end)

        userList.value = paginatedUsers
        totalUsers.value = filteredUsers.length
        currentPage.value = page

        // 如果当前选中的用户不在本页，则清空选中状态
        if (selectedUser.value && !paginatedUsers.some(u => u.id === selectedUser.value.id)) {
          selectedUser.value = null
          activeUser.value = ''
          userPermissions.value = []
        }
      } catch (error) {
        console.error('获取用户列表失败:', error)
        ElMessage.error('获取用户列表失败')
      } finally {
        loadingUsers.value = false
      }
    }

    // 生成模拟用户数据
    const generateMockUsers = (count) => {
      const departments = ['技术部', '产品部', '市场部', '销售部', '人事部', '财务部']
      const statuses = ['active', 'inactive']
      const avatars = [
        'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
      ]

      return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `用户${i + 1}`,
        email: `user${i + 1}@example.com`,
        avatar: avatars[i % avatars.length],
        department: departments[i % departments.length],
        status: statuses[i % statuses.length],
        lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }))
    }

    // 页码变化处理
    const handlePageChange = (page) => {
      currentPage.value = page
      fetchUsers(page, userSearch.value)
    }

    // 每页大小变化处理
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
      fetchUsers(1, userSearch.value)
    }

    // 用户搜索处理
    const handleUserSearch = () => {
      currentPage.value = 1
      fetchUsers(1, userSearch.value)
    }

    // 搜索框清空处理
    const handleSearchClear = () => {
      if (userSearch.value === '') return
      userSearch.value = ''
      currentPage.value = 1
      fetchUsers(1, '')
    }

    // 选择用户
    const handleUserSelect = (userId) => {
      activeUser.value = userId
      selectedUser.value = userList.value.find(user => user.id === parseInt(userId))
      fetchUserPermissions(parseInt(userId))
    }

    // 获取所有权限
    const fetchAllPermissions = async () => {
      loadingAllPermissions.value = true
      try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 500))

        // 实际项目中替换为:
        // const response = await api.getAllPermissions()
        // allPermissions.value = response.data

        // 模拟数据
        allPermissions.value = [
          {
            id: 1,
            name: '系统管理',
            children: [
              { id: 101, name: '用户管理' },
              { id: 102, name: '角色管理' },
              { id: 103, name: '权限管理' },
              { id: 104, name: '系统设置' }
            ]
          },
          {
            id: 2,
            name: '内容管理',
            children: [
              { id: 201, name: '文章管理' },
              { id: 202, name: '分类管理' },
              { id: 203, name: '标签管理' },
              { id: 204, name: '评论管理' }
            ]
          },
          {
            id: 3,
            name: '数据统计',
            children: [
              { id: 301, name: '访问统计' },
              { id: 302, name: '用户行为' },
              { id: 303, name: '业务报表' }
            ]
          },
          {
            id: 4,
            name: '订单管理',
            children: [
              { id: 401, name: '订单列表' },
              { id: 402, name: '退款管理' },
              { id: 403, name: '物流管理' }
            ]
          }
        ]
      } catch (error) {
        console.error('获取权限列表失败:', error)
        ElMessage.error('获取权限列表失败')
      } finally {
        loadingAllPermissions.value = false
      }
    }

    // 获取用户权限
    const fetchUserPermissions = async (userId) => {
      loadingPermissions.value = true
      try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 300))

        // 实际项目中替换为:
        // const response = await api.getUserPermissions(userId)
        // userPermissions.value = response.data.permissions
        // checkedPermissions.value = response.data.permissionIds

        // 模拟不同用户有不同的权限
        const permissionsMap = {
          1: [101, 102, 201, 301],
          2: [201, 202, 203],
          3: [301, 302],
          4: [401, 402],
          5: [101, 103, 303],
          6: [202, 204, 401],
          7: [102, 302, 403],
          8: [201, 301, 401],
          9: [103, 203, 303],
          10: [104, 204, 304, 404]
        }

        const permissionIds = permissionsMap[userId % 10] || []

        // 从所有权限中找出用户拥有的权限
        const findPermissions = (nodes) => {
          let result = []
          nodes.forEach(node => {
            if (permissionIds.includes(node.id)) {
              result.push({ id: node.id, name: node.name })
            }
            if (node.children) {
              result = result.concat(findPermissions(node.children))
            }
          })
          return result
        }

        userPermissions.value = findPermissions(allPermissions.value)
        checkedPermissions.value = permissionIds
      } catch (error) {
        console.error('获取用户权限失败:', error)
        ElMessage.error('获取用户权限失败')
      } finally {
        loadingPermissions.value = false
      }
    }

    // 显示权限分配对话框
    const showPermissionDialog = () => {
      permissionDialogVisible.value = true
    }

    // 权限树搜索过滤
    const filterPermissionNode = (value, data) => {
      if (!value) return true
      return data.name.toLowerCase().includes(value.toLowerCase())
    }

    // 监听权限搜索
    watch(permissionSearch, (val) => {
      const tree = this.$refs.permissionTree
      if (tree) {
        tree.filter(val)
      }
    })

    // 移除权限
    const removePermission = async (permissionId) => {
      try {
        updatingPermissions.value = true
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 300))

        // 实际项目中替换为:
        // await api.removeUserPermission(selectedUser.value.id, permissionId)

        userPermissions.value = userPermissions.value.filter(p => p.id !== permissionId)
        checkedPermissions.value = checkedPermissions.value.filter(id => id !== permissionId)

        ElMessage.success('权限移除成功')
      } catch (error) {
        console.error('移除权限失败:', error)
        ElMessage.error('移除权限失败')
      } finally {
        updatingPermissions.value = false
      }
    }

    // 保存权限
    const savePermissions = async () => {
      try {
        updatingPermissions.value = true
        const tree = this.$refs.permissionTree
        const checkedKeys = tree.getCheckedKeys()

        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 800))

        // 实际项目中替换为:
        // await api.updateUserPermissions(selectedUser.value.id, checkedKeys)

        // 更新本地状态
        checkedPermissions.value = checkedKeys
        userPermissions.value = []

        // 从所有权限中找出选中的权限
        const findPermissions = (nodes) => {
          let result = []
          nodes.forEach(node => {
            if (checkedKeys.includes(node.id)) {
              result.push({ id: node.id, name: node.name })
            }
            if (node.children) {
              result = result.concat(findPermissions(node.children))
            }
          })
          return result
        }

        userPermissions.value = findPermissions(allPermissions.value)
        permissionDialogVisible.value = false

        ElMessage.success('权限更新成功')
      } catch (error) {
        console.error('保存权限失败:', error)
        ElMessage.error('保存权限失败')
      } finally {
        updatingPermissions.value = false
      }
    }

    // 初始化数据
    onMounted(() => {
      fetchUsers()
      fetchAllPermissions()
    })

    return {
      // 状态
      userList,
      totalUsers,
      currentPage,
      pageSize,
      userSearch,
      activeUser,
      selectedUser,
      loadingUsers,

      allPermissions,
      userPermissions,
      permissionDialogVisible,
      permissionSearch,
      checkedPermissions,
      permissionProps,
      loadingPermissions,
      loadingAllPermissions,
      updatingPermissions,

      // 方法
      handlePageChange,
      handleSizeChange,
      handleUserSearch,
      handleSearchClear,
      handleUserSelect,
      showPermissionDialog,
      filterPermissionNode,
      removePermission,
      savePermissions
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
  background-color: #ffffff;
  border-right: 1px solid #e6e6e6;
  height: 100%;

  .sidebar-header {
    padding: 20px;

    h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
      font-size: 18px;
    }
  }

  .user-list-scroll {
    height: calc(100% - 80px);

    .user-count {
      padding: 10px 20px;
      font-size: 12px;
      color: #999;
      border-bottom: 1px solid #f0f0f0;
    }

    .el-menu {
      border-right: none;

      .el-menu-item {
        height: 60px;
        display: flex;
        align-items: center;

        .user-avatar {
          margin-right: 10px;
        }

        .el-tag {
          margin-left: auto;
        }
      }
    }

    .pagination-container {
      padding: 10px;
      display: flex;
      justify-content: center;
      border-top: 1px solid #f0f0f0;

      .el-pagination {
        margin: 0;
      }
    }

    .skeleton-item {
      padding: 15px 20px;
      display: flex;
      align-items: center;
    }
  }
}

.permission-main {
  padding: 20px;

  .permission-content {
    background-color: #fff;
    border-radius: 4px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    .user-info-header {
      display: flex;
      align-items: center;

      .user-info {
        margin-left: 20px;

        h3 {
          margin: 0;
          font-size: 20px;
          color: #333;
        }

        p {
          margin: 5px 0;
          color: #666;
        }

        .user-meta {
          margin-top: 5px;

          .el-tag {
            margin-right: 5px;
          }
        }
      }
    }

    .permission-section {
      margin-top: 20px;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;

        h4 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }
      }

      .permission-tag {
        margin-right: 10px;
        margin-bottom: 10px;
      }

      .empty-tip {
        color: #999;
        font-size: 14px;
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;

    .empty-icon {
      margin-bottom: 20px;
    }

    p {
      font-size: 16px;
    }
  }
}

.permission-dialog-content {
  .permission-search {
    margin-bottom: 15px;
  }

  .permission-tree {
    max-height: 60vh;
    overflow-y: auto;
    padding: 10px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
  }
}
</style>