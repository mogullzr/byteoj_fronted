import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import UserLayout from "@/layout/UserLayout.vue";
import { ACCESS_ENUM } from "@/access/access";
import checkAccess from "@/access/check";
import user from "@/store/user";
import { User } from "../../generated";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "首页",
    meta: {
      access: "0",
      title: "ByteOJ - 2509实验室创建无线奇迹",
    },
    redirect: "/home",
  },
  {
    path: "/home",
    name: "主页",
    meta: {
      access: "0",
      title: "ByteOJ - 2509实验室创建无限奇迹",
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
          title: "ByteOJ - 登录页面",
        },
      },
      {
        path: "space/:uuid",
        name: "用户信息中心",
        component: () => import("@/view/user/UserCenterView.vue"),
        meta: {
          access: "1",
          title: "ByteOJ - 用户卡片",
        },
      },
      {
        path: "",
        name: "用户中心",
        component: UserLayout,
        meta: {
          access: "1",
          title: "ByteOJ - 用户中心",
        },
      },
    ],
  },
  {
    path: "/posts",
    name: "帖子总页面",
    children: [
      {
        path: ":post_id",
        name: "帖子内容",
        meta: {
          access: "0",
          title: "文章 - ByteOJ",
        },
        component: () => import("@/view/posts/PostContent.vue"),
      },
      {
        path: ":problem_id/answer/add",
        name: "添加答疑帖子",
        meta: {
          access: "1",
          title: "发帖子 - ByteOJ",
        },
        component: () => import("@/view/posts/PostProblemAnswerAdd.vue"),
      },
      {
        path: ":problem_id/solution/add",
        name: "添加题解帖子",
        meta: {
          access: "1",
          title: "发帖子 - ByteOJ",
        },
        component: () => import("@/view/posts/PostProblemSolutionAdd.vue"),
      },
      {
        path: "",
        name: "帖子",
        meta: {
          access: "0",
          title: "ByteOJ - 2509实验室创建无限奇迹",
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
              title: "创建变成比赛 - ByteOJ",
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
              title: "创建变成比赛 - ByteOJ",
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
              title: "创建变成比赛 - ByteOJ",
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
              title: "恭喜O(∩_∩)O哈哈~创建竞赛成功 - ByteOJ",
            },
            component: () =>
              import(
                "@/view/competitions/Algorithm/CompetitionAdd/CompetitionAlgorithmSuccessUserAdd.vue"
              ),
          },
        ],
        meta: {
          access: "1",
          title: "创建变成比赛 - ByteOJ",
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
              title: "提交记录 - ByteOJ",
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
              title: "题目信息 - ByteOJ",
            },
            component: () =>
              import("@/view/problems/algorithm/ProblemAlgorithmView.vue"),
          },
          {
            path: "",
            name: "",
            meta: {
              access: "1",
              title: "ByteOJ - 竞赛",
            },
            component: () =>
              import("@/view/competitions/CompeletionContentView.vue"),
          },
        ],
        meta: {
          access: "0",
          title: "ByteOJ - 竞赛",
        },
      },
      {
        path: "rank",
        name: "ByteOJ巅峰Rating排行榜",
        meta: {
          access: "0",
          title: "ByteOJ - 巅峰排名",
        },
        component: () =>
          import("@/view/competitions/CompetitionRankListView.vue"),
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
    meta: {
      title: "ByteOJ - 竞赛",
    },
  },
  {
    path: "/study",
    name: "课程总页面",
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
      title: "ByteOJ - 课程",
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
    path: "/search/:key",
    name: "搜索",
    component: () => import("@/view/problems/ProblemView.vue"),
    meta: {
      access: "0",
    },
  },
  {
    path: "/together/search",
    name: "聚合搜索页面",
    component: () => import("@/view/components/search/TogetherSearchView.vue"),
    meta: {
      access: "0",
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
    meta: {
      title: "ByteOJ - 题库",
    },
  },
  {
    path: "/markdown",
    name: "markdown",
    component: () => import("@/view/problems/algorithm/AceEditorView.vue"),
  },
  // {
  //   path: "/webChat",
  //   name: "websocket",
  //   component: () => import("@/view/WebChat/WebChatView.vue"),
  // },
  {
    path: "/chatbot",
    name: "AI学习问答机器人",
    meta: {
      access: "1",
      title: "ByteOJ - DeepSeek问答机器人",
    },
    component: () => import("@/view/AI/ChatBoxView.vue"),
  },
  {
    path: "/special",
    name: "专栏",
    meta: {
      access: "0",
      title: "ByteOJ - 应用中心",
    },
    component: () => import("@/view/special/SpecialBoxView.vue"),
  },
  {
    path: "/test",
    name: "test",
    component: () => import("@/components/Card/DraggableStartView.vue"),
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
router.beforeEach(async (to, from, next) => {
  // 反调试逻辑
  (function () {
    "use strict";

    console.log("反调试逻辑已执行");

    // 检测开发者工具是否打开
    const checkDevTools = () => {
      const devtools = /./;
      devtools.toString = () => {
        console.log("开发者工具已打开");
        return "devtools";
      };
      console.log("%c", devtools);
    };

    // 检测代码执行时间
    const checkExecutionTime = () => {
      const startTime = performance.now();
      (function () {
        const endTime = performance.now();
        if (endTime - startTime > 100) {
          console.log("检测到调试行为");
        }
      })();
    };

    // 动态生成多条件 debugger 模式
    const generateDebugMode = () => {
      const conditions = [
        () => Math.random() > 0.5,
        () => new Date().getSeconds() % 2 === 0,
        () => navigator.userAgent.includes("Chrome"),
        () => window.innerWidth > 1024,
        () => localStorage.getItem("debug") === "true",
        () => performance.now() > 1000,
        () => document.querySelector("body") !== null,
        () => typeof window.console !== "undefined",
        () => window.location.href.includes("example.com"),
        () => Math.floor(Math.random() * 10) > 5,
      ];

      // 随机选择 3 到 5 个条件
      const selectedConditions = conditions
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 3);

      // 随机插入 debugger 的位置
      const debuggerPositions = [
        "console.log('Debugger condition 1');",
        "console.log('Debugger condition 2');",
        "console.log('Debugger condition 3');",
        "console.log('Debugger condition 4');",
        "console.log('Debugger condition 5');",
      ];

      // 随机选择 1 到 3 个位置
      const selectedPositions = debuggerPositions
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 1);

      // 构建代码
      let code = "";
      selectedConditions.forEach((condition, index) => {
        code += `if (${condition.toString()}) { ${
          selectedPositions[index % selectedPositions.length]
        } debugger; }\n`;
      });

      return code;
    };

    // 动态插入 debugger
    const dynamicDebugger = () => {
      try {
        const debugMode = generateDebugMode();
        new Function(debugMode)(); // 使用 new Function 代替 eval
      } catch (e) {
        console.error("Anti-debug error:", e);
      }
      const randomTime = Math.floor(Math.random() * 1001) + 3000;
      setInterval(() => {
        try {
          const debugMode = generateDebugMode();
          new Function(debugMode)(); // 使用 new Function 代替 eval
        } catch (e) {
          console.error("Anti-debug error:", e);
        }
      }, randomTime);
    };

    // 初始化
    checkDevTools();
    checkExecutionTime();
    dynamicDebugger();
  })();

  // 1. 设置页面标题
  document.title = to.meta.title ? `${to.meta.title}` : "ByteOJ";

  // 2. 初始化用户store
  const userStore = user();
  let loginUser: User = userStore.loginUser;

  try {
    // 3. 强制获取最新用户状态（包含错误处理）
    await userStore.getLoginUser();
    loginUser = userStore.loginUser;
  } catch (error) {
    // 获取用户信息失败时，按未登录处理
    loginUser = { ...loginUser, role: Number(ACCESS_ENUM.NOT_LOGIN) };
  }

  // 4. 清理competition相关存储
  try {
    const isLeavingCompetition =
      from.path.includes("/competition") && !to.path.includes("/competition");
    if (isLeavingCompetition) {
      const competitionId = from.params.competition_id;
      if (competitionId) {
        localStorage.removeItem(`competition-${competitionId}-status`);
      }
    }
  } catch (storageError) {}

  // 5. 获取目标路由所需权限
  const needAccess: string =
    (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN;

  // 6. 权限检查流程
  // 6.1 检查是否被封禁
  if (String(loginUser.role) === ACCESS_ENUM.BAN) {
    return next("/404"); // 使用return终止后续执行
  }

  // 6.2 检查需要登录的路由
  if (needAccess !== ACCESS_ENUM.NOT_LOGIN) {
    // 6.2.1 未登录情况
    if (!loginUser.role || String(loginUser.role) === ACCESS_ENUM.NOT_LOGIN) {
      return next({
        // 使用return终止后续执行
        path: "/user/login",
        query: { redirect: to.fullPath },
      });
    }

    // 6.2.2 权限不足情况
    if (!checkAccess(loginUser, needAccess)) {
      // 避免循环重定向，检查当前是否已经在home
      if (to.path !== "/home") {
        return next("/home"); // 使用return终止后续执行
      }
    }
  }

  next();
});

// 添加全局路由错误处理
router.onError((error) => {
  console.error("[路由错误]", error);
  // 可以根据不同的错误类型进行特殊处理
  if (error.message.includes("Failed to fetch dynamically imported module")) {
    // 处理组件加载失败
    window.location.href = `/404?from=${encodeURIComponent(
      window.location.pathname
    )}`;
  }
});

export default router;
