import React, { useEffect, useState, useRef } from "react"
import styled from "@emotion/styled"
import { Row, Col, Radio, Checkbox, Space, Button, Input, message } from "antd"
import { BaseModal, StackInform, StackInformation } from "../../style"
import { PlusOutlined, CloseOutlined, FormOutlined, CheckOutlined } from "@ant-design/icons"
import { useStores } from "@/store/useStore.js"
import api from "../../utils/request"

export default function StackModal({ visible, onCancel, stackId, querySelectStack }) {
  const [stack, setStack] = useState([]) //所有的组套
  const [userInfo, setUserInfo] = useState({})
  const [isEdit, setIsEdit] = useState(false)
  const [hasValue, setHasValue] = useState(true)
  const [showInput, setShowInput] = useState(false)
  const [name, setName] = useState("") //增加的组套名
  const [currentIndex, setCurrentIndex] = useState(0)
  const [formwork, setFormwork] = useState([]) //所有的模板
  const [selectStack, setSelectStack] = useState(null) //选中的组套
  const [selectFormwork, setSelectFormwork] = useState([]) //选中的模板

  const { getUserInfo } = useStores("auth")
  const timerRef = useRef({})

  useEffect(() => {
    queryAllStack()
    queryInformedName()
  }, [])

  useEffect(() => {
    initSelectStack()
  }, [stackId])

  // 初始化选中的组套和模板
  const initSelectStack = () => {
    setSelectStack(stackId)
    queryStack(stackId)
  }

  // 查询所有组套
  const queryAllStack = async () => {
    const userInfo = await getUserInfo()
    setUserInfo(userInfo)
    const res = await api.get("/sets/packages", { userId: userInfo.id})
    setStack(res.reverse())
  }

  // 添加组套
  const addStackName = async () => {
    if(name) {
      await api.post("/sets/packageNames", { id: null, name, userId: userInfo.id })
      queryAllStack()
      setName("")
      setShowInput(false)
      message.success({ content: "保存/添加成功", className: "custom-success-class" })
    }
  }

  // 修改组套名
  const editStackName = async (name, id) => {
    if(name) {
      setHasValue(true)
      if(timerRef.current.id) {
        clearTimeout(timerRef.current.id)
      }
      timerRef.current.id = setTimeout(async () => {
        await api.post("/sets/packageNames", { name, id, userId: userInfo.id})
        queryAllStack()
      }, 500)
    }else {
      setHasValue(false)
    }
  }

  // 查询知情同意书分类和模板名
  const queryInformedName = async () => {
    let arr = [
      { name: "门诊", type: 1, formwork: []},
      { name: "取卵", type: 2, formwork: []},
      { name: "IUI手术", type: 3, formwork: []},
      { name: "随访", type: 4, formwork: []},
      { name: "卵泡监测", type: 5, formwork: []},
      { name: "冷冻", type: 6, formwork: []},
      { name: "解冻", type: 7, formwork: []},
      { name: "移植", type: 8, formwork: []},
      { name: "囊胚", type: 9, formwork: []},
      { name: "赠卵", type: 10, formwork: []},
      { name: "PGT", type: 12, formwork: []},
      { name: "复苏周期", type: 13, formwork: []},
      { name: "科研", type: 14, formwork: []},
      { name: "手术", type: 15, formwork: []},
      { name: "新鲜周期", type: 16, formwork: []},
      { name: "其他", type: 11, formwork: []},
    ]
    const userInfo = await getUserInfo()
    const res = await api.get("/home/models", { hospital: userInfo.hospitalName })
    res.forEach(item => {
      if(item.modelPath && item.modelPath !== "") {
        arr.forEach(list => {
          if(item.type === list.type) {
            list.formwork.push(item)
            return
          }
        })
      }
    })
    setFormwork(arr)
  }

  // 查询模板
  const queryStack = async (value) => {
    const result = await isHasTemplate()
    if(!result) return
    const res = await api.get("/sets/getPackageModels", { setId: value })
    setSelectStack(value)
    setSelectFormwork(res.modelIds)
  }

  // 判断组套下面是否至少有两份知情同意书
  const isHasTemplate = async () => {
    const res = await api.get("/sets/getPackageModels", { setId: selectStack })
    if(res.setId !== null && res.modelIds.length < 2) {
      message.warning({ content: "请至少添加两份知情同意书", className: "custom-error-class" })
      return false
    }else {
      return true
    }
  }

  // 查询组套下面所有模板 + 修改组套里面的模板
  const onChange = async (value, parms) => {
    if(parms === "stack") {
      queryStack(value)
    }
    if(parms === "formwork") {
      let arr = []
      let index = selectFormwork.indexOf(value)
      index !== -1 ? selectFormwork.splice(index, 1) : selectFormwork.push(value)
      setSelectFormwork([...selectFormwork])
      if(!selectFormwork.length) {
        arr = null
      }else {
        arr = selectFormwork
      }
      await api.post("/sets/updatePackage", { setId: selectStack, modelIds: arr })
    }
  }

  // 保存
  const applicate = async () => {
    const result = await isHasTemplate()
    if(!result) return
    if(!hasValue) return
    if(selectStack === null) {
      message.warning({ content: "请先选择组套", className: "custom-error-class" })
    }else {
      if(stackId !== selectStack) {
        await api.post("/sets/updateMark", { oldId: stackId, newId: selectStack })
        querySelectStack()
        message.success({ content: "组套应用成功", className: "custom-success-class" })
      }
      onCancel()
    }
  }

  // 添加组套input框
  const addStack = async () => {
    const result = await isHasTemplate()
    if(!result) return
    setShowInput(true)
  }

  // 关闭组套弹窗
  const closeStack = async () => {
    const result = await isHasTemplate()
    if(!result) return
    if(hasValue) {
      setShowInput(false)
      setIsEdit(false)
      stackId !== selectStack && setSelectStack(stackId)
      onCancel()
    }
  }

  // 编辑
  const closeEdit = async () => {
    if(hasValue) {
      setIsEdit(false)
      setHasValue(true)
    }
  }

  return (
    <>
      <BaseModal
        title="组套设置"
        visible={visible}
        footer={null}
        width={631}
        height={440}
        onCancel={() => closeStack()}
      >
        <Row justify="center">
          <Col span={6}>
            <StackLeft>
              <Radio.Group
                className="radio"
                style={{display: isEdit ? "none" : ""}}
                value={selectStack}
                onChange={(e) => {
                  onChange(e.target.value, "stack")
                }}
              >
                <Space direction="vertical" size={11}>
                  {stack.map((item) => {
                    return (
                      <Radio key={item.id} value={item.id}>
                        {item.name}
                      </Radio>
                    )
                  })}
                </Space>
              </Radio.Group>
              <EditStack style={{display: isEdit ? "" : "none"}}>
                {
                  stack.map((item => {
                    return (
                      <Input 
                        onChange={(e) => {editStackName(e.target.value, item.id)}}
                        bordered={false} 
                        key={item.id} 
                        defaultValue={item.name}
                      />
                    )
                  }))
                }
                <CloseOutlined className="close" onClick={() => closeEdit()} />
              </EditStack>
              <StackSpan hasValue={hasValue}>*组套名不能为空</StackSpan>
              <Input
                className="addStack"
                style={{display: showInput ? "" : "none"}}
                value={name}
                onChange={(e) => setName(e.target.value)}
                suffix={
                  <>
                    <CloseOutlined onClick={() => {
                      setName("")
                      setShowInput(false)
                    }} />
                    <CheckOutlined onClick={() => addStackName()} style={{marginLeft: "8px"}} />
                  </>
                }
              />
              <StackAdd onClick={() => addStack()}>
                <PlusOutlined className="add" />
              </StackAdd>
              <FormOutlined className="formOutLined" onClick={() => setIsEdit(true)} />
              <Button type="primary" onClick={applicate}>保存</Button>
            </StackLeft>
          </Col>
          <Col span={18}>
            <StackRight>
              {
                formwork.map((item, index) => 
                  item.formwork.length > 0 && (
                    <div key={index}>
                      <span id={index} className="title">{item.name}</span>
                      <Checkbox.Group value={selectFormwork} className="checkbox-group">
                        <Space direction="vertical">
                          {
                            item.formwork.map(list => {
                              return (
                                <Checkbox 
                                  key={list.id} 
                                  value={list.id}
                                  onChange={(e) => onChange(e.target.value, "formwork")}
                                >
                                  {list.templateFile.substring(2)}
                                </Checkbox>
                              )
                            })
                          }
                        </Space>
                      </Checkbox.Group>
                    </div>
                  )
                )
              }
            </StackRight>
          </Col>
          <StackInform>
            <StackInformation>
              {
                formwork.map((item, index) =>
                  item.formwork.length > 0 && (
                    <a
                      key={index}
                      className={currentIndex === index ? " active" : ""}
                      onClick={() => {
                        document.getElementById(index).scrollIntoView()
                        setCurrentIndex(index)
                      }}
                    >
                      {item.name}
                    </a>
                  )
                )
              }
            </StackInformation>
          </StackInform>
        </Row>
      </BaseModal>
    </>
  )
}

const StackLeft = styled.div`
  display: flex;
  margin-top: 10px;
  align-items: center;
  flex-direction: column;
  button {
    position: absolute;
    bottom: 20px;
  }
  .addStack {
    position: absolute;
    bottom: 120px;
    border-style: dashed;
    padding: 0px 11px;
  }
  .radio {
    height: 220px;
    padding-bottom: 10px;
    overflow-y: scroll;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .formOutLined {
    position: absolute;
    bottom: 20px;
    left: 15px;
    font-size: 20px;
  }
`
const StackAdd = styled.div`
  width: 100%;
  line-height: 36px;
  text-align: center;
  background: rgba(122, 160, 252, 0.2);
  opacity: 0.6;
  cursor: pointer;
  position: absolute;
  bottom: 75px;
  .add {
    color: #7aa0fc;
    font-size: 16px;
    font-weight: 600;
  }
`
const StackRight = styled.div`
  padding-bottom: 10px;
  .title {
    display: block;
    line-height: 32px;
    background: #f4f5f6;
    padding-left: 20px;
    margin: 8px 0px;
  }
  div:first-of-type {
    .title {
      margin-top: 0px;
    }
  }
  .checkbox-group {
    padding-left: 20px;
  }
`

const EditStack = styled.div`
  height: 200px;
  overflow-y: scroll;
  position: relative;
  &::-webkit-scrollbar {
    display: none;
  }
  input {
    padding: 0px 11px 0px 25px;
  }
  .close {
    position: absolute;
    right: 10px;
    top: 0;
  }
`
const StackSpan = styled.div`
  color: red;
  position: relative;
  left: -20px;
  display: ${props => props.hasValue ? "none" : ""}
`