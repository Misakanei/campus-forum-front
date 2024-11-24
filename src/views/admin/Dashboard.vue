<template>
  <div class="dashboard">
    <h2>数据统计</h2>
    <div class="stat-cards">
      <div class="stat-card">
        <h3>用户总数</h3>
        <div class="stat-value">{{ stats.userCount }}</div>
      </div>
      <div class="stat-card">
        <h3>帖子总数</h3>
        <div class="stat-value">{{ stats.postCount }}</div>
      </div>
      <div class="stat-card">
        <h3>评论总数</h3>
        <div class="stat-value">{{ stats.commentCount }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const stats = ref({
  userCount: 0,
  postCount: 0,
  commentCount: 0
})

const fetchStats = async () => {
  try {
    // 获取用户总数
    const usersResponse = await axios.post('/user/getAllUsers')
    if (usersResponse.data.status === 200) {
      stats.value.userCount = usersResponse.data.data.length || 0
    }

    // 获取帖子总数
    const postsResponse = await axios.get('/posts/summaries')
    stats.value.postCount = postsResponse.data.length || 0

    // 获取评论总数
    const commentsResponse = await axios.post('/comments/getAllComments')
    if (commentsResponse.data.status === 200) {
      stats.value.commentCount = commentsResponse.data.data.length || 0
    }
  } catch (error) {
    console.error('获取统计数据失败：', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
  background: #fff;
  border-radius: 0;
}

h2 {
  margin-bottom: 24px;
  color: #1a1a1a;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  padding: 16px;
}

.stat-card {
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.stat-card h3 {
  margin-bottom: 16px;
  color: #666;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #1890ff;
}
</style> 