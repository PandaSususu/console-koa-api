import momont from 'dayjs'

import mongoose from '../config/mongoDBConfig'

const Schema = mongoose.Schema

const UserSchema = new Schema({
    email: { type: String },
    name: { type: String },
    password: { type: String },
    created: { type: Date },
    pic: { type: String },
    favs: { type: Number },
    gender: { type: String },
    mobile: { type: String },
    status: { type: String },
    regmark: { type: String },
    location: { type: String },
    isVip: { type: String },
    count: { type: Number },
})

UserSchema.pre('save', function(next) {
  this.created = momont().format('YYYY-MM-DD HH:mm:ss')
  this.pic = '//t.cn/RCzsdCq'
  this.favs = 100
  this.gender = ''
  this.mobile = ''
  this.status = '0'
  this.regmark = ''
  this.location = ''
  this.isVip = '0'
  this.count = 0
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