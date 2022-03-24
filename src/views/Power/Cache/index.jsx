import React, { useState, useEffect } from "react"
import styled from "@emotion/styled"
import { Link } from "react-router-dom"
import { Space, Table, Row, Col, Button, Divider, DatePicker } from "antd"
import { useAntdTable } from "../../../hooks/useAntdTable"
import { BackShadow, SectionTitle } from "../../../style.js"
import {
  SearchOutlined,
  SettingOutlined,
  LockOutlined,
} from "@ant-design/icons"

const columns = [
  {
    title: "工号",
    dataIndex: "familyNumber",
  },
  {
    title: "操作者",
    dataIndex: "name",
  },
  {
    title: "信息拥有者",
    dataIndex: "name",
  },
  {
    title: "模块",
    dataIndex: "name",
  },
  {
    title: "删除日期",
    dataIndex: "phone",
  },
  {
    title: "有效时间",
    dataIndex: "phone",
  },
  {
    title: "操作",
    dataIndex: "phone",
    width: "120px",
    render: () => {
      return (
        <Button danger size="small">
          恢复
        </Button>
      )
    },
  },
]

export default function Cache() {
  const { tableProps, run, data } = useAntdTable("/home/infoList")

  // 点击左侧
  const onClickItem = (index) => {
    setActiveIndex(index)
  }

  return (
    <>
      <BackShadow
        style={{
          margin: "0 0 0 8px",
          height: "calc(100vh - 72px)",
          overflow: "auto",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Row align="middle" justify="space-between">
            <Col>
              <h3>数据留存</h3>
            </Col>
            <Col>
              <Space size={16}>
                <SearchOutlined
                  style={{ fontSize: 16, cursor: "pointer" }}
                ></SearchOutlined>
                <DatePicker></DatePicker>
              </Space>
            </Col>
          </Row>
          <Table columns={columns} rowKey="id" {...tableProps} />
        </Space>
      </BackShadow>
    </>
  )
}
