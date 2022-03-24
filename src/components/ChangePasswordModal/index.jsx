import React, { useEffect, useState } from "react"
import { Modal, Button, Form, Row, Col, Input, message } from "antd"
import { useStores } from "@/store/useStore.js"

const ChangePasswordModal = ({ cancel }) => {
  const [passwordForm] = Form.useForm()
  const { changePassword, userInfo } = useStores("auth")
  const layout = { labelCol: { span: 4 } }
  const title = (
    <h3
      style={{
        width: "100%",
        textAlign: "center",
      }}
    >
      修改密码
    </h3>
  )
  const footer = (
    <Row justify="center" gutter={32}>
      <Button type="primary" onClick={() => submit()}>
        确认
      </Button>
      <Button onClick={() => cancel()}>取消</Button>
    </Row>
  )

  const submit = async () => {
    const passwordValues = passwordForm.getFieldValue()
    if (passwordValues.newPassword !== passwordValues.confirmPassword) {
      return message.error("两次输入的新密码不一致，请重新输入")
    }
    const res = await changePassword({
      ...passwordValues,
      username: userInfo.username,
    })
    cancel()
  }

  return (
    <Modal
      title={title}
      visible={true}
      footer={footer}
      onCancel={() => cancel()}
      onOk={submit}
    >
      <Form {...layout} form={passwordForm}>
        <Form.Item label="旧密码" name="oldPassword">
          <Input.Password size="small" placeholder="请输入旧密码" />
        </Form.Item>
        <Form.Item label="新密码" name="newPassword">
          <Input.Password size="small" placeholder="请输入新密码" />
        </Form.Item>
        <Form.Item label="确认新密码" name="confirmPassword">
          <Input.Password size="small" placeholder="请确认新密码" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ChangePasswordModal
