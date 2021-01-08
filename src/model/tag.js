import moment from 'dayjs'

import mongoose from '../config/mongoDBConfig'

const Schema = mongoose.Schema

const TagSchema = new Schema({
  name: { type: String },
  class: { type: String },
  created: { type: Date }
})

TagSchema.pre('save', function() {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

const TagModel = mongoose.model('tags', TagSchema)

export default TagModel