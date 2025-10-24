<script setup lang="ts">
import TimeLineView from "@/view/components/TimeLineView.vue";
import { onMounted, ref, Ref } from "vue";
import { CompetitionAddRequest } from "../../../../../generated";
import router from "@/router";
const competition_info: Ref<CompetitionAddRequest> = ref(
  localStorage.getItem("competition_info") != null
    ? JSON.parse(localStorage.getItem("competition_info") ?? "")
    : ({} as CompetitionAddRequest)
);
const copyCustomText = () => {
  // 创建一个临时的文本区域来执行复制操作
  const textArea = document.createElement("textarea");

// 构建要复制的文本内容
  const customText =
      "🎉【新生专属】校内编程竞赛《" + competition_info.value.competition_name + "》火热报名中！\n\n" +
      "📅 比赛时间：" + competition_info.value.start_time + " - " + competition_info.value.end_time + "\n" +
      "💻 参赛方式：ByteOJ校内编程平台\n" +
      "🔗 报名链接：" + "https://www.byteoj.com/competition/" + competition_info.value.competition_id + "\n\n" +
      "🚀 大一同学速来挑战，锻炼编程能力，认识更多同届高手！";

  // 将文本内容设置到文本区域
  textArea.value = customText;

  // 将文本区域添加到文档中
  document.body.appendChild(textArea);

  // 选择文本区域中的内容
  textArea.select();

  // 执行复制命令
  try {
    document.execCommand("copy");
    let el: any = document.getElementById("copy");
    el?.showModal();
    setTimeout(() => {
      el?.close();
    }, 1000);
  } catch (err) {
    console.error("复制失败:", err);
  }

  // 移除文本区域
  document.body.removeChild(textArea);
};

onMounted(() => {
  if (
    competition_info.value.competition_id == null ||
    competition_info.value.competition_id == 0
  ) {
    router.back();
  }
  localStorage.removeItem("competition_info");
  localStorage.removeItem("checked_problem_list");
});

// 点击复制比赛链接
</script>

<template>
  <div class="card">
    <div class="card-body bg-white rounded-2xl">
      <TimeLineView />
      <div class="divider"></div>
      <div class="card-body bg-sky-200 rounded-2xl text-blue-500 text-xl">
        <div class="mx-auto">
          <span>成功生成比赛</span>
          <span class="font-bold"
            >"{{ competition_info.competition_name }}"</span
          >
        </div>
        <div class="mx-auto">
          <span>比赛链接：</span>
          <router-link :to="'/competition/' + competition_info.competition_id">
            <span>http://www.byteoj.com/competition/</span>
            <span>{{ competition_info.competition_id }}</span>
          </router-link>
        </div>
        <div class="text-black mx-auto">
          <div class="font-bold">你可以在自己的个人中心中查到哦^_^</div>
        </div>
        <div class="mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="210"
            height="210"
            viewBox="0 0 24 24"
          >
            <path
              fill="#3B82F6"
              d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm5.675-10l1.3 1.3q.3.3.7.3t.7-.3l3.675-3.7q.275-.275.275-.7t-.275-.7q-.3-.3-.712-.287t-.688.287l-2.975 2.975l-1.3-1.3q-.3-.3-.7-.3t-.7.3L6.95 11.9q-.275.275-.275.7t.275.7q.3.3.713.287t.687-.287zm-3.95 5L5 17.725V19h.85l3-3zm3.95 0l-3 3H9.8l3-3zm3.725 0l-3 3h2.125l3-3zm3.75 0l-3 3h2.125L19 17.275V16z"
            />
          </svg>
        </div>
        <div class="mx-auto">
          <button
            @click="copyCustomText()"
            class="btn bg-blue-500 text-white text-xl hover:bg-blue-600 active:bg-blue-700"
          >
            复制比赛链接
          </button>
          <dialog id="copy" class="modal">
            <div class="modal-box w-11/12 max-w-3xl">
              <form method="dialog">
                <button
                  class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-lg bg-blue-500 text-white"
                >
                  ✕
                </button>
              </form>
              <div class="flex my-16 mx-48">
                <div class="text-center mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="110"
                    height="110"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#3B82F6"
                      fill-rule="evenodd"
                      stroke="#3B82F6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="4"
                      d="m4 24l5-5l10 10L39 9l5 5l-25 25z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="text-3xl font-bold m-auto text-black">复制成功</div>
              </div>
              <form method="dialog" class="float-right">
                <button class="btn text-lg bg-blue-500 text-white">关闭</button>
              </form>
            </div>
          </dialog>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
