import moment from 'dayjs'
import mongoose from '../config/mongoDBConfig'

import moggose from '../config/mongoDBConfig'

const Schema = moggose.Schema

const AdsSchema = new Schema({
  link: { type: String },
  title: { type: String },
  created: { type: Date },
  bgUrl: { type: String },
  bgColor: { type: String, default: '#009688' },
  color: { type: String, default: '#fff' },
  openType: { type: String, default: '_blanc' }
})

AdsSchema.pre('save', function(next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
})

const AdsModel = mongoose.model('ads', AdsSchema)

export default AdsSchema