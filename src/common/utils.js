import jwt from 'jsonwebtoken'

import { getValue } from '../config/redisConfig' 
import config from '../config'

// 获取payload
const getJWTPayload = async (token) => {
  return jwt.verify(token.split(' ')[1], config.JWT_SECRET)
}

// 校验验证码
const checkCode = async (key, value) => {
  const redisCode = await getValue(key)

  if (redisCode) {
    if (redisCode.toLowerCase() === value.toLowerCase()) {
      return true
    }
  }
  return false
}

export { checkCode, getJWTPayload }