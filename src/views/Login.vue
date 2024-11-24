<template>
  <div class="login-container">
    <div class="login-box">
      <h2>登录</h2>
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-item">
          <label>用户名</label>
          <input 
            type="text" 
            v-model="username"
            :class="{ 'error': errors.username }"
            placeholder="请输入用户名"
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

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe">
            记住密码
          </label>
        </div>

        <button type="submit" class="submit-btn">登录</button>
        
        <div class="form-footer">
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </div>
      </form>
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
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const errors = ref({})

// 在组件挂载时检查登录状态
onMounted(() => {
  if (userStore.isLoggedIn) {
    alert('您已登录，无需重复登录！')
    router.push('/')
  }
})

// 检查记住的登录信息
onMounted(() => {
  const savedUsername = localStorage.getItem('rememberedUsername')
  const savedPassword = localStorage.getItem('rememberedPassword')
  const savedRememberMe = localStorage.getItem('rememberMe') === 'true'
  
  if (savedRememberMe && savedUsername && savedPassword) {
    username.value = savedUsername
    password.value = savedPassword
    rememberMe.value = true
  }
})

const handleSubmit = async () => {
  // 清除错误信息
  errors.value = {}
  
  // 表单验证
  if (!username.value) {
    errors.value.username = '请输入用户名'
    return
  }
  if (!password.value) {
    errors.value.password = '请输入密码'
    return
  }

  try {
    // 发送登录请求
    const response = await axios.post('/user/login', {
      username: username.value,
      password: password.value
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log('登录响应数据:', response.data)

    // 根据后端返回的 status 判断登录状态
    if (response.data && response.data.status === 200) {
      // 处理记住密码
      if (rememberMe.value) {
        localStorage.setItem('rememberedUsername', username.value)
        localStorage.setItem('rememberedPassword', password.value)
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberedUsername')
        localStorage.removeItem('rememberedPassword')
        localStorage.removeItem('rememberMe')
      }

      // 获取 token
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('satoken='))
      const token = tokenCookie ? tokenCookie.split('=')[1] : ''

      // 更新登录状态，使用后端返回的用户信息
      userStore.setLoginState(token, {
        username: response.data.data.username, // 从用户对象中获取用户名
        userId: response.data.data.userId // 存储用户ID
      })

      // 使用原生 window.alert 显示登录成功提示
      window.alert('登录成功！')
      
      // 跳转到首页并刷新
      window.location.href = '/'
      return
      
    } else {
      // 处理错误情况
      if (response.data.errorCode === 'ERROR_USER_OR_PASSWORD_INCORRECT') {
        window.alert('用户名或密码错误')
      } else if (response.data.errorCode === 'ERROR_USER_IS_EMPTY') {
        window.alert('用户名和密码不能为空')
      } else {
        window.alert(response.data.message || '登录失败，请重试')
      }
    }
  } catch (error) {
    console.error('登录请求失败：', error)
    window.alert(error.response?.data?.message || '网络错误，请检查网络连接')
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: var(--bg-color);
}

.login-box {
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

.login-form {
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

.form-options {
  display: flex;
  align-items: center;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.submit-btn {
  padding: 12px;
  background-color: var(--theme-color);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
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
</style> 