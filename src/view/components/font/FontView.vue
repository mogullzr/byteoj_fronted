<template>
  <FontComponent :text="text" />
</template>

<script setup lang="ts">
import FontComponent from "@/view/components/font/FontComponent.vue";
import { ref, Ref } from "vue";
import user from "@/store/user";
import { useRouter } from "vue-router";
const useStore = user();
const router = useRouter();
const text: Ref<string> = ref(
  "欢迎来到ByteOJ，" + useStore.loginUser.username ?? ""
);
const load = () => {
  setTimeout(() => {
    router.replace("/home");
  }, 3000);
};
load();
</script>
