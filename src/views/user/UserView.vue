<template>
  <el-button size="small" type="danger" @click="handleDelete">
    封禁选中用户
  </el-button>
  <el-table
    :data="filterTableData"
    style="width: 100%"
    @selection-change="handleSelectionChange"
    ref="tableRef"
  >
    <el-table-column type="selection" width="55" />
    <el-table-column label="序号" type="index" width="60">
      <template #default="scope">
        <div>{{ (currentPage - 1) * 15 + scope.$index + 1 }}</div>
      </template>
    </el-table-column>
    <el-table-column label="用户ID" prop="uuid" width="100" sortable />
    <el-table-column label="账户名" prop="name">
      <template #default="scope">
        <el-popover effect="light" trigger="hover" placement="top" width="auto">
          <template #default>
            <div>用户名: {{ scope.row.username }}</div>
            <div>手机号: {{ scope.row.phone }}</div>
          </template>
          <template #reference>
            <el-tag>{{ scope.row.account }}</el-tag>
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column label="性别" width="90" prop="gender" sortable>
      <template #default="scope">
        <el-tag v-if="scope.row.gender === '男性'" type="primary">男性</el-tag>
        <el-tag v-else-if="scope.row.gender === '女性'" type="danger"
          >女性
        </el-tag>
        <el-tag v-else type="info">未知</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="Date" width="190" prop="create_time" sortable>
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <el-icon>
            <timer />
          </el-icon>
          <span style="margin-left: 10px">
            {{ dayjs(scope.row.create_time).format("YYYY-MM-DD HH:mm:ss") }}
          </span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="rate" width="80" prop="rating" sortable />
    <el-table-column align="right">
      <template #header>
        <el-input v-model="search" size="large" placeholder="搜索关键词" />
      </template>
      <template #default="scope">
        <el-button
          v-if="useStore.loginUser.role == 2 && useStore.loginUser.uuid == 9"
          size="small"
          type="primary"
          @click="BossSetAdmin(scope.$index, scope.row.uuid)"
        >
          设置管理员
        </el-button>
        <el-button
          v-if="scope.row.role == '1'"
          size="small"
          type="success"
          @click="deleteOne(scope.$index, scope.row.uuid)"
        >
          封禁账户
        </el-button>
        <el-button
          v-if="scope.row.role == '3'"
          size="small"
          type="danger"
          @click="cancelDelete(scope.$index, scope.row.uuid)"
        >
          解除封禁
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <div class="demo-pagination-block" style="margin: 10px auto; float: right">
    <div class="demonstration"></div>
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="15"
      :size="size"
      :background="background"
      layout="prev, pager, next, jumper"
      :total="15 * pageSize"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<style scoped>
.demo-pagination-block + .demo-pagination-block {
  margin-top: 10px;
}
.demo-pagination-block .demonstration {
  margin-bottom: 16px;
}
</style>
<script lang="ts" setup>
import { computed, onMounted, ref, Ref } from "vue";
import dayjs from "dayjs";
import { ComponentSize, ElNotification } from "element-plus";
import { User, UserControllerService } from "../../../generated";
import UseStore from "../../store/store.ts";

const useStore = UseStore();
const search = ref("");
const user_list: Ref<User[]> = ref([]);
const selectedRows = ref<User[]>([]);
const currentPage = ref(1);
const pageSize = ref(1);
const size = ref<ComponentSize>("default");
const background = ref(false);

const handleCurrentChange = async (val: number) => {
  const res = await UserControllerService.adminGetUserListUsingPost(val);
  if (res.code === 0) {
    user_list.value = res.data;
  } else {
  }
};

onMounted(async () => {
  const res = await UserControllerService.adminGetUserListUsingPost(1);
  if (res.code === 0) {
    user_list.value = res.data;
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
    });
  }

  const response = await UserControllerService.adminGetUserPagesUsingPost();
  if (response.code === 0) {
    pageSize.value = response.data;
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
    });
  }
});

const filterTableData = computed(() =>
  user_list.value.filter(
    (data) =>
      !search.value ||
      data.username?.toLowerCase().includes(search.value.toLowerCase()) ||
      data.account?.toLowerCase().includes(search.value.toLowerCase()) ||
      data.gender?.includes(search.value) ||
      data.uuid == parseInt(search.value),
  ),
);

const handleSelectionChange = (selection: User[]) => {
  selectedRows.value = selection;
};

// 解除封禁某个uuid用户
const cancelDelete = async (index: number, uuid: number) => {
  const res = await UserControllerService.adminCancelBanUserUsingPost(uuid);
  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "解除封禁成功",
    });
    user_list.value[index].role = 1;
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
    });
  }
};

// 删封禁某个uuid用户
const deleteOne = async (index: number, uuid: number) => {
  const list: Ref<number[]> = ref([]);
  list.value.push(uuid);
  const res = await UserControllerService.adminBanUserListUsingPost(list.value);
  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "封禁成功",
    });
    user_list.value[index].role = 3;
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
    });
  }
};

// 封禁选中用户
const handleDelete = async () => {
  let uuid_list: number[] = [];
  selectedRows.value.forEach((user: any) => {
    uuid_list.push(user.uuid);
  });
  if (uuid_list.length == 0) {
    ElNotification.error({
      title: "Error",
      message: "请选择需要封禁的用户",
    });
    return;
  }
  const res = await UserControllerService.adminBanUserListUsingPost(uuid_list);
  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "封禁成功",
    });
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
    });
  }
};

// BOSS管理员设置管理员
const BossSetAdmin = async (index: number, uuid: number) => {
  const res = await UserControllerService.bossAdminSetAdminUsingPost(uuid);
  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "设置成功",
    });
    user_list.value.splice(index, 1);
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
    });
  }
};
</script>
