import React, { useState } from "react"
import { Modal, Button, Row, Col, Input } from "antd"

function HelpModal({ isModalVisible, handleCancel }) {
  const handleOk = () => {
    console.log(
      "🚀 ~ file: addDetectModal.jsx ~ line 22 ~ handleOk ~ handleOk",
      "handleOk"
    )
    handleCancel()
  }

  const title = <h3 style={{ width: "100%", textAlign: "center" }}>帮助中心</h3>

  const footer = (
    <Row justify="center" gutter={32}>
      <Button type="primary" onClick={() => handleOk()}>
        确认
      </Button>
    </Row>
  )

  const layout = {
    labelCol: { span: 4 },
  }

  return (
    <>
      <Modal
        title={title}
        visible={isModalVisible}
        onOk={handleOk}
        cancelText="取消"
        okText="确认"
        centered
        footer={footer}
        onCancel={() => handleCancel()}
      >
        <Input.TextArea
          rows={20}
          value="  微信公众平台是运营者通过公众号为微信用户提供资讯和服务的平台，而公众平台开发接口则是提供服务的基础，开发者在公众平台网站中创建公众号、获取接口权限后，可以通过阅读本接口文档来帮助开发。
          为了识别用户，每个用户针对每个公众号会产生一个安全的OpenID，如果需要在多公众号、移动应用之间做用户共通，则需前往微信开放平台，将这些公众号和应用绑定到一个开放平台账号下，绑定后，一个用户虽然对多个公众号和应用有多个不同的OpenID，但他对所有这些同一开放平台账号下的公众号和应用，只有一个UnionID，可以在用户管理-获取用户基本信息（UnionID机制）文档了解详情。
          1、微信公众平台开发是指为微信公众号进行业务开发，为移动应用、PC端网站、公众号第三方平台（为各行各业公众号运营者提供服务）的开发，请前往微信开放平台接入。
          2、在申请到认证公众号之前，你可以先通过测试号申请系统，快速申请一个接口测试号，立即开始接口测试开发。
          3、在开发过程中，可以使用接口调试工具来在线调试某些接口。
          4、每个接口都有每日接口调用频次限制，可以在公众平台官网-开发者中心处查看具体频次。
          5、在开发出现问题时，可以通过接口调用的返回码，以及报警排查指引（在公众平台官网-开发者中心处可以设置接口报警），来发现和解决问题。
          6、公众平台以access_token为接口调用凭据，来调用接口，所有接口的调用需要先获取access_token，access_token在2小时内有效，过期需要重新获取，但1天内
          获取次数有限，开发者需自行存储，详见获取接口调用凭据（access_token）文档。
          7、公众平台接口调用仅支持80端口。"
        ></Input.TextArea>
      </Modal>
    </>
  )
}

export default HelpModal
