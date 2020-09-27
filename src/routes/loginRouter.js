import Router from 'koa-router'
import loginController from '../api/loginController'

const router = new Router()

router.prefix('/login')
router.post('/sendemail', loginController.sendEmail)
router.post('/login', loginController.login)
router.post('/reg', loginController.reg)

export default router