<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { categoryAPI } from '@/api'
import type { Category } from '@/types'

const router = useRouter()
const categories = ref<Category[]>([])
const loading = ref(false)

onMounted(() => {
  loadCategories()
})

const loadCategories = async () => {
  loading.value = true
  try {
    categories.value = await categoryAPI.getTree()
  } catch (error) {
    ElMessage.error('加载分类失败')
  } finally {
    loading.value = false
  }
}

const goToCategory = (id: number) => {
  router.push({ path: '/articles', query: { category_id: id } })
}
</script>

<template>
  <div class="categories-page">
    <div class="page-header">
      <h1>内容分类</h1>
      <p>探索不同领域的精彩内容</p>
    </div>

    <el-skeleton :loading="loading" :count="8" animated>
      <template #default>
        <div class="categories-grid">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-card"
            @click="goToCategory(category.id)"
          >
            <div class="category-icon">
              <el-icon v-if="category.icon" :size="48">
                <component :is="category.icon" />
              </el-icon>
              <el-icon v-else :size="48">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path fill="currentColor" d="M192 736h640V128H256a64 64 0 0 0-64 64zm64-672h608a32 32 0 0 1 32 32v672a32 32 0 0 1-32 32H160l-32 57.536V192A128 128 0 0 1 256 64"></path>
                  <path fill="currentColor" d="M240 800a48 48 0 1 0 0 96h592v-96zm0-64h656v160a64 64 0 0 1-64 64H240a112 112 0 0 1 0-224m144-608v250.88l96-76.8 96 76.8V128zm-64-64h320v381.44a32 32 0 0 1-51.968 24.96L480 384l-108.032 86.4A32 32 0 0 1 320 445.44z"></path>
                </svg>
              </el-icon>
            </div>
            <div class="category-info">
              <h3>{{ category.name }}</h3>
              <p class="article-count">{{ category.article_count }} 篇文章</p>
            </div>

            <!-- 子分类 -->
            <div v-if="category.children && category.children.length > 0" class="sub-categories">
              <span
                v-for="child in category.children.slice(0, 3)"
                :key="child.id"
                class="sub-category-tag"
                @click.stop="goToCategory(child.id)"
              >
                {{ child.name }}
              </span>
              <span v-if="category.children.length > 3" class="more-tag">
                +{{ category.children.length - 3 }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>

    <div v-if="!loading && categories.length === 0" class="empty">
      <el-empty description="暂无分类" />
    </div>
  </div>
</template>

<style scoped>
.categories-page {
  width: 100%;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 8px;
}

.page-header p {
  font-size: 16px;
  color: #666;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.category-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 8px;
}

.category-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.article-count {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.sub-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.sub-category-tag {
  padding: 4px 12px;
  background: #f5f7fa;
  border-radius: 12px;
  font-size: 13px;
  color: #666;
  transition: all 0.2s;
}

.sub-category-tag:hover {
  background: #409eff;
  color: white;
}

.more-tag {
  padding: 4px 12px;
  background: #f5f7fa;
  border-radius: 12px;
  font-size: 13px;
  color: #999;
}

.empty {
  background: white;
  padding: 80px 0;
  border-radius: 8px;
  text-align: center;
}

/* 响应式设计 */
@media (min-width: 1600px) {
  .categories-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .categories-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
