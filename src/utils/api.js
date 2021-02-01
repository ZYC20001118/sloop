import request from './request'

export const getList = (path, params, cancelToken) => {
  return request.get({
    url: path,
    params: params,
    cancelToken: cancelToken
  })
}
