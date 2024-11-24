<template>
  <div class="change-password-container">
    <div class="change-password-box">
      <h2>修改密码</h2>
      <form @submit.prevent="handleSubmit" class="change-password-form">
        <div class="form-group">
          <label>当前密码</label>
          <input 
            type="password" 
            v-model="passwordForm.oldPassword"
            :disabled="isSubmitting"
            placeholder="请输入当前密码"
          >
        </div>

        <div class="form-group">
          <label>新密码</label>
          <input 
            type="password" 
            v-model="passwordForm.newPassword"
            :disabled="isSubmitting"
            placeholder="请输入6-18位的新密码"
          >
        </div>

        <div class="form-group">
          <label>确认新密码</label>
          <input 
            type="password" 
            v-model="passwordForm.confirmPassword"
            :disabled="isSubmitting"
            placeholder="请再次输入新密码"
          >
        </div>

        <div class="form-buttons">
          <button 
            type="button" 
            class="cancel-btn" 
            @click="$router.push('/settings')"
            :disabled="isSubmitting"
          >
            取消
          </button>
          <button 
            type="submit" 
            class="submit-btn" 
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()
const isSubmitting = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateForm = () => {
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
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  if (isSubmitting.value) return

  try {
    isSubmitting.value = true
    const response = await axios.post('/user/updatePassword', {
      username: userStore.userInfo.username,
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })

    if (response.data.status === 200) {
      if (response.data.message === '修改成功') {
        window.alert('密码修改成功！请重新登录')
        await userStore.clearLoginState()
        router.push('/login')
      } else {
        window.alert(response.data.message || '修改失败，请检查旧密码是否正确')
      }
    } else {
      window.alert(response.data.message || '修改失败，请重试')
    }
  } catch (error) {
    console.error('修改密码失败：', error)
    window.alert('修改失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.change-password-container {
  min-height: 100vh;
  padding: 100px 20px 20px;
  background-color: var(--bg-color);
}

.change-password-box {
  max-width: 500px;
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

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-color);
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
}

.cancel-btn,
.submit-btn {
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

.submit-btn {
  background: var(--theme-color);
  border: none;
  color: #fff;
}

.submit-btn:hover {
  opacity: 0.9;
}

.submit-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style> 