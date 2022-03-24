import React, { useState, useEffect, useRef, useLayoutEffect } from "react"
import { LeftOutlined, ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons"
import styled from "@emotion/styled"
import { Space, Row, Col, Button, Steps, Input } from "antd"
const { Step } = Steps

import { BackShadow, SectionTitle } from "../../../style.js"
import { Link, useHistory, useParams } from "react-router-dom"
import api from "../../../utils/request"
import dayjs from "dayjs"
import qs from "qs"
import SignedEdition from "../../../components/SignedEdition"
import InformModal from "../../../components/InformModal"
import SignModal from "../../../components/SignModal"
import AddStackModal from "../../../components/AddStackModal"
import PrintInformed from "../../../layout/printInformed"
import { base64toFile, createImage } from "../../../utils/file-format"
import { _GetImage, _HashData, _P7SignData, _TSATest } from "../../../utils/ca-certificate"
import { useStores } from "@/store/useStore.js"

export default function Informed(props) {
  const iconStyle = { fontSize: 14, cursor: "pointer" }
  const spaceStyle = { display: "flex", width: "600px", justifyContent: "space-between" }
  const { id: pid } = useParams()
  const [info, setInfo] = useState("") //患者信息
  const [visible, setVisible] = useState(false) //添加同意书弹窗
  const [stackVisible, setStackVisible] = useState(false) //添加组套弹窗
  const [template, setTemplate] = useState([]) //所有的知情同意书
  const [allTemplateName, setAllTemplateName] = useState([]) //选中全部的模板名
  const [templateIndex, setTemplateIndex] = useState(null) //选中的模板索引
  const [signVisible, setSignVisible] = useState(false) //是否重新签署的弹窗
  const [current, setCurrent] = useState(0) //签署的当前进度
  const [currentDot, setCurrentDot] = useState(0) //当前点击的step
  const [signArr, setSignArr] = useState([])
  const [signName, setSignName] = useState([]) //所有已经签名的数据收集
  const [fingerData, setFingerData] = useState([]) //所有指纹数据收集
  const [title, setTitle] = useState("")
  const [init, setInit] = useState(true)
  const [againSign, setAgainSign] = useState({}) //收集补录的信息
  const [timer, setTimer] = useState(null) //获取签字版
  const [userInfo, setUserInfo] = useState({}) //登录者信息
  const [signIndex, setSignIndex] = useState(null) //签字版的索引
  const [templatePath, setTemplatePath] = useState(null) //知情同意书路径
  const [docSignPicture, setDocSignPicture] = useState("")
  const [addition, setAddition] = useState([]) //代填字段
  const [field, setField] = useState([]) //代填字段值
  const [collectField, setCollectField] = useState({}) //当前模板收集的字段取值

  const history = useHistory()
  const modalRef = useRef()
  const { getUserInfo } = useStores("auth")

  // 请求ccrm数据
  const request = async (endpoint) => {
    const response = await fetch(`http://192.168.1.2:9005/GetCcrmdata/?${endpoint}`, {
      method: "GET",
      "Content-Type": "application/json",
    })
    return response.json()
  }

  useLayoutEffect(() => {
    if(props.location.search) {
      getInfo()
    }else {
      getPatientInfo()
    }
  }, [])

  useEffect(() => {
    if(allTemplateName.length && signArr.length && init) {
      resign()
      setInit(false)
    }
  }, [allTemplateName, signArr])

  useEffect(() => {
    if(!props.location.state) {
      changeTemplateName(0)
    }
  }, [allTemplateName])

  useEffect(() => {
    sign()
  }, [allTemplateName, templateIndex])

  useEffect(() => {
    addFieldCollection()
  }, [allTemplateName, templateIndex, field])

  useEffect(() => {
    let templateId = allTemplateName[templateIndex] && allTemplateName[templateIndex].id
    changeCurrentSign(templateId)
  }, [signArr])

  useEffect(() => {
    if(docSignPicture) {
      setCaPicture()
    }
  }, [docSignPicture, signArr])

  // ca获取的签名图片回显
  const setCaPicture = () => {
    let flag = true
    let params
    let templateId = allTemplateName[templateIndex] && allTemplateName[templateIndex].id
    for(let i=0; i<signArr.length; i++) {
      if(signArr[i].key === "doctorSign" || signArr[i].key === "talker"){
        flag = false
        params = signArr[i].key
      }
    }
    if(flag) return
    if(isSign(templateId)) {
      signName.forEach(item => {
        if(params === "doctorSign" && !item.doctorSign) {
          item.doctorSign = docSignPicture
        }
        if(params === "talker" && !item.talker) {
          item.talker = docSignPicture
        }
      })
    }else {
      signName.push({
        id: templateId,
        [params]: docSignPicture
      })
    }
    changeCurrentSign(templateId)
    setSignName([...signName])
  }

  // 切换知情同意书模板
  const sign = () => {
    let index = allTemplateName[templateIndex]
    let id = index && allTemplateName[templateIndex].id
    // 签名 + 指纹
    if(id === 22) {
      setSignArr([
        { key: "nurseSign", value: "指导护士" }, 
        { key: "recipSign", value: "精液接受者" }, 
        { key: "patientSign", value: "患者" }, 
      ])
    }else if(id === 32 || id === 33) {
      setSignArr([
        { key: "patientSign", value: "患者" }, 
        { key: "doctorSign", value: "医生" }, 
      ])
    }else if(id === 46 || id === 95 || id === 96 || id === 97 || id === 101) {
      setSignArr([
        { key: "patientSign", value: "患者", fingerKey: "patientHandPrint", isHaveFinger: true }, 
        { key: "doctorSign", value: "医生" }, 
      ])
    }else if(id === 24) {
      setSignArr([
        { key: "wifeSign", value: "女方" }, 
        { key: "husbSign", value: "男方" }, 
        { key: "doctorSign", value: "医生" }, 
        { key: "nurseSign", value: "护士" }, 
      ])
    }else if(id === 31) {
      setSignArr([
        { key: "doctorSign", value: "谈话医生" }, 
        { key: "wifeSign", value: "女方" }, 
        { key: "husbSign", value: "男方" }
      ])
    }else if(id === 41) {
      setSignArr([
        { key: "principalSign", value: "委托人" }, 
      ])
    }else if(id === 85 || id === 86) {
      setSignArr([
        { key: "wifeSign", value: "女方", fingerKey: "wifeHandPrint", isHaveFinger: true }, 
        { key: "husSign", value: "男方", fingerKey: "husHandPrint", isHaveFinger: true }, 
        { key: "opeSign", value: "操作者" }, 
        { key: "assisSign", value: "助手" },
      ])
    }else if(id === 87) {
      setSignArr([
        { key: "prinSign", value: "委托人", fingerKey: "prinHandPrint", isHaveFinger: true },
        { key: "prinSigna", value: "受委托人", fingerKey: "prinHandPrinta", isHaveFinger: true },
        { key: "doctorSign", value: "医务人员" }
      ])
    }else if(id === 89) {
      setSignArr([
        { key: "wifeSign", value: "女方", fingerKey: "wifeHandPrint", isHaveFinger: true }, 
        { key: "husbSign", value: "男方", fingerKey: "husHandPrint", isHaveFinger: true }, 
        { key: "thawDoctor", value: "胚胎室解冻医师" }, 
        { key: "transEmbDoctor", value: "胚胎室移植医师" }, 
        { key: "transDoctor", value: "移植医生" }, 
        { key: "talker", value: "谈话人" }, 
      ])
    }else if(id === 90 || id === 92) {
      setSignArr([
        { key: "wifeSign", value: "女方", fingerKey: "wifeHandPrint", isHaveFinger: true }, 
        { key: "husbSign", value: "男方", fingerKey: "husHandPrint", isHaveFinger: true }, 
        { key: "transEmbDoctor", value: "胚胎移植医师" }, 
        { key: "transDoctor", value: "移植医师" },
        { key: "talker", value: "谈话人" }, 
      ]) 
    }else if(id === 91 || id === 93 || id === 94) {
      setSignArr([
        { key: "wifeSign", value: "女方", fingerKey: "wifeHandPrint", isHaveFinger: true }, 
        { key: "husbSign", value: "男方", fingerKey: "husHandPrint", isHaveFinger: true }, 
        { key: "transEmbDoctor", value: "胚胎室移植医师" }, 
        { key: "checkDocSign", value: "核对医生" }, 
        { key: "transDoctor", value: "移植医生" }, 
        { key: "talker", value: "谈话人" }, 
      ])
    }else if(id === 104) {
      setSignArr([
        { key: "wifeSign", value: "女方", fingerKey: "wifeHandPrint", isHaveFinger: true }, 
        { key: "husbSign", value: "男方", fingerKey: "husHandPrint", isHaveFinger: true }, 
        { key: "thawDocSign", value: "解冻细胞医生" }, 
        { key: "transEmbDoctor", value: "胚胎室移植医师" }, 
        { key: "transDoctor", value: "移植医生" }, 
        { key: "talker", value: "谈话人" }, 
      ])
    }else if(id < 42) {
      setSignArr([
        { key: "wifeSign", value: "女方" }, 
        { key: "husbSign", value: "男方" }, 
        { key: "doctorSign", value: "医生" },
      ])
    }else {
      setSignArr([
        { key: "wifeSign", value: "女方", fingerKey: "wifeHandPrint", isHaveFinger: true }, 
        { key: "husbSign", value: "男方", fingerKey: "husHandPrint", isHaveFinger: true }, 
        { key: "doctorSign", value: "医生" },
      ])
    }

    // 代填字段
    if(id === 82) {
      setAddition([
        { key: "bloType", value: "赠卵者血型" },
        { key: "rH", value: "赠卵者RH血型" }
      ])
    }else if(id === 88) {
      setAddition([
        { key: "saveYear", value: "冻精保存年限" },
        { key: "year", value: "冷冻保管费年份" },
        { key: "month", value: "冷冻保管费月份" }
      ])
    }else if(id === 89) {
      setAddition([
        { key: "oocCycle", value: "第几周期" },
        { key: "thawLevel", value: "存活卵母细胞级别" },
        { key: "eggNotsur", value: "未存活卵枚数" },
        { key: "eggAbno", value: "异常卵枚数" },
        { key: "freeLevel", value: "冷冻胚胎级别" },
        { key: "embLevel", value: "囊胚胚胎级别" }
      ])
    }else if(id === 90) {
      setAddition([
        { key: "thawNum", value: "第几次解冻" },
        { key: "thawLevel", value: "解冻胚胎/囊胚级别" },
        { key: "culBlaLevel", value: "囊胚培养胚胎级别" },
        { key: "scrBlaLevel", value: "冷冻废弃胚胎/囊胚级别" }
      ])
    }else if(id === 91) {
      setAddition([
        { key: "cycle", value: "第几周期" },
        { key: "DfiveLevel", value: "D5形成囊胚级别" },
        { key: "DsixLevel", value: "D6形成囊胚级别" },
        { key: "freezLevel", value: "冷冻囊胚级别" }
      ])
    }else if(id === 92) {
      setAddition([
        { key: "cycle", value: "第几周期" },
        { key: "survivedNot", value: "未存活卵枚数" },
        { key: "AbneggNum", value: "异常卵枚数" },
        { key: "level", value: "级别" },
        { key: "abnoChr", value: "异常囊胚枚数" }
      ])
    }else if(id === 93) {
      setAddition([
        { key: "cycle", value: "第几周期" },
        { key: "survivedNot", value: "未存活卵枚数" },
        { key: "AbneggNum", value: "异常卵枚数" },
        { key: "level", value: "冷冻级别" }
      ])
    }else if(id === 94) {
      setAddition([
        { key: "survivedNot", value: "未存活卵枚数" },
        { key: "AbneggNum", value: "异常卵枚数" },
        { key: "level", value: "冷冻级别" }
      ])
    }else if(id === 95 || id ===96 || id === 97 || id === 101) {
      setAddition([
        { key: "bedNo", value: "床号" }
      ])
    }else if(id === 104) {
      setAddition([
        { key: "levela", value: "解冻卵母细胞级别" },
        { key: "survivedNot", value: "未存活卵枚数" },
        { key: "AbneggNum", value: "异常卵枚数" },
        { key: "levelFreez", value: "冷冻胚胎级别" },
        { key: "embLevel", value: "囊胚胚胎级别" }
      ])
    }else{
      setAddition([])
    }

    if(allTemplateName.length === 0) {
      setSignArr([])
      setAddition([])
    }
  }

  // 代填字段收集
  const addFieldCollection = () => {
    let index = allTemplateName[templateIndex]
    let id = index && allTemplateName[templateIndex].id
    for(let i=0; i<field.length; i++) {
      if(field[i].id === id) {
        setCollectField(field[i])
        break
      }else {
        setCollectField({})
      }
    }
  }

  // 补签(收集签名)
  const resign = async () => {
    if(props.location.state) {
      const { id, status } = props.location.state
      let templateIndex
      let signData = { id }
      allTemplateName.forEach((item, index) => {
        if(item.id === id) {
          templateIndex = index
          status && setAgainSign({id})
        }
      })
      setTemplateIndex(templateIndex)
      setTemplatePath(`${allTemplateName[templateIndex].modelPath}/${allTemplateName[templateIndex].name}.html`)
      if(status) {
        const res = await api.getIm("/file/makeUpInfo", { modelId: id, pid })
        let signKey = [
          "nurseSign",
          "recipSign",
          "patientSign",
          "doctorSign",
          "wifeSign",
          "husbSign",
          "principalSign",
          "husSign",
          "opeSign",
          "assisSign",
          "prinSign",
          "prinSigna",
          "thawDoctor",
          "transEmbDoctor",
          "transDoctor",
          "talker",
          "checkDocSign",
          "thawDocSign"
        ]
        let fingerKey = [
          "patientHandPrint",
          "wifeHandPrint",
          "husHandPrint",
          "prinHandPrint",
          "prinHandPrint"
        ]
        showPicture(signKey, res, signData, "sign")
        showPicture(fingerKey, res, signData, "finger")
      }
    }
  }

  // 签字和指纹照片回显
  const showPicture = (keys, res, signData, type) => {
    keys.forEach(key => {
      if(res[key]) {
        setCurrent(1)
        createImage(res[key]).then(res => {
          signData[key] = res
          type === "sign" ? setSignName([signData]) : setFingerData([signData])
        })
      }
    }) 
  }

  // 判断该模板是否签过名+是否录入过指纹
  const isSign = (templateId, isFinger) => {
    let isSign = false
    let arr = isFinger ? fingerData : signName
    arr.forEach(item => {
      if(item.id === templateId) {
        isSign = true
      }
    })
    return isSign
  }

  // 签名的base64图片保存
  const saveSignPicture = (params, base64Picture, templateId, isFinger) => {
    let arr = isFinger ? fingerData : signName
    if(!arr.length){
      arr.push({
        id: templateId,
        [params]: base64Picture
      })
    }else {
      arr.forEach(item => {
        if(isSign(templateId, isFinger) && item.id === templateId) {
          item[params] = base64Picture
        }
        if(!isSign(templateId, isFinger)) {
          arr.push({
            id: templateId,
            [params]: base64Picture
          })
        }
      })
    }
    isFinger ? setFingerData([...arr]) : setSignName([...arr])
    changeCurrentSign(templateId)
  }

  // 获取用户信息
  const getPatientInfo = async () => {
    const res = await api.getIm("/patient/basics", { pid })
    setInfo(res)
    // sivf跳转
    let userInfo
    if(window.sessionStorage.getItem("info")) {
      userInfo = JSON.parse(window.sessionStorage.getItem("info"))
    }else {
      userInfo = await getUserInfo()
    }
    setUserInfo(userInfo)
    if(userInfo.hospitalName === "2") {
      let pic = await _GetImage()
      pic && setDocSignPicture("data:image/jpg;base64," + pic)
    }
  }

  // 获取sivf、ccrm里面患者的信息
  const getInfo = async () => {
    // sivf、ccrm跳转过来携带的信息
    let info = qs.parse(props.location.search.substring(1))
    info.wifeCardType = info.wifeCardType === "身份证" ? 1 : info.wifeCardType === "军官证" ? 2 : info.wifeCardType === "护照" ? 3 : 4
    info.husbCardType = info.husbCardType === "身份证" ? 1 : info.husbCardType === "军官证" ? 2 : info.husbCardType === "护照" ? 3 : 4
    window.sessionStorage.setItem("info", JSON.stringify(info))
    if(info.origin === "sivf") {

    }else if(info.origin === "ccrm") {
      // 查看夫妻是否存在，不存在去创建
      let isExistWife = await api.getIm("/patient/exist", { card: info.wifeCard, cardType: info.wifeCardType }, { error: "" })
      let isExistHusb = await api.getIm("/patient/exist", { card: info.husbCard, cardType: info.husbCardType }, { error: "" })
      if(isExistWife === null) {
        let wifeParams = {
          name: info.wifeName,
          sex: 1,
          phone: info.wifePhone,
          coupleNum: info.coupleNum,
          card: info.wifeCard,
          cardType: info.wifeCardType
        }
        await api.postIm("/patient/addPatient", wifeParams, { error: "" })
      }
      if(isExistHusb === null) {
        let husbParams = {
          name: info.husbName,
          sex: 0,
          phone: info.husbPhone,
          coupleNum: info.coupleNum,
          card: info.husbCard,
          cardType: info.husbCardType
        }
        await api.postIm("/patient/addPatient", husbParams, { error: "" })
      }
      // 根据证件号和证件类型去查询用户的id
      let wifeId = await api.getIm("/patient/idByIdCard", { card: info.wifeCard, cardType: info.wifeCardType })
      let husbId = await api.getIm("/patient/idByIdCard", { card: info.husbCard, cardType: info.husbCardType })
      if(isExistWife) {
        await api.postIm(`/patient/coupleNum`, {pid: wifeId, coupleNum: info.coupleNum})
      }
      if(isExistHusb) {
        await api.postIm(`/patient/coupleNum`, {pid: husbId, coupleNum: info.coupleNum})
      }
      if(wifeId >= 0) {
        history.push(`/home/input/consent/${wifeId}`)
      }else {
        history.push(`/home/input/consent/${husbId}`)
      }
    }
  }

  // 改变当前的模板名
  const changeTemplateName = (val) => { 
    let index = templateIndex
    index += val
    if(index > allTemplateName.length - 1) {
      index = 0
    }
    if(index < 0) {
      index = allTemplateName.length - 1
    }
    let templateId = allTemplateName[index] && allTemplateName[index].id
    let templatePath = allTemplateName[index] && `${allTemplateName[index].modelPath}/${allTemplateName[index].name}.html`
    changeCurrentSign(templateId)
    setSignIndex(null)
    setTemplateIndex(index)
    setTemplatePath(templatePath)
  }

  // 是否重新签署对话框显示
  const isShowSignVisible = (status, index) => {
    if(index === 0) {
      setTitle("返回到验证步骤会导致签名被清空，是否继续操作？")
      setSignVisible(true)
      setCurrentDot(index)
    }
  }

  // 签署弹窗点击确认
  const onOk = () => {
    setSignVisible(false)
    setCurrent(currentDot)
    if(currentDot === 0) {
      clearPic("sign")
      clearPic("finger")
    }
  }

  // 清空当前知情同意书的签字和指纹信息
  const clearPic = (type) => {
    let arr = type === "sign" ? signName : fingerData
    console.log(arr)
    let templateId = allTemplateName[templateIndex] && allTemplateName[templateIndex].id
    arr.forEach(item => {
      if(item.id === templateId) {
        Object.keys(item).forEach(list => {
          if(list !== "id") {
            delete item[list]
          }
        })
      }
    })
    type === "sign" ? setSignName([...arr]) : setFingerData([...arr])
  }

  // 提交 (分别处理不同模板里面的数据)
  const submit = async () => {
    let templateId = allTemplateName[templateIndex] && allTemplateName[templateIndex].id
    let name = info.name
    let contentName = allTemplateName[templateIndex].name
    let modelPath
    if(userInfo.hospitalName === "1") {
      modelPath = "/app/diginfo/webapps/ROOT/WEB-INF/classes/templates/ftl"
      // modelPath = "D:/DfProject/DigInfoProject/backend/tomcat/webapps/ROOT/WEB-INF/classes/templates/ftl"
    }else if(userInfo.hospitalName === "2") {
      modelPath = "/app/diginfo/webapps/ROOT/WEB-INF/classes/templates/zd"
      // modelPath = "D:/DfProject/DigInfoProject/backend/tomcat/webapps/ROOT/WEB-INF/classes/templates/zd"
    }
    // let modelPath = "C:/Users/14612/Desktop/迪飞文档/digin/diginfo-collectsys-backend/src/main/resources/templates/zd"
    let templateFile = allTemplateName[templateIndex].name + ".ftl"
    let data
    let wifeSign
    let wifeSigna
    let wifeSignb
    let wifeSignc
    let wifeSignd
    let wifeSigne
    let wifeSignf
    let wifeSigng
    let wifeSignh
    let wifeSignk
    let wifeSigns
    let husbSign
    let husbSigna
    let husbSignb
    let husbSignc
    let husbSignd
    let husbSigne
    let husbSignf
    let husbSigng
    let husbSignh
    let husbSignk
    let husbSigns
    let doctorSign
    let doctorSigna
    let doctorSignb
    let nurseSign
    let recipSign
    let patientSign
    let principalSign
    let husSign
    let opeSign
    let assisSign
    let prinSign
    let prinSigna
    let thawDoctor
    let transEmbDoctor
    let transDoctor
    let talker
    let checkDocSign
    let thawDocSign
    if(templateId === 1 ||
      templateId === 5 ||
      templateId === 10 || 
      templateId === 11 || 
      templateId === 12 || 
      templateId === 13 || 
      templateId === 16 || 
      templateId === 17 ||
      templateId === 18 ||
      templateId === 19 ||
      templateId === 20 ||
      templateId === 21 ||
      templateId === 23 ||
      templateId === 25 ||
      templateId === 30 ||
      templateId === 37 ||
      templateId === 38 ||
      templateId === 42 ||
      templateId === 43 ||
      templateId === 44 ||
      templateId === 45 ||
      templateId === 47 ||
      templateId === 48 ||
      templateId === 49 ||
      templateId === 50 ||
      templateId === 51
      ) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        wifeSign,
        husbSign,
        doctorSign
      }
      if(templateId === 5) {
        data.name = ""
      }
      if(templateId === 43 || 
        templateId === 45 ||
        templateId === 47 ||
        templateId === 48 ||
        templateId === 49 ||
        templateId === 50 ||
        templateId === 51
      ) {
        data.wifeName = "",
        data.husName = ""
      }
    }
    if(templateId === 2) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        chosea: "",
        choseb: "",
        wifeSign,
        husbSign,
        doctorSign
      }
    }
    if(templateId === 3) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          wifeSigna = item.wifeSign || ""
          wifeSignb = item.wifeSign || ""
          husbSign = item.husbSign || ""
          husbSigna = item.husbSign || ""
          husbSignb = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = wifeSigna = wifeSignb = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = husbSigna = husbSignb = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        teachChose: "",
        diceChose: "",
        ivfChose: "",
        eggFreezChose: "",
        wifeSign,
        wifeSigna,
        wifeSignb,
        husbSign,
        husbSigna,
        husbSignb,
        doctorSign
      }
    }
    if(templateId === 4) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          wifeSigna = item.wifeSign || ""
          husbSign = item.husbSign || ""
          husbSigna = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = wifeSigna = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = husbSigna = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        agreeChose: "",
        disagreeChose: "",
        synFetchChose: "",
        disSynFetchChose: "",
        wifeSign,
        wifeSigna,
        husbSign,
        husbSigna,
        doctorSign
      }
    }
    if(templateId === 6) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        wifeABO: "",
        wifeRh: "",
        wifeHeight: "",
        wifePostgra: "",
        wifeUni: "",
        wifeMin: "",
        wifeElemen: "",
        wifeIlliter: "",
        husbABO: "",
        husbRh: "",
        husbHeight: "",
        husbPostgra: "",
        husbUni: "",
        husbMin: "",
        husbElemen: "",
        husbIlliter: "",
        wifeIdCard: "",
        husbIdCard: "",
        wifeSign,
        husbSign,
        doctorSign
      }
    }
    if(templateId === 7 ||
      templateId === 8 ||
      templateId === 9
      ) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        wifeIdCard: "",
        husbIdCard: "",
        wifeSign,
        husbSign,
        doctorSign
      }
    }
    if(templateId === 14) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        unfertilizedChosea: "",
        unfertilizedChoseb: "",
        unEmbryoChosea: "",
        unEmbryoChoseb: "",
        spermRemainChosea: "",
        spermRemainChoseb: "",
        wifeSign,
        husbSign,
        doctorSign
      }
    }
    if(templateId === 15) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        wifePhone: "",
        wifeHomePhone: "",
        husbPhone: "",
        husbHomePhone: "",
        address: "",
        postcode: "",
        wifeSign,
        husbSign,
        doctorSign
      }
    }
    if(templateId === 22) {
      signName.forEach(item => {
        if(item.id === templateId) {
          nurseSign = item.nurseSign || ""
          recipSign = item.recipSign || ""
          patientSign = item.patientSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(nurseSign) {
          const nurseSignFile = base64toFile(nurseSign, "nurseSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", nurseSignFile)
          nurseSign = res.imgUrl
        }
        if(recipSign) {
          const recipSignFile = base64toFile(recipSign, "recipSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", recipSignFile)
          recipSign = res.imgUrl
        }
        if(patientSign) {
          const patientSignFile = base64toFile(patientSign, "patientSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", patientSignFile)
          patientSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        periodNum: "",
        manName: "",
        womanName: "",
        colDate: "",
        fineCup: "",
        emissTime: "",
        IVFChose: "",
        ICSIChose: "",
        AIHChose: "",
        freezChose: "",
        MastuChose: "",
        sexualChose: "",
        massageChose: "",
        elestiChose: "",
        yesChose: "",
        noChose: "",
        forwardChose: "",
        middleChose: "",
        rearChose: "",
        abstDays: 0,
        medication: "",
        nurseSign,
        recipSign,
        patientSign
      }
    }
    if(templateId === 24) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          wifeSigna = item.wifeSign || ""
          wifeSignb = item.wifeSign || ""
          husbSign = item.husbSign || ""
          husbSigna = item.husbSign || ""
          husbSignb = item.husbSign || ""
          doctorSign = item.doctorSign || ""
          nurseSign = item.nurseSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = wifeSigna = wifeSignb = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = husbSigna = husbSignb = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
        if(nurseSign) {
          const nurseSignFile = base64toFile(nurseSign, "nurseSign.gif", "image/jpeg")
          const res = await api.fileIm("/upload/file", nurseSignFile)
          nurseSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        unEmbTransferChose: "",
        embRemainChose: "",
        reasonChose: "",
        numEmbryo: 10,
        identifyResChose: "",
        discardChose: "",
        wifeIdCard: "",
        husbIdCard: "",
        wifeSign,
        wifeSigna,
        wifeSignb,
        husbSign,
        husbSigna,
        husbSignb,
        doctorSign,
        nurseSign
      }
    }
    if(templateId === 26) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        embTransChosea: "",
        embTransChoseb: "",
        wifeSign,
        husbSign,
        doctorSign
      }
    }
    if(templateId === 27) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        eggNum: "",
        MIIeggNum: "",
        IVFEggNum: "",
        RICSIEggNum: "",
        ICSIEggNum: "",
        PNNum: "",
        embNum: "",
        goodEmbNum: "",
        freezEmbNum: "",
        blastNum: "",
        tranBlastNum: "",
        highBlastNum: "",
        freeBlastNum: "",
        frozenNum: "",
        highNum: "",
        wifeSign,
        husbSign,
        doctorSign
      }
    }
    if(templateId === 29) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          wifeSigna = item.wifeSign || ""
          wifeSignb = item.wifeSign || ""
          husbSign = item.husbSign || ""
          husbSigna = item.husbSign || ""
          husbSignb = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = wifeSigna = wifeSignb = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = husbSigna = husbSignb = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        keepChose: "",
        acceptChose: "",
        wifeSign,
        wifeSigna,
        wifeSignb,
        husbSign,
        husbSigna,
        husbSignb,
        doctorSign
      }
    }
    if(templateId === 31) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          wifeSigna = item.wifeSign || ""
          wifeSignb = item.wifeSign || ""
          wifeSignc = item.wifeSign || ""
          wifeSignd = item.wifeSign || ""
          wifeSigne = item.wifeSign || ""
          wifeSignf = item.wifeSign || ""
          wifeSigng = item.wifeSign || ""
          wifeSignh = item.wifeSign || ""
          wifeSignk = item.wifeSign || ""
          wifeSigns = item.wifeSign || ""
          husbSign = item.husbSign || ""
          husbSigna = item.husbSign || ""
          husbSignb = item.husbSign || ""
          husbSignc = item.husbSign || ""
          husbSignd = item.husbSign || ""
          husbSigne = item.husbSign || ""
          husbSignf = item.husbSign || ""
          husbSigng = item.husbSign || ""
          husbSignh = item.husbSign || ""
          husbSignk = item.husbSign || ""
          husbSigns = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = wifeSigna = wifeSignb = wifeSignc = wifeSignd = wifeSigne = wifeSignf = wifeSigng = wifeSignh = wifeSignk = wifeSigns = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = husbSigna = husbSignb = husbSignc = husbSignd = husbSigne = husbSignf = husbSigng = husbSignh= husbSignk = husbSigns = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        name: "",
        age: "",
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        infertiChose: "",
        PCOSChose: "",
        cystChose: "",
        tumorChose: "",
        effusionChose: "",
        obesityChose: "",
        deforChose: "",
        cervixChose: "",
        tuberChose: "",
        pregChose: "",
        wifeSign,
        wifeSigna,
        wifeSignb,
        wifeSignc,
        wifeSignd,
        wifeSigne,
        wifeSignf,
        wifeSigng,
        wifeSignh,
        wifeSignk,
        wifeSigns,
        husbSign,
        husbSigna,
        husbSignb,
        husbSignc,
        husbSignd,
        husbSigne,
        husbSignf,
        husbSigng,
        husbSignh,
        husbSignk,
        husbSigns,
        doctorSign
      }
    }
    if(templateId === 32 || templateId === 33 || templateId === 46) {
      signName.forEach(item => {
        if(item.id === templateId) {
          patientSign = item.patientSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(patientSign) {
          const patientSignFile = base64toFile(patientSign, "patientSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", patientSignFile)
          patientSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        patientSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        patientDate: dayjs().format("YYYY-MM-DD"),
        patientSign,
        doctorSign
      }
    }
    if(templateId === 39) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        dueChose: "",
        noDueChose: "",
        embryoNum: "",
        wifeSign,
        husbSign,
        doctorSign
      }
    }
    if(templateId === 40) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        cycleNum: "",
        thawChose: "",
        embThawNum: "",
        blastNum: "",
        survEmbNumm: "",
        tranEmbNum: "",
        embRemNumm: "",
        embFormatNum: "",
        disEmbNum: "",
        saveEmbNum: "",
        thawChosea: "",
        nouEmbNum: "",
        formBlastNum: "",
        tranEmbNuma: "",
        reamBlastNum: "",
        disEmbNuma: "",
        saveEmbNuma: "",
        wifeSign,
        husbSign,
        doctorSign
      }
    }
    if(templateId === 41) {
      signName.forEach(item => {
        if(item.id === templateId) {
          principalSign = item.principalSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(principalSign) {
          const principalSignFile = base64toFile(principalSign, "principalSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", principalSignFile)
          principalSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        principala: "",
        yeara: "",
        montha: "",
        daya: "",
        manIdCard: "",
        manAddress: "",
        principalb: "",
        yearb: "",
        monthb: "",
        dayb: "",
        womanIdCard: "",
        womanAddress: "",
        principal: "",
        reason: "",
        date: "",
        signDate: dayjs().format("YYYY-MM-DD"),
        principalSign,
      }
    }
    if(templateId === 52 ||
      templateId === 53 ||
      templateId === 54 ||
      templateId === 55 ||
      templateId === 56 ||
      templateId === 58 ||
      templateId === 61 ||
      templateId === 62 ||
      templateId === 103 ||
      templateId === 77 ||
      templateId === 78 ||
      templateId === 79 ||
      templateId === 80 ||
      templateId === 81 ||
      templateId === 82 ||
      templateId === 83 ||
      templateId === 84 ||
      templateId === 88 ||
      templateId === 98 ||
      templateId === 99 ||
      templateId === 100 ||
      templateId === 102
      ) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeName: "",
        husName: "",
        reason: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        wifeSign,
        husbSign,
        doctorSign
      }
      if(templateId === 55) {
        data.bloodType = ""
      }
      if(templateId === 56) {
        data.bloodType = ""
        data.rH = ""
      }
      if(templateId === 58) {
        data.embNum = ""
        data.saveEmb = ""
      }
      if(templateId === 61) {
        data.eggNum = ""
        data.eggCryop = ""
        data.otherCases = ""
        data.year = ""
        data.month = ""
      }
      if(templateId === 82) {
        data.mode = ""
        data.eggNum = ""
        data.bloType = ""
        data.rH = ""
        data.wifeBlo = ""
        data.husBlo = ""
      }
      if(templateId === 84) {
        data.doEgg = ""
      }
      if(templateId === 88) {
        data.saveYear = "",
        data.year = "",
        data.month = ""
      }
      if(templateId === 98) {
        data.medicine = ""
        data.research = ""
        data.other = ""
      }
      if(templateId === 99) {
        data.date = dayjs().format("YYYY-MM-DD"),
        data.vaginal = ""
        data.eggNum = ""
        data.norEgg = ""
      }
      if(templateId === 102) {
        data.chosea = ""
        data.choseb = ""
        data.chosec = ""
        data.chosed = ""
        data.chosee = ""
        data.chosef = ""
        data.wifeIdcard = ""
        data.husIdcard = ""
      }
    }
    if(templateId === 59) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeName: "",
        husName: "",
        other: "",
        aneuploidy: "",
        transChr: "",
        Karyotype: "",
        inversChr: "",
        invKaryotype: "",
        missChr: "",
        freeEmb: "",
        srcap: "",
        research: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        wifeIdcard: "",
        husIdcard: "",
        wifeSign,
        husbSign,
        doctorSign
      }
    }
    if(templateId === 60) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeName: "",
        husName: "",
        other: "",
        nDDgdis: "",
        mana: "",
        womana: "",
        sicka: "",
        mansickge: "",
        womansickge: "",
        childType: "",
        childsickge: "",
        autoredis: "",
        manb: "",
        womanb: "",
        sickb: "",
        mansickgeb: "",
        womansickgeb: "",
        childTypeb: "",
        childsickgeb: "",
        xchrdoindi: "",
        manc: "",
        womanc: "",
        sickc: "",
        mansickgec: "",
        womansickgec: "",
        childTypec: "",
        childsickgec: "",
        xchregendis: "",
        mand: "",
        womand: "",
        sickd: "",
        mansickged: "",
        womansickged: "",
        childTyped: "",
        childsickged: "",
        Kinship: "",
        freeEmb: "",
        srcap: "",
        research: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        wifeIdcard: "",
        husIdcard: "",
        wifeSign,
        husbSign,
        doctorSign
      }
    }
    if(templateId === 63) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          wifeSigna = item.wifeSign || ""
          wifeSignb = item.wifeSign || ""
          husbSign = item.husbSign || ""
          husbSigna = item.husbSign || ""
          husbSignb = item.husbSign || ""
          doctorSign = item.doctorSign || ""
          doctorSigna = item.doctorSign || ""
          doctorSignb = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = wifeSigna = wifeSignb = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = husbSigna = husbSignb = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = doctorSigna = doctorSignb = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        wifeSignDate: dayjs().format("YYYY-MM-DD"),
        husbSignDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        essDatea: dayjs().format("YYYY-MM-DD"),
        essDateb: dayjs().format("YYYY-MM-DD"),
        wifeSign,
        wifeSigna,
        wifeSignb,
        husbSign,
        husbSigna,
        husbSignb,
        doctorSign,
        doctorSigna,
        doctorSignb
      }
    }
    if(templateId === 85 || templateId === 86) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husSign = item.husSign || ""
          opeSign = item.opeSign || ""
          assisSign = item.assisSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husSign) {
          const husSignFile = base64toFile(husSign, "husSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husSignFile)
          husSign = res.imgUrl
        }
        if(opeSign) {
          const opeSignFile = base64toFile(opeSign, "opeSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", opeSignFile)
          opeSign = res.imgUrl
        }
        if(assisSign) {
          const assisSignFile = base64toFile(assisSign, "assisSign.gif", "image/jpeg")
          const res = await api.fileIm("/upload/file", assisSignFile)
          assisSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        name: "",
        age: "",
        hosDate: dayjs().format("YYYY-MM-DD"),
        date: dayjs().format("YYYY-MM-DD"),
        semenNum: "",
        spermMotile: "",
        patient: "",
        doctor: "",
        assistant: "",
        wifeSign,
        husSign,
        opeSign,
        assisSign
      }
      if(templateId === 86) {
        data.bloType = "",
        data.rH = ""
      }
    }
    if(templateId === 87) {
      signName.forEach(item => {
        if(item.id === templateId) {
          prinSign = item.prinSign || ""
          doctorSign = item.doctorSign || ""
          prinSigna = item.prinSigna || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(prinSign) {
          const prinSignFile = base64toFile(prinSign, "prinSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", prinSignFile)
          prinSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
        if(prinSigna) {
          const prinSignaFile = base64toFile(prinSigna, "prinSigna.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", prinSignaFile)
          prinSigna = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        prinDate: dayjs().format("YYYY-MM-DD"),
        doctorSignDate: dayjs().format("YYYY-MM-DD"),
        agentName: "",
        prinIdcard: "",
        phone: "",
        prinSign,
        doctorSign,
        prinSigna
      }
    }
    if(templateId === 104) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          thawDocSign = item.thawDocSign || ""
          transEmbDoctor = item.transEmbDoctor || ""
          transDoctor = item.transDoctor   || ""
          talker = item.talker || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(thawDocSign) {
          const thawDocSignFile = base64toFile(thawDocSign, "thawDocSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", thawDocSignFile)
          thawDocSign = res.imgUrl
        }
        if(transEmbDoctor) {
          const transEmbDoctorFile = base64toFile(transEmbDoctor, "transEmbDoctor.gif", "image/jpeg")
          const res = await api.fileIm("/upload/file", transEmbDoctorFile)
          transEmbDoctor = res.imgUrl
        }
        if(transDoctor) {
          const transDoctorFile = base64toFile(transDoctor, "transDoctor.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/fileFinger", transDoctorFile)
          transDoctor = res.imgUrl
        }
        if(talker) {
          const talkerFile = base64toFile(talker, "talker.webp", "image/jpeg")
          const res = await api.fileIm("/upload/file", talkerFile)
          talker = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        name: "",
        age: "",
        hosDate: dayjs().format("YYYY-MM-DD"),
        thawNum: "",
        survive: "",
        levela: "",
        freezNum: "",
        carrierNum: "",
        norEgg: "",
        abnEgg: "",
        eggUnfe: "",
        survivedNot: "",
        AbneggNum: "",
        embCulture: "",
        hosDatea: dayjs().format("YYYY-MM-DD"),
        tranEmb: "",
        embs: "",
        freez: "",
        levelFreez: "",
        Blastocyst: "",
        embLevel: "",
        Achose: "",
        Bchose: "",
        yes: "",
        no: "",
        aachose: "",
        bbchose: "",
        ccchose: "",
        ddchose: "",
        eechose: "",
        date: dayjs().format("YYYY-MM-DD"),
        wifeSign,
        husbSign,
        thawDocSign,
        transEmbDoctor,
        transDoctor,
        talker
      }
    }
    if(templateId === 89) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          thawDoctor = item.thawDoctor || ""
          transEmbDoctor = item.transEmbDoctor || ""
          transDoctor = item.transDoctor   || ""
          talker = item.talker || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(thawDoctor) {
          const thawDoctorFile = base64toFile(thawDoctor, "thawDoctor.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", thawDoctorFile)
          thawDoctor = res.imgUrl
        }
        if(transEmbDoctor) {
          const transEmbDoctorFile = base64toFile(transEmbDoctor, "transEmbDoctor.gif", "image/jpeg")
          const res = await api.fileIm("/upload/file", transEmbDoctorFile)
          transEmbDoctor = res.imgUrl
        }
        if(transDoctor) {
          const transDoctorFile = base64toFile(transDoctor, "transDoctor.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/fileFinger", transDoctorFile)
          transDoctor = res.imgUrl
        }
        if(talker) {
          const talkerFile = base64toFile(talker, "talker.webp", "image/jpeg")
          const res = await api.fileIm("/upload/file", talkerFile)
          talker = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        name: "",
        age: "",
        date: dayjs().format("YYYY-MM-DD"),
        oocCrys: "",
        oocCycle: "",
        thawNum: "",
        surNum: "",
        thawLevel: "",
        froRem: "",
        Carrier: "",
        eggNorFer: "",
        eggAbnFer: "",
        eggUnfer: "",
        eggNotsur: "",
        eggAbno: "",
        embCul: "",
        hosDate: dayjs().format("YYYY-MM-DD"),
        backTraNum: "",
        embryo: "",
        freeEmb: "",
        freeLevel: "",
        blasNum: "",
        embLevel: "",
        scrap: "",
        research: "",
        yes: "",
        no: "",
        choseA: "",
        choseB: "",
        choseC: "",
        choseD: "",
        choseE: "",
        signDate: dayjs().format("YYYY-MM-DD"),
        wifeSign,
        husbSign,
        thawDoctor,
        transEmbDoctor,
        transDoctor,
        talker
      }
    }
    if(templateId === 90) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          transEmbDoctor = item.transEmbDoctor || ""
          transDoctor = item.transDoctor   || ""
          talker = item.talker || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(transEmbDoctor) {
          const transEmbDoctorFile = base64toFile(transEmbDoctor, "transEmbDoctor.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", transEmbDoctorFile)
          transEmbDoctor = res.imgUrl
        }
        if(transDoctor) {
          const transDoctorFile = base64toFile(transDoctor, "transDoctor.gif", "image/jpeg")
          const res = await api.fileIm("/upload/file", transDoctorFile)
          transDoctor = res.imgUrl
        }
        if(talker) {
          const talkerFile = base64toFile(talker, "talker.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/fileFinger", talkerFile)
          talker = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        name: "",
        age: "",
        embNum: "",
        freeEmb: "",
        thawNum: "",
        thawDate: dayjs().format("YYYY-MM-DD"),
        blastulaNum: "",
        survNum: "",
        thawLevel: "",
        transDate: "",
        numBlast: "",
        numSurvive: "",
        tranLevel: "",
        scrap: "",
        research: "",
        embExiNum: "",
        blaExiNum: "",
        yes: "",
        no: "",
        culBlaNum: "",
        culBlaLevel: "",
        scrBlaNum: "",
        scrBlaLevel: "",
        date: dayjs().format("YYYY-MM-DD"),
        wifeSign,
        husbSign,
        transEmbDoctor,
        transDoctor,
        talker
      }
    }
    if(templateId === 91) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          transEmbDoctor = item.transEmbDoctor || ""
          checkDocSign = item.checkDocSign || ""
          transDoctor = item.transDoctor   || ""
          talker = item.talker || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(transEmbDoctor) {
          const transEmbDoctorFile = base64toFile(transEmbDoctor, "transEmbDoctor.gif", "image/jpeg")
          const res = await api.fileIm("/upload/file", transEmbDoctorFile)
          transEmbDoctor = res.imgUrl
        }
        if(checkDocSign) {
          const checkDocSignFile = base64toFile(checkDocSign, "checkDocSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", checkDocSignFile)
          checkDocSign = res.imgUrl
        }
        if(transDoctor) {
          const transDoctorFile = base64toFile(transDoctor, "transDoctor.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/fileFinger", transDoctorFile)
          transDoctor = res.imgUrl
        }
        if(talker) {
          const talkerFile = base64toFile(talker, "talker.webp", "image/jpeg")
          const res = await api.fileIm("/upload/file", talkerFile)
          talker = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        name: "",
        age: "",
        cycle: "",
        chosea: "",
        choseb: "",
        chosec: "",
        culBlaNum: "",
        DfiveNum: "",
        DfiveLevel: "",
        Dsixnum: "",
        DsixLevel: "",
        hosDate: dayjs().format("YYYY-MM-DD"),
        transBlas: "",
        freezNum: "",
        freezLevel: "",
        Achose: "",
        Bchose: "",
        yes: "",
        no: "",
        date: dayjs().format("YYYY-MM-DD"),
        wifeSign,
        husbSign,
        transEmbDoctor,
        checkDocSign,
        transDoctor,
        talker
      }
    }
    if(templateId === 92) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          transEmbDoctor = item.transEmbDoctor || ""
          transDoctor = item.transDoctor   || ""
          talker = item.talker || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(transEmbDoctor) {
          const transEmbDoctorFile = base64toFile(transEmbDoctor, "transEmbDoctor.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", transEmbDoctorFile)
          transEmbDoctor = res.imgUrl
        }
        if(transDoctor) {
          const transDoctorFile = base64toFile(transDoctor, "transDoctor.gif", "image/jpeg")
          const res = await api.fileIm("/upload/file", transDoctorFile)
          transDoctor = res.imgUrl
        }
        if(talker) {
          const talkerFile = base64toFile(talker, "talker.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/fileFinger", talkerFile)
          talker = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        name: "",
        age: "",
        cycle: "",
        diagnosis: "",
        screening: "",
        eggPunDate: dayjs().format("YYYY-MM-DD"),
        vaginal: "",
        eggNum: "",
        eggMature: "",
        norEgg: "",
        abnEgg: "",
        eggUnfe: "",
        survivedNot: "",
        AbneggNum: "",
        ferti: "",
        Dfive: "",
        DfiveNum: "",
        Dsix: "",
        DsixNum: "",
        level: "",
        freezNum: "",
        month: "",
        day: "",
        signObv: "",
        failAmpli: "",
        abnoChr: "",
        norChr: "",
        chosea: "",
        choseb: "",
        yes: "",
        no: "",
        Achose: "",
        Bchose: "",
        Cchose: "",
        Dchose: "",
        date: dayjs().format("YYYY-MM-DD"),
        wifeSign,
        husbSign,
        transEmbDoctor,
        transDoctor,
        talker
      }
    }
    if(templateId === 93 || templateId === 94) {
      signName.forEach(item => {
        if(item.id === templateId) {
          wifeSign = item.wifeSign || ""
          husbSign = item.husbSign || ""
          transEmbDoctor = item.transEmbDoctor || ""
          checkDocSign = item.checkDocSign || ""
          transDoctor = item.transDoctor   || ""
          talker = item.talker || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(wifeSign) {
          const wifeSignFile = base64toFile(wifeSign, "wifeSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", wifeSignFile)
          wifeSign = res.imgUrl
        }
        if(husbSign) {
          const husbSignFile = base64toFile(husbSign, "husbSign.png", "image/jpeg")
          const res = await api.fileIm("/upload/file", husbSignFile)
          husbSign = res.imgUrl
        }
        if(transEmbDoctor) {
          const transEmbDoctorFile = base64toFile(transEmbDoctor, "transEmbDoctor.gif", "image/jpeg")
          const res = await api.fileIm("/upload/file", transEmbDoctorFile)
          transEmbDoctor = res.imgUrl
        }
        if(checkDocSign) {
          const checkDocSignFile = base64toFile(checkDocSign, "checkDocSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", checkDocSignFile)
          checkDocSign = res.imgUrl
        }
        if(transDoctor) {
          const transDoctorFile = base64toFile(transDoctor, "transDoctor.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/fileFinger", transDoctorFile)
          transDoctor = res.imgUrl
        }
        if(talker) {
          const talkerFile = base64toFile(talker, "talker.webp", "image/jpeg")
          const res = await api.fileIm("/upload/file", talkerFile)
          talker = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        name: "",
        age: "",
        choseA: "",
        choseB: "",
        choseC: "",
        cycle: "",
        norEgg: "",
        abnEgg: "",
        eggUnfe: "",
        survivedNot: "",
        AbneggNum: "",
        embCulture: "",
        hosDate: dayjs().format("YYYY-MM-DD"),
        hosDatea: dayjs().format("YYYY-MM-DD"),
        tranEmb: "",
        embs: "",
        freez: "",
        level: "",
        culBlastNum: "",
        Achose: "",
        Bchose: "",
        yes: "",
        no: "",
        aachose: "",
        bbchose: "",
        ccchose: "",
        ddchose: "",
        eechose: "",
        date: dayjs().format("YYYY-MM-DD"),
        wifeSign,
        husbSign,
        transEmbDoctor,
        checkDocSign,
        transDoctor,
        talker
      }
      if(templateId === 94) {
        data.eggRecept = ""
        data.Mature = ""
      }
    }
    if(templateId === 95 ||
      templateId === 96 || 
      templateId === 97 ||
      templateId === 101
      ) {
      signName.forEach(item => {
        if(item.id === templateId) {
          patientSign = item.patientSign || ""
          doctorSign = item.doctorSign || ""
        }
      })
      // 不等于2表示需要补签，base64图片先转文件存服务器
      if(current !== 2) {
        if(patientSign) {
          const patientSignFile = base64toFile(patientSign, "patientSign.jpg", "image/jpeg")
          const res = await api.fileIm("/upload/file", patientSignFile)
          patientSign = res.imgUrl
        }
        if(doctorSign) {
          const doctorSignFile = base64toFile(doctorSign, "doctorSign.bmp", "image/jpeg")
          const res = await api.fileIm("/upload/file", doctorSignFile)
          doctorSign = res.imgUrl
        }
      }
      data = {
        medicalNum: "",
        Department: "",
        Ward: "",
        bedNo: "",
        cliNum: "",
        hospNum: "",
        name: "",
        sex: "",
        age: "",
        profession: "",
        address: "",
        date: dayjs().format("YYYY-MM-DD"),
        patientSign,
        doctorSign
      }
      if(templateId === 96 || templateId === 97 || templateId === 101) {
        data.diagnosis = ""
      }
    }
    // 如果此次是补录，删除补录的信息
    if(templateId === againSign.id) {
      await api.postIm(`/file/makeUpDel?modelId=${againSign.id}&pid=${pid}`)
    }
    // 指纹数据
    if(templateId === 46 || templateId === 95 || templateId === 96 || templateId === 97 || templateId === 101) {
      fingerData.forEach(item => {
        if(item.id === templateId) {
          data.patientHandPrint = item.patientHandPrint || ""
        }
      })
      if(current !== 2) {
        if(data.patientHandPrint) {
          const patientHandPrintFile = base64toFile(data.patientHandPrint, "patientHandPrint.png", "image/jpeg")
          const res = await api.fileIm("/upload/fileFinger", patientHandPrintFile)
          data.patientHandPrint = res.imgUrl
        }
      }
    }else if(templateId === 87) {
      fingerData.forEach(item => {
        if(item.id === templateId) {
          data.prinHandPrint = item.prinHandPrint || ""
          data.prinHandPrinta = item.prinHandPrinta || ""
        }
      })
      if(current !== 2) {
        if(data.prinHandPrint) {
          const prinHandPrintFile = base64toFile(data.prinHandPrint, "prinHandPrint.gif", "image/jpeg")
          const res = await api.fileIm("/upload/fileFinger", prinHandPrintFile)
          data.prinHandPrint = res.imgUrl
        }
        if(data.prinHandPrinta) {
          const prinHandPrintaFile = base64toFile(data.prinHandPrinta, "prinHandPrinta.png", "image/jpeg")
          const res = await api.fileIm("/upload/fileFinger", prinHandPrintaFile)
          data.prinHandPrintaFile = res.imgUrl
        }
      }
    }else if(templateId >= 42) {
      fingerData.forEach(item => {
        if(item.id === templateId) {
          data.wifeHandPrint = item.wifeHandPrint || ""
          data.husHandPrint = item.husHandPrint || ""
        }
      })
      if(current !== 2) {
        if(data.wifeHandPrint) {
          const wifeHandPrintFile = base64toFile(data.wifeHandPrint, "wifeHandPrint.gif", "image/jpeg")
          const res = await api.fileIm("/upload/fileFinger", wifeHandPrintFile)
          data.wifeHandPrint = res.imgUrl
        }
        if(data.husHandPrint) {
          const husHandPrintFile = base64toFile(data.husHandPrint, "husHandPrint.png", "image/jpeg")
          const res = await api.fileIm("/upload/fileFinger", husHandPrintFile)
          data.husHandPrint = res.imgUrl
        }
      }
    }
    // ccrm获取知情同意书数据
    let ccrmData = {}
    let localInfo = JSON.parse(window.sessionStorage.getItem("info"))
    if(localInfo?.origin === "ccrm" && current === 2) {
      let info = await request(`Type=${localInfo.Type}&REGCOD=${localInfo.REGCOD}`)
      let templateInfo = info.result[0]
      ccrmData = {
        wifeName: templateInfo.womnam,
        husName: templateInfo.mannam,
        Karyotype: templateInfo.womexaE31202,
        invKaryotype: templateInfo.manexaE70202,
        doEgg: templateInfo.obtnum,
        eggNum: templateInfo.donnum,
        essDateb: templateInfo.revdat,
        eggPunDate: templateInfo.obtdat,
        bloType: templateInfo.donE30301,
        rH: templateInfo.donE30302,
        husBlo: templateInfo.e70101,
        wifeBlo: templateInfo.e30301,
        age: templateInfo.womage,
        bloodType: templateInfo.donabo,
        transDate: templateInfo.tradat,
        thawNum: templateInfo.thwovmnum,
        freezNum: templateInfo.frzovmnum,
        carrierNum: templateInfo.frzcuv,
        choseC: templateInfo.nicnum,
        survivedNot: templateInfo.deanum,
        AbneggNum: templateInfo.yclnum,
        embCulture: templateInfo.mtenum,
        tranEmb: templateInfo.entnum,
        freeEmb: templateInfo.femnum,
        culBlaNum: templateInfo.culbla,
        scrBlaNum: templateInfo.fqmnum,
        Dfive: templateInfo.d5XNPS,
        Dsix: templateInfo.d6XNPS,
        numBlast: templateInfo.blenum,
        eggMature: templateInfo.oornum,
        embNum: templateInfo.embnum,
        eggRecept: templateInfo.ovmnum,
        norEgg: templateInfo.fsenum,
        abnEgg: templateInfo.foenum,
        eggUnfe: templateInfo.wsjnum,
        cliNum: templateInfo.clinum,
        hospNum: templateInfo.inhnum,
        profession: templateInfo.patocc,
        address: templateInfo.homadd
      }
    }
    let body = {
      data: { ...data, ...collectField, ...ccrmData },
      name,
      pid: Number(pid),
      contentName,
      modelPath,
      templateFile,
      isComplete: current === 2 ? 1 : 0,
      munber: info.card,
      modelId: templateId
    }
    const url = await api.postIm("/file/conversion", body)
    // 此次签名信息完整，在未签署的知情同意书里面删除该同意书
    if(current === 2) {
      modalRef.current.onChange(templateId)
      // 根据夫妻其中一人的信息查询另一个人的信息
      // 将签署的知情同意书保存在另一人身上
      if(localInfo?.origin === "ccrm") {
        let coupleInfo = await api.getIm("/patient/coupleInfo", { pid })
        api.postIm("/file/SpousePdfs", {
          pid: coupleInfo[0].pid,
          pdfUrl: url,
          modelId: templateId,
          contentName: allTemplateName[templateIndex].name
        })
      }
      // 摘要文件和数据签名
      if(docSignPicture && url.length > 10) {
        getFileSign(url, contentName, templateId)
      }
    }else {
      changeTemplateName(1)
    }
  }

  // 将组套下面的知情同意书添加到患者里面
  const addStackToPatient = (templateArr) => {
    modalRef.current.addStackToPatient(templateArr)
  }

  // 摘要文件和数据签名
  const getFileSign = async (url, contentName, templateId) => {
    // CA key就是hash值
    let hashData = await _HashData(url)
    // CA证书就是P7签名值
    let signData = await _P7SignData(hashData)
    // 时间戳签名
    let test = await _TSATest(url)
    // ca存档参数
    let body = {
      certificationNum: "", //认证编号
      manName: info.sex === 0 ? info.name : "", //男方姓名
      womanName: info.sex === 0 ? "" : info.name, //女方姓名
      contentName: contentName, //同意书名字
      cakey: hashData, //ca_key
      caCertification: signData, //ca证书
      timeSign: test, //时间戳签名
      createTime: dayjs().format("YYYY-MM-DD HH:mm:ss"), //创建时间
      createName: userInfo.username, //创建人
      outpatientNum: "", //就诊编号
      modelId: templateId, //模板id
      recordNo: "", //病历号
      cycleNum: "", //周期号
      cycleNo: "" //周期序号
    }
    await api.getIm("/ca/achive", body)
  }

  // 改变签名进度
  const changeCurrentSign = (templateId) => {
    setCurrent(0)
    let currentSign = {}
    let currentFinger = {}
    let count = 0
    signName.forEach(item => {
      if(item.id === templateId) {
        currentSign = item
      }
    })
    fingerData.forEach(item => {
      if(item.id === templateId) {
        currentFinger = item
      }
    })
    let signLength = Object.keys(currentSign).length ? Object.keys(currentSign).length : 1
    let fingerLength = Object.keys(currentFinger).length ? Object.keys(currentFinger).length : 1
    let length = signLength + fingerLength -2
    length > 0 && setCurrent(1)
    signArr.forEach(item => {
      if(item.hasOwnProperty("isHaveFinger")) count++
    })
    length === signArr.length + count && setCurrent(2)
  }

  // 用户添加修改组套
  const changeStack = async (setId) => {
    await api.postIm("/sets/userSets", {setId, userId: Number(pid)})
    const res = await api.getIm("/patient/basics", { pid })
    setInfo(res)
  }

  // 判断是否填写
  const isHaveField = (id) => {
    let isField = false
    field.forEach(item => {
      if(item.id === id) {
        isField = true
      }
    })
    return isField
  }

  // 代填收集
  const addInformField = (e, param) => {
    let value = e.target.value
    let id = allTemplateName[templateIndex].id
    if(isHaveField(id)) {
      field.forEach(item => {
        if(item.id === id) {
          item[param] = value
        }
      })
    }else {
      field.push({
        id,
        [param]: value
      })
    }
    setField([...field])
  }

  const customDot = (dot, { status, index }) => (
    <span onClick={() => isShowSignVisible(status, index)}>
      {dot}
    </span>
  )

  return (
    <div style={{ padding: 16 }}>
      <Row align="middle" justify="space-between">
        <Col> 
          <Link to={`/home/base-info/${info.card}`}>
            <Space>
              <LeftOutlined style={iconStyle} />
              <span>返回</span>
            </Space>
          </Link>
        </Col>
        <Col>
          {info && (
            <Space size={16} style={{ color: "#444" }}>
              <span>{info.name}</span>
              <span>{info.sex == 0 ? "男" : "女"}</span>
              <span>{info.card}</span>
              <span>{info.phone}</span>
            </Space>
          )}
        </Col>
        <Col>
          {
            allTemplateName.length > 0 && (
              <Space size={16} style={spaceStyle}>
                <ArrowLeftOutlined style={iconStyle} onClick={() => changeTemplateName(-1)} />
                <span style={{ userSelect: "none"}}>
                  {allTemplateName[templateIndex] && allTemplateName[templateIndex].name.substring(2)}
                </span>
                <ArrowRightOutlined style={iconStyle} onClick={() => changeTemplateName(1)} />
              </Space>
            )
          }
          {
            !allTemplateName.length && (
              <Space size={16} style={spaceStyle}>
                <span>暂无可用的模板</span>
              </Space>
            )
          }
        </Col>
        <Col>
          <Space>
            <Button 
              type="primary" 
              size="small"
              style={{ backgroundColor: "#FFA25C", border: "#FFA25C" }}
              onClick={() => setStackVisible(true)}
            >
              添加组套
            </Button>
            <Button
              type="primary"
              size="small"
              style={{ backgroundColor: "#FFA25C", border: "#FFA25C" }}
              onClick={() => setVisible(true)}
            >
              添加同意书
            </Button>
            <PrintInformed
              informed={templatePath}>
            </PrintInformed>
          </Space>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col style={{ flex: 1 }}>
          <BackShadow
            style={{
              height: "calc(100vh - 130px)",
              textAlign: "center",
              overflow: "auto",
              padding: "24px 16px",
            }}
          >
            <iframe 
              src={templatePath}
              style={{ userSelect: "none" }}
              frameBorder={0}
              width="100%" 
              height="95%"
            />
          </BackShadow>
        </Col>
        <Col style={{ width: 346 }}>
          <BackShadow
            style={{ height: "calc(100vh - 130px)", position: "relative" }}
          >
            <Row justify="end">
              <Col>
                <Link to={`/home/input/consent-all/${pid}`}>
                  <OutLineSpan color="#7AA0FC">已签署</OutLineSpan>
                </Link>
              </Col>
            </Row>
            <SectionTitle>进度</SectionTitle>
            <StepBox>
              <Steps progressDot={customDot} current={current} size="small" >
                <Step title="验 证" />
                <Step title="签 名" />
                <Step title="成 功" /> 
              </Steps>
            </StepBox>
            <SectionTitle style={{ display: addition.length ? "" : "none" }}>待填</SectionTitle>
            <AddSpace direction="vertical">
              {
                addition.map(item => (
                  <AddWrapper key={item.value}>
                    <span style={{ width: "130px", display: "inline-block" }}>{item.value}</span>
                    <Input value={collectField[item.key]} onChange={(e) => addInformField(e, item.key)} />
                  </AddWrapper>
                ))
              }
            </AddSpace>
            <SectionTitle>认证</SectionTitle>
            <BaseSpace direction="vertical" size={16}>
              {
                signArr.map((item, index) => (
                  <Space size={16} key={item.value}>
                    <span style={{ width: "48px", display: "inline-block" }}>{item.value}</span>
                    <SignedEdition
                      params={item.key}
                      fingerParams={item.fingerKey}
                      isHaveFinger={item.isHaveFinger}
                      templateId={allTemplateName[templateIndex] && allTemplateName[templateIndex].id}
                      signName={signName}
                      fingerData={fingerData}
                      timer={timer}
                      setTimer={setTimer}
                      color={signIndex === index ? "rgba(0, 0, 0, 0.1)" : "#ededed8f"}
                      changeColor={() => setSignIndex(index)}
                      onChange={saveSignPicture}
                    />
                  </Space>
                ))
              }
            </BaseSpace>

            <PosBottom>
              <Button 
                type="primary"
                onClick={() => submit()}
              >
                提交
              </Button>
            </PosBottom>
          </BackShadow>
        </Col>
      </Row>
      <InformModal 
        visible={visible}
        ref={modalRef}
        changeTemplate={(template) => setAllTemplateName(template)}
        getAllTemplate={(template) => setTemplate(template)}
        onCancel={() => {
          setVisible(false)
        }}
      />
      <SignModal
        visible={signVisible}
        title={title}
        onCancel={() => setSignVisible(false)}
        onOk={onOk}
      />
      <AddStackModal 
        visible={stackVisible}
        setId={info.setId}
        onCancel={() => setStackVisible(false)}
        changeStack={changeStack}
        addStackToPatient={addStackToPatient}
      />
    </div>
  )
}

const PosBottom = styled.div`
  width: 90%;
  text-align: center;
  position: absolute;
  bottom: 24px;
`

const OutLineSpan = styled.div`
  color: ${(props) => props.color || "#666"};
  text-decoration: underline;
  cursor: pointer;
`
const StepBox = styled.div`
  margin: 24px 0;
  margin-left: -60px;

  .ant-steps-item-title {
    font-size: 12px;
  }
`
const BaseSpace = styled(Space)`
  width: 100%;
  max-height: 280px;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`
const AddSpace = styled(Space)`
  width: 100%;
  max-height: 110px;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`
const AddWrapper = styled.div`
  height: 38px;
  .ant-input {
    width: 160px;
  }
`