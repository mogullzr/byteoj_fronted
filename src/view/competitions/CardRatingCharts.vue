<template>
  <div class="card bg-base-100">
    <div class="card-body">
      <div ref="chart" style="width: 710px; height: 300px;" class="mx-auto"></div>
    </div>
    <CompetitionShowView />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import {CompetitionControllerService} from "../../../generated";
import CompetitionShowView from "@/view/competitions/CompetitionShowView.vue";

export default {
  name: 'RatingChart',
  setup() {
    const chart = ref(null);
    const competitionData = ref([]);

    onMounted(async () => {
      try {
        const request = {
          pageNum: 0
        }
        const res = await CompetitionControllerService.competitionUserJoinsInfoGetUsingPost(request);
        if (res.code === 0) {
          competitionData.value = res.data.map(item => ({
            ...item,
            start_time: new Date(item.start_time).getTime() // Convert ISO string to timestamp
          }));
          renderChart();
        }
      } catch (error) {
        console.error('Failed to fetch competition data:', error);
      }
    });

    const renderChart = () => {
      const myChart = echarts.init(chart.value);

      // 1. 处理时间数据：提取唯一日期并格式化（YYYY-MM-DD）
      const dateSet = new Set();
      const formattedData = competitionData.value.map(item => {
        const date = new Date(item.start_time);
        const dateStr = date.toISOString().split('T')[0]; // 转换为 'YYYY-MM-DD' 格式
        dateSet.add(dateStr);
        return { ...item, dateStr }; // 保存格式化后的日期
      });

      // 按时间顺序排列日期
      const xAxisDates = Array.from(dateSet).sort((a, b) => new Date(a) - new Date(b));

      // 2. 配置option
      const option = {
        xAxis: {
          type: 'category', // 改为类目轴
          data: xAxisDates, // 显式指定日期标签
          axisLabel: {
            interval: 0, // 强制显示所有标签（避免自动隐藏）
            fontSize: 16,
            formatter: (value) => {
              // 可简化为直接显示YYYY-MM-DD（已在dateStr中处理）
              return value;
            }
          }
        },
        yAxis: {
          type: 'value',
          min: Math.floor(Math.min(...formattedData.map(item => item.rating_after)) / 100) * 100 - 100,
          max: Math.ceil(Math.max(...formattedData.map(item => item.rating_after)) / 100) * 100 + 100,
          interval: 100
        },
        series: [
          {
            name: 'Rating',
            type: 'line',
            // 3. 数据格式：[日期字符串, rating值]
            data: formattedData.map(item => [item.dateStr, item.rating_after]),
            xAxisIndex: 0,
            markArea: {
              data: [
                [
                  {
                    xAxis: competitionData.value[0].start_time,
                    itemStyle: {color: 'rgba(135, 206, 235, 0.3)'},
                    label: {
                      show: true,
                      position: 'insideTop',
                      formatter: `${competitionData.value[0].competition_name}\n${new Date(competitionData.value[0].start_time).toLocaleString()}`
                    }
                  },
                  {
                    xAxis: competitionData.value[competitionData.value.length - 1].start_time
                  }
                ]
              ]
            },
            markPoint: {
              data: [
                {type: 'max', name: 'Max'},
                {type: 'min', name: 'Min'}
              ]
            }
          }
        ],
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            const item = competitionData.value[params[0].dataIndex];
            const rankSuffix = (num) => {
              const lastDigit = num % 10;
              const lastTwoDigits = num % 100;
              if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return 'th';
              return lastDigit === 1 ? 'st' : lastDigit === 2 ? 'nd' : lastDigit === 3 ? 'rd' : 'th';
            };
            const rankWithSuffix = `${item.rank}${rankSuffix(item.rank)}`;
            return `
              <div style="width: 200px; background: linear-gradient(to bottom, #8e44ad, #d7b9e8); padding: 5px; border-radius: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="background: white; padding: 8px; border-radius: 3px; margin-top: -5px;">
                  <h3 style="color: #8e44ad; font-size: 16px; font-weight: bold; margin: 0 0 5px 0; text-align: center;">${item.rating_after} (${item.rating_change > 0 ? '+' : ''}${item.rating_change}) (${rankWithSuffix})</h3>
                  <p style="color: #7f8c8d; margin: 2px 0; font-size: 12px; text-align: center;">${item.competition_name}</p>
                  <p style="color: #7f8c8d; margin: 2px 0; font-size: 12px; text-align: center;">${new Date(item.start_time).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
                </div>
              </div>
            `;
          },
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          padding: 0,
          textStyle: {color: '#2d3748'},
          position: function (point, params, dom, rect, size) {
            return {top: point[1] - 100, left: point[0] - 100};
          }
        }
      };

      myChart.setOption(option);

      window.addEventListener('resize', () => {
        myChart.resize();
      });
    };

    return {chart};
  },
  components: {
    CompetitionShowView
  }
};
</script>

<style scoped>
.card {
  width: 710px;
  margin: 0 auto;
}

.card-body {
  padding: 1rem;
}
</style>