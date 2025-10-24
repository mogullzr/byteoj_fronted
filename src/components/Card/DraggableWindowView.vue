<template>
  <vue-draggable-resizable
      style="background-color: white; z-index: 9999; position: absolute; border-radius: 10px"
      v-if="!isMinimized"
      :w="size.width"
      :h="size.height"
      :x="position.x"
      :y="position.y"
      :min-width="200"
      :min-height="150"
      :draggable="!fixed"
      :resizable="!fixed"
      @dragging="onDrag"
      @resizing="onResize"
  >
    <div class="window">
      <div class="window-header">
        <span class="window-title">{{ title }}</span>
        <div class="window-controls">
          <button class="minimize-btn" @click="emit('minimize')">−</button>
          <button class="close-btn" @click="emit('close')">×</button>
          <button class="fixed-btn" @click="toggleFixed">
            {{ fixed ? "解锁" : "锁定" }}
          </button>
        </div>
      </div>
      <div class="window-content" ref="contentRef">
        <slot></slot>
      </div>
    </div>
  </vue-draggable-resizable>
</template>

<script setup lang="ts">
import { ref } from "vue";
import VueDraggableResizable from "vue-draggable-resizable";

const props = defineProps({
  title: {
    type: String,
    default: "New Window",
  },
  initialPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0 }),
  },
  initialSize: {
    type: Object,
    default: () => ({ width: 520, height: 200 }),
  },
  isMinimized: {
    type: Boolean,
    default: false,
  },
  fixed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "minimize", "update:fixed"]);

const position = ref({ x: props.initialPosition.x, y: props.initialPosition.y });
const size = ref({ width: props.initialSize.width, height: props.initialSize.height });

const toggleFixed = () => {
  emit("update:fixed", !props.fixed);
};

const onDrag = (newPos: { x: number; y: number }) => {
  if (!props.fixed) {
    position.value = {
      x: Math.round(newPos.x),
      y: Math.round(newPos.y),
    };
  }
};

const onResize = (newSize: { width: number; height: number }) => {
  if (!props.fixed) {
    size.value = newSize;
  }
};
</script>

<style scoped>
vue-draggable-resizable {
  backface-visibility: hidden; /* 防止字体模糊 */
}

.window {
  width: auto;
  height: auto;
  border: 1px solid #ddd;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.window-header {
  padding: 10px;
  background: linear-gradient(to bottom, #f9f9f9, #eaeaea);
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.window-title {
  flex-grow: 1;
}

.window-controls {
  display: flex;
  gap: 8px;
}

.close-btn,
.minimize-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #ff5c5c;
}

.minimize-btn:hover {
  color: #4caf50;
}

.window-content {
  padding: 16px;
  flex-grow: 1;
  overflow-y: auto;
  background: #fafafa;
  -webkit-font-smoothing: antialiased; /* 字体抗锯齿 */
  font-smoothing: antialiased; /* 字体抗锯齿 */
}
</style>