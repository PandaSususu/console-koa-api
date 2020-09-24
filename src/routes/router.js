import combineRouters from 'koa-combine-routers'

import publicRotes from './publicRouter'
import loginRotes from './loginRouter'

export default combineRouters(publicRotes, loginRotes)