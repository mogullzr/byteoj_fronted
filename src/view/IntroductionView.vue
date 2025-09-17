<template>
  <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
    <!-- 默认状态 - 三点式设计 -->
    <symbol id="nav-dot" viewBox="0 0 24 24">
      <circle cx="8" cy="12" r="1.5" fill="#64748b"/>
      <circle cx="12" cy="12" r="1.5" fill="#64748b"/>
      <circle cx="16" cy="12" r="1.5" fill="#64748b"/>
    </symbol>

    <!-- 激活状态 - 连接线动画 -->
    <symbol id="nav-active" viewBox="0 0 24 24">
      <path d="M8,12 L16,12" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
      <circle cx="8" cy="12" r="3" fill="#10b981"/>
      <circle cx="16" cy="12" r="3" fill="#10b981"/>
    </symbol>
  </svg>
  <!-- 左侧导航 -->
  <div class="fixed left-3 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-5">
    <div
        v-for="(item, index) in leftNavItems"
        :key="index"
        class="relative"
    >
      <!-- 导航球 -->
      <button
          @click.stop="toggleItem(index)"
          class="nav-ball group"
          :class="{
    'active': activeId === item.id,
    'expanded': expandedIndex === index
  }"
      >
        <svg v-if="activeId === item.id || expandedIndex === index">
          <use xlink:href="#nav-active"/>
        </svg>
        <svg v-else>
          <use xlink:href="#nav-dot"/>
        </svg>
      </button>

      <!-- 文字标签 -->
      <transition name="fade">
        <div
            v-if="expandedIndex === index"
            class="nav-label left-10"
        >
          {{ item.text }}
          <!-- 子项列表 -->
          <div
              v-if="item.children"
              class="children-list"
          >
            <div
                v-for="(child, childIndex) in item.children"
                :key="childIndex"
                @click.stop="scrollTo(child.id)"
                class="child-item"
                :class="{'active': activeId === child.id}"
            >
              {{ child.text }}
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>

  <!-- 右侧导航 -->
  <div class="fixed right-3 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-5">
    <div
        v-for="(item, index) in rightNavItems"
        :key="index"
        class="relative"
    >
      <!-- 右侧导航按钮 -->
      <button
          @click.stop="toggleItem(index + leftNavItems.length)"
          class="nav-ball nav-ball-right group"
          :class="{
    'active': activeId === item.id,
    'expanded': expandedIndex === index + leftNavItems.length
  }"
      >
        <svg v-if="activeId === item.id || expandedIndex === index + leftNavItems.length">
          <use xlink:href="#nav-active"/>
        </svg>
        <svg v-else>
          <use xlink:href="#nav-dot"/>
        </svg>
      </button>

      <!-- 文字标签 -->
      <transition name="fade">
        <div
            v-if="expandedIndex === index + leftNavItems.length"
            class="nav-label right-10"
        >
          {{ item.text }}
          <!-- 子项列表 -->
          <div
              v-if="item.children"
              class="children-list"
          >
            <div
                v-for="(child, childIndex) in item.children"
                :key="childIndex"
                @click.stop="scrollTo(child.id)"
                class="child-item"
                :class="{'active': activeId === child.id}"
            >
              {{ child.text }}
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
  <div class="intro-page">
    <!-- Hero Section -->
    <section class="hero bg-gradient-to-r from-primary to-info p-8 text-white text-center">
      <div class="container mx-auto py-16">
        <h1 class="text-5xl font-bold">ByteOJ</h1>
        <p class="text-2xl mb-8">AI赋能算法学习OJ平台</p>
<!--        &lt;!&ndash; 添加的字数和阅读时间信息 &ndash;&gt;-->
<!--        <span class="inline-block mx-2">全文 2555 字</span>-->
<!--        <span class="inline-block mx-2">•</span>-->
<!--        <span class="inline-block mx-2">阅读约需 8 分钟</span>-->
        <div class="text-md opacity-80 font-bold mb-6">
          <span class="inline-block mx-2" style="font-size: 20px">更新时间: 2025年7月18日 中午12:47:34</span>
        </div>
        <div class="flex justify-center gap-4">
          <!-- 后端仓库 -->
          <div class="flex flex-col items-center gap-2">
            <a href="https://github.com/mogullzr/byteoj_backend" target="_blank"
               class="github-star-button flex items-center px-4 py-2 rounded-md bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition-colors shadow-md hover:shadow-lg transform hover:scale-105">
              <svg class="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                    d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
              </svg>
              后端仓库
              <svg class="w-5 h-5 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="currentColor"
                      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </a>
          </div>

          <!-- 前端仓库 -->
          <div class="flex flex-col items-center gap-2">
            <a href="https://github.com/mogullzr/byteoj_fronted" target="_blank"
               class="github-star-button flex items-center px-4 py-2 rounded-md bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition-colors shadow-md hover:shadow-lg transform hover:scale-105">
              <svg class="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                    d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
              </svg>
              前端仓库
              <svg class="w-5 h-5 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="currentColor"
                      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Background Section -->
    <section id="background" class="bg-base-100 py-16">
      <div class="container mx-auto px-4 max-w-6xl">
        <div class="text-center mb-16">
          <h2 class="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
            一、开发背景
          </h2>
          <p class="text-lg text-base-content/80 max-w-2xl mx-auto">
            本人开发网站的主要原因的简单介绍
          </p>
        </div>
        <div class="card bg-base-200 shadow-xl p-6 mb-8">
          <div class="card-body">
            <p class="mb-4">
              市面的监考系统要不就是要收钱，要不就是有很多功能没有实现，导致在具体使用的时候给本人带来了许多不便之处，但是目前网站还没有开发这一项功能，这一项功能可能在我毕业之后都没法实现，因为这一部分涉及的知识非常广泛，而且需要学习的知识很大程度与<strong>神经网络、深度学习以及很多与数学领域</strong>等多方面算法密切相关的知识，同时现在的时间比较紧张，没办法对这一部分功能进行详细的研究工作，而未来具体功能会实现到什么程度呢？这也将是一个巨大的问号，只能说尽情期待了.......
            </p>

            <p class="mb-4">同时为了可以让我的监考系统有一个合适的载体展示其功能的强大，本人打算自己设计一个 <strong>OJ
              平台</strong>也可以实现代码在线编程同时进行在线测试功能，也可以使用大模型询问AI问题，同时同学们还可以实时观察自己是否出分的一个智能AI检测学习平台，是不是很方便呢。当然这部分的核心其实并非AI问答，而是基于<strong>代码沙箱</strong>工作的，这也是网站里面最难的部分，现在已经完成了，但是还并不是十分完善，后面我也会不断完善，并使用多种语言都实现一次，但就目前来说，这部分功能还算是比较完善的，后台的资源仅仅应付于本校数计的计算机专业的学生还是绰绰有余的，所以经过对比还是可以发现，网站调试代码的速度会比大多数网站都要快得多的<strong>（说白了，就是人太少了，网站一点都不卡，其实现在有很多优化我都没优化，估计都得1000++的人数才有优化的必要）</strong>
            </p>

            <p>最后回归正题，简约来说，本网站就是一个集成了
              <strong>帖子交流、评论、图片模块</strong>进行图片展示上传、<strong>算法试题模块</strong>进行代码调试提交工作、<strong>课程模块</strong>进行循循渐进的指导性学习、<strong>竞赛模块</strong>进行<strong>码农</strong>间的PK比试、AI模块进行用户辅助学习工作的一个<em><strong>Mogullzr</strong></em>自行研发<strong>（2024.07.14
                ~ 至今）</strong>的<strong>AI赋能算法学习OJ平台</strong>。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Development Team Section -->
    <section class="bg-base-200 py-16">
      <div id="team" class="container mx-auto px-4 max-w-6xl">
        <div class="text-center mb-16">
          <h2 class="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
            二、网站开发人员
          </h2>
          <p class="text-lg text-base-content/80 max-w-2xl mx-auto">
            简单对网站开发人员以及顾问的介绍
          </p>
        </div>

        <!-- Target Audience -->
        <div id="audience" class="mb-16">
          <h3 class="text-2xl font-bold mb-6">1. 面向群体</h3>
          <div class="card bg-base-100 shadow-xl p-6">
            <p class="text-lg">豫章师范学院数学与计算机学院的全体学生<strong>（大一为主，其他为辅）</strong>
            </p>
          </div>
        </div>

        <!-- Development Team -->
        <div id="developers">
          <h3 class="text-2xl font-bold mb-6">2. 网站开发及辅助人员</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <!-- Mogullzr -->
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h4 class="card-title">Mogullzr（主开发者）</h4>
                <p>软件工程某不知名校友🤭。自行开发<strong>ByteOJ</strong>，已经在<strong>2024届软件工程</strong> 学生
                  <strong>举办过讲座</strong>并且以讲课的模式为<strong>大一为主体，大二为辅的群体</strong>进行过较为体系化的教学和训练工作<strong>（主讲人：Mogullzr、Merrick、Siersi）</strong>。目前已经使用过一个学期<strong>（由于考研下册并没有继续）</strong>，网站目前有123位用户，其中包括现大二大三大四软件工程专业学生以及极个别校外用户。主攻语言为<strong>Java、Python</strong>，
                  <del>喜欢搞事情</del>
                  。
                </p>
              </div>
            </div>

            <!-- AxLiu -->
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h4 class="card-title">AxLiu（第二开发者，幕后）</h4>
                <p>
                  软件工程某不知名校友🤭。主要负责后台的<strong>代码沙箱</strong>的逻辑辅助功能，主攻<strong>Go语言</strong>。
                </p>
              </div>
            </div>

            <!-- Myself -->
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h4 class="card-title">Myself</h4>
                <p>
                  大二的<strong>424软件工程1班知名校友（在读中）🤭</strong>。<strong>熟悉C/C++开发</strong>，开发了附属项目<strong>ByteIDE</strong>，基于
                  <strong>Qt</strong> 开发的简易文本编辑器和集成开发环境 <strong>（IDE）</strong>，解决了非计算机学生装配环境麻烦的问题，开发的项目为全校师生服务。
                </p>
              </div>
            </div>

            <!-- Merrick -->
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h4 class="card-title">Merrick</h4>
                <p>大三的<strong>423软件工程1班知名校友（在读中）🤭</strong>。同样具备非常强大的网站开发能力，作为本网站的顾问。
                </p>
              </div>
            </div>

            <!-- Siersi -->
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h4 class="card-title">Siersi</h4>
                <p>大二的<strong>424软件工程2班知名校友（在读中）🤭</strong>😏。具备较强大的网站开发能力，同时<strong>精通CV程序必备技能</strong>以及<strong>电脑各种硬件知识</strong>😏，同样作为本网站的顾问。
                </p>
              </div>
            </div>

            <!-- Arrinna -->
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h4 class="card-title">Arrinna</h4>
                <p>大二的<strong>424软件工程2班知名校友（在读中）🤭</strong>😏。熟悉网站开发、小程序开发，同样作为本网站的顾问。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Learning Guidelines -->
    <section class="bg-base-100 py-16">
      <div id="guidelines" class="container mx-auto px-4 max-w-6xl">
        <div class="text-center mb-16">
          <h2 class="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
            三、学习须知
          </h2>
          <p class="text-lg text-base-content/80 max-w-2xl mx-auto">
            大部分新生的心理变化
          </p>
        </div>
        <div class="card bg-base-200 shadow-xl p-6 mb-8">
          <div class="card-body">
            <p class="mb-6">本网站此次仅仅是对新生了解编程的一个小途径，核心目的已经不是<strong>教学</strong>了，学无余力了。
            </p>

            <p class="mb-4">根据3年的开发经验和对<strong>大一新生（Freshman）</strong>热情和学习动力的调查可以总结<strong>以下6个阶段：</strong>
            </p>

            <ul class="list-disc pl-6 space-y-2 mb-6">
              <li><strong>第一阶段：6月7号 ~ 6月25日左右</strong>，解放、玩、去你md的学习。</li>
              <li><strong>第二阶段：6月26日 ~ 7月1日左右</strong>，选啥专业，选啥专业，选啥学校选啥学校，听说计算机还不错呢，那就来个软件工程专业吧，豫章师范学院听说还不错，就它吧。😏😏😏
              </li>
              <li><strong>第三阶段：7月2日到 7月20日 ~ 8月1日 中间</strong>,焦急等待自己的录取通知,隔个几天就要看一下有没有出录取通知,有个别社牛直接打电话到学校招生办问录取的问题.在此期间可能有的<strong>卷狗</strong>会去提前搞一搞大学的<strong>高等数学、C语言啥</strong>的科目。<strong>（没有基础的同学肯定学得都不知道自己在学啥玩意儿，干嘛用的都不知道）</strong>
              </li>
              <li><strong>第四阶段：8月1日 ~ 开学</strong>，在新生群里和大二或大三的学长唠嗑，看看校园有啥好玩的，提前初步了解以下校园里面的东西还有一些往年学长的经验之谈等等。
              </li>
              <li><strong>第五阶段：开学到大学第一节课开始之前</strong>，大多数新生都还是充满热情的，非常期待大学的美好时光。
              </li>
              <li><strong>第六阶段：正式开始上课之后</strong>，<strong>80%</strong>的新生的热情直接<strong>50%</strong>以上消除，部分学生直接开始<strong>4年的摆烂生活</strong>，<strong>10%多</strong>的同学兴趣会慢慢将兴趣消除干净，仅仅<strong>屈指可数</strong>的同学可以<strong>真正留在软件行业，"活下去"</strong>。
              </li>
            </ul>

            <div class="chicken-soup-container">
              <button id="toggleChickenSoup" class="chicken-soup-btn">
                <span class="chicken-soup-icon">🍲</span>
                <span class="chicken-soup-text">小鸡汤</span>
                <span class="chicken-soup-arrow">▼</span>
              </button>

              <div class="chicken-soup-content" id="chickenSoupContent">
                <div class="chicken-soup-inner">
                  <p class="mb-4">
                    摆烂与否，旨在自己，进入大学并非解放，而是另一场新战役的开始。这场战役可能比高考这场战役更加无情。</p>
                  <ul class="list-disc pl-6 space-y-2">
                    <li>高中阶段，你不学习，老师可能会管你。<strong>大学不会！！！</strong></li>
                    <li>高中阶段，你偷偷上课玩手机，老师可能会管你。<strong>大学可能会？！！也不多</strong></li>
                    <li>高中阶段，你的目标很明确，只有一个，高考，学习语文、数学、英语 + 2 + 1某学科。<strong>计算机不一样！！！你必须选择适合自己的岗位，没有人可以帮你确认你自己喜欢的岗位！！！不同的岗位也就意味着完全不同的学习路线了！！！</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Website Features -->
    <section id="features" class="bg-base-200 py-16">
      <div class="container mx-auto px-4 max-w-6xl">
        <div class="text-center mb-16">
          <h2 class="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
            四、网站功能展示
          </h2>
          <p class="text-lg text-base-content/80 max-w-2xl mx-auto">
            专为算法学习设计的全方位功能体验
          </p>
        </div>

        <!-- Features List -->
        <div class="space-y-16">
          <!-- Feature 1: Homepage -->
          <div id="feature1" class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="text-2xl font-bold mb-4">1. 首页(帖子页面)</h3>
              <img
                  data-src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250707235528878.png"
                  alt="首页截图"
                  class="lazy-image rounded-lg w-full mb-4"
                  loading="lazy"
              >
            </div>
          </div>

          <!-- Feature 2: Problem Bank -->
          <div id="feature2" class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="text-2xl font-bold mb-4">2. 题库(用于查找算法题目)</h3>
              <div class="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     class="stroke-current shrink-0 w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span><strong>温馨提示：</strong>目前并不是所有的题目允许提交，目前仅188道题目支持<strong>提交代码</strong>，其中174道简单题，12道中等题，2道困难题。</span>
              </div>
              <img
                  data-src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250707235544411.png"
                  alt="题库截图"
                  class="lazy-image rounded-lg w-full mb-4"
                  loading="lazy"
              >
            </div>
          </div>

          <!-- Feature 3: Daily Problem -->
          <div id="feature3" class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="text-2xl font-bold mb-4">3. 每日一题(通过洗牌的方式)</h3>
              <img
                  data-src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250707235546433.png"
                  alt="每日一题截图"
                  class="lazy-image rounded-lg w-full mb-4"
                  loading="lazy"
              >
            </div>
          </div>

          <!-- Feature 4: Courses -->
          <div id="feature4" class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="text-2xl font-bold mb-4">4. 课程模块(提供算法学习路线指南)</h3>
              <div class="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     class="stroke-current shrink-0 w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span><strong>温馨提示：</strong> 默认情况下点击进入任何课程，你看到的试题一部分都是一片空白，如需查看课程内容，请联系<strong>898561494@qq.com（主要是为了仅仅支持豫章师范学院数学与计算机学院的学生使用，还不打算对外开放）</strong>。当然也有配套的视频资源<strong>（因财力不足，只能给大家网盘链接，如果需要的话，还是一样联系898561494@qq.com）</strong></span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <img
                    data-src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250707235548363.png"
                    alt="课程模块截图1"
                    class="lazy-image rounded-lg w-full"
                    loading="lazy"
                >
                <img
                    data-src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250707235550291.png"
                    alt="课程模块截图2"
                    class="lazy-image rounded-lg w-full"
                    loading="lazy"
                >
              </div>
            </div>
          </div>

          <!-- Feature 5: Competitions -->
          <div id="feature5" class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="text-2xl font-bold mb-4">5. 竞赛模块(提供竞赛练习服务)</h3>
              <div class="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     class="stroke-current shrink-0 w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span><strong>温馨提示：</strong>每场竞赛都会设置参赛密码<strong>（也是为了防止外来人员使用，每次比赛都会在大群当中提醒）</strong></span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <img
                    data-src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250707235552227.png"
                    alt="竞赛模块截图1"
                    class="lazy-image rounded-lg w-full mb-4"
                    loading="lazy"
                >
                <img
                    data-src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250709111311992.png"
                    alt="竞赛模块截图2"
                    class="lazy-image rounded-lg w-full mb-4"
                    loading="lazy"
                >
              </div>
              <img
                  data-src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250709111329748.png"
                  alt="竞赛模块截图3"
                  class="lazy-image rounded-lg w-full mb-4"
                  loading="lazy"
              >
            </div>
          </div>

          <!-- Feature 6: Ranking -->
          <div id="feature6" class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="text-2xl font-bold mb-4">6. 排行榜服务</h3>
              <div class="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     class="stroke-current shrink-0 w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span><strong>温馨提示：</strong>每位用户的初始分为<strong>1200分</strong>，每次竞赛之后，会根据<strong>ELO改良算法</strong>来对用户的竞赛表现进行打分，最后得出用户在本次竞赛的分数变化。再提一嘴，目前的榜一是<strong>Siersi</strong>，<strong>2290分</strong>。</span>
              </div>
              <img
                  data-src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250707235553650.png"
                  alt="排行榜截图"
                  class="lazy-image rounded-lg w-full mb-4"
                  loading="lazy"
              >
            </div>
          </div>

          <!-- Feature 7: OJ Competition Module -->
          <div id="feature7" class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="text-2xl font-bold mb-4">7. OJ竞赛模块</h3>
              <div class="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     class="stroke-current shrink-0 w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span><strong>温馨提示：</strong>该部分是用于快速实时获取<strong>CodeForces、LeetCode、牛客、蓝桥杯、CodeChef、jisuanke、Byteoj</strong>等各大知名OJ网站的竞赛信息的。</span>
              </div>
              <img
                  data-src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250707235555192.png"
                  alt="OJ竞赛模块截图"
                  class="lazy-image rounded-lg w-full mb-4"
                  loading="lazy"
              >
            </div>
          </div>

          <!-- Feature 8: Code Debugging -->
          <div id="feature8" class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="text-2xl font-bold mb-4">8. 代码调试提交功能</h3>
              <div class="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     class="stroke-current shrink-0 w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span><strong>温馨提示：</strong>提交成功一道题目有惊喜，请将音量拉到最大。</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <img
                    data-src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250707235556588.png"
                    alt="代码调试截图1"
                    class="lazy-image rounded-lg w-full"
                    loading="lazy"
                >
                <img
                    data-src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250707235601284.png"
                    alt="代码调试截图2"
                    class="lazy-image rounded-lg w-full"
                    loading="lazy"
                >
              </div>
            </div>
          </div>

          <!-- Feature 9: AI Assistant -->
          <div id="feature9" class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="text-2xl font-bold mb-4">9. AI智能助手（可自动识别代码和题目以及上下文信息）</h3>
              <div class="alert alert-warning mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                     viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <span>DeepSeek Reasoner 、DeepSeek V3 线路一暂时关闭<strong>（目前仅DeepSeek V3线路二可使用）</strong></span>
              </div>
              <img
                  data-src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250707235618135.png"
                  alt="AI智能助手截图"
                  class="lazy-image rounded-lg w-full mb-4"
                  loading="lazy"
              >
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-gradient-to-b from-base-100 to-base-200 py-20">
      <div id="community" class="container mx-auto px-4 max-w-6xl">
        <div class="text-center mb-16">
          <h2 class="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            五、学习交流群
          </h2>
          <p class="text-lg text-base-content/80 max-w-2xl mx-auto">
            加入我们的技术交流群，与志同道合的同学一起成长<br>
            <span class="text-lg text-red-400 font-bold">(请备注班级+姓名！！！！！！)</span>
          </p>
        </div>
        <div class="grid md:grid-cols-2 gap-8">
          <!-- QR Code Card -->
          <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <figure class="px-10 pt-10">
              <img
                  src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250709110220883.jpg"
                  alt="技术交流群二维码"
                  class="rounded-xl w-full max-w-xs"
                  loading="lazy"
              >
            </figure>
            <div class="card-body items-center text-center">
              <h3 class="card-title text-2xl mb-2">扫码加入社群</h3>
              <p class="text-base-content/70 mb-4">纯学习交流环境，共同进步</p>
            </div>
          </div>

          <!-- Topics Card -->
          <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border border-base-200">
            <div class="card-body p-6">
              <h3 class="text-2xl font-semibold mb-6 text-center">交流主题涵盖</h3>
              <div class="space-y-6">
                <!-- 编程语言 -->
                <div>
                  <h4 class="text-sm font-medium text-base-content/70 mb-3 pl-2">编程语言</h4>
                  <div class="flex flex-wrap gap-3">
                    <span class="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm">C/C++基础</span>
                    <span class="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm">Python</span>
                    <span class="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm">Java</span>
                  </div>
                </div>

                <!-- 计算机基础 -->
                <div>
                  <h4 class="text-sm font-medium text-base-content/70 mb-3 pl-2">计算机基础</h4>
                  <div class="flex flex-wrap gap-3">
                    <span class="px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm">计算机组成</span>
                    <span class="px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm">操作系统</span>
                    <span class="px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm">数据结构</span>
                    <span class="px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm">计算机网络</span>
                    <span class="px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm">算法</span>
                  </div>
                </div>

                <!-- 开发技术 -->
                <div>
                  <h4 class="text-sm font-medium text-base-content/70 mb-3 pl-2">开发技术</h4>
                  <div class="flex flex-wrap gap-3">
                    <span class="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm">前端开发相关技术</span>
                    <span class="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm">后端开发相关技术</span>
                    <span class="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm">网页UI设计</span>
                    <span class="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm">Hexo</span>
                  </div>
                </div>

                <!-- 数据库与工具 -->
                <div>
                  <h4 class="text-sm font-medium text-base-content/70 mb-3 pl-2">数据库与工具</h4>
                  <div class="flex flex-wrap gap-3">
                    <span class="px-4 py-2 bg-info/10 text-info rounded-full text-sm">MySQL</span>
                    <span class="px-4 py-2 bg-info/10 text-info rounded-full text-sm">MongoDB</span>
                    <span class="px-4 py-2 bg-info/10 text-info rounded-full text-sm">Redis</span>
                    <span class="px-4 py-2 bg-info/10 text-info rounded-full text-sm">ElasticSearch</span>
                  </div>
                </div>

                <!-- 系统与运维 -->
                <div>
                  <h4 class="text-sm font-medium text-base-content/70 mb-3 pl-2">系统与运维</h4>
                  <div class="flex flex-wrap gap-3">
                    <span class="px-4 py-2 bg-success/10 text-success rounded-full text-sm">Docker</span>
                    <span class="px-4 py-2 bg-success/10 text-success rounded-full text-sm">Linux</span>
                    <span class="px-4 py-2 bg-success/10 text-success rounded-full text-sm">Nginx</span>
                    <span class="px-4 py-2 bg-success/10 text-success rounded-full text-sm">Git</span>
                  </div>
                </div>

                <!-- 其他 -->
                <div>
                  <h4 class="text-sm font-medium text-base-content/70 mb-3 pl-2">其他</h4>
                  <div class="flex flex-wrap gap-3">
                    <span class="px-4 py-2 bg-warning/10 text-warning rounded-full text-sm">设计模式</span>
                    <span class="px-4 py-2 bg-warning/10 text-warning rounded-full text-sm">RBAC</span>
                    <span class="px-4 py-2 bg-warning/10 text-warning rounded-full text-sm">Qt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 问卷调查部分 -->
        <div id="survey" class="text-center mb-16">
          <h2 class="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent m-4">
            六、问卷调查
          </h2>
          <p class="text-lg text-base-content/80 max-w-2xl mx-auto">
            您的意见对我们非常重要，感谢您的参与
          </p>
        </div>

        <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow max-w-2xl mx-auto">
          <div class="card-body text-center p-8">
            <h3 class="text-2xl font-semibold mb-6">请帮忙完成毕业设计问卷调查</h3>
            <p class="text-base-content/80 mb-6">打开QQ扫码参与，感谢您的支持！</p>
            <img
                src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250713122814993.png"
                alt="问卷调查二维码"
                class="object-contain"
                loading="lazy"
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="bg-gradient-to-r from-primary to-info py-16 text-white text-center">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-6">加入ByteOJ学习社区</h2>
        <p class="text-xl mb-8">探索更多编程资源，与同学一起成长</p>
        <div class="flex justify-center">
          <a href="mailto:898561494@qq.com" class="text-2xl underline">
            ✉️ 联系我们 898561494@qq.com
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue';
// 左侧导航数据
const leftNavItems = ref([
  {
    id: 'background', text: '一、开发背景',
    children: [
      {id: 'background', text: '开发背景'},
    ]
  },
  {
    id: 'team',
    text: '二、网站开发人员',
    children: [
      {id: 'audience', text: '1.面向群体'},
      {id: 'developers', text: '2.开发人员'}
    ]
  },
  {
    id: 'guidelines',
    text: '三、学习须知',
    children: [
      {id: 'guidelines', text: '学习须知'}
    ]
  }
]);

// 右侧导航数据
const rightNavItems = ref([
  {
    id: 'features',
    text: '功能展示',
    children: [
      {id: 'feature1', text: '1.首页(帖子页面)'},
      {id: 'feature2', text: '2.题库(用于查找算法题目)'},
      {id: 'feature3', text: '3.每日一题(通过洗牌的方式)'},
      {id: 'feature4', text: '4.课程模块(提供算法学习路线指南)'},
      {id: 'feature5', text: '5.竞赛模块(提供竞赛练习服务)'},
      {id: 'feature6', text: '6.排行榜服务'},
      {id: 'feature7', text: '7.OJ竞赛模块'},
      {id: 'feature8', text: '8.代码调试提交功能'},
      {id: 'feature9', text: '9.AI智能助手（可自动识别代码和题目以及上下文信息）'}
    ]
  },
  {
    id: 'community1',
    text: '五、交流群',
    children: [
      {id: 'community', text: '交流群'},
    ]
  },
  {
    id: 'survey1',
    text: '六、问卷调查',
    children: [
      {id: 'survey', text: '问卷调查'},
    ]
  }
]);

const activeId = ref(null);
const expandedIndex = ref(null);

const toggleItem = (index) => {
  expandedIndex.value = expandedIndex.value === index ? null : index;
};

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) {
    // 获取元素顶部距离文档顶部的距离
    const elementTop = el.getBoundingClientRect().top + window.pageYOffset;
    // 计算目标位置（元素顶部 - 100px）
    const targetPosition = elementTop - 100;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    activeId.value = id;
  }
};
// 懒加载图片的Intersection Observer
const setupLazyLoading = () => {
  const lazyImages = document.querySelectorAll('.lazy-image');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.classList.remove('lazy-image');
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '200px 0px', // 提前200px加载
      threshold: 0.01
    });

    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // 不支持IntersectionObserver的浏览器回退方案
    lazyImages.forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) {
        img.src = src;
        img.classList.remove('lazy-image');
      }
    });
  }
};

// Add javascript to handle the chicken soup toggle
const toggleChickenSoup = () => {
  const chickenSoupContent = document.getElementById('chickenSoupContent');
  const chickenSoupArrow = document.querySelector('.chicken-soup-arrow');

  if (chickenSoupContent) {
    chickenSoupContent.classList.toggle('active');

    if (chickenSoupContent.classList.contains('active')) {
      chickenSoupArrow.textContent = '▲';
    } else {
      chickenSoupArrow.textContent = '▼';
    }
  }
};

// Set up event listener when component is mounted
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activeId.value = entry.target.id;
      }
    });
  }, {threshold: 0.5});

  // 观察所有章节
  document.querySelectorAll('section[id], div[id]').forEach(section => {
    observer.observe(section);
  });
  const toggleButton = document.getElementById('toggleChickenSoup');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleChickenSoup);
  }

  // 初始化懒加载
  setupLazyLoading();

  activeId.value = null;
  // 添加全局监听事件
  window.addEventListener('click', closeAllMenus);
});

onUnmounted(() => {
  window.removeEventListener('click', closeAllMenus);
});

const closeAllMenus = () => {
  expandedIndex.value = null;
};
</script>

<style scoped>
.intro-page {
  background: white;
  min-height: 100vh;
  font-size: 1.125rem;
}

/* Increase text sizes */
p {
  font-size: 1.25rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

li {
  font-size: 1.25rem;
  line-height: 1.8;
}

h2 {
  font-size: 2.75rem !important;
  margin-bottom: 2rem !important;
}

h3 {
  font-size: 2.25rem !important;
  margin-bottom: 1.5rem !important;
}

h4 {
  font-size: 1.75rem !important;
}

.hero {
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 8rem;
}

.hero h1 {
  font-size: 4rem !important;
}

.hero p {
  font-size: 2rem !important;
}

img {
  max-height: 600px;
  object-fit: contain;
  margin: 0 auto;
}

/* 懒加载图片样式 */
.lazy-image {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lazy-image.loaded {
  opacity: 1;
}

.alert {
  font-size: 1.25rem;
  padding: 1.5rem;
  border-radius: 10px;
}

.alert svg {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

/* Custom styles for container */
.container {
  max-width: 1400px;
  padding: 0 2rem;
}

/* Card styling */
.card {
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
  padding: 2rem;
}

.card-body {
  padding: 1.5rem;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

/* Custom Chicken Soup styling */
.chicken-soup-container {
  margin: 2rem 0;
  border-radius: 12px;
  overflow: hidden;
}

.chicken-soup-btn {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  border: none;
  border-radius: 8px;
  color: #333;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 154, 158, 0.5);
}

.chicken-soup-btn:hover {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 70%);
  box-shadow: 0 6px 16px rgba(255, 154, 158, 0.7);
  transform: translateY(-2px);
}

.chicken-soup-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.chicken-soup-text {
  flex-grow: 1;
  text-align: left;
}

.chicken-soup-arrow {
  font-size: 1.25rem;
  transition: transform 0.3s ease;
}

.chicken-soup-content {
  height: 0;
  opacity: 0;
  overflow: hidden;
  transition: all 0.5s ease;
  background-color: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.chicken-soup-inner {
  padding: 2rem;
}

/* Show content when active */
.chicken-soup-content.active {
  height: auto;
  opacity: 1;
  padding: 2rem;
}

/* Section spacing */
section {
  padding: 5rem 0;
  margin-bottom: 0;
}

/* Add more space between feature items */
.space-y-16 > * {
  margin-bottom: 3rem !important;
}

/* Alert icon styling */
.alert svg {
  margin-right: 1rem;
}

.table-of-contents {
  position: fixed;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 260px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  z-index: 100;
  max-height: 80vh;
  overflow-y: auto;
}

.toc-header h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
}
/* 核心导航按钮样式 - 更大尺寸，使用SVG图标 */
.nav-ball {
  @apply w-10 h-10 rounded-full flex items-center justify-center;
  @apply transition-all duration-300 cursor-pointer;
  @apply bg-gray-800/80 hover:bg-primary/90;
  @apply outline-none border-none p-0;
  @apply shadow-lg hover:shadow-xl;
}

.nav-ball svg {
  @apply w-6 h-6;
  @apply text-gray-300 group-hover:text-white;
  @apply transition-all duration-300;
}

/* 激活状态 - 更明显的视觉反馈 */
.nav-ball.active {
  @apply bg-primary/90;
}

.nav-ball.active svg {
  @apply text-white;
}

/* 展开状态 - 与激活状态区分 */
.nav-ball.expanded {
  @apply bg-gray-700/90;
}

.nav-ball.expanded svg {
  @apply text-white;
}

/* 文字标签 - 更大更清晰的卡片 */
.nav-label {
  @apply absolute top-1/2 -translate-y-1/2;
  @apply bg-gray-800/95 backdrop-blur-md rounded-lg px-5 py-4;
  @apply text-base font-medium text-white shadow-2xl;
  @apply whitespace-nowrap transition-all;
  min-width: 180px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.3);
}

/* 右侧标签调整 */
.right-10 {
  right: 3.5rem;
  left: auto;
}

/* 子项列表 - 更大更清晰的子菜单 */
.children-list {
  @apply mt-3 pt-3 border-t border-gray-700/50;
}

.child-item {
  @apply py-2 px-2 text-sm text-gray-300 hover:text-white;
  @apply transition-colors cursor-pointer rounded;
  @apply hover:bg-gray-700/50;
}

.child-item.active {
  @apply text-white font-semibold bg-gray-700/70;
}

/* 动画 - 更平滑的过渡效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-50%) translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(10px);
}
</style>