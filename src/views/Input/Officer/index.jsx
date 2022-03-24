import React, { useState, useEffect } from "react"
import { LeftOutlined } from "@ant-design/icons"
import styled from "@emotion/styled"
import { Space, Row, Col, Button, Select } from "antd"
import officerUploadBg from "../../../assets/input/officer-upload-bg.png"
import officerCornersBg from "../../../assets/input/officer-corners-bg.png"
import { BackShadowWraper } from "../../../style.js"
import { useParams } from "react-router-dom"
import api from "../../../utils/request.js"

import { downloadImg } from "../../../utils/downloadImg.js"
import PrintImage from "../../../layout/PrintImage"

import UploadFile from "../../../components/UploadFile"
import { useUpdateEffect } from "ahooks"

export default function Officer() {
  const { id: pid } = useParams() //患者ID
  const [info, setInfo] = useState("") //用户信息
  const [img, setImg] = useState("") //军官证件照

  // 获取用户信息
  const getPatientInfo = async () => {
    const { OFFICER_PASS: info } = await api.get("/patient/paperwork", {
      id: pid,
      type: 1,
    })
    setInfo(info)
    setImg(info.imgUrl)
  }

  useEffect(() => {
    getPatientInfo()
  }, [])

  // 新建或者更新绑定的信息
  const addOfficerPass = async (url) => {
    const params = {
      id: info?.id || null,
      pid: pid,
      imgUrl: url,
    }
    const tips = {
      success: "上传军官证照片成功",
    }
    const res = await api.post("/add/addOfficerPass", params, tips)
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
  console.log("🚀 ~ file: index.jsx ~ line 60 ~ onSuccess ~ url", url)
    setImg(url)
    addOfficerPass(url)
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
            id="officer"
            img={img}
            width={650}
            height={474}
            onSuccess={(url) => onSuccess(url)}
            defaultBg={officerUploadBg}
            borderBg={officerCornersBg}
          />
        </Row>
      </BackShadowWraper>
    </>
  )
}
