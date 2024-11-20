<template>
  <el-table :data="tableData" style="width: 100%" max-height="1000">
    <el-table-column fixed prop="course_id" label="课程ID" />
    <el-table-column prop="course_title" label="课程名称" />
    <el-table-column prop="course_title_description" label="课程标题描述" />
    <el-table-column prop="course_description" label="课程描述" width="120" />
    <el-table-column prop="create_time" label="创建管理员" width="120" />
    <el-table-column prop="avatar" label="课程头像" width="120">
      <template #default="scope">
        <img :src="scope.row.avatar" alt="" style="width: 75px; height: 75px" />
      </template>
    </el-table-column>
    <el-table-column prop="start_time" label="开始时间" width="120" />
    <el-table-column prop="end_time" label="结束时间" width="120" />
    <el-table-column label="是否永久" width="120">
      <template #default="scope">
        <div style="width: 75px; height: 75px; font-weight: bold; color: red">
          {{
            scope.row.start_time != null
              ? "否"
              : scope.row.start_time != null
                ? "否"
                : "是"
          }}
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="create_time" label="创建时间">
      <template #default="scope">
        <div style="width: 75px; height: 75px">
          {{ scope.row.create_time }}
        </div>
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="操作" min-width="120">
      <template #default="scope">
        <el-button
          link
          type="success"
          size="large"
          @click="routerToSetProblem(scope.row.course_id)"
        >
          设置课程题目
        </el-button>
        <el-button
          link
          type="success"
          size="large"
          @click="routerToSetUser(scope.row.course_id)"
        >
          设置用户
        </el-button>
        <el-button link type="primary" size="large"> 修改课程</el-button>
        <el-button
          link
          type="danger"
          size="large"
          @click.prevent="deleteRow(scope.$index)"
        >
          删除课程
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-button
    size="large"
    class="mt-4"
    style="width: 100%"
    @click="dialogFormVisible = true"
  >
    添加课程
  </el-button>
  <el-dialog v-model="dialogFormVisible" title="Shipping address" width="500">
    <el-form :model="tableData">
      <el-form-item label="课程ID" :label-width="formLabelWidth">
        <el-input v-model="form.course_id" autocomplete="off" />
      </el-form-item>
      <el-form-item label="课程名称" :label-width="formLabelWidth">
        <el-input v-model="form.course_title" autocomplete="off" />
      </el-form-item>
      <el-form-item label="课程标题描述" :label-width="formLabelWidth">
        <el-input v-model="form.course_title_description" autocomplete="off" />
      </el-form-item>
      <el-form-item label="课程描述" :label-width="formLabelWidth">
        <el-input v-model="form.course_description" autocomplete="off" />
      </el-form-item>
      <!--      <el-form-item label="课程头像地址" :label-width="formLabelWidth">-->
      <!--        <el-input v-model="form.name" autocomplete="off" />-->
      <!--      </el-form-item>-->

      <el-form-item label="开始时间(选填)" :label-width="formLabelWidth">
        <el-input v-model="form.start_time" autocomplete="off" />
      </el-form-item>
      <el-form-item label="结束时间(选填)" :label-width="formLabelWidth">
        <el-input v-model="form.end_time" autocomplete="off" />
      </el-form-item>
      <!--      <el-form-item label="Zones" :label-width="formLabelWidth">-->
      <!--        <el-select v-model="form.region" placeholder="Please select a zone">-->
      <!--          <el-option label="Zone No.1" value="shanghai" />-->
      <!--          <el-option label="Zone No.2" value="beijing" />-->
      <!--        </el-select>-->
      <!--      </el-form-item>-->
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="CourseAdd"> 创建</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref } from "vue";
import {
  Course,
  CourseControllerService,
  CourseRequest,
} from "../../../generated";
import { ElNotification } from "element-plus";
import router from "../../router/index.ts";

const tableData: Ref<Course[] | any> = ref([]);
onMounted(async () => {
  const res = await CourseControllerService.courseSearchByPageNumUsingPost(1);
  if (res.code === 0) {
    tableData.value = res.data;
  }
});
// 删除课程
const deleteRow = (index: number) => {
  tableData.value.splice(index, 1);
};

//
const routerToSetProblem = (course_id: number) => {
  router.push("/course/simplified/" + course_id);
};
const dialogFormVisible = ref(false);
const formLabelWidth = "140px";

const form: Ref<CourseRequest> = ref({
  course_id: 1,
  avatar:
    "https://aliyun.byteoj.com/2024/11/bbf4b078fc33402f8270b9fd87d69dab.webp",
  course_title: "",
  start_time: "",
  end_time: "",
  course_description: "",
  course_title_description: "",
});

// 路由跳转到设置用户信息页面
const routerToSetUser = (course_id: number) => {
  router.push("/course/add/" + course_id);
};
const CourseAdd = async () => {
  const res = await CourseControllerService.courseAdminAddUsingPost(form.value);
  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "课程基本信息添加成功",
      offset: 100,
    });
    tableData.value.push(form.value);
    dialogFormVisible.value = false;
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
      offset: 100,
    });
  }
};
</script>
