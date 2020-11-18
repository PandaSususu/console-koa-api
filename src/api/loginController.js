import svgCaptcha from 'svg-captcha';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import moment from 'dayjs';
import uuid from 'uuid/v4';

import sendEmail from '../config/emailConfig';
import { setValue, getValue } from '../config/redisConfig';
import config from '../config/index';
import { checkCode, getJWTPayload } from '../common/utils';
import User from '../model/user';
import SignRecord from '../model/signRecord';

class LoginController {
  /**
   * 获取验证码
   * @param {*} ctx
   */
  getCode(ctx) {
    const body = ctx.request.query;
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: '0o1i',
      color: true,
      noise: Math.floor(Math.random() * 5),
      height: 60,
    });
    setValue(body.sid, captcha.text, 10 * 60);
    ctx.body = {
      code: 10000,
      data: {
        svg: captcha.data,
        text: captcha.text,
      },
      meessage: '获取验证码成功',
    };
  }

  /**
   * 修改密码发送邮箱验证
   * @param {*} ctx
   */
  async forget(ctx) {
    const { body } = ctx.request;
    const userInfo = await User.findOne({ email: body.email });
    if (!userInfo) {
      ctx.body = {
        code: 9000,
        data: {},
        message: '此邮箱未注册',
      };
      return;
    }
    const key = uuid();
    const result = await checkCode(body.sid, body.code);
    if (result) {
      setValue(
        key,
        jwt.sign({ _id: userInfo._id }, config.JWT_SECRET, {
          expiresIn: '30m',
        }),
        30 * 60
      );
      try {
        await sendEmail({
          type: 'password',
          code: '',
          expire: moment().add(30, 'minutes').format('YYYY-MM-DD, HH:mm:ss'),
          email: body.email,
          userName: userInfo.name,
          data: {
            key,
          },
        });
        ctx.body = {
          code: 10000,
          data: {},
          message:
            '验证邮箱发送成功，修改密码需要邮箱验证请点击邮件链接确认重置登录密码',
        };
      } catch (error) {
        ctx.body = {
          code: 9001,
          data: error,
          message: '验证邮箱发送不成功，请检查邮箱地址是否有效',
        };
      }
    } else {
      ctx.body = {
        code: 9003,
        data: {},
        message: '验证码不正确或者已失效',
      };
    }
  }

  /**
   * 确认修改密码
   * @param {*} ctx
   */
  async reset(ctx) {
    let { body } = ctx.request;
    const token = await getValue(body.key);
    if (!token) {
      ctx.body = {
        code: 9000,
        data: {},
        message: '重置链接有效时间已过，请重新发起重置请求',
      };
      return;
    }
    const payload = await getJWTPayload('Bearer ' + token);
    const userInfo = await User.findOne({ _id: payload._id });
    if (await bcrypt.compare(body.oldPassword, userInfo.password)) {
      body.newPassword = await bcrypt.hash(body.newPassword, 5);
      const result = await User.updateOne(
        { _id: payload._id },
        {
          password: body.newPassword,
        }
      );
      if (result.n === 1 && result.ok === 1) {
        ctx.body = {
          code: 10000,
          data: {},
          message: '密码修改成功',
        };
      }
    } else {
      ctx.body = {
        code: 9001,
        data: {},
        message: '旧密码不正确',
      };
    }
  }

  /**
   * 用户登录
   * @param {*} ctx
   */
  async login(ctx) {
    // 获取用户参数
    const { body } = ctx.request;

    // 校验验证码有效性
    const result = await checkCode(body.sid, body.code);
    if (result) {
      // 校验用户账户
      let userInfo = await User.findOne({ email: body.email });
      if (!userInfo) {
        ctx.body = {
          code: 9001,
          data: {},
          message: '用户不存在',
        };
        return;
      }
      if (await bcrypt.compare(body.password, userInfo.password)) {
        // 生成token
        const token = jwt.sign({ _id: userInfo._id }, config.JWT_SECRET, {
          expiresIn: '1d',
        });
        // 过滤用户信息敏感字段
        let userJson = userInfo.toJSON();
        const filter = ['password', '_id', 'created'];
        filter.map((item) => {
          delete userJson[item];
        });
        // 查询用户今天是否已签到
        const lastSign = await SignRecord.findByUid(userInfo._id);
        if (lastSign) {
          if (
            moment(lastSign.created).format('YYYY-MM-DD') ===
            moment().format('YYYY-MM-DD')
          ) {
            userJson.isSign = true;
          } else {
            userJson.isSign = false;
          }
        } else {
          userJson.isSign = false;
        }
        // 登录成功返回token
        ctx.body = {
          code: 10000,
          data: {
            token: token,
            userJson,
          },
          message: '登陆成功',
        };
      } else {
        ctx.body = {
          code: 9002,
          data: {},
          message: '用户名或密码错误',
        };
      }
    } else {
      ctx.body = {
        code: 9003,
        data: {},
        message: '验证码不正确或者已失效'
      };
    }
  }

  /**
   * 用户注册
   * @param {*} ctx
   */
  async reg(ctx) {
    // 获取用户参数
    let { body } = ctx.request;

    // 校验验证码有效性
    const result = await checkCode(body.sid, body.code);
    let message = {};
    if (result) {
      // 校验用户账户
      const email = await User.findOne({ email: body.email });
      const name = await User.findOne({ name: body.name });
      let check = true;
      if (email) {
        message.email = ['该邮箱已注册'];
        check = false;
      }
      if (name) {
        message.name = ['用户名已存在'];
        check = false;
      }
      if (check) {
        body.password = await bcrypt.hash(body.password, 5);
        let user = new User({
          email: body.email,
          name: body.name,
          password: body.password,
        });
        let result = await user.save();
        ctx.body = {
          code: 10000,
          data: result,
          message: '注册成功',
        };
        return;
      }
    } else {
      message.code = ['验证码不正确或者已失效'];
    }
    ctx.body = {
      code: 9001,
      data: {},
      message: message,
    };
  }
}

export default new LoginController();
