import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

import { getValue } from '../config/redisConfig' 
import config from '../config'

// 获取payload
const getJWTPayload = async (token) => {
  console.log(token)
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

// 判断文件夹是否存在
const getStat = (path) => {
  return new Promise((resolve) => {
    fs.stat(path, (error, stat) => error? resolve(false) : resolve(stat))
  })
}

// 创建文件夹
const mkdir = (dir) => {
  return new Promise((resolve) => {
    fs.mkdir(dir, error => error? resolve(false) : resolve(true))
  })
}

// 循环遍历路径，判断目录是否存在，不存在则创建
const dirExists = async (dir) => {
  const isExists = await getStat(dir)
  if (isExists && isExists.isDirectory) {
    // 路径存在，并且是目录
    return true
  } else if (isExists) {
    // 路径存在，但不是目录
    return false
  }
  // 路径不存在
  const tempDir = path.parse(dir).dir
  const status = await dirExists(tempDir)
  if (status) {
    const result = await mkdir(dir)
    return result
  }
  return false
}

export { checkCode, getJWTPayload, dirExists }