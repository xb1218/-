import styled from "@emotion/styled"
import { Button } from 'antd'
import bgUrl from '../../assets/bg.png'
import roleUrl from '../../assets/role.png'
import roleActiveUrl from '../../assets/roleActive.png'
import nameUrl from '../../assets/realName.png'
import nameActiveUrl from '../../assets/realNameActive.png'
import userUrl from '../../assets/user.png'
import userActiveUrl from '../../assets/user-active.png'
import passwordUrl from '../../assets/password.png'
import passwordActiveUrl from '../../assets/password-active.png'

export const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
`

export const LeftWrapper = styled.div`
  width: 70%;
  background-image: url(${bgUrl});
  background-repeat: no-repeat;
  background-size: cover;
`

export const RightWrapper = styled.div`
  width: 440px;
`

export const LoginWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin-top: 80px;
  &.register {
    margin-top: 0;
  }
`

export const LoginTitle = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #202848;
`

export const LogoImage = styled.img`
  width: 44px;
  height: 44px;
  margin-bottom: 16px;
`

export const LoginFrom = styled.div`
  margin-top: 65px;
  .ant-input-affix-wrapper {
    padding: 5.6px 0;
    border-radius: 0;
    border-bottom: 1px solid #d1d1d1;
    input.ant-input {
      padding: 0 10px;
    }
  }
  .ant-form-item-explain.ant-form-item-explain-error {
    padding-top: 5px;
  }
`

export const WelcomeText = styled.div`
  font-size: 20px;
  color: #2A2636;
  margin: 30px 0 0 40px;
`

export const PrefixUsername = styled.div`
  width: 20px;
  height: 20px;
  background: url(${userUrl}) no-repeat;
  background-size: 100%;
  &.username-pre-icon.active {
    background: url(${userActiveUrl}) no-repeat;
    background-size: 100%;
  }
`

export const PrefixPassword = styled.div`
  width: 20px;
  height: 20px;
  background: url(${passwordUrl}) no-repeat;
  background-size: 100%;
  &.password-pre-icon.active {
    background: url(${passwordActiveUrl}) no-repeat;
    background-size: 100%;
  }
`

export const PrefixHospital = styled.div`
  width: 20px;
  height: 20px;
  background: url(${passwordUrl}) no-repeat;
  background-size: 100%;
  &.hospital-pre-icon.active {
    background: url(${passwordActiveUrl}) no-repeat;
    background-size: 100%;
  }
`

export const LoginButton = styled(Button)`
  cursor: pointer;
  width: 240px;
  height: 44px;
  border-radius: 4px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  margin-top: 36px;
  background: linear-gradient(123deg, #7da5fd 0%, #6885f4 100%);
  &.ant-btn.active:hover {
    color: #fff;
    background: linear-gradient(123deg, #7da5fd 0%, #6885f4 100%);
  }
`

export const LinkRegister = styled.div`
  color: #999;
  padding-top: 16px;
  text-align: center;
  font-size: 14px;

  &.register {
    text-align: left;
    margin-left: 74px;
  }
  a {
    color: #6981fd;
    border-bottom: 1px solid #7da5fd;
  }
  a: hover {
    color: #6981fd;
  }
`

export const TipText = styled.div`
  text-align: center;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #ababab;
  margin-top: 80px;
`

export const TipImage = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 5px;
`

export const SelectWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid #d1d1d1;
  margin-bottom: 24px;
  padding-bottom: 5px;
  .ant-select {
    width: 216px;
  }
  .ant-form-item {
    margin-bottom: 0;
  }
`

export const PrefixRole = styled.div`
  width: 20px;
  height: 20px;
  background: url(${roleUrl}) no-repeat;
  background-size: 100%;

  &.role-pre-icon.active {
    background: url(${roleActiveUrl}) no-repeat;
    background-size: 100%;
  }
`

export const PrefixRealName = styled.div`
  width: 20px;
  height: 20px;
  background: url(${nameUrl}) no-repeat;
  background-size: 100%;

  &.name-pre-icon.active {
    background: url(${nameActiveUrl}) no-repeat;
    background-size: 100%;
  }
`



