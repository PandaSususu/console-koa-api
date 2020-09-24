import svgCaptcha from 'svg-captcha'
import jsonwebtoken from 'jsonwebtoken'

import emailConfig from '../config/emailConfig'
import {
  setValue
} from '../config/redisConfig'
import config from '../config/index'
import { checkCode } from '../common/utils'
import User from '../model/user'

class LoginController {
  /**
   * 获取验证码
   * @param {*} ctx 
   */
  getCode(ctx) {
    const body = ctx.request.query
    const captcha = svgCaptcha.create()
    setValue(body.sid, captcha.text, 10 * 60)
    ctx.body = {
      "code": 200,
      "data": {
        "svg": captcha.data,
        "text": captcha.text,
      }
    }
  }

  /**
   * 发送邮件服务
   * @param {*} ctx 
   */
  async sendEmail(ctx) {
    let {
      body
    } = ctx.request
    try {
      let result = await emailConfig(body)
      ctx.body = {
        "code": 200,
        "message": "邮箱发送成功！",
        "data": result
      }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 用户登录
   * @param {*} ctx 
   */
  async login(ctx) {
    const body = ctx.request

    // 校验验证码有效性
    if (checkCode(body.sid, body.code)) {
      // 校验用户账户
      let userInfo = await User.findOne({ userName: body.userName })
      if (userInfo.password === body.password) {
        // 生成token
        const token = jsonwebtoken.sign({ _id: 'syngle', exp: Math.floor((Date.now() / 1000) + 60 * 60 * 24) }, config.JWT_SECRET)

        // 登录成功返回token
        ctx.body = {
          code: 200,
          token: token,
          message: '登陆成功！'
        }
      } else {
        ctx.body = {
          code: 401,
          message: '用户名或者密码错误！'
        }
      }
    } else {
      ctx.body = {
        code: 401,
        message: '验证码不正确或者已失效!'
      }
    }
  }
}

export default new LoginController()