<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { userAPI, authAPI } from '@/api'
import { ElMessage } from 'element-plus'
import ImageUpload from '@/components/ImageUpload.vue'
import type { FormInstance, FormRules } from 'element-plus'

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const loading = ref(false)
const passwordLoading = ref(false)

const form = ref({
  username: '',
  bio: '',
  sex: 0,
  avatar: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(async () => {
  await loadUserInfo()
})

const loadUserInfo = async () => {
  try {
    const user = await authAPI.getCurrentUser()
    form.value = {
      username: user.username || '',
      bio: user.bio || '',
      sex: user.sex || 0,
      avatar: user.avatar || ''
    }
  } catch (error) {
    ElMessage.error('加载用户信息失败')
  }
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleUpdateProfile = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userAPI.update({
          username: form.value.username,
          bio: form.value.bio,
          sex: form.value.sex,
          avatar: form.value.avatar
        })
        ElMessage.success('更新成功')
        // 刷新用户信息
        await userStore.fetchUserInfo()
      } catch (error) {
        ElMessage.error('更新失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      try {
        await userAPI.changePassword({
          old_password: passwordForm.value.oldPassword,
          new_password: passwordForm.value.newPassword
        })
        ElMessage.success('密码修改成功')
        // 清空表单
        passwordForm.value = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      } catch (error) {
        ElMessage.error('密码修改失败')
      } finally {
        passwordLoading.value = false
      }
    }
  })
}
</script>

<template>
  <div class="settings">
    <div class="settings-container">
      <h1>个人设置</h1>

      <el-tabs>
        <el-tab-pane label="基本信息">
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
            style="max-width: 600px"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>

            <el-form-item label="个人简介" prop="bio">
              <el-input
                v-model="form.bio"
                type="textarea"
                :rows="3"
                placeholder="介绍一下自己吧"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="form.sex">
                <el-radio :value="0">保密</el-radio>
                <el-radio :value="1">男</el-radio>
                <el-radio :value="2">女</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="头像" prop="avatar">
              <ImageUpload v-model="form.avatar" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="loading" @click="handleUpdateProfile">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="修改密码">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            style="max-width: 600px"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="请输入原密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="passwordLoading" @click="handleUpdatePassword">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.settings {
  max-width: 900px;
  margin: 0 auto;
}

.settings-container {
  background: white;
  padding: 40px;
  border-radius: 8px;
}

.settings-container h1 {
  font-size: 28px;
  margin-bottom: 30px;
}
</style>
