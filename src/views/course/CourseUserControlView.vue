<template>
  <el-button size="small" type="danger" @click="handleSet">
    添加选中用户到当前课程
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
    <el-table-column label="账户名" prop="name" width="200">
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
    <el-table-column label="QQ邮箱" prop="email" />
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
          v-if="scope.row.role == '1'"
          size="small"
          type="success"
          @click="SetOne(scope.$index, scope.row.uuid)"
        >
          加入课程
        </el-button>
        <el-button
          v-if="scope.row.role == '3'"
          size="small"
          type="danger"
          @click="cancelSet(scope.$index, scope.row.uuid)"
        >
          踢出课程
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
import {
  CourseControllerService,
  User,
  UserControllerService,
} from "../../../generated";
import router from "../../router";

const path = router.currentRoute.value.fullPath;
const course_id = parseInt(path.toString().split("/")[3]);
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
const cancelSet = async (index: number, uuid: number) => {
  console.log(index, uuid);
  // const res = await UserControllerService.adminCancelBanUserUsingPost(uuid);
  // if (res.code === 0) {
  //   ElNotification.success({
  //     title: "Success",
  //     message: "解除封禁成功",
  //   });
  //   user_list.value[index].role = 1;
  // } else {
  //   ElNotification.error({
  //     title: "Error",
  //     message: res.message,
  //   });
  // }
};

// 设置
const SetOne = async (index: number, uuid: number) => {
  const uuid_list: number[] = [];
  uuid_list.push(uuid);
  user_list.value[index].role = 1;
  const res = await CourseControllerService.courseAdminUserSetUsingPost({
    user_list: uuid_list,
    course_id: course_id,
  });
  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "设置成功",
    });
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
    });
  }
};

// 课程加入到选中用户当中
const handleSet = async () => {
  let uuid_list: number[] = [];
  selectedRows.value.forEach((user: any) => {
    uuid_list.push(user.uuid);
  });
  if (uuid_list.length == 0) {
    ElNotification.error({
      title: "Error",
      message: "请选择需要设置的用户",
    });
    return;
  }

  const res = await CourseControllerService.courseAdminUserSetUsingPost({
    user_list: uuid_list,
    course_id: course_id,
  });
  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "设置成功",
    });
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
    });
  }
};
</script>
