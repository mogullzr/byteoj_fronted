<script setup lang="ts">
import { onMounted, Ref, ref, UnwrapRef } from "vue";
import {
  CourseChildProblems,
  CourseControllerService,
  CourseProblem,
  CourseProblemsVo,
  CourseRequest,
  ProblemAlgorithmControllerService,
} from "../../../generated";
import { ElNotification } from "element-plus";
import router from "../../router";

const searchContent = ref("");
const PageNum = ref(1);
const tableData: Ref<UnwrapRef<any[]>> = ref([]);
const currentPage: Ref<number> = ref(1);

const path = router.currentRoute.value.fullPath;
const courseId: Ref<number> = ref(parseInt(path.toString().split("/")[3]));

const pageSum: Ref<number> = ref(1);
const dialogSpeicalVisible = ref(false);
const dialogCategoryVisible = ref(false);
const formLabelWidth = "140px";

// 专栏创建项
const special_create: Ref<string> = ref("");

// 类别创建项
const category_create: Ref<string> = ref("");

// 获取的所有题目信息
const courseData: Ref<any[]> = ref([]);

// 请求设置所有题目
const courseRequest: Ref<CourseRequest> = ref({} as CourseRequest);

// 专栏
const simplify_names: Ref<string[]> = ref([]);

// const simplify_names: Ref<string[]> = ref([
//   "第一章：变量的输入和输出",
//   "第二章：判断语句",
// ]);
// 类别
const categories: Ref<string[]> = ref([]);
// const categories: Ref<string[]> = ref(["例子", "练习1", "练习2", "练习3"]);
// 专栏对应类别下的题目
// const simplify_category_problems: Ref<any[]> = ref([
//   {
//     problem_id: 1,
//     chinese_name: "A + B",
//   },
//   {
//     problem_id: 1,
//     chinese_name: "A + B",
//   },
//   {
//     problem_id: 1,
//     chinese_name: "A + B",
//   },
// ]);
const simplify_category_problems: Ref<CourseProblem[] | undefined> = ref(
  [] as CourseProblem[],
);
// 记录当前选中的专栏
const activeSpeicalTitle: Ref<string | null> = ref(null);

// 记录当前选中的类别
const activeCategory: Ref<string | null> = ref(null);

onMounted(async () => {
  const res1 =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchByPageUsingPost(
      PageNum.value,
    );
  if (res1.code === 0) {
    tableData.value = res1.data;
  }

  const res2 =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchPagSumUsingPost();
  if (res2.code === 0) {
    pageSum.value = res2.data;
  } else {
    ElNotification.error({
      title: "Error",
      message: res2.message,
      offset: 100,
    });
  }

  const res3 =
    await CourseControllerService.courseSearchProblemsByCourseIdUsingPost(
      courseId.value,
    );
  if (res3.code === 0) {
    console.log(res3.data);
  }

  const res4 =
    await CourseControllerService.courseSearchProblemsByCourseIdUsingPost(
      courseId.value,
    );
  if (res4.code === 0) {
    courseData.value = res4.data;
    if (courseData.value === undefined) {
      return;
    }
    // 整理出专栏类别
    for (let item = 0; item < courseData.value.length; item++) {
      simplify_names.value.push(courseData.value[item].problems_type ?? "");
    }
  }
});

const searchByKeyWord = async () => {
  const res =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchByKeywordUsingPost(
      searchContent.value,
      1,
    );
  if (res.code === 0) {
    tableData.value = res.data;
  }
};

const handleCurrentChange = async (val) => {
  const res =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchByPageUsingPost(
      val,
    );
  if (res.code === 0) {
    tableData.value = res.data;
    currentPage.value = val;
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
      offset: 100,
    });
  }
};

// 处理专栏按钮点击事件
const handleSpeicalTitleClick = (category: string) => {
  if (activeSpeicalTitle.value === category) {
    activeSpeicalTitle.value = null; // 如果当前类别已经是选中的，则取消选中
    categories.value = [];
    simplify_category_problems.value = [];
  } else {
    activeSpeicalTitle.value = category; // 否则选中当前类别
    categories.value = [];
    simplify_category_problems.value = [];
    for (let item = 0; item < courseData.value.length; item++) {
      if (courseData.value[item].problems_type == activeSpeicalTitle.value) {
        let course_categories = courseData.value[item]
          .courseProblemList as CourseChildProblems[];
        if (course_categories == undefined) {
          break;
        }
        for (let item = 0; item < course_categories.length; item++) {
          categories.value.push(
            course_categories[item].problem_algorithm_type ?? "",
          );
        }
        activeCategory.value = null;
        break;
      }
    }
  }
};

// 处理类别按钮点击事件
const handleCategoryClick = (category: string) => {
  if (activeCategory.value === category) {
    activeCategory.value = null; // 如果当前类别已经是选中的，则取消选中
    simplify_category_problems.value = [];
  } else {
    activeCategory.value = category; // 否则选中当前类别
    for (let item = 0; item < courseData.value.length; item++) {
      if (courseData.value[item].problems_type == activeSpeicalTitle.value) {
        let course_categories = courseData.value[item]
          .courseProblemList as CourseChildProblems[];
        if (course_categories == undefined) {
          break;
        }
        for (let item = 0; item < course_categories.length; item++) {
          if (
            activeCategory.value ==
            course_categories[item].problem_algorithm_type
          ) {
            let problems = course_categories[item]
              .courseProblemList as CourseProblem[];
            simplify_category_problems.value = [];
            for (let j = 0; j < problems.length; j++) {
              simplify_category_problems.value?.push({
                problem_id: problems[j].problem_id,
                problem_name:
                  (problems[j]?.problem_name ?? [""])[0] != "B"
                    ? "ByteOJ " +
                      problems[j].problem_id +
                      ". " +
                      problems[j].problem_name
                    : problems[j].problem_name,
              } as CourseProblem);
            }
            break;
          }
        }
        break;
      }
    }
  }
  console.log(simplify_category_problems.value);
};

// 新建专栏
const addNewSpeical = () => {
  if (special_create.value == null) {
    return;
  }
  simplify_names.value.push(special_create.value);

  // 在该专栏下添加新专栏后，更新信息结构
  let courseSpeical: Ref<CourseProblemsVo> = ref({
    problems_type: "",
  });
  courseSpeical.value.problems_type = special_create.value;
  courseSpeical.value.courseProblemList = [] as CourseChildProblems[];
  courseData.value.push(courseSpeical.value);
  activeSpeicalTitle.value = special_create.value;

  categories.value = [];
  simplify_category_problems.value = [];
  // special_create.value = "";
  dialogSpeicalVisible.value = false;
};

// 新建类别
const addNewCategory = () => {
  if (category_create.value == null) {
    return;
  }
  categories.value.push(category_create.value);
  let courseCategory: Ref<string[]> = ref([]);
  for (let item = 0; item < courseData.value.length; item++) {
    if (courseData.value[item].problems_type == activeSpeicalTitle.value) {
      let course_categories = courseData.value[item]
        .courseProblemList as CourseChildProblems[];

      let course_category: Ref<CourseChildProblems> = ref(
        {} as CourseChildProblems,
      );
      course_category.value.problem_algorithm_type = category_create.value;
      course_category.value.courseProblemList = [] as CourseProblem[];

      if (course_categories == undefined) {
        break;
      }

      course_categories.push(course_category.value);
      courseData.value[item].courseProblemList = course_categories;
      for (let item = 0; item < course_categories.length; item++) {
        courseCategory.value.push(
          course_categories[item]?.problem_algorithm_type ?? "",
        );
      }
      activeCategory.value = category_create.value;
      category_create.value = "";
      simplify_category_problems.value = [];
      break;
    }
  }
  dialogCategoryVisible.value = false;
};
// 将题目添加到当前专栏、当前类别
const buttonAddCourse = (problem_id, problem_name) => {
  for (let item = 0; item < courseData.value.length; item++) {
    if (courseData.value[item].problems_type == activeSpeicalTitle.value) {
      let course_categories = courseData.value[item]
        .courseProblemList as CourseChildProblems[];
      for (let j = 0; j < course_categories.length; j++) {
        if (
          course_categories[j].problem_algorithm_type == activeCategory.value
        ) {
          let category_problems: Ref<CourseProblem[] | undefined> = ref(
            [] as CourseProblem[],
          );

          category_problems.value = course_categories[j].courseProblemList;
          console.log(category_problems.value);
          if (category_problems.value == undefined) {
            category_problems.value = [] as CourseProblem[];
          }
          category_problems.value.push({
            problem_id: problem_id,
            problem_name:
              problem_name[0] != "B"
                ? "ByteOJ " + problem_id + ". " + problem_name
                : problem_name,
          });

          if (courseData.value[item].courseProblemList == undefined) {
            courseData.value[item].courseProblemList = [] as CourseProblem[];
          }
          courseData.value[item].courseProblemList[j].courseProblemList =
            category_problems.value;
          simplify_category_problems.value = category_problems.value;
          break;
        }
      }
      break;
    }
  }
};

// 课程设置问题信息
const courseSetProblem = async () => {
  courseRequest.value.courseProblemsList = courseData.value;
  courseRequest.value.course_id = courseId.value;
  const res = await CourseControllerService.courseAdminProblemSetUsingPost(
    courseRequest.value,
  );
  if (res.code === 0) {
    ElNotification.success({
      title: "Success",
      message: "题目设置成功",
      offset: 100,
    });
  } else {
    ElNotification.error({
      title: "Error",
      message: res.message,
      offset: 100,
    });
  }
};

// 删除某专栏
const deleteSimplifyName = (simplify_name: string) => {
  for (let item = 0; item < courseData.value.length; item++) {
    if (courseData.value[item].problems_type == activeSpeicalTitle.value) {
      courseData.value.splice(item, 1);
      break;
    }
  }
  for (let item = 0; item < simplify_names.value.length; item++) {
    if (simplify_names.value[item] == simplify_name) {
      simplify_names.value.splice(item, 1);
      break;
    }
  }
  if (simplify_name == activeSpeicalTitle.value) {
    categories.value = [];
    simplify_category_problems.value = [];
    activeSpeicalTitle.value = "";
  }
};
// 删除某类别
const deleteCategory = (category: string) => {
  if (category == activeCategory.value) {
    simplify_category_problems.value = [];
    activeCategory.value = "";
  }
  for (let item = 0; item < courseData.value.length; item++) {
    if (courseData.value[item].problems_type == activeSpeicalTitle.value) {
      let categories_current = courseData.value[item].courseProblemList;
      for (let j = 0; j < categories_current.length; j++) {
        if (categories_current[j].problem_algorithm_type == category) {
          courseData.value[item].courseProblemList.splice(j, 1);
          categories.value.splice(j, 1);
          break;
        }
      }
      break;
    }
  }
  activeCategory.value = "";
};
// 删除某题目
const deleteProblem = (problem_id: number) => {
  console.log(simplify_category_problems.value);
  for (let item = 0; item < courseData.value.length; item++) {
    if (courseData.value[item].problems_type == activeSpeicalTitle.value) {
      let categories = courseData.value[item].courseProblemList;
      for (let j = 0; j < categories.length; j++) {
        if (categories[j].problem_algorithm_type == activeCategory.value) {
          let problems =
            courseData.value[item].courseProblemList[j].courseProblemList;
          for (let k = 0; k < problems.length; k++) {
            if (problems[k].problem_id == problem_id) {
              courseData.value[item].courseProblemList[
                j
              ].courseProblemList.splice(k, 1);
              // simplify_category_problems.value?.splice(k, 1);
              break;
            }
          }
          break;
        }
      }
      break;
    }
  }
  console.log(simplify_category_problems.value);
};
</script>

<template>
  <div style="display: flex">
    <div style="width: 1000px">
      <div
        style="
          font-size: 30px;
          text-align: center;
          font-weight: bold;
          margin: 10px 10px;
        "
      >
        ByteOJ题库搜索
      </div>
      <div style="display: flex; width: 500px; margin: 0 auto">
        <el-mention
          class="large"
          v-model="searchContent"
          style=""
          placeholder="请输入关键词搜索题目"
        />
        <button
          style="margin-left: 20px; border: 0px; background-color: white"
          @click="searchByKeyWord"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          >
            <path
              fill="#0298e3"
              d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"
            />
          </svg>
        </button>
      </div>
      <div>
        <el-table :data="tableData">
          <el-table-column prop="problem_id" label="问题ID" />
          <el-table-column label="题目名称" prop="chinese_name">
            <template #default="scope">
              <div>
                <div style="color: #43a6ff; font-weight: bold">
                  {{ scope.row.chinese_name }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="算法标签" prop="algorithm_tags">
            <template #default="scope">
              <div>
                <el-button
                  color="#626aef"
                  size="small"
                  v-for="tag in scope.row.algorithm_tags"
                  style="margin: 1px"
                  >{{ tag }}
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="題目来源" prop="source">
            <template #default="scope">
              <el-button type="success" round>{{ scope.row.source }}</el-button>
            </template>
          </el-table-column>
          <el-table-column label="难度" prop="difficulty_name">
            <template #default="scope">
              <el-button
                type="success"
                v-if="scope.row.difficulty_name === '简单'"
                plain
                >简单
              </el-button>
              <el-button
                type="warning"
                v-if="scope.row.difficulty_name === '中等'"
                plain
                >中等
              </el-button>
              <el-button
                type="danger"
                v-if="scope.row.difficulty_name === '困难'"
                plain
                >困难
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                type="info"
                round
                @click="
                  buttonAddCourse(scope.row.problem_id, scope.row.chinese_name)
                "
                >添加
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="demo-pagination-block" style="float: right">
          <el-pagination
            v-model:current-page="currentPage"
            page-size="50"
            :page-count="pageSum"
            layout="prev, pager, next, jumper"
            :total="50 * pageSum"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    <div style="width: 300px">
      <el-card style="margin: 10px auto">
        <div
          style="
            color: #43a6ff;
            font-weight: bold;
            text-align: center;
            font-size: 28px;
          "
        >
          专栏
        </div>
        <el-button
          v-for="simplify_name in simplify_names"
          :type="activeSpeicalTitle === simplify_name ? 'primary' : 'default'"
          style="text-align: center; margin: 2px auto; font-weight: bold"
          @click="handleSpeicalTitleClick(simplify_name)"
          @dragend="deleteSimplifyName(simplify_name)"
          draggable="true"
        >
          {{ simplify_name }}
        </el-button>
        <el-button
          plain
          size="small"
          @click="dialogSpeicalVisible = true"
          style="margin: 10px auto; width: 100%"
        >
          添加新专栏
        </el-button>
        <el-dialog v-model="dialogSpeicalVisible" title="新专栏" width="500">
          <el-form :model="special_create">
            <el-form-item
              label="新专栏名称"
              style="margin: 0 auto"
              :label-width="formLabelWidth"
            >
              <el-input v-model="special_create" />
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="dialogSpeicalVisible = false">取消</el-button>
              <el-button type="primary" @click="addNewSpeical">
                新建
              </el-button>
            </div>
          </template>
        </el-dialog>
      </el-card>
      <el-card style="margin: 10px auto">
        <div
          style="
            color: #43a6ff;
            font-weight: bold;
            text-align: center;
            font-size: 28px;
          "
        >
          类别
        </div>
        <el-button
          v-for="category in categories"
          :type="activeCategory === category ? 'primary' : 'default'"
          style="text-align: center; margin: 2px auto; font-weight: bold"
          @click="handleCategoryClick(category)"
          @dragend="deleteCategory(category)"
          draggable="true"
        >
          {{ category }}
        </el-button>
        <el-button
          plain
          size="small"
          @click="dialogCategoryVisible = true"
          style="margin: 10px auto; width: 100%"
        >
          添加新类别
        </el-button>
        <el-dialog v-model="dialogCategoryVisible" title="新专栏" width="500">
          <el-form :model="category_create">
            <el-form-item
              label="新专栏名称"
              style="margin: 0 auto"
              :label-width="formLabelWidth"
            >
              <el-input v-model="category_create" />
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="dialogCategoryVisible = false">取消</el-button>
              <el-button type="primary" @click="addNewCategory">
                新建
              </el-button>
            </div>
          </template>
        </el-dialog>
      </el-card>
      <el-card style="margin: 10px auto">
        <div
          style="
            color: #43a6ff;
            font-weight: bold;
            text-align: center;
            font-size: 28px;
          "
        >
          题目
        </div>
        <div v-for="problem in simplify_category_problems">
          <el-button
            style="
              margin: 10px auto;
              font-weight: bold;
              color: dodgerblue;
              font-size: 20px;
            "
            @dragend="deleteProblem(problem.problem_id ?? 0)"
            draggable="true"
          >
            {{ problem.problem_name }}
          </el-button>
        </div>
      </el-card>
      <el-button
        size="large"
        type="primary"
        style="width: 100%"
        @click="courseSetProblem"
        >设置课程题目
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>
