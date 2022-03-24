import React, { useState, useEffect, useCallback, useRef } from "react"
import { useDebounce, useUpdateEffect } from "ahooks"
import styled from "@emotion/styled"
import {
  Space,
  Checkbox,
  Row,
  Col,
  Select,
  Form,
  Input,
  Radio,
  message,
} from "antd"
const { Option } = Select

import { BackShadow, SectionTitle } from "../../../style.js"
import { Switch, Route, Link, useHistory, useParams } from "react-router-dom"

import Informedconsent from "../../../assets/input/Informedconsent.png"
import Laboratorytestreport from "../../../assets/input/Laboratorytestreport.png"
import Medicalrecords from "../../../assets/input/Medicalrecords.png"
import Profilepicture from "../../../assets/input/Profilepicture.png"

import IdentificationCard from "../../../components/IdentificationCard"

import api from "../../../utils/request.js"
import { useStores } from "@/store/useStore.js"

export default function BaseInfo(props) {
  const [form] = Form.useForm()
  const history = useHistory()
  const { idCard } = useParams() //获取url上的患者信息 card+cardType
  const initcard = idCard?.split("_")[0] || ""
  const [initType, setinitType] = useState(idCard?.split("_")[1] || "1")

  // 患者id
  const pid = useRef("")
  const info = useStores("auth")

  // 实时获取患者信息的 state
  const [hasUser, setHasUser] = useState(false)
  const [card, setcard] = useState("")
  const throttledValue = useDebounce(card, { wait: 200 })

  // 四个模块是否录入的flag
  const [hasInput, setHasInput] = useState({
    isCard: false,
    isCase: false,
    isConsent: false,
    isTestSheet: false,
  })

  // 证件是否录入的flag
  const [hasCard, setHasCard] = useState({
    iscard: false,
    isOfficer: false,
    isPassport: false,
    isMarriage: false,
    isFamilyPlan: false,
  })

  useEffect(() => {
    initcard && setcard(initcard)
  }, [])

  useEffect(() => {
    if (props.location.state) {
      const { info, cardType } = props.location.state
      form.setFieldsValue({
        card: info ? info.idNumber : "",
        name: info ? info.patientName : "",
        phone: info ? info.phone : "",
        sex: info ? info.sex : "",
        cardType: cardType ? cardType : "1",
      })
      setinitType(cardType)
      setcard(info.idNumber)
      setHasUser(true)
    }
  }, [])

  // 基本信息 查逻辑
  useUpdateEffect(async () => {
    // 证件号 是空的 清空所有页面状态
    if (throttledValue == "") {
      // history.push(`/home/base-info`)
      clearStatus() //清状态
      pid.current = ""
      return null
    }

    // 解决 刚查完 修改证件号 但是除了证件号之外的信息还是上次的数据问题
    form.setFieldsValue({
      name: "",
      phone: "",
      sex: "",
    })

    getUserInfo({ idCard: throttledValue, type: "input" })
  }, [throttledValue])

  // 清状态
  const clearStatus = () => {
    setHasUser(false)
    form.setFieldsValue({
      card: "",
      name: "",
      phone: "",
      sex: "",
    })

    setHasInput({
      isCard: false,
      isCase: false,
      isConsent: false,
      isTestSheet: false,
    })
    setHasCard({
      iscard: false,
      isOfficer: false,
      isPassport: false,
      isMarriage: false,
      isFamilyPlan: false,
    })
  }

  // 查询患者信息
  const getUserInfo = async ({
    idCard:card,
    name = "",
    sex = "",
    type = "identify",
  }) => {
    // 查患者信息
    const res = await api.getIm(
      "/patient/patientInfo",
      { card, cardType: initType },
      { error: "" }
    )

    // 查到了
    if (res) {
      history.push(`/home/base-info/${res.card}_${res.cardType}`)
      pid.current = res.id
      setHasUser(false)
      form.setFieldsValue({
        card: res.card,
        name: res.name,
        phone: res.phone,
        sex: res.sex,
      })
      setHasInput({
        isCard: res.paperwork,
        isCase: res.isCase,
        isConsent: res.isConsent,
        isTestSheet: res.isTestSheet,
      })
      setHasCard({
        iscard: res.isIdCard,
        isOfficer: res.isOfficer,
        isPassport: res.isPassport,
        isMarriage: res.isMarriage,
        isFamilyPlan: res.isFamilyPlan,
      })
    } else {
      // 没查到
      setHasUser(true)

      if (type == "identify") {
        form.setFieldsValue({
          card,
          name,
          sex,
          phone: "",
        })
      } else {
        form.setFieldsValue({
          name,
          sex,
          phone: "",
        })
      }
    }
  }

  // 点击 勾选按钮 添加患者信息
  const clickAddUser = (e) => {
    if (e.target.checked) {
      // 用户已经存在不可以添加
    } else {
      form.submit()
    }
  }

  // 执行添加患者信息
  const addUser = async () => {
    const params = form.getFieldValue()
    params.coupleNum = 0
    // sivf跳转过来新增用户
    if (window.sessionStorage.getItem("info")) {
      const userInfo = JSON.parse(window.sessionStorage.getItem("info"))
      params.account = userInfo.userName
    } else {
      const userInfo = await info.getUserInfo()
      params.account = userInfo.username
    }
    const res = await api.postIm("/patient/addPatient", params, {
      success: "添加患者信息成功",
    })
    history.push(`/home/base-info/${card}_${initType}`)
  }

  // 跳转页面
  const toPage = useCallback((url) => {
    pid.current == "" ? message.error("请选择录入患者") : history.push(url)
  }, [])

  // 切换证件类型type
  const onChangeType = (val) => {
    setinitType(val)
    clearStatus()
  }

  // hover 弹出的box部分
  const PopList = () => (
    <CardItem className="CardItem">
      <CardItemColor
        active={hasCard.iscard}
        onClick={() => toPage(`/home/input/id-card/${pid.current}`)}
      >
        身份证
      </CardItemColor>
      <CardItemColor
        active={hasCard.isOfficer}
        onClick={() => toPage(`/home/input/officer/${pid.current}`)}
      >
        军官证
      </CardItemColor>
      <CardItemColor
        active={hasCard.isPassport}
        onClick={() => toPage(`/home/input/passport/${pid.current}`)}
      >
        护照
      </CardItemColor>
      <CardItemColor
        active={hasCard.isMarriage}
        onClick={() => toPage(`/home/input/marry/${pid.current}`)}
      >
        结婚证
      </CardItemColor>
      <CardItemColor
        active={hasCard.isFamilyPlan}
        onClick={() => toPage(`/home/input/plan/${pid.current}`)}
      >
        其他
      </CardItemColor>
    </CardItem>
  )

  return (
    <>
      <BackShadow style={{ margin: 14 }}>
        <Row align="middle" justify="center" gutter={16}>
          <Col>
            <SectionTitle>基本信息</SectionTitle>
          </Col>
          <Col>
            <LimitHight>
              <Form
                onFinish={addUser}
                initialValues={{ sex: 0, cardType: initType }}
                form={form}
              >
                <Space gutter={16}>
                  <Form.Item name="cardType" style={{ width: 100 }}>
                    <Select onChange={onChangeType}>
                      <Option value="1">身份证</Option>
                      <Option value="2">军官证</Option>
                      <Option value="3">护照</Option>
                      <Option value="4">其他</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="card"
                    rules={[
                      {
                        required: true,
                        message: "请输入证件号!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="请输入证件"
                      allowClear
                      onChange={(e) => setcard(e.target.value)}
                      maxLength={18}
                    />
                  </Form.Item>
                  <Form.Item
                    name="name"
                    label="姓名"
                    style={{ width: 160 }}
                    rules={[
                      {
                        required: true,
                        message: "请输入姓名!",
                      },
                    ]}
                  >
                    <Input allowClear type="text" />
                  </Form.Item>
                  <Form.Item
                    name="sex"
                    label="性别"
                    rules={[
                      {
                        required: true,
                        message: "请选择性别!",
                      },
                    ]}
                  >
                    <Radio.Group>
                      <Radio value={0}>男</Radio>
                      <Radio value={1}>女</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    label="电话"
                    style={{ width: 190 }}
                    rules={[
                      {
                        required: true,
                        message: "请输入电话!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="请输入电话"
                      allowClear
                      maxLength={11}
                      type="tel"
                    />
                  </Form.Item>
                </Space>
              </Form>
            </LimitHight>
          </Col>
          {/* 是否可录入 */}
          <Col>
            <BigCheck>
              <Checkbox checked={hasUser} onClick={clickAddUser}></Checkbox>
            </BigCheck>
          </Col>
          {/* 身份证识别 */}
          <Col span={1}>
            {initType == "1" && (
              <IdentificationCard
                onChange={(userObj) => getUserInfo(userObj)}
              ></IdentificationCard>
            )}
          </Col>
        </Row>
      </BackShadow>

      <BackShadow
        style={{
          margin: 14,
          height: "calc(100vh - 200px)",
          paddingTop: "calc((100vh - 616px)/2)",
        }}
      >
        <Row gutter={76} justify="center">
          <Col>
            <CardBox bgColor={hasInput.isCard ? "#439EFF" : "#ccc"}>
              <img src={Informedconsent} style={{ width: 110 }} />
              <h5 style={{ color: "#fff", marginTop: 16 }}>证件照</h5>
              <PopList></PopList>
            </CardBox>
          </Col>
          <Col>
            <CardBox
              bgColor={hasInput.isCase ? "#A49CFF" : "#ccc"}
              onClick={() => toPage(`/home/input/record/${pid.current}`)}
            >
              <img src={Medicalrecords} style={{ width: 110 }} />
              <h5 style={{ color: "#fff", marginTop: 16 }}>病历</h5>
            </CardBox>
          </Col>
        </Row>
        <Row gutter={76} justify="center" style={{ marginTop: 30 }}>
          <Col>
            <CardBox
              bgColor={hasInput.isConsent ? "#F7B82D" : "#ccc"}
              onClick={() => toPage(`/home/input/consent/${pid.current}`)}
            >
              <img src={Profilepicture} style={{ width: 110 }} />
              <h5 style={{ color: "#fff", marginTop: 16 }}>知情同意书</h5>
            </CardBox>
          </Col>
          <Col>
            <CardBox
              bgColor={hasInput.isTestSheet ? "#71B5FF" : "#ccc"}
              onClick={() => toPage(`/home/input/signed/${pid.current}`)}
            >
              <img src={Laboratorytestreport} style={{ width: 110 }} />
              <h5 style={{ color: "#fff", marginTop: 16 }}>化验单</h5>
            </CardBox>
          </Col>
        </Row>
      </BackShadow>
    </>
  )
}

const LimitHight = styled.div`
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

const BigCheck = styled.div`
  .ant-checkbox-inner {
    padding: 14px;

    &::after {
      width: 8px;
      height: 14px;
      margin-left: 2px;
    }
  }
`

const CardBox = styled.div`
  width: 276px;
  height: 185px;
  font-size: 12;
  box-shadow: 0px 2px 6px 0px rgba(234, 234, 234, 1);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  background-color: ${(props) => props.bgColor};
  overflow: hidden;
  transition: all 0.4s;

  &:hover {
    .CardItem {
      top: 0;
    }
  }
`

const CardItem = styled.div`
  position: absolute;
  top: 186px;
  left: 0;
  width: 100%;
  text-align: center;
  background-color: #fff;
  transition: all 0.6s;
`

const CardItemColor = styled.div`
  height: 37px;
  line-height: 37px;
  margin: 0;
  color: ${(props) => (props.active == 1 ? "#6986f4" : "#ccc")};

  &:hover {
    background-color: #6d8cf61a;
  }
`
