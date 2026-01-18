<script setup lang="ts">
import DatePicker from "@/view/components/DatePicker.vue";
import {nextTick, onMounted, ref, Ref, watch} from "vue";
import UserStore from "@/store/user";
import TimeLineView from "@/view/components/TimeLineView.vue";
import router from "@/router";
import {CompetitionAddRequest} from "../../../../../generated";
import dayjs from "dayjs";

const useStore = UserStore();
// 是否密码访问
const isPassword: Ref<boolean> = ref(false);

// 变换显示状态

const competition_info: Ref<CompetitionAddRequest> = ref(
    localStorage.getItem("competition_info") != null
        ? JSON.parse(localStorage.getItem("competition_info") ?? "")
        : ({status: 0, pattern: 0} as CompetitionAddRequest)
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

// 处理是否启用监考（摄像头）
const toggleProctor = () => {
  const el = document.getElementById("isProctor") as HTMLInputElement | null;
  if (competition_info.value == null) {
    competition_info.value = {} as CompetitionAddRequest;
  }
  competition_info.value.is_procter = el?.checked ? 1 : 0;
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
    router.replace("/competition/user/add/1/select");
  }
};
onMounted(() => {
  if (JSON.stringify(competition_info.value) != JSON.stringify({status: 0, pattern: 0})) {
    if (competition_info.value?.status == 1) {
      let el: any = document.getElementById("isPassword");
      if (el != null) {
        el.checked = true;
      }
    }
  } else {
    competition_info.value.description = "# 【竞赛说明】\n" +
        "\n" +
        "​\t【ByteOJ - 竞赛】是专门为**豫章师范学院**的**数学与计算机学院**的学生制定的竞赛。是针对初学者的难度，**老油条们** 就别来写咯。\n" +
        "\n" +
        "\n" +
        "\n" +
        "# 【出题人&内测】\n" +
        "\n" +
        "1.**出题人**：<font color=\"purple\">**Mogullzr**</font>\n" +
        "\n" +
        "2.**感谢内测人员：**<font color=\"red\">**@Siersi**</font>、<font color=\"grey\">**@424软工一班薛晓春**</font>\n" +
        "\n" +
        "\n" +
        "\n" +
        "# 【比赛形式】\n" +
        "\n" +
        "1.ACM赛制，一般4~10道题目不等。2 ~ 3h，每道题目记1分。\n" +
        "\n" +
        "2.每道题目的罚时为AC时刻与比赛开始时刻所经过的分钟数。\n" +
        "\n" +
        "3.通过题目的非AC提交每次罚时5min。\n" +
        "\n" +
        "4.通过题目数相同的情况下， 罚时短的同学名次靠前。\n" +
        "\n" +
        "5.注意，本网站对于提交出现Compile Error的情况，并不会进行罚时。\n" +
        "\n" +
        "\n" +
        "\n" +
        "# 【错误提示词】\n" +
        "\n" +
        "1.**Compile Error**：编译错误。\n" +
        "\n" +
        "2.**Wrong Error**：答案错误。\n" +
        "\n" +
        "3.**Memory Limit Exceeded**：超出内存上限。\n" +
        "\n" +
        "4.**Time Limit Exceeded**：超出时间上限。\n" +
        "\n" +
        "5.**OutPut Limit Exceeded**：超出输出上限。\n" +
        "\n" +
        "6.**Signalled**：严重不知名错误，比如除0操作、超出数组下标最大值。\n" +
        "\n" +
        "\n" +
        "\n" +
        "# 【比赛规范】\n" +
        "\n" +
        "1.**特别注意**：比赛期间不允许在互联网寻求题目答案，包括向DeepSeek等AI工具求助答案。\n" +
        "\n" +
        "2.对于本院**新生学生**如果存在实在不会的情况，可以在**大群ByteOJ交流大群**中交流寻求同学帮助，但是绝对不可通过抄袭进行题目的提交。\n" +
        "\n" +
        "3.**在与本人说明的情况下**，请不要尝试下面的任何违规行为。\n" +
        "\n" +
        "![image-20250713203218302](https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250713203222446.png)\n" +
        "\n" +
        "<img src=\"https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250713203225802.png\" alt=\"image-20250713203155077\" style=\"zoom:50%;\" />\n" +
        "\n" +
        "\n" +
        "\n" +
        "# 【违规行为】\n" +
        "\n" +
        "1.多人代码雷同\n" +
        "\n" +
        "2.比赛结束前发布答案\n" +
        "\n" +
        "3.**严禁使用任何代码生成工具或者外部辅助手段解题**，包括但不限于将题目描述、测试用例或解题代码输入到外部辅助工具中的行为。\n" +
        "\n" +
        "4.使用不正当手段影响他人竞赛的。\n" +
        "\n" +
        "5.一人使用多账号提交\n" +
        "\n" +
        "\n" +
        "\n" +
        "# 【奖励】\n" +
        "\n" +
        "本场比赛没有。";
  }
});
// 实时监听竞赛信息列表
watch(
    competition_info.value,
    (newValue, OldValue) => {
      nextTick(() => {
        console.log(123)
        localStorage.setItem("competition_info", JSON.stringify(newValue));
      });
    },
    {deep: true}
);
</script>

<template>
  <div class="card mx-60">
    <div class="card-body bg-white rounded-2xl">
      <TimeLineView/>
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

          <div class="flex items-center my-2">
            <span class="text-gray-700 mr-4">启用摄像头监考</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                  id="isProctor"
                  type="checkbox"
                  class="sr-only peer"
                  @change="toggleProctor"
                  :checked="competition_info.is_proctor === 1"
              />
              <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
              ></div>
            </label>
            <span class="ml-3 text-sm text-gray-500">
              {{ competition_info.is_proctor === 1 ? '已启用' : '未启用' }}
            </span>
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
