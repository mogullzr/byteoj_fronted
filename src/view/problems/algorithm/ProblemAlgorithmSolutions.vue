<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import { PostsControllerService, PostsVo } from "../../../../generated";
import router from "@/router";
import dayjs from "dayjs";

const path = router.currentRoute.value.fullPath;
const problem_id = ref(parseInt(path.toString().split("/")[3]));
const posts_list: Ref<PostsVo[]> = ref([]);

onMounted(async () => {
  const res = await PostsControllerService.postGetPostByProblemIdUsingPost(
    1,
    problem_id.value,
    2
  );

  if (res.code === 0) {
    posts_list.value = res.data;
    console.log(posts_list.value);
  } else if (res.code === 40101) {
    router.push("/404");
  }
});
</script>

<template>
  <div class="flex">
    <div class="flex-1"></div>
    <router-link
      class="btn btn-success text-white"
      :to="'/posts/' + problem_id + '/solution/add'"
    >
      <span>发题解</span>
      <span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
        >
          <path fill="#ffffff" d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" />
        </svg>
      </span>
    </router-link>
  </div>
  <div class="divider"></div>
  <div v-if="posts_list.length != 0">
    <div v-for="post in posts_list" :key="post.post_id">
      <div class="flex mt-4">
        <div class="avatar">
          <div class="rounded-full w-12 mx-3">
            <img
              @dragstart.prevent
              :src="post.avatar"
              alt="Mogullzr小刘的OJ项目"
            />
          </div>
        </div>
        <div class="w-2/12">
          <div class="font-bold">{{ post.author }}</div>
          <div class="text-gray-500">
            {{ post.school }}
          </div>
        </div>
        <div class="w-1/12 text-center">
          <div class="text-red-400 font-bold">
            {{ post.thumbs_up }}
          </div>
          <div>点赞</div>
        </div>
        <div class="w-1/12 text-center">
          <div class="text-red-400 font-bold">
            {{ post.reading }}
          </div>
          <div>浏览</div>
        </div>
        <router-link
          class="link link-error font-bold"
          :to="'/posts/' + post.post_id"
          >{{ post.title }}</router-link
        >
        <div class="flex-1"></div>
        <div class="text-gray-500">
          <router-link class="text-red-400 font-bold" to="">{{
            post.author
          }}</router-link>
          <span>
            于{{ dayjs(post.create_time).format("YYYY-MM-DD HH:mm:ss") }}创建
          </span>
        </div>
      </div>
      <div class="divider"></div>
    </div>
  </div>
  <div v-else class="mx-auto font-bold text-gray-400 text-center">
    <span class="my-4" style="font-size: 48px"> 暂无任何题解记录┭┮﹏┭┮ </span>
  </div>
</template>

<style scoped></style>
