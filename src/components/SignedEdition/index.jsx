import React, { useState, useEffect } from "react"
import { message } from "antd"
import styled from "@emotion/styled"

export default function IdentifiSignedEditioncationCard({ params, templateId, signName, onChange, timer, setTimer, fingerParams, isHaveFinger, fingerData }) {
  const [img, setImg] = useState("") //签名
  const [fingerImg, setFingerImg] = useState("") //指纹
  const [width, setWidth] = useState(240) //签字版宽度

  useEffect(() => {
    if(!signName.length) {
      setImg("")
    }else {
      for(let i=0; i<signName.length; i++) {
        if(signName[i].id === templateId) {
          setImg(signName[i][params])
          break;
        }else {
          setImg("")
        }
      }
    }
  }, [templateId, signName])

  useEffect(() => {
    if(!fingerData.length) {
      setFingerImg("")
    }else {
      for(let i=0; i<fingerData.length; i++) {
        if(fingerData[i].id === templateId) {
          setFingerImg(fingerData[i][fingerParams])
          break;
        }else {
          setFingerImg("")
        }
      }
    }
  }, [templateId, fingerData])

  useEffect(() => {
    setSignWidth()
  }, [isHaveFinger])

  // 向签字板发送请求
  const request = async (endpoint) => {
    const response = await fetch(`http://127.0.0.1:9001${endpoint}`, {
      method: "GET",
      "Content-Type": "application/json",
    })
    return response.json()
  }

  // 设置签字版宽度
  const setSignWidth = () => {
    if(isHaveFinger) {
      setWidth(110)
    }
  }

  // 签字版循环请求计数
  var requestNumber = 0
  var requestInterval = null

  // 获取签名base64图片
  const GetSignData = async (timestamp, type) => {
    var url = `/hand-written-signature/${timestamp}`
    const res = await request(url)
    if (res.isSuccess && res.result) {
      if(type === "handWritten") {
        if(!res.result.handWritten) {
          message.error("请录入签名信息")
          return
        }
        setImg("data:image/png;base64," + res.result.handWritten)
        onChange(params, "data:image/png;base64," + res.result.handWritten, templateId, false)
      }else if(type === "fingerPrint") {
        if(!res.result.fingerPrint) {
          message.error("请录入指纹信息")
          return
        }
        setFingerImg("data:image/png;base64," + res.result.fingerPrint)
        onChange(fingerParams, "data:image/png;base64," + res.result.fingerPrint, templateId, true)
      }
      console.log("🚀 ~ 获取base64成功")
      // 清除循环获取
      clearInterval(requestInterval)
      requestInterval = null
      setTimer(null)
    }
  }

  // 弹出窗口
  const StartSignDlg = async (type) => {
    clearInterval(timer)
    let timestamp = new Date().getTime()
    const res = await request(`/hand-written-tablet/${timestamp}`)
    console.log("签名窗口弹出成功")
    if (res.isSuccess) {
      requestNumber = 0
      requestInterval = setInterval(() => {
        if (requestNumber < 30) {
          requestNumber++
          GetSignData(timestamp, type)
          console.log("🚀 ~ 获取指纹签字板" + requestNumber + "次")
        } else {
          clearInterval(requestInterval)
          requestInterval = null
          setTimer(null)
        }
      }, 1000)
      setTimer(requestInterval)
    }
  }

  return (
    <>
      <Write>
        <WriteName onClick={() => StartSignDlg("handWritten")} width={width}>
          {img ? <img src={img} style={{ width, height: 64 }} /> : <span>签名</span>}
        </WriteName>
        <WriteFinger
          onClick={() => StartSignDlg("fingerPrint")} 
          style={{ display: isHaveFinger ? "" : "none", background: fingerImg ? "" : "rgb(210, 210, 210)" }}
        >
          {fingerImg ? <img src={fingerImg} style={{ width: 55 , height: 64 }} /> : <span>指纹</span>}
        </WriteFinger>
      </Write>
    </>
  )
}

const Write = styled.div`
  display: flex;
`
// 默认情况下是240px
const WriteName = styled.div`
  width: ${props => props.width}px;
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 15px;
  background: rgb(210, 210, 210);
  border-radius: 6px;
  cursor: pointer;
`
const WriteFinger = styled.div`
  width: 110px;
  height: 60px;
  line-height: 60px;
  text-align: center;
  margin-left: 20px;
  color: #fff;
  font-size: 15px;
  border-radius: 6px;
  cursor: pointer;
`