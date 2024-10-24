<!--<script setup lang="ts">-->
<!--import * as echarts from "echarts";-->
<!--import { onMounted } from "vue";-->
<!--import router from "@/router";-->

<!--// 定义图表和选项-->
<!--let myChart;-->
<!--let option;-->

<!--// 用于存储点击节点的路径历史-->
<!--const historyStack: any[] = [];-->
<!--const storageKey = "treemapData";-->

<!--// 初始数据-->
<!--const initialData = {-->
<!--  算法入门学习: {-->
<!--    学习的第一步: {-->
<!--      $count: 1,-->
<!--      $url: "http://localhost:8080/posts/185",-->
<!--    },-->
<!--    相关竞赛_难度从上往下依次增高: {-->
<!--      $count: 1,-->
<!--      $url: "http://localhost:8080/posts/185",-->
<!--    },-->
<!--  },-->
<!--  算法能力提高学习: {-->
<!--    bar: {-->
<!--      bar2: {-->
<!--        $count: 1,-->
<!--        $url: "https://www.rzcode.top",-->
<!--      },-->
<!--      bar: {-->
<!--        $count: 1,-->
<!--        $url: "https://www.rzcode.top",-->
<!--      },-->
<!--    },-->
<!--  },-->
<!--  算法进阶学习: {-->
<!--    bar: {-->
<!--      bar2: {-->
<!--        $count: 1,-->
<!--      },-->
<!--    },-->
<!--  },-->
<!--};-->

<!--// 转换数据函数-->
<!--const convert = (source, target, basePath) => {-->
<!--  for (let key in source) {-->
<!--    if (!key.match(/^\$/)) {-->
<!--      target.children = target.children || [];-->
<!--      const child = {-->
<!--        name: key,-->
<!--        url: source[key].$url || "/posts/186", // 设置 URL-->
<!--        id: basePath ? `${basePath}_${key}` : key, // 为每个节点设置唯一 ID-->
<!--      };-->
<!--      target.children.push(child);-->
<!--      convert(source[key], child, key);-->
<!--    }-->
<!--  }-->
<!--  if (!target.children) {-->
<!--    target.value = source.$count || 1;-->
<!--  } else {-->
<!--    target.children.push({-->
<!--      name: basePath,-->
<!--      value: source.$count,-->
<!--    });-->
<!--  }-->
<!--};-->

<!--// 初始化图表-->
<!--onMounted(() => {-->
<!--  const chartDom = document.getElementById("main");-->
<!--  myChart = echarts.init(chartDom);-->
<!--  myChart.showLoading();-->

<!--  const targetData = { children: [] };-->
<!--  convert(initialData, targetData, "");-->
<!--  myChart.hideLoading();-->

<!--  myChart.setOption(-->
<!--    (option = {-->
<!--      title: {-->
<!--        text: "编程学习基本路线",-->
<!--        subtext: "2024/8/05",-->
<!--        left: "center",-->
<!--      },-->
<!--      tooltip: {},-->
<!--      series: [-->
<!--        {-->
<!--          name: "option",-->
<!--          leafDepth: 1,-->
<!--          type: "treemap",-->
<!--          visibleMin: 300,-->
<!--          roam: false,-->
<!--          data: targetData.children,-->
<!--          label: {-->
<!--            show: true,-->
<!--            fontSize: 24,-->
<!--          },-->
<!--          levels: [-->
<!--            {-->
<!--              itemStyle: {-->
<!--                borderColor: "#555",-->
<!--                borderWidth: 4,-->
<!--                gapWidth: 4,-->
<!--              },-->
<!--            },-->
<!--            {-->
<!--              colorSaturation: [0.3, 0.6],-->
<!--              itemStyle: {-->
<!--                borderColorSaturation: 0.7,-->
<!--                gapWidth: 2,-->
<!--                borderWidth: 2,-->
<!--              },-->
<!--            },-->
<!--            {-->
<!--              colorSaturation: [0.3, 0.5],-->
<!--              itemStyle: {-->
<!--                borderColorSaturation: 0.6,-->
<!--                gapWidth: 1,-->
<!--              },-->
<!--            },-->
<!--            {-->
<!--              colorSaturation: [0.3, 0.5],-->
<!--            },-->
<!--          ],-->
<!--        },-->
<!--      ],-->
<!--    })-->
<!--  );-->

<!--  // 点击节点处理函数-->
<!--  const TreeNodeClick = (params) => {-->
<!--    if (params.data && params.data.children) {-->
<!--      // 如果点击的节点有子节点，记录当前路径并更新图表-->
<!--      historyStack.push(params.data.id);-->

<!--      // 保存当前节点数据到 localStorage-->
<!--      localStorage.setItem(storageKey, JSON.stringify(historyStack));-->
<!--    } else {-->
<!--      // 如果点击的节点没有子节点，记录当前路径并跳转-->
<!--      console.log(params.data.url);-->
<!--      router.push(params.data.url);-->
<!--    }-->
<!--  };-->

<!--  myChart.on("click", TreeNodeClick);-->

<!--  // 恢复之前的点击状态-->
<!--  const savedHistory = JSON.parse(localStorage.getItem(storageKey) || "[]");-->
<!--  if (savedHistory.length) {-->
<!--    // 寻找需要展开的节点-->
<!--    const nodesToExpand = savedHistory.map((id) => ({ id }));-->
<!--    console.log(nodesToExpand);-->
<!--    myChart.dispatchAction({-->
<!--      type: "treemap:expandToNode",-->
<!--      id: nodesToExpand[nodesToExpand.length - 1].id,-->
<!--    });-->
<!--  }-->
<!--});-->
<!--</script>-->

<!--<template>-->
<!--  <div class="card card-compact bg-base-100 shadow-xl flex">-->
<!--    <div id="main" class="m-10" style="height: 500px"></div>-->
<!--  </div>-->
<!--</template>-->

<!--<style scoped></style>-->
