import momont from 'dayjs';

import mongoose from '../config/mongoDBConfig';

const Schema = mongoose.Schema;

const Handschema = new Schema({
  uid: { type: String, ref: 'users' },
  cid: { type: String, ref: 'comments' },
  cuid: { type: String, ref: 'users' },
  isRead: { type: String, default: '0' },
  created: { type: Date },
});

Handschema.pre('save', function (next) {
  this.created = momont().format('YYYY-MM-DD HH:mm:ss');
  next();
});

Handschema.statics = {
  getMessages(uid, page, limit, isAll) {
    return this.find({
      cuid: { $eq: uid },
      isRead: isAll ? { $in: ['0', '1'] } : { $eq: '0' },
      uid: { $ne: uid },
    })
      .populate({
        path: 'cid',
        select: 'content _id',
      })
      .populate({
        path: 'cuid',
        select: 'name _id',
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
      cuid: { $eq: uid },
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

const HandsModel = mongoose.model('hands', Handschema);

export default HandsModel;
