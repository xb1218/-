import React, { useEffect, useState } from "react"
import { Switch, Route, Link, useHistory } from "react-router-dom"
import styled from "@emotion/styled"
import { useStores } from "@/store/useStore.js"
import Header from "../components/Header"

import Info from "./Info"
import Power from "./Power"
import Input from "./Input"
import BaseInfo from "../views/Input/BaseInfo"
import Informed from "../views/Input/Informed"
import InformedAll from "../views/Input/InformedAll"

import { refreshToken } from "../utils/token.js"

export default function Dashboard() {
  const [data, setData] = useState(null)
  const { getUserInfo } = useStores("auth")

  useEffect(() => {
    if(!window.sessionStorage.getItem("info")) {
      getUserInfo()
    }
    refreshToken()
  }, [])

  // 刷新表格数据
  const refresh = () => {
    setData(new Date().getTime())
  }

  return (
    <>
      <Header refresh={refresh}></Header>
      <Main>
        <Switch>
          <Route key="info" path="/home/info" component={() => <Info data={data} />} />
          <Route key="power" path="/home/power" component={Power} />
          <Route
            key="input-informed"
            path="/home/input/consent/:id"
            component={Informed}
          />
          <Route
            key="input-informed-type"
            path="/home/input/consent"
            component={Informed}
          />
          <Route
            key="input-informedAll"
            path="/home/input/consent-all/:id"
            component={InformedAll}
          />
          <Route key="input" path="/home/input" component={Input} />
          <Route
            key="base-info-id"
            path="/home/base-info/:idCard"
            component={BaseInfo}
          />
          <Route key="base-info" path="/home/base-info" component={BaseInfo} />
        </Switch>
      </Main>
    </>
  )
}

const Main = styled.div`
  background-color: #f8fafb;
  overflow: hidden;
  height: calc(100vh - 64px);
`
