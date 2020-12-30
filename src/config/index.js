import path from 'path'

const DB_URL = 'mongodb://syngle:123123@47.115.56.50:27017/forum'

const JWT_SECRET = 'h71MDhRWVLQ21ZBc'

const BaseUrl = process.env.NODE_ENV === 'production' ? 'http://47.115.56.50:1024' : 'http://localhost:8080'

const uploadPath = process.env.NODE_ENV === 'production' ? '/app/public' : path.join(path.resolve(__dirname), '../../public')

export default {
    DB_URL,
    JWT_SECRET,
    BaseUrl,
    uploadPath
}