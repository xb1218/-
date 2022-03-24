import React from "react"
import { Modal } from "antd"

const { confirm } = Modal

export const onUploadBefore = () => {
  return new Promise((resolve, reject) => {
    // 上传之前 如果存在图片了 就拦截
    confirm({
      title: "当前页面存在未保存图片，继续操作会导致该图片丢失，是否继续?",
      content: "丢失的图片可以在回收站找回",
      okText: "确认丢弃",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        resolve("ok")
      },
      onCancel() {
        reject("err")
      },
    })
  })
}
