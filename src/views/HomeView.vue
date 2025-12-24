<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/article'
import { ElMessage } from 'element-plus'
import { Star, Collection, Loading, User } from '@element-plus/icons-vue'
import { categoryAPI } from '@/api'
import type { Category } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const articleStore = useArticleStore()

const currentPage = ref(1)
const pageSize = ref(12)
const isInitialLoading = ref(true)

// 热门分类
const hotCategories = ref<Category[]>([])

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
          <div class="nav-section full-width">
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
                  <div class="meta">
                    <div class="author-info">
                      <el-avatar :src="article.author_avatar" :size="32">
                        <el-icon><User /></el-icon>
                      </el-avatar>
                      <span class="author">{{ article.author_name || '未知' }}</span>
                    </div>
                    <div class="stats">
                      <span><el-icon><Star /></el-icon> {{ article.like_count }}</span>
                    </div>
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

.nav-section.full-width {
  flex: 1 1 100%;
  min-width: 100%;
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
  column-count: 5;
  column-gap: 20px;
  margin-bottom: 30px;
}

/* 响应式设计 - 瀑布流列数 */
@media (min-width: 1920px) {
  .articles-grid {
    column-count: 5;
  }
}

@media (min-width: 1400px) and (max-width: 1919px) {
  .articles-grid {
    column-count: 4;
  }
}

@media (min-width: 900px) and (max-width: 1399px) {
  .articles-grid {
    column-count: 3;
  }
}

@media (min-width: 600px) and (max-width: 899px) {
  .articles-grid {
    column-count: 2;
  }
}

@media (max-width: 599px) {
  .articles-grid {
    column-count: 1;
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
  break-inside: avoid;
  margin-bottom: 20px;
  display: inline-block;
  width: 100%;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.cover {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
  display: block;
}

.article-info {
  padding: 15px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  color: #333;
}

.meta {
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

.author {
  font-size: 13px;
  color: #666;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.stats span {
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
  padding: 50px 0;
}
</style>
