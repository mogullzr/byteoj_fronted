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
        (isNavbarVisible ? (route.path.split('/')[1] == 'introduction' ? ' pt-18' : ' pt-20') : '') +
        ((route.path.split('/')[1] == 'problems' &&
        route.path.split('/')[2] == 'algorithm' &&
        status == '1') || (route.path.split('/')[1] == 'introduction')
          ? ''
          : ' pb-32')
      "
    >
      <PlaneGame />
      <transition name="fade" mode="out-in">
        <!-- 添加 key 和 activated 事件处理 -->
        <router-view v-slot="{ Component, route }">
          <keep-alive :include="cachedComponents">
            <component
              :is="Component"
              :key="route.fullPath"
              @hook:activated="handleComponentActivated(route)"
            />
          </keep-alive>
        </router-view>
      </transition>
    </div>
  </div>

  <!-- 全局加载指示器 -->
  <div v-if="showInitialLoading" class="global-loading">
    <div class="loading-content">
      <div class="wave-container">
        <div class="wave-bar"></div>
        <div class="wave-bar"></div>
        <div class="wave-bar"></div>
        <div class="wave-bar"></div>
        <div class="wave-bar"></div>
      </div>
      <div class="loading-text">加载中，请稍候...</div>
      <div class="loading-progress">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: opacity 0.3s ease;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.wave-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  gap: 8px;
}

.wave-bar {
  width: 12px;
  height: 40px;
  background: linear-gradient(to top, #3498db, #2ecc71);
  border-radius: 6px;
  animation: wave 1.2s ease-in-out infinite;
}

.wave-bar:nth-child(1) {
  animation-delay: 0.1s;
}
.wave-bar:nth-child(2) {
  animation-delay: 0.2s;
}
.wave-bar:nth-child(3) {
  animation-delay: 0.3s;
}
.wave-bar:nth-child(4) {
  animation-delay: 0.4s;
}
.wave-bar:nth-child(5) {
  animation-delay: 0.5s;
}

@keyframes wave {
  0%,
  100% {
    height: 20px;
    background: #3498db;
  }
  50% {
    height: 60px;
    background: #2ecc71;
  }
}

.loading-text {
  font-size: 1.2rem;
  color: #2c3e50;
  font-weight: 500;
}

.loading-progress {
  width: 200px;
  height: 6px;
  background: rgba(52, 152, 219, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, #3498db, #2ecc71);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.pt-18{
  padding-top: 4rem;
}
</style>

<script lang="ts">
import NavbarView from "@/components/Menu/NavbarView.vue";
import { defineComponent } from "vue";
import BottomView from "@/components/Menu/BottomView.vue";
import { useRoute } from "vue-router";
import router from "@/router";
import axios from "axios";
import PlaneGame from "@/view/components/PlaneGame.vue";

export default defineComponent({
  components: { PlaneGame, NavbarView, BottomView },
  data() {
    return {
      status: localStorage.getItem("EditorStatus"),
      route: useRoute(),
      isNavbarVisible:
        localStorage.getItem("isNavbarVisible") == "true" ||
        localStorage.getItem("isNavbarVisible") == null,
      showInitialLoading: true,
      activeRequests: 0,
      progress: 0,
      progressInterval: null as number | null,
      isFirstLoad: true,
      hasShownInitialLoading: false,
      cachedComponents: ["ProblemDetail"], // 需要缓存的组件名，根据实际情况调整
    };
  },
  created() {
    // 检查是否是从刷新或首次加载
    if (
      performance.navigation.type === 1 ||
      performance.navigation.type === 0
    ) {
      this.isFirstLoad = true;
    } else {
      this.isFirstLoad = false;
    }

    this.setupAxiosInterceptors();
  },
  mounted() {
    this.setupRouterHooks();

    if (!this.isFirstLoad) {
      this.showInitialLoading = false;
      this.hasShownInitialLoading = true;
    }
  },
  methods: {
    toggleNavbar() {
      this.isNavbarVisible = !this.isNavbarVisible;
      localStorage.setItem("isNavbarVisible", String(this.isNavbarVisible));
    },

    handleComponentActivated(route: any) {
      // 当缓存的组件被激活时，检查是否需要刷新数据
      if (route.params.id && this.route.params.id !== route.params.id) {
        this.refreshComponentData();
      }
    },

    refreshComponentData() {
      // 触发当前活动组件的刷新方法
      const currentView: any = this.$refs.routerView;
      if (currentView && currentView.refresh) {
        currentView.refresh();
      }
    },

    setupAxiosInterceptors() {
      // 请求拦截器
      axios.interceptors.request.use(
        (config) => {
          if (this.isFirstLoad) {
            this.activeRequests++;
          }
          return config;
        },
        (error) => {
          if (this.isFirstLoad) {
            this.activeRequests--;
            this.checkRequestsComplete();
          }
          return Promise.reject(error);
        }
      );

      // 响应拦截器
      axios.interceptors.response.use(
        (response) => {
          if (this.isFirstLoad) {
            this.activeRequests--;
            this.checkRequestsComplete();
          }
          return response;
        },
        (error) => {
          if (this.isFirstLoad) {
            this.activeRequests--;
            this.checkRequestsComplete();
          }
          return Promise.reject(error);
        }
      );
    },

    checkRequestsComplete() {
      if (this.activeRequests === 0 && this.isFirstLoad) {
        this.handleLoadingComplete();
      }
    },

    handleLoadingComplete() {
      this.progress = 100;
      setTimeout(() => {
        this.showInitialLoading = false;
        this.hasShownInitialLoading = true;
        this.clearProgressInterval();
      }, 300);
    },

    startProgressAnimation() {
      this.clearProgressInterval();

      this.progressInterval = window.setInterval(() => {
        if (this.progress < 90) {
          this.progress += Math.random() * 10;
        }
      }, 500);
    },

    clearProgressInterval() {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
    },

    setupRouterHooks() {
      router.beforeEach((to, from, next) => {
        // 如果是相同路由但参数不同，标记需要刷新
        if (to.name === from.name && to.params.id !== from.params.id) {
          to.meta.requiresRefresh = true;
        }

        if (this.isFirstLoad && !this.hasShownInitialLoading) {
          this.showInitialLoading = true;
          this.progress = 0;
          this.startProgressAnimation();
        }

        next();
      });

      router.afterEach(() => {
        if (this.activeRequests === 0) {
          this.handleLoadingComplete();
        }
      });
    },
  },
  beforeUnmount() {
    this.clearProgressInterval();
  },
});
</script>
