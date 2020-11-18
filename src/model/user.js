import momont from 'dayjs'

import mongoose from '../config/mongoDBConfig'

const Schema = mongoose.Schema

const UserSchema = new Schema({
    email: { type: String },
    name: { type: String },
    password: { type: String },
    created: { type: Date },
    pic: { type: String , default: '//t.cn/RCzsdCq' },
    favs: { type: Number, default: 100 },
    gender: { type: String, default: '' },
    mobile: { type: String, default: '' },
    status: { type: String, default: '0' },
    regmark: { type: String, default: '' },
    location: { type: String, default: '' },
    isVip: { type: String, default: '0' },
    count: { type: Number, default: 0 },
})

UserSchema.pre('save', function(next) {
  this.created = momont().format('YYYY-MM-DD HH:mm:ss')
  next()
})

UserSchema.statics = {
  findByUid(uid) {
    return this.findOne({ _id: uid }, {
      password: 0,
      name: 0
    })
  }
}

const UseModel = mongoose.model('users', UserSchema)

export default UseModel