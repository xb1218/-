import React, { useState, useEffect } from "react"
import styled from "@emotion/styled"
import { Link, useHistory, useLocation } from "react-router-dom"
import QueryModule from "../../../components/QueryModule"
import StackModal from "../../../components/StackModal"
import { Space, Table, Row, Col, Button, Popconfirm } from "antd"
import { useAntdTable } from "../../../hooks/useAntdTable"
import { BackShadow, SectionTitle } from "../../../style.js"
import { useStores } from "@/store/useStore.js"

import {
  EyeOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons"

import api from "../../../utils/request.js"

export default function Documents(props) {
  const history = useHistory()
  const [visible, setVisible] = useState(false)
  const [stackName, setStackName] = useState("")
  const [stackId, setStackId] = useState(null)

  const { getUserInfo } = useStores("auth")

  //   计算type的值
  const { pathname } = useLocation()
  const path = pathname.split("/").pop()
  console.log("🚀 ~ file: index.jsx ~ line 27 ~ Documents ~ path", path)
  const type =
    path == "id-card"
      ? 0
      : path == "officer"
      ? 1
      : path == "passport"
      ? 2
      : path == "marry"
      ? 3
      : path == "plan"
      ? 4
      : path == "record"
      ? 7
      : path == "consent"
      ? 5
      : 6
  const defaultParams = { type }
  //   算完了

  const { tableProps, run } = useAntdTable("/home/detail", {
    manual: true,
  })

  // 点击搜索
  const onSearch = async (values) => {
    const res = await run(
      { current: 1, pageSize: 15 },
      { ...defaultParams, ...values }
    )
  }

  // 删除
  const deleteAll = async (ids) => {
    const res = await api.del(
      "/home/deleteType",
      {
        ids,
        type,
      },
      { success: "删除成功" }
    )
    run({}, defaultParams)
  }

  // 查询选中的组套
  const querySelectStack = async () => {
    const userInfo = await getUserInfo()
    const res = await api.getIm("/sets/markSets", { id: userInfo.id })
    if (!res) {
      setStackName("组套设置")
    } else {
      setStackName(res.name)
      setStackId(res.id)
    }
  }

  useEffect(() => {
    run({}, defaultParams)
    if (type === 5) {
      querySelectStack()
    }
  }, [props.data])

  const columns = [
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
      title: "证件号",
      dataIndex: "card",
    },
    {
      title: "操作",
      render: ({ id }) => {
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
                onClick={() => history.push(`/home/input/${path}/${id}`)}
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
      <QueryModule onSearch={onSearch} type="other" />
      <BackShadow style={{ padding: "8px 16px" }}>
        <StackSetting style={{ display: type === 5 ? "" : "none" }}>
          <Button
            type="primary"
            className="reserve-btn-color"
            onClick={() => {
              setVisible(true)
            }}
          >
            组套设置
          </Button>
        </StackSetting>
        <SectionTitle>信息列表</SectionTitle>

        <Table columns={columns} rowKey="id" {...tableProps} total={80} />
      </BackShadow>
      <StackModal
        visible={visible}
        stackId={stackId}
        querySelectStack={querySelectStack}
        onCancel={() => {
          setVisible(false)
        }}
      />
    </>
  )
}

const OperItem = styled.span`
  color: #7aa0fc;
  cursor: pointer;
`
const StackSetting = styled.div`
  position: absolute;
  right: 15px;
  top: 9px;
`
