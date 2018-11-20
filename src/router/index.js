 import Vue from 'vue'
import Router from 'vue-router'
import DemoView from '@/view/demo-view'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: DemoView
    },
    {
      path: '/chartPage',
      component: () => import('../view/chartPage')
    }
  ]
})
