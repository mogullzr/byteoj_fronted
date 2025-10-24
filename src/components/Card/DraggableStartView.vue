<script setup lang="ts">
import { ref } from 'vue';
import DraggableWindowView from "@/components/Card/DraggableWindowView.vue";
import ChatBoxView from "@/view/AI/ChatBoxView.vue";

const props = defineProps<{
  status: number
}>();
const windows = ref<{ id: number; title: string; content: string; position: { x: number; y: number }; size: { width: number; height: number }; minimized: boolean }[]>([]);
let windowId = 0;

const createWindow = (type: string) => {
  windows.value.push({
    id: windowId++,
    title: type,
    content: `这是 ${type} 的内容。`,
    position: { x: 100, y: 100 },
    size: { width: 300, height: 200 },
    minimized: false,
  });
};

const removeWindow = (id: number) => {
  windows.value = windows.value.filter(window => window.id !== id);
};

const toggleMinimizeWindow = (id: number) => {
  const window = windows.value.find(window => window.id === id);
  if (window) {
    window.minimized = !window.minimized;
  }
};
</script>

<template>
  <div class="flex items-center">
    <div>
      <button @click="createWindow('AI对话窗口')">新建窗口</button>
      <DraggableWindowView
          v-for="window in windows"
          :key="window.id"
          :title="window.title"
          :position="window.position"
          :size="window.size"
          @close="removeWindow(window.id)"
          @minimize="toggleMinimizeWindow(window.id)"
      >
        <ChatBoxView :status="props.status"/>
      </DraggableWindowView>
    </div>
  </div>
</template>