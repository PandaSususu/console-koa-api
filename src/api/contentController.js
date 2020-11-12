import fs from 'fs'
import uuid from 'uuid/v4'
import moment from 'dayjs'

import config from '../config'
import { dirExists } from '../common/utils'

class ContentController {
  /**
   * 上传图片
   * @param {*}
   */
  async uploadImage(ctx) {
    const file = ctx.request.files.file
    const ext = file.name.split('.').pop()
    const dir = `${ config.uploadPath }/images/${ moment().format('YYYYMMDD') }`
    // 创建路径
    await dirExists(dir)
    // 使用uuid生成唯一文件名
    const fileName = uuid()
    // 文件的保存路径
    const savePath = `${ dir }/${ fileName }.${ ext }`
    // 读取文件流
    const reader = fs.createReadStream(file.path)
    // 写入文件流
    const upStream = fs.createWriteStream(savePath)
    // 返回给用户的文件路径
    const filePath = `/images/${ moment().format('YYYYMMDD') }/${ fileName }.${ ext }`
    // 写入方式1
    // reader.pipe(upStream)

    // 写入方式2，写入大文件时常用
    let totalLength = 0
    reader.on('data', (chunk) => {
      totalLength += chunk.length
      if (!upStream.write(chunk)) {
        reader.pause()
      }
    })

    reader.on('drain', () => {
      reader.resume()
    })

    reader.on('end', () => {
      upStream.end()
    })
    

    ctx.body = {
      code: 10000,
      data: {
        path: filePath
      },
      message: '图片上传成功',
    };
  }
}

export default new ContentController()