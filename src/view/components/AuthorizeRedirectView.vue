<script setup lang="ts">
import { onMounted, ref } from "vue";
import { UserControllerService } from "../../../generated";
import router from "@/router";

const path = router.currentRoute.value.fullPath;
const code = ref(path.toString().split("?code=")[1]);
onMounted(async () => {
  const res = await UserControllerService.userLoginByGithubUsingPost(
    code.value
  );
  if (res.code === 0) {
    await router.push("/home");
  }
});
</script>

<template>
  <div class="card bg-base-100 w-full shadow-xl">
    <div class="card-body">
      <div class="mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="45"
          height="45"
          viewBox="0 0 48 48"
        >
          <path
            fill="#5fc70a"
            fill-rule="evenodd"
            stroke="#5fc70a"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="4"
            d="m4 24l5-5l10 10L39 9l5 5l-25 25z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div class="text-lime-500 text-xl font-bold mx-auto">
        <span>授权成功,请稍等</span>
        <span class="loading loading-dots loading-md"></span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
