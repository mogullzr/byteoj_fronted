<script setup lang="ts"></script>

<template>
  <div class="card shadow-xl image-full">
    <figure>
      <img
        @dragstart.prevent
        src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png"
        alt="菜狗"
      />
    </figure>
    <div class="card-body">
      <h2 class="card-title">ByteOJ</h2>
      <p>Welcome to our ByteOJ</p>
      <div class="card-actions justify-end">
        <button class="btn btn-primary">开始代码</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
div {
  height: 20%;
  img {
    width: 100%;
    height: 20%;
    object-fit: cover;
  }
}
</style>
