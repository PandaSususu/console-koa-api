import momont from 'dayjs'

import mongoose from '../config/mongoDBConfig'

const Schema = mongoose.Schema

const PostSchema = new Schema({
    uid: { type: String },
    title: { type: String },
    content: { type: String },
    created: { type: Date },
    catalog: { type: String },
    fav: { type: String },
    isEnd: { type: String, default: '0' },
    reads: { type: Number, default: 0 },
    answer: { type: Number, default: 0 },
    status: { type: String, default: '0' },
    isTop: { type: String, default: '0' },
    sort: { type: Number, default: 100 },
    tags: { type: Array, default: [] }
})

PostSchema.pre('save', function(next) {
  this.created = momont().format('YYYY-MM-DD HH:mm:ss')
  next()
})

const PostModel = mongoose.model('posts', PostSchema)

export default PostModel