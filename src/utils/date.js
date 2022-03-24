// 根据当前日期计算年龄
export function getAge(str) {
  var r = str.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})/)
  if (r == null) return false

  var d = new Date(r[1], r[3] - 1, r[4])
  var returnStr = "输入的日期格式错误！"

  if (
    d.getFullYear() == r[1] &&
    d.getMonth() + 1 == r[3] &&
    d.getDate() == r[4]
  ) {
    var date = new Date()
    var yearNow = date.getFullYear()
    var monthNow = date.getMonth() + 1
    var dayNow = date.getDate()

    var largeMonths = [1, 3, 5, 7, 8, 10, 12], //大月， 用于计算天，只在年月都为零时，天数有效
      lastMonth = monthNow - 1 > 0 ? monthNow - 1 : 12, // 上一个月的月份
      isLeapYear = false, // 是否是闰年
      daysOFMonth = 0 // 当前日期的上一个月多少天

    if ((yearNow % 4 === 0 && yearNow % 100 !== 0) || yearNow % 400 === 0) {
      // 是否闰年， 用于计算天，只在年月都为零时，天数有效
      isLeapYear = true
    }

    if (largeMonths.indexOf(lastMonth) > -1) {
      daysOFMonth = 31
    } else if (lastMonth === 2) {
      if (isLeapYear) {
        daysOFMonth = 29
      } else {
        daysOFMonth = 28
      }
    } else {
      daysOFMonth = 30
    }

    var Y = yearNow - parseInt(r[1])
    var M = monthNow - parseInt(r[3])
    var D = dayNow - parseInt(r[4])
    if (D < 0) {
      D = D + daysOFMonth //借一个月
      M--
    }
    if (M < 0) {
      // 借一年 12个月
      Y--
      M = M + 12 //
    }

    if (Y < 0) {
      returnStr = "出生日期有误！"
    } else if (Y === 0) {
      if (M === 0) {
        returnStr = D + "D"
      } else {
        returnStr = M + "M"
      }
    } else {
      if (M === 0) {
        returnStr = Y + "Y"
      } else {
        returnStr = Y + "Y" + M + "M"
      }
    }
  }

  //   return returnStr
  return Y >= 0 ? Y : 0
}

function timePadStart(date) {
  return date.toString().padStart(2, "0")
}

export function getToday() {
  const day = new Date()
  const week = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ]
  const str = `${timePadStart(day.getMonth() + 1)}月${timePadStart(
    day.getDate()
  )}日 ${week[day.getDay()]} ${timePadStart(day.getHours())}:${timePadStart(
    day.getMinutes()
  )}:${timePadStart(day.getSeconds())}`

  return str
}

// 获取当前时间
export function getDate() {
  const today = new Date().toISOString()
  return today.split("T")[0]
}
