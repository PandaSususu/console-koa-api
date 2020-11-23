import Post from '../model/post';
import { rename } from '../common/utils';

class IndexController {
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
   * 获取温馨提示
   * @param {*}
   */
  getTips(ctx) {
    ctx.body = {
      code: 200,
      data: {},
      message: '获取温馨通道成功',
    };
  }

  /**
   * 获取本周热议
   * @param {*}
   */
  getTopWeek(ctx) {
    ctx.body = {
      code: 200,
      data: {},
      message: '获取本周热议成功',
    };
  }

  /**
   * 获取友情链接
   * @param {*}
   */
  getLinks(ctx) {
    ctx.body = {
      code: 200,
      data: {},
      message: '获取友情链接成功',
    };
  }

  /**
   * 获取推荐课程
   * @param {*}
   */
  getAds(ctx) {
    ctx.body = {
      code: 200,
      data: {},
      message: '获取推荐课程成功',
    };
  }
}

export default new IndexController();
