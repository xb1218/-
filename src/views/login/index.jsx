import React from "react"
import { useHistory, BrowserRouter, Switch, Route, Redirect } from "react-router-dom"
import { Form, Input, Button } from "antd"
import logo from '../../assets/logo.png'
import { useStores } from "@/store/useStore.js"
import helpUrl from '../../assets/help-icon.png'
import useForm from '../../hooks/useForm'
import { Container, LeftWrapper, RightWrapper, WelcomeText, LoginWrapper, LoginTitle, LogoImage, LoginFrom, PrefixUsername, PrefixPassword, LinkRegister, TipText, TipImage, LoginButton } from './style'
import cx from 'classnames'
import LoginR from "./containers/LoginR"
import RegisterR from './containers/RegisterR'

function Login() {
  return (
    <Container>
      <LeftWrapper></LeftWrapper>
      <Switch>
        <Route path="/public/login" component={LoginR} />
        <Route path="/public/register" component={RegisterR} />
        <Redirect from="*" to="/public/login" />
      </Switch>
    </Container>
  )
}

export default Login
