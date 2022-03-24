import React, { useState, useEffect } from "react"
import { LeftOutlined } from "@ant-design/icons"
import styled from "@emotion/styled"
import { Space, Row, Col, Button } from "antd"
import planUploadBg from "../../../assets/input/plan-upload-bg.png"
import planCornersBg from "../../../assets/input/plan-corners-bg.png"
import { BackShadowWraper } from "../../../style.js"
import { Switch, Route, Link, useParams } from "react-router-dom"

import UploadFile from "../../../components/UploadFile"
import { downloadImg } from "../../../utils/downloadImg.js"
import PrintImage from "../../../layout/PrintImage"

import api from "../../../utils/request.js"

import { useUpdateEffect } from "ahooks"

export default function Plan() {
  const { id: pid } = useParams() //患者ID
  const [info, setInfo] = useState("")
  const [img, setImg] = useState("")

  // 获取用户信息
  const getPatientInfo = async () => {
    const { FAMILY_PLAN: info } = await api.get("/patient/paperwork", {
      id: pid,
      type: 4,
    })
    setInfo(info)
    setImg(info.imgUrl)
  }

  useEffect(() => {
    getPatientInfo()
  }, [])

  // 新建或者更新绑定的信息
  const addFamilyPlanInfo = async (url) => {
    const params = {
      id: info?.id || null,
      pid: pid,
      imgUrl: url,
    }
    const tips = {
      success: "上传照片成功",
    }
    const res = await api.post("/add/addFamilyPlanInfo", params, tips)
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
  const onSuccess = (url) => {
    setImg(url)
    addFamilyPlanInfo(url)
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
            <PrintImage Images={[img || info.imgUrl]}></PrintImage>
            <Button
              type="primary"
              size="small"
              onClick={() => downloadImg([img || info.imgUrl])}
            >
              下载
            </Button>
          </Space>
        </Col>
      </Row>
      <BackShadowWraper>
        <Row justify="center">
          <UploadFile
            id="plan"
            img={img}
            width={318}
            height={450}
            onSuccess={(url) => onSuccess(url)}
            defaultBg={info.idCardBack || planUploadBg}
            borderBg={planCornersBg}
          />
        </Row>
      </BackShadowWraper>
    </>
  )
}
