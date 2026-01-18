<script setup lang="ts">
import { onMounted, Ref, ref, nextTick } from "vue";
import MarkdownEditorView from "@/view/Markdown/MarkdownView.vue";
import { PostsControllerService } from "../../../generated";
import dayjs, { Dayjs } from "dayjs";
import UserStore from "@/store/user";
import FontLittleComponent from "@/view/components/font/FontLittleComponent.vue";
import { useMessageBox } from "@/view/components/alert/useMessageBox";
const useStore = UserStore();
const { success, error, warning } = useMessageBox();

const posts_list: any = ref([]);
const comment_list: any = ref([]);
const loading_posts_list: Ref<any[]> = ref([]);
const title = ref("");
const content = ref("");
const tag_list: any = ref([]);
const currentPage = ref(1);
const isShow = ref(false);
const num = ref(0);
const comment_content = ref("");
const root_comment_id = ref(0);
const to_comment_id = ref(0);

const formatTimeAgo = (dateString: string | Dayjs) => {
  const timeStamp = dayjs().diff(dayjs(dateString), "second");
  if (timeStamp < 0) return { value: "", unit: "来自未来" };

  const years = Math.floor(timeStamp / (365 * 24 * 60 * 60));
  if (years >= 1) return { value: years, unit: "年前" };

  const months = Math.floor(timeStamp / (30 * 24 * 60 * 60));
  if (months >= 1) return { value: months, unit: "个月前" };

  const days = Math.floor(timeStamp / (24 * 60 * 60));
  if (days >= 1) return { value: days, unit: "天前" };

  const hours = Math.floor(timeStamp / (60 * 60));
  if (hours >= 1) return { value: hours, unit: "个小时前" };

  const minutes = Math.floor(timeStamp / 60);
  if (minutes >= 1) return { value: minutes, unit: "分钟前" };

  return { value: Math.floor(timeStamp), unit: "秒前" };
};

onMounted(async () => {
  const res = await PostsControllerService.postSearchByPageUsingPost("post", 1);
  if (res.code === 0) {
    posts_list.value = res.data;
    posts_list.value.forEach((post: any) => {
      const { value, unit } = formatTimeAgo(post.create_time);
      post.timeAgoValue = value;
      post.timeAgoUnit = unit;
      post.comments_visible = false;
      post.comments_loaded = false;
      // 确保is_thumbs属性存在，默认为1（未点赞）
      post.is_thumbs = post.is_thumbs !== undefined ? post.is_thumbs : 1;
      // 如果这篇文章的内容字数多余200字的话我们就选择将超过200字的部分进行隐藏。0表示展开状态1表示默认不展开，2表示没有展开
      if (post.content.length > 200) {
        post.is_hidden = 1;
        post.extra_content = post.content.substring(200);
        post.content = post.content.substring(0, 200);
      } else {
        post.is_hidden = 2;
      }
    });
  } else {
    error(res.message);
    setTimeout(() => {
      location.reload();
    }, 3000);
  }
});

// 发帖子
const PostAdd = async () => {
  if (tag_list.value[0] != "#") {
    error("标签内容填写有误，请注意#");
    setTimeout(() => {}, 3000);
  } else if (
    title.value.length == 0 ||
    content.value.length == 0 ||
    tag_list.value.length === 0
  ) {
    error("填写内容不允许为空");
  } else {
    tag_list.value = tag_list.value.toString().split("#").splice(1);
    const res = await PostsControllerService.postAddUsingPost({
      content: content.value,
      tags_list: tag_list.value,
      title: title.value,
      location: useStore.currentLocation,
    });

    if (res.code === 0) {
      success("发帖成功！！！");
      content.value = "";
      tag_list.value = [];
      title.value = "";
    } else {
      error(res.message);
    }
  }
};

// 滚动事件
const scroll = () => {
  let isLoading = true;
  window.onscroll = async () => {
    let bottomOfWindow =
      document.documentElement.offsetHeight -
        document.documentElement.scrollTop -
        window.innerHeight <=
      1;
    // console.log(num.value);
    if (bottomOfWindow && isLoading && num.value === 0) {
      isShow.value = true;
      num.value++;
      currentPage.value++;
      const res = await PostsControllerService.postSearchByPageUsingPost(
        "post", currentPage.value
      );
      if (res.code === 0) {
        loading_posts_list.value = res.data;
        if (loading_posts_list.value.length === 0) {
          setTimeout(() => {
            isShow.value = false;
          }, 2000);
        } else {
          loading_posts_list.value.forEach((post: any) => {
            const { value, unit } = formatTimeAgo(post.create_time);
            post.timeAgoValue = value;
            post.timeAgoUnit = unit;
            post.comments_visible = false;
            post.comments_loaded = false;
            // 确保is_thumbs属性存在，默认为1（未点赞）
            post.is_thumbs = post.is_thumbs !== undefined ? post.is_thumbs : 1;

            if (post.content.length > 200) {
              post.is_hidden = 1;
              post.extra_content = post.content.substring(200);
              post.content = post.content.substring(0, 200);
            } else {
              post.is_hidden = 2;
            }
          });
          setTimeout(() => {
            posts_list.value = posts_list.value.concat(
              loading_posts_list.value
            );
            num.value = 0;
            isShow.value = false;
          }, 2000);
        }
      } else {
        isLoading = false;
        error(res.message);
      }
    }
  };
};

const toggleComments = async (post: any) => {
  if (!post.comments_loaded) {
    await commentShow(post.post_id);
    post.comments_loaded = true;
  }
  post.comments_visible = !post.comments_visible;
};

const commentShow = async (post_id: number) => {
  const res = await PostsControllerService.postSearchCommentByPostIdUsingPost(
    post_id
  );
  if (res.code === 0) {
    comment_list.value[post_id] = res.data;
    if (comment_list.value[post_id] == null) {
      return;
    }
    comment_list.value[post_id].forEach((commentThread: any[]) => {
      if (commentThread) {
        commentThread.forEach((comment: any) => {
          if (comment) {
            const { value, unit } = formatTimeAgo(comment.create_time);
            comment.timeAgoValue = value;
            comment.timeAgoUnit = unit;
          }
        });
      }
    });
  }
};

const commentAddCommentId = (
  single_comment_id: number,
  single_root_comment_id: number
) => {
  if (
    single_root_comment_id == root_comment_id.value &&
    single_comment_id == to_comment_id.value
  ) {
    root_comment_id.value = 0;
    to_comment_id.value = 0;
  } else {
    to_comment_id.value = single_comment_id;
    root_comment_id.value = single_root_comment_id;
    if (single_root_comment_id === 0) {
      root_comment_id.value = single_comment_id;
    }
  }
};

const submitComment = async (post_id: number) => {
  if (comment_content.value.trim() === "") {
    error("评论信息不能为空");
    return;
  }
  const res = await PostsControllerService.postCommentAddUsingPost({
    content: comment_content.value,
    post_id: post_id,
    root_comment_id:
      root_comment_id.value == 0
        ? to_comment_id.value
        : root_comment_id.value,
    to_comment_id: to_comment_id.value,
  });

  if (res.code === 0) {
    comment_content.value = "";
    to_comment_id.value = 0;
    root_comment_id.value = 0;

    await commentShow(post_id);

    const post = posts_list.value.find((p: any) => p.post_id === post_id);
    if (post) {
      post.comment_num++;
    }
  } else {
    error(res.message);
  }
};

addEventListener("scroll", scroll);

// 刪除评论
const DeleteComment = async (post_id: number, comment_id: number) => {
  const res = await PostsControllerService.postCommentDeleteUsingPost(
    comment_id
  );
  if (res.code === 0) {
    let comment_id_list: any = [];
    for (let item = 0; item < comment_list.value[post_id].length; item++) {
      for (let j = 0; j < comment_list.value[post_id][item].length; j++) {
        if (
          comment_list.value[post_id][item][j].comment_id == comment_id ||
          comment_list.value[post_id][item][j].root_comment_id == comment_id
        ) {
          comment_list.value[post_id][item][j].message = "ok";
          for (let item = 0; item < posts_list.value.length; item++) {
            if (posts_list.value[item].post_id == post_id) {
              posts_list.value[item].comment_num--;
              break;
            }
          }
          comment_id_list.push({
            item: item,
            j: j,
          });
        }
      }
    }
    setTimeout(() => {
      for (let comment of comment_id_list) {
        comment_list.value[post_id][comment.item][comment.j] = "";
      }
      comment_content.value = "";
    }, 1000);
  }
};

// 点赞或者取消点赞
const postAddOrCancelThumbs = async (post_id: number, isThumb: number) => {
  // isThumb 值为1表示未点赞，0表示已点赞
  if (isThumb === 1) {
    // 当前未点赞，需要点赞
    const res = await PostsControllerService.postThumbsAddOrCancelUsingPost(
      post_id,
      0
    );

    if (res.code === 0) {
      for (let item = 0; item < posts_list.value.length; item++) {
        if (posts_list.value[item].post_id === post_id) {
          posts_list.value[item].thumbs_up++;
          posts_list.value[item].is_thumbs = 0;
          break;
        }
      }
    } else {
      error(res.message);
    }
  } else {
    // 当前已点赞，需要取消点赞
    const res = await PostsControllerService.postThumbsAddOrCancelUsingPost(
      post_id,
      1
    );

    if (res.code === 0) {
      for (let item = 0; item < posts_list.value.length; item++) {
        if (posts_list.value[item].post_id === post_id) {
          posts_list.value[item].thumbs_up--;
          posts_list.value[item].is_thumbs = 1;
          break;
        }
      }
    } else {
      error(res.message);
    }
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
    for (let item = 0; item < comment_list.value[post_id].length; item++) {
      for (let j = 0; j < comment_list.value[post_id][item].length; j++) {
        if (comment_list.value[post_id][item][j].comment_id == comment_id) {
          if (status == 0) {
            comment_list.value[post_id][item][j].is_thumbs = 1;
            ++comment_list.value[post_id][item][j].comment_like_count;
          } else {
            comment_list.value[post_id][item][j].is_thumbs = 0;
            --comment_list.value[post_id][item][j].comment_like_count;
          }
          break;
        }
      }
    }
  } else {
    console.log(res.message);
  }
};

// 实现内容展开和不展开的的状态切换
const click = async (post_id: number) => {
  const post = posts_list.value.find((p: any) => p.post_id === post_id);
  if (!post) return;

  if (post.is_hidden === 0) {
    post.is_hidden = 1;
    post.content = post.content.substring(0, 200);
    await nextTick();
    const postElement = document.getElementById(`post-${post_id}`);
    if (postElement) {
      postElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } else if (post.is_hidden === 1) {
    post.is_hidden = 0;
    post.content += post.extra_content;
    await nextTick();
    setTimeout(() => {
      const postElement = document.getElementById(`post-${post_id}`);
      if (postElement) {
        postElement.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 100);
  }
};

// 删除属于自己的帖子
const deletePost = async (post_id: number) => {
  const res = await PostsControllerService.postDeleteUsingPost(post_id);
  if (res.code === 0) {
    success("恭喜你，帖子删除成功！！！");
    content.value = "";
    tag_list.value = [];
    title.value = "";
  } else {
    error(res.message);
  }
};
</script>

<template>
  <div class="flex">
    <div class="mx-auto">
      <div class="card lg:card-side bg-white mt-5" style="width: 580px">
        <div class="card-body bg-white p-4 rounded-lg" style="width: 580px">
          <div>
            <div class="font-bold text-lg">添加帖子</div>
            <div class="divider"></div>
            <div>
              <router-link
                class="avatar h-auto"
                :to="'/user/space/' + useStore.loginUser.uuid"
              >
                <div class="rounded-full w-12 mx-3">
                  <img
                    @dragstart.prevent
                    :src="useStore.loginUser.avatar"
                    alt="ByteOJ出品"
                  />
                </div>
              </router-link>
              <button
                class="btn rounded-full text-gray-600"
                style="width: 430px; background-color: #f0f2f5"
                onclick="my_modal_4.showModal()"
              >
                {{ useStore.loginUser.username }}, 有什么新鲜事想分享吗?
              </button>
              <dialog id="my_modal_4" class="modal">
                <div class="modal-box w-11/12 max-w-5xl">
                  <h1 class="text-lg font-bold">
                    你好，欢迎发帖，您可以在下面填写你想要发送的内容
                  </h1>
                  <form method="dialog">
                    <button
                      class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    >
                      ✕
                    </button>
                  </form>
                  <label
                    class="input input-bordered flex items-center gap-2 my-4"
                  >
                    帖子标题
                    <input
                      type="text"
                      class="grow font-bold"
                      placeholder="填写帖子标题"
                      v-model="title"
                    />
                  </label>
                  <label
                    class="input input-bordered flex items-center gap-2 my-4"
                  >
                    帖子标签
                    <input
                      type="text"
                      class="grow font-bold"
                      placeholder="填写帖子标签，注意请您在每个标签前加上#，如#CCPC#天梯赛"
                      v-model="tag_list"
                    />
                  </label>
                  <div class="font-bold">帖子内容</div>
                  <textarea
                    placeholder="在这里写下您需要分享的讨论内容（此处支持markdown，MaxJax语法）"
                    class="textarea textarea-bordered textarea-lg w-full h-64 my-4"
                    v-model="content"
                  ></textarea>
                  <div class="modal-action">
                    <form method="dialog">
                      <button class="btn btn-primary w-full" @click="PostAdd">
                        发布
                      </button>
                    </form>
                  </div>
                </div>
              </dialog>
            </div>
          </div>
        </div>
      </div>

      <div
        :id="'post-' + post.post_id"
        class="card lg:card-side bg-white mt-5"
        v-for="post in posts_list"
        :key="post.post_id"
        style="width: 580px"
      >
        <div class="card-body bg-white my-5" style="width: 580px">
          <!-- 添加 flex 布局 -->
          <div>
            <div class="flex">
              <div class="font-bold flex-1" style="font-size: 18px">日常</div>
              <router-link
                class="font-bold"
                style="font-size: 18px"
                :to="'/posts/' + post.post_id"
                >原文
              </router-link>
            </div>
            <div class="flex mt-4">
              <router-link class="avatar" :to="'/user/space/' + post.uuid">
                <div class="rounded-full w-12 mx-3">
                  <img @dragstart.prevent :src="post.avatar" alt="ByteOJ出品" />
                </div>
              </router-link>
              <div class="flex-1">
                <div class="font-bold">{{ post.author }}</div>
                <div class="text-gray-500">
                  <!--                  <FontLittleComponent v-if="post.school === '豫章师范学院'" :text="post.school" />-->
                  <div>{{ post.school }}</div>
                </div>
              </div>
              <div class="text-gray-500">
                {{ post.timeAgoValue }} {{ post.timeAgoUnit }}
              </div>
            </div>

            <div class="my-4 font-bold text-3xl">
              {{ post.title }}
            </div>
            <div>
              <MarkdownEditorView
                :generateData="post.content"
                style="width: 540px"
              />
            </div>
            <div class="text-lg flex">
              <span
                class="badge badge-md badge-info font-bold mx-1"
                v-for="tag in post.tag_list"
                :key="tag"
                >#{{ tag }}</span
              >
              <div class="flex-1"></div>
              <button
                class="btn btn-link btn-sm"
                v-if="post.is_hidden != 2"
                @click="click(post.post_id)"
              >
                <span>{{ post.is_hidden === 1 ? "展开" : "收起" }}</span>
                <span>
                  <svg
                    v-if="post.is_hidden === 0"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="white"
                      d="M8.12 9.29L12 13.17l3.88-3.88a.996.996 0 1 1 1.41 1.41l-4.59 4.59a.996.996 0 0 1-1.41 0L6.7 10.7a.996.996 0 0 1 0-1.41c.39-.38 1.03-.39 1.42 0"
                    />
                  </svg>
                  <svg
                    v-else-if="post.is_hidden === 1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="white"
                      d="M8.12 14.71L12 10.83l3.88 3.88a.996.996 0 1 0 1.41-1.41L12.7 8.71a.996.996 0 0 0-1.41 0L6.7 13.3a.996.996 0 0 0 0 1.41c.39.38 1.03.39 1.42 0"
                    />
                  </svg>
                </span>
              </button>
            </div>
            <div class="divider"></div>
            <div class="flex justify-center items-center text-gray-500 space-x-8 max-w-md mx-auto">
              <button
                class="btn btn-ghost btn-sm flex items-center"
                @click="postAddOrCancelThumbs(post.post_id, post.is_thumbs)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  viewBox="0 0 24 24"
                  :class="{ 'text-red-500': post.is_thumbs === 0, 'text-gray-400': post.is_thumbs === 1 }"
                  :fill="post.is_thumbs === 0 ? 'currentColor' : 'none'"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span class="ml-1 text-sm">{{ post.thumbs_up }}</span>
              </button>
              <button
                class="btn btn-ghost btn-sm flex items-center"
                @click="toggleComments(post)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span class="ml-1 text-sm">{{ post.comment_num }}</span>
              </button>
              <button class="btn btn-ghost btn-sm flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                <span class="ml-1 text-sm">收藏</span>
              </button>
            </div>

            <div class="divider"></div>
            <div class="text-center">
              <button
                class="btn btn-outline btn-sm rounded-full"
                @click="toggleComments(post)"
              >
                {{
                  post.comments_visible
                    ? "隐藏评论"
                    : `查看全部 ${post.comment_num} 条评论`
                }}
              </button>
            </div>
            <div v-if="post.comments_visible">
              <!-- Comment Section -->
              <section id="comments" class="mt-4">
                <h2 class="text-xl font-bold mb-6">
                  评论 ({{ comment_list[post.post_id] ? comment_list[post.post_id].flat().length : 0 }})
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
                      @click="submitComment(post.post_id)"
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
                    v-for="comments in comment_list[post.post_id]"
                    :key="comments[0]?.comment_id"
                    class="comment-thread"
                  >
                    <div
                      v-if="comments && comments.length > 0 && comments[0]"
                    >
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
                                >{{ comments[0].timeAgoValue }}{{ comments[0].timeAgoUnit }}</span
                              >
                            </div>
                            <div
                              class="flex items-center gap-4 text-gray-500 children-hover:text-primary"
                            >
                              <button
                                @click="
                                  commentAddOrCancelThumbs(
                                    comments[0].comment_id,
                                    post.post_id,
                                    comments[0].is_thumbs
                                  )
                                "
                                class="flex items-center gap-1"
                                :class="{
                                  'text-rose-500': comments[0].is_thumbs === 1,
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
                                  comments[0].comment_like_count
                                }}</span>
                              </button>
                              <button
                                @click="
                                  commentAddCommentId(
                                    comments[0].comment_id,
                                    comments[0].root_comment_id
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
                                  comments[0].uuid === useStore.loginUser.uuid
                                "
                                @click="DeleteComment(post.post_id, comments[0].comment_id)"
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
                            :generateData="comments[0].content"
                          />
                          <transition name="slide-fade">
                            <div
                              v-if="to_comment_id === comments[0].comment_id"
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
                                    comments[0].username
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
                                    @click="submitComment(post.post_id)"
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
                                    >{{ reply.timeAgoValue }}{{ reply.timeAgoUnit }}</span
                                  >
                                </div>
                                <div
                                  class="flex items-center gap-4 text-gray-500 children-hover:text-primary"
                                >
                                  <button
                                    @click="
                                      commentAddOrCancelThumbs(
                                        reply.comment_id,
                                        post.post_id,
                                        reply.is_thumbs
                                      )
                                    "
                                    class="flex items-center gap-1"
                                    :class="{
                                      'text-rose-500': reply.is_thumbs === 1,
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
                                    @click="DeleteComment(post.post_id, reply.comment_id)"
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
                                        @click="submitComment(post.post_id)"
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

                <div
                  v-if="
                    !comment_list[post.post_id] ||
                    comment_list[post.post_id].length === 0
                  "
                  class="text-center py-8 text-gray-500"
                >
                  还没有评论，快来抢占沙发吧！
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-center w-full py-6" v-if="isShow">
        <span class="loading loading-dots loading-lg"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 为 flex 子元素设置一些样式，以确保它们的布局合理 */
.card-body > .avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
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
</style>

