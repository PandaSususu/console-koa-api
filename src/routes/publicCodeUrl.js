import Router from 'koa-router'
import loginController from '../api/loginController'

const router = new Router()

router.get('/getcode', loginController.getCode)

export default router