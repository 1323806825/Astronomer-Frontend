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
  Check
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
          <!-- 文章头部 -->
          <div class="article-header">
            <h1 class="article-title">{{ article.title }}</h1>

            <div class="article-meta">
              <div class="meta-item">
                <el-icon><View /></el-icon>
                <span>{{ article.view_count }} 阅读</span>
              </div>
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ formatDate(article.create_time) }}</span>
              </div>
            </div>

            <!-- 作者信息 -->
            <div class="author-section">
              <div class="author-info" @click="goToAuthor(article.author_id)">
                <el-avatar :src="article.author_avatar" :size="48">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div class="author-details">
                  <div class="author-name">{{ article.author_name }}</div>
                  <div class="author-bio">{{ article.author_bio || '这个人很懒，什么都没写' }}</div>
                </div>
              </div>
              <el-button
                v-if="!isAuthor"
                :type="isFollowing ? 'default' : 'primary'"
                @click="handleFollow"
              >
                <el-icon v-if="isFollowing"><Check /></el-icon>
                <el-icon v-else><Plus /></el-icon>
                {{ isFollowing ? '已关注' : '关注' }}
              </el-button>
              <el-button v-else type="primary" @click="goToEdit">
                编辑文章
              </el-button>
            </div>
          </div>

          <!-- 文章内容 -->
          <div class="article-body">
            <img
              v-if="article.cover_image"
              :src="article.cover_image"
              alt="封面图"
              class="cover-image"
            />
            <div class="article-content" v-html="article.content"></div>
          </div>

          <!-- 文章标签 -->
          <div v-if="article.tags && article.tags.length > 0" class="article-tags">
            <el-tag
              v-for="tag in article.tags"
              :key="tag"
              type="info"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>

          <!-- 互动按钮 -->
          <div class="article-actions">
            <el-button
              :type="isLiked ? 'primary' : 'default'"
              size="large"
              @click="handleLike"
            >
              <el-icon><ArrowUp /></el-icon>
              点赞 {{ article.like_count }}
            </el-button>
            <el-button
              :type="isFavorited ? 'warning' : 'default'"
              size="large"
              @click="handleFavorite"
            >
              <el-icon v-if="isFavorited"><StarFilled /></el-icon>
              <el-icon v-else><Star /></el-icon>
              收藏 {{ article.favorite_count }}
            </el-button>
            <el-button size="large" @click="handleShare">
              <el-icon><Share /></el-icon>
              分享 {{ article.share_count }}
            </el-button>
          </div>

          <!-- 评论区 -->
          <CommentSection :target-type="1" :target-id="articleId" />
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style scoped>
.article-detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.article-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
}

.article-header {
  padding-bottom: 32px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 32px;
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.4;
  color: #1f2329;
  margin: 0 0 20px 0;
}

.article-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #8a8f8d;
}

.author-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
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
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
  transition: color 0.3s;
}

.author-bio {
  font-size: 13px;
  color: #8a8f8d;
}

.article-body {
  margin-bottom: 32px;
}

.cover-image {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 32px;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #1f2329;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5),
.article-content :deep(h6) {
  margin: 24px 0 16px;
  font-weight: 600;
}

.article-content :deep(p) {
  margin: 16px 0;
}

.article-content :deep(img) {
  max-width: 100%;
  border-radius: 4px;
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

.article-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid #f0f0f0;
}

.article-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 32px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 32px;
}

.article-actions .el-button {
  flex: 1;
  max-width: 200px;
}

@media (max-width: 768px) {
  .article-detail-page {
    padding: 16px;
  }

  .article-container {
    padding: 24px 16px;
  }

  .article-title {
    font-size: 24px;
  }

  .author-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .article-actions {
    flex-direction: column;
  }

  .article-actions .el-button {
    max-width: 100%;
  }
}
</style>
