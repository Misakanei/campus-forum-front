<template>
  <div class="register-container">
    <div class="register-box">
      <h2>注册</h2>
      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-item">
          <label>用户名</label>
          <div class="input-wrapper">
            <input 
              type="text" 
              v-model="username"
              @blur="checkUsername"
              :class="{ 'error': errors.username }"
              placeholder="请输入3-10个字符的用户名"
              :disabled="isLoading"
            >
            <div class="loading-spinner" v-if="isCheckingUsername"></div>
          </div>
          <transition name="fade">
            <span class="error-message" v-if="errors.username">
              <i class="error-icon">❌</i>
              {{ errors.username }}
            </span>
          </transition>
        </div>
        
        <div class="form-item">
          <label>邮箱</label>
          <input 
            type="email" 
            v-model="email"
            :class="{ 'error': errors.email }"
            placeholder="请输入邮箱"
            :disabled="isLoading"
          >
          <transition name="fade">
            <span class="error-message" v-if="errors.email">
              <i class="error-icon">❌</i>
              {{ errors.email }}
            </span>
          </transition>
        </div>
        
        <div class="form-item">
          <label>密码</label>
          <input 
            type="password" 
            v-model="password"
            :class="{ 'error': errors.password }"
            placeholder="请输入6-18个字符的密码"
            :disabled="isLoading"
          >
          <transition name="fade">
            <span class="error-message" v-if="errors.password">
              <i class="error-icon">❌</i>
              {{ errors.password }}
            </span>
          </transition>
        </div>
        
        <div class="form-item">
          <label>确认密码</label>
          <input 
            type="password" 
            v-model="confirmPassword"
            :class="{ 'error': errors.confirmPassword }"
            placeholder="请再次输入密码"
            :disabled="isLoading"
          >
          <transition name="fade">
            <span class="error-message" v-if="errors.confirmPassword">
              <i class="error-icon">❌</i>
              {{ errors.confirmPassword }}
            </span>
          </transition>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="!isLoading">注册</span>
          <div class="loading-spinner" v-else></div>
        </button>
        
        <div class="form-footer">
          已有账号？
          <router-link to="/login">立即登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errors = ref({})
const isLoading = ref(false)
const isCheckingUsername = ref(false)

const checkUsername = async () => {
  if (!username.value) return
  
  if (!/^[a-zA-Z0-9]{3,10}$/.test(username.value)) {
    errors.value.username = '用户名必须为3-10个字符的英文字母或数字'
    return
  }
  
  try {
    isCheckingUsername.value = true
    const response = await axios.get(`/user/findUserByUsername/${username.value}`)
    
    if (response.data === true || response.data === 'true') {
      errors.value.username = '该用户名已被注册'
    } else {
      delete errors.value.username
    }
  } catch (error) {
    console.error('检查用户名出错：', error)
    errors.value.username = '检查用户名失败，请稍后重试'
  } finally {
    isCheckingUsername.value = false
  }
}

const validateForm = () => {
  errors.value = {}
  
  // 验证用户名
  if (!username.value) {
    errors.value.username = '请输入用户名'
  } else if (!/^[a-zA-Z0-9]{3,10}$/.test(username.value)) {
    errors.value.username = '用户名必须为3-10个字符的英文字母或数字'
  }
  
  // 验证邮箱
  if (!email.value) {
    errors.value.email = '请输入邮箱'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = '请输入正确的邮箱格式'
  }
  
  // 验证密码
  if (!password.value) {
    errors.value.password = '请输入密码'
  } else if (!/^[a-zA-Z0-9!@#$%^&*]{6,18}$/.test(password.value)) {
    errors.value.password = '密码必须为6-18个字符的英文字母、数字或特殊符号'
  }
  
  // 验证确认密码
  if (!confirmPassword.value) {
    errors.value.confirmPassword = '请确认密码'
  } else if (confirmPassword.value !== password.value) {
    errors.value.confirmPassword = '两次输入的密码不一致'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  if (isLoading.value) return
  
  try {
    isLoading.value = true
    const response = await axios.post('/user/register', {
      username: username.value,
      password: password.value,
      email: email.value
    })

    console.log('注册响应:', response.data)

    // 根据后端返回的 status 判断注册状态
    if (response.data.status === 200) {
      window.alert('注册成功！')
      router.push('/login')
    } else {
      let errorMessage = ''
      switch (response.data.errorCode) {
        case 'ERROR_USERNAME_TAKEN':
          errorMessage = '该用户名已被注册'
          break
        case 'ERROR_INCOMPLETE_INFORMATION':
          errorMessage = '注册信息不完整'
          break
        case 'ERROR_SERVER':
          errorMessage = '服务器错误，请稍后重试'
          break
        default:
          errorMessage = response.data.message || '注册失败，请重试'
      }
      window.alert(errorMessage)
    }
  } catch (error) {
    console.error('注册失败：', error)
    window.alert(error.response?.data?.message || '网络错误，请检查网络连接')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: var(--bg-color);
}

.register-box {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-color);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 14px;
  color: var(--text-color);
}

input {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

input.error {
  border-color: #ff4d4f;
}

.error-message {
  font-size: 12px;
  color: #ff4d4f;
}

.submit-btn {
  padding: 12px;
  background-color: var(--theme-color);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: opacity 0.2s;
}

.submit-btn:hover {
  opacity: 0.9;
}

.form-footer {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.form-footer a {
  color: var(--theme-color);
  text-decoration: none;
  margin-left: 4px;
}

.form-footer a:hover {
  text-decoration: underline;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-wrapper input {
  width: 100%;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--theme-color);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 4px;
}

.error-icon {
  font-size: 12px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.submit-btn {
  position: relative;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

input,
.input-wrapper {
  box-sizing: border-box;
  width: 100%;
}
</style> 