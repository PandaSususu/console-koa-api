import { getValue } from '../config/redisConfig' 

const checkCode = async (key, value) => {
  const redisCode = await getValue(key)

  if (redisCode) {
    if (redisCode.toLowerCase() === value.toLowerCase()) {
      return true
    }
  }
  return false
}

export { checkCode }