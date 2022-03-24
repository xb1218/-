import { action, extendObservable } from "mobx"
import api from "../utils/request"
import { saveToken } from "../utils/token.js"

function Auth() {
  extendObservable(this, {
    userInfo: {},
    login: action(async (params) => {
      const res = await api.post("/login", params, {}, false)
      saveToken(res.token)
      return res
    }),
    register: action(async (params) => {
      const res = await api.post("/register", params, {}, false)
      return res
    }),
    changePassword: action(async (params) => {
      const res = await api.put("/password", params, {
        success: "密码修改成功",
      })
      return res
    }),
    getUserInfo: action(async () => {
      const res = await api.get("/users")
      this.userInfo = res
      return res
    }),
  })
}

export default Auth
