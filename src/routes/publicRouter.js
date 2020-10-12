import Router from 'koa-router'
import loginController from '../api/loginController'
import indexController from '../api/indexController'

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

export default router