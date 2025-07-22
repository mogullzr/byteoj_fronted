<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import { CourseControllerService } from "../../../generated/services/CourseControllerService";
import router from "../../router/index";

// const path = router.currentRoute.value.fullPath;
// const problem_id = ref(parseInt(path.toString().split("/")[3]));

const courses: Ref<any> = ref([] as any);

onMounted(async () => {
  const res = await CourseControllerService.courseSearchByPageNumUsingPost(1);
  if (res.code === 0) {
    courses.value = res.data;
  }
});
// const downloadFile = () => {
//   const iframe = document.createElement("iframe");
//   iframe.style.display = "none";
//   iframe.src =
//     "http://mogullzr001.oss-cn-beijing.aliyuncs.com/files/%E7%AE%97%E6%B3%95%E5%AD%A6%E4%B9%A0%E5%9F%BA%E6%9C%AC%E8%B7%AF%E7%BA%BF.xmind";
//   document.body.appendChild(iframe);
// }
</script>
<template>
  <div
    class="flex card card-compact bg-base-100 shadow-xl mx-auto"
    style="max-width: 1150px"
  >
    <div class="font-bold mx-auto text-4xl pt-6">ByteOJ原创学习路线</div>
    <a
      class="mx-auto btn bg-blue-300 hover:bg-blue-500 active:bg-blue-600 text-white text-lg m-4"
      href="https://mogullzr001.oss-cn-beijing.aliyuncs.com/files/Mogullzr%E7%BB%BC%E5%90%88%E5%AD%A6%E4%B9%A0%E8%B7%AF%E7%BA%BF%EF%BC%88%E5%8E%9F%E5%88%9B%EF%BC%89.xmind"
    >
      <span>学习路线</span>
    </a>

    <div
      class="container hover:bg-gray-100"
      v-for="course in courses"
      :key="course.course_id"
    >
      <div class="divider my-0 h-0"></div>
      <router-link
        class="flex flex-row pl-4 py-2"
        :to="'/study/' + course.course_id"
      >
        <div class="basis-7/12">
          <div class="flex">
            <div class="ml-4 flex w-full my-3">
              <div class="avatar p-0">
                <div class="w-20 rounded-full">
                  <img :src="course.avatar" alt="ByteOJ出品" />
                </div>
              </div>
              <div class="ml-4">
                <router-link
                  class="link link-hover text-xl"
                  :to="'study/' + course.course_id"
                  style="color: rgba(2, 132, 199, 0.99)"
                  >{{ course.course_title }}</router-link
                >
                <div class="text-gray-400">
                  {{ course.course_title_description }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="basis-3/12 text-center m-auto">
          <div class="text-gray-400 font-bold">参加人数</div>
          <div>{{ course.num }}</div>
        </div>
        <div class="basis-2/12 text-center m-auto">
          <div class="text-gray-400 font-bold">创建人</div>
          <div class="font-bold text-red-500">{{ course.create_name }}</div>
        </div>
      </router-link>
    </div>
    <div class="divider m-0 h-0"></div>
  </div>
</template>

<style scoped></style>
