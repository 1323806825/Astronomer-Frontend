import api from './request'
import type {
  Comment,
  CreateCommentRequest,
  CreateReplyRequest,
  ReportCommentRequest,
  CommentListParams,
  CommentListResponse,
  CommentStats,
  UserCommentStats,
  CommentReport,
  CommentSensitiveWord,
  CommentAuthorReply
} from '@/types'

// 评论管理
export const commentAPI = {
  // 发表根评论
  createRoot: (data: CreateCommentRequest) => {
    return api.post<any, Comment>('/comments/root', data)
  },

  // 发表回复评论
  createReply: (data: CreateReplyRequest) => {
    return api.post<any, Comment>('/comments/reply', data)
  },

  // 删除评论
  delete: (id: number) => {
    return api.delete<any, void>(`/comments/${id}`)
  },

  // 获取评论详情
  getDetail: (id: number) => {
    return api.get<any, Comment>(`/comments/${id}`)
  },

  // 获取根评论列表
  getRootList: (params: CommentListParams) => {
    return api.get<any, CommentListResponse>('/comments/root', { params })
  },

  // 获取子评论列表
  getReplies: (id: number, params: { sort_by?: string; page?: number; page_size?: number }) => {
    return api.get<any, CommentListResponse>(`/comments/${id}/replies`, { params })
  },

  // 获取评论树
  getTree: (id: number) => {
    return api.get<any, Comment>(`/comments/${id}/tree`)
  },

  // 获取热评列表
  getHot: (params: { target_type: number; target_id: number; limit?: number }) => {
    return api.get<any, Comment[]>('/comments/hot', { params })
  },

  // 获取评论统计
  getStats: (params: { target_type: number; target_id: number }) => {
    return api.get<any, CommentStats>('/comments/stats', { params })
  }
}

// 评论互动
export const commentInteractionAPI = {
  // 点赞评论
  like: (id: number) => {
    return api.post<any, void>(`/comments/${id}/like`)
  },

  // 取消点赞
  unlike: (id: number) => {
    return api.delete<any, void>(`/comments/${id}/like`)
  },

  // 点踩评论
  dislike: (id: number) => {
    return api.post<any, void>(`/comments/${id}/dislike`)
  },

  // 取消点踩
  undislike: (id: number) => {
    return api.delete<any, void>(`/comments/${id}/dislike`)
  }
}

// 举报管理
export const reportAPI = {
  // 举报评论
  report: (id: number, data: Omit<ReportCommentRequest, 'comment_id'>) => {
    return api.post<any, void>(`/comments/${id}/report`, data)
  },

  // 获取待审核举报（管理员）
  getPending: (params: { page?: number; page_size?: number }) => {
    return api.get<any, { reports: CommentReport[]; total: number; page: number; page_size: number }>('/reports/pending', { params })
  },

  // 审核举报（管理员）
  handle: (id: number, data: { approved: boolean; result: string }) => {
    return api.post<any, void>(`/reports/${id}/handle`, data)
  }
}

// UP主功能
export const authorAPI = {
  // UP主追评
  addReply: (id: number, data: { content: string }) => {
    return api.post<any, CommentAuthorReply>(`/comments/${id}/author-reply`, data)
  },

  // 置顶评论
  pin: (id: number) => {
    return api.post<any, void>(`/comments/${id}/pin`)
  },

  // 取消置顶
  unpin: (id: number) => {
    return api.delete<any, void>(`/comments/${id}/pin`)
  },

  // 精选评论
  feature: (id: number) => {
    return api.post<any, void>(`/comments/${id}/feature`)
  },

  // 取消精选
  unfeature: (id: number) => {
    return api.delete<any, void>(`/comments/${id}/feature`)
  }
}

// 用户统计
export const userCommentAPI = {
  // 获取我的评论统计
  getMyStats: () => {
    return api.get<any, UserCommentStats>('/comments/my-stats')
  }
}

// 管理功能
export const commentAdminAPI = {
  // 批量删除评论
  batchDelete: (data: { comment_ids: number[] }) => {
    return api.post<any, void>('/comments/batch-delete', data)
  },

  // 批量折叠评论
  batchFold: (data: { comment_ids: number[] }) => {
    return api.post<any, void>('/comments/batch-fold', data)
  },

  // 获取敏感词列表
  getSensitiveWords: () => {
    return api.get<any, CommentSensitiveWord[]>('/sensitive-words')
  },

  // 添加敏感词
  addSensitiveWord: (data: { word: string; level: number; action: number }) => {
    return api.post<any, CommentSensitiveWord>('/sensitive-words', data)
  }
}
