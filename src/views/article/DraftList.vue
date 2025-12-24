<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { draftAPI } from '@/api'
import type { ArticleDraft } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()

const drafts = ref<ArticleDraft[]>([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

onMounted(() => {
  loadDrafts()
})

const loadDrafts = async () => {
  loading.value = true
  try {
    const res = await draftAPI.getList({
      page: currentPage.value,
      page_size: pageSize.value
    })
    drafts.value = res.drafts
    total.value = res.total
  } catch (error) {
    ElMessage.error('加载草稿失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = (id: number) => {
  router.push({ name: 'article-edit', params: { id }, query: { type: 'draft' } })
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇草稿吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await draftAPI.delete(id)
    ElMessage.success('删除成功')
    await loadDrafts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadDrafts()
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}
</script>

<template>
  <div class="draft-list">
    <div class="header">
      <h1>我的草稿</h1>
      <el-button type="primary" @click="router.push('/article/create')">
        写文章
      </el-button>
    </div>

    <el-skeleton :loading="loading" :count="3" animated>
      <template #default>
        <div class="drafts">
          <div v-for="draft in drafts" :key="draft.id" class="draft-item">
            <div class="draft-content">
              <h2 class="title">{{ draft.title }}</h2>
              <p class="summary">{{ draft.summary }}</p>
              <div class="meta">
                <span class="date">{{ formatDate(draft.update_time) }}</span>
              </div>
            </div>
            <div class="actions">
              <el-button type="primary" @click="handleEdit(draft.id)">编辑</el-button>
              <el-button type="danger" @click="handleDelete(draft.id)">删除</el-button>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>

    <div v-if="!loading && drafts.length === 0" class="empty">
      <el-empty description="暂无草稿">
        <el-button type="primary" @click="router.push('/article/create')">
          创建第一篇文章
        </el-button>
      </el-empty>
    </div>

    <el-pagination
      v-if="total > 0"
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="handlePageChange"
      class="pagination"
    />
  </div>
</template>

<style scoped>
.draft-list {
  max-width: 900px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 28px;
}

.drafts {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.draft-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.draft-item:last-child {
  border-bottom: none;
}

.draft-content {
  flex: 1;
}

.title {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.summary {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta {
  font-size: 13px;
  color: #999;
}

.actions {
  display: flex;
  gap: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.empty {
  background: white;
  padding: 50px 0;
  border-radius: 8px;
}
</style>
