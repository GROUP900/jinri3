// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'normalize.css/normalize.css'
import './style/magic.scss'
import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
import axios from './common/axios'
Vue.config.productionTip = false

Vue.prototype.axios = axios
//cdn 换成你自己的
Vue.prototype.sourceUrl = 'https://xxx.myqcloud.com/'
Vue.prototype.cdnUrl = 'https://xxx.myqcloud.com'
Vue.use(ElementUI)
Vue.prototype.bus = new Vue()
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {
    App
  },
  template: '<App/>'
})
