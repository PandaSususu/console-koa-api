import combineRouters from 'koa-combine-routers'

import publicRotes from './publicRouter'
import loginRotes from './loginRouter'
import userRoutes from './userRouter'
import contentRoutes from './contentRouter'

// 加载当前目录下的modules文件夹下所有的js文件
// const moduleFiles = require.context('./modules', true, /\.js$/)
// console.log(moduleFiles)

// const moudles = modules.keys().reduce((items, path) => {
//   const value = moduleFiles(path)
//   items.push(value.default)
//   return items
// }, [])

export default combineRouters(publicRotes, loginRotes, userRoutes, contentRoutes)