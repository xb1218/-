import React, { useState, useEffect } from "react"
import { LeftOutlined } from "@ant-design/icons"
import styled from "@emotion/styled"
import { Space, Row, Col, Button } from "antd"
import plusIcon from "../../../assets/input/plus.png"
import passportUploadBg from "../../../assets/input/passport-upload-bg.png"
import passportCornersBg from "../../../assets/input/passport-corners-bg.png"
import { BackShadowWraper } from "../../../style.js"
import { Switch, Route, Link, useHistory, useParams } from "react-router-dom"

import UploadFile from "../../../components/UploadFile"
import { downloadImg } from "../../../utils/downloadImg.js"
import PrintImage from "../../../layout/PrintImage"

import api from "../../../utils/request.js"

import { useUpdateEffect } from "ahooks"

export default function Passport() {
  const { id: pid } = useParams() //患者ID
  const [info, setInfo] = useState("")
  const [img, setImg] = useState("")

  // 获取用户信息
  const getPatientInfo = async () => {
    const { PASSPORT: info } = await api.get("/patient/paperwork", {
      id: pid,
      type: 2,
    })
    setInfo(info)
    setImg(info.imgUrl)
  }

  useEffect(() => {
    getPatientInfo()
  }, [])

  // 新建或者更新绑定的信息
  const addPassportInfoDto = async (url) => {
    const params = {
      id: info?.id || null,
      pid: pid,
      imgUrl: url,
    }
    const tips = {
      success: "上传护照照片成功",
    }
    const res = await api.post("/add/addPassportInfoDto", params, tips)
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
    addPassportInfoDto(url)
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
            id="passport"
            img={img}
            width={330}
            height={475}
            onSuccess={(url) => onSuccess(url)}
            defaultBg={passportUploadBg}
            borderBg={passportCornersBg}
          />
        </Row>
      </BackShadowWraper>
    </>
  )
}
