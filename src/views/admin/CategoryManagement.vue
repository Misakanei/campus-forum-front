<template>
  <div class="category-management">
    <h2>板块管理</h2>
    
    <!-- 添加新板块 -->
    <div class="add-category">
      <div class="input-group">
        <input 
          type="text" 
          v-model="newCategoryName"
          placeholder="输入新板块名称"
          :disabled="isSubmitting"
        >
        <input 
          type="text" 
          v-model="newCategoryDescription"
          placeholder="输入板块描述"
          :disabled="isSubmitting"
        >
      </div>
      <button 
        class="add-btn"
        @click="addCategory"
        :disabled="isSubmitting || !newCategoryName.trim()"
      >
        {{ isSubmitting ? '添加中...' : '添加板块' }}
      </button>
    </div>

    <!-- 板块列表 -->
    <div class="table-container">
      <table class="category-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>板块名称</th>
            <th>板块描述</th>
            <th>帖子数量</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.category_id">
            <td>{{ category.category_id }}</td>
            <td>
              <div v-if="editingId === category.category_id" class="edit-name">
                <input 
                  type="text" 
                  v-model="editingName"
                  @keyup.enter="saveEdit(category)"
                  @keyup.esc="cancelEdit"
                  placeholder="板块名称"
                >
                <input 
                  type="text" 
                  v-model="editingDescription"
                  @keyup.enter="saveEdit(category)"
                  @keyup.esc="cancelEdit"
                  placeholder="板块描述"
                >
                <div class="edit-actions">
                  <button class="save-btn" @click="saveEdit(category)">保存</button>
                  <button class="cancel-btn" @click="cancelEdit">取消</button>
                </div>
              </div>
              <span v-else>{{ category.categories_name }}</span>
            </td>
            <td>{{ category.description || '暂无描述' }}</td>
            <td>{{ getCategoryPostCount(category.category_id) }}</td>
            <td>{{ formatDate(category.categories_created_time) }}</td>
            <td>
              <button 
                class="action-btn edit-btn"
                @click="startEdit(category)"
                v-if="editingId !== category.category_id"
              >
                修改
              </button>
              <button 
                class="action-btn delete-btn"
                @click="deleteCategory(category)"
                v-if="editingId !== category.category_id"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const categories = ref([])
const newCategoryName = ref('')
const newCategoryDescription = ref('')
const isSubmitting = ref(false)
const editingId = ref(null)
const editingName = ref('')
const editingDescription = ref('')
const posts = ref([]) // 存储所有帖子信息

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

const fetchCategories = async () => {
  try {
    const response = await axios.get('/categories/selectAllCategory')
    categories.value = response.data || []
  } catch (error) {
    console.error('获取板块列表失败：', error)
  }
}

// 获取所有帖子
const fetchPosts = async () => {
  try {
    const response = await axios.get('/posts/summaries')
    posts.value = response.data || []
  } catch (error) {
    console.error('获取帖子列表失败：', error)
  }
}

// 获取板块的帖子数量
const getCategoryPostCount = (categoryId) => {
  return posts.value.filter(post => post.category_id === categoryId).length
}

const addCategory = async () => {
  if (!newCategoryName.value.trim() || isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    const response = await axios.post('/categories/addCategory', {
      categoryName: newCategoryName.value.trim(),
      description: newCategoryDescription.value.trim()
    })
    
    if (response.data.status === 200) {
      window.alert(response.data.message || '添加成功')
      newCategoryName.value = ''
      newCategoryDescription.value = ''
      await fetchCategories()
    } else {
      window.alert(response.data.message || '添加失败')
    }
  } catch (error) {
    console.error('添加板块失败：', error)
    window.alert('添加失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

const startEdit = (category) => {
  editingId.value = category.category_id
  editingName.value = category.categories_name
  editingDescription.value = category.description || ''
}

const cancelEdit = () => {
  editingId.value = null
  editingName.value = ''
  editingDescription.value = ''
}

const saveEdit = async (category) => {
  if (!editingName.value.trim()) return
  
  try {
    const response = await axios.post('/categories/updateCategory', {
      categoryId: String(category.category_id),
      categoryName: editingName.value.trim(),
      description: editingDescription.value.trim()
    })
    
    if (response.data.status === 200) {
      window.alert('修改成功')
      await fetchCategories()
      cancelEdit()
    } else {
      window.alert(response.data.message || '修改失败')
    }
  } catch (error) {
    console.error('修改板块失败：', error)
    window.alert('修改失败，请重试')
  }
}

const deleteCategory = async (category) => {
  if (!confirm(`确定要删除"${category.categories_name}"板块吗？此操作不可恢复！`)) return
  
  try {
    const response = await axios.post(`/categories/deleteCategory/${category.category_id}`)
    if (response.data.status === 200) {
      window.alert(response.data.message || '删除成功')
      await fetchCategories()
    } else {
      window.alert(response.data.message || '删除失败')
    }
  } catch (error) {
    console.error('删除板块失败：', error)
    window.alert('删除失败，请重试')
  }
}

onMounted(async () => {
  await Promise.all([
    fetchCategories(),
    fetchPosts()
  ])
})
</script>

<style scoped>
.category-management {
  padding: 0;
}

h2 {
  margin-bottom: 24px;
  color: #1a1a1a;
}

.add-category {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: flex-start;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
}

.add-btn {
  padding: 8px 16px;
  height: 36px;
  background-color: var(--theme-color);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.add-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-container {
  background: #fff;
  border-radius: 0;
  padding: 16px;
  box-shadow: none;
  overflow-x: auto;
}

.category-table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 16px 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background-color: #fafafa;
  font-weight: 500;
  color: #1a1a1a;
}

.edit-name {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-name input {
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
}

.edit-name input:first-child {
  margin-bottom: 4px;
}

.edit-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  margin-right: 12px;
  transition: all 0.3s;
  min-width: 64px;
}

.edit-btn {
  background-color: #1890ff;
  color: #fff;
}

.delete-btn {
  background-color: #ff4d4f;
  color: #fff;
}

.save-btn,
.cancel-btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  min-width: 64px;
}

.action-btn:hover,
.save-btn:hover,
.cancel-btn:hover {
  opacity: 0.8;
}

/* 设置各列的最小宽度 */
.category-table th:nth-child(1) { min-width: 60px; }  /* ID */
.category-table th:nth-child(2) { min-width: 150px; } /* 板块名称 */
.category-table th:nth-child(3) { min-width: 200px; } /* 板块描述 */
.category-table th:nth-child(4) { min-width: 100px; } /* 帖子数量 */
.category-table th:nth-child(5) { min-width: 160px; } /* 创建时间 */
.category-table th:nth-child(6) { min-width: 160px; } /* 操作 */
</style> 