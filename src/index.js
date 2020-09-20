import Koa from 'koa'
import cors from 'koa2-cors'
import routes from './routes/router'
import bodyParser from 'koa-bodyparser'

const app = new Koa()

app.use(cors())
app.use(bodyParser())
app.use(routes())
app.listen(3000)