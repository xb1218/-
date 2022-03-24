import React from "react"
import { Form, Input, Button, Select, message } from "antd"
import { useHistory, Link } from "react-router-dom"
import { useStores } from "@/store/useStore.js"
import logo from "../../../assets/logo.png"
import useForm from "../../../hooks/useForm"
import userUrl from "../../../assets/user.png"
import {
  RightWrapper,
  WelcomeText,
  LoginWrapper,
  LoginTitle,
  LogoImage,
  LoginFrom,
  PrefixUsername,
  PrefixPassword,
  LinkRegister,
  TipText,
  TipImage,
  LoginButton,
  SelectWrapper,
  PrefixRole,
  PrefixRealName,
  PrefixHospital,
} from "../style"
import cx from "classnames"

const { Option } = Select

function RegisterR(props) {
  const history = useHistory()
  const { login, register } = useStores("auth")
  const { values, setFiledValue } = useForm({
    username: "",
    password: "",
    role: "",
    realName: "",
    repassword: "",
    hospitalName: "",
  })

  const onRegister = async (values) => {
    if (values.password !== values.repassword) {
      return message.error('两次输入的密码不一致，请重新输入')
    }
    await register(values)
    message.success('注册成功，等待审核……')
  }

  const usernamePreIconClass = cx({
    "username-pre-icon": true,
    active: values.username !== "",
  })

  const passwordPreIcon = cx({
    "password-pre-icon": true,
    active: values.password !== "",
  })

  const repasswordPreIcon = cx({
    "password-pre-icon": true,
    active: values.repassword !== "",
  })

  const realNamePreIconClass = cx({
    "name-pre-icon": true,
    active: values.realName !== "",
  })

  const rolePreIconClass = cx({
    "role-pre-icon": true,
    active: values.role !== "",
  })

  const hospitalNamePreIconClass = cx({
    "hospital-pre-icon": true,
    active: values.hospitalName !== ""
  })

  const empty =
    !values.username ||
    !values.password ||
    !values.realName ||
    !values.repassword ||
    !values.role ||
    !values.hospitalName

  const registerBtnClass = cx({
    active: !empty,
  })
  return (
    <RightWrapper>
      <WelcomeText>:-) 欢迎注册！</WelcomeText>
      <LinkRegister className="register">
        已有账号？<Link to="/public/login">直接登录</Link>
      </LinkRegister>
      <LoginWrapper className="register">
        <LoginFrom>
          <Form onFinish={onRegister} onFinishFailed={null}>
            <SelectWrapper>
              <PrefixRole className={rolePreIconClass} />
              <Form.Item
                name="role"
                rules={[{ required: true, message: "请选择角色" }]}
              >
                <Select
                  placeholder="请选择角色"
                  bordered={false}
                  onChange={(e) => setFiledValue("role", e)}
                >
                  <Option value="医生">医生</Option>
                  <Option value="医助">医助</Option>
                  <Option value="护士">护士</Option>
                </Select>
              </Form.Item>
            </SelectWrapper>
            <SelectWrapper>
              <PrefixHospital className={hospitalNamePreIconClass} />
              <Form.Item
                name="hospitalName"
                rules={[{ required: true, message: "请选择医院" }]}
              >
                <Select
                  placeholder="请选择医院"
                  bordered={false}
                  onChange={(e) => setFiledValue("hospitalName", e)}
                >
                  <Option value="1">厦门大学附属妇女儿童医院</Option>
                  <Option value="2">郑州大学第一附属医院生殖与遗传专科医院</Option>
                </Select>
              </Form.Item>
            </SelectWrapper>
            <Form.Item
              name="username"
              rules={[{ required: true, message: "请输入工号" }]}
            >
              <Input
                bordered={false}
                placeholder="请输入工号"
                value={values.username}
                prefix={<PrefixUsername className={usernamePreIconClass} />}
                onChange={(e) => setFiledValue("username", e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name="realName"
              rules={[{ required: true, message: "请输入姓名" }]}
            >
              <Input
                bordered={false}
                placeholder="请输入姓名"
                value={values.realName}
                prefix={<PrefixRealName className={realNamePreIconClass} />}
                onChange={(e) => setFiledValue("realName", e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password
                bordered={false}
                placeholder="请输入密码"
                value={values.password}
                prefix={<PrefixPassword className={passwordPreIcon} />}
                onChange={(e) => setFiledValue("password", e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name="repassword"
              rules={[{ required: true, message: "请输入确认密码" }]}
            >
              <Input.Password
                bordered={false}
                placeholder="请再次确认密码"
                value={values.repassword}
                prefix={<PrefixPassword className={repasswordPreIcon} />}
                onChange={(e) => setFiledValue("repassword", e.target.value)}
              />
            </Form.Item>
            <LoginButton
              htmlType="submit"
              disabled={empty}
              className={registerBtnClass}
            >
              立即注册
            </LoginButton>
          </Form>
        </LoginFrom>
      </LoginWrapper>
    </RightWrapper>
  )
}

export default RegisterR
