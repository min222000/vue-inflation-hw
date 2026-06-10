<template>
  <div class="dashboard-container">
    <h1>📊 通貨膨脹價格監控面板</h1>
    
    <div v-if="isLoading" class="loading">
      資料載入中，請稍候...
    </div>

    <div v-else class="data-section">
      <table class="price-table">
        <thead>
          <tr>
            <th>商品編號</th>
            <th>商品名稱</th>
            <th>歷史價格</th>
            <th>最新價格</th>
            <th>漲幅</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in priceData" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.oldPrice }} 元</td>
            <td class="new-price">{{ item.newPrice }} 元</td>
            <td :class="{ 'price-up': item.newPrice > item.oldPrice, 'price-down': item.newPrice <= item.oldPrice }">
              {{ calculateInflation(item.oldPrice, item.newPrice) }}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 1. 定義響應式變數 (取代原本全域變數的寫法)
const priceData = ref([])    // 存放從後端抓來的價格資料
const isLoading = ref(true)  // 控制是否顯示「載入中」

// 2. 定義計算漲幅的函式
const calculateInflation = (oldPrice, newPrice) => {
  if (!oldPrice) return 0
  const rate = ((newPrice - oldPrice) / oldPrice) * 100
  return rate.toFixed(2) // 取到小數點後兩位
}

// 3. 在元件掛載完成後，向後端請求資料 (對應原本 script.js 裡的 fetch)
onMounted(async () => {
  try {
    // 這裡的網址請替換成你 server.js 實際設定的 API 路徑
    // 如果你有設定 vite.config.js 的 proxy，可以直接寫相對路徑 '/api/prices'
    const response = await fetch('/api/prices') 
    
    if (!response.ok) {
      throw new Error(`HTTP 錯誤狀態: ${response.status}`)
    }

    const data = await response.json()
    priceData.value = data // 將抓到的資料塞進變數中，畫面會自動更新！
  } catch (error) {
    console.error('獲取價格資料失敗:', error)
    // 如果沒有後端，這裡先塞一筆假資料讓你能看到畫面效果
    priceData.value = [
      { id: 1, name: '麥香奶茶', oldPrice: 10, newPrice: 15 },
      { id: 2, name: '科學麵', oldPrice: 8, newPrice: 10 },
      { id: 3, name: '雞排', oldPrice: 60, newPrice: 100 }
    ]
  } finally {
    isLoading.value = false // 無論成功或失敗，都把載入中狀態解除
  }
})
</script>

<style scoped>
/* 這裡加上 scoped 確保樣式不會去污染到 App.vue 或其他元件 */
.dashboard-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #1f2937;
  margin-bottom: 24px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 1.2rem;
}

.price-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.price-table th, .price-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.price-table th {
  background-color: #f3f4f6;
  font-weight: 600;
  color: #374151;
}

.new-price {
  font-weight: bold;
}

.price-up {
  color: #ef4444; /* 漲價顯示紅色 */
  font-weight: bold;
}

.price-down {
  color: #10b981; /* 沒漲或跌價顯示綠色 */
}
</style>