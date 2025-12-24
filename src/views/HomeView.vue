<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/article'
import { ElMessage } from 'element-plus'
import { View, Star, ChatDotRound, Collection, ChatLineSquare, Notebook, Loading } from '@element-plus/icons-vue'
import { categoryAPI, topicAPI, columnAPI } from '@/api'
import type { Category, Topic, Column } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const articleStore = useArticleStore()

const currentPage = ref(1)
const pageSize = ref(12)
const isInitialLoading = ref(true)

// 热门分类、话题、专栏
const hotCategories = ref<Category[]>([])
const hotTopics = ref<Topic[]>([])
const hotColumns = ref<Column[]>([])

onMounted(() => {
  loadArticles()
  loadHotItems()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const loadArticles = async () => {
  isInitialLoading.value = true
  try {
    articleStore.resetArticles()
    currentPage.value = 1

    await articleStore.fetchArticles({
      page: currentPage.value,
      page_size: pageSize.value,
      sort_by: 'time'
    })
  } catch (error) {
    ElMessage.error('加载文章列表失败')
  } finally {
    isInitialLoading.value = false
  }
}

const loadMore = async () => {
  if (articleStore.loading || !articleStore.hasMore) return

  try {
    currentPage.value++
    await articleStore.appendArticles({
      page: currentPage.value,
      page_size: pageSize.value,
      sort_by: 'time'
    })
  } catch (error) {
    ElMessage.error('加载更多失败')
    currentPage.value--
  }
}

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  if (scrollTop + windowHeight >= documentHeight - 300) {
    loadMore()
  }
}

const loadHotItems = async () => {
  try {
    // 加载热门分类
    const categories = await categoryAPI.getTree()
    hotCategories.value = categories.slice(0, 6)

    // 加载热门话题
    const topics = await topicAPI.getHot({ limit: 6 })
    hotTopics.value = topics

    // 加载热门专栏
    const columns = await columnAPI.getList({ page: 1, page_size: 6 })
    hotColumns.value = columns
  } catch (error) {
    // 静默失败，不影响文章展示
  }
}

const goToDetail = (id: number) => {
  router.push({ name: 'article-detail', params: { id } })
}

const goToCategory = (id: number) => {
  router.push({ path: '/articles', query: { category_id: id } })
}

const goToTopic = (id: number) => {
  router.push({ path: '/articles', query: { topic_id: id } })
}

const goToColumn = (id: number) => {
  ElMessage.info('专栏详情页开发中')
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}
</script>

<template>
  <div class="home">
    <div class="content">
      <div class="article-list">
        <!-- 横向导航栏 -->
        <div class="top-navigation">
          <!-- 分类 -->
          <div class="nav-section">
            <div class="section-header">
              <el-icon><Collection /></el-icon>
              <span>热门分类</span>
              <router-link to="/categories" class="more-link">更多</router-link>
            </div>
            <div class="nav-items">
              <span
                v-for="category in hotCategories"
                :key="category.id"
                class="nav-item"
                @click="goToCategory(category.id)"
              >
                {{ category.name }}
              </span>
            </div>
          </div>

          <!-- 话题 -->
          <div class="nav-section">
            <div class="section-header">
              <el-icon><ChatLineSquare /></el-icon>
              <span>热门话题</span>
              <router-link to="/topics" class="more-link">更多</router-link>
            </div>
            <div class="nav-items">
              <span
                v-for="topic in hotTopics"
                :key="topic.id"
                class="nav-item"
                @click="goToTopic(topic.id)"
              >
                # {{ topic.name }}
              </span>
            </div>
          </div>

          <!-- 专栏 -->
          <div class="nav-section">
            <div class="section-header">
              <el-icon><Notebook /></el-icon>
              <span>精选专栏</span>
              <router-link to="/columns" class="more-link">更多</router-link>
            </div>
            <div class="nav-items">
              <span
                v-for="column in hotColumns"
                :key="column.id"
                class="nav-item"
                @click="goToColumn(column.id)"
              >
                {{ column.title }}
              </span>
            </div>
          </div>
        </div>

        <!-- 文章列表 -->
        <el-skeleton :loading="articleStore.loading" :count="3" animated>
          <template #default>
            <div class="articles-grid">
              <div
                v-for="article in articleStore.articles"
                :key="article.id"
                class="article-card"
                @click="goToDetail(article.id)"
              >
                <img
                  v-if="article.cover_image"
                  :src="article.cover_image"
                  :alt="article.title"
                  class="cover"
                />
                <div class="article-info">
                  <h3 class="title">{{ article.title }}</h3>
                  <p class="summary">{{ article.summary }}</p>
                  <div class="meta">
                    <span class="author">作者: {{ article.author_name || '未知' }}</span>
                    <span class="date">{{ formatDate(article.create_time) }}</span>
                  </div>
                  <div class="stats">
                    <span><el-icon><View /></el-icon> {{ article.view_count }}</span>
                    <span><el-icon><Star /></el-icon> {{ article.like_count }}</span>
                    <span><el-icon><ChatDotRound /></el-icon> {{ article.comment_count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-skeleton>

        <div v-if="!isInitialLoading && articleStore.articles.length === 0" class="empty">
          <el-empty description="暂无文章" />
        </div>

        <!-- 加载更多指示器 -->
        <div v-if="!isInitialLoading && articleStore.articles.length > 0" class="load-more-indicator">
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
  </div>
</template>

<style scoped>
.home {
  width: 100% !important;
  max-width: none !important;
}

.content {
  display: flex;
  gap: 30px;
  width: 100% !important;
  max-width: none !important;
}

.article-list {
  flex: 1;
  width: 100% !important;
  min-width: 0;
}

/* 顶部导航栏 */
.top-navigation {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.nav-section {
  flex: 1;
  min-width: 250px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-header .el-icon {
  color: #409eff;
}

.more-link {
  margin-left: auto;
  font-size: 13px;
  color: #909399;
  text-decoration: none;
  font-weight: normal;
}

.more-link:hover {
  color: #409eff;
}

.nav-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.nav-item {
  padding: 6px 16px;
  background: #f5f7fa;
  border-radius: 16px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.nav-item:hover {
  background: #409eff;
  color: white;
  transform: translateY(-2px);
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

/* 响应式设计 */
@media (min-width: 1920px) {
  .articles-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 1400px) and (max-width: 1919px) {
  .articles-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 900px) and (max-width: 1399px) {
  .articles-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 600px) and (max-width: 899px) {
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 599px) {
  .articles-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .top-navigation {
    flex-direction: column;
    gap: 20px;
  }

  .nav-section {
    min-width: 100%;
  }
}

.article-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.article-info {
  padding: 15px;
}

.title {
  font-size: 18px;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.stats {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #666;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 5px;
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
  padding: 50px 0;
}
</style>
