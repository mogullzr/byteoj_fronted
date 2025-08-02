<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    :ellipsis="false"
    @select="handleSelect"
  >
    <el-menu-item index="0"> ByteOJ后台管理页面</el-menu-item>
    <el-menu-item index="1">管理员控制中心</el-menu-item>
    <el-sub-menu index="2">
      <template #title>
        <div class="demo-type">
          <el-avatar :size="50" @error="errorHandler">
            <img :src="useStore.loginUser.avatar" />
          </el-avatar>
        </div>
      </template>
      <el-menu-item
        index="2-1"
        v-if="
          useStore.loginUser.uuid == -1 &&
          (useStore.loginUser.role == 0 || useStore.loginUser.role == null)
        "
        @click="routerTo"
      >
        <el-icon size="40"><User /></el-icon> 登录</el-menu-item
      >
      <el-menu-item
        index="2-2"
        v-else-if="useStore.loginUser.role == 2"
        @click="userLogout"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="27"
          height="27"
          viewBox="0 0 24 24"
        >
          <path
            fill="#000000"
            d="M5.616 20q-.691 0-1.153-.462T4 18.384V15.27h1v3.115q0 .231.192.424t.423.192h12.77q.23 0 .423-.192t.192-.424V5.616q0-.231-.192-.424T18.384 5H5.616q-.231 0-.424.192T5 5.616V8.73H4V5.616q0-.691.463-1.153T5.616 4h12.769q.69 0 1.153.463T20 5.616v12.769q0 .69-.462 1.153T18.384 20zm5.23-4.077l-.707-.72l2.703-2.703H4v-1h8.842L10.14 8.796l.707-.719L14.77 12z"
          />
        </svg>
        <span style="font-size: 18px">注销</span></el-menu-item
      >
    </el-sub-menu>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import UseStore from "../../store/store.ts";
import router from "../../router";
import { UserControllerService } from "../../../generated";
import { ElNotification } from "element-plus";

const useStore = UseStore();
const errorHandler = () => true;
const activeIndex = ref("1");
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};

const routerTo = () => {
  router.push("/login");
};

// 用户注销
const userLogout = async () => {
  const res = await UserControllerService.userLogoutUsingPost();

  if (res.code === 0) {
    ElNotification.success({
      title: "注销成功",
      showClose: false,
    });
    router.replace("/login");
  } else {
    ElNotification.error({
      title: "注销失败",
      message: res.message ?? "未知错误",
      showClose: false,
    });
  }
};
</script>

<style>
.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}
</style>
