import Post from '../model/post';
import User from '../model/user';
import Collect from '../model/collect';
import { rename } from '../common/utils';
import { checkCode, getJWTPayload } from '../common/utils';

class PostController {
  /**
   * 发表新帖
   * @param {*}
   */
  async addPost(ctx) {
    const { body } = ctx.request;
    const result = await checkCode(body.sid, body.code);
    if (result) {
      const payload = await getJWTPayload(ctx.header.authorization);
      const userInfo = await User.findByUid(payload._id);
      // 判断用户积分是否大于发帖所需积分
      if (userInfo.favs >= body.fav) {
        const result = await User.updateOne(
          {
            _id: payload._id,
          },
          {
            $inc: { favs: -body.fav },
          }
        );
        if (result.ok === 1) {
          body.uid = payload._id;
          const newPost = new Post(body);
          const post = await newPost.save();
          ctx.body = {
            code: 10000,
            data: post._id,
            message: '发帖成功',
          };
        } else {
          ctx.body = {
            code: 9002,
            message: '发表失败，请重试',
          };
        }
      } else {
        ctx.body = {
          code: 9001,
          data: {
            favs: userInfo.favs,
          },
          message: '积分不足',
        };
        return;
      }
    } else {
      ctx.body = {
        code: 9000,
        message: '验证码不正确或者已失效',
      };
    }
  }

   /**
   * 发表新帖
   * @param {*}
   */
  async mobileAddPost(ctx) {
    const { body } = ctx.request;
    const payload = await getJWTPayload(ctx.header.authorization);
      const userInfo = await User.findByUid(payload._id);
      // 判断用户积分是否大于发帖所需积分
      if (userInfo.favs >= body.fav) {
        const result = await User.updateOne(
          {
            _id: payload._id,
          },
          {
            $inc: { favs: -body.fav },
          }
        );
        if (result.ok === 1) {
          body.uid = payload._id;
          const newPost = new Post(body);
          const post = await newPost.save();
          ctx.body = {
            code: 10000,
            data: post._id,
            message: '发帖成功',
          };
        } else {
          ctx.body = {
            code: 9002,
            message: '发表失败，请重试',
          };
        }
      } else {
        ctx.body = {
          code: 9001,
          data: {
            favs: userInfo.favs,
          },
          message: '积分不足',
        };
      }
  }

  /**
   * 更新帖子
   * @param {*}
   */
  async updatePost(ctx) {
    const { body } = ctx.request;
    const result = await checkCode(body.sid, body.code);
    const payload = await getJWTPayload(ctx.header.authorization);
    const post = await Post.findOne({ _id: body.tid });
    if (result) {
      if (payload._id === post.uid) {
        const updateResult = await Post.updateOne(
          { _id: body.tid },
          {
            $set: {
              title: body.title,
              content: body.content,
            },
          }
        );
        if (updateResult.ok === 1) {
          ctx.body = {
            code: 10000,
            message: '更新帖子成功',
          };
        } else {
          ctx.body = {
            code: 9002,
            message: '更新帖子失败，请重试',
          };
        }
      } else {
        ctx.body = {
          code: 9001,
          message: '无权操作',
        };
      }
    } else {
      ctx.body = {
        code: 9000,
        message: '验证码不正确或者已失效',
      };
    }
  }

  /**
   * 管理员更新帖子
   * @param {*}
   */
  async adminUpdatePost(ctx) {
    const { body } = ctx.request;
    const updateResult = await Post.updateOne({ _id: body._id }, body);
    if (updateResult.ok === 1) {
      ctx.body = {
        code: 10000,
        message: '更新帖子成功',
      };
    } else {
      ctx.body = {
        code: 9000,
        message: '更新帖子失败，请重试',
      };
    }
  }

  /**
   * 获取置顶帖子
   * @param {*}
   */
  async getTopList(ctx) {
    const data = await Post.find({ isTop: '1' }).populate({
      path: 'uid',
      select: 'name isVip pic _id',
    });
    const list = data.map((item) => {
      return rename(item.toJSON(), 'uid', 'user');
    });
    ctx.body = {
      code: 10000,
      data: list,
      message: '获取置顶列表成功',
    };
  }

  /**
   * 获取帖子列表
   * @param {*}
   */
  async getList(ctx) {
    const body = ctx.query;
    const page = body.page ? parseInt(body.page) : 0;
    const limit = body.limit ? parseInt(body.limit) : 20;
    const sort = body.sort ? body.sort : 'created';
    let options = {};
    if (body.catalog) {
      options.catalog = body.catalog;
    }
    if (body.isTop) {
      options.isTop = body.isTop;
    }
    if (body.isEnd) {
      options.isEnd = body.isEnd;
    }
    if (body.tag) {
      options.tags = { $elemMatch: { name: body.tag } };
    }
    if (body.keyword) {
      options.title = { $regex: new RegExp(body.keyword) };
    }
    const data = await Post.getList(options, page, limit, sort);
    const total = await Post.getListCount(options);
    const list = data.map((item) => {
      return rename(item.toJSON(), 'uid', 'user');
    });
    ctx.body = {
      code: 10000,
      data: list,
      total,
      message: '获取帖子列表成功',
    };
  }

  /**
   * 获取帖子详情
   * @param {*}
   */
  async getPostDetail(ctx) {
    const body = ctx.query;
    const result = await Post.updateOne(
      { _id: body.tid },
      { $inc: { reads: 1 } }
    );
    if (result.ok === 1) {
      const data = await Post.getPostTid(body.tid);
      const details = rename(data.toJSON(), 'uid', 'user');
      const payload = await getJWTPayload(ctx.header.authorization);
      if (payload) {
        const collect = await Collect.findOne({
          uid: payload._id,
          tid: body.tid,
        });
        if (collect) {
          details.isCollect = '1';
        } else {
          details.isCollect = '0';
        }
      }
      ctx.body = {
        code: 10000,
        data: details,
        message: '获取帖子详情成功',
      };
    } else {
      ctx.body = {
        code: 9000,
        message: '获取帖子详情异常，请重试',
      };
    }
  }

  /**
   * 获取用户帖子列表
   * @param {*} ctx
   */
  async getUserList(ctx) {
    const payload = await getJWTPayload(ctx.header.authorization);
    const data = await Post.find({ uid: payload._id }).sort({ created: -1 });
    ctx.body = {
      code: 10000,
      data: data,
      message: '获取列表成功',
    };
  }

  /**
   * 获取用户收藏帖子列表
   * @param {*} ctx
   */
  async getUserCollectList(ctx) {
    const payload = await getJWTPayload(ctx.header.authorization);
    const data = await Collect.find({ uid: payload._id }).populate({
      path: 'tid',
      select: 'title status isEnd created reads answer',
    });
    const list = data.map((item) => {
      return rename(item.toJSON(), 'tid', 'post');
    });

    ctx.body = {
      code: 10000,
      data: list,
      message: '获取列表成功',
    };
  }

  /**
   * 收藏帖子
   * @param {*} ctx
   */
  async collectPost(ctx) {
    const body = ctx.query;
    const payload = await getJWTPayload(ctx.header.authorization);
    const collect = await Collect.findOne({ uid: payload._id, tid: body.tid });
    const postInfo = await Post.findOne({ _id: body.tid });
    if (!collect) {
      const newCollect = new Collect({
        uid: payload._id,
        tid: body.tid,
        tuid: postInfo.uid,
      });
      const result = await newCollect.save();
      const total = await global.ws.getAllMsg(postInfo.uid, 'collect');
      // 推送消息给客户端
      if (payload._id !== postInfo.uid) {
        global.ws.send(
          postInfo.uid,
          JSON.stringify({
            event: 'message',
            message: total,
          })
        );
      }
      ctx.body = {
        code: 10000,
        message: '收藏成功',
      };
    } else {
      const delResult = await Collect.deleteOne({
        uid: payload._id,
        tid: body.tid,
      });
      if (delResult.ok === 1) {
        ctx.body = {
          code: 10000,
          message: '取消收藏成功',
        };
      } else {
        ctx.body = {
          code: 9000,
          message: '取消收藏失败，请重试',
        };
      }
    }
  }

  /**
   * 删除帖子
   * @param {*}
   */
  async deletePost(ctx) {
    const body = ctx.query;
    const result = await Post.deleteOne({ _id: body.id });
    if (result.ok === 1) {
      ctx.body = {
        code: 10000,
        message: '删除成功',
      };
    } else {
      ctx.body = {
        code: 9000,
        message: '删除失败，请重试',
      };
    }
  }

  /**
   * 管理员获取帖子列表
   * @param {*}
   */
  async adminGetList(ctx) {
    const { body } = ctx.request;
    const page = body.page ? parseInt(body.page) : 0;
    const limit = body.limit ? parseInt(body.limit) : 10;
    const options = body.options ? body.options : {};
    const data = await Post.adiminGetList(options, page, limit);
    const list = data.map((item) => {
      return rename(item.toJSON(), 'uid', 'user');
    });
    const total = await Post.adiminGetListCount(options);
    ctx.body = {
      code: 10000,
      data: list,
      total,
      message: '获取列表成功',
    };
  }
}

export default new PostController();
