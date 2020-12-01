import momont from 'dayjs'

import mongoose from '../config/mongoDBConfig'

const Schema = mongoose.Schema

const Commentchema = new Schema({
    tid: { type: String, ref: 'posts' },
    uid: { type: String, ref: 'users' },
    content: { type: String },
    created: { type: Date },
    hands: { type: Number, default: 0 },
    status: { type: String, default: '1' },
    isRead: { type: String, default: '0' },
    isBest: { type: String, default: '0' }
})

Commentchema.pre('save', function(next) {
  this.created = momont().format('YYYY-MM-DD HH:mm:ss')
  next()
})

Commentchema.statics = {
  getCommentsTid(tid, page, limit) {
    return this.find({ tid }).populate({
      path: 'uid',
      select: 'name pic isVip _id',
      // match: { status: { $eq: '0' } }
    }).skip(page * limit).limit(limit).sort({ created: -1 })
  },
  queryCount(tid) {
    return this.find({ tid }).countDocuments()
  }
}

const CommentModel = mongoose.model('comments', Commentchema)

export default CommentModel