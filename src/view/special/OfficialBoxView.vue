<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";

type Box = {
  avatar_url: string;
  post_id: number;
  description: string;
  title: string;
  author: string;
  reading: number;
};

const boxList: Ref<Box[]> = ref([]);

onMounted(() => {
  boxList.value = [
    {
      avatar_url: "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502171441563.ico",
      post_id: 257,
      description: "2509 实验室开发的一项集成C,C++,Python等环境的编辑器",
      title: "ByteIDE",
      author: "薛晓春",
      reading: 0,
    },
    // {
    //   avatar_url: "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502171441563.ico",
    //   post_id: 258,
    //   description: "2509 实验室为大一学生开发的可以进行在 WeLearn(部分书籍) 进行自动刷题的脚本工具",
    //   title: "WeLearn_Script",
    //   author: "刘遵儒",
    //   reading: 0,
    // },
  ];
});
</script>

<template>
  <div class="m-4 flex flex-wrap gap-4">
    <div
        v-for="(box, index) in boxList"
        :key="box.post_id"
          class="card bg-base-100 w-72 shadow-xl hover:shadow-2xl transition-shadow duration-300"
    >
      <router-link :to="'/posts/' + box.post_id" class="px-4 pt-4">
        <img
            :src="box.avatar_url"
            :alt="box.title"
            class="rounded-xl h-40 w-full object-cover"
        />
      </router-link>
      <div class="card-body">
        <h2 class="card-title">
          {{ box.title }}
          <div v-if="index === 0" class="badge badge-secondary">NEW</div>
        </h2>
        <p class="text-sm text-gray-500 font-bold">作者: {{ box.author }}</p>
        <p class="text-sm text-gray-600">{{ box.description }}</p>
        <div class="card-actions justify-end mt-2">
          <div class="badge badge-outline">阅读量: {{ box.reading }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 可以在这里添加自定义样式 */
</style>