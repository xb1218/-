import React, { useEffect, useState } from "react"
import { Menu } from "antd"
import styled from "@emotion/styled"
import { useHistory } from "react-router-dom"
import { createFromIconfontCN } from "@ant-design/icons"

const IconFont = createFromIconfontCN({
  scriptUrl: "//at.alicdn.com/t/font_2625583_thf337d3y7r.js",
})

export default function SideBar({ routes = [] }) {
  const history = useHistory()
  const [openKeys, setOpenKeys] = useState([])
  const [currentKeys, setCurrentKeys] = useState('')
  const { SubMenu } = Menu
  const { location: { pathname } } = history
  //   menu Key
  const curPath = window.location.href.split("/") //当前url
  const selectKey = "/" + curPath.slice(3, 7).join("/") //取key 只要 3-7之间的部分 层级大于三层 key会和sidebar的key不一致

  const openKey = pathname.split('/')[3] //默认展开sub

  useEffect(() => {
    setOpenKeys((openkeys) => {
      return Array.from(new Set([...openkeys, openKey]))
    })
    setCurrentKeys(selectKey)
  }, [openKey])

  // item 点击跳转
  const handleClick = (e) => {
    setCurrentKeys(e.key)
    history.push(e.key)
  }

  const onOpenChange = (openKeys) => {
    setOpenKeys(openKeys)
  }

  const disposeSubIcon = (subKey, subItemObj) => {
    if (subKey === 'certificate' && currentKeys.includes('certificate')) {
      return subItemObj.activeIcon
    }
    return subItemObj.icon
  }

  return (
    <SideBarBox>
      <Menu
        onOpenChange={onOpenChange}
        onClick={handleClick}
        openKeys={openKeys}
        selectedKeys={selectKey}
        mode="inline"
      >
        {routes.map((item) => {
          const long = item.length

          // sub
          if (long > 1) {
            const sub = item[0]
            const subKey = sub[0].split("/").pop()
            const subTitle = sub[1].name
            const children = item.slice(1, long)

            return (
              <SubMenu
                key={subKey}
                icon={<IconFont type={disposeSubIcon(subKey, sub[1])} />}
                title={subTitle}
              >
                {
                  children.map((cdn) => {
                    return <Menu.Item key={cdn[0]}>{cdn[1].name}</Menu.Item>
                  })
                }
              </SubMenu>
            )
          } else {
            const itemOne = item[0]
            // one sub
            return (
              <Menu.Item
                icon={
                  <IconFont type={
                    currentKeys === itemOne[0]
                      ? itemOne[1].activeIcon
                      : itemOne[1].icon
                  } />
                }
                key={itemOne[0]}
              >
                {itemOne[1].name}
              </Menu.Item>
            )
          }
        })}
      </Menu>
    </SideBarBox>
  )
}

const SideBarBox = styled.div`
  overflow: auto;
  height: 100vh;
  background-color: #fff;
  width: 145px;
  position: fixed;
  left: 0;
  top: 64px;
  bottom: 0;
  .ant-menu {
    height: 100%;
  }
  // 禁止选中
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`
