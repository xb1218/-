import React, { useState, useEffect, useRef } from "react"
import styled from "@emotion/styled"
import { Row, Col, Space, Menu, Button } from "antd"
import { useReactToPrint } from "react-to-print"

export default function PrintInformed({ informed }) {
  // 打印组件ref
  const PrintRef = useRef()

  //   打印hook
  const handlePrint = useReactToPrint({
    content: () => PrintRef.current,
  })

  return (
    <>
      <Button type="primary" size="small" onClick={handlePrint}>
        打印
      </Button>
      {/* div控制在页面上不显示  */}
      <div style={{ display: "none" }}>
        <Row justify="center" ref={PrintRef}>
          <iframe 
            src={ informed }
            frameBorder={0}
            width="100%" 
            height="5000px"
          />
        </Row>
      </div>
    </>
  )
}
