<template>
  <header class="header">
    <div class="header-content">
      <div class="left">
        <a href="/" class="logo" @click.prevent="refreshPage">校园论坛</a>
        <nav class="nav-links">
          <a href="/" @click.prevent="refreshPage">首页</a>
          <router-link to="/about">关于</router-link>
        </nav>
      </div>
      <div class="right">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchText"
            placeholder="搜索帖子"
            @keyup.enter="handleSearch"
          >
          <button class="search-btn" @click="handleSearch">搜索</button>
        </div>
        <template v-if="!userStore.isLoggedIn">
          <router-link to="/login" class="login-btn">登录</router-link>
          <router-link to="/register" class="register-btn">注册</router-link>
        </template>
        <template v-else>
          <router-link to="/write" class="write-btn">发帖</router-link>
          <div class="user-info" @click="showUserMenu = !showUserMenu">
            <img 
              :src="userAvatar" 
              :alt="userStore.userInfo.username" 
              class="user-avatar"
            >
            <span class="username">{{ userStore.userInfo.username }}</span>
            <div class="user-menu" v-show="showUserMenu" @click.stop>
              <router-link to="/profile" class="menu-item">
                个人主页
              </router-link>
              <router-link to="/settings" class="menu-item">
                设置
              </router-link>
              <div class="menu-item" @click="handleLogout">
                退出登录
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid var(--border-color);
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: var(--theme-color);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  color: var(--text-color);
  text-decoration: none;
  font-size: 16px;
}

.nav-links a:hover {
  color: var(--theme-color);
}

.right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box input {
  width: 200px;
  height: 34px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0 12px;
  outline: none;
}

.write-btn {
  background-color: var(--theme-color);
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
}

.user-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
}

.search-box {
  position: relative;
  display: flex;
  gap: 8px;
}

.search-btn {
  padding: 0 16px;
  background-color: var(--theme-color);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.search-btn:hover {
  opacity: 0.9;
}

.auth-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.login-btn, .register-btn {
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.login-btn {
  color: var(--theme-color);
  border: 1px solid var(--theme-color);
}

.login-btn:hover {
  background-color: rgba(30, 128, 255, 0.05);
}

.register-btn {
  background-color: var(--theme-color);
  color: #fff;
}

.register-btn:hover {
  opacity: 0.9;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  position: relative;
  cursor: pointer;
}

.user-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 120px;
}

.menu-item {
  display: block;
  padding: 8px 16px;
  color: var(--text-color);
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: var(--bg-color);
}

.write-btn {
  background-color: var(--theme-color);
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  transition: opacity 0.2s;
}

.write-btn:hover {
  opacity: 0.9;
}

.user-info {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: var(--bg-color);
}

.username {
  font-size: 14px;
  color: var(--text-color);
  margin: 0 4px;
}

/* 确保下拉菜单在其他元素之上 */
.user-menu {
  z-index: 1000;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
</style>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()
const showUserMenu = ref(false)
const searchText = ref('')
const userAvatar = ref('')

// 刷新页面函数
const refreshPage = () => {
  window.location.href = '/'
}

// 检查初始登录状态
onMounted(() => {
  // 检查 cookie 中的 token
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('satoken='))
  const token = tokenCookie ? tokenCookie.split('=')[1] : ''
  
  if (token && !userStore.isLoggedIn) {
    // 如果有 token 但状态未登录，更新状态
    userStore.setLoginState(token, {
      username: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).username : ''
    })
  }

  // 添加点击外部关闭菜单的事件监听
  document.addEventListener('click', handleClickOutside)

  if (userStore.isLoggedIn) {
    fetchUserAvatar()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event) => {
  const userInfo = document.querySelector('.user-info')
  if (userInfo && !userInfo.contains(event.target)) {
    showUserMenu.value = false
  }
}

const handleLogout = async () => {
  try {
    // 从 localStorage 中获取用户信息
    const userInfoStr = localStorage.getItem('userInfo')
    if (!userInfoStr) {
      throw new Error('用户信息不完整')
    }
    
    const userInfo = JSON.parse(userInfoStr)
    if (!userInfo.username) {
      throw new Error('用户信息不完整')
    }

    // 调用后端退出登录接口
    const response = await axios.get(`/user/logout/${userInfo.username}`)
    
    if (response.data.status === 200) {
      // 清除前端状态
      await userStore.clearLoginState()
      showUserMenu.value = false
      window.alert('退出登录成功！')
      // 使用 window.location.href 进行跳转并刷新页面
      window.location.href = '/login'
    } else {
      throw new Error(response.data.message || '退出登录失败')
    }
  } catch (error) {
    console.error('退出登录失败：', error)
    window.alert(error.message || '退出登录失败，请重试')
  }
}

const handleSearch = () => {
  if (!searchText.value.trim()) return
  
  // 使用路由导航到搜索结果页面，并传递搜索关键词
  router.push({
    path: '/search',
    query: { keyword: searchText.value.trim() }
  })
  
  // 清空搜索框
  searchText.value = ''
}

// 获取用户头像
const fetchUserAvatar = async () => {
  try {
    const response = await axios.get(`/user/findUserById/${userStore.userInfo.userId}`)
    if (response.data.avatarPath) {
      userAvatar.value = `http://localhost:8080${response.data.avatarPath}`
    } else {
      userAvatar.value = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStore.userInfo.username}`
    }
  } catch (error) {
    console.error('获取用户头像失败：', error)
    userAvatar.value = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStore.userInfo.username}`
  }
}

// 监听登录状态变化
watch(() => userStore.isLoggedIn, (newValue) => {
  if (newValue) {
    fetchUserAvatar()
  }
})
</script> 