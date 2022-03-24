import React, { useState, useEffect, useCallback, useRef } from "react"
import styled from "@emotion/styled"
import { Space, Row, Col, Button, Modal, message } from "antd"

import api from "../../utils/request"

export default function PDFUpload({ pid, onUploadPDF, type }) {
  const inputRef = useRef("")

  // 上传文件
  const onUploadImg = async (e) => {
    e.preventDefault()
    let file = e.target.files[0]
    let name = e.target.files[0].name

    if (file) {
      const res = await api.file("/upload/file", file)
      addPDF(name, res.imgUrl)
    }
  }

  // 上传pdf
  const addPDF = async (name, imgUrl) => {
    const params = {
      pid,
      name,
      imgUrl,
    }
    const res = await api.post(
      `/add/${type == "case" ? "addCasePdf" : "addTestPdf"}`,
      params,
      {
        success: "上传文件成功",
      }
    )
    onUploadPDF()
  }

  return (
    <>
      <input
        id="uploadFile"
        style={{ display: "none" }}
        type="file"
        onChange={onUploadImg}
        ref={inputRef}
      />
      <Button
        type="primary"
        size="small"
        onClick={() => inputRef.current.click()}
      >
        上传文件
      </Button>
    </>
  )
}
