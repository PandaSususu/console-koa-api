import Router from 'koa-router'
import loginController from '../api/loginController'

const router = new Router()

router.prefix('/login')

// 修改密码发送邮箱验证
router.post('/forget', loginController.forget)

// 确认修改密码
router.post('/reset', loginController.reset)

// 用户登录
router.post('/login', loginController.login)

// 用户注册
router.post('/reg', loginController.reg)

export default router