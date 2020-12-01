import Router from 'koa-router'

import postController from '../api/postController'

const router = new Router()

router.prefix('/post')

// 发表新帖
router.post('/add', postController.addPost)

// 发表新帖
router.post('/update', postController.updatePost)

// 获取用户帖子列表
router.get('/list', postController.getUserList)

// 获取用户收藏帖子列表
router.get('/collections', postController.getUserCollectList)

// 用户收藏帖子
router.get('/collect', postController.collectPost)

export default router