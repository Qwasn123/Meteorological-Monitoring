//基础请求方法
const baseURL = 'https://api-domain.com/api/v1'//需修改

export const http = {
  request(method, url, data, header = {}){
    return new Promise((resolve, reject) => {
      uni.request({
        url:baseURL + url,
        method,
        data,
        header:{
          'Content-Type': 'application/json',
          ...header
        },
        success: (res) => {
          if(res.statusCode >= 200 && res.statusCode < 300){
            resolve(res.data)
          }else{
            reject(res.data)
          }
        },
        fail: (error) => {
          reject({
            code: -1,
            message: '网络连接失败，请检查网络设置'
          })
        }
      })
    })
  },
  
  get(url, params){
    return this.request('GET', url, params)
  },
  
  post(url, data){
    return this.request('POST', url, data)
  }
}