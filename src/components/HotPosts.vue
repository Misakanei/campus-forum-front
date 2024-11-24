<template>
  <div class="hot-posts">
    <h3>热门文章</h3>
    <div v-if="isLoading" class="loading">加载中...</div>
    <div v-else>
      <div v-if="hotPosts.length === 0" class="no-posts">暂无热门文章</div>
      <ul v-else>
        <li v-for="post in hotPosts" :key="post.post_id">
          <a 
            :href="`/post/${post.post_id}`" 
            class="post-link"
            @click.prevent="navigateToPost(post.post_id)"
          >
            {{ post.title }}
          </a>
          <div class="post-stats">
            <span class="views">👁️ {{ post.reading_volume }}</span>
            <span class="comments">💬 {{ post.comment_count }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const hotPosts = ref([])
const isLoading = ref(true)
const categories = ref([]) // 添加板块列表状态

// 获取所有板块信息
const fetchCategories = async () => {
  try {
    const response = await axios.get('/categories/selectAllCategory')
    categories.value = response.data || []
  } catch (error) {
    console.error('获取板块列表失败：', error)
  }
}

const fetchHotPosts = async () => {
  try {
    const [postsResponse] = await Promise.all([
      axios.get('/posts/summaries'),
      fetchCategories() // 同时获取板块信息
    ])
    
    // 过滤掉已删除板块的帖子
    const validPosts = postsResponse.data.filter(post => {
      const category = categories.value.find(c => c.category_id === post.category_id)
      return category && !category.deleted // 只保留未删除板块的帖子
    })
    
    // 按阅读量降序排序并只取前5篇
    hotPosts.value = validPosts
      .sort((a, b) => b.reading_volume - a.reading_volume)
      .slice(0, 5)
  } catch (error) {
    console.error('获取热门文章失败：', error)
  } finally {
    isLoading.value = false
  }
}

// 添加导航函数
const navigateToPost = (postId) => {
  router.push(`/post/${postId}`)
}

onMounted(() => {
  fetchHotPosts()
})
</script>

<style scoped>
.hot-posts {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

h3 {
  font-size: 18px;
  color: var(--text-color);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

li:last-child {
  border-bottom: none;
}

.post-link {
  display: block;
  color: var(--text-color);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-link:hover {
  color: var(--theme-color);
}

.post-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #8a919f;
}

.loading {
  text-align: center;
  color: #8a919f;
  padding: 20px 0;
}

.no-posts {
  text-align: center;
  color: #8a919f;
  padding: 20px 0;
}
</style> 