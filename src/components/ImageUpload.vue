<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Close, Loading, View } from '@element-plus/icons-vue'
import { uploadAPI } from '@/api'
import type { UploadProps } from 'element-plus'

interface Props {
  modelValue?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false
})

const emit = defineEmits<Emits>()

const imageUrl = ref(props.modelValue)
const fileName = ref('')
const uploading = ref(false)

// 监听 modelValue 的变化，更新 imageUrl
watch(() => props.modelValue, (newVal) => {
  imageUrl.value = newVal
  if (newVal) {
    // 从 URL 中提取文件名
    const urlParts = newVal.split('/')
    fileName.value = urlParts[urlParts.length - 1] || '已上传的图片'
  }
})

// 文件上传前的校验
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 自定义上传方法
const handleUpload: UploadProps['httpRequest'] = async (options) => {
  uploading.value = true
  try {
    const file = options.file as File
    fileName.value = file.name
    console.log('开始上传文件:', file.name)

    const res = await uploadAPI.uploadImage(file)
    console.log('上传响应:', res)
    console.log('图片URL:', res.file_url)

    imageUrl.value = res.file_url
    console.log('imageUrl已更新为:', imageUrl.value)

    emit('update:modelValue', res.file_url)
    ElMessage.success('上传成功!')
  } catch (error: any) {
    console.error('上传错误:', error)
    ElMessage.error(error.message || '上传失败')
  } finally {
    uploading.value = false
  }
}

// 删除图片
const handleRemove = () => {
  imageUrl.value = ''
  fileName.value = ''
  emit('update:modelValue', '')
}

// 预览图片
const handlePreview = () => {
  if (imageUrl.value) {
    window.open(imageUrl.value, '_blank')
  }
}
</script>

<template>
  <div class="image-upload">
    <el-upload
      :show-file-list="false"
      :before-upload="beforeUpload"
      :http-request="handleUpload"
      :disabled="disabled || uploading"
      accept="image/*"
      drag
    >
      <div v-if="imageUrl" class="image-preview">
        <img :src="imageUrl" alt="preview" />
        <div class="image-overlay">
          <el-icon class="action-icon" @click.stop="handlePreview">
            <View />
          </el-icon>
          <el-icon class="action-icon remove-icon" @click.stop="handleRemove">
            <Close />
          </el-icon>
        </div>
      </div>
      <div v-else class="upload-trigger">
        <el-icon v-if="!uploading" class="upload-icon"><Plus /></el-icon>
        <el-icon v-else class="is-loading"><Loading /></el-icon>
        <div class="upload-text">{{ uploading ? '上传中...' : '点击或拖拽图片到这里上传' }}</div>
        <div class="upload-hint">支持 jpg、png、gif 格式，大小不超过 2MB</div>
      </div>
    </el-upload>

    <!-- 文件名显示 -->
    <div v-if="imageUrl && fileName" class="file-info">
      <span class="file-name" @click="handlePreview" title="点击预览">{{ fileName }}</span>
    </div>
  </div>
</template>

<style scoped>
.image-upload {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

:deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  padding: 0;
  border: none;
  background-color: transparent;
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  padding: 20px;
}

.upload-icon {
  font-size: 48px;
  color: var(--el-text-color-secondary);
  margin-bottom: 16px;
}

.upload-text {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.action-icon {
  font-size: 24px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.action-icon:hover {
  transform: scale(1.2);
}

.remove-icon:hover {
  color: var(--el-color-danger);
}

.file-info {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-name {
  font-size: 14px;
  color: var(--el-color-primary);
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  transition: color 0.3s;
}

.file-name:hover {
  color: var(--el-color-primary-light-3);
  text-decoration: underline;
}
</style>
