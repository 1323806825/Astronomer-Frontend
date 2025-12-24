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

/* 响应式设计 */
@media (max-width: 1024px) {
  .app-main {
    margin-left: 180px;
  }
}

@media (max-width: 768px) {
  .app-main {
    margin-left: 0;
  }

  .content-wrapper {
    max-width: 100%;
  }
}
</style>
