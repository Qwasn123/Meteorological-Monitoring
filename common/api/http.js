//基础请求方法
const baseURL = '/api'

export const http = {
  request(method, url, data, header = {}) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: baseURL + url,
        method,
        data,
        header: {
          'Content-Type': header.isForm ? 'application/x-www-form-urlencoded' : 'application/json',
          ...header
        },
        success: (res) => {
          console.log('API响应:', JSON.parse(JSON.stringify(res)));//调试
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        },
        fail: (error) => {
          console.error('请求失败:', error);//调试
          reject({
            code: -1,
            message: '网络连接失败，请检查网络设置'
          })
        }
      })
    })
  },

  get(url, params) {
    return this.request('GET', url, params)
  },

  post(url, data) {
    return this.request('POST', url, data)
  },

  login(uname, password) {
    const params = new URLSearchParams();
    params.append('uname', uname);
    params.append('password', password);
    return this.request('POST', '/user/login', params.toString(), {
      'Content-Type': 'application/x-www-form-urlencoded'
    });
  },

  register(newUser) {
    return this.post('/user/register', newUser);
  }
}