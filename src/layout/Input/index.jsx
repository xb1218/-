import React, { useState, useEffect } from "react"
import { Switch, Route, useHistory } from "react-router-dom"
import styled from "@emotion/styled"

// 左侧导航 、面包屑、路由数组、api
import { Row, Col, Space, Button } from "antd"
import { LeftOutlined } from "@ant-design/icons"

import BaseInfo from "../../views/Input/BaseInfo"
import IdCard from "../../views/Input/IdCard"
import Officer from "../../views/Input/Officer"
import Passport from "../../views/Input/Passport"
import Marry from "../../views/Input/Marry"
import Plan from "../../views/Input/Plan"
import Record from "../../views/Input/Record"
import RecordAll from "../../views/Input/RecordAll"
import Signed from "../../views/Input/Signed"
import SignedAll from "../../views/Input/SignedAll"

import CheckPage from "./CheckPage"

export default function Input() {
  const history = useHistory()

  return (
    <>
      <Main>
        <FixedHead>
          <Space size={32}>
            <LeftOutlined
              style={{ fontSize: 18, cursor: "pointer" }}
              onClick={() => history.go(-1)}
            />
            <CheckPage></CheckPage>
          </Space>
        </FixedHead>

        <Switch>
          <Route
            exact
            key="idcard"
            path="/home/input/id-card/:id"
            component={IdCard}
          />
          <Route
            exact
            key="officer"
            path="/home/input/officer/:id"
            component={Officer}
          />
          <Route
            exact
            key="passport"
            path="/home/input/passport/:id"
            component={Passport}
          />
          <Route
            exact
            key="marry"
            path="/home/input/marry/:id"
            component={Marry}
          />
          <Route
            exact
            key="plan"
            path="/home/input/plan/:id"
            component={Plan}
          />

          <Route exact key="input" path="/home/input" component={BaseInfo} />
          <Route
            exact
            key="record"
            path="/home/input/record-all/:id"
            component={RecordAll}
          />
          <Route
            exact
            key="record"
            path="/home/input/record/:id"
            component={Record}
          />
          <Route
            exact
            key="signed"
            path="/home/input/signed/:id"
            component={Signed}
          />
          <Route
            exact
            key="signed"
            path="/home/input/signed-all/:id"
            component={SignedAll}
          />
        </Switch>
      </Main>
    </>
  )
}

const Main = styled.div`
  background-color: #f8fafb;
  overflow: hidden;
  max-height: calc(100vh - 64px);
  padding: 14px;
  position: relative;
`

const FixedHead = styled.div`
  position: absolute;
`
