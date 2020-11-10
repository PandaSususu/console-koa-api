const DB_URL = 'mongodb://syngle:123123@8.129.24.7:27017/forum'

const JWT_SECRET = 'h71MDhRWVLQ21ZBc'

const BaseUrl = process.env.NODE_ENV === 'production' ? 'http://8.129.24.7:8080' : 'http://192.168.1.15:8080'

export default {
    DB_URL,
    JWT_SECRET,
    BaseUrl
}