import React, { useState, useEffect } from "react"
import styled from "@emotion/styled"
import { Link } from "react-router-dom"
import { Space, Table, Row, Col, Button, Divider } from "antd"
import { useAntdTable } from "../../../../hooks/useAntdTable"
import { BackShadow, SectionTitle } from "../../../../style.js"
import {
  SearchOutlined,
  SettingOutlined,
  LockOutlined,
} from "@ant-design/icons"

const columns = [
  {
    title: "成员",
    dataIndex: "name",
  },
  {
    title: "工号",
    dataIndex: "familyNumber",
  },
  {
    title: "有效日",
    dataIndex: "phone",
  },
  {
    title: "角色",
    dataIndex: "gender",
    render: (gendar) => {
      return <span>{gendar == "female" ? "女" : "男"}</span>
    },
  },
  {
    title: "操作",
    dataIndex: "phone",
    width: "120px",
    render: () => {
      return (
        <Space size={16}>
          <SettingOutlined style={{ fontSize: 16, cursor: "pointer" }} />
          <LockOutlined style={{ fontSize: 16, cursor: "pointer" }} />
        </Space>
      )
    },
  },
]

export default function Account() {
  const { tableProps, run, data } = useAntdTable("/home/infoList")

  // 点击左侧
  const onClickItem = (index) => {
    setActiveIndex(index)
  }

  return (
    <>
      <BackShadow
        style={{
          margin: 0,
          height: "calc(100vh - 72px)",
          overflow: "auto",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Row align="middle" justify="space-between">
            <Col>
              <h3>全部</h3>
            </Col>
            <Col>
              <SearchOutlined
                style={{ fontSize: 16, cursor: "pointer" }}
              ></SearchOutlined>
            </Col>
          </Row>
          <Table columns={columns} rowKey="id" {...tableProps} />
        </Space>
      </BackShadow>
    </>
  )
}
