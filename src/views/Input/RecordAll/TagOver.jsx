import React, { useState, useEffect, useImperativeHandle, useRef } from "react"
import styled from "@emotion/styled"
import { Space, Row, Col, Button, Input, message } from "antd"

import { BackShadow, SectionTitle } from "../../../style.js"
import api from "../../../utils/request.js"

import EditTag from "../../../components/EditTagBtn"
import PDFList from "../../../components/PDFFileList"

export default function Tag({ pid, onClickTag, onRef, getPreviewImgId }) {
  const [tag, setTag] = useState([])
  const [active, setActive] = useState(0)
  const [pdfList, setPdfList] = useState([])

  // 编辑一个tag 输入框里面的值
  const [tagChangeValue, setTagChangeValue] = useState("")

  // 向父级暴露
  useImperativeHandle(onRef, () => {
    return {
      getTags: getTags,
    }
  })

  // 获取标签信息
  const getTags = async () => {
    let res = await api.get("/label/mode", { pid, docType: 1 })
    res = res.map((e) => {
      e.edit = false
      return e
    })
    onClickTag(res[active]?.labelName || "") //调用上级去查图片-
    setTagChangeValue(res[active]?.labelName || "")
    setTag(res)
  }

  // 获取文件
  const getFiles = async () => {
    let res = await api.get("/label/doc", { pid, docType: 1 })
    setPdfList(res)
  }

  useEffect(() => {
    getTags()
    getFiles()
  }, [])

  // 点击标签
  const onClick = (index) => {
    const { labelName } = tag[index]
    setActive(index)
    setTagChangeValue(labelName)
    onClickTag(labelName) //调用上级去查图片
  }

  // 修改一个图片标签
  const onEditOneTag = async (e) => {
    const { labelName: oldName } = tag[active]
    const { value } = e.target

    if (value == "") {
      message.error("标签名不能为空")
      return null
    }

    if (oldName == value) {
      console.log("没有变化")
      return null
    }

    let res = await api.put(
      "/label/oneName",
      {
        pid,
        docLabelId: getPreviewImgId(),
        newLabelName: value,
        docType: 1,
      },
      { success: "修改图片标签成功" }
    )
    setTagChangeValue("")
    getTags()
  }

  return (
    <>
      <ChangeOneInput>
        <Input
          className="tagInput"
          bordered={false}
          onBlur={onEditOneTag}
          value={tagChangeValue}
          onChange={(e) => setTagChangeValue(e.target.value)}
        />
      </ChangeOneInput>
      <SectionTitle>标签</SectionTitle>
      <Tags>
        <Row gutter={16}>
          {tag.map((e, index) => {
            return (
              <Col key={index}>
                <EditTag
                  type="case"
                  key={index}
                  pid={pid}
                  labelName={e.labelName}
                  count={e.count}
                  active={active == index}
                  onClickTag={() => onClick(index)}
                  onEditTag={() => getTags()}
                ></EditTag>
              </Col>
            )
          })}
        </Row>
      </Tags>

      <SectionTitle style={{ marginTop: 24 }}>文档</SectionTitle>
      <div
        style={{
          height: "calc(100vh - 340px)",
          width: "100%",
          overflow: "auto",
        }}
      >
        <PDFList
          pdfList={pdfList}
          onChange={getFiles}
          type="case"
          pid={pid}
        ></PDFList>
      </div>
    </>
  )
}

const Tags = styled.div`
  .normal {
    color: #666666;
    background: #f2f2f2;
    border-radius: 2px;
    cursor: pointer;
    user-select: none;
    padding: 2px 6px;
    margin: 6px 0;
    position: relative;
  }

  .active {
    cursor: pointer;
    user-select: none;
    padding: 2px 6px;
    margin: 6px 0;
    color: #fff;
    background: #779cfa;
    position: relative;

    .icon {
      background-color: "#779cfa";
      color: "#fff";
    }
  }

  .tagInput {
    height: 22px;
    width: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
  }
`

const ChangeOneInput = styled.div`
  .tagInput {
    width: 190px;
    height: 24px;
    background-color: #eeeeee;
    margin-bottom: 12px;
    color: #878787;

    &:focus {
      color: #333;
    }
  }
`
