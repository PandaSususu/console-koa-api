import Router from 'koa-router'
import loginController from '../api/loginController'

const router = new Router()

router.post('/sendemail', loginController.sendEmail)

export default router