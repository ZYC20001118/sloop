import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ErrorPage404 from '../views/ErrorPage404.vue'

const routerHistory = createWebHistory()

const router = createRouter({
  history: routerHistory,
  routes: [
    {
      path: '/:path(.*)',
      name: 'Home',
      component: Home
    },
    {
      path: '/',
      name: 'Index',
      component: Home
    },
    {
      path: '/404',
      name: 'ErrorPage404',
      component: ErrorPage404
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/404'
    }
  ]
})

export default router
