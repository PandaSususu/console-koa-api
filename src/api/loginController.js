import svgCaptcha from 'svg-captcha'
import jsonwebtoken from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import moment from 'moment'

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
    const captcha = svgCaptcha.create({
      size: 4,
      color: true,
      noise: Math.floor(Math.random() * 5),
      height: 38
    })
    setValue(body.sid, captcha.text, 10 * 60)
    ctx.body = {
      code: 200,
      data: {
      svg: captcha.data,
        text: captcha.text,
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
    // 获取用户参数
    let {
      body
    } = ctx.request

    // 校验验证码有效性
    const result = await checkCode(body.sid, body.code)
    if (result) {
      // 校验用户账户
      let userInfo = await User.findOne({ email: body.userName })
      if (!userInfo) {
        ctx.body = {
          code: 9001,
          data: {},
          message: '用户不存在'
        }
        return
      }
      if (await bcrypt.compare(body.password, userInfo.password)) {
        // 生成token
        const token = jsonwebtoken.sign({ _id: 'syngle', exp: Math.floor((Date.now() / 1000) + 60 * 60 * 24) }, config.JWT_SECRET)

        // 登录成功返回token
        ctx.body = {
          code: 10000,
          data: {
            token: token,
          },
          message: '登陆成功'
        }
      } else {
        ctx.body = {
          code: 9002,
          data: {},
          message: '用户名或密码错误'
        }
      }
    } else {
      ctx.body = {
        code: 9003,
        data: {},
        message: '验证码不正确或者已失效'
      }
    }
  }

  /**
   * 用户注册
   * @param {*} ctx 
   */
  async reg(ctx) {
    // 获取用户参数
    let {
      body
    } = ctx.request

    // 校验验证码有效性
    const result = await checkCode(body.sid, body.code)
    let message = {}
    if (result) {
      // 校验用户账户
      const email = await User.findOne({ email: body.email })
      const name = await User.findOne({ name: body.name })
      let check = true
      if (email) {
        message.email = ['该邮箱已注册']
        check = false
      }
      if (name) {
        message.name = ['用户名已存在']
        check = false
      }
      if (check) {
        body.password = await bcrypt.hash(body.password, 5)
        let user = new User({
          email: body.email,
          name: body.name,
          password: body.password,
          created: moment().format('YYYY-MM-DD HH:mm:ss')
        })
        let result = await user.save()
        ctx.body = {
          code: 10000,
          data: result,
          message: '注册成功'
        }
        return
      }
    } else {
      message.code = ['验证码不正确或者已失效']
    }
    ctx.body = {
      code: 9001,
      data: {},
      message: message
    }
  }
}

export default new LoginController()