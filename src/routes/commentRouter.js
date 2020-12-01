import Router from 'koa-router'

import commentController from '../api/commentController'

const router = new Router()
router.prefix('/comment')

// 发表评论
router.post('/post', commentController.postComment)

// 更新评论
router.post('/update', commentController.updateComment)

// 采纳评论
router.post('/setBest', commentController.setBestComment)

// 点赞评论
router.get('/setHands', commentController.setHandsComment)

export default router