<template>
  <div class="plane-game-container">
    <div class="planeOpt">
      <!--      <button @click="startGame">-->
      <!--        <div class="svg-wrapper">-->
      <!--          <svg-->
      <!--            xmlns="http://www.w3.org/2000/svg"-->
      <!--            viewBox="0 0 24 24"-->
      <!--            width="24"-->
      <!--            height="24"-->
      <!--          >-->
      <!--            <path fill="none" d="M0 0h24v24H0z"></path>-->
      <!--            <path-->
      <!--              fill="currentColor"-->
      <!--              d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"-->
      <!--            ></path>-->
      <!--          </svg>-->
      <!--        </div>-->
      <!--        <span>启动飞机大战</span>-->
      <!--      </button>-->
      <!--      <p>操作说明:</p>-->
      <!--      <p>- <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> 控制飞机移动</p>-->
      <!--      <p>- <kbd>Space</kbd> 发射子弹</p>-->
      <!--      <p>- <kbd>Esc</kbd> 退出游戏</p>-->
    </div>
  </div>
</template>

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
        window.KICKASSGAME.begin();
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
