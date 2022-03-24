import React, { useState } from "react"
import { Switch, Route, Link, useHistory } from "react-router-dom"
import styled from "@emotion/styled"

// 左侧导航 、面包屑、路由数组、api
import SideBar from "@/components/SideBar"
import { powerSide, powerRoutes } from "../../utils/routerList.js"
import { Row, Col, Space, Menu, Dropdown } from "antd"

export default function Dashboard() {
  const history = useHistory()

  return (
    <>
      <Row style={{ padding: "8px 8px 8px 0" }}>
        <SideBar routes={powerSide}></SideBar>
        <Main>
          <Switch>
            {[...powerRoutes].map((r) => {
              const path = r[0]
              const com = r[1]
              return (
                <Route
                  key={path}
                  path={path}
                  component={com.component}
                />
              )
            })}
          </Switch>
        </Main>
      </Row>
    </>
  )
}

const Main = styled.div`
  background-color: #f8fafb;
  overflow: hidden;
  max-height: calc(100vh - 64px);
  width: calc(100vw - 145px);
  margin-left: 145px;
`
