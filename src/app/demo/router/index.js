import createRouter from '@/router'
import store from '@demo/store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { constantRoutes } from './routes'

// 创建并配置默认路由
const router = createRouter(constantRoutes)

// 重置路由
export function resetRouter() {
  const newRouter = createRouter(constantRoutes)
  router.matcher = newRouter.matcher // reset router
}

// NProgress Configuration
NProgress.configure({ showSpinner: false })

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start()

  // 用户是否登录
  const hasToken = getToken()
  if (hasToken) {
    const hasRole = store.getters.role
    if (hasRole) {
      next()
      NProgress.done()
    } else {
      try {
        // 获取用户信息,role必须存在 (非登录成功返回的数据)
        await store.dispatch('user/getInfo')
        // 生成基于用户角色的 route map
        const accessRoutes = await store.dispatch('permission/generateRoutes')
        // 动态载入routes (⚠️注: router.addRoutes 已废弃)
        accessRoutes.forEach(route => router.addRoute(route))
        
        // hack method to ensure that addRoutes is complete
        // set the replace: true, so the navigation will not leave a history record
        next({ ...to, replace: true })
      } catch (error) {
        await store.dispatch('user/removeToken')
        Message.error(error || 'Has Error')
        next(`/login?redirect=${to.path}`)
        // window.location.href = `/#/login?redirect=${to.path}`
        NProgress.done()
      }
    }
  } else {
    // 验证授权route，否则跳转到登录页
    const matched = to.matched
    if (matched.length === 0 || matched.some(record => !record.meta.noRequiresAuth)) {
      next(`/login?redirect=${to.path}`)
      // window.location.href = `/#/login?redirect=${encodeURIComponent(to.path)}`
      NProgress.done()
    } else {
      // 无需授权
      next()
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

export default router
