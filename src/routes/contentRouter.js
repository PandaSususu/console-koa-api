import Router from 'koa-router'
import contentController from '../api/contentController'

const router = new Router()

router.prefix('/content')

// 上传图片
router.post('/upload', contentController.uploadImage)

export default router