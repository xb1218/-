import qs from "qs"
import { getToken, refreshToken } from "@/utils/token.js"
import apiUrl from "../config"
import { message } from "antd"

function alertSuccess(content) {
  message.success({ content, className: "custom-success-class" })
}

function alertError(content) {
  message.warning({ content: content, className: "custom-error-class" })
}

// 请求封装
const http = (method, url, data, Msg, withToken) => {
  const token = getToken()
  const config = {
    method: method,
    headers: {
      Authorization: withToken ? `${token}` : "",
      "Content-Type": data ? "application/json" : "",
    },
  }

  // post 有body
  data ? (config.body = JSON.stringify(data || {})) : ""
  return window
    .fetch(`${apiUrl.backend}${url}`, config)
    .then((response) => dealResponce(response, Msg))
}

// 调用sivf里面的接口
const request = (url, data, Msg) => {
  const config = {
    method: "GET",
    headers: {
      "Content-Type": data ? "application/json" : "",
      "Secret": "C6DA9FC38E622E27AC76EB5E0AD00868"
    }
  }
  return window
    .fetch(url, config)
    .then((response) => dealResponce(response, Msg))
}

// 免登录调用接口
const server = (method, url, data, Msg, withToken) => {
  const token = getToken()
  const config = {
    method: method,
    headers: {
      "Secret": "C6DA9FC38E622E27AC76EB5E0AD00868",
      "Content-Type": data ? "application/json" : "",
    },
  }

  // post 有body
  data ? (config.body = JSON.stringify(data || {})) : ""
  return window
    .fetch(`${apiUrl.backend}${url}`, config)
    .then((response) => dealResponce(response, Msg))
}

// 处理responce
const dealResponce = async (response, Msg) => {
  const res = await response.json()
  const totalCount = response.headers.get("x-total-count") || ""
  totalCount ? (res.totalCount = totalCount) : ""

  //   请求后 拦截处理
  switch (response.status) {
    case 400:
      alertError(Msg.error || res.message)
      break
    case 401:
      window.location.href = "/login"
      message.warning("token已过期，请重新登录")
      break
    case 500:
      alertError(Msg.error || res.message)
      break
    case 404:
      alertError(Msg.error || res.message)
      break
  }

  if (!response.status) {
    alertError(res.message || "网络出现问题")
  }

  if (response.ok && res.code == 200) {
    //如果设置了成功显示的信息 则提示 没有设置 则不提示
    Msg.success && Msg.success != "" ? alertSuccess(Msg.success) : ""
    return Promise.resolve(res.data)
  } else {
    Msg.error == "" ? "" : alertError(Msg.error || res.message)
    return Promise.resolve(res.data)
  }
}

function handleQueryString(endpoint, data) {
  if (endpoint.includes("?")) {
    return data ? "&" + qs.stringify(data) : ""
  } else {
    return data ? "?" + qs.stringify(data) : ""
  }
}

export default {
  // get请求
  get: (endpoint, data, Msg = {}, withToken = true) => {
    const queryString = handleQueryString(endpoint, data)
    return http("GET", endpoint + queryString, false, Msg, withToken)
  },

  // 免登录的get请求
  getIm: (endpoint, data, Msg = {}, withToken = true) => {
    const queryString = handleQueryString(endpoint, data)
    return server("GET", endpoint + queryString, false, Msg, withToken)
  },

  // get请求调取sivf接口
  getSivf: (endpoint, data, Msg = {}) => {
    return request(endpoint, data, Msg)
  },

  // post请求
  post: (endpoint, data = {}, Msg = {}, withToken = true) => {
    return http("POST", endpoint, data, Msg, withToken)
  },

  // 免登录的post请求
  postIm: (endpoint, data = {}, Msg = {}, withToken = true) => {
    return server("POST", endpoint, data, Msg, withToken)
  },

  // put请求
  put: (endpoint, data = {}, Msg = {}, withToken = true) => {
    return http("PUT", endpoint, data, Msg, withToken)
  },

  // del
  del: (endpoint, data = {}, Msg = {}, withToken = true) => {
    return http("DELETE", endpoint, data, Msg, withToken)
  },

  // 上传图片
  file: async (endpoint, file = {}) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("fileType", "png")

    const token = getToken()
    const response = await fetch(`${apiUrl.backend}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData, //自动修改请求头,formdata的默认请求头的格式是 multipart/form-data
    })

    return await dealResponce(response, {})
  },

  // 免登录上传图片
  fileIm: async (endpoint, file = {}) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("fileType", "png")

    const response = await fetch(`${apiUrl.backend}${endpoint}`, {
      method: "POST",
      headers: {
        "Secret": "C6DA9FC38E622E27AC76EB5E0AD00868"
      },
      body: formData,
    })

    return await dealResponce(response, {})
  }
}
