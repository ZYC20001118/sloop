import request from './request'

export const getList = (path, params) => {
  return request({
    url: path,
    method: 'get',
    params: params
  })
}
