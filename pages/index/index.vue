<template>
  <view class="container">
    <view class="title">环境监测系统</view>

    <!-- Main Panel -->
    <view class="panel">
      <!-- Header -->
      <view class="panel-header">
        <text class="panel-title">环境监测面板</text>
        <view class="status-container">
          <text class="status-label">Status:</text>
          <view v-if="alarmActive" class="status-alert">
            <text class="icon-text">⚠️</text>
            <text>警告</text>
          </view>
          <view v-else class="status-normal">
            <view class="status-dot"></view>
            <text>正常</text>
          </view>
        </view>
      </view>

      <!-- Tabs -->
      <view class="panel-content">
        <view class="tabs">
          <view class="tab-buttons">
            <view
              v-for="(tab, index) in tabs"
              :key="index"
              @click="switchTab(tab.value)"
              :class="[
                'tab-button',
                activeTab === tab.value ? 'tab-active' : '',
              ]"
            >
              <text class="tab-text">{{ tab.label }}</text>
            </view>
          </view>
        </view>

        <!-- Sensors Tab -->
        <view v-if="activeTab === 'sensors'" class="tab-content">
          <!-- Temperature & Humidity -->
          <view class="sensor-grid">
            <!-- Weather -->
            <view
              class="weather-card"
              :class="wp_code === '00' ? 'sunny' : 'cloudy'"
            >
              <view class="sensor-header">
                <text class="icon-text">{{ weatherIcon }}</text>
                <text class="sensor-title">户外天气</text>
              </view>
              <view class="weather-content">
                <text class="weather-temp">{{ wea_temperature }}°C</text>
                <text class="weather-desc">{{ weatherDescription }}</text>
              </view>
            </view>
            <view class="sensor-container">
              <!-- Temperature -->
              <view class="sensor-card sensor-left">
                <view class="sensor-header">
                  <text class="icon-text temp-icon">🌡️</text>
                  <text class="sensor-title">温度</text>
                </view>
                <text class="sensor-value">{{ temperature }}°C</text>
              </view>
              <!-- Humidity -->
              <view class="sensor-card sensor-right">
                <view class="sensor-header">
                  <text class="icon-text humidity-icon">💧</text>
                  <text class="sensor-title">湿度</text>
                </view>
                <text class="sensor-value">{{ humidity }}%</text>
              </view>
            </view>

            <!-- Fire -->
            <view class="sensor-card">
              <view class="sensor-header">
                <text class="icon-text temp-icon">🔥</text>
                <text class="sensor-title">火灾预警</text>
                <text
                  :class="`fire-modify status-text ${fireStatus.cssClass}`"
                  >{{ fireStatus.status }}</text
                >
              </view>
            </view>
          </view>

          <!-- Gas Sensor -->
          <view class="sensor-card">
            <view class="sensor-header">
              <text class="icon-text gas-icon">⚠️</text>
              <text class="sensor-title">有害气体浓度 (CO/VOC)</text>
            </view>
            <view class="sensor-status">
              <text class="sensor-value">{{ gasLevel }} ppm</text>
              <text :class="`status-text ${gasStatus.cssClass}`">{{
                gasStatus.status
              }}</text>
            </view>
            <text class="sensor-accuracy">范围: 0-1000ppm</text>
            <view class="progress-bar">
              <view
                :class="`progress-fill ${
                  gasLevel < 400
                    ? 'gas-safe'
                    : gasLevel < 700
                    ? 'gas-warning'
                    : 'gas-danger'
                }`"
                :style="{ width: `${(gasLevel / 1000) * 100}%` }"
              ></view>
            </view>
          </view>
        </view>

        <!-- Controls Tab -->
        <view v-if="activeTab === 'controls'" class="tab-content">
          <!-- Fan Control -->
          <view class="control-card">
            <view class="control-header">
              <text class="icon-text fan-icon">🌀</text>
              <text class="control-title">风扇控制</text>
            </view>
            <view class="control-status">
              <text>转速档位: {{ fanSpeed }} </text>
              <text :class="fanSpeed > 0 ? 'status-active' : 'status-inactive'">
                {{ fanSpeed > 0 ? "Active" : "Inactive" }}
              </text>
            </view>
            <text class="control-range">范围: 0-3 档</text>

            <view class="control-header">
              <text
                class="icon-text"
                :class="alarmMode > 0 ? 'alarm-on-icon' : 'alarm-off-icon'"
              >
                {{ alarmMode > 0 ? "🔊" : "🔇" }}
              </text>
              <text class="control-title">蜂鸣器警报</text>
            </view>
            <view class="control-status">
              <text>模式: {{ alarmModes[alarmMode] }}</text>
              <text :class="alarmMode > 0 ? 'status-alarm' : 'status-inactive'">
                {{ alarmMode > 0 ? "注意" : "安静" }}
              </text>
            </view>

            <slider
              :value="fanSpeed"
              @change="onFanSliderChange"
              :min="0"
              :max="3"
              :step="1"
              class="slider"
              activeColor="#3b82f6"
              backgroundColor="#e5e7eb"
              block-size="24"
              show-value
            />
            <view class="preset-buttons">
              <view
                v-for="(preset, index) in fanPresets"
                :key="index"
                @click="fanSpeed = preset.value"
                class="preset-button"
              >
                <text>{{ preset.label }}</text>
              </view>
            </view>
            <view @click="handleTest" :class="['test-button']">
              <text>测试</text>
            </view>
          </view>
        </view>

        <!-- AI Tab -->
        <view v-if="activeTab === 'ai'" class="tab-content">
          <!-- 1 版 ui 设计-->
          <!-- <view class="ai-header">
            <text class="icon-text ai-icon">🤖</text>
            <text class="ai-title">气象小笨蛋</text>
          </view>
          <view class="typing-container">
            <view class="typing-effect">
              你好，我是气象小笨蛋，问我些气象问题吧！
            </view>
          </view>
          <view class="ai-responses">
            <text class="ai-text">
              你好！我是气象小笨蛋，我可以回答一些气象相关的问题。
            </text>
          </view>
          <view class="ai-questions">
            <input type="text" placeholder="请输入你的问题" />
            <button @click="handleChat">发送</button>
          </view> -->

          <!-- 2 版 嵌入式 iframe -->
          <!-- <view class="mobile-frame">
              <iframe
                src="http://154.39.79.242:8080/ui/chat/bb5f952bff8a54e1"
                style="width: 100%; height: 100%"
                frameborder="0"
                allow="microphone"
              >
              </iframe>
            </view> -->

          <!-- 3 调用对话 API -->
          <view class="ai-header">
            <text class="icon-text ai-icon">🤖</text>
            <text class="ai-title">气象小笨蛋</text>
            <text v-if="isStreaming" class="stream-status">接收中...</text>
          </view>

          <!-- 错误提示 -->
          <view v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </view>

          <!-- 动态响应区域 -->
          <scroll-view
            class="ai-responses"
            scroll-y
            :scroll-into-view="'lastMsg'"
            scroll-with-animation
          >
            <text class="ai-text">
              {{ reaContent }}
              <text v-if="isStreaming" class="typing-cursor">|</text>
            </text>

            <view id="lastMsg"></view>
          </scroll-view>
          <view class="ai-reply">
            <text class="ai-text">
              {{ replyContent }}
            </text>
          </view>

          <!-- 输入区域 -->
          <view class="ai-questions">
            <!-- 语音输入按钮 -->
            <button
              @click="toggleRecording"
              :class="['record-button', isRecording ? 'recording' : '']"
              title="语音输入"
            >
              {{ isRecording ? "🛑" : "🎙️" }}
            </button>

            <input
              type="text"
              placeholder="请输入你的问题"
              :disabled="isStreaming"
              v-model="userMessage"
              @keyup.enter="handleChat"
            />
            <button
              @click="handleChat"
              :disabled="isStreaming || !userMessage.trim()"
              :class="{ loading: isStreaming }"
            >
              {{ isStreaming ? "传输中..." : "发送" }}
            </button>
          </view>
        </view>

        <!-- Personal Tab -->
        <view v-if="activeTab === 'display'" class="tab-content">
          <view class="user-center-card">
            <!-- 用户头像 -->
            <view class="avatar-container">
              <image
                class="avatar"
                src="../../static/UserImg.jpg"
                mode="aspectFill"
              />
            </view>

            <!-- 用户信息 -->
            <view class="user-info">
              <text class="username">{{ uname }}</text>
            </view>

            <!-- 功能列表 -->
            <view class="function-list">
              <view class="list-item" @click="showPasswordDialog = true">
                <text class="item-icon">🔒</text>
                <text class="item-text">修改密码</text>
                <text class="item-arrow">›</text>
              </view>
              <view class="list-item" @click="showAbout">
                <text class="item-icon">ℹ️</text>
                <text class="item-text">关于我们</text>
                <text class="item-arrow">›</text>
              </view>
              <view class="list-item" @click="handleLogout">
                <text class="item-icon">🚪</text>
                <text class="item-text">退出登录</text>
                <text class="item-arrow">›</text>
              </view>
            </view>
          </view>
        </view>
        <!-- 修改密码对话框 -->
        <view v-if="showPasswordDialog" class="password-dialog">
          <view class="dialog-content">
            <text class="dialog-title">修改密码</text>
            <input type="password" placeholder="原密码" v-model="oldPassword" />
            <input type="password" placeholder="新密码" v-model="newPassword" />
            <input
              type="password"
              placeholder="确认新密码"
              v-model="confirmPassword"
            />

            <view class="dialog-buttons">
              <button @click="handleChangePassword" class="confirm-btn">
                确认
              </button>
              <button @click="showPasswordDialog = false" class="cancel-btn">
                取消
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 语音识别状态
      isRecording: false,
      recognition: null,
      searchText: "",
      finalTranscript: "",
      interimTranscript: "",
      currentLang: "zh-CN",
      synth: window.speechSynthesis,
      voices: [],
      isSpeechSupported:
        "webkitSpeechRecognition" in window && window.speechSynthesis,
      audioStream: null,
      mediaRecorder: null,
      audioChunks: [],

      // Tab configuration
      tabs: [
        { label: "主页", value: "sensors" },
        { label: "设备管理", value: "controls" },
        { label: "气象AI", value: "ai" },
        { label: "我的", value: "display" },
      ],
      activeTab: "sensors",

      // Weather data
      wp_code: "00",
      weatherDescription: "晴",
      weatherIcon: "☀️",
      wea_temperature: "25",

      // Sensor data
      temperature: 0,
      humidity: 0,
      gasLevel: 0,
      fanSpeed: 0,
      alarmMode: 0,
      alarmActive: false,
      fire_level: 0,

      // Fan presets
      fanPresets: [
        { label: "关闭", value: 0 },
        { label: "低档", value: 1 },
        { label: "中档", value: 2 },
        { label: "高档", value: 3 },
      ],

      // Alarm sound effect modes
      alarmModes: ["Off", "On"],
      baseUrl: "/api",
      // AI chat
      chatHistory: [],
      replyContent: "", // 存储AI回复内容
      reaContent: "", // 存储AI思考内容
      isStreaming: false, // 流式传输状态
      errorMessage: "", // 错误信息
      userMessage: "", // 用户输入的消息
      chatApi: "/chatapi", // 对话API地址

      // 用户数据
      showPasswordDialog: false,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      showAboutDialog: false,
    };
  },
  computed: {
    // Gas level status
    gasStatus() {
      if (this.gasLevel < 800)
        return { status: "Safe", cssClass: "status-safe" };
      if (this.gasLevel < 1000)
        return { status: "Normal", cssClass: "status-normal" };
      if (this.gasLevel < 1500)
        return { status: "Elevated", cssClass: "status-elevated" };
      return { status: "Danger", cssClass: "status-danger" };
    },
    fireStatus() {
      if (this.fireLevel == 1)
        return { status: "Danger", cssClass: "status-danger" };
      return { status: "Safe", cssClass: "status-safe" };
    },
    uname() {
      return uni.getStorageSync("uname") || "未登录"; // 实时获取Storage
    },
  },
  methods: {
    // 录音控制
    async toggleRecording() {
      if (this.isRecording) {
        await this.stopRecording();
      } else {
        await this.startRecording();
      }
    },

    // 开始录音
    async startRecording() {
      if (!this.isSpeechSupported) {
        this.errorMessage = "当前浏览器不支持语音识别功能";
        return;
      }

      try {
        // 创建语法规则
        const grammar =
          "#JSGF V1.0; grammar commands; public <command> = 温度 | 湿度 | 风速 | 降水 | 刷新 | 切换语言 ;";
        const speechGrammarList = new (window.webkitSpeechGrammarList ||
          window.SpeechGrammarList)();
        speechGrammarList.addFromString(grammar, 1);

        this.recognition = new webkitSpeechRecognition();
        this.recognition.grammars = speechGrammarList;
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.currentLang;
        this.recognition.maxAlternatives = 3;

        this.recognition.onstart = () => {
          this.isRecording = true;
          this.finalTranscript = "";
          this.interimTranscript = "";
        };

        // 初始化语音合成
        this.synth.onvoiceschanged = () => {
          this.voices = this.synth.getVoices();
        };

        // 语言切换方法
        this.switchLanguage = (lang) => {
          this.currentLang = lang;
          this.recognition.lang = lang;
          this.$forceUpdate();
        };

        this.recognition.onresult = (event) => {
          const command = event.results[0][0].transcript;
          this.handleVoiceCommand(command);
          // 添加语音反馈
          const utterance = new SpeechSynthesisUtterance(`已执行 ${command}`);
          utterance.voice = this.voices.find(
            (v) => v.lang === this.currentLang
          );
          this.synth.speak(utterance);

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              this.finalTranscript += event.results[i][0].transcript;
              this.userMessage = this.finalTranscript;
            } else {
              this.interimTranscript = event.results[i][0].transcript;
              this.userMessage = this.interimTranscript;
            }
          }
        };

        this.recognition.onerror = (event) => {
          this.errorMessage = `语音识别错误: ${event.error}`;
          this.stopRecording();
        };

        this.recognition.start();

        // 获取麦克风权限
        this.audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      } catch (error) {
        this.errorMessage = `麦克风访问失败: ${error.message}`;
        this.stopRecording();
      }
    },

    // 停止录音
    async stopRecording() {
      if (this.recognition) {
        this.recognition.stop();
        this.recognition = null;
      }
      if (this.audioStream) {
        this.audioStream.getTracks().forEach((track) => track.stop());
        this.audioStream = null;
      }
      this.isRecording = false;
      this.userMessage = this.finalTranscript;
    },

    // Fix for tab switching
    switchTab(tabValue) {
      this.activeTab = tabValue;
    },
    onFanSliderChange(e) {
      this.fanSpeed = e.detail.value;
    },
    async handleTest() {
      this.alarmMode = this.fanSpeed === 0 ? 0 : 1;
      try {
        let Url = this.baseUrl + "/api/devices/control-devices";
        const response = await fetch(Url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            speed: this.fanSpeed,
          }),
        });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
      } catch (error) {
        this.errorMessage = `请求失败: ${error.message}`;
      }
    },
    // 修改后的handleChat方法
    async handleChat() {
      try {
        let Url = this.chatApi + "/api/application/chat_message/65ebd480-19bc-11f0-8561-0242ac110002";
        if (!this.userMessage.trim()) {
          this.errorMessage = "请输入有效问题";
          return;
        }
        this.isStreaming = true;
        this.replyContent = "";
        this.reaContent = "";

        const response = await fetch(
          Url,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "application-4eda6827510e8707027d68489902b172",
              Accept: "application/json",
            },
            body: JSON.stringify({
              message: this.userMessage, // 发送用户输入的消息
              stream: true,
            }),
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunks = decoder
            .decode(value)
            .split("\n\n")
            .filter((chunk) => chunk.startsWith("data: "));

          chunks.forEach((chunk) => {
            try {
              const jsonStr = chunk.replace("data: ", "");
              const data = JSON.parse(jsonStr);

              if (data.reasoning_content) {
                this.reaContent += this.unicodeToChs(data.reasoning_content);
              }

              if (data.content) {
                this.replyContent += this.unicodeToChs(data.content);
              }
              if (this.replyContent == "##HARDWARE_MODIFY_TO_0##") {
                this.fanSpeed = 0;
                this.alarmMode = 0;
                this.replyContent = "已传输并执行指令";
                this.handleTest();
              } else if (this.replyContent == "##HARDWARE_MODIFY_TO_1##") {
                this.fanSpeed = 1;
                this.alarmMode = 1;
                this.replyContent = "已传输并执行指令";
                this.handleTest();
              } else if (this.replyContent == "##HARDWARE_MODIFY_TO_2##") {
                this.fanSpeed = 2;
                this.alarmMode = 1;
                this.replyContent = "已传输并执行指令";
                this.handleTest();
              } else if (this.replyContent == "##HARDWARE_MODIFY_TO_3##") {
                this.fanSpeed = 3;
                this.alarmMode = 1;
                this.replyContent = "已传输并执行指令";
                this.handleTest();
              }
            } catch (e) {
              console.warn("数据解析异常:", e);
            }
          });
        }
        this.userMessage = "";
      } catch (error) {
        this.errorMessage = `请求失败: ${error.message}`;
      } finally {
        this.isStreaming = false;
      }
    },

    // 数据获取
    async fetchSensorData() {
      let Url = this.baseUrl + "/dataselect";
      try {
        const response = await fetch(Url, {
          headers: {
            Authorization: uni.getStorageSync("token"),
          },
        });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const sensorData = data[0] || {};
        this.temperature = parseFloat((sensorData.temp || 0).toFixed(1)); // temp → temperature
        this.humidity = parseFloat((sensorData.hum || 0).toFixed(1));
        this.gasLevel = parseFloat((sensorData.gas || 0).toFixed(1));
        this.fanSpeed = sensorData.fan_level || 0; // fan_level → fanSpeed
        this.fireLevel = sensorData.fire_state || 0; // fire_state → fireLevel
        this.alarmActive = sensorData.final_stat === 1; // final_stat → alarmActive
        this.alarmMode = this.alarmActive ? 1 : 0; // 根据 alarmActive 同步 alarmMode
      } catch (error) {
        console.error("传感器数据获取失败:", error);
      }
    },

    // 天气方法
    async fetchWeatherData() {
      try {
        const response = await fetch(
          "https://api.open.geovisearth.com/v2/cn/area/basic?token=db2ed5ebf3c2e774be86874508811472&location=WTX_CH101040800"
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        this.weatherDescription = data.result.wp;
        this.wp_code = data.result.wp_code;
        this.wea_temperature = data.result.tem;
      } catch (error) {
        console.error("天气数据获取失败:", error);
      }
    },

    // Unicode转中文工具方法
    unicodeToChs(str) {
      return str.replace(/\\u([\d\w]{4})/gi, function (match, grp) {
        return String.fromCharCode(parseInt(grp, 16));
      });
    },

    handleVoiceCommand(command) {
      console.log("语音识别结果:", command);
      this.searchText = command;
      this.$nextTick(() => {
        console.log("当前输入框值:", this.searchText);
      });
    },

    async handleChangePassword() {
      if (this.newPassword !== this.confirmPassword) {
        uni.showToast({ title: "新密码不一致", icon: "none" });
        return;
      }

      try {
        let Url = this.baseUrl + "/user/password";
        const response = await fetch(Url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: uni.getStorageSync("token"),
          },
          body: JSON.stringify({
            uname: uni.getStorageSync("uname"),
            oldPassword: this.oldPassword.trim(),
            newPassword: this.newPassword.trim(),
          }),
        });

        const data = await response.json();
        console.log("[DEBUG] 修改密码响应:", data);

        if (!response.ok) {
          throw new Error(data.msg || `请求失败: ${response.status}`);
        }

        if (data.code === 403) {
          throw new Error(data.msg || "验证失败：请检查用户名和旧密码");
        }

        if (data.code !== 203) {
          throw new Error(data.msg || "未知错误");
        }

        uni.showToast({ title: "密码修改成功" });
        // 清除存储并跳转
        uni.removeStorageSync("token");
        uni.removeStorageSync("uname");
        uni.reLaunch({ url: "/pages/login/login" });
      } catch (error) {
        console.error("[ERROR] 密码修改失败:", error);
        uni.showToast({
          title: error.message.includes("网络")
            ? "服务器连接异常"
            : error.message,
          icon: "none",
        });
      }
    },
    // 添加关于我们弹窗方法
    showAbout() {
      uni.showModal({
        title: "关于我们",
        content: "环境监测气象站系统\n版本: 1.0.0\n开发团队: 气象监测组",
        showCancel: false,
      });
    },

    handleLogout() {
      uni.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            // 这里添加实际退出逻辑
            uni.reLaunch({ url: "/pages/login/login" });
          }
        },
      });
    },
  },
  // 在 mounted 中启动定时器
  mounted() {
    this.fetchWeatherData();
    this.fetchSensorData(); // 立即获取一次数据
    this.timer = setInterval(() => {
      this.fetchSensorData();
    }, 2000); // 每5秒轮询
  },

  // 在组件销毁前清除定时器
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
};
</script>

<style>
/* 语音输入按钮样式 */
.record-button {
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  padding: 8px;
  width: 44px;
  height: 44px;
  font-size: 28px;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;

  &.recording {
    background: #ef4444;
    animation: pulse 1s infinite;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.ai-questions {
  gap: 8px;

  button {
    flex-shrink: 0;
  }
}

/* 新增样式 */
.stream-status {
  font-size: 12px;
  color: #3b82f6;
  margin-left: 10px;
  animation: pulse 1s infinite;
}

.error-message {
  color: #ef4444;
  padding: 8px;
  border: 1px solid #fecaca;
  border-radius: 4px;
  margin: 10px 0;
  background: #fef2f2;
}

.typing-cursor {
  color: #3b82f6;
  animation: blink 1s step-end infinite;
}

.loading {
  background: #94a3b8 !important;
  cursor: not-allowed;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.mobile-frame {
  position: relative;
  width: 100%;
  padding-top: 177.78%;
  /* 9:16比例 (9/16=56.25%) */
  max-width: 375px;
  /* 移动端标准宽度 */
  margin: 0 auto;
  /* 水平居中 */
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  /* 模拟手机边框 */
  border-radius: 20px;
}

.mobile-frame iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: top left;
  transform: scale(1);
  /* 可调整缩放比例 */
}

/* Try Anime Styles */
.typing-container {
  font-family: "Courier New", monospace;
  margin: 2rem auto;
  margin-bottom: 1rem;
  position: relative;
  width: fit-content;
  max-width: 100%;
}

.typing-effect {
  /* 修正动画参数与显示方式 */
  display: inline-block;
  font-size: 16px;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  border-right: 2px solid #3b82f6;
  animation: typing 3s steps(30, end) forwards,
    /* 调整steps值与动画填充模式 */ blink-caret 0.8s step-end infinite;
}

@keyframes typing {
  from {
    width: 0;
  }

  to {
    width: 100%;
  }

  /* 保持最终状态可见 */
}

@keyframes blink-caret {
  from,
  to {
    border-color: transparent;
  }

  50% {
    border-color: #2c3e50;
  }
}

/* 增加移动端响应式适配 */
@media (max-width: 480px) {
  .typing-effect {
    font-size: 14px;
    animation: typing 2.5s steps(25, end) forwards,
      blink-caret 0.8s step-end infinite;
  }
}

/* General Styles */
.container {
  padding: 20px;
  max-width: 768px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 100vh;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #1e293b;
  text-align: center;
}

/* Panel Styles */
.panel {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  overflow: hidden;
}

.panel-header {
  background-color: #1e40af;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-weight: 600;
  font-size: 18px;
}

.panel-content {
  padding: 20px;
}

/* Status Styles */
.status-container {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
}

.status-label {
  font-size: 14px;
  margin-right: 8px;
  opacity: 0.9;
}

.status-alert {
  display: flex;
  align-items: center;
  color: #fecaca;
}

.status-normal {
  display: flex;
  align-items: center;
  color: #86efac;
}

.status-dot {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background-color: #4ade80;
  margin-right: 6px;
  box-shadow: 0 0 8px #4ade80;
}

/* Tab Styles */
.ai-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.ai-title {
  font-weight: 600;
  color: #334155;
  font-size: 16px;
}

.ai-questions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.ai-questions input {
  padding: 10px;
  /* 增加内边距 */
  border-bottom: 1px dashed #95a5a6;
  width: 70%;
  border-image: linear-gradient(to right, #3498db, #e74c3c);
  border-image-slice: 1;
  border-width: 0 0 2px 0;
  transition: all 0.3s;
}

.ai-questions input::placeholder {
  color: #999;
  /* 灰色占位符 */
  font-weight: 300;
  /* 细体 */
  font-size: 14px;
  /* 适当字号 */
}

/* 聚焦状态优化 */
.ai-questions input:focus::placeholder {
  opacity: 0.6;
  /* 聚焦时透明度变化 */
  transition: opacity 0.3s ease;
}

.ai-questions button {
  border-radius: 22px;
  /* 常规圆角 */
  padding: 0.3rem 1rem;
  font-size: 0.6rem;
  font-weight: 700;
  white-space: nowrap;
  /* 防止文字折行 */
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
}

.ai-questions button:active {
  background: #93c5fd;
  /* 淡蓝色 */
  transform: scale(0.98);
  /* 按压效果 */
}

.ai-responses {
  width: 90%;
  height: 200px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  line-height: 1.6;
  white-space: pre-wrap;
  /* 保留换行 */
}

.ai-text {
  font-size: 14px;
  font-weight: 300;
  /* 细体 */
  color: #334155;
}

.ai-reply {
  width: 90%;
  padding: 15px;
}

.tabs {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.tab-buttons {
  display: flex;
  background-color: #f8fafc;
}

.tab-button {
  flex: 1;
  padding: 12px 8px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab-text {
  font-weight: 600;
  font-size: 15px;
  color: #64748b;
}

.tab-active {
  background-color: #ffffff;
  border-bottom: 3px solid #3b82f6;
}

.tab-active .tab-text {
  color: #3b82f6;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Sensor Styles */
.sensor-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

@media (min-width: 768px) {
  .sensor-grid {
    flex-direction: row;
  }

  .sensor-grid > .sensor-card {
    flex: 1;
  }
}

.sensor-card,
.weather-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 15px;
  background-color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.weather-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.weather-card.sunny {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
}

.weather-card.cloudy {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.weather-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.weather-temp {
  font-size: 38px;
  font-weight: bold;
  color: #1e293b;
}

.weather-desc {
  font-size: 14px;
  color: #475569;
  margin-top: 4px;
}

.sensor-card:active {
  transform: translateY(2px);
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05);
}

.sensor-container {
  display: flex;
  flex-direction: row;
  /* 改为横向排列 */
  gap: 15px;
  width: 100%;
  /* 确保占满父容器 */
}

.sensor-left,
.sensor-right {
  flex: 1;
  min-width: 0;
}

.sensor-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.sensor-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sensor-status-container {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  /* 确保状态靠右对齐 */
}

.sensor-title {
  font-weight: 600;
  color: #334155;
  font-size: 16px;
}

.sensor-value {
  font-size: 25px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 4px;
}

.sensor-accuracy {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.fire-modify {
  display: flex;
  position: relative;
  left: 53%;
}

.sensor-status {
  display: flex;
  justify-content: space-between;
  align-items: right;
}

/* Progress Bar Styles */
.progress-bar {
  height: 10px;
  background-color: #f1f5f9;
  border-radius: 9999px;
  margin-top: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.5s ease;
}

.temp-gradient {
  background: linear-gradient(to right, #3b82f6, #ef4444);
}

.humidity-fill {
  background-color: #3b82f6;
}

.gas-safe {
  background-color: #22c55e;
}

.gas-warning {
  background-color: #eab308;
}

.gas-danger {
  background-color: #ef4444;
}

/* Control Styles */
.control-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.control-header {
  display: flex;
  align-items: center;
  margin-top: 1rem;
  margin-bottom: 12px;
}

.control-title {
  font-weight: 600;
  color: #334155;
  font-size: 16px;
}

.control-status {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 15px;
  color: #475569;
}

.control-range {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.slider {
  width: 100%;
  margin: 20px 0;
  height: 40px;
}

.preset-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 1.5rem;
}

.preset-button {
  flex: 1;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  text-align: center;
  transition: all 0.2s ease;
}

.preset-button:active {
  background-color: #e2e8f0;
  transform: translateY(1px);
}

.alarm-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 8px;
}

.mode-button {
  flex: 1;
  padding: 10px 8px;
  font-size: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  text-align: center;
  transition: all 0.2s ease;
}

.mode-button:active {
  background-color: #e2e8f0;
  transform: translateY(1px);
}

.mode-active {
  background-color: #1e40af;
  color: white;
  border: none;
}

.test-button {
  width: 90%;
  padding: 12px;
  font-size: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  text-align: center;
  transition: all 0.2s ease;
}

.test-button:active {
  background-color: #e2e8f0;
  transform: translateY(1px);
}

.alarm-active {
  background-color: #ef4444;
  color: white;
  border: none;
}

/* Display Styles */
.display-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.display-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.display-title {
  font-weight: 600;
  color: #334155;
  font-size: 16px;
}

.oled-display {
  background-color: black;
  color: #4ade80;
  font-family: monospace;
  padding: 20px;
  border-radius: 10px;
  height: 280px;
  display: flex;
  flex-direction: column;
  box-shadow: inset 0 0 10px rgba(0, 255, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.2);
}

.oled-header {
  text-align: center;
  border-bottom: 1px solid #22c55e;
  padding-bottom: 8px;
  margin-bottom: 12px;
  font-weight: bold;
  letter-spacing: 1px;
}

.oled-grid {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  gap: 20px;
}

.oled-column {
  flex: 1;
}

.oled-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.oled-progress {
  width: 100%;
  background-color: #064e3b;
  height: 4px;
  margin-top: 4px;
  margin-bottom: 12px;
  border-radius: 2px;
  overflow: hidden;
}

.oled-progress-fill {
  height: 100%;
  background-color: #22c55e;
  transition: width 0.5s ease;
}

.oled-status {
  margin-top: 12px;
  font-size: 12px;
}

.oled-footer {
  margin-top: auto;
  text-align: center;
  font-size: 12px;
  border-top: 1px solid #22c55e;
  padding-top: 8px;
  letter-spacing: 0.5px;
}

.oled-alert {
  color: #f87171;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

/* Icon Styles */
.icon-text {
  font-size: 20px;
  margin-right: 10px;
}

.temp-icon {
  color: #ef4444;
}

.humidity-icon {
  color: #3b82f6;
}

.gas-icon {
  color: #eab308;
}

.fan-icon {
  color: #6b7280;
}

.display-icon {
  color: #3b82f6;
}

.alarm-on-icon {
  color: #ef4444;
}

.alarm-off-icon {
  color: #6b7280;
}

/* Status Text Colors */
.status-text {
  font-weight: 600;
}

.status-safe {
  color: #22c55e;
}

.status-normal {
  color: #3b82f6;
}

.status-elevated {
  color: #eab308;
}

.status-high {
  color: #f97316;
}

.status-danger {
  color: #ef4444;
}

.status-active {
  color: #22c55e;
  font-weight: 600;
}

.status-inactive {
  color: #94a3b8;
}

.status-alarm {
  color: #ef4444;
  font-weight: 600;
}

.user-center-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #3b82f6;
}

.username {
  font-size: 20px;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 15px;
  display: block;
  text-align: center;
}

.function-list {
  margin-top: 20px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.item-icon {
  font-size: 20px;
  margin-right: 10px;
}

.item-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.item-arrow {
  font-size: 24px;
  color: #999;
}

/* 密码对话框样式 */
.password-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  display: block;
}

.dialog-content input {
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.confirm-btn {
  background: #3b82f6;
  color: white;
  margin-left: 10px;
  padding: 8px 20px;
}

.cancel-btn {
  background: #eee;
  color: #666;
  padding: 8px 20px;
}
</style>
