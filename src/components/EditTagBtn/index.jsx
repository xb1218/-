import React, { useState, useEffect, useCallback, useRef } from "react"
import styled from "@emotion/styled"
import { Space, Input, message, Modal } from "antd"
import { ExclamationCircleOutlined } from "@ant-design/icons"

import api from "../../utils/request"

export default function EditTag({
  pid,
  active,
  labelName,
  count,
  onClickTag,
  onEditTag,
  type,
}) {
  const [visiable, setVisiable] = useState(false)
  const inputRef = useRef("")

  // 点击标签
  const onCLickJudgeType = () => {
    if (active) {
      onEdit()
    } else {
      onClickTag()
    }
  }

  // 编辑标签
  const onEdit = () => {
    setVisiable(true)

    setTimeout(() => {
      inputRef.current.focus()
    }, 100)
  }

  // 编辑完成
  const onFinishTag = async (event) => {
    const { value } = event.target

    setVisiable(false)

    if (!value) {
      message.error("标签名不能为空")
      return false
    }

    if (value == labelName) {
      console.log("没有更改")
      return false
    }

    Modal.confirm({
      title: "是否确定更改该病历标签？",
      icon: <ExclamationCircleOutlined />,
      content: "",
      okText: "确认",
      cancelText: "取消",
      okType: "primary",
      onOk: async () => {
        // 批量更改图片标签
        const res = await api.put("/label/name", {
          pid,
          docType: type == "case" ? "1" : "0",
          oldLabel: labelName,
          newLabel: value,
        })
        onEditTag()
      },
      onCancel: () => {},
    })
  }

  return (
    <>
      <Tags onClick={() => onCLickJudgeType()}>
        <div className={active ? "active" : "normal"}>
          <Space>
            <span>
              #{labelName} ({count})
            </span>
          </Space>
          <Input
            id={labelName}
            defaultValue={labelName}
            ref={inputRef}
            className="tagInput"
            onBlur={onFinishTag}
            onPressEnter={onFinishTag}
            style={{ display: visiable ? "block" : "none" }}
          />
        </div>
      </Tags>
    </>
  )
}

const Tags = styled.div`
  .normal {
    color: #666666;
    background: #f2f2f2;
    border-radius: 2px;
    cursor: pointer;
    user-select: none;
    padding: 2px 6px;
    margin: 6px 0;
    position: relative;
  }

  .active {
    cursor: pointer;
    user-select: none;
    padding: 2px 6px;
    margin: 6px 0;
    color: #fff;
    background: #779cfa;
    position: relative;

    .icon {
      background-color: "#779cfa";
      color: "#fff";
    }
  }

  .tagInput {
    height: 22px;
    width: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
  }
`
