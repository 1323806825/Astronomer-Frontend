import api from './request'
import type {
  Article,
  ArticleDetail,
  ArticleListParams,
  ArticleListResponse,
  CreateArticleRequest,
  UpdateArticleRequest,
  ArticleDraft,
  SaveDraftRequest,
  Category,
  ArticleColumn,
  ColumnDetailResponse,
  Topic,
  TopicDetailResponse
} from '@/types'

// 文章管理
export const articleAPI = {
  // 获取文章列表
  getList: (params: ArticleListParams) => {
    return api.get<any, ArticleListResponse>('/articles', { params })
  },

  // 获取文章详情
  getDetail: (id: number) => {
    return api.get<any, ArticleDetail>(`/articles/${id}`)
  },

  // 创建文章
  create: (data: CreateArticleRequest) => {
    return api.post<any, Article>('/articles', data)
  },

  // 更新文章
  update: (id: number, data: UpdateArticleRequest) => {
    return api.put<any, void>(`/articles/${id}`, data)
  },

  // 删除文章
  delete: (id: number) => {
    return api.delete<any, void>(`/articles/${id}`)
  },

  // 获取文章历史版本
  getHistory: (id: number) => {
    return api.get<any, any[]>(`/articles/${id}/history`)
  },

  // 点赞文章
  like: (id: number) => {
    return api.post<any, void>(`/articles/${id}/like`)
  },

  // 取消点赞
  unlike: (id: number) => {
    return api.delete<any, void>(`/articles/${id}/like`)
  },

  // 收藏文章
  favorite: (id: number) => {
    return api.post<any, void>(`/articles/${id}/favorite`)
  },

  // 取消收藏
  unfavorite: (id: number) => {
    return api.delete<any, void>(`/articles/${id}/favorite`)
  },

  // 分享文章
  share: (id: number) => {
    return api.post<any, void>(`/articles/${id}/share`)
  }
}

// 草稿管理
export const draftAPI = {
  // 保存草稿
  save: (data: SaveDraftRequest) => {
    return api.post<any, ArticleDraft>('/drafts', data)
  },

  // 获取草稿列表
  getList: (params: { page?: number; page_size?: number }) => {
    return api.get<any, { drafts: ArticleDraft[]; total: number; page: number; page_size: number }>('/drafts', { params })
  },

  // 获取草稿详情
  getDetail: (id: number) => {
    return api.get<any, ArticleDraft>(`/drafts/${id}`)
  },

  // 更新草稿
  update: (id: number, data: SaveDraftRequest) => {
    return api.put<any, void>(`/drafts/${id}`, data)
  },

  // 发布草稿
  publish: (id: number) => {
    return api.post<any, Article>(`/drafts/${id}/publish`)
  },

  // 删除草稿
  delete: (id: number) => {
    return api.delete<any, void>(`/drafts/${id}`)
  }
}

// 分类管理
export const categoryAPI = {
  // 获取分类树
  getTree: () => {
    return api.get<any, Category[]>('/categories')
  },

  // 创建分类（管理员）
  create: (data: { name: string; parent_id: number; icon?: string; sort_order?: number }) => {
    return api.post<any, Category>('/categories', data)
  },

  // 获取分类下的文章
  getArticles: (id: number, params: { page?: number; page_size?: number }) => {
    return api.get<any, ArticleListResponse>(`/categories/${id}/articles`, { params })
  }
}

// 专栏管理
export const columnAPI = {
  // 获取专栏列表
  getList: (params: { page?: number; page_size?: number }) => {
    return api.get<any, { items: ArticleColumn[]; total: number; page: number; page_size: number }>('/columns', { params })
  },

  // 创建专栏
  create: (data: { name: string; description?: string; cover_image?: string; sort_type?: number }) => {
    return api.post<any, ArticleColumn>('/columns', data)
  },

  // 更新专栏
  update: (id: number, data: { name?: string; description?: string; cover_image?: string; sort_type?: number; is_finished?: boolean }) => {
    return api.put<any, void>(`/columns/${id}`, data)
  },

  // 获取专栏详情
  getDetail: (id: number) => {
    return api.get<any, ColumnDetailResponse>(`/columns/${id}`)
  },

  // 获取专栏文章列表
  getArticles: (id: number, params: { page?: number; page_size?: number }) => {
    return api.get<any, ArticleListResponse>(`/columns/${id}/articles`, { params })
  },

  // 添加文章到专栏
  addArticle: (id: number, data: { article_id: number; sort_order?: number }) => {
    return api.post<any, void>(`/columns/${id}/articles`, data)
  },

  // 从专栏移除文章
  removeArticle: (id: number, articleId: number) => {
    return api.delete<any, void>(`/columns/${id}/articles/${articleId}`)
  },

  // 订阅专栏
  subscribe: (id: number) => {
    return api.post<any, void>(`/columns/${id}/subscribe`)
  },

  // 取消订阅
  unsubscribe: (id: number) => {
    return api.delete<any, void>(`/columns/${id}/subscribe`)
  }
}

// 话题管理
export const topicAPI = {
  // 创建话题
  create: (data: { name: string; description?: string }) => {
    return api.post<any, Topic>('/topics', data)
  },

  // 获取热门话题
  getHot: (params: { limit?: number }) => {
    return api.get<any, Topic[]>('/topics/hot', { params })
  },

  // 获取话题详情
  getDetail: (id: number) => {
    return api.get<any, TopicDetailResponse>(`/topics/${id}`)
  },

  // 获取话题下的文章
  getArticles: (id: number, params: { page?: number; page_size?: number }) => {
    return api.get<any, ArticleListResponse>(`/topics/${id}/articles`, { params })
  },

  // 关注话题
  follow: (id: number) => {
    return api.post<any, void>(`/topics/${id}/follow`)
  },

  // 取消关注
  unfollow: (id: number) => {
    return api.delete<any, void>(`/topics/${id}/follow`)
  }
}
