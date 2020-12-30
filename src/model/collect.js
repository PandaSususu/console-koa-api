import momont from 'dayjs';

import mogoose from '../config/mongoDBConfig';

const Schema = mogoose.Schema;

const Collectschema = new Schema({
  uid: { type: String, ref: 'users' },
  tid: { type: String, ref: 'posts' },
  tuid: { type: String, ref: 'users' },
  isRead: { type: String, default: '0' },
  created: { type: Date },
});

Collectschema.pre('save', function (next) {
  this.created = momont().format('YYYY-MM-DD HH:mm:ss');
  next();
});

Collectschema.statics = {
  getMessages(uid, page, limit, isAll) {
    return this.find({
      tuid: { $eq: uid },
      isRead: isAll ? { $in: ['0', '1'] } : { $eq: '0' },
      uid: { $ne: uid },
    })
      .populate({
        path: 'tuid',
        select: 'name _id',
      })
      .populate({
        path: 'tid',
        select: 'title _id',
      })
      .populate({
        path: 'uid',
        select: 'name _id',
      })
      .skip(page * limit)
      .limit(limit)
      .sort({ created: -1 });
  },
  getTotalMsg(uid, isAll) {
    return this.find({
      tuid: { $eq: uid },
      isRead: isAll ? { $in: ['0', '1'] } : { $eq: '0' },
      uid: { $ne: uid },
    }).countDocuments();
  },
  setReadMsg(arrId) {
    return this.updateMany(
      {
        _id: { $in: arrId },
      },
      {
        $set: { isRead: '1' },
      }
    );
  },
};

const CollectModel = mogoose.model('collections', Collectschema);

export default CollectModel;
