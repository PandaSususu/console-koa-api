import Router from 'koa-router'
import loginController from '../api/loginController'

const router = new Router()

router.prefix('/login')
// 发送邮箱验证
router.post('/sendemail', loginController.sendEmail)
// 用户登录
router.post('/login', loginController.login)
// 用户注册
router.post('/reg', loginController.reg)

export default router