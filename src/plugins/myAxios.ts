import axios from "axios";

const myAxios = axios.create({
  baseURL: "http://localhost:7091",
});

axios.interceptors.request.use(
  function (config) {
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      config.headers["X-Session-Id"] = sessionId;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);


export default myAxios;
