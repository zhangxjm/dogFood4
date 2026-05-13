<template>
  <div class="statistics-page">
    <van-nav-bar title="数据统计" />
    
    <div class="overview-cards">
      <div class="overview-card">
        <div class="card-title">今日营业额</div>
        <div class="card-value">¥{{ overview.todayRevenue.toFixed(2) }}</div>
        <div class="card-subtitle">{{ overview.todayOrders }} 笔订单</div>
      </div>
      
      <div class="overview-card">
        <div class="card-title">本周营业额</div>
        <div class="card-value">¥{{ overview.weekRevenue.toFixed(2) }}</div>
        <div class="card-subtitle">{{ overview.weekOrders }} 笔订单</div>
      </div>
      
      <div class="overview-card">
        <div class="card-title">本月营业额</div>
        <div class="card-value">¥{{ overview.monthRevenue.toFixed(2) }}</div>
        <div class="card-subtitle">{{ overview.monthOrders }} 笔订单</div>
      </div>
    </div>

    <van-tabs v-model:active="activeTab" sticky background="#fff">
      <van-tab title="营业额趋势">
        <div class="chart-container">
          <div class="chart-header">
            <span class="chart-title">近7天营业额趋势</span>
          </div>
          <div ref="salesChartRef" class="chart"></div>
        </div>

        <div class="data-table">
          <div class="table-header">
            <span>日期</span>
            <span>营业额</span>
            <span>订单数</span>
          </div>
          <div v-for="item in dailySales" :key="item.date" class="table-row">
            <span>{{ item.date.substring(5) }}</span>
            <span>¥{{ item.totalAmount.toFixed(2) }}</span>
            <span>{{ item.orderCount }} 笔</span>
          </div>
        </div>
      </van-tab>
      
      <van-tab title="销量排行">
        <div class="ranking-container">
          <div class="chart-header">
            <span class="chart-title">菜品销量排行</span>
          </div>
          <div ref="rankingChartRef" class="chart"></div>

          <div class="ranking-list">
            <div v-for="(item, index) in productRanking" :key="item.productId" class="ranking-item">
              <div class="ranking-rank" :class="getRankClass(index)">
                {{ index + 1 }}
              </div>
              <div class="ranking-info">
                <div class="ranking-name">{{ item.productName }}</div>
                <div class="ranking-detail">
                  销量: {{ item.quantity }} 份 | 金额: ¥{{ item.totalAmount.toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { statisticsApi } from '../utils/request';

const activeTab = ref(0);
const salesChartRef = ref(null);
const rankingChartRef = ref(null);
let salesChart = null;
let rankingChart = null;

const overview = reactive({
  todayRevenue: 0,
  todayOrders: 0,
  weekRevenue: 0,
  weekOrders: 0,
  monthRevenue: 0,
  monthOrders: 0,
});

const dailySales = ref([]);
const productRanking = ref([]);

const getRankClass = (index) => {
  if (index === 0) return 'rank-gold';
  if (index === 1) return 'rank-silver';
  if (index === 2) return 'rank-bronze';
  return '';
};

const loadOverview = async () => {
  try {
    const data = await statisticsApi.getOverview();
    Object.assign(overview, data);
  } catch (error) {
    console.error('加载概览数据失败:', error);
  }
};

const loadDailySales = async () => {
  try {
    const data = await statisticsApi.getDailySales();
    dailySales.value = data;
    await nextTick();
    initSalesChart();
  } catch (error) {
    console.error('加载日销售数据失败:', error);
  }
};

const loadProductRanking = async () => {
  try {
    const data = await statisticsApi.getProductRanking();
    productRanking.value = data;
    await nextTick();
    initRankingChart();
  } catch (error) {
    console.error('加载商品排行数据失败:', error);
  }
};

const initSalesChart = () => {
  if (!salesChartRef.value) return;

  if (salesChart) {
    salesChart.dispose();
  }

  salesChart = echarts.init(salesChartRef.value);

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const data = params[0];
        return `${data.name}<br/>营业额: ¥${data.value.toFixed(2)}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dailySales.value.map((item) => item.date.substring(5)),
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}',
      },
    },
    series: [
      {
        name: '营业额',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: dailySales.value.map((item) => item.totalAmount),
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(25, 137, 250, 0.5)' },
            { offset: 1, color: 'rgba(25, 137, 250, 0.05)' },
          ]),
        },
        lineStyle: {
          color: '#1989fa',
          width: 2,
        },
        itemStyle: {
          color: '#1989fa',
        },
      },
    ],
  };

  salesChart.setOption(option);
};

const initRankingChart = () => {
  if (!rankingChartRef.value) return;

  if (rankingChart) {
    rankingChart.dispose();
  }

  rankingChart = echarts.init(rankingChartRef.value);

  const topProducts = productRanking.value.slice(0, 5).reverse();

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params) => {
        const data = params[0];
        return `${data.name}<br/>销量: ${data.value} 份`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      data: topProducts.map((item) => item.productName),
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        data: topProducts.map((item) => item.quantity),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#ff6034' },
            { offset: 1, color: '#ff9500' },
          ]),
          borderRadius: [0, 4, 4, 0],
        },
      },
    ],
  };

  rankingChart.setOption(option);
};

const handleResize = () => {
  salesChart?.resize();
  rankingChart?.resize();
};

onMounted(() => {
  loadOverview();
  loadDailySales();
  loadProductRanking();

  window.addEventListener('resize', handleResize);
});
</script>

<style scoped>
.statistics-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 12px;
}

.overview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px 12px;
  color: #fff;
  text-align: center;
}

.overview-card:nth-child(2) {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.overview-card:nth-child(3) {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
}

.card-title {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.card-value {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
  word-break: break-all;
}

.card-subtitle {
  font-size: 11px;
  opacity: 0.8;
}

.chart-container,
.ranking-container {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
}

.chart-header {
  margin-bottom: 16px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.chart {
  height: 250px;
  width: 100%;
}

.data-table {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  overflow: hidden;
}

.table-header,
.table-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
}

.table-header {
  background: #f7f8fa;
  font-weight: 600;
  color: #646566;
  font-size: 14px;
}

.table-row {
  border-bottom: 1px solid #ebedf0;
  font-size: 14px;
}

.table-row:last-child {
  border-bottom: none;
}

.ranking-list {
  margin-top: 16px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebedf0;
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f2f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #969799;
  margin-right: 12px;
  font-size: 14px;
}

.ranking-rank.rank-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
  color: #fff;
}

.ranking-rank.rank-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
  color: #fff;
}

.ranking-rank.rank-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
  color: #fff;
}

.ranking-info {
  flex: 1;
}

.ranking-name {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
}

.ranking-detail {
  font-size: 12px;
  color: #969799;
}
</style>
