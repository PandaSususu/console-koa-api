import moment from 'dayjs';
const weekday = require('dayjs/plugin/weekday');
moment.extend(weekday);

import User from '../model/user';
import Post from '../model/post';
import Sign from '../model/signRecord';
import Comment from '../model/comment';

class AdminController {
  /**
   * 获取首页统计数据
   * @param {*} ctx
   */
  async getHomeConut(ctx) {
    // 本周
    const day = moment(moment().format('YYYY-MM-DD 00:00:00'));
    const weekStart = moment(day).weekday(1);
    const weekEnd = moment(day).weekday(8);

    // 总注册用户
    const totalUser = await User.find().countDocuments();
    // 本周新增用户
    const weekNewUser = await User.find({
      created: { $gte: weekStart, $lt: weekEnd },
    }).countDocuments();
    // 总发帖数
    const totalPost = await Post.find().countDocuments();
    // 本周发帖数
    const weekNewPost = await Post.find({
      created: { $gte: weekStart, $lt: weekEnd },
    }).countDocuments();
    // 本周评论数
    const weekNewComment = await Comment.find({
      created: { $gte: weekStart, $lt: weekEnd },
    }).countDocuments();
    // 本周签到
    const weekNewSign = await Sign.find({
      created: { $gte: weekStart, $lt: weekEnd },
    }).countDocuments();

    // 帖子类型分组统计
    const postClassify = await Post.aggregate([
      { $group: { _id: '$catalog', count: { $sum: 1 } } },
    ]);
    let postClassifyObj = {};
    postClassify.forEach((item) => {
      Reflect.set(postClassifyObj, item['_id'], item.count);
    });

    // 近6月发帖量统计
    const thisDay = moment().date(1).hour(0).minute(0).second(0);
    const startMonth = moment(thisDay).subtract(5, 'M').format();
    const endMonth = moment(thisDay).add(1, 'M').format();
    const first6MonthsData = await Post.aggregate([
      {
        $match: {
          created: { $gte: new Date(startMonth), $lt: new Date(endMonth) },
        },
      },
      {
        $project: {
          month: { $substr: [{ $add: ['$created', 28800000] }, 0, 7] },
        },
      },
      { $group: { _id: '$month', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    let first6MonthsObj = {};
    first6MonthsData.forEach((item) => {
      first6MonthsObj[item._id] = item.count;
    });

    // 7天数据统计
    const startDay = moment(day).subtract(6, 'day').format();
    const endDay = moment(day).add(1, 'day').format();
    const getWeekData = (model) => {
      return model.aggregate([
        {
          $match: {
            created: { $gte: new Date(startDay), $lt: new Date(endDay) },
          },
        },
        {
          $project: {
            day: { $substr: [{ $add: ['$created', 28800000] }, 0, 10] }, //时区数据校准，8小时换算成毫秒数为8*60*60*1000=288000后分割成YYYY-MM-DD日期格式便于分组
          },
        },
        { $group: { _id: '$day', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);
    };
    let countData = {};
    // 新增用户统计
    countData['newUser'] = await getWeekData(User);
    // 签到统计
    countData['newSign'] = await getWeekData(Sign);
    // 发帖总数
    countData['newPost'] = await getWeekData(Post);
    // 回复总数
    countData['newComment'] = await getWeekData(Comment);

    let weenkCount = {};
    for (let key in countData) {
      let obj = {};
      countData[key].forEach((item) => {
        obj[item._id] = item.count;
      });
      const arr = [];
      for (let i = 0; i <= 6; i++) {
        const key = moment()
          .subtract(6 - i, 'day')
          .format('YYYY-MM-DD');
        arr.push(obj[key] || 0);
      }
      weenkCount[key] = arr;
    }

    const inforCardData = [
      totalUser,
      weekNewUser,
      totalPost,
      weekNewPost,
      weekNewComment,
      weekNewSign,
    ];

    let data = {};
    Reflect.set(data, 'inforCardData', inforCardData);
    Reflect.set(data, 'pieData', postClassifyObj);
    Reflect.set(data, 'barData', first6MonthsObj);
    Reflect.set(data, 'countData', weenkCount);
    ctx.body = {
      code: 10000,
      data,
      message: '统计数据获取成功',
    };
  }
}

export default new AdminController();
