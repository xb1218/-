import React, { useState, useEffect } from "react"
import { Row, Button } from "antd"
import styled from "@emotion/styled"
import { BaseModal } from "../../style"

export default function SignModal({ visible, onCancel, onOk, title }) {
  const footer = (
    <Row justify="center" gutter={32}>
      <Button type="primary" onClick={onOk}>
        确认
      </Button>
    </Row>
  )
  return (
    <>
      <BaseModal
        title="温馨提示"
        visible={visible}
        onCancel={onCancel}
        footer={footer}
        width={400}
        height={200}
      >
        <SignDiv>{title}</SignDiv>
      </BaseModal>
    </>
  )
}

const SignDiv = styled.div`
  line-height: 100px;
  text-align: center;
  font-size: 14px;
`