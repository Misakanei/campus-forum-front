<template>
  <div class="user-management">
    <h2>用户管理</h2>
    <div class="table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>注册时间</th>
            <th>管理员</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.userId">
            <td>{{ user.userId }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ formatDate(user.createdTime) }}</td>
            <td>
              <span :class="['admin-status', user.isAdmin === 1 ? 'is-admin' : 'not-admin']">
                {{ user.isAdmin === 1 ? '是' : '否' }}
              </span>
            </td>
            <td>
              <span :class="['status', user.deleted === 1 ? 'disabled' : 'active']">
                {{ user.deleted === 1 ? '已禁用' : '正常' }}
              </span>
            </td>
            <td class="action-cell">
              <div class="action-buttons">
                <button 
                  class="action-btn"
                  :class="user.deleted === 1 ? 'enable-btn' : 'disable-btn'"
                  @click="toggleUserStatus(user)"
                >
                  {{ user.deleted === 1 ? '启用' : '禁用' }}
                </button>
                <button 
                  class="action-btn reset-btn"
                  @click="resetPassword(user)"
                >
                  重置密码
                </button>
              </div>
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

const users = ref([])

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

const fetchUsers = async () => {
  try {
    const response = await axios.post('/user/getAllUsers')
    if (response.data.status === 200) {
      users.value = response.data.data || []
    } else {
      console.error('获取用户列表失败：', response.data.message)
    }
  } catch (error) {
    console.error('获取用户列表失败：', error)
  }
}

const toggleUserStatus = async (user) => {
  if (!confirm(`确定要${user.deleted === 1 ? '启用' : '禁用'}该用户吗？`)) return
  
  try {
    const url = user.deleted === 1 ? '/user/undeleteUser' : '/user/deleteUser'
    const response = await axios.get(url, {
      params: {
        id: user.userId
      }
    })
    
    if (response.data.status === 200) {
      await fetchUsers()
      window.alert(response.data.message || `${user.deleted === 1 ? '启用' : '禁用'}成功`)
    } else {
      window.alert(response.data.message || '操作失败')
    }
  } catch (error) {
    console.error('操作失败：', error)
    window.alert('操作失败，请重试')
  }
}

const resetPassword = async (user) => {
  if (!confirm(`确定要重置用户 "${user.username}" 的密码吗？重置后密码将变为：123456`)) return
  
  try {
    const response = await axios.post(`/user/resetPassword/${user.userId}`)
    if (response.data.status === 200) {
      window.alert('密码重置成功！')
    } else {
      window.alert(response.data.message || '重置失败')
    }
  } catch (error) {
    console.error('重置密码失败：', error)
    window.alert('重置失败，请重试')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
  padding: 0;
}

h2 {
  margin-bottom: 24px;
  color: #1a1a1a;
}

.table-container {
  background: #fff;
  border-radius: 0;
  padding: 16px;
  box-shadow: none;
  overflow-x: auto;
}

.user-table {
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

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.disabled {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.action-cell {
  min-width: 200px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
  min-width: 80px;
  text-align: center;
}

.enable-btn {
  background-color: #52c41a;
  color: #fff;
}

.disable-btn {
  background-color: #faad14;
  color: #fff;
}

.delete-btn {
  background-color: #ff4d4f;
  color: #fff;
}

.action-btn:hover {
  opacity: 0.8;
}

.admin-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.is-admin {
  background-color: #ffd666;
  color: #d48806;
}

.not-admin {
  background-color: #d9d9d9;
  color: #666;
}

.reset-btn {
  background-color: #faad14;
  color: #fff;
}

.reset-btn:hover {
  opacity: 0.8;
}
</style> 