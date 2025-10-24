<script setup lang="ts">
import { ref, Ref } from "vue";
import UserStore from "@/store/user";

const useStore = UserStore();
const user_rank_list: Ref<any> = ref([
  {
    uuid: 9,
    username: "Mogullzr",
    avatar:
      "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
    ac_num: 74,
    rank_num: 1,
    create_time: "2024-08-03 17:07:14",
  },
  {
    uuid: 9,
    username: "Mogullzr",
    avatar:
      "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
    ac_num: 74,
    rank_num: 1,
    create_time: "2024-08-03 17:07:14",
  },
  {
    uuid: 9,
    username: "Mogullzr",
    avatar:
      "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
    ac_num: 74,
    rank_num: 1,
    create_time: "2024-08-03 17:07:14",
  },
  {
    uuid: 9,
    username: "Mogullzr",
    avatar:
      "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
    ac_num: 74,
    rank_num: 1,
    create_time: "2024-08-03 17:07:14",
  },
  {
    uuid: 9,
    username: "Mogullzr",
    avatar:
      "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
    ac_num: 74,
    rank_num: 1,
    create_time: "2024-08-03 17:07:14",
  },
  {
    uuid: 9,
    username: "Mogullzr",
    avatar:
      "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
    ac_num: 74,
    rank_num: 1,
    create_time: "2024-08-03 17:07:14",
  },
] as any);
</script>

<template>
  <div
    class="container hover:bg-gray-100"
    v-for="user in user_rank_list"
    :key="user.uuid"
  >
    <div class="divider my-0 h-0"></div>
    <div class="flex flex-row pl-4 py-2">
      <div class="basis-10/12">
        <div class="flex">
          <div class="ml-4 flex w-full my-3">
            <div class="avatar p-0">
              <div class="w-16 rounded-full">
                <img :src="user.avatar" alt="ByteOJ出品" />
              </div>
            </div>
            <div class="ml-4">
              <div class="text-gray-600">
                <router-link
                  class="link link-hover text-sky-600"
                  :to="'/user/space/' + user.uuid"
                  >{{ user.username }}</router-link
                >
              </div>
              <div class="text-gray-500">
                <span class="pr-2">题目</span>
                <span>{{ user.ac_num }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="basis-2/12">
        <div class="float-right">
          <div class="badge badge-lg bg-green-500 text-white font-bold">
            <span>排名：</span>
            <span>{{ user.rank_num }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
