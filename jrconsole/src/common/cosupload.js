import COS from 'cos-js-sdk-v5';
import axios from './axios';
var Bucket = 'jinri-1253542371';
var Region = 'ap-beijing';

let cos = new COS({
  getAuthorization: (options, callback) => {
    axios.get('utils/costoken', {
      params: {
        method: (options.Method || 'get').toLowerCase(),
        pathname: '/' + (options.Key || '')
      }
    }).then(({
      data
    }) => {
      callback(data);
    })
  }
});

function cosUpload(file, filename, path) {
  return new Promise(function(resolve, reject) {
    cos.sliceUploadFile({
      Bucket,
      Region,
      Key: path + filename,
      Body: file,
    }, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data)
      }
    });
  })
}

function cosDrop(filename) {
  return new Promise(function(resolve, reject) {
    cos.deleteObject({
      Bucket,
      Region,
      Key: filename
    }, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data)
      }
    });
  })
}

export {cosUpload,cosDrop}
