<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { articleAPI, draftAPI, categoryAPI, topicAPI } from '@/api'
import ImageUpload from '@/components/ImageUpload.vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Category, Topic } from '@/types'
import {
  Document,
  Clock,
  View,
  FolderOpened,
  Loading
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const isEditMode = ref(false)
const articleId = ref<number | null>(null)
const isDraft = ref(false)
const formRef = ref<FormInstance>()
const loading = ref(false)
const autoSaving = ref(false)
const showHistory = ref(false)
const historyList = ref<any[]>([])
const categories = ref<Category[]>([])
const hotTopics = ref<Topic[]>([])

let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
const AUTO_SAVE_INTERVAL = 30000 // 30秒自动保存

const form = ref({
  title: '',
  summary: '',
  content: '',
  cover_image: '',
  status: 1,
  category_id: undefined as number | undefined,
  tags: [] as string[]
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  summary: [
    { required: true, message: '请输入文章摘要', trigger: 'blur' },
    { max: 200, message: '摘要不能超过 200 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ]
}

onMounted(async () => {
  if (route.params.id) {
    isEditMode.value = true
    articleId.value = Number(route.params.id)
    isDraft.value = route.query.type === 'draft'
    await loadArticle()
    if (!isDraft.value) {
      await loadHistory()
    }
  }

  await loadCategories()
  await loadTopics()

  // 启动自动保存
  startAutoSave()
})

onBeforeUnmount(() => {
  stopAutoSave()
})

// 监听表单变化，重置自动保存计时器
watch(
  () => form.value,
  () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    startAutoSave()
  },
  { deep: true }
)

const startAutoSave = () => {
  stopAutoSave()
  autoSaveTimer = setTimeout(() => {
    if (form.value.title || form.value.content) {
      autoSaveDraft()
    }
  }, AUTO_SAVE_INTERVAL)
}

const stopAutoSave = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
    autoSaveTimer = null
  }
}

const autoSaveDraft = async () => {
  if (autoSaving.value || loading.value) return

  autoSaving.value = true
  try {
    if (isEditMode.value && articleId.value && isDraft.value) {
      await draftAPI.update(articleId.value, {
        title: form.value.title || '无标题',
        summary: form.value.summary,
        content: form.value.content,
        cover_image: form.value.cover_image
      })
    } else if (!isEditMode.value && form.value.title) {
      const draft = await draftAPI.save({
        title: form.value.title || '无标题',
        summary: form.value.summary,
        content: form.value.content,
        cover_image: form.value.cover_image
      })
      isEditMode.value = true
      articleId.value = draft.id
      isDraft.value = true
    }
  } catch (error) {
    // 静默失败
  } finally {
    autoSaving.value = false
  }
}

const loadCategories = async () => {
  try {
    categories.value = await categoryAPI.getTree()
  } catch (error) {
    // 静默失败
  }
}

const loadTopics = async () => {
  try {
    hotTopics.value = await topicAPI.getHot({ limit: 10 })
  } catch (error) {
    // 静默失败
  }
}

const loadArticle = async () => {
  if (!articleId.value) return

  try {
    if (isDraft.value) {
      const draft = await draftAPI.getDetail(articleId.value)
      form.value = {
        title: draft.title || '',
        summary: draft.summary || '',
        content: draft.content || '',
        cover_image: draft.cover_image || '',
        status: 1,
        category_id: draft.category_id,
        tags: draft.tags || []
      }
    } else {
      const res = await articleAPI.getDetail(articleId.value)
      form.value = {
        title: res.title,
        summary: res.summary,
        content: res.content || '',
        cover_image: res.cover_image || '',
        status: res.status,
        category_id: res.category_id,
        tags: res.tags || []
      }
    }
  } catch (error) {
    ElMessage.error(isDraft.value ? '加载草稿失败' : '加载文章失败')
    router.push(isDraft.value ? '/drafts' : '/')
  }
}

const loadHistory = async () => {
  if (!articleId.value || isDraft.value) return

  try {
    historyList.value = await articleAPI.getHistory(articleId.value)
  } catch (error) {
    ElMessage.error('加载历史记录失败')
  }
}

const handleViewHistory = () => {
  showHistory.value = true
}

const handleRestoreVersion = async (version: any) => {
  try {
    await ElMessageBox.confirm('确定要恢复到此版本吗？当前内容将被覆盖。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    form.value.content = version.content
    form.value.title = version.title
    form.value.summary = version.summary
    showHistory.value = false
    ElMessage.success('已恢复到选定版本')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('恢复失败')
    }
  }
}

const handleSubmit = async (status: number) => {
  if (!formRef.value) return

  if (status === 2) {
    await formRef.value.validate(async (valid) => {
      if (valid) {
        await publishArticle()
      }
    })
  } else {
    await saveDraft()
  }
}

const saveDraft = async () => {
  loading.value = true
  try {
    if (isEditMode.value && articleId.value) {
      await draftAPI.update(articleId.value, {
        title: form.value.title || '无标题',
        summary: form.value.summary,
        content: form.value.content,
        cover_image: form.value.cover_image
      })
      ElMessage.success('保存草稿成功')
    } else {
      const draft = await draftAPI.save({
        title: form.value.title || '无标题',
        summary: form.value.summary,
        content: form.value.content,
        cover_image: form.value.cover_image
      })
      isEditMode.value = true
      articleId.value = draft.id
      isDraft.value = true
      ElMessage.success('保存草稿成功')
    }
  } catch (error) {
    ElMessage.error('保存草稿失败')
  } finally {
    loading.value = false
  }
}

const publishArticle = async () => {
  loading.value = true
  try {
    form.value.status = 2

    if (isEditMode.value && articleId.value) {
      if (isDraft.value) {
        await draftAPI.publish(articleId.value)
      } else {
        await articleAPI.update(articleId.value, form.value)
      }
      ElMessage.success('发布成功')
    } else {
      await articleAPI.create(form.value)
      ElMessage.success('发布成功')
    }

    router.push('/')
  } catch (error) {
    ElMessage.error('发布失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="article-edit">
    <div class="editor-container">
      <div class="editor-header">
        <h1>{{ isEditMode ? '编辑文章' : '写文章' }}</h1>
        <div class="header-actions">
          <span v-if="autoSaving" class="auto-save-indicator">
            <el-icon class="is-loading"><Loading /></el-icon>
            自动保存中...
          </span>
          <el-button
            v-if="isEditMode && !isDraft && historyList.length > 0"
            text
            @click="handleViewHistory"
          >
            <el-icon><Clock /></el-icon>
            查看历史版本
          </el-button>
        </div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="输入文章标题..."
            maxlength="100"
            show-word-limit
            size="large"
          />
        </el-form-item>

        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="输入文章摘要..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="分类" prop="category_id">
          <el-select
            v-model="form.category_id"
            placeholder="选择文章分类"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入或选择标签"
            style="width: 100%"
          >
            <el-option
              v-for="topic in hotTopics"
              :key="topic.id"
              :label="topic.name"
              :value="topic.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="封面图" prop="cover_image">
          <ImageUpload v-model="form.cover_image" />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="20"
            placeholder="输入文章内容（支持Markdown）..."
            class="content-editor"
          />
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <div class="action-left">
              <el-button type="primary" size="large" :loading="loading" @click="handleSubmit(2)">
                <el-icon><Document /></el-icon>
                发布文章
              </el-button>
              <el-button size="large" :loading="loading" @click="handleSubmit(1)">
                <el-icon><FolderOpened /></el-icon>
                保存草稿
              </el-button>
            </div>
            <el-button size="large" @click="router.back()">
              取消
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 历史版本对话框 -->
    <el-dialog
      v-model="showHistory"
      title="历史版本"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="history-list">
        <div
          v-for="(version, index) in historyList"
          :key="version.id"
          class="history-item"
        >
          <div class="history-header">
            <div class="history-info">
              <span class="version-number">版本 {{ historyList.length - index }}</span>
              <span class="version-date">{{ formatDate(version.create_time) }}</span>
            </div>
            <el-button
              type="primary"
              size="small"
              @click="handleRestoreVersion(version)"
            >
              恢复此版本
            </el-button>
          </div>
          <div class="history-content">
            <div class="history-title">{{ version.title }}</div>
            <div class="history-summary">{{ version.summary }}</div>
          </div>
        </div>

        <el-empty
          v-if="historyList.length === 0"
          description="暂无历史版本"
        />
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.article-edit {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.editor-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.editor-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #1f2329;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.auto-save-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #909399;
}

.content-editor :deep(textarea) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.action-left {
  display: flex;
  gap: 12px;
}

.history-list {
  max-height: 500px;
  overflow-y: auto;
}

.history-item {
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  transition: all 0.3s;
}

.history-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.version-number {
  font-weight: 600;
  color: #409eff;
}

.version-date {
  font-size: 13px;
  color: #909399;
}

.history-content {
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.history-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
  margin-bottom: 8px;
}

.history-summary {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .article-edit {
    padding: 16px;
  }

  .editor-container {
    padding: 24px 16px;
  }

  .editor-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .form-actions {
    flex-direction: column;
    gap: 12px;
  }

  .action-left {
    width: 100%;
    flex-direction: column;
  }

  .action-left .el-button {
    width: 100%;
  }
}
</style>

