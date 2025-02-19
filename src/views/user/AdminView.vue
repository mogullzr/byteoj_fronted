<script setup lang="ts">
import { computed, onMounted, ref, Ref } from "vue";
import {
  AdminRegisterRequest,
  User,
  UserControllerService,
} from "../../../generated";
import dayjs from "dayjs";
import { ElNotification, TableColumnCtx } from "element-plus";

const admin_list: Ref<User[]> = ref([]);
const filterTableData = computed(() =>
  admin_list.value.filter(
    (data) =>
      !search.value ||
      data.account?.toLowerCase().includes(search.value.toLowerCase()) ||
      data.email?.includes(search.value) ||
      data.phone?.includes(search.value) ||
      data.uuid == parseInt(search.value) ||
      data.school?.includes(search.value),
  ),
);
const centerDialogVisible = ref(false);

const adminRegister: Ref<AdminRegisterRequest> = ref(
  {} as AdminRegisterRequest,
);
const search = ref("");

onMounted(async () => {
  const res = await UserControllerService.bossAdminGetAdminListUsingPost();
  if (res.code === 0) {
    admin_list.value = res.data;
  }
});

const deleteRow = async (index: number) => {
  const res = await UserControllerService.adminCancelBanUserUsingPost(
    admin_list.value[index].uuid,
  );
  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "取消成功",
    });
    admin_list.value.splice(index, 1);
  }
};

const filterHandler = (
  value: string,
  row: User,
  column: TableColumnCtx<User>,
) => {
  const property = column["property"];
  return row[property] === value;
};

// 提交管理员信息
const submitAdminInfo = async () => {
  adminRegister.value.email += "@qq.com";
  const res = await UserControllerService.bossAdminAddAdminUsingPost(
    adminRegister.value,
  );

  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "管理员创建成功",
    });
    adminRegister.value = {};
    centerDialogVisible.value = false;
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
    });
    adminRegister.value.email = adminRegister.value.email?.split("@")[0];
  }
};
</script>

<template>
  <el-table :data="filterTableData">
    <el-table-column prop="uuid" label="用户ID" width="100" sortable />
    <el-table-column prop="account" label="账户名" width="250" sortable>
      <template #default="scope">
        <el-tag type="primary">{{ scope.row.account }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="email" label="QQ邮箱" width="200" />
    <el-table-column prop="phone" label="电话号码" width="120" />
    <el-table-column
      prop="create_time"
      label="管理员修改时间"
      width="200"
      sortable
    >
      <template #default="scope">
        {{ dayjs(scope.row.create_time).format("YYYY-MM-DD HH:mm:ss") }}
      </template>
    </el-table-column>
    <el-table-column prop="rating" label="竞赛分数" width="120" sortable>
      <template #default="scope">
        <el-tag type="primary" effect="dark" round>
          {{ scope.row.rating }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      prop="school"
      label="所属学校"
      min-width="120"
      column-key="school"
      :filters="[{ text: '豫章师范学院', value: '豫章师范学院' }]"
      :filter-method="filterHandler"
      sortable
    />
    <el-table-column prop="school" label="操作" min-width="120">
      <template #header>
        <el-input v-model="search" size="large" placeholder="搜索关键词" />
      </template>
      <template #default="scope">
        <el-button type="danger" round @click="deleteRow(scope.$index)"
          >取消管理员权限
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-button plain @click="centerDialogVisible = true"> 添加管理员</el-button>

  <el-dialog
    v-model="centerDialogVisible"
    title="填写管理员信息"
    width="500"
    center
  >
    <div class="flex gap-4 mb-4 items-center">
      <span>账户：</span>
      <el-input
        v-model="adminRegister.account"
        style="width: 370px; margin: 10px 20px"
        size="large"
        placeholder="填写账户名"
        clearable
      />
      <div>
        <span>密码：</span>
        <el-input
          v-model="adminRegister.password"
          style="width: 370px; margin: 10px 20px"
          size="large"
          placeholder="填写密码"
          clearable
        />
      </div>
      <div>
        <span>确认密码：</span>
        <el-input
          v-model="adminRegister.checkPassword"
          style="width: 370px; margin: 10px -5px"
          size="large"
          placeholder="填写密码"
          clearable
        />
      </div>
      <div>
        <span>QQ邮箱：</span>
        <el-input
          v-model="adminRegister.email"
          style="max-width: 370px"
          size="large"
          placeholder="填写QQ邮箱"
          clearable
        >
          <template #append>@qq.com</template>
        </el-input>
      </div>
      <div>
        <span>电话号码：</span>
        <el-input
          v-model="adminRegister.phone"
          style="max-width: 365px; margin: 10px 0"
          size="large"
          placeholder="请填写手机号"
          clearable
        />
      </div>
      <div>
        <span>所属学校：</span>
        <el-input
          v-model="adminRegister.school"
          style="max-width: 365px; margin: 10px 0"
          size="large"
          placeholder="请填写学校名称"
          clearable
        />
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdminInfo"> 提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped></style>
