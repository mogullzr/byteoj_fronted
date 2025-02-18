<script setup lang="ts">
import { ref } from 'vue';
import OfficialBoxView from "@/view/special/OfficialBoxView.vue";

const activeTab = ref('官网');

const tabs = [
  { id: '官网', label: '官网' },
];

const setActiveTab = (tabId: string) => {
  activeTab.value = tabId;
};
</script>

<template>
  <div class="card bg-base-100 shadow-xl mx-40">
    <div class="card-body">
      <h2 class="text-5xl font-bold text-center">ByteOJ应用中心</h2>
      <div class="mt-6">
        <!-- Tab 栏 -->
        <div class="tab-container">
          <button
              style="font-size: 20px"
              v-for="tab in tabs"
              :key="tab.id"
              @click="setActiveTab(tab.id)"
              :class="[
              'tab-button',
              'font-bold',
              activeTab === tab.id ? 'active' : '',
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
        <!-- 内容区域 -->
        <div>
          <div v-if="activeTab == '官网'">
            <OfficialBoxView />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* 整体 Tab 栏容器 */
.tab-container {
  @apply flex space-x-4 border-b border-gray-200;
}

/* Tab 按钮基础样式 */
.tab-button {
  @apply py-2 px-4 text-sm font-medium focus:outline-none transition-all duration-300 ease-in-out;
}

/* 默认 Tab 按钮样式 */
.tab-button:not(.active) {
  @apply text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-t-lg;
}

/* 激活 Tab 按钮样式 */
.tab-button.active {
  @apply text-blue-600 border-b-2 border-blue-600 bg-blue-50 rounded-t-lg shadow-sm;
}

/* 内容区域样式 */
.tab-content {
  @apply mt-4 p-6 bg-white rounded-lg shadow-sm border border-gray-100;
}
</style>