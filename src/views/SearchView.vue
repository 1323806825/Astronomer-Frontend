<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Document, User, ChatLineSquare, Notebook } from '@element-plus/icons-vue'
import { searchAPI } from '@/api'
import type { Article, User as UserType, Topic, Column } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()

const searchQuery = ref((route.query.q as string) || '')
const activeTab = ref((route.query.type as string) || 'articles')
const loading = ref(false)

const articleResults = ref<Article[]>([])
const userResults = ref<UserType[]>([])
const topicResults = ref<Topic[]>([])
const columnResults = ref<Column[]>([])

const totalCount = ref(0)

watch(() => route.query, () => {
  if (route.query.q) {
    searchQuery.value = route.query.q as string
    activeTab.value = (route.query.type as string) || 'articles'
    performSearch()
  }
}, { immediate: true })

const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  router.push({
    path: '/search',
    query: { q: searchQuery.value, type: activeTab.value }
  })
}

const handleTabChange = (tab: string) => {
  router.push({
    path: '/search',
    query: { q: searchQuery.value, type: tab }
  })
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) return

  loading.value = true
  try {
    const params = { keyword: searchQuery.value, page: 1, page_size: 20 }

    switch (activeTab.value) {
      case 'articles':
        const articleData = await searchAPI.searchArticles(params)
        articleResults.value = articleData.items || []
        totalCount.value = articleData.total || 0
        break
      case 'users':
        const userData = await searchAPI.searchUsers(params)
        userResults.value = userData.items || []
        totalCount.value = userData.total || 0
        break
      case 'topics':
        const topicData = await searchAPI.searchTopics(params)
        topicResults.value = topicData.items || []
        totalCount.value = topicData.total || 0
        break
      case 'columns':
        const columnData = await searchAPI.searchColumns(params)
        columnResults.value = columnData.items || []
        totalCount.value = columnData.total || 0
        break
    }
  } catch (error) {
    ElMessage.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const goToArticle = (id: number) => {
  router.push({ name: 'article-detail', params: { id } })
}

const goToUser = (id: number) => {
  router.push({ name: 'user-profile', params: { id } })
}

const goToTopic = (id: number) => {
  router.push({ path: '/articles', query: { topic_id: id } })
}

const goToColumn = (id: number) => {
  // TODO: 添加专栏详情页后启用
  // router.push({ name: 'column-detail', params: { id } })
  ElMessage.info('专栏详情页开发中')
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

const highlightKeyword = (text: string) => {
  if (!searchQuery.value || !text) return text
  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}
</script>

<template>
  <div class="search-page">
    <div class="search-header">
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索文章、用户、话题、专栏..."
          size="large"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <div v-if="searchQuery" class="search-info">
        搜索 "<strong>{{ searchQuery }}</strong>" 的结果，共 {{ totalCount }} 条
      </div>
    </div>

    <div v-if="searchQuery" class="search-content">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="文章" name="articles">
          <el-skeleton :loading="loading" :count="3" animated>
            <template #default>
              <div class="results-list">
                <div
                  v-for="article in articleResults"
                  :key="article.id"
                  class="result-item article-item"
                  @click="goToArticle(article.id)"
                >
                  <div class="item-main">
                    <h3 class="item-title" v-html="highlightKeyword(article.title)"></h3>
                    <p class="item-summary" v-html="highlightKeyword(article.summary)"></p>
                    <div class="item-meta">
                      <span class="author">{{ article.author_name }}</span>
                      <span class="date">{{ formatDate(article.create_time) }}</span>
                      <span class="stats">
                        <el-icon><Document /></el-icon> {{ article.view_count }} 阅读
                      </span>
                    </div>
                  </div>
                  <img
                    v-if="article.cover_image"
                    :src="article.cover_image"
                    :alt="article.title"
                    class="item-cover"
                  />
                </div>

                <div v-if="articleResults.length === 0 && !loading" class="empty-result">
                  <el-empty description="未找到相关文章" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </el-tab-pane>

        <el-tab-pane label="用户" name="users">
          <el-skeleton :loading="loading" :count="3" animated>
            <template #default>
              <div class="results-grid">
                <div
                  v-for="user in userResults"
                  :key="user.id"
                  class="result-card user-card"
                  @click="goToUser(user.id)"
                >
                  <img
                    v-if="user.avatar"
                    :src="user.avatar"
                    :alt="user.username"
                    class="user-avatar"
                  />
                  <div v-else class="default-avatar">
                    <el-icon :size="32"><User /></el-icon>
                  </div>
                  <h3 class="user-name" v-html="highlightKeyword(user.username)"></h3>
                  <p class="user-bio">{{ user.bio || '这个人很懒，什么都没留下' }}</p>
                  <div class="user-stats">
                    <span>{{ user.article_count }} 文章</span>
                    <span>{{ formatCount(user.follower_count) }} 粉丝</span>
                  </div>
                </div>

                <div v-if="userResults.length === 0 && !loading" class="empty-result">
                  <el-empty description="未找到相关用户" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </el-tab-pane>

        <el-tab-pane label="话题" name="topics">
          <el-skeleton :loading="loading" :count="3" animated>
            <template #default>
              <div class="results-grid">
                <div
                  v-for="topic in topicResults"
                  :key="topic.id"
                  class="result-card topic-card"
                  @click="goToTopic(topic.id)"
                >
                  <div class="topic-icon">
                    <el-icon :size="32"><ChatLineSquare /></el-icon>
                  </div>
                  <h3 class="topic-name" v-html="'# ' + highlightKeyword(topic.name)"></h3>
                  <p class="topic-desc">{{ topic.description }}</p>
                  <div class="topic-stats">
                    <span>{{ formatCount(topic.article_count) }} 篇</span>
                    <span>{{ formatCount(topic.follow_count) }} 关注</span>
                  </div>
                </div>

                <div v-if="topicResults.length === 0 && !loading" class="empty-result">
                  <el-empty description="未找到相关话题" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </el-tab-pane>

        <el-tab-pane label="专栏" name="columns">
          <el-skeleton :loading="loading" :count="3" animated>
            <template #default>
              <div class="results-grid">
                <div
                  v-for="column in columnResults"
                  :key="column.id"
                  class="result-card column-card"
                  @click="goToColumn(column.id)"
                >
                  <div class="column-cover">
                    <img
                      v-if="column.cover_image"
                      :src="column.cover_image"
                      :alt="column.title"
                    />
                    <div v-else class="default-cover">
                      <el-icon :size="32"><Notebook /></el-icon>
                    </div>
                  </div>
                  <div class="column-info">
                    <h3 class="column-title" v-html="highlightKeyword(column.title)"></h3>
                    <p class="column-desc">{{ column.description }}</p>
                    <div class="column-stats">
                      <span>{{ column.article_count }} 篇</span>
                      <span>{{ formatCount(column.subscribe_count) }} 订阅</span>
                    </div>
                  </div>
                </div>

                <div v-if="columnResults.length === 0 && !loading" class="empty-result">
                  <el-empty description="未找到相关专栏" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div v-else class="search-empty">
      <el-empty description="请输入关键词开始搜索" />
    </div>
  </div>
</template>

<style scoped>
.search-page {
  width: 100%;
  min-height: 60vh;
}

.search-header {
  background: white;
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-box {
  max-width: 800px;
  margin: 0 auto;
}

.search-info {
  text-align: center;
  margin-top: 20px;
  font-size: 15px;
  color: #666;
}

.search-info strong {
  color: #409eff;
}

.search-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 文章列表样式 */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.article-item:hover {
  background: #f0f0f0;
  transform: translateX(4px);
}

.item-main {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-summary {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #999;
}

.item-cover {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

/* 网格样式 */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.result-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.result-card:hover {
  background: #f0f0f0;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 用户卡片 */
.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
}

.default-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 12px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.user-bio {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.user-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #999;
}

/* 话题卡片 */
.topic-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 12px;
}

.topic-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.topic-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.topic-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #999;
}

/* 专栏卡片 */
.column-card {
  padding: 0;
  overflow: hidden;
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

.column-info {
  padding: 16px;
  width: 100%;
}

.column-title {
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
  font-size: 13px;
  color: #999;
  justify-content: center;
}

/* 高亮样式 */
:deep(mark) {
  background: #ffe58f;
  color: #333;
  padding: 2px 4px;
  border-radius: 2px;
  font-weight: 600;
}

/* 空状态 */
.empty-result {
  padding: 60px 0;
}

.search-empty {
  background: white;
  padding: 100px 0;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-header {
    padding: 20px;
  }

  .results-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .item-cover {
    width: 80px;
    height: 80px;
  }
}
</style>
