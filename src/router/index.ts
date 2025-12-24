import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('@/views/article/ArticleList.vue'),
      meta: { title: '文章列表' }
    },
    {
      path: '/article/:id',
      name: 'article-detail',
      component: () => import('@/views/article/ArticleDetail.vue'),
      meta: { title: '文章详情' }
    },
    {
      path: '/article/create',
      name: 'article-create',
      component: () => import('@/views/article/ArticleEdit.vue'),
      meta: { title: '写文章', requiresAuth: true }
    },
    {
      path: '/article/:id/edit',
      name: 'article-edit',
      component: () => import('@/views/article/ArticleEdit.vue'),
      meta: { title: '编辑文章', requiresAuth: true }
    },
    {
      path: '/drafts',
      name: 'drafts',
      component: () => import('@/views/article/DraftList.vue'),
      meta: { title: '我的草稿', requiresAuth: true }
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/views/category/CategoryList.vue'),
      meta: { title: '分类' }
    },
    {
      path: '/topics',
      name: 'topics',
      component: () => import('@/views/topic/TopicList.vue'),
      meta: { title: '话题' }
    },
    {
      path: '/topic/:id',
      name: 'topic-detail',
      component: () => import('@/views/topic/TopicDetail.vue'),
      meta: { title: '话题详情' }
    },
    {
      path: '/columns',
      name: 'columns',
      component: () => import('@/views/column/ColumnList.vue'),
      meta: { title: '专栏' }
    },
    {
      path: '/column/:id',
      name: 'column-detail',
      component: () => import('@/views/column/ColumnDetail.vue'),
      meta: { title: '专栏详情' }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
      meta: { title: '搜索' }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { title: '注册' }
    },
    {
      path: '/user/:id',
      name: 'user-profile',
      component: () => import('@/views/user/UserProfile.vue'),
      meta: { title: '个人主页' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: '设置', requiresAuth: true }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/notification/NotificationList.vue'),
      meta: { title: '通知中心', requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { title: '关于我们' }
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/TermsView.vue'),
      meta: { title: '用户协议' }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/PrivacyView.vue'),
      meta: { title: '隐私政策' }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = (to.meta.title as string) + ' - Astronomer'

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      // 未登录，跳转到登录页
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router
