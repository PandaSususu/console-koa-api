import moment from 'dayjs'

import Post from '../model/post'
import Link from '../model/link'
import Ads from '../model/ads'

class IndexController {
  /**
   * 获取温馨提示
   * @param {*}
   */
  async getTips(ctx) {
    const data = await Link.find({ type: 'tips' })
    ctx.body = {
      code: 10000,
      data: data,
      message: '获取温馨通道成功',
    };
  }

  /**
   * 获取本周热议
   * @param {*}
   */
  async getTopWeek(ctx) {
    const week = moment().day()
    const startWeenk = moment(moment().format('YYYY-MM-DD')).subtract(week ? week - 1 : 0, 'day')
    const endWeenk = moment(moment().format('YYYY-MM-DD')).add(week ? 8 - week : 1, 'day')
    const data = await Post.find({ created : { $gte: startWeenk, $lt: endWeenk } }).sort({ answer: -1 })
    ctx.body = {
      code: 10000,
      data: data,
      message: '获取本周热议成功',
    };
  }

  /**
   * 获取友情链接
   * @param {*}
   */
  async getLinks(ctx) {
    const data = await Link.find({ type: 'link' })
    ctx.body = {
      code: 10000,
      data: data,
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

  /**
   * 添加链接
   * @param {*}
   */
  async addLink(ctx) {
    const { body } = ctx.request
    const newLink = new Link(body)
    const result = await newLink.save()
    ctx.body = {
      code: 10000,
      message: '添加成功',
    };
  }

  /**
   * 添加广告
   * @param {*}
   */
  async addAds(ctx) {
    const { body } = ctx.request
    const newAds = new Ads(body)
    const result = await newAds.save()
    ctx.body = {
      code: 10000,
      message: '添加成功',
    };
  }
}

export default new IndexController();
