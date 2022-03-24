import React from "react"
import ReactDOM from "react-dom"
import Router from "./Router"
import { ConfigProvider } from "antd"
import Auth from "./store/auth"
import { Provider } from "mobx-react"
import zhCN from "antd/lib/locale/zh_CN"
import '@babel/polyfill'
import "moment/dist/locale/zh-cn"
import "core-js/stable"
import "regenerator-runtime/runtime"
import moment from "moment"
moment.locale("zh-cn")

// 样式
import "antd/dist/antd.less"
import "./index.less"

ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <Provider auth={new Auth()}>
      <Router />
    </Provider>
  </ConfigProvider>,
  document.getElementById("root")
)
