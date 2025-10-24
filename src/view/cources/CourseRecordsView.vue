<script setup lang="ts">
import { ref, Ref } from "vue";
import { useSimple } from "echarts/types/src/extension";
import UserStore from "@/store/user";

const useStore = UserStore();
const records: Ref<any> = ref([
  {
    record_id: 1,
    uuid: 9,
    username: "Mogullzr",
    avatar:
      "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
    problem_id: 1300,
    problem_name: "1300.城市街道交通费系统",
    language: "C++",
    ac_num: 74,
    create_time: "2024-08-03 17:07:14",
  },
  {
    record_id: 2,
    uuid: 9,
    username: "Mogullzr",
    avatar:
      "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
    problem_id: 1300,
    problem_name: "1300.城市街道交通费系统",
    language: "C++",
    ac_num: 74,
    create_time: "2024-08-03 17:07:14",
  },
  {
    record_id: 3,
    uuid: 9,
    username: "Mogullzr",
    avatar:
      "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
    problem_id: 1300,
    problem_name: "1300.城市街道交通费系统",
    language: "C++",
    ac_num: 74,
    create_time: "2024-08-03 17:07:14",
  },
  {
    record_id: 4,
    uuid: 9,
    username: "Mogullzr",
    avatar:
      "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
    problem_id: 1300,
    problem_name: "1300.城市街道交通费系统",
    language: "C++",
    ac_num: 74,
    create_time: "2024-08-03 17:07:14",
  },
  {
    record_id: 5,
    uuid: 9,
    username: "Mogullzr",
    avatar:
      "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
    problem_id: 1300,
    problem_name: "1300.城市街道交通费系统",
    language: "C++",
    ac_num: 74,
    create_time: "2024-08-03 17:07:14",
  },
] as any);
</script>

<template>
  <div
    class="container hover:bg-gray-100"
    v-for="record in records"
    :key="record.record_id"
  >
    <div class="divider my-0 h-0"></div>
    <router-link
      class="flex flex-row pl-4 py-2"
      :to="'/problems/' + record.problem_id + '/records/' + record.record_id"
    >
      <div class="basis-11/12">
        <div class="flex">
          <div class="ml-4 flex w-full my-3">
            <div class="avatar p-0">
              <div class="w-16 rounded-full">
                <img :src="record.avatar" alt="ByteOJ出品" />
              </div>
            </div>
            <div class="ml-4">
              <div class="text-gray-600">
                <router-link
                  class="link link-hover text-sky-600"
                  :to="'/user/space/' + record.uuid"
                  >{{ record.username }}</router-link
                >
                已经写出了
                <span>{{ record.ac_num }}题</span>
              </div>
              <router-link
                class="link link-hover text-sky-600 font-bold"
                :to="'/problems/algorithm/' + record.problem_id"
                >{{ record.problem_name }}</router-link
              >
            </div>
          </div>
        </div>
      </div>
      <div class="basis-1/12">
        <div class="float-right">
          <span class="badge badge-lg bg-amber-400 text-white font-bold">{{
            record.language
          }}</span>
        </div>
      </div>
    </router-link>
  </div>
</template>

<style scoped></style>
