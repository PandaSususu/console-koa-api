import moment from 'dayjs';
import uuid from 'uuid/v4';
import jwt from 'jsonwebtoken';

import SignRecord from '../model/signRecord';
import { getJWTPayload } from '../common/utils';
import User from '../model/user';
import Comment from '../model/comment';
import Collect from '../model/collect';
import Hands from '../model/hands';
import sendEmail from '../config/emailConfig';
import config from '../config';
import { setValue, getValue } from '../config/redisConfig';

class UserController {
  /**
   * 获取用户信息
   * @param {*} ctx
   */
  async getUserInfo(ctx) {
    const payload = await getJWTPayload(ctx.header.authorization);
    let data = await User.findByUid(payload._id);
    data = data.toJSON();
    const lastSign = await SignRecord.findByUid(payload._id);
    const diff = moment(moment().format('YYYY-MM-DD')).diff(
      moment(lastSign.created).format('YYYY-MM-DD'),
      'day'
    );
    data.isSign = !(diff > 0);
    data.lastSign = lastSign.created;
    ctx.body = {
      code: 10000,
      data: data,
      message: '获取用户信息成功',
    };
  }

  /**
   * 用户签到
   * @param {*} ctx
   */
  async userSign(ctx) {
    // 通过token获取payload中的用户id
    const payload = await getJWTPayload(ctx.header.authorization);

    // 通过用户id获取用户的最后一次签到
    const lastSignRecord = await SignRecord.findByUid(payload._id);
    // 获取用户信息
    const userInfo = await User.findByUid(payload._id);

    // 返回数据
    let data;
    let code;
    let message;
    let lastSign;
    if (lastSignRecord !== null) {
      // 有最后一次签到数据
      // 最后一次签到的时间是否和今天相同？
      // 如果相同，表示用户今天已结签到过了
      if (
        moment(lastSignRecord.created).format('YYYY-MM-DD') ===
        moment().format('YYYY-MM-DD')
      ) {
        code = 9001;
        message = '您今天已经签到过了';
        data = {
          count: userInfo.count,
          favs: userInfo.favs,
        };
      } else {
        // 如果不同，表示用户今天没签到
        // 判断用户是否在连续签到？
        // 如果当前时间减去一天等于最后一次的签到时间，表示用户在连续签到
        code = 10000;
        message = '签到成功';
        let count = userInfo.count + 1;
        let favs;
        if (
          moment(lastSignRecord.created).format('YYYY-MM-DD') ===
          moment().subtract(1, 'days').format('YYYY-MM-DD')
        ) {
          if (count < 5) {
            favs = 5;
          } else if (count >= 5 && count < 15) {
            favs = 10;
          } else if (count >= 15 && count < 30) {
            favs = 15;
          } else if (count >= 30 && count < 100) {
            favs = 20;
          } else if (count >= 100 && count < 365) {
            favs = 30;
          } else {
            favs = 50;
          }
          // 更新用户信息的连续签到次数和总积分
          await User.updateOne(
            {
              _id: payload._id,
            },
            {
              $inc: { favs: favs, count: 1 },
            }
          );
          data = {
            count: count,
            favs: userInfo.favs + favs,
            lastSign: moment().format('YYYY-MM-DD HH:mm:ss'),
          };
        } else {
          // 表示用户中断了连续签到
          count = 1;
          favs = 5;
          await User.updateOne(
            {
              _id: payload._id,
            },
            {
              $set: { count: 1 },
              $inc: { favs: favs },
            }
          );
          data = {
            count: count,
            favs: userInfo.favs + favs,
            lastSign: moment().format('YYYY-MM-DD HH:mm:ss'),
          };
        }
        const newSignRecord = new SignRecord({
          uid: payload._id,
          favs: favs,
        });
        await newSignRecord.save();
      }
    } else {
      // 没有最后一次签到数据，则为第一次签到
      // 更新用户信息中的签到次数和积分数
      await User.updateOne(
        { _id: payload._id },
        {
          $set: { favs: 105, count: 1 },
        }
      );

      // 保存用户的此次签到记录到签到记录表中
      const firstSignRecord = new SignRecord({
        uid: payload._id,
        favs: 5,
      });
      await firstSignRecord.save();
      code = 10000;
      message = '签到成功';
      data = {
        count: 1,
        favs: 105,
        lastSign: moment().format('YYYY-MM-DD HH:mm:ss'),
      };
    }
    ctx.body = {
      code: code,
      data: data,
      message: message,
    };
  }

  /**
   * 用户修改基本信息
   * @param {*} ctx
   */
  async updateInfo(ctx) {
    // 获取用户请求参数
    const { body } = ctx.request;
    const payload = await getJWTPayload(ctx.header.authorization);
    // 获取用户信息
    const userInfo = await User.findOne({ _id: payload._id });
    let message = '';
    // 判断用户是否修改了邮箱
    if (body.email && body.email !== userInfo.email) {
      // 用户修改了邮箱
      // 查找数据库中是否存在修改的邮箱账号
      const tempUserEmail = await User.findOne({ email: body.email });
      if (tempUserEmail && tempUserEmail.password) {
        ctx.body = {
          code: 9000,
          message: '该邮箱已被他人注册',
        };
        return;
      }
      const key = uuid();
      setValue(
        key,
        jwt.sign({ _id: userInfo._id }, config.JWT_SECRET, {
          expiresIn: '30m',
        }),
        30 * 60
      );
      try {
        await sendEmail({
          type: 'email',
          code: '',
          expire: moment().add(30, 'minutes').format('YYYY-MM-DD, HH:mm:ss'),
          email: userInfo.email,
          userName: userInfo.name,
          data: {
            key,
            newEmail: body.email,
            name: body.name,
          },
        });
      } catch (error) {
        ctx.body = {
          code: 9001,
          data: error,
          message: '信息更新失败！验证邮箱发送不成功，请检查邮箱地址是否有效',
        };
        return;
      }
      message =
        '更新基本资料成功，账号修改需要邮箱验证请点击邮件链接确认修改邮箱账号';
    }
    const fllitArr = ['password', 'email', 'mobile'];
    fllitArr.map((item) => {
      delete body[item];
    });
    const result = await User.updateOne({ _id: payload._id }, body);
    if (result.n === 1 && result.ok === 1) {
      ctx.body = {
        code: message ? 10001 : 10000,
        data: body,
        message: message ? message : '更新基本资料成功',
      };
    }
  }

  /**
   * 修改绑定邮箱账号
   * @param {*} ctx
   */
  async updateEmail(ctx) {
    const body = ctx.request.query;
    if (body.key) {
      const token = await getValue(body.key);
      if (!token) {
        ctx.body = {
          code: 9000,
          message: '重置链接有效时间已过，请重新发起重置请求',
        };
        return;
      }
      const payload = await getJWTPayload('Bearer ' + token);
      const result = await User.updateOne(
        { _id: payload._id },
        {
          email: body.newEmail,
        }
      );
      if (result.n === 1 && result.ok === 1) {
        ctx.body = {
          code: 10000,
          data: {
            email: body.newEmail,
          },
          message: '邮箱修改成功',
        };
      }
    }
  }

  /**
   * 获取用户消息
   * @param {*} ctx
   */
  async getMessages(ctx) {
    const body = ctx.request.query;
    const page = body.page ? parseInt(body.page) : 0;
    const limit = body.limit ? parseInt(body.limit) : 10;
    const payload = await getJWTPayload(ctx.header.authorization);
    let total = 0;
    let data = [];
    let result;
    let commentsId = [];
    if (payload) {
      switch (body.type) {
        case 'comment':
          data = await Comment.getMessages(payload._id, page, limit, true);
          total = await Comment.getTotalMsg(payload._id, true);
          commentsId = data.map((item) => {
            return item._id;
          });
          result = await Comment.setReadMsg(commentsId);
          break;
        case 'collect':
          data = await Collect.getMessages(payload._id, page, limit, true);
          total = await Collect.getTotalMsg(payload._id, true);
          commentsId = data.map((item) => {
            return item._id;
          });
          result = await Collect.setReadMsg(commentsId);
          break;
        case 'hands':
          data = await Hands.getMessages(payload._id, page, limit, true);
          total = await Hands.getTotalMsg(payload._id, true);
          commentsId = data.map((item) => {
            return item._id;
          });
          result = await Hands.setReadMsg(commentsId);
          break;
      }
      // const msgStr = await global.ws.getAllMsg(payload._id, body.type)
      // console.log(msgStr)
      // global.ws.send(payload._id, JSON.stringify({
      //   event: 'message',
      //   message: msgStr
      // }));
      ctx.body = {
        code: 10000,
        data: data,
        total,
        message: '获取消息成功',
      };
    } else {
      ctx.body = {
        code: 9000,
        message: '鉴权失败',
      };
    }
  }

  /**
   * 获取用户列表
   * @param {*} ctx
   */
  async getUsers(ctx) {
    const body = ctx.query;
    const page = body.page ? parseInt(body.page) : 0;
    const limit = body.limit ? parseInt(body.limit) : 10;
    const data = await User.find()
      .skip(page * limit)
      .limit(limit)
      .sort({ created: -1 });
    const total = await User.find().countDocuments();
    ctx.body = {
      code: 10000,
      data,
      total,
      message: '获取列表成功',
    };
  }

  /**
   * 删除用户
   * @param {*} ctx
   */
  async deleteUser(ctx) {
    const body = ctx.query;
    const findUser = await User.findOne({ _id: body.id });
    if (findUser) {
      const result = await User.deleteOne({ _id: body.id });
      if (result.ok === 1) {
        ctx.body = {
          code: 10000,
          message: '删除成功',
        };
      }
    } else {
      ctx.body = {
        code: 9000,
        message: '用户不存在，删除失败',
      };
    }
  }

  /**
   * 管理员更新用户信息
   * @param {*} ctx
   */
  async adminUpdateInfo(ctx) {
    const { body } = ctx.request
    const userInfo = await User.findById(body._id)
    if (userInfo) {
      const result = await User.updateOne({ _id: body._id }, body)
      if (result.ok === 1) {
        ctx.body = {
          code: 10000,
          message: '信息更新成功',
        };
      } else {
        ctx.body = {
          code: 9001,
          message: '更新失败，请重试',
        };
      }
    } else {
      ctx.body = {
        code: 9000,
        message: '更新失败，查找不到对应用户',
      };
    }
  }

  /**
   * 校验用户名是否存在
   * @param {*} ctx
   */
  async checkUserName(ctx) {
    const body = ctx.query;
    const findUser = await User.findOne({ name: body.name });
    if (findUser) {
      ctx.body = {
        code: 10000,
        data: true,
        message: '用户名存在',
      };
    } else {
      ctx.body = {
        code: 10000,
        data: false,
        message: '用户名不存在',
      };
    }
  }

  /**
   * 校验邮箱是否存在
   * @param {*} ctx
   */
  async checkUserEmail(ctx) {
    const body = ctx.query;
    const findUser = await User.findOne({ email: body.email });
    if (findUser) {
      ctx.body = {
        code: 10000,
        data: true,
        message: '邮箱存在',
      };
    } else {
      ctx.body = {
        code: 10000,
        data: false,
        message: '邮箱不存在',
      };
    }
  }
}

export default new UserController();
