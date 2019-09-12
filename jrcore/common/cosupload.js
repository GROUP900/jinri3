const shortid = require('shortid')
const fs = require('fs')
const readChunk = require('read-chunk')
const formidable = require('formidable')
const COS = require('cos-nodejs-sdk-v5');
const fileType = require('file-type')

//替换成你自己的
var cos = new COS({
  SecretId: 'xxx',
  SecretKey: 'xxx',
});

let cosBucket = 'jinri-1253542371'
let cosRegion = 'ap-beijing'

function upload(req) {
  return new Promise(async (rs, rj) => {
    try{
      var form = new formidable.IncomingForm();
      let data = await new Promise((rs, rj) => {
        form.parse(req, function(err, fields, files) {
          if(err){rj(err)}
          rs({
            fields,
            files
          })
        });
      }).catch(err=>{rj(err)})

      let imageFile = data.files.file
      let dir = data.fields.dir

      if (!dir) {
        rj('没有指定目录')
      }

      const buffer = readChunk.sync(imageFile.path, 0, 262)
      let resultType = fileType(buffer)
      if (resultType === null && imageFile.headers && imageFile.headers['content-type']) {
        const tmpPathArr = imageFile.path ? imageFile.path.split('.') : []
        const extName = tmpPathArr.length > 0 ? tmpPathArr[tmpPathArr.length - 1] : ''
        resultType = {
          mime: imageFile.headers['content-type'],
          ext: extName
        }
      }
      const imgKey = `${Date.now()}-${shortid.generate()}.${resultType.ext}`
      const params = {
        Bucket: cosBucket,
        Region: cosRegion,
        Key: dir + '/' + imgKey,
        FilePath: imageFile.path
      }
      cos.sliceUploadFile(params, function(err, data) {
        if(err){rj(err)}
        fs.unlink(imageFile.path,()=>{})//fix fs bugs
        rs(data)
      });
    }catch(err){
      rj(err)
    }
  })
}

function drop(Key){
  var params = {
    Bucket: cosBucket,
    Region: cosRegion,
    Key
  };
  cos.deleteObject(params);
}

module.exports = {
  upload,
  drop
}
