<script setup lang="ts">
// 隐私政策页面
</script>

<template>
  <div class="privacy">
    <div class="privacy-container">
      <h1>隐私政策</h1>

      <section class="section">
        <h2>1. 信息收集</h2>
        <p>
          1.1 我们会收集您在注册、使用服务时主动提供的信息，包括但不限于：手机号、用户名、头像等。
        </p>
        <p>
          1.2 我们会自动收集您使用服务过程中产生的信息，如浏览记录、操作日志等。
        </p>
        <p>
          1.3 我们承诺仅在必要范围内收集信息，不会收集与服务无关的个人信息。
        </p>
      </section>

      <section class="section">
        <h2>2. 信息使用</h2>
        <p>
          2.1 为您提供平台服务，包括账号管理、内容展示、消息推送等。
        </p>
        <p>
          2.2 改进和优化服务，提升用户体验。
        </p>
        <p>
          2.3 进行数据分析和统计，了解服务使用情况。
        </p>
        <p>
          2.4 履行法律法规要求的义务。
        </p>
      </section>

      <section class="section">
        <h2>3. 信息保护</h2>
        <p>
          3.1 我们采用行业标准的安全技术和措施保护您的个人信息。
        </p>
        <p>
          3.2 我们会对员工进行数据安全培训，建立完善的信息安全管理制度。
        </p>
        <p>
          3.3 除法律法规另有规定外，我们承诺对您的个人信息保密。
        </p>
      </section>

      <section class="section">
        <h2>4. 信息共享与披露</h2>
        <p>
          4.1 未经您同意，我们不会与第三方共享您的个人信息，以下情况除外：
        </p>
        <ul>
          <li>法律法规规定的情况</li>
          <li>司法机关或政府部门要求</li>
          <li>保护平台及其他用户的合法权益</li>
          <li>您明确授权或主动选择的情况</li>
        </ul>
      </section>

      <section class="section">
        <h2>5. Cookie 使用</h2>
        <p>
          5.1 我们使用 Cookie 和类似技术来改善用户体验。
        </p>
        <p>
          5.2 您可以通过浏览器设置管理 Cookie，但这可能会影响某些功能的使用。
        </p>
      </section>

      <section class="section">
        <h2>6. 未成年人保护</h2>
        <p>
          6.1 我们重视未成年人的个人信息保护。
        </p>
        <p>
          6.2 如您是未成年人，请在监护人指导下使用本服务。
        </p>
      </section>

      <section class="section">
        <h2>7. 您的权利</h2>
        <p>
          7.1 访问和更新您的个人信息。
        </p>
        <p>
          7.2 要求删除您的个人信息。
        </p>
        <p>
          7.3 撤回授权同意。
        </p>
        <p>
          7.4 注销账号。
        </p>
      </section>

      <section class="section">
        <h2>8. 隐私政策的变更</h2>
        <p>
          我们可能会不时修订本隐私政策。如有重大变更，我们会通过站内通知、邮件等方式告知您。
        </p>
      </section>

      <section class="section">
        <h2>9. 联系我们</h2>
        <p>
          如您对本隐私政策有任何疑问，请通过以下方式联系我们：
        </p>
        <p>
          邮箱: privacy@astronomer.com
        </p>
      </section>

      <section class="section">
        <p class="update-time">
          本隐私政策最后更新时间：2025年1月1日
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.privacy {
  max-width: 900px;
  margin: 0 auto;
}

.privacy-container {
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

ul {
  list-style: disc;
  padding-left: 30px;
  margin-bottom: 10px;
}

ul li {
  font-size: 15px;
  line-height: 1.8;
  color: #666;
  margin-bottom: 5px;
}

.update-time {
  text-align: right;
  color: #999;
  font-size: 14px;
  margin-top: 30px;
}
</style>
