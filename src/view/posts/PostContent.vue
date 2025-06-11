<script setup lang="ts">
import { onBeforeUnmount, onMounted, Ref, ref, UnwrapRef, watch } from "vue";
import router from "@/router";
import { PostsControllerService, PostsVo } from "../../../generated";
import dayjs, { Dayjs } from "dayjs";
import MarkdownEditorView from "@/view/Markdown/MarkdownView.vue";
import UserStore from "@/store/user";
import { marked } from "marked";
import { useMessageBox } from "@/view/components/alert/useMessageBox";

interface TitleItem {
  index: number;
  level: number;
  text: string;
  id?: number | string;
}

const useStore = UserStore();
const path = router.currentRoute.value.fullPath;
const post_id: Ref<UnwrapRef<number>> = ref(
  parseInt(path.toString().split("/")[2])
);
const post: Ref<PostsVo> = ref({} as PostsVo);
const comment_list: any = ref();
const isThumb = ref(false);
const message = ref("");
const years = ref();
const months = ref();
const days = ref();
const hours = ref();
const minutes = ref();
const seconds = ref();
let TimeStamp = ref();
const nowDate = ref<Dayjs>();

const comment_content = ref("");
const root_comment_id = ref(0);
const to_comment_id = ref(0);

const titles: Ref<TitleItem[]> = ref([]);
const activeIndex: Ref<number> = ref(1);
const observer = ref<IntersectionObserver | null>(null);
const { success, error, warning } = useMessageBox();

onMounted(async () => {
  const res1 = await PostsControllerService.postSearchByPostsIdUsingPost(
    post_id.value
  );

  if (res1.code === 0) {
    post.value = res1.data;
    getTitleContent(post.value.content);
  } else {
    error(res1.message);
  }

  const res2 = await PostsControllerService.postThumbsStatusUsingPost(
    post_id.value
  );
  if (res2.code === 0) {
    isThumb.value = res2.data;
  }

  const res3 = await PostsControllerService.postSearchCommentByPostIdUsingPost(
    post_id.value
  );
  if (res3.code === 0) {
    comment_list.value = res3.data;
    if (comment_list.value == null) {
      return;
    }
    for (let item = 0; item < comment_list.value.length; item++) {
      for (let j = 0; j < comment_list.value[item].length; j++) {
        comment_list.value[item][j].create_time = ref<Dayjs>(
          comment_list.value[item][j].create_time
        );
        TimeStamp.value =
          dayjs(nowDate.value).diff(
            dayjs(comment_list.value[item][j].create_time)
          ) / 1000;
        console.log(TimeStamp.value);
        if (TimeStamp.value < 0) {
          comment_list.value[item][j].create_time = ref("");
          continue;
        }
        years.value = Math.floor(TimeStamp.value / (365 * 24 * 60 * 60));
        if (years.value >= 1) {
          comment_list.value[item][j].create_time = ref(years.value);
          comment_list.value[item][j].pattern = ref("年前");
          continue;
        }

        months.value = Math.floor(TimeStamp.value / (30 * 24 * 60 * 60));
        if (months.value >= 1) {
          comment_list.value[item][j].create_time = ref(months.value);
          comment_list.value[item][j].pattern = ref("个月前");
          continue;
        }

        days.value = Math.floor(TimeStamp.value / (24 * 60 * 60));
        if (days.value >= 1) {
          comment_list.value[item][j].create_time = ref(days.value);
          comment_list.value[item][j].pattern = ref("天前");
          continue;
        }

        hours.value = Math.floor(TimeStamp.value / (60 * 60));
        if (hours.value >= 1) {
          comment_list.value[item][j].create_time = ref(hours.value);
          comment_list.value[item][j].pattern = ref("个小时前");
          continue;
        }

        minutes.value = Math.floor(TimeStamp.value / 60);
        if (minutes.value >= 1) {
          comment_list.value[item][j].create_time = ref(minutes.value);
          comment_list.value[item][j].pattern = ref("分钟前");
          continue;
        }
        seconds.value = Math.floor(TimeStamp.value);
        comment_list.value[item][j].create_time = ref(seconds.value);
        comment_list.value[item][j].pattern = ref("秒前");
      }
    }
  } else {
    error(res3.message);
  }
});

// 点赞或者取消点赞
const postAddOrCancelThumbs = async () => {
  console.log(isThumb.value);
  if (!isThumb.value) {
    const res = await PostsControllerService.postThumbsAddOrCancelUsingPost(
      post_id.value,
      0
    );

    if (res.code === 0) {
      post.value.thumbs_up = post.value.thumbs_up ?? 0;
      post.value.thumbs_up++;

      setTimeout(() => {
        isThumb.value = true;
      }, 500);
    } else {
      error(res.message);
    }
  } else {
    const res = await PostsControllerService.postThumbsAddOrCancelUsingPost(
      post_id.value,
      1
    );

    if (res.code === 0) {
      post.value.thumbs_up = post.value.thumbs_up ?? 1;
      post.value.thumbs_up--;
      isThumb.value = false;
    } else {
      console.log(res.message);
    }
  }
};

const submitComment = async () => {
  if (comment_content.value == "") {
    error("评论信息不能为空");
  } else {
    const res = await PostsControllerService.postCommentAddUsingPost({
      content: comment_content.value,
      post_id: post_id.value,
      root_comment_id:
        root_comment_id.value == 0
          ? to_comment_id.value
          : root_comment_id.value,
      to_comment_id: to_comment_id.value,
    });
    if (res.code === 0) {
      window.location.reload();
    } else {
      error(res.message);
    }
  }
};

// 确定@的评论以及@评论的root_comment_id
const commentAddCommentId = (
  single_comment_id: number,
  single_root_comment_id: number
) => {
  console.log(single_comment_id, single_root_comment_id);
  if (
    single_root_comment_id == root_comment_id.value &&
    single_comment_id == to_comment_id.value
  ) {
    root_comment_id.value = 0;
    to_comment_id.value = 0;
  } else {
    to_comment_id.value = single_comment_id;
    root_comment_id.value = single_root_comment_id;
  }
  console.log(root_comment_id.value);
};

// 刪除评论
const DeleteComment = async (comment_id: number) => {
  const res = await PostsControllerService.postCommentDeleteUsingPost(
    comment_id
  );
  if (res.code === 0) {
    let comment_id_list: any = [];
    for (let item = 0; item < comment_list.value.length; item++) {
      for (let j = 0; j < comment_list.value[item].length; j++) {
        if (
          comment_list.value[item][j].comment_id == comment_id ||
          comment_list.value[item][j].root_comment_id == comment_id
        ) {
          comment_list.value[item][j].message = "ok";
          comment_id_list.push({
            item: item,
            j: j,
          });
        }
      }
    }
    setTimeout(() => {
      for (let comment of comment_id_list) {
        comment_list.value[comment.item][comment.j] = "";
      }
      comment_content.value = "";
    }, 1000);
  } else {
    message.value = res.message;
  }
};

// 点赞或者取消赞
const commentAddOrCancelThumbs = async (
  comment_id: number,
  post_id: number,
  status: number
) => {
  const res = await PostsControllerService.postCommentAddOrCancelUsingPost(
    comment_id,
    post_id,
    status
  );
  if (res.code === 0) {
    for (let item = 0; item < comment_list.value.length; item++) {
      for (let j = 0; j < comment_list.value[item].length; j++) {
        if (comment_list.value[item][j].comment_id == comment_id) {
          if (status == 0) {
            comment_list.value[item][j].is_thumbs = 1;
            ++comment_list.value[item][j].comment_like_count;
          } else {
            comment_list.value[item][j].is_thumbs = 0;
            --comment_list.value[item][j].comment_like_count;
          }
          break;
        }
      }
    }
  } else {
    console.log(res.message);
  }
};

// 转换内容
const extractLinkText = (markdown: string = "") => {
  // 正则表达式用于匹配 Markdown 链接，并提取链接文本
  const regex = /\[([^\]]+)]\([^\\)]+\)/g;
  const matches = [];
  let match;

  // 使用 exec 方法遍历所有匹配项
  while ((match = regex.exec(markdown)) !== null) {
    matches.push(match[1]); // match[1] 是捕获的链接文本
  }

  return matches;
};
// 解析markdown内容生成目录
// 解析 Markdown 内容并提取标题
const getTitleContent = (content: string) => {
  let id = 0;
  const tokens = marked.lexer(content); // 解析 Markdown 内容为 tokens
  const headerTokens = tokens.filter((token) => token.type === "heading");
  titles.value = headerTokens.map((token: any) => {
    const tokenText = token.text || "";
    let titleText = tokenText;

    if (tokenText.includes("](")) {
      const basePart = tokenText.split("[")[0] || "";
      const links = extractLinkText(tokenText);
      const linkText = links && links.length > 0 ? links[0]! : "";
      titleText = basePart + linkText;
    }

    return {
      index: id++,
      level: token.depth,
      text: titleText,
    };
  });
};

// 点击实现跳转效果
const scrollToTitle = (index: number) => {
  const element: any = document.querySelector("#markdown");
  if (index === -1) {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    return;
  }

  const title = element.querySelectorAll("h1, h2, h3, h4, h5, h6")[index];
  if (title) {
    const rect = title.getBoundingClientRect();

    // 计算滚动位置
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetPosition = rect.top + scrollTop - 80;
    activeIndex.value = index + 1;
    // 平滑滚动到目标位置
    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  }
};
const handleScroll = () => {
  const targetElements = document.querySelectorAll(
    "#markdown h1, #markdown h2, #markdown h3, #markdown h4, #markdown h5, #markdown h6"
  );

  if (targetElements.length === 0) return;

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const offset = 80; // 偏移量

  for (let i = 0; i < targetElements.length; i++) {
    const element = targetElements[i];
    const elementTop = element.getBoundingClientRect().top + scrollTop;

    if (scrollTop <= elementTop - offset) {
      activeIndex.value = i + 1;
      break;
    }
  }
};

// 直接添加滚动事件监听
window.addEventListener("scroll", handleScroll);

// 复制内容实现加上备注声明
const addCustomText = (event: any) => {
  const customText: string =
    "\n————————————————\n" +
    "\n" +
    "版权声明：本文为该用户的原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接和本声明。\n" +
    "                        \n" +
    "原文链接：" +
    window.location.href; // 自定义要添加的内容
  const selection: any = window.getSelection();
  const selectedText = selection.toString();
  if (selectedText.length > 0) {
    event.clipboardData.setData("text/plain", selectedText + customText);
    event.preventDefault();
  }
};

window.addEventListener("copy", addCustomText);
onBeforeUnmount(() => {
  window.removeEventListener("copy", addCustomText);
  window.removeEventListener("scroll", handleScroll);
});
</script>
<template>
  <div class="w-full">
    <div class="container mx-auto px-4 max-w-7xl">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Main Content -->
        <main class="w-full lg:w-3/4">
          <article class="card bg-white shadow-xl rounded-lg">
            <div class="card-body p-6 md:p-8">
              <!-- Author Info -->
              <div class="flex items-center mb-6">
                <div class="avatar mr-4">
                  <div
                    class="w-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
                  >
                    <img
                      @dragstart.prevent
                      :src="post.avatar"
                      alt="Author's avatar"
                    />
                  </div>
                </div>
                <div>
                  <div class="font-bold text-lg">{{ post.author }}</div>
                  <div class="text-sm text-gray-500">
                    <span>{{
                      dayjs(post.create_time).format("YYYY-MM-DD HH:mm")
                    }}</span>
                    <span v-if="post.school"> · {{ post.school }}</span>
                    <span v-if="post.tag_first"> · {{ post.tag_first }}</span>
                    <span v-if="post.location">
                      · {{ post.location == null ? "未知地区" : post.location }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Post Title -->
              <h1
                class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4"
              >
                {{ post.title }}
              </h1>

              <!-- Download Button -->
              <div v-if="post.status === 3" class="mb-4">
                <a
                  :href="post.url"
                  class="btn btn-primary text-white"
                  style="font-size: 16px"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  点击下载
                </a>
              </div>

              <div class="divider"></div>

              <!-- Markdown Content -->
              <div id="markdown" class="prose max-w-none">
                <MarkdownEditorView
                  :generateData="post.content"
                  style="width: 100%"
                />
              </div>

              <div class="divider mt-8"></div>

              <!-- Action Bar -->
              <div class="flex items-center justify-between text-gray-500 mt-4">
                <div class="flex items-center gap-6">
                  <!-- Like button -->
                  <div
                    class="heart-icon flex items-center cursor-pointer"
                    @click="postAddOrCancelThumbs"
                  >
                    <div class="relative" style="width: 30px; height: 30px">
                      <input
                        type="checkbox"
                        :checked="isThumb"
                        class="absolute opacity-0 w-full h-full cursor-pointer z-10"
                      />
                      <svg
                        v-show="!isThumb"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          class="heart"
                          d="M512 854.9c-7.7 0-14.3-2.7-19.6-8.1L213.8 578.1c-3-2.3-7-6.3-12.3-11.6-5.2-5.4-13.4-15.1-24.8-29.2-11.3-14.2-21.4-28.6-30.3-43.6-8.9-14.8-16.9-32.9-23.8-54-7-21.1-10.5-41.7-10.5-61.6 0-65.4 18.9-116.7 56.7-153.6s90-55.4 156.7-55.4c18.5 0 37.3 3.2 56.4 9.6 19.2 6.4 37.1 15 53.6 25.9 16.5 10.9 30.7 21 42.6 30.6 11.9 9.5 23.2 19.6 33.9 30.3 10.7-10.7 22.1-20.8 33.9-30.3 11.9-9.5 26.1-19.7 42.6-30.6 16.5-10.9 34.4-19.5 53.6-25.9 19.2-6.4 38-9.6 56.4-9.6 66.7 0 118.9 18.5 156.7 55.4 37.8 36.9 56.7 88.1 56.7 153.6 0 65.8-34.1 132.8-102.3 200.9l-278 267.8c-5.3 5.4-11.9 8.1-19.6 8.1z"
                        ></path>
                      </svg>
                      <svg
                        v-show="isThumb"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#e11d48"
                          d="M2 9.137C2 14 6.02 16.591 8.962 18.911C10 19.729 11 20.5 12 20.5s2-.77 3.038-1.59C17.981 16.592 22 14 22 9.138c0-4.863-5.5-8.312-10-3.636C7.5.825 2 4.274 2 9.137"
                        />
                      </svg>
                    </div>
                    <span class="ml-2"
                      >点赞{{
                        (post.thumbs_up ?? 0) > 0 ? ` (${post.thumbs_up})` : ""
                      }}</span
                    >
                  </div>
                  <!-- Comment button -->
                  <div class="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>评论</span>
                  </div>
                </div>
                <div class="text-sm">
                  <span>浏览量 {{ post.reading }}</span>
                </div>
              </div>

              <div class="divider my-8"></div>
              <!-- Comment Section -->
              <section id="comments">
                <h2 class="text-xl font-bold mb-6">
                  评论 ({{ comment_list ? comment_list.flat().length : 0 }})
                </h2>
                <!-- New Comment Form -->
                <div class="flex items-start gap-4">
                  <div class="avatar">
                    <div class="w-12 h-12 rounded-full">
                      <img
                        @dragstart.prevent
                        :src="useStore.loginUser.avatar"
                        alt="Your avatar"
                        class="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  <div class="w-full">
                    <textarea
                      class="textarea textarea-bordered w-full h-24"
                      placeholder="发表你的评论... (支持Markdown)"
                      v-model="comment_content"
                    ></textarea>
                    <button
                      class="btn btn-neutral mt-2 float-right"
                      @click="submitComment"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        ></path>
                      </svg>
                      <span>发表评论</span>
                    </button>
                  </div>
                </div>

                <div class="divider my-8"></div>

                <!-- Comment List -->
                <div class="space-y-8">
                  <div
                    v-for="comments in comment_list"
                    :key="comments[0]?.comment_id"
                    class="comment-thread"
                  >
                    <div v-if="comments && comments.length > 0 && comments[0]">
                      <!-- Root Comment -->
                      <div class="flex items-start gap-4">
                        <div class="avatar">
                          <div class="w-12 h-12 rounded-full">
                            <img
                              @dragstart.prevent
                              :src="comments[0].avatar"
                              alt="Commenter's avatar"
                              class="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                        <div class="flex-grow">
                          <div class="flex justify-between items-center">
                            <div>
                              <span class="font-bold">{{
                                comments[0].username
                              }}</span>
                              <span class="text-sm text-gray-500 ml-2"
                                >{{ comments[0].create_time
                                }}{{ comments[0].pattern }}</span
                              >
                            </div>
                            <div
                              class="flex items-center gap-4 text-gray-500 children-hover:text-primary"
                            >
                              <button
                                @click="
                                  commentAddOrCancelThumbs(
                                    comments[0]!.comment_id,
                                    post.post_id!,
                                    comments[0]!.is_thumbs
                                  )
                                "
                                class="flex items-center gap-1"
                                :class="{
                                  'text-rose-500': comments[0]!.is_thumbs,
                                }"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  class="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2l-1.5.5-1 2-1 4V10H6z"
                                  />
                                </svg>
                                <span class="text-sm font-medium">{{
                                  comments[0]!.comment_like_count
                                }}</span>
                              </button>
                              <button
                                @click="
                                  commentAddCommentId(
                                    comments[0]!.comment_id,
                                    comments[0]!.root_comment_id
                                  )
                                "
                                class="flex items-center gap-1"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  class="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                  />
                                </svg>
                                <span class="text-sm font-medium">回复</span>
                              </button>
                              <button
                                v-if="
                                  comments[0]!.uuid === useStore.loginUser.uuid
                                "
                                @click="DeleteComment(comments[0]!.comment_id)"
                                class="flex items-center gap-1 hover:text-red-500"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  class="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <MarkdownEditorView
                            class="prose max-w-none mt-2"
                            :generateData="comments[0]!.content"
                          />
                          <transition name="slide-fade">
                            <div
                              v-if="to_comment_id === comments[0]!.comment_id"
                              class="flex items-start gap-4 mt-4 w-full"
                            >
                              <div class="avatar">
                                <div class="w-10 h-10 rounded-full">
                                  <img
                                    @dragstart.prevent
                                    :src="useStore.loginUser.avatar"
                                    alt="Your avatar"
                                    class="object-cover w-full h-full"
                                  />
                                </div>
                              </div>
                              <div class="w-full">
                                <textarea
                                  class="textarea textarea-bordered w-full h-20"
                                  :placeholder="`回复 @${
                                    comments[0]!.username
                                  }`"
                                  v-model="comment_content"
                                ></textarea>
                                <div class="flex justify-end gap-2 mt-2">
                                  <button
                                    class="btn btn-ghost btn-sm"
                                    @click="to_comment_id = 0"
                                  >
                                    取消
                                  </button>
                                  <button
                                    class="btn btn-neutral btn-sm"
                                    @click="submitComment"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      class="h-4 w-4 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                      ></path>
                                    </svg>
                                    <span>回复</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </transition>
                        </div>
                      </div>

                      <!-- Replies -->
                      <div class="pl-16 mt-6 space-y-6">
                        <div
                          v-for="reply in comments.slice(1)"
                          :key="reply.comment_id"
                        >
                          <div class="flex items-start gap-4" v-if="reply">
                            <div class="avatar">
                              <div class="w-12 h-12 rounded-full">
                                <img
                                  @dragstart.prevent
                                  :src="reply.avatar"
                                  alt="Commenter's avatar"
                                  class="object-cover w-full h-full"
                                />
                              </div>
                            </div>
                            <div class="flex-grow">
                              <div class="flex justify-between items-center">
                                <div>
                                  <span class="font-bold">{{
                                    reply.username
                                  }}</span>
                                  <span class="text-sm text-gray-500 mx-1"
                                    >回复</span
                                  >
                                  <router-link
                                    v-if="reply.to_comment_id"
                                    :to="
                                      '/myspace/index/' + reply.to_comment_id
                                    "
                                  >
                                    <span class="text-blue-600 font-semibold"
                                      >@{{ reply.to_comment_name }}</span
                                    >
                                  </router-link>
                                  <span class="text-sm text-gray-500 ml-2"
                                    >{{ reply.create_time
                                    }}{{ reply.pattern }}</span
                                  >
                                </div>
                                <div
                                  class="flex items-center gap-4 text-gray-500 children-hover:text-primary"
                                >
                                  <button
                                    @click="
                                      commentAddOrCancelThumbs(
                                        reply.comment_id,
                                        post.post_id!,
                                        reply.is_thumbs
                                      )
                                    "
                                    class="flex items-center gap-1"
                                    :class="{
                                      'text-rose-500': reply.is_thumbs,
                                    }"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      class="h-4 w-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2l-1.5.5-1 2-1 4V10H6z"
                                      />
                                    </svg>
                                    <span class="text-sm font-medium">{{
                                      reply.comment_like_count
                                    }}</span>
                                  </button>
                                  <button
                                    @click="
                                      commentAddCommentId(
                                        reply.comment_id,
                                        reply.root_comment_id
                                      )
                                    "
                                    class="flex items-center gap-1"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      class="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                      />
                                    </svg>
                                    <span class="text-sm font-medium"
                                      >回复</span
                                    >
                                  </button>
                                  <button
                                    v-if="
                                      reply.uuid === useStore.loginUser.uuid
                                    "
                                    @click="DeleteComment(reply.comment_id)"
                                    class="flex items-center gap-1 hover:text-red-500"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      class="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <MarkdownEditorView
                                class="prose max-w-none mt-2"
                                :generateData="reply.content"
                              />
                              <transition name="slide-fade">
                                <div
                                  v-if="to_comment_id === reply.comment_id"
                                  class="flex items-start gap-4 mt-4 w-full"
                                >
                                  <div class="avatar">
                                    <div class="w-10 h-10 rounded-full">
                                      <img
                                        @dragstart.prevent
                                        :src="useStore.loginUser.avatar"
                                        alt="Your avatar"
                                        class="object-cover w-full h-full"
                                      />
                                    </div>
                                  </div>
                                  <div class="w-full">
                                    <textarea
                                      class="textarea textarea-bordered w-full h-20"
                                      :placeholder="`回复 @${reply.username}`"
                                      v-model="comment_content"
                                    ></textarea>
                                    <div class="flex justify-end gap-2 mt-2">
                                      <button
                                        class="btn btn-ghost btn-sm"
                                        @click="to_comment_id = 0"
                                      >
                                        取消
                                      </button>
                                      <button
                                        class="btn btn-neutral btn-sm"
                                        @click="submitComment"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          class="h-4 w-4 mr-1"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                          ></path>
                                        </svg>
                                        <span>回复</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </transition>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </article>
        </main>

        <!-- TOC -->
        <aside class="w-full lg:w-1/4 lg:block hidden">
          <div class="toc-container">
            <div class="card bg-white shadow-sm rounded-lg">
              <div class="card-body p-4">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  目录
                </h3>
                <div
                  class="max-h-[calc(100vh-180px)] overflow-y-auto pr-2 custom-scrollbar"
                >
                  <nav>
                    <ul class="space-y-2">
                      <li>
                        <a
                          @click.prevent="scrollToTitle(-1)"
                          href="#"
                          class="block text-sm transition-colors duration-200 font-bold text-primary"
                        >
                          回到顶部
                        </a>
                      </li>
                      <li v-for="title in titles" :key="title.index">
                        <a
                          @click.prevent="scrollToTitle(title.index)"
                          href="#"
                          class="block text-sm transition-colors duration-200"
                          :class="{
                            'text-primary font-bold border-l-2 border-primary':
                              activeIndex === title.index + 1,
                            'text-gray-600 hover:text-primary border-l-2 border-transparent hover:border-gray-300':
                              activeIndex !== title.index + 1,
                          }"
                          :style="{
                            'padding-left': (title.level - 1) * 1 + 1 + 'rem',
                          }"
                        >
                          {{ title.text }}
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.heart-icon {
  --skin-color: rgb(245, 98, 110);
  --gray-color: rgb(197, 197, 197);
  --path-dasharray: 3600;

  svg {
    position: relative;
    z-index: 9;
    .heart {
      fill: var(--gray-color);
      stroke: var(--skin-color);
      stroke-dasharray: var(--path-dasharray);
      stroke-width: 50px;
      stroke-dashoffset: var(--path-dasharray);
      stroke-linecap: round;
    }
  }
}

@keyframes touch {
  0%,
  50%,
  100% {
    transform: scale(1);
  }
  25% {
    transform: scale(0.75);
  }
  75% {
    transform: scale(1.25);
  }
}
input[type="checkbox"] {
  &:checked + svg {
    animation: touch 0.5s forwards ease-in;
    .heart {
      animation: run 0.75s 0.1s forwards linear;
    }
  }
}

@keyframes run {
  to {
    stroke-dashoffset: 0;
    fill: var(--skin-color);
  }
}

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

/* Add this to your styles */
.children-hover\:text-primary > * {
  transition: color 0.2s ease-in-out;
}
.children-hover\:text-primary > *:hover {
  color: var(--fallback-p, oklch(var(--p) / 1));
}
.prose {
  line-height: 1.7;
}

#markdown :deep(h1),
#markdown :deep(h2),
#markdown :deep(h3),
#markdown :deep(h4),
#markdown :deep(h5),
#markdown :deep(h6) {
  scroll-margin-top: 80px; /* Adjust this value to your liking */
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.toc-container {
  position: fixed;
  top: 75px; /* Adjust this value to match your navigation bar height */
  width: 300px;
  right: calc((100% - 1300px) / 2);
  z-index: 10;
}

@media (max-width: 1536px) {
  .toc-container {
    right: 20px;
    width: 280px;
  }
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}

#markdown :deep(h5),
#markdown :deep(h6) {
  scroll-margin-top: 80px; /* Adjust this value to your liking */
}
</style>
