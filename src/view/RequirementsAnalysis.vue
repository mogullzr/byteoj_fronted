<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white rounded-2xl shadow-lg">
    <!-- Header Section -->
    <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-200">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">ByteOJ 需求分析</h1>
        <p class="text-sm text-gray-500 mt-2">
          <strong>更新时间:</strong> 2025年8月6日 | <strong>模块总数:</strong> {{ modules.length }} | <strong>版本:</strong> v1.0.0
        </p>
      </div>
      <div class="flex space-x-2 mt-4 sm:mt-0">
        <button
            v-for="view in ['all', 'completed', 'pending']"
            :key="view"
            @click="toggleView(view)"
            :class="{
            'bg-blue-600 text-white': currentView === view,
            'bg-gray-100 text-gray-700': currentView !== view
          }"
            class="px-4 py-2 rounded-md border border-gray-300 hover:bg-blue-500 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {{ view === 'all' ? '全部' : view === 'completed' ? '已完成' : '待完成' }}
        </button>
      </div>
    </header>

    <!-- Core Requirements Highlight -->
    <section class="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
      <h2 class="text-2xl font-semibold text-blue-800 mb-4">📌 ByteOJ 核心需求分析</h2>
      <p class="text-gray-700">
        ByteOJ 是一个在线评测平台，旨在为编程竞赛和教育提供高效、稳定的代码评测服务。支持多种编程语言，具备高并发处理能力和用户友好的界面，致力于提升用户体验和开发效率。
      </p>
    </section>

    <!-- Modules Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
          v-for="(module, index) in filteredModules"
          :key="index"
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
      >
        <div class="mb-4">
          <h2 class="text-xl font-semibold text-gray-800">{{ module.title }}</h2>
          <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
                class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                :style="{ width: `${calculateProgress(module.requirements)}%` }"
            ></div>
          </div>
          <span class="text-sm text-gray-600 mt-1 block">{{ calculateProgress(module.requirements) }}% 完成</span>
        </div>
        <div class="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          <div
              v-for="(req, reqIndex) in filteredRequirements(module.requirements)"
              :key="reqIndex"
              class="flex items-start py-3 border-b border-gray-100 last:border-b-0"
              :class="{ 'opacity-75': req.completed }"
          >
            <div class="mr-3 flex items-center">
              <span
                  v-if="req.completed"
                  class="w-5 h-5 flex items-center justify-center bg-green-500 text-white rounded-full text-xs"
              >
                ✓
              </span>
              <span
                  v-else
                  class="w-5 h-5 flex items-center justify-center border-2 border-orange-500 text-orange-500 rounded-full text-xs"
              >
                ○
              </span>
            </div>
            <div class="flex-1">
              <p class="text-gray-800 text-sm">{{ req.content }}</p>
              <span v-if="req.note" class="text-xs text-gray-500 italic">{{ req.note }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- 状态管理 ---
const currentView = ref('all'); // 当前视图：all, completed, pending

// --- 数据定义 ---
const modules = ref([
  {
    title: '一、帖子模块',
    requirements: [
      { content: '普通用户可以在网页进行每10条帖子信息的懒加载模式查看', completed: true },
      { content: '普通用户可以在登录情况下进行评论 + 针对某人进行评论操作', completed: true },
      { content: '普通用户可以删除并修改自己的任意评论和帖子信息', completed: true },
      { content: '普通用户可以查看自己发布过的帖子', completed: false },
      { content: '管理员用户可以随意删除任何帖子 + 评论 + 帖子置顶功能', completed: false },
      { content: 'ByteOJ首页内容介绍（纯前端，网站开发内容介绍）', completed: true },
    ],
  },
  {
    title: '二、用户模块',
    requirements: [
      { content: '普通用户的登录进行QQ邮箱注册', completed: true },
      { content: '图案识别逻辑', completed: false, note: '（感觉有点麻烦）' },
      { content: '注册完毕之后，发短信至Mogullzr的信息当中', completed: false, note: '（核心仅仅为了了解这个服务）' },
      { content: '普通用户登录', completed: true },
      { content: '普通用户忘记密码', completed: true },
      { content: '普通用户个人中心各个信息展示', completed: true },
      { content: '其他用户点击某用户头像显示用户信息', completed: true },
    ],
  },
  {
    title: '三、图片模块',
    requirements: [
      { content: '用户可上传头像图片并且设置自己的头像', completed: true },
      { content: '用户可上传背景图片并且设置用户图片，管理员上传图片全体用户均可见', completed: true },
      { content: '用户可以删除自己的图片', completed: true },
      { content: '用户可以在编写题解的过程中上传图片到图床当中', completed: false },
    ],
  },
  {
    title: '四、题目模块',
    requirements: [
      { content: '分页查询题目的标题、题目ID、标签、难度、通过概率等', completed: true, note: '（每页50个题目）' },
      { content: '通过单标签搜索包含标签的题目信息', completed: true },
      { content: '通过多标签搜索包含标签的题目信息', completed: true },
      { content: '通过难度搜素对应难度的题目信息', completed: true },
      { content: '通过搜索框模糊查询题目标题、算法标签相匹配的题目信息并加红显示', completed: true },
      { content: '常见错误代码练习模块设计', completed: false, note: '（主要针对于用户经常会犯的代码进行更正性练习）' },
      { content: '个性化题库表单实现设计', completed: false, note: '（每个用户可以自定义属于自己的题目表单）' },
      { content: '开发每日扑克牌式抽题环节', completed: true, note: '（抽中完，写完之后可以.........(思考)，暂时留个大漏洞给大家玩玩）' },
    ],
  },
  {
    title: '五、竞赛模块',
    requirements: [
      {
        content: '管理员创建竞赛功能',
        completed: false,
        note: '（管理员则允许在管理员界面创建还没有公布的题目，同时管理员还可以选择开启摄像头监控功能，实时查询当前的用户的作弊概率）',
      },
      { content: '管理员搜分页查某竞赛所有Record信息', completed: true },
      { content: '管理员进行竞赛排行榜导出功能 + 脚本自动化检测用户是否在其中功能实现', completed: true },
      { content: '用户分页搜索竞赛的标题 + 创建用户 + 具体时间 + 参加人数等展示', completed: true },
      { content: '用户返回上一道编写题目的题目地址记录', completed: true, note: '（一般题库里的题目 or 竞赛题目均可）' },
      { content: '用户查看具体竞赛的描述一系列信息展示', completed: true },
      {
        content: '用户在竞赛过程中如竞赛前题目不可见、不可提交，提交记录非当前用户不可见等一系列逻辑不错误！！！',
        completed: true,
        note: '（Bug已完整修复）',
      },
      {
        content: '用户可多条件组合查找前10页的提交记录',
        completed: true,
        note: '（按照 用户名查找/题号查找/运行结果查找/运行时间排序/内存大小排序/代码长度排序/使用语言查找/提交时间排序等8种查找方式，提高用户体验）',
      },
      { content: '用户查询竞赛开始后的题目列表信息和具体题目信息', completed: true },
      {
        content: '用户/管理员查看竞赛某Record的具体信息',
        completed: true,
        note: '（管理员允许在任何时间查看；在竞赛当中，用户仅仅允许自己的Record信息，但在竞赛之后允许查看所有用户的Record信息）',
      },
      {
        content: '用户分页查询竞赛的排名信息',
        completed: true,
        note: '（包括题目通过次数 + 某用户名次 + 某用户通过题目数量 + 某用户通过某题目的第一次AC记录信息 + 某用户未通过题目的尝试次数信息等）',
      },
      { content: '在竞赛时间一过直接进行封榜功能，用户提交不再记录到排名表当中', completed: true },
      {
        content: '天梯分算法计算服务开通成功，使用的是类似于Codeforces的背后算分机制来进行的',
        completed: true,
        note: '（由于人比较少，因此分数变化可能还是蛮大的）',
      },
      { content: '管理员进行代码查重功能', completed: true, note: '（用于防止两个人使用相似度极高的代码进行编写，使用）' },
      {
        content: '管理员进行AI代码检查功能',
        completed: false,
        note: '（用于检测某用户的提交代码记录是否为AI编写，这个功能即使做出来，准确性还是有很大出入的，核心还是代码查重 + 监控来防作弊）',
      },
      { content: '用户可以查看自己的竞赛曲线', completed: true, note: '（可参考许多知名OJ竞赛的样式）' },
      { content: '用户可以查看自己参加过的竞赛已经自己的表现状况', completed: true },
    ],
  },
  {
    title: '六、聊天模块（暂时关闭）',
    requirements: [
      { content: '用户在单一大聊天室发送消息', completed: true },
      { content: '分页查询聊天记录', completed: true, note: '（滚动懒加载实现）' },
      { content: '管理员允许随意删除任何用户的任何聊天记录', completed: false },
      { content: '后续功能暂时滞留.............', completed: false },
    ],
  },
  {
    title: '七、沙箱模块',
    requirements: [
      { content: '管理员可以对每道题目的测试样例进行修改', completed: true },
      { content: '用户可以随意调试 + 提交任意题目，并且提交代码时会根据后台的逻辑自动判断代码的正确与否', completed: true },
    ],
  },
  {
    title: '八、课程模块',
    requirements: [
      { content: '用户可以在学习专栏进行分页查找所有的课程信息', completed: true },
      { content: '用户可以在特定的课程当中查看前言、题目、提交记录、排名、学习宝典等多种课程信息', completed: false },
      { content: '用户可以提交每道题目的提交记录', completed: true, note: '（和Byteoj一样）' },
      { content: '仅仅管理员可以在后台进行课程的创建以及题目的设置、删除、修改功能', completed: true },
      {
        content: '用户可以联系管理员将自己添加到某课程当中去，但是用户绝对是不允许自己参加课程当中的',
        completed: true,
        note: '（内容比较私密，暂时仅允许内部人员使用）',
      },
      { content: '用户可以查看自己报名的课程', completed: false },
      { content: '管理员可以随机访问任何的课程页面并且管理员可以管理每个课程的用户', completed: true },
    ],
  },
  {
    title: '九、博客模块（尚未开发）',
    requirements: [],
  },
  {
    title: '十、AI模块',
    requirements: [
      { content: '使用DeepSeek的接口实现对应的算法试题的讲解工作的自动生成', completed: true, note: '（后置Prompt）' },
      {
        content: '内置网站信息咨询机器人，可以询问关于网站的相关信息，可以让用户了解我们网站的相关信息',
        completed: false,
        note: '（后置Prompt）（可以考虑使用腾讯云的工具，费用估计不低）',
      },
    ],
  },
  {
    title: '十一、聚合搜索模块',
    requirements: [
      { content: '聚合搜索 帖子 + 算法试题 + 数学试题+ 408试题 + 用户 + 竞赛 + 课程 + 题解 + 博客', completed: false },
    ],
  },
  {
    title: '十二、监控模块（尚未开发）',
    requirements: [
      { content: '可以实现定位人物位置', completed: false },
      { content: '可以进行比如说手指定位，人脸定位等等', completed: false },
      { content: '可以进行简单的人脸识别', completed: false },
      { content: '可以分析用户的微表情 + 感受 + 情绪', completed: false },
      { content: '可以识别用户的各种行为，比如说喝水、吃东西、拿东西、使用手机、起身等等一系列动作', completed: false },
      {
        content: '通过对可疑行为的监控进行大范围的模型训练工作，比如说对于拿东西 + 使用手机 + 使眼神 + 说某些话语 + 微表情判定结合来判断当前用户的作弊概率大小以报告监考官',
        completed: false,
      },
    ],
  },
  {
    title: '十三、日志模块（开发中）',
    requirements: [
      { content: '日志通过拦截器进行异步拦截请求并且进行记录，分操作日志和异常日志两种，对应着两张表', completed: true },
      { content: '日志IP定位升级（每日5000次免费）：精确定位至县区域', completed: true },
      { content: '可以多条件查询（IP归属地、状态码、请求类型、操作人员准确名称、日志时间范围等条件）', completed: true },
      {
        content: '可以统计每天、每周、每月的操作日志、异常日志情况、用户访问情况、总用户数、活跃用户数（当天请求>100）、新增用户数、访问高峰期、平均响应时间、主要浏览器、操作系统平台等信息',
        completed: false,
      },
      {
        content: '可以通过日/周/月来获取日/周/月操作日志、异常日志对应信息从而在前端使用Echarts.js进行图表绘制',
        completed: false,
      },
    ],
  },
  {
    title: '十四、考研打卡模块（尚未开发）',
    requirements: [
      { content: '可以提供一个页面提供给同学们打卡每日所学', completed: false, note: '（类似于发帖，但是决定单独领出一个模块来处理）' },
      { content: '普通用户允许最多创建5个打卡任务', completed: false, note: '（具体需要什么参数之类，编写程序的时候再做详细处理）' },
      {
        content: '用户可以加入打卡任务并进行打卡，并且每日还会对用户进行提醒打卡任务尚未完成的提示信息',
        completed: false,
        note: '（详细不做声明,对于不打卡者可设定小惩罚之类的）',
      },
      { content: '管理员则是可以对打卡任务和提交记录进行监视管理工作', completed: false },
      { content: '这里注意打卡完成之后可以有点小动画或者设计一些小奖励之类来提高打卡兴趣的措施', completed: false, note: '（暂定）' },
    ],
  },
  {
    title: '十五、bug反馈模块（尚未开发）',
    requirements: [
      { content: '用户可以对于测试样例弱、网页样式、功能方面的问题提交bug反馈单，填写对应信息', completed: false },
      { content: '管理员可以查看所有用户提交的反馈单从而进行即使的反馈', completed: false, note: '（BOSS管理员应该可以收到消息）' },
      { content: '管理员可以选择驳回、已修复、暂不修复、修复中等状态', completed: false },
    ],
  },
  {
    title: '十六、算法可视化模块（尚未开发）',
    requirements: [],
  },
  {
    title: '十七、服务器性能数据备份模块',
    requirements: [
      { content: '数据自动备份', completed: true, note: '（每周一的凌晨0点备份）' },
      { content: '熔断机制', completed: false, note: '（如果同一接口或者某种服务型功能出现10s时间段内出现很多次异常请求）' },
      { content: '操作行为分析（UEBA）', completed: false, note: '（短时间内出现大量数据删除、导入情况）' },
      { content: '数据库出现终端操作情况', completed: false, note: '（类似于高考分数系统的放数据篡改功能）' },
      { content: '一键回滚（Rollback）', completed: false, note: '（实现代码的备份 + 回滚）' },
      { content: '区块链存证（Blockchain Notarization）', completed: false },
    ],
  },
  {
    title: '十八、其他考虑部分',
    requirements: [
      {
        content: '多人在线编辑功能',
        completed: false,
        note: '（OT（Operational Transformation） 或 CRDT（Conflict-free Replicated Data Types） 解决冲突合并;WebSocket + 差分算法（Diff-Match-Patch）减少数据传输量）',
      },
      { content: 'SPIFFE（身份认证） + BeyondCorp（谷歌零信任模型）', completed: false },
      {
        content: 'AI-Native',
        completed: false,
        note: '（用户输入模糊需求（如"帮我规划一次日本旅行"），AI自动生成完整页面（详细内容再说）LLM（如GPT-4） + RAG（检索增强生成））',
      },
      { content: '免费 + 付费 + KOL', completed: false, note: '（可通过RBAC改良版本实现）' },
      { content: '用户标签系统（RFM模型） + 自动化权益发放（Coupon微服务）', completed: false },
      { content: '爬虫监控竞品价格（Scrapy） + 定价算法（Python/Pandas） + 规则引擎（Drools）', completed: false },
    ],
  },
]);

// --- 计算属性 ---
// 过滤模块（当前直接返回所有模块，可根据需要扩展）
const filteredModules = computed(() => modules.value);

// 根据当前视图过滤需求
const filteredRequirements = (requirements) => {
  if (currentView.value === 'all') return requirements;
  return currentView.value === 'completed'
      ? requirements.filter((req) => req.completed)
      : requirements.filter((req) => !req.completed);
};

// 计算模块完成进度
const calculateProgress = (requirements) => {
  if (!requirements || requirements.length === 0) return 0;
  const completed = requirements.filter((req) => req.completed).length;
  return Math.round((completed / requirements.length) * 100);
};

// --- 方法 ---
// 切换视图
const toggleView = (view) => {
  currentView.value = view;
};
</script>

<style scoped>
/* 自定义滚动条样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 增强按钮 hover 效果 */
button:hover {
  transform: translateY(-1px);
}

/* 卡片 hover 效果 */
.shadow-md:hover {
  transform: translateY(-2px);
}
</style>