<script setup lang="ts">
import NavBarView from "../components/Menu/NavBarView.vue";
import DrawerBarView from "../components/Menu/DrawerBarView.vue";
import UseStore from "../store/store.ts";
const useStore = UseStore();
</script>

<template>
  <div class="common-layout">
    <el-container style="margin: 0; padding: 0">
      <el-aside width="200px" v-if="useStore.isShow == true">
        <DrawerBarView />
      </el-aside>
      <el-container>
        <el-header v-if="useStore.isShow == true">
          <NavBarView />
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped></style>
