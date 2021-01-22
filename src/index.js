import Koa from 'koa'
import JWT from 'koa-jwt'
import cors from 'koa2-cors'
import compose from 'koa-compose'
import bodyParser from 'koa-bodyparser'
import koaBody from 'koa-body'
import statics from 'koa-static'
import path from 'path'

import routes from './routes/router'
import config from './config'
import errorHandle from './common/errorHandle'
import WebSocket from './config/webSocket'
import log4js from './config/log4'

const app = new Koa()
const ws = new WebSocket()

// 初始化websocket服务，并且绑定到全局global上
ws.init()
global.ws = ws

const isDevMode = process.env.NODE_ENV === 'production' ? false : true

/**
 * 定义公共路径，不需要jwt鉴权
 */
const jwt = JWT({ secret: config.JWT_SECRET }).unless({ path: [/^\/public/, /^\/login/] })

/**
 * 使用koa-compose集成中间件
 */
const middleware = compose([
  koaBody({
    multipart: true,
    formidable: {
      keepExtensions: true,
      maxFieldsSize: 5 * 1024 * 1024
    },
    onError: error => {
      console.log(error)
    }
  }),
  statics(path.join(__dirname, '../public')),
  bodyParser(),
  cors(),
  errorHandle,
  jwt,
  config.isDevMode ? log4js.koaLogger(log4js.getLogger('http'), {
    level: 'auto'
  }) : log4js.koaLogger(log4js.getLogger('access'), {
    level: 'auto'
  })
])

app.use(middleware)
app.use(routes())
app.listen(3000, () => {
  console.log(`The server is running at:3000`)
})