import React, { useState, useEffect } from "react"
import styled from "@emotion/styled"
import { Switch, Route, Link, useHistory, useParams } from "react-router-dom"
import { Space, Table, Row, Col, Button, Divider } from "antd"
import { PlusCircleOutlined } from "@ant-design/icons"
import { BackShadow, SectionTitle } from "../../../style.js"

import Account from "./Account"
import Apply from "./Apply"
import AddRoleModel from "./addRoleModel"

export default function All() {
  const history = useHistory()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAddModel, setIsAddModel] = useState(false)
  const params = useParams()

  return (
    <>
      <Row>
        <Col span={4}>
          <BackShadow
            style={{
              margin: 0,
              padding: "4px 0",
              marginRight: 12,
              height: "calc(100vh - 72px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardItem>
              <Link to="/home/power/user/apply">
                <span>申请加入</span> <span className="wranNumber">91</span>
              </Link>
            </CardItem>
            <Divider style={{ margin: 0 }}></Divider>

            <CardItem>
              <Link to="/home/power/user/account/1">
                <span>全部</span> <span className="number">101</span>
              </Link>
              <Link to="/home/power/user/account/2">
                <span>未分组</span> <span className="number">6</span>
              </Link>
              <Link to="/home/power/user/account/3">
                <span>医生</span> <span className="number">30</span>
              </Link>
              <Link to="/home/power/user/account/4">
                <span>护士</span> <span className="number">40</span>
              </Link>
              <Link to="/home/power/user/account/5">
                <span>医助</span> <span className="number">25</span>
              </Link>
            </CardItem>

            <Divider style={{ margin: 0, flex: 1 }}></Divider>
            <AddRole onClick={() => setIsAddModel(true)}>
              <PlusCircleOutlined style={{ fontSize: 15, color: "#6B89F5" }} />
              <span className="role">角色</span>
            </AddRole>
          </BackShadow>
        </Col>
        <Col span={20}>
          <Switch>
            <Route
              exact
              key="account"
              path="/home/power/user/account/:id"
              component={Account}
            />
            <Route
              exact
              key="apply"
              path="/home/power/user/apply"
              component={Apply}
            />
          </Switch>
        </Col>
      </Row>
      <AddRoleModel
        show={isAddModel}
        close={() => setIsAddModel(false)}
      ></AddRoleModel>
    </>
  )
}

const CardItem = styled.div`
  width: 100%;
  background-color: #fff;
  transition: all 0.6s;
  user-select: none;

  a {
    height: 39px;
    line-height: 39px;
    margin: 0;
    padding: 0 24px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-right: 3px solid #fff;

    &:hover {
      color: #7aa1fc;
      background-color: #7aa1fc1a;
      border-right: 3px solid #7aa0fc;
    }

    .number {
      color: #999999;
    }

    .wranNumber {
      color: #fff;
      background-color: red;
      width: 20px;
      height: 20px;
      line-height: 20px;
      border-radius: 20px;
      text-align: center;
    }
  }
`

const AddRole = styled.div`
  height: 41px;
  line-height: 41px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f9f9f9;
  border-radius: 4px;
  cursor: pointer;
  margin: 14px;

  .role {
    width: 40px;
    text-align: center;
    color: #6b89f5;
  }
`
