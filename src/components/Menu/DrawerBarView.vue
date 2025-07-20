<template>
  <el-radio-group v-model="isCollapse" style="margin-bottom: 20px">
    <el-radio-button @click="swap" :value="isCollapse"
      >{{ isCollapse == true ? "展开" : "收起" }}
    </el-radio-button>
  </el-radio-group>
  <el-menu
    default-active="2"
    class="el-menu-vertical-demo"
    :collapse="isCollapse"
    @open="handleOpen"
    @close="handleClose"
  >
    <el-sub-menu index="1">
      <template #title>
        <el-icon size="40">
          <User />
        </el-icon>
        <span>用户管理页面</span>
      </template>
      <el-menu-item-group
        v-if="useStore.loginUser.uuid == 9"

      >
        <template #title><span>管理员</span></template>
        <el-menu-item index="1-1-1" @click="RouterToAdminList">管理员管理</el-menu-item>
        <el-menu-item index="1-1-2" @click="RouterToAdminAuth">角色管理</el-menu-item>
      </el-menu-item-group>
      <el-menu-item-group>
        <template #title><span>用户</span></template>
        <el-menu-item index="1-2" @click="RouterToUserList"
          >用户管理
        </el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>
    <el-sub-menu index="2">
      <template #title>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          viewBox="0 0 24 24"
        >
          <path
            fill="#000000"
            d="M4 19v-2h10v2zm0-4v-2h16v2zm0-4V9h16v2zm0-4V5h16v2z"
          />
        </svg>
        <span>题目管理页面</span>
      </template>
      <el-menu-item-group>
        <template #title><span>Algorithm管理</span></template>
        <el-menu-item index="2-1-1" @click="RouterToAlgorithmAdd"
          >算法试题创建</el-menu-item
        >
        <el-menu-item index="2-1-2" @click="RouterToAlgorithm"
          >算法试题管理</el-menu-item
        >
      </el-menu-item-group>
      <el-menu-item-group>
        <template #title><span>Math408管理</span></template>
        <el-menu-item index="2-2-1" @click="RouterToMath408Add"
          >数学408试题创建</el-menu-item
        >
        <el-menu-item index="2-2-2" @click="RouterToMath408"
          >数学408试题管理</el-menu-item
        >
      </el-menu-item-group>
    </el-sub-menu>
    <el-sub-menu index="3">
      <template #title>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="24.975609756097562"
          viewBox="0 0 1025 1024"
        >
          <path
            fill="#000000"
            d="M1024.488 704q-8-8-23-17q-1-1-7-4q-11-6-22-11q-6-3-8-3q-31-13-68-21V515q73 10 128 61zm-204-192q-23 0-52 3V387q29-3 52-3q50 0 76 3v128q-25-3-76-3m-52-253V131q29-3 52-3q51 0 76 3v128q-25-3-76-3q-23 0-52 3m-256 79V210q95-39 128-50v128q-31 10-128 50m-177 46q-38 0-79-8V248q41 8 79 8q22 0 49-5v128q-27 5-49 5m-207-64q43 39 128 56v128q-86-17-128-56v128q43 39 128 56v133q-14-2-29-6q-2 0-5-1t-3-2q-11-3-21-7q-6-2-10-4q-10-5-21-12q-8-5-9-5q-17-12-30-24v256q0 26-19 45t-45.5 19t-45-19t-18.5-45V64q0-27 18.5-45.5t45-18.5t45.5 18.5t19 45.5q9 9 24 18q1 0 2.5 1l3 2l2.5 1q10 6 21 11q5 2 8 4q15 5 28 9l3 1q17 5 36 9v128q-85-17-128-56zm207 192q22 0 49-5v128q-27 5-49 5q-38 0-79-8V504q41 8 79 8m305-96v128q-32 11-128 50V466q95-39 128-50m0-128q67-22 128-29v128q-61 7-128 29zm-256 219V379q48-8 128-41v128q-80 33-128 41m384 136q-62 6-128 28V544q67-22 128-29zm-256 78q-15 6-28 11q-3 1-7 3q-11 4-25 9l-6 2q-17 6-30 9q-17 5-32 8V635q48-8 128-41zm-128-598q40-7 95-28l1-.5l2-.5q16-6 30-12v128q-80 33-128 41zm256-91q67-22 128-29v128q-61 7-128 29zm285-23q2 0 4.5 1t3.5 1q11 3 22 8q4 2 9 4q10 5 21 12q8 5 9 5q17 12 30 24v128q-55-51-128-61V3q14 2 29 6m99 311v128q-55-51-128-61V259q73 10 128 61m-204-320h2z"
          />
        </svg>
        <span>竞赛管理页面</span>
      </template>
      <el-menu-item-group>
        <template #title><span>比赛</span></template>
        <el-menu-item index="3-1-1">比赛创建(含管理员特权)</el-menu-item>
        <el-menu-item index="3-1-2" @click="RouterToCompetition">比赛管理</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>
    <el-sub-menu index="4">
      <template #title>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          viewBox="0 0 24 24"
        >
          <g fill="none" stroke="#000000" stroke-width="1.5">
            <path
              d="M2.906 17.505L5.337 3.718a2 2 0 0 1 2.317-1.623L19.472 4.18a2 2 0 0 1 1.622 2.317l-2.431 13.787a2 2 0 0 1-2.317 1.623L4.528 19.822a2 2 0 0 1-1.622-2.317Z"
            />
            <path
              stroke-linecap="round"
              d="m8.929 6.382l7.879 1.389m-8.574 2.55l7.879 1.39M7.54 14.26l4.924.869"
            />
          </g>
        </svg>
        <span>帖子管理页面</span>
      </template>
      <el-menu-item-group>
        <template #title>
          <span>帖子管理</span>
        </template>
        <el-menu-item index="4-1-1">帖子信息管理</el-menu-item>
        <el-menu-item index="4-1-2">评论信息管理</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>
    <el-sub-menu index="5">
      <template #title>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          viewBox="0 0 2048 2048"
        >
          <path
            fill="#000000"
            d="M1920 128v1792H0V128h384V0h128v128h896V0h128v128zM128 256v256h1664V256h-256v128h-128V256H512v128H384V256zm1664 1536V640H128v1152zm-440-768l-241 189l101 315l-252-197l-252 197l101-315l-241-189h302l90-280l90 280z"
          />
        </svg>
        <span>专题管理页面</span>
      </template>
      <el-menu-item-group>
        <template #title>
          <span>创建专题</span>
        </template>
        <el-menu-item index="5-1-1">专题创建</el-menu-item>
        <el-menu-item index="5-1-2">专题帖子创建</el-menu-item>
      </el-menu-item-group>
      <el-menu-item-group>
        <template #title>
          <span>管理专题</span>
        </template>
        <el-menu-item index="5-2-1">专题帖子管理</el-menu-item>
        <el-menu-item index="5-2-2">专题信息管理</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>
    <el-sub-menu index="6">
      <template #title>
        <el-icon size="40">
          <ChatDotRound />
        </el-icon>
        <span>聊天室管理页面</span>
      </template>
      <el-menu-item-group>
        <template #title>
          <span>管理大型聊天室</span>
        </template>
        <el-menu-item index="6-1-1">聊天室管理</el-menu-item>
        <el-menu-item index="6-1-2">聊天记录管理</el-menu-item>
      </el-menu-item-group>
      <el-menu-item-group>
        <template #title>
          <span>管理私人聊天记录</span>
        </template>
        <el-menu-item index="6-2-1">私人聊天记录管理</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>
    <el-sub-menu index="7">
      <template #title>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          viewBox="0 0 24 24"
        >
          <path
            fill="#000000"
            fill-rule="evenodd"
            d="M22.75 4.933c0-1.463-1.165-2.718-2.694-2.665c-1.139.04-2.626.158-3.771.501c-.995.298-2.114.88-2.987 1.385a2.77 2.77 0 0 1-2.665.058c-.996-.526-2.305-1.15-3.442-1.45c-.96-.253-2.176-.375-3.163-.436C2.47 2.231 1.25 3.5 1.25 4.998v11.146c0 1.536 1.244 2.735 2.718 2.827c.959.06 2.038.176 2.84.388c.993.261 2.22.844 3.212 1.372a4.224 4.224 0 0 0 3.96 0c.991-.528 2.219-1.11 3.211-1.372c.803-.212 1.882-.328 2.841-.388c1.474-.092 2.718-1.291 2.718-2.827zm-2.642-1.166c.615-.021 1.142.485 1.142 1.166v11.21c0 .686-.568 1.285-1.312 1.331c-.98.062-2.179.183-3.13.434c-1.17.31-2.525.962-3.533 1.5c-.168.09-.344.16-.525.211V5.942c.452-.09.892-.254 1.3-.49c.85-.492 1.845-1 2.665-1.246c.95-.284 2.274-.4 3.393-.439M11.25 5.975a4.199 4.199 0 0 1-1.318-.436c-.977-.517-2.161-1.072-3.123-1.326c-.813-.215-1.907-.33-2.873-.39c-.634-.038-1.186.478-1.186 1.175v11.146c0 .685.568 1.284 1.312 1.33c.98.062 2.179.183 3.13.434c1.17.31 2.525.962 3.533 1.5c.168.09.345.16.525.211z"
            clip-rule="evenodd"
          />
        </svg>
        <span>提交记录管理页面</span>
      </template>
      <el-menu-item-group>
        <template #title>
          <span>Algorithm 算法编程试题管理</span>
        </template>
        <el-menu-item index="7-1-1">Algorithm 提交记录</el-menu-item>
      </el-menu-item-group>
      <el-menu-item-group>
        <template #title>
          <span>Math 数学试题管理</span>
        </template>
        <el-menu-item index="7-2-1">Math 数学试题提交记录</el-menu-item>
      </el-menu-item-group>
      <el-menu-item-group>
        <template #title>
          <span>Math 数学试题管理</span>
        </template>
        <el-menu-item index="7-3-1">Computer 408提交记录</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>
    <el-sub-menu index="8">
      <template #title>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
        >
          <path
            fill="#000000"
            d="M5.616 20q-.691 0-1.153-.462T4 18.384V5.616q0-.691.463-1.153T5.616 4h12.769q.69 0 1.153.463T20 5.616v12.769q0 .69-.462 1.153T18.384 20zm0-1h12.769q.23 0 .423-.192t.192-.424V5.616q0-.231-.192-.424T18.384 5H5.616q-.231 0-.424.192T5 5.616v12.769q0 .23.192.423t.423.192M7.5 16.5h9.154l-2.827-3.77l-2.615 3.308l-1.75-2.115zM5 19V5z"
          />
        </svg>
        <span>图片管理页面</span>
      </template>
      <el-menu-item-group>
        <template #title>
          <span>设置默认图片</span>
        </template>
        <el-menu-item index="9-1-1">默认图片管理</el-menu-item>
      </el-menu-item-group>
      <el-menu-item-group>
        <template #title>
          <span>管理用户图片</span>
        </template>
        <el-menu-item index="9-1-1">用户图片管理</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>
    <el-sub-menu index="9">
      <template #title>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
        >
          <path
            fill="#000000"
            d="M3.48 19V5h14v6.27l3.04-3.04v7.54l-3.04-3.04V19zm1-1h12V6h-12zm0 0V6zm1.655-2.27h8.692l-2.758-3.653l-2.454 3.077l-1.588-1.885z"
          />
        </svg>
        <span>视频管理页面</span>
      </template>
      <el-menu-item-group>
        <template #title>
          <span>视频管理</span>
        </template>
        <el-menu-item index="9-1-2">视频信息管理</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>
    <el-sub-menu index="10">
      <template #title>
        <svg t="1752938041479" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4630" width="30" height="30"><path d="M819.9 472.9L675 723.9l1.7 99.4 86.9-48.3 144.9-251-88.6-51.1zM871.1 384.3L837 443.4l88.6 51.1 34.1-59.1-88.6-51.1zM544.3 703h-288c-17.7 0-32 14.3-32 32s14.3 32 32 32h288c17.7 0 32-14.3 32-32s-14.3-32-32-32zM256.3 511c-17.7 0-32 14.3-32 32s14.3 32 32 32h384c17.7 0 32-14.3 32-32s-14.3-32-32-32h-384zM256.3 319c-17.7 0-32 14.3-32 32s14.3 32 32 32h384c17.7 0 32-14.3 32-32s-14.3-32-32-32h-384zM288 64h64v160h-64zM384 128h128v64H384zM544 64h64v160h-64z" p-id="4631"></path><path d="M768 864c0 17.7-14.3 32-32 32H160c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32h96v-64h-96c-53 0-96 43-96 96v640c0 53 43 96 96 96h576c53 0 96-43 96-96V686.7L768 798v66zM832 224c0-53-43-96-96-96h-96v64h96c17.7 0 32 14.3 32 32v311l64-111.3V224z" p-id="4632"></path></svg>
        <span>日志管理页面</span>
      </template>
      <el-menu-item-group>
        <template #title>
          <span>日志管理模块</span>
        </template>
        <el-menu-item index="10-1-1" @click="RouterToLogAdmin">日志管理</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import router from "../../router";
import UseStore from "../../store/store.ts";

const useStore = UseStore();
const isCollapse = ref(false);
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};

const swap = () => {
  isCollapse.value = isCollapse.value != true;
};

// 跳转用户信息管理页面
const RouterToUserList = () => {
  router.push("/user/list");
};

// 跳转管理员信息管理页面(仅仅BOSS管理员可进行)
const RouterToAdminList = () => {
  router.push("/admin/list");
};

// 跳转到权限分配页面
const RouterToAdminAuth = () => {
  router.push("/admin/auth")
}
// 跳转管理员Algorithm试题管理页面
const RouterToAlgorithm = () => {
  router.push("/problem/algorithm/list");
};

// 跳转管理员Algorithm创建试题页面
const RouterToAlgorithmAdd = () => {
  router.push("/problem/algorithm/add");
};

// 跳转管理员Math408试题管理页面
const RouterToMath408 = () => {
  router.push("/problem/math408/list");
};

// 跳转管理员Math408创建试题页面
const RouterToMath408Add = () => {
  router.push("/problem/math408/add");
};

// 跳转导竞赛页面
const RouterToCompetition = () => {
  router.push("/competition/list");
}

// 跳转至日志管理页面
const RouterToLogAdmin = () => {
  router.push("/log");
}
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
