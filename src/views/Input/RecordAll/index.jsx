import React, { useState, useEffect, useRef } from "react"
import styled from "@emotion/styled"
import { Space, Row, Col, Button, Spin, Modal } from "antd"
import { LeftOutlined, RightOutlined, DeleteOutlined } from "@ant-design/icons"
const { confirm } = Modal

import { BackShadowWraper, BackShadow } from "../../../style.js"

import { downloadImg } from "../../../utils/downloadImg.js"
import PrintImage from "../../../layout/PrintImage"

import { useParams, useHistory } from "react-router-dom"
import api from "../../../utils/request.js"

import TagOver from "./TagOver"
import TimeOver from "./TimeOver"

export default function Record() {
  const history = useHistory()
  const { id: pid } = useParams() //患者ID
  const [info, setInfo] = useState("") //用户信息
  const [type, setType] = useState("tag") //当前总览模式

  // 图片
  const [imgList, setImgList] = useState([]) //图片数组
  const [previewIndex, setPreviewIndex] = useState(0) //当前预览图片下标

  // loading
  const [isLoad, setIsLoad] = useState(false)

  // ref
  const tagOverRef = useRef("")
  const timeOverRef = useRef("")

  // 搜索模式下 的图片
  const onSearch = async (labelName, time = "") => {
    if (labelName == "") {
      setImgList([])
      return null
    }
    setIsLoad(true)
    const res = await api.get(`/${type == "tag" ? "label" : "timeline"}/doc`, {
      pid,
      docType: 1,
      labelName,
      time,
    })
    setPreviewIndex(0)
    setImgList(res)
    setIsLoad(false)
  }

  // 删除化验单
  const onBeforeDel = () => {
    confirm({
      title: "是否确认删除病历?",
      okText: "确认删除",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        onDelImg()
      },
      onCancel() {},
    })
  }

  // 删除
  const onDelImg = async () => {
    const imgUrl = imgList[previewIndex]?.imgUrl
    const id = imgList[previewIndex]?.docId
    const res = await api.post(
      "/cache/diceOverCase",
      { id, pid, imgUrl },
      { success: "删除病历图片成功" }
    )
    type == "tag"
      ? tagOverRef.current.getTags() //重新获取标签列表
      : timeOverRef.current.getTags()
  }

  // 获取用户信息
  const getPatientInfo = async () => {
    const res = await api.get("/patient/basic", { pid, type: "case" })
    setInfo(res)
  }

  useEffect(() => {
    getPatientInfo()
  }, [])

  // 获取当前预览图片id
  const getPreviewImgId = () => {
    return imgList[previewIndex].docLabelId
  }

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
            <PrintImage Images={[imgList[previewIndex]?.imgUrl]}></PrintImage>
            <Button
              type="primary"
              size="small"
              onClick={() => downloadImg(imgList)}
            >
              下载
            </Button>
          </Space>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col style={{ flex: 1 }}>
          <Spin spinning={isLoad}>
            <BackShadowWraper
              style={{ userSelect: "none", justifyContent: "start" }}
            >
              {imgList.length != 0 && (
                <>
                  {/* 图片定位 */}
                  <h4>
                    {previewIndex + 1} / {imgList.length}
                  </h4>
                  <Row
                    align="middle"
                    justify="space-between"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <Col>
                      {/* 上一张 */}
                      <CheckIcon
                        onClick={() =>
                          setPreviewIndex((prev) => prev === 0 ? imgList.length - 1 : prev - 1)
                        }
                      >
                        <LeftOutlined />
                      </CheckIcon>
                    </Col>
                    <Col style={{ flex: 1 }}>
                      <ImgContain>
                        <a
                          href={imgList[previewIndex]?.imgUrl || ""}
                          target="_blank"
                        >
                          <img
                            src={imgList[previewIndex]?.imgUrl || ""}
                            style={{ height: "calc(100vh - 240px)" }}
                          />
                        </a>
                        <div className="delIcon" onClick={onBeforeDel}>
                          <DeleteOutlined
                            style={{ color: "#b6071b", fontSize: 32 }}
                          />
                        </div>
                      </ImgContain>
                    </Col>
                    <Col>
                      {/* 下一张 */}
                      <CheckIcon
                        onClick={() =>
                          setPreviewIndex((prev) => (prev + 1) % imgList.length)
                        }
                      >
                        <RightOutlined />
                      </CheckIcon>
                    </Col>
                  </Row>
                </>
              )}
              {imgList.length == 0 && (
                <p style={{ marginTop: 40, fontSize: 12, color: "#999" }}>
                  暂无病历
                </p>
              )}
            </BackShadowWraper>
          </Spin>
        </Col>
        <Col style={{ width: 346 }}>
          <BackShadow
            style={{
              height: "calc(100vh - 130px)",
              position: "relative",
              padding: 16,
            }}
          >
            <Row justify="space-between">
              <Col></Col>
              <Col>
                {type == "tag" && (
                  <CheckItem onClick={() => setType("time")}>
                    时间轴总览
                  </CheckItem>
                )}
                {type == "time" && (
                  <CheckItem onClick={() => setType("tag")}>标签总览</CheckItem>
                )}
              </Col>
            </Row>
            {type == "tag" && (
              <TagOver
                pid={pid}
                onClickTag={onSearch}
                onRef={tagOverRef}
                getPreviewImgId={getPreviewImgId}
              ></TagOver>
            )}
            {type == "time" && (
              <TimeOver
                pid={pid}
                onClickTag={onSearch}
                onRef={timeOverRef}
                getPreviewImgId={getPreviewImgId}
              ></TimeOver>
            )}
            <PosBottom>
              <Button
                type="primary"
                onClick={() => history.replace(`/home/input/record/${pid}`)}
              >
                录入
              </Button>
            </PosBottom>
          </BackShadow>
        </Col>
      </Row>
    </>
  )
}

const CheckItem = styled.span`
  color: #7aa0fc;
  text-decoration: underline;
  cursor: pointer;
`

const PosBottom = styled.div`
  width: 90%;
  text-align: center;
  position: absolute;
  bottom: 20px;
`
const CheckIcon = styled.div`
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 14px;

  :hover {
    background-color: #eee;
  }
`

const ImgContain = styled.div`
  position: relative;
  text-align: center;
  overflow: hidden;
  cursor: pointer;

  :hover {
    .delIcon {
      bottom: 0;
    }
  }

  .delIcon {
    position: absolute;
    bottom: -66px;
    left: 0;
    width: 100%;
    height: 64px;
    background-color: #ee787878;
    padding-top: 14px;
    transition: all 0.2s;
  }
`
