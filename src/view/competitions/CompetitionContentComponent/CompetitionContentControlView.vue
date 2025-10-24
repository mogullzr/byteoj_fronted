<script setup lang="ts">
import { Ref, ref } from "vue";
import user from "@/store/user";
import CompetitionContentRecordsView from "@/view/competitions/CompetitionContentComponent/CompetitionContentRecordsView.vue";
import { CompetitionControllerService } from "../../../../generated";
import router from "@/router";
import axios from "axios";

const useStore = user();
const path = router.currentRoute.value.fullPath;
let competition_id: Ref<number> = ref(parseInt(path.toString().split("/")[2]));
const button_list = ref(useStore.control_list);

// 点击进行管理员的某些操作
const getInfo = async (key: number) => {
  if (key == 0) {
    window.location =
      "https://www.byteoj.com/api/competition/get/rank/excel?competition_id=" +
      competition_id.value;
    // 探索失败原因中........
    // const res =
    //   await CompetitionControllerService.competitionAdminGetRankExcelUsingGet(
    //     competition_id.value
    //   );
    // let blob = new Blob([res], {
    //   type: "application/xlsx",
    // });
    // console.log(await blob.text());
    // console.log(blob);
    // console.log(`Blob size: ${blob.size}`);
    // let url = window.URL.createObjectURL(blob);
    // const link = document.createElement("a"); //创建a标签
    // link.href = url;
    // link.download = "竞赛排行榜.xlsx"; //重命名文件
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link); // 移除链接
    // URL.revokeObjectURL(url); // 释放对象 URL
  }
};
</script>

<template>
  <div class="card bg-base-100 shadow-2xl">
    <div class="card-body">
      <button
        @click="getInfo(index)"
        class="btn w-1/6 h-24 text-xl bg-blue-500 text-gray-100"
        v-for="(button, index) in button_list"
      >
        {{ button.toString() }}
      </button>
    </div>
  </div>
</template>

<style scoped></style>
