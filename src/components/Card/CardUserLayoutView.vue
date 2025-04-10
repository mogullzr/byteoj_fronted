<script setup lang="ts">
import { onMounted, Ref, ref } from "vue";
import UserStore from "@/store/user";
import DatePicker from "@/view/components/DatePicker.vue";
import { format } from "date-fns";
import {
  ProblemAlgorithmControllerService,
  ProblemDailyNumVo,
  User,
  UserControllerService,
  UserModifyRequest,
} from "../../../generated";
import dayjs from "dayjs";
import * as echarts from "echarts";
import router from "@/router";

// 用户标签

const userStore = UserStore();
const user_tags_list = ref();
const loginUser: User = userStore.loginUser;
const userModifyRequest: Ref<UserModifyRequest> = ref(loginUser);
const message = ref("");
const status = ref();
const isLoading: Ref<boolean> = ref(false);

// 生日
const birthValue = ref(format(loginUser.birth ?? new Date(), "yyyy-MM-dd"));

const friends_list = ref([
  {
    username: "Hu",
    avatar:
      "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
  },
  {
    username: "Axliu",
    avatar:
      "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
  },
  {
    username: "Zhang",
    avatar:
      "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
  },
]);

const tags_list = ref([
  "Vue",
  "Java",
  "Python",
  "C++",
  "算法",
  "GO",
  "Docker",
  "K8S",
  "TS",
  "React",
]);

const tags_list_color: any = ref([]);

const user_daily: Ref<ProblemDailyNumVo[] | undefined> = ref();
const user_daily_list: any = ref([]);

onMounted(async () => {
  const res =
    await ProblemAlgorithmControllerService.getProblemDailyNumUsingPost();
  if (res.code === 0) {
    user_daily.value = res.data;
    if (user_daily.value != undefined) {
      for (let item = 0; item < user_daily.value.length; item++) {
        user_daily.value[item].date = dayjs(user_daily.value[item].date).format(
          "YYYY-MM-DD"
        );
        user_daily_list.value.push([
          user_daily.value[item].date,
          user_daily.value[item].num,
        ]);
      }
    }

    let myChart_0 = echarts.init(document.getElementById("main_0"));
    let option_0 = {
      title: {
        top: 30,
        left: "center",
        text: "2024年每日刷题计划",
      },
      tooltip: {},
      visualMap: {
        min: 0,
        max: 10000,
        type: "piecewise",
        orient: "horizontal",
        left: "center",
        top: 65,
        pieces: [
          { lt: 0, color: "#EBEDF0", symbol: "rect" },
          { gt: 0, lt: 2, color: "#DAE2EF", symbol: "rect" },
          { gt: 2, lt: 5, color: "#C0DDF9", symbol: "rect" },
          { gt: 5, lt: 10, color: "#73B3F3", symbol: "rect" },
          { gt: 10, lt: 15, color: "#3886E1", symbol: "rect" },
          { gt: 15, color: "#17459E", symbol: "rect" },
        ],
      },
      calendar: {
        top: 120,
        left: 30,
        right: 30,
        cellSize: ["auto", 13],
        range: "2024",
        itemStyle: {
          borderWidth: 0.5,
        },
        yearLabel: { show: false },
      },
      series: {
        type: "heatmap",
        coordinateSystem: "calendar",
        data: user_daily_list.value,
      },
    };
    myChart_0.setOption(option_0);
  } else if (res.code === 40101) {
    router.replace("/404");
  }
});
if (loginUser.tags != null) {
  user_tags_list.value = loginUser.tags.split(",");
  console.log(user_tags_list.value[0]);
  if (user_tags_list.value[0] == "") {
    user_tags_list.value = [];
  }
} else {
  user_tags_list.value = [];
}
//

for (let item = 0; item < tags_list.value.length; item++) {
  let flag = ref(false);
  for (let jtem = 0; jtem < user_tags_list.value.length; jtem++) {
    if (tags_list.value[item] == user_tags_list.value[jtem]) {
      tags_list_color.value.push(`badge-success`);
      flag.value = true;
      break;
    }
  }
  if (flag.value == false) {
    tags_list_color.value.push("badge-ghost");
  }
}

// 性別选择颜色变化
const GenderCheck = (gender: number) => {
  let labelMale: any = document.getElementById("male");
  let labelFemale: any = document.getElementById("female");

  if (gender == 0) {
    labelMale.classList.remove("bg-gray-100");
    labelMale.classList.add("bg-blue-100");
    labelFemale.classList.remove("bg-pink-100");
    labelFemale.classList.add("bg-gray-100");
  } else {
    labelMale.classList.remove("bg-blue-100");
    labelMale.classList.add("bg-gray-100");
    labelFemale.classList.remove("bg-gray-100");
    labelFemale.classList.add("bg-pink-100");
  }
};

// 设置字数上限制
const limitInput = (event: any) => {
  const maxLength = 99;
  const currentValue = event.target.value;
  if (currentValue.length > maxLength) {
    event.target.value = currentValue.substring(0, maxLength);
  }
};

// 添加标签功能
const tagsAdd = (tag: string) => {
  let flag = 1;
  for (let i = 0; i < user_tags_list.value.length; i++) {
    if (tag == user_tags_list.value[i]) {
      return;
    }
  }
  if (user_tags_list.value.length < 10 && flag == 1) {
    user_tags_list.value.push(tag);
  }

  let divTag: any = document.getElementById("remove" + tag);
  console.log(divTag);

  divTag.classList.remove("badge-ghost");
  divTag.classList.add("badge-success");
};

// 删除标签功能
const tagsRemove = (tag: string) => {
  user_tags_list.value = user_tags_list.value.filter(
    (item: string) => item != tag
  );
  console.log(user_tags_list.value);

  let tagContainer: any = document.getElementById("tagContainer");
  let divTag1: any = document.getElementById(tag);
  let divTag2: any = document.getElementById("remove" + tag);

  divTag2.classList.remove("badge-success");
  divTag2.classList.add("badge-ghost");

  tagContainer.removeChild(divTag1);
};

// 将修改的信息发送给后端，后端进行修改
const modifyUserLogin = async () => {
  console.log(userModifyRequest);
  userModifyRequest.value.tag_list = user_tags_list.value;
  userModifyRequest.value.birth = birthValue.value;
  console.log(userModifyRequest.value.tag_list);
  const res = await UserControllerService.userModifyUsingPost(
    userModifyRequest.value
  );

  if (res.code === 0) {
    message.value = "恭喜，你已经成功修改你的信息";
    status.value = 0;
  } else {
    message.value = res.message;
    status.value = 1;
  }
  setTimeout(() => {
    status.value = null;
  }, 5000);
};

const upLoadAvatar = () => {
  let upLoadInput: any = document.getElementById("uploadAvatar");
  upLoadInput.click();
};
const LoadAvatar = async (event: any) => {
  isLoading.value = true;
  let upLoadInput: any = document.getElementById("uploadAvatar");
  const fileList = upLoadInput.files; // 获取 FileList 对象

  if (!fileList || fileList.length === 0) {
    console.log("未选择文件");
    return;
  }

  // 从 FileList 中获取第一个文件
  try {
    const res = await UserControllerService.userUploadPictureUsingPost(
      fileList, // 直接传递 File 对象
      0
    );

    if (res.code === 0) {
      loginUser.avatar = res.data;
      isLoading.value = false;
    } else {
      console.log("图片上传失败！！！");
    }
  } catch (error) {
    console.error("上传过程中发生错误:", error);
  }
};
</script>

<template>
  <div role="alert" class="alert alert-success w-10/12" v-if="status == 0">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      class="stroke-info h-6 w-6 shrink-0"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
    <span>{{ message }}</span>
  </div>
  <div class="flex gap-4">
    <!--    左侧卡片-->
    <div class="card bg-base-100 w-3/12 shadow-xl" style="height: 700px">
      <div class="avatar m-4">
        <div class="rounded-xl">
          <img
            @dragstart.prevent
            v-if="loginUser.avatar != ''"
            :src="loginUser.avatar"
            alt="ByteOJ出品"
          />
          <span v-else class="loading loading-dots loading-sm"></span>
        </div>
      </div>
      <div class="divider"></div>
      <span class="m-auto p-5 py-1" style="font-weight: bold; font-size: 20px">
        {{ loginUser.account }}
      </span>
      <div class="divider"></div>
      <div class="flex w-full">
        <div class="flex-1 w-1/3" style="margin: 0 50px">
          <div class="text-gray-500">好友</div>
          <div style="text-align: center">{{ friends_list.length }}</div>
        </div>
        <div style="margin: 0 50px">
          <div class="text-gray-500">阅读量</div>
          <div style="text-align: center">
            {{ loginUser.readings }}
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <span
        class="card-body m-auto p-5 py-1"
        style="font-weight: bold; font-size: 16px"
        >最近访客</span
      >
      <div style="display: flex; flex-wrap: wrap">
        <div
          v-for="friend in friends_list"
          :key="friend.username"
          style="
            display: flex;
            flex-direction: column;
            align-loginusers: center;
            margin: 4px;
          "
        >
          <div class="avatar">
            <div class="w-14 rounded">
              <img
                @dragstart.prevent
                v-if="loginUser.avatar != ''"
                :src="friend.avatar"
                :alt="friend.username"
                style="float: left"
              />
              <span v-else class="loading loading-dots loading-sm"></span>
            </div>
          </div>
          <div>{{ friend.username }}</div>
        </div>
      </div>
    </div>
    <!--    右侧卡片-->
    <div class="card bg-base-100 w-9/12 shadow-xl">
      <div class="card-body">
        <button @click="upLoadAvatar">
          <div class="avatar">
            <div
              :class="
                'ring-primary ring-offset-base-100 ring ring-offset-2 w-24 rounded-full m-auto card bg-base-100 shadow-xl' +
                (isLoading == true ? ' image-full' : '')
              "
            >
              <div class="card-body my-auto mx-auto" v-if="isLoading">
                <span class="loading loading-dots loading-md"></span>
              </div>
              <img
                @dragstart.prevent
                v-else-if="loginUser.avatar != ''"
                :src="loginUser.avatar"
                alt="ByteOJ出品"
              />
              <span v-else class="loading loading-dots loading-"></span>
              <input
                id="uploadAvatar"
                type="file"
                style="display: none"
                @change="LoadAvatar"
              />
            </div>
          </div>
        </button>
        <div
          class="card-body p-0 mx-auto"
          id="main_0"
          style="width: 710px; height: 250px"
        ></div>

        <!--        第一行-->
        <div class="flex">
          <!--      名称-->
          <div class="flex-1 w-40">
            <div>昵称</div>
            <input
              type="text"
              placeholder="填写你的昵称（必填项）"
              class="input input-bordered input-sm w-full max-w-xs"
              style="margin: 10px 0"
              v-model="loginUser.username"
            />
          </div>
          <!--          性别-->
          <div class="flex-1 w-24">
            <div>性别</div>
            <div class="flex my-1">
              <div class="form-control w-1/2 font-bold">
                <label
                  id="male"
                  class="label cursor-pointer bg-blue-100 text-blue-500 rounded-lg"
                  @click="GenderCheck(0)"
                >
                  <span class="label-text text-blue-500"
                    ><span
                      ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        class="text-blue-s dark:text-dark-blue-s mr-[6px]"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M17.022 5.564h-2.586a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V6.978L16.17 9.243a7.001 7.001 0 01-10.557 9.143 7 7 0 019.143-10.557l2.265-2.265zM14.1 9.9a5 5 0 10-7.071 7.072 5 5 0 007.07-7.072z"
                          clip-rule="evenodd"
                        ></path></svg></span></span
                  ><span>男性</span>
                  <input type="radio" value="男性" v-model="loginUser.gender" />
                </label>
              </div>
              <div class="form-control flex-1 w-1/2 ml-6 font-bold">
                <label
                  id="female"
                  class="label cursor-pointer bg-gray-100 text-pink-500 rounded-lg"
                  @click="GenderCheck(1)"
                >
                  <span class="label-text text-pink-500"
                    ><svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="1em"
                      height="1em"
                      fill="currentColor"
                      class="text-label-2 dark:text-dark-label-2 mr-[6px]"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M13 15.93V17h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2H9a1 1 0 110-2h2v-1.07A7.001 7.001 0 0112 2a7 7 0 011 13.93zM12 14a5 5 0 100-10 5 5 0 000 10z"
                        clip-rule="evenodd"
                      ></path></svg></span
                  ><span class="">女性</span>
                  <input type="radio" value="女性" v-model="loginUser.gender" />
                </label>
              </div>
            </div>
          </div>
        </div>
        <!--        第二行-->
        <div class="flex">
          <!--          生日-->
          <div class="flex-1 w-1/2">
            <div>生日</div>
            <DatePicker
              placeholder="请选择日期"
              format="yyyy-MM-dd"
              v-model="birthValue"
              class="my-2"
            />
          </div>
          <!--          就读学校-->
          <div class="flex-1 w-1/2">
            <div>就读学校</div>
            <input
              type="text"
              placeholder="填写你的学校"
              class="input input-bordered input-sm w-full"
              style="margin: 10px 0"
              v-model="loginUser.school"
            />
          </div>
        </div>
        <!--        第三行-->
        <div class="flex">
          <div class="flex-1 full w-64">
            <div>联系方式</div>
            <input
              type="text"
              placeholder="填写你的联系方式"
              class="input input-bordered input-sm w-full max-w-xs"
              style="margin: 10px 0"
              v-model="loginUser.phone"
            />
          </div>
          <div class="flex-1 full w-64">
            <div>邮箱地址</div>
            <input
              type="text"
              placeholder="填写你的邮箱"
              class="input input-bordered input-sm w-full"
              style="margin: 10px 0"
              v-model="loginUser.email"
            />
          </div>
        </div>
        <!--        第四行-->
        <div class="flex">
          <div class="flex-1 full w-64">
            <div>个人网站</div>
            <input
              type="text"
              placeholder="填写你的个人网站地址"
              class="input input-bordered input-md w-full"
              style="margin: 10px 0"
              v-model="loginUser.url"
            />
          </div>
        </div>
        <!--        第五行-->
        <div class="flex">
          <div class="flex-1 full w-64">
            <label class="form-control">
              <div class="label">
                <span class="label-text" style="font-size: 16px">个人简介</span>
              </div>
              <textarea
                class="textarea textarea-bordered h-24"
                style="font-size: 18px"
                placeholder="请填写您的个人简介"
                v-model="loginUser.profile"
                @input="limitInput"
              ></textarea>

              <div class="label">
                <span class="label-text"></span>
                <span class="label-text"
                  >{{
                    !loginUser.profile ? 0 : loginUser.profile?.length
                  }}/100</span
                >
              </div>
            </label>
          </div>
        </div>
        <!--        第六行-->
        <div class="flex">
          <div class="flex-1 full w-64">
            <div style="font-size: 16px">常用标签</div>
            <div class="alert text-sm my-4 flex" id="tagContainer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <button
                :id="tag"
                class="m-1"
                v-for="tag in user_tags_list"
                :key="tag"
                @click="tagsRemove(tag)"
              >
                <div class="badge badge-success gap-2">
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block h-4 w-4 stroke-current"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                  {{ tag }}
                </div>
              </button>
            </div>
            <button
              class="m-1"
              v-for="(tag, index) in tags_list"
              :key="tag"
              @click="tagsAdd(tag)"
            >
              <div
                :class="'badge badge-lg gap-2 ' + tags_list_color[index]"
                :id="'remove' + tag"
              >
                {{ tag }}
              </div>
            </button>
          </div>
        </div>
        <!-- 保存-->
        <button class="btn btn-success" @click="modifyUserLogin">保存</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  gap: 16px; /* 控制两个 div 之间的间距 */
}

.card-body {
  word-wrap: break-word;
}

input[type="radio"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.alert-success {
  animation: alert-success 5s 1;
}
@keyframes alert-success {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.alert-error {
  animation: alert-error 5s 1;
}
@keyframes alert-error {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
