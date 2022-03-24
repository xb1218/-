import { defineConfig } from "vite"
import reactRefresh from "@vitejs/plugin-react-refresh"
import legacy from "@vitejs/plugin-legacy"
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'

const path = require("path")

// https://vitejs.dev/config/
export default defineConfig({
  rollupInputOptions: {
    plugins: [
      commonjs(),
      reactRefresh(),
      babel({
        presets: [[
          "@babel/preset-env",
          {
            "useBuiltIns": "entry"
          },
          {
            "corejs": 2,
            "useBuiltIns": "usage",
            "targets": {
              "ie": "11"
            }
          }
        ]]
      })
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: "4000",
    open: "/login",
    base: "./ ", //生产环境路径
    // proxy: {
    //   "^/v1": {
    //     target: "https://api-diginfo.dfinfo.net", // 后端服务实际地址
    //     changeOrigin: true, //开启代理
    //     rewrite: (path) => path.replace(/^\/v1/, ""),
    //   },
    // },
  },
  css: {
    preprocessorOptions: {
      less: {
        // 支持内联 JavaScript
        javascriptEnabled: true,
        // 重写 less 变量，定制样式
        modifyVars: {
          "@font-size-base": "12px", // 主字号

          "@primary-color": "#7AA0FC", //主题色
          "@text-color": "#333", // 主文本色
          "@text-color-secondary": "#666", // 次文本色

          "@btn-primary-bg": "#7AA0FC", // 按钮色

          "@success-color": "#fff", // 成功气泡icon颜色
          "@warning-color": "#fff", // 成功气泡icon颜色
        },
      },
    },
  },
})
