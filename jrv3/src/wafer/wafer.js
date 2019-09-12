import wafer from 'wafer2-client-sdk';
// let waferurl = 'http://10.10.10.170:4041/v3/wx/'
let waferurl = 'https://api.jr.nine00.com/v3/wx/'
wafer.setLoginUrl(waferurl + 'login');
function request(url,method,data) {
  return new Promise((rs, rj) => {
    wafer.request({
      url: waferurl+url,
      method:(method)?method:'get',
      data:(data)?data:{},
      success: function(data) {
        let result = data.data.data
        rs(result)
      },
      fail: function(err) {
        rj(err)
      }
    });
  })
}


module.exports = {
  request
}
