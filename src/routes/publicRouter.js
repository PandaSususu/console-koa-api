import Router from 'koa-router'
import loginController from '../api/loginController'
import indexController from '../api/indexController'

const router = new Router()
router.prefix('/public')
router.get('/getcode', loginController.getCode)
router.get('/tips', indexController.getTips)
router.get('/topWeek', indexController.getTopWeek)
router.get('/links', indexController.getLinks)
router.get('/ads', indexController.getAds)

export default router