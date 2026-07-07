<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";

type Box = {
  avatar_url: string;
  post_id?: number;
  link?: string;
  description: string;
  title: string;
  author: string;
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
    },
    {
      avatar_url: "https://eu.snapmaker.com/cdn/shop/files/U1_c9534a17-eea4-4937-b1d6-13b45ccc7ca0.webp?crop=center&height=1200&v=1763625623&width=1200",
      link: "https://printer.byteoj.com/webcam/player",
      description: "ByteOJ 附属项目，用于远程实时查看 Snapmaker U1 打印机的打印进度与现场信息",
      title: "Colorful-U1",
      author: "薛晓春(主)、小刘(辅)",
    },
    // {
    //   avatar_url: "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502171441563.ico",
    //   post_id: 258,
    //   description: "2509 实验室为大一学生开发的可以进行在 WeLearn(部分书籍) 进行自动刷题的脚本工具",
    //   title: "WeLearn_Script",
    //   author: "刘遵儒",
    // },
  ];
});
</script>

<template>
  <div class="m-4 flex flex-wrap gap-4">
    <component
      :is="box.link ? 'a' : 'router-link'"
      v-for="(box, index) in boxList"
      :key="box.link ?? box.post_id"
      :to="box.link ? undefined : '/posts/' + box.post_id"
      :href="box.link"
      class="card bg-base-100 w-72 shadow-xl no-underline hover:shadow-2xl transition-shadow duration-300"
    >
      <div class="px-4 pt-4">
        <img
            :src="box.avatar_url"
            :alt="box.title"
            class="rounded-xl h-40 w-full object-cover"
        />
      </div>
      <div class="card-body">
        <h2 class="card-title">
          {{ box.title }}
          <div v-if="index === 0" class="badge badge-secondary">NEW</div>
        </h2>
        <p class="text-sm text-gray-500 font-bold">作者: {{ box.author }}</p>
        <p class="text-sm text-gray-600">{{ box.description }}</p>
      </div>
    </component>
  </div>
</template>

<style scoped>
/* 可以在这里添加自定义样式 */
</style>
