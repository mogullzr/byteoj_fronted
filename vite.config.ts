import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import {CompetitionControllerService, ProblemAlgorithmControllerService, SearchControllerService} from "./generated";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    // allowedHosts: ["frp-put.com"],
    port: 5173,
    proxy: {
      "^/api": {
        // target: "http://localhost:7091",
        target: "https://www.byteoj.com",
        changeOrigin: true,
      },
    },
  },
  define: {
    "process.env": {
      BASE_URL: "",
    },
  },
});

