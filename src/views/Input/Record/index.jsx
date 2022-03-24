import React, { useState, useEffect, useCallback, useRef } from "react"
import styled from "@emotion/styled"
import { Space, Row, Col, Button, Modal, message } from "antd"
const { confirm } = Modal
import { SectionTitle } from "../../../style"
import { useParams, useHistory } from "react-router-dom"

import recordUploadBg from "../../../assets/input/record-upload-bg.png"
import recordCornersBg from "../../../assets/input/record-corners-bg.png"
import { BackShadowWraper, BackShadow } from "../../../style.js"

import UploadFile from "../../../components/UploadFile"
import PrintImage from "../../../layout/PrintImage"
import RevisionRecord from "../../../components/RevisionRecord"
import TagSelect from "../../../components/TagSelect"
import PDFUpload from "../../../components/PDFUpload"

import api from "../../../utils/request"
import { downloadImg } from "../../../utils/downloadImg.js"

import { getDate } from "../../../utils/date"

export default function Record() {
  const history = useHistory()
  const { id: pid } = useParams() //患者ID
  const [info, setInfo] = useState("") //初始化的患者信息
  const [img, setImg] = useState("") //图片信息

  // 文件列表
  const [pdfList, setPdfList] = useState([])

  // 获取化验单信息
  const getPatientInfo = async () => {
    const res = await api.get("/patient/basic", { pid, type: "case" })
    setInfo(res)
    setImg(res.imgUrl)
  }

  // 上传之前
  const onUploadBefore = () => {
    return new Promise((resolve, reject) => {
      if (img) {
        confirm({
          title: "当前页面存在未保存图片，继续操作会导致该图片丢失，是否继续?",
          content: "丢失的图片可以在回收站找回",
          okText: "确认丢弃",
          okType: "danger",
          cancelText: "取消",
          onOk() {
            // 丢弃
            onDice()
            // 清除img
            setImg("")
            resolve(true)
          },
          onCancel() {
            resolve(false)
          },
        })
      } else {
        resolve(true)
      }
    })
  }

  // 将缓存的图片丢弃
  const onDice = async () => {
    const params = {
      type: "case",
      pid,
      imgUrl: img,
      thumbnailUrl: "",
    }
    const res = await api.post("/cache/dice", params)
  }

  // 将上传的图片放入缓存
  const addSaveCatch = async (url) => {
    const params = {
      pid: pid,
      imgUrl: url,
      type: "case",
    }
    const res = await api.post("/cache/saveCatch", params)
  }

  // 上传图片成功调用
  const onSuccess = (url) => {
    setImg(url)
    addSaveCatch(url)
  }

  // 点击保存按钮的时候
  const onSave = async (labels, date) => {
    if (!img) {
      message.error("病历不能为空")
      return false
    }

    const params = {
      id: info.id,
      pid: pid,
      imgUrl: img,
      labels,
      createTime: date,
    }
    const res = await api.post("/add/addCase", params, {
      success: "新增病历成功",
    })
    setImg("")
    return true
  }

  // 回收站恢复
  const onRecord = (url) => {
    setImg(url)
  }

  // 获取当天所有上传的文件
  const getTodayUploadFile = async () => {
    let res = await api.get("/timeline/doc", {
      pid,
      docType: 1,
      time: getDate(),
    })
    setPdfList(res)
  }

  useEffect(() => {
    getPatientInfo()
    getTodayUploadFile()
  }, [])
  return (
    <>
      <Row
        align="middle"
        justify="space-between"
        gutter={16}
        style={{ padding: "0 0 0 40px" }}
      >
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
            <RevisionRecord
              pid={pid}
              type="case"
              onRecord={onRecord}
              onUploadBefore={onUploadBefore}
            ></RevisionRecord>
            <PDFUpload
              pid={pid}
              onUploadPDF={getTodayUploadFile}
              type="case"
            ></PDFUpload>
            <PrintImage Images={[img]}></PrintImage>
            <Button
              type="primary"
              size="small"
              onClick={() => downloadImg([img])}
            >
              下载
            </Button>
          </Space>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col style={{ flex: 1 }}>
          <BackShadowWraper>
            <UploadFile
              id="case"
              img={img}
              width={616}
              height={435}
              onSuccess={(url) => onSuccess(url)}
              defaultBg={recordUploadBg}
              borderBg={recordCornersBg}
              onUploadBefore={onUploadBefore}
            />
          </BackShadowWraper>
        </Col>
        <Col style={{ width: 346 }}>
          <BackShadow
            style={{
              height: "calc(100vh - 130px)",
              position: "relative",
              padding: 16,
            }}
          >
            <TagSelect
              onSave={onSave}
              pid={pid}
              pdfList={pdfList}
              onDelFile={getTodayUploadFile}
              type="case"
            ></TagSelect>

            <PosBottom>
              <Space size={32}>
                <Button
                  type="primary"
                  onClick={() =>
                    history.replace(`/home/input/record-all/${pid}`)
                  }
                >
                  总览
                </Button>
              </Space>
            </PosBottom>
          </BackShadow>
        </Col>
      </Row>
    </>
  )
}

const PosBottom = styled.div`
  width: 90%;
  text-align: center;
  position: absolute;
  bottom: 24px;
`
