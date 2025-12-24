<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { FormInstance, FormRules } from 'element-plus'
import api from '@/api/request'

const router = useRouter()
const userStore = useUserStore()

const registerFormRef = ref<FormInstance>()
const registerForm = ref({
  username: '',
  password: '',
  phone: '',
  captchaVal: ''
})

const captchaInfo = ref({
  captchaId: '',
  picPath: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度在 6 到 50 个字符', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/,
      message: '密码必须同时包含字母和数字',
      trigger: 'blur'
    }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  captchaVal: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

const loading = ref(false)

// 获取验证码
const getCaptcha = async () => {
  try {
    const response = await api.get('/user/captcha')
    captchaInfo.value = response
  } catch (error) {
    console.error('获取验证码失败', error)
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  getCaptcha()
}

// 页面加载时获取验证码
onMounted(() => {
  getCaptcha()
})

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.register({
          username: registerForm.value.username,
          password: registerForm.value.password,
          phone: registerForm.value.phone,
          captchaId: captchaInfo.value.captchaId,
          captchaVal: registerForm.value.captchaVal
        })
        router.push('/')
      } catch (error) {
        console.error('注册失败', error)
        // 注册失败后刷新验证码
        refreshCaptcha()
        registerForm.value.captchaVal = ''
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <h2>注册</h2>
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        label-width="80px"
        @submit.prevent="handleRegister"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="验证码" prop="captchaVal">
          <div style="display: flex; gap: 10px; width: 100%;">
            <el-input
              v-model="registerForm.captchaVal"
              placeholder="请输入验证码"
              style="flex: 1;"
            />
            <img
              v-if="captchaInfo.picPath"
              :src="captchaInfo.picPath"
              @click="refreshCaptcha"
              style="height: 40px; cursor: pointer; border: 1px solid #dcdfe6; border-radius: 4px;"
              title="点击刷新验证码"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleRegister" style="width: 100%">
            注册
          </el-button>
        </el-form-item>
      </el-form>
      <div class="links">
        <span>已有账号？</span>
        <router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
}

.register-box {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.register-box h2 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
}

.links {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.links a {
  color: #409eff;
  text-decoration: none;
  margin-left: 5px;
}

.links a:hover {
  text-decoration: underline;
}
</style>
