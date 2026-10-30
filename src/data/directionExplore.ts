import { Direction, ExperienceTask } from "@/types/directionExplore";

export const directions: Direction[] = [
  {
    id: "frontend",
    name: "前端开发",
    summary: "把页面和交互做出来，修改后可以马上看到变化。",
    estimatedMinutes: 5,
    status: "available",
    taskId: "frontend-card-preview",
  },
  {
    id: "algorithm",
    name: "算法编程",
    summary: "把问题拆成清楚的规则，再一步步找到答案。",
    estimatedMinutes: 5,
    status: "available",
  },
  {
    id: "data-analysis",
    name: "数据分析",
    summary: "从一组数据里找变化、差异和可能的原因。",
    estimatedMinutes: 5,
    status: "available",
  },
  {
    id: "software-testing",
    name: "软件测试",
    summary: "换不同的使用方式，检查功能是否符合预期。",
    estimatedMinutes: 5,
    status: "available",
  },
  {
    id: "backend",
    name: "后端开发",
    summary: "了解页面背后的请求、处理和数据返回。",
    estimatedMinutes: 10,
    status: "planned",
  },
  {
    id: "database",
    name: "数据库",
    summary: "体验信息如何被整理、查询和更新。",
    estimatedMinutes: 10,
    status: "planned",
  },
  {
    id: "security",
    name: "网络安全",
    summary: "从安全意识和静态案例开始了解防护思路。",
    estimatedMinutes: 10,
    status: "planned",
  },
  {
    id: "embedded",
    name: "嵌入式开发",
    summary: "了解软件如何与设备和传感器协作。",
    estimatedMinutes: 10,
    status: "planned",
  },
  {
    id: "mobile",
    name: "移动端开发",
    summary: "了解手机应用界面和交互的实现方式。",
    estimatedMinutes: 10,
    status: "planned",
  },
  {
    id: "game",
    name: "游戏开发",
    summary: "从规则、反馈和画面变化认识游戏开发。",
    estimatedMinutes: 10,
    status: "planned",
  },
  {
    id: "cloud-devops",
    name: "云计算与 DevOps",
    summary: "了解应用如何部署、运行并保持稳定。",
    estimatedMinutes: 10,
    status: "planned",
  },
];

/** A single small sample used to validate the reusable experience container. */
export const experienceTasks: ExperienceTask[] = [
  {
    id: "frontend-card-preview",
    directionId: "frontend",
    title: "调整一张个人介绍卡片",
    estimatedMinutes: 5,
    steps: [
      {
        id: "pick-color",
        title: "先选一个卡片颜色",
        content: "选择你喜欢的卡片底色，看看预览会怎样变化。",
        interactionType: "choice",
        options: [
          { id: "blue", label: "清爽蓝" },
          { id: "green", label: "薄荷绿" },
          { id: "peach", label: "暖橙色" },
        ],
        errorHint: "先选一个颜色，再继续体验。",
        completionFeedback: "颜色已应用到预览卡片。",
      },
      {
        id: "edit-title",
        title: "给卡片换一个标题",
        content: "试着写一句你想放在介绍卡片上的话，右侧预览会同步更新。",
        interactionType: "code-gap",
        expectedAnswer: "",
        acceptAnyNonEmpty: true,
        errorHint: "写几个字作为卡片标题就可以继续。",
        completionFeedback: "标题已经更新，页面内容也可以由你来决定。",
      },
      {
        id: "pick-feedback",
        title: "设置按钮点击后的反馈",
        content: "用户点击卡片按钮时，哪种反馈最清楚地告诉他操作成功了？",
        interactionType: "choice",
        options: [
          { id: "nothing", label: "按钮没有变化" },
          { id: "message", label: "显示“已联系我”提示" },
          { id: "reload", label: "整页重新加载" },
        ],
        correctOptionId: "message",
        errorHint: "试着选择一个能立即告诉用户操作结果的反馈。你可以重新选择。",
        completionFeedback: "对，清楚的即时反馈能让用户知道点击已经生效。",
      },
    ],
    completionFeedback:
      "你刚刚体验了页面样式和交互反馈的调整。前端工作常常能很快看到页面变化；这只是一个小体验，不代表已经掌握了这个方向。",
    nextStep:
      "如果你愿意继续，可以再试着调整标题文字，或体验算法、数据分析和软件测试方向。",
    selfAssessmentOptions: ["愿意继续尝试", "还可以，再看看", "暂时不确定"],
  },
];

export function getTask(
  taskId: string | undefined
): ExperienceTask | undefined {
  return experienceTasks.find((task) => task.id === taskId);
}

export function getDirection(
  directionId: string | undefined
): Direction | undefined {
  return directions.find((direction) => direction.id === directionId);
}
