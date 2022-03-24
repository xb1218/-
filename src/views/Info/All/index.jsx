import React, { useState, useEffect } from "react"
import styled from "@emotion/styled"
import { Link, useHistory, useLocation } from "react-router-dom"
import QueryModule from "../../../components/QueryModule"
import { Space, Table, Row, Col, Button, Popconfirm } from "antd"
import { useAntdTable } from "../../../hooks/useAntdTable"
import { BackShadow, SectionTitle } from "../../../style.js"

import {
  EyeOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons"

import api from "../../../utils/request.js"

export default function All(props) {
  const history = useHistory()
  const { tableProps, run } = useAntdTable("/home/infoList", {
    manual: true,
  })

  // 点击搜索
  const onSearch = async (values) => {
    const res = await run({}, { ...values })
  }

  const deleteAll = async (ids) => {
    const res = await api.del(
      "/home/deleteAll",
      {
        ids,
      },
      { success: "删除成功" }
    )
    run({})
  }

  useEffect(() => {
    run({})
  }, [props.data])

  const columns = [
    {
      title: "序号",
      render: (text, record, index) => {
        return <span>{index + 1}</span>
      },
    },
    {
      title: "姓名",
      dataIndex: "name",
    },
    {
      title: "性别",
      dataIndex: "sex",
      render: (sex) => {
        return <span>{sex == 1 ? "女" : "男"}</span>
      },
    },
    {
      title: "电话号码",
      dataIndex: "phone",
    },
    {
      title: "证件号 ",
      dataIndex: "card",
    },
    // {
    //   title: "类型",
    //   dataIndex: "cardType",
    // },
    {
      title: "证件",
      dataIndex: "paperwork",
      render: (paperwork) => {
        return <span>{paperwork ? "有" : "无"}</span>
      },
    },
    {
      title: "知情同意书",
      dataIndex: "isConsent",
      render: (isConsent) => {
        return <span>{isConsent ? "有" : "无"}</span>
      },
    },
    {
      title: "化验单",
      dataIndex: "isTestSheet",
      render: (isTestSheet) => {
        return <span>{isTestSheet ? "有" : "无"}</span>
      },
    },
    {
      title: "病历",
      dataIndex: "isCase",
      render: (isCase) => {
        return <span>{isCase ? "有" : "无"}</span>
      },
    },
    {
      title: "操作",
      render: ({ id, card, cardType }) => {
        const DelTitle = (
          <>
            <p>删除会导致信息清空，是否继续删除？</p>
            <span style={{ color: "#999", fontSize: 12 }}>
              *恢复误删信息请联系管理员
            </span>
          </>
        )
        return (
          <OperItem>
            <Space size={12}>
              <EyeOutlined
                onClick={() =>
                  history.push(`/home/base-info/${card}_${cardType}`)
                }
              />
              <Popconfirm
                title={DelTitle}
                icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                onConfirm={() => deleteAll([id])}
              >
                <DeleteOutlined />
              </Popconfirm>
            </Space>
          </OperItem>
        )
      },
    },
  ]
  return (
    <>
      <QueryModule onSearch={onSearch} type="all" />
      <BackShadow style={{ padding: "8px 16px" }}>
        <SectionTitle>信息列表</SectionTitle>

        <Table columns={columns} rowKey="id" {...tableProps} total={80} />
      </BackShadow>
    </>
  )
}

const OperItem = styled.span`
  color: #7aa0fc;
  cursor: pointer;
`
