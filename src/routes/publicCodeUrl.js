import Router from 'koa-router'
import getCode from '../api/publicCode'

const router = new Router()

router.get('/getcode', getCode)

export default router