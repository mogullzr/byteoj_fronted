import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import UseStore from "../store/store.ts";
import { ACCESS_ENUM } from "../access/access.ts";
import checkAccess from "../access/check.ts";
import NotFoundView from "../views/NotFoundView.vue";
import UserView from "../views/user/UserView.vue";
import AdminView from "../views/user/AdminView.vue";
import UserLoginView from "../views/user/UserLoginView.vue";
import AlgorithmAddView from "../views/problems/algorithm/AlgorithmAddView.vue";
import AlgorithmView from "../views/problems/algorithm/AlgorithmView.vue";
import Math408AddView from "../views/problems/math/Math408AddView.vue";
import Math408View from "../views/problems/math/Math408View.vue";
import AlgorithmTestCaseAddView from "../views/problems/algorithm/AlgorithmTestCaseAddView.vue";
import CompetitionView from "../views/competition/CompetitionView.vue";
import CompetitionEditView from "../views/competition/CompetitionEditView.vue";
import AdminAuthManageView from "../views/user/AdminAuthManageView.vue";
import LogView from "../views/log/index.vue";
import CourseView from "../views/course/CourseView.vue";
import CourseEdit from "../views/course/CourseEdit.vue";
import CourseCreate from "../views/course/CourseCreate.vue";
import PaymentView from "../views/payment/PaymentView.vue";

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
      {
        path: "auth",
        name: "角色管理页面",
        meta: {
          access: "2",
          show: true,
        },
        component: AdminAuthManageView,
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
            path: "testcase/:problem_id",
            name: "测试样例编辑",
            meta: {
              access: "2",
              show: true,
            },
            component: AlgorithmTestCaseAddView,
          },
          {
            path: ":problem_id",
            name: "算法试题修改",
            meta: {
              access: "2",
              show: true,
            },
            component: AlgorithmAddView,
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
    path: "/competition/list",
    name: "竞赛页面",
    meta: {
      access: "2",
      show: false,
    },
    component: CompetitionView,
  },
  {
    path: "/competition/edit",
    name: "竞赛编辑页面",
    meta: {
      access: "2",
      show: false,
    },
    component: CompetitionEditView,
  },
  {
    path: "/course",
    name: "课程页面",
    meta: {
      access: "2",
      show: false
    },
    children: [
      {
        path: "create",
        name: "创建课程页面",
        meta: {
          access: "2",
          show: true,
        },
        component: CourseCreate
      },
      {
        path: "edit",
        name: "课程题目设定页面",
        meta: {
          access: "2",
          show: true,
        },
        props: (route) => ({ courseId: route.query.course_id }),
        component: CourseEdit
      },
      {
        path: "",
        name: "课程信息",
        meta: {
          access: "2",
          show: true,
        },
        component: CourseView,
      },
    ]
  },
  {
    path: "/log",
    name: "日志管理",
    meta: {
      access: "2",
      show: true,
    },
    component: LogView,
  },
  {
    path: "/payment",
    name: "支付管理",
    meta: {
      access: "2",
      show: true,
    },
    component: PaymentView,
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
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const userStore = UseStore();
  let loginUser = userStore.loginUser;

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
    userStore.isShow = to.meta.show;
    next();
  }
});

export default router;
