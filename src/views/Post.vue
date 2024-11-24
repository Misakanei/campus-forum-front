<template>
  <div class="post-layout">
    <!-- 作者信息侧边栏 -->
    <div class="author-sidebar">
      <div class="author-card">
        <img 
          :src="authorAvatar" 
          class="author-avatar"
          :alt="postAuthor"
        >
        <div class="author-info">
          <h3 class="author-name">{{ postAuthor }}</h3>
          <p class="author-signature">{{ authorSignature || '这个人很懒，还没有设置签名~' }}</p>
        </div>
      </div>
    </div>

    <!-- 文章主体内容 -->
    <div class="post-container">
      <div v-if="isLoading" class="loading">加载中...</div>
      <div v-else>
        <div class="post-header">
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <div class="meta-left">
              <span class="date">
                {{ post.updateTime ? '修改于: ' + formatDate(post.updateTime) : '发布于: ' + formatDate(post.createTime) }}
              </span>
              <div class="action-buttons">
                <button 
                  class="support-btn" 
                  @click="handleSupport"
                  :class="{ 'supported': isSupported }"
                  :disabled="isSupporting"
                >
                  {{ isSupported ? '取消点赞' : '点赞' }} 👍 {{ supportCount }}
                </button>
                <button 
                  class="comment-btn"
                  @click="showCommentForm = true"
                >
                  评论 💬
                </button>
              </div>
            </div>
            <div class="meta-right">
              <span class="views">👁️ {{ post.readingVolume }}</span>
              <span class="comments">💬 {{ comments.length }}</span>
            </div>
          </div>
        </div>
        <div class="post-content">
          <p>{{ post.content }}</p>
          <div v-if="post.imagePath" class="post-image">
            <img 
              :src="getImageUrl(post.imagePath)" 
              alt="帖子图片"
              @click="showImagePreview = true"
            >
          </div>
        </div>
        <div v-if="showImagePreview && post.imagePath" class="image-preview-overlay" @click="showImagePreview = false">
          <div class="image-preview-content">
            <img :src="getImageUrl(post.imagePath)" alt="帖子图片">
            <button class="close-preview" @click.stop="showImagePreview = false">✕</button>
          </div>
        </div>
        <div class="post-comments">
          <h3>评论</h3>
          <div v-if="comments.length === 0" class="no-comments">
            <div class="no-comments-icon">💭</div>
            <p>还没有人评论哦~</p>
            <p class="no-comments-tip">来发表第一条评论吧！</p>
          </div>
          <ul v-else>
            <li v-for="comment in comments" :key="comment.commentId">
              <p>{{ comment.content }}</p>
              <span class="comment-author">评论者: {{ commentAuthors[comment.userId] || '未知用户' }}</span>
              <span class="comment-time">发布于: {{ formatDate(comment.createdTime) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 评论表单 -->
    <div class="comment-form" v-if="showCommentForm">
      <h3>发表评论</h3>
      <textarea 
        v-model="newComment"
        placeholder="请输入您的评论..."
        :maxlength="500"
      ></textarea>
      <div class="comment-form-footer">
        <span class="comment-length">{{ newComment.length }}/500</span>
        <div class="comment-buttons">
          <button class="cancel-btn" @click="cancelComment">取消</button>
          <button 
            class="submit-btn" 
            @click="submitComment"
            :disabled="!newComment.trim() || isSubmitting"
          >
            发表评论
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import axios from 'axios'

const route = useRoute()
const userStore = useUserStore()
const post = ref({})
const comments = ref([])
const supportCount = ref(0)
const isLoading = ref(true)
const postAuthor = ref('未知用户')
const authorSignature = ref('')
const commentAuthors = ref({})
const isSupported = ref(false)
const isSupporting = ref(false)
const showCommentForm = ref(false)
const newComment = ref('')
const isSubmitting = ref(false)
const showImagePreview = ref(false)
const authorAvatar = ref('')

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

const fetchUserById = async (userId) => {
  try {
    const response = await axios.get(`/user/findUserById/${userId}`)
    if (response.data.avatarPath) {
      authorAvatar.value = `http://localhost:8080${response.data.avatarPath}`
    } else {
      authorAvatar.value = `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.data.username}`
    }
    return {
      username: response.data.username,
      signature: response.data.signature,
      avatarPath: response.data.avatarPath
    }
  } catch (error) {
    console.error(`获取用户 ${userId} 信息失败：`, error)
    authorAvatar.value = `https://api.dicebear.com/7.x/avataaars/svg?seed=unknown`
    return null
  }
}

const fetchPostDetail = async () => {
  try {
    const postId = route.params.id
    const response = await axios.get(`/posts/getPostDetail/${postId}`)
    post.value = response.data.post
    comments.value = response.data.comments
    supportCount.value = post.value.support
    
    // 获取文章作者信息
    const authorData = await fetchUserById(post.value.userId)
    if (authorData) {
      postAuthor.value = authorData.username
      authorSignature.value = authorData.signature
      // 确保头像URL不会被覆盖
      if (authorData.avatarPath) {
        authorAvatar.value = `http://localhost:8080${authorData.avatarPath}`
      }
    }

    // 获取评论者用户名
    const commentPromises = comments.value.map(async comment => {
      if (!commentAuthors.value[comment.userId]) {
        const userData = await fetchUserById(comment.userId)
        commentAuthors.value[comment.userId] = userData ? userData.username : '未知用户'
      }
    })

    await Promise.all(commentPromises)
  } catch (error) {
    console.error('获取文章详情失败：', error)
  } finally {
    isLoading.value = false
  }
}

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchPostDetail()
  }
}, { immediate: true })

const handleSupport = async () => {
  if (!userStore.isLoggedIn) {
    window.alert('请先登录后再点赞！')
    return
  }

  if (isSupporting.value) return

  try {
    isSupporting.value = true
    const url = isSupported.value 
      ? `/posts/unSupport/${post.value.postId}`
      : `/posts/support/${post.value.postId}`
    
    const response = await axios.post(url)
    
    if (response.data.status === 200) {
      supportCount.value = isSupported.value ? supportCount.value - 1 : supportCount.value + 1
      isSupported.value = !isSupported.value
      
      // 重新获取帖子详情以确保数据同步
      await fetchPostDetail()
    } else {
      window.alert(response.data.message || '操作失败，请重试')
    }
  } catch (error) {
    console.error('点赞操作失败：', error)
    window.alert('操作失败，请重试')
  } finally {
    isSupporting.value = false
  }
}

const cancelComment = () => {
  showCommentForm.value = false
  newComment.value = ''
}

const submitComment = async () => {
  if (!userStore.isLoggedIn) {
    window.alert('请先登录后再评论！')
    return
  }

  if (!newComment.value.trim()) {
    return
  }

  try {
    isSubmitting.value = true
    const response = await axios.post('/comments/addComment', {
      userId: String(userStore.userInfo.userId),
      postId: String(post.value.postId),
      comment: newComment.value.trim()
    })

    if (response.data.status === 200) {
      await fetchPostDetail()
      window.alert('评论成功！')
      newComment.value = ''
      showCommentForm.value = false
    } else {
      if (response.data.errorCode === 'COMMENTS_CAN_NOT_BE_EMPTY') {
        window.alert('评论内容不能为空')
      } else {
        window.alert(response.data.message || '评论失败，请重试')
      }
    }
  } catch (error) {
    console.error('提交评论失败：', error)
    window.alert('评论失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// 修改评论区滚动到底部的函数
const scrollToLatestComment = () => {
  if (comments.value.length > 0) {
    const commentsList = document.querySelector('.post-comments ul')
    if (commentsList) {
      commentsList.scrollTop = commentsList.scrollHeight
    }
  }
}

const getImageUrl = (path) => {
  if (!path) return ''
  // 如果路径已经包含完整的URL，直接返回
  if (path.startsWith('http')) return path
  // 否则拼接��端地址，并确保路径正确
  return `http://localhost:8080${path.startsWith('/') ? path : '/' + path}`
}
</script>

<style scoped>
.post-layout {
  display: flex;
  gap: 20px;
  margin: 80px auto 0;
  max-width: 1200px;
  position: relative;
}

.author-sidebar {
  width: 240px;
  margin-top: 0;
  height: fit-content;
}

.author-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.author-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid var(--theme-color);
  padding: 2px;
}

.author-info {
  text-align: center;
  width: 100%;
}

.author-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
}

.author-signature {
  font-size: 14px;
  color: #8a919f;
  line-height: 1.4;
  word-break: break-word;
}

.post-container {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.post-header {
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
}

.post-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 8px;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #8a919f;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-right {
  display: flex;
  gap: 16px;
}

.post-content {
  font-size: 16px;
  color: #333;
  line-height: 1.6;
}

.post-comments {
  margin-top: 40px;
}

.post-comments h3 {
  font-size: 20px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.post-comments ul {
  list-style: none;
  padding: 0;
  max-height: 500px; /* 限评论区高度 */
  overflow-y: auto; /* 添加垂直滚动条 */
}

.post-comments li {
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 8px;
  background-color: var(--bg-color);
}

.post-comments li p {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.comment-author, .comment-time {
  display: inline-block;
  font-size: 12px;
  color: #8a919f;
  margin-right: 12px;
}

.loading {
  text-align: center;
  font-size: 16px;
  color: var(--text-color);
}

.no-comments {
  text-align: center;
  padding: 40px 0;
  color: #8a919f;
}

.no-comments-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-comments p {
  margin: 8px 0;
  font-size: 16px;
}

.no-comments-tip {
  font-size: 14px;
  color: #b2b7c3;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.support-btn,
.comment-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: #fff;
  color: #8a919f;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.comment-btn:hover {
  color: var(--theme-color);
  border-color: var(--theme-color);
}

.comment-form {
  margin-top: 20px;
  padding: 20px;
  background: var(--bg-color);
  border-radius: 8px;
}

.comment-form h3 {
  margin-bottom: 16px;
  font-size: 18px;
  color: var(--text-color);
}

.comment-form textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
  line-height: 1.6;
}

.comment-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.comment-length {
  font-size: 12px;
  color: #8a919f;
}

.comment-buttons {
  display: flex;
  gap: 12px;
}

.cancel-btn,
.submit-btn {
  padding: 6px 16px;
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

.submit-btn {
  background: var(--theme-color);
  border: none;
  color: #fff;
}

.submit-btn:hover {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 添加滚动条样式 */
.post-comments ul::-webkit-scrollbar {
  width: 6px;
}

.post-comments ul::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.post-comments ul::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.post-comments ul::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.post-image {
  margin-top: 20px;
  text-align: center;
}

.post-image img {
  max-width: 100%;
  max-height: 500px;
  border-radius: 8px;
  cursor: pointer;
}

.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.image-preview-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image-preview-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.close-preview {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
}

.close-preview:hover {
  opacity: 0.8;
}
</style> 