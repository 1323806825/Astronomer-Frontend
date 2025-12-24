<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <div class="app-container">
      <AppSidebar />
      <main class="app-main">
        <div class="content-wrapper">
          <slot />
        </div>
      </main>
    </div>
    <footer class="app-footer">
      <div class="footer-content">
        <p>© 2025 Astronomer. All rights reserved.</p>
        <div class="footer-links">
          <router-link to="/about">关于我们</router-link>
          <span>|</span>
          <router-link to="/terms">用户协议</router-link>
          <span>|</span>
          <router-link to="/privacy">隐私政策</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-container {
  display: flex;
  flex: 1;
  position: relative;
  margin-top: 90px; /* 顶部banner(约30px) + 导航栏(60px) */
}

.app-main {
  flex: 1;
  background: #f5f7fa;
  margin-left: 220px;
  min-height: calc(100vh - 190px);
  padding: 24px 48px;
  width: calc(100vw - 220px) !important;
  max-width: none !important;
  box-sizing: border-box;
}

.content-wrapper {
  width: 100% !important;
  max-width: none !important;
  margin: 0;
  padding: 0;
}

.app-footer {
  background: white;
  border-top: 1px solid #e4e7ed;
  padding: 20px;
  margin-left: 220px; /* 侧边栏宽度 */
  margin-top: auto;
}

.footer-content {
  width: 100%;
  margin: 0 auto;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.footer-links {
  margin-top: 10px;
}

.footer-links a,
.footer-links .router-link-active,
.footer-links .router-link-exact-active {
  color: #909399;
  text-decoration: none;
  margin: 0 8px;
}

.footer-links a:hover {
  color: #409eff;
}

.footer-links span {
  margin: 0 8px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .app-main {
    margin-left: 180px;
  }

  .app-footer {
    margin-left: 180px;
  }
}

@media (max-width: 768px) {
  .app-main {
    margin-left: 0;
  }

  .app-footer {
    margin-left: 0;
  }

  .content-wrapper {
    max-width: 100%;
  }
}
</style>
