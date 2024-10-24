<template>
  <div
    :style="
      'background-image: url(' + useStore.loginUser.background_picture + ')'
    "
  >
    <basic-layout class="font-lazy" />
  </div>
</template>

<style scoped>
div {
  background-size: 100% 100%;
  background-attachment: fixed;
  min-height: 1000px;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
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
