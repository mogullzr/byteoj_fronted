<script setup lang="ts">
import router from "../router";

const routerTo = () => {
  router.push("/home");
};
</script>

<template>
  <el-empty>
    <el-button type="primary" @click="routerTo">返回主页面</el-button>
  </el-empty>
</template>

<style scoped></style>
