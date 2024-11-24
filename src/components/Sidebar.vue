<template>
  <div class="sidebar">
    <div class="category-list">
      <h3>板块列表</h3>
      <ul>
        <li 
          :class="{ active: currentCategoryId === null }"
          @click="selectCategory(null)"
        >
          全部板块
        </li>
        <li 
          v-for="category in categories" 
          :key="category.category_id"
          :class="{ active: currentCategoryId === category.category_id }"
          @click="selectCategory(category.category_id)"
        >
          {{ category.categories_name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { defineEmits } from 'vue'

const emit = defineEmits(['categoryChange'])
const categories = ref([])
const currentCategoryId = ref(null)

const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:8080/categories/selectAllCategory')
    categories.value = response.data
  } catch (error) {
    console.error('获取板块列表失败：', error)
  }
}

const selectCategory = (categoryId) => {
  currentCategoryId.value = categoryId
  emit('categoryChange', categoryId)
}

onMounted(() => {
  fetchCategories()
  selectCategory(null)
})
</script>

<style scoped>
.sidebar {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-list h3 {
  font-size: 18px;
  color: var(--text-color);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.category-list ul {
  list-style: none;
  padding: 0;
}

.category-list li {
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color);
}

.category-list li:hover {
  background-color: var(--bg-color);
  color: var(--theme-color);
}

.category-list li.active {
  background-color: var(--theme-color);
  color: #fff;
}

.category-list li:first-child {
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  border-radius: 4px 4px 0 0;
}
</style> 