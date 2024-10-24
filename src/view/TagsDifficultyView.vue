<script setup>
import * as echarts from "echarts";
import { ref, onMounted } from "vue";
import router from "@/router";
import myAxios from "@/plugins/myAxios";
// import qs from "qs";
import { useRoute } from "vue-router";

onMounted(async () => {
  const route = useRoute();
  const difficulty = ref(decodeURIComponent(route.fullPath.split("/")[2]));
  let tags_list = [];
  let tags_list_value = [];
  let tags_list_map = [];
  const tags_list_value_map = await myAxios.post("/luogu/tags/", {
    params: {
      difficulty: difficulty.value,
    },
  });
  if (tags_list_value_map.data["code"] === 0 && tags_list_value_map.data) {
    tags_list_value.value = tags_list_value_map.data;
  } else {
    console.log(tags_list_value_map.data.error);
  }
  // {
  //   Algorithm_name: "123",
  //       Algorithm_name_value: 13,
  // },
  // {
  //   Algorithm_name: "线段树",
  //       Algorithm_name_value: 12,
  // },
  // {
  //   Algorithm_name: "线edsda",
  //       Algorithm_name_value: 12,
  // },
  // {
  //   Algorithm_name: "线asdasd",
  //       Algorithm_name_value: 12,
  // },
  // tags_list_value = ref([]);
  // console.log(tags_list_value.value);
  if (tags_list_value.value) {
    // 使用 map() 方法遍历值数组并创建新数组
    // console.log(tags_list_value.value);
    let index = 0;
    // console.log(tags_list_value.value);
    for (const value in tags_list_value.value) {
      if (value === "code") continue;
      tags_list_map.push({
        name: value,
        value: tags_list_value.value[value],
        url: tags_list_value.value[value],
      });
    }
    // console.log(tags_list_map);
  } else {
    console.log("tags_list_value.value is undefined");
  }
  // 绘制图表
  var myChart = echarts.init(document.getElementById("main"));
  var options = {
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

    title: {
      text: difficulty.value + "类型题目标签",
      subtext: "Luogu Data",
      right: "center",
      fontWeight: "bolder",
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

    legend: {
      type: "scroll",
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: "50%",
        data: tags_list_map,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
  myChart.setOption(options);

  // 饼图点击跳转到指定页面
  myChart.on("click", function (param) {
    var url = param.data.name;
    // console.log(url);
    router.push({
      path: difficulty.value + "/" + url,
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
