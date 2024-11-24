<template>
  <div class="article-list">
    <div v-if="isLoading" class="loading">加载中...</div>
    <div v-else>
      <div v-if="!filteredArticles || filteredArticles.length === 0" class="no-articles">暂无文章</div>
      <div class="article-item" v-for="article in paginatedArticles" :key="article.post_id">
        <div class="article-meta">
          <img 
            :src="userAvatars[article.user_id] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.user_id}`" 
            class="author-avatar"
            :alt="article.username"
          />
          <span class="author-name">{{ article.username }}</span>
          <span class="post-time">
            {{ article.update_time ? '修改于: ' + formatDate(article.update_time) : '发布于: ' + formatDate(article.create_time) }}
          </span>
        </div>
        <router-link :to="`/post/${article.post_id}`" class="article-title">
          {{ article.title }}
        </router-link>
        <p class="article-preview">{{ article.content_preview }}</p>
        <div class="article-stats">
          <span class="stat-item">👁️ {{ article.reading_volume }}</span>
          <span class="stat-item">💬 {{ article.comment_count }}</span>
          <span class="stat-item">👍 {{ article.support }}</span>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'

const props = defineProps({
  categoryId: {
    type: Number,
    default: null
  }
})

const articles = ref([])
const isLoading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10) // 每页显示10条
const userAvatars = ref({}) // 用于缓存用户头像
const categories = ref([]) // 添加板块列表状态

// 获取用户头像
const fetchUserAvatar = async (userId) => {
  try {
    // 如果已经缓存了该用户的头像，直接返回
    if (userAvatars.value[userId]) {
      return userAvatars.value[userId]
    }

    const response = await axios.get(`/user/findUserById/${userId}`)
    if (response.data.avatarPath) {
      userAvatars.value[userId] = `http://localhost:8080${response.data.avatarPath}`
      return userAvatars.value[userId]
    }
  } catch (error) {
    console.error('获取用户头像失败：', error)
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 获取所有板块信息
const fetchCategories = async () => {
  try {
    const response = await axios.get('/categories/selectAllCategory')
    categories.value = response.data || []
  } catch (error) {
    console.error('获取板块列表失败：', error)
  }
}

// 修改过滤文章的逻辑
const filteredArticles = computed(() => {
  if (!articles.value) return []
  
  // 首先过滤掉已删除板块的文章
  const validArticles = articles.value.filter(article => {
    const category = categories.value.find(c => c.category_id === article.category_id)
    return category && !category.deleted // 只保留未删除板块的文章
  })
  
  // 然后根据当前选择的板块进行过滤
  if (!props.categoryId) {
    return validArticles
  }
  return validArticles.filter(article => article.category_id === props.categoryId)
})

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(filteredArticles.value.length / pageSize.value)
})

// 获取当前页的文章
const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredArticles.value.slice(start, end)
})

// 修改获取文章列表的函数
const fetchArticles = async () => {
  try {
    isLoading.value = true
    const [articlesResponse] = await Promise.all([
      axios.get('/posts/summaries'),
      fetchCategories() // 同时获取板块信息
    ])
    articles.value = articlesResponse.data || []
    
    // 获取所有作者的头像
    for (const article of articles.value) {
      if (!userAvatars.value[article.user_id]) {
        await fetchUserAvatar(article.user_id)
      }
    }
  } catch (error) {
    console.error('获取文章列表失败：', error)
    articles.value = []
  } finally {
    isLoading.value = false
  }
}

// 监听分类变化，重置页码
watch(() => props.categoryId, () => {
  currentPage.value = 1
  fetchArticles()
})

// 监听当前页码，确保在切换分类时不会超出范围
watch([() => totalPages.value, () => currentPage.value], ([total, current]) => {
  if (current > total && total > 0) {
    currentPage.value = total
  }
})

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.article-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.author-name {
  font-size: 14px;
  color: var(--text-color);
}

.post-time {
  font-size: 12px;
  color: #8a919f;
}

.article-title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-color);
  text-decoration: none;
  transition: color 0.2s;
}

.article-title:hover {
  color: var(--theme-color);
}

.article-preview {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}

.article-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  font-size: 13px;
  color: #8a919f;
}

.loading {
  text-align: center;
  font-size: 16px;
  color: var(--text-color);
}

.no-articles {
  text-align: center;
  font-size: 16px;
  color: #8a919f;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: #fff;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--theme-color);
  color: var(--theme-color);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}
</style> 