<template></template>

<script>
import { onMounted } from "vue";

export default {
  name: "PlaneGame",
  setup() {
    const startGame = () => {
      // 动态创建script标签加载游戏
      const script = document.createElement("script");
      script.src = "/plane.js";
      script.onload = () => {
        window.KICKASSGAME = new KickAss();
      };
      document.body.appendChild(script);
    };
    onMounted(() => {
      startGame();
    });
    return {
      startGame,
    };
  },
};
</script>

<style scoped>
@import url("../../../public/plane.css");
</style>
