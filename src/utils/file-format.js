// base64 转文件
export function base64toFile(dataurl, filename, filetype) {
  var arr = dataurl.split(","),
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, {
    type: filetype,
  })
}

export function base64toFilePlus(dataurl, filename = 'file') {
  let arr = dataurl.split(',')
  let mime = arr[0].match(/:(.*?);/)[1]
  let suffix = mime.split('/')[1]
  let bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], `${filename}.${suffix}`, {
    type: mime
  })
}

// 图片转base64
function getBase64Image(img) {  
  let canvas = document.createElement("canvas")
  canvas.width = img.width
  canvas.height = img.height
  let ctx = canvas.getContext("2d")
  ctx.drawImage(img, 0, 0, img.width, img.height)
  let ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase()
  let dataURL = canvas.toDataURL("image/"+ext)
  return dataURL
}

export function createImage(img) {
  return new Promise((resolve) => {
    let base64
    let image = new Image()
    image.crossOrigin = ""
    image.src = img
    image.onload = function(){
      let base64 = getBase64Image(image)
      resolve(base64)
    }
  })
}