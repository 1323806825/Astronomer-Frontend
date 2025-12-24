import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Article, ArticleDetail, ArticleListParams } from '@/types'
import { articleAPI } from '@/api'

export const useArticleStore = defineStore('article', () => {
  // 文章列表
  const articles = ref<Article[]>([])
  const total = ref(0)
  const loading = ref(false)
  const hasMore = ref(true)  // 是否还有更多数据

  // 当前文章详情
  const currentArticle = ref<ArticleDetail | null>(null)
  const articleLoading = ref(false)

  // 获取文章列表（替换模式）
  const fetchArticles = async (params: ArticleListParams) => {
    loading.value = true
    try {
      const res = await articleAPI.getList(params)
      articles.value = res.articles
      total.value = res.total
      // 判断是否还有更多数据
      const currentTotal = (params.page || 1) * (params.page_size || 20)
      hasMore.value = currentTotal < res.total
      return res
    } catch (error) {
      console.error('获取文章列表失败', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 追加文章列表（无限滚动模式）
  const appendArticles = async (params: ArticleListParams) => {
    if (!hasMore.value || loading.value) return

    loading.value = true
    try {
      const res = await articleAPI.getList(params)
      // 追加新文章，去重
      const newArticles = res.articles.filter(
        newArticle => !articles.value.some(existingArticle => existingArticle.id === newArticle.id)
      )
      articles.value = [...articles.value, ...newArticles]
      total.value = res.total

      // 判断是否还有更多数据
      const currentTotal = (params.page || 1) * (params.page_size || 20)
      hasMore.value = currentTotal < res.total

      return res
    } catch (error) {
      console.error('加载更多文章失败', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 重置文章列表
  const resetArticles = () => {
    articles.value = []
    total.value = 0
    hasMore.value = true
  }

  // 获取文章详情
  const fetchArticleDetail = async (id: number) => {
    articleLoading.value = true
    try {
      const res = await articleAPI.getDetail(id)
      currentArticle.value = res
      return res
    } catch (error) {
      console.error('获取文章详情失败', error)
      throw error
    } finally {
      articleLoading.value = false
    }
  }

  // 点赞文章
  const likeArticle = async (id: number) => {
    try {
      await articleAPI.like(id)
      // 更新本地状态
      if (currentArticle.value && currentArticle.value.article.id === id) {
        currentArticle.value.is_liked = true
        currentArticle.value.article.like_count++
      }
    } catch (error) {
      console.error('点赞失败', error)
      throw error
    }
  }

  // 取消点赞
  const unlikeArticle = async (id: number) => {
    try {
      await articleAPI.unlike(id)
      // 更新本地状态
      if (currentArticle.value && currentArticle.value.article.id === id) {
        currentArticle.value.is_liked = false
        currentArticle.value.article.like_count--
      }
    } catch (error) {
      console.error('取消点赞失败', error)
      throw error
    }
  }

  // 收藏文章
  const favoriteArticle = async (id: number) => {
    try {
      await articleAPI.favorite(id)
      // 更新本地状态
      if (currentArticle.value && currentArticle.value.article.id === id) {
        currentArticle.value.is_favorited = true
        currentArticle.value.article.favorite_count++
      }
    } catch (error) {
      console.error('收藏失败', error)
      throw error
    }
  }

  // 取消收藏
  const unfavoriteArticle = async (id: number) => {
    try {
      await articleAPI.unfavorite(id)
      // 更新本地状态
      if (currentArticle.value && currentArticle.value.article.id === id) {
        currentArticle.value.is_favorited = false
        currentArticle.value.article.favorite_count--
      }
    } catch (error) {
      console.error('取消收藏失败', error)
      throw error
    }
  }

  // 清空当前文章
  const clearCurrentArticle = () => {
    currentArticle.value = null
  }

  return {
    articles,
    total,
    loading,
    hasMore,
    currentArticle,
    articleLoading,
    fetchArticles,
    appendArticles,
    resetArticles,
    fetchArticleDetail,
    likeArticle,
    unlikeArticle,
    favoriteArticle,
    unfavoriteArticle,
    clearCurrentArticle
  }
})
