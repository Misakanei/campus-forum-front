<template>
  <div class="post-management">
    <h2>帖子管理</h2>
    <div class="table-container">
      <table class="post-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>作者</th>
            <th>板块</th>
            <th>发布时间</th>
            <th>阅读量</th>
            <th>点赞数</th>
            <th>评论数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in posts" :key="post.post_id">
            <td>{{ post.post_id }}</td>
            <td class="post-title">{{ post.title }}</td>
            <td>{{ post.username }}</td>
            <td>{{ getCategoryName(post.category_id) }}</td>
            <td>{{ formatDate(post.create_time) }}</td>
            <td>{{ post.reading_volume }}</td>
            <td>{{ post.support }}</td>
            <td>{{ post.comment_count }}</td>
            <td>
              <button 
                class="action-btn view-btn"
                @click="viewPost(post)"
              >
                查看
              </button>
              <button 
                class="action-btn delete-btn"
                @click="deletePost(post)"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const posts = ref([])
const categories = ref([])

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.category_id === categoryId)
  return category ? category.categories_name : '未知板块'
}

const fetchPosts = async () => {
  try {
    const response = await axios.get('/posts/summaries')
    posts.value = response.data || []
  } catch (error) {
    console.error('获取帖子列表失败：', error)
  }
}

const fetchCategories = async () => {
  try {
    const response = await axios.get('/categories/selectAllCategory')
    categories.value = response.data || []
  } catch (error) {
    console.error('获取板块列表失败：', error)
  }
}

const viewPost = (post) => {
  router.push(`/post/${post.post_id}`)
}

const deletePost = async (post) => {
  if (!confirm('确定要删除该帖子吗？此操作不可恢复！')) return
  
  try {
    const response = await axios.post(`/posts/deletePost/${post.post_id}`)
    if (response.data.status === 200) {
      window.alert('删除成功')
      await fetchPosts()
    } else {
      window.alert(response.data.message || '删除失败')
    }
  } catch (error) {
    console.error('删除帖子失败：', error)
    window.alert('删除失败，请重试')
  }
}

onMounted(async () => {
  await Promise.all([
    fetchPosts(),
    fetchCategories()
  ])
})
</script>

<style scoped>
.post-management {
  padding: 0;
}

h2 {
  margin-bottom: 24px;
  color: #1a1a1a;
}

.table-container {
  background: #fff;
  border-radius: 0;
  padding: 16px;
  box-shadow: none;
  overflow-x: auto;
}

.post-table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 16px 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background-color: #fafafa;
  font-weight: 500;
  color: #1a1a1a;
}

.post-title {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.normal {
  background-color: #e6f7ff;
  color: #1890ff;
}

.deleted {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  margin-right: 12px;
  transition: all 0.3s;
  min-width: 64px;
}

.view-btn {
  background-color: #1890ff;
  color: #fff;
}

.delete-btn {
  background-color: #ff4d4f;
  color: #fff;
}

.action-btn:hover {
  opacity: 0.8;
}

/* 设置各列的最小宽度 */
.post-table th:nth-child(1) { min-width: 60px; }  /* ID */
.post-table th:nth-child(2) { min-width: 200px; } /* 标题 */
.post-table th:nth-child(3) { min-width: 100px; } /* 作者 */
.post-table th:nth-child(4) { min-width: 120px; } /* 板块 */
.post-table th:nth-child(5) { min-width: 160px; } /* 发布时间 */
.post-table th:nth-child(6) { min-width: 80px; }  /* 阅读量 */
.post-table th:nth-child(7) { min-width: 80px; }  /* 点赞数 */
.post-table th:nth-child(8) { min-width: 80px; }  /* 评论数 */
.post-table th:nth-child(9) { min-width: 160px; } /* 操作 */
</style> 