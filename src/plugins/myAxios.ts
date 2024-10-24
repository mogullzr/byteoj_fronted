import axios from "axios";

// Set config defaults when creating the instance
const myAxios = axios.create({
  baseURL: "", // 填写你的后台地址
});

axios.interceptors.request.use(
  function (config) {
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      config.headers["X-Session-Id"] = sessionId; // 或 'Authorization': `Bearer ${sessionId}`
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// // // Add a response interceptor
// // axios.interceptors.response.use(
// //   function (response) {
// //     return response.data;
// //   },
// //   function (error) {}
// );

export default myAxios;
