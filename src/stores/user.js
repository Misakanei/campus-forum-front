import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('satoken') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  const isLoggedIn = ref(!!localStorage.getItem('satoken'))
  const isAdmin = ref(userInfo.value.isAdmin === 1)
  const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'

  // 监听 token 变化
  watch(token, (newToken) => {
    isLoggedIn.value = !!newToken
  })

  // 设置登录状态
  const setLoginState = (tokenValue, user) => {
    console.log('设置登录状态:', { tokenValue, user })
    token.value = tokenValue
    userInfo.value = {
      ...user,
      avatar: user.avatar || defaultAvatar
    }
    isLoggedIn.value = true
    isAdmin.value = user.isAdmin === 1
    localStorage.setItem('satoken', tokenValue)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  // 清除登录状态
  const clearLoginState = async () => {
    try {
      document.cookie = 'satoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      token.value = ''
      userInfo.value = {}
      isLoggedIn.value = false
      isAdmin.value = false
      localStorage.removeItem('satoken')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('rememberedUsername')
      localStorage.removeItem('rememberedPassword')
      localStorage.removeItem('rememberMe')
    } catch (error) {
      console.error('清除登录状态失败：', error)
      throw error
    }
  }

  // 初始化时检查并恢复用户状态
  const initUserState = async () => {
    const storedToken = localStorage.getItem('satoken')
    const storedUserInfo = localStorage.getItem('userInfo')
    
    if (storedToken && storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo)
      token.value = storedToken
      isLoggedIn.value = true
      isAdmin.value = userInfo.isAdmin === 1
    }
  }

  // 在创建 store 时初始化状态
  initUserState()

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    defaultAvatar,
    setLoginState,
    clearLoginState
  }
}) 