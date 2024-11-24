<template>
  <div class="write-container">
    <div class="write-box">
      <h2>发布帖子</h2>
      <form @submit.prevent="handleSubmit" class="write-form">
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
          <label>添加图片</label>
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
              v-if="!selectedImage"
            >
              <span>点击上传图片</span>
            </div>
            <div class="image-preview" v-else>
              <img :src="imagePreview" alt="预览图片">
              <button type="button" class="remove-image" @click="removeImage">
                ✕
              </button>
            </div>
          </div>
          <span class="error-message" v-if="errors.image">{{ errors.image }}</span>
        </div>

        <div class="form-buttons">
          <button type="button" class="cancel-btn" @click="$router.push('/')">取消</button>
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? '发布中...' : '发布' }}
          </button>
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
const categories = ref([])
const selectedCategory = ref('')
const title = ref('')
const content = ref('')
const errors = ref({})
const isSubmitting = ref(false)
const fileInput = ref(null)
const selectedImage = ref(null)
const imagePreview = ref('')

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
  }
}

// 移除已选择的图片
const removeImage = () => {
  selectedImage.value = null
  imagePreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
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

const handleSubmit = async () => {
  if (!validateForm()) return
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true

    // 如果有选择图片，先上传图片
    let imagePath = null
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
          console.log('图片上传成功，路径：', imagePath)
        } else {
          console.error('图片上传失败：', imageResponse.data)
          throw new Error(imageResponse.data.message || '图片上传失败')
        }
      } catch (error) {
        console.error('图片上传错误：', error)
        window.alert('图片上传失败，请重试')
        return
      }
    }

    // 发布帖子，只发送必要的字段
    const postData = {
      categoryId: parseInt(selectedCategory.value),
      userId: parseInt(userStore.userInfo.userId),
      title: title.value.trim(),
      content: content.value.trim(),
      imagePath: imagePath || '' // 如果没有图片则发送空字符串
    }

    console.log('发送的帖子数据：', postData)

    const response = await axios.post('/posts/addPost', postData)

    if (response.data.status === 200) {
      window.alert('发布成功！')
      router.push('/')
    } else {
      window.alert(response.data.message || '发布失败，请重试')
    }
  } catch (error) {
    console.error('发布失败：', error)
    if (error.response) {
      console.error('错误响应：', error.response.data)
    }
    window.alert('发布失败，请重试')
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
  
  await fetchCategories()
})
</script>

<style scoped>
.write-container {
  min-height: 100vh;
  padding: 100px 20px 20px;
  background-color: var(--bg-color);
}

.write-box {
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
}

.write-form {
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

input, select, textarea {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
}

textarea {
  resize: vertical;
  min-height: 200px;
}

.error {
  border-color: #ff4d4f;
}

.error-message {
  font-size: 12px;
  color: #ff4d4f;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn, .submit-btn {
  padding: 8px 24px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #fff;
  border: 1px solid var(--border-color);
  color: #666;
}

.cancel-btn:hover {
  border-color: #666;
}

.submit-btn {
  background: var(--theme-color);
  border: none;
  color: #fff;
}

.submit-btn:hover {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

select {
  cursor: pointer;
  background-color: #fff;
}

select:focus {
  outline: none;
  border-color: var(--theme-color);
}

.image-upload {
  margin-top: 8px;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: var(--theme-color);
  color: var(--theme-color);
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 8px;
  display: block;
}

.image-preview {
  position: relative;
  display: inline-block;
  margin-top: 8px;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.remove-image:hover {
  background: #ff7875;
}
</style> 