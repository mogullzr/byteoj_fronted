<template>
  <div class="dynamic-container block float-left">
    <!-- 动态文字 -->
    <div class="dynamic-text">
      <span
          v-for="(char, index) in text"
          :key="index"
          :style="{ animationDelay: `${index * 0.1}s` }"
      >
        {{ char }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, Ref} from "vue";

const props = defineProps<{
  text: string
}>();
const text:Ref<string> = ref( props.text);
</script>

<style scoped>
.dynamic-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff; /* 白色背景 */
  overflow: hidden;
}

/* 动态文字 */
.dynamic-text {
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  font-weight: bold;
  color: #333; /* 深色文字 */
  text-transform: uppercase;
  position: relative;
}

.dynamic-text span {
  display: inline-block;
  position: relative;
  animation: colorChange 2s infinite, glow 1.5s infinite;
}

/* 颜色变化动画 */
@keyframes colorChange {
  0%, 100% {
    color: #333;
  }
  25% {
    color: #ff6f61; /* 珊瑚色 */
  }
  50% {
    color: #6b5b95; /* 紫色 */
  }
  75% {
    color: #88b04b; /* 绿色 */
  }
}

/* 发光效果动画 */
@keyframes glow {
  0%, 100% {
    text-shadow: 0 0 5px rgba(255, 111, 97, 0.5), 0 0 10px rgba(255, 111, 97, 0.5);
  }
  50% {
    text-shadow: 0 0 20px rgba(255, 111, 97, 0.8), 0 0 40px rgba(255, 111, 97, 0.8);
  }
}
</style>