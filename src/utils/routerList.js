import React, { lazy } from "react"

// page
import All from "../views/Info/All/index.jsx"
import Documents from "../views/Info/Documents/index.jsx"

import UserMange from "../views/Power/UserMange"
import Cache from "../views/Power/Cache"

export const infoSide = [
  // 电子病历
  [
    [
      "/home/info/all",
      {
        name: "全部",
        component: All,
        icon: "icon-all-2",
        activeIcon: "icon-all",
      },
    ],
  ],
  [
    [
      "/home/info/certificate",
      {
        name: "证件照",
        icon: "icon-Profilepicture",
        activeIcon: "icon-a-Profilepicture",
      },
    ],
    [
      "/home/info/certificate/id-card",
      {
        name: "身份证",
        component: Documents,
      },
    ],
    [
      "/home/info/certificate/officer",
      {
        name: "军官证",
        component: Documents,
      },
    ],
    [
      "/home/info/certificate/passport",
      {
        name: "护照",
        component: Documents,
      },
    ],
    [
      "/home/info/certificate/marry",
      {
        name: "结婚证",
        component: Documents,
      },
    ],
    [
      "/home/info/certificate/plan",
      {
        name: "其他",
        component: Documents,
      },
    ],
  ],
  [
    [
      "/home/info/record",
      {
        name: "病历",
        component: Documents,
        icon: "icon-cases",
        activeIcon: "icon-a-Medicalrecords",
      },
    ],
  ],
  [
    [
      "/home/info/consent",
      {
        name: "知情同意书",
        component: Documents,
        icon: "icon-Informedconsent",
        activeIcon: "icon-a-Informedconsent-copy",
      },
    ],
  ],
  [
    [
      "/home/info/signed",
      {
        name: "化验单",
        component: Documents,
        icon: "icon-laboratorytestreport",
        activeIcon: "icon-a-laboratorytestreport",
      },
    ],
  ],
]

const infoOtrList = []
export const infoRoutes = new Map([...infoSide.flat(1), ...infoOtrList])

// 不在sidebar 并且无页面嵌套关系的路由 电子病历模块
export const inputList = []

export const inputRoutes = new Map([...inputList])

export const powerSide = [
  // 电子病历
  [
    [
      "/home/power/user",
      {
        name: "账号管理",
        component: UserMange,
      },
    ],
  ],
  [
    [
      "/home/power/cache",
      {
        name: "数据留存",
        component: Cache,
      },
    ],
  ],
]

const powerOtrList = []
export const powerRoutes = new Map([...powerSide.flat(1), ...powerOtrList])
