import moment from 'dayjs'

import mogoose from '../config/mongoDBConfig'

const Schema = mogoose.Schema

const LinkSchema = new Schema({
  link: { type: String },
  title: { type: String },
  created: { type: Date },
  openType: { type: String, default: '_blank' },
  type: { type: String, default: 'link' },
  sort: { type: Number, default: 100 }
})

LinkSchema.pre('save', function(next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

const LinkModel = mogoose.model('links', LinkSchema)

export default LinkModel