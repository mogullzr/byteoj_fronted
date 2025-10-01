<template>
  <div
    style="margin-bottom: 20px; display: flex; justify-content: space-between"
  >
    <div>
      <el-button
        type="success"
        size="large"
        @click="downloadSoftware"
        style="font-size: 16px"
      >
        <el-icon style="margin-right: 6px"><Download /></el-icon>下载管理软件
      </el-button>
    </div>
    <div>
      <!-- 这里可以放其他全局操作按钮 -->
    </div>
  </div>
  <el-table :data="competitions" style="width: 100%" ref="tableRef">
    <el-table-column label="竞赛编号" type="index" width="120" sortable>
      <template #default="scope">
        <div>{{ scope.row.competition_id }}</div>
      </template>
    </el-table-column>
    <el-table-column label="竞赛名称" type="index" width="200">
      <template #default="scope">
        <div>{{ scope.row.competition_name }}</div>
      </template>
    </el-table-column>
    <el-table-column label="竞赛图片" type="index" width="150">
      <template #default="scope">
        <div class="block">
          <el-image :src="scope.row.avatar" style="width: 50px; height: 50px">
            <template #placeholder>
              <div class="image-slot">Loading<span class="dot">...</span></div>
            </template>
          </el-image>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="开始时间" width="200">
      <template #default="scope">
        <el-button type="primary">
          {{ dayjs(scope.row.start_time).format("YYYY-MM-DD HH:mm:ss") }}
        </el-button>
      </template>
    </el-table-column>
    <el-table-column label="结束时间" width="200">
      <template #default="scope">
        <el-button type="danger">
          {{ dayjs(scope.row.end_time).format("YYYY-MM-DD HH:mm:ss") }}
        </el-button>
      </template>
    </el-table-column>
    <el-table-column label="创建者" type="index" width="100">
      <template #default="scope">
        <el-text size="large">{{ scope.row.username }}</el-text>
      </template>
    </el-table-column>
    <el-table-column label="参加" width="100" sortable>
      <template #default="scope">
        <el-button type="text" style="font-size: 18px" size="large">{{
          scope.row.joins
        }}</el-button>
      </template>
    </el-table-column>
    <el-table-column label="比赛赛制" type="index" width="130">
      <template #default="scope">
        <el-button
          type="text"
          style="color: #5c74a2; font-size: 18px; font-weight: bold"
          size="large"
          >{{
            scope.row.pattern == 0
              ? "ACM赛制"
              : scope.row.pattern == 1
                ? "IO赛制"
                : "IOI赛制"
          }}</el-button
        >
      </template>
    </el-table-column>
    <el-table-column align="right">
      <!--      <template #header>-->
      <!--        <el-input v-model="searchRequest.keyword" size="large" placeholder="搜索关键词" @keyup.enter="searchData"/>-->
      <!--      </template>-->
      <template #default="scope">
        <el-button
          size="default"
          type="primary"
          style="font-size: 16px"
          @click="GetAcCode(scope.row)"
        >
          导出AC代码
        </el-button>
        <el-button
          size="default"
          type="primary"
          style="font-size: 16px"
          @click="editCompetition(scope.row)"
        >
          编辑
        </el-button>
        <el-button
          v-if="scope.row.is_delete === 0"
          size="default"
          type="danger"
          style="font-size: 16px"
          @click="deleteCompetition(scope.row.competition_id)"
        >
          删除
        </el-button>
        <el-button
          v-else
          size="default"
          type="success"
          style="font-size: 16px"
          @click="deleteCompetition(scope.row.competition_id)"
        >
          恢复
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <div class="demo-pagination-block" style="float: right">
    <div class="demonstration"></div>
    <el-pagination
      v-model:current-page="searchRequest.pageNum"
      v-model:page-size="searchRequest.pageSize"
      :background="background"
      layout="prev, pager, next, jumper"
      :total="searchRequest.pageSize * searchRequest.pages"
      @current-change="handleCurrentChange"
    />
  </div>
  <el-dialog
    v-model="progressDialogVisible"
    title="导出AC代码进度"
    width="30%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <el-progress :percentage="progressPercent" :status="progressStatus" />
    <div style="text-align: center; margin-top: 10px">
      {{ progressText }}
    </div>
    <template #footer>
      <el-button
        type="primary"
        @click="progressDialogVisible = false"
        :disabled="!progressComplete"
      >
        完成
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.demo-pagination-block + .demo-pagination-block {
  margin-top: 10px;
}
.demo-pagination-block .demonstration {
  margin-bottom: 16px;
}
</style>
<script lang="ts" setup>
import { onMounted, ref, Ref } from "vue";
import { ElNotification } from "element-plus";
import { Download } from "@element-plus/icons-vue";
import {
  CompetitionControllerService,
  CompetitionInfoVo,
} from "../../../generated";
import router from "../../router";
import dayjs from "dayjs";

const progressDialogVisible = ref(false);
const progressPercent = ref(0);
const progressText = ref("准备导出...");
const progressStatus = ref("");
const progressComplete = ref(false);

const competitions: Ref<CompetitionInfoVo[]> = ref([]);
const background = ref(false);
const searchRequest: Ref<any> = ref({
  pageNum: 1,
  pages: 0,
  pageSize: 15,
} as any);

const searchData = async () => {
  const res =
    await CompetitionControllerService.competitionSearchByPageUsingPost(
      searchRequest.value.pageNum,
    );
  if (res.code === 0) {
    competitions.value = res.data;
    searchRequest.value.pages = competitions.value[0].page_Sum;
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
    });
  }
};

const handleCurrentChange = async (val: number) => {
  searchRequest.value.pageNum = val;
  await searchData();
};

onMounted(async () => {
  await searchData();
  console.log(searchRequest.value);
});

// 删除题目
const deleteCompetition = async (competition_id: number) => {
  const res =
    await CompetitionControllerService.competitionDeleteByAdminUsingPost(
      competition_id,
    );
  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "删除成功",
    });
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }
};

const shiftLetter = (letter, shift) => {
  const charCode = letter.charCodeAt(0); // 获取字母的 Unicode 编码
  const shiftedCharCode = charCode + shift; // 计算偏移后的编码
  return String.fromCharCode(shiftedCharCode); // 转换回字符
};

const GetAcCode = async (competition: CompetitionInfoVo) => {
  try {
    // Show progress dialog
    progressDialogVisible.value = true;
    progressPercent.value = 0;
    progressText.value = "准备导出...";
    progressStatus.value = "";
    progressComplete.value = false;

    // Request directory
    progressText.value = "请选择保存目录...";
    const dirHandle = await window.showDirectoryPicker();

    let fileCount = 1;
    let totalFiles = 0;

    // First pass to count total files
    progressText.value = "正在计算需要导出的文件数量...";
    for (let item = 1; item <= searchRequest.value.pages; item++) {
      const response =
        await CompetitionControllerService.competitionSearchRankUsingPost(
          competition.competition_id,
          item,
          1,
        );

      if (response.code === 0) {
        const users = response.data?.rank_user_list || [];
        for (const user of users) {
          for (const record of user.problem_record_list || []) {
            if (record.source_code && record.user_name) {
              totalFiles++;
            }
          }
        }
      }
    }

    if (totalFiles === 0) {
      progressText.value = "没有找到可导出的AC代码";
      progressStatus.value = "warning";
      progressComplete.value = true;
      return;
    }

    // Second pass to actually save files
    let savedFiles = 0;
    for (let item = 1; item <= Math.ceil(competition.joins / 15); item++) {
      const response =
        await CompetitionControllerService.competitionSearchRankUsingPost(
          competition.competition_id,
          item,
          1,
        );

      if (response.code === 0) {
        const users = response.data?.rank_user_list || [];

        for (const user of users) {
          fileCount = 1;
          for (const record of user.problem_record_list || []) {
            if (record.source_code && record.user_name) {
              progressText.value = `正在导出 ${record.user_name} 的代码 (${savedFiles + 1}/${totalFiles})...`;

              try {
                const fileHandle = await dirHandle.getFileHandle(
                  `${competition.competition_name}-${shiftLetter("A", fileCount)}.${record.user_name}.txt`,
                  { create: true },
                );
                const writable = await fileHandle.createWritable();
                await writable.write(record.source_code);
                await writable.close();

                savedFiles++;
                progressPercent.value = Math.round(
                  (savedFiles / totalFiles) * 100,
                );
              } catch (error) {
                console.error("保存文件时出错:", error);
              }
            }
            fileCount++;
          }
        }
      }
    }

    progressText.value = `成功导出 ${savedFiles} 个文件到您选择的目录！`;
    progressStatus.value = "success";
    progressComplete.value = true;
  } catch (error) {
    console.error("文件保存失败:", error);
    progressText.value = `导出过程中出错: ${error.message || error}`;
    progressStatus.value = "exception";
    progressComplete.value = true;
  }
};

const downloadSoftware = () => {
  // Create an anchor element
  const downloadLink = document.createElement("a");

  // Set the download URL to your software download link
  downloadLink.href = "https://admin.byteoj.com/Plagiarism-Checker.zip"; // Replace with actual download URL

  // Set download attribute to force download
  downloadLink.download = "Plagiarism-Checker.zip"; // Name of the file to be downloaded

  // Append to the document
  document.body.appendChild(downloadLink);

  // Trigger click event to start download
  downloadLink.click();

  // Remove the element from the DOM
  document.body.removeChild(downloadLink);

  // Notify user
  ElNotification({
    title: "下载开始",
    message: "软件下载已开始，请等待下载完成",
    type: "success",
  });
};

// 编辑竞赛
const editCompetition = (competition: CompetitionInfoVo) => {
  router.push({
    path: '/competition/edit',
    query: {
      competition_id: competition.competition_id
    }
  });
};
</script>
