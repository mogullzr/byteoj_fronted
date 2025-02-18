<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import { CourseControllerService } from "../../../generated/services/CourseControllerService";
import router from "../../router/index";

const path = router.currentRoute.value.fullPath;
const course_id: Ref<any> = ref(path.toString().split("/")[2]);

const algorithm_problems: Ref<any> = ref([] as any);

onMounted(async () => {
  const res =
    await CourseControllerService.courseSearchProblemsByCourseIdUsingPost(
      course_id.value
    );

  if (res.code === 0) {
    algorithm_problems.value = res.data;
  }
});
</script>

<template>
  <div class="container">
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
            <span>完成情况：</span>
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
                    style="font-size: 14px"
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
