import momont from 'dayjs'

import mogoose from '../config/mongoDBConfig'

const Schema = mogoose.Schema

const Collectschema = new Schema({
  uid: { type: String, ref: 'users' },
  tid: { type: String, ref: 'posts' },
  created: { type: Date }
})

Collectschema.pre('save', function(next) {
  this.created = momont().format('YYYY-MM-DD HH:mm:ss')
  next()
})

const CollectModel = mogoose.model('collections', Collectschema)

export default CollectModel
