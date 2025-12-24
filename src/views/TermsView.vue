<script setup lang="ts">
// 用户协议页面
</script>

<template>
  <div class="terms">
    <div class="terms-container">
      <h1>用户协议</h1>

      <section class="section">
        <h2>1. 服务条款的接受与修改</h2>
        <p>
          欢迎您使用 Astronomer 平台服务。在使用本平台服务之前，请您仔细阅读并充分理解本协议的各项条款。
        </p>
        <p>
          一旦您注册成为本平台用户或使用本平台服务，即表示您已充分阅读、理解并接受本协议的全部内容。
        </p>
      </section>

      <section class="section">
        <h2>2. 账号注册与使用</h2>
        <p>
          2.1 用户在注册账号时应提供真实、准确、完整的个人信息。
        </p>
        <p>
          2.2 用户应妥善保管账号和密码，因账号或密码保管不善造成的损失由用户自行承担。
        </p>
        <p>
          2.3 禁止以任何方式出售、转让或出借账号。
        </p>
      </section>

      <section class="section">
        <h2>3. 内容发布规范</h2>
        <p>
          3.1 用户发布的内容应遵守国家法律法规，不得包含违法、违规、不良信息。
        </p>
        <p>
          3.2 用户对其发布的内容承担全部责任。
        </p>
        <p>
          3.3 平台有权对违规内容进行删除、屏蔽等处理。
        </p>
      </section>

      <section class="section">
        <h2>4. 知识产权</h2>
        <p>
          4.1 用户发布的原创内容，其知识产权归用户所有。
        </p>
        <p>
          4.2 用户授权平台在全球范围内使用、展示其发布的内容。
        </p>
        <p>
          4.3 用户不得侵犯他人的知识产权。
        </p>
      </section>

      <section class="section">
        <h2>5. 免责声明</h2>
        <p>
          5.1 平台不对用户发布内容的真实性、准确性、完整性负责。
        </p>
        <p>
          5.2 因不可抗力导致的服务中断，平台不承担责任。
        </p>
        <p>
          5.3 用户使用平台服务产生的风险由用户自行承担。
        </p>
      </section>

      <section class="section">
        <h2>6. 协议的终止</h2>
        <p>
          6.1 用户可随时注销账号，终止使用平台服务。
        </p>
        <p>
          6.2 如用户违反本协议，平台有权终止向用户提供服务。
        </p>
      </section>

      <section class="section">
        <p class="update-time">
          本协议最后更新时间：2025年1月1日
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.terms {
  max-width: 900px;
  margin: 0 auto;
}

.terms-container {
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
  margin-bottom: 30px;
}

.section:last-child {
  margin-bottom: 0;
}

h2 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
}

p {
  font-size: 15px;
  line-height: 1.8;
  color: #666;
  margin-bottom: 10px;
}

.update-time {
  text-align: right;
  color: #999;
  font-size: 14px;
  margin-top: 30px;
}
</style>
