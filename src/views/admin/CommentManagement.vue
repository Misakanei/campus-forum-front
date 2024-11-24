<template>
  <div class="comment-management">
    <h2>评论管理</h2>
    <div class="table-container">
      <table class="comment-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>评论内容</th>
            <th>评论者</th>
            <th>所属帖子</th>
            <th>发布时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comment in comments" :key="comment.commentId">
            <td>{{ comment.commentId }}</td>
            <td class="comment-content">{{ comment.content }}</td>
            <td>{{ getUsername(comment.userId) }}</td>
            <td class="post-title">
              <a @click="viewPost(comment.postId)">{{ getPostTitle(comment.postId) }}</a>
            </td>
            <td>{{ formatDate(comment.createdTime) }}</td>
            <td>
              <span :class="['status', comment.deleted === 1 ? 'deleted' : 'normal']">
                {{ comment.deleted === 1 ? '已删除' : '正常' }}
              </span>
            </td>
            <td>
              <button 
                class="action-btn delete-btn"
                @click="deleteComment(comment)"
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
const comments = ref([])
const posts = ref({}) // 用于存储帖子标题的映射
const users = ref({}) // 用于存储用户名的映射

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

const getPostTitle = (postId) => {
  return posts.value[postId] || '未知帖子'
}

const getUsername = (userId) => {
  return users.value[userId] || '未知用户'
}

const fetchComments = async () => {
  try {
    const response = await axios.post('/comments/getAllComments')
    if (response.data.status === 200) {
      comments.value = response.data.data || []
      
      // 获取所有相关帖子的标题
      const postIds = [...new Set(comments.value.map(comment => comment.postId))]
      await Promise.all(postIds.map(async (postId) => {
        try {
          const postResponse = await axios.get(`/posts/getPostDetail/${postId}`)
          posts.value[postId] = postResponse.data.post.title
        } catch (error) {
          console.error(`获取帖子 ${postId} 标题失败：`, error)
        }
      }))

      // 获取所有评论者的用户名
      const userIds = [...new Set(comments.value.map(comment => comment.userId))]
      await Promise.all(userIds.map(async (userId) => {
        try {
          const userResponse = await axios.get(`/user/findUserById/${userId}`)
          users.value[userId] = userResponse.data.username
        } catch (error) {
          console.error(`获取用户 ${userId} 信息失败：`, error)
        }
      }))
    }
  } catch (error) {
    console.error('获取评论列表失败：', error)
  }
}

const viewPost = (postId) => {
  router.push(`/post/${postId}`)
}

const deleteComment = async (comment) => {
  if (!confirm('确定要删除该评论吗？此操作不可恢复！')) return
  
  try {
    const response = await axios.post(`/comments/deleteComment/${comment.commentId}`)
    if (response.data.status === 200) {
      window.alert(response.data.message || '删除成功')
      await fetchComments() // 重新获取评论列表
    } else {
      window.alert(response.data.message || '删除失败')
    }
  } catch (error) {
    console.error('删除评论失败：', error)
    window.alert('删除失败，请重试')
  }
}

onMounted(() => {
  fetchComments()
})
</script>

<style scoped>
.comment-management {
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

.comment-table {
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

.comment-content {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-title {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-title a {
  color: var(--theme-color);
  cursor: pointer;
  text-decoration: none;
}

.post-title a:hover {
  text-decoration: underline;
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

.delete-btn {
  background-color: #ff4d4f;
  color: #fff;
}

.action-btn:hover {
  opacity: 0.8;
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
</style> 