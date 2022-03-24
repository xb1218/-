import React from "react"
import { Button, message } from "antd"

const request = async (endpoint) => {
  const response = await fetch(`http://127.0.0.1:9001${endpoint}`, {
    method: "GET",
    "Content-Type": "application/json",
  })
  return response.json()
}

export default function IdentificationCard({ onChange }) {
  // 连接
  const connect = async () => {
    let timestamp = new Date().getTime()
    const res = await request(`/id-card-info/${timestamp}`)
    if(res.isSuccess) {
      message.success({
        content: "读取身份证信息成功",
        className: "custom-success-class"
      })
      const userObj = {
        idCard: res.result.id,
        name: res.result.name,
        sex: res.result.sex === "男" ? 0 : 1
      }
      onChange(userObj)
    }else {
      message.warning({
        content: res.note,
        className: "custom-error-class"
      })
    }
  }

  return (
    <>
      <Button className="reserve-btn-color" onClick={connect}>
        身份证识别
      </Button>
    </>
  )
}
