import React, { useState, useEffect } from "react"
import styled from "@emotion/styled"
import { Switch, Route, Link, useHistory, useParams } from "react-router-dom"
import { Modal, Button, Input } from "antd"
import { BackShadow, SectionTitle } from "../../../style.js"

import Account from "./Account"
import Apply from "./Apply"

const { TextArea } = Input

export default function All({ show, close }) {
  const handleOk = () => {
    close(false)
  }

  const handleCancel = () => {
    close(false)
  }

  return (
    <>
      <Modal
        title="添加角色"
        visible={show}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <TextArea rows={3} />
      </Modal>
    </>
  )
}
