<template>
  <div class="search-results-container">
    <div class="search-header">
      <h2>搜索结果</h2>
      <p class="search-info">
        关键词 "{{ keyword }}" 的搜索结果，共找到 {{ searchResults.length }} 条
      </p>
    </div>

    <div class="results-list" v-if="searchResults.length > 0">
      <div v-for="post in searchResults" :key="post.postId" class="result-item">
        <router-link :to="`/post/${post.postId}`" class="post-title">
          {{ post.title }}
        </router-link>
        <p class="post-content">{{ post.content.substring(0, 200) }}...</p>
        <div class="post-meta">
          <span class="post-time">
            {{ post.updateTime ? '修改于: ' + formatDate(post.updateTime) : '发布于: ' + formatDate(post.createTime) }}
          </span>
          <div class="post-stats">
            <span>👁️ {{ post.readingVolume }}</span>
            <span>💬 {{ post.commentCount || 0 }}</span>
            <span>👍 {{ post.support }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!isLoading" class="no-results">
      暂无搜索结果
    </div>

    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <span>搜索中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const searchResults = ref([])
const isLoading = ref(true)
const keyword = ref('')

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

const performSearch = async (searchKeyword) => {
  if (!searchKeyword) {
    router.push('/')
    return
  }

  try {
    isLoading.value = true
    keyword.value = searchKeyword
    const response = await axios.post('/posts/search', {
      keyword: searchKeyword
    })
    
    if (response.data.status === 200) {
      searchResults.value = response.data.data || []
    } else {
      console.error('搜索失败：', response.data.message)
      searchResults.value = []
    }
  } catch (error) {
    console.error('搜索请求失败：', error)
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

// 监听路由参数变化
watch(() => route.query.keyword, (newKeyword) => {
  if (newKeyword) {
    performSearch(newKeyword)
  }
})

onMounted(() => {
  const searchKeyword = route.query.keyword
  if (searchKeyword) {
    performSearch(searchKeyword)
  }
})
</script>

<style scoped>
.search-results-container {
  max-width: 800px;
  margin: 80px auto 0;
  padding: 20px;
}

.search-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.search-header h2 {
  font-size: 24px;
  color: var(--text-color);
  margin-bottom: 12px;
}

.search-info {
  font-size: 14px;
  color: #666;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-item {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.post-title {
  font-size: 18px;
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 12px;
  display: block;
}

.post-title:hover {
  color: var(--theme-color);
}

.post-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #8a919f;
}

.post-stats {
  display: flex;
  gap: 16px;
}

.no-results {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.suggestion {
  margin: 20px 0 10px;
  font-weight: 500;
}

.no-results ul {
  list-style: none;
  padding: 0;
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

.no-results li {
  margin: 8px 0;
  color: #8a919f;
  font-size: 14px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  gap: 16px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--theme-color);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 