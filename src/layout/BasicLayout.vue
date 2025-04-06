<template>
  <div class="mx-auto">
    <NavbarView class="fixed" style="z-index: 999" v-if="isNavbarVisible" />
  </div>
  <div>
    <BottomView
      :is-navbar-visible="isNavbarVisible"
      class="fixed w-full"
      style="z-index: 999; bottom: 0"
      @toggle-navbar="toggleNavbar"
    />
  </div>
  <div class="mx-auto">
    <div
      :class="
        'mx-auto' +
        (isNavbarVisible ? ' pt-20' : '') +
        (route.path.split('/')[1] == 'problems' &&
        route.path.split('/')[2] == 'algorithm' &&
        status == '1'
          ? ''
          : ' pb-32')
      "
    >
      <!-- 添加路由过渡效果 -->
      <transition name="fade" mode="out-in">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </transition>
    </div>
  </div>

  <!-- 全局加载指示器 -->
  <div v-if="isLoading" class="global-loading">
    <div class="loading-spinner"></div>
  </div>
</template>

<style scoped>
/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 全局加载样式 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

<script lang="ts">
import NavbarView from "@/components/Menu/NavbarView.vue";
import { ref } from "vue";
import { defineComponent } from "vue";
import BottomView from "@/components/Menu/BottomView.vue";
import PlaneGame from "@/view/components/PlaneGame.vue";
import { useRoute } from "vue-router";
import DraggableWindowView from "@/components/Card/DraggableWindowView.vue";
import router from "@/router";

export default defineComponent({
  data() {
    return {
      status: localStorage.getItem("EditorStatus"),
      route: useRoute(),
      isNavbarVisible:
        localStorage.getItem("isNavbarVisible") == "true" ||
        localStorage.getItem("isNavbarVisible") == null,
      isLoading: false, // 新增加载状态
    };
  },
  components: { DraggableWindowView, PlaneGame, BottomView, NavbarView },
  setup() {
    const debounce = (callback: (...args: any[]) => void, delay: number) => {
      let tid: any;
      return function (...args: any[]) {
        const ctx = self;
        tid && clearTimeout(tid);
        tid = setTimeout(() => {
          callback.apply(ctx, args);
        }, delay);
      };
    };

    const _ = (window as any).ResizeObserver;
    (window as any).ResizeObserver = class ResizeObserver extends _ {
      constructor(callback: (...args: any[]) => void) {
        callback = debounce(callback, 20);
        super(callback);
      }
    };
  },
  methods: {
    toggleNavbar() {
      this.isNavbarVisible = !this.isNavbarVisible;
      localStorage.setItem("isNavbarVisible", String(this.isNavbarVisible));
    },
    // 添加路由导航守卫
    setupRouterHooks() {
      router.beforeEach((to, from, next) => {
        this.isLoading = true;
        next();
      });

      router.afterEach(() => {
        // 添加一点延迟让加载动画可见
        setTimeout(() => {
          this.isLoading = false;
        }, 300);
      });
    },
  },
  mounted() {
    this.setupRouterHooks();
  },
});
</script>
