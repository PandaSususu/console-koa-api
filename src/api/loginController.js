import svgCaptcha from 'svg-captcha'

import emailConfig from '../config/emailConfig'
import {
  setValue,
  getValue
} from '../config/redisConfig'

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
    console.log(body)
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

  }
}

export default new LoginController()