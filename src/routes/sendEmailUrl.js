import Router from 'koa-router'
import sendEmail from '../api/sendEmail'

const router = new Router()

router.post('/sendemail', sendEmail)

export default router