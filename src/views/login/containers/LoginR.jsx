import React from 'react'
import { Form, Input, Button } from "antd"
import { useHistory, Link } from "react-router-dom"
import { useStores } from "@/store/useStore.js"
import logo from '../../../assets/logo.png'
import helpUrl from '../../../assets/help-icon.png'
import useForm from '../../../hooks/useForm'
import cx from 'classnames'
import { RightWrapper, WelcomeText, LoginWrapper, LoginTitle, LogoImage, LoginFrom, PrefixUsername, PrefixPassword, LinkRegister, TipText, TipImage, LoginButton } from '../style'


function LoginR(props) {
  const history = useHistory()
  const { login } = useStores("auth")
  const { values, setFiledValue } = useForm({ username: '', password: '' })

  const onLogin = async () => {
    await login(values)
    history.push("/home/info/all") //跳转
  }
  const empty = !values.username || !values.password

  const usernamePreIconClass = cx({
    'username-pre-icon': true,
    'active': values.username !== ''
  })

  const passwordPreIcon = cx({
    'password-pre-icon': true,
    'active': values.password !== ''
  })
  
  const loginBtnClass = cx({
    'active': !empty
  })

  return (
    <RightWrapper>
      <WelcomeText>:-) 欢迎登录！</WelcomeText>
      <LoginWrapper>
        <LogoImage src={logo} />
        <LoginTitle>数据采集管理系统</LoginTitle>
        <LoginFrom>
          <Form
            onFinish={onLogin}
            onFinishFailed={null}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: "请输入工号" }]}
            >
              <Input
                bordered={false}
                placeholder="请输入工号"
                value={values.username}
                prefix={<PrefixUsername className={usernamePreIconClass} />}
                onChange={(e) => setFiledValue('username', e.target.value)}
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
                onChange={(e) => setFiledValue('password', e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <LoginButton
                disabled={empty}
                htmlType="submit"
                className={loginBtnClass}
              >
                登录
              </LoginButton>
              <LinkRegister>
                还没有账号?<Link to="/public/register">立即注册</Link>
              </LinkRegister>
              <TipText>
                <TipImage src={helpUrl} alt='' />忘记密码请联系管理员
              </TipText>
            </Form.Item>
          </Form>
        </LoginFrom>
      </LoginWrapper>
    </RightWrapper>
  )
}

export default LoginR
