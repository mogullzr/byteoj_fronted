<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import dayjs from "dayjs";
import UserStore from "@/store/user";
import MarkdownEditorView from "@/view/Markdown/MarkdownView.vue";
import CourceView from "@/view/cources/CourceView.vue";
import CourseProblemsView from "@/view/cources/CourseProblemsView.vue";
import CourseRecordsView from "@/view/cources/CourseRecordsView.vue";
import router from "@/router";
import CourseRankView from "@/view/cources/CourseRankView.vue";
import { CourseControllerService } from "../../../generated/services/CourseControllerService";

const useStore = UserStore();
const path = router.currentRoute.value.fullPath;
const course_id = ref(parseInt(path.toString().split("/")[2]));

const course: Ref<any> = ref({} as any);

const local: any =
  localStorage.getItem("study-" + course_id.value + "-status") != undefined
    ? localStorage.getItem("study-" + course_id.value + "-status")
    : "1";
// 0表示显示前言，1表示显示试题，2表示大家的提交记录，3表示排名，4表示学习宝典
const isShow = ref(
  localStorage.getItem("study-" + course_id.value + "-status") == ""
    ? 0
    : parseInt(local)
);

// 获取初始选中态
onMounted(async () => {
  let element: any = document.getElementById(isShow.value.toString());
  if (element !== null) {
    element.checked = true;
  }

  const res = await CourseControllerService.courseSearchByCourseIdUsingPost(
    course_id.value
  );
  if (res.code === 0) {
    course.value = res.data;
  }
});

// 修改展示页面
const changeShow = (key: number) => {
  isShow.value = key;
  localStorage.setItem("study-" + course_id.value + "-status", key.toString());
  let element: any = document.getElementById(isShow.value.toString());
  if (element) {
    element.checked = true;
  }
};
</script>

<template>
  <div class="card bg-base-100 shadow-xl mx-36">
    <div class="flex p-4 w-full">
      <div
        class="text-sky-500 link link-hover hover:text-sky-400 text-2xl flex-1 float-left my-auto"
      >
        <button>
          {{ course.course_title }}
        </button>
      </div>
      <router-link
        class="btn font-bold text-lg hover:bg-blue-500 hover:text-white"
        to="/study"
      >
        返回学习计划专栏
      </router-link>
    </div>
    <div class="flex p-4 w-full text-gray-500 text-xl">
      <div class="flex-1">
        <span>参加人数 : {{ course.num }}</span>
        <span class="pl-4">参加时间：</span>
        <span v-if="course.start_time != null && course.start_time != ''">{{
          dayjs(course.start_time).format("YYYY-MM-DD")
        }}</span>
        <span v-if="course.start_time != null && course.start_time != ''"
          >~</span
        >
        <span v-if="course.end_time != null && course.end_time != ''">{{
          dayjs(course.end_time).format("YYYY-MM-DD")
        }}</span>
        <span v-else>永久</span>
      </div>
      <div class="card bg-base-100 shadow-2xl">
        <div class="card-body flex py-0">
          <div class="avatar">
            <div
              class="bg-neutral text-neutral-content w-12 rounded-full mx-auto"
            >
              <router-link :to="'/user/space/' + useStore.loginUser.uuid">
                <img :src="useStore.loginUser.avatar" alt="Mogullzr的网站" />
              </router-link>
            </div>
          </div>
          <router-link
            class="link link-hover text-sky-500 hover:text-sky-600 active:text-sky-700 px-2 text-sm"
            :to="'/user/space/' + useStore.loginUser.uuid"
            >{{ useStore.loginUser.username }}</router-link
          >
          <button
            @click="changeShow(3)"
            class="link link-hover text-sky-500 hover:text-sky-600 active:text-sky-700 px-2 text-sm"
          >
            {{ course.rank_num }} / {{ course.course_num }}
          </button>
        </div>
      </div>
    </div>
    <div role="tablist" class="tabs tabs-lifted tabs-lg">
      <input
        id="0"
        type="radio"
        name="my_tabs_2"
        role="tab"
        :class="'tab ' + (isShow == 0 ? '' : 'text-sky-500')"
        aria-label="前言"
        style="white-space: nowrap"
        @click="changeShow(0)"
      />
      <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box p-6"
        v-if="isShow === 0"
        style="word-wrap: break-word"
      >
        <MarkdownEditorView :generateData="course.course_title_description" />
      </div>
      <input
        id="1"
        type="radio"
        name="my_tabs_2"
        role="tab"
        :class="'tab ' + (isShow == 1 ? '' : 'text-sky-500')"
        aria-label="试题"
        style="white-space: nowrap"
        @click="changeShow(1)"
      />
      <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box p-6"
        style="word-wrap: break-word"
        v-if="isShow === 1"
      >
        <CourseProblemsView />
      </div>
      <input
        id="2"
        type="radio"
        name="my_tabs_2"
        role="tab"
        :class="'tab ' + (isShow == 2 ? '' : 'text-sky-500')"
        aria-label="提交记录"
        style="white-space: nowrap"
        @click="changeShow(2)"
      />
      <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box p-6"
        v-if="isShow === 2"
        style="word-wrap: break-word"
      >
        <CourseRecordsView />
      </div>
      <input
        id="3"
        type="radio"
        name="my_tabs_2"
        role="tab"
        :class="'tab ' + (isShow == 3 ? '' : 'text-sky-500')"
        aria-label="排名"
        style="white-space: nowrap"
        @click="changeShow(3)"
      />
      <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box p-6"
        v-if="isShow === 3"
        style="word-wrap: break-word"
      >
        <CourseRankView />
      </div>
      <input
        id="4"
        type="radio"
        name="my_tabs_2"
        role="tab"
        :class="'tab ' + (isShow == 4 ? '' : 'text-sky-500')"
        aria-label="学习宝典"
        style="white-space: nowrap"
        @click="changeShow(4)"
      />
      <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box p-6"
        v-if="isShow === 4"
        style="word-wrap: break-word"
      ></div>
    </div>
  </div>
</template>

<style scoped></style>
