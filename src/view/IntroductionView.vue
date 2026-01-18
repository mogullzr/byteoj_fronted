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
          <span class="inline-block mx-2" style="font-size: 20px">更新时间: 2025年10月6日 中午14:44:55</span>
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
            大部分新生的心理变化和专业学习内容对比
          </p>
        </div>

        <!-- 新生心理变化部分 -->
        <div class="card bg-base-200 shadow-xl p-6 mb-8">
          <div class="card-body">
            <h3 class="text-2xl font-bold mb-6">新生心理变化历程</h3>
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

        <!-- 专业学习内容对比部分 -->
        <div id="major-comparison" class="card bg-base-200 shadow-xl p-6 mb-8">
          <div class="card-body">
            <h3 class="text-2xl font-bold mb-6">计算机专业学习内容对比</h3>
            <div class="text-lg mb-6 justify-between items-center">
              <div>对比学校课程和真实工作需求，帮你抓住自学的重点</div>
              <div class="text-right font-bold"> ——豫章师范学院数学与计算机学院软件实训室2509实验室</div>
            </div>
            
            <!-- 专业选择标签 -->
            <div class="tabs-container mb-6">
              <div class="tabs">
                <button
                    v-for="major in majors"
                    :key="major.id"
                    :class="['tab-button', { active: activeMajor === major.id }]"
                    @click="activeMajor = major.id"
                >
                  {{ major.name }}
                </button>
              </div>
            </div>

            <!-- 对比内容 -->
            <div class="comparison-content">
              <transition name="major-switch" mode="out-in">
                <div :key="activeMajor" class="comparison-grid">
                <!-- 学校教学内容 -->
                <div class="content-card school-content" @click="openModal('school')" title="点击放大查看">
                  <div class="card-header">
                    <div class="icon-wrapper school-icon">
                      <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                      </svg>
                    </div>
                    <h4>学校教学内容</h4>
                    <p class="card-subtitle">传统课程体系</p>
                    <div class="page-info">
                      第 {{ schoolCurrentPage }} 页 / 共 {{ schoolTotalPages }} 页 ({{ getCurrentMajor.schoolContent.length }} 门基础课程)
                    </div>
                    <div class="zoom-hint">
                      <svg class="zoom-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      </svg>
                      点击放大查看
                    </div>
                  </div>

                  <!-- 分页内容 -->
                  <div class="content-list">
                    <div
                        v-for="(item, index) in getSchoolCurrentPageItems"
                        :key="index"
                        class="content-item school-item"
                        :style="{ animationDelay: `${index * 0.1}s` }"
                    >
                      <div class="item-icon">📚</div>
                      <div class="item-content">
                        <h5>{{ item.title }}</h5>
                        <p class="item-description-brief">{{ getBriefDescription(item.description) }}</p>
                        <div class="tags">
                          <span v-for="tag in item.tags.slice(0, 2)" :key="tag" class="tag school-tag">{{ tag }}</span>
                          <span v-if="item.tags.length > 2" class="tag-more">+{{ item.tags.length - 2 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 分页控制器 -->
                  <div class="pagination-controls" @click.stop>
                    <button
                        @click.stop="schoolPreviousPage"
                        :disabled="schoolCurrentPage === 1"
                        class="pagination-btn"
                    >
                      <svg class="pagination-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                      </svg>
                      
                    </button>

                    <div class="pagination-dots">
                      <span
                          v-for="page in schoolTotalPages"
                          :key="page"
                          @click.stop="schoolGoToPage(page)"
                          :class="['pagination-dot', { active: page === schoolCurrentPage }]"
                      >
                        {{ page }}
                      </span>
                    </div>

                    <button
                        @click.stop="schoolNextPage"
                        :disabled="schoolCurrentPage === schoolTotalPages"
                        class="pagination-btn"
                    >
                      
                      <svg class="pagination-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- VS 分隔符 -->
                <div class="vs-divider">
                  <div class="vs-circle">
                    <span class="vs-text">VS</span>
                  </div>
                  <div class="divider-line"></div>
                </div>

                <!-- 实际需求内容 -->
                <div class="content-card industry-content" @click="openModal('industry')" title="点击放大查看">
                  <div class="card-header">
                    <div class="icon-wrapper industry-icon">
                      <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <h4>实际工作需求</h4>
                    <p class="card-subtitle">市场真实技能要求</p>
                    <div class="page-info">
                      第 {{ currentPage }} 页 / 共 {{ totalPages }} 页 ({{ getCurrentMajor.industryContent.length }} 个技术栈)
                    </div>
                    <div class="zoom-hint">
                      <svg class="zoom-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      </svg>
                      点击放大查看
                    </div>
                  </div>

                  <!-- 分页内容 -->
                  <div class="content-list">
                    <div
                        v-for="(item, index) in getCurrentPageItems"
                        :key="index"
                        class="content-item industry-item"
                        :style="{ animationDelay: `${index * 0.1}s` }"
                    >
                      <div class="item-icon">🚀</div>
                      <div class="item-content">
                        <h5>{{ item.title }}</h5>
                        <p class="item-description-brief">{{ getBriefDescription(item.description) }}</p>
                        <div class="tags">
                          <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="tag industry-tag">{{ tag }}</span>
                          <span v-if="item.tags.length > 3" class="tag-more">+{{ item.tags.length - 3 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 分页控制器 -->
                  <div class="pagination-controls" @click.stop>
                    <button
                        @click.stop="previousPage"
                        :disabled="currentPage === 1"
                        class="pagination-btn"
                    >
                      <svg class="pagination-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                      </svg>
                      
                    </button>

                    <div class="pagination-dots">
                      <span
                          v-for="page in totalPages"
                          :key="page"
                          @click.stop="goToPage(page)"
                          :class="['pagination-dot', { active: page === currentPage }]"
                      >
                        {{ page }}
                      </span>
                    </div>

                    <button
                        @click.stop="nextPage"
                        :disabled="currentPage === totalPages"
                        class="pagination-btn"
                    >
                      
                      <svg class="pagination-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 放大模态框 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>{{ modalTitle }}</h2>
          <button @click="closeModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="modal-card" :class="modalType + '-modal'">
            <div class="modal-info">
              <div class="page-info-modal">
                {{ modalType === 'school' ? `第 ${schoolCurrentPage} 页 / 共 ${schoolTotalPages} 页 (${getCurrentMajor.schoolContent.length} 门基础课程)` : `第 ${currentPage} 页 / 共 ${totalPages} 页 (${getCurrentMajor.industryContent.length} 个技术栈)` }}
              </div>
            </div>
            
            <div class="modal-content-list">
              <div
                v-for="(item, index) in modalContent"
                :key="index"
                class="modal-content-item"
                :class="modalType + '-modal-item'"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="modal-item-icon">{{ modalType === 'school' ? '📚' : '🚀' }}</div>
                <div class="modal-item-content">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                  <div class="modal-tags">
                    <span v-for="tag in item.tags" :key="tag" :class="['modal-tag', modalType + '-modal-tag']">{{ tag }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 模态框分页控制器 -->
            <div class="modal-pagination-controls">
              <button
                @click="modalType === 'school' ? schoolPreviousPage() : previousPage()"
                :disabled="modalType === 'school' ? schoolCurrentPage === 1 : currentPage === 1"
                class="modal-pagination-btn"
              >
                <svg class="pagination-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
                
              </button>

              <div class="modal-pagination-dots">
                <span
                  v-for="page in (modalType === 'school' ? schoolTotalPages : totalPages)"
                  :key="page"
                  @click="modalType === 'school' ? schoolGoToPage(page) : goToPage(page)"
                  :class="['modal-pagination-dot', { active: page === (modalType === 'school' ? schoolCurrentPage : currentPage) }]"
                >
                  {{ page }}
                </span>
              </div>

              <button
                @click="modalType === 'school' ? schoolNextPage() : nextPage()"
                :disabled="modalType === 'school' ? schoolCurrentPage === schoolTotalPages : currentPage === totalPages"
                class="modal-pagination-btn"
              >
                
                <svg class="pagination-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

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
        <div class="grid md:grid-cols-2 gap-8">
          <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow mx-auto">
            <div class="card-body text-center p-8">
              <h3 class="text-2xl font-semibold mb-6">ByteOJ问卷调查(学生版)</h3>
              <p class="text-base-content/80 mb-6">打开QQ扫码参与，感谢您的支持！</p>
              <img
                  src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20250713122814993.png"
                  alt="问卷调查二维码"
                  class="object-contain"
                  loading="lazy"
              >
            </div>
          </div>
          <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow max-w-2xl mx-auto">
            <div class="card-body text-center p-8">
              <h3 class="text-2xl font-semibold mb-6">ByteOJ问卷调查(教师版)</h3>
              <p class="text-base-content/80 mb-6">打开QQ扫码参与，感谢您的支持！</p>
              <img
                  src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20260113193918029.png"
                  alt="问卷调查二维码"
                  class="object-contain"
                  loading="lazy"
              >
            </div>
          </div>
        </div>
        <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow max-w-7xl mx-auto my-12">
          <div class="card-body text-center p-8">
            <h3 class="text-2xl font-semibold mb-6">问卷调查(计算机学生学习需求调研)</h3>
            <p class="text-base-content/80 mb-6">打开QQ扫码参与，感谢您的支持！</p>
            <img
                src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/20260113192352752.png"
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
import {onMounted, onUnmounted, ref, computed, watch} from 'vue';
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
      {id: 'guidelines', text: '新生心理变化'},
      {id: 'major-comparison', text: '专业学习内容对比'}
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
  // 确保组件卸载时移除ESC键监听
  document.removeEventListener('keydown', handleEscKey);
});

const closeAllMenus = () => {
  expandedIndex.value = null;
};

// 专业对比相关状态
const activeMajor = ref('software')
const currentPage = ref(1)
const schoolCurrentPage = ref(1) // 学校教学内容分页
const itemsPerPage = 3 // 每页显示3个技术栈
const schoolItemsPerPage = 3 // 学校教学内容每页显示3个课程

// 模态框相关状态
const showModal = ref(false)
const modalType = ref<'school' | 'industry'>('school')
const modalTitle = ref('')

const majors = [
  { id: 'software', name: '软件工程专业' },
  { id: 'bigdata', name: '大数据专业' },
  { id: 'ai', name: '人工智能专业' }
]

const majorData = {
  software: {
    schoolContent: [
      {
        title: 'C语言（大一上册）',
        description: '基础语法，简单算法，指针入门',
        tags: ['入门', '浅显', '基础']
      },
      {
        title: '计算机导论课（大一上册）',
        description: '对计算机的很多知识进行一概而论，让同学对计算机有个大概认识',
        tags: ['入门', '基础']
      },
      {
        title: '数据结构（简单）（大一下册）',
        description: '概念为主，代码为辅，科目抽象难讲，经验不丰富很难讲好',
        tags: ['入门', '基础']
      },
      {
        title: 'MySQL数据库（大二上册）',
        description: '关系数据库理论，SQL基础',
        tags: ['理论', 'SQL', '概念']
      },
      {
        title: '计算机组成原理（大二上册）',
        description: '这门科目基本就是以理论为主，学习过程会很艰苦',
        tags: ['入门', '理论']
      },
      {
        title: '模拟与数字电路导论（大二上册）',
        description: '为嵌入式方向做准备',
        tags: ['入门', '理论']
      },
      {
        title: 'Java EE 基础（大二上册）',
        description: '面向对象编程，集合框架等基础知识',
        tags: ['OOP', '集合', '基础']
      },
      {
        title: '计算机网络（教育方向：大二下册）',
        description: '一样偏向于概念的一门科目，但是和我们开发网站学习方向挂钩的内容更多',
        tags: ['入门', '理论']
      },
      {
        title: '操作系统（大二下册）',
        description: '这门科目基本就是以理论为主，学习过程会很艰苦',
        tags: ['入门', '理论']
      },
      {
        title: '软件需求分析与设计（大二下册）',
        description: '新出的课程，我猜测是教学如何进行需求分析的',
        tags: ['基础', '业务']
      },
      {
        title: 'H5编程技术（大二下册，方向课）',
        description: '语法学习，简单爬虫',
        tags: ['语法', '简单爬虫', '基础']
      },
      {
        title: 'Python基础 + 爬虫（大二下册，方向课）',
        description: '语法学习，简单爬虫',
        tags: ['语法', '简单爬虫', '基础']
      },
      {
        title: 'C++基础语法（大二下册，方向课，可能）',
        description: '面向对象基础编程，少许实践',
        tags: ['基础', 'OOP概念']
      },
      {
        title: '软件工程概论（大三上册）',
        description: '主要学习各种业务图的绘制、23种设计模式，前者还行，设计模式上很难与实际项目编程进行有机结合',
        tags: ['基础', '业务']
      },
      {
        title: '软件设计与体系结构（大三上册）',
        description: '新开课程，估计是教学如何设计自己系统整体结构框架的科目',
        tags: ['理论', "实践"]
      },
      {
        title: 'Java EE（大三上册，方向课）',
        description: '学习SSM一套快速开发网站',
        tags: ['基础', "实践"]
      },
      {
        title: '嵌入式系统（大三上册，方向课）',
        description: '新开课程，和硬件紧密结合',
        tags: ['理论', "实践"]
      },
      {
        title: 'Python程序设计（大三上册，方向课）',
        description: '新开课程，和前面提到的Python不清楚区别',
        tags: ['基础', "实践"]
      },
      {
        title: '软件项目管理（大三下册）',
        description: '新开课程，具体内容不详，大概率是教学如何管理项目的科目，高效维护软件产品稳定运行的',
        tags: ['理论', '业务']
      },
      {
        title: '嵌入式高级编程（大三下册，方向课）',
        description: '新开课程，具体内容不详，和硬件相关',
        tags: ['进阶', '嵌入式']
      },
      {
        title: '嵌入式GUI编程（大三下册，方向课）',
        description: '新开课程，具体内容不详，和硬',
        tags: ['进阶', '嵌入式']
      },
      {
        title: '其他（未记录）',
        description: '还有一些未展示，大概率后续会进行变动',
        tags: ['其他']
      },
    ],
    industryContent: [
      {
        title: 'C语言深度掌握（远超课堂）',
        description: '指针与内存管理深度理解、函数指针与回调机制、动态内存分配与内存池、位操作与底层优化、系统调用与Linux编程、网络编程与Socket通信、多进程与IPC通信、信号处理、文件I/O与异步操作、内核模块开发、嵌入式C语言编程、实时系统开发',
        tags: ['指针深度', '内存管理', '系统调用', '网络编程', '内核开发', '嵌入式']
      },
      {
        title: 'C++现代特性与高级编程',
        description: 'C++11/14/17/20/23新特性深度应用、智能指针与RAII、移动语义与完美转发、模板元编程与SFINAE、协程与异步编程、并发编程与线程安全、无锁数据结构、内存模型与原子操作、异常安全编程、STL深度使用与优化、Boost库生态系统',
        tags: ['现代C++', '智能指针', '模板元编程', '协程', '并发编程', 'STL优化']
      },
      {
        title: 'Python全栈开发（不只是爬虫）',
        description: '高级爬虫技术(Scrapy/异步爬虫/分布式爬虫/反反爬)、Web开发框架(Django/Flask/FastAPI)、数据科学栈(Pandas/NumPy/Matplotlib/Jupyter)、机器学习库(Scikit-learn/TensorFlow/PyTorch)、异步编程(asyncio/aiohttp)、微服务开发、API设计、数据库ORM、缓存技术、消息队列',
        tags: ['高级爬虫', 'Django', 'FastAPI', '数据科学', '机器学习', '异步编程']
      },
      {
        title: 'Java企业级开发生态',
        description: 'Spring全家桶(Spring Boot/Cloud/Security)、微服务架构(Dubbo/Spring Cloud Alibaba)、JVM调优与性能分析、并发编程与线程池、分布式系统设计、消息中间件(RabbitMQ/RocketMQ)、分布式缓存(Redis集群)、数据库分库分表、搜索引擎(Elasticsearch)、监控与链路追踪',
        tags: ['Spring Boot', '微服务', 'JVM调优', '分布式', 'Redis', 'Elasticsearch']
      },
      {
        title: '数据库技术栈（远超SQL基础）',
        description: 'MySQL高性能优化与调优、索引设计与查询优化、分库分表与读写分离、主从复制与高可用、NoSQL数据库(MongoDB/Redis/Cassandra)、分布式数据库(TiDB/CockroachDB)、数据仓库建设、OLAP分析、数据同步与ETL、数据库中间件',
        tags: ['MySQL调优', '分库分表', 'NoSQL', '分布式数据库', '数据仓库', 'ETL']
      },
      {
        title: '前端工程化与现代框架',
        description: 'React/Vue/Angular深度开发、TypeScript类型系统、前端工程化(Webpack/Vite/Rollup)、状态管理(Redux/Vuex/Zustand)、组件库开发、微前端架构、PWA渐进式应用、移动端开发、性能优化、自动化测试、CI/CD部署',
        tags: ['React', 'Vue', 'TypeScript', '工程化', '微前端', 'PWA']
      },
      {
        title: '云原生与容器技术',
        description: 'Docker容器化深度应用、Kubernetes集群管理、服务网格(Istio/Linkerd)、微服务架构设计、CI/CD流水线、基础设施即代码(Terraform)、云平台服务(AWS/Azure/阿里云)、监控告警(Prometheus/Grafana)、日志收集(ELK)、链路追踪',
        tags: ['Docker', 'K8s', 'Istio', '微服务', 'Terraform', 'Prometheus']
      },
      {
        title: '人工智能与深度学习（网站进行监控功能开发可使用）',
        description: '深度学习框架(TensorFlow/PyTorch)、计算机视觉(OpenCV/YOLO)、自然语言处理(BERT/GPT/Transformer)、大语言模型开发、RAG检索增强、Agent智能体、MLOps工程化、模型优化与部署、边缘计算、GPU编程(CUDA)',
        tags: ['深度学习', 'TensorFlow', 'PyTorch', 'LLM', 'RAG', 'MLOps']
      },
      {
        title: '系统架构与性能优化（保证服务正常运行，不出灾难性问题）',
        description: 'Linux、高并发系统设计、分布式系统架构、负载均衡与容灾、缓存策略与一致性、消息队列与异步处理、数据库优化与分片、CDN与边缘计算、性能监控与调优、安全防护与渗透测试、业务架构设计',
        tags: ['Linux', '高并发', '分布式', '负载均衡', '缓存策略', '性能调优', '安全防护']
      }
    ]
  },
  bigdata: {
    schoolContent: [
      {
        title: 'C语言(大一上)',
        description: '基础语法，简单算法，指针入门',
        tags: ['入门', '浅显', '基础']
      },
      {
        title: '大数据导论（大一上）',
        description: '对计算机的很多知识进行一概而论，让同学对大数据专业有个大概认识',
        tags: ['入门', '基础']
      },
      {
        title: 'Linux基础（大一上）',
        description: 'Shell命令，文件操作',
        tags: ['命令', '文件', '基础']
      },
      {
        title: '数据结构（简单）（大一下）',
        description: '概念为主，代码为辅，科目抽象难讲，经验不丰富很难讲好',
        tags: ['入门', '基础']
      },
      {
        title: 'Python基础（大二上）',
        description: '语法学习，有一门语言基础，1周基础学习时间都算多了',
        tags: ['语法', '基础']
      },
      {
        title: 'MySQL数据库（大二上）',
        description: '关系数据库理论，SQL基础',
        tags: ['理论', 'SQL', '概念']
      },
      {
        title: '计算机组成原理（大二上）',
        description: '这门科目基本就是以理论为主，学习过程会很艰苦',
        tags: ['入门', '理论']
      },
      {
        title: '网络基础（大二上）',
        description: '一样偏向于概念的一门科目，但是和我们开发网站学习方向挂钩的内容更多',
        tags: ['入门', '理论']
      },
      {
        title: '数据采集和预处理（大二上）',
        description: '单纯就是硬是单独开出一门课程，完全没必要',
        tags: ['基础']
      },
      {
        title: 'Java EE 基础（大二上）',
        description: '面向对象编程，集合框架等基础知识',
        tags: ['OOP', '集合', '基础']
      },
      {
        title: '数据分析与应用（大二下）',
        description: '',
        tags: ['基础']
      },
      {
        title: '操作系统（大二下）',
        description: '这门科目基本就是以理论为主，学习过程会很艰苦',
        tags: ['入门', '理论']
      },
      {
        title: '算法设计与分析（大二下）',
        description: '学习设计算法，无任何意义，太浅了',
        tags: ['基础', '算法']
      },
      {
        title: '机器学习（大二下）',
        description: '和人工智能，训练、数学挂钩',
        tags: ['基础']
      },
      {
        title: '数据挖掘（大二下）',
        description: '主要应该是分析数据，设计数据的结构，清洗数据之类的操作',
        tags: ['基础', '数据清洗']
      },
      {
        title: '并行程序设计（大三上）',
        description: '',
        tags: ['基础', '思维']
      },
      {
        title: 'Hadoop大数据技术与应用（大三上）',
        description: '主要用于大数据分析，TB、EB、PB或者更大数据的分析',
        tags: ['基础', '大数据']
      },
      {
        title: '深度学习（大三上）',
        description: '......',
        tags: ['基础', '深度学习']
      },
      {
        title: '网络安全（大三上）',
        description: '没上过，猜测：学习各种防护措施，如：彩虹表攻击、DDos攻击防护、端口暴露、CSRF攻击等等一系列网络攻击的防护措施吧',
        tags: ['基础', '网络安全']
      },
      {
        title: '自然语言处理（大三下）',
        description: '到这个时间才学这个基本没用了',
        tags: ['基础', '入门']
      },
      {
        title: 'Spark（大三下）',
        description: '和前面的Hadoop有异曲同工作用',
        tags: ['基础', '大数据分析']
      },
      {
        title: '机器视觉（大三下）',
        description: '简单来说，就是和视觉识别有关的代码实现，数学挂钩很重',
        tags: ['基础', 'OpenCv']
      },
    ],
    industryContent: [
      {
        title: 'Java企业级开发（远超基础语法）',
        description: 'Spring全家桶深度应用、Spring Boot微服务开发、Spring Cloud分布式架构、MyBatis/JPA数据持久化、JVM性能调优与内存分析、并发编程与线程池优化、分布式锁与事务、消息中间件集成、缓存策略设计、API网关与服务治理',
        tags: ['Spring Boot', 'Spring Cloud', 'JVM调优', '并发编程', '分布式', '微服务']
      },
      {
        title: 'Python数据工程（不只是语法）',
        description: 'Pandas/NumPy大数据处理、Spark PySpark分布式计算、Airflow工作流调度、数据清洗与ETL开发、API开发与数据服务、Jupyter数据分析、机器学习模型训练、数据可视化(Matplotlib/Seaborn)、异步编程与高并发处理',
        tags: ['Pandas', 'PySpark', 'Airflow', 'ETL', '数据清洗', '机器学习']
      },
      {
        title: 'MySQL高级应用（超越基础SQL）',
        description: 'MySQL性能调优与慢查询优化、索引设计与查询计划分析、分库分表与读写分离、主从复制与高可用架构、分布式事务处理、数据库中间件(Sharding-JDBC/MyCat)、备份恢复策略、监控告警体系',
        tags: ['性能调优', '分库分表', '主从复制', '高可用', '分布式事务', '中间件']
      },
      {
        title: '大数据存储与计算平台',
        description: 'Hadoop生态系统(HDFS/MapReduce/Yarn)、Spark内存计算引擎、Flink实时流处理、Kafka消息队列、HBase列式存储、Hive数据仓库、Impala交互查询、ClickHouse OLAP引擎、Doris实时数仓、数据湖架构设计',
        tags: ['Hadoop', 'Spark', 'Flink', 'Kafka', 'HBase', 'ClickHouse']
      },
      {
        title: '实时数据处理与流计算',
        description: 'Kafka Streams流处理、Flink CEP复杂事件处理、Storm实时计算、实时数仓架构、Lambda/Kappa架构、流批一体处理、实时OLAP查询、数据血缘追踪、实时监控告警、流式机器学习',
        tags: ['实时处理', 'Kafka Streams', 'Flink CEP', '实时数仓', 'Lambda架构', '流式ML']
      },
      {
        title: 'NoSQL与分布式数据库',
        description: 'MongoDB分片集群、Redis高可用集群、Elasticsearch搜索与分析、Cassandra宽列存储、Neo4j图数据库、InfluxDB时序数据库、分布式一致性算法、CAP理论实践、数据分片策略、多数据源整合',
        tags: ['MongoDB', 'Redis集群', 'Elasticsearch', 'Cassandra', '分布式一致性', '数据分片']
      },
      {
        title: '数据仓库与商业智能',
        description: '维度建模与数据建模、ETL/ELT数据管道、数据质量管理、元数据管理、数据治理体系、OLAP多维分析、数据可视化(Tableau/Power BI)、指标体系建设、A/B测试平台、用户画像系统',
        tags: ['维度建模', 'ETL', '数据治理', 'OLAP', '数据可视化', '用户画像']
      },
      {
        title: '机器学习与数据挖掘',
        description: '特征工程与数据预处理、Scikit-learn/XGBoost算法应用、深度学习框架(TensorFlow/PyTorch)、推荐系统算法、时间序列分析、异常检测、聚类分析、分类回归模型、模型评估与调优、MLOps工程化部署',
        tags: ['特征工程', 'XGBoost', '推荐系统', '时间序列', 'MLOps', '模型调优']
      },
      {
        title: '云原生大数据平台',
        description: 'Docker容器化部署、Kubernetes集群管理、云平台大数据服务(AWS EMR/阿里云MaxCompute)、Serverless数据处理、数据湖存储(S3/OSS)、云原生数据库、弹性计算资源管理、成本优化策略',
        tags: ['Docker', 'K8s', '云平台', 'Serverless', '数据湖', '弹性计算']
      },
      {
        title: '数据安全与运维监控',
        description: '数据脱敏与加密、访问控制与权限管理、数据备份与容灾、集群监控与告警、性能调优与故障排查、日志分析与审计、数据血缘与影响分析、SLA服务质量保障、自动化运维体系',
        tags: ['数据安全', '访问控制', '监控告警', '性能调优', '数据血缘', '自动化运维']
      }
    ]
  },
  ai: {
    schoolContent: [
      {
        title: 'Python基础语法',
        description: 'Python语法，函数，面向对象',
        tags: ['语法', '基础', '入门']
      },
      {
        title: '高等数学理论',
        description: '微积分、线性代数、概率论等等一系列3~4门基础课程',
        tags: ['数学', '理论', '公式']
      },
      {
        title: '人工智能导论',
        description: '不详......',
        tags: ['基础', '理论']
      },
      {
        title: '机器学习',
        description: '不详......',
        tags: ['基础', '理论', '实践']
      },
      {
        title: '数字信号处理',
        description: '不详......',
        tags: ['基础', '理论', '实践']
      },
      {
        title: '深度学习',
        description: '不详......',
        tags: ['基础', '理论', '实践']
      },
      {
        title: '机器视觉',
        description: '为数不多有所涉及过的内容，OpenCv主用',
        tags: ['基础', '理论', '视觉识别']
      },
      {
        title: '机器人学基础',
        description: '主要和嵌入式方向挂钩，往硬件方向 + C++/C方向走',
        tags: ['基础', '理论', '实践']
      },
      {
        title: '数据结构（Python版）',
        description: '代码均使用Python实现，其他不详......',
        tags: ['基础','入门', '理论']
      },
      {
        title: '计算机组成原理',
        description: '这门科目基本就是以理论为主，学习过程会很艰苦',
        tags: ['入门', '理论']
      },
      {
        title: '操作系统',
        description: '这门科目基本就是以理论为主，学习过程会很艰苦',
        tags: ['入门', '理论']
      },
      {
        title: '数据结构（Python版）',
        description: '代码均使用Python实现，其他不详......',
        tags: ['基础','入门', '理论']
      },
      {
        title: '操作系统',
        description: '这门科目基本就是以理论为主，学习过程会很艰苦',
        tags: ['入门', '理论']
      },
      {
        title: '高等数学理论',
        description: '微积分、线性代数、概率论等等一系列3~4门基础课程',
        tags: ['数学', '理论', '公式']
      },
      {
        title: 'C++程序设计',
        description: '语法基础........',
        tags: ['入门', '基础']
      },
    ],
    industryContent: [
      {
        title: '不清楚（未知）',
        description: '本校第一次开此专业，未亲自涉及此方面很多知识，不敢妄下断论',
        tags: ['未知']
      },
    ]
  }
}

const getCurrentMajor = computed(() => {
  return majorData[activeMajor.value as keyof typeof majorData]
})

// 实际工作需求分页相关计算属性
const totalPages = computed(() => {
  return Math.ceil(getCurrentMajor.value.industryContent.length / itemsPerPage)
})

const getCurrentPageItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return getCurrentMajor.value.industryContent.slice(start, end)
})

// 学校教学内容分页相关计算属性
const schoolTotalPages = computed(() => {
  return Math.ceil(getCurrentMajor.value.schoolContent.length / schoolItemsPerPage)
})

const getSchoolCurrentPageItems = computed(() => {
  const start = (schoolCurrentPage.value - 1) * schoolItemsPerPage
  const end = start + schoolItemsPerPage
  return getCurrentMajor.value.schoolContent.slice(start, end)
})

// 模态框内容计算属性
const modalContent = computed(() => {
  if (modalType.value === 'school') {
    return getSchoolCurrentPageItems.value
  } else {
    return getCurrentPageItems.value
  }
})

// 实际工作需求分页控制方法
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
}

// 学校教学内容分页控制方法
const schoolNextPage = () => {
  if (schoolCurrentPage.value < schoolTotalPages.value) {
    schoolCurrentPage.value++
  }
}

const schoolPreviousPage = () => {
  if (schoolCurrentPage.value > 1) {
    schoolCurrentPage.value--
  }
}

const schoolGoToPage = (page: number) => {
  schoolCurrentPage.value = page
}

// 获取简短描述的方法
const getBriefDescription = (description: string) => {
  if (description.length <= 30) {
    return description
  }
  return description.substring(0, 30) + '...'
}

// 模态框控制方法
const openModal = (type: 'school' | 'industry') => {
  modalType.value = type
  modalTitle.value = type === 'school' ? '学校教学内容' : '实际工作需求'
  showModal.value = true
  document.body.style.overflow = 'hidden' // 防止背景滚动
  
  // 添加ESC键监听
  document.addEventListener('keydown', handleEscKey)
}

const closeModal = () => {
  showModal.value = false
  document.body.style.overflow = 'auto' // 恢复滚动
  
  // 移除ESC键监听
  document.removeEventListener('keydown', handleEscKey)
}

// ESC键处理函数
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal()
  }
}

// 监听专业切换，重置分页
watch(activeMajor, () => {
  currentPage.value = 1
  schoolCurrentPage.value = 1
  closeModal() // 切换专业时关闭模态框
})
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

/* 专业对比功能样式 */
/* 专业选择标签 */
.tabs-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-button.active {
  background: white;
  color: #4f46e5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-button:hover:not(.active) {
  color: #374151;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 对比内容 */
.comparison-content {
  margin-bottom: 2rem;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: start;
}

.content-card {
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

/* 学校内容卡片 - 浅蓝色主题 */
.school-content {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 3px solid #3b82f6;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.25);
}

/* 实际工作需求卡片 - 浅绿色主题 */
.industry-content {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 3px solid #10b981;
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.25);
}

.content-card:hover {
  transform: translateY(-4px);
}

.school-content:hover {
  box-shadow: 0 20px 40px -5px rgba(59, 130, 246, 0.35);
}

.industry-content:hover {
  box-shadow: 0 20px 40px -5px rgba(16, 185, 129, 0.35);
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.school-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.industry-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.icon {
  width: 30px;
  height: 30px;
}

.card-header h4 {
  font-size: 1.5rem !important;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.school-content h4 {
  color: #3b82f6;
}

.industry-content h4 {
  color: #10b981;
}

.card-subtitle {
  color: #6b7280;
  font-size: 0.9rem;
}

/* 页面信息 */
.page-info {
  font-size: 0.8rem;
  color: #9ca3af;
  text-align: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
}

/* 放大提示 */
.zoom-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.zoom-icon {
  width: 14px;
  height: 14px;
}

.content-card:hover .zoom-hint {
  color: #374151;
  background: rgba(0, 0, 0, 0.06);
}

/* 内容列表 */
.content-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 350px;
}

.content-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  opacity: 0;
  animation: slideInUp 0.6s ease forwards;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.school-item {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-left: 4px solid #0ea5e9;
}

.industry-item {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-left: 4px solid #22c55e;
}

.content-item:hover {
  transform: translateX(8px);
}

.item-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.item-content h5 {
  font-size: 1.1rem !important;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.item-content p {
  color: #4b5563;
  margin-bottom: 1.25rem;
  line-height: 1.6;
}

.item-description-brief {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 0.9rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tag {
  padding: 0.375rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.school-tag {
  background: #0ea5e9;
  color: white;
}

.industry-tag {
  background: #22c55e;
  color: white;
}

.tag-more {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #e5e7eb;
  color: #6b7280;
  cursor: help;
  transition: all 0.2s ease;
}

.tag-more:hover {
  background: #d1d5db;
  color: #374151;
}

/* VS 分隔符 */
.vs-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 100%;
  min-height: 400px;
}

.vs-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  z-index: 2;
}

.vs-text {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
}

.divider-line {
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom, transparent, #e5e7eb, transparent);
  z-index: 1;
}

/* 分页控制器 */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.pagination-icon {
  width: 24px;
  height: 24px;
}

.pagination-dots {
  display: flex;
  gap: 0.5rem;
}

.pagination-dot {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: white;
  border: 1px solid #d1d5db;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-dot:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-dot.active {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: #059669;
  color: white;
  transform: scale(1.1);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-container {
  background: white;
  border-radius: 20px;
  width: 90vw;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-header h2 {
  font-size: 1.5rem !important;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn svg {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.modal-content {
  padding: 0;
  max-height: calc(90vh - 100px);
  overflow-y: auto;
}

.modal-card {
  padding: 2rem;
}

.school-modal {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.industry-modal {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}

.modal-info {
  text-align: center;
  margin-bottom: 2rem;
}

.page-info-modal {
  font-size: 0.9rem;
  color: #6b7280;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  display: inline-block;
}

.modal-content-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.modal-content-item {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 12px;
  opacity: 0;
  animation: slideInUp 0.6s ease forwards;
}

.school-modal-item {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-left: 4px solid #0ea5e9;
}

.industry-modal-item {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-left: 4px solid #22c55e;
}

.modal-item-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.modal-item-content h4 {
  font-size: 1.3rem !important;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.modal-item-content p {
  color: #4b5563;
  margin-bottom: 1.5rem;
  line-height: 1.7;
  font-size: 1rem;
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.modal-tag {
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.school-modal-tag {
  background: #0ea5e9;
  color: white;
}

.industry-modal-tag {
  background: #22c55e;
  color: white;
}

.modal-pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.modal-pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-pagination-dots {
  display: flex;
  gap: 0.75rem;
}

.modal-pagination-dot {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: white;
  border: 1px solid #d1d5db;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-pagination-dot:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.modal-pagination-dot.active {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: #059669;
  color: white;
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .comparison-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .vs-divider {
    order: 2;
    min-height: 80px;
    flex-direction: row;
  }

  .vs-circle {
    width: 60px;
    height: 60px;
  }

  .vs-text {
    font-size: 1.2rem;
  }

  .divider-line {
    width: 100%;
    height: 2px;
  }

  .school-content {
    order: 1;
  }

  .industry-content {
    order: 3;
  }
}

@media (max-width: 768px) {
  .tabs {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }

  .content-card {
    padding: 1rem;
  }

  .content-list {
    min-height: 270px;
    gap: 0.75rem;
  }

  .content-item {
    padding: 1rem;
    gap: 0.75rem;
  }

  .pagination-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-btn {
    width: 100%;
    justify-content: center;
  }

  .pagination-dots {
    justify-content: center;
  }

  /* 模态框移动端适配 */
  .modal-container {
    width: 95vw;
    max-height: 95vh;
  }

  .modal-header {
    padding: 1rem 1.5rem;
  }

  .modal-card {
    padding: 1.5rem;
  }

  .modal-content-item {
    padding: 1.5rem;
    gap: 1rem;
  }

  .modal-item-content h4 {
    font-size: 1.1rem !important;
  }

  .modal-pagination-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .modal-pagination-btn {
    width: 100%;
    justify-content: center;
  }

  .modal-pagination-dots {
    justify-content: center;
  }
}

/* 专业切换动画效果 */
.major-switch-enter-active,
.major-switch-leave-active {
  transition: all 0.5s ease-in-out;
}

.major-switch-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.98);
}

.major-switch-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.98);
}

.major-switch-enter-to,
.major-switch-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}

/* 增强标签按钮的激活效果 */
.tab-button.active {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4) !important;
  transform: translateY(-2px);
}

.tab-button.active:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.5) !important;
}

/* 添加按钮点击时的反馈效果 */
.tab-button:active {
  transform: translateY(0);
  transition: transform 0.1s ease;
}

/* 为内容卡片添加切换时的微妙动画 */
.major-switch-enter-active .content-card {
  animation: cardSlideIn 0.6s ease-out;
}

@keyframes cardSlideIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>