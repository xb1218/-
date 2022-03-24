import React, { useState, useEffect, useImperativeHandle } from "react"
import styled from "@emotion/styled"
import { BaseModal, StackInform, StackInformation } from "../../style"
import { Checkbox, Space, message } from "antd"
import { useStores } from "@/store/useStore.js"
import { useParams } from "react-router-dom"
import api from "../../utils/request"

const InformModal = React.forwardRef(({ visible, onCancel, changeTemplate, getAllTemplate }, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [template, setTemplate] = useState([]) //所有模板
  const [formwork, setFormwork] = useState([]) //模板分类
  const [stackId, setStackId] = useState(null) //选中的组套
  const [selectFormwork, setSelectFormwork] = useState([]) //选中的组套模板
  const { getUserInfo } = useStores("auth")
  const { id: pid } = useParams()

  useEffect(() => {
    queryInformedName()
    selectStackFormwork()
  }, [])

  useEffect(() => {
    selectTemplateName(selectFormwork)
  }, [template, selectFormwork])

  useImperativeHandle(ref, () => ({
    onChange: (templateId) => {
      onChange(templateId)
    },
    addStackToPatient: addStackToPatient
  }))

  // 查看所有模板以及模板分类
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
    // sivf跳转
    let userInfo
    if(window.sessionStorage.getItem("info")) {
      userInfo = JSON.parse(window.sessionStorage.getItem("info"))
    }else {
      userInfo = await getUserInfo()
    }
    const res = await api.getIm("/home/models", { hospital: userInfo.hospitalName })
    res.forEach(item => {
      if(item.modelPath) {
        arr.forEach(list => {
          if(item.type === list.type) {
            list.formwork.push(item)
            return
          }
        })
      }
    })
    setTemplate(res)
    getAllTemplate(res)
    setFormwork(arr)
  }

  // 查看选中的组套下面的模板
  const selectStackFormwork = async () => {
    let arr = []
    const res = await api.getIm("/unSign/getUnSigns", { pid })
    res.forEach(item => {
      arr.push(item.modelId)
    })
    setSelectFormwork(arr)
  }

  // 改变组套下面的模板
  const onChange = async (value) => {
    let isSelect = false    //该知情同意书是否签署过
    let signId              //未签署的知情同意书id
    let unsignConsents = []
    const res = await api.getIm("/unSign/getUnSigns", { pid })
    res.forEach(item => {
      if(item.modelId === value) {
        isSelect = true
        signId = item.id
      }
    })
    // true表示删除知情同意书，false表示新增同意书
    if(isSelect) {
      await api.postIm(`/unSign/delUnSigns?id=${signId}`)
      selectFormwork.splice(selectFormwork.indexOf(value), 1)
      setSelectFormwork([...selectFormwork])
    }else {
      template.forEach(item => {
        if(item.id === value) {
          unsignConsents.push({
            consentName: item.templateFile,
            modelId: item.id
          })
        }
      })
      selectFormwork.push(value)
      setSelectFormwork([...selectFormwork])
      await api.postIm("/unSign/unSignConsents", { pid, unsignConsents })
    }
  }

  // 选中的模板名
  const selectTemplateName = (templateIdArr) => {
    let templateName = []
    templateIdArr.forEach(id => {
      template.forEach(item => {
        if(id === item.id) {
          templateName.push({id, name: item.templateFile, modelPath: item.modelPath})
        }
      })
    })
    changeTemplate(templateName)
  }

  // 将组套下面的知情同意书添加到患者下面
  const addStackToPatient = async (templateArr) => {
    let unsignConsents = []
    let templateIdArr = []
    templateArr.forEach(item => {
      selectFormwork.forEach(list => {
        if(item.modelId === list) {
          item.tag = true
        }
      })
    })
    templateArr.forEach(item => {
      if(!item.tag) {
        templateIdArr.push(item.modelId)
        unsignConsents.push({
          consentName: item.templateFile,
          modelId: item.modelId
        })
      }
    })
    setSelectFormwork([...selectFormwork, ...templateIdArr])
    if(unsignConsents.length) {
     await api.postIm("/unSign/unSignConsents", { pid, unsignConsents }) 
    }
  }

  return (
    <>
      <BaseModal
        title="增加知情同意书"
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={520}
        height={440}
      >
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
                              onChange={(e) => onChange(e.target.value)}
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
        <StackInform>
          <StackInformation>
            {
              formwork.map((item, index) =>
                item.formwork.length > 0 && (
                  <a
                    href={"#"+index}
                    key={index}
                    className={currentIndex === index ? "active" : ""}
                    onClick={() => setCurrentIndex(index)}
                  >
                    {item.name}
                  </a>
                )
              )
            }
          </StackInformation>
        </StackInform>
      </BaseModal>
    </>
  )
})

const StackRight = styled.div`
  height: 396px;
  padding-bottom: 10px;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
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
export default InformModal