<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/article'
import { ElMessage } from 'element-plus'
import { Star, Collection, Loading, User, StarFilled } from '@element-plus/icons-vue'
import { categoryAPI, articleAPI } from '@/api'
import type { Category } from '@/types'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores/user'
import ArticleDetailModal from '@/components/article/ArticleDetailModal.vue'

const router = useRouter()
const articleStore = useArticleStore()
const userStore = useUserStore()

const currentPage = ref(1)
const pageSize = ref(12)
const isInitialLoading = ref(true)

// 热门分类
const hotCategories = ref<Category[]>([])
const selectedCategoryId = ref<number | undefined>(undefined) // undefined 表示"推荐"

const isLoggedIn = computed(() => userStore.isLoggedIn)

// 文章详情模态框
const showArticleModal = ref(false)
const selectedArticleId = ref<number | null>(null)

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

    const params: any = {
      page: currentPage.value,
      page_size: pageSize.value,
      sort_by: 'time'
    }

    // 如果选择了分类，添加过滤条件
    if (selectedCategoryId.value) {
      params.category_id = selectedCategoryId.value
    }

    await articleStore.fetchArticles(params)
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

    const params: any = {
      page: currentPage.value,
      page_size: pageSize.value,
      sort_by: 'time'
    }

    // 如果选择了分类，添加过滤条件
    if (selectedCategoryId.value) {
      params.category_id = selectedCategoryId.value
    }

    await articleStore.appendArticles(params)
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
    hotCategories.value = categories.slice(0, 10) // 最多显示10个
  } catch (error) {
    // 静默失败，不影响文章展示
  }
}

const handleCategoryChange = (categoryId: number | undefined) => {
  selectedCategoryId.value = categoryId
  loadArticles()
}

const goToDetail = (id: number) => {
  selectedArticleId.value = id
  showArticleModal.value = true
}

const closeArticleModal = () => {
  showArticleModal.value = false
  selectedArticleId.value = null
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const handleLike = async (article: any, event: Event) => {
  event.stopPropagation() // 防止触发卡片点击
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    if (article.is_liked) {
      await articleAPI.unlike(article.id)
      article.like_count--
      article.is_liked = false
    } else {
      await articleAPI.like(article.id)
      article.like_count++
      article.is_liked = true
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleFavorite = async (article: any, event: Event) => {
  event.stopPropagation() // 防止触发卡片点击
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    if (article.is_favorited) {
      await articleAPI.unfavorite(article.id)
      article.favorite_count--
      article.is_favorited = false
      ElMessage.success('已取消收藏')
    } else {
      await articleAPI.favorite(article.id)
      article.favorite_count++
      article.is_favorited = true
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}
</script>

<template>
  <div class="home">
    <div class="content">
      <div class="article-list">
        <!-- 频道导航  -->
        <div class="channel-nav">
          <div class="channel-list">
            <!-- 推荐频道（默认） -->
            <div
              class="channel-item"
              :class="{ active: selectedCategoryId === undefined }"
              @click="handleCategoryChange(undefined)"
            >
              推荐
            </div>
            <!-- 分类频道 -->
            <div
              v-for="category in hotCategories"
              :key="category.id"
              class="channel-item"
              :class="{ active: selectedCategoryId === category.id }"
              @click="handleCategoryChange(category.id)"
            >
              {{ category.name }}
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
                    <div class="actions">
                      <span
                        class="action-btn like-btn"
                        :class="{ active: article.is_liked }"
                        @click="handleLike(article, $event)"
                      >
                        <el-icon v-if="article.is_liked"><StarFilled /></el-icon>
                        <el-icon v-else><Star /></el-icon>
                        {{ article.like_count }}
                      </span>
                      <span
                        class="action-btn favorite-btn"
                        :class="{ active: article.is_favorited }"
                        @click="handleFavorite(article, $event)"
                      >
                        <el-icon><Collection /></el-icon>
                      </span>
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

    <!-- 文章详情模态框 -->
    <ArticleDetailModal
      v-model:visible="showArticleModal"
      :article-id="selectedArticleId"
      @close="closeArticleModal"
    />
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

/* 频道导航 - 仿小红书风格 */
.channel-nav {
  background: white;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  position: sticky;
  top: 90px;
  z-index: 100;
}

.channel-list {
  display: flex;
  gap: 0;
  padding: 16px 24px;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.channel-list::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.channel-item {
  flex-shrink: 0;
  padding: 8px 20px;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 20px;
  white-space: nowrap;
  user-select: none;
}

.channel-item:hover {
  background: #f5f7fa;
  color: #409eff;
}

.channel-item.active {
  background: #409eff;
  color: white;
}

.channel-item.active:hover {
  background: #66b1ff;
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

.actions {
  display: flex;
  gap: 12px;
  font-size: 13px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 16px;
  transition: all 0.3s;
  user-select: none;
  color: #666;
}

.action-btn:hover {
  background: #f5f7fa;
}

.like-btn.active {
  color: #f56c6c;
}

.like-btn.active:hover {
  background: #fef0f0;
}

.favorite-btn.active {
  color: #f39c12;
}

.favorite-btn.active:hover {
  background: #fef5e7;
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
