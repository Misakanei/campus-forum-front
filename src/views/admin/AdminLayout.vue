<template>
  <div class="admin-layout">
    <div class="admin-sidebar">
      <div class="logo">校园论坛后台管理</div>
      <nav class="nav-menu">
        <router-link to="/admin/dashboard" class="nav-item">
          数据统计
        </router-link>
        <router-link to="/admin/users" class="nav-item">
          用户管理
        </router-link>
        <router-link to="/admin/posts" class="nav-item">
          帖子管理
        </router-link>
        <router-link to="/admin/comments" class="nav-item">
          评论管理
        </router-link>
        <router-link to="/admin/categories" class="nav-item">
          板块管理
        </router-link>
      </nav>
      <div class="admin-footer">
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </div>
    <div class="admin-main">
      <div class="admin-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
  width: 100%;
}

.admin-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 220px;
  background-color: #001529;
  color: #fff;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.logo {
  height: 64px;
  padding: 16px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-menu {
  flex: 1;
  padding: 24px 0;
  overflow-y: auto;
}

.nav-item {
  display: block;
  padding: 12px 24px;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s;
  margin-bottom: 4px;
}

.nav-item:hover,
.nav-item.router-link-active {
  background-color: #1890ff;
}

.admin-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background-color: transparent;
  border: 1px solid #fff;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.admin-main {
  flex: 1;
  margin-left: 220px;
  width: calc(100% - 220px);
  min-height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  padding-top: 64px;
}

.admin-content {
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
  max-width: none;
  min-width: 1200px;
  width: 100%;
  max-width: 1600px;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  padding: 0;
}

/* 登录页面特殊处理 */
:deep(.admin-login-container) {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-sidebar {
    width: 180px;
  }
  
  .admin-main {
    margin-left: 180px;
    width: calc(100% - 180px);
  }
  
  .logo {
    font-size: 16px;
  }
  
  .nav-item {
    padding: 10px 16px;
  }
}
</style>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.clearLoginState()
    router.push('/admin/login')
  }
}
</script> 