<script setup lang="ts">
import { onMounted, onUnmounted, Ref, ref } from "vue";
import {
  UserControllerService,
  WebsiteBackgroundPictures,
} from "../../../generated";

import UserStore from "@/store/user";
import router from "@/router";

const emit = defineEmits(["toggle-navbar"]);
const useStore = UserStore();
const pictures: Ref<WebsiteBackgroundPictures[] | undefined> = ref([]);
const isShow: Ref<number> = ref(0);
const isVisible = ref(false); // 控制组件是否可见

// 获取本人自定义的一些图片集

// 切换页面
const changeShow = async (key: number) => {
  isShow.value = key;
  if (key == 1 && pictures.value?.length == 0) {
    const res = await UserControllerService.userGetPictureUsingGet();
    if (res.code === 0) {
      pictures.value = res.data;
      console.log(pictures.value);
    } else if (res.code === 40101) {
      router.replace("/404");
    }
  }
};
// 上传图片
const upLoad_1 = () => {
  let upLoadInput: any = document.getElementById("upload");
  upLoadInput.click();
};

// 上传图片
// 上传图片
const upLoad_2 = async () => {
  let upLoadInput: any = document.getElementById("upload");
  const fileList = upLoadInput.files; // 获取 FileList 对象

  if (!fileList || fileList.length === 0) {
    console.log("未选择文件");
    return;
  }

  // 从 FileList 中获取第一个文件
  try {
    const res = await UserControllerService.userUploadPictureUsingPost(
      fileList, // 直接传递 File 对象
      1
    );

    if (res.code === 0) {
      pictures.value = [];
      pictures.value.push(res.data);
      console.log("图片上传成功！！！");
    } else {
      console.log("图片上传失败！！！");
    }
  } catch (error) {
    console.error("上传过程中发生错误:", error);
  }
};
// 设置背景图片查看效果
const userSetPicture = async (picture_address: undefined | string) => {
  useStore.loginUser.background_picture = picture_address;
};

// 将当前地址传送给后端同时修改后端对应关系
const SetPicture = async () => {
  const res = await UserControllerService.userSetPictureBackgroundUsingPost(
    useStore.loginUser.background_picture
  );

  if (res.code === 0) {
    console.log("ok");
  }
};
// 删除上传过的图片
const DeletePicture = async (id: number | undefined) => {
  const res = await UserControllerService.userDeleteBackgroundUsingPost(id);

  if (res.code === 0) {
    if (pictures.value == undefined) {
      pictures.value = [] as WebsiteBackgroundPictures[];
    }
    for (let item = 0; item < pictures.value.length; item++) {
      if (pictures.value[item].id == id) {
        pictures.value.splice(item, item);
        console.log(pictures.value);
        break;
      }
    }
  }
};

const pictureGet = async () => {
  if (isShow.value === 1 || isShow.value === 0) {
    const res = await UserControllerService.userGetPictureUsingGet();
    if (res.code === 0) {
      pictures.value = res.data;
      console.log(pictures.value);
    } else if (res.code === 40101) {
      router.replace("/404");
    }
  }
};

const closeDrawer = () => {
  // 获取 drawer 的 checkbox 元素
  const drawerCheckbox: any = document.getElementById("my-drawer-4");
  drawerCheckbox.checked = false;
};

// 转换状态
const toggleNavbar = () => {
  emit("toggle-navbar");
};

// 监听鼠标移动
const handleMouseMove = (event: MouseEvent) => {
  const windowHeight = window.innerHeight;
  const mouseY = event.clientY;

  // 如果鼠标接近底部（例如距离底部 50px 以内），显示组件
  if (windowHeight - mouseY <= 50) {
    isVisible.value = true;
  } else {
    isVisible.value = false;
  }
};

// 在组件挂载时添加事件监听器
onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
});

// 在组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
});
</script>

<template>
  <div
    class="navbar bg-neutral"
    :class="{ 'navbar-visible': isVisible, 'navbar-hidden': !isVisible }"
  >
    <div class="flex items-center">
      <button
        class="btn"
        onclick="my_modal_1.showModal()"
        @click="changeShow(1)"
      >
        <span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
          >
            <path
              fill="#999999"
              d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"
            />
          </svg>
        </span>
        <span>设置</span>
      </button>
      <dialog id="my_modal_1" class="modal">
        <div class="modal-box w-11/12 max-w-3xl">
          <form method="dialog">
            <button
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
          </form>
          <div role="tablist" class="tabs tabs-lifted tabs-lg">
            <input
              type="radio"
              name="my_tabs_picture"
              role="tab"
              class="tab font-bold"
              aria-label="背景图片设置"
              checked
              @click="changeShow(1)"
            />
            <div
              role="tabpanel"
              class="tab-content bg-base-100 border-base-300 rounded-box p-6"
              v-if="isShow === 1"
            >
              <div class="card">
                <div class="text-2xl font-bold mx-auto">背景图片设置</div>
                <div class="divider"></div>
                <div class="grid grid-cols-7 gap-1">
                  <div
                    class="avatar"
                    v-for="picture in pictures"
                    :key="picture"
                  >
                    <div class="indicator">
                      <div class="w-24 h-24">
                        <button
                          v-if="useStore.loginUser.uuid == picture.uuid"
                          class="indicator-item badge badge-error m-3 w-2 rounded"
                          @click="DeletePicture(picture.id)"
                        >
                          X
                        </button>
                        <button class="h-full">
                          <img
                            @dragstart.prevent
                            @click="userSetPicture(picture.picture_address)"
                            :src="picture.picture_address"
                            alt="ByteOJ出品"
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button @click="upLoad_1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="60"
                      height="60"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#000000"
                        d="M11 17h2v-4h4v-2h-4V7h-2v4H7v2h4zm-6 4q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21z"
                      />
                    </svg>
                    <input
                      @change="upLoad_2"
                      id="upload"
                      type="file"
                      accept="image/*"
                      style="display: none"
                    />
                  </button>
                </div>
              </div>
              <form method="dialog">
                <button
                  class="btn btn-success text-white w-full my-4 font-bold text-2xl"
                  @click="SetPicture"
                >
                  保存
                </button>
              </form>
            </div>
            <input
              type="radio"
              name="my_tabs_picture"
              role="tab"
              class="tab font-bold"
              aria-label="敬请期待......"
              @click="changeShow(2)"
            />
            <div
              role="tabpanel"
              class="tab-content bg-base-100 border-base-300 rounded-box p-6"
              v-if="isShow === 2"
            ></div>
          </div>
        </div>
      </dialog>
    </div>
    <!-- 添加一个按钮来控制 NavbarView 的显示和隐藏 -->
    <button @click="toggleNavbar" class="btn text-lg">
      {{ isNavbarVisible ? "隐藏导航栏" : "显示导航栏" }}
    </button>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-image: linear-gradient(to left, #bdbbbe 0%, #9d9ea3 100%),
    radial-gradient(
      88% 271%,
      rgba(255, 255, 255, 0.25) 0%,
      rgba(254, 254, 254, 0.25) 1%,
      rgba(0, 0, 0, 0.25) 100%
    ),
    radial-gradient(
      50% 100%,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(0, 0, 0, 0.3) 100%
    );
  background-blend-mode: normal, lighten, soft-light;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  transition: transform 0.3s ease;
  height: 50px; /* 压缩高度 */
  padding: 0 15px; /* 调整内边距 */
}

.navbar-hidden {
  transform: translateY(100%);
}

.navbar-visible {
  transform: translateY(0);
}

/* 调整按钮大小和间距 */
.navbar .btn {
  padding: 0.25rem 0.75rem; /* 减小按钮内边距 */
  min-height: 36px; /* 设置最小高度 */
}

/* 调整图标大小 */
.navbar svg {
  width: 20px;
  height: 20px;
}

/* AI机器人按钮样式 */
.navbar .flex.items-center {
  margin-left: 0;
  margin-right: auto;
}
</style>
