<template>
  <div class="home-container">
    <sidebar class="side" @categoryChange="handleCategoryChange"></sidebar>
    <div class="content">
      <div class="content-header">
        <h2>最新文章</h2>
      </div>
      <article-list :categoryId="currentCategoryId"></article-list>
    </div>
    <div class="right-sidebar">
      <user-panel></user-panel>
      <hot-posts></hot-posts>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import ArticleList from '../components/ArticleList.vue'
import UserPanel from '../components/UserPanel.vue'
import HotPosts from '../components/HotPosts.vue'

const currentCategoryId = ref(null)

const handleCategoryChange = (categoryId) => {
  currentCategoryId.value = categoryId
}
</script>

<style scoped>
.home-container {
  display: grid;
  grid-template-columns: 240px 1fr 300px;
  gap: 20px;
  margin-top: 80px;
}

.content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.content-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.content-header h2 {
  font-size: 18px;
  color: var(--text-color);
  font-weight: 600;
}

.side {
  width: 240px;
}

.right-sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style> 