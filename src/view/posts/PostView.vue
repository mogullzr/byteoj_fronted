<script setup lang="ts">
import { onMounted, Ref, ref } from "vue";
import MarkdownEditorView from "@/view/Markdown/MarkdownView.vue";
import { PostsControllerService } from "../../../generated";
import dayjs, { Dayjs } from "dayjs";
import UserStore from "@/store/user";
import FontLittleComponent from "@/view/components/font/FontLittleComponent.vue";
import {useMessageBox} from "@/view/components/alert/useMessageBox";
const useStore = UserStore();
const { success, error, warning } = useMessageBox();

const posts_list: any = ref([]);
const comment_list: any = ref([]);
const loading_posts_list: Ref<any[]> = ref([]);
const title = ref("");
const content = ref("");
const tag_list: any = ref([]);
const nowDate = ref<Dayjs>();
const years = ref();
const months = ref();
const days = ref();
const hours = ref();
const minutes = ref();
const seconds = ref();
const currentPage = ref(1);
const isShow = ref(false);
let TimeStamp = ref();
const num = ref(0);
const comment_content = ref("");
const root_comment_id = ref(0);
const to_comment_id = ref(0);

onMounted(async () => {
  const res = await PostsControllerService.postSearchByPageUsingPost(1);
  if (res.code === 0) {
    posts_list.value = res.data;
    for (let item = 0; item < posts_list.value.length; item++) {
      posts_list.value[item].create_time = ref<Dayjs>(
        posts_list.value[item].create_time
      );
      // 如果这篇文章的内容字数多余200字的话我们就选择将超过200字的部分进行隐藏。0表示展开状态1表示默认不展开，2表示没有展开
      if (posts_list.value[item].content.length > 200) {
        posts_list.value[item].is_hidden = 1;
        posts_list.value[item].extra_content =
          posts_list.value[item].content.substring(200);
        posts_list.value[item].content = posts_list.value[
          item
        ].content.substring(0, 200);
      } else {
        posts_list.value[item].is_hidden = 2;
      }

      TimeStamp.value =
        dayjs(nowDate.value).diff(dayjs(posts_list.value[item].create_time)) /
        1000;
      if (TimeStamp.value < 0) {
        posts_list.value[item].create_time = ref("");
        continue;
      }
      years.value = Math.floor(TimeStamp.value / (365 * 24 * 60 * 60));
      if (years.value >= 1) {
        posts_list.value[item].create_time = ref(years.value);
        posts_list.value[item].pattern = ref("年前");
        continue;
      }

      months.value = Math.floor(TimeStamp.value / (30 * 24 * 60 * 60));
      if (months.value >= 1) {
        posts_list.value[item].create_time = ref(months.value);
        posts_list.value[item].pattern = ref("个月前");
        continue;
      }

      days.value = Math.floor(TimeStamp.value / (24 * 60 * 60));
      if (days.value >= 1) {
        posts_list.value[item].create_time = ref(days.value);
        posts_list.value[item].pattern = ref("天前");
        continue;
      }

      hours.value = Math.floor(TimeStamp.value / (60 * 60));
      if (hours.value >= 1) {
        posts_list.value[item].create_time = ref(hours.value);
        posts_list.value[item].pattern = ref("个小时前");
        continue;
      }

      minutes.value = Math.floor(TimeStamp.value / 60);
      if (minutes.value >= 1) {
        posts_list.value[item].create_time = ref(minutes);
        posts_list.value[item].pattern = ref("分钟前");
        continue;
      }

      seconds.value = Math.floor(TimeStamp.value);
      posts_list.value[item].create_time = ref(seconds.value);
      posts_list.value[item].pattern = ref("秒前");
    }
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
    setTimeout(() => {
    }, 3000);
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
      success("恭喜你发帖成功！！！")
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
        currentPage.value
      );
      if (res.code === 0) {
        loading_posts_list.value = res.data;
        if (loading_posts_list.value.length === 0) {
          setTimeout(() => {
            isShow.value = false;
          }, 2000);
        } else {
          for (let item = 0; item < loading_posts_list.value.length; item++) {
            loading_posts_list.value[item].create_time = ref<Dayjs>(
              loading_posts_list.value[item].create_time
            );

            if (loading_posts_list.value[item].content.length > 200) {
              loading_posts_list.value[item].is_hidden = 1;
              loading_posts_list.value[item].extra_content =
                loading_posts_list.value[item].content.substring(200);
              loading_posts_list.value[item].content = loading_posts_list.value[
                item
              ].content.substring(0, 200);
            } else {
              loading_posts_list.value[item].is_hidden = 2;
            }
            TimeStamp.value =
              dayjs(nowDate.value).diff(
                dayjs(loading_posts_list.value[item].create_time)
              ) / 1000;
            if (TimeStamp.value < 0) {
              loading_posts_list.value[item].create_time = ref("");
              continue;
            }
            years.value = Math.floor(TimeStamp.value / (365 * 24 * 60 * 60));
            if (years.value >= 1) {
              loading_posts_list.value[item].create_time = ref(years.value);
              loading_posts_list.value[item].pattern = ref("年前");
              continue;
            }

            months.value = Math.floor(TimeStamp.value / (30 * 24 * 60 * 60));
            if (months.value >= 1) {
              loading_posts_list.value[item].create_time = ref(months.value);
              loading_posts_list.value[item].pattern = ref("个月前");
              continue;
            }

            days.value = Math.floor(TimeStamp.value / (24 * 60 * 60));
            if (days.value >= 1) {
              loading_posts_list.value[item].create_time = ref(days.value);
              loading_posts_list.value[item].pattern = ref("天前");
              continue;
            }

            hours.value = Math.floor(TimeStamp.value / (60 * 60));
            if (hours.value >= 1) {
              loading_posts_list.value[item].create_time = ref(hours.value);
              loading_posts_list.value[item].pattern = ref("个小时前");
              continue;
            }

            minutes.value = Math.floor(TimeStamp.value / 60);
            if (minutes.value >= 1) {
              loading_posts_list.value[item].create_time = ref(minutes);
              loading_posts_list.value[item].pattern = ref("分钟前");
              continue;
            }

            seconds.value = Math.floor(TimeStamp.value);
            loading_posts_list.value[item].create_time = ref(seconds.value);
            loading_posts_list.value[item].pattern = ref("秒前");
          }
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
        error(res.message)
      }
    }
  };
};

const commentShow = async (post_id: number) => {
  const res = await PostsControllerService.postSearchCommentByPostIdUsingPost(
    post_id
  );
  if (res.code === 0) {
    comment_list.value[post_id] = res.data;
    if (comment_list.value == null) {
      return;
    }
    for (let item = 0; item < comment_list.value[post_id].length; item++) {
      for (let j = 0; j < comment_list.value[post_id][item].length; j++) {
        comment_list.value[post_id][item][j].create_time = ref<Dayjs>(
          comment_list.value[post_id][item][j].create_time
        );
        TimeStamp.value =
          dayjs(nowDate.value).diff(
            dayjs(comment_list.value[post_id][item][j].create_time)
          ) / 1000;

        if (TimeStamp.value < 0) {
          comment_list.value[post_id][item][j].create_time = ref("");
          continue;
        }
        years.value = Math.floor(TimeStamp.value / (365 * 24 * 60 * 60));
        if (years.value >= 1) {
          comment_list.value[post_id][item][j].create_time = ref(years.value);
          comment_list.value[post_id][item][j].pattern = ref("年前");
          continue;
        }

        months.value = Math.floor(TimeStamp.value / (30 * 24 * 60 * 60));
        if (months.value >= 1) {
          comment_list.value[post_id][item][j].create_time = ref(months.value);
          comment_list.value[post_id][item][j].pattern = ref("个月前");
          continue;
        }

        days.value = Math.floor(TimeStamp.value / (24 * 60 * 60));
        if (days.value >= 1) {
          comment_list.value[post_id][item][j].create_time = ref(days.value);
          comment_list.value[post_id][item][j].pattern = ref("天前");
          continue;
        }

        hours.value = Math.floor(TimeStamp.value / (60 * 60));
        if (hours.value >= 1) {
          comment_list.value[post_id][item][j].create_time = ref(hours.value);
          comment_list.value[post_id][item][j].pattern = ref("个小时前");
          continue;
        }

        minutes.value = Math.floor(TimeStamp.value / 60);
        if (minutes.value >= 1) {
          comment_list.value[post_id][item][j].create_time = ref(minutes.value);
          comment_list.value[post_id][item][j].pattern = ref("分钟前");
          continue;
        }

        seconds.value = Math.floor(TimeStamp.value);
        comment_list.value[post_id][item][j].create_time = ref(seconds.value);
        comment_list.value[post_id][item][j].pattern = ref("秒前");
      }
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

// 提交评论
const submitComment = async (post_id: number) => {
  if (comment_content.value == "") {
    error("评论信息不能为空");
  } else {
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
      for (let item = 0; item < posts_list.value.length; item++) {
        if (posts_list.value[item].post_id == post_id) {
          posts_list.value[item].message = "评论完成(〃'▽'〃)(〃'▽'〃)";
          posts_list.value[item].comment_num++;
          setTimeout(() => {
            posts_list.value[item].message = "";
          }, 2000);
          break;
        }
      }
    } else {
      error(res.message);
    }
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

// 点赞或者取消点赞
const postAddOrCancelThumbs = async (post_id: number, isThumb: number) => {
  if (isThumb) {
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
      console.log(res.message);
    }
  }
};

// 实现内容展开和不展开的的状态切换
const click = (post_id: number) => {
  for (let item = 0; item < posts_list.value.length; item++) {
    if (posts_list.value[item].post_id === post_id) {
      if (posts_list.value[item].is_hidden === 0) {
        posts_list.value[item].is_hidden = 1;
        posts_list.value[item].content = posts_list.value[
          item
        ].content.substring(0, 200);
      } else if (posts_list.value[item].is_hidden === 1) {
        posts_list.value[item].is_hidden = 0;
        posts_list.value[item].content += posts_list.value[item].extra_content;
      }
      break;
    }
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
      <div class="card lg:card-side bg-white mt-5" style="width: 650px">
        <div class="card-body bg-white p-4 rounded-lg" style="width: 650px">
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
                    alt="Mogullzr小刘的OJ项目"
                  />
                </div>
              </router-link>
              <button
                class="btn rounded-full text-gray-600"
                style="width: 500px; background-color: #f0f2f5"
                onclick="my_modal_4.showModal()"
              >
                {{ useStore.loginUser.username }},点击这里发发帖子吧O(∩_∩)O哈哈~
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
                      <button class="btn w-full" @click="PostAdd">发布</button>
                    </form>
                  </div>
                </div>
              </dialog>
            </div>
          </div>
        </div>
      </div>

      <div
        class="card lg:card-side bg-white mt-5"
        v-for="post in posts_list"
        :key="post.post_id"
        style="width: 650px"
      >
        <div class="card-body bg-white my-5" style="width: 650px">
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
                  <img
                    @dragstart.prevent
                    :src="post.avatar"
                    alt="Mogullzr小刘的OJ项目"
                  />
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
                {{ post.create_time }}{{ post.pattern }}
              </div>
            </div>

            <div class="my-4 font-bold" style="font-size: 36px">
              {{ post.title }}
            </div>
            <div>
              <MarkdownEditorView
                :generateData="post.content"
                style="width: 610px"
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
                class="badge badge-primary badge-lg text-white"
                v-if="post.is_hidden != 2"
                @click="click(post.post_id)"
              >
                <span>展开</span>
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
            <div>
              <button class="btn btn-ghost w-1/3">
                <div
                  class="heart-icon flex"
                  @click="postAddOrCancelThumbs(post.post_id, post.is_thumbs)"
                >
                  <input type="checkbox" />
                  <svg
                    v-show="post.is_thumbs"
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
                    v-show="!post.is_thumbs"
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
                  <span class="w-full my-1 text-gray-400"
                    >点赞{{ post.thumbs_up }}</span
                  >
                </div>
              </button>
              <button class="btn btn-ghost w-1/3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#999999"
                    d="M7 13.5h10q.213 0 .356-.144t.144-.357t-.144-.356T17 12.5H7q-.213 0-.356.144t-.144.357t.144.356T7 13.5m0-3h10q.213 0 .356-.144t.144-.357t-.144-.356T17 9.5H7q-.213 0-.356.144t-.144.357t.144.356T7 10.5m0-3h10q.213 0 .356-.144t.144-.357t-.144-.356T17 6.5H7q-.213 0-.356.144t-.144.357t.144.356T7 7.5M4.616 17q-.691 0-1.153-.462T3 15.385V4.615q0-.69.463-1.153T4.615 3h14.77q.69 0 1.152.462T21 4.615v13.518q0 .534-.497.742t-.876-.171L17.923 17z"
                  />
                </svg>
                <span class="my-1 text-gray-400">
                  评论{{ post.comment_num }}
                </span>
              </button>
              <button class="btn btn-ghost w-1/3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#cccccc"
                    d="M17.562 21.56a1 1 0 0 1-.465-.116L12 18.764l-5.097 2.68a1 1 0 0 1-1.45-1.053l.973-5.676l-4.124-4.02a1 1 0 0 1 .554-1.705l5.699-.828l2.549-5.164a1.04 1.04 0 0 1 1.793 0l2.548 5.164l5.699.828a1 1 0 0 1 .554 1.705l-4.124 4.02l.974 5.676a1 1 0 0 1-.985 1.169Z"
                  />
                </svg>
                <span class="my-1 text-gray-400">点赞{{ post.thumbs_up }}</span>
              </button>
            </div>

            <div class="divider"></div>
            <div class="collapse">
              <input type="checkbox" @click="commentShow(post.post_id)" />
              <div class="collapse-title text-xl font-bold text-blue-500">
                显示评论{{ post.comment_num }}
              </div>
              <div :class="'collapse-content ' + post.post_id">
                <div class="flex">
                  <div class="avatar">
                    <div class="rounded-full w-16 h-16 mx-2">
                      <img
                        @dragstart.prevent
                        :src="useStore.loginUser.avatar"
                        alt="Mogullzr小刘的OJ项目"
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
                      @click="submitComment(post.post_id)"
                    >
                      提交评论
                      <span>{{ post.message }}</span>
                    </button>
                  </label>
                </div>
                <div
                  v-for="comments in comment_list[post.post_id]"
                  :key="comments"
                >
                  <div v-for="(comment, index) in comments" :key="comment">
                    <div v-if="index == 0 && comment != ''" class="flex">
                      <div class="avatar">
                        <div class="rounded-full w-16 h-16 mx-2">
                          <img
                            @dragstart.prevent
                            :src="comment.avatar"
                            alt="Mogullzr小刘的OJ项目"
                          />
                        </div>
                      </div>
                      <div class="flex-1">
                        <span class="font-bold mx-2">{{
                          comment.username
                        }}</span>
                        <span class="text-gray-500">
                          {{ comment.create_time }}{{ comment.pattern }}
                        </span>
                        <button
                          class="float-right mx-2"
                          v-if="comment.uuid === useStore.loginUser.uuid"
                          @click="
                            DeleteComment(post.post_id, comment.comment_id)
                          "
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
                                  :src="useStore.loginUser.avatar"
                                  alt="Mogullzr小刘的OJ项目"
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
                                @click="submitComment(post.post_id)"
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
                            alt="Mogullzr小刘的OJ项目"
                          />
                        </div>
                      </div>
                      <div class="flex-1">
                        <span class="font-bold mx-2">{{
                          comment.username
                        }}</span>
                        <span class="text-gray-500">
                          {{ comment.create_time }}{{ comment.pattern }} 回复了
                        </span>
                        <router-link
                          :to="'/myspace/index/' + comment.to_comment_id"
                        >
                          <span class="text-red-600 font-bold"
                            >@{{ comment.to_comment_name }}</span
                          >
                          <span>的评论</span></router-link
                        >
                        <button
                          class="float-right mx-2"
                          v-if="comment.uuid === useStore.loginUser.uuid"
                          @click="
                            DeleteComment(post.post_id, comment.comment_id)
                          "
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
                                  alt="Mogullzr小刘的OJ项目"
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
                                @click="submitComment(post.post_id)"
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
                <div
                  v-if="comment_list[post.post_id] == ''"
                  class="mx-auto w-36 text-gray-400"
                  style="font-size: 36px"
                >
                  暂无评论
                </div>
              </div>
            </div>
          </div>

          <span
            class="loading loading-bars loading-lg m-auto"
            v-show="isShow"
          ></span>
        </div>
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
</style>
