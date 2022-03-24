import React, { useState } from "react"
import { Switch, Route, Link, useHistory } from "react-router-dom"
import styled from "@emotion/styled"

// 左侧导航 、面包屑、路由数组、api
import SideBar from "@/components/sideBar"
import { infoSide, infoRoutes } from "../../utils/routerList.js"
import { Row, Col, Space, Menu, Dropdown } from "antd"

export default function Dashboard(props) {
  const history = useHistory()

  return (
    <>
      <Row>
        <SideBar routes={infoSide}></SideBar>
        <Main>
          <Switch>
            {[...infoRoutes].map((r) => {
              const path = r[0]
              const com = r[1]
              return (
                <Route
                  exact
                  key={path}
                  path={path}
                  component={() => <com.component data={props.data} />}
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
  overflow: auto;
  max-height: calc(100vh - 64px);
  padding: 4px 12px;
  width: calc(100vw - 145px);
  margin-left: 145px;
`
