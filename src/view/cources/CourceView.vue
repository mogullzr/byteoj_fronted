<script setup lang="ts">
import { ref, Ref } from "vue";

// 假数据，根据这种json结构展示课程基本信息
const plans: Ref<any> = ref([
  {
    plan_id: 1,
    plan_title: "算法基础学习",
    plan_title_description:
      "如果你完全没有学习过算法，没有接触过算法，please come here",
    create_name: "Mogullzr",
    avatar:
      // 放置自己的图床地址
      "",
    plan_num: 0,
  },
  {
    plan_id: 1,
    plan_title: "算法基础学习",
    plan_title_description:
      "如果你完全没有学习过算法，没有接触过算法，please come here",
    create_name: "Mogullzr",
    avatar:
      // 放置自己的图床地址
      "",
    plan_num: 0,
  },
] as any);

// 下载xmind思维导图
function downloadFile() {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src =
    "http://mogullzr001.oss-cn-beijing.aliyuncs.com/files/%E7%AE%97%E6%B3%95%E5%AD%A6%E4%B9%A0%E5%9F%BA%E6%9C%AC%E8%B7%AF%E7%BA%BF.xmind";
  document.body.appendChild(iframe);
}
</script>
<template>
  <div class="flex card card-compact bg-base-100 shadow-xl mx-52">
    <div class="font-bold mx-auto text-4xl pt-6">ByteOJ原创路线学习</div>
    <a
      class="mx-auto btn bg-blue-300 hover:bg-blue-500 active:bg-blue-600 text-white text-lg m-4"
      href="javascript:void(0);"
      onclick="downloadFile();"
    >
      <span>学习路线</span>
    </a>

    <div
      class="container hover:bg-gray-100"
      v-for="plan in plans"
      :key="plan.plan_id"
    >
      <div class="divider my-0 h-0"></div>
      <router-link
        class="flex flex-row pl-4 py-2"
        :to="'/study/' + plan.plan_id"
      >
        <div class="basis-7/12">
          <div class="flex">
            <div class="ml-4 flex w-full my-3">
              <div class="avatar p-0">
                <div class="w-20 rounded-full">
                  <img :src="plan.avatar" />
                </div>
              </div>
              <div class="ml-4">
                <router-link
                  class="link link-hover text-xl"
                  :to="'study/' + plan.plan_id"
                  style="color: rgba(2, 132, 199, 0.99)"
                  >{{ plan.plan_title }}</router-link
                >
                <div class="text-gray-400">
                  {{ plan.plan_title_description }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="basis-3/12 text-center m-auto">
          <div class="text-gray-400 font-bold">参加人数</div>
          <div>{{ plan.plan_num }}</div>
        </div>
        <div class="basis-2/12 text-center m-auto">
          <div class="text-gray-400 font-bold">创建人</div>
          <div class="font-bold text-red-500">{{ plan.create_name }}</div>
        </div>
      </router-link>
    </div>
    <div class="divider m-0 h-0"></div>
  </div>
</template>

<style scoped></style>
