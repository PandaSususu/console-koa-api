import combineRouters from 'koa-combine-routers'

import publicCodeUrl from './publicCodeUrl'
import sendEmailUrl from './sendEmailUrl'

export default combineRouters(publicCodeUrl, sendEmailUrl)