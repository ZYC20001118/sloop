import request from './request'

export const getList = (path, params, cancelToken) => {
  return request.get({
    url: path,
    params: params,
    cancelToken: cancelToken
  })
}

export const auth = (data, cancelToken) => {
  return request.post({
    url: location.pathname,
    data: {
      act: 'auth',
      user: data.user,
      passwd: data.pass,
      path: location.pathname
    },
    cancelToken: cancelToken
  })
}
