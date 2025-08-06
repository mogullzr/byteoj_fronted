<template>
  <div class="course-edit-container bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6 overflow-auto">
    <div class="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8 flex items-center">
        <i class="el-icon-edit mr-3 text-blue-600"></i> 编辑课程
      </h1>
      <el-form :model="form" label-width="140px" :rules="rules" ref="courseForm" class="mb-8">
        <!-- Basic Course Info -->
        <el-form-item label="课程标题" prop="course_title">
          <el-input v-model="form.course_title" placeholder="请输入课程标题" class="rounded-md"></el-input>
        </el-form-item>
        <el-form-item label="标题描述" prop="course_title_description">
          <el-input
              type="textarea"
              v-model="form.course_title_description"
              placeholder="请输入标题描述"
              :rows="4"
              class="rounded-md"
          ></el-input>
        </el-form-item>
        <el-form-item label="创建者" prop="create_name">
          <el-input v-model="form.create_name" placeholder="请输入创建者" disabled class="rounded-md"></el-input>
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-upload
              class="avatar-uploader"
              :action="uploadAction"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
          >
            <div class="demo-type">
              <el-avatar :size="50" @error="errorHandler">
                <img v-if="form.avatar" :src="form.avatar" class="avatar rounded-full"/>
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-avatar>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="开始时间" prop="start_time">
          <el-date-picker
              v-model="form.start_time"
              type="datetime"
              placeholder="选择开始时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="rounded-md"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="end_time">
          <el-date-picker
              v-model="form.end_time"
              type="datetime"
              placeholder="选择结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="rounded-md"
          ></el-date-picker>
        </el-form-item>
      </el-form>

      <!-- Split Layout: Left (Problem Selection) and Right (Chapters/Categories/Problems/Users) -->
      <div class="flex gap-6">
        <!-- Left: Problem Selection -->
<!--        <div class="w-1/2">-->
<!--          <h2 class="text-xl font-semibold text-gray-800 mb-4">题目库</h2>-->
<!--          <el-form :model="searchRequest" inline class="mb-4">-->
<!--            <el-form-item label="分类" class="mr-4">-->
<!--              <el-select v-model="searchRequest.category" placeholder="选择分类" class="w-32">-->
<!--                <el-option label="算法" value="algorithm"></el-option>-->
<!--                &lt;!&ndash; Add more categories as needed &ndash;&gt;-->
<!--              </el-select>-->
<!--            </el-form-item>-->
<!--            <el-form-item label="关键词">-->
<!--              <el-input v-model="searchRequest.keyword" placeholder="输入关键词" class="w-48"></el-input>-->
<!--            </el-form-item>-->
<!--            <el-form-item>-->
<!--              <el-button type="primary" @click="fetchProblems" class="bg-blue-600 hover:bg-blue-700 shadow-md">搜索-->
<!--              </el-button>-->
<!--            </el-form-item>-->
<!--          </el-form>-->
<!--          <el-table-->
<!--              v-if="problemList.length && selectedCategory && selectedCategory.courseProblemList"-->
<!--              :data="problemList"-->
<!--              border-->
<!--              stripe-->
<!--              class="rounded-lg shadow-sm"-->
<!--              row-class-name="hover:bg-blue-50 transition-colors duration-150"-->
<!--          >-->
<!--            <el-table-column prop="problem_id" label="ID" width="80" align="center"/>-->
<!--            <el-table-column prop="chinese_name" label="题目名称" min-width="200"/>-->
<!--            <el-table-column prop="difficulty_name" label="难度" width="100" align="center"/>-->
<!--            <el-table-column prop="ac_total" label="通过人数" width="120" align="center"/>-->
<!--            <el-table-column prop="algorithm_tags" label="标签" width="150">-->
<!--              <template #default="{ row }">-->
<!--                <el-tag v-for="tag in parseTags(row.tags)" :key="tag" size="small" class="mr-1" type="info">{{-->
<!--                    tag-->
<!--                  }}-->
<!--                </el-tag>-->
<!--              </template>-->
<!--            </el-table-column>-->
<!--            <el-table-column label="状态" width="100" align="center">-->
<!--              <template #default="{ row }">-->
<!--                <el-button-->
<!--                    v-if="selectedCategory && !selectedCategory.courseProblemList.some(p => String(p.problem_id) === String(row.problem_id))"-->
<!--                    type="primary"-->
<!--                    size="small"-->
<!--                    @click.stop="addProblemOnClick(row)"-->
<!--                    class="bg-blue-600 hover:bg-blue-700 shadow-md"-->
<!--                >-->
<!--                  添加-->
<!--                </el-button>-->
<!--                <el-tag v-else-if="selectedCategory" type="success">已添加</el-tag>-->
<!--                <el-tag v-else type="warning">未选择类别</el-tag>-->
<!--              </template>-->
<!--            </el-table-column>-->
<!--          </el-table>-->
<!--          <div v-else class="text-gray-500 text-center py-4">-->
<!--            {{ selectedCategory ? '暂无题目，请尝试搜索' : '请先选择一个类别' }}-->
<!--          </div>-->
<!--          <el-pagination-->
<!--              v-if="totalProblems > 0"-->
<!--              v-model:current-page="searchRequest.pageNum"-->
<!--              :page-size="searchRequest.pageSize"-->
<!--              :total="totalProblems"-->
<!--              layout="prev, pager, next"-->
<!--              @current-change="fetchProblems"-->
<!--              class="mt-4 flex justify-center"-->
<!--          />-->
<!--        </div>-->

        <!-- Right: Chapters, Categories, Problems, and Users -->
        <div class="w-1/2">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">课程题目设置</h2>
          <!-- Chapters -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-base font-medium text-gray-700">章节列表</h3>
              <el-button type="success" size="small" @click="addProblemGroup"
                         class="bg-green-600 hover:bg-green-700 shadow-md">
                添加章节
              </el-button>
            </div>
            <el-table
                :data="form.courseProblemsList"
                border
                stripe
                class="rounded-lg shadow-sm"
                row-class-name="cursor-pointer hover:bg-blue-50 transition-colors duration-150"
                :row-class-name="getChapterRowClass"
                @row-click="(row, column, event) => selectChapter(row, column, event, form.courseProblemsList.indexOf(row))"
            >
              <el-table-column label="章节名称" min-width="150">
                <template #default="{ row }">
                  <el-input
                      v-model="row.problems_type"
                      placeholder="请输入章节名称（如：第一章）"
                      class="rounded-md"
                      @focus="() => selectChapter(row, null, null, form.courseProblemsList.indexOf(row))"
                  ></el-input>
                </template>
              </el-table-column>
              <el-table-column label="题目数量" width="100" align="center">
                <template #default="{ row }">
                  {{ row.problem_num }}
                </template>
              </el-table-column>
              <el-table-column label="通过人数" width="120" align="center">
                <template #default="{ row }">
                  {{ row.ac_num }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="{ $index }">
                  <el-button type="danger" size="small" @click.stop="removeProblemGroup($index)"
                             class="bg-red-600 hover:bg-red-700 shadow-md">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="!form.courseProblemsList.length" class="text-gray-500 text-center py-4">暂无章节，请添加</div>
          </div>

          <!-- Categories (Displayed when a chapter is selected) -->
          <div v-if="selectedChapter && selectedChapter.courseProblemList" class="mb-6">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-base font-medium text-gray-700">类别列表</h3>
              <el-button type="success" size="small" @click="addChildProblem"
                         class="bg-green-600 hover:bg-green-700 shadow-md">
                添加类别
              </el-button>
            </div>
            <el-table
                :data="selectedChapter.courseProblemList"
                border
                stripe
                class="rounded-lg shadow-sm"
                row-class-name="cursor-pointer hover:bg-blue-50 transition-colors duration-150"
                :row-class-name="getCategoryRowClass"
                @row-click="(row, column, event) => selectCategory(row, column, event, selectedChapter.courseProblemList.indexOf(row))"
            >
              <el-table-column label="类别名称" min-width="150">
                <template #default="{ row }">
                  <el-input
                      v-model="row.problem_algorithm_type"
                      placeholder="请输入类别名称（如：模拟）"
                      class="rounded-md"
                      @focus="() => selectCategory(row, null, null, selectedChapter.courseProblemList.indexOf(row))"
                  ></el-input>
                </template>
              </el-table-column>
              <el-table-column label="题目数量" width="100" align="center">
                <template #default="{ row }">
                  {{ row.courseProblemList.length }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="{ $index }">
                  <el-button type="danger" size="small" @click.stop="removeChildProblem($index)"
                             class="bg-red-600 hover:bg-red-700 shadow-md">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="!selectedChapter.courseProblemList.length" class="text-gray-500 text-center py-4">
              暂无类别，请添加
            </div>
          </div>
          <div v-else-if="selectedChapterIndex !== -1" class="text-gray-500 text-center py-4">
            暂无类别数据，请检查章节数据
          </div>

          <!-- Problems (Displayed when a category is selected) -->
          <div v-if="selectedCategoryIndex !== -1 && selectedCategory && selectedCategory.courseProblemList" class="mb-6">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-base font-medium text-gray-700">题目列表</h3>
              <el-button type="primary" size="small" @click="openProblemDialog"
                         class="bg-blue-600 hover:bg-blue-700 shadow-md">
                添加题目
              </el-button>
            </div>
            <el-table
                :data="selectedCategory.courseProblemList"
                border
                stripe
                class="rounded-lg shadow-sm"
                row-class-name="hover:bg-gray-50 transition-colors duration-150"
            >
              <el-table-column prop="problem_id" label="题目ID" width="100" align="center"/>
              <el-table-column prop="problem_name" label="题目名称" min-width="200"/>
              <el-table-column prop="ac_num" label="通过人数" width="120" align="center"/>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag type="success">启用</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="{ $index }">
                  <el-button type="danger" size="small" @click="removeProblem($index)"
                             class="bg-red-600 hover:bg-red-700 shadow-md">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="!selectedCategory.courseProblemList.length" class="text-gray-500 text-center py-4">
              暂无题目，请添加
            </div>
          </div>

          <!-- Users -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-base font-medium text-gray-700">用户列表</h3>
              <div class="flex gap-2">
                <el-button type="primary" size="small" @click="openUserDialog"
                           class="bg-blue-600 hover:bg-blue-700 shadow-md">
                  添加用户
                </el-button>
                <el-button type="success" size="small" @click="submitUsers"
                           class="bg-green-600 hover:bg-green-700 shadow-md">
                  保存用户
                </el-button>
              </div>
            </div>
            <el-table
                :data="selectedUsers"
                border
                stripe
                class="rounded-lg shadow-sm"
                row-class-name="hover:bg-gray-50 transition-colors duration-150"
            >
              <el-table-column prop="uuid" label="用户ID" width="100" align="center"/>
              <el-table-column prop="username" label="用户名" min-width="150"/>
              <el-table-column prop="email" label="邮箱" width="200"/>
              <el-table-column label="操作" width="100" align="center">
                <template #default="{ $index }">
                  <el-button type="danger" size="small" @click="removeUser($index)"
                             class="bg-red-600 hover:bg-red-700 shadow-md">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="!selectedUsers.length" class="text-gray-500 text-center py-4">暂无用户，请添加</div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="mt-8 flex justify-end gap-4">
        <el-button
            type="primary"
            @click="submitForm"
            class="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 py-2 shadow-md"
        >
          保存课程
        </el-button>
        <el-button
            @click="goBack"
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md px-6 py-2 shadow-md"
        >
          返回
        </el-button>
      </div>

      <!-- Problem Selection Dialog -->
      <el-dialog title="选择题目" v-model="dialogVisible" width="80%" :before-close="resetProblemDialog">
        <el-form :model="searchRequest" inline class="mb-4">
          <el-form-item label="分类" class="mr-4">
            <el-select v-model="searchRequest.category" placeholder="选择分类" class="w-32">
              <el-option label="算法" value="algorithm"></el-option>
              <!-- Add more categories as needed -->
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="searchRequest.keyword" placeholder="输入关键词" class="w-48"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchProblems" class="bg-blue-600 hover:bg-blue-700 shadow-md">搜索
            </el-button>
          </el-form-item>
        </el-form>
        <el-table
            v-if="problemList.length && selectedCategory && selectedCategory.courseProblemList"
            :data="problemList"
            border
            stripe
            class="rounded-lg shadow-sm"
            row-class-name="hover:bg-blue-50 transition-colors duration-150"
        >
          <el-table-column prop="problem_id" label="ID" width="80" align="center"/>
          <el-table-column prop="chinese_name" label="题目名称" min-width="200"/>
          <el-table-column prop="difficulty_name" label="难度" width="100" align="center"/>
          <el-table-column prop="ac_total" label="通过人数" width="120" align="center"/>
          <el-table-column prop="algorithm_tags" label="标签" width="150">
            <template #default="{ row }">
              <el-tag v-for="tag in parseTags(row.tags)" :key="tag" size="small" class="mr-1" type="info">{{
                  tag
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-button
                  v-if="selectedCategory && !selectedCategory.courseProblemList.some(p => String(p.problem_id) === String(row.problem_id))"
                  type="primary"
                  size="small"
                  @click.stop="addProblemOnClick(row)"
                  class="bg-blue-600 hover:bg-blue-700 shadow-md"
              >
                添加
              </el-button>
              <el-tag v-else-if="selectedCategory" type="success">已添加</el-tag>
              <el-tag v-else type="warning">未选择类别</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="text-gray-500 text-center py-4">
          {{ selectedCategory ? '暂无题目，请尝试搜索' : '请先选择一个类别' }}
        </div>
        <el-pagination
            v-if="totalProblems > 0"
            v-model:current-page="searchRequest.pageNum"
            :page-size="searchRequest.pageSize"
            :total="totalProblems"
            layout="prev, pager, next"
            @current-change="fetchProblems"
            class="mt-4 flex justify-center"
        />
        <template #footer>
          <el-button @click="dialogVisible = false" class="bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-md">关闭
          </el-button>
        </template>
      </el-dialog>

      <!-- User Selection Dialog -->
      <el-dialog title="选择用户" v-model="userDialogVisible" width="80%" :before-close="resetUserDialog">
        <el-form :model="searchRequestUser" inline class="mb-4">
          <el-form-item label="用户名">
            <el-input v-model="searchRequestUser.keyword" placeholder="输入用户名" class="w-48"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchUsers" class="bg-blue-600 hover:bg-blue-700 shadow-md">搜索
            </el-button>
          </el-form-item>
        </el-form>
        <el-table
            v-if="userList.length"
            :data="userList"
            border
            stripe
            class="rounded-lg shadow-sm"
            row-class-name="hover:bg-blue-50 transition-colors duration-150"
        >
          <el-table-column prop="uuid" label="用户ID" width="100" align="center"/>
          <el-table-column prop="username" label="用户名" min-width="150"/>
          <el-table-column prop="email" label="邮箱" width="200"/>
          <el-table-column prop="phone" label="电话" width="120" align="center"/>
          <el-table-column prop="gender" label="性别" width="80" align="center"/>
          <el-table-column prop="tags" label="标签" width="150">
            <template #default="{ row }">
              <el-tag v-for="tag in parseTags(row.tags)" :key="tag" size="small" class="mr-1" type="info">{{
                  tag
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-button
                  v-if="!selectedUserIds.includes(row.uuid)"
                  type="primary"
                  size="small"
                  @click.stop="addUserOnClick(row)"
                  class="bg-blue-600 hover:bg-blue-700 shadow-md"
              >
                添加
              </el-button>
              <el-tag v-else type="success">已添加</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="text-gray-500 text-center py-4">暂无用户，请尝试搜索</div>
        <el-pagination
            v-if="totalUserPages > 0"
            v-model:current-page="searchRequestUser.pageNum"
            :page-size="searchRequestUser.pageSize"
            :total="totalUserPages * searchRequestUser.pageSize"
            layout="prev, pager, next"
            @current-change="fetchUsers"
            class="mt-4 flex justify-center"
        />
        <template #footer>
          <el-button @click="userDialogVisible = false" class="bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-md">
            关闭
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { debounce } from 'lodash'
import {
  ElMessage,
  ElForm,
  ElFormItem,
  ElInput,
  ElUpload,
  ElButton,
  ElDatePicker,
  ElTable,
  ElTableColumn,
  ElDialog,
  ElSelect,
  ElOption,
  ElTag,
  ElPagination,
  ElAvatar
} from 'element-plus'
import { CourseControllerService, SearchControllerService, UserControllerService } from '../../../generated/index.ts'

const props = defineProps({
  courseId: String
})

const router = useRouter()
const route = useRoute()
const courseForm = ref(null)
const dialogVisible = ref(false)
const userDialogVisible = ref(false)
const selectedChapterIndex = ref(-1)
const selectedCategoryIndex = ref(-1)
const selectedUserIds = ref([])

const form = reactive({
  course_id: '',
  course_title: '',
  course_title_description: '',
  create_name: '',
  avatar: '',
  start_time: '',
  end_time: '',
  courseProblemsList: []
})

const searchRequest = ref({
  category: 'algorithm',
  keyword: '',
  pageNum: 1,
  pages: 1,
  pageSize: 20
})

const searchRequestUser = ref({
  keyword: '',
  pageNum: 1,
  pageSize: 15
})

const problemList = ref([])
const userList = ref([])
const totalProblems = ref(0)
const totalUserPages = ref(0)

const rules = {
  course_title: [{ required: true, message: '请输入课程标题', trigger: 'blur' }],
  course_title_description: [{ required: true, message: '请输入标题描述', trigger: 'blur' }]
}

const uploadAction = ref('') // Set your upload URL here

// Computed properties
const selectedChapter = computed(() => {
  if (selectedChapterIndex.value === -1 || !form.courseProblemsList[selectedChapterIndex.value]) {
    console.log('selectedChapter: No valid chapter', { selectedChapterIndex: selectedChapterIndex.value, courseProblemsList: form.courseProblemsList })
    return null
  }
  return form.courseProblemsList[selectedChapterIndex.value]
})

const selectedCategory = computed(() => {
  if (!selectedChapter.value || selectedCategoryIndex.value === -1 || !selectedChapter.value.courseProblemList?.[selectedCategoryIndex.value]) {
    console.log('selectedCategory: No valid category', {
      selectedChapter: selectedChapter.value,
      selectedCategoryIndex: selectedCategoryIndex.value,
      courseProblemList: selectedChapter.value?.courseProblemList
    })
    return null
  }
  return selectedChapter.value.courseProblemList[selectedCategoryIndex.value]
})

const selectedUsers = computed(() => {
  return userList.value.filter(user => selectedUserIds.value.includes(user.uuid))
})

const parseTags = (tags) => {
  if (!tags) return []
  try {
    return JSON.parse(tags.replace(/'/g, '"')) || []
  } catch (e) {
    console.error('Error parsing tags:', tags, e)
    return []
  }
}

const fetchCourse = async () => {
  if (!props.courseId) {
    ElMessage.error('无效的课程ID')
    console.error('Course ID is missing or invalid:', props.courseId)
    return
  }
  try {
    console.log('Fetching course data for ID:', props.courseId)
    const res = await CourseControllerService.courseSearchProblemsByCourseIdUsingPost(props.courseId)
    if (res.code === 0) {
      form.courseProblemsList = (res.data || []).map(group => ({
        ...group,
        courseProblemList: Array.isArray(group.courseProblemList) ? group.courseProblemList.map(category => ({
          ...category,
          courseProblemList: Array.isArray(category.courseProblemList) ? category.courseProblemList : []
        })) : []
      }))
      console.log('Course problems loaded:', JSON.stringify(form.courseProblemsList, null, 2))
      const courseRes = await CourseControllerService.courseSearchByCourseIdUsingPost(props.courseId)
      if (courseRes.code === 0) {
        Object.assign(form, {
          course_id: courseRes.data.course_id || props.courseId,
          course_title: courseRes.data.course_title || '',
          course_title_description: courseRes.data.course_title_description || '',
          create_name: courseRes.data.create_name || '',
          avatar: courseRes.data.avatar || '',
          start_time: courseRes.data.start_time || '',
          end_time: courseRes.data.end_time || ''
        })
        console.log('Course info loaded:', form)
      } else {
        ElMessage.error(courseRes.message || '获取课程信息失败')
        console.error('Failed to fetch course info:', courseRes)
      }
    } else {
      ElMessage.error(res.message || '获取课程题目信息失败')
      console.error('Failed to fetch course problems:', res)
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
    console.error('Network error in fetchCourse:', error)
  }
}

const fetchProblems = async () => {
  try {
    console.log('Fetching problems with request:', searchRequest.value)
    const res = await SearchControllerService.searchAllUsingPost(searchRequest.value)
    if (res.code === 0) {
      problemList.value = res.data.dataList || []
      totalProblems.value = res.data.dataList.length > 0 ? res.data.dataList[0].pages * searchRequest.value.pageSize : 0
      console.log('Problems loaded:', problemList.value, 'Total:', totalProblems.value)
    } else {
      ElMessage.error(res.message || '获取题目列表失败')
      console.error('Failed to fetch problems:', res)
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
    console.error('Network error in fetchProblems:', error)
  }
}

const fetchUsers = async () => {
  try {
    console.log('Fetching users with request:', searchRequestUser.value)
    const res = await UserControllerService.adminGetUserListUsingPost(searchRequestUser.value.pageNum)
    if (res.code === 0) {
      userList.value = res.data || []
      console.log('Users loaded:', userList.value)
    } else {
      ElMessage.error(res.message || '获取用户列表失败')
      console.error('Failed to fetch users:', res)
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
    console.error('Network error in fetchUsers:', error)
  }
}

const fetchUserPages = async () => {
  try {
    const response = await UserControllerService.adminGetUserPagesUsingPost()
    if (response.code === 0) {
      totalUserPages.value = response.data || 0
      console.log('Total user pages:', totalUserPages.value)
    } else {
      ElMessage.error(response.message || '获取用户总页数失败')
      console.error('Failed to fetch user pages:', response)
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
    console.error('Network error in fetchUserPages:', error)
  }
}

const handleAvatarSuccess = (res, file) => {
  if (res.code === 0) {
    form.avatar = res.data.url // Adjust based on your API response
    ElMessage.success('头像上传成功')
    console.log('Avatar uploaded:', form.avatar)
  } else {
    ElMessage.error(res.message || '头像上传失败')
    console.error('Avatar upload failed:', res)
  }
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('请上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB!')
    return false
  }
  return true
}

const errorHandler = () => {
  console.warn('Avatar image failed to load')
  return true // Allow fallback rendering
}

const addProblemGroup = () => {
  form.courseProblemsList.push({
    problems_type: '',
    ac_num: 0,
    problem_num: 0,
    courseProblemList: []
  })
  selectedChapterIndex.value = form.courseProblemsList.length - 1
  selectedCategoryIndex.value = -1
  console.log('Added new chapter and selected it:', form.courseProblemsList)
}

const removeProblemGroup = (groupIndex) => {
  form.courseProblemsList.splice(groupIndex, 1)
  if (selectedChapterIndex.value === groupIndex) {
    selectedChapterIndex.value = -1
    selectedCategoryIndex.value = -1
  }
  console.log('Removed chapter at index:', groupIndex)
}

const addChildProblem = () => {
  if (selectedChapterIndex.value === -1) {
    ElMessage.warning('请先选择一个章节')
    return
  }
  if (!form.courseProblemsList[selectedChapterIndex.value].courseProblemList) {
    form.courseProblemsList[selectedChapterIndex.value].courseProblemList = []
  }
  form.courseProblemsList[selectedChapterIndex.value].courseProblemList.push({
    problem_algorithm_type: '',
    courseProblemList: []
  })
  selectedCategoryIndex.value = form.courseProblemsList[selectedChapterIndex.value].courseProblemList.length - 1
  console.log('Added new category and selected it:', selectedCategoryIndex.value, 'category:', form.courseProblemsList[selectedChapterIndex.value].courseProblemList[selectedCategoryIndex.value])
}

const removeChildProblem = (childIndex) => {
  form.courseProblemsList[selectedChapterIndex.value].courseProblemList.splice(childIndex, 1)
  if (selectedCategoryIndex.value === childIndex) {
    selectedCategoryIndex.value = -1
  }
  updateChapterStats()
  console.log('Removed category at index:', childIndex)
}

const selectChapter = (row, column, event, index) => {
  console.log('selectChapter triggered:', { row, column, event, index })
  if (index === undefined || index === null || index === -1) {
    index = form.courseProblemsList.indexOf(row)
  }
  if (index === -1 || !form.courseProblemsList[index]) {
    ElMessage.warning('无法选择章节，请重试')
    console.warn('Invalid chapter index:', index)
    return
  }
  selectedChapterIndex.value = index
  selectedCategoryIndex.value = -1
  console.log('Selected chapter index:', selectedChapterIndex.value, 'chapter:', form.courseProblemsList[index])
}

const selectCategory = debounce((row, column, event, index) => {
  console.log('selectCategory triggered:', {
    row,
    column,
    event: event ? { type: event.type, target: event.target } : null,
    index,
    selectedChapter: selectedChapter.value,
    courseProblemList: selectedChapter.value?.courseProblemList
  })
  if (!selectedChapter.value || !Array.isArray(selectedChapter.value.courseProblemList)) {
    ElMessage.warning('请先选择一个章节或章节数据无效')
    console.warn('No valid chapter or courseProblemList:', selectedChapter.value)
    return
  }
  if (index === undefined || index === null || index === -1) {
    index = selectedChapter.value.courseProblemList.indexOf(row)
    console.log('Computed index from row:', index, 'row:', row)
  }
  if (index === -1 || !selectedChapter.value.courseProblemList[index]) {
    ElMessage.warning('无法选择类别，请重试')
    console.warn('Invalid category index:', index, 'row:', row, 'courseProblemList:', selectedChapter.value.courseProblemList)
    return
  }
  selectedCategoryIndex.value = index
  console.log('Selected category index:', selectedCategoryIndex.value, 'category:', selectedChapter.value.courseProblemList[index])
}, 300)

const getChapterRowClass = ({ rowIndex }) => {
  return selectedChapterIndex.value === rowIndex ? 'bg-blue-100 font-semibold' : ''
}

const getCategoryRowClass = ({ rowIndex }) => {
  return selectedCategoryIndex.value === rowIndex ? 'bg-blue-100 font-semibold' : ''
}

const openProblemDialog = () => {
  if (selectedChapterIndex.value === -1) {
    ElMessage.warning('请先选择一个章节')
    return
  }
  if (selectedCategoryIndex.value === -1) {
    ElMessage.warning('请先选择一个类别')
    return
  }
  if (!selectedCategory.value) {
    ElMessage.warning('类别数据无效，请重新选择')
    console.warn('Invalid selectedCategory:', selectedCategory.value)
    return
  }
  dialogVisible.value = true
  fetchProblems()
}

const addProblemOnClick = (problem) => {
  console.log('addProblemOnClick triggered:', {
    problem,
    selectedChapterIndex: selectedChapterIndex.value,
    selectedCategoryIndex: selectedCategoryIndex.value,
    selectedCategory: selectedCategory.value
  })
  if (!selectedChapter.value) {
    ElMessage.error('未选择章节，无法添加题目')
    console.error('No chapter selected')
    return
  }
  if (!selectedCategory.value) {
    ElMessage.error('未选择类别，无法添加题目')
    console.error('No category selected', {
      selectedCategoryIndex: selectedCategoryIndex.value,
      courseProblemList: selectedChapter.value.courseProblemList
    })
    return
  }
  const child = selectedCategory.value
  if (!child.courseProblemList) {
    child.courseProblemList = []
  }
  if (!child.courseProblemList.some((p) => String(p.problem_id) === String(problem.problem_id))) {
    child.courseProblemList.push({
      problem_id: problem.problem_id,
      problem_name: problem.chinese_name,
      ac_num: problem.ac_total,
      status: 0
    })
    updateChapterStats()
    ElMessage.success(`已添加题目: ${problem.chinese_name}`)
    console.log('Added problem:', problem.problem_id, 'to category:', child)
  } else {
    ElMessage.warning('该题目已添加')
    console.log('Duplicate problem:', problem.problem_id)
  }
}

const removeProblem = (problemIndex) => {
  form.courseProblemsList[selectedChapterIndex.value].courseProblemList[
      selectedCategoryIndex.value
      ].courseProblemList.splice(problemIndex, 1)
  updateChapterStats()
  console.log('Removed problem at index:', problemIndex)
}

const updateChapterStats = () => {
  if (selectedChapterIndex.value !== -1) {
    const group = form.courseProblemsList[selectedChapterIndex.value]
    group.problem_num = group.courseProblemList.reduce((sum, c) => sum + (c.courseProblemList?.length || 0), 0)
    group.ac_num = group.courseProblemList.reduce(
        (sum, c) => sum + (c.courseProblemList?.reduce((s, p) => s + (p.ac_num || 0), 0) || 0),
        0
    )
    console.log('Updated chapter stats:', group)
  }
}

const openUserDialog = () => {
  userDialogVisible.value = true
  fetchUsers()
}

const addUserOnClick = (user) => {
  if (!selectedUserIds.value.includes(user.uuid)) {
    selectedUserIds.value.push(user.uuid)
    ElMessage.success(`已添加用户: ${user.username}`)
    console.log('Added user:', user.uuid, 'to selectedUserIds:', selectedUserIds.value)
  } else {
    ElMessage.warning('该用户已添加')
    console.log('Duplicate user:', user.uuid)
  }
}

const removeUser = (index) => {
  const user = selectedUsers.value[index]
  selectedUserIds.value = selectedUserIds.value.filter(id => id !== user.uuid)
  console.log('Removed user:', user.uuid, 'from selectedUserIds:', selectedUserIds.value)
}

const submitUsers = async () => {
  if (!selectedUserIds.value.length) {
    ElMessage.warning('请至少添加一个用户')
    return
  }
  try {
    const courseRequest = {
      course_id: Number(props.courseId),
      user_list: selectedUserIds.value
    }
    console.log('Submitting users:', courseRequest)
    const res = await CourseControllerService.courseAdminUserSetUsingPost(courseRequest)
    if (res.code === 0) {
      ElMessage.success('用户添加成功')
      console.log('Users submitted successfully:', res)
    } else {
      ElMessage.error(res.message || '添加用户失败')
      console.error('Failed to submit users:', res)
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
    console.error('Network error in submitUsers:', error)
  }
}

const resetProblemDialog = (done) => {
  dialogVisible.value = false
  console.log('Problem dialog closed')
  done()
}

const resetUserDialog = (done) => {
  userDialogVisible.value = false
  console.log('User dialog closed')
  done()
}

const submitForm = async () => {
  courseForm.value.validate(async (valid) => {
    if (valid) {
      try {
        console.log('Submitting form:', form)
        const res = await CourseControllerService.courseAdminProblemSetUsingPost(form)
        if (res.code === 0) {
          ElMessage.success('课程更新成功')
          router.push('/course')
        } else {
          ElMessage.error(res.message || '更新失败')
          console.error('Submission failed:', res)
        }
      } catch (error) {
        ElMessage.error('网络错误，请稍后重试')
        console.error('Network error in submitForm:', error)
      }
    } else {
      ElMessage.error('请检查表单输入')
    }
  })
}

const goBack = () => {
  router.push('/course')
}

onMounted(() => {
  console.log('Component mounted, courseId:', props.courseId)
  selectedChapterIndex.value = -1
  selectedCategoryIndex.value = -1
  fetchCourse()
  fetchUserPages()
})

watch(selectedCategoryIndex, (newVal, oldVal) => {
  console.log('selectedCategoryIndex changed:', {
    newVal,
    oldVal,
    selectedCategory: selectedCategory.value,
    selectedChapter: selectedChapter.value,
    courseProblemList: selectedChapter.value?.courseProblemList
  })
})
</script>

<style scoped>
.course-edit-container {
  @apply bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6 overflow-auto;
}

.avatar-uploader :deep(.el-upload) {
  @apply border border-gray-200 rounded-full overflow-hidden cursor-pointer shadow-sm transition-transform duration-200 hover:scale-105;
}

.avatar-uploader .avatar {
  @apply w-24 h-24 object-cover;
}

.avatar-uploader-icon {
  @apply text-2xl text-gray-400 w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-full;
}

.el-button {
  @apply rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200;
}

.el-icon-edit {
  @apply text-blue-600 text-3xl;
}

.el-table {
  @apply rounded-lg shadow-sm;
}

.el-table :deep(.el-table__header) {
  @apply bg-gray-100 text-gray-700 font-semibold;
}

.el-table :deep(.el-table__row--striped) {
  @apply bg-gray-50;
}

.el-table :deep(.bg-blue-100) {
  @apply bg-blue-100;
}

.el-input :deep(.el-input__inner) {
  @apply rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50;
}

.el-select :deep(.el-input__inner) {
  @apply rounded-md;
}

.el-pagination :deep(.el-pager li) {
  @apply bg-white border border-gray-200 rounded-md shadow-sm;
}

.el-pagination :deep(.el-pager li.is-active) {
  @apply bg-blue-600 text-white border-blue-600;
}
</style>