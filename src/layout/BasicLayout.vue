<template>
  <div class="mx-auto">
    <NavbarView class="fixed" style="z-index: 9999" />
  </div>
  <div>
    <BottomView class="fixed w-full" style="z-index: 9999; bottom: 0" />
  </div>
  <div class="mx-auto">
    <div class="pt-20 pb-32 mx-auto">
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

export default defineComponent({
  components: { BottomView, NavbarView },
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
});
</script>
