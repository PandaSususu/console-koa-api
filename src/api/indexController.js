class IndexController {
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

export default new IndexController()
