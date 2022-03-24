import React, { useState, useEffect } from "react"
import { BaseModal } from "../../style"
import { useStores } from "@/store/useStore.js"
import styled from "@emotion/styled"
import { Checkbox, Space } from "antd"
import api from "../../utils/request"

export default function AddStackModal({ visible, setId, onCancel, changeStack, addStackToPatient }) {
  const [addStack, setAddStack] = useState([])  // 组套+知情同意书模板
  const [selectStack, setSelectStack] = useState([])
  const { getUserInfo } = useStores("auth")

  useEffect(() => {
    queryAllStack()
  }, [])

  useEffect(() => {
    changeSelectStack()
  }, [setId])

  // 查询所有组套+初始选中的组套
  const queryAllStack = async () => {
    let userInfo
    if(window.sessionStorage.getItem("info")) {
      userInfo = JSON.parse(window.sessionStorage.getItem("info"))
    }else {
      userInfo = await getUserInfo()
    }
    const body = {
      userId: userInfo.id,
      hospitalId: userInfo.hospitalName
    }
    const stack = await api.getIm("/sets/packages", { userId: userInfo.id})
    const template = await api.getIm("/sets/docSets", body)
    stack.forEach(item => {
      Object.keys(template).forEach(list => {
        if(item.id == list) {
          item.template = template[list]
        }
      })
    })
    setAddStack(stack)
  }

  // 初始选中组套
  const changeSelectStack = () => {
    setSelectStack([setId])
  }

  // 切换组套
  const changeSetId = (e) => {
    const setId = e.target.value
    getTemplateId(setId)
    changeStack(setId)
  }

  // 查询组套下面的知情同意书模板id
  const getTemplateId = async (setId) => {
    if(setId && addStack.length) {
      addStack.forEach(item => {
        if(item.id === setId) {
          let templateArr = item.template
          addStackToPatient(templateArr)
        }
      })
    }
  }

  return (
    <BaseModal
      visible={visible}
      onCancel={() => onCancel()}
      title="添加组套"
      footer={null}
      width={400}
      height={360}
    >
      <AddStackWrapper>
        <Checkbox.Group value={selectStack}>
          <Space direction="vertical">
            {
              addStack.map(item => {
                return (
                  <div key={item.id}>
                    <Checkbox
                      value={item.id}
                      className="addstack"
                      onChange={changeSetId}
                    >
                      {item.name}
                    </Checkbox>
                    {
                      item.template.map(list => {
                        return (
                          <div
                            style={{ display: setId === item.id ? "" : "none" }}
                            key={list.modelId}
                            className="template"
                          >
                            {list.templateFile.substring(2)}
                          </div>
                        )
                      })
                    }
                  </div>
                )
              })
            }
          </Space>
        </Checkbox.Group>
      </AddStackWrapper>
    </BaseModal>
  )
}

const AddStackWrapper = styled.div`
  height: 316px;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  .addstack {
    margin-left: 20px;
    font-weight: bold;
  }
  .template {
    margin-left: 44px;
    line-height: 26px;
    color: rgba(0, 0, 0, 0.7);
  }
`