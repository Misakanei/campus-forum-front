<template>
  <div class="admin-login-container">
    <div class="admin-login-box">
      <h2>校园论坛后台管理系统</h2>
      <form @submit.prevent="handleSubmit" class="admin-login-form">
        <div class="form-item">
          <label>管理员账号</label>
          <input 
            type="text" 
            v-model="username"
            :class="{ 'error': errors.username }"
            placeholder="请输入管理员账号"
          >
          <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
        </div>
        
        <div class="form-item">
          <label>密码</label>
          <input 
            type="password" 
            v-model="password"
            :class="{ 'error': errors.password }"
            placeholder="请输入密码"
          >
          <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const username = ref('')
const password = ref('')
const errors = ref({})
const isSubmitting = ref(false)
const userStore = useUserStore()

const validateForm = () => {
  errors.value = {}
  
  if (!username.value) {
    errors.value.username = '请输入管理员账号'
    return false
  }
  if (!password.value) {
    errors.value.password = '请输入密码'
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    const response = await axios.post('/user/login', {
      username: username.value,
      password: password.value
    })
    
    if (response.data.status === 200) {
      if (response.data.data.isAdmin !== 1) {
        window.alert('您不是管理员，无法登录后台！')
        return
      }

      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('satoken='))
      const token = tokenCookie ? tokenCookie.split('=')[1] : ''

      userStore.setLoginState(token, {
        username: response.data.data.username,
        userId: response.data.data.userId,
        isAdmin: response.data.data.isAdmin
      })

      window.alert('登录成功！')
      router.push('/admin/dashboard')
    } else {
      window.alert(response.data.message || '登录失败，请检查账号密码')
    }
  } catch (error) {
    console.error('登录失败：', error)
    window.alert('登录失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  padding: 20px;
}

.admin-login-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 40px;
  color: #1a1a1a;
  font-size: 24px;
}

.admin-login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}

input {
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

input.error {
  border-color: #ff4d4f;
}

.error-message {
  font-size: 12px;
  color: #ff4d4f;
}

.submit-btn {
  height: 40px;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover {
  background-color: #40a9ff;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 