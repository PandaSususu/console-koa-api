import Router from 'koa-router'

import postController from '../api/postController'

const router = new Router()

router.prefix('/post')

// 发表新帖
router.post('/add', postController.addPost)

// 用户更新帖子
router.post('/update', postController.updatePost)

// 管理员更新帖子
router.post('/update-admin', postController.adminUpdatePost)

// 获取用户帖子列表
router.get('/list', postController.getUserList)

// 获取用户收藏帖子列表
router.get('/collections', postController.getUserCollectList)

// 用户收藏帖子
router.get('/collect', postController.collectPost)

// 删除帖子
router.get('/delete', postController.deletePost)

// 管理员获取帖子
router.post('/post-list', postController.adminGetList)

export default router