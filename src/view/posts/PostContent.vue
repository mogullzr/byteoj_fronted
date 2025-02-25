<script setup lang="ts">
import { onBeforeUnmount, onMounted, Ref, ref, UnwrapRef, watch } from "vue";
import router from "@/router";
import { PostsControllerService, PostsVo } from "../../../generated";
import dayjs, { Dayjs } from "dayjs";
import MarkdownEditorView from "@/view/Markdown/MarkdownView.vue";
import UserStore from "@/store/user";
import { marked } from "marked";
import { useMessageBox } from "@/view/components/alert/useMessageBox";

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

const titles: Ref<any> = ref([]);
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
const extractLinkText = (markdown: string) => {
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
  titles.value = headerTokens.map((token: any) => ({
    index: id++,
    level: token.depth,
    text: token.text.includes("](")
      ? token.text.split("[")[0] +
        (extractLinkText(token.text)[0] == undefined
          ? ""
          : extractLinkText(token.text)[0])
      : token.text,
  }));
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
  event.clipboardData.setData("text/plain", selectedText + customText);
  event.preventDefault();
  console.log(123);
};

window.addEventListener("copy", addCustomText);
onBeforeUnmount(() => {
  window.removeEventListener("copy", addCustomText);
  window.removeEventListener("scroll", handleScroll);
});
</script>
<template>
  <div class="container flex mx-auto">
    <div class="card lg:card-side shadow-xl ml-72 bg-white">
      <div class="card-body flex">
        <div class="flex">
          <div class="avatar">
            <div class="rounded-full w-12 mx-3">
              <img @dragstart.prevent :src="post.avatar" alt="ByteOJ出品" />
            </div>
          </div>
          <div class="flex-col">
            <div class="font-bold flex-1">{{ post.author }}</div>
            <div class="text-gray-400">
              {{ dayjs(post.create_time).format("YYYY-MM-DD HH:mm") }} 发布
              {{ post.school }} {{ post.tag_first }} 发布于
              {{ post.location == null ? "未知地区" : post.location }}
            </div>
          </div>
        </div>
        <div class="font-bold" style="font-size: 36px">
          {{ post.title }}
        </div>
        <div v-if="post.status === 3">
          <a
            :href="post.url"
            class="float-right btn btn-primary text-white"
            style="font-size: 18px"
            >点击下载</a
          >
        </div>

        <div class="divider"></div>
        <div id="markdown">
          <MarkdownEditorView
            :generateData="post.content"
            style="width: 700px"
          />
        </div>
        <div class="flex">
          <div class="heart-icon flex" @click="postAddOrCancelThumbs">
            <div class="w-20">
              <input type="checkbox" />
              <svg
                v-show="!isThumb"
                viewBox="0 0 1024 1024"
                version="1.1"
                width="30"
                height="30"
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
                width="30"
                height="30"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#e11d48"
                  d="M2 9.137C2 14 6.02 16.591 8.962 18.911C10 19.729 11 20.5 12 20.5s2-.77 3.038-1.59C17.981 16.592 22 14 22 9.138c0-4.863-5.5-8.312-10-3.636C7.5.825 2 4.274 2 9.137"
                />
              </svg>
              <span class="w-40 my-1 ml-3 text-gray-400"
                >点赞{{ post.thumbs_up }}</span
              >
            </div>
          </div>
          <button class="ml-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
            >
              <path
                fill="#999999"
                d="M6.5 13.5h11v-1h-11zm0-3h11v-1h-11zm0-3h11v-1h-11zM21 20.077L17.923 17H4.616q-.691 0-1.154-.462T3 15.385V4.615q0-.69.463-1.153T4.615 3h14.77q.69 0 1.152.462T21 4.615zM4.616 16H18.35L20 17.644V4.616q0-.231-.192-.424T19.385 4H4.615q-.23 0-.423.192T4 4.615v10.77q0 .23.192.423t.423.192M4 16V4z"
              />
            </svg>
            <span class="w-40 my-1 text-gray-400"> 评论 </span>
          </button>
          <div class="flex-1"></div>
          <div class="my-3 text-gray-400" style="font-size: 18px">
            浏览量
            <span>{{ post.reading }}</span>
          </div>
        </div>
        <div class="divider"></div>
        <div class="flex">
          <div class="avatar">
            <div class="rounded-full w-16 h-16 mx-2">
              <img
                @dragstart.prevent
                :src="useStore.loginUser.avatar"
                alt="ByteOJ出品"
              />
            </div>
          </div>
          <label class="form-control w-full">
            <div class="label">
              <span class="label-text font-bold">{{
                useStore.loginUser.username
              }}</span>
            </div>
            <textarea
              class="textarea textarea-bordered h-24"
              placeholder="在这里可以填写你的评论哦o(*￣︶￣*)o（此处支持markdown，MaxJax语法）"
              v-model="comment_content"
            ></textarea>
            <button
              class="btn btn-outline btn-success my-2"
              @click="submitComment"
            >
              提交评论
            </button>
          </label>
        </div>
        <div class="divider"></div>
        <div v-for="comments in comment_list" :key="comments">
          <div v-for="(comment, index) in comments" :key="comment.comment_id">
            <div v-if="index == 0 && comment != ''" class="flex">
              <div class="avatar">
                <div class="rounded-full w-16 h-16 mx-2">
                  <img
                    @dragstart.prevent
                    :src="comment.avatar"
                    alt="ByteOJ出品"
                  />
                </div>
              </div>
              <div class="flex-1">
                <span class="font-bold mx-2">{{ comment.username }}</span>
                <span class="text-gray-500">
                  {{ comment.create_time }}{{ comment.pattern }}
                </span>
                <button
                  class="float-right mx-2"
                  v-if="comment.uuid === useStore.loginUser.uuid"
                  @click="DeleteComment(comment.comment_id)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 12 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M11 2H9c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1H2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1v9c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 12H3V5h1v8h1V5h1v8h1V5h1v8h1V5h1v9zm1-10H2V3h9v1z"
                      fill="#e11d48"
                    />
                  </svg>
                  <span class="text-red-600 font-bold">{{
                    comment.message
                  }}</span>
                </button>
                <button
                  class="float-right mx-2"
                  @click="
                    commentAddOrCancelThumbs(
                      comment.comment_id,
                      post.post_id,
                      comment.is_thumbs
                    )
                  "
                >
                  <svg
                    v-if="comment.is_thumbs === 0"
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 32 32"
                  >
                    <path
                      fill="#999999"
                      d="M2 16h5v14H2zm21 14H9V15.197l3.042-4.563l.845-5.917A2.01 2.01 0 0 1 14.868 3H15a3.003 3.003 0 0 1 3 3v6h8a4.005 4.005 0 0 1 4 4v7a7.01 7.01 0 0 1-7 7"
                    />
                  </svg>

                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 32 32"
                  >
                    <path
                      fill="#e11d48"
                      d="M2 16h5v14H2zm21 14H9V15.197l3.042-4.563l.845-5.917A2.01 2.01 0 0 1 14.868 3H15a3.003 3.003 0 0 1 3 3v6h8a4.005 4.005 0 0 1 4 4v7a7.01 7.01 0 0 1-7 7"
                    />
                  </svg>
                  <span>{{ comment.comment_like_count }}</span>
                </button>
                <button class="collapse float-right my-1">
                  <input
                    type="checkbox"
                    @click="
                      commentAddCommentId(
                        comment.comment_id,
                        comment.root_comment_id
                      )
                    "
                  />
                  <div class="collapse-title ext-primary-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#999999"
                        d="M6.5 13.5h11v-1h-11zm0-3h11v-1h-11zm0-3h11v-1h-11zM21 20.077L17.923 17H4.616q-.691 0-1.154-.462T3 15.385V4.615q0-.69.463-1.153T4.615 3h14.77q.69 0 1.152.462T21 4.615zM4.616 16H18.35L20 17.644V4.616q0-.231-.192-.424T19.385 4H4.615q-.23 0-.423.192T4 4.615v10.77q0 .23.192.423t.423.192M4 16V4z"
                      />
                    </svg>
                  </div>
                  <div class="collapse-content flex">
                    <div class="avatar">
                      <div class="rounded-full w-16 h-16 mx-2">
                        <img
                          @dragstart.prevent
                          :src="useStore.loginUser.avatar"
                          alt="ByteOJ出品"
                        />
                      </div>
                    </div>
                    <label class="form-control w-full">
                      <div class="label">
                        <span class="label-text">{{
                          useStore.loginUser.username
                        }}</span>
                      </div>
                      <textarea
                        class="textarea textarea-bordered h-24"
                        placeholder="在这里可以填写你的评论哦o(*￣︶￣*)o（此处支持markdown，MaxJax语法）"
                        v-model="comment_content"
                      ></textarea>
                      <button
                        class="btn btn-outline btn-success my-2"
                        @click="submitComment"
                      >
                        提交评论
                      </button>
                    </label>
                  </div>
                </button>
                <MarkdownEditorView :generateData="comment.content" />
              </div>
            </div>
            <div v-else-if="comment != ''" class="flex ml-16 my-4">
              <div class="avatar">
                <div class="rounded-full w-16 h-16 mx-2">
                  <img
                    @dragstart.prevent
                    :src="comment.avatar"
                    alt="ByteOJ出品"
                  />
                </div>
              </div>
              <div class="flex-1">
                <span class="font-bold mx-2">{{ comment.username }}</span>
                <span class="text-gray-500">
                  {{ comment.create_time }}{{ comment.pattern }} 回复了
                </span>
                <router-link :to="'/myspace/index/' + comment.to_comment_id">
                  <span class="text-red-600 font-bold"
                    >@{{ comment.to_comment_name }}</span
                  >
                  <span>的评论</span></router-link
                >
                <button
                  class="float-right mx-2"
                  v-if="comment.uuid === useStore.loginUser.uuid"
                  @click="DeleteComment(comment.comment_id)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 12 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M11 2H9c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1H2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1v9c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 12H3V5h1v8h1V5h1v8h1V5h1v8h1V5h1v9zm1-10H2V3h9v1z"
                      fill="#e11d48"
                    />
                  </svg>
                  <span class="text-red-600 font-bold">{{
                    comment.message
                  }}</span>
                </button>
                <button
                  class="float-right mx-2"
                  @click="
                    commentAddOrCancelThumbs(
                      comment.comment_id,
                      post.post_id,
                      comment.is_thumbs
                    )
                  "
                >
                  <svg
                    v-if="comment.is_thumbs === 0"
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 32 32"
                  >
                    <path
                      fill="#999999"
                      d="M2 16h5v14H2zm21 14H9V15.197l3.042-4.563l.845-5.917A2.01 2.01 0 0 1 14.868 3H15a3.003 3.003 0 0 1 3 3v6h8a4.005 4.005 0 0 1 4 4v7a7.01 7.01 0 0 1-7 7"
                    />
                  </svg>

                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 32 32"
                  >
                    <path
                      fill="#e11d48"
                      d="M2 16h5v14H2zm21 14H9V15.197l3.042-4.563l.845-5.917A2.01 2.01 0 0 1 14.868 3H15a3.003 3.003 0 0 1 3 3v6h8a4.005 4.005 0 0 1 4 4v7a7.01 7.01 0 0 1-7 7"
                    />
                  </svg>
                  <span>{{ comment.comment_like_count }}</span>
                </button>
                <button class="collapse float-right my-1">
                  <input
                    type="checkbox"
                    @click="
                      commentAddCommentId(
                        comment.comment_id,
                        comment.root_comment_id
                      )
                    "
                  />
                  <div class="collapse-title ext-primary-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#999999"
                        d="M6.5 13.5h11v-1h-11zm0-3h11v-1h-11zm0-3h11v-1h-11zM21 20.077L17.923 17H4.616q-.691 0-1.154-.462T3 15.385V4.615q0-.69.463-1.153T4.615 3h14.77q.69 0 1.152.462T21 4.615zM4.616 16H18.35L20 17.644V4.616q0-.231-.192-.424T19.385 4H4.615q-.23 0-.423.192T4 4.615v10.77q0 .23.192.423t.423.192M4 16V4z"
                      />
                    </svg>
                  </div>
                  <div class="collapse-content flex">
                    <div class="avatar">
                      <div class="rounded-full w-16 h-16 mx-2">
                        <img
                          @dragstart.prevent
                          :src="useStore.loginUser.avatar"
                          alt="ByteOJ出品"
                        />
                      </div>
                    </div>
                    <label class="form-control w-full">
                      <div class="label">
                        <span class="label-text">{{
                          useStore.loginUser.username
                        }}</span>
                      </div>
                      <textarea
                        class="textarea textarea-bordered h-24"
                        placeholder="在这里可以填写你的评论哦o(*￣︶￣*)o（此处支持markdown，MaxJax语法）"
                        v-model="comment_content"
                      ></textarea>
                      <button
                        class="btn btn-outline btn-success my-2"
                        @click="submitComment"
                      >
                        提交评论
                      </button>
                    </label>
                  </div>
                </button>
                <MarkdownEditorView :generateData="comment.content" />
              </div>
            </div>
          </div>
          <div class="divider" v-if="comments != ''"></div>
        </div>
      </div>
    </div>
    <div
      class="card lg:card-side shadow-lg bg-gradient-to-r bg-white lg:w-1/4 fixed flex overflow-auto scrollable-div"
      style="
        width: 400px;
        max-height: 720px;
        overflow-y: auto;
        border: 2px solid #1976d2;
        z-index: 9999;
        position: fixed;
        margin-left: 1080px;
      "
    >
      <nav class="p-6 w-full">
        <ul>
          <li class="text-2xl text-blue-500 text-center mb-4 mx-auto">
            <button
              @click="scrollToTitle(-1)"
              class="py-2 px-4 rounded-lg transition bg-blue-500 hover:bg-blue-600 active:bg-gray-700 text-white w-full"
            >
              <span> 目录(置顶)</span>
            </button>
          </li>
          <li
            :class="
              activeIndex === title.index + 1
                ? 'bg-blue-500 text-white'
                : 'text-gray-800 hover:bg-blue-100 active:bg-blue-500'
            "
            class="nav-item rounded"
            v-for="title in titles"
            :key="title.id"
          >
            <button
              class="font-bold px-2 rounded-lg block transition text-left w-full"
              :style="'text-indent:' + (title.level - 1) + 'em'"
              :id="'#' + title.id"
              @click.prevent="scrollToTitle(title.index)"
            >
              {{ title.text }}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.heart-icon {
  width: var(--size);
  position: relative;

  --skin-color: rgb(245, 98, 110);
  --gray-color: rgb(197, 197, 197);
  --size: 80px;
  --path-dasharray: 3600;

  input[type="checkbox"] {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 99;
    opacity: 0;
  }
  svg {
    width: 100%;
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
.nav-item button {
  transition: background-color 0.01ms, color 0.01s;
}
</style>
