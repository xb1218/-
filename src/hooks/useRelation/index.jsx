import React, { useCallback, useState, useEffect } from "react"
import { AutoComplete } from "antd"
const { Option } = AutoComplete

import api from "../../utils/request.js"

// 自定义hook示例 这里是一个亲缘关系的下拉框

function useRelation() {
  const [relationlist, setrelationlist] = useState([]) //关系 下拉options
  const [allRelation, setallRelation] = useState([]) //所有关系

  useEffect(async () => {
    getRelation()
  }, [])

  // 获取亲缘关系
  const getRelation = async () => {
    const res = await api.get(`/v1/geneticRelationShip`, { name: "" })
    const arr = res.map((item) => item.name)
    setallRelation(arr)
    setrelationlist(arr)
  }

  // 输入亲缘关系过程中
  const onChangeRelation = (value) => {
    let arr = []
    if (value == "") {
      arr = allRelation
    } else {
      for (let e of allRelation) {
        e.indexOf(value) > -1 ? arr.push(e) : ""
      }
    }

    setrelationlist(arr)
  }

  // 获取焦点的时候 永远展示全部候选信息
  const onFocusRelation = () => {
    setrelationlist(allRelation)
  }

  // 如果不存在 添加亲缘关系
  const saveRelation = async (data = "") => {
    const isMatch = allRelation.indexOf(data) == -1
    if (data != "" && isMatch) {
      const res = await api.post("/v1/geneticRelationShip", { name: data })
    }
  }

  return {
    relationlist,
    onChangeRelation,
    saveRelation,
    onFocusRelation,
  }
}

export default useRelation
