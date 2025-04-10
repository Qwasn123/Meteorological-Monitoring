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
            <!-- Temperature -->
            <view class="sensor-card">
              <view class="sensor-header">
                <text class="icon-text temp-icon">🌡️</text>
                <text class="sensor-title">温度</text>
              </view>
              <text class="sensor-value">{{ temperature }}°C</text>
              <text class="sensor-accuracy">准确度: ±0.5°C</text>
              <view class="progress-bar">
                <view
                  class="progress-fill temp-gradient"
                  :style="{ width: `${(temperature / 50) * 100}%` }"
                ></view>
              </view>
            </view>
            <!-- Humidity -->
            <view class="sensor-card">
              <view class="sensor-header">
                <text class="icon-text humidity-icon">💧</text>
                <text class="sensor-title">湿度</text>
              </view>
              <text class="sensor-value">{{ humidity }}%</text>
              <text class="sensor-accuracy">准确度: ±3%RH</text>
              <view class="progress-bar">
                <view
                  class="progress-fill humidity-fill"
                  :style="{ width: `${humidity}%` }"
                ></view>
              </view>
            </view>
            <!-- Fire -->
            <!-- 修改火灾预警部分的代码 -->
            <view class="sensor-card">
                <view class="sensor-header">
                  <text class="icon-text temp-icon">🔥</text>
                  <text class="sensor-title">火灾预警</text>
                  <text :class="`fire-modify status-text ${fireStatus.cssClass}`">{{
                    fireStatus.status
                  }}</text>
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

        <!-- Display Tab -->
        <view v-if="activeTab === 'display'" class="tab-content">
          <view class="display-card">
            <view class="display-header">
              <text class="icon-text display-icon">📊</text>
              <text class="display-title">OLED 面板</text>
            </view>
            <view class="oled-display">
              <text class="oled-header">环境数据监测</text>

              <view class="oled-grid">
                <view class="oled-column">
                  <view class="oled-row">
                    <text>温度:</text>
                    <text>{{ temperature }}°C</text>
                  </view>
                  <view class="oled-progress">
                    <view
                      class="oled-progress-fill"
                      :style="{ width: `${(temperature / 50) * 100}%` }"
                    ></view>
                  </view>

                  <view class="oled-row">
                    <text>湿度:</text>
                    <text>{{ humidity }}%</text>
                  </view>
                  <view class="oled-progress">
                    <view
                      class="oled-progress-fill"
                      :style="{ width: `${humidity}%` }"
                    ></view>
                  </view>
                </view>

                <view class="oled-column">
                  <view class="oled-row">
                    <text>气体浓度:</text>
                    <text>{{ gasLevel }}ppm</text>
                  </view>
                  <view class="oled-progress">
                    <view
                      class="oled-progress-fill"
                      :style="{ width: `${(gasLevel / 1000) * 100}%` }"
                    ></view>
                  </view>

                  <view class="oled-row">
                    <text>转速档位:</text>
                    <text>{{ fanSpeed }}档</text>
                  </view>
                  <view class="oled-progress">
                    <view
                      class="oled-progress-fill"
                      :style="{ width: `${(fanSpeed / 5000) * 100}%` }"
                    ></view>
                  </view>
                </view>
              </view>

              <view class="oled-status">
                <view class="oled-row">
                  <text>状态:</text>
                  <text :class="alarmActive ? 'oled-alert' : ''">
                    {{ alarmActive ? "警告" : "正常" }}
                  </text>
                </view>
              </view>

              <view class="oled-footer">
                <text :class="alarmActive ? 'oled-alert' : ''">
                  {{
                    alarmActive
                      ? `WARNING: GAS LEVEL ${gasStatus.status.toUpperCase()}`
                      : "SYSTEM OPERATING NORMALLY"
                  }}
                </text>
              </view>
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
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // Tab configuration
      tabs: [
        { label: "主页", value: "sensors" },
        { label: "控制台", value: "controls" },
        { label: "OLED", value: "display" },
        { label: "气象AI", value: "ai" },
      ],
      activeTab: "sensors",

      // Sensor data
      temperature: 0,
      humidity: 0,
      gasLevel: 0,
      fanSpeed: 0,
      alarmMode: 0,
      alarmActive: false,

      // Fan presets
      fanPresets: [
        { label: "关闭", value: 0 },
        { label: "低档", value: 1 },
        { label: "中档", value: 2 },
        { label: "高档", value: 3 },
      ],

      // Alarm sound effect modes
      alarmModes: ["Off", "On"],

      // AI chat history
      chatHistory: [],
      replyContent: "", // 存储AI回复内容
      reaContent: "", // 存储AI思考内容
      isStreaming: false, // 流式传输状态
      errorMessage: "", // 错误信息
      userMessage: "", // 用户输入的消息
    };
  },
  computed: {
    // Gas level status
    gasStatus() {
      if (this.gasLevel < 200)
        return { status: "Safe", cssClass: "status-safe" };
      if (this.gasLevel < 400)
        return { status: "Normal", cssClass: "status-normal" };
      if (this.gasLevel < 600)
        return { status: "Elevated", cssClass: "status-elevated" };
      if (this.gasLevel < 800)
        return { status: "High", cssClass: "status-high" };
      return { status: "Danger", cssClass: "status-danger" };
    },
    fireStatus() {
      if (this.fireLevel == 0)
        return { status: "Safe", cssClass: "status-safe" };
      return { status: "Danger", cssClass: "status-danger" };
    },
  },
  methods: {
    // Fix for tab switching
    switchTab(tabValue) {
      this.activeTab = tabValue;
      console.log("Switched to tab:", tabValue);
    },
    onFanSliderChange(e) {
      this.fanSpeed = e.detail.value;
    },
    async handleTest() {
      this.alarmMode = this.fanSpeed === 0 ? 0 : 1;
      try {
        const response = await fetch(
          "http://154.21.200.171:8081/api/devices/control-devices",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              speed: this.fanSpeed,
            }),
          }
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
      } catch (error) {
        this.errorMessage = `请求失败: ${error.message}`;
      }
    },
    // 修改后的handleChat方法
    async handleChat() {
      try {
        if (!this.userMessage.trim()) {
          this.errorMessage = "请输入有效问题";
          return;
        }
        this.isStreaming = true;
        this.replyContent = "";
        this.reaContent = "";

        const response = await fetch(
          "http://154.39.79.242:8080/api/application/chat_message/681232a0-1367-11f0-92ee-0242ac110002",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              AUTHORIZATION: "application-4eda6827510e8707027d68489902b172",
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
    // 测试方法

    async fetchSensorData() {
      try {
        const response = await fetch("http://154.21.200.171:8081/dataselect");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const sensorData = data[0] || {};
        // 假设接口返回数据结构为 { temperature, humidity, gasLevel, fanSpeed, alarmMode }
        this.temperature = sensorData.temp || 0; // temp → temperature
        this.humidity = sensorData.hum || 0; // hum → humidity
        this.gasLevel = sensorData.gas || 0; // gas → gasLevel
        this.fanSpeed = sensorData.fan_level || 0; // fan_level → fanSpeed
        this.alarmActive = sensorData.final_stat === 1; // final_stat → alarmActive
        this.alarmMode = this.alarmActive ? 1 : 0; // 根据 alarmActive 同步 alarmMode
      } catch (error) {
        console.error("传感器数据获取失败:", error);
      }
    },

    // Unicode转中文工具方法
    unicodeToChs(str) {
      return str.replace(/\\u([\d\w]{4})/gi, function (match, grp) {
        return String.fromCharCode(parseInt(grp, 16));
      });
    },
  },
  // 在 mounted 中启动定时器
  mounted() {
    this.fetchSensorData(); // 立即获取一次数据
    this.timer = setInterval(() => {
      this.fetchSensorData();
    }, 5000); // 每5秒轮询
  },

  // 在组件销毁前清除定时器
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
};
</script>

<style>
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
  padding-top: 177.78%; /* 9:16比例 (9/16=56.25%) */
  max-width: 375px; /* 移动端标准宽度 */
  margin: 0 auto; /* 水平居中 */
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); /* 模拟手机边框 */
  border-radius: 20px;
}

.mobile-frame iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: top left;
  transform: scale(1); /* 可调整缩放比例 */
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
  } /* 保持最终状态可见 */
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
  padding: 10px; /* 增加内边距 */
  border-bottom: 1px dashed #95a5a6;
  width: 70%;
  border-image: linear-gradient(to right, #3498db, #e74c3c);
  border-image-slice: 1;
  border-width: 0 0 2px 0;
  transition: all 0.3s;
}

.ai-questions input::placeholder {
  color: #999; /* 灰色占位符 */
  font-weight: 300; /* 细体 */
  font-size: 14px; /* 适当字号 */
}

/* 聚焦状态优化 */
.ai-questions input:focus::placeholder {
  opacity: 0.6; /* 聚焦时透明度变化 */
  transition: opacity 0.3s ease;
}
.ai-questions button {
  border-radius: 22px; /* 常规圆角 */
  padding: 0.3rem 1rem;
  font-size: 0.6rem;
  font-weight: 700;
  white-space: nowrap; /* 防止文字折行 */
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
}

.ai-questions button:active {
  background: #93c5fd; /* 淡蓝色 */
  transform: scale(0.98); /* 按压效果 */
}

.ai-responses {
  width: 90%;
  height: 200px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  line-height: 1.6;
  white-space: pre-wrap; /* 保留换行 */
}

.ai-text {
  font-size: 14px;
  font-weight: 300; /* 细体 */
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

.sensor-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 15px;
  background-color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.sensor-card:active {
  transform: translateY(2px);
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05);
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
  margin-left: auto; /* 确保状态靠右对齐 */
}

.sensor-title {
  font-weight: 600;
  color: #334155;
  font-size: 16px;
}

.sensor-value {
  font-size: 28px;
  font-weight: bold;
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
  left:45%;
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
</style>
