export const byte = v => {
  if (v === undefined || v === null || isNaN(v)) {
    return '-'
  }

  let lo = 0

  while (v >= 1024) {
    v /= 1024
    lo++
  }

  return (
    Math.floor(v * 100) / 100 +
    ' ' +
    ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'][lo]
  )
}
