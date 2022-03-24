import useRequest from "@ahooksjs/use-request"
import React, { useRef, useCallback } from "react"
import api from "../../utils/request.js"

export function useAntdTable(toPoint, options) {
  // 获取data
  const getTableData = async ({ current = 1, pageSize = 15 }, formData) => {
    const params = {
      pageNum: current,
      pageSize: pageSize,
      sex: 2,
      cardType: 0,
      ...formData, //筛选条件object
    }
    const res = await api.post(toPoint, params)
    return {
      total: res.total,
      list: res.list,
    }
  }

  // useRequest
  const result = useRequest(getTableData, {
    paginated: true,
    ...options,
    // debounceInterval: 200,
  })

  return {
    ...result, //data error loading paginated
  }
}
