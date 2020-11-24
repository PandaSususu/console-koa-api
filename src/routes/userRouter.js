import Router from 'koa-router'

import userController from '../api/userController'

const router = new Router()

router.prefix('/user')

// 用户签到
router.get('/sign', userController.userSign)

// 用户修改基本信息
router.post('/basic', userController.updateInfo)

// 获取用户帖子列表
router.get('/list', userController.getList)

// 用户发表评论
router.post('/comment', userController.postComment)

export default router