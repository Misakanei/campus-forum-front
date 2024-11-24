<template>
  <div class="edit-container">
    <div class="edit-box">
      <h2>修改帖子</h2>
      <form @submit.prevent="handleSubmit" class="edit-form">
        <div class="form-item">
          <label>选择板块</label>
          <select 
            v-model="selectedCategory"
            :class="{ 'error': errors.category }"
          >
            <option value="">请选择板块</option>
            <option 
              v-for="category in categories" 
              :key="category.category_id" 
              :value="category.category_id"
            >
              {{ category.categories_name }}
            </option>
          </select>
          <span class="error-message" v-if="errors.category">{{ errors.category }}</span>
        </div>

        <div class="form-item">
          <label>标题</label>
          <input 
            type="text" 
            v-model="title"
            :class="{ 'error': errors.title }"
            placeholder="请输入标题"
          >
          <span class="error-message" v-if="errors.title">{{ errors.title }}</span>
        </div>
        
        <div class="form-item">
          <label>内容</label>
          <textarea 
            v-model="content"
            :class="{ 'error': errors.content }"
            placeholder="请输入内容"
            rows="10"
          ></textarea>
          <span class="error-message" v-if="errors.content">{{ errors.content }}</span>
        </div>

        <div class="form-item">
          <label>图片</label>
          <div class="image-upload">
            <input 
              type="file" 
              ref="fileInput"
              @change="handleImageSelect"
              accept="image/*"
              style="display: none"
            >
            <div 
              class="upload-area" 
              @click="triggerFileInput"
              v-if="!selectedImage && !currentImage"
            >
              <span>点击上传图片</span>
            </div>
            <div class="image-preview" v-else>
              <img :src="imagePreview || getImageUrl(currentImage)" alt="预览图片">
              <button type="button" class="remove-image" @click="removeImage">
                ✕
              </button>
            </div>
          </div>
          <span class="error-message" v-if="errors.image">{{ errors.image }}</span>
        </div>

        <div class="form-buttons">
          <button type="button" class="cancel-btn" @click="$router.push('/profile')">取消</button>
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const categories = ref([])
const selectedCategory = ref('')
const title = ref('')
const content = ref('')
const errors = ref({})
const isSubmitting = ref(false)
const fileInput = ref(null)
const selectedImage = ref(null)
const imagePreview = ref('')
const currentImage = ref('')

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理图片选择
const handleImageSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB限制
      errors.value.image = '图片大小不能超过5MB'
      return
    }
    selectedImage.value = file
    imagePreview.value = URL.createObjectURL(file)
    currentImage.value = ''
  }
}

// 移除图片
const removeImage = () => {
  selectedImage.value = null
  imagePreview.value = ''
  currentImage.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 获取图片URL
const getImageUrl = (path) => {
  if (!path) return ''
  return path.startsWith('http') ? path : `http://localhost:8080${path}`
}

// 获取板块列表
const fetchCategories = async () => {
  try {
    const response = await axios.get('/categories/selectAllCategory')
    categories.value = response.data
  } catch (error) {
    console.error('获取板块列表失败：', error)
  }
}

// 获取帖子详情
const fetchPostDetail = async () => {
  try {
    const postId = route.params.id
    const response = await axios.get(`/posts/getPostDetail/${postId}`)
    const post = response.data.post
    
    // 填充表单
    selectedCategory.value = post.categoryId
    title.value = post.title
    content.value = post.content
    currentImage.value = post.imagePath
  } catch (error) {
    console.error('获取帖子详情失败：', error)
    window.alert('获取帖子详情失败')
    router.push('/profile')
  }
}

// 表单验证
const validateForm = () => {
  errors.value = {}
  
  if (!selectedCategory.value) {
    errors.value.category = '请选择板块'
  }
  
  if (!title.value.trim()) {
    errors.value.title = '请输入标题'
  }
  
  if (!content.value.trim()) {
    errors.value.content = '请输入内容'
  }
  
  return Object.keys(errors.value).length === 0
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true

    // 如果选择了新图片，先上传图片
    let imagePath = currentImage.value
    if (selectedImage.value) {
      const formData = new FormData()
      formData.append('image', selectedImage.value)
      
      try {
        const imageResponse = await axios.post('/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        if (imageResponse.data.status === 200) {
          imagePath = imageResponse.data.data
        } else {
          throw new Error(imageResponse.data.message || '图片上传失败')
        }
      } catch (error) {
        console.error('图片上传错误：', error)
        window.alert('图片上传失败，请重试')
        return
      }
    }

    // 更新帖子
    const response = await axios.post('/posts/updatePost', {
      postId: route.params.id,
      categoryId: selectedCategory.value,
      title: title.value.trim(),
      content: content.value.trim(),
      imagePath: imagePath || ''
    })

    if (response.data.status === 200) {
      window.alert('修改成功！')
      router.push('/profile')
    } else {
      window.alert(response.data.message || '修改失败，请重试')
    }
  } catch (error) {
    console.error('修改失败：', error)
    window.alert('修改失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    window.alert('请先登录！')
    router.push('/login')
    return
  }
  
  await Promise.all([
    fetchCategories(),
    fetchPostDetail()
  ])
})
</script>

<style scoped>
.edit-container {
  min-height: 100vh;
  padding: 100px 20px 20px;
  background-color: var(--bg-color);
}

.edit-box {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-color);
  font-size: 24px;
  font-weight: 600;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 16px;
  color: var(--text-color);
  font-weight: 500;
}

input, select, textarea {
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
  background-color: #fff;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--theme-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

textarea {
  resize: vertical;
  min-height: 200px;
  line-height: 1.6;
}

.error {
  border-color: #ff4d4f;
}

.error-message {
  font-size: 12px;
  color: #ff4d4f;
}

.image-upload {
  margin-top: 8px;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafafa;
}

.upload-area:hover {
  border-color: var(--theme-color);
  background-color: #f0f7ff;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 12px;
  display: block;
}

.image-preview {
  position: relative;
  display: inline-block;
  margin-top: 12px;
}

.image-preview img {
  max-width: 300px;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.remove-image {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

.remove-image:hover {
  background: #ff7875;
  transform: scale(1.1);
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.cancel-btn, .submit-btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.cancel-btn {
  background: #fff;
  border: 1px solid var(--border-color);
  color: #666;
}

.cancel-btn:hover {
  border-color: #666;
  color: #333;
}

.submit-btn {
  background: var(--theme-color);
  border: none;
  color: #fff;
}

.submit-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

select:focus {
  border-color: var(--theme-color);
}

/* 添加响应式样式 */
@media (max-width: 768px) {
  .edit-box {
    padding: 20px;
  }

  .form-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .cancel-btn, .submit-btn {
    width: 100%;
  }

  .image-preview img {
    max-width: 100%;
  }
}
</style> 