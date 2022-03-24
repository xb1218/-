import React, { useEffect, useState, useCallback, useRef } from "react"
import styled from "@emotion/styled"
import { Modal } from "antd"
import PhonePanelModal from "../PhotoPanelModal"
import plusIcon from "../../assets/input/plus.png"
import api from "../../utils/request.js"

export default function UploadFile({
  id,
  img,
  width,
  height,
  onSuccess,
  defaultBg,
  borderBg,
  onUploadBefore = () => true,
}) {
  const [panelVisible, setPanelVisible] = useState(false)
  const inputRef = useRef("")

  // 上传之前可能有确认拦截
  async function onBefroe(type) {
    const ok = await onUploadBefore()
    if (!ok) return false
    // 判断是拍照还是上传
    type == "photo" ? setPanelVisible(true) : inputRef.current.click()
  }

  // 上传图片
  const onUploadImg = async (e) => {
    e.preventDefault()
    let file = e.target.files[0]
    if (file) {
      const res = await api.file("/upload/file", file)
      onSuccess(res.imgUrl)
    }
  }

  // 拍照
  const photoPanelToUpload = async (file) => {
    const res = await api.file("/upload/file", file)
    setPanelVisible(false)
    onSuccess(res.imgUrl)
  }

  return (
    <>
      <CornersBgWrapper width={width} height={height}>
        <Border width={width} height={height} src={borderBg}></Border>
        {!img && <PlusIcon src={plusIcon} />}
        <img className="inner-image" src={img || defaultBg} alt="" />
        <HoverBlock
          className="hoverBlock"
          top={height}
          width={width}
          height={height}
        >
          <p onClick={() => onBefroe("photo")}>拍照</p>
          <input
            id={id}
            style={{ display: "none" }}
            type="file"
            onChange={(e) => onUploadImg(e)}
            ref={inputRef}
          />
          <p style={{ cursor: "pointer" }} onClick={() => onBefroe("file")}>
            上传本地文件
          </p>
        </HoverBlock>
        {panelVisible && (
          <PhonePanelModal
            photoPanelToUpload={photoPanelToUpload}
            cancel={() => setPanelVisible(false)}
          />
        )}
      </CornersBgWrapper>
    </>
  )
}

const Border = styled.img`
  width: ${(props) => props.width + "px"};
  height: ${(props) => props.height + "px"};
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
`

const CornersBgWrapper = styled.div`
  position: relative;
  width: ${(props) => props.width + "px"};
  height: ${(props) => props.height + "px"};
  background-repeat: no-repeat;
  background-size: cover;
  cursor: pointer;
  overflow: hidden;
  .inner-image {
    width: ${(props) => props.width - 8 + "px"};
    height: ${(props) => props.height - 8 + "px"};
    position: relative;
    left: 4px;
    top: 4px;
    overflow: hidden;
    border-radius: 10px;
  }
  &:hover {
    .hoverBlock {
      top: 0;
    }
  }
`

const HoverBlock = styled.div`
  position: absolute;
  top: ${(props) => props.top + "px"};
  width: ${(props) => props.width - 8 + "px"};
  height: ${(props) => props.height - 8 + "px"};
  border-radius: 10px;
  text-align: center;
  background-color: #fff;
  transition: top 0.6s;
  margin: 4px;
  z-index: 4;

  p {
    height: 50%;
    line-height: ${(props) => props.height / 2 + "px"};
    font-size: 24px;
    margin: 0;
    cursor: pointer;

    &:hover {
      color: #6986f4;
      background-color: #6d8cf61a;
    }
  }
`

const PlusIcon = styled.img`
  width: 70px;
  height: 70px;
  position: absolute;
  top: calc(50% - 35px);
  left: calc(50% - 35px);
  z-index: 3;
`

const SelOption = styled.div`
  border-radius: 2px;
  border: 1px dashed #6986f4;
  padding: 2px 8px;
  color: #6986f4;
  cursor: pointer;
`
