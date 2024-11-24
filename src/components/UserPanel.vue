<template>
  <div class="user-panel">
    <div class="user-info">
      <router-link 
        v-if="userStore.isLoggedIn" 
        to="/profile" 
        class="avatar-link"
      >
        <img 
          :src="userAvatar" 
          class="user-avatar" 
          :alt="userStore.userInfo.username"
        />
      </router-link>
      <img 
        v-else
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=guest" 
        class="user-avatar" 
        alt="访客头像"
      />
      <div class="greeting" v-if="userStore.isLoggedIn">
        <span class="greeting-text">{{ greeting }} {{ userStore.userInfo.username }}</span>
      </div>
      <div class="not-logged-in" v-else>
        <span class="login-tip">未登录</span>
        <router-link to="/login" class="login-link">点击登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/user'
import axios from 'axios'

const userStore = useUserStore()
const greeting = ref('')
const userAvatar = ref('')

const updateGreeting = () => {
  const hour = new Date().getHours()
  if (hour >= 0 && hour < 6) {
    greeting.value = '凌晨好！'
  } else if (hour >= 6 && hour < 12) {
    greeting.value = '早上好！'
  } else if (hour >= 12 && hour < 15) {
    greeting.value = '中午好！'
  } else if (hour >= 15 && hour < 18) {
    greeting.value = '下午好！'
  } else {
    greeting.value = '晚上好！'
  }
}

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
}, { immediate: true })

onMounted(() => {
  updateGreeting()
  if (userStore.isLoggedIn) {
    fetchUserAvatar()
  }
  setInterval(updateGreeting, 60000)
})
</script>

<style scoped>
.user-panel {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid var(--theme-color);
  padding: 2px;
  cursor: pointer;
}

.greeting, .not-logged-in {
  text-align: center;
}

.greeting-text {
  font-size: 16px;
  color: var(--text-color);
}

.not-logged-in {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.login-tip {
  font-size: 16px;
  color: #8a919f;
}

.login-link {
  color: var(--theme-color);
  text-decoration: none;
  font-size: 14px;
  padding: 4px 12px;
  border: 1px solid var(--theme-color);
  border-radius: 4px;
  transition: all 0.2s;
}

.login-link:hover {
  background-color: var(--theme-color);
  color: #fff;
}

.avatar-link {
  display: block;
  cursor: pointer;
  transition: transform 0.2s;
}

.avatar-link:hover {
  transform: scale(1.05);
}
</style> 