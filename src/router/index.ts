// import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
// import UserLayout from "@/layout/UserLayout.vue";
// import CompeletionView from "@/view/competitions/CompeletionView.vue";
// import CourceVIew from "@/view/cources/CourceView.vue";
// import DiscussionView from "@/view/DiscussionView.vue";
// import HomeView from "@/view/HomeView.vue";
// import UserLoginView from "@/view/user/UserLoginView.vue";
// import UserRegisterView from "@/view/user/UserRegisterView.vue";
// import CompeletionContentView from "@/view/competitions/CompeletionContentView.vue";
// import PostView from "@/view/posts/PostView.vue";
// import PostContent from "@/view/posts/PostContent.vue";
// import useUserStore from "@/store/user";
// import { ACCESS_ENUM } from "@/access/access";
// import checkAccess from "@/access/check";
// import ProblemView from "@/view/problems/ProblemView.vue";
// import ProblemMath408Content from "@/view/problems/math/ProblemMath408Content.vue";
// import ProblemAlgorithmView from "@/view/problems/algorithm/ProblemAlgorithmView.vue";
// import MarkdownEditorView from "@/view/problems/algorithm/AceEditorView.vue";
// import WebChatView from "@/view/WebChat/WebChatView.vue";
// import PostProblemAnswerAdd from "@/view/posts/PostProblemAnswerAdd.vue";
// import PostProblemSolutionAdd from "@/view/posts/PostProblemSolutionAdd.vue";
// import ProblemAlgorithmRecordsContent from "@/view/problems/algorithm/ProblemAlgorithmRecordsContent.vue";
// import CourceContentView from "@/view/cources/CourceContentView.vue";
// import LoginView from "@/view/user/LoginView.vue";
// import NotFoundView from "@/view/components/NotFoundView.vue";
// import CompetitionMath408UserAdd from "@/view/competitions/CompetitionMath408UserAdd.vue";
// import CompetitionAlgorithmInfoUserAdd from "@/view/competitions/Algorithm/CompetitionAdd/CompetitionAlgorithmInfoUserAdd.vue";
// import CompetitionAlgorithmSelectUserAdd from "@/view/competitions/Algorithm/CompetitionAdd/CompetitionAlgorithmSelectUserAdd.vue";
// import CompetitionAlgorithmProblemUserAdd from "@/view/competitions/Algorithm/CompetitionAdd/CompetitionAlgorithmProblemUserAdd.vue";
// import CompetitionAlgorithmSuccessUserAdd from "@/view/competitions/Algorithm/CompetitionAdd/CompetitionAlgorithmSuccessUserAdd.vue";
//
// const routes: Array<RouteRecordRaw> = [
//   {
//     path: "/",
//     name: "首页",
//     meta: {
//       access: "0",
//     },
//     redirect: "/home",
//   },
//   {
//     path: "/home",
//     name: "主页",
//     meta: {
//       access: "0",
//     },
//     component: HomeView,
//   },
//   {
//     path: "/user",
//     name: "用户",
//     children: [
//       {
//         path: "login",
//         name: "用户登录",
//         component: LoginView,
//         meta: {
//           access: "0",
//         },
//       },
//       {
//         path: "register",
//         name: "用户注册",
//         component: UserRegisterView,
//         meta: {
//           access: "0",
//         },
//       },
//       {
//         path: "",
//         name: "用户中心",
//         component: UserLayout,
//         meta: {
//           access: "1",
//         },
//       },
//     ],
//   },
//   {
//     path: "/posts",
//     name: "",
//     children: [
//       {
//         path: ":post_id",
//         name: "帖子内容",
//         meta: {
//           access: "0",
//         },
//         component: PostContent,
//       },
//       {
//         path: ":problem_id/answer/add",
//         name: "添加答疑帖子",
//         meta: {
//           access: "1",
//         },
//         component: PostProblemAnswerAdd,
//       },
//       {
//         path: ":problem_id/solution/add",
//         name: "添加题解帖子",
//         meta: {
//           access: "1",
//         },
//         component: PostProblemSolutionAdd,
//       },
//       {
//         path: "",
//         name: "帖子",
//         meta: {
//           access: "0",
//         },
//         component: PostView,
//       },
//     ],
//   },
//   {
//     path: "/competition/user/add",
//     name: "竞赛信息",
//     children: [
//       {
//         path: "1",
//         name: "用户创建编程比赛",
//         children: [
//           {
//             path: "info",
//             name: "设置比赛基本信息",
//             meta: {
//               access: "1",
//             },
//             component: CompetitionAlgorithmInfoUserAdd,
//           },
//           {
//             path: "select",
//             name: "设置比赛题目列表",
//             meta: {
//               access: "1",
//             },
//             component: CompetitionAlgorithmSelectUserAdd,
//           },
//           {
//             path: "show",
//             name: "修改题目名称信息还有序号信息",
//             meta: {
//               access: "1",
//             },
//             component: CompetitionAlgorithmProblemUserAdd,
//           },
//           {
//             path: "success",
//             name: "创界比赛次成功界面",
//             meta: {
//               access: "1",
//             },
//             component: CompetitionAlgorithmSuccessUserAdd,
//           },
//         ],
//         meta: {
//           access: "1",
//         },
//       },
//       {
//         path: "2",
//         name: "用户创建数学比赛",
//         meta: {
//           access: "1",
//         },
//         component: CompetitionMath408UserAdd,
//       },
//       {
//         path: "3",
//         name: "用户创建408比赛",
//         meta: {
//           access: "1",
//         },
//         component: CompetitionMath408UserAdd,
//       },
//     ],
//     meta: {
//       access: "1",
//     },
//   },
//   {
//     path: "/competition",
//     name: "竞赛",
//     children: [
//       {
//         path: ":competition_id",
//         name: "竞赛编号",
//         children: [
//           {
//             path: "records/:record_id",
//             name: "提交记录",
//             meta: {
//               access: "1",
//             },
//             component: ProblemAlgorithmRecordsContent,
//           },
//           {
//             path: "problem/:problem_order",
//             name: "题目信息",
//             meta: {
//               access: "1",
//             },
//             component: ProblemAlgorithmView,
//           },
//           {
//             path: "",
//             name: "",
//             meta: {
//               access: "1",
//             },
//             component: CompeletionContentView,
//           },
//         ],
//         meta: {
//           access: "0",
//         },
//       },
//       {
//         path: "",
//         name: "比赛列表",
//         meta: {
//           access: "0",
//         },
//         component: CompeletionView,
//       },
//     ],
//   },
//   {
//     path: "/study",
//     children: [
//       {
//         path: ":plan_id",
//         name: "学习计划规划",
//         component: CourceContentView,
//       },
//       {
//         path: "",
//         name: "学习计划主页",
//         component: CourceVIew,
//       },
//     ],
//     meta: {
//       access: "1",
//     },
//   },
//   {
//     path: "/discussion",
//     name: "讨论",
//     component: DiscussionView,
//     meta: {
//       access: "1",
//     },
//   },
//   {
//     path: "/problems",
//     name: "题库",
//     children: [
//       {
//         path: "algorithm/:problem_id",
//         name: "algorithm题目展示",
//         meta: {
//           access: "0",
//         },
//         component: ProblemAlgorithmView,
//       },
//       {
//         path: "math408/:problem_id",
//         name: "math和408题目展示",
//         meta: {
//           access: "0",
//         },
//         component: ProblemMath408Content,
//       },
//       {
//         path: ":problem_id/records/:submission_id",
//         name: "提交记录具体情况展示页面",
//         meta: {
//           access: "1",
//         },
//         component: ProblemAlgorithmRecordsContent,
//       },
//       {
//         path: "",
//         name: "题库展示页面",
//         meta: {
//           access: "0",
//         },
//         component: ProblemView,
//       },
//     ],
//   },
//   {
//     path: "/markdown",
//     name: "1",
//     component: MarkdownEditorView,
//   },
//   {
//     path: "/webChat",
//     name: "websocket",
//     component: WebChatView,
//   },
//   {
//     path: "/ip/lock",
//     name: "IP锁定页面",
//     component: NotFoundView,
//   },
//   {
//     path: "/404",
//     name: "404",
//     component: NotFoundView,
//   },
//   {
//     path: "/:catchAll(.*)",
//     redirect: "/404",
//   },
// ];
//
// const router = createRouter({
//   history: createWebHistory(process.env.BASE_URL),
//   routes,
// });
//
// router.beforeEach(async (to, from, next) => {
//   // 判别是否离开了competition路径，离开则删除competition的localStorage
//   const from_path = from.path.toString().indexOf("competition");
//   const to_path = to.path.toString().indexOf("competition");
//
//   if (
//     from_path != -1 &&
//     from.path.toString().split("/").length >= 3 &&
//     (to_path == -1 || to.path.toString().split("/").length == 2)
//   ) {
//     localStorage.removeItem(
//       "competition-" + from.path.toString().split("/")[2] + "-status"
//     );
//   }
//   window.document.title =
//     to.meta.title === undefined ? "ByteOJ" : to.meta.title + " - ByteOJ";
//   const userStore = useUserStore();
//   let loginUser = userStore.loginUser;
//   await userStore.getUserLocationInfo();
//
//   // 如果之前没有登录，自动登录
//   if (String(loginUser.role) == "0") {
//     // 加await是为了获取用户登录态之后再执行代码
//
//     await userStore.getLoginUser();
//     loginUser = userStore.loginUser;
//   }
//   const needAccess: string =
//     (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN;
//   // console.log(needAccess, loginUser.role);
//   // 要跳转的页面需要登录
//   if (needAccess != ACCESS_ENUM.NOT_LOGIN) {
//     // 如果没有登录，跳转到登录页面
//     if (!loginUser.role || String(loginUser.role) === ACCESS_ENUM.NOT_LOGIN) {
//       next("/user/login");
//     }
//     // 如果已经登录了，但是权限不足，那么跳转到无权限的页面
//     else if (!checkAccess(loginUser, needAccess)) {
//       next("/home");
//     }
//     // 如果已经登录并且有权限，继续导航
//     else {
//       next();
//     }
//   } else if (String(loginUser.role) !== ACCESS_ENUM.BAN) {
//     next();
//   } else {
//     next("/404");
//   }
// });
// export default router;
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import UserLayout from "@/layout/UserLayout.vue";
import { ACCESS_ENUM } from "@/access/access";
import checkAccess from "@/access/check";
import user from "@/store/user";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "首页",
    meta: {
      access: "0",
    },
    redirect: "/home",
  },
  {
    path: "/home",
    name: "主页",
    meta: {
      access: "0",
    },
    component: () => import("@/view/HomeView.vue"),
  },
  {
    path: "/user",
    name: "用户",
    children: [
      {
        path: "login",
        name: "用户登录",
        component: () => import("@/view/user/LoginView.vue"),
        meta: {
          access: "0",
        },
      },
      {
        path: "register",
        name: "用户注册",
        component: () => import("@/view/user/UserRegisterView.vue"),
        meta: {
          access: "0",
        },
      },
      {
        path: "",
        name: "用户中心",
        component: UserLayout,
        meta: {
          access: "1",
        },
      },
    ],
  },
  {
    path: "/posts",
    name: "",
    children: [
      {
        path: ":post_id",
        name: "帖子内容",
        meta: {
          access: "0",
        },
        component: () => import("@/view/posts/PostContent.vue"),
      },
      {
        path: ":problem_id/answer/add",
        name: "添加答疑帖子",
        meta: {
          access: "1",
        },
        component: () => import("@/view/posts/PostProblemAnswerAdd.vue"),
      },
      {
        path: ":problem_id/solution/add",
        name: "添加题解帖子",
        meta: {
          access: "1",
        },
        component: () => import("@/view/posts/PostProblemSolutionAdd.vue"),
      },
      {
        path: "",
        name: "帖子",
        meta: {
          access: "0",
        },
        component: () => import("@/view/posts/PostView.vue"),
      },
    ],
  },
  {
    path: "/competition/user/add",
    name: "竞赛信息",
    children: [
      {
        path: "1",
        name: "用户创建编程比赛",
        children: [
          {
            path: "info",
            name: "设置比赛基本信息",
            meta: {
              access: "1",
            },
            component: () =>
              import(
                "@/view/competitions/Algorithm/CompetitionAdd/CompetitionAlgorithmInfoUserAdd.vue"
              ),
          },
          {
            path: "select",
            name: "设置比赛题目列表",
            meta: {
              access: "1",
            },
            component: () =>
              import(
                "@/view/competitions/Algorithm/CompetitionAdd/CompetitionAlgorithmSelectUserAdd.vue"
              ),
          },
          {
            path: "show",
            name: "修改题目名称信息还有序号信息",
            meta: {
              access: "1",
            },
            component: () =>
              import(
                "@/view/competitions/Algorithm/CompetitionAdd/CompetitionAlgorithmProblemUserAdd.vue"
              ),
          },
          {
            path: "success",
            name: "创界比赛次成功界面",
            meta: {
              access: "1",
            },
            component: () =>
              import(
                "@/view/competitions/Algorithm/CompetitionAdd/CompetitionAlgorithmSuccessUserAdd.vue"
              ),
          },
        ],
        meta: {
          access: "1",
        },
      },
      {
        path: "2",
        name: "用户创建数学比赛",
        meta: {
          access: "1",
        },
        component: () =>
          import("@/view/competitions/CompetitionMath408UserAdd.vue"),
      },
      {
        path: "3",
        name: "用户创建408比赛",
        meta: {
          access: "1",
        },
        component: () =>
          import("@/view/competitions/CompetitionMath408UserAdd.vue"),
      },
    ],
    meta: {
      access: "1",
    },
  },
  {
    path: "/competition",
    name: "竞赛",
    children: [
      {
        path: ":competition_id",
        name: "竞赛编号",
        children: [
          {
            path: "records/:record_id",
            name: "提交记录",
            meta: {
              access: "1",
            },
            component: () =>
              import(
                "@/view/problems/algorithm/ProblemAlgorithmRecordsContent.vue"
              ),
          },
          {
            path: "problem/:problem_order",
            name: "题目信息",
            meta: {
              access: "1",
            },
            component: () =>
              import("@/view/problems/algorithm/ProblemAlgorithmView.vue"),
          },
          {
            path: "",
            name: "",
            meta: {
              access: "1",
            },
            component: () =>
              import("@/view/competitions/CompeletionContentView.vue"),
          },
        ],
        meta: {
          access: "0",
        },
      },
      {
        path: "",
        name: "比赛列表",
        meta: {
          access: "0",
        },
        component: () => import("@/view/competitions/CompeletionView.vue"),
      },
    ],
  },
  {
    path: "/study",
    children: [
      {
        path: ":plan_id",
        name: "学习计划规划",
        component: () => import("@/view/cources/CourceContentView.vue"),
      },
      {
        path: "",
        name: "学习计划主页",
        component: () => import("@/view/cources/CourceView.vue"),
      },
    ],
    meta: {
      access: "1",
    },
  },
  {
    path: "/discussion",
    name: "讨论",
    component: () => import("@/view/DiscussionView.vue"),
    meta: {
      access: "1",
    },
  },
  {
    path: "/problems",
    name: "题库",
    children: [
      {
        path: "algorithm/:problem_id",
        name: "algorithm题目展示",
        meta: {
          access: "0",
        },
        component: () =>
          import("@/view/problems/algorithm/ProblemAlgorithmView.vue"),
      },
      {
        path: "math408/:problem_id",
        name: "math和408题目展示",
        meta: {
          access: "0",
        },
        component: () =>
          import("@/view/problems/math/ProblemMath408Content.vue"),
      },
      {
        path: ":problem_id/records/:submission_id",
        name: "提交记录具体情况展示页面",
        meta: {
          access: "1",
        },
        component: () =>
          import(
            "@/view/problems/algorithm/ProblemAlgorithmRecordsContent.vue"
          ),
      },
      {
        path: "",
        name: "题库展示页面",
        meta: {
          access: "0",
        },
        component: () => import("@/view/problems/ProblemView.vue"),
      },
    ],
  },
  {
    path: "/markdown",
    name: "1",
    component: () => import("@/view/problems/algorithm/AceEditorView.vue"),
  },
  {
    path: "/webChat",
    name: "websocket",
    component: () => import("@/view/WebChat/WebChatView.vue"),
  },
  {
    path: "/ip/lock",
    name: "IP锁定页面",
    component: () => import("@/view/components/NotFoundView.vue"),
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/view/components/NotFoundView.vue"),
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// router.beforeEach(async (to, from, next) => {
//   // 判别是否离开了competition路径，离开则删除competition的localStorage
//   const from_path = from.path.toString().indexOf("competition");
//   const to_path = to.path.toString().indexOf("competition");
//
//   if (
//     from_path != -1 &&
//     from.path.toString().split("/").length >= 3 &&
//     (to_path == -1 || to.path.toString().split("/").length == 2)
//   ) {
//     localStorage.removeItem(
//       "competition-" + from.path.toString().split("/")[2] + "-status"
//     );
//   }
//   window.document.title =
//     to.meta.title === undefined ? "ByteOJ" : to.meta.title + " - ByteOJ";
//   const userStore = user();
//   let loginUser = userStore.loginUser;
//   await userStore.getUserLocationInfo();
//
//   // 如果之前没有登录，自动登录
//   if (String(loginUser.role) == "0") {
//     // 加await是为了获取用户登录态之后再执行代码
//
//     await userStore.getLoginUser();
//     loginUser = userStore.loginUser;
//   }
//   const needAccess: string =
//     (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN;
//   // console.log(needAccess, loginUser.role);
//   // 要跳转的页面需要登录
//   if (needAccess != ACCESS_ENUM.NOT_LOGIN) {
//     // 如果没有登录，跳转到登录页面
//     if (!loginUser.role || String(loginUser.role) === ACCESS_ENUM.NOT_LOGIN) {
//       next("/user/login");
//     }
//     // 如果已经登录了，但是权限不足，那么跳转到无权限的页面
//     else if (!checkAccess(loginUser, needAccess)) {
//       next("/home");
//     }
//     // 如果已经登录并且有权限，继续导航
//     else {
//       next();
//     }
//   } else if (String(loginUser.role) !== ACCESS_ENUM.BAN) {
//     next();
//   } else {
//     next("/404");
//   }
// });

export default router;
