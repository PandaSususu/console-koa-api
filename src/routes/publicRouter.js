import Router from 'koa-router'
import loginController from '../api/loginController'
import indexController from '../api/indexController'
import userController from '../api/userController'
import postController from '../api/postController'
import commentController from '../api/commentController'

const router = new Router()
router.prefix('/public')

// 获取验证码
router.get('/getcode', loginController.getCode)
// 获取温馨通道
router.get('/tips', indexController.getTips)

// 获取本周热议
router.get('/topWeek', indexController.getTopWeek)
// 获取友情链接
router.get('/links', indexController.getLinks)

// 获取推荐课程
router.get('/ads', indexController.getAds)

// 用户修改邮箱账号
router.get('/resetEmail', userController.updateEmail)

// 获取置顶帖子
router.get('/topList', postController.getTopList)

// 获取帖子列表
router.get('/list', postController.getList)

// 获取帖子列表
router.get('/post/detail', postController.getPostDetail)

// 获取帖子评论列表
router.get('/comments', commentController.getComments)

export default router