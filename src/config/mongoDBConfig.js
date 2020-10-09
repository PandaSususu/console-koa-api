import mongoose from 'mongoose'

import config from './index'

// 创建连接
mongoose.connect(config.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })

// 连接成功
mongoose.connection.on('connection', () => {
    console.log('已连接')
})

// 连接失败
mongoose.connection.on('error', (err) => {
    mongoose.connect(config.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('连接失败' + err)
})

// 连接中断
mongoose.connection.on('disconnected', () => {
    console.log('已断开连接')
})

export default mongoose