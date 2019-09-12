const configs = {
  rootPathname:'',
  //替换成你自己的
  appId:'xxx',
  appSecret:'xxx',
  useQcloudLogin:false,
  //数据库地址
  mysql:{
    host:'localhost',
    user:'xxx',
    db:'xxx',
    pass:'xxx',
    port:3306
  },
  //cos配置，改成自己的
  cos:{
    region:'ap-beijing',
    fileBucket:'xxx',
    uploadFolder:'xx',
    maxSize:'1M'
  },
  serverHost:'xxx',
  tunnelServerUrl:'holder',
  tunnelSignatureKey:'holder',
  qcloudAppId:'xxx',
  qcloudSecretId:'xxx',
  qcloudSecretKey:'xx',
  wxMessageToken:'holder'
}

const wafer = require('wafer-node-sdk')(configs)

module.exports = wafer
