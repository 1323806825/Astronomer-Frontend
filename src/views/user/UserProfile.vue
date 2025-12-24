<script setup lang="ts">
import { ref, computed, onMounted, watch, onActivated, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { userAPI, articleAPI } from '@/api'
import type { User, Article, ArticleColumn } from '@/types'
import ArticleDetailModal from '@/components/article/ArticleDetailModal.vue'
import {
  Edit,
  Document,
  View,
  Star,
  ChatDotRound,
  Notebook,
  User as UserIcon,
  Loading
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const userId = computed(() => route.params.id as string)
const isOwnProfile = computed(() => userStore.user?.id === userId.value)

const userProfile = ref<User | null>(null)
const loading = ref(false)
const activeTab = ref('articles')

const userArticles = ref<Article[]>([])
const userColumns = ref<ArticleColumn[]>([])
const favoriteArticles = ref<Article[]>([])
const likedArticles = ref<Article[]>([])

const articlesLoading = ref(false)
const columnsLoading = ref(false)
const favoritesLoading = ref(false)
const likedLoading = ref(false)

// 无限滚动相关状态
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const totalArticles = ref(0)
const isInitialLoading = ref(true)

// 文章详情模态窗口
const showArticleModal = ref(false)
const selectedArticleId = ref<number | null>(null)

onMounted(() => {
  loadUserProfile()
  window.addEventListener('scroll', handleScroll)
})

// 当组件被激活时（从缓存中恢复）也刷新数据
onActivated(() => {
  loadUserProfile()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(() => route.params.id, () => {
  if (route.params.id) {
    loadUserProfile()
  }
})

const loadUserProfile = async () => {
  loading.value = true
  try {
    userProfile.value = await userAPI.getProfile(userId.value)
    loadTabData()
  } catch (error) {
    ElMessage.error('加载用户信息失败')
  } finally {
    loading.value = false
  }
}

const loadTabData = () => {
  switch (activeTab.value) {
    case 'articles':
      loadUserArticles()
      break
    case 'columns':
      loadUserColumns()
      break
    case 'favorites':
      loadFavorites()
      break
    case 'liked':
      loadLiked()
      break
  }
}

const loadUserArticles = async () => {
  isInitialLoading.value = true
  articlesLoading.value = true
  try {
    // 重置状态
    userArticles.value = []
    currentPage.value = 1
    hasMore.value = true

    const result = await articleAPI.getList({
      user_id: userId.value,
      page: currentPage.value,
      page_size: pageSize.value
    })
    userArticles.value = result.articles || []
    totalArticles.value = result.total || 0

    // 判断是否还有更多数据
    hasMore.value = (currentPage.value * pageSize.value) < totalArticles.value
  } catch (error) {
    ElMessage.error('加载文章列表失败')
  } finally {
    articlesLoading.value = false
    isInitialLoading.value = false
  }
}

const loadMoreArticles = async () => {
  if (articlesLoading.value || !hasMore.value) return

  articlesLoading.value = true
  try {
    currentPage.value++
    const result = await articleAPI.getList({
      user_id: userId.value,
      page: currentPage.value,
      page_size: pageSize.value
    })

    // 追加新文章，去重
    const newArticles = (result.articles || []).filter(
      newArticle => !userArticles.value.some(existingArticle => existingArticle.id === newArticle.id)
    )
    userArticles.value = [...userArticles.value, ...newArticles]
    totalArticles.value = result.total || 0

    // 判断是否还有更多数据
    hasMore.value = (currentPage.value * pageSize.value) < totalArticles.value
  } catch (error) {
    ElMessage.error('加载更多失败')
    currentPage.value--
  } finally {
    articlesLoading.value = false
  }
}

const handleScroll = () => {
  // 只在文章标签页时触发滚动加载
  if (activeTab.value !== 'articles') return

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // 当距离底部 300px 时触发加载
  if (scrollTop + windowHeight >= documentHeight - 300) {
    loadMoreArticles()
  }
}

const loadUserColumns = async () => {
  columnsLoading.value = true
  try {
    userColumns.value = await userAPI.getColumns(userId.value)
  } catch (error) {
    ElMessage.error('加载专栏列表失败')
  } finally {
    columnsLoading.value = false
  }
}

const loadFavorites = async () => {
  favoritesLoading.value = true
  try {
    // TODO: 实现获取收藏列表的API
    // favoriteArticles.value = await articleAPI.getUserFavorites(userId.value)
    favoriteArticles.value = []
    ElMessage.info('收藏列表功能开发中')
  } catch (error) {
    ElMessage.error('加载收藏列表失败')
  } finally {
    favoritesLoading.value = false
  }
}

const loadLiked = async () => {
  likedLoading.value = true
  try {
    // TODO: 实现获取点赞列表的API
    // likedArticles.value = await articleAPI.getUserLiked(userId.value)
    likedArticles.value = []
    ElMessage.info('点赞列表功能开发中')
  } catch (error) {
    ElMessage.error('加载点赞列表失败')
  } finally {
    likedLoading.value = false
  }
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab
  loadTabData()
}

const handleFollow = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    if (userProfile.value?.is_followed) {
      await userAPI.unfollow(userId.value)
      ElMessage.success('已取消关注')
    } else {
      await userAPI.follow(userId.value)
      ElMessage.success('关注成功')
    }
    loadUserProfile()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const goToArticle = (id: number) => {
  selectedArticleId.value = id
  showArticleModal.value = true
}

const handleCloseModal = () => {
  showArticleModal.value = false
  selectedArticleId.value = null
}

const goToColumn = (id: number) => {
  router.push({ name: 'column-detail', params: { id } })
}

const editProfile = () => {
  router.push('/settings')
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const formatCount = (count: number) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count.toString()
}
</script>

<template>
  <div class="user-profile-page">
    <el-skeleton :loading="loading" animated>
      <template #default>
        <div v-if="userProfile" class="profile-content">
          <!-- 用户信息头部 -->
          <div class="profile-header">
            <div class="user-info">
              <img
                v-if="userProfile.avatar"
                :src="userProfile.avatar"
                :alt="userProfile.username"
                class="user-avatar"
              />
              <div v-else class="default-avatar">
                <el-icon :size="64"><UserIcon /></el-icon>
              </div>

              <div class="user-details">
                <div class="user-name-row">
                  <h1 class="user-name">{{ userProfile.username }}</h1>
                  <el-button
                    v-if="isOwnProfile"
                    type="primary"
                    :icon="Edit"
                    @click="editProfile"
                  >
                    编辑资料
                  </el-button>
                  <el-button
                    v-else
                    :type="userProfile.is_followed ? 'default' : 'primary'"
                    @click="handleFollow"
                  >
                    {{ userProfile.is_followed ? '已关注' : '关注' }}
                  </el-button>
                </div>

                <p class="user-bio">{{ userProfile.bio || '这个人很懒，什么都没留下' }}</p>

                <div class="user-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ formatCount(userProfile.following_count || 0) }}</span>
                    <span class="stat-label">关注</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ formatCount(userProfile.follower_count || 0) }}</span>
                    <span class="stat-label">粉丝</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ formatCount((userProfile.like_count || 0) + (userProfile.favorite_count || 0)) }}</span>
                    <span class="stat-label">获赞与收藏</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 标签页 -->
          <el-tabs v-model="activeTab" class="profile-tabs" @tab-change="handleTabChange">
            <!-- 文章列表 -->
            <el-tab-pane label="文章" name="articles">
              <el-skeleton :loading="isInitialLoading" :count="3" animated>
                <template #default>
                  <div class="articles-grid">
                    <div
                      v-for="article in userArticles"
                      :key="article.id"
                      class="article-card"
                      @click="goToArticle(article.id)"
                    >
                      <img
                        v-if="article.cover_image"
                        :src="article.cover_image"
                        :alt="article.title"
                        class="article-cover"
                      />
                      <div class="article-info">
                        <h3 class="article-title">{{ article.title }}</h3>
                        <p class="article-summary">{{ article.summary }}</p>
                        <div class="article-meta">
                          <span class="date">{{ formatDate(article.create_time) }}</span>
                          <div class="stats">
                            <span><el-icon><View /></el-icon> {{ article.view_count }}</span>
                            <span><el-icon><Star /></el-icon> {{ article.like_count }}</span>
                            <span><el-icon><ChatDotRound /></el-icon> {{ article.comment_count }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="userArticles.length === 0 && !isInitialLoading" class="empty-state">
                    <el-empty description="还没有发布文章" />
                  </div>

                  <!-- 加载更多指示器 -->
                  <div v-if="!isInitialLoading && userArticles.length > 0" class="load-more-indicator">
                    <div v-if="articlesLoading" class="loading">
                      <el-icon class="is-loading"><Loading /></el-icon>
                      <span>加载中...</span>
                    </div>
                    <div v-else-if="!hasMore" class="no-more">
                      <span>没有更多了</span>
                    </div>
                    <div v-else class="has-more">
                      <span>继续滚动加载更多</span>
                    </div>
                  </div>
                </template>
              </el-skeleton>
            </el-tab-pane>

            <!-- 专栏列表 -->
            <el-tab-pane label="专栏" name="columns">
              <el-skeleton :loading="columnsLoading" :count="3" animated>
                <template #default>
                  <div class="columns-grid">
                    <div
                      v-for="column in userColumns"
                      :key="column.id"
                      class="column-card"
                      @click="goToColumn(column.id)"
                    >
                      <div class="column-cover">
                        <img
                          v-if="column.cover_image"
                          :src="column.cover_image"
                          :alt="column.title"
                        />
                        <div v-else class="default-cover">
                          <el-icon :size="40"><Notebook /></el-icon>
                        </div>
                      </div>
                      <div class="column-info">
                        <h3 class="column-title">{{ column.title }}</h3>
                        <p class="column-desc">{{ column.description }}</p>
                        <div class="column-stats">
                          <span>{{ column.article_count }} 篇</span>
                          <span>{{ formatCount(column.subscribe_count) }} 订阅</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="userColumns.length === 0 && !columnsLoading" class="empty-state">
                    <el-empty description="还没有创建专栏" />
                  </div>
                </template>
              </el-skeleton>
            </el-tab-pane>

            <!-- 收藏列表 -->
            <el-tab-pane label="收藏" name="favorites">
              <el-skeleton :loading="favoritesLoading" :count="3" animated>
                <template #default>
                  <div class="articles-grid">
                    <div
                      v-for="article in favoriteArticles"
                      :key="article.id"
                      class="article-card"
                      @click="goToArticle(article.id)"
                    >
                      <img
                        v-if="article.cover_image"
                        :src="article.cover_image"
                        :alt="article.title"
                        class="article-cover"
                      />
                      <div class="article-info">
                        <h3 class="article-title">{{ article.title }}</h3>
                        <p class="article-summary">{{ article.summary }}</p>
                        <div class="article-meta">
                          <span class="date">{{ formatDate(article.create_time) }}</span>
                          <div class="stats">
                            <span><el-icon><View /></el-icon> {{ article.view_count }}</span>
                            <span><el-icon><Star /></el-icon> {{ article.like_count }}</span>
                            <span><el-icon><ChatDotRound /></el-icon> {{ article.comment_count }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="favoriteArticles.length === 0 && !favoritesLoading" class="empty-state">
                    <el-empty description="还没有收藏文章" />
                  </div>
                </template>
              </el-skeleton>
            </el-tab-pane>

            <!-- 点赞列表 -->
            <el-tab-pane label="点赞" name="liked">
              <el-skeleton :loading="likedLoading" :count="3" animated>
                <template #default>
                  <div class="articles-grid">
                    <div
                      v-for="article in likedArticles"
                      :key="article.id"
                      class="article-card"
                      @click="goToArticle(article.id)"
                    >
                      <img
                        v-if="article.cover_image"
                        :src="article.cover_image"
                        :alt="article.title"
                        class="article-cover"
                      />
                      <div class="article-info">
                        <h3 class="article-title">{{ article.title }}</h3>
                        <p class="article-summary">{{ article.summary }}</p>
                        <div class="article-meta">
                          <span class="date">{{ formatDate(article.create_time) }}</span>
                          <div class="stats">
                            <span><el-icon><View /></el-icon> {{ article.view_count }}</span>
                            <span><el-icon><Star /></el-icon> {{ article.like_count }}</span>
                            <span><el-icon><ChatDotRound /></el-icon> {{ article.comment_count }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="likedArticles.length === 0 && !likedLoading" class="empty-state">
                    <el-empty description="还没有点赞文章" />
                  </div>
                </template>
              </el-skeleton>
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
    </el-skeleton>

    <!-- 文章详情模态窗口 -->
    <ArticleDetailModal
      :visible="showArticleModal"
      :article-id="selectedArticleId"
      @close="handleCloseModal"
    />
  </div>
</template>

<style scoped>
.user-profile-page {
  width: 100%;
}

/* 用户信息头部 */
.profile-header {
  background: white;
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.user-info {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.default-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.user-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.user-name {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.user-bio {
  font-size: 15px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}

.user-stats {
  display: flex;
  gap: 48px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

/* 标签页 */
.profile-tabs {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 文章网格 */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.article-card {
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-cover {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.article-info {
  padding: 16px;
}

.article-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-summary {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.stats {
  display: flex;
  gap: 12px;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 专栏网格 */
.columns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.column-card {
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.column-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.column-cover {
  width: 100%;
  height: 140px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.column-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.column-info {
  padding: 16px;
}

.column-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.column-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.column-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

/* 用户网格 */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.user-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-card .avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
}

.default-avatar-small {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 12px;
}

.user-card .name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.user-card .bio {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.user-card .stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

/* 空状态 */
.empty-state {
  padding: 60px 0;
}

/* 加载更多指示器 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-header {
    padding: 24px;
  }

  .user-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-name-row {
    flex-direction: column;
    gap: 12px;
  }

  .user-stats {
    justify-content: center;
    gap: 32px;
  }

  .articles-grid,
  .columns-grid,
  .users-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>

