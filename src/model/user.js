import momont from 'dayjs'

import mongoose from '../config/mongoDBConfig'

const Schema = mongoose.Schema

const UserSchema = new Schema({
    email: { type: String },
    name: { type: String },
    password: { type: String },
    created: { type: Date },
    pic: { type: String }
})

UserSchema.pre('sava', function() {
  this.created = momont().format('YYYY-MM-DD HH:mm:ss')
  next()
})

const UseModel = mongoose.model('users', UserSchema)

export default UseModel