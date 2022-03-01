import Vue from 'vue'
import App from './App.vue'
import '@/registerServiceWorker'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import '@/styles/elementUI/variables.scss'
import '@/styles/index.scss'

import AppComponents from '@/components'
import '@/components/Icon/svg.js'

import Layout from '@/layout'

Vue.use(ElementUI, { size: 'medium' })
Vue.use(AppComponents)
Vue.use(Layout)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
