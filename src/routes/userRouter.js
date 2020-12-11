import Router from 'koa-router'

import userController from '../api/userController'
import postController from '../api/postController'

const router = new Router()

router.prefix('/user')

// 用户签到
router.get('/sign', userController.userSign)

// 用户信息
router.get('/info', userController.getUserInfo)

// 用户修改基本信息
router.post('/basic', userController.updateInfo)

export default router