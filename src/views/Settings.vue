<template>
  <div class="settings-container">
    <div class="settings-box">
      <h2>个人设置</h2>
      
      <div class="settings-content">
        <!-- 头像设置 -->
        <div class="settings-section">
          <h3>头像设置</h3>
          <div class="avatar-upload">
            <img 
              :src="userAvatar" 
              class="current-avatar"
              alt="用户头像"
            >
            <div class="avatar-actions">
              <input 
                type="file" 
                ref="fileInput"
                @change="handleAvatarSelect"
                accept="image/*"
                style="display: none"
              >
              <button class="upload-btn" @click="triggerFileInput">
                更换头像
              </button>
            </div>
          </div>
        </div>

        <!-- 基本信息设置 -->
        <div class="settings-section">
          <h3>基本信息</h3>
          <div class="form-group">
            <label>用户名</label>
            <input 
              type="text" 
              v-model="userInfo.username" 
              disabled
              class="disabled-input"
            >
            <span class="input-tip">用户名不可修改</span>
          </div>

          <div class="form-group">
            <label>邮箱</label>
            <input 
              type="email" 
              v-model="userInfo.email"
              :disabled="isSubmitting"
            >
          </div>

          <div class="form-group">
            <label>个性签名</label>
            <textarea 
              v-model="userInfo.signature"
              :maxlength="200"
              placeholder="写点什么介绍一下自己吧..."
              :disabled="isSubmitting"
            ></textarea>
            <span class="char-count">{{ userInfo.signature?.length || 0 }}/200</span>
          </div>
        </div>

        <!-- 密码修改入口 -->
        <div class="settings-section">
          <h3>账号安全</h3>
          <div class="security-item">
            <div class="security-info">
              <span class="security-label">密码</span>
              <span class="security-tip">建议定期修改密码，确保账号安全</span>
            </div>
            <button class="change-password-btn" @click="$router.push('/change-password')">
              修改密码
            </button>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="settings-actions">
          <button 
            class="cancel-btn" 
            @click="$router.push('/profile')"
            :disabled="isSubmitting"
          >
            取消
          </button>
          <button 
            class="save-btn" 
            @click="handleSave"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()
const isSubmitting = ref(false)

const userInfo = ref({
  username: '',
  email: '',
  signature: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const fileInput = ref(null)
const userAvatar = ref('')

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await axios.get(`/user/findUserById/${userStore.userInfo.userId}`)
    userInfo.value = {
      username: response.data.username,
      email: response.data.email,
      signature: response.data.signature,
      avatarPath: response.data.avatarPath
    }
    // 设置头像URL
    if (response.data.avatarPath) {
      userAvatar.value = `http://localhost:8080${response.data.avatarPath}`
    } else {
      userAvatar.value = `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.data.username}`
    }
  } catch (error) {
    console.error('获取用户信息失败：', error)
    window.alert('获取用户信息失败')
  }
}

// 验证表单
const validateForm = () => {
  // 验证密码修改
  if (passwordForm.value.oldPassword || passwordForm.value.newPassword || passwordForm.value.confirmPassword) {
    if (!passwordForm.value.oldPassword) {
      window.alert('请输入当前密码')
      return false
    }
    if (!passwordForm.value.newPassword) {
      window.alert('请输入新密码')
      return false
    }
    if (!passwordForm.value.confirmPassword) {
      window.alert('请确认新密码')
      return false
    }
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      window.alert('两次输入的新密码不一致')
      return false
    }
    if (passwordForm.value.newPassword.length < 6 || passwordForm.value.newPassword.length > 18) {
      window.alert('新密码长度必须在6-18位之间')
      return false
    }
  }

  return true
}

// 保存修改
const handleSave = async () => {
  try {
    isSubmitting.value = true

    // 发送更新请求
    const response = await axios.post('/user/updateUserInfo', {
      userId: userStore.userInfo.userId,
      email: userInfo.value.email,
      signature: userInfo.value.signature
    })

    if (response.data === 'success') {
      // 更新成功后重新获取用户信息
      await fetchUserInfo()
      window.alert('保存成功！')
      // 刷新当前页面
      window.location.reload()
    } else {
      window.alert('保存失败，请重试')
    }
  } catch (error) {
    console.error('保存失败：', error)
    window.alert('保存失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleAvatarSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    window.alert('图片大小不能超过5MB')
    return
  }

  try {
    const formData = new FormData()
    formData.append('avatar', file)
    formData.append('userId', userStore.userInfo.userId)

    const response = await axios.post('/user/uploadAvatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data.status === 200) {
      // 更新头像显示
      userAvatar.value = `http://localhost:8080${response.data.data}`
      userInfo.value.avatarPath = response.data.data
      window.alert('头像更新成功！')
    } else {
      window.alert(response.data.message || '上传失败，请重试')
    }
  } catch (error) {
    console.error('上传头像失败：', error)
    window.alert('上传失败，请重试')
  }
}

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    window.alert('请先登录！')
    router.push('/login')
    return
  }

  await fetchUserInfo()
})
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  padding: 100px 20px 20px;
  background-color: var(--bg-color);
}

.settings-box {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-color);
}

.settings-section {
  margin-bottom: 40px;
}

.settings-section h3 {
  font-size: 18px;
  color: var(--text-color);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-color);
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.disabled-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.input-tip {
  font-size: 12px;
  color: #8a919f;
  margin-top: 4px;
  display: block;
}

.char-count {
  font-size: 12px;
  color: #8a919f;
  text-align: right;
  display: block;
  margin-top: 4px;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
}

.cancel-btn,
.save-btn {
  padding: 8px 24px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #fff;
  border: 1px solid var(--border-color);
  color: #666;
}

.cancel-btn:hover {
  border-color: #666;
}

.save-btn {
  background: var(--theme-color);
  border: none;
  color: #fff;
}

.save-btn:hover {
  opacity: 0.9;
}

.save-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input:disabled,
textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.security-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.security-label {
  font-size: 16px;
  color: var(--text-color);
}

.security-tip {
  font-size: 12px;
  color: #8a919f;
}

.change-password-btn {
  padding: 8px 16px;
  background-color: #fff;
  border: 1px solid var(--theme-color);
  color: var(--theme-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.change-password-btn:hover {
  background-color: var(--theme-color);
  color: #fff;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.current-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--theme-color);
  padding: 2px;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-btn {
  padding: 8px 16px;
  background-color: var(--theme-color);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.upload-btn:hover {
  opacity: 0.9;
}
</style> 