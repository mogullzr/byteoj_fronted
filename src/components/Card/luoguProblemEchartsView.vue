<script setup>
import * as echarts from "echarts";
import { ref, onMounted } from "vue";
import router from "@/router";
import myAxios from "@/plugins/myAxios";

onMounted(async () => {
  const difficulty_list = [
    "暂无评定",
    "入门",
    "普及",
    "普及——提高",
    "普及+——提高",
    "提高+——省选",
    "省选——NOI",
    "NOI——NOI+——CTSC",
  ];

  let difficulty_list_value = [];
  let difficulty_list_value_map = [];
  const difficulty_value = await myAxios.post("/luogu/difficulty/", {
    withCredentials: true,
  });
  console.log(difficulty_value);
  if (difficulty_value.data["code"] === 0 && difficulty_value.data["data"]) {
    difficulty_list_value = difficulty_value.data["data"];
    console.log(difficulty_value);
  } else {
    console.log(difficulty_value["error"]);
  }
  difficulty_list_value_map = [
    {
      value: difficulty_list_value[0],
      name: "暂无评定",
      url: name,
    },
    {
      value: difficulty_list_value[1],
      name: "入门",
      url: name,
    },
    {
      value: difficulty_list_value[2],
      name: "普及",
      url: name,
    },
    {
      value: difficulty_list_value[3],
      name: "普及——提高",
      url: name,
    },
    {
      value: difficulty_list_value[4],
      name: "普及+——提高",
      url: name,
    },
    {
      value: difficulty_list_value[5],
      name: "提高+——省选",
      url: name,
    },
    {
      value: difficulty_list_value[6],
      name: "省选——NOI",
      url: name,
    },
    {
      value: difficulty_list_value[7],
      name: "NOI——NOI+——CTSC",
      url: name,
    },
  ];
  // 绘制图表
  var myChart = echarts.init(document.getElementById("main"));
  var options = {
    legend: {
      top: "top",
    },
    tooltip: {
      //提示框组件
      trigger: "item", //item数据项图形触发，主要在散点图，饼图等无类目轴的图表中使用。
      axisPointer: {
        // 坐标轴指示器，坐标轴触发有效
        type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
      },
      formatter: "{a} <br/>{b} : {c} <br/>百分比 : {d}%", //{a}（系列名称），{b}（数据项名称），{c}（数值）, {d}（百分比）
    },
    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    color: [
      "#BFBFBF",
      "#FE4C61",
      "#F39C11",
      "#FFC116",
      "#52C41A",
      "#3498DB",
      "#9D3DCF",
      "#0E1D69",
    ],
    series: [
      {
        name: "Nightingale Chart",
        type: "pie",
        radius: [50, 250],
        center: ["50%", "50%"],
        roseType: "area",
        itemStyle: {
          borderRadius: 8,
        },
        data: difficulty_list_value_map,
      },
    ],
  };
  myChart.setOption(options);

  // 饼图点击跳转到指定页面
  myChart.on("click", function (param) {
    var url = param.data.name;
    console.log(url);
    router.replace({
      path: "luogu/" + url,
    });
  });
});
</script>

<template>
  <div class="card-body mt-4 mx-40 h-30 bg-base-100 shadow-xl rounded-box">
    <div class="overflow-x-auto">
      <div id="main" class="m-auto" style="width: 800px; height: 600px"></div>
    </div>
  </div>
</template>

<style scoped></style>
cd
