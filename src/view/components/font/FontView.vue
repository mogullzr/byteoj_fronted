<template>
  <FontComponent :text="text"/>
</template>

<script setup lang="ts">
import FontComponent from "@/view/components/font/FontComponent.vue";
import {onMounted, ref, Ref} from "vue";
import user from "@/store/user";
import {useRouter} from "vue-router";
const useStore = user();
const router = useRouter();
const text:Ref<string> = ref("欢迎来到ByteOJ，" + useStore.loginUser.username ?? "");
const load = () => {
  setTimeout(()=>{
    router.push("/home");
  }, 3000);
}
load();
</script>