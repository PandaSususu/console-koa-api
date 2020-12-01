import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import User from '../model/user'

import { getValue } from '../config/redisConfig' 
import config from '../config'

// 获取payload
const getJWTPayload = async (token) => {
  if (/^Bearer\s+/.test(token)) {
    return jwt.verify(token.split(' ')[1], config.JWT_SECRET)
  }
  return undefined
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

// 判断用户是否正常
const getUserStatus = async (uid) => {
  const userInfo = await User.findByUid(uid)
  if (userInfo) {
    if (userInfo.status === '1') {
      return { code: 9001, message: '该用户已被禁言' }
    } else if (userInfo.status === '2') {
      return { code: 9002, message: '该用户已被冻结' }
    } else {
      return { code: 10000, message: '用户正常' }
    }
  } else {
    return { code: 9003, message: '找不到用户信息' }
  }
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

// 修改对象名称
const rename = (obj, oldKey, newKey) => {
  if (Object.keys(obj).indexOf('uid') !== -1) {
    obj[newKey] = obj[oldKey]
    delete obj[oldKey]
  }
  return obj
}

export { checkCode, getJWTPayload, dirExists, rename, getUserStatus }