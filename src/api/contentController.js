import fs from 'fs'
import uuid from 'uuid/v4'
import moment from 'dayjs'

import config from '../config'
import { dirExists, checkCode, getJWTPayload } from '../common/utils'
import User from '../model/user'

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

  /**
   * 发表新帖
   * @param {*}
   */
  async addPost(ctx) {
    const { body } = ctx.request;
    console.log(body)
    const result = await checkCode(body.sid, body.code);
    if (result) {
      const payload = await getJWTPayload(ctx.header.authorization);
      const userInfo = await User.findByUid(payload._id)
      // 判断用户积分是否大于发帖所需积分
      if (userInfo.favs > body.fav) {
        
      } else {
        ctx.body = {
          code: 9001,
          data: {
            favs: userInfo.favs
          },
          message: '积分不足'
        };
        return
      }
    } else {
      ctx.body = {
        code: 9000,
        data: {},
        message: '验证码不正确或者已失效'
      };
    }
  }
}

export default new ContentController()