import Router from 'koa-router'

import adminController from '../api/adminController'

const router = new Router()

router.prefix('/admin')

router.get('/home-count', adminController.getHomeConut)

export default router