<script setup lang="ts">
import DatePicker from "@/view/components/DatePicker.vue";
import { nextTick, onMounted, ref, Ref, watch } from "vue";
import UserStore from "@/store/user";
import TimeLineView from "@/view/components/TimeLineView.vue";
import router from "@/router";
import { CompetitionAddRequest } from "../../../../../generated";
import dayjs from "dayjs";

const useStore = UserStore();
// 是否密码访问
const isPassword: Ref<boolean> = ref(false);

// 变换显示状态

const competition_info: Ref<CompetitionAddRequest> = ref(
  localStorage.getItem("competition_info") != null
    ? JSON.parse(localStorage.getItem("competition_info") ?? "")
    : ({ status: 0, pattern: 0 } as CompetitionAddRequest)
);

const problem_name_list: Ref<string[]> = ref([]);
const error_show_info: Ref<string[]> = ref(["", "", "", "", "", ""]);
// 当前日期
let currentDate = dayjs(new Date());

// 修改是否显示填写密码的状态
const checkIsPassword = () => {
  let element: any = document.getElementById("isPassword");
  if (competition_info.value == undefined) {
    competition_info.value = {} as CompetitionAddRequest;
  }
  if (element && element.checked == true) {
    competition_info.value.status = 1;
  } else if (element && element.checked == false) {
    competition_info.value.status = 0;
  }
};

// 判断是否存在空值的情况
const isAnyEmpty = () => {
  checkReasonAbility();
};

// 检查数据合理性
const checkReasonAbility = () => {
  console.log(competition_info.value);
  let flag = 0;
  error_show_info.value = [];
  if (
    competition_info.value?.competition_name == null ||
    competition_info.value?.competition_name == ""
  ) {
    error_show_info.value[0] = "比赛名不允许为空";
    flag = 1;
  }

  if (
    competition_info.value?.start_time == null ||
    competition_info.value?.start_time == ""
  ) {
    error_show_info.value[1] = "比赛开始时间不允许为空";
    flag = 1;
  } else if (
    competition_info.value?.start_time < currentDate.format("YYYY-MM-DD")
  ) {
    error_show_info.value[1] = "比赛开始时间不允许早于当前时间";
    flag = 1;
  }

  if (
    competition_info.value?.end_time == null ||
    competition_info.value?.end_time == ""
  ) {
    error_show_info.value[2] = "比赛结束时间不允许为空";
    flag = 1;
  } else if (
    (competition_info.value?.start_time != undefined ||
      competition_info.value?.start_time != "") &&
    competition_info.value?.start_time != undefined &&
    competition_info.value?.end_time < competition_info.value.start_time
  ) {
    error_show_info.value[2] = "比赛结束时间不允许早于比赛开始时间";
    flag = 1;
  }

  if (competition_info.value?.pattern == undefined) {
    competition_info.value = {} as CompetitionAddRequest;
    competition_info.value.pattern = 0;
  }

  if (
    competition_info.value?.description == undefined ||
    competition_info.value?.description == ""
  ) {
    error_show_info.value[4] = "比赛说明信息不允许为空";
    flag = 1;
  }
  console.log(competition_info.value?.status, competition_info.value?.password);
  if (
    competition_info.value?.status == 1 &&
    (competition_info.value?.password == "" ||
      competition_info.value?.password == undefined)
  ) {
    error_show_info.value[5] = "设置的密码不允许为空";
    flag = 1;
  } else if (
    competition_info.value?.status == 0 &&
    competition_info.value?.password != ""
  ) {
    competition_info.value.password = "";
  }

  if (competition_info.value?.avatar == null) {
    competition_info.value.avatar = useStore.loginUser.avatar;
  }
  if (!flag) {
    console.log(flag);
    router.push("/competition/user/add/1/select");
  }
};
onMounted(() => {
  if (competition_info.value != undefined) {
    if (competition_info.value?.status == 1) {
      let el: any = document.getElementById("isPassword");
      if (el != null) {
        el.checked = true;
      }
    }
  }
});
// 实时监听竞赛信息列表
watch(
  competition_info.value,
  (newValue, OldValue) => {
    nextTick(() => {
      localStorage.setItem("competition_info", JSON.stringify(newValue));
    });
  },
  { deep: true }
);
</script>

<template>
  <div class="card mx-60">
    <div class="card-body bg-white rounded-2xl">
      <TimeLineView />
      <div class="divider"></div>

      <div class="card">
        <div class="card-body">
          <div class="my-2">
            <span class="text-red-400">*</span>
            <span class="mr-4">比赛名称</span>
            <input
              type="text"
              placeholder="填写比赛名称"
              class="input input-bordered input-md w-full max-w-xs"
              v-model="competition_info.competition_name"
            />
          </div>
          <span class="text-red-400 ml-24">{{ error_show_info[0] }}</span>
          <div class="flex my-2">
            <span class="text-red-400">*</span>
            <span class="my-auto">比赛时间</span>
            <div>
              <DatePicker
                class="mx-4"
                placeholder="比赛开始时间"
                format="yyyy-MM-dd HH:mm:ss"
                :width="240"
                show-time
                enable-seconds
                v-model="competition_info.start_time"
              />
              <span class="text-red-400 ml-8">{{ error_show_info[1] }}</span>
            </div>

            <div class="ml-8 my-auto">至</div>
            <div>
              <DatePicker
                class="mx-4"
                placeholder="比赛结束时间"
                format="yyyy-MM-dd HH:mm:ss"
                :width="240"
                show-time
                enable-seconds
                v-model="competition_info.end_time"
              />
              <span class="text-red-400 ml-8">{{ error_show_info[2] }}</span>
            </div>
          </div>
          <div></div>

          <div class="flex my-2">
            <span class="text-red-400">*</span>
            <span class="mr-4 my-auto">密码访问</span>
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text text-xl font-bold">是</span>
                <input
                  id="isPassword"
                  @click="checkIsPassword"
                  class="checkbox ml-2 mr-4"
                  type="checkbox"
                />
              </label>
            </div>
            <input
              v-if="competition_info.status"
              type="password"
              placeholder="填写比赛密码"
              class="input input-bordered input-md w-1/2"
              v-model="competition_info.password"
            />
            <div
              class="text-red-400 my-auto ml-4"
              v-if="competition_info.status === 1"
            >
              {{ error_show_info[5] }}
            </div>
          </div>
          <div class="flex my-2">
            <span class="text-red-400">*</span>
            <span class="mr-4 my-auto">使用赛制</span>
            <div class="flex">
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span
                    :class="
                      'label-text mx-2 ' +
                      (competition_info.pattern == 0
                        ? 'text-sky-600 font-bold'
                        : '')
                    "
                    >ACM赛制</span
                  >
                  <input
                    type="radio"
                    name="radio-10"
                    class="radio checked:bg-blue-500"
                    v-model="competition_info.pattern"
                    checked="checked"
                    value="0"
                  />
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span
                    :class="
                      'label-text mx-2 ' +
                      (competition_info.pattern == 1
                        ? 'text-sky-600 font-bold'
                        : '')
                    "
                    >IOI赛制</span
                  >
                  <input
                    type="radio"
                    name="radio-10"
                    class="radio checked:bg-blue-500"
                    v-model="competition_info.pattern"
                    value="1"
                  />
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span
                    :class="
                      'label-text mx-2 ' +
                      (competition_info.pattern == 2
                        ? 'text-sky-600 font-bold'
                        : '')
                    "
                    >OI赛制</span
                  >
                  <input
                    type="radio"
                    name="radio-10"
                    class="radio checked:bg-blue-500"
                    v-model="competition_info.pattern"
                    value="2"
                  />
                </label>
              </div>
            </div>
          </div>
          <div>
            <span class="text-red-400">*</span>
            <span class="mr-4 my-auto">比赛所属类型</span>
            <select
              class="select select-bordered w-full max-w-xs"
              v-model="competition_info.type"
            >
              <option selected value="0">个人创建赛</option>
            </select>
            <span class="text-red-400 my-auto ml-4">{{
              error_show_info[4]
            }}</span>
          </div>
          <div>
            <span class="text-red-400">*</span>
            <span>比赛说明</span>
            <textarea
              placeholder="在这里填写你的比赛说明"
              class="textarea textarea-bordered textarea-lg w-full h-52 mt-6"
              v-model="competition_info.description"
            ></textarea>
            <div class="text-red-400">
              {{ error_show_info[4] }}
            </div>
          </div>
          <button
            class="btn bg-sky-500 text-white text-2xl my-8"
            @click="isAnyEmpty"
          >
            开始选题
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
