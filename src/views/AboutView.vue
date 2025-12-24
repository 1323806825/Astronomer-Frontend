<script setup lang="ts">
// 关于我们页面
</script>

<template>
  <div class="about">
    <div class="about-container">
      <h1>关于 Astronomer</h1>

      <section class="section">
        <h2>平台介绍</h2>
        <p>
          Astronomer 是一个专业的技术内容创作与分享平台，致力于为开发者、技术爱好者提供优质的内容创作和阅读体验。
        </p>
        <p>
          我们相信知识的力量，希望通过技术内容的分享，帮助更多人成长和进步。
        </p>
      </section>

      <section class="section">
        <h2>主要功能</h2>
        <ul>
          <li>📝 文章创作与发布</li>
          <li>💾 草稿自动保存</li>
          <li>📚 专栏管理</li>
          <li>🏷️ 话题分类</li>
          <li>💬 评论互动</li>
          <li>❤️ 点赞收藏</li>
          <li>👥 关注订阅</li>
        </ul>
      </section>

      <section class="section">
        <h2>联系我们</h2>
        <p>如有任何问题或建议，欢迎通过以下方式联系我们：</p>
        <ul>
          <li>📧 邮箱: contact@astronomer.com</li>
          <li>🌐 官网: https://astronomer.com</li>
        </ul>
      </section>

      <section class="section">
        <h2>版本信息</h2>
        <p>当前版本: v1.0.0</p>
        <p>更新时间: 2025-01-01</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
}

.about-container {
  background: white;
  padding: 40px;
  border-radius: 8px;
}

h1 {
  font-size: 32px;
  margin-bottom: 40px;
  text-align: center;
  color: #409eff;
}

.section {
  margin-bottom: 40px;
}

.section:last-child {
  margin-bottom: 0;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  border-left: 4px solid #409eff;
  padding-left: 15px;
}

p {
  font-size: 16px;
  line-height: 1.8;
  color: #666;
  margin-bottom: 15px;
}

ul {
  list-style: none;
  padding-left: 0;
}

ul li {
  font-size: 16px;
  line-height: 2;
  color: #666;
  padding-left: 10px;
}
</style>
