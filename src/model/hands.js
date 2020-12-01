import momont from 'dayjs'

import mongoose from '../config/mongoDBConfig'

const Schema = mongoose.Schema

const Handschema = new Schema({
    uid: { type: String, ref: 'users' },
    cid: { type: String, ref: 'comments' },
    created: { type: Date }
})

Handschema.pre('save', function(next) {
  this.created = momont().format('YYYY-MM-DD HH:mm:ss')
  next()
})

Handschema.statics = {}

const HandsModel = mongoose.model('hands', Handschema)

export default HandsModel