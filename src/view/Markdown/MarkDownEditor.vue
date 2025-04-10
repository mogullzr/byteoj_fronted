<template>
  <div role="alert" class="alert alert-success" v-if="flag === 0">
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
    <span class="text-white">{{ message }}</span>
  </div>
  <div role="alert" class="alert alert-error" v-if="flag === 1">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 shrink-0 stroke-current"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <span class="text-white">{{ message }}</span>
  </div>
  <div class="flex">
    <input
      type="text"
      placeholder="请输入文章的主题"
      class="input input-lg w-1/2 flex-1"
      style="font-size: 32px"
      v-model="title"
    />
    <button
      class="btn btn-outline btn-success mx-2 w-24"
      @click="cancelSubmit"
      aria-label="取消"
      aria-pressed="false"
    >
      取消
    </button>
    <button
      class="btn btn-success text-white w-24"
      @click="submitPost"
      aria-label="发布"
      aria-pressed="false"
    >
      发布
    </button>
  </div>
  <MdEditor
    v-model="state.text"
    :theme="state.theme"
    :preview-theme="state.previewTheme"
    :codeTheme="state.codeTheme"
    @onUploadImg="uploadPicture"
    style="height: 720px"
    pageFullscreen
  />
</template>

<script setup>
import { reactive, ref } from "vue";
import { MdEditor } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import router from "@/router";
import {
  PostsControllerService,
  UserControllerService,
} from "../../../generated";
import UserStore from "@/store/user";

const useStore = UserStore();
const path = router.currentRoute.value.fullPath;
const problem_id = ref(parseInt(path.toString().split("/")[2]));
const title = ref(
  localStorage.getItem(
    "problem-" + path.toString().split("/")[3] + "-title-" + problem_id.value
  ) == null
    ? "题解 | #" + problem_id.value
    : localStorage.getItem(
        "problem-" +
          path.toString().split("/")[3] +
          "-title-" +
          problem_id.value
      )
);

const message = ref("");
const flag = ref(2);

const state = reactive({
  text:
    localStorage.getItem(
      "problem-" +
        path.toString().split("/")[3] +
        "-content-" +
        problem_id.value
    ) == null
      ? ""
      : localStorage.getItem(
          "problem-" +
            path.toString().split("/")[3] +
            "-content-" +
            problem_id.value
        ),
  previewTheme: "github",
  codeTheme: "ally",
});

// 提交帖子
const submitPost = async () => {
  const res = await PostsControllerService.postAddUsingPost({
    content: state.text,
    location: useStore.currentLocation,
    problem_id: problem_id.value,
    status: path.toString().split("/")[3] === "answer" ? 1 : 2,
    title: title.value,
  });

  if (res.code === 0) {
    flag.value = 0;
    message.value = "发帖成功";

    setTimeout(() => {
      flag.value = 2;
      router.replace("/problems/algorithm/" + problem_id.value);
    }, 3000);
  } else {
    flag.value = 1;
    message.value = res.message;
    setTimeout(() => {
      flag.value = 2;
    });
  }
};

// 取消写帖子，但是此时会自动保存草稿
const cancelSubmit = () => {
  localStorage.setItem(
    "problem-" + path.toString().split("/")[3] + "-title-" + problem_id.value,
    title.value
  );

  localStorage.setItem(
    "problem-" + path.toString().split("/")[3] + "-content-" + problem_id.value,
    state.text
  );
  router.replace("/problems/algorithm/" + problem_id.value);
};

// 上传图片
const uploadPicture = async (files, callback) => {
  const res = await Promise.all(
    files.map((file) => {
      return new Promise((rev, rej) => {
        const form = new FormData();
        form.append("file", file);
        UserControllerService.userUploadPictureUsingPost(form, 2)
          .then((res) => rev(res))
          .catch((error) => rej(error));
      });
    })
  );

  callback(
    res.map((item) => {
      item.data;
      message.value += "\n" + "![" + "]" + "(" + item.data + ")\n";
    })
  );
};
</script>

<style scoped>
.alert-error {
  animation: alert-error 3s 1;
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

.alert-success {
  animation: alert-success 3s 1;
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
</style>
