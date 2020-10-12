import combineRouters from 'koa-combine-routers'

import publicRotes from './publicRouter'
import loginRotes from './loginRouter'
import userRoutes from './userRouter'

export default combineRouters(publicRotes, loginRotes, userRoutes)