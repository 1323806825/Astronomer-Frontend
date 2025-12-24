<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { commentAPI, commentInteractionAPI } from '@/api'
import { useUserStore } from '@/stores/user'
import type { Comment, CommentListParams } from '@/types'
import {
  ChatDotRound,
  ArrowUp,
  ArrowDown,
  Warning,
  Delete,
  Star
} from '@element-plus/icons-vue'

interface Props {
  targetType: number // 1-文章, 2-视频等
  targetId: number
}

const props = defineProps<Props>()
const userStore = useUserStore()

const comments = ref<Comment[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const sortBy = ref('hot') // hot, time, like

const newComment = ref('')
const submitting = ref(false)
const replyingTo = ref<number | null>(null)
const replyContent = ref('')

const isLoggedIn = computed(() => userStore.isLoggedIn)

onMounted(() => {
  loadComments()
})

const loadComments = async () => {
  loading.value = true
  try {
    const params: CommentListParams = {
      target_type: props.targetType,
      target_id: props.targetId,
      sort_by: sortBy.value,
      page: currentPage.value,
      page_size: pageSize.value
    }
    const result = await commentAPI.getRootList(params)
    comments.value = result.comments
    total.value = result.total
  } catch (error) {
    ElMessage.error('加载评论失败')
  } finally {
    loading.value = false
  }
}

const handleSortChange = () => {
  currentPage.value = 1
  loadComments()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadComments()
  // 滚动到评论区顶部
  document.querySelector('.comment-section')?.scrollIntoView({ behavior: 'smooth' })
}

const handleSubmitComment = async () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }

  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  submitting.value = true
  try {
    await commentAPI.createRoot({
      target_type: props.targetType,
      target_id: props.targetId,
      content: newComment.value,
      user_id: 0, // 会在后端从JWT中获取
      ip: '',
      user_agent: ''
    })
    ElMessage.success('评论成功')
    newComment.value = ''
    currentPage.value = 1
    loadComments()
  } catch (error) {
    ElMessage.error('评论失败')
  } finally {
    submitting.value = false
  }
}

const handleReply = (commentId: number) => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }
  replyingTo.value = commentId
}

const handleSubmitReply = async (parentId: number) => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  try {
    await commentAPI.createReply({
      parent_id: parentId,
      content: replyContent.value,
      user_id: 0,
      target_type: props.targetType,
      target_id: props.targetId,
      ip: '',
      user_agent: ''
    })
    ElMessage.success('回复成功')
    replyContent.value = ''
    replyingTo.value = null
    loadComments()
  } catch (error) {
    ElMessage.error('回复失败')
  }
}

const handleLike = async (commentId: number) => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    await commentInteractionAPI.like(commentId)
    ElMessage.success('点赞成功')
    loadComments()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDislike = async (commentId: number) => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    await commentInteractionAPI.dislike(commentId)
    ElMessage.success('已点踩')
    loadComments()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (commentId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await commentAPI.delete(commentId)
    ElMessage.success('删除成功')
    loadComments()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const formatTime = (time: string) => {
  const now = new Date()
  const commentTime = new Date(time)
  const diff = now.getTime() - commentTime.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return commentTime.toLocaleDateString()
}
</script>

<template>
  <div class="comment-section">
    <div class="comment-header">
      <h3>
        <el-icon><ChatDotRound /></el-icon>
        评论 <span class="count">{{ total }}</span>
      </h3>
      <el-radio-group v-model="sortBy" size="small" @change="handleSortChange">
        <el-radio-button value="hot">热门</el-radio-button>
        <el-radio-button value="time">最新</el-radio-button>
        <el-radio-button value="like">点赞最多</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 发表评论 -->
    <div class="comment-input">
      <el-input
        v-model="newComment"
        type="textarea"
        :rows="4"
        placeholder="发表你的看法..."
        :disabled="!isLoggedIn"
      />
      <div class="input-actions">
        <span v-if="!isLoggedIn" class="login-tip">
          <router-link to="/login">登录</router-link> 后发表评论
        </span>
        <el-button
          type="primary"
          :loading="submitting"
          :disabled="!newComment.trim()"
          @click="handleSubmitComment"
        >
          发表评论
        </el-button>
      </div>
    </div>

    <!-- 评论列表 -->
    <el-skeleton :loading="loading" :count="3" animated>
      <template #default>
        <div class="comment-list">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
          >
            <div class="comment-avatar">
              <el-avatar :src="comment.user_avatar" :size="40" />
            </div>
            <div class="comment-content">
              <div class="comment-user">
                <span class="username">{{ comment.user_name }}</span>
                <span class="time">{{ formatTime(comment.create_time) }}</span>
              </div>
              <div class="comment-text">{{ comment.content }}</div>

              <!-- 作者回复 -->
              <div v-if="comment.author_reply" class="author-reply">
                <el-icon><Star /></el-icon>
                <span class="label">作者回复：</span>
                {{ comment.author_reply.content }}
              </div>

              <div class="comment-actions">
                <el-button
                  text
                  size="small"
                  @click="handleLike(comment.id)"
                >
                  <el-icon><ArrowUp /></el-icon>
                  {{ comment.like_count }}
                </el-button>
                <el-button
                  text
                  size="small"
                  @click="handleDislike(comment.id)"
                >
                  <el-icon><ArrowDown /></el-icon>
                  {{ comment.dislike_count }}
                </el-button>
                <el-button
                  text
                  size="small"
                  @click="handleReply(comment.id)"
                >
                  回复
                </el-button>
                <el-button
                  v-if="userStore.user?.id === comment.user_id"
                  text
                  size="small"
                  type="danger"
                  @click="handleDelete(comment.id)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>

              <!-- 回复输入框 -->
              <div v-if="replyingTo === comment.id" class="reply-input">
                <el-input
                  v-model="replyContent"
                  type="textarea"
                  :rows="3"
                  :placeholder="`回复 @${comment.user_name}`"
                />
                <div class="reply-actions">
                  <el-button size="small" @click="replyingTo = null">取消</el-button>
                  <el-button
                    type="primary"
                    size="small"
                    :disabled="!replyContent.trim()"
                    @click="handleSubmitReply(comment.id)"
                  >
                    回复
                  </el-button>
                </div>
              </div>

              <!-- 子评论数量提示 -->
              <div v-if="comment.reply_count > 0" class="replies-count">
                共 {{ comment.reply_count }} 条回复
                <el-icon><ArrowDown /></el-icon>
              </div>
            </div>
          </div>

          <div v-if="comments.length === 0 && !loading" class="empty">
            <el-empty description="还没有评论，快来抢沙发吧~" />
          </div>
        </div>
      </template>
    </el-skeleton>

    <!-- 分页 -->
    <el-pagination
      v-if="total > pageSize"
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      @current-change="handlePageChange"
      class="pagination"
    />
  </div>
</template>

<style scoped>
.comment-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.count {
  color: #909399;
  font-weight: normal;
}

.comment-input {
  margin-bottom: 24px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.login-tip {
  font-size: 14px;
  color: #909399;
}

.login-tip a {
  color: #409eff;
  text-decoration: none;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.username {
  font-weight: 600;
  color: #333;
}

.time {
  font-size: 13px;
  color: #909399;
}

.comment-text {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 12px;
  word-wrap: break-word;
}

.author-reply {
  background: #f5f7fa;
  border-left: 3px solid #409eff;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.author-reply .label {
  font-weight: 600;
  color: #409eff;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.reply-input {
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.replies-count {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.replies-count:hover {
  background: #e4e7ed;
}

.empty {
  padding: 40px 0;
  text-align: center;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .comment-section {
    padding: 16px;
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
