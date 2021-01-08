import Tag from '../model/tag';

class TagController {
  /**
   * 添加标签
   * @param {*}
   */
  async addTag(ctx) {
    const { body } = ctx.request;
    const newTag = new Tag(body);
    await newTag.save();
    ctx.body = {
      code: 10000,
      message: '添加成功',
    };
  }

  /**
   * 获取标签
   * @param {*}
   */
  async getTags(ctx) {
    const body = ctx.query;
    const page = body.page ? parseInt(body.page) : 0
    const limit = body.limit ? parseInt(body.limit) : 10
    const data = await Tag.find()
      .skip(page * limit)
      .limit(limit)
    const total = await Tag.find().countDocuments()
    ctx.body = {
      code: 10000,
      data,
      total,
      message: '获取成功',
    };
  }

   /**
   * 删除标签
   * @param {*}
   */
  async deteleTag(ctx) {
    const body = ctx.query;
    const result = await Tag.deleteOne({ _id: body.id })
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
   * 删除标签
   * @param {*}
   */
  async updateTag(ctx) {
    const { body } = ctx.request
    const result = await Tag.updateOne({ _id: body._id }, body)
    if (result.ok === 1) {
      ctx.body = {
        code: 10000,
        message: '更新成功',
      };
    } else {
      ctx.body = {
        code: 9000,
        message: '更新失败，请重试',
      };
    }
  }
}

export default new TagController();
