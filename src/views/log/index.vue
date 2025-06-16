<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import LogManagement from './LogManagement.vue';
import LogDetail from './LogDetail.vue';
import LogAnalysis from './LogAnalysis.vue';

const router = useRouter();
const route = useRoute();

// Current view 
// 'management' | 'detail' | 'analysis'
const currentView = ref(route.query.view || 'management');
const logType = ref(route.query.type || '');
const logId = ref(route.query.id || '');

// Handle navigation
const navigateTo = (view: string, params: Record<string, any> = {}) => {
  const query = { view, ...params };
  router.push({ path: '/log', query });
  currentView.value = view;
  logType.value = params.type || '';
  logId.value = params.id || '';
};
</script>

<template>
  <div class="log-container">
    <LogManagement v-if="currentView === 'management'" @view-detail="navigateTo('detail', { type: $event.type, id: $event.id })" @view-analysis="navigateTo('analysis')" />
    <LogDetail v-if="currentView === 'detail'" :log-type="logType" :log-id="Number(logId)" @back="navigateTo('management')" />
    <LogAnalysis v-if="currentView === 'analysis'" @back="navigateTo('management')" />
  </div>
</template>

<style scoped>
.log-container {
  width: 100%;
  height: 100%;
}
</style> 