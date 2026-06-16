<script setup>
import NavBarView from "../components/Menu/NavBarView.vue";
import DrawerBarView from "../components/Menu/DrawerBarView.vue";
import UseStore from "../store/store.ts";
const useStore = UseStore();
const isShow = useStore.isShow;
</script>

<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-aside width="200px" v-if="useStore.isShow == true">
        <DrawerBarView />
      </el-aside>
      <el-container>
        <el-header v-if="useStore.isShow == true">
          <NavBarView />
        </el-header>
        <el-main class="layout-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.common-layout,
.layout-container {
  min-height: 100vh;
}

.layout-container {
  margin: 0;
  padding: 0;
}

.layout-main {
  padding: 0;
  background: #f5f7fa;
}
</style>
