import React, { useState, useEffect, useRef } from "react"
import styled from "@emotion/styled"
import { Space, Select, DatePicker, Button, message, Row, Col } from "antd"

import { SectionTitle } from "../../style"
import api from "../../utils/request"

import moment from "moment"

import PDFList from "../PDFFileList"

export default function TagSelect({ onSave, pid, pdfList, onDelFile, type }) {
  const [tagObjList, setTagObjList] = useState([]) // 获取到的所有标签对象数组
  const [tagValList, setTagValList] = useState([]) // 获取到的所有标签值数组
  const [children, setChildren] = useState([]) //输入框里面的标签数组
  const [pickDate, setPickDate] = useState()

  // 点击添加
  const onClickTag = (name) => {
    setChildren((prev) => [...new Set([...prev, name])])
  }

  // 添加标签 参数是数组
  const addTag = async (values) => {
    let hasPostLabel = false
    for (let e of values) {
      if (tagValList.indexOf(e) < 0) {
        hasPostLabel = true
        const res = await api.post("/label", {
          pid,
          labelName: e,
          docType: type == "test" ? 0 : 1,
        })
      }
    }
    hasPostLabel && getTagList()
  }

  // 删除 新增 标签
  const handleChange = (value) => {
    setChildren(value)
    addTag(value)
  }

  // 点击保存
  const onSaveInfo = async () => {
    if (children.length == 0) {
      message.error("标签不能为空")
    } else {
      // let date = pickDate || moment()
      let date = moment() //时间就是今天 不允许更改
      date = date.format("L").replaceAll("/", "-")

      const newTags = await getTagList()

      const labels = children.map((tag) => {
        for (let e of newTags) {
          if (e.name == tag) return e
        }
      })
      // 1s以后执行 等失去焦点标签入库的请求结束以后
      await onSave(labels, date)
      setChildren([])
    }
  }

  // 时间又更改
  const onChangeDate = (date, dateString) => {
    setPickDate(moment(dateString))
  }

  // 查询已有标签
  const getTagList = async () => {
    const res = await api.get("/label/labels", {
      pid,
      type: type == "test" ? 0 : 1,
    })
    setTagObjList(res) //标签对象数组
    setTagValList(res.map((e) => e.name)) //标签值数组
    return res
  }

  useEffect(async () => {
    getTagList()
  }, [])

  return (
    <>
      <SectionTitle>存档日期</SectionTitle>
      <DatePicker
        allowClear={false}
        onChange={onChangeDate}
        // value={pickDate || moment()}
        value={moment()}
        disabled
      />
      <SectionTitle>标签</SectionTitle>
      <Space direction="vertical">
        <Select
          mode="tags"
          size="middle"
          style={{ width: "280px" }}
          value={children}
          open={false}
          onChange={handleChange}
        ></Select>
        <p style={{ color: "#ADAEAE" }}>*点击赋予标签</p>
      </Space>
      <PDFScrollHeight>
        <PDFList
          pdfList={pdfList}
          onChange={onDelFile}
          type={type}
          pid={pid}
        ></PDFList>
      </PDFScrollHeight>

      <Button
        type="primary"
        style={{ width: "100%", margin: "14px 0" }}
        onClick={onSaveInfo}
      >
        保存
      </Button>
      <SectionTitle>已有标签</SectionTitle>
      <Tags>
        <Row gutter={16}>
          {tagObjList.map((e, index) => {
            return (
              <Col key={index}>
                <p id={e.id} key={e.id} onClick={() => onClickTag(e.name)}>
                  {e.name}
                </p>
              </Col>
            )
          })}
        </Row>
      </Tags>
    </>
  )
}

const Tags = styled.div`
  height: 100px;
  overflow-y: auto;
  padding: 8px;

  p {
    color: #666666;
    background: #f2f2f2;
    border-radius: 2px;
    cursor: pointer;
    user-select: none;
    padding: 2px 6px;
  }
`

const PDFScrollHeight = styled.div`
  max-height: 60px;
  overflow-y: auto;
`
