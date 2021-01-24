import Router from 'koa-router'

import adminController from '../api/adminController'

const router = new Router()

router.prefix('/admin')

// 获取首页数据统计
router.get('/home-count', adminController.getHomeConut)

// 获取错误消息
router.get('/errors', adminController.getErrors)

// 删除错误消息
router.post('/del-error', adminController.delError)

export default router