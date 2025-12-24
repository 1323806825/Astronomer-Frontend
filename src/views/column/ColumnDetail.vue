<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { columnAPI, articleAPI } from '@/api'
import { useUserStore } from '@/stores/user'
import type { ArticleColumn, Article } from '@/types'
import {
  User,
  Document,
  Star,
  StarFilled,
  Plus,
  Check,
  Edit,
  Delete,
  Reading
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const columnId = computed(() => Number(route.params.id))
const column = ref<ArticleColumn | null>(null)
const articles = ref<Article[]>([])
const loading = ref(false)
const articlesLoading = ref(false)
const isSubscribed = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const isLoggedIn = computed(() => userStore.isLoggedIn)
const isAuthor = computed(() => {
  return isLoggedIn.value && column.value && userStore.user?.id === column.value.author_id
})

onMounted(() => {
  loadColumn()
  loadArticles()
})

const loadColumn = async () => {
  loading.value = true
  try {
    const response = await columnAPI.getDetail(columnId.value)
    column.value = response.column
    isSubscribed.value = response.is_subscribed || false
  } catch (error) {
    ElMessage.error('专栏加载失败')
    router.push('/columns')
  } finally {
    loading.value = false
  }
}

const loadArticles = async () => {
  articlesLoading.value = true
  try {
    const response = await columnAPI.getArticles(columnId.value, {
      page: currentPage.value,
      page_size: pageSize.value
    })
    articles.value = response.articles
    total.value = response.total
  } catch (error) {
    ElMessage.error('文章列表加载失败')
  } finally {
    articlesLoading.value = false
  }
}

const handleSubscribe = async () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    if (isSubscribed.value) {
      await columnAPI.unsubscribe(columnId.value)
      column.value!.subscribe_count--
      ElMessage.success('已取消订阅')
    } else {
      await columnAPI.subscribe(columnId.value)
      column.value!.subscribe_count++
      ElMessage.success('订阅成功')
    }
    isSubscribed.value = !isSubscribed.value
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const goToArticle = (articleId: number) => {
  router.push({ name: 'article-detail', params: { id: articleId } })
}

const goToAuthor = (userId: number) => {
  router.push({ name: 'user-profile', params: { id: userId } })
}

const goToEdit = () => {
  // TODO: 实现专栏编辑页面
  ElMessage.info('专栏编辑功能开发中')
}

const handleAddArticle = () => {
  // TODO: 实现添加文章对话框
  ElMessage.info('添加文章功能开发中')
}

const handleRemoveArticle = async (articleId: number) => {
  try {
    await ElMessageBox.confirm('确定要从专栏中移除这篇文章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await columnAPI.removeArticle(columnId.value, articleId)
    ElMessage.success('已移除')
    loadArticles()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadArticles()
  // 滚动到顶部
  document.querySelector('.column-detail-page')?.scrollIntoView({ behavior: 'smooth' })
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="column-detail-page">
    <el-skeleton :loading="loading" :rows="10" animated>
      <template #default>
        <div v-if="column" class="column-container">
          <!-- 专栏头部 -->
          <div class="column-header">
            <div
              v-if="column.cover_image"
              class="column-cover"
              :style="{ backgroundImage: `url(${column.cover_image})` }"
            ></div>

            <div class="column-info">
              <h1 class="column-name">{{ column.name }}</h1>
              <p class="column-description">{{ column.description || '暂无简介' }}</p>

              <div class="column-meta">
                <div class="meta-item" @click="goToAuthor(column.author_id)">
                  <el-icon><User /></el-icon>
                  <span>{{ column.author_name }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Document /></el-icon>
                  <span>{{ column.article_count }} 篇文章</span>
                </div>
                <div class="meta-item">
                  <el-icon><Reading /></el-icon>
                  <span>{{ column.subscribe_count }} 人订阅</span>
                </div>
                <div v-if="column.is_finished" class="meta-item finished">
                  <el-tag type="success" size="small">已完结</el-tag>
                </div>
              </div>

              <div class="column-actions">
                <el-button
                  v-if="!isAuthor"
                  :type="isSubscribed ? 'default' : 'primary'"
                  size="large"
                  @click="handleSubscribe"
                >
                  <el-icon v-if="isSubscribed"><Check /></el-icon>
                  <el-icon v-else><Star /></el-icon>
                  {{ isSubscribed ? '已订阅' : '订阅专栏' }}
                </el-button>
                <template v-else>
                  <el-button type="primary" size="large" @click="goToEdit">
                    <el-icon><Edit /></el-icon>
                    编辑专栏
                  </el-button>
                  <el-button size="large" @click="handleAddArticle">
                    <el-icon><Plus /></el-icon>
                    添加文章
                  </el-button>
                </template>
              </div>
            </div>
          </div>

          <!-- 文章列表 -->
          <div class="articles-section">
            <div class="section-header">
              <h2>
                <el-icon><Document /></el-icon>
                专栏文章
              </h2>
            </div>

            <el-skeleton :loading="articlesLoading" :rows="5" animated>
              <template #default>
                <div class="article-list">
                  <div
                    v-for="(article, index) in articles"
                    :key="article.id"
                    class="article-item"
                    @click="goToArticle(article.id)"
                  >
                    <div class="article-index">{{ index + 1 }}</div>
                    <div class="article-content">
                      <h3 class="article-title">{{ article.title }}</h3>
                      <div class="article-summary">{{ article.summary }}</div>
                      <div class="article-meta">
                        <span>{{ formatDate(article.create_time) }}</span>
                        <span>{{ article.view_count }} 阅读</span>
                        <span>{{ article.like_count }} 点赞</span>
                      </div>
                    </div>
                    <img
                      v-if="article.cover_image"
                      :src="article.cover_image"
                      alt="封面"
                      class="article-cover"
                    />
                    <el-button
                      v-if="isAuthor"
                      text
                      type="danger"
                      class="remove-btn"
                      @click.stop="handleRemoveArticle(article.id)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>

                  <div v-if="articles.length === 0" class="empty">
                    <el-empty description="专栏暂无文章" />
                  </div>
                </div>
              </template>
            </el-skeleton>

            <!-- 分页 -->
            <el-pagination
              v-if="total > pageSize"
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="total"
              layout="prev, pager, next"
              @current-change="handlePageChange"
              class="pagination"
            />
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style scoped>
.column-detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.column-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.column-header {
  position: relative;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.column-cover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.3;
}

.column-info {
  position: relative;
  z-index: 1;
}

.column-name {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: white;
}

.column-description {
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 24px 0;
  opacity: 0.95;
}

.column-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.meta-item:hover {
  opacity: 0.8;
}

.meta-item.finished {
  cursor: default;
}

.column-actions {
  display: flex;
  gap: 12px;
}

.articles-section {
  padding: 32px 40px;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-item {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.article-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.article-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f0f0f0;
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
}

.article-content {
  flex: 1;
  min-width: 0;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1f2329;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-summary {
  font-size: 14px;
  line-height: 1.6;
  color: #8a8f8d;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #909399;
}

.article-cover {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.remove-btn {
  position: absolute;
  top: 16px;
  right: 16px;
}

.empty {
  padding: 40px 0;
  text-align: center;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 768px) {
  .column-detail-page {
    padding: 16px;
  }

  .column-header {
    padding: 24px 16px;
  }

  .column-name {
    font-size: 28px;
  }

  .column-meta {
    gap: 12px;
  }

  .column-actions {
    flex-direction: column;
  }

  .column-actions .el-button {
    width: 100%;
  }

  .articles-section {
    padding: 24px 16px;
  }

  .article-item {
    flex-direction: column;
  }

  .article-cover {
    width: 100%;
    height: 150px;
  }
}
</style>
