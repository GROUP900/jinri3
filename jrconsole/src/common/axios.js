import axios from 'axios'
axios.defaults.baseURL = 'https://api.jr.nine00.com/v3/console/';
// axios.defaults.baseURL = 'http://localhost:4041/v3/console/';
let instance = axios.create();
instance.interceptors.request.use(
  config => {
    if (localStorage.token) {
      config.headers.Authorization = `Bearer ${localStorage.token}`;
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  });

instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          router.replace({
            name: 'login'
          })
      }
    }
    return Promise.reject(error.response.data)
  });
export default instance;
