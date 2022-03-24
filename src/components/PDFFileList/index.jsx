import React, { useState, useEffect, useCallback, useRef } from "react"
import styled from "@emotion/styled"
import { Space, Row, Col, Button, Input, message } from "antd"
import { EditOutlined, DeleteOutlined } from "@ant-design/icons"

import api from "../../utils/request"

export default function PDFList({ pdfList, onChange, type, pid }) {
  // 删除pdf
  const delPdf = async (docId) => {
    const res = await api.del(
      `/label/doc/${type == "case" ? "1" : "0"}/${docId}/${pid}`,
      {},
      { success: "删除文件成功" }
    )
    onChange()
  }

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      {pdfList.map((e, index) => {
        return (
          <Space key={index}>
            <OutLineSpan key={index} href={e.imgUrl} target="_blank">
              {e.docName}
            </OutLineSpan>
            <DeleteOutlined onClick={() => delPdf(e.docId)} />
          </Space>
        )
      })}
    </Space>
  )
}

const OutLineSpan = styled.a`
  color: ${(props) => props.color || "#666"};
  text-decoration: underline;
  cursor: pointer;
  word-break: break-all;
`
