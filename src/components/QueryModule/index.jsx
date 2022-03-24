import React from "react"
import {
  DatePicker,
  Input,
  Button,
  Space,
  Form,
  Row,
  Col,
  Radio,
  Select,
} from "antd"
import { BackShadow, SectionTitle } from "../../style.js"
import styled from "@emotion/styled"
import moment from "moment"

const { Search } = Input
const { Option } = Select

function QueryModule({ onSearch, type }) {
  const [form] = Form.useForm()

  const onFinish = (val) => {
    val.time = val.time?.format().slice(0, 10)
    val.sex = val.sex != 0 && val.sex != 1 ? 2 : val.sex
    onSearch(val)
  }

  return (
    <BackShadow>
      <Row justify="space-between">
        <Col>
          <SectionTitle>查询</SectionTitle>
        </Col>
        <Col>
          <Space size={16}>
            <Button
              type="primary"
              onClick={() => {
                form.submit()
              }}
            >
              查询
            </Button>
            <Button
              type="primary"
              className="reserve-btn-color"
              onClick={() => {
                form.resetFields()
              }}
            >
              重置
            </Button>
          </Space>
        </Col>
      </Row>
      <LimitHight>
        <Form
          onFinish={onFinish}
          initialValues={{ sex: 2, cardType: 0 }}
          form={form}
        >
          <Space size={16}>
            <Form.Item name="name" label="姓名" style={{ width: 140 }}>
              <Input allowClear />
            </Form.Item>

            <Form.Item name="sex" label="性别">
              <Radio.Group placeholder="请输入性别">
                <Radio value={0}>男</Radio>
                <Radio value={1}>女</Radio>
                <Radio value={2}>不限</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="phone" label="电话" style={{ width: 170 }}>
              <Input placeholder="请输入电话" allowClear />
            </Form.Item>

            <Form.Item name="cardType" style={{ width: 100 }}>
              <Select>
                <Option value={0}>所有类型</Option>
                <Option value={1}>身份证</Option>
                <Option value={2}>军官证</Option>
                <Option value={3}>护照</Option>
                <Option value={4}>其他</Option>
              </Select>
            </Form.Item>

            <Form.Item name="card" label="证件">
              <Input placeholder="请输入证件" allowClear />
            </Form.Item>

            <Form.Item
              name="time"
              label={type == "all" ? "创建日期" : "操作日期"}
            >
              <DatePicker />
            </Form.Item>
          </Space>
        </Form>
      </LimitHight>
    </BackShadow>
  )
}

export default QueryModule

const LimitHight = styled.div`
  padding: 10px;

  .ant-space {
    height: 0px;
  }

  .ant-input-affix-wrapper {
    height: 32px;
    padding: 0 8px 0 0;
  }

  .ant-input-affix-wrapper > input.ant-input {
    height: 30px;
    padding: 0 10px;
  }
`
