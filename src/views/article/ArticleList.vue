<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/article'
import { ElMessage } from 'element-plus'
import { Document, Star, Loading, User } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()
const articleStore = useArticleStore()

const currentPage = ref(1)
const pageSize = ref(15)
const sortBy = ref('latest')
const isInitialLoading = ref(true)

onMounted(() => {
  loadArticles()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const loadArticles = async () => {
  isInitialLoading.value = true
  try {
    // 重置列表
    articleStore.resetArticles()
    currentPage.value = 1

    await articleStore.fetchArticles({
      page: currentPage.value,
      page_size: pageSize.value,
      sort_by: sortBy.value === 'latest' ? 'time' : 'hot'
    })
  } catch (error) {
    ElMessage.error('加载文章列表失败')
  } finally {
    isInitialLoading.value = false
  }
}

const loadMore = async () => {
  // 如果正在加载或没有更多数据，则返回
  if (articleStore.loading || !articleStore.hasMore) return

  try {
    currentPage.value++
    await articleStore.appendArticles({
      page: currentPage.value,
      page_size: pageSize.value,
      sort_by: sortBy.value === 'latest' ? 'time' : 'hot'
    })
  } catch (error) {
    ElMessage.error('加载更多失败')
    currentPage.value--
  }
}

const handleScroll = () => {
  // 获取页面滚动位置
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // 当距离底部 300px 时触发加载
  if (scrollTop + windowHeight >= documentHeight - 300) {
    loadMore()
  }
}

const handleSortChange = (sort: string) => {
  sortBy.value = sort
  loadArticles()
}

const goToDetail = (id: number) => {
  router.push({ name: 'article-detail', params: { id } })
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}
</script>

<template>
  <div class="article-list-page">
    <div class="header">
      <h1>文章列表</h1>
      <el-radio-group v-model="sortBy" @change="handleSortChange">
        <el-radio-button label="latest">最新</el-radio-button>
        <el-radio-button label="hot">最热</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 初次加载的骨架屏 -->
    <el-skeleton v-if="isInitialLoading" :count="8" animated>
      <template #template>
        <div class="article-grid">
          <div v-for="i in 8" :key="i" class="article-card">
            <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
            <div style="padding: 16px">
              <el-skeleton-item variant="h3" style="width: 80%" />
              <el-skeleton-item variant="text" style="margin-top: 8px" />
              <el-skeleton-item variant="text" style="margin-top: 8px; width: 60%" />
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>

    <!-- 文章列表 -->
    <div v-else>
      <div class="article-grid">
        <div
          v-for="article in articleStore.articles"
          :key="article.id"
          class="article-card"
          @click="goToDetail(article.id)"
        >
          <div class="card-cover">
            <img
              v-if="article.cover_image"
              :src="article.cover_image"
              :alt="article.title"
            />
            <div v-else class="cover-placeholder">
              <el-icon :size="48"><Document /></el-icon>
            </div>
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ article.title }}</h3>
            <div class="card-footer">
              <div class="author-info">
                <el-avatar :src="article.author_avatar" :size="32">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="author-name">{{ article.author_name }}</span>
              </div>
              <div class="card-stats">
                <span class="stat-item">
                  <el-icon><Star /></el-icon>
                  {{ article.like_count }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="articleStore.articles.length === 0" class="empty">
        <el-empty description="暂无文章" />
      </div>

      <!-- 加载更多指示器 -->
      <div v-if="articleStore.articles.length > 0" class="load-more-indicator">
        <div v-if="articleStore.loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div v-else-if="!articleStore.hasMore" class="no-more">
          <span>没有更多了</span>
        </div>
        <div v-else class="has-more">
          <span>继续滚动加载更多</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-list-page {
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 28px;
  color: #333;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.article-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.article-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  color: #c0c4cc;
}

.card-content {
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  min-height: 48px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
}

.author-name {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.card-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.load-more-indicator {
  text-align: center;
  padding: 40px 20px;
  font-size: 14px;
  color: #999;
}

.load-more-indicator .loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #409eff;
}

.load-more-indicator .loading .el-icon {
  font-size: 20px;
}

.load-more-indicator .no-more {
  color: #999;
}

.load-more-indicator .has-more {
  color: #999;
}

.empty {
  background: white;
  padding: 80px 0;
  border-radius: 8px;
}

/* 响应式设计 */
@media (min-width: 1920px) {
  .article-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 1400px) and (max-width: 1919px) {
  .article-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 900px) and (max-width: 1399px) {
  .article-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 600px) and (max-width: 899px) {
  .article-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 599px) {
  .article-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
