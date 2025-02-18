<template>
  <div class="mx-auto">
    <NavbarView class="fixed" style="z-index: 999" v-if="isNavbarVisible"/>
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
    <div :class="'mx-auto' + (isNavbarVisible ? ' pt-20':'') + (route.path.split('/')[1] == 'problems' && route.path.split('/')[2] == 'algorithm' && status == '1' ? '':' pb-32')">
      <PlaneGame />
      <router-view />
    </div>
  </div>

</template>
<style scoped></style>
<script lang="ts">
import NavbarView from "@/components/Menu/NavbarView.vue";
import { ref } from "vue";
const darkTheme = ref();
import { defineComponent } from "vue";
import BottomView from "@/components/Menu/BottomView.vue";
import PlaneGame from "@/view/components/PlaneGame.vue";
import router from "@/router";
import {useRoute} from "vue-router";
import DraggableWindowView from "@/components/Card/DraggableWindowView.vue";

export default defineComponent({
  data(){
    return {
      status: localStorage.getItem('EditorStatus'),
      route: useRoute(),
      isNavbarVisible: localStorage.getItem("isNavbarVisible") == "true" || localStorage.getItem("isNavbarVisible") == null
    }
  },
  components: {DraggableWindowView, PlaneGame, BottomView, NavbarView },
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
      this.isNavbarVisible = !this.isNavbarVisible; // 切换显示状态
      localStorage.setItem("isNavbarVisible", String(this.isNavbarVisible));
    }
  }
});
</script>
