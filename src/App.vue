<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <el-config-provider :locale="zhCn">
    <AppLayout>
      <RouterView />
    </AppLayout>
  </el-config-provider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
  color: #333;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
}

/* 确保主内容区域充满可用空间 */
.app-main {
  width: 100% !important;
  max-width: none !important;
}

.content-wrapper {
  width: 100% !important;
  max-width: none !important;
}
</style>
