import momont from 'dayjs';

import mongoose from '../config/mongoDBConfig';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String },
  name: { type: String },
  password: { type: String },
  created: { type: Date },
  pic: { type: String, default: '//t.cn/RCzsdCq' },
  favs: { type: Number, default: 100 },
  gender: { type: String, default: '' },
  mobile: { type: String, default: '' },
  status: { type: String, default: '0' },
  regmark: { type: String, default: '' },
  location: { type: Array, default: () => [] },
  isVip: { type: String, default: '0' },
  count: { type: Number, default: 0 },
  access: { type: Array, default: ['user'] },
});

UserSchema.pre('save', function (next) {
  this.created = momont();
  next();
});

UserSchema.statics = {
  findByUid(uid) {
    return this.findOne(
      { _id: uid },
      {
        password: 0,
      }
    );
  },
  findBasicInfo(uid) {
    return this.findOne(
      { _id: uid },
      {
        name: 1,
        isVip: 1,
        pic: 1,
      }
    );
  },
  getList(options, page, limit) {
    for (let key in options) {
      if(!options[key]) {
        break
      }
      if (key === 'access') {
        options = { access: { $in: options[key] } };
      } else if (key === 'created') {
        const start = options[key][0];
        const end = options[key][1];
        options = { created: { $gte: momont(start), $lt: new momont(end) } };
      } else {
        options = options;
      }
    }
    return this.find(options)
      .skip(page * limit)
      .limit(limit)
      .sort({ created: -1 });
  },
  getListCount(options) {
    for (let key in options) {
      if(!options[key]) {
        break
      }
      if (key === 'access') {
        options = { access: { $in: options[key] } };
      } else if (key === 'created') {
        const start = options[key][0];
        const end = options[key][1];
        options = { created: { $gte: momont(start), $lt: new momont(end) } };
      } else {
        options = options;
      }
    }
    return this.find(options).countDocuments()
  }
};

const UseModel = mongoose.model('users', UserSchema);

export default UseModel;
