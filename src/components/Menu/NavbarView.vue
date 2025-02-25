<script setup lang="ts">
import { onMounted, Ref, ref, watchEffect } from "vue";
import UserLoginView from "@/view/user/UserLoginView.vue";
import UserRegisterView from "@/view/user/UserRegisterView.vue";
import { SearchRequest, UserControllerService } from "../../../generated";
import { useRoute, useRouter } from "vue-router";
import UserStore from "@/store/user";
import { ACCESS_ENUM } from "@/access/access";

const darkTheme = ref();
const router = useRouter();
const route = useRoute();
const useStore = UserStore();
const searchRequest: Ref<SearchRequest> = ref({
  category: route.query.category ?? "post",
  difficulty: route.query.difficulty ?? "",
  keyword: route.query.keyword ?? "",
  pageNum: parseInt(<string>route.query.pageNum ?? "1") ?? 1,
  pageSize: parseInt(<string>route.query.pageSize ?? "10") ?? 10,
  sourceList: route.query.sourceList ?? "",
  tagsList: route.query.tagsList ?? "",
} as any);

onMounted(() => {
  darkTheme.value = "ByteOJLight";
});

watchEffect(async () => {
  let tagsList: any = [
    parseInt(route.query.tagsList ?? "0") == 0
      ? ""
      : parseInt(route.query.tagsList),
  ];
  let sourceList: any = route.query.sourceList?.toString() ?? "";
  if (sourceList == "") {
    sourceList = [];
  } else {
    sourceList = [sourceList];
  }
  searchRequest.value = {
    category: route.query.category ?? "algorithm",
    difficulty: route.query.difficulty ?? "",
    keyword: decodeURIComponent(<string>route.query.keyword || "") ?? "",
    pageNum: parseInt(<string>route.query.pageNum ?? "1") ?? 1,
    pageSize: parseInt(<string>route.query.pageSize ?? "10") ?? 10,
    sourceList: sourceList[0] == "" ? [] : sourceList,
    tagsList: tagsList[0] == 0 ? [] : tagsList,
  } as any;
});
const handleChangeTheme = () => {
  const html = document.getElementsByTagName("html")[0];
  darkTheme.value = html.dataset.theme;

  if (darkTheme.value === "ByteOJLight" || !darkTheme.value) {
    html.dataset.theme = "ByteOJDark";
  } else {
    html.dataset.theme = "ByteOJLight";
  }
};

const logout = async () => {
  const res = await UserControllerService.userLogoutUsingPost();

  if (res.code === 0) {
    setTimeout(function () {
      useStore.loginUser = {};
      window.location.replace("/");
    }, 500);
  } else {
    console.log(res.data);
  }
};

const searchInfo = () => {
  searchRequest.value.pageNum = 1;
  router.push(
    "/together/search?category=" +
      searchRequest.value.category +
      "&keyword=" +
      searchRequest.value.keyword +
      "&difficulty=" +
      searchRequest.value.difficulty +
      "&tagsList" +
      searchRequest.value.tagsList +
      "&sourceList=" +
      searchRequest.value.sourceList +
      "&pageNum=" +
      searchRequest.value.pageNum +
      "&pageSize=" +
      searchRequest.value.pageSize
  );
};
</script>

<template>
  <div class="navbar bg-base-100 mb-2 shadow-lg round">
    <router-link class="w-12 h-10 space-x-9 pl-3 mr-0.5" to="/">
      <svg
        t="1711372491878"
        v-if="darkTheme === 'ByteOJLight' || !darkTheme"
        class="icon"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        p-id="4894"
        width="200"
        height="200"
      >
        <path
          d="M295.232 208.768a19.2 19.2 0 0 1 27.2 0l18.048 18.112a19.2 19.2 0 0 1 0 27.2L82.56 512l257.984 257.92a19.2 19.2 0 0 1 2.816 23.68l-2.816 3.52-18.048 18.112a19.2 19.2 0 0 1-27.2 0L5.632 525.568a19.2 19.2 0 0 1 0-27.136l289.6-289.664z m433.536 0a19.2 19.2 0 0 0-27.2 0l-18.048 18.112a19.2 19.2 0 0 0 0 27.2L941.44 512l-257.984 257.92a19.2 19.2 0 0 0-2.816 23.68l2.816 3.52 18.048 18.112a19.2 19.2 0 0 0 27.2 0l289.6-289.664a19.2 19.2 0 0 0 0-27.136l-289.6-289.664z m-128 13.248l-114.752 590.528a19.2 19.2 0 0 1-22.528 15.232l-25.088-4.928a19.2 19.2 0 0 1-15.232-22.528l114.816-590.528a19.2 19.2 0 0 1 22.528-15.168l25.088 4.864a19.2 19.2 0 0 1 15.232 22.528z"
          fill="#ffffff"
          p-id="4895"
        ></path>
      </svg>
      <svg
        t="1711118928554"
        v-if="darkTheme === 'ByteOJDark'"
        class="icon"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        p-id="6680"
        width="200"
        height="200"
      >
        <path
          d="M295.232 208.768a19.2 19.2 0 0 1 27.2 0l18.048 18.112a19.2 19.2 0 0 1 0 27.2L82.56 512l257.984 257.92a19.2 19.2 0 0 1 2.816 23.68l-2.816 3.52-18.048 18.112a19.2 19.2 0 0 1-27.2 0L5.632 525.568a19.2 19.2 0 0 1 0-27.136l289.6-289.664z m433.536 0a19.2 19.2 0 0 0-27.2 0l-18.048 18.112a19.2 19.2 0 0 0 0 27.2L941.44 512l-257.984 257.92a19.2 19.2 0 0 0-2.816 23.68l2.816 3.52 18.048 18.112a19.2 19.2 0 0 0 27.2 0l289.6-289.664a19.2 19.2 0 0 0 0-27.136l-289.6-289.664z m-128 13.248l-114.752 590.528a19.2 19.2 0 0 1-22.528 15.232l-25.088-4.928a19.2 19.2 0 0 1-15.232-22.528l114.816-590.528a19.2 19.2 0 0 1 22.528-15.168l25.088 4.864a19.2 19.2 0 0 1 15.232 22.528z"
          fill="#292939"
          p-id="6681"
        ></path>
      </svg>
    </router-link>

    <router-link to="/" class="btn btn-ghost text-xl p-2 flex-none px-0.5 mx-2">
      ByteOJ
    </router-link>
    <div class="navbar-start hidden lg:flex flex-1 px-2 mx-2">
      <ul class="menu menu-horizontal">
        <li>
          <router-link to="/home" aria-selected="aria-selected"
            >首页</router-link
          >
        </li>
        <li>
          <router-link to="/problems">题库</router-link>
        </li>
        <li>
          <router-link to="/study">学习</router-link>
        </li>
        <!--        <li>-->
        <!--          <router-link to="/discussion">讨论</router-link>-->
        <!--        </li>-->
        <li>
          <router-link to="/competition">竞赛</router-link>
        </li>
        <li>
          <router-link to="/webChat">大型聊天室</router-link>
        </li>
        <li>
          <router-link to="/chatbot">学习机器人</router-link>
        </li>
        <li>
          <router-link to="/special">Byte专栏</router-link>
        </li>
      </ul>
    </div>

    <div class="lg:flex">
      <div class="form-control pr-2 flex-1">
        <input
          v-model="searchRequest.keyword"
          type="text"
          placeholder="请输入关键词"
          class="input input-bordered w-80"
          @keyup.enter="searchInfo"
        />
      </div>
      <div>
        <button
          @click="searchInfo"
          class="svg-hover mx-2 flex-1"
          aria-label="搜索"
          aria-pressed="false"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
          >
            <path
              fill="#999999"
              d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"
            />
          </svg>
        </button>
      </div>

      <div class="dropdown dropdown-hover">
        <div
          tabindex="0"
          role="button"
          class="btn btn-ghost btn-circle avatar mr-5"
        >
          <div class="rounded-full">
            <img
              @dragstart.prevent
              v-if="useStore.loginUser.avatar != ''"
              :src="useStore.loginUser.avatar"
              alt="ByteOJ出品"
            />
            <span v-else class="loading loading-dots loading-sm"></span>
          </div>
        </div>
        <div class="dropdown dropdown-end dropdown-hover w-100 float">
          <ul
            tabindex="0"
            class="shadow menu dropdown-content bg-base-100 rounded-box w-40 mt-3"
          >
            <li>
              <label class="pl-8">
                <div tabindex="0" role="button">
                  <label class="swap swap-rotate">
                    <!-- this hidden checkbox controls the state -->
                    <input type="checkbox" @click="handleChangeTheme" />

                    <!-- sun icon -->
                    <svg
                      class="swap-off"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="28px"
                      height="28px"
                    >
                      <path
                        d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"
                      />
                    </svg>
                    <label class="swap-off h-4 p-1 pl-10">白天</label>

                    <!-- moon icon -->
                    <svg
                      class="swap-on fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="28px"
                      height="28px"
                    >
                      <path
                        d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"
                      />
                    </svg>
                    <label class="swap-on h-4 p-1 pl-10">黑夜</label>
                  </label>
                </div>
              </label>
            </li>
            <!--            v-if="user.role !== ACCESS_ENUM.NOT_LOGIN"-->
            <li
              v-if="
                useStore.loginUser.role &&
                useStore.loginUser.role != ACCESS_ENUM.NOT_LOGIN
              "
            >
              <router-link to="/user">
                <svg
                  t="1711427146368"
                  v-if="darkTheme === 'ByteOJDark'"
                  class="ml-4 icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="4889"
                  width="24"
                  height="24"
                >
                  <path
                    d="M919.256367 971.476126c-19.278038 0-34.907718-15.628656-34.907718-34.907718 0-205.311569-167.032985-372.344554-372.344554-372.344554-205.310545 0-372.34353 167.032985-372.34353 372.344554 0 19.279062-15.628656 34.907718-34.906694 34.907718s-34.906694-15.628656-34.906694-34.907718c0-59.676214 11.694613-117.585077 34.761292-172.120003 22.271065-52.655964 54.14787-99.939227 94.743669-140.534002 40.595799-40.595799 87.878037-72.472604 140.535026-94.743669 54.533902-23.065655 112.442765-34.761292 172.118979-34.761292 59.676214 0 117.585077 11.694613 172.120003 34.761292 52.655964 22.271065 99.939227 54.14787 140.534002 94.743669 40.595799 40.595799 72.472604 87.878037 94.743669 140.534002 23.065655 54.533902 34.761292 112.443789 34.761292 172.120003C954.164085 955.84747 938.536453 971.476126 919.256367 971.476126zM512.254965 564.4737c-68.380872 0-132.665916-26.625954-181.012045-74.973107-48.347153-48.347153-74.974131-112.632197-74.974131-181.013069 0-68.371656 26.625954-132.653629 74.973107-181.003854 48.350225-48.353297 112.635269-74.983347 181.013069-74.983347 68.378824 0 132.664892 26.629026 181.014093 74.983347 48.347153 48.350225 74.973107 112.632197 74.973107 181.003854 0 68.380872-26.626978 132.665916-74.974131 181.013069S580.635837 564.4737 512.254965 564.4737zM512.254965 122.315759c-102.654761 0-186.171765 83.51598-186.171765 186.171765 0 102.654761 83.517004 186.171765 186.171765 186.171765 102.655784 0 186.171765-83.517004 186.171765-186.171765C698.42673 205.831739 614.91075 122.315759 512.254965 122.315759z"
                    fill="#272636"
                    p-id="4890"
                  ></path>
                </svg>
                <svg
                  t="1711427146368"
                  v-if="darkTheme === 'ByteOJLight'"
                  class="ml-4 icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="4889"
                  width="24"
                  height="24"
                >
                  <path
                    d="M919.256367 971.476126c-19.278038 0-34.907718-15.628656-34.907718-34.907718 0-205.311569-167.032985-372.344554-372.344554-372.344554-205.310545 0-372.34353 167.032985-372.34353 372.344554 0 19.279062-15.628656 34.907718-34.906694 34.907718s-34.906694-15.628656-34.906694-34.907718c0-59.676214 11.694613-117.585077 34.761292-172.120003 22.271065-52.655964 54.14787-99.939227 94.743669-140.534002 40.595799-40.595799 87.878037-72.472604 140.535026-94.743669 54.533902-23.065655 112.442765-34.761292 172.118979-34.761292 59.676214 0 117.585077 11.694613 172.120003 34.761292 52.655964 22.271065 99.939227 54.14787 140.534002 94.743669 40.595799 40.595799 72.472604 87.878037 94.743669 140.534002 23.065655 54.533902 34.761292 112.443789 34.761292 172.120003C954.164085 955.84747 938.536453 971.476126 919.256367 971.476126zM512.254965 564.4737c-68.380872 0-132.665916-26.625954-181.012045-74.973107-48.347153-48.347153-74.974131-112.632197-74.974131-181.013069 0-68.371656 26.625954-132.653629 74.973107-181.003854 48.350225-48.353297 112.635269-74.983347 181.013069-74.983347 68.378824 0 132.664892 26.629026 181.014093 74.983347 48.347153 48.350225 74.973107 112.632197 74.973107 181.003854 0 68.380872-26.626978 132.665916-74.974131 181.013069S580.635837 564.4737 512.254965 564.4737zM512.254965 122.315759c-102.654761 0-186.171765 83.51598-186.171765 186.171765 0 102.654761 83.517004 186.171765 186.171765 186.171765 102.655784 0 186.171765-83.517004 186.171765-186.171765C698.42673 205.831739 614.91075 122.315759 512.254965 122.315759z"
                    fill="#ffffff"
                    p-id="4890"
                  ></path>
                </svg>
                个人中心
              </router-link>
            </li>
            <!--            v-if="user.role !== ACCESS_ENUM.NOT_LOGIN"-->
            <li
              v-if="
                useStore.loginUser.role &&
                useStore.loginUser.role != ACCESS_ENUM.NOT_LOGIN
              "
            >
              <button
                @click.prevent="logout"
                aria-label="切换主题颜色"
                aria-pressed="false"
              >
                <svg
                  aria-hidden="true"
                  t="1711436415500"
                  v-if="darkTheme === 'ByteOJDark'"
                  class="ml-4 icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="4681"
                  width="24"
                  height="24"
                >
                  <path
                    d="M599.36 643.36V786.4c0 17.792-14.304 32.224-31.936 32.224H114.88c-17.632 0-31.936-14.432-31.936-32.224V237.6c0-17.792 14.304-32.224 31.936-32.224h452.544c17.632 0 31.936 14.432 31.936 32.224v143.04h-64.544v-78.048c0-13.568-10.72-24.608-23.936-24.608H171.488c-13.248 0-23.968 11.008-23.968 24.608v418.816c0 13.568 10.72 24.576 23.968 24.576H510.88c13.216 0 23.936-11.008 23.936-24.576V643.36h64.544z m295.392-163.936H322.464v72.384h572.288v-72.352z m46.336 28.992L752 319.296l-55.52 55.52L885.6 563.904l55.488-55.488z m-55.52-52.448L692.352 649.184l55.52 55.52 193.184-193.216-55.488-55.52z"
                    fill="#2c2c2c"
                    p-id="4682"
                  ></path>
                </svg>
                <svg
                  t="1711436415500"
                  v-if="darkTheme === 'ByteOJLight'"
                  class="ml-4 icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="4681"
                  width="24"
                  height="24"
                >
                  <path
                    d="M599.36 643.36V786.4c0 17.792-14.304 32.224-31.936 32.224H114.88c-17.632 0-31.936-14.432-31.936-32.224V237.6c0-17.792 14.304-32.224 31.936-32.224h452.544c17.632 0 31.936 14.432 31.936 32.224v143.04h-64.544v-78.048c0-13.568-10.72-24.608-23.936-24.608H171.488c-13.248 0-23.968 11.008-23.968 24.608v418.816c0 13.568 10.72 24.576 23.968 24.576H510.88c13.216 0 23.936-11.008 23.936-24.576V643.36h64.544z m295.392-163.936H322.464v72.384h572.288v-72.352z m46.336 28.992L752 319.296l-55.52 55.52L885.6 563.904l55.488-55.488z m-55.52-52.448L692.352 649.184l55.52 55.52 193.184-193.216-55.488-55.52z"
                    fill="#ffffff"
                    p-id="4682"
                  ></path>
                </svg>
                退出登陆
              </button>
            </li>
            <!--            v-if="user.role === ACCESS_ENUM.NOT_LOGIN"-->
            <li
              v-if="
                !useStore.loginUser.role ||
                useStore.loginUser.role == ACCESS_ENUM.NOT_LOGIN
              "
            >
              <router-link to="/user/login">
                <svg
                  t="1711436415500"
                  v-if="darkTheme === 'ByteOJDark'"
                  class="ml-4 icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="4681"
                  width="24"
                  height="24"
                >
                  <path
                    d="M599.36 643.36V786.4c0 17.792-14.304 32.224-31.936 32.224H114.88c-17.632 0-31.936-14.432-31.936-32.224V237.6c0-17.792 14.304-32.224 31.936-32.224h452.544c17.632 0 31.936 14.432 31.936 32.224v143.04h-64.544v-78.048c0-13.568-10.72-24.608-23.936-24.608H171.488c-13.248 0-23.968 11.008-23.968 24.608v418.816c0 13.568 10.72 24.576 23.968 24.576H510.88c13.216 0 23.936-11.008 23.936-24.576V643.36h64.544z m295.392-163.936H322.464v72.384h572.288v-72.352z m46.336 28.992L752 319.296l-55.52 55.52L885.6 563.904l55.488-55.488z m-55.52-52.448L692.352 649.184l55.52 55.52 193.184-193.216-55.488-55.52z"
                    fill="#2c2c2c"
                    p-id="4682"
                  ></path>
                </svg>
                <svg
                  t="1711436415500"
                  v-if="darkTheme === 'ByteOJLight'"
                  class="ml-4 icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="4681"
                  width="24"
                  height="24"
                >
                  <path
                    d="M599.36 643.36V786.4c0 17.792-14.304 32.224-31.936 32.224H114.88c-17.632 0-31.936-14.432-31.936-32.224V237.6c0-17.792 14.304-32.224 31.936-32.224h452.544c17.632 0 31.936 14.432 31.936 32.224v143.04h-64.544v-78.048c0-13.568-10.72-24.608-23.936-24.608H171.488c-13.248 0-23.968 11.008-23.968 24.608v418.816c0 13.568 10.72 24.576 23.968 24.576H510.88c13.216 0 23.936-11.008 23.936-24.576V643.36h64.544z m295.392-163.936H322.464v72.384h572.288v-72.352z m46.336 28.992L752 319.296l-55.52 55.52L885.6 563.904l55.488-55.488z m-55.52-52.448L692.352 649.184l55.52 55.52 193.184-193.216-55.488-55.52z"
                    fill="#ffffff"
                    p-id="4682"
                  ></path>
                </svg>
                登陆/注册
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.svg-hover:hover {
  path {
    fill: rgba(2, 132, 199, 0.99);
  }
}
.bg-base-100 {
  padding: 0;
}
</style>
