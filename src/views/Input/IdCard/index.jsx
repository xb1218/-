import React, { useState, useEffect, useRef } from "react"
import { Row, Col, Select, Button, Space } from "antd"
import idCardReverse from "../../../assets/input/idCard-reverse.png"
import idCardFront from "../../../assets/input/idCard-front.png"
import { BackShadowWraper } from "../../../style.js"
import { useParams } from "react-router-dom"

import api from "../../../utils/request.js"

import { downloadImg } from "../../../utils/downloadImg.js"
import PrintImage from "../../../layout/PrintImage"

import UploadFile from "../../../components/UploadFile"
import idCardCornersBg from "../../../assets/input/idCard-corners-bg.png"
import { useUpdateEffect } from "ahooks"

export default function IdCard() {
  const [front, setFront] = useState("")
  const [back, setBack] = useState("")

  const { id: pid } = useParams()
  const [info, setInfo] = useState("")

  // 获取用户信息
  const getPatientInfo = async () => {
    const { ID_CARD: info } = await api.get("/patient/paperwork", {
      id: pid,
      type: 0,
    })
    setInfo(info)
    setFront(info.idCardFront)
    setBack(info.idCardBack)
  }

  useEffect(() => {
    getPatientInfo()
  }, [])

  // 新建或者更新绑定的信息xw
  const addIdCard = async (front, back) => {
    const params = {
      id: info?.id || null,
      pid: pid,
      idCardFront: front,
      idCardBack: back,
    }
    const tips = {
      success: "上传身份证照片成功",
    }
    const res = await api.post("/add/addIdCard", params, tips)

    // 只有新增成功 重新给身份证id赋值
    if (typeof res === "number") {
      setInfo((prev) => {
        return {
          ...prev,
          id: res,
        }
      })
    }
  }

  // 上传图片成功调用
  const onSuccess = (url, type) => {
    if (type == "back") {
      setBack(url)
      addIdCard(front, url)
    } else {
      setFront(url)
      addIdCard(url, back)
    }
  }

  return (
    <>
      <Row align="middle" justify="space-between" gutter={16}>
        <Col></Col>
        <Col>
          {info && (
            <Space size={16} style={{ color: "#444" }}>
              <span>{info.name}</span>
              <span>{info.sex == 0 ? "男" : "女"}</span>
              <span>{info.card}</span>
              <span>{info.phone}</span>
            </Space>
          )}
        </Col>
        <Col>
          <Space size={16}>
            <PrintImage
              Images={[front || info.idCardFront, back || info.idCardBack]}
            ></PrintImage>
            <Button
              type="primary"
              size="small"
              onClick={() =>
                downloadImg([
                  front || info.idCardFront,
                  back || info.idCardBack,
                ])
              }
            >
              下载
            </Button>
          </Space>
        </Col>
      </Row>
      <BackShadowWraper>
        <Row gutter={55}>
          <Col span={12}>
            <UploadFile
              id="front"
              img={front}
              width={480}
              height={300}
              onSuccess={(url) => onSuccess(url, "front")}
              defaultBg={idCardReverse}
              borderBg={idCardCornersBg}
            />
          </Col>
          <Col span={12}>
            <UploadFile
              id="back"
              img={back}
              width={480}
              height={300}
              onSuccess={(url) => onSuccess(url, "back")}
              defaultBg={idCardFront}
              borderBg={idCardCornersBg}
            />
          </Col>
        </Row>
      </BackShadowWraper>
    </>
  )
}
