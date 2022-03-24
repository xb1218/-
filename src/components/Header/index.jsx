import React, { useState, useEffect } from "react"
import { Switch, Route, Link, useHistory } from "react-router-dom"
import styled from "@emotion/styled"

// 左侧导航 、面包屑、路由数组、api
import { Row, Col, Space, Menu, Dropdown } from "antd"
import { SearchOutlined, PlusCircleOutlined } from "@ant-design/icons"
import HelpModal from "../../components/HelpModal"
import ChangePasswordModal from "../ChangePasswordModal"
import api from "../../utils/request"

import defaultAvatar from "../../assets/default-avatar.png"
import whiteIcon from "../../assets/white-logo.png"
import { getToday } from "../../utils/date.js"
import { useStores } from "@/store/useStore.js"
import syncImg from "../../assets/sync.svg"

export default function Header({ refresh }) {
  const history = useHistory()
  const { userInfo } = useStores("auth")
  const [isHelpVisible, setisHelpVisible] = useState(false)
  const [cgPasswordVisible, setCgPasswordVisible] = useState(false)
  const [today, setToday] = useState("")

  useEffect(() => {
    updateTime()
  }, [])

  // CCRM同步数据
  const SyncData = async () => {
    const res = await api.post("/ccrm/ccrmUpdate", { account: userInfo.username })
    refresh()
  }

  // 每秒更新时间
  const updateTime = () => {
    setInterval(() => {
      const date = getToday()
      setToday(date)
    }, 1000)
  }

  const menu = (
    <Menu>
      <Menu.Item>
        <Link to="/home/power/user/account/1">
          <span style={{ color: "#7DA5FD" }}>super权限</span>
        </Link>
      </Menu.Item>
      <Menu.Item>
        <span
          onClick={() => setCgPasswordVisible(true)}
        >
          修改密码
        </span>
      </Menu.Item>
      <Menu.Item>
        <Link to="/login">
          <span>退出登陆</span>
        </Link>
      </Menu.Item>
    </Menu>
  )

  return (
    <>
      <Row
        justify="space-between"
        align="middle"
        style={{
          background: "linear-gradient(270deg, #7DA6FD 0%, #6783F3 100%)",
          padding: "18px 14px",
        }}
      >
        <Col>
          <Space
            size={16}
            onClick={() => history.push("/home/info/all")}
            style={{ cursor: "pointer" }}
          >
            <img src={whiteIcon} style={{ width: 28 }} />
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
              数据采集管理系统
            </span>
          </Space>
        </Col>

        <Col>
          <Row gutter={16}>
            <Col>
              <img 
                src={syncImg}
                style={{ width: "25px" }}
                onClick={() => SyncData()}
              />
            </Col>
            <Col>
              <PlusCircleOutlined
                onClick={() => {
                  history.push("/home/base-info")
                }}
                style={{ color: "#fff", fontSize: 20, cursor: "pointer" }}
              />
            </Col>
            <Col>
              <p
                style={{
                  color: "#fff",
                  fontSize: 14,
                  width: 180,
                  margin: 0,
                  textAlign: "center",
                }}
              >
                {today}
              </p>
            </Col>
            <Col>
              <Dropdown overlay={menu} trigger={["click"]}>
                <Space size={8} style={{ cursor: "pointer" }}>
                  <img src={defaultAvatar} style={{ width: 24 }} />
                  <span
                    style={{
                      color: "#fff",
                      fontSize: 14,
                    }}
                  >
                    {userInfo.username}
                  </span>
                </Space>
              </Dropdown>
            </Col>
          </Row>
        </Col>
      </Row>
      {
        cgPasswordVisible && (
          <ChangePasswordModal
            cancel={() => setCgPasswordVisible(false)}
          />
        )
      }
      <HelpModal
        isModalVisible={isHelpVisible}
        handleCancel={() => setisHelpVisible(false)}
      ></HelpModal>
    </>
  )
}
