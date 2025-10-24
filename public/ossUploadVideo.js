//这是后端给我的接口去获取相关凭证
// import { create_upload_video_api } from "@/api/common";
let OSS = require("ali-oss");
let AliyunUpload = window.AliyunUpload;
let uploadAuth;
export function createUplader(_this, name, successFun, index, item) {
  console.log(AliyunUpload);
  let uploader = new AliyunUpload.Vod({
    userId: _this.videoDataForm.userId,
    partSize: _this.videoDataForm.partSize,
    parallel: _this.videoDataForm.parallel,
    retryCount: _this.videoDataForm.retryCount,
    retryDuration: _this.videoDataForm.retryDuration,
    //是否上报上传日志到点播，默认为true
    enableUploadProgress: true,
    // 开始上传
    onUploadstarted: function (uploadInfo) {
      console.log(uploadInfo, "上传");
      if (!uploadInfo.videoId) {
        // 如果 uploadInfo.videoId 存在, 调用 刷新视频上传凭证接口()
        //这里主要是前端请求后台刷新上传凭证，接口由后端提供
        let nameTwo = uploadInfo.file.name.split(".")[0];
        let params = {
          title: name || nameTwo,
          path: `D:\\video\\` + uploadInfo.file.name,
        };
        create_upload_video_api(params).then((res) => {
          if (res.code !== 200) {
            return _this.$message.error(res.msg);
          }
          uploadAuth = res.data.encodedUploadAuth;
          let uploadAddress = res.data.encodedUploadAddress;
          let videoId = res.data.vod_video_id;
          uploader.setUploadAuthAndAddress(
            uploadInfo,
            uploadAuth,
            uploadAddress,
            videoId
          );
          console.log(res, "res,res,res,");
        });
      }
    },
    // 文件上传成功
    onUploadSucceed: (event) => successFun(event, index, item),
    // 文件上传失败
    onUploadFailed: function (uploadInfo, code, message) {
      console.log(uploadInfo, code, message);
      _this.videoLoading = false;
    },
    // 文件上传进度，单位：字节
    onUploadProgress: function (uploadInfo, totalSize, loadedPercent) {
      console.log(uploadInfo, totalSize, loadedPercent);
    },
    // 上传凭证超时
    onUploadTokenExpired: function (uploadInfo) {
      console.log("onUploadTokenExpired");
      //实现时，根据uploadInfo.videoId调用刷新视频上传凭证接口重新获取UploadAuth
      //从点播服务刷新的uploadAuth,设置到SDK里
      _this.$message.success("上传文件超时，正在重新上传");
      uploader.resumeUploadWithAuth(uploadAuth);
      console.log(uploadInfo);
    },
    //全部文件上传结束
    onUploadEnd: function (uploadInfo) {
      console.log("onUploadEnd: uploaded all the files", uploadInfo);
      // _this.$message.success('全部文件上传完毕')
      _this.videoLoading = false;
    },
  });
  return uploader;
}
