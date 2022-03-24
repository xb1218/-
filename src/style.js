import styled from "@emotion/styled"
import { Modal } from "antd"

export const BackShadow = styled.div`
  position: relative;
  background: #ffffff;
  box-shadow: 0px 2px 6px 0px #eaeaea;
  border-radius: 0px;
  padding: 14px;
  margin: 12px 0;
`

export const SectionTitle = styled.div`
  display: flex;
  font-size: 13px;
  font-weight: 600;
  color: #333333;
  line-height: 12px;
  letter-spacing: 1px;
  border-left: 4px solid
    ${(props) => (props.borderLeft ? props.borderLeft : "#6880FD")};
  padding-left: 7px;
  font-family: PingFangSC-Semibold, PingFang SC;
  margin: 14px 0;
`

export const CornersBgWrapper = styled.div`
  width: ${(props) => props.width + "px"};
  height: ${(props) => props.height + "px"};
  padding: 2px;
  background: url(${(props) => props.url});
  background-repeat: no-repeat;
  background-size: cover;
`

export const UploadBgImage = styled.div`
  width: ${(props) => props.width + "px"};
  height: ${(props) => props.height + "px"};
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  background: url(${(props) => props.url});
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    .${(props) => props.className} {
      top: 0px;
    }
  }
`

export const HoverBlock = styled.div`
  position: absolute;
  top: 0px;
  top:  ${(props) => props.top + "px"};
  left: 0px;
  width: 100%;
  border-radius: 10px;
  text-align: center;
  background-color: #fff;
  transition: all 0.6s;

  p {
    height:  ${(props) => props.height + "px"};
    line-height:  ${(props) => props.height + "px"};
    font-size: 24px;
    margin: 0;

    &:hover {
      color: #6986f4;
      background-color: #6d8cf61a;
    }
  }
`

export const BackShadowWraper = styled(BackShadow)`
  height: calc(100vh - 130px);
  margin: 14;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export const PlusIcon = styled.img`
  width: 70px;
  height: 70px;
`

export const SelOption = styled.div`
  border-radius: 2px;
  border: 1px dashed #6986f4;
  padding: 2px 8px;
  color: #6986f4;
  cursor: pointer;
`

export const BaseModal = styled(Modal)`
  .ant-modal-content {
    width: ${props => props.width + "px"};
    height: ${props => props.height + "px"};
    .ant-modal-close-x {
      height: 40px;
      width: 40px;
      line-height: 40px;
      .anticon {
        color: #ffffff;
      }
    }
    .ant-modal-header {
      background: #7AA0FC;
      padding: 10px 20px;
      .ant-modal-title {
        color: #ffffff;
      }
    }
    .ant-modal-body {
      padding: 0px;
    }
    .ant-col-6 {
      border-right: 2px solid #F4F5F6;
    }
    .ant-col-18 {
      height: 396px;
      overflow-y: scroll;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
  .ant-radio-wrapper-checked, .ant-checkbox-wrapper-checked {
    color: #7AA0FC;
  }
`
export const StackInform = styled.div`
  position: absolute;
  right: 0px;
  top: 60px;
  width: 100px;
  height: 352px;
  background: #ffffff;
  border-radius: 10px 0px 0px 10px;
  box-shadow: -1px 1px 5px 0px rgba(164, 165, 167, 0.3);
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`
export const StackInformation = styled.div`
  display: flex;
  flex-direction: column;
  a {
    display: block;
    width: 100%;
    height: 30px;
    line-height: 30px;
    text-align: center;
    cursor: pointer;
  }
  .active {
    background: rgba(122, 160, 252, 0.1);
    color: #7AA0FC;
  }
`