<template>
  <view class="container">
    <view class="auth-card">
      <!-- Logo/Header -->
      <view class="auth-header">
        <text class="logo-text">{{ isLogin ? "登录账户" : "创建账户" }}</text>
        <text class="logo-subtext">环境监测系统</text>
      </view>

      <!-- Login Form -->
      <view v-if="isLogin" class="auth-form">
        <view class="input-group">
          <text class="input-label">用户名/邮箱</text>
          <input
            class="input-field"
            type="text"
            v-model="loginForm.uname"
            placeholder="请输入用户名"
          />
        </view>

        <view class="input-group">
          <text class="input-label">密码</text>
          <view class="password-input">
            <input
              class="input-field"
              :type="showLoginPassword ? 'text' : 'password'"
              v-model="loginForm.password"
              placeholder="请输入密码"
            />
            <text
              class="password-toggle"
              @click="showLoginPassword = !showLoginPassword"
            >
              {{ showLoginPassword ? "👁️" : "👁️‍🗨️" }}
            </text>
          </view>
        </view>

        <view class="forgot-password">
          <text class="forgot-text" @click="forgotPassword">忘记密码?</text>
        </view>

        <view
          class="auth-button"
          @click="handleLogin"
          :class="{ disabled: isLoading }"
        >
          <text class="auth-button-text">{{
            isLoading ? "处理中..." : "登录"
          }}</text>
        </view>

        <view class="switch-form">
          <text class="switch-text">还没有账户? </text>
          <text class="switch-link" @click="toggleForm">立即注册</text>
        </view>
      </view>

      <!-- Register Form -->
      <view v-else class="auth-form">
        <view class="input-group">
          <text class="input-label">用户名</text>
          <input
            class="input-field"
            type="text"
            v-model="registerForm.uname"
            placeholder="请输入用户名"
          />
          <text v-if="errors.uname" class="error-text">{{ errors.uname }}</text>
        </view>

        <view class="input-group">
          <text class="input-label">密码</text>
          <view class="password-input">
            <input
              class="input-field"
              :type="showRegisterPassword ? 'text' : 'password'"
              v-model="registerForm.password"
              placeholder="请输入密码"
            />
            <text
              class="password-toggle"
              @click="showRegisterPassword = !showRegisterPassword"
            >
              {{ showRegisterPassword ? "👁️" : "👁️‍🗨️" }}
            </text>
          </view>
          <text v-if="errors.password" class="error-text">{{
            errors.password
          }}</text>
        </view>

        <view class="input-group">
          <text class="input-label">确认密码</text>
          <view class="password-input">
            <input
              class="input-field"
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="registerForm.confirmPassword"
              placeholder="请再次输入密码"
            />
            <text
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? "👁️" : "👁️‍🗨️" }}
            </text>
          </view>
          <text v-if="errors.confirmPassword" class="error-text">{{
            errors.confirmPassword
          }}</text>
        </view>

        <view class="terms-agreement">
          <checkbox
            :checked="registerForm.agreeTerms"
            @click="registerForm.agreeTerms = !registerForm.agreeTerms"
            color="#3b82f6"
          />
          <text class="terms-text">
            我已阅读并同意
            <text class="terms-link" @click="showTerms">服务条款</text>
            和
            <text class="terms-link" @click="showPrivacy">隐私政策</text>
          </text>
        </view>
        <text v-if="errors.agreeTerms" class="error-text">{{
          errors.agreeTerms
        }}</text>

        <view
          class="auth-button"
          @click="handleRegister"
          :class="{ disabled: isLoading }"
        >
          <text class="auth-button-text">{{
            isLoading ? "处理中..." : "注册"
          }}</text>
        </view>

        <view class="switch-form">
          <text class="switch-text">已有账户? </text>
          <text class="switch-link" @click="toggleForm">立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLoading: false,
      isLogin: true,
      showLoginPassword: false,
      showRegisterPassword: false,
      showConfirmPassword: false,
      baseUrl:"http://154.21.200.171:8081/",
      loginForm: {
        uname: "",
        password: "",
      },

      registerForm: {
        uname: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
      },

      errors: {
        uname: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeTerms: "",
      },
    };
  },

  methods: {
    async handleLogin() {
      // 防止重复提交
      if (this.isLoading) return;

      // 保留原有的基础验证
      if (!this.loginForm.uname) {
        uni.showToast({ title: "请输入用户名", icon: "none" });
        return;
      }
      if (!this.loginForm.password) {
        uni.showToast({ title: "请输入密码", icon: "none" });
        return;
      }
      let Url = this.baseUrl + "user/login" + "?uname=" + this.loginForm.uname + "&password=" + this.loginForm.password;
      const response = await fetch(
          Url,
          {
            method: "POST",
          }
        );
        const data = await response.json(); // 解析响应数据
        console.log(data);
        if (data.code == 203) {
          uni.navigateTo({ url: "/pages/index/index" }); // 跳转到首页
        }
        else {
          // 登录失败，显示错误信息
          uni.showToast({ title: data.msg, icon: "none" }); // 假设服务器返回的错误信息字段名为"message" 
        }
    },

    async handleRegister() {
      // 防止重复提交
      if (this.isLoading) return;

      // 保留原有的基础验证
      if (!this.registerForm.uname) {
        uni.showToast({ title: "请输入用户名", icon: "none" });
        return;
      }
      if (!this.registerForm.password) {
        uni.showToast({ title: "请输入密码", icon: "none" });
        return;
      }
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        uni.showToast({ title: "两次输入的密码不一致", icon: "none" });
        return;
      }
      if (!this.registerForm.agreeTerms) {
        uni.showToast({ title: "请同意服务条款和隐私政策", icon: "none" });
        return;
      }

      try {
        this.isLoading = true;
        const response = await http.register({
          uname: this.registerForm.uname,
          password: this.registerForm.password,
          email: this.registerForm.email,
        });
        if ([201, 202, 203].includes(response.code)) {
          uni.showToast({ title: "注册成功", icon: "success" });
          // 注册成功后的操作，如跳转到登录页
          uni.navigateTo({ url: "/pages/login/login" });
        } else if (response.code === 402) {
          uni.showToast({ title: "用户名已存在", icon: "none" });
        } else if (response.code === 400) {
          uni.showToast({ title: "请求参数错误", icon: "none" });
        } else if (response.code === 500) {
          uni.showToast({ title: "服务器内部错误", icon: "none" });
        }
      } catch (error) {
        uni.showToast({ title: "注册失败，请稍后重试", icon: "none" });
      } finally {
        this.isLoading = false;
      }
    },

    toggleForm() {
      this.isLogin = !this.isLogin;
      this.clearErrors();
    },

    clearErrors() {
      this.errors = {
        uname: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeTerms: "",
      };
    },

    validateEmail(email) {
      const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    },

    validateRegisterForm() {
      let isValid = true;
      this.clearErrors();

      if (!this.registerForm.uname || this.registerForm.uname.length < 3) {
        this.errors.uname = "用户名至少需要3个字符";
        isValid = false;
      }

      if (
        !this.registerForm.email ||
        !this.validateEmail(this.registerForm.email)
      ) {
        this.errors.email = "请输入有效的邮箱地址";
        isValid = false;
      }

      if (
        !this.registerForm.password ||
        this.registerForm.password.length < 6
      ) {
        this.errors.password = "密码至少需要6个字符";
        isValid = false;
      }

      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.errors.confirmPassword = "两次输入的密码不一致";
        isValid = false;
      }

      if (!this.registerForm.agreeTerms) {
        this.errors.agreeTerms = "请同意服务条款和隐私政策";
        isValid = false;
      }

      return isValid;
    },


    forgotPassword() {
      uni.showToast({
        title: "密码重置功能即将上线",
        icon: "none",
      });
    },

    showTerms() {
      uni.showModal({
        title: "服务条款",
        content: "这是服务条款内容...",
        showCancel: false,
      });
    },

    showPrivacy() {
      uni.showModal({
        title: "隐私政策",
        content: "这是隐私政策内容...",
        showCancel: false,
      });
    },
  },
};
</script>

<style>
.disabled {
  opacity: 0.7;
  pointer-events: none;
}

.container {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 30px;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-text {
  font-size: 28px;
  font-weight: bold;
  color: #1e40af;
  margin-bottom: 8px;
  display: block;
}

.logo-subtext {
  font-size: 16px;
  color: #64748b;
  display: block;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.input-field {
  height: 48px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 16px;
  font-size: 16px;
  background-color: #f8fafc;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 16px;
  font-size: 20px;
  color: #64748b;
  z-index: 1;
}

.forgot-password {
  display: flex;
  justify-content: flex-end;
  margin-top: -10px;
}

.forgot-text {
  font-size: 14px;
  color: #3b82f6;
}

.auth-button {
  height: 50px;
  background-color: #1e40af;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s ease;
  margin-top: 10px;
}

.auth-button:active {
  background-color: #1e3a8a;
  transform: translateY(1px);
}

.auth-button-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}

.social-login {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.social-text {
  font-size: 14px;
  color: #64748b;
  position: relative;
}

.social-text::before,
.social-text::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 60px;
  height: 1px;
  background-color: #e2e8f0;
}

.social-text::before {
  left: -70px;
}

.social-text::after {
  right: -70px;
}

.social-icons {
  display: flex;
  gap: 20px;
}

.social-icon {
  width: 80px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s ease;
}

.social-icon:active {
  transform: scale(0.95);
}

.social-icon-text {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.wechat {
  background-color: #07c160;
}

.qq {
  background-color: #12b7f5;
}

.weibo {
  background-color: #e6162d;
}

.switch-form {
  margin-top: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
}

.switch-text {
  font-size: 14px;
  color: #64748b;
}

.switch-link {
  font-size: 14px;
  color: #3b82f6;
  font-weight: 600;
  margin-left: 4px;
}

.terms-agreement {
  display: flex;
  align-items: center;
  gap: 8px;
}

.terms-text {
  font-size: 14px;
  color: #64748b;
}

.terms-link {
  color: #3b82f6;
}

.error-text {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

/* 动画效果 */
.auth-form {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
