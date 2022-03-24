import React, { useEffect, useState } from "react"
import { Modal, Button, Row } from "antd"
import styled from "@emotion/styled"
import lessenIcon from '../../assets/input/lessen.svg'
import rotateIcon from '../../assets/input/rotate.svg'
import enlargementIcon from '../../assets/input/enlargement.svg'
import photographIcon from '../../assets/input/photograph.svg'
import placehloderIcon from '../../assets/input/placeholder.png'
import { base64toFilePlus } from '../../utils/file-format'

let socket
const serverIP = "127.0.0.1"
const serverPort = "7000"
const host = `ws://${serverIP}:${serverPort}/`

const PhotoPanelModal = ({ cancel, photoPanelToUpload }) => {
  const [dynamicUrl, setDynamicUrl] = useState(null)
  const [staticUrl, setStaticUrl] = useState(null)

  const footer = (
    <Row justify="center" gutter={16}>
      <Button onClick={() => cancel()}>取消</Button>
      <Button type="primary" onClick={() => capture()}>
        <img src={photographIcon} alt='' />
      </Button>
      <Button
        type="primary"
        disabled={!staticUrl}
        onClick={() => submit()}>
        确认
      </Button>
    </Row>
  )

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [])

  const connect = () => {
    socket = new WebSocket(host)
    try {
      socket.onopen = function (msg) {
        opendevice()
      }
      socket.onmessage = function (msg) {
        if (typeof msg.data === 'string') {
          if (msg.data.indexOf('GetDevCount') === 0) {
            let string = msg.data.substring(12)
            if (string === '2') {
              console.log("检测到已经连接上摄像头")
            }
          } else if (msg.data.indexOf('CloseDevice') === 0) {
            let string = msg.data.substring(12)
            if (string === '1') {
              setDynamicUrl(null)
            }
          }

          else if (msg.data.indexOf('CloseVideo') == 0) {
            let string = msg.data.substring(11)
            if (string === '1') {
              setDynamicUrl(null)
            }
          }

          else if (msg.data.indexOf('OpenVideo') == 0) {
            let string = msg.data.substring(10)
            if (string === '1') {
              console.log('OpenVideo')
            }
          }

          else if (msg.data.indexOf('CaptureToFile') == 0) {
            console.log('CaptureToFile')
          }

          else if (msg.data.indexOf('Capture') == 0) {
            let string = msg.data.substring(8)
            setStaticUrl("data:image/jpeg;base64," + string)
          }

        } else {
          let reader = new FileReader()
          reader.onload = function (msg) {
            if (msg.target.readyState == FileReader.DONE) {
              let url = msg.target.result
              setDynamicUrl(url)
            }
          }
          reader.readAsDataURL(msg.data)
        }
      }
      socket.onclose = function (msg) {
        console.log('onclose')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const disconnect = () => {
    console.log('disconnect')
    socket.close()
    socket = null
  }

  const opendevice = () => {
    socket.send("OpenDevice@1")
    socket.send("SetResolution@2@2048@1536")
    socket.send("OpenVideo")
  }

  const rotateleft = () => {
    socket.send("RotateLeft")
  }

  const zoomin = () => {
    socket.send("ZoomIn")
  }

  const zoomout = () => {
    socket.send("ZoomOut")
  }

  const capture = () => {
    console.log('capture')
    socket.send("Capture@2")
  }

  const submit = () => {
    const file = base64toFilePlus(staticUrl)
    photoPanelToUpload(file)
  }

  return (
    <Modal
      title='高拍仪'
      visible={true}
      width={1200}
      onCancel={() => cancel()}
      footer={footer}
    >
      <Row align='middle' justify='end'>
        <OperateBar>
          <img
            src={rotateIcon} alt=''
            onClick={() => rotateleft()}
          />
          <img
            src={lessenIcon} alt=''
            onClick={() => zoomout()}
          />
          <img
            src={enlargementIcon} alt=''
            onClick={() => zoomin()}
          />
        </OperateBar>
      </Row>
      <Row align='flex-start' justify='center'>
        <DynamicImage>
          <img src={dynamicUrl} alt='' />
        </DynamicImage>
        <StaticImage>
          <img
            src={staticUrl ? staticUrl : placehloderIcon} alt=''
          />
        </StaticImage>
      </Row>
    </Modal>
  )
}

export default PhotoPanelModal

const OperateBar = styled.div`
  display: flex;
  img {
    cursor: pointer;
    width: 20px;
    height: 20px;
    margin-left: 20px;
  }
`
const DynamicImage = styled.div`
  display: flex;
  width: 640px;
  height: 400px;
  border: 1px solid #f0f0f0;
  margin: 20px 0;
  border-radius: 3px;
  img {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
`

const StaticImage = styled.div`
  width: 320px;
  height: 200px;
  border: 1px solid #f0f0f0;
  margin: 20px 0 20px 70px;
  border-radius: 3px;
  img {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
`