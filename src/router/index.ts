import {
  createRouter,
  createWebHistory,
  NavigationGuardNext,
  RouteLocationNormalizedGeneric,
  RouteLocationNormalizedLoadedGeneric,
  RouteRecordRaw,
} from "vue-router";
import HomeView from "../views/HomeView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import UserView from "../views/user/UserView.vue";
import AdminView from "../views/user/AdminView.vue";
import UserLoginView from "../views/user/UserLoginView.vue";
import AlgorithmAddView from "../views/problems/algorithm/AlgorithmAddView.vue";
import Math408AddView from "../views/problems/math/Math408AddView.vue";
import Math408View from "../views/problems/math/Math408View.vue";
import AlgorithmView from "../views/problems/algorithm/AlgorithmView.vue";
import AlgorithmAddTestCaseView from "../views/problems/algorithm/AlgorithmAddTestCaseView.vue";
import AlgorithmModifyView from "../views/problems/algorithm/AlgorithmModifyView.vue";
import CourseInfoView from "../views/course/CourseInfoView.vue";
import CourseProblemsSetView from "../views/course/CourseProblemsSetView.vue";
import CourseUserControlView from "../views/course/CourseUserControlView.vue";
import UseStore from "../store/store.ts";
import { ACCESS_ENUM } from "../access/access.ts";
import checkAccess from "../access/check.ts";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "主页面",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "管理主页面",
    meta: {
      access: "2",
      show: true,
    },
    component: HomeView,
  },
  {
    path: "/login",
    name: "登录页面",
    meta: {
      access: "0",
      show: false,
    },
    component: UserLoginView,
  },
  {
    path: "/user",
    name: "用户方面",
    children: [
      {
        path: "list",
        name: "用户列表信息",
        component: UserView,
      },
    ],
    meta: {
      access: "2",
      show: true,
    },
  },
  {
    path: "/admin",
    name: "管理员方面",
    children: [
      {
        path: "list",
        name: "list",
        meta: {
          access: "2",
          show: true,
        },
        component: AdminView,
      },
    ],
  },
  {
    path: "/problem",
    name: "题目管理",
    children: [
      {
        path: "algorithm",
        name: "算法试题部分",
        children: [
          {
            path: "add",
            name: "创建新算法试题",
            meta: {
              access: "2",
              show: true,
            },
            component: AlgorithmAddView,
          },
          {
            path: "list",
            name: "算法试题管理",
            meta: {
              access: "2",
              show: true,
            },
            component: AlgorithmView,
          },
          {
            path: "list/add/:problem_id",
            name: "添加测试数据",
            meta: {
              access: "2",
              show: true,
            },
            component: AlgorithmAddTestCaseView,
          },
          {
            path: "modify/:problem_id",
            name: "算法试题修改",
            meta: {
              access: "2",
              show: true,
            },
            component: AlgorithmModifyView,
          },
        ],
      },
      {
        path: "math408",
        name: "数学408试题部分",
        children: [
          {
            path: "add",
            name: "创建数学408试题",
            meta: {
              access: "2",
              show: true,
            },
            component: Math408AddView,
          },
          {
            path: "list",
            name: "数学408试题管理",
            meta: {
              access: "2",
              show: true,
            },
            component: Math408View,
          },
        ],
      },
    ],
  },
  {
    path: "/course",
    name: "课程管理",
    children: [
      {
        path: "info",
        name: "课程管理页面",
        meta: {
          access: "2",
          show: true,
        },
        component: CourseInfoView,
      },
      {
        path: "simplified/:courseId",
        name: "课程专栏管理页面",
        meta: {
          access: "2",
          show: true,
        },
        component: CourseProblemsSetView,
      },
      {
        path: "add/:courseId",
        name: "添加用户界面",
        meta: {
          access: "2",
          show: true,
        },
        component: CourseUserControlView,
      },
    ],
  },
  {
    path: "/404",
    name: "404",
    meta: {
      access: "0",
      show: false,
    },
    component: NotFoundView,
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHistory(""),
  routes,
});

router.beforeEach(
  async (
    to: RouteLocationNormalizedGeneric,
    from: RouteLocationNormalizedLoadedGeneric,
    next: NavigationGuardNext,
  ) => {
    const userStore = UseStore();
    let loginUser = userStore.loginUser;
    console.log(from);
    // 如果之前没有登录，自动登录
    if (String(loginUser.role) == "0") {
      // 加await是为了获取用户登录态之后再执行代码
      await userStore.getLoginUser();
      loginUser = userStore.loginUser;
    }
    const needAccess: string =
      (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN;
    console.log(needAccess, loginUser.role, 123123);

    // 要跳转的页面需要登录
    if (needAccess != ACCESS_ENUM.NOT_LOGIN) {
      // 如果没有登录，跳转到登录页面
      if (!loginUser.role || String(loginUser.role) === ACCESS_ENUM.NOT_LOGIN) {
        userStore.isShow = false;
        next("/login");
      }
      // 如果已经登录了，但是权限不足，那么跳转到无权限的页面
      else if (!checkAccess(loginUser, needAccess)) {
        userStore.isShow = false;
        next("/login");
      }
      // 如果已经登录并且有权限，继续导航
      else {
        next();
      }
    } else {
      userStore.isShow = Boolean(to.meta.show);
      next();
    }
  },
);

export default router;
