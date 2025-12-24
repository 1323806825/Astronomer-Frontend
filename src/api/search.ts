import api from './request'
import type { Article, User, Topic, Column } from '@/types'

export interface SearchParams {
  keyword: string
  page?: number
  page_size?: number
}

export interface SearchArticlesResponse {
  items: Article[]
  total: number
  page: number
  page_size: number
}

export interface SearchUsersResponse {
  items: User[]
  total: number
  page: number
  page_size: number
}

export interface SearchTopicsResponse {
  items: Topic[]
  total: number
  page: number
  page_size: number
}

export interface SearchColumnsResponse {
  items: Column[]
  total: number
  page: number
  page_size: number
}

export interface SearchAllResponse {
  articles: Article[]
  users: User[]
  topics: Topic[]
  columns: Column[]
}

// 搜索API
export const searchAPI = {
  // 搜索文章
  searchArticles: (params: SearchParams) => {
    return api.get<any, SearchArticlesResponse>('/search/articles', {
      params: { q: params.keyword, page: params.page, page_size: params.page_size }
    })
  },

  // 搜索用户
  searchUsers: (params: SearchParams) => {
    return api.get<any, SearchUsersResponse>('/search/users', {
      params: { q: params.keyword, page: params.page, page_size: params.page_size }
    })
  },

  // 搜索话题
  searchTopics: (params: SearchParams) => {
    return api.get<any, SearchTopicsResponse>('/search/topics', {
      params: { q: params.keyword, page: params.page, page_size: params.page_size }
    })
  },

  // 搜索专栏
  searchColumns: (params: SearchParams) => {
    return api.get<any, SearchColumnsResponse>('/search/columns', {
      params: { q: params.keyword, page: params.page, page_size: params.page_size }
    })
  },

  // 综合搜索
  searchAll: (keyword: string) => {
    return api.get<any, SearchAllResponse>('/search/all', {
      params: { q: keyword }
    })
  }
}
