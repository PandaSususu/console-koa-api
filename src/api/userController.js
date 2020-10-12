import moment from 'dayjs'

import SignRecord from '../model/signRecord'
import { getJWTPayload } from '../common/utils'
import User from '../model/user'

class SignController {
  /**
   * 用户签到
   * @param {*} ctx 
   */
  async userSign (ctx) {
    // 通过token获取payload中的用户id
    const payload = await getJWTPayload(ctx.header.authorization)

    // 通过用户id获取用户的最后一次签到
    const lastSignRecord = SignRecord.findById(payload._id)

    // 返回数据
    let result
    if (lastSignRecord)
    {
      // 有最后一次签到数据
    } else {
      // 没有最后一次签到数据，则为第一次签到
      // 更新用户信息中的签到次数和积分数
      User.updateOne(
        { _id: payload._id },
        {
          $set: { count: 1 },
          $set: { favs: 5 },
        })

      // 保存用户的此次签到记录到签到记录表中
      const firstSignRecord = new SignRecord({
        uid: payload._id,
        favs: 5,
        lastSign: moment().format('YYYY-MM-DD HH:mm:ss')
      })
      firstSignRecord.save()
      result = {
        count: 1,
        favs: 5
      }
    }
    ctx.body = {
      code: 10000,
      data: {
        ...result
      },
      message: '签到成功'
    }
  }
}

export default new SignController()