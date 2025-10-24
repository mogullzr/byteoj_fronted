<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import { CourseControllerService } from "../../../generated/services/CourseControllerService";
import router from "../../router/index";

const path = router.currentRoute.value.fullPath;
const course_id: Ref<any> = ref(path.toString().split("/")[2]);
const algorithm_problems: Ref<any> = ref([]);
const notJoined: Ref<boolean> = ref(false);

onMounted(async () => {
  try {
    const res = await CourseControllerService.courseSearchProblemsByCourseIdUsingPost(
        course_id.value
    );
    if (res.code === 0) {
      algorithm_problems.value = res.data || [];
      notJoined.value = false;
    } else if (res.code === 40100) {
      notJoined.value = true;
    }
  } catch (error) {
    console.error('Network error in fetching problems:', error);
  }
});
</script>

<template>
  <div class="container mx-auto p-4">
    <div v-if="notJoined" class="alert alert-warning shadow-lg border-4 bg-amber-50 text-center">
      <div class="flex items-center justify-center">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 mr-2 text-yellow-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
          <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span class="text-lg font-medium text-yellow-800">
          您还没有加入课程，请联系管理员Mogullzr
          <strong>(目前仅对豫章师范学院数学与计算机学院全体学生开放)</strong>
        </span>
      </div>
    </div>
    <div v-else>
      <div
          class="collapse bg-base-100 my-6 shadow-lg border-4"
          v-for="problems in algorithm_problems"
          :key="problems"
      >
        <input type="checkbox" />
        <div class="collapse-title font-medium p-0">
          <div class="bg-amber-50 p-3 flex">
            <div class="flex-1 text-lg font-bold" style="color: #8a6d3b">
              {{ problems.problems_type }}
            </div>
            <div class="text-sm font-bold" style="color: #337ab7">
              <span>情况：</span>
              <span>{{ problems.ac_num }} /{{ problems.problem_num }}</span>
            </div>
          </div>
          <div class="p-3 text-gray-500">
            包括题目类型有：
            <span
                v-for="(children_problem_list, index) in problems.courseProblemList"
                :key="children_problem_list"
            >
              <span v-if="index == problems.courseProblemList.length - 1">
                {{ children_problem_list.problem_algorithm_type }}.
              </span>
              <span v-else>
                {{ children_problem_list.problem_algorithm_type }}、
              </span>
            </span>
          </div>
        </div>
        <div class="collapse-content">
          <div>
            <div
                class="flex flex-row"
                v-for="children_problem_list_1 in problems.courseProblemList"
                :key="children_problem_list_1"
            >
              <div
                  class="basis-2/12 text-gray-400 font-bold"
                  style="font-size: 17px"
              >
                <div class="line"></div>
                {{ children_problem_list_1.problem_algorithm_type }}
              </div>
              <div class="basis-10/12">
                <div class="line"></div>
                <div
                    v-for="problem in children_problem_list_1.courseProblemList"
                    :key="problem"
                    style="color: #337ab7"
                >
                  <div class="flex">
                    <router-link
                        class="link link-hover flex-1"
                        :to="'/problems/algorithm/' + problem.problem_id"
                    >
                      ByteOJ&nbsp;{{ problem.problem_id }}.{{
                        problem.problem_name
                      }}
                    </router-link>
                    <div class="text-gray-400 text-sm px-2">
                      {{ problem.ac_num }}人AC
                    </div>
                    <div class="text-gray-400 pb-2">
                      <div v-if="problem.status == 1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                        >
                          <path
                              fill="#5FBA7D"
                              d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"
                          />
                        </svg>
                      </div>
                      <div v-else-if="problem.status == 0">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 8 16"
                        >
                          <path
                              fill-rule="evenodd"
                              d="M0 7v2h8V7H0z"
                              fill="#0891b2"
                          />
                        </svg>
                      </div>
                      <div v-else>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 16 16"
                        ></svg>
                      </div>
                    </div>
                  </div>
                  <div class="line"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!algorithm_problems.length" class="text-gray-500 text-center py-4">
        暂无题目
      </div>
    </div>
  </div>
</template>

<style scoped>
.line {
  float: right;
  width: 100%;
  height: 1px;
  margin-top: -0.5em;
  background: #eeeeee;
  position: relative;
  text-align: center;
}
</style>