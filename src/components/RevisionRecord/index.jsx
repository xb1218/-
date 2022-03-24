import React, { useState, useEffect, useRef } from "react"
import styled from "@emotion/styled"
import { Row, Col, Space, Modal, Timeline, Button, Divider } from "antd"
import { ClockCircleOutlined } from "@ant-design/icons"

import api from "../../utils/request"
import { useStores } from "@/store/useStore.js"

export default function RevisionRecord({
  pid,
  type,
  onRecord,
  onUploadBefore = () => true,
}) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [testRecord, setTestRecord] = useState([])
  const { userInfo } = useStores("auth")

  // 点击回收站
  const showModal = () => {
    setIsModalVisible((prev) => {
      // 如果显示 刷新
      !prev ? getTestRecord() : ""
      return !prev
    })
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  // 查询病历回收站
  // caseSign:（用户）id+"recycle"+（患者od）pid+test
  const getTestRecord = async () => {
    const id = userInfo.id
    const res = await api.get(
      `/cache/${type}Record`,
      { [`${type}Sign`]: `${id}recycle${pid}${type}` },
      { success: "", error: "" }
    )
    if (res instanceof Array) {
      setTestRecord(res)
    }
  }

  // 上传之前可能有确认拦截
  async function onBefore(imgUrl) {
    const ok = await onUploadBefore()
    if (!ok) return false
    // 恢复回收站图片
    const res = await api.post(
      "/cache/recover",
      { type, pid, imgUrl },
      { success: "", error: "" }
    )
    onRecord(imgUrl)
    setIsModalVisible(false)
    getTestRecord()
  }

  return (
    <>
      <Button
        type="primary"
        size="small"
        style={{ backgroundColor: "#FFA25C", border: "#FFA25C" }}
        onClick={showModal}
      >
        回收站
      </Button>

      <Modal
        title="回收站"
        visible={isModalVisible}
        closable={false}
        footer={null}
        mask={false}
        onCancel={handleCancel}
        width={340}
        style={{ marginRight: 14, marginTop: 14 }}
      >
        <Timeline
          style={{ paddingTop: 14, maxHeight: "60vh", overflow: "auto" }}
        >
          {testRecord.reverse().map((e, index) => {
            return (
              <Timeline.Item key={index}>
                <Row justify="space-between" align="middle">
                  <h5>
                    <Space>第{parseInt(index) + 1}版</Space>
                  </h5>
                  <p style={{ color: "#999" }}>{e.createTime}</p>
                </Row>
                <Row justify="space-between" align="middle">
                  <a href={e.imgUrl} target="_blank">
                    <img src={e.imgUrl} alt="" style={{ height: 80 }} />
                  </a>
                  <ClockCircleOutlined
                    style={{
                      color: "#FF9100",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                    onClick={() => onBefore(e.imgUrl)}
                  />
                </Row>
              </Timeline.Item>
            )
          })}
          {testRecord.length == 0 && (
            <p style={{ color: "#999999" }}>此标记暂无修订记录</p>
          )}
        </Timeline>
      </Modal>
    </>
  )
}

const RecordBox = styled.div`
  position: absolute;
  top: 24px;
  left: -40px;
  z-index: 4;
  width: 196px;
`
