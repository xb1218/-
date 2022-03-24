import React from "react"
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom"

// 页面 引入
import Login from "@/views/login"
import Header from "@/layout"

// 路由
export default function Router() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/public" component={Login} />
        <Route path="/home" component={Header} />
        <Redirect from="*" to="/public" />
      </Switch>
    </BrowserRouter>
  )
}
