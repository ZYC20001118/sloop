import request from './request'

export const getList = (path, params, cancelToken) => {
  return request.get({
    url: path,
    params: params,
    cancelToken: cancelToken
  })
}

export const auth = ({ user, pass }, cancelToken) => {
  return request.post({
    url: location.pathname,
    data: {
      act: 'auth',
      user: user,
      passwd: pass,
      path: location.pathname
    },
    cancelToken: cancelToken
  })
}
