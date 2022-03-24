const drawnImage = (imgUrl) => {
  let image = new Image()
  image.src = imgUrl
  image.setAttribute("crossOrigin", "anonymous")
  image.onload = function () {
    let canvas = document.createElement("canvas")
    canvas.width = image.width
    canvas.height = image.height
    let context = canvas.getContext("2d")
    context.drawImage(image, 0, 0, image.width, image.height)
    let url = canvas.toDataURL("image/png")
    createDownEle(url, imgUrl)
  }
}

const createDownEle = (url, imgUrl) => {
  let a = document.createElement("a")
  a.download = imgUrl.split("/").pop()
  a.href = url
  a.click()
}

// 下载图片
export function downloadImg(imgs) {
  for (let imgUrl of imgs) {
    if (imgUrl == "") continue
    if(imgUrl.imgUrl) {
      drawnImage(imgUrl.imgUrl)
    }else{
      drawnImage(imgUrl)
    }
    // const a = document.createElement("a") // 创建一个a节点插入的document
    // a.download = "image" // 设置a节点的download属性值
    // a.href = e // 将图片的src赋值给a节点的href
    // a.click()
  }
}
