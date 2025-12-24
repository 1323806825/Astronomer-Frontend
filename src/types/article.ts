// 文章相关类型定义

export interface Article {
  id: number
  user_id: string  // UUID格式
  title: string
  summary: string
  cover_image: string
  content_type: number
  category_id: number
  column_id: number
  tags: string[]
  topics?: string[]
  visibility: number
  status: number
  view_count: number
  like_count: number
  comment_count: number
  favorite_count: number
  share_count: number
  hot_score: number
  create_time: string
  update_time: string
  publish_time?: string
  // 列表中的作者信息（可选）
  author_name?: string
  author_avatar?: string
}

export interface ArticleContent {
  article_id: number
  content: string
  word_count: number
  read_time: number
}

export interface Author {
  user_id: string  // UUID格式
  username: string
  avatar: string
  intro: string
}

export interface Category {
  id: number
  name: string
  icon: string
  parent_id: number
  sort_order: number
  article_count: number
  is_show: boolean
  children?: Category[]
}

export interface Topic {
  id: number
  name: string
  description: string
  article_count: number
  follow_count: number
  hot_score?: number
  status: number
  create_time: string
}

export interface ArticleColumn {
  id: number
  user_id: string  // UUID格式
  name: string
  description: string
  cover_image: string
  sort_type: number
  article_count: number
  subscriber_count: number
  is_finished: boolean
  status: number
  create_time: string
}

// 文章详情响应（扁平化结构，匹配后端）
export interface ArticleDetail {
  // 文章基本信息
  id: number
  user_id: string
  title: string
  summary: string
  cover_image: string
  content_type: number
  category_id: number
  column_id: number
  tags: string[]
  topics: string[]
  visibility: number
  status: number
  view_count: number
  like_count: number
  comment_count: number
  favorite_count: number
  share_count: number
  create_time: string
  update_time: string
  publish_time: string

  // 文章内容
  content: string
  word_count: number
  read_time: number

  // 作者信息
  author_id: string
  author_name: string
  author_avatar: string
  author_bio: string

  // 用户互动状态
  is_liked: boolean
  is_favorited: boolean
  is_following: boolean

  // 相关数据
  categories: Array<{
    id: number
    name: string
    icon: string
  }>
  related_articles: Article[]
}

export interface ArticleDraft {
  id: number
  user_id: string  // UUID格式
  title: string
  summary: string
  content: string
  cover_image: string
  category_id: number
  column_id: number
  tags: string[]
  topics: string[]
  auto_save_count: number
  is_published: boolean
  last_edit_time: string
  create_time: string
}

export interface CreateArticleRequest {
  title: string
  summary?: string
  content: string
  cover_image?: string
  content_type?: number
  category_id?: number
  column_id?: number
  tags?: string[]
  topics?: string[]
  visibility?: number
}

export interface UpdateArticleRequest {
  title?: string
  summary?: string
  content?: string
  cover_image?: string
  category_id?: number
  column_id?: number
  tags?: string[]
  topics?: string[]
  visibility?: number
  keywords?: string
}

export interface SaveDraftRequest {
  title: string
  summary?: string
  content: string
  cover_image?: string
  category_id?: number
  column_id?: number
  tags?: string[]
  topics?: string[]
}

export interface ArticleListParams {
  category_id?: number
  column_id?: number
  topic_id?: number
  user_id?: string  // UUID格式
  keyword?: string
  sort_by?: 'hot' | 'time' | 'like'
  page?: number
  page_size?: number
}

export interface ArticleListResponse {
  articles: Article[]
  total: number
  page: number
  page_size: number
}

export interface ColumnDetailResponse {
  column: ArticleColumn
  author: Author
  article_count: number
  is_subscribed: boolean
}

export interface TopicDetailResponse {
  topic: Topic
  is_followed: boolean
}

// 枚举定义
export enum ArticleVisibility {
  PUBLIC = 1,
  FOLLOWER = 2,
  FRIEND = 3,
  PRIVATE = 4,
  PAID = 5
}

export enum ArticleStatus {
  PUBLISHED = 1,
  AUDITING = 2,
  AUDIT_FAILED = 3,
  OFFLINE = 4,
  DELETED = 5
}

export enum ContentType {
  TEXT = 1,
  IMAGE_TEXT = 2,
  AUDIO = 3,
  QA = 4
}
