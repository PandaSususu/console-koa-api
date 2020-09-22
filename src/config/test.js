import { setValue, getValue, getHValue } from './redisConfig'

setValue('qq', '1271250334')

setValue('syngleInfo', { name: 'syngle', age: 18, email: '1271250334@qq.com' })

getValue('qq').then((res) => {
  console.log('getValue:' + res)
})

getHValue('syngleInfo').then((res) => {
  console.log('getHValue:' + JSON.stringify(res))
})