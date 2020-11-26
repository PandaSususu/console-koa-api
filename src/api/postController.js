import Post from '../model/post';
import User from '../model/user';
import Comment from '../model/comment';
import { rename } from '../common/utils';
import { getJWTPayload, checkCode } from '../common/utils'

class PostController {
  /**
   * 获取置顶帖子
   * @param {*}
   */
  async getTopList(ctx) {
    const data = await Post.find({ isTop: '1' }).populate({
      path: 'uid',
      select: 'name isVip pic _id',
    });
    const list = data.map(item => {
      return rename(item.toJSON(), 'uid', 'user')
    })
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
    const body = ctx.query
    const page = body.page ? parseInt(body.page) : 0
    const limit = body.limit ? parseInt(body.limit) : 20
    const sort = body.sort ? body.sort : 'created'
    let options = {}
    if (body.catalog) {
      options.catalog = body.catalog
    }
    if (body.isTop) {
      options.isTop = body.isTop
    }
    if (body.isEnd) {
      options.isEnd = body.isEnd
    }
    if (body.tag) {
      options.tags = { $elemMatch: { name: body.tag } }
    }
    const data = await Post.getList(options, page, limit, sort)
    const list = data.map(item => {
      return rename(item.toJSON(), 'uid', 'user')
    })
    ctx.body = {
      code: 10000,
      data: list,
      message: '获取帖子列表成功'
    };
  }

  /**
   * 获取帖子详情
   * @param {*}
   */
  async getPostDetail(ctx) {
    const body = ctx.query
    const data = await Post.getPostTid(body.tid)
    const details = rename(data.toJSON(), 'uid', 'user')
    ctx.body = {
      code: 10000,
      data: details,
      message: '获取帖子详情成功'
    };
  }

    /**
   * 获取帖子评论列表
   * @param {*}
   */
  async getComments(ctx) {
    const body = ctx.query
    const page = body.page ? parseInt(body.page) : 0
    const limit = body.limit ? parseInt(body.limit) : 10
    const data = await Comment.getCommentsTid(body.tid, page, limit)
    const total = await Comment.queryCount(body.tid)
    const list = data.map(item => {
      return rename(item.toJSON(), 'uid', 'user')
    })
    ctx.body = {
      code: 10000,
      data: {
        list,
        total
      },
      message: '获取评论列表成功'
    };
  }

  /**
   * 获取用户帖子列表
   * @param {*} ctx
   */
  async getUserList(ctx) {
    const payload = await getJWTPayload(ctx.header.authorization)
    const data = await Post.find({ uid: payload._id })
    ctx.body = {
      code: 10000,
      data: data,
      message: '获取列表成功'
    }
  }

  /**
   * 用户发表评论信息
   * @param {*} ctx
   */
  async postComment(ctx) {
    const { body } = ctx.request
    const result = await checkCode(body.sid, body.code);
    if (result) {
      const payload = await getJWTPayload(ctx.header.authorization)
      const userInfo = await User.findByUid(payload._id)
      if (userInfo.status === '1') {
        ctx.body = {
          code: 9001,
          data: {},
          message: '该用户已被禁言，暂时无法发表评论',
        };
        return
      } else if (userInfo.status === '2') {
        ctx.body = {
          code: 9002,
          data: {},
          message: '该用户已被冻结，暂时无法发表评论',
        };
        return
      } else {
        const newComment = new Comment({
          tid: body.tid,
          uid: userInfo._id,
          content: body.content
        })
        const saveResult  = await newComment.save()
        await Post.updateOne({ _id: body.tid }, { $inc: { answer: 1 } })
        ctx.body = {
          code: 10000,
          data: saveResult,
          message: '评论发表成功',
        };
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

export default new PostController();