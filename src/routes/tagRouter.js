import Router from 'koa-router'

import tagController from '../api/tagController'

const router = new Router()

router.prefix('/tag')

// 添加标签
router.post('/add', tagController.addTag)

// 获取标签
router.get('/get', tagController.getTags)

// 删除标签
router.get('/detele', tagController.deteleTag)

// 更新标签
router.post('/update', tagController.updateTag)

export default router