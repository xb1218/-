import React, { useState, useEffect, useImperativeHandle, useRef } from "react"
import styled from "@emotion/styled"
import { Space, Row, Col, Input, Timeline } from "antd"

import { BackShadow, SectionTitle } from "../../../style.js"
import { useHistory } from "react-router-dom"

import api from "../../../utils/request.js"

import EditTag from "../../../components/EditTagBtn"
import PDFList from "../../../components/PDFFileList"

export default function TimeLine({ pid, onClickTag, onRef, getPreviewImgId }) {
  const history = useHistory()
  const [activeTag, setActiveTag] = useState("0-0")
  const [timeList, setTimeList] = useState([])

  // 编辑一个tag 输入框里面的值
  const [tagChangeValue, setTagChangeValue] = useState("")
  const oldName = useRef("")

  useImperativeHandle(onRef, () => {
    return {
      getTags: getTimeline,
    }
  })

  // 获取时间轴总览
  const getTimeline = async () => {
    const res = await api.get("/timeline/labels", { pid, docType: 0 })
    setTimeList(res)
    const indexD = activeTag.split("-")[0]
    const indexT = activeTag.split("-")[1]
    const day = res[indexD] || {}
    setTagChangeValue(day.labelNames[indexT].labelName || "")
    onClickTag(day.labelNames[indexT].labelName, day.time)
  }

  useEffect(() => {
    getTimeline()
  }, [])

  // 点击标签
  const onClick = (labelName, active, time) => {
    setActiveTag(active)
    setTagChangeValue(labelName)
    oldName.current = labelName
    onClickTag(labelName, time)
  }

  // 修改一个图片标签
  const onEditOneTag = async (e) => {
    const { value } = e.target

    if (value == "") {
      message.error("标签名不能为空")
      return null
    }

    if (oldName.current == value) {
      console.log("没有变化")
      return null
    }

    let res = await api.put(
      "/label/oneName",
      {
        pid,
        docLabelId: getPreviewImgId(),
        newLabelName: value,
        docType: 0,
      },
      { success: "修改图片标签成功" }
    )
    setTagChangeValue("")
    getTimeline()
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
      <SectionTitle>时间轴</SectionTitle>
      <Timeline
        style={{
          height: "calc(100vh - 280px)",
          width: "100%",
          overflow: "auto",
          padding: "8px 12px",
        }}
      >
        {timeList.map((date, indexD) => {
          return (
            <Timeline.Item key={indexD}>
              <Space direction="vertical" size={8}>
                <span>{date.time}</span>
                <Tags>
                  <Row gutter={12}>
                    {date.labelNames.map((e, index) => {
                      return (
                        <Col key={index}>
                          <EditTag
                            type="test"
                            key={index}
                            pid={pid}
                            labelName={e.labelName}
                            count={e.count}
                            active={activeTag == indexD + "-" + index}
                            onClickTag={() =>
                              onClick(
                                e.labelName,
                                indexD + "-" + index,
                                date.time
                              )
                            }
                            onEditTag={() => getTimeline()}
                          ></EditTag>
                        </Col>
                      )
                    })}
                  </Row>
                </Tags>

                <PDFList
                  pdfList={date.fileList}
                  onChange={getTimeline}
                  type="test"
                  pid={pid}
                ></PDFList>
              </Space>
            </Timeline.Item>
          )
        })}
        {timeList.length == 0 && (
          <p style={{ margin: 40, fontSize: 12, color: "#999" }}>暂无化验单</p>
        )}
      </Timeline>
    </>
  )
}

const Tags = styled.div`
  p {
    color: #666666;
    background: #f2f2f2;
    border-radius: 2px;
    cursor: pointer;
    user-select: none;
    padding: 2px 6px;
  }
  .active {
    color: #fff;
    background: #779cfa;
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
