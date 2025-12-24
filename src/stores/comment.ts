import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Comment, CommentListParams } from '@/types'
import { commentAPI } from '@/api'

export const useCommentStore = defineStore('comment', () => {
  // 评论列表
  const comments = ref<Comment[]>([])
  const total = ref(0)
  const loading = ref(false)

  // 获取根评论列表
  const fetchComments = async (params: CommentListParams) => {
    loading.value = true
    try {
      const res = await commentAPI.getRootList(params)
      comments.value = res.comments
      total.value = res.total
      return res
    } catch (error) {
      console.error('获取评论列表失败', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取子评论列表
  const fetchReplies = async (id: number, params: any) => {
    try {
      const res = await commentAPI.getReplies(id, params)
      return res
    } catch (error) {
      console.error('获取回复失败', error)
      throw error
    }
  }

  // 点赞评论
  const likeComment = async (id: number) => {
    try {
      await commentAPI.like(id)
      // 更新本地状态
      const comment = findCommentById(comments.value, id)
      if (comment) {
        comment.is_liked = true
        comment.like_count++
      }
    } catch (error) {
      console.error('点赞失败', error)
      throw error
    }
  }

  // 取消点赞
  const unlikeComment = async (id: number) => {
    try {
      await commentAPI.unlike(id)
      // 更新本地状态
      const comment = findCommentById(comments.value, id)
      if (comment) {
        comment.is_liked = false
        comment.like_count--
      }
    } catch (error) {
      console.error('取消点赞失败', error)
      throw error
    }
  }

  // 辅助函数：递归查找评论
  const findCommentById = (list: Comment[], id: number): Comment | null => {
    for (const comment of list) {
      if (comment.id === id) {
        return comment
      }
      if (comment.replies && comment.replies.length > 0) {
        const found = findCommentById(comment.replies, id)
        if (found) return found
      }
    }
    return null
  }

  // 创建根评论
  const createComment = async (articleId: number, content: string) => {
    try {
      await commentAPI.createRoot({
        article_id: articleId,
        content: content
      })
      // 评论创建成功，调用者应该重新加载评论列表
    } catch (error) {
      console.error('发表评论失败', error)
      throw error
    }
  }

  // 添加新评论到列表
  const addComment = (comment: Comment) => {
    comments.value.unshift(comment)
    total.value++
  }

  // 清空评论列表
  const clearComments = () => {
    comments.value = []
    total.value = 0
  }

  return {
    comments,
    total,
    loading,
    fetchComments,
    fetchReplies,
    likeComment,
    unlikeComment,
    createComment,
    addComment,
    clearComments
  }
})
