<template>
  <UserProfile
    :avatarUrl="userInfo.avatar ?? ''"
    :username="userInfo.username ?? ''"
    :level="userInfo.rating"
    :school="userInfo.school ?? ''"
    :bio="userInfo.profile ?? ''"
    :website="userInfo.url ?? ''"
    :tags="userInfo.tags"
  />
</template>

<script setup lang="ts">
import UserProfile from "@/view/user/UserProfile.vue";
import { onMounted, ref, Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {CompetitionControllerService, UserControllerService, UserVo} from "../../../generated";
import user from "@/store/user";

const route = useRoute();
const router = useRouter();
const uuid: number = parseInt(route.path.split("/")[3]);
const userInfo: Ref<UserVo> = ref({} as UserVo);
onMounted(async () => {
  const res = await UserControllerService.userSearchByUuidUsingPost(uuid);
  if (res.code === 0) {
    userInfo.value = res.data;
    if (userInfo.value.tags != null) {
      userInfo.value.tags = userInfo.value.tags.split(",");
      if (userInfo.value.tags?.[0] == "") {
        userInfo.value.tags = [];
      } else {
        userInfo.value.tags[0] = userInfo.value.tags[0].replace("[", "");
        userInfo.value.tags[userInfo.value.tags?.length - 1] =
          userInfo.value.tags[userInfo.value.tags?.length - 1].replace("]", "");
      }
    } else {
      userInfo.value.tags = [];
    }
  } else {
    router.replace("/home");
  }
});
</script>
