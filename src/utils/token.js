import api from "@/utils/request.js"
import { message } from "antd"

// 保存token
export function saveToken(token) {
  // 服务器5分钟过期 本地存储为4.5分钟后过期
  const expries = new Date().getTime() + 3 * 60 * 1000
  const obj = { token, expries }
  window.sessionStorage.setItem("informationToken", JSON.stringify(obj))
}

// 删除token
export function delToken() {
  window.sessionStorage.removeItem("informationToken")
}

// 查询token
export function getToken() {
  const obj = JSON.parse(window.sessionStorage.getItem("informationToken"))
  return obj ? obj.token : ""
}

//   刷新token
export async function refreshToken() {
  // 判读过期时间
  const { expries } = JSON.parse(
    window.sessionStorage.getItem("informationToken")
  )

  const isExpries = expries - new Date().getTime()
  console.log(`🚀 ~ 距离刷新token时间 还有${isExpries / 1000}秒`)

  if (isExpries > 0) {
    setTimeout(async () => {
      const res = await api.post("/login/fresh")
      saveToken(res.token)
      refreshToken()
    }, isExpries)
  } else {
    message.error("您的登陆认证已过期 请重新登陆!")
    window.location.href = "/login"
  }
}
