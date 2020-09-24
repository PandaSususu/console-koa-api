import { getValue } from '../config/redisConfig' 

const checkCode = async (key, value) => {
  const redisCode = await getValue(key)

  if (redisCode) {
    if (redisCode.toLwerCase() === value.toLwerCase()) {
      return true
    }
    return false
  }
  return false
}

export { checkCode }