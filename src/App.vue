<!--style="-->
<!--background-image: url('https://cdn.jsdelivr.net/gh/mogullzr/Typora_img@main/202412051119316.png');-->
<!--"-->
<template>
  <div
    class="background-container"
    :style="
      'background-image: url(' + useStore.loginUser.background_picture + ')'
    "
  >
    <basic-layout class="font-lazy" />
  </div>
</template>

<style scoped>
.background-container {
  /* 背景图片固定 */
  background-attachment: fixed;
  /* 背景图片覆盖整个容器 */
  background-size: cover;
  /* 背景图片居中 */
  background-position: center;
  /* 背景图片不重复 */
  background-repeat: no-repeat;
  /* 容器高度设置为100vh，确保背景图片覆盖整个视口 */
  min-height: 100vh;
  /* 容器宽度设置为100% */
  width: 100%;
  /* 其他样式 */
  justify-content: center;
  align-items: center;
  /* 确保背景容器覆盖整个视口 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 确保背景容器在其他内容之下 */
  z-index: -1;
}
</style>
<script setup>
import BasicLayout from "@/layout/BasicLayout.vue";
import UserStore from "@/store/user";

const useStore = UserStore();
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback) {
    callback = debounce(callback, 200);
    super(callback);
  }
};
</script>
