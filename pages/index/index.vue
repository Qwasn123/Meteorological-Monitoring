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
              <text>转速: {{ fanSpeed }} RPM</text>
              <text :class="fanSpeed > 0 ? 'status-active' : 'status-inactive'">
                {{ fanSpeed > 0 ? "Active" : "Inactive" }}
              </text>
            </view>
            <text class="control-range">范围: 0-5000 RPM</text>
            <slider
              :value="fanSpeed"
              @change="onFanSliderChange"
              :min="0"
              :max="5000"
              :step="100"
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
          </view>

          <!-- Buzzer Control -->
          <view class="control-card">
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
              <text
                :class="
                  alarmActive && alarmMode > 0
                    ? 'status-alarm'
                    : 'status-inactive'
                "
              >
                {{ alarmActive && alarmMode > 0 ? "注意" : "安静" }}
              </text>
            </view>
            <text class="control-range">支持开关</text>
            <view class="alarm-buttons">
              <view
                v-for="(mode, index) in alarmModes"
                :key="index"
                @click="alarmMode = index"
                :class="[
                  'mode-button',
                  alarmMode === index ? 'mode-active' : '',
                ]"
              >
                <text>{{ mode }}</text>
              </view>
            </view>
            <view
              @click="alarmActive = !alarmActive"
              :class="['test-button', alarmActive ? 'alarm-active' : '']"
            >
              <text>{{ alarmActive ? "停止测试" : "测试" }}</text>
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
                    <text>转速:</text>
                    <text>{{ Math.round(fanSpeed / 50) }}%</text>
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
        { label: "传感器数据", value: "sensors" },
        { label: "控制台", value: "controls" },
        { label: "总控展示", value: "display" },
      ],
      activeTab: "sensors",

      // Sensor data
      temperature: 25.0,
      humidity: 45,
      gasLevel: 120,
      fanSpeed: 2500,
      alarmMode: 0,
      alarmActive: false,

      // Fan presets
      fanPresets: [
        { label: "关闭", value: 0 },
        { label: "低速", value: 1500 },
        { label: "中速", value: 3000 },
        { label: "高速", value: 5000 },
      ],

      // Alarm sound effect modes
      alarmModes: ["Off", "On"],
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
  },
};
</script>

<style>
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
  gap: 20px;
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
  padding: 20px;
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

.sensor-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
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
