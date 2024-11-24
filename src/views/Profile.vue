<template>
  <div class="profile-container">
    <!-- 用户基本信息卡片 -->
    <div class="profile-header">
      <div class="user-card">
        <img 
          :src="userAvatar" 
          class="user-avatar"
          :alt="userStore.userInfo.username"
        >
        <div class="user-info">
          <div class="user-header">
            <h2 class="username">{{ userStore.userInfo.username }}</h2>
            <button class="edit-btn" @click="showEditForm = true">
              修改个性签名
            </button>
          </div>
          <p class="signature">{{ userInfo.signature || '这个人很懒，还没有设置签名~' }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ userPosts.length }}</span>
              <span class="stat-label">发帖数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ totalComments }}</span>
              <span class="stat-label">评论数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ totalLikes }}</span>
              <span class="stat-label">获赞数</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑个性签名表单 -->
    <div v-if="showEditForm" class="edit-form-overlay">
      <div class="edit-form">
        <h3>修改个性签名</h3>
        <div class="form-item">
          <textarea 
            v-model="editForm.signature" 
            placeholder="写点什么介绍一下自己吧..."
            maxlength="200"
          ></textarea>
          <span class="char-count">{{ editForm.signature.length }}/200</span>
        </div>
        <div class="form-buttons">
          <button class="cancel-btn" @click="showEditForm = false">取消</button>
          <button 
            class="save-btn" 
            @click="handleSave"
            :disabled="isSaving"
          >
            {{ isSaving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 用户帖子列表 -->
    <div class="user-posts">
      <h3>我的帖子</h3>
      <div v-if="isLoading" class="loading">加载中...</div>
      <div v-else-if="userPosts.length === 0" class="no-posts">
        还没有发布过帖子哦~
      </div>
      <div v-else class="posts-list">
        <div v-for="post in userPosts" :key="post.post_id" class="post-item">
          <div class="post-header">
            <router-link :to="`/post/${post.post_id}`" class="post-title">
              {{ post.title }}
            </router-link>
            <div class="post-actions">
              <button class="edit-btn" @click="handleEdit(post)">
                ✏️ 修改
              </button>
              <button class="delete-btn" @click="handleDelete(post)">
                🗑️ 删除
              </button>
            </div>
          </div>
          <p class="post-preview">{{ post.content.substring(0, 100) }}...</p>
          <div class="post-meta">
            <span class="post-time">
              {{ post.update_time ? '修改于: ' + formatDate(post.update_time) : '发布于: ' + formatDate(post.create_time) }}
            </span>
            <div class="post-stats">
              <span>👁️ {{ post.reading_volume }}</span>
              <span>👍 {{ post.support }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()
const userInfo = ref({})
const userPosts = ref([])
const isLoading = ref(true)
const totalComments = ref(0)
const totalLikes = ref(0)
const showEditForm = ref(false)
const isSaving = ref(false)
const editForm = ref({
  signature: ''
})
const userAvatar = ref('')

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

const fetchUserInfo = async () => {
  try {
    const response = await axios.get(`/user/findUserById/${userStore.userInfo.userId}`)
    userInfo.value = {
      username: response.data.username,
      signature: response.data.signature,
      email: response.data.email
    }
    if (response.data.avatarPath) {
      userAvatar.value = `http://localhost:8080${response.data.avatarPath}`
    } else {
      userAvatar.value = `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.data.username}`
    }
  } catch (error) {
    console.error('获取用户信息失败：', error)
    userAvatar.value = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStore.userInfo.username}`
  }
}

const fetchUserPosts = async () => {
  try {
    isLoading.value = true
    const response = await axios.post(`/posts/selectPostsById/${userStore.userInfo.userId}`)
    userPosts.value = response.data
    
    totalLikes.value = userPosts.value.reduce((sum, post) => sum + post.support, 0)
  } catch (error) {
    console.error('获取用户帖子失败：', error)
  } finally {
    isLoading.value = false
  }
}

const fetchUserComments = async () => {
  try {
    const response = await axios.post(`/user/getCommentsCountById/${userStore.userInfo.userId}`)
    if (response.data.status === 200) {
      totalComments.value = response.data.data
    } else {
      console.error('获取评论数失败：', response.data.message)
    }
  } catch (error) {
    console.error('获取评论数失败：', error)
  }
}

const handleSave = async () => {
  try {
    isSaving.value = true
    const response = await axios.post('/user/updateSignature', {
      userId: String(userStore.userInfo.userId),
      signature: editForm.value.signature
    })

    if (response.data.status === 200) {
      // 更新成功后重新获取用户信息
      await fetchUserInfo()
      window.alert('修改个性签名成功！')
      showEditForm.value = false
    } else {
      window.alert(response.data.message || '修改失败，请重试')
    }
  } catch (error) {
    console.error('保存个性签名失败：', error)
    window.alert('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

// 处理修改帖子
const handleEdit = (post) => {
  // 跳转到修改页面，带上帖子ID
  router.push(`/edit/${post.post_id}`)
}

// 处理删除帖子
const handleDelete = async (post) => {
  if (!confirm('确定要删除这篇帖子吗？此操作不可恢复！')) {
    return
  }

  try {
    const response = await axios.post(`/posts/deletePost/${post.post_id}`)
    if (response.data.status === 200) {
      window.alert('删除成功！')
      // 重新获取帖子列表
      await fetchUserPosts()
    } else {
      window.alert(response.data.message || '删除失败，请重试')
    }
  } catch (error) {
    console.error('删除帖子失败：', error)
    window.alert('删除失败，请重试')
  }
}

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    window.alert('请先登录！')
    router.push('/login')
    return
  }
  
  await fetchUserInfo()
  await fetchUserComments()
  await fetchUserPosts()

  // 初始化编辑表单
  editForm.value.signature = userInfo.value.signature || ''
})
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 80px auto 0;
  padding: 20px;
}

.profile-header {
  margin-bottom: 30px;
}

.user-card {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 30px;
  align-items: center;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid var(--theme-color);
  padding: 3px;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 8px;
}

.signature {
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
}

.user-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--theme-color);
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.user-posts {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.user-posts h3 {
  font-size: 18px;
  color: var(--text-color);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.loading, .no-posts {
  text-align: center;
  padding: 40px 0;
  color: #8a919f;
}

.post-item {
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);
}

.post-item:last-child {
  border-bottom: none;
}

.post-title {
  font-size: 18px;
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
}

.post-title:hover {
  color: var(--theme-color);
}

.post-preview {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
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

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.edit-btn {
  padding: 6px 12px;
  background-color: var(--theme-color);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.edit-btn:hover {
  opacity: 0.9;
}

.edit-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.edit-form {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.edit-form h3 {
  margin-bottom: 20px;
  font-size: 18px;
  color: var(--text-color);
  text-align: center;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-color);
}

.form-item textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
  line-height: 1.6;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #8a919f;
  margin-top: 4px;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.save-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #fff;
  border: 1px solid var(--border-color);
  color: #8a919f;
}

.cancel-btn:hover {
  border-color: #8a919f;
}

.save-btn {
  background: var(--theme-color);
  border: none;
  color: #fff;
}

.save-btn:hover {
  opacity: 0.9;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--border-color);
}

.edit-btn {
  background-color: #fff;
  color: var(--theme-color);
  border-color: var(--theme-color);
}

.edit-btn:hover {
  background-color: var(--theme-color);
  color: #fff;
}

.delete-btn {
  background-color: #fff;
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.delete-btn:hover {
  background-color: #ff4d4f;
  color: #fff;
}
</style> 