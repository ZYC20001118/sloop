import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Index',
      component: () => import('../views/Home'),
      children: [
        {
          path: ':path(.*)',
          name: 'Index',
          component: () => import('../views/Home')
        }
      ]
    },
    {
      path: '/404',
      name: 'ErrorPage404',
      component: () => import('../views/ErrorPage404')
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/404',
      hidden: true
    }
  ]
})

export default router
