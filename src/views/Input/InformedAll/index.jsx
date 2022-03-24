import React, { useState, useEffect } from "react"
import { LeftOutlined } from "@ant-design/icons"
import styled from "@emotion/styled"
import { Space, Row, Col, Button } from "antd"

import { BackShadow, SectionTitle } from "../../../style.js"
import { Link, useHistory, useParams } from "react-router-dom"
import api from "../../../utils/request"

import InformModal from "../../../components/InformModal"
import PrintInformed from "../../../layout/printInformed"
import resignImg from "../../../assets/input/resign.svg"

export default function InformedAll() {
  const iconStyle = { fontSize: 14, cursor: "pointer" }
  const history = useHistory()
  const { id: pid } = useParams()
  const [info, setInfo] = useState("")
  const [visible, setVisible] = useState(false)
  const [template, setTemplate] = useState([]) //所有的知情同意书
  const [allTemplateName, setAllTemplateName] = useState([]) //选中的全部的模板名
  const [signed, setSigned] = useState([]) //已经签署的知情同意书
  const [notSigned, setNotSigned] = useState([]) //需补签的知情同意书
  const [waitSigned, setWaitSigned] = useState([]) //待签的知情同意书
  const [informedPath, setInformedPath] = useState("") //页面中展示的模板路径
  const [signedIndex, setSignedIndex] = useState(null)
  const [notSignedIndex, setNotSignedIndex] = useState(null)
  const [toBeSignedIndex, setToBeSignedIndex] = useState(null)
  const [isHidden, setIsHidden] = useState(false)
  
  useEffect(async () => {
    getPatientInfo()
  }, [])

  useEffect(() => {
    getInformed()
  }, [allTemplateName, template])

  // 获取用户信息
  const getPatientInfo = async () => {
    const res = await api.getIm("/patient/basics", { pid })
    setInfo(res)
  }

  // 获取签署和未签署的知情同意书
  const getInformed = async () => {
    let signedArr = []
    let signedSortArr = []
    let notSignedArr = []
    let signedArray = []
    let waitSignedArray = []
    let arr = []
    let status = ""
    // 所有签署过的知情同意书
    if(template.length) {
      const model = await api.getIm("/query/consents", { pid })
      template.forEach(item => {
        model.forEach(list => {
          if(list.name === item.templateFile) {
            signedArr.push(list)
          }
        })
      })
      status = signedArr[0] && signedArr[0].name
      signedArr.forEach(item => {
        if(!signedSortArr.length) {
          signedSortArr.push(item)
        }else {
          if(item.name !== status) {
            signedSortArr.push(item)
            status = item.name
          }else {
            item.tag = true
            arr.push(item)
          }
        }
      })
      signedArray = [...signedSortArr, ...arr]
      setSigned(signedArray)
    }
    // 查询补签/待签的知情同意书
    if(allTemplateName.length) {
      // 补签
      const replenishSign = await api.getIm("/file/makeUpNames", { pid })
      replenishSign.forEach(item => {
        allTemplateName.forEach(list => {
          if(item === list.name) {
            notSignedArr.push(list)
          }
        })
      })
      // 待签
      waitSignedArray = [...allTemplateName]
      notSignedArr.forEach(item => {
        waitSignedArray.forEach((list, index) => {
          if(item.name === list.name) {
            waitSignedArray.splice(index, 1)
          }
        })
      })
      setWaitSigned([...waitSignedArray])
      setNotSigned(notSignedArr)
    }
    if(notSignedArr.length) {
      setSignedIndex(null)
      setToBeSignedIndex(null)
      setNotSignedIndex(0)
      setInformedPath(notSignedArr[0].modelPath + "/" + notSignedArr[0].name + ".html")
    }else if(allTemplateName.length) {
      setNotSignedIndex(null)
      setSignedIndex(null)
      setToBeSignedIndex(0)
      setInformedPath(allTemplateName[0].modelPath + "/" + allTemplateName[0].name + ".html")
    }else if(signedArray.length) {
      setNotSignedIndex(null)
      setToBeSignedIndex(null)
      setSignedIndex(0)
      setInformedPath(signedArray[0].imgUrl)
      setIsHidden(true)
    }
  }

  //补签
  const resign = (id, status) => {
    history.push({
      pathname: `/home/input/consent/${pid}`,
      state: {
        id,
        status
      }
    })
  }

  // 点击补签的模板
  const handleNotSigned = (item, index) => {
    setSignedIndex(null)
    setToBeSignedIndex(null)
    setNotSignedIndex(index)
    setInformedPath(item.modelPath + "/" + item.name + ".html")
    setIsHidden(false)
  }

  // 点击签署的模板
  const handleSigned = (item, index) => {
    setNotSignedIndex(null)
    setToBeSignedIndex(null)
    setSignedIndex(index)
    setInformedPath(item.imgUrl)
    setIsHidden(true)
  }

  // 点击未签署的模板
  const toBeSign = (item, index) => {
    setNotSignedIndex(null)
    setSignedIndex(null)
    setToBeSignedIndex(index)
    setInformedPath(item.modelPath + "/" + item.name + ".html")
    setIsHidden(false)
  }

  return (
    <div style={{ padding: 16 }}>
      <Row align="middle" justify="space-between">
        <Col>
          <Link to={`/home/input/consent/${pid}`}>
            <Space>
              <LeftOutlined style={iconStyle} />
              <span>返回</span>
            </Space>
          </Link>
        </Col>
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
          <Space style={{ visibility: isHidden ? "hidden" : "" }}>
            <PrintInformed
              informed={ informedPath }>
            </PrintInformed>
          </Space>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col style={{ flex: 1 }}>
          <BackShadow
            style={{
              height: "calc(100vh - 130px)",
              textAlign: "center",
              overflow: "auto",
              padding: "24px 16px",
            }}
          >
            <iframe 
              src={ informedPath }
              frameBorder={0}
              width="100%" 
              height="95%"
            />
          </BackShadow>
        </Col>
        <Col style={{ width: 346 }}>
          <BackShadow
            style={{ height: "calc(100vh - 130px)", position: "relative", overflowY: "scroll" }}
          >
            <SectionTitle>需补签</SectionTitle>
            {
              notSigned.map((item, index) => {
                return (
                  <OutLineSpan 
                    key={index}
                    style={{color: notSignedIndex === index && "#6880FD"}}
                    onClick={() => {handleNotSigned(item, index)}}
                  >
                    {item.name.substring(2)}
                    <img 
                      src={resignImg} 
                      style={{marginLeft: "10px"}}
                      onClick={() => {resign(item.id, true)}}
                    />
                  </OutLineSpan>
                )
              })
            }
            <SectionTitle>待签</SectionTitle>
            {
              waitSigned.map((item, index) => {
                return (
                  <OutLineSpan
                    key={index}
                    style={{color: toBeSignedIndex === index && "#6880FD"}}
                    onClick={() => {toBeSign(item, index)}}
                  >
                    {item.name.substring(2)}
                    <img
                      src={resignImg}
                      style={{marginLeft: "10px"}}
                      onClick={() => resign(item.id, false)}
                    />
                  </OutLineSpan>
                )
              })
            }
            <SectionTitle>已签署</SectionTitle>
            {
              signed.map((item, index) => {
                return (
                  <OutLineSpan 
                    key={index}
                    decoration={item.tag && "line-through"}
                    style={{color: signedIndex === index ? "#6880FD" : item.tag ? "#ADAEAE" : ""}}
                    onClick={() => {handleSigned(item, index)}}
                  >
                    {item.name.substring(2)}
                  </OutLineSpan>
                )
              })
            }
            <PosBottom>
              <Button 
                type="primary"
                onClick={() => history.push(`/home/input/consent/${pid}`)}
              >
                录入
              </Button>
            </PosBottom>
          </BackShadow>
        </Col>
      </Row>
      <InformModal 
        visible={visible}
        changeTemplate={(template) => setAllTemplateName(template)}
        getAllTemplate={(template) => setTemplate(template)}
        onCancel={() => {
          setVisible(false)
        }}
      />
    </div>
  )
}

const PosBottom = styled.div`
  width: 90%;
  text-align: center;
  position: flxed;
  margin-top: 20px;
  bottom: 24px;
`

const OutLineSpan = styled.div`
  color: ${(props) => props.color || "#000"};
  text-decoration: ${(props) => props.decoration || "underline"};
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
`

