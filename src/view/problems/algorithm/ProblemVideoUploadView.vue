<template>
  <div class="video-upload-container">
    <!-- IE需要es6-promise，目前支持IE 10及以上 -->
    <script src="/lib/es6-promise.min.js"></script>
    <script src="/lib/aliyun-oss-sdk-6.17.1.min.js"></script>
    <script src="/lib/aliyun-upload-sdk-1.5.7.min.js"></script>

    <div class="video-table">
      <div class="table-header">
        <div class="header-cell">文件名称</div>
        <div class="header-cell">上传状态</div>
        <div class="header-cell actions">操作</div>
      </div>

      <div class="table-body" v-loading="videoLoading">
        <div v-for="(item, index) in fileList" :key="index" class="table-row">
          <div class="table-cell">
            <input
              type="text"
              v-model="item.name"
              placeholder="请输入文件名称"
              class="video-name-input"
            />
          </div>

          <div class="table-cell">
            <input
              type="text"
              v-model="item.urlTwo"
              placeholder="请选择文件"
              disabled
              class="video-url-input"
            />
            <div v-if="item.progress > 0" class="upload-progress">
              <div
                class="progress-bar"
                :style="{ width: item.progress + '%' }"
              ></div>
              <span class="progress-text">{{ item.progress }}%</span>
            </div>
          </div>

          <div class="table-cell actions">
            <div class="action-buttons">
              <label class="upload-button" v-loading="item.loading">
                <span v-if="!item.loading">选择文件</span>
                <span v-else class="uploading">
                  <span class="spinner"></span>上传中...
                </span>
                <input
                  type="file"
                  @change="(event) => handleFileChange(event, index, item)"
                  class="file-input"
                  :multiple="multiple"
                  :accept="accept"
                />
              </label>

              <button @click="addRow(index)" class="action-button add-button">
                <svg viewBox="0 0 24 24" class="icon">
                  <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                </svg>
              </button>

              <button
                @click="removeRow(index)"
                class="action-button delete-button"
                v-if="fileList.length > 1"
              >
                <svg viewBox="0 0 24 24" class="icon">
                  <path
                    d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isUploading" class="global-loading">
      <div class="loading-spinner"></div>
      <div>文件上传中...</div>
    </div>
  </div>
</template>

<script>
import { createUplader } from "/public/ossUploadVideo";

export default {
  props: {
    multiple: {
      type: Boolean,
      default: false,
    },
    accept: {
      type: String,
      default: "video/mp4",
    },
  },
  data() {
    return {
      fileList: [
        {
          name: "",
          urlTwo: "",
          url: "",
          file: null,
          progress: 0,
          loading: false,
          vod_video_id: "",
          path: "",
        },
      ],
      uploader: null,
      videoDataForm: {
        userId: "1499284642607546",
        region: "cn-shanghai",
        partSize: 104857600, // 分片大小
        parallel: 5, // 并行上传片数
        retryCount: 3, // 网络失败后重新上传次数
        retryDuration: 2, // 网络失败后重新上传时间
      },
      videoLoading: false,
      isUploading: false,
    };
  },
  methods: {
    addRow(index) {
      this.fileList.splice(index + 1, 0, {
        name: "",
        urlTwo: "",
        url: "",
        file: null,
        progress: 0,
        loading: false,
        vod_video_id: "",
        path: "",
      });
    },
    removeRow(index) {
      this.fileList.splice(index, 1);
    },
    handleFileChange(event, index, item) {
      const file = event.target.files[0];
      if (!file) {
        return;
      }

      if (file.type !== "video/mp4") {
        this.$message.error("请选择.mp4文件!");
        return;
      }

      // 更新文件信息
      this.fileList[index].file = file;
      this.fileList[index].name = file.name.split(".")[0] || file.name;
      this.fileList[index].loading = true;
      this.videoLoading = true;

      // 创建上传器并开始上传
      let userData = '{"Vod":{}}';
      this.uploader = createUplader(
        this,
        item.name,
        this.successFun,
        index,
        item
      );
      this.uploader.addFile(file, null, null, null, userData);

      this.$nextTick(() => {
        this.uploader.startUpload();
      });
    },
    successFun(event, index, item) {
      // 上传成功回调
      this.fileList[index].url = event.endpoint + "/" + event.object;
      this.fileList[index].vod_video_id = event.videoId;
      this.fileList[index].path = event.object;
      this.fileList[index].urlTwo = this.fileList[index].url;
      this.fileList[index].loading = false;
      this.videoLoading = false;
      this.fileList[index].progress = 100;

      // 触发事件，通知父组件上传成功
      this.$emit("my-event", event.videoId);
    },
  },
};
</script>

<style scoped>
.video-upload-container {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.video-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  background-color: #f5f7fa;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
}

.header-cell {
  padding: 12px 16px;
  flex: 1;
}

.header-cell.actions {
  flex: 0 0 200px;
  text-align: center;
}

.table-body {
  background-color: white;
}

.table-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background-color: #f9f9f9;
}

.table-cell {
  padding: 12px 16px;
  flex: 1;
}

.table-cell.actions {
  flex: 0 0 200px;
}

.video-name-input,
.video-url-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.video-name-input:focus,
.video-url-input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.video-url-input {
  background-color: #f5f5f5;
  color: #666;
}

.upload-progress {
  margin-top: 8px;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #409eff;
  transition: width 0.3s;
}

.progress-text {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #333;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.upload-button {
  position: relative;
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.upload-button:hover {
  background-color: #66b1ff;
}

.file-input {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.action-button {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.action-button svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.add-button {
  background-color: #67c23a;
  color: white;
}

.add-button:hover {
  background-color: #85ce61;
}

.delete-button {
  background-color: #f56c6c;
  color: white;
}

.delete-button:hover {
  background-color: #f78989;
}

.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-size: 18px;
  color: #333;
}

.loading-spinner,
.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid #409eff;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.spinner {
  width: 16px;
  height: 16px;
  margin: 0 8px 0 0;
  display: inline-block;
  vertical-align: middle;
}

.uploading {
  display: inline-flex;
  align-items: center;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
