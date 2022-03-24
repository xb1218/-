import React, { useState, useEffect } from "react"
import styled from "@emotion/styled"
import { Link } from "react-router-dom"
import { Space, Table, Row, Col, Select, Divider } from "antd"
import { useAntdTable } from "../../../../hooks/useAntdTable"
import { BackShadow, SectionTitle } from "../../../../style.js"
import {
  SearchOutlined,
  FileTextOutlined,
  BellOutlined,
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
    title: "角色",
    dataIndex: "gender",
    render: (gendar) => {
      return <span>{gendar == "female" ? "女" : "男"}</span>
    },
  },
  {
    title: "到期时间",
    dataIndex: "phone",
  },
  {
    title: "续期",
    dataIndex: "phone",
  },
  {
    title: "审核日",
    dataIndex: "phone",
  },
]

export default function Account() {
  const { Option } = Select
  const { tableProps, run, data } = useAntdTable("/home/infoList")

  return (
    <>
      <BackShadow
        style={{
          margin: 0,
          height: "calc(100vh - 72px)",
          overflow: "auto",
        }}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space>
                <h3 style={{ color: "#6C84FD" }}>续期</h3>
                <h3>/</h3>
                <h3>新注册</h3>
              </Space>
            </Col>
            <Col>
              <IconStyle>
                <SearchOutlined />
                <BellOutlined />
                <FileTextOutlined />
              </IconStyle>
            </Col>
          </Row>
          <Row>
            <Space size={24}>
              <span style={{ color: "#6C84FD" }}>1个月内</span>
              <span>3个月内</span>
              <span>6个月内</span>
              <span>已过期</span>
              <span>|</span>
              <span>7</span>
              <span>8</span>
              <span>月</span>
            </Space>
          </Row>
          <Row>
            <Space size={24}>
              <span>医生</span>
              <span style={{ color: "#6C84FD" }}>医助</span>
              <span>护士</span>
            </Space>
          </Row>
        </Space>

        <Table
          columns={columns}
          rowKey="id"
          {...tableProps}
          style={{ marginTop: 24 }}
        />

        <Row justify="space-between" style={{ padding: "32px 20px" }}>
          <Col>
            <Space>
              <span style={{ color: "#666666" }}>续期</span>
              <Select defaultValue="1" style={{ width: 80 }} size="small">
                <Option value="1">1年</Option>
                <Option value="2">2年</Option>
                <Option value="3">3年</Option>
                <Option value="4">4年</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <span style={{ color: "#FC4138" }}>忽略</span>
              <span style={{ color: "#666666" }}>|</span>
              <span style={{ color: "#6C84FD" }}>同意</span>
            </Space>
          </Col>
        </Row>
      </BackShadow>
    </>
  )
}

const IconStyle = styled.div`
  .anticon {
    color: #828282;
    font-size: 16px;
    width: 32px;
    cursor: pointer;
  }
`
