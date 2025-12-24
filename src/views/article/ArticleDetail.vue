<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { articleAPI, userAPI } from '@/api'
import { useUserStore } from '@/stores/user'
import type { ArticleDetail } from '@/types'
import CommentSection from '@/components/comment/CommentSection.vue'
import {
  View,
  Clock,
  Star,
  StarFilled,
  Share,
  ArrowUp,
  User,
  Plus,
  Check,
  Collection,
  Document
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const articleId = computed(() => Number(route.params.id))
const article = ref<ArticleDetail | null>(null)
const loading = ref(false)
const isLiked = ref(false)
const isFavorited = ref(false)
const isFollowing = ref(false)

const isLoggedIn = computed(() => userStore.isLoggedIn)
const isAuthor = computed(() => {
  return isLoggedIn.value && article.value && userStore.user?.id === article.value.author_id
})

onMounted(() => {
  loadArticle()
})

const loadArticle = async () => {
  loading.value = true
  try {
    article.value = await articleAPI.getDetail(articleId.value)
    isLiked.value = article.value.is_liked || false
    isFavorited.value = article.value.is_favorited || false
    isFollowing.value = article.value.is_following || false
  } catch (error) {
    ElMessage.error('文章加载失败')
    router.push('/')
  } finally {
    loading.value = false
  }
}

const handleLike = async () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    if (isLiked.value) {
      await articleAPI.unlike(articleId.value)
      article.value!.like_count--
    } else {
      await articleAPI.like(articleId.value)
      article.value!.like_count++
    }
    isLiked.value = !isLiked.value
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleFavorite = async () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    if (isFavorited.value) {
      await articleAPI.unfavorite(articleId.value)
      article.value!.favorite_count--
      ElMessage.success('已取消收藏')
    } else {
      await articleAPI.favorite(articleId.value)
      article.value!.favorite_count++
      ElMessage.success('收藏成功')
    }
    isFavorited.value = !isFavorited.value
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleShare = async () => {
  try {
    await articleAPI.share(articleId.value)
    article.value!.share_count++

    // 复制链接到剪贴板
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('分享失败')
  }
}

const handleFollow = async () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    if (isFollowing.value) {
      await userAPI.unfollow(article.value!.author_id)
      ElMessage.success('已取消关注')
    } else {
      await userAPI.follow(article.value!.author_id)
      ElMessage.success('关注成功')
    }
    isFollowing.value = !isFollowing.value
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const goToAuthor = (userId: string) => {
  router.push({ name: 'user-profile', params: { id: userId } })
}

const goToEdit = () => {
  router.push({ name: 'article-edit', params: { id: articleId.value } })
}

const handleTopicClick = (topic: string) => {
  // 在新标签页打开搜索结果
  const url = router.resolve({
    path: '/articles',
    query: { keyword: topic }
  })
  window.open(url.href, '_blank')
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
  <div class="article-detail-page">
    <el-skeleton :loading="loading" :rows="15" animated>
      <template #default>
        <div v-if="article" class="article-container">
          <!-- 左侧：图片区域 -->
          <div class="left-section">
            <div class="image-container">
              <img
                v-if="article.cover_image"
                :src="article.cover_image"
                :alt="article.title"
                class="main-image"
              />
              <div v-else class="no-image-placeholder">
                <el-icon :size="80"><Document /></el-icon>
                <p>暂无封面图</p>
              </div>
            </div>
          </div>

          <!-- 右侧：内容区域 -->
          <div class="right-section">
            <!-- 标题 -->
            <h1 class="article-title">{{ article.title }}</h1>

            <!-- 作者信息条 -->
            <div class="author-bar">
              <div class="author-info" @click="goToAuthor(article.author_id)">
                <el-avatar :src="article.author_avatar" :size="40">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div class="author-details">
                  <div class="author-name">{{ article.author_name }}</div>
                  <div class="publish-time">{{ formatDate(article.create_time) }}</div>
                </div>
              </div>
              <el-button
                v-if="!isAuthor"
                :type="isFollowing ? 'default' : 'primary'"
                size="small"
                round
                @click="handleFollow"
              >
                <el-icon v-if="isFollowing"><Check /></el-icon>
                <el-icon v-else><Plus /></el-icon>
                {{ isFollowing ? '已关注' : '关注' }}
              </el-button>
              <el-button v-else type="primary" size="small" round @click="goToEdit">
                编辑
              </el-button>
            </div>

            <!-- 文章内容 -->
            <div class="article-content" v-html="article.content"></div>

            <!-- 话题标签 -->
            <div v-if="article.tags && article.tags.length > 0" class="article-topics">
              <span
                v-for="(tag, index) in article.tags"
                :key="index"
                class="topic-tag"
                @click.stop="handleTopicClick(tag)"
              >
                #{{ tag }}
              </span>
            </div>

            <!-- 统计信息 -->
            <div class="article-stats">
              <span class="stat-item">
                <el-icon><View /></el-icon>
                {{ article.view_count }}
              </span>
              <span class="stat-item">
                <el-icon><Star /></el-icon>
                {{ article.like_count }}
              </span>
              <span class="stat-item">
                <el-icon><Collection /></el-icon>
                {{ article.favorite_count }}
              </span>
            </div>

            <!-- 互动按钮 -->
            <div class="action-bar">
              <el-button
                :class="{ 'is-liked': isLiked }"
                class="action-button like-button"
                @click="handleLike"
              >
                <el-icon><StarFilled v-if="isLiked" /><Star v-else /></el-icon>
                <span>{{ isLiked ? '已点赞' : '点赞' }}</span>
              </el-button>
              <el-button
                :class="{ 'is-favorited': isFavorited }"
                class="action-button favorite-button"
                @click="handleFavorite"
              >
                <el-icon><StarFilled v-if="isFavorited" /><Star v-else /></el-icon>
                <span>{{ isFavorited ? '已收藏' : '收藏' }}</span>
              </el-button>
              <el-button class="action-button share-button" @click="handleShare">
                <el-icon><Share /></el-icon>
                <span>分享</span>
              </el-button>
            </div>

            <!-- 评论区 -->
            <div class="comment-section-wrapper">
              <CommentSection :target-type="1" :target-id="articleId" />
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style scoped>
.article-detail-page {
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
  padding: 0;
}

.article-container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  min-height: 100vh;
}

/* 左侧图片区域 */
.left-section {
  flex: 0 0 60%;
  background: #000;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.no-image-placeholder {
  text-align: center;
  color: #666;
}

.no-image-placeholder p {
  margin-top: 16px;
  font-size: 14px;
}

/* 右侧内容区域 */
.right-section {
  flex: 1;
  overflow-y: auto;
  padding: 32px 40px;
  background: white;
}

/* 标题 */
.article-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  line-height: 1.4;
  margin: 0 0 20px 0;
}

/* 作者信息条 */
.author-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
}

.author-info:hover .author-name {
  color: #409eff;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  transition: color 0.3s;
}

.publish-time {
  font-size: 13px;
  color: #999;
}

/* 文章内容 */
.article-content {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 24px;
  word-break: break-word;
}

.article-content :deep(p) {
  margin: 12px 0;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3) {
  margin: 20px 0 12px;
  font-weight: 600;
}

.article-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 16px 0;
}

.article-content :deep(pre) {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 16px 0;
}

.article-content :deep(code) {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
}

.article-content :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding-left: 16px;
  margin: 16px 0;
  color: #606266;
}

/* 话题标签 */
.article-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.topic-tag {
  display: inline-block;
  padding: 5px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 13px;
  font-weight: 500;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.topic-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 统计信息 */
.article-stats {
  display: flex;
  gap: 24px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.stat-item .el-icon {
  font-size: 16px;
}

/* 互动按钮 */
.action-bar {
  display: flex;
  gap: 12px;
  padding-bottom: 32px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 32px;
}

.action-button {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s;
}

.action-button .el-icon {
  font-size: 18px;
}

.like-button.is-liked {
  background: #fff1f0;
  border-color: #ffccc7;
  color: #ff4d4f;
}

.like-button.is-liked:hover {
  background: #ffe7e6;
  border-color: #ffa39e;
}

.favorite-button.is-favorited {
  background: #fffbe6;
  border-color: #ffe58f;
  color: #faad14;
}

.favorite-button.is-favorited:hover {
  background: #fff7cc;
  border-color: #ffd666;
}

.share-button:hover {
  background: #f0f2f5;
  border-color: #d9d9d9;
}

/* 评论区 */
.comment-section-wrapper {
  margin-top: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .article-container {
    flex-direction: column;
  }

  .left-section {
    position: relative;
    flex: none;
    height: 60vh;
    min-height: 400px;
  }

  .right-section {
    padding: 24px 20px;
  }
}

@media (max-width: 768px) {
  .left-section {
    height: 50vh;
    min-height: 300px;
  }

  .article-title {
    font-size: 20px;
  }

  .right-section {
    padding: 20px 16px;
  }

  .action-bar {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }
}
</style>
