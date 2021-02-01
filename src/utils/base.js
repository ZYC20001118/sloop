export const JsonParse = str => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return false
  }
}

export const queryURLparams = url => {
  let obj = {}
  if (url.indexOf('?') < 0) return obj
  let arr = url.split('?')
  url = arr[1]
  let array = url.split('&')
  for (let i = 0; i < array.length; i++) {
    let arr2 = array[i]
    let arr3 = arr2.split('=')
    obj[arr3[0]] = arr3[1]
  }
  return obj
}
