import Vue from 'vue'
import Router from 'vue-router'
import login from '@/pages/login'
import frame from '@/pages/frame'
import editor from '@/pages/editor'
import sources from '@/pages/sources'
import cards from '@/pages/cards'
import config from '@/pages/config'
import feedback from '@/pages/feedback'
import ssn from '@/pages/ssn'
import changelog from '@/pages/changelog'

import sourceEditor from '@/components/sourceeditor'
import cardDetail from '@/components/carddetail'

Vue.use(Router)

const router = new Router({
  routes: [{
      path: '/login',
      name: 'login',
      component: login,
      meta: {
        noAuth: true,
      }
    },
    {
      path: '/',
      name: 'frame',
      component: frame,
      redirect: {
        name: 'login'
      },
      children: [{
        path: 'editor',
        name: 'editor',
        component: editor
      },{
        path: 'changelog',
        name: 'changelog',
        component: changelog
      },{
        path: 'sources',
        name: 'sources',
        component: sources
      },{
        path: 'sources/edit/:id',
        name: 'editSource',
        component: sourceEditor
      },{
        path: 'sources/edit',
        name: 'appendSource',
        component: sourceEditor
      },{
        path: 'cards',
        name: 'cards',
        component: cards
      },{
        path: 'newcard',
        name: 'cardDetail',
        component: cardDetail
      },{
        path: 'editcard/:id',
        name: 'editCard',
        component: cardDetail
      },{
        path: 'config',
        name: 'config',
        component: config
      },{
        path: 'feedback',
        name: 'feedback',
        component: feedback
      },{
        path: 'ssn',
        name: 'ssn',
        component: ssn
      }]
    }
  ]
})

router.beforeEach((to, from, next) => {
  if(!to.meta.noAuth){
    if(localStorage.token){
      next()
    }else{
      next({name:'login'})
    }
  }else{
    next();
  }
})

export default router;
