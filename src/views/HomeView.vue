<template>
  <el-container class="home-container">
    <el-main>
      <el-card class="welcome-card">
        <template #header>
          <div class="card-header">
            <span>欢迎使用 ByteOJ 后台管理系统</span>
          </div>
        </template>
        <p class="welcome-text">欢迎您，管理员！探索 ByteOJ 后台管理系统的强大功能，从以下模块快速开始管理平台内容：</p>
      </el-card>

      <el-row :gutter="20" class="quick-access">
        <el-col :span="8">
          <el-card shadow="hover" class="module-card" @click="RouterToUserList">
            <div class="module-content">
              <el-icon size="48" class="module-icon"><User /></el-icon>
              <h3 class="module-title">用户管理</h3>
              <p class="module-description">管理用户和管理员信息、角色权限</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="module-card" @click="RouterToAlgorithm">
            <div class="module-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" class="module-icon">
                <path fill="currentColor" d="M4 19v-2h10v2zm0-4v-2h16v2zm0-4V9h16v2zm0-4V5h16v2z"/>
              </svg>
              <h3 class="module-title">题目管理</h3>
              <p class="module-description">创建和管理算法与数学408试题</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="module-card" @click="RouterToCompetition">
            <div class="module-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 1025 1024" class="module-icon">
                <path fill="currentColor" d="M1024.488 704q-8-8-23-17q-1-1-7-4q-11-6-22-11q-6-3-8-3q-31-13-68-21V515q73 10 128 61zm-204-192q-23 0-52 3V387q29-3 52-3q50 0 76 3v128q-25-3-76-3m-52-253V131q29-3 52-3q51 0 76 3v128q-25-3-76-3q-23 0-52 3m-256 79V210q95-39 128-50v128q-31 10-128 50m-177 46q-38 0-79-8V248q41 8 79 8q22 0 49-5v128q-27 5-49 5m-207-64q43 39 128 56v128q-86-17-128-56v128q43 39 128 56v133q-14-2-29-6q-2 0-5-1t-3-2q-11-3-21-7q-6-2-10-4q-10-5-21-12q-8-5-9-5q-17-12-30-24v256q0 26-19 45t-45.5 19t-45-19t-18.5-45V64q0-27 18.5-45.5t45-18.5t45.5 18.5t19 45.5q9 9 24 18q1 0 2.5 1l3 2l2.5 1q10 6 21 11q5 2 8 4q15 5 28 9l3 1q17 5 36 9v128q-85-17-128-56zm207 192q22 0 49-5v128q-27 5-49 5q-38 0-79-8V504q41 8 79 8m305-96v128q-32 11-128 50V466q95-39 128-50m0-128q67-22 128-29v128q-61 7-128 29zm-256 219V379q48-8 128-41v128q-80 33-128 41m384 136q-62 6-128 28V544q67-22 128-29zm-256 78q-15 6-28 11q-3 1-7 3q-11 4-25 9l-6 2q-17 6-30 9q-17 5-32 8V635q48-8 128-41zm-128-598q40-7 95-28l1-.5l2-.5q16-6 30-12v128q-80 33-128 41zm256-91q67-22 128-29v128q-61 7-128 29zm285-23q2 0 4.5 1t3.5 1q11 3 22 8q4 2 9 4q10 5 21 12q8 5 9 5q17 12 30 24v128q-55-51-128-61V3q14 2 29 6m99 311v128q-55-51-128-61V259q73 10 128 61m-204-320h2z"/>
              </svg>
              <h3 class="module-title">竞赛管理</h3>
              <p class="module-description">创建和管理比赛</p>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="quick-access">
        <el-col :span="8">
          <el-card shadow="hover" class="module-card">
            <div class="module-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" class="module-icon">
                <g fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M2.906 17.505L5.337 3.718a2 2 0 0 1 2.317-1.623L19.472 4.18a2 2 0 0 1 1.622 2.317l-2.431 13.787a2 2 0 0 1-2.317 1.623L4.528 19.822a2 2 0 0 1-1.622-2.317Z"/>
                  <path stroke-linecap="round" d="m8.929 6.382l7.879 1.389m-8.574 2.55l7.879 1.39M7.54 14.26l4.924.869"/>
                </g>
              </svg>
              <h3 class="module-title">帖子管理</h3>
              <p class="module-description">管理帖子和评论信息</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="module-card">
            <div class="module-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 2048 2048" class="module-icon">
                <path fill="currentColor" d="M1920 128v1792H0V128h384V0h128v128h896V0h128v128zM128 256v256h1664V256h-256v128h-128V256H512v128H384V256zm1664 1536V640H128v1152zm-440-768l-241 189l101 315l-252-197l-252 197l101-315l-241-189h302l90-280l90 280z"/>
              </svg>
              <h3 class="module-title">专题管理</h3>
              <p class="module-description">创建和管理专题及帖子</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="module-card">
            <div class="module-content">
              <el-icon size="48" class="module-icon"><ChatDotRound /></el-icon>
              <h3 class="module-title">聊天室管理</h3>
              <p class="module-description">管理聊天室及聊天记录</p>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="quick-access">
        <el-col :span="8">
          <el-card shadow="hover" class="module-card">
            <div class="module-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" class="module-icon">
                <path fill="currentColor" fill-rule="evenodd" d="M22.75 4.933c0-1.463-1.165-2.718-2.694-2.665c-1.139.04-2.626.158-3.771.501c-.995.298-2.114.88-2.987 1.385a2.77 2.77 0 0 1-2.665.058c-.996-.526-2.305-1.15-3.442-1.45c-.96-.253-2.176-.375-3.163-.436C2.47 2.231 1.25 3.5 1.25 4.998v11.146c0 1.536 1.244 2.735 2.718 2.827c.959.06 2.038.176 2.84.388c.993.261 2.22.844 3.212 1.372a4.224 4.224 0 0 0 3.96 0c.991-.528 2.219-1.11 3.211-1.372c.803-.212 1.882-.328 2.841-.388c1.474-.092 2.718-1.291 2.718-2.827zm-2.642-1.166c.615-.021 1.142.485 1.142 1.166v11.21c0 .686-.568 1.285-1.312 1.331c-.98.062-2.179.183-3.13.434c-1.17.31-2.525.962-3.533 1.5c-.168.09-.344.16-.525.211V5.942c.452-.09.892-.254 1.3-.49c.85-.492 1.845-1 2.665-1.246c.95-.284 2.274-.4 3.393-.439M11.25 5.975a4.199 4.199 0 0 1-1.318-.436c-.977-.517-2.161-1.072-3.123-1.326c-.813-.215-1.907-.33-2.873-.39c-.634-.038-1.186.478-1.186 1.175v11.146c0 .685.568 1.284 1.312 1.33c.98.062 2.179.183 3.13.434c1.17.31 2.525.962 3.533 1.5c.168.09.345.16.525.211z" clip-rule="evenodd"/>
              </svg>
              <h3 class="module-title">提交记录管理</h3>
              <p class="module-description">查看和管理试题提交记录</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="module-card">
            <div class="module-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" class="module-icon">
                <path fill="currentColor" d="M5.616 20q-.691 0-1.153-.462T4 18.384V5.616q0-.691.463-1.153T5.616 4h12.769q.69 0 1.153.463T20 5.616v12.769q0 .69-.462 1.153T18.384 20zm0-1h12.769q.23 0 .423-.192t.192-.424V5.616q0-.231-.192-.424T18.384 5H5.616q-.231 0-.424.192T5 5.616v12.769q0 .23.192.423t.423.192M7.5 16.5h9.154l-2.827-3.77l-2.615 3.308l-1.75-2.115zM5 19V5z"/>
              </svg>
              <h3 class="module-title">图片管理</h3>
              <p class="module-description">管理默认图片和用户上传图片</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="module-card">
            <div class="module-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" class="module-icon">
                <path fill="currentColor" d="M3.48 19V5h14v6.27l3.04-3.04v7.54l-3.04-3.04V19zm1-1h12V6h-12zm0 0V6zm1.655-2.27h8.692l-2.758-3.653l-2.454 3.077l-1.588-1.885z"/>
              </svg>
              <h3 class="module-title">视频管理</h3>
              <p class="module-description">管理视频信息</p>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="quick-access">
        <el-col :span="8">
          <el-card shadow="hover" class="module-card" @click="RouterToLogAdmin">
            <div class="module-content">
              <svg t="1752938041479" class="icon module-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4630" width="48" height="48">
                <path d="M819.9 472.9L675 723.9l1.7 99.4 86.9-48.3 144.9-251-88.6-51.1zM871.1 384.3L837 443.4l88.6 51.1 34.1-59.1-88.6-51.1zM544.3 703h-288c-17.7 0-32 14.3-32 32s14.3 32 32 32h288c17.7 0 32-14.3 32-32s-14.3-32-32-32zM256.3 511c-17.7 0-32 14.3-32 32s14.3 32 32 32h384c17.7 0 32-14.3 32-32s-14.3-32-32-32h-384zM256.3 319c-17.7 0-32 14.3-32 32s14.3 32 32 32h384c17.7 0 32-14.3 32-32s-14.3-32-32-32h-384zM288 64h64v160h-64zM384 128h128v64H384zM544 64h64v160h-64z" p-id="4631"/>
                <path d="M768 864c0 17.7-14.3 32-32 32H160c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32h96v-64h-96c-53 0-96 43-96 96v640c0 53 43 96 96 96h576c53 0 96-43 96-96V686.7L768 798v66zM832 224c0-53-43-96-96-96h-96v64h96c17.7 0 32 14.3 32 32v311l64-111.3V224z" p-id="4632"/>
              </svg>
              <h3 class="module-title">日志管理</h3>
              <p class="module-description">查看和管理系统日志</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { User, ChatDotRound } from '@element-plus/icons-vue'

const router = useRouter()

const RouterToUserList = () => {
  router.push('/user/list')
}

const RouterToAlgorithm = () => {
  router.push('/problem/algorithm/list')
}

const RouterToCompetition = () => {
  router.push('/competition/list')
}

const RouterToLogAdmin = () => {
  router.push('/log')
}
</script>

<style scoped>
.home-container {
  padding: 30px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  min-height: 100vh;
}

.welcome-card {
  margin-bottom: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: #ffffff;
  transition: transform 0.3s ease;
}

.welcome-card:hover {
  transform: translateY(-5px);
}

.card-header {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  background: linear-gradient(to right, #409eff, #79bbff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.welcome-text {
  font-size: 16px;
  line-height: 1.6;
  color: #34495e;
}

.quick-access {
  margin-bottom: 30px;
}

.module-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #ffffff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.module-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.module-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
}

.module-icon {
  color: #409eff;
  margin-bottom: 15px;
  transition: transform 0.3s ease;
}

.module-card:hover .module-icon {
  transform: scale(1.2);
}

.module-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 10px 0;
  background: linear-gradient(to right, #409eff, #79bbff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.module-description {
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.5;
}
</style>